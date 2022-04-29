import {
  EntityManager,
  getRepository,
  LessThanOrEqual,
  Raw,
  Repository,
  Transaction,
  TransactionManager,
  TransactionRepository,
} from "typeorm";
import { WebServiceClient } from "@maxmind/geoip2-node";
import { Job, Queue, QueueScheduler, Worker } from "bullmq";
import { Jail } from "../entity/Jail";
import { Player } from "../entity/Player";
import { GameService } from "./Game";
import { Promotions } from "../entity/Promotions";
import { DrugLabBatch } from "../entity/DrugLabBatch";
import { DrugLabItem } from "../entity/DrugLabItem";
import { DRUG_LAB_ITEMS, DRUG_LAB_VARIANTS } from "../constants/drugLabItems";
import {
  formatDate,
  futureDate,
  LessThanOrEqualDate,
  pastDate,
} from "../utils/dates";
import { MetricService } from "./Metric";
import { DrugLabMarketPricing } from "../entity/DrugLabMarketPricing";
import { District } from "../entity/District";
import { bankResultCalculator, random } from "../utils/random";
import { shuffleArray } from "../utils/numbers";
import { Vehicle } from "../entity/Vehicle";
import { BankAccount } from "../entity/BankAccount";
import { Statistic } from "../entity/Statistic";
import { RaceTrackSheet } from "../entity/RaceTrackSheet";
import { RaceTrackHorse } from "../entity/RaceTrackHorse";
import { IpIntelligence } from "../entity/IpIntelligence";

const MARKET_PRICING_UPDATE_CONFIG = "market_pricing.last_update";
const MARKET_PRICING_UPDATE_INTERVAL = 3600 * 24 * 7 - 60;

const RACE_TRACK_ODDS_UPDATE_CONFIG = "race_track_odds.last_update";
const RACE_TRACK_ODDS_EXPIRES_CONFIG = "race_track_odds.expires_at";
const RACE_TRACK_ODDS_UPDATE_INTERVAL = 1800;

export class QueueService {
  queues = {};
  redis: any;
  game: GameService;
  metric: MetricService;

  constructor({ redis, Game, Metric }) {
    this.redis = redis;
    this.game = Game;
    this.metric = Metric;
  }

  async createQueues() {
    this.queues = {
      inmateRelease: await this.startQueue(
        "InmateRelease",
        1000,
        this.inmateReleaseProcessor
      ),
      rankPromotion: await this.startQueue(
        "RankPromotion",
        1000,
        this.rankPromotionProcessor
      ),
      labProcessor: await this.startQueue("Lab", 1000, this.labProcessor),
      labMarketPricingProcess: await this.startQueue(
        "LabMarketPricing",
        30000,
        this.labMarketPricingProcessor
      ),
      vehicleShippingProcessor: await this.startQueue(
        "VehicleShipping",
        5000,
        this.carShippingProcessor
      ),
      bankAccountProcessor: await this.startQueue(
        "BankAccount",
        1000,
        this.bankAccountProcessor
      ),
      gameStatisticProcessor: await this.startQueue(
        "GameStatistic",
        60000,
        this.gameStatisticProcessor
      ),
      raceTrackOddsProcessor: await this.startQueue(
        "RaceTrackOdds",
        3000,
        this.raceTrackOddsProcessor
      ),
      ipIntelligenceProcessor: await this.startQueue(
        "IpIntelligence",
        60000,
        this.ipIntelligenceProcessor
      ),
    };
  }

  async startQueue(
    name: string,
    timing: number,
    processor: (job, queue) => void
  ) {
    const queueScheduler = new QueueScheduler(name, {
      connection: {
        host: process.env.REDIS_HOSTNAME,
      },
    });
    const queue = new Queue(name, {
      connection: {
        host: process.env.REDIS_HOSTNAME,
      },
    });
    const worker = new Worker(
      name,
      async (job) => {
        await processor(job, this);
      },
      {
        connection: {
          host: process.env.REDIS_HOSTNAME,
        },
      }
    );

    console.log(`⏱️  QueueService[${name}] -> Started`);

    // worker.on("completed", (job: Job) => {
    //   console.log(`⏱️  QueueService[${name}] -> Job -> Completed ${job.id}`);
    // });

    worker.on("failed", (job: Job) => {
      console.log(
        `⏱️  QueueService[${name}] -> Job -> FAILED ${job.id} ${job.failedReason}`
      );
    });

    if (name === "GameStatistic") {
      console.log("removing repeatable");
      console.log(await queue.removeRepeatable(name, { every: 5000 }));
    }

    await queue.add(
      name,
      {},
      {
        repeat: {
          every: timing,
        },
        removeOnComplete: true,
        removeOnFail: true,
      }
    );

    return {
      queue,
      queueScheduler,
      worker,
    };
  }

