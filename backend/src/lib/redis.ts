import IORedis from "ioredis";
import { log } from "./logger";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

export const bullMqConnection = new IORedis(redisUrl, {
  maxRetriesPerRequest: null, // Important for BullMQ
});

export const createRedisClient = () => {
  const client = new IORedis(redisUrl);
  client.on("error", (err) => log.error({ err }, "Redis Client Error"));
  return client;
};
