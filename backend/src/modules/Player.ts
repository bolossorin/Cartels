import { gql, UserInputError } from "apollo-server-express";
import { EVENT } from "../service/Log";
import { RequestContext } from "../server";
import { diffFromNow, formatDate } from "../utils/dates";
import { wealthStatus } from "../utils/numbers";
import { InventoryItem } from "../entity/InventoryItem";
import { Item } from "../entity/Item";
import withCancel from "../utils/withCancel";
import { COOLDOWN_TOPIC, PubSub } from "../globalServices/PubSub";
import { withFilter } from "graphql-redis-subscriptions/dist/with-filter";
import { RedisPubSub } from "graphql-redis-subscriptions";
import { FieldLevel } from "../service/Player";

export const typeDefs = gql`
  extend type Query {
    viewer: Viewer @auth(requires: LOGGEDIN)
    activePlayers: ActivePlayers @auth(requires: LOGGEDIN)
    player(name: String!): Player @auth(requires: LOGGEDIN)
    getInventoryItem(input: GetInventoryItemInput!): InventoryItem!
      @auth(requires: LOGGEDIN)
    equippedItems: [InventoryItem!]! @auth(requires: LOGGEDIN)
  }

  extend type Mutation {
    setItemEquipped(input: SetItemEquippedInput!): InventoryItem!
      @auth(requires: LOGGEDIN)
  }

  input SetItemEquippedInput {
    id: ID!
    equipped: Boolean!
  }

  input GetInventoryItemInput {
    id: ID!
  }

  extend type Subscription {
    cooldownFeed: CooldownFeed
  }

  type CooldownFeed {
    eventSource: String!
    cooldowns: [Cooldown!]!
  }

  type ActivePlayers {
    players: [Player]!
    count: Int!
  }

  type Promotion {
    id: ID!
    title: String!
    actionText: String!
    levelName: String!
    startPoints: Int!
    endPoints: Int!
    showRewards: Boolean!
    consumed: Boolean!
  }

  enum PlayerCharacter {
    ENTREPRENEUR
    GANGSTER
    ASSASSIN
  }

  enum PlayerRole {
    PLAYER
    SUPPORT
    MODERATOR
    ADMINISTRATOR
  }

  enum Currency {
    MONEY
    GOLD
    CRYPTO
  }

  type PlayerCurrencies {
    name: Currency!
    amount: Int!
  }

  type Player {
    id: ID!
    name: String!
    character: PlayerCharacter!
    rank: String!
    role: PlayerRole!
    district: String!
    currencies: [PlayerCurrencies]!
    cash: Value!
    gold: Value!
    crypto: Value!
    xp: Int!
    xpTarget: Int!
    hp: Int!
    stats: PlayerStats!
    dateActive: String
    dateCreated: String
    isJailed: Boolean!
    isOnline: Boolean!
    wealth: String!
    cooldown: PlayerCooldown!
    cooldowns: [Cooldown!]!
    promotions: [Promotion]
    bio: String
    inventory: Inventory!
    unseenUpdates: Int!
    crew: Crew
  }

  type Cooldown {
    name: String!
    startedAt: String!
    expiresAt: String!
  }

  type Inventory {
    itemsCount: Int
    items: [InventoryItem]!
  }

  type InventoryItem {
    id: ID!
    equipped: Boolean!
    quantity: Int!
    item: Item!
    createdAt: String!
    showcaseFactoids: [ShowcaseFactoid!]
  }

  type Item {
    id: ID!
    code: String!
    name: String!
    variant: String!
    description: String!
    imageUrl: String!
    marketPrice: Int
    horizontalImageUrl: String
    strengthDisplay: String
    rarity: String!
    stackable: Boolean!
    tradable: Boolean!
    options: [ItemOption]
    amountOwned: Int!
  }

  type ShowcaseFactoid {
    title: String!
    text: String!
    specialType: String
  }

  type ItemOption {
    type: String!
  }

  scalar Value

  type PlayerCooldown {
    crimes: Int
  }

  type PlayerStats {
    bustSuccess: Int!
    bustFail: Int!
    bustTotal: Int!
    bustStreak: Int!
    bustStreakMax: Int!
    bustedSuccess: Int!
    bustedFail: Int!
    escapeSuccess: Int!
    escapeFail: Int!
    escapeStreak: Int!
    escapeStreakMax: Int!
    crimeSuccess: Int!
    crimeEvaded: Int!
    crimeJailed: Int!
    crimeLootCash: Int!
    forumReplies: Int!
    forumPosts: Int!
    carTheftSuccess: Int!
    carTheftFlawlessSuccess: Int!
    carTheftFail: Int!
    carTheftJailed: Int!
  }

  type Viewer {
    player: Player
  }

  input TravelInput {
    district: String!
  }

  type TravelResult {
    success: Boolean!
    customsSuccess: Boolean!
    player: Player!
    message: String!
  }

  type PromotionClaimResult {
    title: String!
    rewards: [Reward]!
    player: Player!
  }

  type Reward {
    type: String!
    amount: String!
    selected: Boolean!
  }

  extend type Mutation {
    createInitialPlayer(name: String!, character: PlayerCharacter!): Player
      @auth(allowPlayerless: TRUE)
    travel(input: TravelInput): TravelResult @auth(requires: LOGGEDIN)
    promotionClaim(promotionId: ID!, selection: Int!): PromotionClaimResult
      @auth(requires: LOGGEDIN)
    editBio(input: EditBioInput): EditBioResult @auth(requires: LOGGEDIN)
    useConsumableItem(input: UseConsumableItemInput!): UseConsumableItemResult!
      @auth(requires: LOGGEDIN)
  }

  input UseConsumableItemInput {
    id: ID!
  }

  type UseConsumableItemResult {
    success: Boolean!
    message: String!
    inventoryItem: InventoryItem
  }

  input EditBioInput {
    playerId: ID
    bio: String!
  }

  type EditBioResult {
    success: Boolean!
    player: Player
  }
`;

