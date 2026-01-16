/**
 * Audit Service
 * Production-ready audit logging with database persistence and WebSocket broadcast
 */
import { container } from '../../core/container';
import { auditLogs } from '../../database/schema/index';
import { eq, and, gte, lte, desc, count } from 'drizzle-orm';
import { logger } from '../logger';

export type AuditAction =
  | 'create' | 'read' | 'update' | 'delete'
  | 'publish' | 'archive' | 'restore' | 'duplicate'
  | 'confirm' | 'cancel' | 'complete' | 'pending'
  | 'approve' | 'reject' | 'send' | 'receive'
  | 'login' | 'logout' | 'register' | 'password_reset';

export type AuditResource =
  | 'booking' | 'listing' | 'user' | 'tenant' | 'organization'
  | 'conversation' | 'message' | 'allocation' | 'subscription'
  | 'setting' | 'integration' | 'report' | 'auth';

export type AuditSeverity = 'debug' | 'info' | 'warning' | 'error' | 'critical';

export interface AuditEntry {
  tenantId?: string;
  userId?: string;
  action: AuditAction | string;
  resource: AuditResource | string;
  resourceId?: string;
  severity?: AuditSeverity;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

export interface AuditLogResult {
  id: string;
  tenantId: string | null;
  userId: string | null;
  action: string;
  resource: string;
  resourceId: string | null;
  severity: string;
  metadata: unknown;
  ipAddress: string | null;
  userAgent: string | null;
  timestamp: Date;
}

// WebSocket connections for real-time broadcast
const wsConnections = new Set<any>();

export function registerWebSocket(ws: any) {
  wsConnections.add(ws);
  ws.on('close', () => wsConnections.delete(ws));
}

function broadcastAuditEvent(event: AuditLogResult) {
  const message = JSON.stringify({
    type: 'audit',
    data: event,
  });
  wsConnections.forEach((ws) => {
    try {
      if (ws.readyState === 1) { // OPEN
        ws.send(message);
      }
    } catch (err) {
      // Ignore send errors
    }
  });
}

export class AuditService {
  private db: any;

  constructor() {
    this.db = container.resolve<any>('Database');
  }

  /**
   * Log an audit event to database and broadcast via WebSocket
   */
  async log(entry: AuditEntry): Promise<AuditLogResult> {
    // Serialize metadata to ensure Date objects become ISO strings
    const serializedMetadata = entry.metadata 
      ? JSON.parse(JSON.stringify(entry.metadata))
      : {};

    const record = {
      tenantId: entry.tenantId || null,
      userId: entry.userId || null,
      action: entry.action,
      resource: entry.resource,
      resourceId: entry.resourceId || null,
      severity: entry.severity || 'info',
      metadata: serializedMetadata,
      ipAddress: entry.ipAddress || null,
      userAgent: entry.userAgent || null,
    };

    const [result] = await this.db
      .insert(auditLogs)
      .values(record)
      .returning();

    // Broadcast to WebSocket clients
    broadcastAuditEvent(result);

    // Also log to structured logger for debugging
    logger.info({
      action: entry.action,
      resource: entry.resource,
      resourceId: entry.resourceId,
      tenantId: entry.tenantId,
      userId: entry.userId
    }, `[AUDIT] ${entry.action} ${entry.resource}${entry.resourceId ? ':' + entry.resourceId : ''}`);

    return result;
  }

