/**
 * Metric Definitions
 * Centralized metric definitions for the entire platform
 */

import type { MetricDefinition } from '../types';

/**
 * API Metrics
 */
export const API_METRICS: Record<string, MetricDefinition> = {
  HTTP_REQUEST_DURATION: {
    name: 'http_request_duration_seconds',
    type: 'histogram',
    help: 'HTTP request duration in seconds',
    labelNames: ['method', 'endpoint', 'status', 'tenant_id'],
    buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  },
  HTTP_REQUEST_TOTAL: {
    name: 'http_request_total',
    type: 'counter',
    help: 'Total HTTP requests',
    labelNames: ['method', 'endpoint', 'status', 'tenant_id'],
  },
  HTTP_REQUEST_SIZE: {
    name: 'http_request_size_bytes',
    type: 'histogram',
    help: 'HTTP request size in bytes',
    labelNames: ['method', 'endpoint'],
    buckets: [100, 1000, 10000, 100000, 1000000],
  },
  HTTP_RESPONSE_SIZE: {
    name: 'http_response_size_bytes',
    type: 'histogram',
    help: 'HTTP response size in bytes',
    labelNames: ['method', 'endpoint'],
    buckets: [100, 1000, 10000, 100000, 1000000, 10000000],
  },
};

/**
 * Database Metrics
 */
export const DATABASE_METRICS: Record<string, MetricDefinition> = {
  DB_QUERY_DURATION: {
    name: 'db_query_duration_seconds',
    type: 'histogram',
    help: 'Database query duration in seconds',
    labelNames: ['operation', 'table', 'tenant_id'],
    buckets: [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
  },
  DB_QUERY_TOTAL: {
    name: 'db_query_total',
    type: 'counter',
    help: 'Total database queries',
    labelNames: ['operation', 'table', 'tenant_id'],
  },
  DB_QUERY_ERRORS: {
    name: 'db_query_errors_total',
    type: 'counter',
    help: 'Total database query errors',
    labelNames: ['operation', 'table', 'error_type'],
  },
  DB_CONNECTION_POOL_SIZE: {
    name: 'db_connection_pool_size',
    type: 'gauge',
    help: 'Current database connection pool size',
    labelNames: ['state'],
  },
  DB_TRANSACTION_DURATION: {
    name: 'db_transaction_duration_seconds',
    type: 'histogram',
    help: 'Database transaction duration in seconds',
    labelNames: ['tenant_id'],
    buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5, 10],
  },
};

/**
 * Booking Engine Metrics
 */
export const BOOKING_METRICS: Record<string, MetricDefinition> = {
  BOOKING_CREATED: {
    name: 'booking_created_total',
    type: 'counter',
    help: 'Total bookings created',
    labelNames: ['mode', 'status', 'tenant_id'],
  },
  BOOKING_DURATION: {
    name: 'booking_creation_duration_seconds',
    type: 'histogram',
    help: 'Booking creation duration in seconds',
    labelNames: ['mode', 'tenant_id'],
    buckets: [0.1, 0.5, 1, 2, 5, 10, 30],
  },
  BOOKING_CONFLICTS: {
    name: 'booking_conflicts_total',
    type: 'counter',
    help: 'Total booking conflicts detected',
    labelNames: ['mode', 'tenant_id'],
  },
  BOOKING_APPROVALS: {
    name: 'booking_approvals_total',
    type: 'counter',
    help: 'Total booking approvals',
    labelNames: ['action', 'tenant_id'],
  },
  BOOKING_CANCELLATIONS: {
    name: 'booking_cancellations_total',
    type: 'counter',
    help: 'Total booking cancellations',
    labelNames: ['reason', 'tenant_id'],
  },
};

/**
 * Authentication Metrics
 */
export const AUTH_METRICS: Record<string, MetricDefinition> = {
  AUTH_ATTEMPTS: {
    name: 'auth_attempts_total',
    type: 'counter',
    help: 'Total authentication attempts',
    labelNames: ['provider', 'action', 'status', 'app'],
  },
  AUTH_SESSION_DURATION: {
    name: 'auth_session_duration_seconds',
    type: 'histogram',
    help: 'Authentication session duration in seconds',
    labelNames: ['app', 'tenant_id'],
    buckets: [60, 300, 900, 1800, 3600, 7200, 14400, 28800, 86400],
  },
  AUTH_ACTIVE_SESSIONS: {
    name: 'auth_active_sessions',
    type: 'gauge',
    help: 'Current active authentication sessions',
    labelNames: ['app', 'tenant_id'],
  },
  AUTH_TOKEN_REFRESHES: {
    name: 'auth_token_refreshes_total',
    type: 'counter',
    help: 'Total token refresh operations',
    labelNames: ['status', 'tenant_id'],
  },
};

