/**
 * Auth Controller
 * Authentication endpoints including Vipps OIDC integration
 */
import { Controller, Get, Post } from '../../core/decorators';
import { container } from '../../core/container';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { eq } from 'drizzle-orm';
import { users, tenants } from '../../database/schema/index';
import { getAuditService } from '../../core/audit/audit.service';
import { validateReturnToUrl } from '../../core/validation/return-to';
import { isVippsConfigured, getVippsConfig } from '../../config/vipps.config';
import { getVippsLoginService } from '../../integrations/vipps/vipps-login.service';
import { vippsSessionStore } from './vipps-session-store';
import crypto from 'crypto';

interface AuthRequest extends FastifyRequest {
  tenantId?: string | null;
  userId?: string | null;
}

/** Default redirect URL when returnTo is not provided or invalid */
const DEFAULT_REDIRECT_URL = '/';

// Mock JWT generation (in production, use proper JWT library)
function generateMockToken(userId: string, tenantId: string): string {
  const payload = Buffer.from(JSON.stringify({ userId, tenantId, exp: Date.now() + 86400000 })).toString('base64');
  return `mock.${payload}.signature`;
}

@Controller('/api/auth')
export class AuthController {
  /**
   * POST /api/auth/login - Initiate login
   *
   * Body params:
   * - email: User email address
   * - password: User password (mock implementation)
   * - returnTo (optional): URL to redirect to after successful auth
   */
  @Post('/login')
  async login(request: AuthRequest, reply: FastifyReply) {
    const body = request.body as { email?: string; password?: string; returnTo?: string };
    const db = container.resolve<any>('Database');
    const tenantId = request.tenantId || (request.headers['x-tenant-id'] as string);

    // Validate and sanitize returnTo URL (prevents open redirect)
    let validatedReturnTo: string = DEFAULT_REDIRECT_URL;
    if (body.returnTo) {
      const validationResult = validateReturnToUrl(body.returnTo);
      if (validationResult.isValid && validationResult.sanitizedUrl) {
        validatedReturnTo = validationResult.sanitizedUrl;
      } else {
        // Log invalid returnTo attempt for security monitoring
        getAuditService().log({
          tenantId: tenantId || 'unknown',
          userId: 'anonymous',
          action: 'auth_returnto_validation_failed',
          resource: 'auth',
          resourceId: 'login',
          ipAddress: request.ip,
          userAgent: request.headers['user-agent'],
          metadata: {
            attemptedUrl: body.returnTo,
            reason: validationResult.reason,
          },
        });
        // Continue with default redirect instead of blocking
      }
    }

    // Validate required fields
    if (!body.email) {
      reply.code(400);
      return { error: { code: 'BAD_REQUEST', message: 'Email is required' } };
    }

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
    const token = generateMockToken(user.id, user.tenantId);

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
      metadata: { email: user.email, method: 'password', returnTo: validatedReturnTo },
    });

    return {
      data: {
        token,
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          tenantId: user.tenantId,
        },
        returnTo: validatedReturnTo,
      },
    };
  }

  /**
   * POST /api/auth/callback - OAuth callback
   *
   * Body params:
   * - provider: OAuth provider name
   * - code: Authorization code
   * - state: State parameter for CSRF protection
   * - returnTo (optional): URL to redirect to after successful auth
   *
   * On success: Returns auth data with validated returnTo URL
   */
  @Post('/callback')
  async callback(request: AuthRequest, reply: FastifyReply) {
    // Mock OAuth callback - in production integrates with BankID/ID-porten
    const body = request.body as { provider?: string; code?: string; state?: string; returnTo?: string };
    const tenantId = request.tenantId || (request.headers['x-tenant-id'] as string);

    // Validate and sanitize returnTo URL (prevents open redirect)
    let validatedReturnTo: string = DEFAULT_REDIRECT_URL;
    if (body.returnTo) {
      const validationResult = validateReturnToUrl(body.returnTo);
      if (validationResult.isValid && validationResult.sanitizedUrl) {
        validatedReturnTo = validationResult.sanitizedUrl;
      } else {
        // Log invalid returnTo attempt for security monitoring
        getAuditService().log({
          tenantId: tenantId || 'unknown',
          userId: 'anonymous',
          action: 'auth_returnto_validation_failed',
          resource: 'auth',
          resourceId: 'callback',
          ipAddress: request.ip,
          userAgent: request.headers['user-agent'],
          metadata: {
            attemptedUrl: body.returnTo,
            reason: validationResult.reason,
            provider: body.provider || 'mock',
          },
        });
        // Continue with default redirect instead of blocking
      }
    }

    // Audit callback event
    getAuditService().log({
      tenantId: tenantId || 'unknown',
      userId: 'anonymous',
      action: 'auth_callback',
      resource: 'auth',
      resourceId: body.state || 'unknown',
      ipAddress: request.ip,
      userAgent: request.headers['user-agent'],
      metadata: {
        provider: body.provider || 'mock',
        returnTo: validatedReturnTo,
      },
    });

    return {
      data: {
        message: 'OAuth callback processed',
        provider: body.provider || 'mock',
        returnTo: validatedReturnTo,
      },
    };
  }

  /**
   * GET /api/auth/session - Get current session
   */
  @Get('/session')
  async getSession(request: AuthRequest, reply: FastifyReply) {
    const db = container.resolve<any>('Database');
    
    // Try to get userId from cookie first, then fallback to header
    let userId = (request as any).userId || request.headers['x-user-id'];
    let tenantId = request.tenantId || request.headers['x-tenant-id'];
    
    // Parse session cookie if present
    const cookieHeader = request.headers.cookie;
    if (cookieHeader && !userId) {
      const cookies = cookieHeader.split(';').reduce((acc: Record<string, string>, cookie: string) => {
        const [key, value] = cookie.trim().split('=');
        if (key && value) acc[key] = value;
        return acc;
      }, {});
      
      if (cookies.digilist_session) {
        try {
          const session = JSON.parse(decodeURIComponent(cookies.digilist_session));
          userId = session.userId;
          tenantId = tenantId || session.tenantId;
        } catch {
          // Invalid cookie format
        }
      }
    }

    if (!userId) {
      reply.code(401);
      return { error: { code: 'UNAUTHORIZED', message: 'No active session' } };
    }

    const userResult = await db.select().from(users).where(eq(users.id, userId as string)).limit(1);

    if (!userResult.length) {
      reply.code(401);
      return { error: { code: 'UNAUTHORIZED', message: 'User not found' } };
    }

    const user = userResult[0];
    const permissions = getPermissionsForRole(user.role);

    console.log('========================================');
    console.log('[SESSION CHECK]');
    console.log('========================================');
    console.log('User Session:');
    console.log('  ID:', user.id);
    console.log('  Email:', user.email);
    console.log('  Name:', user.name);
    console.log('  Role:', user.role);
    console.log('  Tenant ID:', user.tenantId);
    console.log('  Status:', user.status);
    console.log('  Permissions:', Object.keys(permissions).filter(k => permissions[k]).join(', '));
    console.log('========================================');

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
   *
   * Body params:
   * - returnTo (optional): URL to redirect to after logout
   */
  @Post('/logout')
  async logout(request: AuthRequest, reply: FastifyReply) {
    const body = request.body as { returnTo?: string } | undefined;
    const userId = (request as any).userId || request.headers['x-user-id'];
    const tenantId = request.tenantId || (request.headers['x-tenant-id'] as string);

    // Validate and sanitize returnTo URL (prevents open redirect)
    let validatedReturnTo: string = DEFAULT_REDIRECT_URL;
    if (body?.returnTo) {
      const validationResult = validateReturnToUrl(body.returnTo);
      if (validationResult.isValid && validationResult.sanitizedUrl) {
        validatedReturnTo = validationResult.sanitizedUrl;
      } else {
        // Log invalid returnTo attempt for security monitoring
        getAuditService().log({
          tenantId: tenantId || 'unknown',
          userId: (userId as string) || 'anonymous',
          action: 'auth_returnto_validation_failed',
          resource: 'auth',
          resourceId: 'logout',
          ipAddress: request.ip,
          userAgent: request.headers['user-agent'],
          metadata: {
            attemptedUrl: body.returnTo,
            reason: validationResult.reason,
          },
        });
        // Continue with default redirect instead of blocking
      }
    }

    if (userId && tenantId) {
      getAuditService().log({
        tenantId,
        userId: userId as string,
        action: 'logout',
        resource: 'auth',
        resourceId: userId as string,
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
        metadata: { returnTo: validatedReturnTo },
      });
    }

    // Clear session cookie by setting it with Max-Age=0 and expired date
    // Must match the exact settings used when cookie was created (idporten.controller.ts line 564-580)
    const isProduction = process.env.NODE_ENV === 'production';

    // Set expiration to past date (for browsers that don't support Max-Age)
    const expiredDate = new Date(0).toUTCString();

    const cookieParts = [
      'digilist_session=',
      'Path=/',
      'HttpOnly',
      'Max-Age=0', // Expire immediately
      `Expires=${expiredDate}`, // Also set explicit expiration for older browsers
    ];

    if (isProduction) {
      cookieParts.push('Secure');
      cookieParts.push('SameSite=None');
    } else {
      cookieParts.push('SameSite=Lax');
    }

    const cookieHeader = cookieParts.join('; ');
    reply.header('Set-Cookie', cookieHeader);

    console.log('========================================');
    console.log('[LOGOUT] Session cleared');
    console.log('========================================');
    console.log('User:', userId || 'unknown');
    console.log('Cookie Header:', cookieHeader);
    console.log('Return To:', validatedReturnTo);
    console.log('========================================');

    return { data: { success: true, message: 'Logged out successfully', returnTo: validatedReturnTo } };
  }

  /**
   * POST /api/auth/refresh - Refresh JWT token
   */
  @Post('/refresh')
  async refresh(request: AuthRequest, reply: FastifyReply) {
    const userId = (request as any).userId || request.headers['x-user-id'];
    const tenantId = request.tenantId || (request.headers['x-tenant-id'] as string);

    if (!userId || !tenantId) {
      reply.code(401);
      return { error: { code: 'UNAUTHORIZED', message: 'Invalid session' } };
    }

    const token = generateMockToken(userId as string, tenantId);

    return {
      data: {
        token,
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
      },
    };
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
    const vippsEnabled = isVippsConfigured();

    return {
      data: [
        { id: 'email', name: 'Email', enabled: true },
        { id: 'bankid', name: 'BankID', enabled: false },
        { id: 'idporten', name: 'ID-porten', enabled: false },
        { id: 'vipps', name: 'Vipps', enabled: vippsEnabled },
      ],
    };
  }

  /**
   * POST /api/auth/test-login - Test authentication endpoint
   *
   * ⚠️ TEST/DEV ONLY - Creates real session cookies for E2E testing
   *
   * Body params:
   * - role: User role (admin, saksbehandler, super_admin, user)
   * - tenantId (optional): Tenant ID (defaults to first tenant in DB)
   *
   * Returns: User session with real HttpOnly session cookie
   */
  @Post('/test-login')
  async testLogin(request: AuthRequest, reply: FastifyReply) {
    // ⚠️ SECURITY: Only available in test/dev environment
    if (process.env.NODE_ENV === 'production') {
      reply.code(404);
      return { error: { code: 'NOT_FOUND', message: 'Endpoint not found' } };
    }

    const body = request.body as { role?: string; tenantId?: string };
    const db = container.resolve<any>('Database');

    // Validate role
    const validRoles = ['admin', 'saksbehandler', 'super_admin', 'user', 'citizen'];
    const role = body.role || 'user';
    if (!validRoles.includes(role)) {
      reply.code(400);
      return {
        error: {
          code: 'BAD_REQUEST',
          message: `Invalid role. Must be one of: ${validRoles.join(', ')}`
        }
      };
    }

    // Get or create tenant
    let tenantId = body.tenantId;
    if (!tenantId) {
      const defaultTenants = await db.select().from(tenants).limit(1);
      tenantId = defaultTenants.length > 0 ? defaultTenants[0].id : 'test-tenant';
    }

    // Find or create test user with specified role
    const testEmail = `test-${role}@test.kommune.no`;
    let user = null;

    const existingUsers = await db
      .select()
      .from(users)
      .where(eq(users.email, testEmail))
      .limit(1);

    if (existingUsers.length > 0) {
      user = existingUsers[0];

      // Update role if different
      if (user.role !== role) {
        await db
          .update(users)
          .set({ role, updatedAt: new Date() })
          .where(eq(users.id, user.id));
        user.role = role;
      }
    } else {
      // Create new test user
      const newUserId = crypto.randomUUID();
      await db.insert(users).values({
        id: newUserId,
        email: testEmail,
        name: `Test ${role.charAt(0).toUpperCase() + role.slice(1)}`,
        role,
        tenantId,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const createdUsers = await db
        .select()
        .from(users)
        .where(eq(users.id, newUserId))
        .limit(1);

      user = createdUsers[0];
    }

    // Update last login
    await db
      .update(users)
      .set({ lastLoginAt: new Date() })
      .where(eq(users.id, user.id));

    // Create session cookie (same format as idporten.controller.ts line 564-580)
    const cookieValue = encodeURIComponent(JSON.stringify({
      userId: user.id,
      tenantId: user.tenantId
    }));

    const cookieParts = [
      `digilist_session=${cookieValue}`,
      'Path=/',
      'HttpOnly',
      'Max-Age=86400', // 24 hours
      'SameSite=Lax',
    ];

    reply.header('Set-Cookie', cookieParts.join('; '));

    // Audit log test login
    getAuditService().log({
      tenantId: user.tenantId,
      userId: user.id,
      action: 'test_login',
      resource: 'auth',
      resourceId: user.id,
      ipAddress: request.ip,
      userAgent: request.headers['user-agent'],
      metadata: {
        role,
        email: user.email,
        method: 'test-endpoint',
      },
    });

    console.log('========================================');
    console.log('[TEST LOGIN] Session created');
    console.log('========================================');
    console.log('User:', user.email);
    console.log('Role:', user.role);
    console.log('User ID:', user.id);
    console.log('Tenant ID:', user.tenantId);
    console.log('Cookie:', cookieParts.join('; '));
    console.log('========================================');

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

  // ===========================================================================
  // Vipps Login (OIDC) Endpoints
  // ===========================================================================

  /**
   * GET /api/auth/vipps/authorize - Initiate Vipps OIDC authorization flow
   *
   * Query params:
   * - returnTo (optional): URL to redirect to after successful auth
   * - tenantId (optional): Tenant context for multi-tenant isolation
   *
   * Redirects user to Vipps Login
   */
  @Get('/vipps/authorize')
  async vippsAuthorize(request: AuthRequest, reply: FastifyReply) {
    // Check if Vipps is configured
    if (!isVippsConfigured()) {
      reply.code(503);
      return {
        error: {
          code: 'SERVICE_UNAVAILABLE',
          message: 'Vipps login is not configured',
        },
      };
    }

    const query = request.query as { returnTo?: string; tenantId?: string };
    const tenantId = query.tenantId || (request.headers['x-tenant-id'] as string);

    // Validate and sanitize returnTo URL (prevents open redirect)
    let validatedReturnTo: string = DEFAULT_REDIRECT_URL;
    if (query.returnTo) {
      const validationResult = validateReturnToUrl(query.returnTo);
      if (validationResult.isValid && validationResult.sanitizedUrl) {
        validatedReturnTo = validationResult.sanitizedUrl;
      } else {
        // Log invalid returnTo attempt for security monitoring
        getAuditService().log({
          tenantId: tenantId || null,
          userId: null,
          action: 'vipps_auth_returnto_validation_failed',
          resource: 'vipps',
          resourceId: null,
          ipAddress: request.ip,
          userAgent: request.headers['user-agent'],
          metadata: {
            attemptedUrl: query.returnTo,
            reason: validationResult.reason,
          },
        });
        // Continue with default redirect instead of blocking
        validatedReturnTo = DEFAULT_REDIRECT_URL;
      }
    }

    try {
      const loginService = getVippsLoginService();
      const config = getVippsConfig();

      // Generate state and nonce for OIDC security
      const state = loginService.generateState();
      const nonce = loginService.generateNonce();

      // Build redirect URI (callback URL)
      const redirectUri = config.authCallbackUrl;

      // DEBUG: Log what we're storing
      console.log('[VIPPS AUTHORIZE] Initiating auth:');
      console.log('  state:', state);
      console.log('  validatedReturnTo:', validatedReturnTo);
      console.log('  tenantId:', tenantId);
      console.log('  redirectUri:', redirectUri);

      // Store session with returnTo for post-auth redirect
      await vippsSessionStore.set(state, {
        state,
        nonce,
        createdAt: Date.now(),
        returnTo: validatedReturnTo,
        tenantId: tenantId || null,
      });

      // Get authorization URL from Vipps Login service
      const result = await loginService.getAuthorizationUrl({
        state,
        nonce,
        redirectUri,
        scopes: undefined, // Use default scopes
      });

      // Audit log auth initiation
      getAuditService().log({
        tenantId: tenantId || null,
        userId: null,
        action: 'vipps_auth_initiated',
        resource: 'vipps',
        resourceId: state,
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
        metadata: {
          returnTo: validatedReturnTo,
          redirectUri,
        },
      });

      // Redirect to Vipps authorization URL
      return reply.redirect(result.authorizationUrl);
    } catch (error) {
      getAuditService().log({
        tenantId: tenantId || null,
        userId: null,
        action: 'vipps_auth_initiation_error',
        resource: 'vipps',
        resourceId: null,
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
        metadata: {
          error: error instanceof Error ? error.message : 'Unknown error',
          returnTo: validatedReturnTo,
        },
      });

      reply.code(500);
      return {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to initiate Vipps login',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * GET /api/auth/vipps/callback - Handle Vipps OAuth callback
   *
   * Query params:
   * - code: Authorization code from Vipps
   * - state: State parameter for CSRF validation
   * - error (optional): Error code if auth failed
   * - error_description (optional): Error description
   *
   * Redirects user back to frontend with session
   */
  @Get('/vipps/callback')
  async vippsCallbackGet(request: AuthRequest, reply: FastifyReply) {
    if (!isVippsConfigured()) {
      reply.code(503);
      return {
        error: {
          code: 'SERVICE_UNAVAILABLE',
          message: 'Vipps login is not configured',
        },
      };
    }

    const query = request.query as {
      code?: string;
      state?: string;
      error?: string;
      error_description?: string;
    };

    // DEBUG: Log callback parameters
    console.log('[VIPPS CALLBACK] Received callback:');
    console.log('  code:', query.code ? `${query.code.substring(0, 20)}...` : 'missing');
    console.log('  state:', query.state);
    console.log('  error:', query.error);

    // Handle error from Vipps
    if (query.error) {
      getAuditService().log({
        tenantId: null,
        userId: null,
        action: 'vipps_callback_error',
        resource: 'vipps',
        resourceId: query.state || null,
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
        metadata: {
          error: query.error,
          errorDescription: query.error_description,
        },
      });

      // Redirect to frontend with error
      const errorUrl = `${process.env.FRONTEND_URL || 'https://web-test.digilist.no'}/login?error=${encodeURIComponent(query.error)}&error_description=${encodeURIComponent(query.error_description || '')}`;
      return reply.redirect(errorUrl);
    }

    // Validate required fields
    if (!query.code || !query.state) {
      reply.code(400);
      return {
        error: {
          code: 'BAD_REQUEST',
          message: 'Missing required parameters: code, state',
        },
      };
    }

    try {
      // Retrieve session from Redis
      const session = await vippsSessionStore.get(query.state);

      console.log('[VIPPS CALLBACK] Retrieved session:');
      console.log('  session:', session ? 'found' : 'not found');
      console.log('  returnTo:', session?.returnTo);

      if (!session) {
        getAuditService().log({
          tenantId: null,
          userId: null,
          action: 'vipps_callback_session_expired',
          resource: 'vipps',
          resourceId: query.state,
          ipAddress: request.ip,
          userAgent: request.headers['user-agent'],
          metadata: {
            state: query.state,
          },
        });

        // Redirect to frontend with error
        const errorUrl = `${process.env.FRONTEND_URL || 'https://web-test.digilist.no'}/login?error=session_expired`;
        return reply.redirect(errorUrl);
      }

      const loginService = getVippsLoginService();
      const config = getVippsConfig();

      // Exchange code for tokens
      const result = await loginService.completeLogin(
        query.code,
        config.authCallbackUrl,
        session.nonce
      );

      // Find or create user
      const db = container.resolve<any>('Database');
      let user = null;

      if (result.userInfo.email) {
        const existingUsers = await db
          .select()
          .from(users)
          .where(eq(users.email, result.userInfo.email))
          .limit(1);

        if (existingUsers.length > 0) {
          user = existingUsers[0];
        }
      }

      // If no user found, create new user
      if (!user) {
        const defaultTenant = await db
          .select()
          .from(tenants)
          .limit(1);

        const tenantId = session.tenantId || (defaultTenant.length > 0 ? defaultTenant[0].id : 'default-tenant');

        const newUser = await db
          .insert(users)
          .values({
            id: crypto.randomUUID(),
            tenantId,
            email: result.userInfo.email || `vipps_${result.claims.sub}@temp.digilist.no`,
            name: result.userInfo.name || result.userInfo.given_name || 'Vipps User',
            role: 'citizen',
            phoneNumber: result.userInfo.phone_number,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning();

        user = newUser[0];
      }

      // Update last login
      await db
        .update(users)
        .set({ lastLoginAt: new Date() })
        .where(eq(users.id, user.id));

      // Generate JWT token
      const token = generateMockToken(user.id, user.tenantId);

      // Audit successful login
      getAuditService().log({
        tenantId: user.tenantId,
        userId: user.id,
        action: 'vipps_login_success',
        resource: 'auth',
        resourceId: user.id,
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
        metadata: {
          email: user.email,
          returnTo: session.returnTo,
        },
      });

      // Clean up session
      await vippsSessionStore.delete(query.state);

      // Redirect to frontend with token
      const redirectUrl = new URL(session.returnTo);
      redirectUrl.searchParams.set('token', token);
      redirectUrl.searchParams.set('userId', user.id);

      console.log('[VIPPS CALLBACK] Redirecting to:', redirectUrl.toString());

      return reply.redirect(redirectUrl.toString());
    } catch (error) {
      console.error('[VIPPS CALLBACK] Error:', error);

      getAuditService().log({
        tenantId: null,
        userId: null,
        action: 'vipps_callback_error',
        resource: 'vipps',
        resourceId: query.state || null,
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
        metadata: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });

      reply.code(500);
      return {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to complete Vipps login',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * POST /api/auth/vipps/start - Initiate Vipps Login
   * 
   * Body params:
   * - redirectUri: Callback URL after Vipps auth
   * - returnTo (optional): URL to redirect after login completes
   * - scopes (optional): Requested OIDC scopes
   * 
   * Returns: Authorization URL and state/nonce for validation
   */
  @Post('/vipps/start')
  async vippsStart(request: AuthRequest, reply: FastifyReply) {
    // Check if Vipps is configured
    if (!isVippsConfigured()) {
      reply.code(503);
      return {
        error: {
          code: 'SERVICE_UNAVAILABLE',
          message: 'Vipps login is not configured',
        },
      };
    }

    const body = request.body as {
      redirectUri?: string;
      returnTo?: string;
      scopes?: string[];
    };

    // Validate redirect URI
    if (!body.redirectUri) {
      reply.code(400);
      return {
        error: {
          code: 'BAD_REQUEST',
          message: 'redirectUri is required',
        },
      };
    }

    // Validate returnTo URL for security
    let validatedReturnTo = '/';
    if (body.returnTo) {
      const validation = validateReturnToUrl(body.returnTo);
      if (validation.isValid && validation.sanitizedUrl) {
        validatedReturnTo = validation.sanitizedUrl;
      }
    }

    try {
      const loginService = getVippsLoginService();
      
      // Generate state and nonce
      const state = loginService.generateState();
      const nonce = loginService.generateNonce();
      
      // Build authorization URL
      const result = await loginService.getAuthorizationUrl({
        state,
        nonce,
        redirectUri: body.redirectUri,
        scopes: body.scopes,
      });
      
      // Store state/nonce in session or return to client for validation
      // In production, store in Redis/DB with short TTL
      return {
        data: {
          authorizationUrl: result.authorizationUrl,
          state: result.state,
          nonce: result.nonce,
          returnTo: validatedReturnTo,
        },
      };
    } catch (error) {
      getAuditService().log({
        tenantId: request.tenantId || 'unknown',
        userId: 'anonymous',
        action: 'vipps_login_start_failed',
        resource: 'auth',
        resourceId: 'vipps',
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
        metadata: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
      
      reply.code(500);
      return {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to initiate Vipps login',
        },
      };
    }
  }

  /**
   * POST /api/auth/vipps/callback - Handle Vipps OAuth callback
   * 
   * Body params:
   * - code: Authorization code from Vipps
   * - state: State parameter for CSRF validation
   * - nonce: Nonce for ID token validation
   * - redirectUri: Original redirect URI (must match start request)
   * 
   * Returns: User session data
   */
  @Post('/vipps/callback')
  async vippsCallback(request: AuthRequest, reply: FastifyReply) {
    if (!isVippsConfigured()) {
      reply.code(503);
      return {
        error: {
          code: 'SERVICE_UNAVAILABLE',
          message: 'Vipps login is not configured',
        },
      };
    }

    const body = request.body as {
      code?: string;
      state?: string;
      nonce?: string;
      redirectUri?: string;
      error?: string;
      error_description?: string;
    };

    // Handle error from Vipps
    if (body.error) {
      getAuditService().log({
        tenantId: request.tenantId || 'unknown',
        userId: 'anonymous',
        action: 'vipps_login_error',
        resource: 'auth',
        resourceId: body.state || 'unknown',
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
        metadata: {
          error: body.error,
          errorDescription: body.error_description,
        },
      });
      
      reply.code(401);
      return {
        error: {
          code: 'AUTH_FAILED',
          message: body.error_description || 'Vipps authentication failed',
        },
      };
    }

    // Validate required fields
    if (!body.code || !body.state || !body.nonce || !body.redirectUri) {
      reply.code(400);
      return {
        error: {
          code: 'BAD_REQUEST',
          message: 'Missing required parameters: code, state, nonce, redirectUri',
        },
      };
    }

    try {
      const loginService = getVippsLoginService();
      
      // Complete login flow
      const { tokens, claims, userInfo } = await loginService.completeLogin(
        body.code,
        body.redirectUri,
        body.nonce
      );
      
      // Find or create user (delegated to VippsUserService)
      const db = container.resolve<any>('Database');
      
      // Look up user by email (primary identifier we have in schema)
      let user = null;
      if (userInfo.email) {
        const existingUsers = await db
          .select()
          .from(users)
          .where(eq(users.email, userInfo.email))
          .limit(1);
        
        if (existingUsers.length > 0) {
          user = existingUsers[0];
        }
      }
      
      // If still no user, create one
      if (!user) {
        // Get default tenant
        const defaultTenants = await db.select().from(tenants).limit(1);
        const defaultTenantId = defaultTenants.length > 0 ? defaultTenants[0].id : 'default';
        
        const newUserId = `vipps-${claims.sub}`;
        await db.insert(users).values({
          id: newUserId,
          email: userInfo.email || `${claims.sub}@vipps.user`,
          name: userInfo.name || 'Vipps User',
          role: 'user',
          tenantId: defaultTenantId,
          metadata: {
            vippsSub: claims.sub,
            phoneNumber: userInfo.phone_number,
            provider: 'vipps',
          },
          createdAt: new Date(),
        });
        
        const createdUsers = await db
          .select()
          .from(users)
          .where(eq(users.id, newUserId))
          .limit(1);
        
        user = createdUsers[0];
        
        getAuditService().log({
          tenantId: defaultTenantId,
          userId: newUserId,
          action: 'user_created_via_vipps',
          resource: 'user',
          resourceId: newUserId,
          ipAddress: request.ip,
          userAgent: request.headers['user-agent'],
          metadata: {
            vippsSub: claims.sub,
            email: userInfo.email,
            phone: userInfo.phone_number,
          },
        });
      }
      
      // Update last login and store Vipps sub in metadata
      const currentMetadata = user.metadata || {};
      await db.update(users).set({ 
        lastLoginAt: new Date(),
        metadata: {
          ...currentMetadata,
          vippsSub: claims.sub,
          phoneNumber: userInfo.phone_number,
          provider: 'vipps',
          lastVippsLogin: new Date().toISOString(),
        },
      }).where(eq(users.id, user.id));
      
      // Generate session token
      const token = generateMockToken(user.id, user.tenantId);
      
      // Audit successful login
      getAuditService().log({
        tenantId: user.tenantId,
        userId: user.id,
        action: 'login',
        resource: 'auth',
        resourceId: user.id,
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
        metadata: {
          method: 'vipps',
          vippsSub: claims.sub,
        },
      });
      
      return {
        data: {
          token,
          expiresAt: new Date(Date.now() + 86400000).toISOString(),
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            tenantId: user.tenantId,
          },
        },
      };
    } catch (error) {
      getAuditService().log({
        tenantId: request.tenantId || 'unknown',
        userId: 'anonymous',
        action: 'vipps_login_callback_failed',
        resource: 'auth',
        resourceId: body.state || 'unknown',
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
        metadata: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
      
      reply.code(401);
      return {
        error: {
          code: 'AUTH_FAILED',
          message: error instanceof Error ? error.message : 'Vipps authentication failed',
        },
      };
    }
  }
}

// Helper: Get permissions based on role
function getPermissionsForRole(role: string): string[] {
  const permissions: Record<string, string[]> = {
    admin: [
      'dashboard:*',
      'listings:*',
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
      'listings:*',
      'bookings:*',
      'organizations:read',
      'reports:read',
      'calendar:*',
      'messages:*',
      'seasonal-leases:*',
    ],
    user: [
      'listings:read',
      'bookings:read',
      'bookings:create',
      'messages:read',
      'messages:create',
    ],
  };

  return permissions[role] || permissions.user;
}
