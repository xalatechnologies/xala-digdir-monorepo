/**
 * Session Service
 * Industry-standard session management with refresh token rotation
 *
 * Security Features:
 * - Refresh tokens stored as SHA-256 hashes (never plaintext)
 * - One-time use refresh tokens (rotation on every refresh)
 * - Automatic session expiry and cleanup
 * - Session revocation support
 */

import { randomBytes, createHash } from 'crypto';
import { container } from '../../core/container';
import { sessions } from '../../database/schema';
import { eq, and, isNull, lt } from 'drizzle-orm';
import type { JwtService } from '../../core/auth/jwt.service';
import { COOKIE_CONFIG } from '../../config/cookies';

// =============================================================================
// Types
// =============================================================================

export interface CreateSessionParams {
  userId: string;
  tenantId: string;
  userAgent?: string;
  ipAddress?: string;
}

export interface CreateSessionResult {
  sessionId: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}

export interface RotateRefreshTokenResult {
  sessionId: string;
  accessToken: string;
  refreshToken: string;
  userId: string;
  tenantId: string;
}

export type SessionRevocationReason =
  | 'user_logout'
  | 'expired'
  | 'security_event'
  | 'admin_revoke'
  | 'token_reuse_detected';

// =============================================================================
// Session Service
// =============================================================================

export class SessionService {
  /**
   * Generate cryptographically secure random token
   */
  private generateToken(): string {
    return randomBytes(32).toString('base64url');
  }

  /**
   * Hash token for database storage (SHA-256)
   */
  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  /**
   * Get JWT service from container
   */
  private getJwtService(): JwtService {
    return container.resolve<JwtService>('JwtService');
  }

  /**
   * Get database from container
   */
  private getDatabase(): any {
    return container.resolve<any>('Database');
  }

  /**
   * Create a new session with access and refresh tokens
   */
  async createSession(params: CreateSessionParams): Promise<CreateSessionResult> {
    const db = this.getDatabase();
    const jwtService = this.getJwtService();
    const { tenantDataService } = await import('./tenant-data.service');

    // Fetch tenant subscription and feature flags
    const tenantData = await tenantDataService.getTenantData(params.tenantId);

    // Generate opaque refresh token (32 bytes base64url = 43 chars)
    const refreshToken = this.generateToken();
    const refreshTokenHash = this.hashToken(refreshToken);

    // Generate JWT access token (15min expiry) with tenant data
    const accessTokenResult = jwtService.generateToken(
      params.userId,
      params.tenantId,
      COOKIE_CONFIG.ACCESS.maxAge, // 15 minutes
      tenantData || undefined
    );

    // Calculate refresh token expiry (7 days)
    const expiresAt = new Date(Date.now() + COOKIE_CONFIG.REFRESH.maxAge * 1000);

    // Create session record
    const [session] = await db
      .insert(sessions)
      .values({
        userId: params.userId,
        tenantId: params.tenantId,
        refreshTokenHash,
        accessTokenJti: null, // Optional: can store JWT ID for revocation
        userAgent: params.userAgent,
        ipAddress: params.ipAddress,
        expiresAt,
      })
      .returning();

    return {
      sessionId: session.id,
      accessToken: accessTokenResult.token,
      refreshToken, // Return plaintext token (will be set in cookie)
      expiresAt,
    };
  }

