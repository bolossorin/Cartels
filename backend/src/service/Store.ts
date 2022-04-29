import { GameService } from "./Game";
import { MetricService } from "./Metric";
import { EVENT, LogService } from "./Log";
import { StoreItem } from "../entity/StoreItem";
import { Repository, Transaction, TransactionRepository } from "typeorm";
import { Player } from "../entity/Player";

interface Constructor {
  Game: GameService;
  Metric: MetricService;
  Log: LogService;
}

const sortByGoldAmount = (a: StoreItem, b: StoreItem) =>
  (a.goldAmount ?? 0) - (b.goldAmount ?? 0);

export class StoreService {
  game: GameService;
  metric: MetricService;
  log: LogService;

  constructor({ Game, Metric, Log }: Constructor) {
    this.game = Game;
    this.metric = Metric;
    this.log = Log;
  }

  @Transaction({ isolation: "READ COMMITTED" })
  async getGoldItems(
    @TransactionRepository(StoreItem)
    storeItemRepository?: Repository<StoreItem>
  ): Promise<StoreItem[]> {
    const storeItems = await storeItemRepository.find();

    return storeItems.sort(sortByGoldAmount);
  }
}
