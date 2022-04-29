import { gql, UserInputError } from "apollo-server-express";
import { RequestContext } from "../server";
import { v5 as uuidv5 } from "uuid";
import { sanitizeAmount } from "../utils/validation";
import { random } from "../utils/random";

export const typeDefs = gql`
  extend type Query {
    raceTrack: PropertyDetails @auth(requires: LOGGEDIN)
  }

  type PropertyDetails {
    id: ID!
    owner: Player!
    maximumBet: String!
    forSaleDisplay: String!
    variant: String!
    propertyNameDisplay: String!
  }

  extend type Mutation {
    raceTrackBet(
      propertyId: ID!
      wager: String!
      odds: Int!
    ): RaceTrackBetResult @auth(requires: LOGGEDIN)
  }

  type RaceTrackBetResult {
    title: String!
    money: String!
    subtitle: String!
    won: Boolean!
    player: Player!
  }
`;

export const resolvers = {
  Query: {
    raceTrack: async (_, __, context: RequestContext) => {
      const owner = await context.service.Player.getPlayerByName("Mark");

      return {
        id: uuidv5("the only rt", "04f07080-9644-4f4b-8a84-b64e5859121e"),
        owner,
        maximumBet: "$30,000",
        forSaleDisplay: "To be announced",
        variant: "race_track",
        propertyNameDisplay: `${context?.player.district.name} Race Track`,
      };
    },
  },

  Mutation: {
    raceTrackBet: async (_, data, context: RequestContext) => {
      const wager = sanitizeAmount(data.wager);
      if (!wager || wager < 1 || wager > 30000) {
        throw new UserInputError(
          "That bet is below the minimum ($0) or above the maximum bet ($30,000)."
        );
      }

      if (context.player.cash < wager) {
        throw new UserInputError("You cannot afford to make that bet.");
      }

      const odds = data?.odds;
      const ALLOWED_ODDS = [2, 3, 5, 7, 9, 15];
      const HOUSE_EDGE = 25;
      if (!ALLOWED_ODDS.includes(odds)) {
        throw new UserInputError("Invalid horse odds specified.");
      }

      const rand = random(1, 1000);
      const required = 1000 / odds;
      if (rand <= required && random(1, 1000) > HOUSE_EDGE) {
        const winnings = Math.floor(wager * (odds - 1));
        await context.service.Game.awardCash(context.player, winnings);

        return {
          title: "{name} won ({ratio}:1)",
          money: Math.ceil(winnings + wager).toLocaleString(),
          subtitle: "has been paid out",
          won: true,
          player: context.service.Player.getPlayerById(context.player.id),
        };
      }

      await context.service.Game.deductCash(context.player, wager);

      return {
        title: "{name} didn't make it",
        money: wager.toLocaleString(),
        subtitle: "was lost",
        won: false,
        player: context.service.Player.getPlayerById(context.player.id),
      };
    },
  },
};
