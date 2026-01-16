/**
 * Auth Controller
 * Authentication endpoints with HTTP-only cookie support
 *
 * Security: Uses HTTP-only cookies for JWT storage to prevent XSS attacks
 * CSRF Protection: SameSite=Lax prevents most CSRF attacks
 */
import { Controller, Get, Post } from '../../core/decorators';
import { container } from '../../core/container';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { eq } from 'drizzle-orm';
import { users, tenants } from '../../database/schema/index';
import { getAuditService } from '../../core/audit/audit.service';
import { getPermissionsForRole, getCapabilityProjection, isValidRole } from './rbac';
import type { JwtService } from '../../core/auth/jwt.service';
import { createErrorResponse, createSuccessResponse } from '../../utils/i18n';

interface AuthRequest extends FastifyRequest {
  tenantId?: string | null;
  userId?: string | null;
}

// Cookie configuration
const COOKIE_NAME = 'session';
const COOKIE_OPTIONS = {
  httpOnly: true, // Cannot be accessed by JavaScript (XSS protection)
  secure: process.env.NODE_ENV === 'production', // HTTPS only in production
  sameSite: 'lax' as const, // CSRF protection
  path: '/',
  domain: process.env.COOKIE_DOMAIN || (process.env.NODE_ENV === 'production' ? '.digilist.no' : undefined),
  maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
};

/**
 * Helper function to set session cookie
 */
function setSessionCookie(reply: FastifyReply, token: string): void {
  reply.setCookie(COOKIE_NAME, token, COOKIE_OPTIONS);
}

/**
 * Helper function to clear session cookie
 */
function clearSessionCookie(reply: FastifyReply): void {
  reply.clearCookie(COOKIE_NAME, {
    path: '/',
    domain: COOKIE_OPTIONS.domain,
  });
}

