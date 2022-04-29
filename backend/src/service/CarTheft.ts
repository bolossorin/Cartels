import {
  EntityManager,
  Transaction,
  TransactionManager,
  getRepository,
  TransactionRepository,
  Repository,
} from "typeorm";
import { Player } from "../entity/Player";
import { Jail } from "../entity/Jail";
import { DISTRICT_DISTANCES, GameService } from "./Game";
import { MetricService } from "./Metric";
import {
  random,
  randomValue,
  gaussianRandom,
  randomPlate,
} from "../utils/random";
import {
  beforeNow,
  diff,
  diffFromNow,
  formatDate,
  futureDate,
} from "../utils/dates";
import { ordinal } from "../utils/numbers";
import { JailService } from "./Jail";
import { Crime, CRIMES } from "../constants/crimes";
import { Item } from "../entity/Item";
import { Vehicle } from "../entity/Vehicle";
import { EVENT, LogService } from "./Log";
import { District } from "../entity/District";
import { UserInputError } from "apollo-server-core";
import { LuckIdentifier, PerkService } from "./Perk";

interface Constructor {
  Game: GameService;
  Metric: MetricService;
  Jail: JailService;
  Log: LogService;
  Perk: PerkService;
}

const AREAS = [
  {
    name: "Residential",
    level: 1,
    multiplier: 1,
  },
  {
    name: "Commercial",
    level: 3,
    multiplier: 1.5,
  },
  {
    name: "Corporate",
    level: 5,
    multiplier: 2.0,
  },
];

const DIFFICULTY_MULTIPLIERS = {
  Easy: 1,
  Medium: 1.2,
  Risky: 1.4,
  Crackdown: 1.8,
};

const LEVELS = [
  {
    level: 1,
    progressMin: 0,
    progressTarget: 1000,
    difficultyMultiplier: 1,
  },
  {
    level: 2,
    progressMin: 1000,
    progressTarget: 4000,
    difficultyMultiplier: 0.97,
  },
  {
    level: 3,
    progressMin: 4000,
    progressTarget: 8500,
    difficultyMultiplier: 0.93,
  },
  {
    level: 4,
    progressMin: 8500,
    progressTarget: 14000,
    difficultyMultiplier: 0.89,
  },
  {
    level: 5,
    progressMin: 14000,
    progressTarget: 23500,
    difficultyMultiplier: 0.83,
  },
  {
    level: 6,
    progressMin: 23500,
    progressTarget: 34000,
    difficultyMultiplier: 0.76,
  },
  {
    level: 7,
    progressMin: 34000,
    progressTarget: 50000,
    difficultyMultiplier: 0.7,
  },
  {
    level: 8,
    progressMin: 50000,
    progressTarget: null,
    difficultyMultiplier: 0.6,
  },
];

const CAR_THEFT_COOLDOWN = 90;

export class CarTheftService {
  game: GameService;
  metric: MetricService;
  jail: JailService;
  log: LogService;
  perk: PerkService;

  constructor({ Game, Metric, Jail, Log, Perk }: Constructor) {
    this.game = Game;
    this.metric = Metric;
    this.jail = Jail;
    this.log = Log;
    this.perk = Perk;
  }

  @Transaction({ isolation: "READ COMMITTED" })
  async getVehicles(
    @TransactionRepository(Item) itemRepository?: Repository<Item>
  ): Promise<Item[]> {
    return await itemRepository.find({
      where: {
        variant: "vehicle",
      },
    });
  }

  @Transaction({ isolation: "READ COMMITTED" })
  async getPlayerVehiclesByDistrict(
    player: Player,
    district: District,
    @TransactionRepository(Vehicle) vehicleRepository?: Repository<Vehicle>
  ): Promise<Vehicle[]> {
    return await vehicleRepository.find({
      where: {
        player,
        district,
      },
      relations: ["item", "originDistrict", "destinationDistrict", "district"],
      order: {
        dateCreated: "DESC",
      },
    });
  }

