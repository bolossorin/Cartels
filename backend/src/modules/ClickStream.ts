import { gql, UserInputError } from "apollo-server-express";
import { RequestContext } from "../server";

export const typeDefs = gql`
  extend type Mutation {
    event(name: String!, details: String!): Boolean!
  }
`;

export const resolvers = {
  Mutation: {
    event: async (_, data, context: RequestContext) => {
        const details = JSON.parse(data.details);

        await context.service.Log.clickStreamEvent(data.name, details);

        return true;
    },
  },
};
