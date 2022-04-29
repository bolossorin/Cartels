import {
  EntityManager,
  Repository,
  Transaction,
  TransactionManager,
  TransactionRepository,
} from "typeorm";
import { Account } from "../entity/Account";
import CacheService from "./Cache";
import { Player } from "../entity/Player";
import { Promotions } from "../entity/Promotions";
import { GameService } from "./Game";
import { MetricService } from "./Metric";
import { playerName } from "../utils/validation";
import { gaussianRandom, randomFunctionFromOddsPool } from "../utils/random";
import { roundToInt } from "../utils/round";
import { UserInputError } from "apollo-server-express";
import { beforeNow, diffFromNow, formatDate, futureDate } from "../utils/dates";
import { EVENT, LogService } from "./Log";

const PLAYER_STARTING_CASH = 10000;

interface IPlayerConstructor {
  Game: GameService;
  Cache: CacheService;
  account: Account;
  Metric: MetricService;
  Log: LogService;
}
interface IPlayerCreation {
  name: string;
  character: string;
  rank: string;
  district: string;
}

export enum FieldLevel {
  OPEN,
  PRIVILEGED,
  SECRET,
}

export class PlayerService {
  game: GameService;
  cache: CacheService;
  account: Account;
  metric: MetricService;
  log: LogService;

  constructor({ Cache, Game, account, Metric, Log }: IPlayerConstructor) {
    this.cache = Cache;
    this.game = Game;
    this.account = account;
    this.metric = Metric;
    this.log = Log;
  }

  tieredRewardMultiplier(tier) {
    //to be multiplied with the target amount * 1/odd of the type of reward occuring per reward
    //works for 8 tiers
    const tierMultiplier = (tier + 2.5) / 56;
    const randomFactor = gaussianRandom(700, 1300, 1) / 1000;

    return tierMultiplier * randomFactor;
  }

  rewardCreator(rewardType, tier) {
    const amountModifier = 1 / rewardType.odds;
    const targetAmount = rewardType.target;
    const tierModifier = this.tieredRewardMultiplier(tier);
    let rewardAmount = roundToInt(
      amountModifier * targetAmount * tierModifier,
      5
    );
    if (rewardType.type !== "gold") {
      rewardAmount = roundToInt(rewardAmount, 100);
    }
    return {
      type: rewardType.type,
      amount: rewardAmount,
      selected: false,
    };
  }

  rewardsDeterminer(tier) {
    // the odds must add to 1
    // target is the total amount of currency that is targeted to have after all levels completed
    const money = {
      target: 1500000,
      odds: 1 / 2,
      type: "money",
    };
    const crypto = {
      target: 100000,
      odds: 1 / 3,
      type: "crypto",
    };
    const gold = {
      target: 1000,
      odds: 1 / 6,
      type: "gold",
    };

    let rewards = [];

    for (let i = 0; i < 3; i++) {
      rewards.push(
        randomFunctionFromOddsPool(
          [money.odds, crypto.odds, gold.odds],
          [
            this.rewardCreator(money, tier),
            this.rewardCreator(crypto, tier),
            this.rewardCreator(gold, tier),
          ]
        )
      );
    }
    return rewards;
  }

  @Transaction({ isolation: "READ COMMITTED" })
  async claimReward(
    player: Player,
    promoId: string,
    selection: number,
    @TransactionRepository(Player) playerRepository?: Repository<Player>,
    @TransactionRepository(Promotions)
    promotionsRepository?: Repository<Promotions>
  ) {
    const promotion = await promotionsRepository.findOne(promoId);
    if (!promotion || promotion?.playerId !== player.id) {
      await this.log.event(EVENT.PromotionClaimFailed, {
        message: "That promotion no longer exists",
        promoId,
        selection,
      });

      throw new UserInputError("That promotion no longer exists");
    }
    if (promotion?.consumed) {
      await this.log.event(EVENT.PromotionClaimFailed, {
        message: "You have already claimed this promotion!",
        promoId,
        selection,
      });

      throw new UserInputError("You have already claimed this promotion!");
    }

    const rewards = this.rewardsDeterminer(promotion.tier);
    rewards[selection].selected = true;

    // Set promotion to consumed
    promotion.consumed = true;
    promotion.dateConsumed = new Date();
    await promotionsRepository.save(promotion);

    // Issue reward to player
    const { amount, type } = rewards[selection];
    switch (type) {
      case "money":
        await this.game.awardCash(player, amount);
        break;
      case "crypto":
        await this.game.awardCrypto(player, amount);
        break;
      case "gold":
        await this.game.awardGold(player, amount);
        break;
    }

    console.log({
      playerId: player.id,
      playerName: player.name,
      rewards,
      issuedReward: {
        amount,
        type,
      },
      promotionId: promotion.id,
      promotionLevel: promotion.levelName,
    });

    await this.log.event(EVENT.PromotionClaim, {
      playerId: player.id,
      playerName: player.name,
      rewards,
      issuedReward: {
        amount,
        type,
      },
      promotionId: promotion.id,
      promotionLevel: promotion.levelName,
    });

    rewards.forEach((reward) => {
      this.metric.addMetric(player, `promotion-impressions-${reward.type}`, 1);
      this.metric.addMetric(
        player,
        `promotion-impressions-${reward.type}-amount`,
        reward.amount
      );
    });

    await Promise.all([
      this.metric.addMetric(player, "promotion-claims", 1),
      this.metric.addMetric(player, `promotion-rewards-${type}`, 1),
      this.metric.addMetric(player, `promotion-rewards-${type}-amount`, amount),
    ]);

    const title = `You won ${
      type === "money" ? "$" : ""
    }${amount.toLocaleString("en-US")} ${type !== "money" ? type : ""}`;

    return { title, rewards };
  }

