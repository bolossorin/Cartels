import { Player } from "../entity/Player";
import { Repository, Transaction, TransactionRepository } from "typeorm";
import { BankAccount } from "../entity/BankAccount";
import { futureDate, LessThanOrEqualDate, MoreThanDate } from "../utils/dates";
import { gql, UserInputError } from "apollo-server-express";
import { Currency, GameService } from "./Game";
import { MetricService } from "./Metric";
import { JailService } from "./Jail";
import { EVENT, LogService } from "./Log";
import { MaxDate } from "class-validator";

const MAX_AMOUNT = 25000000;
const MIN_AMOUNT = 100;
const ACCOUNT_TYPES = ["savings", "investment"];
const RISK_LEVELS = ["mainstream", "risky", "uncharted"];
const ACCOUNT_HOURS = 23;
const ACCOUNT_DURATION = ACCOUNT_HOURS * 3600;

interface Constructor {
  Game: GameService;
  Metric: MetricService;
  Log: LogService;
}

export class BankService {
  game: GameService;
  metric: MetricService;
  log: LogService;

  constructor({ Game, Metric, Log }: Constructor) {
    this.game = Game;
    this.metric = Metric;
    this.log = Log;
  }

  @Transaction({ isolation: "READ COMMITTED" })
  async getAccounts(
    player: Player,
    @TransactionRepository(BankAccount)
    bankAccountRepo?: Repository<BankAccount>
  ): Promise<BankAccount[]> {
    return await bankAccountRepo.find({
      where: {
        player,
      },
    });
  }

  @Transaction({ isolation: "READ COMMITTED" })
  async getAccount(
    player: Player,
    accountType: string,
    @TransactionRepository(BankAccount)
    bankAccountRepo?: Repository<BankAccount>
  ): Promise<BankAccount | null> {
    const date = new Date();

    return await bankAccountRepo.findOne({
      where: {
        player,
        accountType,
      },
    });
  }

  @Transaction({ isolation: "READ COMMITTED" })
  async startAccount(
    player: Player,
    accountType: string,
    amount: number,
    riskiness: string,
    @TransactionRepository(BankAccount)
    bankAccountRepo?: Repository<BankAccount>,
    @TransactionRepository(Player) playerRepo?: Repository<Player>
  ): Promise<void> {
    if (player.cash < amount) {
      throw new UserInputError(
        "You don't have enough money to open this bank account"
      );
    }
    if (amount > MAX_AMOUNT) {
      throw new UserInputError("You cannot invest that much money");
    }
    if (amount < MIN_AMOUNT) {
      throw new UserInputError("You cannot invest that few money");
    }
    if (!ACCOUNT_TYPES.includes(accountType)) {
      throw new UserInputError("Invalid account type");
    }
    if (!RISK_LEVELS.includes(riskiness)) {
      throw new UserInputError("Invalid risk level");
    }
    const existingAccount = await this.getAccount(player, accountType);
    if (existingAccount && existingAccount.status !== "redeemed") {
      throw new UserInputError("You already have an account of that type");
    }

    const dateExpires = futureDate(ACCOUNT_DURATION);

    const bankAccount = new BankAccount();
    bankAccount.player = player;
    bankAccount.amount = amount;
    if (accountType === "investment") {
      bankAccount.riskiness = riskiness;
    }
    bankAccount.accountType = accountType;
    bankAccount.status = "in_progress";
    bankAccount.dateExpires = dateExpires;
    await playerRepo.decrement({ id: player.id }, "cash", amount);

    await bankAccountRepo.save(bankAccount);

    await this.log.event(EVENT.BankCreate, {
      accountType,
      riskiness,
      dateExpires,
      amount,
    });

    await Promise.all([
      this.metric.addMetric(player, `bank-amount-invested`, bankAccount.amount),
      this.metric.addMetric(
        player,
        `bank-amount-invested-riskiness-${bankAccount.riskiness}`,
        bankAccount.amount
      ),
      this.metric.addMetric(
        player,
        `bank-amount-invested-type-${bankAccount.accountType}`,
        bankAccount.amount
      ),
    ]);
  }

  @Transaction({ isolation: "READ COMMITTED" })
  async withdrawAccountEarly(
    player,
    id: string,
    @TransactionRepository(BankAccount)
    bankAccountRepo?: Repository<BankAccount>,
    @TransactionRepository(Player) playerRepo?: Repository<Player>
  ): Promise<object> {
    const withdrawnEarlyAccount = await bankAccountRepo.findOne({
      where: {
        player,
        id: id,
        dateExpires: MoreThanDate(futureDate(300)),
      },
    });

    if (!withdrawnEarlyAccount) {
      throw new UserInputError("There is no account to withdraw early");
    }

    withdrawnEarlyAccount.status = "redeemed";
    withdrawnEarlyAccount.result = Math.round(
      -0.01 * withdrawnEarlyAccount.amount
    );
    const returnedCash =
      withdrawnEarlyAccount.result + withdrawnEarlyAccount.amount;
    await this.game.awardCash(player, returnedCash);

    await bankAccountRepo.save(withdrawnEarlyAccount);

    await Promise.all([
      this.metric.addMetric(
        player,
        `bank-early-withdrawal-losses`,
        withdrawnEarlyAccount.result
      ),
      this.metric.addMetric(
        player,
        `bank-investment-results`,
        withdrawnEarlyAccount.result
      ),
      this.metric.addMetric(
        player,
        `bank-investment-results-riskiness-${withdrawnEarlyAccount.riskiness}`,
        withdrawnEarlyAccount.result
      ),
      this.metric.addMetric(
        player,
        `bank-investment-results-type-${withdrawnEarlyAccount.accountType}`,
        withdrawnEarlyAccount.result
      ),
    ]);

    await this.log.event(EVENT.BankWithdrawEarly, {
      accountType: withdrawnEarlyAccount.accountType,
      riskiness: withdrawnEarlyAccount.riskiness,
      result: withdrawnEarlyAccount.result,
      amount: withdrawnEarlyAccount.amount,
    });

    return {
      message: `You withdrew your account early, at a loss of 1%. You were credited $${returnedCash.toLocaleString()}`,
      player,
      status: "success",
    };
  }