  @Transaction({ isolation: "READ COMMITTED" })
  async carShippingProcessor(
    job,
    queue: this,
    @TransactionRepository(Vehicle)
    vehicleRepo?: Repository<Vehicle>
  ): Promise<boolean> {
    const vehiclesDueToArrive = await vehicleRepo.find({
      where: {
        dateArrival: LessThanOrEqual(new Date()),
      },
      relations: ["district"],
      take: 25,
    });

    for (const vehicle of vehiclesDueToArrive) {
      vehicle.district = vehicle.destinationDistrict;
      vehicle.destinationDistrict = null;
      vehicle.shipping = false;
      vehicle.dateArrival = null;
      await vehicleRepo.save(vehicle);

      console.log(
        `[CarShip] Updated ${vehicle.plate} owned by ${vehicle.playerId} to new location ${vehicle.district.name}`
      );
    }

    return true;
  }

  @Transaction({ isolation: "READ COMMITTED" })
  async labProcessor(
    job,
    queue: this,
    @TransactionRepository(DrugLabBatch)
    labBatchRepo?: Repository<DrugLabBatch>,
    @TransactionRepository(DrugLabItem) labItemRepo?: Repository<DrugLabItem>
  ): Promise<boolean> {
    const activeLabs: DrugLabItem[] = await labItemRepo.find({
      variant: DRUG_LAB_VARIANTS.lab,
      equipped: true,
    });

    const batchesToUpdate = [];
    const batchesToDelete = [];

    for (const lab of activeLabs) {
      const equippedLabItem = DRUG_LAB_ITEMS.find(
        ({ id }) => id === lab.itemId
      );
      const equippedLabItemCapability = parseInt(
        /(\d+)/.exec(equippedLabItem.capability)[0]
      );

      const batches: DrugLabBatch[] = await labBatchRepo.find({
        playerId: lab.playerId,
      });
      if (batches.length === 0) {
        // Player doesn't have any batches
        continue;
      }

      const producingBatches = batches.find(
        (activeBatch) => activeBatch.producing
      );
      const firstBatch = batches.reduce(function (prev, curr) {
        // @ts-ignore
        return prev.dateCreated < curr.dateCreated ? prev : curr;
      });

      if (!producingBatches) {
        // Player has batches, but none are producing
        const timeForProductionSeconds =
          (60 / equippedLabItemCapability) * firstBatch.units * 60;

        firstBatch.producing = true;
        firstBatch.dateStart = new Date();
        firstBatch.dateFinish = futureDate(timeForProductionSeconds);
        console.log(
          `Starting production on ${
            firstBatch.id
          } to end at ${firstBatch.dateFinish.toJSON()}`
        );

        batchesToUpdate.push(firstBatch);
        continue;
      }

      if (new Date() > firstBatch.dateFinish) {
        // Player has batches producing, and one is finished
        await queue.game.awardItem(
          lab.player,
          firstBatch.product,
          firstBatch.units
        );
        console.log(
          `Awarded ${lab.playerId}: ${firstBatch.units} for ${firstBatch.product}`
        );

        await queue.metric.addMetric(
          lab.player,
          `lab-batch-units-produced`,
          firstBatch.units
        );
        await queue.metric.addMetric(
          lab.player,
          `lab-batch-units-produced-${firstBatch.product}`,
          firstBatch.units
        );

        batchesToDelete.push(firstBatch);
      }
    }

    if (batchesToUpdate.length > 0) {
      await labBatchRepo.save(batchesToUpdate);
    }
    if (batchesToDelete.length > 0) {
      await labBatchRepo.delete(batchesToDelete);
    }

    return true;
  }

