/**
 * Feature Flags Routes
 * API endpoints for managing tenant features
 */

import { FastifyPluginAsync } from 'fastify';
import { FeatureFlagsService } from '../services/feature-flags.service';

const featureFlagsService = new FeatureFlagsService();

export const featuresRoutes: FastifyPluginAsync = async (fastify) => {
  /**
   * GET /api/me/features
   * Get current tenant's enabled features and categories
   * 
   * @returns TenantFeatures
   */
  fastify.get('/me/features', {
    schema: {
      description: 'Get tenant features and enabled categories',
      tags: ['features'],
      response: {
        200: {
          type: 'object',
          properties: {
            data: {
              type: 'object',
              properties: {
                tenantId: { type: 'string' },
                tenantName: { type: 'string' },
                enabledRentalObjectCategories: {
                  type: 'array',
                  items: { type: 'string' },
                },
                featureFlags: {
                  type: 'object',
                  additionalProperties: { type: 'boolean' },
                },
              },
            },
          },
        },
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
        });
      }

      const features = await featureFlagsService.getTenantFeatures(user.tenantId);
      
      return reply.send({
        data: features,
      });
    },
  });

  /**
   * GET /api/admin/tenants/:tenantId/features
   * Get features for a specific tenant (SaaS Admin only)
   * 
   * @param tenantId - Tenant ID
   * @returns TenantFeatures
   */
  fastify.get('/admin/tenants/:tenantId/features', {
    schema: {
      description: 'Get tenant features (Admin only)',
      tags: ['admin', 'features'],
      params: {
        type: 'object',
        properties: {
          tenantId: { type: 'string' },
        },
        required: ['tenantId'],
      },
    },
    handler: async (request, reply) => {
      const user = request.user as any;
      const { tenantId } = request.params as { tenantId: string };
      
      // TODO: Add SaaS admin check
      if (!user || !user.isSaasAdmin) {
        return reply.status(403).send({
          type: 'https://api.digilist.no/errors/forbidden',
          title: 'Forbidden',
          status: 403,
          detail: 'SaaS admin access required',
        });
      }

      const features = await featureFlagsService.getTenantFeatures(tenantId);
      
      return reply.send({
        data: features,
      });
    },
  });

  /**
   * PATCH /api/admin/tenants/:tenantId/features
   * Update tenant features (SaaS Admin only)
   * 
   * @param tenantId - Tenant ID
   * @body UpdateTenantFeaturesDTO
   * @returns TenantFeatures
   */
  fastify.patch('/admin/tenants/:tenantId/features', {
    schema: {
      description: 'Update tenant features (Admin only)',
      tags: ['admin', 'features'],
      params: {
        type: 'object',
        properties: {
          tenantId: { type: 'string' },
        },
        required: ['tenantId'],
      },
      body: {
        type: 'object',
        properties: {
          featureFlags: {
            type: 'object',
            additionalProperties: { type: 'boolean' },
          },
          enabledRentalObjectCategories: {
            type: 'array',
            items: { type: 'string' },
          },
        },
      },
    },
    handler: async (request, reply) => {
      const user = request.user as any;
      const { tenantId } = request.params as { tenantId: string };
      const updates = request.body as any;
      
      // TODO: Add SaaS admin check
      if (!user || !user.isSaasAdmin) {
        return reply.status(403).send({
          type: 'https://api.digilist.no/errors/forbidden',
          title: 'Forbidden',
          status: 403,
          detail: 'SaaS admin access required',
        });
      }

      const features = await featureFlagsService.updateTenantFeatures(tenantId, updates);
      
      return reply.send({
        data: features,
      });
    },
  });

  /**
   * GET /api/features/categories
   * Get all available rental object categories
   * 
   * @returns Array of category definitions
   */
  fastify.get('/features/categories', {
    schema: {
      description: 'Get all available rental object categories',
      tags: ['features'],
      response: {
        200: {
          type: 'object',
          properties: {
            data: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  key: { type: 'string' },
                  label: {
                    type: 'object',
                    properties: {
                      no: { type: 'string' },
                      en: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    handler: async (request, reply) => {
      const categories = [
        {
          key: 'LOCALE',
          label: { no: 'Lokaler', en: 'Spaces' },
        },
        {
          key: 'ARRANGEMENT',
          label: { no: 'Arrangement', en: 'Events' },
        },
        {
          key: 'EQUIPMENT',
          label: { no: 'Utstyr', en: 'Equipment' },
        },
        {
          key: 'VEHICLE',
          label: { no: 'Kjøretøy', en: 'Vehicles' },
        },
        {
          key: 'OTHER',
          label: { no: 'Annet', en: 'Other' },
        },
      ];

      return reply.send({
        data: categories,
      });
    },
  });
};
