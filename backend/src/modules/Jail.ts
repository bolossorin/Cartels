import { gql, UserInputError } from "apollo-server-express";
import { RequestContext } from "../server";
import { diffFromNow, futureDate } from "../utils/dates";
import {
  COOLDOWN_TOPIC,
  JAIL_BUST_TOPIC,
  JAIL_TOPIC,
  PubSub,
} from "../globalServices/PubSub";
import withCancel from "../utils/withCancel";
import { random } from "../utils/random";
import { Player } from "../entity/Player";
import { RedisPubSub } from "graphql-redis-subscriptions";
import { withFilter } from "graphql-redis-subscriptions/dist/with-filter";

export const typeDefs = gql`
  extend type Query {
    jail: Jail @auth(requires: LOGGEDIN)
  }

  extend type Mutation {
    giveMeACell: CellResult @auth(requires: LOGGEDIN)
    bustPlayer(inmateId: ID!): BustResult @auth(requires: LOGGEDIN)
  }

  extend type Subscription {
    jailFeed: JailFeed
    jailBustFeed: JailBustFeed
  }

  type JailFeed {
    event: String
    inmate: Inmate
    bustAbility: BustAbility!
  }

  type JailBustFeed {
    buster: Player!
    inmate: Player!
    cellBlock: String!
    special: String!
    crime: String!
    description: String!
    releaseDiff: Int!
    date: String!
  }

  type CellResult {
    gibbed: Boolean!
  }

  type Jail {
    inmates: [Inmate]!
    inmatesCount: Int!
    bustAbility: BustAbility!
    progression: JailProgression!
  }

  type JailProgression {
    id: ID!
    level: Int!
    progressMin: Int!
    progress: Int!
    progressTarget: Int
  }

  type BustAbility {
    canBustSelf: Boolean!
    canBustOthers: Boolean!
  }

  type BustResult {
    success: Boolean!
    message: String!
    jailed: Boolean!
    player: Player!
    progression: JailProgression!
  }

  type Inmate {
    id: ID!
    player: Player!
    crime: String!
    description: String!
    jailedAt: String!
    releaseAt: String!
    releaseIn: Int!
    callToAction: String!
    special: String
    cellBlock: CellBlock
    bustable: Boolean!
  }

  enum CellBlock {
    EPSTEIN
    MEDIUM
    MAXIMUM
    GITMO
  }
`;

export const resolvers = {
  CellBlock: {
    EPSTEIN: "Epstein",
    MEDIUM: "Medium",
    MAXIMUM: "Maximum",
    GITMO: "Gitmo",
  },

  Subscription: {
    jailFeed: {
      subscribe: () =>
        withCancel(PubSub.asyncIterator(JAIL_TOPIC), () => {
          console.log("cancel");
        }),
    },
    jailBustFeed: {
      resolve: async (payload, args, context: RequestContext, info) => ({
        buster: context.service.Player.getPlayerById(payload.busterPlayerId),
        inmate: context.service.Player.getPlayerById(payload.inmatePlayerId),
        cellBlock: payload.cellBlock,
        special: payload.special,
        crime: payload.crime,
        description: payload.description,
        releaseDiff: payload.releaseDiff,
        date: payload.date,
      }),
      subscribe: () => {
        console.log(`JBUSTFEED SUB`);

        return withCancel(PubSub.asyncIterator(JAIL_BUST_TOPIC), () => {
          console.log("cancel");
        });
      },
    },
  },

  Query: {
    jail: async (_, __, context: RequestContext) => {
      const inmates = await context.service.Jail.getInmates();
      const bustAbility = await context.service.Jail.getBustAbility(
        context.player
      );
      const progression = await context.service.Jail.getProgression(
        context.player
      );

      return {
        inmates,
        inmatesCount: inmates.length,
        bustAbility,
        progression,
      };
    },
  },

  JailFeed: {
    bustAbility: async (_, __, context: RequestContext) => {
      return await context.service.Jail.getBustAbility(context.player);
    },
  },

  Mutation: {
    giveMeACell: async (_, __, context: RequestContext) => {
      const self: Player = context.player;

      if (self.role !== "3") {
        throw new UserInputError("because no");
      }

      try {
        const crypto = Math.floor(random(1, 12)) * 100;

        await context.service.Game.jailPlayer({
          player: context.player,
          crime: "BOUNTY",
          description: `Win ${crypto.toLocaleString()} crypto`,
          releaseDate: futureDate(180),
          cellBlock: "Gitmo",
          special: `${crypto} crypto`,
        });
      } catch (error) {
        console.log(error);
      }

      return {
        gibbed: true,
      };
    },
    bustPlayer: async (_, data, context: RequestContext) => {
      const inmate = await context.service.Jail.getInmate(data.inmateId);

      if (
        inmate?.playerId !== context.player.id &&
        !!context.metadata?.selfInmate
      ) {
        throw new UserInputError(
          "You cannot bust players when you are in jail."
        );
      }

      let result = null;
      try {
        result = await context.service.Jail.bustPlayer(
          context.player,
          data.inmateId
        );
      } catch (error) {
        console.log(error);
      }

      if (!result) {
        throw new UserInputError("Sorry this player has already been busted.");
      }

      return {
        ...result,
        player: context.service.Player.getPlayerById(context.player.id),
        progression: await context.service.Jail.getProgression(context.player),
      };
    },
  },

  Inmate: {
    jailedAt: async (parent) => new Date(parent.dateRelease).toJSON(),
    releaseAt: async (parent) => new Date(parent.dateRelease).toJSON(),
    callToAction: async (parent, __, context) =>
      parent.playerId === context.player.id
        ? parent.cellBlock !== "Epstein"
          ? "Solitary"
          : "Escape!"
        : "Bust!",
    special: async (parent) => parent.special,
    player: async (parent, _, context: RequestContext) =>
      await context.service.Player.getPlayerById(parent.playerId),
    releaseIn: async (parent) =>
      Math.floor(diffFromNow(new Date(parent.dateRelease))),
    bustable: async (parent, _, context: RequestContext) => {
      if (parent.playerId === context.player.id) {
        // Can only bust self in the lowest cell block
        return parent.cellBlock === "Epstein";
      }

      // Can bust if not in jail
      return !context.metadata?.selfInmate;
    },
  },
};
