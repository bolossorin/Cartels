import { gql, UserInputError } from "apollo-server-express";
import { RequestContext } from "../server";
import { CrewApplication } from "../entity/CrewApplication";
import { MajorCrimeTarget } from "../entity/MajorCrimeTarget";
import { MajorCrime } from "../entity/MajorCrime";
import { MajorCrimePosition } from "../entity/MajorCrimePosition";

export const typeDefs = gql`
  extend type Query {
    majorCrimes: MajorCrimes! @auth(requires: LOGGEDIN)
  }

  type MajorCrimes {
    locationsList: [MajorCrimeLocation!]!
    majorCrimesList: [MajorCrime!]!
  }

  type MajorCrime {
    id: ID!
    location: MajorCrimeLocation!
    positions: [MajorCrimePosition!]!
    district: String!
  }

  type MajorCrimePosition {
    id: ID!
    position: String
    recommendedCut: Int
    selectedCut: Int
    player: Player
  }

  type MajorCrimePositionModel {
    position: String
    recommendedCut: Int
  }

  type MajorCrimeLocations {
    locations: [MajorCrimeLocation!]!
  }

  type MajorCrimeLocation {
    id: ID!
    name: String!
    respect: LocationRespect!
    image: String!
    disabled: Boolean!
    positions: [MajorCrimePositionModel!]!
  }

  type LocationRespect {
    currentRespect: Int!
    maxRespect: Int!
  }
`;

export const resolvers = {
  Query: {
    majorCrimes: async (_, __, context: RequestContext) => {
      return {
        locationsList: await context.service.MajorCrime.getLocations(),
        majorCrimesList: await context.service.MajorCrime.getMajorCrimes(
          context.player
        ),
      };
    },
  },

  MajorCrimeLocation: {
    respect: (parent: MajorCrimeTarget, __, context: RequestContext) => {
      return context.service.MajorCrime.getRespect(parent, context.player);
    },
    disabled: (parent: MajorCrimeTarget, __, context: RequestContext) => {
      return parent.metadata.disabled;
    },
    positions: (parent: MajorCrimeTarget, __, context: RequestContext) => {
      return parent.metadata.positions;
    },
  },

  MajorCrime: {
    location: (parent: MajorCrime, __, context: RequestContext) => {
      return parent.target;
    },
    district: (parent: MajorCrime, __, context: RequestContext) => {
      return context.service.Game.getDistrict(parent.districtId).name;
    },
  },

  MajorCrimePosition: {
    recommendedCut: (
      parent: MajorCrimePosition,
      __,
      context: RequestContext
    ) => {
      return parent.metadata.recommendedCut;
    },
    selectedCut: (parent: MajorCrimePosition, __, context: RequestContext) => {
      return parent.metadata.selectedCut;
    },
    player: (parent: MajorCrimePosition, __, context: RequestContext) => {
      return context.service.Player.getPlayerById(parent.playerId);
    },
  },
};