  @Transaction({ isolation: "READ COMMITTED" })
  async getPlayerVehicleById(
    player: Player,
    id: string,
    @TransactionRepository(Vehicle) vehicleRepository?: Repository<Vehicle>
  ): Promise<Vehicle> {
    const vehicle = await vehicleRepository.findOne({
      where: {
        id,
      },
      relations: [
        "player",
        "item",
        "originDistrict",
        "destinationDistrict",
        "district",
      ],
    });
    if (!vehicle) {
      throw new UserInputError("That vehicle no longer exists!");
    }
    if (vehicle?.player?.id !== player.id) {
      throw new UserInputError("You do not have access to view that vehicle.");
    }
    if (vehicle.district.id !== player.district.id) {
      throw new UserInputError(
        `You cannot view ${vehicle.district.name} vehicles from ${player.district.name}.`
      );
    }

    return vehicle;
  }

  @Transaction({ isolation: "READ COMMITTED" })
  async performMechanicOperation(
    player: Player,
    id: string,
    taskCode: string,
    agreedPrice: number,
    destinationDistrict: string,
    @TransactionRepository(Vehicle) vehicleRepository?: Repository<Vehicle>
  ): Promise<Record<any, any>> {
    const vehicle = await this.getPlayerVehicleById(player, id);

    const logMeta = {
      vehicle,
      id,
      taskCode,
      agreedPrice,
      destinationDistrict,
    };

    if (vehicle?.destinationDistrict) {
      await this.log.event(EVENT.GarageMechanic, {
        ...logMeta,
        error: "You cannot change your vehicle while it is in transit.",
      });
      throw new UserInputError(
        "You cannot change your vehicle while it is in transit."
      );
    }

    if (!["sell", "repair", "changePlates", "transport"].includes(taskCode)) {
      await this.log.event(EVENT.GarageMechanic, {
        ...logMeta,
        error: "Unrecognised task code.",
      });
      throw new UserInputError("Unrecognised task code.");
    }
    if (
      taskCode === "transport" &&
      !Object.keys(DISTRICT_DISTANCES).includes(destinationDistrict)
    ) {
      await this.log.event(EVENT.GarageMechanic, {
        ...logMeta,
        error: "Unrecognised destination.",
      });
      throw new UserInputError("Unrecognised destination.");
    }

    const pricing = await this.getPricing(vehicle);
    let operationPrice =
      pricing?.[taskCode] ??
      pricing.transportOptions?.find(
        (option) => option.district === destinationDistrict
      )?.price;

    if (agreedPrice !== operationPrice) {
      await this.log.event(EVENT.GarageMechanic, {
        ...logMeta,
        operationPrice,
        error:
          "The price for this service has changed. Please review and retry.",
      });

      return {
        status: "error",
        message:
          "The price for this service has changed. Please review and retry.",
        vehicle,
      };
    }
    if (player.cash < operationPrice && taskCode !== "sell") {
      await this.log.event(EVENT.GarageMechanic, {
        ...logMeta,
        operationPrice,
        playerCash: player.cash,
        error: "You don't have the cash to pay for this.",
      });

      return {
        status: "error",
        message: "You don't have the cash to pay for this.",
        vehicle,
        player,
      };
    }

    if (taskCode === "sell") {
      const delResult = await vehicleRepository.delete(vehicle.id);
      await this.game.awardCash(player, operationPrice);

      await Promise.all([
        await this.metric.addMetric(player, `mechanic-${taskCode}`, 1),
        await this.metric.addMetric(
          player,
          `mechanic-${taskCode}-${vehicle.item.itemCode}`,
          1
        ),
        await this.metric.addMetric(
          player,
          `mechanic-${taskCode}-cash`,
          operationPrice
        ),
        await this.metric.addMetric(
          player,
          `mechanic-${taskCode}-${vehicle.item.itemCode}-cash`,
          operationPrice
        ),
      ]);

      const formattedPrice = operationPrice.toLocaleString();
      const message = `You sold your ${vehicle.item.name} for $${formattedPrice}!`;

      await this.log.event(EVENT.GarageMechanic, {
        ...logMeta,
        operationPrice,
        playerCash: player.cash,
        message,
      });

      return {
        status: "success",
        message,
        vehicle: undefined,
        player,
      };
    }

    if (taskCode === "changePlates") {
      vehicle.plate = randomPlate();
      if (vehicle.heat > 0 && !vehicle.plateChanged) {
        vehicle.heat -= 1;
      }
      vehicle.plateChanged = true;
      await vehicleRepository.save(vehicle, { reload: true });
      await this.game.deductCash(player, operationPrice);

      await Promise.all([
        await this.metric.addMetric(player, `mechanic-${taskCode}`, 1),
        await this.metric.addMetric(
          player,
          `mechanic-${taskCode}-${vehicle.item.itemCode}`,
          1
        ),
        await this.metric.addMetric(
          player,
          `mechanic-${taskCode}-spent-on-plate-changes`,
          operationPrice
        ),
        await this.metric.addMetric(
          player,
          `mechanic-${taskCode}-${vehicle.item.itemCode}-spent-on-plate-changes`,
          operationPrice
        ),
      ]);

      const message = `You re-plated your ${vehicle.item.name} to ${vehicle.plate}!`;

      await this.log.event(EVENT.GarageMechanic, {
        ...logMeta,
        operationPrice,
        playerCash: player.cash,
        message,
      });

      return {
        status: "success",
        message,
        vehicle,
        player,
      };
    }

    if (taskCode === "repair") {
      vehicle.damage = 0;
      await vehicleRepository.save(vehicle, { reload: true });
      await this.game.deductCash(player, operationPrice);

      await Promise.all([
        await this.metric.addMetric(player, `mechanic-${taskCode}`, 1),
        await this.metric.addMetric(
          player,
          `mechanic-${taskCode}-${vehicle.item.itemCode}`,
          1
        ),
        await this.metric.addMetric(
          player,
          `mechanic-${taskCode}-spent-on-repairs`,
          operationPrice
        ),
        await this.metric.addMetric(
          player,
          `mechanic-${taskCode}-${vehicle.item.itemCode}-spent-on-repairs`,
          operationPrice
        ),
      ]);

      const formattedPrice = operationPrice.toLocaleString();
      const message = `You repaired your ${vehicle.item.name} for $${formattedPrice}!`;

      await this.log.event(EVENT.GarageMechanic, {
        ...logMeta,
        operationPrice,
        playerCash: player.cash,
        message,
      });

      return {
        status: "success",
        message,
        vehicle,
        player,
      };
    }

    vehicle.destinationDistrict = this.game.getDistrict(destinationDistrict);
    vehicle.dateArrival = futureDate(3600 * 1.5);
    vehicle.dateShipped = new Date();
    if (vehicle.heat > 0 && !vehicle.originShipped) {
      vehicle.heat -= 2;
    }
    vehicle.originShipped = true;
    vehicle.shipping = true;
    await vehicleRepository.save(vehicle, { reload: true });
    await this.game.deductCash(player, operationPrice);

    await Promise.all([
      await this.metric.addMetric(player, `mechanic-${taskCode}`, 1),
      await this.metric.addMetric(
        player,
        `mechanic-${taskCode}-${vehicle.item.itemCode}`,
        1
      ),
      await this.metric.addMetric(
        player,
        `mechanic-${taskCode}-spent-on-transport`,
        operationPrice
      ),
      await this.metric.addMetric(
        player,
        `mechanic-${taskCode}-${vehicle.item.itemCode}-spent-on-transport`,
        operationPrice
      ),
    ]);

    const message = `Your ${vehicle.item.name} is now in transit to ${destinationDistrict}!`;

    await this.log.event(EVENT.GarageMechanic, {
      ...logMeta,
      operationPrice,
      playerCash: player.cash,
      message,
    });

    return {
      status: "success",
      message,
      vehicle,
      player,
    };
  }

