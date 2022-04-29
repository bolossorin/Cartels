import { Property } from "../entity/Property";
import { Repository, Transaction, TransactionRepository } from "typeorm";
import { District } from "../entity/District";
import { GameService } from "./Game";
import { MetricService } from "./Metric";
import { Player } from "../entity/Player";
import { UserInputError } from "apollo-server-express";
import { EVENT, LogService } from "./Log";

interface Constructor {
  Game: GameService;
  Metric: MetricService;
  Log: LogService;
}

export class EventService {
  game: GameService;
  metric: MetricService;
  log: LogService;

  constructor({ Game, Metric, Log }: Constructor) {
    this.game = Game;
    this.metric = Metric;
    this.log = Log;
  }

  @Transaction({ isolation: "READ COMMITTED" })
  async easterTradeEggsForGold(
    player: Player,
    @TransactionRepository(Property)
    propertiesRepository?: Repository<Property>
  ): Promise<void> {
    const circulation = [1, 2, 3, 4, 5, 6];
    const quantities = [];

    const eggIds = {
      1: "6b3d762a-80a3-4cb8-a567-3059aa0d227d",
      2: "af1f78c4-396b-4213-b558-2d33c4ba84e5",
      3: "d95b2ef4-8b05-4c1d-8ee6-7b2a6a9e76c8",
      4: "66968072-611b-4859-af72-a3a944bb2430",
      5: "1f7f2e3a-e7c0-4c0f-a746-6ab83dfed4d7",
      6: "5533770f-4fe3-4e72-b7c3-3545edd1b2d1",
    };

    for (const ord of circulation) {
      const inventoryItem = await this.game.getInventoryItemByItemId(
        player,
        eggIds[ord]
      );
      let quantity = 0;
      if (inventoryItem) {
        quantity = inventoryItem.quantity;
      }

      quantities.push(quantity);
    }
    if (quantities.some((qty) => qty <= 0)) {
      throw new UserInputError(
        "You do not have enough eggs to trade into a Golden Egg."
      );
    }

    for (const ord of circulation) {
      await this.game.deductItem(player, `egg${ord}`, 1);
    }
    await this.game.awardItem(player, `goldEgg`, 1);

    await this.log.event(EVENT.EventEasterUseCombinator, {
      quantities,
    });
    await Promise.all([
      await this.metric.addMetric(player, `event-easter-ec-eggs-used`, 6),
      await this.metric.addMetric(player, `event-easter-ec-golden-eggs`, 1),
    ]);
  }
}
