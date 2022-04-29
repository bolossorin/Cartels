import { gql } from "apollo-server-express";
import { RequestContext } from "../server";
import { Perk } from "../entity/Perk";
import { formatDate } from "../utils/dates";

export const typeDefs = gql`
  extend type Query {
    activePerks: [Perk!]! @auth(requires: LOGGEDIN)
  }

  type Perk {
    id: ID!
    name: String!
    description: String!
    imageUrl: String
    global: Boolean!
    createdAt: String!
    startedAt: String!
    expiresAt: String!
  }
`;

export const resolvers = {
  Query: {
    activePerks: (_, __, context: RequestContext) => {
      return context.service.Perk.getActivePerks(context.player);
    },
  },

  Perk: {
    imageUrl: (parent: Perk) => {
      return parent?.image;
    },

    createdAt: (parent: Perk) => formatDate(parent.dateCreated),
    startedAt: (parent: Perk) => formatDate(parent.dateStart),
    expiresAt: (parent: Perk) => formatDate(parent.dateEnd),
    global: (parent: Perk) => parent.playerId === null,
  },
};
