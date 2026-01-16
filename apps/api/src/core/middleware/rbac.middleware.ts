/**
 * RBAC Middleware
 * Role-based access control middleware for Fastify routes
 *
 * Exports:
 * - requireRole: Check user has one of the required system roles
 * - requireOrgRole: Check user has org-level role (via org_memberships)
 * - requirePermission: Check user has specific permission via PERMISSION_MATRIX
 */
import type { FastifyRequest, FastifyReply, preHandlerHookHandler } from 'fastify';
import { container } from '../container';
import { ForbiddenError, UnauthorizedError } from '../errors/problem-details';
import { eq, and } from 'drizzle-orm';
import { users, orgMemberships } from '../../database/schema/index';
import {
  PERMISSION_MATRIX,
  roleHasPermission,
  getPermissionsForRole as getPermissionsForRoleUtil,
  hasPermission as hasPermissionUtil,
  type SystemRole,
  type OrgRole,
} from '../rbac/permission-matrix';

// Re-export types for backward compatibility
export type { SystemRole, OrgRole } from '../rbac/permission-matrix';

/**
 * Request type extended with user context
 */
interface RBACRequest extends FastifyRequest {
  tenantId?: string | null;
  userId?: string | null;
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
    tenantId: string;
    organizationId?: string | null;
  };
}

/**
 * Get user ID from request (supports both request.user and headers)
 */
function getUserId(request: RBACRequest): string | null {
  return (request as any).userId ||
         (request.user?.id) ||
         (request.headers['x-user-id'] as string) ||
         null;
}

/**
 * Get tenant ID from request (supports both request.tenantId and headers)
 */
function getTenantId(request: RBACRequest): string | null {
  return request.tenantId ||
         (request.user?.tenantId) ||
         (request.headers['x-tenant-id'] as string) ||
         null;
}

/**
 * Fetch user from database
 */
