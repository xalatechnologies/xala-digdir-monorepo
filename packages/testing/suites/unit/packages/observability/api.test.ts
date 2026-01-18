/**
 * API Metrics Tests
 * Tests API metric recording functions
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { recordHttpRequest, recordHttpRequestSize, recordHttpResponseSize } from './api';
import { prometheusExporter } from '../exporters/prometheus';

describe('API Metrics', () => {
  beforeEach(() => {
    prometheusExporter.resetMetrics();
  });

  describe('recordHttpRequest', () => {
    it('should record HTTP request with all parameters', () => {
      recordHttpRequest('GET', '/api/listings', 200, 0.123, 'tenant-123');

      const metrics = prometheusExporter.getMetric('http_request_duration_seconds');
      expect(metrics).toBeDefined();
    });

    it('should record HTTP request without tenant ID', () => {
      recordHttpRequest('POST', '/api/bookings', 201, 0.456);

      const metrics = prometheusExporter.getMetric('http_request_total');
      expect(metrics).toBeDefined();
    });

    it('should record error responses', () => {
      recordHttpRequest('GET', '/api/users', 500, 0.789, 'tenant-456');

      const metrics = prometheusExporter.getMetric('http_request_total');
      expect(metrics).toBeDefined();
    });

    it('should handle different HTTP methods', () => {
      const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
      methods.forEach((method) => {
        recordHttpRequest(method, '/api/test', 200, 0.1);
      });

      const metrics = prometheusExporter.getMetric('http_request_total');
      expect(metrics).toBeDefined();
    });
  });

  describe('recordHttpRequestSize', () => {
    it('should record request size', () => {
      recordHttpRequestSize('POST', '/api/bookings', 1024);

      const metrics = prometheusExporter.getMetric('http_request_size_bytes');
      expect(metrics).toBeDefined();
    });

    it('should handle large request sizes', () => {
      recordHttpRequestSize('POST', '/api/upload', 10485760); // 10MB

      const metrics = prometheusExporter.getMetric('http_request_size_bytes');
      expect(metrics).toBeDefined();
    });
  });

  describe('recordHttpResponseSize', () => {
    it('should record response size', () => {
      recordHttpResponseSize('GET', '/api/listings', 2048);

      const metrics = prometheusExporter.getMetric('http_response_size_bytes');
      expect(metrics).toBeDefined();
    });

    it('should handle large response sizes', () => {
      recordHttpResponseSize('GET', '/api/export', 52428800); // 50MB

      const metrics = prometheusExporter.getMetric('http_response_size_bytes');
      expect(metrics).toBeDefined();
    });
  });

  describe('Middleware Integration', () => {
    it('should create middleware function', async () => {
      const { createApiMetricsMiddleware } = await import('./api');
      const middleware = createApiMetricsMiddleware();

      expect(typeof middleware).toBe('function');
    });
  });
});
