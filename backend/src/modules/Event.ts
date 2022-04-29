import { gql } from "apollo-server-express";
import { RequestContext } from "../server";

export const typeDefs = gql`
  extend type Query {
    events: Events! @auth(requires: LOGGEDIN)
  }

  extend type Mutation {
    useEggcombinator: Boolean! @auth(requires: LOGGEDIN)
  }

  type Events {
    easter: EasterEvent!
  }

  type EasterEvent {
    active: Boolean!
    eggs: [EasterEventEggQuantity!]!
    stats: [EasterEventStat!]!
  }

  type EasterEventStat {
    name: String!
    image: String!
    items: [EasterEventStatItem!]!
  }

  type EasterEventStatItem {
    name: String!
    value: String!
    color: String!
  }

  type EasterEventEggQuantity {
    ord: Int!
    quantity: Int!
  }
`;

export const resolvers = {
  Query: {
    events: async (_, __, context) => {
      return { easter: {} };
    },
  },

  Mutation: {
    useEggcombinator: async (_, __, context: RequestContext) => {
      await context.service.Event.easterTradeEggsForGold(context.player);

      return true;
    },
  },

  EasterEvent: {
    stats: async (_, __, context: RequestContext) => {
      return [
        {
          name: "Golden Easter Eggs",
          image:
            "https://d3ve641rnt81e8.cloudfront.net/static/items/assets/eggs/egg_7.png",
          items: [
            {
              name: "Eggs Consumed",
              value: context.service.Metric.getMetric(
                context.player,
                `event-easter-ec-eggs-used`
              ),
              color: "red",
            },
            {
              name: "Total Produced",
              value: context.service.Metric.getMetric(
                context.player,
                `event-easter-ec-golden-eggs`
              ),
              color: "blue",
            },
          ],
        },
      ];
    },
    active: () => true,
    eggs: async (_, __, context: RequestContext) => {
      const circulation = [1, 2, 3, 4, 5, 6];
      const response = [];

      const eggIds = {
        1: "6b3d762a-80a3-4cb8-a567-3059aa0d227d",
        2: "af1f78c4-396b-4213-b558-2d33c4ba84e5",
        3: "d95b2ef4-8b05-4c1d-8ee6-7b2a6a9e76c8",
        4: "66968072-611b-4859-af72-a3a944bb2430",
        5: "1f7f2e3a-e7c0-4c0f-a746-6ab83dfed4d7",
        6: "5533770f-4fe3-4e72-b7c3-3545edd1b2d1",
      };

      for (const ord of circulation) {
        const inventoryItem = await context.service.Game.getInventoryItemByItemId(
          context.player,
          eggIds[ord]
        );
        let quantity = 0;
        if (inventoryItem) {
          console.log("found item!" + ord);
          quantity = inventoryItem.quantity;
        } else {
          console.log("not found item" + ord);
        }

        response.push({
          ord,
          quantity,
        });
      }

      return response;
    },
  },
};
