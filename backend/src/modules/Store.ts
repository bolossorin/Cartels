import { gql } from "apollo-server-express";
import { RequestContext } from "../server";
import { StoreItem } from "../entity/StoreItem";

export const typeDefs = gql`
  extend type Query {
    storeItems: [StoreItem!]! @auth(requires: LOGGEDIN)
  }

  type StoreItem {
    id: ID!
    price: Int!
    goldAmount: Int!
    goldBonus: Int
    image: String!
    labelCode: String
    labelText: String
  }
`;

export const resolvers = {
  Query: {
    storeItems: (_, __, context: RequestContext) => {
      return context.service.Store.getGoldItems();
    },
  },
};
