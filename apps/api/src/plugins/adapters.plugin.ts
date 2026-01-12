import fp from 'fastify-plugin';
import type { FastifyPluginAsync } from 'fastify';
import type { AppAdapters } from '../config/adapters';

/**
 * Injects all adapters into every request
 */
export const adaptersPlugin: FastifyPluginAsync<{ adapters: AppAdapters }> = fp(
  async (fastify, opts) => {
    const { adapters } = opts;
    
    // Decorate request with adapters
    fastify.decorateRequest('adapters', null);
    
    // Inject adapters on every request
    fastify.addHook('onRequest', async (request) => {
      request.adapters = adapters;
      
      // Generate correlation ID for request tracing
      request.correlationId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    });
    
    adapters.log.info('Adapters plugin registered');
  },
  {
    name: 'adapters-plugin',
  }
);
