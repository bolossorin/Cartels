import Redis from "ioredis";
import IORedis from "ioredis";

export default class CacheService {
  connect = async () => {
    try {
      this.redis = new Redis({
        host: process.env.REDIS_HOSTNAME,
        reconnectOnError: (error) => {
          const readOnlyError = error.message.startsWith("READONLY");
          console.log(
            `Redis > Server error -> ${
              readOnlyError ? "reconnecting" : "dropping"
            }...`,
            {
              error,
            }
          );

          // Attempt reconnect if a AWS ElastiCache node is currently failing over
          return readOnlyError;
        },
        retryStrategy: (times) => {
          // reconnect after
          return Math.min(times * 50, 2000);
        },
      });

      const pingResponse = await this.redis.ping((err, result) => {
        if (err) throw err;
        return result;
      });

      // @ts-ignore
      if (pingResponse !== "PONG") {
        throw new Error("Redis did not respond to ping command");
      }

      if (process.env.NODE_ENV === "development") {
        const devCommand = await this.redis.set(
          "stop-writes-on-bgsave-error",
          "no"
        );

        console.log(`⚡ Redis command result: ${devCommand}`);
      }

      return console.log(`⚡ Redis is connected in ${process.env.NODE_ENV}`);
    } catch (error) {
      console.log("Redis > Exception thrown", {
        host: process.env.REDIS_HOST,
        error,
      });

      throw error;
    }
  };

  pingTest = async () => {
    const pingResponse = await this.redis.ping((err, result) => {
      if (err) throw err;
      return result;
    });

    // @ts-ignore
    if (pingResponse !== "PONG") {
      throw new Error("Redis did not respond to ping command");
    }
  };

  incr = async (key, incrBy) => {
    console.log(`Redis > incr() key=${key} incrBy=${incrBy}`);
    try {
      return this.redis.incrby(key, incrBy);
    } catch (error) {
      console.log("Redis > Exception thrown", {
        key,
        error,
      });

      return null;
    }
  };

  hincrby = async (hash, field, incrBy) => {
    console.log(
      `Redis > hincrby() hash=${hash} field=${field} incrby=${incrBy}`
    );
    try {
      return this.redis.hincrby(hash, field, incrBy);
    } catch (error) {
      console.log("Redis > Exception thrown", {
        hash,
        field,
        error,
      });

      return null;
    }
  };

  hset = async (hash, field, value) => {
    // console.log(`Redis > hset() hash=${hash} field=${field} value=${value}`);
    try {
      return this.redis.hset(hash, field, value);
    } catch (error) {
      console.log("Redis > Exception thrown", {
        hash,
        field,
        error,
      });

      return null;
    }
  };

  hget = async (hash, field) => {
    // console.log(`Redis > hget() hash=${hash} field=${field}`);
    try {
      return this.redis.hget(hash, field);
    } catch (error) {
      console.log("Redis > Exception thrown", {
        hash,
        field,
        error,
      });

      return null;
    }
  };

  hgetall = async (hash) => {
    // console.log(`Redis > hgetall() hash=${hash}`);
    try {
      return this.redis.hgetall(hash);
    } catch (error) {
      console.log("Redis > Exception thrown", {
        hash,
        error,
      });

      return null;
    }
  };

  set = async (key, value, expiry = 0) => {
    const json = JSON.stringify(value);

    console.log(`Redis > set() key=${key} value=${json}`);
    try {
      return expiry !== 0
        ? this.redis.set(key, json, "EX", expiry)
        : this.redis.set(key, json);
    } catch (error) {
      console.log("Redis > Exception thrown", {
        key,
        value,
        error,
      });

      return null;
    }
  };

  get = async (key) => {
    // console.log(`Redis > get() key=${key}`);
    try {
      const response = await this.redis.get(key);

      return response ? JSON.parse(response) : null;
    } catch (error) {
      console.log("Redis > Exception thrown", {
        key,
        error,
      });

      return null;
    }
  };

  lpush = async (key, value): Promise<number> => {
    const json = JSON.stringify(value);

    try {
      return await this.redis.lpush(key, json);
    } catch (error) {
      console.log("Redis > Exception thrown", {
        key,
        value,
        error,
      });

      return null;
    }
  };

  lrange = async <Expected>(key, start, end): Promise<Expected> => {
    try {
      const result = await this.redis.lrange(key, start, end);

      // @ts-ignore
      return result ? result.map((res) => JSON.parse(res)) : null;
    } catch (error) {
      console.log("Redis > Exception thrown", {
        key,
        start,
        end,
        error,
      });

      return null;
    }
  };

  ltrim = async (key, start, stop): Promise<"OK"> => {
    try {
      return await this.redis.ltrim(key, start, stop);
    } catch (error) {
      console.log("Redis > Exception thrown", {
        key,
        start,
        stop,
        error,
      });

      return null;
    }
  };
  redis: Redis.Redis;
}
