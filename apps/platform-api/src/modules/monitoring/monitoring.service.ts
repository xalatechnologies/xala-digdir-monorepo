/**
 * Monitoring Service
 * Business logic for audit logs, alerts, and incidents
 */
import { Injectable, Inject } from '../../core/decorators';
import { AuditLogRepository, AlertRepository, IncidentRepository } from './monitoring.repository';
import { NotFoundError } from '../../core/errors/problem-details';
import type { PaginatedResult } from '../../database/base.repository';

@Injectable()
export class MonitoringService {
  constructor(
    @Inject('AuditLogRepository') private readonly auditLogRepo: AuditLogRepository,
    @Inject('AlertRepository') private readonly alertRepo: AlertRepository,
    @Inject('IncidentRepository') private readonly incidentRepo: IncidentRepository,
    @Inject('Adapters') private readonly adapters: any
  ) {}

  // =========================================================================
  // AUDIT LOGS
  // =========================================================================

  /**
   * Create audit log entry
   */
  async createAuditLog(data: any): Promise<any> {
    const log = await this.auditLogRepo.create({
      tenantId: data.tenantId || null,
      userId: data.userId || null,
      action: data.action,
      resource: data.resource,
      resourceId: data.resourceId || null,
      metadata: data.metadata || {},
    });
    return log;
  }

  /**
   * Query audit logs
   */
  async findAuditLogs(params: any): Promise<PaginatedResult<any>> {
    return this.auditLogRepo.findWithFilters({
      ...params,
      page: params.page ?? 1,
      limit: params.limit ?? 50,
    });
  }

  // =========================================================================
  // ALERTS
  // =========================================================================

  /**
   * Create alert
   */
  async createAlert(tenantId: string, data: any): Promise<any> {
    const alert = await this.alertRepo.create({
      tenantId,
      name: data.name,
      type: data.type || 'threshold',
      severity: data.severity || 'medium',
      condition: data.condition,
      metadata: data.metadata || {},
    });

    this.adapters?.log?.warn('Alert created', { id: alert?.id, name: data.name, severity: data.severity });

    return alert;
  }

  /**
   * Get active alerts
   */
  async getActiveAlerts(tenantId?: string): Promise<any[]> {
    const result = await this.alertRepo.findActive(tenantId);
    return result.data || [];
  }

  /**
   * Acknowledge alert
   */
  async acknowledgeAlert(id: string, acknowledgedBy: string): Promise<any> {
    const alert = await this.alertRepo.acknowledge(id, acknowledgedBy);
    if (!alert) {
      throw new NotFoundError(`Alert with id ${id} not found`);
    }
    this.adapters?.log?.info('Alert acknowledged', { id, acknowledgedBy });
    return alert;
  }

  /**
   * Resolve alert
   */
  async resolveAlert(id: string, resolvedBy: string): Promise<any> {
    const alert = await this.alertRepo.resolve(id, resolvedBy);
    if (!alert) {
      throw new NotFoundError(`Alert with id ${id} not found`);
    }
    this.adapters?.log?.info('Alert resolved', { id, resolvedBy });
    return alert;
  }

  // =========================================================================
  // INCIDENTS
  // =========================================================================

  /**
   * Create incident
   */
  async createIncident(tenantId: string, data: any): Promise<any> {
    const incident = await this.incidentRepo.create({
      tenantId,
      title: data.title,
      description: data.description || null,
      severity: data.severity || 'medium',
      status: 'open',
      assignee: data.assignee || null,
      timeline: [{
        status: 'open',
        timestamp: new Date().toISOString(),
        message: 'Incident created',
      }],
      metadata: data.metadata || {},
    });

    this.adapters?.log?.error('Incident created', { id: incident?.id, title: data.title, severity: data.severity });

    return incident;
  }

  /**
   * Get open incidents
   */
  async getOpenIncidents(tenantId?: string): Promise<any[]> {
    const result = await this.incidentRepo.findOpen(tenantId);
    return result.data || [];
  }

  /**
   * Update incident status
   */
  async updateIncidentStatus(id: string, data: any): Promise<any> {
    const incident = await this.incidentRepo.updateStatus(id, data.status, data.updatedBy || 'system');
    if (!incident) {
      throw new NotFoundError(`Incident with id ${id} not found`);
    }
    this.adapters?.log?.info('Incident status updated', { id, status: data.status });
    return incident;
  }

  /**
   * Get incident by ID
   */
  async getIncidentById(id: string): Promise<any> {
    const incident = await this.incidentRepo.findById(id);
    if (!incident) {
      throw new NotFoundError(`Incident with id ${id} not found`);
    }
    return incident;
  }
}
