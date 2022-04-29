import { Repository, Transaction, TransactionRepository } from "typeorm";
import { Player } from "../entity/Player";
import { DrugLabItem as DrugLabItemEntity } from "../entity/DrugLabItem";
import { DrugLabBatch } from "../entity/DrugLabBatch";
import { Currency, GameService } from "./Game";
import { MetricService } from "./Metric";
import { JailService } from "./Jail";
import {
  DRUG_LAB_ITEMS,
  DRUG_LAB_VARIANTS,
  DrugLabItem,
} from "../constants/drugLabItems";
import { EVENT, LogService } from "./Log";
import { DrugLabMarketPricing } from "../entity/DrugLabMarketPricing";

interface Constructor {
  Game: GameService;
  Metric: MetricService;
  Jail: JailService;
  Log: LogService;
}

const LEVELS = [
  {
    level: 1,
    progressMin: 0,
    progressTarget: 1000,
  },
  {
    level: 2,
    progressMin: 1000,
    progressTarget: 2000,
  },
  {
    level: 3,
    progressMin: 2000,
    progressTarget: 3000,
  },
  {
    level: 4,
    progressMin: 3000,
    progressTarget: 4500,
  },
  {
    level: 5,
    progressMin: 4500,
    progressTarget: 6500,
  },
  {
    level: 6,
    progressMin: 6500,
    progressTarget: 8000,
  },
  {
    level: 7,
    progressMin: 8000,
    progressTarget: 10000,
  },
  {
    level: 8,
    progressMin: 10000,
    progressTarget: 13000,
  },
  {
    level: 9,
    progressMin: 13000,
    progressTarget: 16200,
  },
  {
    level: 10,
    progressMin: 16200,
    progressTarget: null,
  },
];

export const MAXIMUM_BATCHES = 8;

export class LabService {
  game: GameService;
  metric: MetricService;
  jail: JailService;
  log: LogService;

  constructor({ Game, Metric, Jail, Log }: Constructor) {
    this.game = Game;
    this.metric = Metric;
    this.jail = Jail;
    this.log = Log;
  }

  getItems() {
    return DRUG_LAB_ITEMS;
  }

