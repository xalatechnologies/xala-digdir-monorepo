/**
 * Audit Service
 * Provides access to audit logs, real-time audit events, and client-side logging
 */
import { getClient, getClientConfig } from '../core/client-factory';

export interface AuditLogEntry {
  id: string;
  tenantId: string | null;
  userId: string | null;
  action: string;
  resource: string;
  resourceId: string | null;
  severity: 'debug' | 'info' | 'warning' | 'error' | 'critical';
  metadata: Record<string, unknown>;
  ipAddress: string | null;
  userAgent: string | null;
  timestamp: string;
}

/**
 * Parameters for creating a new audit log entry
 */
export interface CreateAuditLogParams {
  action: string;
  resource: string;
  resourceId?: string;
  severity?: 'debug' | 'info' | 'warning' | 'error' | 'critical';
  metadata?: Record<string, unknown>;
  userId?: string;
}

export interface AuditQueryParams {
  resource?: string;
  action?: string;
  userId?: string;
  resourceId?: string;
  severity?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface AuditStats {
  total: number;
  last24Hours: number;
  byResource: Record<string, number>;
  byAction: Record<string, number>;
  bySeverity: Record<string, number>;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

class AuditService {
  private basePath = '/api/audit';

  /**
   * Create a new audit log entry
   * Use this to log client-side events, errors, warnings, and user actions
   *
   * @example
   * ```typescript
   * // Log an error
   * await auditService.create({
   *   action: 'login_failed',
   *   resource: 'auth',
   *   severity: 'error',
   *   metadata: { error: 'Invalid credentials', email: 'user@example.com' }
   * });
   *
   * // Log a user action
   * await auditService.create({
   *   action: 'listing_viewed',
   *   resource: 'listing',
   *   resourceId: 'listing-123',
   *   severity: 'info'
   * });
   * ```
   */
  async create(params: CreateAuditLogParams): Promise<{ data: AuditLogEntry }> {
    const config = getClientConfig();
    const payload = {
      ...params,
      tenantId: config.tenantId,
      severity: params.severity || 'info',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
      timestamp: new Date().toISOString(),
    };
    return getClient().post<{ data: AuditLogEntry }>(this.basePath, payload);
  }

  /**
   * Log an error event
   * Convenience method for logging errors with proper severity
   */
  async logError(
    action: string,
    resource: string,
    error: Error | string,
    metadata?: Record<string, unknown>
  ): Promise<{ data: AuditLogEntry }> {
    const errorMessage = error instanceof Error ? error.message : error;
    const errorStack = error instanceof Error ? error.stack : undefined;
    return this.create({
      action,
      resource,
      severity: 'error',
      metadata: {
        ...metadata,
        error: errorMessage,
        ...(errorStack && { stack: errorStack }),
      },
    });
  }

  /**
   * Log a warning event
   * Convenience method for logging warnings
   */
  async logWarning(
    action: string,
    resource: string,
    message: string,
    metadata?: Record<string, unknown>
  ): Promise<{ data: AuditLogEntry }> {
    return this.create({
      action,
      resource,
      severity: 'warning',
      metadata: { ...metadata, message },
    });
  }

  /**
   * Log an info event
   * Convenience method for logging informational events
   */
  async logInfo(
    action: string,
    resource: string,
    metadata?: Record<string, unknown>
  ): Promise<{ data: AuditLogEntry }> {
    return this.create({
      action,
      resource,
      severity: 'info',
      metadata,
    });
  }

  /**
   * Get audit logs with optional filtering
   */
  async getAll(params: AuditQueryParams = {}): Promise<PaginatedResponse<AuditLogEntry>> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) queryParams.set(key, String(value));
    });
    
    const url = queryParams.toString() 
      ? `${this.basePath}?${queryParams.toString()}`
      : this.basePath;
    
    return getClient().get<PaginatedResponse<AuditLogEntry>>(url);
  }

  /**
   * Get single audit event by ID
   */
  async getById(id: string): Promise<{ data: AuditLogEntry }> {
    return getClient().get<{ data: AuditLogEntry }>(`${this.basePath}/${id}`);
  }

  /**
   * Get audit statistics for the last 24 hours
   */
  async getStats(): Promise<{ data: AuditStats }> {
    return getClient().get<{ data: AuditStats }>(`${this.basePath}/stats`);
  }

  /**
   * Get audit logs for a specific resource
   */
  async getByResource(resource: string, params: Omit<AuditQueryParams, 'resource'> = {}): Promise<PaginatedResponse<AuditLogEntry>> {
    return this.getAll({ ...params, resource });
  }

  /**
   * Get audit logs for a specific user
   */
  async getByUser(userId: string, params: Omit<AuditQueryParams, 'userId'> = {}): Promise<PaginatedResponse<AuditLogEntry>> {
    return this.getAll({ ...params, userId });
  }
}

export const auditService = new AuditService();
