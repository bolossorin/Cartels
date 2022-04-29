import {
  EntityManager,
  Repository,
  Transaction,
  TransactionManager,
  TransactionRepository,
} from "typeorm";
import { Player } from "../entity/Player";
import { Jail } from "../entity/Jail";
import { GameService } from "./Game";
import { MetricService } from "./Metric";
import { random, randomValue } from "../utils/random";
import { diffFromNow, formatDate, futureDate } from "../utils/dates";
import { ordinal } from "../utils/numbers";
import { EVENT, LogService } from "./Log";
import { LuckIdentifier, PerkService } from "./Perk";
import {
  COOLDOWN_TOPIC,
  JAIL_BUST_TOPIC,
  JAIL_TOPIC,
} from "../globalServices/PubSub";

interface IJailConstructor {
  Game: GameService;
  Metric: MetricService;
  Log: LogService;
  Perk: PerkService;
}

type BustAbility = {
  canBustSelf: boolean;
  canBustOthers: boolean;
};

const BUST_SECURITY_BASE_ODDS = {
  Epstein: 150,
  Medium: 170,
  Maximum: 215,
  Gitmo: 1000,
};

const LEVELS = [
  {
    level: 1,
    progressMin: 0,
    progressTarget: 60,
  },
  {
    level: 2,
    progressMin: 60,
    progressTarget: 150,
  },
  {
    level: 3,
    progressMin: 150,
    progressTarget: 500,
  },
  {
    level: 4,
    progressMin: 500,
    progressTarget: 2000,
  },
  {
    level: 5,
    progressMin: 2000,
    progressTarget: null,
  },
];
const BUST_CAUGHT_JAIL_TIME = 60;
const ESCAPE_CAUGHT_JAIL_TIME = 30;

export class JailService {
  game: GameService;
  metric: MetricService;
  log: LogService;
  perk: PerkService;

  constructor({ Game, Metric, Log, Perk }: IJailConstructor) {
    this.game = Game;
    this.metric = Metric;
    this.log = Log;
    this.perk = Perk;
  }

  @Transaction({ isolation: "READ COMMITTED" })
  async getInmates(
    @TransactionManager() manager?: EntityManager
  ): Promise<Array<Jail>> {
    return manager
      .createQueryBuilder(Jail, "jail")
      .leftJoinAndSelect("jail.player", "player")
      .getMany();
  }

  @Transaction({ isolation: "READ COMMITTED" })
  async getInmate(
    inmateId: string,
    @TransactionManager() manager?: EntityManager
  ): Promise<Jail | null> {
    return manager
      .createQueryBuilder(Jail, "jail")
      .where("jail.id = :id", { id: inmateId })
      .leftJoinAndSelect("jail.player", "player")
      .getOne();
  }

  @Transaction({ isolation: "READ COMMITTED" })
  async getInmateByPlayerId(
    playerId: string | number,
    @TransactionManager() manager?: EntityManager
  ): Promise<Jail | null> {
    return manager
      .createQueryBuilder(Jail, "jail")
      .where("jail.player = :id", { id: playerId })
      .leftJoinAndSelect("jail.player", "player")
      .getOne();
  }

  @Transaction({ isolation: "READ COMMITTED" })
  async deleteInmate(
    inmateId: string,
    @TransactionRepository(Jail) jailRepository?: Repository<Jail>
  ): Promise<any> {
    const inmate = await jailRepository.find({ id: inmateId });

    return jailRepository.remove(inmate);
  }

  @Transaction({ isolation: "READ COMMITTED" })
  async deleteInmateByPlayer(
    player: Player,
    @TransactionRepository(Jail) jailRepository?: Repository<Jail>
  ): Promise<any> {
    const inmate = await jailRepository.find({ player });

    return jailRepository.remove(inmate);
  }

  async getBustAbility(player: Player): Promise<BustAbility> {
    const inmate = await this.getInmateByPlayerId(player.id);

    let canBustSelf = true;
    let canBustOthers = true;
    if (inmate) {
      canBustOthers = false;

      if (inmate.cellBlock !== "Epstein") {
        canBustSelf = false;
      }
    }

    return {
      canBustOthers,
      canBustSelf,
    };
  }

  async getLevel(player: Player): Promise<number> {
    const bustSuccesses = await this.metric.getMetric(
      player,
      "jail-bust-success"
    );
    const escapeSuccesses = await this.metric.getMetric(
      player,
      "jail-escape-success"
    );
    const progress = +bustSuccesses + +escapeSuccesses;
    const { level } = LEVELS.find(({ progressMin, progressTarget }) => {
      return (
        progress >= progressMin &&
        (progress < progressTarget || progressTarget === null)
      );
    });

    return level;
  }

  createOutputFactory(
    bustLevel: number,
    baseOdds: number,
    player: Player,
    target: Jail
  ) {
    return async (result: Record<string, any>) => {
      await this.log.event(EVENT.JailBust, {
        ...result,
        bustLevel,
        baseOdds,
        selfBust: target.playerId === player.id,
        inmate: {
          playerId: target.playerId,
          cellBlock: target.cellBlock,
          special: target.special,
          crime: target.crime,
          description: target.description,
          releaseDiff: diffFromNow(target.dateRelease),
        },
      });
      if (result?.success) {
        await this.metric.pubsub.publish(JAIL_BUST_TOPIC, {
          busterPlayerId: player.id,
          inmatePlayerId: target.playerId,
          cellBlock: target.cellBlock,
          special: target.special,
          crime: target.crime,
          description: target.description,
          releaseDiff: diffFromNow(target.dateRelease),
          date: formatDate(new Date()),
        });
      }

      return result;
    };
  }