  async getProgression(player: Player) {
    const progress = await this.metric.getMetric(
      player,
      `lab-batch-units-produced`
    );
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

  @Transaction({ isolation: "READ COMMITTED" })
  async getPlayerItem(
    player: Player,
    item: DrugLabItem,
    @TransactionRepository(DrugLabItemEntity)
    drugLabItemRepo?: Repository<DrugLabItemEntity>
  ) {
    return await drugLabItemRepo.findOne({
      player,
      itemId: item.id,
    });
  }

  @Transaction({ isolation: "READ COMMITTED" })
  async getPlayerItems(
    player: Player,
    variant: string,
    @TransactionRepository(DrugLabItemEntity)
    drugLabItemRepo?: Repository<DrugLabItemEntity>
  ): Promise<DrugLabItemEntity[]> {
    return await drugLabItemRepo.find({
      player,
      variant,
    });
  }

  @Transaction({ isolation: "READ COMMITTED" })
  async getPlayerEquippedItemByVariant(
    player: Player,
    variant: string,
    @TransactionRepository(DrugLabItemEntity)
    drugLabItemRepo?: Repository<DrugLabItemEntity>
  ): Promise<DrugLabItemEntity> {
    return await drugLabItemRepo.findOne({
      player,
      variant,
      equipped: true,
    });
  }

  @Transaction({ isolation: "READ COMMITTED" })
  async getPlayerBatches(
    player: Player,
    @TransactionRepository(DrugLabBatch)
    drugLabBatchRepo?: Repository<DrugLabBatch>
  ): Promise<DrugLabBatch[]> {
    return await drugLabBatchRepo.find({
      where: {
        player,
      },
      order: {
        dateCreated: "ASC",
      },
    });
  }

  @Transaction({ isolation: "READ COMMITTED" })
  async getPlayerBatchesUnitCount(
    player: Player,
    @TransactionRepository(DrugLabBatch)
    drugLabBatchRepo?: Repository<DrugLabBatch>
  ): Promise<number> {
    const units = await drugLabBatchRepo.find({
      player,
    });

    if (!units) {
      return 0;
    }

    return units.reduce((prev, batch) => prev + batch.units, 0);
  }

  @Transaction({ isolation: "READ COMMITTED" })
  async getPlayerMaximumUnits(
    player: Player,
    @TransactionRepository(DrugLabBatch)
    drugLabBatchRepo?: Repository<DrugLabBatch>
  ): Promise<number> {
    const equippedLab = await this.getPlayerEquippedItemByVariant(
      player,
      DRUG_LAB_VARIANTS.hub
    );
    if (!equippedLab) {
      return 0;
    }

    const equippedLabItem = DRUG_LAB_ITEMS.find(
      ({ id }) => id === equippedLab.itemId
    );

    return this.getCapabilityFromItem(equippedLabItem);
  }

  async minimumRequirementsMet(player: Player): Promise<boolean> {
    const [lab, hub] = await Promise.all([
      this.getPlayerItems(player, DRUG_LAB_VARIANTS.lab),
      this.getPlayerItems(player, DRUG_LAB_VARIANTS.hub),
    ]);

    return lab.length !== 0 && hub.length !== 0;
  }

  async owned(player: Player, item: DrugLabItem) {
    const playerItem = await this.getPlayerItem(player, item);

    return playerItem !== undefined;
  }

  async equipped(player: Player, item: DrugLabItem) {
    const playerItem = await this.getPlayerItem(player, item);

    return playerItem?.equipped ?? false;
  }

  async locked(player: Player, item: DrugLabItem) {
    const { level } = await this.getProgression(player);

    return level < (item?.unlock ?? 0);
  }

  async cannotAfford(player: Player, item: DrugLabItem, currency: Currency) {
    const cost = item.prices[currency];

    return player[currency] < cost;
  }

  async purchaseItem(player: Player, item: DrugLabItem, currency: Currency) {
    if (await this.locked(player, item)) {
      throw new Error("That Drug Lab item is locked!");
    }
    if (await this.owned(player, item)) {
      throw new Error("You already own that item!");
    }
    if (await this.cannotAfford(player, item, currency)) {
      throw new Error("You cannot afford that item!");
    }

    try {
      await this.completeItemPurchase(player, item, currency);

      return true;
    } catch (e) {
      console.log("item purchase fail");
      console.log({ e });

      return e.message;
    }
  }

  @Transaction({ isolation: "READ COMMITTED" })
  async completeItemPurchase(
    player: Player,
    item: DrugLabItem,
    currency: Currency,
    @TransactionRepository(DrugLabItemEntity)
    drugLabItemRepo?: Repository<DrugLabItem>,
    @TransactionRepository(Player)
    playerRepo?: Repository<Player>
  ) {
    const cost = item.prices[currency];

    await drugLabItemRepo.update(
      // @ts-ignore
      { player, variant: item.variant },
      { equipped: false }
    );

    const currentDrugLabItem = await this.getPlayerEquippedItemByVariant(
      player,
      item.variant
    );
    const currentDrugLabItemPrice = DRUG_LAB_ITEMS.find(
      (item) => item.id === currentDrugLabItem?.id
    )?.prices?.[currency];
    const equipNewItem =
      !currentDrugLabItemPrice || cost > currentDrugLabItemPrice;

    const drugLabItem = new DrugLabItemEntity();
    drugLabItem.player = player;
    drugLabItem.itemId = item.id;
    drugLabItem.variant = item.variant;
    drugLabItem.equipped = equipNewItem;

    await drugLabItemRepo.save(drugLabItem);
    await playerRepo.decrement({ id: player.id }, currency, cost);
    await this.log.event(EVENT.PurchaseDrugLabItem, {
      variant: item.variant,
      itemId: item.id,
      cost,
      currency,
    });
    await this.metric.addMetric(player, `lab-item-purchase`, 1);
    await this.metric.addMetric(player, `lab-item-purchase-${currency}`, 1);
    await this.metric.addMetric(
      player,
      `lab-item-purchase-${currency}-cost`,
      cost
    );
  }

  getCapabilityFromItem(item: DrugLabItem): number {
    const number = /(\d+)/.exec(item.capability)[0];

    return parseInt(number);
  }

  @Transaction({ isolation: "READ COMMITTED" })
  async createLabBatch(
    player: Player,
    product: string,
    @TransactionRepository(DrugLabBatch)
    drugLabBatchRepo?: Repository<DrugLabBatch>
  ) {
    if (!(await this.minimumRequirementsMet(player))) {
      throw new Error("You need a lab and a hub to product batches.");
    }

    const unitsCount = await this.getPlayerBatchesUnitCount(player);
    const maximumUnits = await this.getPlayerMaximumUnits(player);

    const equippedLab = await this.getPlayerEquippedItemByVariant(
      player,
      DRUG_LAB_VARIANTS.lab
    );
    const equippedLabItem = DRUG_LAB_ITEMS.find(
      ({ id }) => id === equippedLab.itemId
    );
    let units = this.getCapabilityFromItem(equippedLabItem);
    if (unitsCount + units > maximumUnits) {
      if (unitsCount !== maximumUnits) {
        // Let's try a smaller amount
        units = maximumUnits - unitsCount;
      } else {
        throw new Error("You have reached maximum units capacity.");
      }
    }

    const {
      hardRestriction,
      hardRestrictionDelta,
    } = await this.game.getCustomsInfo(player, units);
    if (hardRestriction) {
      throw new Error(
        `You are trying to produce ${hardRestrictionDelta} units over your hard maximum.`
      );
    }

    const drugLabBatch = new DrugLabBatch();
    drugLabBatch.player = player;
    drugLabBatch.product = product;
    drugLabBatch.units = units;
    drugLabBatch.producing = false;

    await drugLabBatchRepo.save(drugLabBatch);

    await this.log.event(EVENT.QueueDrugLabBatch, {
      product,
      units,
      equippedLab: equippedLabItem.id,
    });
    await this.metric.addMetric(player, `lab-batch-queued`, 1);
    await this.metric.addMetric(player, `lab-batch-queued-${product}`, 1);
    await this.metric.addMetric(player, `lab-batch-units-queued`, units);
    await this.metric.addMetric(
      player,
      `lab-batch-units-queued-${product}`,
      units
    );
  }

  @Transaction({ isolation: "READ COMMITTED" })
  async getMarketPricing(
    player: Player,
    @TransactionRepository(DrugLabMarketPricing)
    drugLabMarketPricingRepository?: Repository<DrugLabMarketPricing>
  ): Promise<DrugLabMarketPricing[]> {
    return await drugLabMarketPricingRepository.find({
      where: {
        district: player.district,
        active: true,
      },
      relations: ["item"],
    });
  }

  async performMarketTrade(
    player: Player,
    operation: string,
    trades: object[]
  ): Promise<object> {
    if (!["buy", "sell"].includes(operation)) {
      await this.log.event(EVENT.LabMarketTrade, {
        trades,
        operation,
        success: false,
        message: `Unrecognized operation.`,
      });

      return {
        success: false,
        message: `Unrecognized operation.`,
      };
    }

    if (!Array.isArray(trades) || trades.length === 0) {
      await this.log.event(EVENT.LabMarketTrade, {
        trades,
        operation,
        success: false,
        message: `Invalid trade list.`,
      });

      return {
        success: false,
        message: `Invalid trade list.`,
      };
    }

    const marketPrice = await this.getMarketPricing(player);
    const prices = {};
    marketPrice.forEach((price) => {
      prices[price.item.itemCode] = price.price;
    });

    let totalPrice = 0;
    let totalQuantity = 0;
    // @ts-ignore
    for (const { name, quantity } of trades) {
      totalQuantity += quantity;
      totalPrice += prices[name] * quantity;
    }

    if (operation === "buy") {
      const {
        hardRestriction,
        hardRestrictionDelta,
      } = await this.game.getCustomsInfo(player, totalQuantity);

      if (hardRestriction) {
        await this.log.event(EVENT.LabMarketTrade, {
          trades,
          operation,
          totalPrice,
          totalQuantity,
          success: false,
          message: `You are trying to purchase ${hardRestrictionDelta} units too many.`,
        });

        return {
          success: false,
          message: `You are trying to purchase ${hardRestrictionDelta} units too many.`,
        };
      }

      if (player.cash < totalPrice) {
        await this.log.event(EVENT.LabMarketTrade, {
          trades,
          operation,
          totalPrice,
          totalQuantity,
          success: false,
          message: `You do not have enough cash to make that purchase.`,
        });

        return {
          success: false,
          message: `You do not have enough cash to make that purchase.`,
        };
      }

      await this.game.deductCash(player, totalPrice);

      // @ts-ignore
      for (const { name, quantity } of trades) {
        await this.game.awardItem(player, name, quantity);
      }

      const formattedQuantity = totalQuantity.toLocaleString();
      const formattedPrice = totalPrice.toLocaleString();

      await this.log.event(EVENT.LabMarketTrade, {
        trades,
        operation,
        totalPrice,
        totalQuantity,
        success: true,
        message: `You purchased ${formattedQuantity} units for $${formattedPrice}.`,
      });

      return {
        success: true,
        message: `You purchased ${formattedQuantity} units for $${formattedPrice}.`,
      };
    }

    if (operation === "sell") {
      const drugs = await this.game.getInventoryItemsByVariant(player, "drug");
      const drugsHeld = {};
      for (const drug of drugs) {
        drugsHeld[drug.item.itemCode] = drug.quantity;
      }

      // @ts-ignore
      for (const { name, quantity } of trades) {
        if (quantity > drugsHeld?.[name] || drugsHeld?.[name] === undefined) {
          console.log(
            `${player.id} tried to sell fake drugs ${name}:${quantity}:${drugsHeld?.[name]}`
          );

          await this.log.event(EVENT.LabMarketTrade, {
            trades,
            operation,
            totalPrice,
            totalQuantity,
            fakeTrigger: true,
            fakeTriggerName: name,
            fakeTriggerActualQuantity: drugsHeld?.[name],
            success: false,
            message: `You are trying to sell drugs you no longer possess.`,
          });

          return {
            success: false,
            message: `You are trying to sell drugs you no longer possess.`,
          };
        }
      }

      // @ts-ignore
      for (const { name, quantity } of trades) {
        await this.game.deductItem(player, name, quantity);
      }

      await this.game.awardCash(player, totalPrice);

      const formattedQuantity = totalQuantity.toLocaleString();
      const formattedPrice = totalPrice.toLocaleString();

      await this.log.event(EVENT.LabMarketTrade, {
        trades,
        operation,
        totalPrice,
        totalQuantity,
        success: false,
        message: `You sold ${formattedQuantity} units for $${formattedPrice}.`,
      });

      return {
        success: true,
        message: `You sold ${formattedQuantity} units for $${formattedPrice}.`,
      };
    }
  }
}
