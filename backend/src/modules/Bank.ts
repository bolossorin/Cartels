import { gql, UserInputError } from "apollo-server-express";
import { RequestContext } from "../server";
import { v5 as uuidv5 } from "uuid";
import { sanitizeAmount } from "../utils/validation";
import { random } from "../utils/random";
import { BankAccount } from "../entity/BankAccount";
import { formatDate } from "../utils/dates";

export const typeDefs = gql`
  extend type Query {
    bankAccounts: [BankAccount!]! @auth(requires: LOGGEDIN)
  }

  extend type Mutation {
    startBankAccount(input: StartBankAccountInput!): Player!
      @auth(requires: LOGGEDIN)
  }

  extend type Mutation {
    withdrawBankAccountEarly(
      input: withdrawBankAccountEarlyInput!
    ): WithdrawEarlyResult! @auth(requires: LOGGEDIN)
  }

  extend type Mutation {
    cashOutBankAccount(
      input: cashOutBankAccountInput!
    ): cashOutBankAccountResult! @auth(requires: LOGGEDIN)
  }

  extend type Mutation {
    rollOverBankAccount(
      input: rollOverBankAccountInput!
    ): rollOverBankAccountResult! @auth(requires: LOGGEDIN)
  }

  input StartBankAccountInput {
    type: String!
    riskiness: String
    amount: Int!
  }

  input withdrawBankAccountEarlyInput {
    id: ID!
  }

  input cashOutBankAccountInput {
    id: ID!
  }

  input rollOverBankAccountInput {
    id: ID!
  }

  type WithdrawEarlyResult {
    message: String!
    player: Player!
    status: String!
  }

  type cashOutBankAccountResult {
    message: String!
    player: Player!
    status: String!
  }

  type rollOverBankAccountResult {
    message: String!
    player: Player!
    status: String!
  }

  type BankAccount {
    id: ID!
    type: String!
    riskiness: String
    amount: Int
    result: Int
    status: String!
    dateExpires: String!
    dateCreated: String!
  }
`;

export const resolvers = {
  Query: {
    bankAccounts: (_, __, context: RequestContext) => {
      return context.service.Bank.getAccounts(context.player);
    },
  },

  Mutation: {
    startBankAccount: async (_, { input }, context: RequestContext) => {
      await context.service.Bank.startAccount(
        context.player,
        input.type,
        input.amount,
        input.riskiness
      );

      return context.service.Player.getPlayerById(context.player.id);
    },

    withdrawBankAccountEarly: async (_, { input }, context: RequestContext) => {
      const result = await context.service.Bank.withdrawAccountEarly(
        context.player,
        input.id
      );

      return {
        ...result,
        player: context.service.Player.getPlayerById(context.player.id),
      };
    },

    cashOutBankAccount: async (_, { input }, context: RequestContext) => {
      const result = await context.service.Bank.cashOutAccount(
        context.player,
        input.id
      );

      return {
        ...result,
        player: context.service.Player.getPlayerById(context.player.id),
      };
    },

    rollOverBankAccount: async (_, { input }, context: RequestContext) => {
      const result = await context.service.Bank.rollOverAccount(
        context.player,
        input.id
      );

      return {
        ...result,
        player: context.service.Player.getPlayerById(context.player.id),
      };
    },
  },

  BankAccount: {
    type: async (parent: BankAccount) => parent.accountType,

    dateExpires: async (parent, __, context: RequestContext) => {
      return formatDate(parent.dateExpires);
    },

    dateCreated: async (parent, __, context: RequestContext) => {
      return formatDate(parent.dateCreated);
    },
  },
};
