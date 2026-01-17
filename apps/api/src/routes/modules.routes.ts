/**
 * Modules Routes
 * API endpoints for MODULE-based feature flags
 */

import { FastifyPluginAsync } from 'fastify';
import { ModulesService } from '../services/modules.service';

export const modulesRoutes: FastifyPluginAsync = async (fastify) => {
  // Get ModulesService from app context
  const modulesService = (fastify as any).modulesService as ModulesService;

  /**
   * GET /api/platform/modules
   * Get the module catalog (all available modules)
   */
  fastify.get('/platform/modules', {
    schema: {
      description: 'Get module catalog (all available modules)',
      tags: ['modules', 'platform'],
      response: {
        200: {
          type: 'object',
          properties: {
            data: {
              type: 'object',
              properties: {
                modules: { type: 'array' },
                capabilities: { type: 'array' },
                categories: { type: 'array' },
              },
            },
          },
        },
      },
    },
    handler: async (request, reply) => {
      const catalog = await modulesService.getModuleCatalog();
      return reply.send({ data: catalog });
    },
  });

  /**
   * GET /api/platform/modules/effective
   * Get effective modules for current user/tenant
   */
  fastify.get('/platform/modules/effective', {
    schema: {
      description: 'Get effective modules for current tenant/org',
      tags: ['modules', 'platform'],
      response: {
        200: {
          type: 'object',
          properties: {
            data: {
              type: 'object',
              properties: {
                modules: { type: 'array' },
                capabilities: { type: 'object' },
                tenantId: { type: 'string' },
                organizationId: { type: 'string' },
              },
            },
          },
        },
        401: { type: 'object' },
      },
    },
    handler: async (request, reply) => {
      const user = request.user as any;

      if (!user || !user.tenantId) {
        return reply.status(401).send({
          type: 'https://api.digilist.no/errors/unauthorized',
          title: 'Unauthorized',
          status: 401,
          detail: 'Authentication required',
          instance: request.url,
        });
      }

      const effective = await modulesService.getEffectiveModules({
        tenantId: user.tenantId,
        orgId: user.organizationId,
      });

      return reply.send({ data: effective });
    },
  });

  /**
   * PUT /api/platform/modules/:key
   * Enable/disable a module for the tenant (admin only)
   */
  fastify.put('/platform/modules/:key', {
    schema: {
      description: 'Update module state (admin only)',
      tags: ['modules', 'platform', 'admin'],
      params: {
        type: 'object',
        properties: {
          key: { type: 'string' },
        },
        required: ['key'],
      },
      body: {
        type: 'object',
        properties: {
          enabled: { type: 'boolean' },
          config: { type: 'object' },
        },
        required: ['enabled'],
      },
    },
    handler: async (request, reply) => {
      const user = request.user as any;
      const { key } = request.params as { key: string };
      const body = request.body as { enabled: boolean; config?: Record<string, unknown> };

      if (!user || !user.tenantId) {
        return reply.status(401).send({
          type: 'https://api.digilist.no/errors/unauthorized',
          title: 'Unauthorized',
          status: 401,
          detail: 'Authentication required',
          instance: request.url,
        });
      }

      // Check admin permission
      if (!user.isTenantAdmin && !user.isSaasAdmin) {
        return reply.status(403).send({
          type: 'https://api.digilist.no/errors/forbidden',
          title: 'Forbidden',
          status: 403,
          detail: 'Admin access required to modify modules',
          instance: request.url,
        });
      }

      try {
        const result = await modulesService.setModuleState(
          {
            tenantId: user.tenantId,
            orgId: user.organizationId,
            actorUserId: user.id,
          },
          key,
          { enabled: body.enabled, config: body.config }
        );

        return reply.send({ data: result });
      } catch (error: any) {
        return reply.status(error.status || 400).send({
          type: error.type || 'https://api.digilist.no/errors/validation-error',
          title: error.title || 'Validation Error',
          status: error.status || 400,
          detail: error.detail || 'Failed to update module',
          errors: error.errors,
          instance: request.url,
        });
      }
    },
  });

  /**
   * GET /api/platform/modules/:key
   * Get specific module state for tenant
   */
  fastify.get('/platform/modules/:key', {
    schema: {
      description: 'Get specific module state',
      tags: ['modules', 'platform'],
      params: {
        type: 'object',
        properties: {
          key: { type: 'string' },
        },
        required: ['key'],
      },
    },
    handler: async (request, reply) => {
      const user = request.user as any;
      const { key } = request.params as { key: string };

      if (!user || !user.tenantId) {
        return reply.status(401).send({
          type: 'https://api.digilist.no/errors/unauthorized',
          title: 'Unauthorized',
          status: 401,
          detail: 'Authentication required',
          instance: request.url,
        });
      }

      const effective = await modulesService.getEffectiveModules({
        tenantId: user.tenantId,
        orgId: user.organizationId,
      });

      const module = effective.modules.find((m) => m.key === key);

      if (!module) {
        return reply.status(404).send({
          type: 'https://api.digilist.no/errors/not-found',
          title: 'Not Found',
          status: 404,
          detail: `Module '${key}' not found`,
          instance: request.url,
        });
      }

      return reply.send({ data: module });
    },
  });
};