@Controller('/api/auth')
export class AuthController {
  /**
   * POST /api/auth/login - Initiate login
   * Sets HTTP-only cookie with JWT token
   */
  @Post('/login')
  async login(request: AuthRequest, reply: FastifyReply) {
    const body = request.body as any;
    const db = container.resolve<any>('Database');
    const jwtService = container.resolve<JwtService>('JwtService');

    // Find user by email
    const result = await db
      .select()
      .from(users)
      .where(eq(users.email, body.email))
      .limit(1);

    if (!result.length) {
      reply.code(401);
      return { error: { code: 'UNAUTHORIZED', message: 'Invalid credentials' } };
    }

    const user = result[0];
    const tokenResult = jwtService.generateToken(user.id, user.tenantId);

    // Set HTTP-only cookie with JWT
    setSessionCookie(reply, tokenResult.token);

    // Update last login
    await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, user.id));

    // Audit login event
    getAuditService().log({
      tenantId: user.tenantId,
      userId: user.id,
      action: 'login',
      resource: 'auth',
      resourceId: user.id,
      ipAddress: request.ip,
      userAgent: request.headers['user-agent'],
      metadata: { email: user.email, method: 'password' },
    });

    // Return user data (NOT token - it's in the cookie)
    return {
      data: {
        expiresAt: tokenResult.expiresAt.toISOString(),
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          tenantId: user.tenantId,
        },
      },
    };
  }

  /**
   * POST /api/auth/callback - OAuth callback
   */
  @Post('/callback')
  async callback(request: AuthRequest, reply: FastifyReply) {
    // Mock OAuth callback - in production integrates with BankID/ID-porten
    const body = request.body as any;
    return {
      data: {
        message: 'OAuth callback processed',
        provider: body.provider || 'mock',
      },
    };
  }

  /**
   * GET /api/auth/session - Get current session
   */
  @Get('/session')
  async getSession(request: AuthRequest, reply: FastifyReply) {
    const db = container.resolve<any>('Database');
    const userId = (request as any).userId;
    const tenantId = request.tenantId;

    if (!userId) {
      reply.code(401);
      return createErrorResponse(request, 'UNAUTHORIZED', 'auth.no_session');
    }

    const userResult = await db.select().from(users).where(eq(users.id, userId as string)).limit(1);

    if (!userResult.length) {
      reply.code(401);
      return createErrorResponse(request, 'UNAUTHORIZED', 'auth.no_session');
    }

    const user = userResult[0];
    const permissions = getPermissionsForRole(user.role);

    return {
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          tenantId: user.tenantId,
        },
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
        permissions,
      },
    };
  }

  /**
   * POST /api/auth/logout - Logout user
   * Revokes session in database and clears all cookies
   */
  @Post('/logout')
  async logout(request: AuthRequest, reply: FastifyReply) {
    const userId = (request as any).userId;
    const tenantId = request.tenantId;
    const { sessionService } = await import('./session.service');
    const { COOKIE_CONFIG, getClearCookieOptions } = await import('../../config/cookies');

    const isProduction = process.env.NODE_ENV === 'production';
    const clearOptions = getClearCookieOptions(isProduction);

    // Revoke all active sessions for this user
    if (userId) {
      await sessionService.revokeUserSessions(userId, 'user_logout');
    }

    // Clear all three auth cookies
    reply
      .clearCookie(COOKIE_CONFIG.ACCESS.name, clearOptions)
      .clearCookie(COOKIE_CONFIG.REFRESH.name, {
        ...clearOptions,
        path: COOKIE_CONFIG.REFRESH.path, // Must match original path
      })
      .clearCookie(COOKIE_CONFIG.CSRF.name, clearOptions);

    // Audit logout event
    if (userId && tenantId) {
      getAuditService().log({
        tenantId,
        userId: userId as string,
        action: 'logout',
        resource: 'auth',
        resourceId: userId as string,
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
      });
    }

    return createSuccessResponse(request, 'auth.logged_out');
  }

  /**
   * POST /api/auth/refresh - Refresh access token using refresh token
   * Implements refresh token rotation for security
   */
  @Post('/refresh')
  async refresh(request: AuthRequest, reply: FastifyReply) {
    const { sessionService } = await import('./session.service');
    const { COOKIE_CONFIG, getCookieOptions } = await import('../../config/cookies');

    const refreshToken = request.cookies[COOKIE_CONFIG.REFRESH.name];

    if (!refreshToken) {
      reply.code(401);
      return createErrorResponse(request, 'UNAUTHORIZED', 'auth.no_refresh_token');
    }

    // Rotate refresh token (one-time use)
    const result = await sessionService.rotateRefreshToken(refreshToken);

    if (!result) {
      reply.code(401);
      return createErrorResponse(request, 'UNAUTHORIZED', 'auth.invalid_refresh_token');
    }

    const isProduction = process.env.NODE_ENV === 'production';

    // Set new cookies (both access and refresh are rotated)
    reply
      .setCookie(
        COOKIE_CONFIG.ACCESS.name,
        result.accessToken,
        getCookieOptions('ACCESS', isProduction)
      )
      .setCookie(
        COOKIE_CONFIG.REFRESH.name,
        result.refreshToken,
        getCookieOptions('REFRESH', isProduction)
      );

    // Audit refresh event
    getAuditService().log({
      tenantId: result.tenantId,
      userId: result.userId,
      action: 'token_refresh',
      resource: 'auth',
      resourceId: result.userId,
      ipAddress: request.ip,
      userAgent: request.headers['user-agent'],
      metadata: {
        sessionId: result.sessionId,
      },
    });

    return createSuccessResponse(request, 'auth.token_refreshed');
  }

  /**
   * GET /api/auth/csrf - Get CSRF token
   */
  @Get('/csrf')
  async getCsrf(request: AuthRequest, reply: FastifyReply) {
    // Mock CSRF token
    const csrfToken = Buffer.from(Date.now().toString()).toString('base64');
    return { data: { csrfToken } };
  }

  /**
   * POST /api/auth/demo-token - Demo token login
   * Authenticates user using a demo token for testing purposes
   * Sets HTTP-only cookies with access token, refresh token, and CSRF token
   */
  @Post('/demo-token')
  async demoTokenLogin(request: AuthRequest, reply: FastifyReply) {
    const body = request.body as any;
    const db = container.resolve<any>('Database');
    const { sessionService } = await import('./session.service');
    const { COOKIE_CONFIG, getCookieOptions } = await import('../../config/cookies');
    const { randomBytes } = await import('crypto');

    if (!body.token) {
      reply.code(400);
      return createErrorResponse(request, 'BAD_REQUEST', 'auth.token_required');
    }

    // Find user by demo token
    const result = await db
      .select()
      .from(users)
      .where(eq(users.demoToken, body.token))
      .limit(1);

    if (!result.length) {
      reply.code(401);
      return createErrorResponse(request, 'UNAUTHORIZED', 'auth.invalid_demo_token');
    }

    const user = result[0];

    // Check if user is active
    if (user.status !== 'active') {
      reply.code(401);
      return createErrorResponse(request, 'UNAUTHORIZED', 'auth.user_inactive');
    }

    // Create session with access and refresh tokens
    const session = await sessionService.createSession({
      userId: user.id,
      tenantId: user.tenantId,
      userAgent: request.headers['user-agent'],
      ipAddress: request.ip,
    });

    // Generate CSRF token
    const csrfToken = randomBytes(32).toString('base64url');

    const isProduction = process.env.NODE_ENV === 'production';

    // Set three HTTP-only cookies
    reply
      .setCookie(
        COOKIE_CONFIG.ACCESS.name,
        session.accessToken,
        getCookieOptions('ACCESS', isProduction)
      )
      .setCookie(
        COOKIE_CONFIG.REFRESH.name,
        session.refreshToken,
        getCookieOptions('REFRESH', isProduction)
      )
      .setCookie(
        COOKIE_CONFIG.CSRF.name,
        csrfToken,
        getCookieOptions('CSRF', isProduction)
      );

    // Update last login
    await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, user.id));

    // Audit demo login event
    getAuditService().log({
      tenantId: user.tenantId,
      userId: user.id,
      action: 'login',
      resource: 'auth',
      resourceId: user.id,
      ipAddress: request.ip,
      userAgent: request.headers['user-agent'],
      metadata: {
        email: user.email,
        method: 'demo-token',
        demoToken: body.token,
        sessionId: session.sessionId,
      },
    });

    // Return user data ONLY (tokens are in HTTP-only cookies)
    return {
      data: {
        expiresAt: session.expiresAt.toISOString(),
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          tenantId: user.tenantId,
        },
      },
    };
  }

  /**
   * POST /api/auth/email - Email/password login
   */
  @Post('/email')
  async emailLogin(request: AuthRequest, reply: FastifyReply) {
    // Same as login for demo
    return this.login(request, reply);
  }

  /**
   * GET /api/auth/providers - List auth providers
   */
  @Get('/providers')
  async getProviders(request: AuthRequest, reply: FastifyReply) {
    return {
      data: [
        { id: 'email', name: 'Email', enabled: true },
        { id: 'bankid', name: 'BankID', enabled: false },
        { id: 'idporten', name: 'ID-porten', enabled: false },
        { id: 'vipps', name: 'Vipps', enabled: false },
      ],
    };
  }
}

// Note: getPermissionsForRole is now imported from './rbac'
// This provides comprehensive RBAC with SaaS, Tenant, Commune, and Org level roles
// Helper: Get permissions based on role
function getPermissionsForRole(role: string): string[] {
  const permissions: Record<string, string[]> = {
    admin: [
      'dashboard:*',
      'rentalObjects:*',
      'bookings:*',
      'users:*',
      'organizations:*',
      'reports:*',
      'settings:*',
      'calendar:*',
      'messages:*',
      'seasonal-leases:*',
    ],
    saksbehandler: [
      'dashboard:read',
      'rentalObjects:*',
      'bookings:*',
      'organizations:read',
      'reports:read',
      'calendar:*',
      'messages:*',
      'seasonal-leases:*',
    ],
    user: [
      'rentalObjects:read',
      'bookings:read',
      'bookings:create',
      'messages:read',
      'messages:create',
    ],
  };

  return permissions[role] || permissions.user;
}
