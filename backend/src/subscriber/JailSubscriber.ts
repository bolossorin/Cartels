import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  RemoveEvent,
} from "typeorm";
import { Jail } from "../entity/Jail";
import { PubSub, JAIL_TOPIC, COOLDOWN_TOPIC } from "../globalServices/PubSub";
import { RedisPubSub } from "graphql-redis-subscriptions";

@EventSubscriber()
export class JailSubscriber implements EntitySubscriberInterface<Jail> {
  constructor() {
    this.pubsub = PubSub;

    console.log(`⚡ JailSubscriber -> Active`);
  }

  listenTo() {
    return Jail;
  }

  /**
   * Called before post insertion.
   */
  afterInsert(event: InsertEvent<Jail>) {
    this.pubsub.publish(COOLDOWN_TOPIC, {
      playerIdScope: event.entity.playerId,
      source: `Synthetic jail insert notification`,
    });
    this.pubsub.publish(JAIL_TOPIC, {
      jailFeed: {
        event: "newInmate",
        inmate: event.entity,
        ability: {},
      },
    });
  }

  beforeRemove(event: RemoveEvent<Jail>) {
    this.pubsub.publish(COOLDOWN_TOPIC, {
      playerIdScope: event.entity.playerId,
      source: `Synthetic jail remove notification`,
    });
    this.pubsub.publish(JAIL_TOPIC, {
      jailFeed: {
        event: "removedInmate",
        inmate: event.entity,
        ability: {},
      },
    });
  }

  pubsub: RedisPubSub;
}
