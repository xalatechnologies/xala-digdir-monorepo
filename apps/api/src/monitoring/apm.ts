/**
 * APM (Application Performance Monitoring) Instrumentation
 * Tracks metrics, traces, and performance data
 * 
 * Compatible with OpenTelemetry standard
 */
import { Injectable, Inject } from '../core/decorators';

interface MetricData {
  name: string;
  value: number;
  unit?: string;
  tags?: Record<string, string>;
  timestamp?: number;
}

interface TraceSpan {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  operation: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  tags?: Record<string, string>;
  status?: 'ok' | 'error';
  error?: string;
}

@Injectable()
export class APMService {
  private metrics: MetricData[] = [];
  private traces: Map<string, TraceSpan> = new Map();

  constructor(
    @Inject('Adapters') private readonly adapters: any
  ) {}

  /**
   * Record a metric
   */
  recordMetric(metric: MetricData): void {
    this.metrics.push({
      ...metric,
      timestamp: metric.timestamp || Date.now(),
    });

    // Log high-value metrics immediately
    if (metric.name.includes('error') || metric.name.includes('latency')) {
      this.adapters?.log?.info('Metric recorded', metric);
    }

    // Flush metrics periodically (every 60 seconds)
    if (this.metrics.length >= 100) {
      this.flushMetrics();
    }
  }

  /**
   * Start a trace span
   */
  startSpan(operation: string, parentSpanId?: string): string {
    const spanId = this.generateId();
    const traceId = parentSpanId || this.generateId();

    const span: TraceSpan = {
      traceId,
      spanId,
      parentSpanId,
      operation,
      startTime: Date.now(),
      tags: {},
    };

    this.traces.set(spanId, span);
    return spanId;
  }

  /**
   * End a trace span
   */
  endSpan(spanId: string, status: 'ok' | 'error' = 'ok', error?: string): void {
    const span = this.traces.get(spanId);
    if (!span) return;

    span.endTime = Date.now();
    span.duration = span.endTime - span.startTime;
    span.status = status;
    span.error = error;

    // Log slow operations (> 1 second)
    if (span.duration > 1000) {
      this.adapters?.log?.warn('Slow operation detected', {
        operation: span.operation,
        duration: span.duration,
        traceId: span.traceId,
      });
    }

    // Log errors immediately
    if (status === 'error') {
      this.adapters?.log?.error('Operation failed', {
        operation: span.operation,
        error,
        duration: span.duration,
        traceId: span.traceId,
      });
    }

    this.traces.delete(spanId);
  }

  /**
   * Add tags to a span
   */
  addSpanTags(spanId: string, tags: Record<string, string>): void {
    const span = this.traces.get(spanId);
    if (span) {
      span.tags = { ...span.tags, ...tags };
    }
  }

  /**
   * Record API endpoint metrics
   */
  recordApiMetrics(endpoint: string, method: string, statusCode: number, duration: number): void {
    this.recordMetric({
      name: 'http_request_duration_ms',
      value: duration,
      unit: 'milliseconds',
      tags: {
        endpoint,
        method,
        status: String(statusCode),
      },
    });

    // Count requests
    this.recordMetric({
      name: 'http_request_total',
      value: 1,
      unit: 'count',
      tags: {
        endpoint,
        method,
        status: String(statusCode),
      },
    });

    // Track errors
    if (statusCode >= 400) {
      this.recordMetric({
        name: 'http_request_errors',
        value: 1,
        unit: 'count',
        tags: {
          endpoint,
          method,
          status: String(statusCode),
        },
      });
    }
  }

  /**
   * Record database query metrics
   */
  recordDatabaseMetrics(query: string, duration: number, rows?: number): void {
    this.recordMetric({
      name: 'db_query_duration_ms',
      value: duration,
      unit: 'milliseconds',
      tags: {
        operation: this.extractQueryOperation(query),
      },
    });

    if (rows !== undefined) {
      this.recordMetric({
        name: 'db_query_rows',
        value: rows,
        unit: 'count',
        tags: {
          operation: this.extractQueryOperation(query),
        },
      });
    }
  }

  /**
   * Record booking metrics
   */
  recordBookingMetrics(action: string, rentalObjectId: string, success: boolean): void {
    this.recordMetric({
      name: `booking_${action}`,
      value: 1,
      unit: 'count',
      tags: {
        rentalObjectId,
        success: String(success),
      },
    });
  }

  /**
   * Record GDPR metrics
   */
  recordGDPRMetrics(action: 'dsar_created' | 'dsar_completed' | 'consent_updated'): void {
    this.recordMetric({
      name: 'gdpr_action',
      value: 1,
      unit: 'count',
      tags: { action },
    });
  }

  /**
   * Get current metrics summary
   */
  getMetricsSummary(): any {
    const summary: Record<string, any> = {};

    this.metrics.forEach((metric) => {
      const key = metric.name;
      if (!summary[key]) {
        summary[key] = {
          count: 0,
          sum: 0,
          min: Infinity,
          max: -Infinity,
          avg: 0,
        };
      }

      summary[key].count++;
      summary[key].sum += metric.value;
      summary[key].min = Math.min(summary[key].min, metric.value);
      summary[key].max = Math.max(summary[key].max, metric.value);
      summary[key].avg = summary[key].sum / summary[key].count;
    });

    return summary;
  }

  /**
   * Flush metrics to storage/monitoring service
   */
  private flushMetrics(): void {
    if (this.metrics.length === 0) return;

    // TODO: Send to monitoring service (e.g., Prometheus, DataDog, New Relic)
    this.adapters?.log?.info('Flushing metrics', {
      count: this.metrics.length,
      summary: this.getMetricsSummary(),
    });

    this.metrics = [];
  }

  /**
   * Extract operation from SQL query
   */
  private extractQueryOperation(query: string): string {
    const match = query.trim().match(/^(SELECT|INSERT|UPDATE|DELETE)/i);
    return match ? match[1].toUpperCase() : 'UNKNOWN';
  }

  /**
   * Generate unique ID for traces
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }

  /**
   * Health check metrics
   */
  getHealthMetrics(): any {
    return {
      metricsBuffered: this.metrics.length,
      activeTraces: this.traces.size,
      status: 'healthy',
    };
  }
}
