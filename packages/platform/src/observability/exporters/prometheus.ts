/**
 * Prometheus Metrics Exporter
 * Exports metrics in Prometheus format using prom-client
 */

import { Registry, Counter, Gauge, Histogram, Summary } from 'prom-client';
import { ALL_METRICS } from '../metrics/definitions';
import type { MetricDefinition, MetricLabels } from '../types';

export class PrometheusExporter {
  private registry: Registry;
  private metrics: Map<string, Counter | Gauge | Histogram | Summary>;

  constructor() {
    this.registry = new Registry();
    this.metrics = new Map();
    this.initializeMetrics();
  }

  /**
   * Initialize all metrics from definitions
   */
  private initializeMetrics(): void {
    Object.values(ALL_METRICS).forEach((definition: MetricDefinition) => {
      const metric = this.createMetric(definition);
      if (metric) {
        this.metrics.set(definition.name, metric);
        this.registry.registerMetric(metric);
      }
    });
  }

  /**
   * Create metric instance based on type
   */
  private createMetric(
    definition: MetricDefinition
  ): Counter | Gauge | Histogram | Summary | null {
    const { name, type, help, labelNames, buckets, percentiles } = definition;

    switch (type) {
      case 'counter':
        return new Counter({ name, help, labelNames });

      case 'gauge':
        return new Gauge({ name, help, labelNames });

      case 'histogram':
        return new Histogram({
          name,
          help,
          labelNames,
          buckets: buckets || [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
        });

      case 'summary':
        return new Summary({
          name,
          help,
          labelNames,
          percentiles: percentiles || [0.5, 0.9, 0.95, 0.99],
        });

      default:
        console.error(`Unknown metric type: ${type}`);
        return null;
    }
  }

  /**
   * Increment a counter metric
   */
  incrementCounter(name: string, labels?: MetricLabels, value: number = 1): void {
    const metric = this.metrics.get(name);
    if (metric instanceof Counter) {
      metric.inc(labels as any, value);
    }
  }

  /**
   * Set a gauge metric
   */
  setGauge(name: string, value: number, labels?: MetricLabels): void {
    const metric = this.metrics.get(name);
    if (metric instanceof Gauge) {
      metric.set(labels as any, value);
    }
  }

  /**
   * Increment a gauge metric
   */
  incrementGauge(name: string, labels?: MetricLabels, value: number = 1): void {
    const metric = this.metrics.get(name);
    if (metric instanceof Gauge) {
      metric.inc(labels as any, value);
    }
  }

  /**
   * Decrement a gauge metric
   */
  decrementGauge(name: string, labels?: MetricLabels, value: number = 1): void {
    const metric = this.metrics.get(name);
    if (metric instanceof Gauge) {
      metric.dec(labels as any, value);
    }
  }

  /**
   * Observe a histogram metric
   */
  observeHistogram(name: string, value: number, labels?: MetricLabels): void {
    const metric = this.metrics.get(name);
    if (metric instanceof Histogram) {
      metric.observe(labels as any, value);
    }
  }

  /**
   * Observe a summary metric
   */
  observeSummary(name: string, value: number, labels?: MetricLabels): void {
    const metric = this.metrics.get(name);
    if (metric instanceof Summary) {
      metric.observe(labels as any, value);
    }
  }

  /**
   * Get metrics in Prometheus format
   */
  async getMetrics(): Promise<string> {
    return this.registry.metrics();
  }

  /**
   * Get metrics as JSON
   */
  async getMetricsJSON(): Promise<any> {
    return this.registry.getMetricsAsJSON();
  }

  /**
   * Get single metric
   */
  getMetric(name: string): Counter | Gauge | Histogram | Summary | undefined {
    return this.metrics.get(name);
  }

  /**
   * Reset all metrics
   */
  resetMetrics(): void {
    this.registry.resetMetrics();
  }

  /**
   * Get registry instance
   */
  getRegistry(): Registry {
    return this.registry;
  }
}

// Singleton instance
export const prometheusExporter = new PrometheusExporter();
