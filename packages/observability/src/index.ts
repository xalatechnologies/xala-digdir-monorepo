/**
 * @xala/observability
 * Observability stack for Digilist platform
 * 
 * Provides metrics, dashboards, and alerting infrastructure
 */

export * from './types';
export * from './metrics';
export * from './exporters';

// Re-export commonly used items
export { prometheusExporter } from './exporters/prometheus';
export {
  recordHttpRequest,
  createApiMetricsMiddleware,
} from './metrics/api';
export {
  recordDatabaseQuery,
  withDatabaseMetrics,
  updateConnectionPoolMetrics,
} from './metrics/database';
export {
  recordBookingCreated,
  recordBookingConflict,
  withBookingMetrics,
} from './metrics/booking';