  async getPricing(vehicle: Vehicle) {
    const vehicleDistrict = vehicle.district.name;
    const damage = vehicle.damage;
    const damagePriceReductionMulti = Math.min((damage * 2) / 100, 0.98);
    const rootSellPrice = vehicle.item.metadata?.garage?.sellPrice;
    if (!rootSellPrice) {
      console.log(`sell price missing from ${vehicle.item.itemCode}`);
      throw new UserInputError(
        `Could not determine sell price for ${vehicle.item.itemCode}`
      );
    }

    const damagePriceReduction = Math.max(
      Math.floor(rootSellPrice * damagePriceReductionMulti),
      0
    );
    const sellPrice = rootSellPrice - damagePriceReduction;

    const basePlateChange = rootSellPrice / 10000;
    const adjustedPlateChange = Math.floor(
      basePlateChange * 500 * Math.min(vehicle.heat, 0.25)
    );
    const boundedAdjustedPlateChange = Math.max(adjustedPlateChange, 300);

    const transportOptions = [];
    for (const [destination, distance] of Object.entries(
      DISTRICT_DISTANCES[vehicleDistrict]
    )) {
      if (destination !== vehicleDistrict) {
        transportOptions.push({
          district: destination,
          price: Math.floor((parseInt(`${distance}`) + 25) * 1.61),
          distance,
        });
      }
    }

    return {
      sell: Math.max(sellPrice, 100),
      repair: Math.max(Math.floor(damagePriceReduction * 0.6), 1000),
      changePlates: boundedAdjustedPlateChange,
      transportOptions,
    };
  }

