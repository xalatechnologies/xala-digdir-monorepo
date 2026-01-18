/**
 * Observability Reporter for Test Results
 * 
 * Integrates with @xala/observability to report test results
 * to the monitoring dashboard via Prometheus metrics.
 */

import type { Reporter } from 'vitest/reporters';

/**
 * Try to import observability metrics
 * Falls back gracefully if package not available
 */
let observabilityAvailable = false;
let recordTestExecution: ((suite: string, category: string, status: 'passed' | 'failed' | 'skipped', durationMs: number) => void) | null = null;
let recordPassRate: ((suite: string, category: string, passed: number, total: number) => void) | null = null;
let recordTestCoverage: ((type: 'line' | 'branch' | 'function' | 'statement', percentage: number) => void) | null = null;

// Dynamic import to avoid build errors if observability not linked
async function initObservability() {
  try {
    const observability = await import('@xala/observability');
    recordTestExecution = observability.recordTestExecution;
    recordPassRate = observability.recordPassRate;
    recordTestCoverage = observability.recordTestCoverage;
    observabilityAvailable = true;
    console.log('[Testing] Observability metrics connected');
  } catch (e) {
    console.log('[Testing] Observability not available, metrics disabled');
    observabilityAvailable = false;
  }
}

// Initialize on module load
initObservability();

interface TestResult {
  name: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  suite?: string;
  category?: string;
}

interface SuiteSummary {
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
  coverage?: number;
}

export class ObservabilityReporter implements Partial<Reporter> {
  private startTime: number = 0;
  private results: TestResult[] = [];

  onInit() {
    this.startTime = Date.now();
    console.log('[Testing] Observability Reporter initialized');
  }

  onTestComplete(result: TestResult) {
    this.results.push(result);
    
    if (observabilityAvailable && recordTestExecution) {
      recordTestExecution(
        result.suite || 'default',
        result.category || 'unit',
        result.status,
        result.duration
      );
    }
  }

  async onFinished() {
    const duration = Date.now() - this.startTime;
    const passed = this.results.filter(r => r.status === 'passed').length;
    const failed = this.results.filter(r => r.status === 'failed').length;
    const skipped = this.results.filter(r => r.status === 'skipped').length;

    // Record pass rate
    if (observabilityAvailable && recordPassRate) {
      recordPassRate('all', 'all', passed, passed + failed);
    }

    const summary = {
      passed,
      failed,
      skipped,
      duration,
      total: this.results.length,
    };

    console.log('[Testing] Suite complete:', summary);
    
    return summary;
  }
}

export default ObservabilityReporter;
