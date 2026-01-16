/**
 * Auth Controller
 * Authentication endpoints (mock implementation for demo)
 */
import { Controller, Get, Post } from '../../core/decorators';
import { container } from '../../core/container';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { eq } from 'drizzle-orm';
import { users, tenants } from '../../database/schema/index';
import { getAuditService } from '../../core/audit/audit.service';
import { getPermissionsForRole, getCapabilityProjection, isValidRole } from './rbac';

interface AuthRequest extends FastifyRequest {
  tenantId?: string | null;
  userId?: string | null;
}

// Mock JWT generation (in production, use proper JWT library)
function generateMockToken(userId: string, tenantId: string): string {
  const payload = Buffer.from(JSON.stringify({ userId, tenantId, exp: Date.now() + 86400000 })).toString('base64');
  return `mock.${payload}.signature`;
}

@Controller('/api/auth')
export class AuthController {
  /**
   * POST /api/auth/login - Initiate login
   */
  @Post('/login')
  async login(request: AuthRequest, reply: FastifyReply) {
    const body = request.body as any;
    const db = container.resolve<any>('Database');

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
      metadata: { email: user.email, method: 'password' },
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
   */
  @Post('/logout')
  async logout(request: AuthRequest, reply: FastifyReply) {
    const userId = (request as any).userId || request.headers['x-user-id'];
    const tenantId = request.tenantId || (request.headers['x-tenant-id'] as string);

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

    return { data: { success: true, message: 'Logged out successfully' } };
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
