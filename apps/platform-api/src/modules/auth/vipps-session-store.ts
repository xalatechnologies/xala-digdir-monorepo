/**
 * Vipps Session Store
 * Redis-backed session storage for Vipps OAuth state management
 */

import Redis from 'ioredis';

// =============================================================================
// Types
// =============================================================================

export interface VippsAuthSession {
  state: string;
  nonce: string;
  createdAt: number;
  returnTo: string;
  tenantId?: string | null;
}

// =============================================================================
// Redis Client Setup
// =============================================================================

let redis: Redis | null = null;

function getRedis(): Redis {
  if (!redis) {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    redis = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        if (times > 3) {
          console.error('[VIPPS-SESSION] Redis connection failed after 3 retries');
          return null;
        }
        return Math.min(times * 100, 2000);
      },
    });

    redis.on('error', (err) => {
      console.error('[VIPPS-SESSION] Redis error:', err);
    });

    redis.on('connect', () => {
      console.log('[VIPPS-SESSION] Connected to Redis');
    });
  }
  return redis;
}

// =============================================================================
// In-Memory Fallback
// =============================================================================

const inMemoryStore = new Map<string, { data: VippsAuthSession; expiresAt: number }>();

// Clean up expired sessions every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of inMemoryStore.entries()) {
    if (value.expiresAt < now) {
      inMemoryStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

// =============================================================================
// Session Store Interface
// =============================================================================

class VippsSessionStore {
  private readonly prefix = 'vipps:session:';
  private readonly ttl = 600; // 10 minutes

  /**
   * Store session data
   */
  async set(state: string, session: VippsAuthSession): Promise<void> {
    const key = this.prefix + state;
    const data = JSON.stringify(session);

    try {
      const client = getRedis();
      await client.setex(key, this.ttl, data);
    } catch (error) {
      console.error('[VIPPS-SESSION] Redis set failed, using in-memory fallback:', error);
      inMemoryStore.set(key, {
        data: session,
        expiresAt: Date.now() + this.ttl * 1000,
      });
    }
  }

  /**
   * Get session data
   */
  async get(state: string): Promise<VippsAuthSession | null> {
    const key = this.prefix + state;

    try {
      const client = getRedis();
      const data = await client.get(key);
      if (!data) {
        // Try in-memory fallback
        const fallback = inMemoryStore.get(key);
        if (fallback && fallback.expiresAt > Date.now()) {
          return fallback.data;
        }
        return null;
      }
      return JSON.parse(data);
    } catch (error) {
      console.error('[VIPPS-SESSION] Redis get failed, trying in-memory fallback:', error);
      const fallback = inMemoryStore.get(key);
      if (fallback && fallback.expiresAt > Date.now()) {
        return fallback.data;
      }
      return null;
    }
  }

  /**
   * Delete session data
   */
  async delete(state: string): Promise<void> {
    const key = this.prefix + state;

    try {
      const client = getRedis();
      await client.del(key);
    } catch (error) {
      console.error('[VIPPS-SESSION] Redis delete failed:', error);
    }

    // Also delete from in-memory store
    inMemoryStore.delete(key);
  }

  /**
   * Check if session exists
   */
  async exists(state: string): Promise<boolean> {
    const session = await this.get(state);
    return session !== null;
  }
}

export const vippsSessionStore = new VippsSessionStore();
