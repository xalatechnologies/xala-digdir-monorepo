/**
 * Audit Service
 * Provides access to audit logs, real-time audit events, and client-side logging
 */
import { getClient, getClientConfig } from '@/core/client-factory';

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
   * @param params - Audit log entry parameters including action, resource, and optional metadata
   * @returns Promise with created audit log entry
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
      tenantId: config?.tenantId || '',
      severity: params.severity || 'info',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
      timestamp: new Date().toISOString(),
    };
    return getClient().post<{ data: AuditLogEntry }>(this.basePath, payload);
  }

  /**
   * Log an error event
   * Convenience method for logging errors with proper severity
   *
   * @param action - Action identifier (e.g., 'api_request_failed', 'validation_error')
   * @param resource - Resource type being accessed (e.g., 'booking', 'listing')
   * @param error - Error object or error message string
   * @param metadata - Optional additional context and metadata
   * @returns Promise with created audit log entry
   *
   * @example
   * ```typescript
   * try {
   *   await bookingService.create(data);
   * } catch (error) {
   *   await auditService.logError(
   *     'booking_creation_failed',
   *     'booking',
   *     error,
   *     { listingId: data.listingId }
   *   );
   * }
   * ```
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
   *
   * @param action - Action identifier (e.g., 'rate_limit_approaching', 'deprecated_api_used')
   * @param resource - Resource type being accessed
   * @param message - Warning message describing the issue
   * @param metadata - Optional additional context and metadata
   * @returns Promise with created audit log entry
   *
   * @example
   * ```typescript
   * await auditService.logWarning(
   *   'rate_limit_approaching',
   *   'api',
   *   'API rate limit at 80% capacity',
   *   { requestCount: 800, limit: 1000 }
   * );
   * ```
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
   *
   * @param action - Action identifier (e.g., 'user_login', 'resource_viewed')
   * @param resource - Resource type being accessed
   * @param metadata - Optional additional context and metadata
   * @returns Promise with created audit log entry
   *
   * @example
   * ```typescript
   * await auditService.logInfo(
   *   'user_login',
   *   'auth',
   *   { method: 'oauth', provider: 'google' }
   * );
   * ```
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
   * Retrieves paginated audit log entries with support for various filters
   *
   * @param params - Optional query parameters for filtering (resource, action, userId, date range, etc.)
   * @returns Promise with paginated list of audit log entries
   *
   * @example
   * ```typescript
   * // Get all audit logs (first page)
   * const logs = await auditService.getAll({ page: 1, limit: 50 });
   *
   * // Filter by severity and date range
   * const errorLogs = await auditService.getAll({
   *   severity: 'error',
   *   startDate: '2024-01-01',
   *   endDate: '2024-01-31',
   *   page: 1,
   *   limit: 100
   * });
   * ```
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
   * Retrieves detailed information for a specific audit log entry
   *
   * @param id - Unique audit log entry identifier
   * @returns Promise with audit log entry details
   *
   * @example
   * ```typescript
   * const auditLog = await auditService.getById('audit-123');
   * console.log('Action:', auditLog.data.action);
   * console.log('Timestamp:', auditLog.data.timestamp);
   * ```
   */
  async getById(id: string): Promise<{ data: AuditLogEntry }> {
    return getClient().get<{ data: AuditLogEntry }>(`${this.basePath}/${id}`);
  }

  /**
   * Get audit statistics for the last 24 hours
   * Retrieves aggregated statistics including counts by resource, action, and severity
   *
   * @returns Promise with audit statistics
   *
   * @example
   * ```typescript
   * const stats = await auditService.getStats();
   * console.log('Total events:', stats.data.total);
   * console.log('Last 24h:', stats.data.last24Hours);
   * console.log('By resource:', stats.data.byResource);
   * ```
   */
  async getStats(): Promise<{ data: AuditStats }> {
    return getClient().get<{ data: AuditStats }>(`${this.basePath}/stats`);
  }

  /**
   * Get audit logs for a specific resource
   * Convenience method to filter audit logs by resource type
   *
   * @param resource - Resource type to filter by (e.g., 'booking', 'listing', 'user')
   * @param params - Optional additional query parameters (excluding resource)
   * @returns Promise with paginated list of audit log entries for the specified resource
   *
   * @example
   * ```typescript
   * // Get all booking-related audit logs
   * const bookingLogs = await auditService.getByResource('booking', {
   *   page: 1,
   *   limit: 50
   * });
   * ```
   */
  async getByResource(resource: string, params: Omit<AuditQueryParams, 'resource'> = {}): Promise<PaginatedResponse<AuditLogEntry>> {
    return this.getAll({ ...params, resource });
  }

  /**
   * Get audit logs for a specific user
   * Convenience method to filter audit logs by user ID
   *
   * @param userId - User identifier to filter by
   * @param params - Optional additional query parameters (excluding userId)
   * @returns Promise with paginated list of audit log entries for the specified user
   *
   * @example
   * ```typescript
   * // Get all audit logs for a specific user
   * const userLogs = await auditService.getByUser('user-123', {
   *   startDate: '2024-01-01',
   *   page: 1,
   *   limit: 100
   * });
   * ```
   */
  async getByUser(userId: string, params: Omit<AuditQueryParams, 'userId'> = {}): Promise<PaginatedResponse<AuditLogEntry>> {
    return this.getAll({ ...params, userId });
  }
}

export const auditService = new AuditService();
