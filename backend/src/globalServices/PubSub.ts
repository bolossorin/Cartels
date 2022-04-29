import { RedisPubSub } from "graphql-redis-subscriptions";
import CacheService from "../service/Cache";

export const JAIL_TOPIC = "jail";
export const JAIL_BUST_TOPIC = "jail:bust";
export const COOLDOWN_TOPIC = "cooldown";

let PubSub;

(async () => {
  const publisher = new CacheService();
  const subscriber = new CacheService();

  await Promise.all([publisher.connect(), subscriber.connect()]);

  PubSub = new RedisPubSub({
    publisher: publisher.redis,
    subscriber: subscriber.redis,
  });
})();

export { PubSub };
