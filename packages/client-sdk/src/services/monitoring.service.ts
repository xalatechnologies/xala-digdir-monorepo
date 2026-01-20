/**
 * Monitoring Service
 * System health, logs, and performance monitoring (Admin)
 */
import { getClient } from '@/core/client-factory';

export interface HealthStatus {
  status: 'ok' | 'degraded' | 'down';
  timestamp: string;
  version: string;
  services: ServiceHealth[];
}

export interface ServiceHealth {
  name: string;
  status: 'ok' | 'degraded' | 'down';
  responseTime?: number;
  lastCheck: string;
  message?: string;
}

export interface SystemMetrics {
  cpu: number;
  memory: number;
  disk: number;
  uptime: number;
  requestsPerMinute: number;
  avgResponseTime: number;
}

export interface LogEntry {
  id: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  context?: Record<string, unknown>;
  timestamp: string;
}

export interface LogQueryParams {
  level?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'resolved';
  affectedServices: string[];
  createdAt: string;
  resolvedAt?: string;
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

class MonitoringService {
  private basePath = '/api/monitoring';

  /**
   * Get system health status
   * @returns Promise with health status including service states
   * @example
   * ```ts
   * const health = await monitoringService.getHealth();
   * console.log(health.status); // 'ok' | 'degraded' | 'down'
   * ```
   */
  async getHealth(): Promise<HealthStatus> {
    return getClient().get<HealthStatus>(`${this.basePath}/health`);
  }

  /**
   * Get system metrics (CPU, memory, disk, performance)
   * @returns Promise with system performance metrics
   * @example
   * ```ts
   * const { data } = await monitoringService.getMetrics();
   * console.log(`CPU: ${data.cpu}%, Memory: ${data.memory}%`);
   * ```
   */
  async getMetrics(): Promise<{ data: SystemMetrics }> {
    return getClient().get<{ data: SystemMetrics }>(`${this.basePath}/metrics`);
  }

  /**
   * Get system logs with filtering and pagination
   * @param params - Query parameters for filtering logs
   * @returns Promise with paginated log entries
   * @example
   * ```ts
   * const logs = await monitoringService.getLogs({
   *   level: 'error',
   *   startDate: '2024-01-01',
   *   page: 1,
   *   limit: 50
   * });
   * ```
   */
  async getLogs(params: LogQueryParams = {}): Promise<PaginatedResponse<LogEntry>> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) queryParams.set(key, String(value));
    });

    const url = queryParams.toString()
      ? `${this.basePath}/logs?${queryParams.toString()}`
      : `${this.basePath}/logs`;

    return getClient().get<PaginatedResponse<LogEntry>>(url);
  }

  /**
   * Get active incidents
   * @returns Promise with list of active system incidents
   * @example
   * ```ts
   * const { data } = await monitoringService.getIncidents();
   * const critical = data.filter(i => i.severity === 'critical');
   * ```
   */
  async getIncidents(): Promise<{ data: Incident[] }> {
    return getClient().get<{ data: Incident[] }>(`${this.basePath}/incidents`);
  }

  /**
   * Get database statistics (table sizes and row counts)
   * @returns Promise with database table statistics
   * @example
   * ```ts
   * const { data } = await monitoringService.getDatabaseStats();
   * data.tables.forEach(t => console.log(`${t.name}: ${t.rowCount} rows, ${t.size}`));
   * ```
   */
  async getDatabaseStats(): Promise<{ data: { tables: { name: string; rowCount: number; size: string }[] } }> {
    return getClient().get<{ data: { tables: { name: string; rowCount: number; size: string }[] } }>(`${this.basePath}/database`);
  }

  /**
   * Get API usage statistics by endpoint
   * @param period - Time period for statistics ('day' | 'week' | 'month')
   * @returns Promise with API endpoint usage statistics
   * @example
   * ```ts
   * const { data } = await monitoringService.getApiUsage('week');
   * const topEndpoint = data.sort((a, b) => b.calls - a.calls)[0];
   * ```
   */
  async getApiUsage(period: 'day' | 'week' | 'month' = 'day'): Promise<{ data: { endpoint: string; calls: number; avgResponseTime: number }[] }> {
    return getClient().get<{ data: { endpoint: string; calls: number; avgResponseTime: number }[] }>(`${this.basePath}/api-usage?period=${period}`);
  }

  /**
   * Trigger manual health check
   * @returns Promise with updated health status
   * @example
   * ```ts
   * const health = await monitoringService.triggerHealthCheck();
   * if (health.status !== 'ok') {
   *   console.error('Health check failed:', health.services);
   * }
   * ```
   */
  async triggerHealthCheck(): Promise<HealthStatus> {
    return getClient().post<HealthStatus>(`${this.basePath}/health-check`);
  }
}

export const monitoringService = new MonitoringService();
