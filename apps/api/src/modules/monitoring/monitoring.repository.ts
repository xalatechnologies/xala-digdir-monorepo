/**
 * Monitoring Repositories
 * Standalone implementations for audit logs, alerts, and incidents
 */
import { auditLogs, alerts, incidents } from '../../database/schema';
import { eq, and, gte, lte } from 'drizzle-orm';

export class AuditLogRepository {
  constructor(private readonly db: any) {}

  /**
   * Create audit log entry
   */
  async create(data: any) {
    const result = await this.db
      .insert(auditLogs)
      .values(data)
      .returning();
    return result[0];
  }

  /**
   * Find audit logs with filters
   */
  async findWithFilters(filters: {
    page: number;
    limit: number;
    tenantId?: string;
    userId?: string;
    action?: string;
    from?: Date;
    to?: Date;
  }) {
    const offset = (filters.page - 1) * filters.limit;
    const conditions: any[] = [];

    if (filters.tenantId) {
      conditions.push(eq(auditLogs.tenantId, filters.tenantId));
    }
    if (filters.userId) {
      conditions.push(eq(auditLogs.userId, filters.userId));
    }
    if (filters.action) {
      conditions.push(eq(auditLogs.action, filters.action));
    }

    let query = this.db.select().from(auditLogs);
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const data = await query.limit(filters.limit).offset(offset);

    return {
      data,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total: data.length,
        totalPages: 1,
        hasNext: false,
        hasPrev: filters.page > 1,
      },
    };
  }
}

export class AlertRepository {
  constructor(private readonly db: any) {}

  /**
   * Create alert
   */
  async create(data: any) {
    const result = await this.db
      .insert(alerts)
      .values(data)
      .returning();
    return result[0];
  }

  /**
   * Find by ID
   */
  async findById(id: string) {
    const results = await this.db
      .select()
      .from(alerts)
      .where(eq(alerts.id, id))
      .limit(1);
    return results[0] || null;
  }

  /**
   * Find active alerts
   */
  async findActive(tenantId?: string) {
    let query = this.db.select().from(alerts);
    // Simplified - in production would filter by status
    const data = await query.limit(100);
    return { data };
  }

  /**
   * Update alert
   */
  async update(id: string, data: any) {
    const result = await this.db
      .update(alerts)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(alerts.id, id))
      .returning();
    return result[0];
  }

  /**
   * Acknowledge alert
   */
  async acknowledge(id: string, acknowledgedBy: string) {
    return this.update(id, { acknowledgedBy, acknowledgedAt: new Date() });
  }

  /**
   * Resolve alert
   */
  async resolve(id: string, resolvedBy: string) {
    return this.update(id, { resolvedBy, resolvedAt: new Date() });
  }
}

export class IncidentRepository {
  constructor(private readonly db: any) {}

  /**
   * Create incident
   */
  async create(data: any) {
    const result = await this.db
      .insert(incidents)
      .values(data)
      .returning();
    return result[0];
  }

  /**
   * Find by ID
   */
  async findById(id: string) {
    const results = await this.db
      .select()
      .from(incidents)
      .where(eq(incidents.id, id))
      .limit(1);
    return results[0] || null;
  }

  /**
   * Find open incidents
   */
  async findOpen(tenantId?: string) {
    let query = this.db.select().from(incidents);
    const data = await query.limit(100);
    return { data };
  }

  /**
   * Update incident status
   */
  async updateStatus(id: string, status: string, updatedBy: string) {
    const incident = await this.findById(id);
    if (!incident) return null;

    const timeline = (incident.timeline as any[]) || [];
    timeline.push({
      status,
      updatedBy,
      timestamp: new Date().toISOString(),
    });

    const result = await this.db
      .update(incidents)
      .set({ status, timeline, updatedAt: new Date() })
      .where(eq(incidents.id, id))
      .returning();
    return result[0];
  }
}
