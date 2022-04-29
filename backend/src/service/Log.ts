import { Transaction, TransactionManager, EntityManager } from "typeorm";
import CacheService from "./Cache";
import { Log } from "../entity/Log";
import { ClickStream } from "../entity/ClickStream";
import { Player } from "../entity/Player";

interface ILogConstructor {
  Cache: CacheService;
  player?: Player;
  userAgent: string;
  ip: string;
  clid: string;
  build: string;
}

export enum EVENT {
  RegisterSuccess = "account:register:success",
  RegisterFailure = "account:register:failure",
  LoginSuccess = "player:login:success",
  LoginFailure = "player:login:failure",
  CreateInitialPlayerSuccess = "player:create-initial:success",
  CreateInitialPlayerFailure = "player:create-initial:failure",
  JailBust = "jail:bust",
  PurchaseDrugLabItem = "lab:purchase-item",
  QueueDrugLabBatch = "lab:queue-batch",
  LabMarketTrade = "lab:market:trade",
  PurchaseMarketItem = "market:purchase",
  ForumCategoryImpression = "forum:category:impression",
  ForumThreadImpression = "forum:thread:impression",
  ForumThreadCreate = "forum:thread:create",
  ForumThreadLock = "forum:thread:lock",
  ForumThreadSticky = "forum:thread:sticky",
  ForumThreadAnnouncement = "forum:thread:announcement",
  ForumThreadHide = "forum:thread:hide",
  ForumThreadReply = "forum:thread:reply",
  ForumReplyEdit = "forum:reply:edit",
  ForumReplyHide = "forum:reply:hide",
  ForumReplyDelete = "forum:reply:delete",
  ForumThreadEdit = "forum:thread:edit",
  ForumThreadDelete = "forum:thread:delete",
  CarTheft = "car-theft",
  GambleRaceTrack = "gamble:race-track",
  GarageMechanic = "garage:mechanic",
  SecurityFieldAuthFailed = "security:field-auth:failed",
  PromotionClaim = "promotion:claim",
  PromotionClaimFailed = "promotion:claim:failed",
  Travel = "travel",
  ProfileBioEdit = "profile:bio:edit",
  UseConsumableItem = "item:use-consumable",
  BankCreate = "bank:create",
  BankWithdrawEarly = "bank:withdraw-early",
  BankRollOver = "bank:roll-over",
  BankCashOut = "bank:cash-out",
  EquippedItem = "item:set-equipped",
  CrewApply = "crew:apply",
  CrewCreate = "crew:create",
  CrewApplicationVote = "crew:application-vote",
  CrewApplicationAccept = "crew:application-accept",
  CrewApplicationDecline = "crew:application-decline",
  CrewApplicationsSwitch = "crew:applications-switch",
  CrewLeadershipChange = "crew:leadership-change",
  CrewEditBio = "crew:edit-bio",
  CrewEditQuestions = "crew:edit-questions",
  CrewVaultWithdraw = "crew:vault:withdraw",
  CrewVaultDeposit = "crew:vault:deposit",
  CrewKick = "crew:kick",
  CrewLeave = "crew:leave",
  CrimeSuccess = "crime:success",
  CrimeFail = "crime:fail",
  CrimeJail = "crime:jail",
  EventEasterUseCombinator = "event:easter:use-combinator",
}

export class LogService {
  cache: CacheService;
  player: Player;
  userAgent: string;
  ip: string;
  clid: string;
  build: string;

  constructor({
    Cache,
    player = null,
    userAgent = "",
    ip = "",
    clid = "",
    build = "",
  }: ILogConstructor) {
    this.cache = Cache;
    this.player = player;
    this.userAgent = userAgent;
    this.ip = ip;
    this.clid = clid;
    this.build = build;
  }

  @Transaction({ isolation: "READ COMMITTED" })
  async event(
    eventName: EVENT,
    details: object = {},
    @TransactionManager() manager?: EntityManager
  ) {
    const event = await new Log();
    event.name = eventName;
    if (this.player) {
      event.setPlayer(this.player);
    }
    event.details = {
      ...details,
      meta: {
        ua: this.userAgent,
        ip: this.ip,
        clid: this.clid,
        build: this.build,
      },
    };
    event.userAgent = this.userAgent;

    return await manager.save(event);
  }

  @Transaction({ isolation: "READ COMMITTED" })
  async clickStreamEvent(
    eventName: string,
    details: object = {},
    @TransactionManager() manager?: EntityManager
  ) {
    const event = await new ClickStream();
    event.eventName = eventName;
    if (this.player) {
      event.player = this.player;
    }

    event.details = {
      ...details,
      meta: {
        clid: this.clid,
        build: this.build,
      },
    };
    event.userAgent = this.userAgent;
    event.ipAddress = this.ip;

    return await manager.save(event);
  }
}