  @Transaction({ isolation: "READ COMMITTED" })
  async cashOutAccount(
    player,
    id: string,
    @TransactionRepository(BankAccount)
    bankAccountRepo?: Repository<BankAccount>,
    @TransactionRepository(Player) playerRepo?: Repository<Player>
  ): Promise<object> {
    const accountToCashOut = await bankAccountRepo.findOne({
      where: {
        player,
        id: id,
        status: "completed",
      },
    });

    if (!accountToCashOut) {
      throw new UserInputError("There is no account to cash out");
    }

    accountToCashOut.status = "redeemed";

    const returnedCash = accountToCashOut.result + accountToCashOut.amount;
    await this.game.awardCash(player, returnedCash);

    await bankAccountRepo.save(accountToCashOut);

    await this.log.event(EVENT.BankCashOut, {
      accountType: accountToCashOut.accountType,
      riskiness: accountToCashOut.riskiness,
      result: accountToCashOut.result,
      amount: accountToCashOut.amount,
    });

    await Promise.all([
      this.metric.addMetric(
        player,
        `bank-investment-results`,
        accountToCashOut.result
      ),
      this.metric.addMetric(
        player,
        `bank-investment-results-riskiness-${accountToCashOut.riskiness}`,
        accountToCashOut.result
      ),
      this.metric.addMetric(
        player,
        `bank-investment-results-type-${accountToCashOut.accountType}`,
        accountToCashOut.result
      ),
    ]);

    return {
      message: `You cashed out your ${accountToCashOut.accountType}, at a ${
        accountToCashOut.result > 0 ? "profit" : "loss"
      } of ${Math.abs(
        Math.round(
          (accountToCashOut.result / accountToCashOut.amount) * 10000
        ) / 100
      ).toLocaleString()}%. You were credited $${returnedCash.toLocaleString()}`,
      player,
      status: "success",
    };
  }

  @Transaction({ isolation: "READ COMMITTED" })
  async rollOverAccount(
    player,
    id: string,
    @TransactionRepository(BankAccount)
    bankAccountRepo?: Repository<BankAccount>,
    @TransactionRepository(Player) playerRepo?: Repository<Player>
  ): Promise<object> {
    const accountToCashOut = await bankAccountRepo.findOne({
      where: {
        player,
        id: id,
        status: "completed",
      },
    });

    if (!accountToCashOut) {
      throw new UserInputError("There is no account to rollover");
    }

    accountToCashOut.status = "redeemed";

    const totalResult = accountToCashOut.result + accountToCashOut.amount;
    const returnedCash =
      totalResult > MAX_AMOUNT ? totalResult - MAX_AMOUNT : 0;
    const newAmount = totalResult > MAX_AMOUNT ? MAX_AMOUNT : totalResult;

    await this.game.awardCash(player, returnedCash);

    await bankAccountRepo.save(accountToCashOut);

    const bankAccount = new BankAccount();
    bankAccount.player = player;
    bankAccount.amount = newAmount;
    if (accountToCashOut.accountType === "investment") {
      bankAccount.riskiness = accountToCashOut.riskiness;
    }
    bankAccount.accountType = accountToCashOut.accountType;
    bankAccount.status = "in_progress";
    bankAccount.dateExpires = futureDate(ACCOUNT_DURATION);

    await bankAccountRepo.save(bankAccount);

    await this.log.event(EVENT.BankRollOver, {
      accountType: accountToCashOut.accountType,
      riskiness: accountToCashOut.riskiness,
      result: accountToCashOut.result,
      amount: accountToCashOut.amount,
      newDateExpires: bankAccount.dateExpires,
      newAmount,
      overflowReturnedCash: returnedCash,
    });

    await Promise.all([
      this.metric.addMetric(
        player,
        `bank-investment-results`,
        accountToCashOut.result
      ),
      this.metric.addMetric(
        player,
        `bank-investment-results-riskiness-${accountToCashOut.riskiness}`,
        accountToCashOut.result
      ),
      this.metric.addMetric(
        player,
        `bank-investment-results-type-${accountToCashOut.accountType}`,
        accountToCashOut.result
      ),
      this.metric.addMetric(player, `bank-amount-invested`, bankAccount.amount),
      this.metric.addMetric(
        player,
        `bank-amount-invested-riskiness-${bankAccount.riskiness}`,
        bankAccount.amount
      ),
      this.metric.addMetric(
        player,
        `bank-amount-invested-type-${bankAccount.accountType}`,
        bankAccount.amount
      ),
    ]);

    return {
      message: `You cashed out your ${accountToCashOut.accountType}, at a ${
        accountToCashOut.result > 0 ? "profit" : "loss"
      } of ${Math.abs(
        Math.round(
          (accountToCashOut.result / accountToCashOut.amount) * 10000
        ) / 100
      ).toLocaleString()}%. You rolled over and reinvested $${newAmount.toLocaleString()}. ${
        returnedCash > 0
          ? `$${returnedCash.toLocaleString()} were cashed out.`
          : ""
      }`,
      player,
      status: "success",
    };
  }
}