  async checkAuthorisation(
    viewer: Player,
    target: Player,
    level: FieldLevel = FieldLevel.OPEN
  ): Promise<void> {
    if (level === FieldLevel.OPEN) {
      return;
    }

    const recentlyCreated = diffFromNow(target.dateCreated) > -10;
    const noPlayerAccount = !viewer?.id;
    const bypassAuth = recentlyCreated && noPlayerAccount;

    if (level === FieldLevel.PRIVILEGED) {
      if (viewer?.id !== target.id && !viewer?.isStaff && !bypassAuth) {
        await this.log.event(EVENT.SecurityFieldAuthFailed, {
          viewerPlayerId: viewer?.id,
          targetPlayerId: target.id,
          fieldLevel: level,
          diff: diffFromNow(target.dateCreated),
          recentlyCreated,
          noPlayerAccount,
          bypassAuth,
        });

        throw new UserInputError(
          "You are not authorised to view that information."
        );
      }
      return;
    }

    if (level === FieldLevel.SECRET) {
      if (viewer?.id !== target.id && !viewer?.isStaff && !bypassAuth) {
        await this.log.event(EVENT.SecurityFieldAuthFailed, {
          viewerPlayerId: viewer?.id,
          targetPlayerId: target.id,
          fieldLevel: level,
          diff: diffFromNow(target.dateCreated),
          recentlyCreated,
          noPlayerAccount,
          bypassAuth,
        });

        throw new UserInputError(
          "You are not authorised to view that information."
        );
      }
      return;
    }
  }

  @Transaction({ isolation: "READ COMMITTED" })
  async travel(
    player: Player,
    district: string,
    @TransactionRepository(Player) playerRepo?: Repository<Player>
  ) {
    const districtObj = this.game.getDistrict(district);
    const { performCustomsSearch } = await this.game.getCustomsInfo(player);

    if (districtObj.id === player.districtId) {
      const result = {
        success: false,
        customsSuccess: false,
        message: `You are already in ${districtObj.name}!`,
      };

      await this.log.event(EVENT.Travel, result);

      return result;
    }

    if (await this.metric.isRecovering(player, "travel")) {
      const result = {
        success: false,
        customsSuccess: false,
        message: `You are still recovering!`,
      };

      await this.log.event(EVENT.Travel, result);

      return result;
    }

    player.district = districtObj;

    await playerRepo.save(player);

    await Promise.all([
      this.metric.addMetric(player, "travel", 1),
      this.metric.addMetric(player, `travel-destination-${district}`, 1),
      this.metric.addCooldown(player, "travel", 60 * 30),
    ]);

    const { success, bustType } = performCustomsSearch();
    if (!success) {
      if (bustType === "FULL") {
        ["ecstasy", "cocaine", "speed", "lsd"].forEach((itemCode) => {
          this.game.deductItem(player, itemCode, 9999999);
        });

        await Promise.all([
          this.metric.addMetric(player, "travel-customs-bust", 1),
          this.metric.addMetric(player, `travel-customs-bust-full`, 1),
          this.game.jailPlayer({
            player,
            crime: "Customs",
            description: `Drug trafficking`,
            releaseDate: futureDate(60 * 3),
            cellBlock: "Maximum",
          }),
        ]);

        const result = {
          success: true,
          customsSuccess: false,
          message: `You arrived in ${districtObj.name} but got busted by Customs. All of your contraband was destroyed.`,
        };

        await this.log.event(EVENT.Travel, result);

        return result;
      } else {
        await Promise.all(
          ["ecstasy", "cocaine", "speed", "lsd"].map(async (itemCode) => {
            await this.game.deductItem(player, itemCode, (qty) =>
              Math.round(qty / 2)
            );
          })
        );

        await Promise.all([
          this.metric.addMetric(player, "travel-customs-bust", 1),
          this.metric.addMetric(player, `travel-customs-bust-partial`, 1),
          this.game.jailPlayer({
            player,
            crime: "Customs",
            description: `Drug mule`,
            releaseDate: futureDate(60 * 2),
            cellBlock: "Epstein",
          }),
        ]);

        const result = {
          success: true,
          customsSuccess: false,
          message: `You arrived in ${districtObj.name} but got busted by Customs. Half of your contraband was discovered and destroyed.`,
        };

        await this.log.event(EVENT.Travel, result);

        return result;
      }
    }

    const result = {
      success: true,
      customsSuccess: true,
      message: `You arrived in ${districtObj.name}.`,
    };

    await this.log.event(EVENT.Travel, result);

    return result;
  }

