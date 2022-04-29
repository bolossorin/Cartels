import { Account } from "../entity/Account";
import CacheService from "./Cache";
import { GameService } from "./Game";
import { MetricService } from "./Metric";
import { UserInputError } from "apollo-server-express";
import { Property } from "../entity/Property";
import { EntityManager, Transaction, TransactionManager } from "typeorm";
import { Player } from "../entity/Player";
import { District } from "../entity/District";
import { random } from "../utils/random";
import { Bet } from "../entity/Bet";

const reds = [
  1,
  3,
  5,
  7,
  9,
  12,
  14,
  16,
  18,
  19,
  21,
  23,
  25,
  27,
  30,
  32,
  34,
  36,
];
const blacks = [
  2,
  4,
  6,
  8,
  10,
  11,
  13,
  15,
  17,
  20,
  22,
  24,
  26,
  28,
  29,
  31,
  33,
  35,
];

interface BoardStack {
  positionId: string;
  chips: Array<string>;
}

interface BetExecutorResult {
  win: boolean;
  payout: number;
  profit: number;
}
type BetExecutor = (result: number) => BetExecutorResult;

const VALID_CHIPS = {
  10: 10,
  100: 100,
  "1k": 1000,
  "5k": 5000,
  "10k": 10000,
  "100k": 100000,
  "500k": 500000,
  "1m": 1000000,
  "10m": 10000000,
  "100m": 100000000,
};
const VALID_CHIPS_PER_POSITION = 15;
const VALID_STACK_COUNT = 52;

const REGEX_SINGLE_NUMBER = /^n([0-9]|1[0-9]|2[0-9]|3[0-6])$/;
const REGEX_SPLIT = /^split([0-9]|1[0-9]|2[0-9]|3[0-6])-([0-9]|1[0-9]|2[0-9]|3[0-6])$/;
const REGEX_STREET = /^street(3-1|6-4|9-7|12-10|15-13|18-16|21-19|24-22|27-25|30-28|33-31|36-34)$/;
const REGEX_COLOR = /^(red|black)$/;
const REGEX_ODD_EVEN = /^(odd|even)$/;
const REGEX_COLUMN = /^(col1|col2|col3)$/;
const REGEX_HIGH_LOW = /^(1-18|19-36)$/;
const REGEX_CORNER = /^corner([0-9]|1[0-9]|2[0-9]|3[0-6])-([0-9]|1[0-9]|2[0-9]|3[0-6])-([0-9]|1[0-9]|2[0-9]|3[0-6])-([0-9]|1[0-9]|2[0-9]|3[0-6])$/;

function processChips(chips: BoardStack["chips"]): number {
  if (
    !chips ||
    !Array.isArray(chips) ||
    chips.length > VALID_CHIPS_PER_POSITION
  ) {
    throw new UserInputError("Invalid chip selection.");
  }

  let positionBet = 0;
  for (const chip of chips) {
    if (!VALID_CHIPS?.[chip]) {
      throw new UserInputError("Invalid chip selection.");
    }

    positionBet += VALID_CHIPS?.[chip];
  }

  if (positionBet < 10) {
    throw new UserInputError("The minimum bet for this table is $10.");
  }

  return positionBet;
}

interface PrimedBetExecutor {
  executor: BetExecutor;
  positionBet: number;
}