  async getProgression(player: Player) {
    const bustSuccesses = await this.metric.getMetric(
      player,
      "jail-bust-success"
    );
    const escapeSuccesses = await this.metric.getMetric(
      player,
      "jail-escape-success"
    );
    const progress = +bustSuccesses + +escapeSuccesses;
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

  async bustPlayer(player: Player, inmateId) {
    const inmate = await this.getInmate(inmateId);
    if (!inmate) {
      throw new Error("That player has already been busted");
    }

    const bustLevel = await this.getLevel(player);
    const baseOdds = BUST_SECURITY_BASE_ODDS[inmate.cellBlock];

    const output = this.createOutputFactory(
      bustLevel,
      baseOdds,
      player,
      inmate
    );

    // Busting self
    const escapeSuccessOdds =
      Math.floor(baseOdds * 1.5) - Math.floor(12.5 * bustLevel);
    const didEscape = await this.perk.determineLuck({
      player,
      min: 1,
      max: escapeSuccessOdds,
      target: 50,
      identifier: LuckIdentifier.JAIL_ESCAPE,
    });

    if (inmate.player.id === player.id) {
      if (inmate.cellBlock !== "Epstein") {
        return output({
          success: false,
          message: `Guards have placed Zeus right next to your cell!`,
          jailed: false,
        });
      }

      if (!didEscape) {
        // Failed escape
        await Promise.all([
          this.metric.addMetric(player, "jail-escape-fail", 1),
          this.metric.streakMetric(player, "jail-escape-streak", 0),
        ]);

        const failureReasons = [
          "Caught fleeing grounds",
          "Spotlighted by guards",
          "Chased down by Zeus the Rottweiler",
          "Snitched on by an inmate",
          "Stuck in your escape tunnel",
        ];
        const failureMeans = randomValue(failureReasons);

        await this.deleteInmate(inmate.id);
        await this.game.jailPlayer({
          player,
          crime: "Prison Escape",
          description: failureMeans,
          releaseDate: futureDate(
            Math.floor(
              ESCAPE_CAUGHT_JAIL_TIME + diffFromNow(inmate.dateRelease)
            )
          ),
          cellBlock: "Medium",
        });

        return output({
          success: false,
          message: `You got ${failureMeans.toLowerCase()}!`,
          jailed: true,
        });
      }

      // Successful escape
      const [_, __] = await Promise.all([
        this.metric.addMetric(player, "jail-escape-success", 1),
        this.metric.streakMetric(player, "jail-escape-streak", 1),
        this.deleteInmate(inmateId),
        this.game.awardXp(player, random(2, 4)),
      ]);

      const successReasons = [
        "knocked out a guard, stole his keys",
        "fed some spaghetti to Zeus the Rottweiler",
        "built an escape boat out of macaroni",
        "hijacked a inmate transport bus",
        "started a riot as a distraction",
      ];
      const successMeans = randomValue(successReasons);

      return output({
        success: true,
        message: `You ${successMeans} and escaped!`,
        jailed: false,
      });
    }

    const bustSuccessOdds = baseOdds - 10 * bustLevel;
    const didBust = await this.perk.determineLuck({
      player,
      identifier: LuckIdentifier.JAIL_BUST,
      min: 1,
      max: bustSuccessOdds,
      target: 50,
    });
    if (!didBust) {
      // Failed bust
      await Promise.all([
        this.metric.addMetric(inmate.player, "busted-from-jail-fail", 1),
        this.metric.addMetric(player, "jail-bust-fail", 1),
        this.metric.streakMetric(player, "jail-bust-streak", 0),
      ]);

      const bustCaughtOdds = baseOdds - 10 * bustLevel;
      const caughtOdds = random(1, bustCaughtOdds);

      if (caughtOdds > 50) {
        // Caught failed bust
        await this.metric.addMetric(player, "jail-bust-fail-jailed", 1);
        await this.game.jailPlayer({
          player,
          crime: "Busting",
          description: `Tried to bust ${inmate.player.name}`,
          releaseDate: futureDate(BUST_CAUGHT_JAIL_TIME),
          cellBlock: "Epstein",
        });

        return output({
          success: false,
          message: `You got caught busting ${inmate.player.name} and are now in jail.`,
          jailed: true,
        });
      }

      return output({
        success: false,
        message: `You failed to bust ${inmate.player.name}.`,
        jailed: false,
      });
    }

    const [jailBustStreak, _, __, ___] = await Promise.all([
      this.metric.streakMetric(player, "jail-bust-streak", 1),
      this.metric.addMetric(inmate.player, "busted-from-jail-success", 1),
      this.metric.addMetric(player, "jail-bust-success", 1),
      this.deleteInmate(inmateId),
      this.game.awardXp(player, random(2, 4) * bustLevel),
    ]);

    let standardMessage = `You busted ${inmate.player.name}`;

    if (inmate.special !== null && inmate.special.includes("crypto")) {
      const cryptoAward = inmate.special.replace(/\D/g, "");

      await this.game.awardCrypto(player, parseInt(cryptoAward));

      standardMessage += `, and got ${cryptoAward} crypto bounty`;
    }

    standardMessage += `.`;

    let messageEnd = "";
    if (jailBustStreak >= 2) {
      messageEnd = ` (${ordinal(jailBustStreak)} bust in a row)`;
    }

    return output({
      success: true,
      message: `${standardMessage}${messageEnd}`,
      jailed: false,
    });
  }
}
