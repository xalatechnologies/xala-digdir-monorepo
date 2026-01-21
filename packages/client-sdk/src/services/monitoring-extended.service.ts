/**
 * Extended Monitoring Service
 * Extends the existing monitoring service with new endpoints
 */
import { getClient } from '@/core/client-factory';
import type {
  MonitoringOverviewDTO,
  IncidentDTO,
  IncidentListResponseDTO,
  IncidentFilterDTO,
  CreateIncidentDTO,
  UpdateIncidentDTO,
  AcknowledgeIncidentDTO,
  ResolveIncidentDTO,
  SyntheticMonitorDTO,
  SyntheticMonitorListResponseDTO,
  SyntheticRunListResponseDTO,
  CreateSyntheticMonitorDTO,
  UpdateSyntheticMonitorDTO,
  GrafanaDashboardListDTO,
  GrafanaDashboardDTO,
  GrafanaQueryRequestDTO,
  GrafanaQueryResponseDTO,
  LogListResponseDTO,
  LogFilterDTO,
  LogStatisticsDTO,
  AuditListResponseDTO,
  AuditFilterDTO,
  AuditCorrelationDTO,
  AuditStatisticsDTO,
} from '@xalatechnologies/platform/contracts';

class MonitoringExtendedService {
  private basePath = '/api/monitoring';

  /**
   * Get comprehensive monitoring overview
   */
  async getOverview(tenantId?: string): Promise<MonitoringOverviewDTO> {
    const params = tenantId ? { tenantId } : {};
    return getClient().get<MonitoringOverviewDTO>(`${this.basePath}/overview`, { params });
  }

  // ==================== Incidents ====================

  /**
   * List incidents with filtering
   */
  async getIncidents(filter?: IncidentFilterDTO): Promise<IncidentListResponseDTO> {
    return getClient().get<IncidentListResponseDTO>(`${this.basePath}/incidents`, {
      params: filter as Record<string, string | number | boolean | undefined>,
    });
  }

  /**
   * Get incident by ID
   */
  async getIncident(id: string): Promise<IncidentDTO> {
    return getClient().get<IncidentDTO>(`${this.basePath}/incidents/${id}`);
  }

  /**
   * Create new incident
   */
  async createIncident(data: CreateIncidentDTO): Promise<IncidentDTO> {
    return getClient().post<IncidentDTO>(`${this.basePath}/incidents`, data);
  }

  /**
   * Update incident
   */
  async updateIncident(id: string, data: UpdateIncidentDTO): Promise<IncidentDTO> {
    return getClient().patch<IncidentDTO>(`${this.basePath}/incidents/${id}`, data);
  }

  /**
   * Acknowledge incident
   */
  async acknowledgeIncident(id: string, data: AcknowledgeIncidentDTO): Promise<IncidentDTO> {
    return getClient().post<IncidentDTO>(`${this.basePath}/incidents/${id}/acknowledge`, data);
  }

  /**
   * Resolve incident
   */
  async resolveIncident(id: string, data: ResolveIncidentDTO): Promise<IncidentDTO> {
    return getClient().post<IncidentDTO>(`${this.basePath}/incidents/${id}/resolve`, data);
  }

  // ==================== Synthetic Monitors ====================

  /**
   * List synthetic monitors
   */
  async getSyntheticMonitors(tenantId?: string): Promise<SyntheticMonitorListResponseDTO> {
    const params = tenantId ? { tenantId } : {};
    return getClient().get<SyntheticMonitorListResponseDTO>(`${this.basePath}/synthetics`, { params });
  }

  /**
   * Get synthetic monitor by ID
   */
  async getSyntheticMonitor(id: string): Promise<SyntheticMonitorDTO> {
    return getClient().get<SyntheticMonitorDTO>(`${this.basePath}/synthetics/${id}`);
  }

  /**
   * Get synthetic monitor runs
   */
  async getSyntheticRuns(monitorId: string, limit = 50): Promise<SyntheticRunListResponseDTO> {
    return getClient().get<SyntheticRunListResponseDTO>(`${this.basePath}/synthetics/${monitorId}/runs`, {
      params: { limit },
    });
  }

