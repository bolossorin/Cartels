import { gql, UserInputError } from "apollo-server-express";
import { RequestContext } from "../server";
import { v5 as uuidv5 } from "uuid";
import { sanitizeAmount } from "../utils/validation";
import { random } from "../utils/random";

export const typeDefs = gql`
  extend type Query {
    properties: Properties! @auth(requires: LOGGEDIN)
    property(input: PropertyInput!): Property!
  }

  input PropertyInput {
    propertyType: String!
  }

  type Properties {
    list: [Property!]!
  }

  type Property {
    id: ID!
    propertyType: String!
    currentState: String!
    maximumBet: String!
    districtName: String!
    player: Player
  }
`;

export const resolvers = {
  Query: {
    properties: async (_, __, context: RequestContext) => {
      return {
        list: await context.service.Property.getAllProperties(),
      };
    },

    property: async (_, { input }, context: RequestContext) => {
      const property = await context.service.Property.getProperty(
        context.player.district,
        input.propertyType
      );
      if (!property) {
        throw new UserInputError(
          "There is no property available in this location."
        );
      }

      return property;
    },
  },

  Property: {
    districtName: (parent) => parent.district.name,

    player: (parent, _, context) => {
      return context.service.Player.getPlayerById(parent.playerId);
    },

    maximumBet: (parent) => parent?.metadata?.maximum ?? "0",
  },
};