  async getRandomVehicleInArea(area: string) {
    const areaLower = area.toLowerCase();
    const vehicles = await this.getVehicles();

    const areaVehicles = {};
    const odds = [];
    for (const vehicle of vehicles) {
      const areaOdds = vehicle.metadata?.carTheftOdds?.[areaLower];
      if (areaOdds && areaOdds > 0) {
        areaVehicles[vehicle.itemCode] = vehicle;
        odds.push(...Array(areaOdds).fill(vehicle.itemCode));
      }
    }

    const selectedVehicleCode = randomValue(odds);
    const selectedVehicle = areaVehicles[selectedVehicleCode];

    if (odds.length === 0) {
      console.log("uninitialised db");
      throw new Error("Vehicle database not initialised correctly");
    }

    return {
      selectedVehicleCode,
      selectedVehicle,
      potentialVehicles: Object.keys(areaVehicles),
    };
  }

  async getProgression(player: Player) {
    const progress = await this.metric.getMetric(
      player,
      `car-theft-rewarded-xp`
    );
    const {
      level,
      progressMin,
      progressTarget,
      difficultyMultiplier,
    } = LEVELS.find(({ progressMin, progressTarget }) => {
      return (
        progress >= progressMin &&
        (progress < progressTarget || progressTarget === null)
      );
    });

    return {
      id: player.uuid,
      level,
      progressMin,
      progress,
      progressTarget,
      difficultyMultiplier,
    };
  }

  async enabled(player: Player, area: string) {
    const target = AREAS.find((a) => a.name === area);

    return (await this.getProgression(player)).level >= target.level;
  }