export const resolvers = {
  PlayerRole: {
    PLAYER: 0,
    SUPPORT: 1,
    MODERATOR: 2,
    ADMINISTRATOR: 3,
  },

  PlayerCharacter: {
    ENTREPRENEUR: "Entrepreneur",
    GANGSTER: "Gangster",
    ASSASSIN: "Assassin",
  },

  Subscription: {
    cooldownFeed: {
      resolve: async (payload, args, context: RequestContext, info) => {
        const cooldowns = await context.service.Player.getCooldowns(
          context.player
        );

        return {
          eventSource: `${payload?.source ?? "Unknown?"}`,
          cooldowns,
        };
      },
      subscribe: (_, __, context: RequestContext) => {
        console.log(
          `Cooldown sub: p:${context.player.id} clid:${context.metadata?.clid} build:${context.metadata?.build}`
        );

        setTimeout(() => {
          (PubSub as RedisPubSub).publish(COOLDOWN_TOPIC, {
            playerIdScope: context.player.id,
            source: `Subscription welcome event`,
          });
        }, 10);

        // @ts-ignore
        return withFilter(
          () =>
            withCancel(
              (PubSub as RedisPubSub).asyncIterator(COOLDOWN_TOPIC),
              () => {
                console.log(
                  `Cooldown unsub: p:${context.player.id} clid:${context.metadata?.clid} build:${context.metadata?.build}`
                );
              }
            ),
          (rootValue) => {
            return context.player.id === rootValue.playerIdScope;
          }
        )();
      },
    },
  },

  Query: {
    viewer: async (_, __, context) => {
      return {
        player: context.player,
      };
    },

    activePlayers: async (_, __, context) => {
      const players = await context.service.Player.getActivePlayers({
        seconds: 60 * 15,
      });

      return {
        count: players.length,
        players,
      };
    },

    player: async (_, { name }, context) => {
      const player = await context.service.Player.getPlayerByName(name);
      if (!player) {
        throw new UserInputError("No player with that name exists!");
      }

      return player;
    },

    getInventoryItem: async (_, { input }, context: RequestContext) => {
      const item = await context.service.Game.getInventoryItemById(
        context.player,
        input.id
      );
      if (!item) {
        throw new UserInputError("That item no longer exists!");
      }

      return item;
    },

    equippedItems: async (_, { input }, context: RequestContext) => {
      const items = await context.service.Game.getInventoryItemsByEquipped(
        context.player,
        true
      );
      if (!items) {
        return [];
      }

      return items;
    },
  },

  InventoryItem: {
    item: async (parent: InventoryItem, _, context: RequestContext) => {
      return context.service.Game.getItem(parent.itemId);
    },
    createdAt: async (parent: InventoryItem) => formatDate(parent.date.created),

    showcaseFactoids: async (
      parent: InventoryItem,
      _,
      context: RequestContext
    ) => {
      if (["weapon", "protection"].includes(parent.item.variant)) {
        return [
          {
            title: "Stats",
            text: parent.item?.metadata?.strengthDisplay ?? "Unknown",
          },
          {
            title: "Buy price",
            text: parent.item?.metadata?.marketPrice ?? "0",
            specialType: "cash",
          },
        ];
      }

      if (parent.item.variant === "drug") {
        const marketPricing = (
          await context.service.Lab.getMarketPricing(context.player)
        ).find((mp) => mp.item.itemCode === parent.item.itemCode);
        const marketPrice = marketPricing.price;

        return [
          {
            title: "Quantity",
            text: `${parent.quantity} units`,
          },
          {
            title: "Market price",
            text: marketPrice,
            specialType: "cash",
          },
          {
            title: "Street price",
            text: Math.floor(marketPrice * parent.quantity),
            specialType: "cash",
          },
        ];
      }

      if (parent.item.variant === "consumable") {
        return [
          {
            title: "Quantity",
            text: `${parent.quantity} usages`,
          },
        ];
      }
    },
  },

  Item: {
    imageUrl: async (parent: Item) => parent.image,
    horizontalImageUrl: async (parent: Item) =>
      (parent.metadata as any)?.horizontalImage,
    strengthDisplay: async (parent: Item) =>
      (parent.metadata as any)?.strengthDisplay,
    code: async (parent: Item) => parent.itemCode,
    options: async (parent: Item) => (parent.usage as any)?.options,
    marketPrice: async (parent: Item) => (parent.metadata as any)?.marketPrice,
    rarity: () => "Common",
    amountOwned: async (parent: Item, _, ctx: RequestContext) =>
      (await ctx.service.Game.getInventoryItemsByItemId(ctx.player, parent.id))
        .length,
  },

  ItemOption: {
    type: async (parent) => parent?.type,
  },

  Player: {
    // role: parent => parent.account.role,
    inventory: async (parent, _, context: RequestContext) => {
      await context.service.Player.checkAuthorisation(
        context.player,
        parent,
        FieldLevel.PRIVILEGED
      );

      const items = await context.service.Game.getInventoryItems(parent);

      return {
        itemsCount: items.length,
        items,
      };
    },
    role: async (parent, _, context: RequestContext) => {
      if (["0", "1", "2", "3"].includes(parent.role)) {
        return parseInt(parent.role);
      }

      return 0;
    },
    id: async (parent) => parent.uuid,
    name: async (parent) => parent.name,
    xp: async (parent, _, context: RequestContext) => {
      await context.service.Player.checkAuthorisation(
        context.player,
        parent,
        FieldLevel.PRIVILEGED
      );

      return parent.xp;
    },
    xpTarget: async (parent, _, context: RequestContext) => {
      await context.service.Player.checkAuthorisation(
        context.player,
        parent,
        FieldLevel.PRIVILEGED
      );

      const target = context.service.Game.getRank(parent.rankId + 1)?.exp;

      return target < parent.xp || !target ? parent.xp : target;
    },
    hp: async () => 100,
    rank: async (parent, _, context: RequestContext) => {
      return context.service.Game.getRank(parent.rankId).name;
    },
    character: async (parent, _, context: RequestContext) => {
      return context.service.Game.getCharacter(parent.characterId).name;
    },
    district: async (parent, _, context: RequestContext) => {
      await context.service.Player.checkAuthorisation(
        context.player,
        parent,
        FieldLevel.PRIVILEGED
      );

      return context.service.Game.getDistrict(parent.districtId).name;
    },
    isJailed: async (parent, _, context: RequestContext) => {
      const jail = await context.service.Jail.getInmateByPlayerId(parent.id);

      return jail !== undefined;
    },
    wealth: async (parent) => wealthStatus(parent.cash),
    isOnline: async (parent) => diffFromNow(parent.dateActive) > -600,
    promotions: async (parent, _, context: RequestContext) => {
      await context.service.Player.checkAuthorisation(
        context.player,
        parent,
        FieldLevel.PRIVILEGED
      );

      return context.service.Player.getPromotionsByPlayer(parent);
    },
    currencies: async (parent, _, context: RequestContext) => {
      await context.service.Player.checkAuthorisation(
        context.player,
        parent,
        FieldLevel.PRIVILEGED
      );

      return [
        {
          name: "MONEY",
          amount: parent.cash,
        },
        {
          name: "GOLD",
          amount: parent.gold,
        },
        {
          name: "CRYPTO",
          amount: parent.crypto,
        },
      ];
    },
    stats: async (parent, __, context: RequestContext) => {
      await context.service.Player.checkAuthorisation(
        context.player,
        parent,
        FieldLevel.PRIVILEGED
      );

      const bustSuccess = await context.service.Metric.getMetric(
        parent,
        "jail-bust-success"
      );

      const bustFail = await context.service.Metric.getMetric(
        parent,
        "jail-bust-fail"
      );

      return {
        bustSuccess,
        bustFail,
        bustTotal: bustSuccess + bustFail,
        bustStreak: await context.service.Metric.getMetric(
          parent,
          "jail-bust-streak"
        ),
        bustStreakMax: await context.service.Metric.getMetric(
          parent,
          "jail-bust-streak-all-time-high"
        ),
        bustedSuccess: await context.service.Metric.getMetric(
          parent,
          "busted-from-jail-success"
        ),
        bustedFail: await context.service.Metric.getMetric(
          parent,
          "busted-from-jail-fail"
        ),
        escapeSuccess: await context.service.Metric.getMetric(
          parent,
          "jail-escape-success"
        ),
        escapeFail: await context.service.Metric.getMetric(
          parent,
          "jail-escape-fail"
        ),
        escapeStreak: await context.service.Metric.getMetric(
          parent,
          "jail-escape-streak"
        ),
        escapeStreakMax: await context.service.Metric.getMetric(
          parent,
          "jail-escape-streak-all-time-high"
        ),
        crimeSuccess: await context.service.Metric.getMetric(
          parent,
          "crime-success"
        ),
        crimeEvaded: await context.service.Metric.getMetric(
          parent,
          "crime-evaded"
        ),
        crimeJailed: await context.service.Metric.getMetric(
          parent,
          "crime-jailed"
        ),
        crimeLootCash: await context.service.Metric.getMetric(
          parent,
          "crime-success-loot-cash"
        ),
        forumReplies: await context.service.Metric.getMetric(
          parent,
          "forum-replies"
        ),
        forumPosts: await context.service.Metric.getMetric(
          parent,
          "forum-posts"
        ),
        carTheftSuccess: await context.service.Metric.getMetric(
          parent,
          "car-theft-success"
        ),
        carTheftFlawlessSuccess: await context.service.Metric.getMetric(
          parent,
          "car-theft-success-flawless"
        ),
        carTheftFail: await context.service.Metric.getMetric(
          parent,
          "car-theft-fail"
        ),
        carTheftJailed: await context.service.Metric.getMetric(
          parent,
          "car-theft-jailed"
        ),
      };
    },
    cooldown: async (parent, __, context: RequestContext) => {
      await context.service.Player.checkAuthorisation(
        context.player,
        parent,
        FieldLevel.PRIVILEGED
      );

      const crimes = await context.service.Metric.getCooldown(parent, "crimes");

      return {
        crimes: crimes ? Math.floor(diffFromNow(crimes)) : 0,
      };
    },

    cooldowns: async (parent, __, context: RequestContext) => {
      await context.service.Player.checkAuthorisation(
        context.player,
        parent,
        FieldLevel.PRIVILEGED
      );

      return await context.service.Player.getCooldowns(parent);
    },

    unseenUpdates: async (parent, __, context: RequestContext) => {
      await context.service.Player.checkAuthorisation(
        context.player,
        parent,
        FieldLevel.PRIVILEGED
      );

      const lastSeen = await context.service.Metric.getCooldown(
        context.player,
        "news-seen"
      );

      return await context.service.Changelog.getChangelogsCountAfterDate(
        lastSeen
      );
    },
  },

  Mutation: {
    promotionClaim: async (_, args, context) => {
      const { title, rewards } = await context.service.Player.claimReward(
        context.player,
        args?.promotionId,
        args?.selection
      );

      return {
        player: await context.service.Player.getPlayerById(context.player.id),
        title,
        rewards,
      };
    },

    travel: async (_, args, context: RequestContext) => {
      const travelResult = await context.service.Player.travel(
        context.player,
        args.input.district
      );

      return {
        ...travelResult,
        player: context.player,
      };
    },

    editBio: async (_, args, context: RequestContext) => {
      await context.service.Player.editBio(context.player, args.input.bio);

      return {
        success: true,
        player: context.player,
      };
    },

    setItemEquipped: async (_, { input }, context: RequestContext) => {
      const item = await context.service.Game.equipItem(
        context.player,
        input.id,
        input.equipped
      );

      await context.service.Log.event(EVENT.EquippedItem, {
        input,
        after: {
          id: item.id,
          equipped: item.equipped,
          ownerPlayerId: item.playerId,
        },
      });

      return item;
    },

    useConsumableItem: async (_, { input }, context: RequestContext) => {
      const inventoryItem = await context.service.Game.getInventoryItemById(
        context.player,
        input.id
      );
      if (!inventoryItem) {
        throw new UserInputError("No item to consume.");
      }

      const effects = inventoryItem.item.usage?.effects;
      if (!effects) {
        throw new UserInputError("No effects on this item.");
      }

      await context.service.Game.deductItem(
        context.player,
        inventoryItem.item.itemCode,
        1
      );
      await context.service.Log.event(EVENT.UseConsumableItem, {
        itemCode: inventoryItem.item.itemCode,
        inventoryItemId: inventoryItem.id,
        inventoryItemPreviousQuantity: inventoryItem.quantity,
        itemId: inventoryItem.item.id,
        effects,
      });
      for (const effect of effects) {
        await context.service.Perk.giftPerk(
          context.player,
          effect,
          inventoryItem.item.image
        );
      }

      const refreshInventoryItem = await context.service.Game.getInventoryItemById(
        context.player,
        input.id
      );

      return {
        success: true,
        message:
          effects?.useMessage ?? `You consumed a ${inventoryItem.item.name}!`,
        inventoryItem: refreshInventoryItem ?? undefined,
      };
    },

    createInitialPlayer: async (_, args, context) => {
      let player = null;
      try {
        player = await context.service.Player.createPlayer({
          name: args.name,
          character: args.character,
          district: "Valencia Hills",
          rank: "Package Boy",
        });

        // await context.service.Log.event(EVENT.LoginSuccess, {
        //     emailEntered: data.email
        // });
      } catch (error) {
        await context.service.Log.event(EVENT.CreateInitialPlayerFailure, {
          name: args.name,
          character: args.character,
          exception: error.message,
        });

        if (error instanceof UserInputError) {
          throw error;
        }

        throw new UserInputError(
          "That display name is already in use. Try a different name."
        );
      }

      if (!player) {
        throw new UserInputError(
          "The name you selected is already in use. Please pick another one."
        );
      }

      return player;
    },
  },
};
