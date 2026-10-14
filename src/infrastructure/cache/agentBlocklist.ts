import { redis } from "@/infrastructure/cache/redis";

const PREFIX = "blocked:agent:";

export async function blockAgent(
  userId: string,
  ttlSeconds = 900,
): Promise<void> {
  await redis.set(PREFIX + userId, "1", "EX", ttlSeconds);
}

export async function unblockAgent(userId: string): Promise<void> {
  await redis.del(PREFIX + userId);
}

export async function isAgentBlocked(userId: string): Promise<boolean> {
  const val = await redis.get(PREFIX + userId);
  return val !== null;
}
