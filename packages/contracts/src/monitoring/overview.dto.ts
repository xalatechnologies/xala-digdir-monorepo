/**
 * Monitoring Overview DTOs
 * System health and performance overview
 */

export interface MonitoringOverviewDTO {
  health: SystemHealthDTO;
  metrics: SystemMetricsDTO;
  recentIncidents: IncidentSummaryDTO[];
  dashboardSummary: DashboardSummaryDTO;
  timestamp: string;
}

export interface SystemHealthDTO {
  status: 'healthy' | 'degraded' | 'down';
  services: ServiceHealthDTO[];
  uptime: number;
  lastCheck: string;
}

export interface ServiceHealthDTO {
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  responseTime?: number;
  lastCheck: string;
  message?: string;
  endpoint?: string;
}

export interface SystemMetricsDTO {
  cpu: number;
  memory: number;
  disk: number;
  uptime: number;
  requestsPerMinute: number;
  avgResponseTime: number;
  errorRate: number;
  activeConnections: number;
}

export interface IncidentSummaryDTO {
  id: string;
  title: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'resolved';
  affectedServices: string[];
  createdAt: string;
  tenantId?: string;
}

export interface DashboardSummaryDTO {
  totalDashboards: number;
  recentlyViewed: string[];
  favorites: string[];
}
