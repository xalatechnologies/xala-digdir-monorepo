/**
 * Prometheus Exporter Tests
 * Tests metric recording and export functionality
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { PrometheusExporter } from './prometheus';

describe('PrometheusExporter', () => {
  let exporter: PrometheusExporter;

  beforeEach(() => {
    exporter = new PrometheusExporter();
  });

  describe('Initialization', () => {
    it('should initialize with all metrics', () => {
      const registry = exporter.getRegistry();
      expect(registry).toBeDefined();
    });

    it('should have metrics registered', async () => {
      const metrics = await exporter.getMetrics();
      expect(metrics).toBeDefined();
      expect(typeof metrics).toBe('string');
    });
  });

  describe('Counter Operations', () => {
    it('should increment counter', () => {
      exporter.incrementCounter('http_request_total', {
        method: 'GET',
        endpoint: '/test',
        status: '200',
      });

      const metric = exporter.getMetric('http_request_total');
      expect(metric).toBeDefined();
    });

    it('should increment counter with custom value', () => {
      exporter.incrementCounter('http_request_total', {
        method: 'POST',
        endpoint: '/api/test',
        status: '201',
      }, 5);

      const metric = exporter.getMetric('http_request_total');
      expect(metric).toBeDefined();
    });
  });

  describe('Gauge Operations', () => {
    it('should set gauge value', () => {
      exporter.setGauge('db_connection_pool_size', 10, { state: 'active' });

      const metric = exporter.getMetric('db_connection_pool_size');
      expect(metric).toBeDefined();
    });

    it('should increment gauge', () => {
      exporter.setGauge('websocket_connections', 5, { app: 'web' });
      exporter.incrementGauge('websocket_connections', { app: 'web' }, 3);

      const metric = exporter.getMetric('websocket_connections');
      expect(metric).toBeDefined();
    });

    it('should decrement gauge', () => {
      exporter.setGauge('websocket_connections', 10, { app: 'minside' });
      exporter.decrementGauge('websocket_connections', { app: 'minside' }, 2);

      const metric = exporter.getMetric('websocket_connections');
      expect(metric).toBeDefined();
    });
  });

  describe('Histogram Operations', () => {
    it('should observe histogram value', () => {
      exporter.observeHistogram('http_request_duration_seconds', 0.123, {
        method: 'GET',
        endpoint: '/api/listings',
        status: '200',
      });

      const metric = exporter.getMetric('http_request_duration_seconds');
      expect(metric).toBeDefined();
    });

    it('should handle multiple observations', () => {
      const values = [0.01, 0.05, 0.1, 0.5, 1.0];
      values.forEach((value) => {
        exporter.observeHistogram('db_query_duration_seconds', value, {
          operation: 'SELECT',
          table: 'users',
        });
      });

      const metric = exporter.getMetric('db_query_duration_seconds');
      expect(metric).toBeDefined();
    });
  });

  describe('Metrics Export', () => {
    it('should export metrics in Prometheus format', async () => {
      exporter.incrementCounter('http_request_total', {
        method: 'GET',
        endpoint: '/test',
        status: '200',
      });

      const metrics = await exporter.getMetrics();
      expect(metrics).toContain('http_request_total');
      expect(metrics).toContain('method="GET"');
      expect(metrics).toContain('endpoint="/test"');
      expect(metrics).toContain('status="200"');
    });

    it('should export metrics as JSON', async () => {
      exporter.incrementCounter('http_request_total', {
        method: 'POST',
        endpoint: '/api/bookings',
        status: '201',
      });

      const metricsJSON = await exporter.getMetricsJSON();
      expect(Array.isArray(metricsJSON)).toBe(true);
      expect(metricsJSON.length).toBeGreaterThan(0);
    });
  });

  describe('Metric Retrieval', () => {
    it('should retrieve specific metric', () => {
      const metric = exporter.getMetric('http_request_total');
      expect(metric).toBeDefined();
    });

    it('should return undefined for non-existent metric', () => {
      const metric = exporter.getMetric('non_existent_metric');
      expect(metric).toBeUndefined();
    });
  });

  describe('Registry Operations', () => {
    it('should get registry instance', () => {
      const registry = exporter.getRegistry();
      expect(registry).toBeDefined();
      expect(typeof registry.metrics).toBe('function');
    });

    it('should reset metrics', () => {
      exporter.incrementCounter('http_request_total', {
        method: 'GET',
        endpoint: '/test',
        status: '200',
      });

      exporter.resetMetrics();

      // After reset, metrics should still be registered but values reset
      const metric = exporter.getMetric('http_request_total');
      expect(metric).toBeDefined();
    });
  });
});
