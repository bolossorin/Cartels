import { GameService } from "./Game";
import { MetricService } from "./Metric";
import { JailService } from "./Jail";
import { EVENT, LogService } from "./Log";
import { Item } from "../entity/Item";
import { Repository, Transaction, TransactionRepository } from "typeorm";
import { Player } from "../entity/Player";

interface Constructor {
  Game: GameService;
  Metric: MetricService;
  Jail: JailService;
  Log: LogService;
}

const sortByMarketPrice = (a: Item, b: Item) =>
  ((a.metadata as any)?.marketPrice ?? 0) -
  ((b.metadata as any)?.marketPrice ?? 0);

export class MarketService {
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

  @Transaction({ isolation: "READ COMMITTED" })
  async purchaseItem(
    player: Player,
    id: string,
    variant: string,
    @TransactionRepository(Item) itemRepository?: Repository<Item>
  ) {
    const outcome = this.outcome({
      itemId: id,
      beforeCash: player.cash,
      variant: variant,
    });

    if (!["weapon", "protection"].includes(variant)) {
      return await outcome({
        outcome: "error",
        outcomeMessage: "You cannot purchase that kind of item.",
        closePurchasePrompt: false,
      });
    }

    const item = await this.game.getItem(id);
    const itemCost = item.metadata?.marketPrice;
    const isPurchasable = !!itemCost;
    if (!isPurchasable) {
      return await outcome({
        outcome: "error",
        outcomeMessage: "You cannot purchase that item right now.",
        closePurchasePrompt: false,
      });
    }

    const hasItem = await this.game.getInventoryItemByItemId(player, id);
    if (hasItem) {
      return await outcome({
        outcome: "error",
        outcomeMessage: "You already have this item.",
        closePurchasePrompt: false,
      });
    }
    if (player.cash < itemCost) {
      return await outcome({
        outcome: "error",
        outcomeMessage: "You do not have enough cash to buy that item.",
        closePurchasePrompt: false,
      });
    }

    await this.game.deductCash(player, itemCost);
    await this.game.awardItem(player, item.itemCode, 1);

    return await outcome({
      outcome: "success",
      outcomeMessage: `Your new ${item.name} was purchased and delivered to your inventory.`,
      closePurchasePrompt: true,
    });
  }

  outcome(meta: Record<string, any>) {
    return async (
      outcome: Record<string, any>
    ): Promise<Record<string, any>> => {
      await this.log.event(EVENT.PurchaseMarketItem, {
        ...meta,
        outcome,
      });

      return outcome;
    };
  }

  @Transaction({ isolation: "READ COMMITTED" })
  async getWeapons(
    @TransactionRepository(Item) itemRepository?: Repository<Item>
  ): Promise<Item[]> {
    const weapons = await this.game.getItemsByVariant("weapon");

    return weapons.sort(sortByMarketPrice);
  }

  @Transaction({ isolation: "READ COMMITTED" })
  async getProtection(
    @TransactionRepository(Item) itemRepository?: Repository<Item>
  ): Promise<Item[]> {
    const protection = await this.game.getItemsByVariant("protection");

    return protection.sort(sortByMarketPrice);
  }

  @Transaction({ isolation: "READ COMMITTED" })
  async getEquipment(
    @TransactionRepository(Item) itemRepository?: Repository<Item>
  ): Promise<Item[]> {
    const equipment = await this.game.getItemsByVariant("equipment");

    return equipment.sort(sortByMarketPrice);
  }

  @Transaction({ isolation: "READ COMMITTED" })
  async getSkins(
    @TransactionRepository(Item) itemRepository?: Repository<Item>
  ): Promise<Item[]> {
    const skins = await this.game.getItemsByVariant("skin");

    return skins.sort(sortByMarketPrice);
  }
}
