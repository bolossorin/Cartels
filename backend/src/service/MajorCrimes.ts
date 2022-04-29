import { Repository, Transaction, TransactionRepository } from "typeorm";
import { Player } from "../entity/Player";
import { GameService } from "./Game";
import { MetricService } from "./Metric";
import { LogService } from "./Log";
import { MajorCrimeTarget } from "../entity/MajorCrimeTarget";
import { random } from "../utils/random";
import { MajorCrime } from "../entity/MajorCrime";

interface Constructor {
  Game: GameService;
  Metric: MetricService;
  Log: LogService;
}

export class MajorCrimesService {
  game: GameService;
  metric: MetricService;
  log: LogService;

  constructor({ Game, Metric, Log }: Constructor) {
    this.game = Game;
    this.metric = Metric;
    this.log = Log;
  }

  @Transaction({ isolation: "READ COMMITTED" })
  async getLocations(
    @TransactionRepository(MajorCrimeTarget)
    targetRepo?: Repository<MajorCrimeTarget>
  ): Promise<MajorCrimeTarget[]> {
    return await targetRepo.find();
  }

  @Transaction({ isolation: "READ COMMITTED" })
  async getMajorCrimes(
    viewer: Player,
    @TransactionRepository(MajorCrime)
    majorCrimeRepo?: Repository<MajorCrime>
  ): Promise<MajorCrime[]> {
    return await majorCrimeRepo.find({
      relations: ["target", "positions", "district"],
    });
  }

  @Transaction({ isolation: "READ COMMITTED" })
  async getRespect(
    target: MajorCrimeTarget,
    viewer: Player,

    @TransactionRepository(MajorCrimeTarget)
    targetRepo?: Repository<MajorCrimeTarget>
  ): Promise<object> {
    const currentRespect = random(0, 1000);
    const maxRespect = 1000;
    return { currentRespect, maxRespect };
  }
}
