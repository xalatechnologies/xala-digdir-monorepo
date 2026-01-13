/**
 * Audit Service
 * Provides access to audit logs and real-time audit events
 */
import { getClient } from '../core/client-factory';

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
