import { gql } from "apollo-server-express";
import { RequestContext } from "../server";

export const typeDefs = gql`
  extend type Mutation {
    betRaceTrack(input: BetRaceTrackInput!): BetRaceTrackOutput!
      @auth(requires: LOGGEDIN)
  }

  extend type Query {
    raceTrackSheet: RaceTrackSheet! @auth(requires: LOGGEDIN)
  }

  type RaceTrackSheet {
    horses: [RaceTrackSheetHorse!]!
    odds: [RaceTrackSheetPosition!]!
    sheetExpiresAt: String!
  }

  type RaceTrackSheetHorse {
    id: ID!
    name: String!
  }

  type RaceTrackSheetPosition {
    id: ID!
    name: String!
    odds: String!
    silk: String!
  }

  input BetRaceTrackInput {
    horseStacks: [BetRaceTrackHorseStack!]!
  }

  input BetRaceTrackHorseStack {
    horseId: String!
    odds: String!
    bet: String
  }

  type BetRaceTrackOutput {
    player: Player!
    property: Property!
    result: BetRaceTrackOutputResult!
  }

  type BetRaceTrackOutputResult {
    landedHorse: String!
    banner: BetRaceTrackOutputResultBanner!
  }

  type BetRaceTrackOutputResultBanner {
    nodes: [BetRaceTrackOutputResultBannerNode!]!
    displayType: String!
  }

  type BetRaceTrackOutputResultBannerNode {
    id: ID!
    nodeType: String!
    nodeData: [String!]!
  }
`;

export const resolvers = {
  Query: {
    raceTrackSheet: async (_, { input }, context: RequestContext) => {
      const odds = (
        await context.service.RaceTrack.getSheet(context.player.district)
      ).odds;
      const horses = context.service.RaceTrack.getHorses();
      const sheetExpiresAt = context.service.Game.getConfig(
        "race_track_odds.expires_at"
      );

      return {
        odds,
        horses,
        sheetExpiresAt,
      };
    },
  },

  Mutation: {
    betRaceTrack: async (_, { input }, context: RequestContext) => {
      const { propertyId, result } = await context.service.RaceTrack.performBet(
        input.horseStacks,
        context.player
      );

      return {
        player: context.service.Player.getPlayerById(context.player.id),
        property: context.service.Property.getPropertyById(propertyId),
        result,
      };
    },
  },
  //
  // Property: {
  //   previousRouletteWinners: async (
  //     parent: Property,
  //     _,
  //     context: RequestContext
  //   ) => {
  //     if (parent.propertyType !== "roulette") return [];
  //
  //     return await context.service.Cache.lrange<number>(
  //       `roulette-landed-position:${context.player.id}:${context.player.districtId}`,
  //       0,
  //       7
  //     );
  //   },
  // },
};
