import { gql, UserInputError } from "apollo-server-express";
import { RequestContext } from "../server";
import { futureDate } from "../utils/dates";

export const typeDefs = gql`
  extend type Query {
    changelog: [Changelog!]!
  }

  type Changelog {
    id: ID!
    title: String!
    variant: String!
    variantColor: String!
    imageSrc: String!
    content: String!
    dateCreated: String!
  }
`;

export const resolvers = {
  Query: {
    changelog: async (_, __, context: RequestContext) => {
      await context.service.Metric.addCooldown(context.player, "news-seen", 0);

      return await context.service.Changelog.getChangelogs();
    },
  },
};
