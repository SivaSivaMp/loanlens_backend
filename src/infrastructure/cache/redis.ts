import { env } from "@/config/env";
import { logger } from "@/config/logger";
import Redis from "ioredis";

export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  lazyConnect: true,
});

redis.on("connect", () => logger.info("✅ Redis connected"));
redis.on("error", (err) => logger.error("❌ Redis error:", err));

export async function connectRedis(): Promise<void> {
  try {
    await redis.connect();
  } catch (error) {
    logger.error("❌ Redis connection failed:", error);
    process.exit(1);
  }
}
