/**
 * Health Controller
 * Platform health checks and readiness probes
 */
import type { FastifyRequest, FastifyReply } from 'fastify';
import { Controller, Get } from '../../core/decorators';

interface HealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  uptime: number;
  checks: {
    name: string;
    status: 'pass' | 'warn' | 'fail';
    message?: string;
  }[];
}

@Controller('/health')
export class HealthController {
  private startTime = Date.now();

  @Get('/')
  async health(request: FastifyRequest, reply: FastifyReply): Promise<HealthResponse> {
    const checks = [
      {
        name: 'server',
        status: 'pass' as const,
        message: 'Server is running',
      },
    ];

    const response: HealthResponse = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      checks,
    };

    return response;
  }

  @Get('/live')
  async liveness(request: FastifyRequest, reply: FastifyReply): Promise<{ status: string }> {
    return { status: 'ok' };
  }

  @Get('/ready')
  async readiness(request: FastifyRequest, reply: FastifyReply): Promise<{ status: string; ready: boolean }> {
    // Add readiness checks here (database, cache, etc.)
    return { status: 'ok', ready: true };
  }
}
