/**
 * Test Fixtures for Monitoring Data
 * Mock data for testing monitoring features
 */
import type {
  MonitoringOverviewDTO,
  IncidentDTO,
  SyntheticMonitorDTO,
  GrafanaDashboardDTO,
  LogEntryDTO,
  AuditEventDTO,
} from '@xala/contracts';

export const mockSystemHealth = {
  status: 'healthy' as const,
  services: [
    { name: 'API', status: 'healthy' as const, responseTime: 45, uptime: 99.98 },
    { name: 'Database', status: 'healthy' as const, responseTime: 12, uptime: 99.99 },
    { name: 'Cache', status: 'healthy' as const, responseTime: 5, uptime: 99.95 },
  ],
  uptime: 99.98,
  lastCheck: new Date().toISOString(),
};

export const mockSystemMetrics = {
  cpu: 45,
  memory: 60,
  disk: 35,
  uptime: 86400,
  requestsPerMinute: 1250,
  avgResponseTime: 120,
  errorRate: 0.02,
  activeConnections: 450,
};

export const mockIncidents: IncidentDTO[] = [
  {
    id: 'incident-001',
    title: 'API Latency Spike',
    description: 'Response times increased to 2s average',
    severity: 'high',
    status: 'investigating',
    affectedServices: ['API', 'Database'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: ['performance', 'api'],
    tenantId: 'monitoring-tenant-001',
  },
  {
    id: 'incident-002',
    title: 'Database Connection Pool Exhausted',
    description: 'All connections in use, queries queuing',
    severity: 'critical',
    status: 'open',
    affectedServices: ['Database'],
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date().toISOString(),
    tags: ['database', 'critical'],
    tenantId: 'monitoring-tenant-001',
  },
];

export const mockSyntheticMonitors: SyntheticMonitorDTO[] = [
  {
    id: 'monitor-001',
    name: 'API Health Check',
    type: 'http',
    url: 'https://api.digilist.no/health',
    interval: 60,
    timeout: 5000,
    enabled: true,
    tenantId: 'monitoring-tenant-001',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'monitor-002',
    name: 'Login Page Load',
    type: 'browser',
    url: 'https://digilist.no/login',
    interval: 300,
    timeout: 10000,
    enabled: true,
    tenantId: 'monitoring-tenant-001',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const mockGrafanaDashboards: GrafanaDashboardDTO[] = [
  {
    uid: 'dashboard-001',
    title: 'Platform Overview',
    url: '/d/dashboard-001/platform-overview',
    tags: ['platform', 'overview'],
    starred: true,
  },
  {
    uid: 'dashboard-002',
    title: 'API Metrics',
    url: '/d/dashboard-002/api-metrics',
    tags: ['api', 'performance'],
    starred: false,
  },
];

export const mockLogs: LogEntryDTO[] = [
  {
    id: 'log-001',
    level: 'error',
    message: 'Database connection timeout',
    timestamp: new Date().toISOString(),
    service: 'api',
    context: { query: 'SELECT * FROM users', timeout: 5000 },
  },
  {
    id: 'log-002',
    level: 'warn',
    message: 'High memory usage detected',
    timestamp: new Date(Date.now() - 60000).toISOString(),
    service: 'api',
    context: { memoryUsage: 85, threshold: 80 },
  },
];

export const mockAuditEvents: AuditEventDTO[] = [
  {
    id: 'audit-001',
    action: 'incident:create',
    userId: 'test-user-monitoring-001',
    userName: 'Monitoring Admin',
    resourceType: 'incident',
    resourceId: 'incident-001',
    timestamp: new Date().toISOString(),
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0',
  },
  {
    id: 'audit-002',
    action: 'incident:resolve',
    userId: 'test-user-monitoring-001',
    userName: 'Monitoring Admin',
    resourceType: 'incident',
    resourceId: 'incident-002',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0',
  },
];

export const mockMonitoringOverview: MonitoringOverviewDTO = {
  health: mockSystemHealth,
  metrics: mockSystemMetrics,
  recentIncidents: mockIncidents.slice(0, 5),
  dashboardSummary: {
    totalDashboards: 12,
    recentlyViewed: ['platform-overview', 'api-metrics'],
    favorites: ['system-health'],
  },
  timestamp: new Date().toISOString(),
};
