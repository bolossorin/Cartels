import { Account } from "../entity/Account";
import CacheService from "./Cache";
import { GameService } from "./Game";
import { MetricService } from "./Metric";
import { LogService } from "./Log";
import { Player } from "../entity/Player";
import { In, Repository, Transaction, TransactionRepository } from "typeorm";
import { Perk } from "../entity/Perk";
import {
  diffFromNow,
  futureDate,
  LessThanOrEqualDate,
  MoreThanOrEqualDate,
} from "../utils/dates";
import { random } from "../utils/random";

export enum PerkIdentifier {
  JAIL_RELEASE_REDUCTION = "jailReduction",
  COOLDOWN_REDUCTION = "cooldownReduction",
  LUCK_INCREASE = "luckIncrease",
}

export enum LuckIdentifier {
  CRIMES_SUCCESS = "crimesSuccess",
  CRIMES_JAIL = "crimesJail",
  CAR_THEFT_SUCCESS = "carTheftSuccess",
  CAR_THEFT_JAIL = "carTheftJail",
  JAIL_ESCAPE = "jailEscape",
  JAIL_BUST = "jailBust",
}

export class PerkService {
  @Transaction({ isolation: "READ COMMITTED" })
  async getActivePerks(
    player: Player,
    @TransactionRepository(Perk) perkRepo?: Repository<Perk>
  ): Promise<Perk[]> {
    const date = new Date();

    const gamePerks = await perkRepo.find({
      where: {
        playerId: null,
        dateStart: LessThanOrEqualDate(date),
        dateEnd: MoreThanOrEqualDate(date),
      },
    });
    const myPerks = await perkRepo.find({
      where: {
        player,
        dateStart: LessThanOrEqualDate(date),
        dateEnd: MoreThanOrEqualDate(date),
      },
    });

    return [...gamePerks, ...myPerks];
  }

  @Transaction({ isolation: "READ COMMITTED" })
  async giftPerk(
    player: Player,
    effects: Record<string, any>,
    image: string,
    @TransactionRepository(Perk) perkRepo?: Repository<Perk>
  ): Promise<void> {
    const perkName = effects?.name;
    const perkSeconds = effects?.seconds;
    const perkDescription = effects?.description;
    const perkEffects = effects?.effects;

    const date = new Date();
    const existingPerk = await perkRepo.findOne({
      where: {
        name: perkName,
        player,
        dateStart: LessThanOrEqualDate(date),
        dateEnd: MoreThanOrEqualDate(date),
      },
    });
    if (existingPerk) {
      const remainingSecs = diffFromNow(new Date(existingPerk.dateEnd));

      existingPerk.dateEnd = futureDate((remainingSecs ?? 0) + perkSeconds);

      await perkRepo.save(existingPerk);

      return;
    }

    const perk = new Perk();
    perk.player = player;
    perk.name = perkName;
    perk.description = perkDescription;
    perk.effects = perkEffects;
    perk.dateStart = new Date();
    perk.dateEnd = futureDate(perkSeconds);
    perk.image = image;
    console.log(perkSeconds);
    console.log(perk.dateEnd);
    console.log(perk.dateStart);
    console.log(perk.dateEnd);

    await perkRepo.save(perk);
  }

  async determineJailReleaseDate(
    player: Player,
    crime: string,
    originalDate: Date
  ): Promise<Date> {
    const perks = await this.getActivePerks(player);
    let perkReduction = 0;
    perks.forEach(({ effects }) => {
      effects.forEach(({ id, percentageReduction }) => {
        console.log({ id, percentageReduction });

        if (id === PerkIdentifier.JAIL_RELEASE_REDUCTION) {
          console.log("JAIL RELEASE PERK TRIGGER", { id, percentageReduction });
          perkReduction += percentageReduction;
        }
      });
    });

    console.log(`Determine jail release date`, { perkReduction });

    const reduction = Math.min(perkReduction, 100);
    const secondsUntil = diffFromNow(originalDate);
    const reduceBy = secondsUntil * (reduction / 100);
    console.log(`Reduce jail release date by`, { secondsUntil, reduceBy });

    if (reduction === 0 || ["Customs"].includes(crime)) {
      return originalDate;
    }

    return futureDate(secondsUntil - reduceBy);
  }

  async determineCooldownSecs(
    player: Player,
    name: string,
    originalSecs: number
  ): Promise<number> {
    const perks = await this.getActivePerks(player);
    let perkReduction = 0;
    perks.forEach(({ effects }) => {
      effects.forEach(({ id, cooldownName, percentageReduction }) => {
        console.log({ id, cooldownName, percentageReduction });

        if (id === PerkIdentifier.COOLDOWN_REDUCTION && cooldownName === name) {
          console.log("COOLDOWN SECS PERK TRIGGER", {
            id,
            cooldownName,
            percentageReduction,
          });
          perkReduction += percentageReduction;
        }
      });
    });

    const reduction = Math.min(perkReduction, 100);
    const reduceBy = originalSecs * (reduction / 100);
    if (reduction === 0) {
      return originalSecs;
    }

    console.log({
      originalSecs,
      updatedSecs: Math.ceil(originalSecs - reduceBy),
      name,
      pid: player.id,
    });

    return Math.ceil(originalSecs - reduceBy);
  }

  async determineLuck({
    player,
    identifier,
    min,
    max,
    target,
  }: {
    player: Player;
    identifier: string;
    min: number;
    max: number;
    target: number;
  }): Promise<boolean> {
    const perks = await this.getActivePerks(player);
    let luckIncrease = 0;

    perks.forEach(({ effects }) => {
      effects.forEach(({ id, luckId, percentageIncrease }) => {
        console.log({ id, luckId, percentageIncrease });

        if (id === PerkIdentifier.LUCK_INCREASE && luckId === identifier) {
          console.log("PERK TRIGGER", { id, luckId, percentageIncrease });
          luckIncrease += percentageIncrease;
        }
      });
    });

    const reduction = Math.min(luckIncrease, 100);

    const luckMin = min * 1000;
    const luckMax = max * 1000;
    let luckTarget = target * 1000;
    if (reduction > 0) {
      luckTarget = luckTarget + Math.ceil(luckTarget * (reduction / 100));
    }

    const rand = random(luckMin, luckMax);

    console.log(`Perk calculation`, {
      min,
      max,
      target,
      luckMin,
      luckMax,
      luckTarget,
      rand,
      identifier,
      popped: rand <= luckTarget,
      pid: player.id,
      percentageIncrease: luckIncrease,
      reduction,
    });

    return rand <= luckTarget;
  }
}
