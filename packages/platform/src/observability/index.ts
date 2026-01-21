/**
 * @xalatechnologies/platform/observability
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

// Legacy exports for backwards compatibility
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface Logger {
  debug: (message: string, context?: Record<string, unknown>) => void;
  info: (message: string, context?: Record<string, unknown>) => void;
  warn: (message: string, context?: Record<string, unknown>) => void;
  error: (message: string, context?: Record<string, unknown>) => void;
}

export function createLogger(name: string): Logger {
  const log = (level: LogLevel, message: string, context?: Record<string, unknown>) => {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      name,
      message,
      ...context,
    };

    switch (level) {
      case 'debug':
        console.debug(JSON.stringify(logEntry));
        break;
      case 'info':
        console.info(JSON.stringify(logEntry));
        break;
      case 'warn':
        console.warn(JSON.stringify(logEntry));
        break;
      case 'error':
        console.error(JSON.stringify(logEntry));
        break;
    }
  };

  return {
    debug: (message, context) => log('debug', message, context),
    info: (message, context) => log('info', message, context),
    warn: (message, context) => log('warn', message, context),
    error: (message, context) => log('error', message, context),
  };
}

export const logger = createLogger('platform');

export interface Metrics {
  increment: (name: string, tags?: Record<string, string>) => void;
  decrement: (name: string, tags?: Record<string, string>) => void;
  gauge: (name: string, value: number, tags?: Record<string, string>) => void;
  timing: (name: string, value: number, tags?: Record<string, string>) => void;
  histogram: (name: string, value: number, tags?: Record<string, string>) => void;
}

export const metrics: Metrics = {
  increment: () => {},
  decrement: () => {},
  gauge: () => {},
  timing: () => {},
  histogram: () => {},
};

export function captureException(
  error: Error,
  context?: Record<string, unknown>
): void {
  logger.error(error.message, { error: error.stack, ...context });
}

export function markPerformance(name: string): void {
  if (typeof performance !== 'undefined' && performance.mark) {
    performance.mark(name);
  }
}

export function measurePerformance(
  name: string,
  startMark: string,
  endMark: string
): number | null {
  if (typeof performance !== 'undefined' && performance.measure) {
    try {
      const measure = performance.measure(name, startMark, endMark);
      return measure.duration;
    } catch {
      return null;
    }
  }
  return null;
}