  /**
   * Rotate refresh token (one-time use pattern)
   *
   * Security: If token is reused, it indicates potential theft and session is revoked
   *
   * @param refreshToken - Current refresh token
   * @returns New tokens or null if invalid/expired
   */
  async rotateRefreshToken(refreshToken: string): Promise<RotateRefreshTokenResult | null> {
    const db = this.getDatabase();
    const jwtService = this.getJwtService();
    const { tenantDataService } = await import('./tenant-data.service');

    const tokenHash = this.hashToken(refreshToken);

    // Find active session with this refresh token
    const sessionResult = await db
      .select()
      .from(sessions)
      .where(
        and(
          eq(sessions.refreshTokenHash, tokenHash),
          isNull(sessions.revokedAt),
          isNull(sessions.deletedAt)
        )
      )
      .limit(1);

    if (!sessionResult.length) {
      return null;
    }

    const session = sessionResult[0];

    // Fetch tenant subscription and feature flags
    const tenantData = await tenantDataService.getTenantData(session.tenantId);

    // Generate new tokens
    const newRefreshToken = this.generateToken();
    const newRefreshTokenHash = this.hashToken(newRefreshToken);

    const newAccessTokenResult = jwtService.generateToken(
      session.userId,
      session.tenantId,
      COOKIE_CONFIG.ACCESS.maxAge, // 15 minutes
      tenantData || undefined
    );

    // Update session with new refresh token hash
    // This makes the old refresh token invalid (one-time use)
    await db
      .update(sessions)
      .set({
        refreshTokenHash: newRefreshTokenHash,
        lastRefreshedAt: new Date(),
      })
      .where(eq(sessions.id, session.id));

    return {
      sessionId: session.id,
      accessToken: newAccessTokenResult.token,
      refreshToken: newRefreshToken,
      userId: session.userId,
      tenantId: session.tenantId,
    };
  }

  /**
   * Revoke session (logout or security event)
   *
   * @param sessionId - Session ID to revoke
   * @param reason - Reason for revocation
   */
  async revokeSession(sessionId: string, reason: SessionRevocationReason): Promise<void> {
    const db = this.getDatabase();

    await db
      .update(sessions)
      .set({
        revokedAt: new Date(),
        revokedReason: reason,
      })
      .where(eq(sessions.id, sessionId));
  }

  /**
   * Revoke all sessions for a user
   *
   * @param userId - User ID
   * @param reason - Reason for revocation
   * @returns Number of sessions revoked
   */
  async revokeUserSessions(
    userId: string,
    reason: SessionRevocationReason = 'admin_revoke'
  ): Promise<number> {
    const db = this.getDatabase();

    const result = await db
      .update(sessions)
      .set({
        revokedAt: new Date(),
        revokedReason: reason,
      })
      .where(and(eq(sessions.userId, userId), isNull(sessions.revokedAt)))
      .returning();

    return result.length;
  }

  /**
   * Get active sessions for a user
   *
   * @param userId - User ID
   * @returns Array of active sessions
   */
  async getUserSessions(userId: string): Promise<any[]> {
    const db = this.getDatabase();

    return db
      .select({
        id: sessions.id,
        userAgent: sessions.userAgent,
        ipAddress: sessions.ipAddress,
        createdAt: sessions.createdAt,
        lastRefreshedAt: sessions.lastRefreshedAt,
        expiresAt: sessions.expiresAt,
      })
      .from(sessions)
      .where(
        and(
          eq(sessions.userId, userId),
          isNull(sessions.revokedAt),
          lt(new Date(), sessions.expiresAt) // Not expired
        )
      )
      .orderBy(sessions.lastRefreshedAt);
  }

  /**
   * Clean up expired sessions
   *
   * Should be run periodically (e.g., hourly cron job)
   *
   * @returns Number of sessions deleted
   */
  async cleanupExpiredSessions(): Promise<number> {
    const db = this.getDatabase();

    const result = await db
      .delete(sessions)
      .where(lt(sessions.expiresAt, new Date()))
      .returning();

    return result.length;
  }

  /**
   * Get session statistics
   *
   * @returns Session statistics
   */
  async getSessionStats(): Promise<{
    totalSessions: number;
    activeSessions: number;
    expiredSessions: number;
    revokedSessions: number;
  }> {
    const db = this.getDatabase();

    const allSessions = await db.select().from(sessions);

    const now = new Date();

    return {
      totalSessions: allSessions.length,
      activeSessions: allSessions.filter((s) => !s.revokedAt && new Date(s.expiresAt) > now)
        .length,
      expiredSessions: allSessions.filter((s) => !s.revokedAt && new Date(s.expiresAt) <= now)
        .length,
      revokedSessions: allSessions.filter((s) => s.revokedAt).length,
    };
  }
}

// =============================================================================
// Singleton Instance
// =============================================================================

export const sessionService = new SessionService();
