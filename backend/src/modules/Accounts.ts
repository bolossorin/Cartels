import { gql, UserInputError } from "apollo-server-express";
import { EVENT } from "../service/Log";
import { RequestContext } from "../server";

export const typeDefs = gql`
  directive @auth(
    requires: RequestState = LOGGEDIN
    allowPlayerless: Boolean = false
  ) on OBJECT | FIELD_DEFINITION

  enum RequestState {
    LOGGEDIN
    ANONYMOUS
  }

  type Credentials {
    token: String
  }

  extend type Query {
    gameStatus: GameStatus @auth(requires: ANONYMOUS)
    motd: String
    clientReport(clid: String, state: String): ClientStatus
    resetPasswordTokenValidity(id: ID!, token: String!): Boolean!
  }

  type GameStatus {
    isLoginEligible: Boolean!
    isRegisterEligible: Boolean!
  }

  type ClientStatus {
    shouldRefresh: Boolean!
    suggestRefresh: Boolean!
  }

  extend type Mutation {
    register(email: String!, password: String!): Credentials
      @auth(requires: ANONYMOUS)
    login(email: String!, password: String!): Credentials
      @auth(requires: ANONYMOUS)
    resetPasswordFromToken(id: ID!, token: String!, password: String!): Boolean!
    resetPassword(email: String!): ResetPasswordResult!
  }

  type ResetPasswordResult {
    success: Boolean!
    message: String!
  }
`;

export const resolvers = {
  Query: {
    gameStatus: async (_, __, { gameStatus }: RequestContext) => {
      return {
        ...gameStatus,
      };
    },

    resetPasswordTokenValidity: async (_, data, context) => {
      let resetPasswordTokenValidity = false;
      try {
        resetPasswordTokenValidity = await context.service.Auth.resetPasswordTokenValid(
          data.id,
          data.token
        );
      } catch (error) {
        console.log(error);
      }

      return resetPasswordTokenValidity;
    },

    motd: async (_, __, context: RequestContext) => {
      return (
        (await context.service.Game.getConfig("game.motd")) ??
        `Welcome to the Open Beta of DownTown Mafia. There are bound to be hiccups and we are still implementing functionality. We are aware of issues with rank promotion and login blank screen issues.`
      );
    },

    clientReport: async (_, data, context) => {
      console.log(
        `CLIENT REPORT: acc: ${context?.account?.id} plyr: ${context?.player?.name} clid: ${data?.clid} data: ${data?.state}`
      );

      const shouldRefresh =
        (await context.service.Game.getConfig("game.client.shouldRefresh")) ??
        false;
      const suggestRefresh =
        (await context.service.Game.getConfig("game.client.suggestRefresh")) ??
        false;

      return {
        shouldRefresh: !!shouldRefresh,
        suggestRefresh: !!suggestRefresh,
      };
    },
  },

  Mutation: {
    resetPasswordFromToken: async (_, data, context) => {
      let passwordReset = false;
      try {
        passwordReset = await context.service.Auth.updatePasswordFromToken(
          data.id,
          data.token,
          data.password
        );
      } catch (error) {
        console.log(error);
      }

      return passwordReset;
    },

    resetPassword: async (_, data, context) => {
      let passwordReset = false;
      try {
        await context.service.Auth.resetPassword(data.email);

        return {
          success: true,
          message:
            "An email has been sent to your address with a link to reset your password.",
        };
      } catch (error) {
        return {
          success: false,
          message: error.message,
        };
      }
    },

    register: async (_, data, context) => {
      if (!context?.gameStatus?.isRegisterEligible) {
        throw new Error(
          "Register is currently inaccessible, please try again later."
        );
      }

      let account = null;
      try {
        account = await context.service.Auth.createAccount({
          email: data.email,
          password: data.password,
        });

        await context.service.Log.event(EVENT.RegisterSuccess, {
          emailEntered: data.email,
        });
      } catch (error) {
        await context.service.Log.event(EVENT.RegisterFailure, {
          emailEntered: data.email,
          exception: error.message,
        });

        throw new UserInputError(
          "That email address is invalid or already associated with an account."
        );
      }

      const token = await context.service.Auth.createNewAuthToken(account);

      return { token };
    },

    login: async (_, data, context: RequestContext) => {
      if (!context?.gameStatus?.isLoginEligible) {
        throw new Error(
          "Login is currently inaccessible, please try again later."
        );
      }

      let account = null;
      try {
        account = await context.service.Auth.loginAccount({
          email: data.email,
          password: data.password,
        });

        await context.service.Log.event(EVENT.LoginSuccess, {
          emailEntered: data.email,
        });
      } catch (error) {
        await context.service.Log.event(EVENT.LoginFailure, {
          emailEntered: data.email,
          exception: error.message,
        });

        throw error;
      }

      const token = await context.service.Auth.createNewAuthToken(account);

      return { token };
    },
  },
};
