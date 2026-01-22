/**
 * Monitoring Types
 *
 * Local type definitions for monitoring functionality.
 * Previously from @xalatechnologies/platform/contracts.
 */

// =============================================================================
// Overview
// =============================================================================

export interface MonitoringOverviewDTO {
  status: 'healthy' | 'degraded' | 'critical';
  uptime: number;
  activeIncidents: number;
  metrics: {
    cpu: number;
    memory: number;
    requests: number;
  };
  timestamp: string;
}

// =============================================================================
// Incidents
// =============================================================================

export interface IncidentDTO {
  id: string;
  title: string;
  description?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'acknowledged' | 'resolved';
  service?: string;
  assignee?: string;
  createdAt: string;
  updatedAt: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  metadata?: Record<string, unknown>;
}

export interface IncidentListResponseDTO {
  data: IncidentDTO[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface IncidentFilterDTO {
  severity?: 'low' | 'medium' | 'high' | 'critical';
  status?: 'open' | 'acknowledged' | 'resolved';
  service?: string;
  assignee?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface CreateIncidentDTO {
  title: string;
  description?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  service?: string;
  metadata?: Record<string, unknown>;
}

export interface UpdateIncidentDTO {
  title?: string;
  description?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  assignee?: string;
  metadata?: Record<string, unknown>;
}

export interface AcknowledgeIncidentDTO {
  acknowledgedBy: string;
  notes?: string;
}

export interface ResolveIncidentDTO {
  resolvedBy: string;
  resolution: string;
  rootCause?: string;
}

// =============================================================================
// Synthetic Monitors
// =============================================================================

export interface SyntheticMonitorDTO {
  id: string;
  name: string;
  type: 'http' | 'tcp' | 'dns' | 'script';
  url?: string;
  interval: number;
  enabled: boolean;
  status: 'passing' | 'failing' | 'unknown';
  lastRun?: string;
  nextRun?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface SyntheticMonitorListResponseDTO {
  data: SyntheticMonitorDTO[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface SyntheticRunDTO {
  id: string;
  monitorId: string;
  status: 'success' | 'failure' | 'timeout';
  responseTime?: number;
  statusCode?: number;
  error?: string;
  timestamp: string;
}

export interface SyntheticRunListResponseDTO {
  data: SyntheticRunDTO[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateSyntheticMonitorDTO {
  name: string;
  type: 'http' | 'tcp' | 'dns' | 'script';
  url?: string;
  interval: number;
  enabled?: boolean;
  metadata?: Record<string, unknown>;
}

export interface UpdateSyntheticMonitorDTO {
  name?: string;
  url?: string;
  interval?: number;
  enabled?: boolean;
  metadata?: Record<string, unknown>;
}

// =============================================================================
// Grafana
// =============================================================================

export interface GrafanaDashboardDTO {
  uid: string;
  title: string;
  slug: string;
  url: string;
  tags: string[];
  starred: boolean;
  folderId?: number;
  folderTitle?: string;
}

export interface GrafanaDashboardListDTO {
  dashboards: GrafanaDashboardDTO[];
}

export interface GrafanaQueryRequestDTO {
  dashboardUid: string;
  panelId: number;
  from: string;
  to: string;
  variables?: Record<string, string>;
}

export interface GrafanaQueryResponseDTO {
  results: Array<{
    name: string;
    values: Array<[number, number]>;
    labels?: Record<string, string>;
  }>;
}

// =============================================================================
// Logs
// =============================================================================

export interface LogEntryDTO {
  id: string;
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  service?: string;
  traceId?: string;
  spanId?: string;
  metadata?: Record<string, unknown>;
}

export interface LogListResponseDTO {
  data: LogEntryDTO[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface LogFilterDTO {
  level?: 'debug' | 'info' | 'warn' | 'error';
  service?: string;
  traceId?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface LogStatisticsDTO {
  totalLogs: number;
  byLevel: Record<string, number>;
  byService: Record<string, number>;
  errorRate: number;
  period: string;
}

// =============================================================================
// Audit
// =============================================================================

export interface AuditEntryDTO {
  id: string;
  timestamp: string;
  action: string;
  resource: string;
  resourceId?: string;
  actor: string;
  actorType: 'user' | 'system' | 'api';
  tenantId?: string;
  changes?: Record<string, { old?: unknown; new?: unknown }>;
  metadata?: Record<string, unknown>;
}

export interface AuditListResponseDTO {
  data: AuditEntryDTO[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AuditFilterDTO {
  action?: string;
  resource?: string;
  actor?: string;
  actorType?: 'user' | 'system' | 'api';
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface AuditCorrelationDTO {
  traceId: string;
  entries: AuditEntryDTO[];
  timeline: Array<{
    timestamp: string;
    event: string;
    details: string;
  }>;
}

export interface AuditStatisticsDTO {
  totalEvents: number;
  byAction: Record<string, number>;
  byResource: Record<string, number>;
  byActor: Record<string, number>;
  period: string;
}
