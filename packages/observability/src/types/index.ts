/**
 * Observability Type Definitions
 * Shared types for metrics, traces, and monitoring
 */

export type MetricType = 'counter' | 'gauge' | 'histogram' | 'summary';

export interface MetricDefinition {
  name: string;
  type: MetricType;
  help: string;
  labelNames?: string[];
  buckets?: number[];
  percentiles?: number[];
}

export interface MetricLabels {
  [key: string]: string | number;
}

export interface ApiMetricLabels extends MetricLabels {
  method: string;
  endpoint: string;
  status: string;
  tenant_id?: string;
}

export interface DatabaseMetricLabels extends MetricLabels {
  operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'TRANSACTION';
  table?: string;
  tenant_id?: string;
}

export interface BookingMetricLabels extends MetricLabels {
  action: 'create' | 'approve' | 'reject' | 'cancel' | 'complete';
  mode: 'SINGLE_SLOT' | 'IN_GAME' | 'RECURRING';
  status: 'success' | 'failure' | 'conflict';
  tenant_id: string;
}

export interface AuthMetricLabels extends MetricLabels {
  provider: 'idporten' | 'vipps' | 'microsoft' | 'demo';
  action: 'login' | 'logout' | 'refresh' | 'revoke';
  status: 'success' | 'failure';
  app: 'web' | 'minside' | 'backoffice' | 'saas-admin';
}

export interface CustodyMetricLabels extends MetricLabels {
  action: 'grant' | 'revoke' | 'subgrant' | 'check';
  scope: string;
  result: 'allow' | 'deny';
  tenant_id: string;
}

export interface EntitlementMetricLabels extends MetricLabels {
  module: string;
  feature?: string;
  action: 'check' | 'update' | 'sync';
  result: 'allow' | 'deny';
  tenant_id: string;
}

export interface WebSocketMetricLabels extends MetricLabels {
  event_type: string;
  tenant_id?: string;
  app?: string;
}

export interface TenantMetricLabels extends MetricLabels {
  tenant_id: string;
  plan: 'free' | 'starter' | 'professional' | 'enterprise';
  status: 'active' | 'suspended' | 'trial';
}

export interface AlertSeverity {
  severity: 'critical' | 'warning' | 'info';
  priority: 'P0' | 'P1' | 'P2' | 'P3';
}

export interface DashboardMetadata {
  uid: string;
  title: string;
  tags: string[];
  category: 'platform' | 'business' | 'apps' | 'tenants';
  refresh: string;
}
