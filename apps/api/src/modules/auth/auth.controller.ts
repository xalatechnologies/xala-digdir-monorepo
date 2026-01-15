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
    const userId = (request as any).userId || request.headers['x-user-id'];
    const tenantId = request.tenantId || request.headers['x-tenant-id'];

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

  // ===========================================================================
  // Vipps Login (OIDC) Endpoints
  // ===========================================================================

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
