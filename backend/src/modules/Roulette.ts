import { gql, UserInputError } from "apollo-server-express";
import { RequestContext } from "../server";
import { Property } from "../entity/Property";

export const typeDefs = gql`
  extend type Mutation {
    betRoulette(input: BetRouletteInput!): BetRouletteOutput!
      @auth(requires: LOGGEDIN)
  }

  extend type Property {
    previousRouletteWinners: [Int!]!
  }

  input BetRouletteInput {
    boardStacks: [BetRouletteBoardStack!]!
  }

  input BetRouletteBoardStack {
    positionId: String!
    chips: [String!]!
  }

  type BetRouletteOutput {
    player: Player!
    property: Property!
    result: BetRouletteOutputResult!
  }

  type BetRouletteOutputResult {
    landedPosition: String!
    banner: BetRouletteOutputResultBanner!
  }

  type BetRouletteOutputResultBanner {
    nodes: [BetRouletteOutputResultBannerNode!]!
    displayType: String!
  }

  type BetRouletteOutputResultBannerNode {
    id: ID!
    nodeType: String!
    nodeData: [String!]!
  }
`;

export const resolvers = {
  Mutation: {
    betRoulette: async (_, { input }, context: RequestContext) => {
      const { propertyId, result } = await context.service.Roulette.performBet(
        input.boardStacks,
        context.player
      );

      return {
        player: context.service.Player.getPlayerById(context.player.id),
        property: context.service.Property.getPropertyById(propertyId),
        result,
      };
    },
  },

  Property: {
    previousRouletteWinners: async (
      parent: Property,
      _,
      context: RequestContext
    ) => {
      if (parent.propertyType !== "roulette") return [];

      return await context.service.Cache.lrange<number>(
        `roulette-landed-position:${context.player.id}:${context.player.districtId}`,
        0,
        7
      );
    },
  },
};
