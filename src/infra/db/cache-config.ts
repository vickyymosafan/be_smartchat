/**
 * Prisma Accelerate Cache Configuration
 * Centralized cache strategy definitions
 */

/**
 * Cache TTL (Time To Live) constants in seconds
 */
export const CACHE_TTL = {
  /** Very short cache - 5 seconds (for frequently changing data) */
  VERY_SHORT: 5,
  
  /** Short cache - 30 seconds (for semi-dynamic data) */
  SHORT: 30,
  
  /** Medium cache - 1 minute (for moderately static data) */
  MEDIUM: 60,
  
  /** Long cache - 5 minutes (for relatively static data) */
  LONG: 300,
  
  /** Very long cache - 15 minutes (for very static data) */
  VERY_LONG: 900,
} as const;

/**
 * Cache strategies for different query types
 */
export const CACHE_STRATEGIES = {
  /** No caching - for write operations or real-time data */
  NONE: undefined,
  
  /** Session data - short cache as it changes frequently */
  SESSION: { ttl: CACHE_TTL.SHORT, swr: CACHE_TTL.VERY_SHORT },
  
  /** Message history - medium cache as it's append-only */
  MESSAGES: { ttl: CACHE_TTL.MEDIUM, swr: CACHE_TTL.SHORT },
  
  /** Chat history list - medium cache */
  CHAT_HISTORY: { ttl: CACHE_TTL.MEDIUM, swr: CACHE_TTL.SHORT },
  
  /** Health check - very short cache */
  HEALTH_CHECK: { ttl: CACHE_TTL.VERY_SHORT },
} as const;

/**
 * Helper to create custom cache strategy
 */
export function createCacheStrategy(ttl: number, swr?: number) {
  return swr ? { ttl, swr } : { ttl };
}
