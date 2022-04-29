import CacheService from "./Cache";
import { Player } from "../entity/Player";
import { beforeNow, dateFromTime, futureDate } from "../utils/dates";
import { RedisPubSub } from "graphql-redis-subscriptions";
import { COOLDOWN_TOPIC } from "../globalServices/PubSub";
import { PerkService } from "./Perk";
import { Crew } from "../entity/Crew";

interface MetricServiceConstructor {
  Cache: CacheService;
  PubSub: RedisPubSub;
  Perk: PerkService;
}

export class MetricService {
  cache: CacheService;
  pubsub: RedisPubSub;
  perk: PerkService;

  constructor({ Cache, PubSub, Perk }: MetricServiceConstructor) {
    this.cache = Cache;
    this.pubsub = PubSub;
    this.perk = Perk;
  }

  async addMetric(
    player: Player,
    metricName: string,
    modifier: number
  ): Promise<number> {
    return await this.cache.hincrby(
      `metrics-${player.id}`,
      metricName,
      modifier
    );
  }

  async addCrewMetric(
    crew: Crew,
    metricName: string,
    modifier: number
  ): Promise<number> {
    return await this.cache.hincrby(`metrics-${crew.id}`, metricName, modifier);
  }

  async setMetric(
    player: Player,
    metricName: string,
    value: number
  ): Promise<any> {
    return await this.cache.hset(`metrics-${player.id}`, metricName, value);
  }

  async setCrewMetric(
    crew: Crew,
    metricName: string,
    value: number
  ): Promise<any> {
    return await this.cache.hset(`metrics-${crew.id}`, metricName, value);
  }

  async streakMetric(
    player: Player,
    metricName: string,
    modifier: number
  ): Promise<number> {
    const maximumMetricName = `${metricName}-all-time-high`;

    if (modifier === 0) {
      return await this.setMetric(player, metricName, 0);
    }

    const newStreak = await this.addMetric(player, metricName, modifier);

    const currentHigh = await this.getMetric(player, maximumMetricName);
    if (newStreak > currentHigh) {
      await this.setMetric(player, maximumMetricName, newStreak);
    }

    return newStreak;
  }

  async getMetric(player: Player, metricName: string): Promise<number> {
    const metric = await this.cache.hget(`metrics-${player.id}`, metricName);

    return parseInt(`${metric ?? 0}`);
  }

  async getCrewMetric(crew: Crew, metricName: string): Promise<number> {
    const metric = await this.cache.hget(`metrics-${crew.id}`, metricName);

    return parseInt(`${metric ?? 0}`);
  }

  async getAllMetrics(playerId: string): Promise<Record<string, string>> {
    return await this.cache.hgetall(`metrics-${playerId}`);
  }

  async getAllCrewMetrics(crewId: string): Promise<Record<string, string>> {
    return await this.cache.hgetall(`metrics-${crewId}`);
  }

  async isRecovering(player: Player, cooldownName: string): Promise<boolean> {
    const cooldownStatus = await this.cache.hget(
      `cooldown-${player.id}`,
      cooldownName
    );
    if (!cooldownStatus || isNaN(Number(cooldownStatus))) {
      return false;
    }

    const cooldown = dateFromTime(parseInt(cooldownStatus, 10) - 1000);

    return !beforeNow(cooldown);
  }

  async getCooldown(
    player: Player,
    cooldownName: string
  ): Promise<Date | null> {
    const cooldownStatus = await this.cache.hget(
      `cooldown-${player.id}`,
      cooldownName
    );
    if (!cooldownStatus) {
      return null;
    }

    return dateFromTime(cooldownStatus);
  }

  async getAllCooldowns(
    player: Player
  ): Promise<{ name: string; expiresAt: string; startedAt: string }[]> {
    const startedStatuses = await this.cache.hgetall(
      `cooldown-started-${player.id}`
    );
    const cooldowns = await this.cache.hgetall(`cooldown-${player.id}`);
    const formattedCooldowns = [];
    for (const [name, time] of Object.entries(cooldowns)) {
      formattedCooldowns.push({
        name,
        expiresAt: dateFromTime(time).toJSON(),
        startedAt: dateFromTime(startedStatuses?.[name] ?? "0").toJSON(),
      });
    }

    return formattedCooldowns;
  }

  async addCooldown(
    player: Player,
    cooldownName: string,
    cooldownSeconds: number
  ): Promise<number> {
    const secs = await this.perk.determineCooldownSecs(
      player,
      cooldownName,
      cooldownSeconds
    );
    console.log("determined", { cooldownSeconds, secs, cooldownName });

    await Promise.all([
      this.cache.hset(
        `cooldown-${player.id}`,
        cooldownName,
        futureDate(secs).getTime()
      ),
      this.cache.hset(
        `cooldown-started-${player.id}`,
        cooldownName,
        new Date().getTime()
      ),
    ]);
    await this.pubsub.publish(COOLDOWN_TOPIC, {
      playerIdScope: player.id,
      source: `Cooldown add operation`,
    });

    return secs;
  }

  async removeCooldown(player: Player, cooldownName: string): Promise<void> {
    await this.cache.hset(
      `cooldown-${player.id}`,
      cooldownName,
      new Date().getTime()
    );
    await this.pubsub.publish(COOLDOWN_TOPIC, {
      playerIdScope: player.id,
      source: `Cooldown removal operation`,
    });
  }
}