  /**
   * Query audit logs with filtering and pagination
   */
  async query(params: {
    tenantId?: string;
    userId?: string;
    resource?: string;
    action?: string;
    resourceId?: string;
    startDate?: Date;
    endDate?: Date;
    severity?: AuditSeverity;
    page?: number;
    limit?: number;
  }): Promise<{ data: AuditLogResult[]; meta: { total: number; page: number; limit: number; totalPages: number } }> {
    const { page = 1, limit = 50 } = params;
    const offset = (page - 1) * limit;
    const conditions: any[] = [];

    if (params.tenantId) conditions.push(eq(auditLogs.tenantId, params.tenantId));
    if (params.userId) conditions.push(eq(auditLogs.userId, params.userId));
    if (params.resource) conditions.push(eq(auditLogs.resource, params.resource));
    if (params.action) conditions.push(eq(auditLogs.action, params.action));
    if (params.resourceId) conditions.push(eq(auditLogs.resourceId, params.resourceId));
    if (params.severity) conditions.push(eq(auditLogs.severity, params.severity));
    if (params.startDate) conditions.push(gte(auditLogs.timestamp, params.startDate));
    if (params.endDate) conditions.push(lte(auditLogs.timestamp, params.endDate));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const countResult = await this.db
      .select({ count: count() })
      .from(auditLogs)
      .where(whereClause);
    const total = Number(countResult[0]?.count || 0);

    // Get paginated data
    const data = await this.db
      .select()
      .from(auditLogs)
      .where(whereClause)
      .orderBy(desc(auditLogs.timestamp))
      .limit(limit)
      .offset(offset);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get single audit event by ID
   */
  async findById(id: string): Promise<AuditLogResult | null> {
    const result = await this.db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.id, id))
      .limit(1);
    return result[0] || null;
  }

  // ============================================================================
  // Convenience methods for common audit events
  // ============================================================================

  async logCreate(resource: AuditResource, resourceId: string, opts: Partial<AuditEntry> = {}) {
    return this.log({ ...opts, action: 'create', resource, resourceId });
  }

  async logUpdate(resource: AuditResource, resourceId: string, opts: Partial<AuditEntry> = {}) {
    return this.log({ ...opts, action: 'update', resource, resourceId });
  }

  async logDelete(resource: AuditResource, resourceId: string, opts: Partial<AuditEntry> = {}) {
    return this.log({ ...opts, action: 'delete', resource, resourceId, severity: 'warning' });
  }

  async logStatusChange(resource: AuditResource, resourceId: string, action: AuditAction, opts: Partial<AuditEntry> = {}) {
    return this.log({ ...opts, action, resource, resourceId });
  }
}

// Singleton instance
let auditServiceInstance: AuditService | null = null;

export function getAuditService(): AuditService {
  if (!auditServiceInstance) {
    auditServiceInstance = new AuditService();
  }
  return auditServiceInstance;
}

// Reset singleton for testing
export function resetAuditService(): void {
  auditServiceInstance = null;
}

// ============================================================================
// Booking Event Broadcasting
// ============================================================================

export interface BookingEvent {
  type: 'created' | 'updated' | 'approved' | 'rejected' | 'cancelled' | 'completed' | 'confirmed';
  bookingId: string;
  rentalObjectId: string;
  tenantId: string;
  startTime?: Date;
  endTime?: Date;
  userId?: string;
  version?: number;
  metadata?: Record<string, unknown>;
}

/**
 * Broadcast booking event to all connected WebSocket clients
 * Used for real-time updates in the UI
 */
export function broadcastBookingEvent(event: BookingEvent): void {
  const message = JSON.stringify({
    type: 'booking',
    event: event.type,
    data: {
      bookingId: event.bookingId,
      rentalObjectId: event.rentalObjectId,
      tenantId: event.tenantId,
      startTime: event.startTime?.toISOString(),
      endTime: event.endTime?.toISOString(),
      userId: event.userId,
      version: event.version,
      metadata: event.metadata,
      timestamp: new Date().toISOString(),
    },
  });

  wsConnections.forEach((ws) => {
    try {
      if (ws.readyState === 1) { // OPEN
        ws.send(message);
      }
    } catch (err) {
      // Ignore send errors for disconnected clients
    }
  });

  // Log for debugging
  logger.debug({ event: event.type, bookingId: event.bookingId }, `[BOOKING_EVENT] ${event.type}`);
}

