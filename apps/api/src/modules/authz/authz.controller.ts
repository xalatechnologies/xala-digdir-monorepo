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
// System-level roles: admin, saksbehandler, user
// Organization-scoped roles: COMMUNE_ADMIN, ORG_ADMIN, ORG_CASE_HANDLER, ORG_MEMBER
const PERMISSION_MATRIX: Record<string, Record<string, string[]>> = {
  // System-level admin role (super admin)
  admin: {
    dashboard: ['read', 'write'],
    listings: ['create', 'read', 'update', 'delete', 'publish', 'archive'],
    bookings: ['create', 'read', 'update', 'delete', 'confirm', 'cancel', 'approve', 'deny'],
    users: ['create', 'read', 'update', 'delete', 'deactivate', 'reactivate'],
    organizations: ['create', 'read', 'update', 'delete', 'verify'],
    reports: ['read', 'export'],
    settings: ['read', 'write'],
    calendar: ['read', 'write', 'block'],
    messages: ['read', 'write', 'resolve'],
    'seasonal-leases': ['create', 'read', 'update', 'delete', 'terminate'],
    audit: ['read'],
    'access-grants': ['create', 'read', 'update', 'delete'],
    'org-members': ['create', 'read', 'update', 'delete'],
    'org-permissions': ['create', 'read', 'update', 'delete'],
    'case-handler-scopes': ['create', 'read', 'update', 'delete'],
  },

  // System-level case handler (Norwegian: saksbehandler)
  saksbehandler: {
    dashboard: ['read'],
    listings: ['create', 'read', 'update', 'publish', 'archive'],
    bookings: ['create', 'read', 'update', 'confirm', 'cancel', 'approve', 'deny'],
    users: [],
    organizations: ['read'],
    reports: ['read'],
    settings: [],
    calendar: ['read', 'write', 'block'],
    messages: ['read', 'write', 'resolve'],
    'seasonal-leases': ['create', 'read', 'update'],
    audit: [],
    'access-grants': ['read'],
    'org-members': ['read'],
    'org-permissions': ['read'],
    'case-handler-scopes': ['read'],
  },

  // Basic user role
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
    'access-grants': [],
    'org-members': [],
    'org-permissions': [],
    'case-handler-scopes': [],
  },

  // ============================================================
  // Organization-scoped roles (Backoffice RBAC hierarchy)
  // ============================================================

  // Commune Admin: Tenant authority who owns rental_objects and grants org access
  // Full CRUD on access-grants, approve/deny/block/cancel/edit bookings
  COMMUNE_ADMIN: {
    dashboard: ['read', 'write'],
    listings: ['create', 'read', 'update', 'delete', 'publish', 'archive'],
    bookings: ['create', 'read', 'update', 'delete', 'confirm', 'cancel', 'approve', 'deny'],
    users: ['create', 'read', 'update', 'delete', 'deactivate', 'reactivate'],
    organizations: ['create', 'read', 'update', 'delete', 'verify'],
    reports: ['read', 'export'],
    settings: ['read', 'write'],
    calendar: ['read', 'write', 'block'],
    messages: ['read', 'write', 'resolve'],
    'seasonal-leases': ['create', 'read', 'update', 'delete', 'terminate'],
    audit: ['read'],
    'access-grants': ['create', 'read', 'update', 'delete'],
    'org-members': ['read'],
    'org-permissions': ['read'],
    'case-handler-scopes': ['create', 'read', 'update', 'delete'],
  },

  // Organization Admin: Manages org members and assigns per-rental-object permissions
  // CRUD on org members/permissions, approve/deny/cancel/edit bookings (scoped to org's rental objects)
  ORG_ADMIN: {
    dashboard: ['read'],
    listings: ['read'],
    bookings: ['create', 'read', 'update', 'cancel', 'approve', 'deny'],
    users: ['read'],
    organizations: ['read', 'update'],
    reports: ['read'],
    settings: [],
    calendar: ['read', 'write'],
    messages: ['read', 'write', 'resolve'],
    'seasonal-leases': ['read'],
    audit: [],
    'access-grants': ['read'],
    'org-members': ['create', 'read', 'update', 'delete'],
    'org-permissions': ['create', 'read', 'update', 'delete'],
    'case-handler-scopes': ['create', 'read', 'update', 'delete'],
  },

  // Organization Case Handler: Can approve bookings (no deny), scoped to org's rental objects
  // Approve and edit bookings within assigned scope
  ORG_CASE_HANDLER: {
    dashboard: ['read'],
    listings: ['read'],
    bookings: ['read', 'update', 'approve'],
    users: [],
    organizations: ['read'],
    reports: ['read'],
    settings: [],
    calendar: ['read'],
    messages: ['read', 'write'],
    'seasonal-leases': ['read'],
    audit: [],
    'access-grants': ['read'],
    'org-members': ['read'],
    'org-permissions': ['read'],
    'case-handler-scopes': ['read'],
  },

  // Organization Member: Basic member with limited per-rental-object permissions
  // Read listings, read/cancel/edit bookings based on assigned per-RO permissions
  ORG_MEMBER: {
    dashboard: [],
    listings: ['read'],
    bookings: ['create', 'read', 'update', 'cancel'],
    users: [],
    organizations: ['read'],
    reports: [],
    settings: [],
    calendar: ['read'],
    messages: ['read', 'write'],
    'seasonal-leases': [],
    audit: [],
    'access-grants': [],
    'org-members': ['read'],
    'org-permissions': ['read'],
    'case-handler-scopes': [],
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
    const userId = (request as any).userId || request.headers['x-user-id'];

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
    const userId = (request as any).userId || request.headers['x-user-id'];
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
