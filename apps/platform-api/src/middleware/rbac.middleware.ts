/**
 * RBAC Middleware
 * Role-Based Access Control for API endpoints
 */

import { FastifyRequest, FastifyReply } from 'fastify';

/**
 * User roles in the system
 */
export enum UserRole {
  CITIZEN = 'CITIZEN',
  CASEWORKER = 'CASEWORKER',
  ADMIN = 'ADMIN',
  SAAS_ADMIN = 'SAAS_ADMIN',
}

/**
 * Role hierarchy (higher roles include lower role permissions)
 */
const ROLE_HIERARCHY: Record<UserRole, number> = {
  [UserRole.CITIZEN]: 1,
  [UserRole.CASEWORKER]: 2,
  [UserRole.ADMIN]: 3,
  [UserRole.SAAS_ADMIN]: 4,
};

/**
 * Middleware to require authentication
 * Verifies that user is logged in
 */
export async function requireAuth(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const user = request.user;

  if (!user || !user.userId) {
    return reply.status(401).send({
      type: 'https://api.platform.xala.no/errors/unauthorized',
      title: 'Unauthorized',
      status: 401,
      detail: 'Authentication required. Please log in.',
      instance: request.url,
    });
  }
}

/**
 * Middleware to require a specific role
 * Returns 403 if user doesn't have required role
 *
 * @param role - Minimum required role
 *
 * @example
 * ```typescript
 * fastify.patch('/api/resources/:id/approve', {
 *   preHandler: [requireAuth, requireRole(UserRole.CASEWORKER)],
 *   handler: async (request, reply) => {
 *     // Only caseworkers and above can access
 *   },
 * });
 * ```
 */
export function requireRole(role: UserRole) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user;

    if (!user || !user.role) {
      return reply.status(401).send({
        type: 'https://api.platform.xala.no/errors/unauthorized',
        title: 'Unauthorized',
        status: 401,
        detail: 'Authentication required',
        instance: request.url,
      });
    }

    const userRoleLevel = ROLE_HIERARCHY[user.role as UserRole] || 0;
    const requiredRoleLevel = ROLE_HIERARCHY[role];

    if (userRoleLevel < requiredRoleLevel) {
      return reply.status(403).send({
        type: 'https://api.platform.xala.no/errors/forbidden',
        title: 'Forbidden',
        status: 403,
        detail: `This action requires ${role} role. Your role: ${user.role}`,
        instance: request.url,
      });
    }
  };
}

/**
 * Middleware to require one of multiple roles
 * Returns 403 if user doesn't have any of the required roles
 *
 * @param roles - Array of acceptable roles
 *
 * @example
 * ```typescript
 * fastify.get('/api/reports', {
 *   preHandler: [requireAuth, requireAnyRole([UserRole.CASEWORKER, UserRole.ADMIN])],
 *   handler: async (request, reply) => {
 *     // Caseworkers and admins can access
 *   },
 * });
 * ```
 */
export function requireAnyRole(roles: UserRole[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user;

    if (!user || !user.role) {
      return reply.status(401).send({
        type: 'https://api.platform.xala.no/errors/unauthorized',
        title: 'Unauthorized',
        status: 401,
        detail: 'Authentication required',
        instance: request.url,
      });
    }

    if (!roles.includes(user.role as UserRole)) {
      return reply.status(403).send({
        type: 'https://api.platform.xala.no/errors/forbidden',
        title: 'Forbidden',
        status: 403,
        detail: `This action requires one of: ${roles.join(', ')}. Your role: ${user.role}`,
        instance: request.url,
      });
    }
  };
}

/**
 * Middleware to require tenant match
 * Ensures user can only access resources in their tenant
 */
export async function requireTenantAccess(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const user = request.user;
  const params = request.params as any;

  if (!user || !user.tenantId) {
    return reply.status(401).send({
      type: 'https://api.platform.xala.no/errors/unauthorized',
      title: 'Unauthorized',
      status: 401,
      detail: 'Authentication required',
      instance: request.url,
    });
  }

  // If route has tenantId param, verify it matches user's tenant
  if (params.tenantId && params.tenantId !== user.tenantId) {
    // Allow SAAS_ADMIN to access any tenant
    if (user.role !== UserRole.SAAS_ADMIN) {
      return reply.status(403).send({
        type: 'https://api.platform.xala.no/errors/forbidden',
        title: 'Forbidden',
        status: 403,
        detail: 'You can only access resources in your own tenant',
        instance: request.url,
      });
    }
  }
}

/**
 * Helper to check if user has role (non-blocking)
 */
export function hasRole(request: FastifyRequest, role: UserRole): boolean {
  const user = request.user;
  if (!user || !user.role) return false;

  const userRoleLevel = ROLE_HIERARCHY[user.role as UserRole] || 0;
  const requiredRoleLevel = ROLE_HIERARCHY[role];

  return userRoleLevel >= requiredRoleLevel;
}

/**
 * Helper to check if user has any of the roles (non-blocking)
 */
export function hasAnyRole(request: FastifyRequest, roles: UserRole[]): boolean {
  const user = request.user;
  if (!user || !user.role) return false;

  return roles.includes(user.role as UserRole);
}
