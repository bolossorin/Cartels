import { Account } from "../entity/Account";
import CacheService from "./Cache";
import { GameService } from "./Game";
import { MetricService } from "./Metric";
import { UserInputError } from "apollo-server-express";
import { Property } from "../entity/Property";
import {
  EntityManager,
  Repository,
  Transaction,
  TransactionManager,
  TransactionRepository,
} from "typeorm";
import { Player } from "../entity/Player";
import { District } from "../entity/District";
import { random } from "../utils/random";
import { Bet } from "../entity/Bet";
import { RaceTrackSheet } from "../entity/RaceTrackSheet";
import { RaceTrackHorse } from "../entity/RaceTrackHorse";

interface HorseStack {
  horseId: string;
  odds: string;
  bet?: string;
}

const HOUSE_EDGE_PERCENT = 2.7;

export class RaceTrackService {
  game: GameService;
  cache: CacheService;
  metric: MetricService;

  constructor({ Cache, Game, Metric }) {
    this.cache = Cache;
    this.game = Game;
    this.metric = Metric;
  }

  async getCasino(
    txManager: EntityManager,
    district: District
  ): Promise<Property> {
    const casino: Property = await txManager.getRepository(Property).findOne({
      where: {
        district,
        propertyType: "track",
      },
      relations: ["district"],
    });
    if (!casino) {
      throw new UserInputError("No casino found in this district");
    }

    if (["LOCKED", "UNOWNED"].includes(casino.currentState)) {
      throw new UserInputError("This casino cannot be played");
    }

    return casino;
  }

  @Transaction({ isolation: "READ COMMITTED" })
  async getSheet(
    district: District,
    @TransactionRepository(RaceTrackSheet)
    sheetRepo?: Repository<RaceTrackSheet>
  ): Promise<RaceTrackSheet> {
    return sheetRepo.findOneOrFail({ district });
  }

  @Transaction({ isolation: "READ COMMITTED" })
  async getHorses(
    @TransactionRepository(RaceTrackHorse)
    horseRepository?: Repository<RaceTrackHorse>
  ): Promise<RaceTrackHorse[]> {
    return horseRepository.find();
  }

  validOdds(odds: string): boolean {
    const oddsInt = parseInt(odds);

    return Number.isInteger(oddsInt) && oddsInt >= 11 && oddsInt <= 1990;
  }

  executeFromOdds(odds: string): boolean {
    const startRandom = 1;
    const endRandom = 1_000_000_000;
    const result = random(startRandom, endRandom);

    const fracOdds = 1000 / parseInt(odds);
    const maximumRandomForWin = Math.floor((fracOdds * endRandom) / 100);

    return result <= maximumRandomForWin;
  }

