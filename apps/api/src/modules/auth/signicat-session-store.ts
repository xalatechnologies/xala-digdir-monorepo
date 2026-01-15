/**
 * Redis Session Store for Signicat Authentication
 * Provides persistent session storage that survives PM2 restarts
 */

import { createClient, RedisClientType } from 'redis';

export interface AuthSession {
  sessionId: string;
  state: string;
  createdAt: number;
  status: 'pending' | 'completed' | 'failed';
  userInfo?: Record<string, unknown>;
  returnTo?: string;
  tenantId?: string;
}

const SESSION_PREFIX = 'signicat:session:';
const SESSION_TTL_SECONDS = 600; // 10 minutes

let redisClient: RedisClientType | null = null;
let isConnected = false;

/**
 * Initialize Redis client
 */
async function getRedisClient(): Promise<RedisClientType | null> {
  if (redisClient && isConnected) {
    return redisClient;
  }

  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  
  try {
    redisClient = createClient({ url: redisUrl }) as RedisClientType;
    
    redisClient.on('error', (err: Error) => {
      console.error('[Redis] Connection error:', err.message);
      isConnected = false;
    });
    
    redisClient.on('connect', () => {
      console.log('[Redis] Connected for Signicat sessions');
      isConnected = true;
    });
    
    await redisClient.connect();
    return redisClient;
  } catch (error) {
    console.error('[Redis] Failed to connect:', error);
    return null;
  }
}

/**
 * Session store with Redis backing and in-memory fallback
 */
export const sessionStore = {
  /**
   * Store a session
   */
  async set(state: string, session: AuthSession): Promise<void> {
    const client = await getRedisClient();
    
    if (client) {
      try {
        await client.setEx(
          `${SESSION_PREFIX}${state}`,
          SESSION_TTL_SECONDS,
          JSON.stringify(session)
        );
        return;
      } catch (error) {
        console.error('[Redis] Failed to set session:', error);
      }
    }
    
    // Fallback to in-memory (for local dev without Redis)
    memoryFallback.set(state, session);
  },

  /**
   * Get a session by state
   */
  async get(state: string): Promise<AuthSession | undefined> {
    const client = await getRedisClient();
    
    if (client) {
      try {
        const data = await client.get(`${SESSION_PREFIX}${state}`);
        if (data) {
          return JSON.parse(data) as AuthSession;
        }
        return undefined;
      } catch (error) {
        console.error('[Redis] Failed to get session:', error);
      }
    }
    
    // Fallback to in-memory
    return memoryFallback.get(state);
  },

  /**
   * Delete a session
   */
  async delete(state: string): Promise<void> {
    const client = await getRedisClient();
    
    if (client) {
      try {
        await client.del(`${SESSION_PREFIX}${state}`);
        return;
      } catch (error) {
        console.error('[Redis] Failed to delete session:', error);
      }
    }
    
    // Fallback to in-memory
    memoryFallback.delete(state);
  },

  /**
   * Check if Redis is connected
   */
  isRedisConnected(): boolean {
    return isConnected;
  }
};

// In-memory fallback for local development without Redis
const memoryFallback = new Map<string, AuthSession>();
