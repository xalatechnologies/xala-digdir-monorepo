/**
 * In-Memory Session Store for IdPorten Authentication
 * For demo purposes - use Redis session store in production for persistence
 */

export interface AuthSession {
  sessionId: string;
  state: string;
  createdAt: number;
  status: 'pending' | 'completed' | 'failed';
  userInfo?: Record<string, unknown>;
  returnTo?: string;
  tenantId?: string;
}

const SESSION_TTL_MS = 600000; // 10 minutes

// In-memory session storage
const sessionStorage = new Map<string, AuthSession>();

// Periodic cleanup of expired sessions
setInterval(() => {
  const now = Date.now();
  for (const [state, session] of sessionStorage.entries()) {
    if (now - session.createdAt > SESSION_TTL_MS) {
      sessionStorage.delete(state);
    }
  }
}, 60000); // Clean up every minute

/**
 * Session store with in-memory storage
 */
export const sessionStore = {
  /**
   * Store a session
   */
  async set(state: string, session: AuthSession): Promise<void> {
    sessionStorage.set(state, session);
  },

  /**
   * Get a session by state
   */
  async get(state: string): Promise<AuthSession | undefined> {
    return sessionStorage.get(state);
  },

  /**
   * Delete a session
   */
  async delete(state: string): Promise<void> {
    sessionStorage.delete(state);
  },

  /**
   * Check if Redis is connected (always false for in-memory)
   */
  isRedisConnected(): boolean {
    return false;
  }
};
