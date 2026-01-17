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
import { COOKIE_CONFIG, getCookieOptions, getClearCookieOptions } from '../../config/cookies';

interface AuthRequest extends FastifyRequest {
  tenantId?: string | null;
  userId?: string | null;
}

@Controller('/api/auth')
export class AuthController {
  /**
   * POST /api/auth/login - Initiate login
   * Sets HTTP-only cookie with JWT token
   */
  @Post('/login')
  async login(request: AuthRequest, reply: FastifyReply) {
    // Add Cache-Control headers to prevent caching of auth responses
    reply.header('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    reply.header('Pragma', 'no-cache');
    reply.header('Expires', '0');

    const body = request.body as any;
    const db = container.resolve<any>('Database');
    const jwtService = container.resolve<JwtService>('JwtService');
    const { tenantDataService } = await import('./tenant-data.service');

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

    // Fetch tenant subscription and feature flags
    const tenantData = await tenantDataService.getTenantData(user.tenantId);

    const tokenResult = jwtService.generateToken(
      user.id,
      user.tenantId,
      COOKIE_CONFIG.ACCESS.maxAge,
      tenantData || undefined
    );

    // Set HTTP-only cookie with JWT using standard cookie config
    const isProduction = process.env.NODE_ENV === 'production';
    reply.setCookie(
      COOKIE_CONFIG.ACCESS.name,
      tokenResult.token,
      getCookieOptions('ACCESS', isProduction)
    );

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
   * Exchanges authorization code for session and sets HTTP-only cookies
   */
  @Post('/callback')
  async callback(request: AuthRequest, reply: FastifyReply) {
    // Add Cache-Control headers to prevent caching of auth responses
    reply.header('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    reply.header('Pragma', 'no-cache');
    reply.header('Expires', '0');

    const body = request.body as any;
    const db = container.resolve<any>('Database');
    const { sessionService } = await import('./session.service');
    const { tenantDataService } = await import('./tenant-data.service');
    const { COOKIE_CONFIG, getCookieOptions } = await import('../../config/cookies');

    // For demo/testing: Exchange code for user
    // In production, this would validate the OAuth code with the provider
    const code = body.code;
    const nationalId = body.nationalId;
    const email = body.email;

    if (!code && !nationalId && !email) {
      reply.code(400);
      return createErrorResponse(request, 'BAD_REQUEST', 'auth.code_or_identifier_required');
    }

    // Demo: Find user by national ID, email, or fallback to first admin
    let userResult;

    if (nationalId) {
      // Look up by national ID (for BankID/Vipps test users)
      userResult = await db
        .select()
        .from(users)
        .where(eq(users.nationalId, nationalId))
        .limit(1);
    } else if (email) {
      // Look up by email
      userResult = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);
    } else {
      // Fallback: Use first active admin user for testing
      userResult = await db
        .select()
        .from(users)
        .where(eq(users.role, 'admin'))
        .limit(1);
    }

    if (!userResult.length) {
      reply.code(401);
      return createErrorResponse(request, 'UNAUTHORIZED', 'auth.invalid_credentials');
    }

    const user = userResult[0];

    // Check if user is active (database uses uppercase status values)
    if (user.status?.toUpperCase() !== 'ACTIVE') {
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
    const { randomBytes } = await import('crypto');
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

    // Audit OAuth callback event
    const authMethod = nationalId ? (user.metadata?.auth_method || 'national-id') : 'oauth-callback';
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
        method: authMethod,
        nationalId: nationalId || undefined,
        code: code ? code.substring(0, 10) + '...' : undefined,
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
   * GET /api/auth/session - Get current session
   * Self-verifying: Validates JWT directly without relying on middleware
   */
  @Get('/session')
  async getSession(request: AuthRequest, reply: FastifyReply) {
    // Add Cache-Control headers to prevent caching of auth responses
    reply.header('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    reply.header('Pragma', 'no-cache');
    reply.header('Expires', '0');

    const db = container.resolve<any>('Database');
    const jwtService = container.resolve<JwtService>('JwtService');

    // Get access token from cookie
    const accessToken = request.cookies[COOKIE_CONFIG.ACCESS.name];

    if (!accessToken) {
      reply.code(401);
      return createErrorResponse(request, 'UNAUTHORIZED', 'auth.no_session');
    }

    // Verify token directly (don't rely on middleware)
    let decoded;
    try {
      decoded = jwtService.verifyToken(accessToken, {
        validateTenant: true,
        validateSubscription: true,
      });
    } catch (error) {
      reply.code(401);
      return createErrorResponse(request, 'UNAUTHORIZED', 'auth.invalid_token');
    }

    const userId = decoded.userId;
    const tenantId = decoded.tenantId;

    // Fetch user from database
    const userResult = await db.select().from(users).where(eq(users.id, userId as string)).limit(1);

    if (!userResult.length) {
      reply.code(401);
      return createErrorResponse(request, 'UNAUTHORIZED', 'auth.no_session');
    }

    const user = userResult[0];

    // Check if user is still active
    if (user.status !== 'active') {
      reply.code(401);
      return createErrorResponse(request, 'UNAUTHORIZED', 'auth.user_inactive');
    }

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
        expiresAt: decoded.exp ? new Date(decoded.exp * 1000).toISOString() : new Date(Date.now() + 86400000).toISOString(),
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
    // Add Cache-Control headers to prevent caching of auth responses
    reply.header('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    reply.header('Pragma', 'no-cache');
    reply.header('Expires', '0');

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
    // Add Cache-Control headers to prevent caching of auth responses
    reply.header('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    reply.header('Pragma', 'no-cache');
    reply.header('Expires', '0');

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
    // Add Cache-Control headers to prevent caching of auth responses
    reply.header('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    reply.header('Pragma', 'no-cache');
    reply.header('Expires', '0');

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

    // Check if user is active (database uses uppercase status values)
    if (user.status?.toUpperCase() !== 'ACTIVE') {
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
    // Add Cache-Control headers to prevent caching of auth responses
    reply.header('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    reply.header('Pragma', 'no-cache');
    reply.header('Expires', '0');

    // Same as login for demo
    return this.login(request, reply);
  }

  /**
   * POST /api/auth/national-id - National ID login (BankID/Vipps test simulation)
   * Authenticates user using Norwegian national ID for testing purposes
   * Sets HTTP-only cookies with access token, refresh token, and CSRF token
   */
  @Post('/national-id')
  async nationalIdLogin(request: AuthRequest, reply: FastifyReply) {
    // Add Cache-Control headers to prevent caching of auth responses
    reply.header('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    reply.header('Pragma', 'no-cache');
    reply.header('Expires', '0');

    const body = request.body as any;
    const db = container.resolve<any>('Database');
    const { sessionService } = await import('./session.service');
    const { COOKIE_CONFIG, getCookieOptions } = await import('../../config/cookies');
    const { randomBytes } = await import('crypto');

    if (!body.nationalId) {
      reply.code(400);
      return createErrorResponse(request, 'BAD_REQUEST', 'auth.national_id_required');
    }

    // Find user by national ID
    const result = await db
      .select()
      .from(users)
      .where(eq(users.nationalId, body.nationalId))
      .limit(1);

    if (!result.length) {
      reply.code(401);
      return createErrorResponse(request, 'UNAUTHORIZED', 'auth.invalid_national_id');
    }

    const user = result[0];

    // Check if user is active
    if (user.status?.toUpperCase() !== 'ACTIVE') {
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

    // Audit national ID login event
    const authMethod = user.metadata?.auth_method || 'national-id';
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
        method: authMethod,
        nationalId: body.nationalId,
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
   * GET /api/auth/providers - List auth providers
   */
  @Get('/providers')
  async getProviders(request: AuthRequest, reply: FastifyReply) {
    return {
      data: [
        { id: 'demo-token', name: 'Demo Token', enabled: true },
        { id: 'national-id', name: 'National ID (Test)', enabled: true },
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
