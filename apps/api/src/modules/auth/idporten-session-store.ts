/**
 * Redis-Backed Session Store for IdPorten Authentication
 * Falls back to in-memory storage if Redis is unavailable
 */

import Redis from 'ioredis';

export interface AuthSession {
  sessionId: string;
  state: string;
  createdAt: number;
  status: 'pending' | 'completed' | 'failed';
  userInfo?: Record<string, unknown>;
  returnTo?: string;
  tenantId?: string;
}

const SESSION_TTL_SECONDS = 600; // 10 minutes
const SESSION_TTL_MS = SESSION_TTL_SECONDS * 1000;

// Redis client (null if Redis unavailable)
let redisClient: Redis | null = null;

// Initialize Redis connection
try {
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6380';
  redisClient = new Redis(redisUrl, {
    retryStrategy: (times: number) => {
      // Stop retrying after 3 attempts
      if (times > 3) {
        console.warn('[SESSION STORE] Redis connection failed after 3 retries, falling back to in-memory');
        return null;
      }
      return Math.min(times * 100, 2000);
    },
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    lazyConnect: true,
  });

  // Connect asynchronously
  redisClient.connect().catch((err: Error) => {
    console.warn('[SESSION STORE] Redis connection failed:', err.message);
    console.warn('[SESSION STORE] Falling back to in-memory session storage');
    redisClient = null;
  });

  redisClient.on('error', (err: Error) => {
    console.error('[SESSION STORE] Redis error:', err.message);
  });

  redisClient.on('connect', () => {
    console.log('[SESSION STORE] Redis connected successfully');
  });
} catch (error) {
  console.warn('[SESSION STORE] Failed to initialize Redis:', error);
  console.warn('[SESSION STORE] Using in-memory session storage');
  redisClient = null;
}

// In-memory fallback storage
const sessionStorage = new Map<string, AuthSession>();

// Periodic cleanup of expired in-memory sessions
setInterval(() => {
  if (redisClient) return; // Skip if using Redis
  
  const now = Date.now();
  for (const [state, session] of sessionStorage.entries()) {
    if (now - session.createdAt > SESSION_TTL_MS) {
      sessionStorage.delete(state);
    }
  }
}, 60000); // Clean up every minute

/**
 * Session store with Redis-backed storage and in-memory fallback
 */
export const sessionStore = {
  /**
   * Store a session (Redis with in-memory fallback)
   */
  async set(state: string, session: AuthSession): Promise<void> {
    // Try Redis first
    if (redisClient && redisClient.status === 'ready') {
      try {
        const key = `auth:state:${state}`;
        await redisClient.setex(key, SESSION_TTL_SECONDS, JSON.stringify(session));
        console.log(`[SESSION STORE] Stored state in Redis: ${state}`);
        return;
      } catch (error) {
        console.error('[SESSION STORE] Redis set failed:', error);
        // Fall through to in-memory
      }
    }

    // Fallback to in-memory
    sessionStorage.set(state, session);
    console.log(`[SESSION STORE] Stored state in memory: ${state}`);
  },

  /**
   * Get a session by state (Redis with in-memory fallback)
   */
  async get(state: string): Promise<AuthSession | undefined> {
    // Try Redis first
    if (redisClient && redisClient.status === 'ready') {
      try {
        const key = `auth:state:${state}`;
        const data = await redisClient.get(key);
        if (data) {
          console.log(`[SESSION STORE] Retrieved state from Redis: ${state}`);
          return JSON.parse(data) as AuthSession;
        }
      } catch (error) {
        console.error('[SESSION STORE] Redis get failed:', error);
        // Fall through to in-memory
      }
    }

    // Fallback to in-memory
    const session = sessionStorage.get(state);
    if (session) {
      console.log(`[SESSION STORE] Retrieved state from memory: ${state}`);
    }
    return session;
  },

  /**
   * Delete a session (Redis with in-memory cleanup)
   */
  async delete(state: string): Promise<void> {
    // Try Redis first
    if (redisClient && redisClient.status === 'ready') {
      try {
        const key = `auth:state:${state}`;
        await redisClient.del(key);
        console.log(`[SESSION STORE] Deleted state from Redis: ${state}`);
      } catch (error) {
        console.error('[SESSION STORE] Redis delete failed:', error);
      }
    }

    // Always cleanup in-memory too
    sessionStorage.delete(state);
  },

  /**
   * Check if Redis is connected
   */
  isRedisConnected(): boolean {
    return redisClient !== null && redisClient.status === 'ready';
  },

  /**
   * Get storage type for debugging
   */
  getStorageType(): 'redis' | 'memory' {
    return this.isRedisConnected() ? 'redis' : 'memory';
  },
};