  @Transaction({ isolation: "READ COMMITTED" })
  async rankPromotionProcessor(
    job,
    queue,
    @TransactionRepository(Player) playerRepository?: Repository<Player>,
    @TransactionRepository(Promotions)
    promotionsRepository?: Repository<Promotions>
  ): Promise<boolean> {
    const eligiblePlayers = await playerRepository.find({
      xp: Raw(
        (alias) =>
          `${alias} >= "Player_rank"."maxExp" AND "Player_rank"."maxExp" != 0`
      ),
    });

    const promotions: Promotions[] = [];

    eligiblePlayers.map((player) => {
      console.log(
        `Rank up for ${player.name} ${player.id} -> ${player.rankId} to ${
          player.rankId + 1
        }`
      );

      const newRank = queue.game.getRank(`${player.rankId + 1}`);

      const promotion = new Promotions();
      promotion.player = player;
      promotion.title = "Promoted to";
      promotion.levelName = newRank.name;
      promotion.startPoints = player.rank.exp;
      promotion.endPoints = player.rank.maxExp;
      promotion.showRewards = true;
      promotion.actionText = "XP";
      promotion.tier = player.rank.id;

      promotions.push(promotion);
      player.rank = newRank;
    });

    await promotionsRepository.save(promotions);
    await playerRepository.save(eligiblePlayers);

    return true;
  }

  @Transaction({ isolation: "READ COMMITTED" })
  async inmateReleaseProcessor(
    job,
    queue,
    @TransactionManager() manager?: EntityManager
  ) {
    const jailRepo = getRepository(Jail);
    const inmates = await jailRepo.find({
      dateRelease: LessThanOrEqual(new Date()),
    });

    if (inmates.length > 0) {
      for (const inmate of inmates) {
        await jailRepo.remove(inmates);
      }
    }

    return inmates.length;
  }

  @Transaction({ isolation: "READ COMMITTED" })
  async labMarketPricingProcessor(
    job,
    queue: this,
    @TransactionRepository(DrugLabMarketPricing)
    drugLabMarketPricingRepository?: Repository<DrugLabMarketPricing>,
    @TransactionRepository(District) districtRepository?: Repository<District>
  ) {
    const lastMarketUpdate = await queue.game.getConfig(
      MARKET_PRICING_UPDATE_CONFIG
    );
    if (
      !lastMarketUpdate ||
      new Date(lastMarketUpdate) < pastDate(MARKET_PRICING_UPDATE_INTERVAL)
    ) {
      console.log("performing update of market pricing");

      const DRUG_PRICES = {
        cocaine: [400, 500],
        speed: [100, 300],
        ecstasy: [200, 400],
        lsd: [350, 450],
      };
      const BASE_FORMULA = [
        random(0, 5),
        random(5, 90),
        random(5, 90),
        random(5, 90),
        random(95, 100),
      ];
      const drugLabMarketPrices = [];

      for (const drug of Object.keys(DRUG_PRICES)) {
        const drugEntity = await queue.game.getItemByCode(drug);
        const drugData = DRUG_PRICES[drug];
        const drugFormula = shuffleArray([...BASE_FORMULA]);
        const minimumPrice = drugData[0];
        const maximumPrice = drugData[1];
        const minMaxDiffPrice = maximumPrice - minimumPrice;

        const districts = await districtRepository.find();
        for (const district of districts) {
          const baseMultiplier = drugFormula.pop();
          const districtPrice = Math.ceil(
            minimumPrice + minMaxDiffPrice * (baseMultiplier / 100)
          );

          const districtMarketPrice = new DrugLabMarketPricing();
          districtMarketPrice.district = district;
          districtMarketPrice.item = drugEntity;
          districtMarketPrice.price = districtPrice;
          drugLabMarketPrices.push(districtMarketPrice);

          console.log(
            `market pricing ${district.name} ${drug} -> PRICE : ${districtPrice} (${baseMultiplier}%)`
          );
        }
      }

      await drugLabMarketPricingRepository.update(
        { active: true },
        { active: false }
      );
      await drugLabMarketPricingRepository.save(drugLabMarketPrices);
      await queue.game.setConfig(
        MARKET_PRICING_UPDATE_CONFIG,
        formatDate(new Date())
      );
    }
  }