  @Transaction({ isolation: "READ COMMITTED" })
  async performBet(
    stacks: HorseStack[],
    player: Player,
    @TransactionManager() manager?: EntityManager
  ) {
    if (stacks?.length !== 8) {
      throw new UserInputError("You must place at least one bet");
    }
    if (stacks?.filter((s) => s.bet !== undefined)?.length !== 1) {
      throw new UserInputError(`You must place exactly one bet`);
    }
    if (stacks?.filter((s) => this.validOdds(s.odds))?.length !== 8) {
      throw new UserInputError(`One or more of your selections are not valid`);
    }

    const bet: HorseStack = stacks.filter((s) => s.bet !== undefined)[0];
    const totalBet = parseInt(bet.bet);

    const isDeniedByHouseEdge = random(1, 1000) <= HOUSE_EDGE_PERCENT * 10;
    const isWinner = this.executeFromOdds(bet.odds);
    const isAdjustedWinner = isWinner && !isDeniedByHouseEdge;

    const potentialWinning = Math.floor(
      totalBet * (parseInt(bet.odds) / 10) - totalBet
    );

    const casino = await this.getCasino(manager, player.district);
    const self = await manager.getRepository(Player).findOne(player.id);
    let owner: Player | undefined;
    if (casino.currentState !== "STATE_OWNED") {
      owner = await manager.getRepository(Player).findOne(casino.playerId);
    }
    if (totalBet < 100) {
      throw new UserInputError("You must bet at least $100 at this casino.");
    }
    if (self.cash < totalBet) {
      throw new UserInputError("You cannot afford to make that bet.");
    }
    if (totalBet > parseInt(casino.metadata?.maximum ?? 0)) {
      throw new UserInputError("That exceeds the maximum bet of the casino.");
    }

    const betAdjustment = isAdjustedWinner ? potentialWinning : totalBet * -1;
    await manager
      .createQueryBuilder()
      .update(Player)
      .set({ cash: () => `cash + ${betAdjustment}` })
      .where({ id: player.id })
      .execute();
    if (casino.currentState !== "STATE_OWNED") {
      await manager
        .createQueryBuilder()
        .update(Player)
        .set({ cash: () => `cash - ${betAdjustment}` })
        .where({ id: owner.id })
        .execute();
    }

    const betRecord = new Bet();
    betRecord.player = self;
    betRecord.amount = `${totalBet}`;
    betRecord.payout = `${betAdjustment}`;
    betRecord.propertyType = "track";
    betRecord.metadata = {
      casino: {
        id: casino.id,
        ownerId: owner?.id,
        ownerCashBefore: owner?.cash,
        state: casino.currentState,
        districtId: casino.district.id,
      },
      self: {
        cashBefore: self.cash,
      },
      totalBet,
      betAdjustment,
      casinoMeta: {
        isWinner,
        isDeniedByHouseEdge,
        stacks,
      },
    };
    await manager.save(betRecord);

    await Promise.all([
      this.metric.addMetric(player, `casino-bets`, 1),
      this.metric.addMetric(player, `casino-wagered`, totalBet),
      this.metric.addMetric(player, `casino-lost`, betAdjustment),
      this.metric.addMetric(player, `casino-track-bets`, 1),
      this.metric.addMetric(player, `casino-track-wagered`, totalBet),
      this.metric.addMetric(player, `casino-track-lost`, betAdjustment),
    ]);

    if (casino.currentState !== "STATE_OWNED") {
      await Promise.all([
        this.metric.addMetric(owner, `casino-owner-bets`, 1),
        this.metric.addMetric(owner, `casino-owner-wagered`, totalBet),
        this.metric.addMetric(owner, `casino-owner-lost`, betAdjustment),
        this.metric.addMetric(owner, `casino-owner-track-bets`, 1),
        this.metric.addMetric(owner, `casino-owner-track-wagered`, totalBet),
        this.metric.addMetric(owner, `casino-owner-track-lost`, betAdjustment),
      ]);
    }

    casino.metadata.bets = (casino.metadata?.bets ?? 0) + 1;
    casino.metadata.wagered = (casino.metadata?.wagered ?? 0) + totalBet;
    casino.metadata.profit = (casino.metadata?.profit ?? 0) - betAdjustment;
    await manager.save(casino);

    await this.updatePreviousResults(player, bet, isAdjustedWinner);

    return this.generateResponse(
      casino,
      stacks,
      bet,
      betAdjustment,
      isAdjustedWinner
    );
  }

  generateResponse(
    property: Property,
    stacks: HorseStack[],
    bet: HorseStack,
    betAdjustment: number,
    isWinner: boolean
  ): Record<string, any> {
    const nodes = [];
    let displayType: string = "profit";
    if (isWinner) {
      nodes.push(
        {
          id: "text-start",
          nodeType: "text",
          nodeData: [`You bet on `],
        },
        {
          id: "horse-bet",
          nodeType: "horse",
          nodeData: [bet.horseId],
        },
        {
          id: "text-mid",
          nodeType: "text",
          nodeData: [` and won `],
        },
        {
          id: "bet",
          nodeType: "currency",
          nodeData: [`cash`, `${parseInt(bet.bet) + betAdjustment}`],
        },
        {
          id: "dot",
          nodeType: "text",
          nodeData: [`.`],
        }
      );
    } else {
      const otherHorses = stacks.filter((s) => s.bet === undefined);
      let winningHorse = otherHorses[random(0, otherHorses.length - 1)];
      for (const horse of otherHorses) {
        const isWin = this.executeFromOdds(horse.odds);
        if (isWin) {
          winningHorse = horse;
        }
      }

      displayType = "loss";
      nodes.push(
        {
          id: "text-start",
          nodeType: "text",
          nodeData: [`You bet on `],
        },
        {
          id: "horse-bet",
          nodeType: "horse",
          nodeData: [bet.horseId],
        },
        {
          id: "text-mid",
          nodeType: "text",
          nodeData: [` but `],
        },
        {
          id: "horse-won",
          nodeType: "horse",
          nodeData: [winningHorse.horseId],
        },
        {
          id: "dot",
          nodeType: "text",
          nodeData: [`won.`],
        }
      );
    }

    return {
      propertyId: property.id,
      result: {
        landedHorse: bet.horseId,
        banner: {
          nodes,
          displayType,
        },
      },
    };
  }

  async updatePreviousResults(
    player: Player,
    horse: HorseStack,
    isWin: boolean
  ) {
    await this.metric.cache.lpush(
      `track-landed-position:${player.id}:${player.districtId}`,
      { horse, isWin }
    );
    await this.metric.cache.ltrim(
      `track-landed-position:${player.id}:${player.districtId}`,
      0,
      7
    );
  }
}