function createBetExecutor(
  betPosition: BoardStack["positionId"],
  chips: BoardStack["chips"]
): PrimedBetExecutor {
  const singleNumber = betPosition.match(REGEX_SINGLE_NUMBER);
  const split = betPosition.match(REGEX_SPLIT);
  const street = betPosition.match(REGEX_STREET);
  const color = betPosition.match(REGEX_COLOR);
  const oddEven = betPosition.match(REGEX_ODD_EVEN);
  const column = betPosition.match(REGEX_COLUMN);
  const highLow = betPosition.match(REGEX_HIGH_LOW);
  const corner = betPosition.match(REGEX_CORNER);

  if (
    !singleNumber &&
    !split &&
    !street &&
    !color &&
    !oddEven &&
    !column &&
    !highLow &&
    !corner
  ) {
    throw new UserInputError("Invalid bet position.");
  }

  const positionBet = processChips(chips);

  let executor;
  if (singleNumber) {
    const selected = parseInt(singleNumber[1]);

    executor = (result: number) => {
      const win = selected === result;
      const payout = win ? positionBet * 36 : 0;

      return {
        win,
        payout,
        profit: payout - positionBet,
      };
    };
  }

  if (split) {
    const selected = [parseInt(split[1]), parseInt(split[2])];

    executor = (result: number) => {
      const win = selected.includes(result);
      const payout = win ? positionBet * 18 : 0;

      return {
        win,
        payout,
        profit: payout - positionBet,
      };
    };
  }

  if (street) {
    const splitNumbers = street[1].split("-");
    const bottom = parseInt(splitNumbers[0]);
    const selected = [bottom, bottom - 1, bottom - 2];

    executor = (result: number) => {
      const win = selected.includes(result);
      const payout = win ? positionBet * 12 : 0;

      return {
        win,
        payout,
        profit: payout - positionBet,
      };
    };
  }

  if (color) {
    const selectedColor = color[1];
    const selected = selectedColor === "red" ? reds : blacks;

    executor = (result: number) => {
      const win = selected.includes(result);
      const payout = win ? positionBet * 2 : 0;

      return {
        win,
        payout,
        profit: payout - positionBet,
      };
    };
  }

  if (oddEven) {
    const selectedDivision = oddEven[1];

    executor = (result: number) => {
      const isOdd = result !== 0 && Math.abs(result % 2) === 1;
      const isEven = result !== 0 && !isOdd;
      const win = selectedDivision === "odd" ? isOdd : isEven;
      const payout = win ? positionBet * 2 : 0;

      return {
        win,
        payout,
        profit: payout - positionBet,
      };
    };
  }

  if (column) {
    const selectedCol = column[1];
    console.log({ selectedCol });

    executor = (result: number) => {
      const is1stCol = result >= 1 && result <= 12;
      const is2ndCol = result >= 13 && result <= 24;
      const is3rdCol = result >= 25 && result <= 36;

      let win = false;
      if (selectedCol === "col1" && is1stCol) {
        win = true;
      }
      if (selectedCol === "col2" && is2ndCol) {
        win = true;
      }
      if (selectedCol === "col3" && is3rdCol) {
        win = true;
      }
      const payout = win ? positionBet * 3 : 0;

      return {
        win,
        payout,
        profit: payout - positionBet,
      };
    };
  }

  if (highLow) {
    const selectedDivision = highLow[1];

    executor = (result: number) => {
      const isLow = result >= 1 && result <= 18;
      const isHigh = result >= 19 && result <= 36;
      const win = selectedDivision === "1-18" ? isLow : isHigh;
      const payout = win ? positionBet * 2 : 0;

      return {
        win,
        payout,
        profit: payout - positionBet,
      };
    };
  }

  if (corner) {
    const selected = [
      parseInt(corner[1]),
      parseInt(corner[2]),
      parseInt(corner[3]),
      parseInt(corner[4]),
    ];

    executor = (result: number) => {
      const win = selected.includes(result);
      const payout = win ? positionBet * 8 : 0;

      return {
        win,
        payout,
        profit: payout - positionBet,
      };
    };
  }

  return {
    executor,
    positionBet,
  };
}

interface ResponseNode {
  id: string;
  nodeType: string;
  nodeData: string[];
}