async function fetchUser(userId: string): Promise<any | null> {
  const db = container.resolve<any>('Database');
  const result = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

/**
 * Fetch org membership for user
 */
async function fetchOrgMembership(userId: string, orgId: string): Promise<any | null> {
  const db = container.resolve<any>('Database');
  const result = await db
    .select()
    .from(orgMemberships)
    .where(
      and(
        eq(orgMemberships.userId, userId),
        eq(orgMemberships.orgId, orgId),
        eq(orgMemberships.status, 'active')
      )
    )
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

/**
 * Middleware: Require one of the specified system roles
 *
 * Usage:
 * ```typescript
 * fastify.get('/admin/users', {
 *   preHandler: [requireRole(['admin', 'super_admin'])],
 *   handler: async (request, reply) => { ... }
 * });
 * ```
 */
export function requireRole(allowedRoles: SystemRole[]): preHandlerHookHandler {
  return async function (request: RBACRequest, reply: FastifyReply) {
    const userId = getUserId(request);

    if (!userId) {
      throw new UnauthorizedError('Authentication required');
    }

    const user = await fetchUser(userId);

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    // Attach user to request for downstream handlers
    (request as any).user = user;

    // Check if user's role is in allowed roles
    if (!allowedRoles.includes(user.role as SystemRole)) {
      throw new ForbiddenError(
        `Access denied. Required role: ${allowedRoles.join(' or ')}. Your role: ${user.role}`
      );
    }
  };
}

/**
 * Middleware: Require one of the specified organization-level roles
 *
 * Usage:
 * ```typescript
 * fastify.get('/orgs/:orgId/members', {
 *   preHandler: [requireOrgRole(['org_admin', 'org_case_handler'])],
 *   handler: async (request, reply) => { ... }
 * });
 * ```
 *
 * Note: Expects `orgId` in request params or body
 */
export function requireOrgRole(allowedOrgRoles: OrgRole[]): preHandlerHookHandler {
  return async function (request: RBACRequest, reply: FastifyReply) {
    const userId = getUserId(request);

    if (!userId) {
      throw new UnauthorizedError('Authentication required');
    }

    const user = await fetchUser(userId);

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    // Attach user to request
    (request as any).user = user;

    // System admins bypass org role checks
    if (user.role === 'super_admin' || user.role === 'admin') {
      return;
    }

    // Extract orgId from params or body
    const params = request.params as Record<string, string>;
    const body = request.body as Record<string, string> | undefined;
    const orgId = params?.orgId || params?.id || body?.orgId;

    if (!orgId) {
      throw new ForbiddenError('Organization context required');
    }

    // Fetch org membership
    const membership = await fetchOrgMembership(userId, orgId);

    if (!membership) {
      throw new ForbiddenError('You are not a member of this organization');
    }

    // Check if membership role is allowed
    if (!allowedOrgRoles.includes(membership.orgRole as OrgRole)) {
      throw new ForbiddenError(
        `Access denied. Required organization role: ${allowedOrgRoles.join(' or ')}. Your role: ${membership.orgRole}`
      );
    }

    // Attach membership to request for downstream handlers
    (request as any).orgMembership = membership;
  };
}

/**
 * Middleware: Require specific permission (resource:action)
 *
 * Usage:
 * ```typescript
 * fastify.post('/bookings/:id/approve', {
 *   preHandler: [requirePermission('bookings', 'approve')],
 *   handler: async (request, reply) => { ... }
 * });
 * ```
 */
export function requirePermission(resource: string, action: string): preHandlerHookHandler {
  return async function (request: RBACRequest, reply: FastifyReply) {
    const userId = getUserId(request);

    if (!userId) {
      throw new UnauthorizedError('Authentication required');
    }

    const user = await fetchUser(userId);

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    // Attach user to request
    (request as any).user = user;

    // Check permission matrix
    if (!roleHasPermission(user.role, resource, action)) {
      throw new ForbiddenError(
        `Access denied. Permission required: ${resource}:${action}. Your role: ${user.role}`
      );
    }
  };
}

/**
 * Middleware: Require any of the specified permissions
 *
 * Usage:
 * ```typescript
 * fastify.post('/bookings/:id/status', {
 *   preHandler: [requireAnyPermission([
 *     { resource: 'bookings', action: 'approve' },
 *     { resource: 'bookings', action: 'deny' }
 *   ])],
 *   handler: async (request, reply) => { ... }
 * });
 * ```
 */
export function requireAnyPermission(
  permissions: Array<{ resource: string; action: string }>
): preHandlerHookHandler {
  return async function (request: RBACRequest, reply: FastifyReply) {
    const userId = getUserId(request);

    if (!userId) {
      throw new UnauthorizedError('Authentication required');
    }

    const user = await fetchUser(userId);

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    // Attach user to request
    (request as any).user = user;

    // Check if user has any of the required permissions
    const hasAnyPermission = permissions.some(
      ({ resource, action }) => roleHasPermission(user.role, resource, action)
    );

    if (!hasAnyPermission) {
      const permList = permissions.map(p => `${p.resource}:${p.action}`).join(', ');
      throw new ForbiddenError(
        `Access denied. One of these permissions required: ${permList}. Your role: ${user.role}`
      );
    }
  };
}

/**
 * Middleware: Ensure request has tenant context
 *
 * Usage:
 * ```typescript
 * fastify.get('/api/bookings', {
 *   preHandler: [requireTenantContext],
 *   handler: async (request, reply) => { ... }
 * });
 * ```
 */
export const requireTenantContext: preHandlerHookHandler = async function (
  request: RBACRequest,
  reply: FastifyReply
) {
  const tenantId = getTenantId(request);

  if (!tenantId) {
    throw new ForbiddenError('Tenant context required');
  }

  // Ensure tenantId is attached to request
  request.tenantId = tenantId;
};

/**
 * Utility exports - re-exported from shared permission-matrix module
 */
export const getPermissionsForRole = getPermissionsForRoleUtil;
export const hasPermission = hasPermissionUtil;

// Export permission matrix for use in other modules
export { PERMISSION_MATRIX };
