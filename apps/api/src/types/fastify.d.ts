import 'fastify';
import type { AppAdapters } from '../config/adapters';

declare module 'fastify' {
  interface FastifyRequest {
    /**
     * All application adapters injected into every request
     */
    adapters: AppAdapters;
    
    /**
     * Authenticated user ID (set by auth plugin)
     */
    userId?: string;
    
    /**
     * Request correlation ID for tracing
     */
    correlationId: string;
  }
}
