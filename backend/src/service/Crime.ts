import {
  EntityManager,
  Transaction,
  TransactionManager,
  getRepository,
  TransactionRepository,
  Repository,
  In,
} from "typeorm";
import { Player } from "../entity/Player";
import { Jail } from "../entity/Jail";
import { GameService } from "./Game";
import { MetricService } from "./Metric";
import {
  random,
  randomValue,
  gaussianRandom,
  randomPlate,
} from "../utils/random";
import { beforeNow, diffFromNow, formatDate, futureDate } from "../utils/dates";
import { ordinal } from "../utils/numbers";
import { JailService } from "./Jail";
import { Crime, CRIMES } from "../constants/crimes";
import { Item } from "../entity/Item";
import { InventoryItem } from "../entity/InventoryItem";
import { LuckIdentifier, PerkService } from "./Perk";
import { EVENT, LogService } from "./Log";

interface Constructor {
  Game: GameService;
  Metric: MetricService;
  Jail: JailService;
  Perk: PerkService;
  Log: LogService;
}

const TABS = [
  {
    name: "Street",
    level: 1,
    difficulty: "easy",
  },
  {
    name: "Heists",
    level: 2,
    difficulty: "medium",
  },
  {
    name: "Corporate",
    level: 3,
    difficulty: "hard",
  },
];

const LEVELS = [
  {
    level: 1,
    progressMin: 0,
    progressTarget: 1000,
  },
  {
    level: 2,
    progressMin: 1000,
    progressTarget: 4000,
  },
  {
    level: 3,
    progressMin: 4000,
    progressTarget: null,
  },
];

const CRIME_COOLDOWN_SUCCESS = 25;
const CRIME_COOLDOWN_EVASION = 45;
const CRIME_COOLDOWN_JAILED = 80;

export class CrimeService {
  game: GameService;
  metric: MetricService;
  jail: JailService;
  perk: PerkService;
  log: LogService;

  constructor({ Game, Metric, Jail, Perk, Log }: Constructor) {
    this.game = Game;
    this.metric = Metric;
    this.jail = Jail;
    this.perk = Perk;
    this.log = Log;
  }

  @Transaction({ isolation: "READ COMMITTED" })
  async getItems(
    @TransactionRepository(Item) itemRepository?: Repository<Item>
  ): Promise<Item[]> {
    return await itemRepository.find({
      where: {
        variant: In(["consumable", "event"]),
      },
    });
  }

  async getRandomItemForCrimeDifficulty(difficulty: string) {
    const difficultyLower = difficulty.toLowerCase();
    const items = await this.getItems();

    const difficultyItems = {};
    const odds = [];
    for (const item of items) {
      const difficultyOdds = item.metadata?.dropRates?.[difficultyLower];
      if (difficultyOdds && difficultyOdds > 0) {
        difficultyItems[item.itemCode] = item;
        odds.push(...Array(difficultyOdds).fill(item.itemCode));
      }
    }

    const selectedItemCode = randomValue(odds);
    const selectedItem = difficultyItems[selectedItemCode];

    if (odds.length === 0) {
      console.log("uninitialised db");
      throw new Error("Items database not initialised correctly");
    }

    return {
      selectedItemCode,
      selectedItem,
      potentialItems: Object.keys(difficultyItems),
    };
  }

  getTabs() {
    return TABS;
  }

  async getProgression(player: Player) {
    const progress = await this.metric.getMetric(player, `crime-success`);
    const { level, progressMin, progressTarget } = LEVELS.find(
      ({ progressMin, progressTarget }) => {
        return (
          progress >= progressMin &&
          (progress < progressTarget || progressTarget === null)
        );
      }
    );

    return {
      id: player.uuid,
      level,
      progressMin,
      progress,
      progressTarget,
    };
  }

  async enabled(player: Player, crime: Crime) {
    const target = crime.progression.minimumCxp;

    return (await this.metric.getMetric(player, `crime-success`)) >= target;
  }

