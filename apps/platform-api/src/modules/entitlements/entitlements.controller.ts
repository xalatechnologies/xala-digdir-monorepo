/**
 * Entitlements Controller
 * Exposes GET /api/me/entitlements endpoint with ETag caching
 */

import { FastifyRequest, FastifyReply } from 'fastify';
import { EntitlementsService } from './entitlements.service';
import crypto from 'crypto';

export class EntitlementsController {
  private service: EntitlementsService;

  constructor() {
    this.service = new EntitlementsService();
  }

  /**
   * GET /api/me/entitlements
   * Returns effective entitlements for the authenticated user's session
   */
  async getMyEntitlements(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    const user = (request as any).user;
    const tenant = (request as any).tenant;

    if (!user || !tenant) {
      return reply.code(401).send({
        type: 'https://digilist.no/errors/unauthorized',
        title: 'Unauthorized',
        status: 401,
        detail: 'Authentication required',
      });
    }

    try {
      const entitlements = await this.service.evaluateEntitlements({
        tenantId: tenant.id,
        userId: user.id,
        roles: user.role ? [user.role] : [],
        organizationId: user.organizationId,
        environment: process.env.NODE_ENV || 'production',
      });

      // Generate ETag from entitlements hash
      const etag = this.generateETag(entitlements);
      const clientETag = request.headers['if-none-match'];

      // Check if client has cached version
      if (clientETag === etag) {
        return reply.code(304).send();
      }

      // Set caching headers
      reply.header('ETag', etag);
      reply.header('Cache-Control', 'private, max-age=300'); // 5 minutes
      reply.header('Vary', 'Authorization');

      return reply.code(200).send(entitlements);
    } catch (error) {
      request.log.error({ error }, 'Failed to evaluate entitlements');
      return reply.code(500).send({
        type: 'https://digilist.no/errors/internal-server-error',
        title: 'Internal Server Error',
        status: 500,
        detail: 'Failed to evaluate entitlements',
      });
    }
  }

  /**
   * GET /api/nav/:app
   * Returns navigation items for a specific app
   */
  async getNavItems(
    request: FastifyRequest<{ Params: { app: string } }>,
    reply: FastifyReply
  ): Promise<void> {
    const user = (request as any).user;
    const tenant = (request as any).tenant;
    const { app } = request.params;

    if (!user || !tenant) {
      return reply.code(401).send({
        type: 'https://digilist.no/errors/unauthorized',
        title: 'Unauthorized',
        status: 401,
      });
    }

    try {
      const entitlements = await this.service.evaluateEntitlements({
        tenantId: tenant.id,
        userId: user.id,
        roles: user.role ? [user.role] : [],
        organizationId: user.organizationId,
        environment: process.env.NODE_ENV || 'production',
      });

      const navItems = entitlements.navItems[app] || [];

      return reply.code(200).send({ app, items: navItems });
    } catch (error) {
      request.log.error({ error, app }, 'Failed to get nav items');
      return reply.code(500).send({
        type: 'https://digilist.no/errors/internal-server-error',
        title: 'Internal Server Error',
        status: 500,
      });
    }
  }

  private generateETag(data: any): string {
    const hash = crypto
      .createHash('sha256')
      .update(JSON.stringify(data))
      .digest('hex');
    return `"${hash.substring(0, 16)}"`;
  }
}

// Route registration
export function registerEntitlementsRoutes(fastify: any) {
  const controller = new EntitlementsController();

  fastify.get(
    '/api/me/entitlements',
    {
      preHandler: [fastify.authenticate],
    },
    controller.getMyEntitlements.bind(controller)
  );

  fastify.get(
    '/api/nav/:app',
    {
      preHandler: [fastify.authenticate],
    },
    controller.getNavItems.bind(controller)
  );
}
