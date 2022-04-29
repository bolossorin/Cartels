import { gql } from "apollo-server-express";
import { RequestContext } from "../server";

export const typeDefs = gql`
  extend type Query {
    market: Market! @auth(requires: LOGGEDIN)
  }

  extend type Mutation {
    purchaseMarketItem(input: PurchaseMarketItemInput!): PurchaseResult!
  }

  input PurchaseMarketItemInput {
    id: ID!
    variant: String!
  }

  type PurchaseResult {
    outcome: String!
    outcomeMessage: String!
    closePurchasePrompt: Boolean!
  }

  type Market {
    weapons: [Item!]
    protection: [Item!]
    equipment: [Item!]
    skins: [Item!]
  }
`;

export const resolvers = {
  Query: {
    market: async (_, __, context: RequestContext) => {
      return {};
    },
  },

  Mutation: {
    purchaseMarketItem: async (_, { input }, context: RequestContext) => {
      return context.service.Market.purchaseItem(
        context.player,
        input.id,
        input.variant
      );
    },
  },

  Market: {
    weapons: async (_, __, context: RequestContext) => {
      return context.service.Market.getWeapons();
    },
    protection: async (_, __, context: RequestContext) => {
      return context.service.Market.getProtection();
    },
    equipment: async (_, __, context: RequestContext) => {
      return context.service.Market.getEquipment();
    },
    skins: async (_, __, context: RequestContext) => {
      return context.service.Market.getSkins();
    },
  },
};