  @Transaction({ isolation: "READ COMMITTED" })
  async bankAccountProcessor(
    job,
    queue: this,
    @TransactionRepository(BankAccount)
    bankAccountRepository?: Repository<BankAccount>
  ) {
    const expiredBankAccountsInProgress = await bankAccountRepository.find({
      where: {
        status: "in_progress",
        dateExpires: LessThanOrEqualDate(futureDate(3)),
      },
    });

    for (const bankAccount of expiredBankAccountsInProgress) {
      bankAccount.status = "completed";
      bankAccount.result = Math.round(
        bankResultCalculator(
          bankAccount.amount,
          bankAccount.accountType,
          bankAccount.riskiness
        )
      );

      await bankAccountRepository.save(bankAccount);
    }
  }

  @Transaction({ isolation: "READ UNCOMMITTED" })
  async gameStatisticProcessor(
    job,
    queue: this,
    @TransactionRepository(Statistic)
    statisticRepo?: Repository<Statistic>,
    @TransactionManager() manager?: EntityManager
  ) {
    const generalStats = `
          SUM(player.cash) AS sum_cash,
          ROUND(AVG(player.cash)) AS avg_cash,
          MIN(player.cash) AS min_cash,
          MAX(player.cash) AS max_cash,
          
          SUM(player.crypto) AS sum_crypto,
          ROUND(AVG(player.crypto)) AS avg_crypto,
          MIN(player.crypto) AS min_crypto,
          MAX(player.crypto) AS max_crypto,
          
          SUM(player.gold) AS sum_gold,
          ROUND(AVG(player.gold)) AS avg_gold,
          MIN(player.gold) AS min_gold,
          MAX(player.gold) AS max_gold
    `;

    const stats = await manager.query(`
        SELECT
          COUNT(*) AS count_registered,
        
          ${generalStats}
        FROM player
        WHERE player.role IS NULL
    `);
    const districtStats = await manager.query(`
        SELECT
          district.name,
          COUNT(*) AS total_in_district,
          
          ${generalStats}
        FROM player
        LEFT JOIN district ON player."districtId" = district.id
        WHERE player.role IS NULL
        GROUP BY district.name
    `);

    const gameStat = new Statistic();
    gameStat.target = "game";
    gameStat.metricName = "general";
    gameStat.data = stats[0];

    await manager.save(gameStat);

    const districtStatsToSave = [];
    for (const district of districtStats) {
      const districtStat = new Statistic();
      districtStat.target = "district";
      districtStat.metricName = district.name;
      districtStat.data = district;

      districtStatsToSave.push(districtStat);
    }

    await manager.save(districtStatsToSave);

    const allPlayers = await manager.query(`
        SELECT
          player.id,
          player.name,
          
          player.cash,
          player.gold,
          player.crypto,
          player.xp
        FROM player
    `);
    const playerStatsToSave = [];
    for (const { id, name, cash, gold, crypto, xp } of allPlayers) {
      const [metricsChecksum, generalChecksum] = await Promise.all([
        queue.metric.cache.hget(`player-checksum:${id}`, `metrics`),
        queue.metric.cache.hget(`player-checksum:${id}`, `general`),
      ]);

      const metrics = await queue.metric.getAllMetrics(id);
      const playerStat = new Statistic();
      playerStat.target = `player:${id}`;
      playerStat.metricName = `metrics`;
      playerStat.data = metrics;
      await playerStat.generateChecksum();

      if (metricsChecksum !== playerStat.checksum) {
        // data has changed
        playerStatsToSave.push(playerStat);

        await queue.metric.cache.hset(
          `player-checksum:${id}`,
          `metrics`,
          playerStat.checksum
        );
        console.log(`Updating PLAYER stats for (${id}) ${name}`);
      }

      const playerGeneralStat = new Statistic();
      playerGeneralStat.target = `player:${id}`;
      playerGeneralStat.metricName = `general`;
      playerGeneralStat.data = {
        cash,
        gold,
        crypto,
        xp,
      };
      await playerGeneralStat.generateChecksum();

      if (generalChecksum !== playerGeneralStat.checksum) {
        // data has changed
        playerStatsToSave.push(playerGeneralStat);

        await queue.metric.cache.hset(
          `player-checksum:${id}`,
          `general`,
          playerGeneralStat.checksum
        );
        console.log(`Updating GENERAL stats for (${id}) ${name}`);
      }
    }
    await manager.save(playerStatsToSave);
  }

