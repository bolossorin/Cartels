import { gql, UserInputError } from "apollo-server-express";
import { RequestContext } from "../server";
import { CRIMES } from "../constants/crimes";

export const typeDefs = gql`
  extend type Query {
    crimes: Crimes! @auth(requires: LOGGEDIN)
  }

  extend type Mutation {
    performCrime(id: ID!): CrimeResult @auth(requires: LOGGEDIN)
  }

  type Crimes {
    list: [Crime]!
    tabs: [CrimeTab]!
    progression: CrimeProgression!
  }

  type CrimeProgression {
    id: ID!
    level: Int!
    progressMin: Int!
    progress: Int!
    progressTarget: Int
  }

  type CrimeTab {
    name: String!
    level: Int!
    difficulty: String!
  }

  enum CrimeDifficulty {
    STREET
    HEISTS
    CORPORATE
  }

  type Crime {
    id: String!
    ord: Int!
    name: String!
    description: String!
    image: String!
    limitedTime: Boolean!
    difficulty: CrimeDifficulty!
    loot: CrimeLoot!
    progress: Int!
    progressTarget: Int!
    unlocked: Boolean!
  }

  type CrimeLoot {
    money: Int
    crypto: Int
    exp: Int
  }

  type CrimeResult {
    event: CrimeResultEvent!
    loot: [LootItem!]
    lootFactor: CrimeLoot!
    crimes: Crimes!
    player: Player!
  }

  type CrimeResultEvent {
    message: String!
    status: String!
    subtitle: String
    countdownSecs: Int!
    countdownStartedAt: String!
    countdownExpiresAt: String!
    countdownLabel: String!
    jailSecs: Int
    timerTag: String
    crime: Crime!
    jail: Jail!
  }

  type LootItem {
    name: String!
    variant: String!
    variantType: String
    quantity: Int!
    image: String
  }
`;

export const resolvers = {
  CrimeDifficulty: {
    STREET: "Street",
    HEISTS: "Heists",
    CORPORATE: "Corporate",
  },

  Query: {
    crimes: async (_, __, context: RequestContext) => {
      return {
        list: CRIMES,
        tabs: context.service.Crime.getTabs(),
        progression: await context.service.Crime.getProgression(context.player),
        metadata: {
          globalCxp: 0,
        },
      };
    },
  },

  Mutation: {
    performCrime: async (_, data, context: RequestContext) => {
      if (!!context.metadata?.selfInmate) {
        throw new UserInputError("You cannot do crimes when you are in jail.");
      }

      const crime = CRIMES.find((crime) => crime.id === data.id);
      if (!crime) {
        throw new UserInputError("Invalid crime selected!");
      }

      let result = null;
      try {
        result = await context.service.Crime.performCrime(
          context.player,
          crime
        );
      } catch (error) {
        throw error;
      }

      if (!result) {
        throw new UserInputError(result?.message ?? "Unknown error occurred.");
      }

      const inmates = await context.service.Jail.getInmates();

      return {
        ...result,
        player: context.service.Player.getPlayerById(context.player.id),
        crimes: {
          list: CRIMES,
          tabs: context.service.Crime.getTabs(),
          progression: await context.service.Crime.getProgression(
            context.player
          ),
          metadata: {
            globalCxp: 0,
          },
        },
        jail: {
          inmatesCount: inmates.length,
          inmates,
        },
      };
    },
  },

  Crime: {
    progress: async (parent, __, context: RequestContext) => {
      return context.service.Crime.getCxp(context.player, parent);
    },

    progressTarget: async (parent, __, context: RequestContext) => {
      return parent.progression.targetCxp;
    },

    unlocked: async (parent, __, context: RequestContext) => {
      return context.service.Crime.enabled(context.player, parent);
    },
  },
};
