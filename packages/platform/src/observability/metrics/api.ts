/**
 * API Metrics Helpers
 * High-level helpers for recording API metrics
 */

import { prometheusExporter } from '../exporters/prometheus';
import type { ApiMetricLabels } from '../types';

/**
 * Record HTTP request
 */
export function recordHttpRequest(
  method: string,
  endpoint: string,
  statusCode: number,
  durationSeconds: number,
  tenantId?: string
): void {
  const labels: ApiMetricLabels = {
    method,
    endpoint,
    status: String(statusCode),
    ...(tenantId && { tenant_id: tenantId }),
  };

  // Duration histogram
  prometheusExporter.observeHistogram(
    'http_request_duration_seconds',
    durationSeconds,
    labels
  );

  // Request counter
  prometheusExporter.incrementCounter('http_request_total', labels);
}

/**
 * Record HTTP request size
 */
export function recordHttpRequestSize(
  method: string,
  endpoint: string,
  sizeBytes: number
): void {
  prometheusExporter.observeHistogram('http_request_size_bytes', sizeBytes, {
    method,
    endpoint,
  });
}

/**
 * Record HTTP response size
 */
export function recordHttpResponseSize(
  method: string,
  endpoint: string,
  sizeBytes: number
): void {
  prometheusExporter.observeHistogram('http_response_size_bytes', sizeBytes, {
    method,
    endpoint,
  });
}

/**
 * Middleware helper for Express/Fastify
 */
export function createApiMetricsMiddleware() {
  return (req: any, res: any, next: any) => {
    const startTime = Date.now();

    res.on('finish', () => {
      const duration = (Date.now() - startTime) / 1000;
      const endpoint = req.route?.path || req.url;
      const method = req.method;
      const status = res.statusCode;
      const tenantId = req.user?.tenantId || req.headers['x-tenant-id'];

      recordHttpRequest(method, endpoint, status, duration, tenantId);

      // Record sizes if available
      const requestSize = req.headers['content-length'];
      if (requestSize) {
        recordHttpRequestSize(method, endpoint, parseInt(requestSize, 10));
      }

      const responseSize = res.get('content-length');
      if (responseSize) {
        recordHttpResponseSize(method, endpoint, parseInt(responseSize, 10));
      }
    });

    next();
  };
}