export class RouletteService {
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
        propertyType: "roulette",
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
  async performBet(
    stacks: BoardStack[],
    player: Player,
    @TransactionManager() manager?: EntityManager
  ) {
    if (stacks.length === 0) {
      throw new UserInputError("You must place at least one bet");
    }
    if (stacks.length > VALID_STACK_COUNT) {
      throw new UserInputError(
        `You cannot place bets on more than ${VALID_STACK_COUNT} positions`
      );
    }

    const bets: PrimedBetExecutor[] = [];
    for (const stack of stacks) {
      bets.push(createBetExecutor(stack.positionId, stack.chips));
    }
    const totalBet = bets
      .map((bet) => bet.positionBet)
      .reduce((a: number, b: number) => a + b, 0);

    const casino = await this.getCasino(manager, player.district);
    const self = await manager.getRepository(Player).findOne(player.id);
    let owner: Player | undefined;
    if (casino.currentState !== "STATE_OWNED") {
      owner = await manager.getRepository(Player).findOne(casino.playerId);
    }
    if (self.cash < totalBet) {
      throw new UserInputError("You cannot afford to make that bet.");
    }
    if (totalBet > parseInt(casino.metadata?.maximum ?? 0)) {
      throw new UserInputError("That exceeds the maximum bet of the table.");
    }

    const landedNumber = random(0, 36);
    const results = [];
    let totalProfit = 0;
    for (const bet of bets) {
      const betResult = bet.executor(landedNumber);
      results.push(betResult);
      totalProfit += betResult.profit;
    }

    const betAdjustment = totalBet - totalProfit;
    await manager
      .createQueryBuilder()
      .update(Player)
      .set({ cash: () => `cash + ${totalProfit}` })
      .where({ id: player.id })
      .execute();
    if (casino.currentState !== "STATE_OWNED") {
      await manager
        .createQueryBuilder()
        .update(Player)
        .set({ cash: () => `cash - ${totalProfit}` })
        .where({ id: owner.id })
        .execute();
    }

    const betRecord = new Bet();
    betRecord.player = self;
    betRecord.amount = `${totalBet}`;
    betRecord.payout = `${totalProfit}`;
    betRecord.propertyType = "roulette";
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
      totalProfit,
      betAdjustment,
      casinoMeta: {
        results,
        landedNumber,
        stacks,
      },
    };
    await manager.save(betRecord);

    await Promise.all([
      this.metric.addMetric(player, `casino-bets`, 1),
      this.metric.addMetric(player, `casino-wagered`, totalBet),
      this.metric.addMetric(player, `casino-lost`, betAdjustment),
      this.metric.addMetric(player, `casino-roulette-bets`, 1),
      this.metric.addMetric(player, `casino-roulette-wagered`, totalBet),
      this.metric.addMetric(player, `casino-roulette-lost`, betAdjustment),
    ]);

    if (casino.currentState !== "STATE_OWNED") {
      await Promise.all([
        this.metric.addMetric(owner, `casino-owner-bets`, 1),
        this.metric.addMetric(owner, `casino-owner-wagered`, totalBet),
        this.metric.addMetric(owner, `casino-owner-lost`, betAdjustment),
        this.metric.addMetric(owner, `casino-owner-roulette-bets`, 1),
        this.metric.addMetric(owner, `casino-owner-roulette-wagered`, totalBet),
        this.metric.addMetric(
          owner,
          `casino-owner-roulette-lost`,
          betAdjustment
        ),
      ]);
    }

    casino.metadata.bets = (casino.metadata?.bets ?? 0) + 1;
    casino.metadata.wagered = (casino.metadata?.wagered ?? 0) + totalBet;
    casino.metadata.profit = (casino.metadata?.profit ?? 0) - totalProfit;
    await manager.save(casino);

    await this.updatePreviousResults(player, landedNumber);

    return this.generateResponse(landedNumber, totalBet, totalProfit, casino);
  }

  async updatePreviousResults(player: Player, landedPosition: number) {
    await this.metric.cache.lpush(
      `roulette-landed-position:${player.id}:${player.districtId}`,
      landedPosition
    );
    await this.metric.cache.ltrim(
      `roulette-landed-position:${player.id}:${player.districtId}`,
      0,
      7
    );
  }

  generateResponse(
    landedPosition: number,
    totalBet: number,
    totalProfit: number,
    property: Property
  ): Record<string, any> {
    const nodes: Array<ResponseNode> = [];
    let operativeWord: string = "won";
    let displayType: string = "profit";
    let resultCash: number = Math.abs(totalProfit);
    if (totalProfit === 0) {
      resultCash = totalBet;
      displayType = "neutral";
    }
    if (totalProfit < 0) {
      operativeWord = "lost";
      displayType = "loss";
    }

    nodes.push(
      {
        id: "text-start",
        nodeType: "text",
        nodeData: [`You bet `],
      },
      {
        id: "bet",
        nodeType: "currency",
        nodeData: [`cash`, `${totalBet}`],
      },
      {
        id: "text-mid",
        nodeType: "text",
        nodeData: [` and ${operativeWord} `],
      },
      {
        id: "bet-result",
        nodeType: "currency",
        nodeData: [`cash`, `${resultCash}`],
      },
      {
        id: "dot",
        nodeType: "text",
        nodeData: [`.`],
      }
    );

    return {
      propertyId: property.id,
      result: {
        landedPosition,
        banner: {
          nodes,
          displayType,
        },
      },
    };
  }
}
