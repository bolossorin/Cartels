import { gql, UserInputError } from "apollo-server-express";
import { RequestContext } from "../server";
import { Vehicle } from "../entity/Vehicle";
import {formatDate} from "../utils/dates";

export const typeDefs = gql`
  extend type Query {
    carTheft: CarTheft! @auth(requires: LOGGEDIN)
    garage(input: GarageInput!): Garage! @auth(requires: LOGGEDIN)
    garageVehicle(input: GarageVehicleInput!): Vehicle!
      @auth(requires: LOGGEDIN)
  }

  extend type Mutation {
    performCarTheft(input: PerformCarTheftInput!): CarTheftResult
      @auth(requires: LOGGEDIN)
    performMechanicTask(input: PerformMechanicTaskInput!): MechanicResult!
      @auth(requires: LOGGEDIN)
  }

  input PerformMechanicTaskInput {
    id: ID!
    taskCode: String!
    destinationDistrict: String
    agreedPrice: Int!
  }

  type MechanicResult {
    status: String!
    message: String!
    vehicle: Vehicle
    player: Player!
  }

  input GarageInput {
    _: String
  }

  type Garage {
    vehicles: [Vehicle!]!
    vehiclesCount: Int!
  }

  input GarageVehicleInput {
    id: ID!
  }

  input PerformCarTheftInput {
    area: String!
    difficulty: String!
    label: String!
  }

  type CarTheft {
    progression: CarTheftProgression!
    residentialUnlocksAt: String
    commercialUnlocksAt: String
    corporateUnlocksAt: String
  }

  type CarTheftProgression {
    id: ID!
    level: Int!
    progressMin: Int!
    progress: Int!
    progressTarget: Int
  }

  type CarTheftResult {
    title: String!
    subtitle: String
    actionLabel: String!
    status: String!
    vehicleLoot: Vehicle
    carTheft: CarTheft!
    player: Player!
    countdownLabel: String!
    countdownStartedAt: String!
    countdownExpiresAt: String!
  }

  type Vehicle {
    id: ID!
    plate: String!
    name: String!
    image: String!
    damage: Int!
    heat: Int!
    shipping: Boolean!
    district: String!
    originDistrict: String!
    destinationDistrict: String
    destinationArrival: String
    destinationShipped: String
    pricing: VehiclePricing!
  }

  type VehiclePricing {
    sell: Int!
    repair: Int!
    changePlates: Int!
    transportOptions: [VehiclePricingTransportOption!]!
  }

  type VehiclePricingTransportOption {
    district: String!
    price: Int!
    distance: Int!
  }
`;

export const resolvers = {
  Query: {
    carTheft: async (_, __, context: RequestContext) => {
      return {};
    },

    garage: async (_, { input }, context: RequestContext) => {
      const vehicles = await context.service.CarTheft.getPlayerVehiclesByDistrict(
        context.player,
        context.player.district
      );

      return {
        vehicles,
        vehiclesCount: vehicles.length,
      };
    },

    garageVehicle: async (_, { input }, context: RequestContext) => {
      return await context.service.CarTheft.getPlayerVehicleById(
        context.player,
        input.id
      );
    },
  },

  CarTheft: {
    progression: async (_, __, context: RequestContext) => {
      return await context.service.CarTheft.getProgression(context.player);
    },
    residentialUnlocksAt: async (_, __, context: RequestContext) => {
      const enabled = await context.service.CarTheft.enabled(
        context.player,
        "Residential"
      );

      return !enabled ? "Locked" : undefined;
    },
    commercialUnlocksAt: async (_, __, context: RequestContext) => {
      const enabled = await context.service.CarTheft.enabled(
        context.player,
        "Commercial"
      );

      return !enabled ? "Unlocks at Level 3" : undefined;
    },
    corporateUnlocksAt: async (_, __, context: RequestContext) => {
      const enabled = await context.service.CarTheft.enabled(
        context.player,
        "Corporate"
      );

      return !enabled ? "Unlocks at Level 5" : undefined;
    },
  },

  Vehicle: {
    name: async (parent: Vehicle, __, context: RequestContext) => {
      return parent.item.name;
    },
    image: async (parent: Vehicle, __, context: RequestContext) => {
      return parent.item.image;
    },
    district: async (parent: Vehicle, __, context: RequestContext) => {
      return parent.district.name;
    },
    originDistrict: async (parent: Vehicle, __, context: RequestContext) => {
      return parent.originDistrict.name;
    },
    destinationArrival: async (parent: Vehicle, __, context: RequestContext) => {
      return formatDate(parent.dateArrival);
    },
    destinationShipped: async (parent: Vehicle, __, context: RequestContext) => {
      return formatDate(parent.dateShipped);
    },
    destinationDistrict: async (
      parent: Vehicle,
      __,
      context: RequestContext
    ) => {
      return parent.destinationDistrict?.name ?? undefined;
    },

    pricing: async (parent: Vehicle, __, context: RequestContext) => {
      return await context.service.CarTheft.getPricing(parent);
    },
  },

  Mutation: {
    performMechanicTask: async (_, { input }, context: RequestContext) => {
      const result = await context.service.CarTheft.performMechanicOperation(
        context.player,
        input.id,
        input.taskCode,
        input.agreedPrice,
        input?.destinationDistrict ?? ""
      );

      return {
        ...result,
        player: context.service.Player.getPlayerById(context.player.id),
      };
    },

    performCarTheft: async (_, { input }, context: RequestContext) => {
      if (!!context.metadata?.selfInmate) {
        throw new UserInputError(
          "You cannot perform thefts when you are in jail."
        );
      }

      if (!["Residential", "Commercial", "Corporate"].includes(input.area)) {
        throw new UserInputError("Invalid area selected!");
      }

      if (
        !["Easy", "Risky", "Medium", "Crackdown"].includes(input.difficulty)
      ) {
        throw new UserInputError("Invalid location selected!");
      }

      let result = null;
      try {
        result = await context.service.CarTheft.performCarTheft(
          context.player,
          input.area,
          input.difficulty,
          input.label
        );
      } catch (error) {
        throw error;
      }

      if (!result) {
        throw new UserInputError(result?.message ?? "Unknown error occurred.");
      }

      return { ...result, player: context.player, carTheft: {} };
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
