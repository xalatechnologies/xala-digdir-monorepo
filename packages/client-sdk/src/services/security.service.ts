/**
 * Security Service
 * Provides security metrics, GDPR compliance status, failed login tracking,
 * and data export monitoring for compliance dashboard
 */
import { getClient } from '../core/client-factory';

export interface SecurityMetrics {
  auditTrailCompleteness: number;
  failedLogins: {
    last24Hours: number;
    last7Days: number;
  };
  dataExports: {
    last30Days: number;
  };
  securityEvents: SecurityEvent[];
  timestamp: string;
}

export interface SecurityEvent {
  id: string;
  action: string;
  resource: string;
  resourceId: string | null;
  userId: string | null;
  severity: 'warning' | 'error' | 'critical';
  metadata: Record<string, unknown>;
  timestamp: string;
  ipAddress: string | null;
}

export interface GdprStatus {
  totalUsers: number;
  withConsent: number;
  withoutConsent: number;
  percentage: number;
  timestamp: string;
}

export interface FailedLoginAttempt {
  id: string;
  userId: string | null;
  action: string;
  resource: string;
  resourceId: string | null;
  severity: string;
  metadata: Record<string, unknown>;
  timestamp: string;
  ipAddress: string | null;
  userAgent: string | null;
}

export interface DataExportEvent {
  id: string;
  userId: string | null;
  userName: string;
  userEmail: string | null;
  action: string;
  resource: string;
  resourceId: string | null;
  severity: string;
  metadata: Record<string, unknown>;
  timestamp: string;
  ipAddress: string | null;
  userAgent: string | null;
}

export interface FailedLoginQueryParams {
  userId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface DataExportQueryParams {
  userId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
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

export class SecurityService {
  private basePath = '/api/security';

  /**
   * Get security dashboard metrics
   * Returns audit trail completeness, failed logins, data exports, and security events
   * API returns data directly (not wrapped in { data: ... })
   */
  async getMetrics(): Promise<SecurityMetrics> {
    return getClient().get<SecurityMetrics>(`${this.basePath}/metrics`);
  }

  /**
   * Get GDPR consent status summary
   * Returns total users, users with consent, users without consent, and percentage
   * API returns data directly (not wrapped in { data: ... })
   */
  async getGdprStatus(): Promise<GdprStatus> {
    return getClient().get<GdprStatus>(`${this.basePath}/gdpr-status`);
  }

  /**
   * Get failed login attempts with optional filtering
   * Returns paginated list of failed login attempts from audit logs
   */
  async getFailedLogins(params: FailedLoginQueryParams = {}): Promise<PaginatedResponse<FailedLoginAttempt>> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) queryParams.set(key, String(value));
    });

    const url = queryParams.toString()
      ? `${this.basePath}/failed-logins?${queryParams.toString()}`
      : `${this.basePath}/failed-logins`;

    return getClient().get<PaginatedResponse<FailedLoginAttempt>>(url);
  }

  /**
   * Get data export tracking with optional filtering
   * Returns paginated list of data export events from audit logs with user info
   */
  async getDataExports(params: DataExportQueryParams = {}): Promise<PaginatedResponse<DataExportEvent>> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) queryParams.set(key, String(value));
    });

    const url = queryParams.toString()
      ? `${this.basePath}/data-exports?${queryParams.toString()}`
      : `${this.basePath}/data-exports`;

    return getClient().get<PaginatedResponse<DataExportEvent>>(url);
  }

  /**
   * Get failed logins for a specific user
   * Convenience method for filtering by user ID
   */
  async getFailedLoginsByUser(userId: string, params: Omit<FailedLoginQueryParams, 'userId'> = {}): Promise<PaginatedResponse<FailedLoginAttempt>> {
    return this.getFailedLogins({ ...params, userId });
  }

  /**
   * Get data exports for a specific user
   * Convenience method for filtering by user ID
   */
  async getDataExportsByUser(userId: string, params: Omit<DataExportQueryParams, 'userId'> = {}): Promise<PaginatedResponse<DataExportEvent>> {
    return this.getDataExports({ ...params, userId });
  }
}

export const securityService = new SecurityService();
