/**
 * Authorization (RBAC) Controller
 * Role-based access control endpoints
 */
import { Controller, Get, Post } from '../../core/decorators';
import { container } from '../../core/container';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { eq } from 'drizzle-orm';
import { users } from '../../database/schema/index';

interface AuthzRequest extends FastifyRequest {
  tenantId?: string | null;
  userId?: string | null;
}

// Permission matrix
const PERMISSION_MATRIX: Record<string, Record<string, string[]>> = {
  admin: {
    dashboard: ['read', 'write'],
    listings: ['create', 'read', 'update', 'delete', 'publish', 'archive'],
    bookings: ['create', 'read', 'update', 'delete', 'confirm', 'cancel'],
    users: ['create', 'read', 'update', 'delete', 'deactivate', 'reactivate'],
    organizations: ['create', 'read', 'update', 'delete', 'verify'],
    reports: ['read', 'export'],
    settings: ['read', 'write'],
    calendar: ['read', 'write', 'block'],
    messages: ['read', 'write', 'resolve'],
    'seasonal-leases': ['create', 'read', 'update', 'delete', 'terminate'],
    audit: ['read'],
  },
  saksbehandler: {
    dashboard: ['read'],
    listings: ['create', 'read', 'update', 'publish', 'archive'],
    bookings: ['create', 'read', 'update', 'confirm', 'cancel'],
    users: [],
    organizations: ['read'],
    reports: ['read'],
    settings: [],
    calendar: ['read', 'write', 'block'],
    messages: ['read', 'write', 'resolve'],
    'seasonal-leases': ['create', 'read', 'update'],
    audit: [],
  },
  user: {
    dashboard: [],
    listings: ['read'],
    bookings: ['create', 'read'],
    users: [],
    organizations: [],
    reports: [],
    settings: [],
    calendar: ['read'],
    messages: ['read', 'write'],
    'seasonal-leases': [],
    audit: [],
  },
};

@Controller('/api/authz')
export class AuthzController {
  /**
   * GET /api/authz/permissions - Get current user's permissions
   */
  @Get('/permissions')
  async getPermissions(request: AuthzRequest, reply: FastifyReply) {
    const db = container.resolve<any>('Database');
    const userId = (request as any).userId;

    if (!userId) {
      reply.code(401);
      return { error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } };
    }

    const userResult = await db.select().from(users).where(eq(users.id, userId as string)).limit(1);

    if (!userResult.length) {
      reply.code(401);
      return { error: { code: 'UNAUTHORIZED', message: 'User not found' } };
    }

    const user = userResult[0];
    const rolePermissions = PERMISSION_MATRIX[user.role] || PERMISSION_MATRIX.user;

    // Format as flat permission strings
    const permissions: string[] = [];
    for (const [resource, actions] of Object.entries(rolePermissions)) {
      for (const action of actions) {
        permissions.push(`${resource}:${action}`);
      }
    }

    return {
      data: {
        role: user.role,
        permissions,
        resources: rolePermissions,
      },
    };
  }

  /**
   * GET /api/authz/check - Check specific permission
   */
  @Get('/check')
  async checkPermission(request: AuthzRequest, reply: FastifyReply) {
    const db = container.resolve<any>('Database');
    const userId = (request as any).userId;
    const { resource, action } = request.query as { resource?: string; action?: string };

    if (!resource || !action) {
      reply.code(400);
      return { error: { code: 'VALIDATION_ERROR', message: 'resource and action are required' } };
    }

    if (!userId) {
      return {
        data: {
          allowed: false,
          role: 'anonymous',
          permissions: [],
        },
      };
    }

    const userResult = await db.select().from(users).where(eq(users.id, userId as string)).limit(1);

    if (!userResult.length) {
      return {
        data: {
          allowed: false,
          role: 'anonymous',
          permissions: [],
        },
      };
    }

    const user = userResult[0];
    const rolePermissions = PERMISSION_MATRIX[user.role] || PERMISSION_MATRIX.user;
    const resourceActions = rolePermissions[resource] || [];
    const allowed = resourceActions.includes(action) || resourceActions.includes('*');

    return {
      data: {
        allowed,
        role: user.role,
        permissions: resourceActions.map((a: string) => `${resource}:${a}`),
      },
    };
  }
}

// Export for use in middleware
export { PERMISSION_MATRIX };