  /**
   * Create synthetic monitor
   */
  async createSyntheticMonitor(data: CreateSyntheticMonitorDTO): Promise<SyntheticMonitorDTO> {
    return getClient().post<SyntheticMonitorDTO>(`${this.basePath}/synthetics`, data);
  }

  /**
   * Update synthetic monitor
   */
  async updateSyntheticMonitor(id: string, data: UpdateSyntheticMonitorDTO): Promise<SyntheticMonitorDTO> {
    return getClient().patch<SyntheticMonitorDTO>(`${this.basePath}/synthetics/${id}`, data);
  }

  /**
   * Delete synthetic monitor
   */
  async deleteSyntheticMonitor(id: string): Promise<void> {
    return getClient().delete(`${this.basePath}/synthetics/${id}`);
  }

  /**
   * Trigger synthetic monitor run
   */
  async triggerSyntheticRun(id: string): Promise<void> {
    return getClient().post(`${this.basePath}/synthetics/${id}/run`);
  }

  // ==================== Grafana ====================

  /**
   * List Grafana dashboards
   */
  async getGrafanaDashboards(search?: string): Promise<GrafanaDashboardListDTO> {
    const params = search ? { search } : {};
    return getClient().get<GrafanaDashboardListDTO>(`${this.basePath}/grafana/dashboards`, { params });
  }

  /**
   * Get Grafana dashboard by UID
   */
  async getGrafanaDashboard(uid: string): Promise<GrafanaDashboardDTO> {
    return getClient().get<GrafanaDashboardDTO>(`${this.basePath}/grafana/dashboards/${uid}`);
  }

  /**
   * Query Grafana panel data
   */
  async queryGrafanaPanel(request: GrafanaQueryRequestDTO): Promise<GrafanaQueryResponseDTO> {
    return getClient().post<GrafanaQueryResponseDTO>(`${this.basePath}/grafana/query`, request);
  }

  /**
   * Star/unstar Grafana dashboard
   */
  async toggleGrafanaDashboardStar(uid: string, starred: boolean): Promise<void> {
    return getClient().post(`${this.basePath}/grafana/dashboards/${uid}/star`, { starred });
  }

  // ==================== Logs ====================

  /**
   * Get logs with filtering
   */
  async getLogs(filter?: LogFilterDTO): Promise<LogListResponseDTO> {
    return getClient().get<LogListResponseDTO>(`${this.basePath}/logs`, {
      params: filter as Record<string, string | number | boolean | undefined>,
    });
  }

  /**
   * Get log statistics
   */
  async getLogStatistics(startDate?: string, endDate?: string): Promise<LogStatisticsDTO> {
    const params = { startDate, endDate };
    return getClient().get<LogStatisticsDTO>(`${this.basePath}/logs/statistics`, { params });
  }

  /**
   * Export logs
   */
  async exportLogs(filter: LogFilterDTO, format: 'json' | 'csv' | 'txt' = 'json'): Promise<Blob> {
    return getClient().post(`${this.basePath}/logs/export`, { filter, format }, {
      responseType: 'blob',
    });
  }

  // ==================== Audit ====================

  /**
   * Get audit events with filtering
   */
  async getAuditEvents(filter?: AuditFilterDTO): Promise<AuditListResponseDTO> {
    return getClient().get<AuditListResponseDTO>(`${this.basePath}/audit`, {
      params: filter as Record<string, string | number | boolean | undefined>,
    });
  }

  /**
   * Get audit correlation by ID
   */
  async getAuditCorrelation(correlationId: string): Promise<AuditCorrelationDTO> {
    return getClient().get<AuditCorrelationDTO>(`${this.basePath}/audit/correlation/${correlationId}`);
  }

  /**
   * Get audit statistics
   */
  async getAuditStatistics(startDate?: string, endDate?: string): Promise<AuditStatisticsDTO> {
    const params = { startDate, endDate };
    return getClient().get<AuditStatisticsDTO>(`${this.basePath}/audit/statistics`, { params });
  }
}

export const monitoringExtendedService = new MonitoringExtendedService();