  sanitizeBio(bio: string): string {
    return bio.replace(/(<([^>]+)>)/gi, "");
  }

  @Transaction({ isolation: "READ COMMITTED" })
  async editBio(
    player: Player,
    bio: string,
    @TransactionManager() manager?: EntityManager
  ) {
    const sanitizedBio = this.sanitizeBio(bio);

    player.bio = sanitizedBio;

    await this.metric.addMetric(player, "bio-edits", 1);
    await this.log.event(EVENT.ProfileBioEdit, {
      bio: sanitizedBio,
    });

    await manager.save(player);
  }

  @Transaction({ isolation: "READ COMMITTED" })
  async createPlayer(
    @TransactionManager() manager: EntityManager,
    data: IPlayerCreation
  ) {
    // move to transaction repo

    const pn = playerName(data.name);
    if (pn === null) {
      throw new UserInputError(
        "Your character name must be more than 3 characters and only use letters, numbers and dashes."
      );
    }
    const account = this.account;

    const player = new Player();
    player.name = data.name;
    player.account = account;
    player.cash = PLAYER_STARTING_CASH;
    player.character = this.game.getCharacter(data.character);
    player.rank = this.game.getRank(data.rank);
    player.district = this.game.getDistrict(data.district);
    await manager.save(player);

    const result = await manager
      .createQueryBuilder()
      .update(Account)
      .set({
        player,
      })
      .where("id = :id", { id: account.id })
      .andWhere("player IS NULL")
      .returning(["id"])
      .execute();

    if (result.raw.length === 0) {
      throw new UserInputError("Cannot link player to account");
    }

    return player;
  }

  @Transaction({ isolation: "READ COMMITTED" })
  async getActivePlayers(
    { seconds }: { seconds: number },
    @TransactionManager() manager?: EntityManager
  ): Promise<Array<Player>> {
    const date = new Date();
    date.setTime(new Date().getTime() - seconds * 1000);

    return manager
      .createQueryBuilder(Player, "player")
      .where("player.dateActive >= :date", { date })
      .orderBy({
        "player.role": "ASC",
        "player.id": "ASC",
      })
      .getMany();
  }

  @Transaction({ isolation: "READ COMMITTED" })
  async getPromotionsByPlayer(
    player: Player,
    @TransactionRepository(Promotions)
    promotionRepository?: Repository<Promotions>
  ): Promise<any> {
    return await promotionRepository.find({ player });
  }

  @Transaction({ isolation: "READ COMMITTED" })
  async getPlayerById(
    playerId: number,
    @TransactionRepository(Player) playerRepository?: Repository<Player>
  ): Promise<any> {
    return await playerRepository.findOne({ id: playerId });
  }

  @Transaction({ isolation: "READ COMMITTED" })
  async getPlayerByName(
    name: string,
    @TransactionRepository(Player) playerRepository?: Repository<Player>
  ): Promise<any> {
    return await playerRepository.findOne({ name });
  }

  async getCooldowns(
    player: Player
  ): Promise<{ name: string; expiresAt: string; startedAt: string }[]> {
    const cooldowns = await this.metric.getAllCooldowns(player);
    const jail = await this.game.getPlayerInJail(player);
    if (jail) {
      cooldowns.push({
        name: "jail",
        expiresAt: formatDate(jail.dateRelease),
        startedAt: formatDate(jail.date.created),
      });
    }

    return cooldowns.map((cooldown) => ({
      ...cooldown,
      expiresAt: cooldown.expiresAt ?? formatDate(new Date()),
    }));
  }
}
