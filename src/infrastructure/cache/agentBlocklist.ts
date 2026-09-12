import { redis } from '@/infrastructure/cache/redis'

const PREFIX = 'blocked:agent:'

/**
 * Block a field agent's B2B access immediately.
 * TTL matches JWT_ACCESS_EXPIRES so the key self-cleans automatically.
 */
export async function blockAgent(userId: string, ttlSeconds = 900): Promise<void> {
  await redis.set(PREFIX + userId, '1', 'EX', ttlSeconds)
}

/**
 * Remove the block — called when DSA reactivates the agent.
 */
export async function unblockAgent(userId: string): Promise<void> {
  await redis.del(PREFIX + userId)
}

/**
 * Returns true if the agent is blocked (used by authenticate middleware).
 */
export async function isAgentBlocked(userId: string): Promise<boolean> {
  const val = await redis.get(PREFIX + userId)
  return val !== null
}
