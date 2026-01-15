/**
 * Audit Controller
 * Production-ready activity logging with database persistence
 */
import { Controller, Get, Post } from '../../core/decorators';
import { getAuditService } from '../../core/audit/audit.service';
import type { FastifyRequest, FastifyReply } from 'fastify';

interface AuditRequest extends FastifyRequest {
  tenantId?: string | null;
  userId?: string | null;
}

@Controller('/api/audit')
export class AuditController {
  /**
   * POST /api/audit - Create audit log entry from client-side
   */
  @Post()
  async createAuditLog(request: AuditRequest, reply: FastifyReply) {
    const body = request.body as {
      action: string;
      resource: string;
      resourceId?: string;
      severity?: string;
      metadata?: Record<string, unknown>;
    };

    if (!body.action || !body.resource) {
      reply.code(400);
      return { error: { code: 'VALIDATION_ERROR', message: 'action and resource are required' } };
    }

    const auditService = getAuditService();
    const result = await auditService.log({
      tenantId: request.tenantId || undefined,
      userId: request.userId || undefined,
      action: body.action,
      resource: body.resource,
      resourceId: body.resourceId,
      severity: body.severity as any,
      metadata: body.metadata,
      ipAddress: request.ip,
      userAgent: request.headers['user-agent'] as string,
    });

    return reply.status(201).send({ data: result });
  }

  /**
   * GET /api/audit - Get audit logs with filtering
   */
  @Get()
  async getAuditLogs(request: AuditRequest, reply: FastifyReply) {
    const {
      resource,
      action,
      userId,
      resourceId,
      severity,
      startDate,
      endDate,
      page = 1,
      limit = 50,
    } = request.query as any;

    const auditService = getAuditService();
    const result = await auditService.query({
      tenantId: request.tenantId || undefined,
      userId,
      resource,
      action,
      resourceId,
      severity,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      page: Number(page),
      limit: Number(limit),
    });

    return result;
  }

  /**
   * GET /api/audit/:id - Get single audit event
   */
  @Get('/:id')
  async getAuditEvent(request: AuditRequest, reply: FastifyReply) {
    const { id } = request.params as any;
    const auditService = getAuditService();
    const event = await auditService.findById(id);

    if (!event) {
      reply.code(404);
      return { error: { code: 'NOT_FOUND', message: 'Audit event not found' } };
    }

    return { data: event };
  }

  /**
   * GET /api/audit/stats - Get audit statistics
   */
  @Get('/stats')
  async getAuditStats(request: AuditRequest, reply: FastifyReply) {
    const auditService = getAuditService();
    
    // Get counts by resource (last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const result = await auditService.query({
      tenantId: request.tenantId || undefined,
      startDate: oneDayAgo,
      limit: 1000,
    });

    const byResource: Record<string, number> = {};
    const byAction: Record<string, number> = {};
    const bySeverity: Record<string, number> = {};

    result.data.forEach((event) => {
      byResource[event.resource] = (byResource[event.resource] || 0) + 1;
      byAction[event.action] = (byAction[event.action] || 0) + 1;
      bySeverity[event.severity] = (bySeverity[event.severity] || 0) + 1;
    });

    return {
      data: {
        total: result.meta.total,
        last24Hours: result.data.length,
        byResource,
        byAction,
        bySeverity,
      },
    };
  }
}
