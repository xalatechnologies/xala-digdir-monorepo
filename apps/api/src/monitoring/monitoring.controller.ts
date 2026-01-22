/**
 * Monitoring Controller
 * Exposes health checks, metrics, and alerts
 */
import { Controller, Get } from '../core/decorators';
import { Inject } from '../core/decorators';
import { HealthCheckService, type HealthStatus } from './health';
import { APMService } from './apm';
import { AlertManager, type Alert } from './alerts';
import type { FastifyRequest, FastifyReply } from 'fastify';

// Re-export types to satisfy TypeScript module resolution
export type { HealthStatus, Alert };

@Controller('/monitoring')
export class MonitoringController {
  constructor(
    @Inject('HealthCheckService') private readonly health: HealthCheckService,
    @Inject('APMService') private readonly apm: APMService,
    @Inject('AlertManager') private readonly alerts: AlertManager
  ) {}

  /**
   * Comprehensive health check
   * GET /monitoring/health
   */
  @Get('/health')
  async getHealth(_request: FastifyRequest, _reply: FastifyReply) {
    const health = await this.health.performHealthCheck();
    return { data: health };
  }

  /**
   * Liveness probe (Kubernetes)
   * GET /monitoring/healthz
   */
  @Get('/healthz')
  async getLiveness(_request: FastifyRequest, _reply: FastifyReply) {
    const liveness = await this.health.livenessCheck();
    return liveness;
  }

  /**
   * Readiness probe (Kubernetes)
   * GET /monitoring/ready
   */
  @Get('/ready')
  async getReadiness(_request: FastifyRequest, reply: FastifyReply) {
    const readiness = await this.health.readinessCheck();

    if (!readiness.ready) {
      reply.status(503);
    }

    return readiness;
  }

  /**
   * Metrics summary
   * GET /monitoring/metrics
   */
  @Get('/metrics')
  async getMetrics(_request: FastifyRequest, _reply: FastifyReply) {
    const summary = this.apm.getMetricsSummary();
    const apmHealth = this.apm.getHealthMetrics();

    return {
      data: {
        summary,
        apmHealth,
      },
    };
  }

  /**
   * Active alerts
   * GET /monitoring/alerts
   */
  @Get('/alerts')
  async getAlerts(_request: FastifyRequest, _reply: FastifyReply) {
    const activeAlerts = this.alerts.getActiveAlerts();
    const stats = this.alerts.getAlertStats();

    return {
      data: {
        active: activeAlerts,
        stats,
      },
    };
  }
}
