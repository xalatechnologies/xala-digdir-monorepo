/**
 * Health Controller - Extended
 * Health checks with readiness and liveness probes
 */
import { Controller, Get } from '../../core/decorators';
import { container } from '../../core/container';
import type { FastifyRequest, FastifyReply } from 'fastify';

@Controller('/health')
export class HealthController {
  /**
   * GET /health - Basic health check
   */
  @Get()
  async check(request: FastifyRequest, reply: FastifyReply) {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    };
  }

  /**
   * GET /health/ready - Readiness probe
   */
  @Get('/ready')
  async readiness(request: FastifyRequest, reply: FastifyReply) {
    const db = container.resolve<any>('Database');
    
    try {
      // Test database connection
      await db.execute('SELECT 1');
      
      return {
        status: 'ready',
        checks: {
          database: 'ok',
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      reply.code(503);
      return {
        status: 'not_ready',
        checks: {
          database: 'error',
        },
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * GET /health/live - Liveness probe
   */
  @Get('/live')
  async liveness(request: FastifyRequest, reply: FastifyReply) {
    return {
      status: 'alive',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString(),
    };
  }
}
