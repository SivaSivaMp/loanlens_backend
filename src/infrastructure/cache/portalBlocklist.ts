import { redis } from '@/infrastructure/cache/redis'

const PREFIX = 'blocked:portal:'

/**
 * Block a portal user immediately.
 * TTL should match (or slightly exceed) the portal access token expiry
 * so the key self-cleans once no valid access token can exist for this user.
 */
export async function blockPortalUser(userId: string, ttlSeconds = 900): Promise<void> {
  await redis.set(PREFIX + userId, '1', 'EX', ttlSeconds)
}

/**
 * Remove the block — called when DSA reactivates the customer.
 */
export async function unblockPortalUser(userId: string): Promise<void> {
  await redis.del(PREFIX + userId)
}

/**
 * Returns true if the user is blocked (used by authenticatePortal middleware).
 */
export async function isPortalUserBlocked(userId: string): Promise<boolean> {
  const val = await redis.get(PREFIX + userId)
  return val !== null
}