  async getCxp(player: Player, crime: Crime): Promise<number> {
    return await this.metric.getMetric(player, `crime-success-${crime.id}`);
  }

  async performCrime(
    player: Player,
    crime: Crime,
    @TransactionRepository(InventoryItem)
    inventoryItemRepository?: Repository<InventoryItem>
  ) {
    if (!(await this.enabled(player, crime))) {
      throw new Error("That crime is not yet available!");
    }

    if (await this.metric.isRecovering(player, "crimes")) {
      throw new Error("You are still recovering!");
    }

    const ITEM_DROP_CHANCE_UPPER = parseInt(
      (await this.game.getConfig("crimes.item_drop.upper")) ?? "60"
    );
    const ITEM_DROP_CHANCE_MINIMUM = parseInt(
      (await this.game.getConfig("crimes.item_drop.minimum")) ?? "10"
    );

    const cxp = await this.getCxp(player, crime);
    const progress = await this.metric.getMetric(player, `crime-success`);
    const target = crime.progression.targetCxp;
    let minimumPercentage = 35;
    let maximumPercentage = 75;
    if (crime.difficulty === "Heists") {
      maximumPercentage = 70;
      minimumPercentage = 30;
    }
    if (crime.difficulty === "Corporate") {
      maximumPercentage = 65;
      minimumPercentage = 25;
    }
    const progressionRatio = cxp / target;

    let successOdds = 95;

    if (progress > 3) {
      if (progressionRatio > 1) {
        successOdds = 75;
      } else {
        successOdds =
          (maximumPercentage - minimumPercentage) * progressionRatio +
          minimumPercentage;
      }
    }

    const crimeWasSuccessful = await this.perk.determineLuck({
      player,
      identifier: LuckIdentifier.CRIMES_SUCCESS,
      min: 0,
      max: 100,
      target: successOdds,
    });
    if (crimeWasSuccessful) {
      // Success

      const loot = [];

      const gaussianLootChances = gaussianRandom(700, 3000, 3) / 1000;

      const awardedCash = Math.round(gaussianLootChances * crime.loot.money);

      loot.push({
        variant: "currency",
        variantType: "money",
        quantity: awardedCash,
        name: "money",
      });

      crime.loot.crypto > 0 &&
        loot.push({
          variant: "currency",
          variantType: "crypto",
          quantity: crime.loot.crypto,
          name: "crypto",
        });

      const itemChances = random(0, ITEM_DROP_CHANCE_UPPER);
      if (itemChances < ITEM_DROP_CHANCE_MINIMUM) {
        // Items in loot

        const {
          selectedItemCode,
          selectedItem,
          potentialItems,
        } = await this.getRandomItemForCrimeDifficulty(crime.difficulty);

        // Stage item
        const awardedItem = new InventoryItem();
        awardedItem.itemId = selectedItem.id;
        awardedItem.player = player;
        awardedItem.equipped = false;

        let quantity = 1;
        if (selectedItem.variant === "event") {
          quantity = random(1, 4);
        }

        loot.push({
          variant: "item",
          quantity,
          name: selectedItem.name,
          image: selectedItem.image,
          id: selectedItem.id,
        });

        await this.game.awardItem(player, selectedItemCode, quantity);

        await Promise.all([
          this.metric.addMetric(
            player,
            `crime-success-loot-item:${selectedItemCode}`,
            quantity
          ),
          this.metric.addMetric(player, `crime-success-loot-item`, quantity),
        ]);
      }

      const [countdownSecs] = await Promise.all([
        this.metric.addCooldown(player, "crimes", CRIME_COOLDOWN_SUCCESS),
        this.game.awardXp(player, crime.loot.exp),
        this.game.awardCrypto(player, crime.loot.crypto),
        this.game.awardCash(player, awardedCash),
        this.metric.addMetric(player, `crime-success`, 1),
        this.metric.addMetric(player, `crime-success-${crime.id}`, 1),
        this.metric.addMetric(player, `crime-success-loot-cash`, awardedCash),
        this.metric.addMetric(
          player,
          `crime-success-loot-crypto`,
          crime.loot.crypto
        ),
        this.metric.addMetric(
          player,
          `crime-success-${crime.id}-loot-cash`,
          awardedCash
        ),
        this.metric.addMetric(
          player,
          `crime-success-${crime.id}-loot-crypto`,
          crime.loot.crypto
        ),
      ]);

      await this.log.event(EVENT.CrimeSuccess, {
        crime,
        loot,
        countdownSecs,
      });

      return {
        event: {
          message: "You succeeded the crime!",
          subtitle: `+ ${crime.loot.exp} XP`,
          status: "success",
          countdownSecs,
          countdownStartedAt: formatDate(new Date()),
          countdownExpiresAt: formatDate(futureDate(countdownSecs)),
          timerTag: "until rested",
          countdownLabel: "Recovering",
          crime,
        },
        lootFactor: {
          money: awardedCash,
          crypto: crime.loot.crypto,
          exp: crime.loot.exp,
        },
        loot: loot,
      };
    }

    const jailFromCrime = await this.perk.determineLuck({
      player,
      identifier: LuckIdentifier.CRIMES_JAIL,
      min: 0,
      max: 100,
      target: 50,
    });
    if (jailFromCrime) {
      // Jailed
      let special = null;
      const crypto = Math.floor(random(1, 12)) * 100;
      if (player.role === "3") {
        special = `${crypto} crypto`;
      }
      const [countdownSecs] = await Promise.all([
        this.metric.addCooldown(player, "crimes", CRIME_COOLDOWN_JAILED),
        this.metric.addMetric(player, `crime-fail`, 1),
        this.metric.addMetric(player, `crime-jailed`, 1),
        this.metric.addMetric(player, `crime-fail-${crime.id}`, 1),
        this.metric.addMetric(player, `crime-jailed-${crime.id}`, 1),
        this.game.jailPlayer({
          player,
          crime: "Crime",
          description: crime.name,
          releaseDate: futureDate(80),
          cellBlock: "Epstein",
          special: special,
        }),
      ]);

      await this.log.event(EVENT.CrimeJail, {
        crime,
        countdownSecs,
        jailSecs: 80,
      });

      return {
        event: {
          message: "You got caught and were sent to jail!",
          status: "jailed",
          countdownSecs,
          countdownStartedAt: formatDate(new Date()),
          countdownExpiresAt: formatDate(futureDate(countdownSecs)),
          jailSecs: 80,
          timerTag: "until release",
          countdownLabel: "Released from jail in",
          crime,
        },
        lootFactor: {
          money: 0,
          exp: 0,
        },
      };
    }

    // Evaded
    const [countdownSecs] = await Promise.all([
      this.metric.addCooldown(player, "crimes", CRIME_COOLDOWN_EVASION),
      this.metric.addMetric(player, `crime-fail`, 1),
      this.metric.addMetric(player, `crime-evaded`, 1),
      this.metric.addMetric(player, `crime-fail-${crime.id}`, 1),
      this.metric.addMetric(player, `crime-evaded-${crime.id}`, 1),
    ]);

    await this.log.event(EVENT.CrimeFail, {
      crime,
      countdownSecs,
    });

    return {
      event: {
        message: "You got caught but managed to evade the cops!",
        status: "evaded",
        countdownSecs,
        countdownStartedAt: formatDate(new Date()),
        countdownExpiresAt: formatDate(futureDate(countdownSecs)),
        jailSecs: 0,
        timerTag: "until rested",
        crime,
        countdownLabel: "Recovering",
      },
      lootFactor: {
        money: 0,
        exp: 0,
      },
    };
  }
}
