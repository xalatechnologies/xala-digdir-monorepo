/**
 * Authorization (RBAC) Controller
 * Role-based access control endpoints
 */
import { Controller, Get, Post } from '../../core/decorators';
import { container } from '../../core/container';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { eq } from 'drizzle-orm';
import { users } from '../../database/schema/index';
import { PERMISSION_MATRIX } from '../../core/rbac/permission-matrix';

interface AuthzRequest extends FastifyRequest {
  tenantId?: string | null;
  userId?: string | null;
}

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

/**
 * Me Controller
 * User-centric endpoints for current user data
 */
@Controller('/api/me')
export class MeController {
  /**
   * GET /api/me/capabilities - Get current user's capabilities projection
   * Returns a comprehensive view of what the authenticated user can do
   */
  @Get('/capabilities')
  async getCapabilities(request: AuthzRequest, reply: FastifyReply) {
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
    const role = user.role || 'user';
    const rolePermissions = PERMISSION_MATRIX[role] || PERMISSION_MATRIX.user;

    // Build capabilities object grouped by resource
    const capabilities: Record<string, { actions: string[]; canRead: boolean; canWrite: boolean; canDelete: boolean }> = {};

    for (const [resource, actions] of Object.entries(rolePermissions)) {
      capabilities[resource] = {
        actions,
        canRead: actions.includes('read'),
        canWrite: actions.includes('write') || actions.includes('create') || actions.includes('update'),
        canDelete: actions.includes('delete'),
      };
    }

    // Build flat permission strings
    const permissions: string[] = [];
    for (const [resource, actions] of Object.entries(rolePermissions)) {
      for (const action of actions) {
        permissions.push(`${resource}:${action}`);
      }
    }

    // Determine high-level capabilities based on role
    const isAdmin = role === 'admin' || role === 'COMMUNE_ADMIN';
    const isCaseHandler = role === 'saksbehandler' || role === 'ORG_CASE_HANDLER';
    const isOrgAdmin = role === 'ORG_ADMIN';
    const isOrgMember = role === 'ORG_MEMBER';

    return {
      data: {
        userId: user.id,
        role,
        organizationId: user.organizationId || null,
        permissions,
        capabilities,
        // High-level capability flags for easy frontend checks
        flags: {
          isAdmin,
          isCaseHandler,
          isOrgAdmin,
          isOrgMember,
          canManageUsers: rolePermissions.users?.includes('create') || rolePermissions.users?.includes('update') || false,
          canManageOrganizations: rolePermissions.organizations?.includes('create') || rolePermissions.organizations?.includes('update') || false,
          canApproveBookings: rolePermissions.bookings?.includes('approve') || false,
          canDenyBookings: rolePermissions.bookings?.includes('deny') || false,
          canManageListings: rolePermissions.listings?.includes('create') || rolePermissions.listings?.includes('update') || false,
          canViewAudit: rolePermissions.audit?.includes('read') || false,
          canExportReports: rolePermissions.reports?.includes('export') || false,
          canManageAccessGrants: rolePermissions['access-grants']?.includes('create') || rolePermissions['access-grants']?.includes('update') || false,
          canManageOrgMembers: rolePermissions['org-members']?.includes('create') || rolePermissions['org-members']?.includes('update') || false,
          canManageCaseHandlerScopes: rolePermissions['case-handler-scopes']?.includes('create') || rolePermissions['case-handler-scopes']?.includes('update') || false,
        },
      },
    };
  }

  /**
   * GET /api/me/navigation - Get current user's navigation menu
   * Returns server-generated menu structure based on role and permissions
   */
  @Get('/navigation')
  async getNavigation(request: AuthzRequest, reply: FastifyReply) {
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
    const role = user.role || 'user';

    // Import menu generator
    const { generateAdminMenu } = await import('../../core/admin-menu');
    const menu = generateAdminMenu(role);

    // Get user's permissions
    const rolePermissions = PERMISSION_MATRIX[role] || PERMISSION_MATRIX.user;
    const permissions: string[] = [];
    for (const [resource, actions] of Object.entries(rolePermissions)) {
      for (const action of actions) {
        permissions.push(`${resource}:${action}`);
      }
    }

    return {
      data: {
        currentUser: {
          id: user.id,
          role: user.role,
          tenantId: user.tenantId || null,
          organizationId: user.organizationId || null,
        },
        permissions,
        menu,
        featureFlags: {}, // Placeholder for future feature flags
      },
    };
  }
}

// Export for use in middleware
export { PERMISSION_MATRIX };