  @Transaction({ isolation: "READ COMMITTED" })
  async performCarTheft(
    player: Player,
    area: string,
    difficulty: string,
    label: string,
    @TransactionRepository(Vehicle) vehicleRepository?: Repository<Vehicle>
  ) {
    if (!(await this.enabled(player, area))) {
      throw new Error("That car theft is not yet available!");
    }

    if (await this.metric.isRecovering(player, "car-theft")) {
      throw new Error("You are still recovering!");
    }

    const { difficultyMultiplier } = await this.getProgression(player);
    const targetAreaMultiplier = AREAS.find((a) => a.name === area).multiplier;
    const targetDifficultyMultiplier = DIFFICULTY_MULTIPLIERS[difficulty];
    const chanceUpper =
      70 *
      targetAreaMultiplier *
      targetDifficultyMultiplier *
      difficultyMultiplier;

    const successfulTheft = await this.perk.determineLuck({
      player,
      identifier: LuckIdentifier.CAR_THEFT_SUCCESS,
      min: 0,
      max: chanceUpper,
      target: 14,
    });
    if (successfulTheft) {
      // Success
      let xpReward = Math.round(
        random(2, 4) * targetAreaMultiplier * targetDifficultyMultiplier
      );

      const {
        selectedVehicle,
        selectedVehicleCode,
        potentialVehicles,
      } = await this.getRandomVehicleInArea(area);

      const damage = random(0, 50);
      if (damage === 0) {
        xpReward *= 3;
        await Promise.all([
          this.metric.addMetric(player, `car-theft-success-flawless`, 1),
          this.metric.addMetric(
            player,
            `car-theft-area:${difficulty}-success-flawless`,
            1
          ),
          this.metric.addMetric(
            player,
            `car-theft-difficulty:${difficulty}-success-flawless`,
            1
          ),
        ]);
      }

      // Stage vehicle
      const plate = randomPlate();
      const vehicle = new Vehicle();
      vehicle.damage = damage;
      vehicle.heat = 3;
      vehicle.plateChanged = false;
      vehicle.originShipped = false;
      vehicle.shipping = false;
      vehicle.originDistrict = player.district;
      vehicle.district = player.district;
      vehicle.item = selectedVehicle;
      vehicle.plate = plate;
      vehicle.player = player;

      await vehicleRepository.save(vehicle, { reload: true });

      const [cooldownSecs] = await Promise.all([
        this.metric.addCooldown(player, "car-theft", CAR_THEFT_COOLDOWN),
        this.game.awardXp(player, xpReward),
        this.metric.addMetric(player, `car-theft-rewarded-xp`, xpReward),
        this.metric.addMetric(player, `car-theft-success`, 1),
        this.metric.addMetric(player, `car-theft-area:${area}-success`, 1),
        this.metric.addMetric(
          player,
          `car-theft-vehicle:${selectedVehicleCode}-success`,
          1
        ),
        this.metric.addMetric(
          player,
          `car-theft-difficulty:${difficulty}-success`,
          1
        ),
        this.metric.addMetric(
          player,
          `car-theft-area:${area}-difficulty:${difficulty}-success`,
          1
        ),
      ]);

      const result = {
        title: `${damage === 0 ? "Flawless " : ""}Success!`,
        subtitle: `+ ${xpReward} XP`,
        actionLabel: label,
        status: "SUCCESS",
        vehicleLoot: vehicle,
        countdownStartedAt: formatDate(new Date()),
        countdownExpiresAt: formatDate(futureDate(cooldownSecs)),
        countdownLabel: "Recovering",
      };

      await this.log.event(EVENT.CarTheft, {
        ...result,
        chanceUpper,
        xpReward,
        area,
        difficulty,
      });

      return result;
    }

    const jailFromTheft = await this.perk.determineLuck({
      player,
      identifier: LuckIdentifier.CAR_THEFT_JAIL,
      min: 0,
      max: 100,
      target: 55,
    });
    if (jailFromTheft) {
      // Jailed
      const [cooldownSecs] = await Promise.all([
        this.metric.addCooldown(player, "car-theft", CAR_THEFT_COOLDOWN),
        this.metric.addMetric(player, `car-theft-fail`, 1),
        this.metric.addMetric(player, `car-theft-jailed`, 1),
        this.metric.addMetric(player, `car-theft-area:${area}-fail`, 1),
        this.metric.addMetric(player, `car-theft-area:${area}-jailed`, 1),
        this.metric.addMetric(
          player,
          `car-theft-difficulty:${difficulty}-fail`,
          1
        ),
        this.metric.addMetric(
          player,
          `car-theft-difficulty:${difficulty}-jailed`,
          1
        ),
        this.metric.addMetric(
          player,
          `car-theft-area:${area}-difficulty:${difficulty}-fail`,
          1
        ),
        this.metric.addMetric(
          player,
          `car-theft-area:${area}-difficulty:${difficulty}-jailed`,
          1
        ),
        this.game.jailPlayer({
          player,
          crime: "Car Theft",
          description: area,
          releaseDate: futureDate(180),
          cellBlock: "Epstein",
        }),
      ]);

      const result = {
        title: `Caught by Police!`,
        actionLabel: label,
        status: "JAILED",
        vehicleLoot: null,
        countdownStartedAt: formatDate(new Date()),
        countdownExpiresAt: formatDate(futureDate(180)),
        countdownLabel: "Released from jail in",
      };

      await this.log.event(EVENT.CarTheft, {
        ...result,
        chanceUpper,
        area,
        difficulty,
      });

      return result;
    }

    // Failed
    const [cooldownSecs] = await Promise.all([
      this.metric.addCooldown(player, "car-theft", CAR_THEFT_COOLDOWN),
      this.metric.addMetric(player, `car-theft-fail`, 1),
      this.metric.addMetric(player, `car-theft-area:${area}-fail`, 1),
      this.metric.addMetric(
        player,
        `car-theft-difficulty:${difficulty}-fail`,
        1
      ),
      this.metric.addMetric(
        player,
        `car-theft-area:${area}-difficulty:${difficulty}-fail`,
        1
      ),
    ]);

    const result = {
      title: `Failed to steal a car`,
      actionLabel: label,
      status: "FAILED",
      vehicleLoot: null,
      countdownStartedAt: formatDate(new Date()),
      countdownExpiresAt: formatDate(futureDate(cooldownSecs)),
      countdownLabel: "Recovering",
    };

    await this.log.event(EVENT.CarTheft, {
      ...result,
      chanceUpper,
      area,
      difficulty,
    });

    return result;
  }
}
