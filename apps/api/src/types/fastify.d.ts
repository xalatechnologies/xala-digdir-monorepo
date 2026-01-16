/**
 * Fastify Type Extensions
 * Extends Fastify types with custom properties
 */

import 'fastify';

declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      userId: string;
      tenantId: string;
      email?: string;
      role?: string;
      isSaasAdmin?: boolean;
    };
  }
}
