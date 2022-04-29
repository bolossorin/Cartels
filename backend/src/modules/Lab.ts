import { gql, UserInputError } from "apollo-server-express";
import { RequestContext } from "../server";
import { CRIMES } from "../constants/crimes";
import { DRUG_LAB_ITEMS, DRUG_LAB_VARIANTS } from "../constants/drugLabItems";
import { MAXIMUM_BATCHES } from "../service/Lab";
import { formatDate } from "../utils/dates";

export const typeDefs = gql`
  extend type Query {
    lab: Lab! @auth(requires: LOGGEDIN)
    customs: Customs! @auth(requires: LOGGEDIN)
  }

  extend type Mutation {
    purchaseLabItem(input: LabItemPurchaseInput!): LabItemPurchaseResult
      @auth(requires: LOGGEDIN)
    createLabBatch(input: LabBatchInput!): LabBatchResult
      @auth(requires: LOGGEDIN)
    labMarketTrade(input: LabMarketTradeInput!): LabMarketTradeResult
      @auth(requires: LOGGEDIN)
  }

  input LabMarketTradeInput {
    operation: String!
    trades: [LabMarketTrade!]!
  }

  input LabMarketTrade {
    name: String!
    quantity: Int!
  }

  type LabMarketTradeResult {
    success: Boolean!
    message: String!
  }

  type Customs {
    min: Int!
    max: Int!
    current: Int!
    label: String!
    description: String!
    travelRestriction: Boolean!
  }

  input LabBatchInput {
    product: ID!
  }

  type LabBatchResult {
    lab: Lab!
    success: Boolean!
  }

  input LabItemPurchaseInput {
    id: ID!
    currency: String!
  }

  type LabItemPurchaseResult {
    lab: Lab!
    success: Boolean!
  }

  type Lab {
    id: ID!
    items: [LabItem]!
    progression: LabProgression!
    minimumRequirementsMet: Boolean!
    batches: [LabBatch]!
    batchesCount: Int! @deprecated
    batchesMaximumCount: Int! @deprecated
    batchesUnitCount: Int!
    maximumUnits: Int!
    marketPricing: [LabMarketPricing]!
  }

  type LabMarketPricing {
    id: ID!
    product: String!
    price: Value!
  }

  type LabBatch {
    id: ID!
    product: String!
    units: Int!
    startAt: String
    finishAt: String
    producing: Boolean!
  }

  type LabItem {
    id: ID!
    name: String!
    capability: String!
    prices: LabItemPrices!
    image: String!
    variant: String!
    unlock: Int
    owned: Boolean!
    locked: Boolean!
    equipped: Boolean!
  }

  type LabItemPrices {
    cash: Value!
    crypto: Value!
  }

  type LabProgression {
    id: ID!
    level: Int!
    progressMin: Int!
    progress: Int!
    progressTarget: Int
  }
`;

export const resolvers = {
  Query: {
    lab: async (_, __, context: RequestContext) => {
      const batches = await context.service.Lab.getPlayerBatches(
        context.player
      );

      return {
        id: context.player.id,
        items: context.service.Lab.getItems(),
        progression: await context.service.Lab.getProgression(context.player),
        minimumRequirementsMet: await context.service.Lab.minimumRequirementsMet(
          context.player
        ),
        batches,
        batchesCount: batches.length,
        batchesMaximumCount: MAXIMUM_BATCHES,
        batchesUnitCount: context.service.Lab.getPlayerBatchesUnitCount(
          context.player
        ),
        maximumUnits: await context.service.Lab.getPlayerMaximumUnits(
          context.player
        ),
      };
    },
    customs: async (_, __, context: RequestContext) => {
      return await context.service.Game.getCustomsInfo(context.player);
    },
  },

  Mutation: {
    labMarketTrade: async (_, { input }, context: RequestContext) => {
      return await context.service.Lab.performMarketTrade(
        context.player,
        input.operation,
        input.trades
      );
    },

    createLabBatch: async (_, { input }, context: RequestContext) => {
      if (!["ecstasy", "lsd", "cocaine", "speed"].includes(input?.product)) {
        throw new UserInputError("Invalid product selected!");
      }

      await context.service.Lab.createLabBatch(context.player, input.product);

      const batches = await context.service.Lab.getPlayerBatches(
        context.player
      );

      return {
        success: true,
        lab: {
          id: context.player.id,
          items: context.service.Lab.getItems(),
          progression: await context.service.Lab.getProgression(context.player),
          minimumRequirementsMet: await context.service.Lab.minimumRequirementsMet(
            context.player
          ),
          batches,
          batchesCount: batches.length,
          batchesMaximumCount: MAXIMUM_BATCHES,
          batchesUnitCount: context.service.Lab.getPlayerBatchesUnitCount(
            context.player
          ),
          maximumUnits: await context.service.Lab.getPlayerMaximumUnits(
            context.player
          ),
        },
      };
    },

    purchaseLabItem: async (_, { input }, context: RequestContext) => {
      const lab = DRUG_LAB_ITEMS.find((item) => item.id === input.id);
      if (!lab) {
        throw new UserInputError("Invalid item selected!");
      }
      if (!["crypto", "cash"].includes(input.currency)) {
        throw new UserInputError("Invalid currency selected!");
      }

      let result = null;
      try {
        result = await context.service.Lab.purchaseItem(
          context.player,
          lab,
          input.currency
        );
      } catch (error) {
        throw error;
      }

      const batches = await context.service.Lab.getPlayerBatches(
        context.player
      );

      return {
        success: true,
        lab: {
          id: context.player.id,
          items: context.service.Lab.getItems(),
          progression: await context.service.Lab.getProgression(context.player),
          minimumRequirementsMet: await context.service.Lab.minimumRequirementsMet(
            context.player
          ),
          batches,
          batchesCount: batches.length,
          batchesMaximumCount: MAXIMUM_BATCHES,
          batchesUnitCount: context.service.Lab.getPlayerBatchesUnitCount(
            context.player
          ),
          maximumUnits: await context.service.Lab.getPlayerMaximumUnits(
            context.player
          ),
        },
      };
    },
  },

  Lab: {
    marketPricing: async (parent, __, context: RequestContext) => {
      return context.service.Lab.getMarketPricing(context.player);
    },
  },

  LabMarketPricing: {
    product: async (parent) => parent.item.name,
  },

  LabItem: {
    owned: async (parent, __, context: RequestContext) => {
      return context.service.Lab.owned(context.player, parent);
    },

    locked: async (parent, __, context: RequestContext) => {
      return context.service.Lab.locked(context.player, parent);
    },

    equipped: async (parent, __, context: RequestContext) => {
      return context.service.Lab.equipped(context.player, parent);
    },
  },

  LabBatch: {
    startAt: async (parent, __, context: RequestContext) => {
      return formatDate(parent.dateStart);
    },

    finishAt: async (parent, __, context: RequestContext) => {
      return formatDate(parent.dateFinish);
    },
  },
};
