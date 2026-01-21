/**
 * Monitoring Controller
 * REST API endpoints for audit logs, alerts, and incidents
 */
import { Controller, Get, Post, Put } from '../../core/decorators';
import { Inject } from '../../core/decorators';
import { MonitoringService } from './monitoring.service';
import type { FastifyRequest, FastifyReply } from 'fastify';

interface TenantRequest extends FastifyRequest {
  tenantId?: string;
  userId?: string;
}

@Controller('/api/monitoring')
export class MonitoringController {
  constructor(
    @Inject('MonitoringService') private readonly service: MonitoringService
  ) {}

  // =========================================================================
  // AUDIT LOGS
  // =========================================================================

  /**
   * GET /api/monitoring/audit-logs - Query audit logs
   */
  @Get('/audit-logs')
  async getAuditLogs(request: TenantRequest, reply: FastifyReply) {
    const tenantId = request.tenantId;
    const result = await this.service.findAuditLogs({ 
      ...request.query as any,
      tenantId,
      page: (request.query as any)?.page ?? 1,
      limit: (request.query as any)?.limit ?? 50,
    });
    return result;
  }

  // =========================================================================
  // ALERTS
  // =========================================================================

  /**
   * GET /api/monitoring/alerts - Get active alerts
   */
  @Get('/alerts')
  async getActiveAlerts(request: TenantRequest, reply: FastifyReply) {
    const tenantId = request.tenantId;
    const alerts = await this.service.getActiveAlerts(tenantId);
    return { alerts };
  }

  /**
   * POST /api/monitoring/alerts - Create alert
   */
  @Post('/alerts')
  async createAlert(request: TenantRequest, reply: FastifyReply) {
    const tenantId = request.tenantId || 'default';
    const alert = await this.service.createAlert(tenantId, request.body);
    return reply.status(201).send({ alert });
  }

  /**
   * PUT /api/monitoring/alerts/:id/acknowledge - Acknowledge alert
   */
  @Put('/alerts/:id/acknowledge')
  async acknowledgeAlert(request: TenantRequest, reply: FastifyReply) {
    const id = (request.params as any).id;
    const acknowledgedBy = request.userId || 'system';
    const alert = await this.service.acknowledgeAlert(id, acknowledgedBy);
    return { alert };
  }

  /**
   * PUT /api/monitoring/alerts/:id/resolve - Resolve alert
   */
  @Put('/alerts/:id/resolve')
  async resolveAlert(request: TenantRequest, reply: FastifyReply) {
    const id = (request.params as any).id;
    const resolvedBy = request.userId || 'system';
    const alert = await this.service.resolveAlert(id, resolvedBy);
    return { alert };
  }

  // =========================================================================
  // INCIDENTS
  // =========================================================================

  /**
   * GET /api/monitoring/incidents - Get open incidents
   */
  @Get('/incidents')
  async getOpenIncidents(request: TenantRequest, reply: FastifyReply) {
    const tenantId = request.tenantId;
    const incidents = await this.service.getOpenIncidents(tenantId);
    return { incidents };
  }

  /**
   * GET /api/monitoring/incidents/:id - Get incident by ID
   */
  @Get('/incidents/:id')
  async getIncidentById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const incident = await this.service.getIncidentById(request.params.id);
    return { incident };
  }

  /**
   * POST /api/monitoring/incidents - Create incident
   */
  @Post('/incidents')
  async createIncident(request: TenantRequest, reply: FastifyReply) {
    const tenantId = request.tenantId || 'default';
    const incident = await this.service.createIncident(tenantId, request.body);
    return reply.status(201).send({ incident });
  }

  /**
   * PUT /api/monitoring/incidents/:id/status - Update incident status
   */
  @Put('/incidents/:id/status')
  async updateIncidentStatus(request: TenantRequest, reply: FastifyReply) {
    const id = (request.params as any).id;
    const userId = request.userId || 'system';
    const incident = await this.service.updateIncidentStatus(id, { 
      ...(request.body as any), 
      updatedBy: userId 
    });
    return { incident };
  }
}
