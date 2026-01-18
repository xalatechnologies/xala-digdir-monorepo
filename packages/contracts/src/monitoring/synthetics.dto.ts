/**
 * Synthetic Monitoring DTOs
 * Synthetic monitor runs and results
 */

export interface SyntheticMonitorDTO {
  id: string;
  name: string;
  type: SyntheticMonitorType;
  url: string;
  interval: number;
  timeout: number;
  enabled: boolean;
  tenantId?: string;
  createdAt: string;
  updatedAt: string;
  lastRun?: SyntheticRunDTO;
  config: SyntheticMonitorConfig;
}

export type SyntheticMonitorType = 'http' | 'ping' | 'dns' | 'tcp' | 'browser';

export interface SyntheticMonitorConfig {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
  expectedStatus?: number;
  expectedBody?: string;
  followRedirects?: boolean;
  validateSSL?: boolean;
  assertions?: SyntheticAssertion[];
}

export interface SyntheticAssertion {
  type: 'status' | 'body' | 'header' | 'response_time';
  operator: 'equals' | 'contains' | 'less_than' | 'greater_than';
  value: string | number;
}

export interface SyntheticRunDTO {
  id: string;
  monitorId: string;
  status: SyntheticRunStatus;
  responseTime: number;
  statusCode?: number;
  error?: string;
  screenshot?: string;
  startedAt: string;
  completedAt: string;
  assertions: SyntheticAssertionResult[];
}

export type SyntheticRunStatus = 'success' | 'failure' | 'timeout' | 'error';

export interface SyntheticAssertionResult {
  assertion: SyntheticAssertion;
  passed: boolean;
  actual?: string | number;
  message?: string;
}

export interface CreateSyntheticMonitorDTO {
  name: string;
  type: SyntheticMonitorType;
  url: string;
  interval: number;
  timeout?: number;
  tenantId?: string;
  config?: SyntheticMonitorConfig;
}

export interface UpdateSyntheticMonitorDTO {
  name?: string;
  url?: string;
  interval?: number;
  timeout?: number;
  enabled?: boolean;
  config?: SyntheticMonitorConfig;
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

export interface SyntheticRunListResponseDTO {
  data: SyntheticRunDTO[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
