/**
 * Navigation Routes
 * Exposes GET /api/nav/:app endpoint for API-driven navigation
 */

import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { EntitlementsController } from '../modules/entitlements/entitlements.controller';

export async function navigationRoutes(
  app: FastifyInstance,
  _opts: FastifyPluginOptions
): Promise<void> {
  const controller = new EntitlementsController();

  app.get<{ Params: { app: string } }>(
    '/nav/:app',
    {
      schema: {
        params: {
          type: 'object',
          required: ['app'],
          properties: {
            app: { type: 'string' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              app: { type: 'string' },
              items: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    key: { type: 'string' },
                    labelKey: { type: 'string' },
                    routeKey: { type: 'string' },
                    iconKey: { type: 'string' },
                    parentKey: { type: 'string' },
                    section: { type: 'string' },
                    contexts: { type: 'array', items: { type: 'string' } },
                    order: { type: 'number' },
                  },
                },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      return controller.getNavItems(request, reply);
    }
  );

  app.get(
    '/me/entitlements',
    async (request, reply) => {
      return controller.getMyEntitlements(request, reply);
    }
  );
}
