/**
 * Database Metrics Helpers
 * High-level helpers for recording database metrics
 */

import { prometheusExporter } from '../exporters/prometheus';
import type { DatabaseMetricLabels } from '../types';

/**
 * Record database query
 */
export function recordDatabaseQuery(
  operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'TRANSACTION',
  durationSeconds: number,
  table?: string,
  tenantId?: string
): void {
  const labels: DatabaseMetricLabels = {
    operation,
    ...(table && { table }),
    ...(tenantId && { tenant_id: tenantId }),
  };

  // Duration histogram
  prometheusExporter.observeHistogram(
    'db_query_duration_seconds',
    durationSeconds,
    labels
  );

  // Query counter
  prometheusExporter.incrementCounter('db_query_total', labels);
}

/**
 * Record database query error
 */
export function recordDatabaseError(
  operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'TRANSACTION',
  errorType: string,
  table?: string
): void {
  prometheusExporter.incrementCounter('db_query_errors_total', {
    operation,
    error_type: errorType,
    ...(table && { table }),
  });
}

/**
 * Update connection pool metrics
 */
export function updateConnectionPoolMetrics(
  idle: number,
  active: number,
  waiting: number
): void {
  prometheusExporter.setGauge('db_connection_pool_size', idle, { state: 'idle' });
  prometheusExporter.setGauge('db_connection_pool_size', active, { state: 'active' });
  prometheusExporter.setGauge('db_connection_pool_size', waiting, { state: 'waiting' });
}

/**
 * Record database transaction
 */
export function recordDatabaseTransaction(
  durationSeconds: number,
  tenantId?: string
): void {
  prometheusExporter.observeHistogram('db_transaction_duration_seconds', durationSeconds, {
    ...(tenantId && { tenant_id: tenantId }),
  });
}

/**
 * Drizzle ORM query wrapper with metrics
 */
export async function withDatabaseMetrics<T>(
  operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE',
  table: string,
  queryFn: () => Promise<T>,
  tenantId?: string
): Promise<T> {
  const startTime = Date.now();
  try {
    const result = await queryFn();
    const duration = (Date.now() - startTime) / 1000;
    recordDatabaseQuery(operation, duration, table, tenantId);
    return result;
  } catch (error) {
    const duration = (Date.now() - startTime) / 1000;
    recordDatabaseQuery(operation, duration, table, tenantId);
    recordDatabaseError(operation, (error as Error).name, table);
    throw error;
  }
}
