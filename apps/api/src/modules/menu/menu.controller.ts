/**
 * Menu Controller
 * 
 * DK API endpoints for the database-driven Backoffice menu system.
 * 
 * Endpoints:
 * - GET /dk/backoffice/menu - Get resolved menu tree for current user
 * - GET /dk/me/context - Get user context (tenant, roles, permissions)
 */

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { MenuResolutionService } from './menu-resolution.service';
import type { SupportedLanguage } from '@xala/contracts/projections';
import { db } from '../../database/connection';
import { ROLE_PERMISSIONS } from '../../core/permissions';

interface MenuQueryParams {
  lang?: 'nb' | 'en';
}

export async function menuRoutes(fastify: FastifyInstance): Promise<void> {
  const menuService = new MenuResolutionService(db as never);

  /**
   * GET /dk/backoffice/menu
   * Returns the resolved menu tree for the current user
   */
  fastify.get<{ Querystring: MenuQueryParams }>(
    '/dk/backoffice/menu',
    {
      preValidation: [(fastify as unknown as { authenticate: unknown }).authenticate],
      schema: {
        tags: ['Menu'],
        summary: 'Get backoffice menu for current user',
        description: 'Returns a fully resolved menu tree based on user roles, permissions, and feature flags',
        querystring: {
          type: 'object',
          properties: {
            lang: { type: 'string', enum: ['nb', 'en'], default: 'nb' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              data: {
                type: 'object',
                properties: {
                  templateCode: { type: 'string' },
                  templateVersion: { type: 'number' },
                  language: { type: 'string' },
                  categories: { type: 'array' },
                  resolvedAt: { type: 'string' },
                },
              },
              meta: {
                type: 'object',
                properties: {
                  cached: { type: 'boolean' },
                  cacheKey: { type: 'string', nullable: true },
                },
              },
            },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Querystring: MenuQueryParams }>, reply: FastifyReply) => {
      const { lang = 'nb' } = request.query;
      const user = request.user as { userId: string; tenantId: string; role?: string; roles?: string[] };
      const tenant = (request as unknown as { tenant?: { id: string } }).tenant;

      if (!user || !tenant) {
        return reply.status(401).send({
          type: 'https://api.digilist.no/errors/unauthorized',
          title: 'Unauthorized',
          status: 401,
          detail: 'Authentication required',
        });
      }

      const userRoles = getUserRoles(user);
      const userPermissions = getUserPermissions(userRoles);

      const menuTree = await menuService.resolveMenu({
        tenantId: tenant.id,
        userId: user.userId,
        roles: userRoles,
        permissions: userPermissions,
        language: lang as SupportedLanguage,
      });

      return reply.send({
        data: menuTree,
        meta: {
          cached: false,
          cacheKey: null,
        },
      });
    }
  );

  /**
   * GET /dk/me/context
   * Returns the user context (tenant, roles, permissions, language)
   */
  fastify.get(
    '/dk/me/context',
    {
      preValidation: [(fastify as unknown as { authenticate: unknown }).authenticate],
      schema: {
        tags: ['Menu'],
        summary: 'Get user context',
        description: 'Returns user context including tenant, roles, and permissions',
        response: {
          200: {
            type: 'object',
            properties: {
              data: {
                type: 'object',
                properties: {
                  userId: { type: 'string' },
                  tenantId: { type: 'string' },
                  orgId: { type: 'string', nullable: true },
                  roles: { type: 'array', items: { type: 'string' } },
                  permissions: { type: 'array', items: { type: 'string' } },
                  language: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const user = request.user as { userId: string; tenantId: string; role?: string; roles?: string[]; organizationId?: string };
      const tenant = (request as unknown as { tenant?: { id: string } }).tenant;

      if (!user || !tenant) {
        return reply.status(401).send({
          type: 'https://api.digilist.no/errors/unauthorized',
          title: 'Unauthorized',
          status: 401,
          detail: 'Authentication required',
        });
      }

      const userRoles = getUserRoles(user);
      const userPermissions = getUserPermissions(userRoles);
      const userLanguage = 'nb';

      return reply.send({
        data: {
          userId: user.userId,
          tenantId: tenant.id,
          orgId: user.organizationId || null,
          roles: userRoles,
          permissions: userPermissions,
          language: userLanguage,
        },
      });
    }
  );
}

/**
 * Extract roles from user object
 */
function getUserRoles(user: { role?: string; roles?: string[] }): string[] {
  if (user.roles && Array.isArray(user.roles)) {
    return user.roles;
  }
  if (user.role) {
    return [user.role];
  }
  return [];
}

/**
 * Get permissions for given roles
 */
function getUserPermissions(roles: string[]): string[] {
  const permissions = new Set<string>();

  for (const role of roles) {
    const roleKey = role.toUpperCase() as keyof typeof ROLE_PERMISSIONS;
    const rolePerms = ROLE_PERMISSIONS[roleKey];
    if (rolePerms) {
      for (const perm of rolePerms) {
        permissions.add(perm);
      }
    }
  }

  return Array.from(permissions);
}