/**
 * Custody & RBAC Metrics
 */
export const CUSTODY_METRICS: Record<string, MetricDefinition> = {
  CUSTODY_CHECKS: {
    name: 'custody_checks_total',
    type: 'counter',
    help: 'Total custody permission checks',
    labelNames: ['action', 'scope', 'result', 'tenant_id'],
  },
  CUSTODY_GRANTS: {
    name: 'custody_grants_total',
    type: 'counter',
    help: 'Total custody grants created',
    labelNames: ['scope', 'tenant_id'],
  },
  CUSTODY_REVOCATIONS: {
    name: 'custody_revocations_total',
    type: 'counter',
    help: 'Total custody grants revoked',
    labelNames: ['scope', 'reason', 'tenant_id'],
  },
};

/**
 * Entitlements & Feature Flags Metrics
 */
export const ENTITLEMENT_METRICS: Record<string, MetricDefinition> = {
  ENTITLEMENT_CHECKS: {
    name: 'entitlement_checks_total',
    type: 'counter',
    help: 'Total entitlement checks',
    labelNames: ['module', 'feature', 'result', 'tenant_id'],
  },
  ENTITLEMENT_UPDATES: {
    name: 'entitlement_updates_total',
    type: 'counter',
    help: 'Total entitlement updates',
    labelNames: ['module', 'tenant_id'],
  },
  FEATURE_FLAG_EVALUATIONS: {
    name: 'feature_flag_evaluations_total',
    type: 'counter',
    help: 'Total feature flag evaluations',
    labelNames: ['flag', 'result', 'tenant_id'],
  },
};

/**
 * WebSocket Metrics
 */
export const WEBSOCKET_METRICS: Record<string, MetricDefinition> = {
  WS_CONNECTIONS: {
    name: 'websocket_connections',
    type: 'gauge',
    help: 'Current WebSocket connections',
    labelNames: ['app', 'tenant_id'],
  },
  WS_MESSAGES_SENT: {
    name: 'websocket_messages_sent_total',
    type: 'counter',
    help: 'Total WebSocket messages sent',
    labelNames: ['event_type', 'tenant_id'],
  },
  WS_MESSAGES_RECEIVED: {
    name: 'websocket_messages_received_total',
    type: 'counter',
    help: 'Total WebSocket messages received',
    labelNames: ['event_type', 'tenant_id'],
  },
  WS_ERRORS: {
    name: 'websocket_errors_total',
    type: 'counter',
    help: 'Total WebSocket errors',
    labelNames: ['error_type', 'tenant_id'],
  },
};

/**
 * Tenant Metrics
 */
export const TENANT_METRICS: Record<string, MetricDefinition> = {
  TENANT_ACTIVE_USERS: {
    name: 'tenant_active_users',
    type: 'gauge',
    help: 'Current active users per tenant',
    labelNames: ['tenant_id', 'plan'],
  },
  TENANT_API_REQUESTS: {
    name: 'tenant_api_requests_total',
    type: 'counter',
    help: 'Total API requests per tenant',
    labelNames: ['tenant_id', 'plan'],
  },
  TENANT_STORAGE_USAGE: {
    name: 'tenant_storage_usage_bytes',
    type: 'gauge',
    help: 'Storage usage per tenant in bytes',
    labelNames: ['tenant_id', 'plan'],
  },
  TENANT_BOOKINGS: {
    name: 'tenant_bookings_total',
    type: 'counter',
    help: 'Total bookings per tenant',
    labelNames: ['tenant_id', 'plan', 'status'],
  },
};

/**
 * All Metrics Registry
 */
export const ALL_METRICS = {
  ...API_METRICS,
  ...DATABASE_METRICS,
  ...BOOKING_METRICS,
  ...AUTH_METRICS,
  ...CUSTODY_METRICS,
  ...ENTITLEMENT_METRICS,
  ...WEBSOCKET_METRICS,
  ...TENANT_METRICS,
} as const;
