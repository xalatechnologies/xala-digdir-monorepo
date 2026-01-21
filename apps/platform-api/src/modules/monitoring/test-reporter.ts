/**
 * Test Reporter for Monitoring Dashboard
 * Collects and exports test results for dashboard visualization
 */

export interface TestResult {
  name: string;
  duration: number;
  status: 'passed' | 'failed' | 'skipped';
  error?: string;
  file?: string;
}

export interface TestSuiteResult {
  name: string;
  tests: TestResult[];
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
}

export interface TestReport {
  id: string;
  timestamp: string;
  type: 'unit' | 'integration' | 'e2e' | 'performance' | 'security';
  suites: TestSuiteResult[];
  summary: {
    totalTests: number;
    passed: number;
    failed: number;
    skipped: number;
    passRate: number;
    duration: number;
  };
  coverage?: {
    lines: number;
    statements: number;
    functions: number;
    branches: number;
  };
}

// In-memory storage for test reports
const testReports: Map<string, TestReport> = new Map();

/**
 * Create a new test report
 */
export function createTestReport(
  type: TestReport['type'],
  suites: TestSuiteResult[],
  coverage?: TestReport['coverage']
): TestReport {
  const totalTests = suites.reduce((acc, s) => acc + s.tests.length, 0);
  const passed = suites.reduce((acc, s) => acc + s.passed, 0);
  const failed = suites.reduce((acc, s) => acc + s.failed, 0);
  const skipped = suites.reduce((acc, s) => acc + s.skipped, 0);
  const duration = suites.reduce((acc, s) => acc + s.duration, 0);

  const report: TestReport = {
    id: `report-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    timestamp: new Date().toISOString(),
    type,
    suites,
    summary: {
      totalTests,
      passed,
      failed,
      skipped,
      passRate: totalTests > 0 ? (passed / totalTests) * 100 : 0,
      duration,
    },
    coverage,
  };

  testReports.set(report.id, report);
  return report;
}

/**
 * Get all test reports
 */
export function getTestReports(): TestReport[] {
  return Array.from(testReports.values()).sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

/**
 * Get test report by ID
 */
export function getTestReportById(id: string): TestReport | null {
  return testReports.get(id) || null;
}

/**
 * Get latest report by type
 */
export function getLatestReportByType(type: TestReport['type']): TestReport | null {
  const reports = getTestReports().filter(r => r.type === type);
  return reports[0] || null;
}

/**
 * Get coverage summary across all latest reports
 */
export function getCoverageSummary(): {
  unit: number;
  integration: number;
  e2e: number;
  overall: number;
} {
  const unit = getLatestReportByType('unit')?.coverage?.lines || 0;
  const integration = getLatestReportByType('integration')?.coverage?.lines || 0;
  const e2e = getLatestReportByType('e2e')?.coverage?.lines || 0;
  
  const overall = (unit + integration + e2e) / 3;
  
  return { unit, integration, e2e, overall };
}

/**
 * Parse Vitest JSON output to TestReport
 */
export function parseVitestOutput(json: any, type: TestReport['type']): TestReport {
  const suites: TestSuiteResult[] = json.testResults?.map((file: any) => ({
    name: file.name,
    tests: file.assertionResults?.map((test: any) => ({
      name: test.title,
      duration: test.duration || 0,
      status: test.status === 'passed' ? 'passed' : test.status === 'skipped' ? 'skipped' : 'failed',
      error: test.failureMessages?.join('\n'),
      file: file.name,
    })) || [],
    passed: file.assertionResults?.filter((t: any) => t.status === 'passed').length || 0,
    failed: file.assertionResults?.filter((t: any) => t.status === 'failed').length || 0,
    skipped: file.assertionResults?.filter((t: any) => t.status === 'skipped').length || 0,
    duration: file.endTime - file.startTime || 0,
  })) || [];

  const coverage = json.coverageMap ? {
    lines: json.coverageMap.total.lines.pct || 0,
    statements: json.coverageMap.total.statements.pct || 0,
    functions: json.coverageMap.total.functions.pct || 0,
    branches: json.coverageMap.total.branches.pct || 0,
  } : undefined;

  return createTestReport(type, suites, coverage);
}

/**
 * Export report as Prometheus metrics
 */
export function toPrometheusMetrics(report: TestReport): string {
  const lines: string[] = [
    `# HELP test_total Total number of tests`,
    `# TYPE test_total gauge`,
    `test_total{type="${report.type}"} ${report.summary.totalTests}`,
    ``,
    `# HELP test_passed Number of passed tests`,
    `# TYPE test_passed gauge`,
    `test_passed{type="${report.type}"} ${report.summary.passed}`,
    ``,
    `# HELP test_failed Number of failed tests`,
    `# TYPE test_failed gauge`,
    `test_failed{type="${report.type}"} ${report.summary.failed}`,
    ``,
    `# HELP test_pass_rate Test pass rate percentage`,
    `# TYPE test_pass_rate gauge`,
    `test_pass_rate{type="${report.type}"} ${report.summary.passRate.toFixed(2)}`,
    ``,
    `# HELP test_duration_ms Total test duration in milliseconds`,
    `# TYPE test_duration_ms gauge`,
    `test_duration_ms{type="${report.type}"} ${report.summary.duration}`,
  ];

  if (report.coverage) {
    lines.push(
      ``,
      `# HELP test_coverage_lines Line coverage percentage`,
      `# TYPE test_coverage_lines gauge`,
      `test_coverage_lines{type="${report.type}"} ${report.coverage.lines.toFixed(2)}`,
      ``,
      `# HELP test_coverage_branches Branch coverage percentage`,
      `# TYPE test_coverage_branches gauge`,
      `test_coverage_branches{type="${report.type}"} ${report.coverage.branches.toFixed(2)}`,
    );
  }

  return lines.join('\n');
}