  @Transaction({ isolation: "READ COMMITTED" })
  async ipIntelligenceProcessor(
    job,
    queue: this,
    @TransactionRepository(IpIntelligence)
    ipIntelligenceRepo?: Repository<IpIntelligence>
  ) {
    const maxmindAccountId = process.env?.MAXMIND_ACCOUNT_ID;
    const maxmindKey = process.env?.MAXMIND_LICENSE_KEY;
    if (!maxmindKey) {
      console.log(`No Maxmind key configured`);
      return;
    }

    const client = new WebServiceClient(maxmindAccountId, maxmindKey);

    const ipIntelToDo = await ipIntelligenceRepo.find({
      where: {
        metadata: null,
      },
      take: 15,
    });
    if (ipIntelToDo && ipIntelToDo.length !== 0) {
      console.log(`IP intel to process: ${ipIntelToDo.length}`);
      for (const ipIntel of ipIntelToDo) {
        try {
          ipIntel.metadata = await client.insights(ipIntel.ipAddress);

          await ipIntelligenceRepo.save(ipIntel);
          console.log(
            `IP intel processed: ${ipIntel.ipAddress} for id ${ipIntel.id}`
          );
        } catch (e) {
          console.log(e);
          console.log(
            `IP intel failed: ${ipIntel.ipAddress} for id ${ipIntel.id}`
          );
        }
      }
    }
  }

  @Transaction({ isolation: "READ COMMITTED" })
  async raceTrackOddsProcessor(
    job,
    queue: this,
    @TransactionRepository(RaceTrackSheet)
    sheetRepo?: Repository<RaceTrackSheet>,
    @TransactionRepository(RaceTrackHorse)
    horseRepo?: Repository<RaceTrackHorse>,
    @TransactionRepository(District) districtRepository?: Repository<District>
  ) {
    const lastMarketUpdate = await queue.game.getConfig(
      RACE_TRACK_ODDS_UPDATE_CONFIG
    );
    if (
      !lastMarketUpdate ||
      new Date(lastMarketUpdate) < pastDate(RACE_TRACK_ODDS_UPDATE_INTERVAL)
    ) {
      console.log("performing update of race track odds");

      let eligibleHorses = shuffleArray(await horseRepo.find());
      const eligibleDistricts = await districtRepository.find();

      if (!eligibleHorses || eligibleHorses.length === 0) {
        console.log(
          "horses must be added before race track odds can be calculated"
        );

        return;
      }

      const tiers = [1, 1, 1, 2, 2, 2, 3, 3];

      for (const district of eligibleDistricts) {
        const possibleSilks = shuffleArray(
          Array.from(new Array(30), (x, i) => i + 1)
        );

        console.log(`updating ${district.name} race track odds`);
        const horses = [];
        for (const desiredTier of tiers) {
          const horse = eligibleHorses.find((h) => h.tier === desiredTier);
          eligibleHorses = eligibleHorses.filter((h) => h.id !== horse.id);

          horses.push({
            id: horse.id,
            name: horse.name,
            odds: queue.determineHorseOdds(horses.length),
            silk: possibleSilks.pop(),
          });
        }

        const sheet = new RaceTrackSheet();
        sheet.district = district;
        sheet.odds = horses;

        await sheetRepo.delete({
          district,
        });
        await sheetRepo.save(sheet);
      }

      await queue.game.setConfig(
        RACE_TRACK_ODDS_UPDATE_CONFIG,
        formatDate(new Date())
      );
      await queue.game.setConfig(
        RACE_TRACK_ODDS_EXPIRES_CONFIG,
        formatDate(futureDate(RACE_TRACK_ODDS_UPDATE_INTERVAL + 5))
      );
    }
  }

  determineHorseOdds(tier: number): number {
    return [
      random(11, 23),
      random(24, 34),
      random(34, 40),
      random(41, 46),
      random(47, 120),
      random(130, 150),
      random(160, 600),
      random(800, 1990),
    ][tier];
  }
}
