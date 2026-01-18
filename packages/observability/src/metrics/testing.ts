/**
 * Test Metrics for @xala/observability
 * 
 * Provides metrics for test execution monitoring.
 * These metrics are exported and can be scraped by Prometheus.
 */

import { Counter, Gauge, Histogram, Registry } from 'prom-client';

// Create a dedicated registry for test metrics
const testRegistry = new Registry();

// Test execution metrics
export const testExecutionCounter = new Counter({
  name: 'test_executions_total',
  help: 'Total number of test executions',
  labelNames: ['suite', 'category', 'status'],
  registers: [testRegistry],
});

export const testDurationHistogram = new Histogram({
  name: 'test_duration_seconds',
  help: 'Test execution duration in seconds',
  labelNames: ['suite', 'category'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5, 10],
  registers: [testRegistry],
});

export const testCoverageGauge = new Gauge({
  name: 'test_coverage_percentage',
  help: 'Test coverage percentage',
  labelNames: ['type'], // 'line', 'branch', 'function', 'statement'
  registers: [testRegistry],
});

export const testPassRateGauge = new Gauge({
  name: 'test_pass_rate',
  help: 'Test pass rate (0-1)',
  labelNames: ['suite', 'category'],
  registers: [testRegistry],
});

// Current test run status
export const currentTestStatus = new Gauge({
  name: 'test_current_status',
  help: 'Current test run status (0=not running, 1=running, 2=passed, 3=failed)',
  labelNames: ['suite'],
  registers: [testRegistry],
});

/**
 * Record a test execution result
 */
export function recordTestExecution(
  suite: string,
  category: string,
  status: 'passed' | 'failed' | 'skipped',
  durationMs: number
): void {
  testExecutionCounter.inc({ suite, category, status });
  testDurationHistogram.observe(
    { suite, category },
    durationMs / 1000
  );
}

/**
 * Record test coverage
 */
export function recordTestCoverage(
  type: 'line' | 'branch' | 'function' | 'statement',
  percentage: number
): void {
  testCoverageGauge.set({ type }, percentage);
}

/**
 * Record test pass rate for a suite
 */
export function recordPassRate(
  suite: string,
  category: string,
  passed: number,
  total: number
): void {
  const rate = total > 0 ? passed / total : 0;
  testPassRateGauge.set({ suite, category }, rate);
}

/**
 * Get test metrics for Prometheus scraping
 */
export async function getTestMetrics(): Promise<string> {
  return testRegistry.metrics();
}

export { testRegistry };
