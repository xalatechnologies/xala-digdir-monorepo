/**
 * TestResultsWidget
 * 
 * Dashboard widget for displaying test execution results.
 * Integrates with @xala/observability metrics.
 */

import { useState, useEffect } from 'react';
import { Card, Heading, Paragraph, Table, Badge, Spinner } from '@xalatechnologies/platform/ui';

import { useT } from '@xalatechnologies/platform/i18n';
interface TestSummary {
  passed: number;
  failed: number;
  skipped: number;
  total: number;
  passRate: number;
  duration: number;
  lastRun: string;
}

interface TestCategory {
  name: string;
  passed: number;
  failed: number;
  skipped: number;
}

// Mock data - in production, fetch from API
const mockSummary: TestSummary = {
  passed: 951,
  failed: 73,
  skipped: 218,
  total: 1242,
  passRate: 76.6,
  duration: 45000,
  lastRun: new Date().toISOString(),
};

const mockCategories: TestCategory[] = [
  { name: 'Unit', passed: 450, failed: 25, skipped: 10 },
  { name: 'Integration', passed: 180, failed: 30, skipped: 150 },
  { name: 'E2E', passed: 85, failed: 5, skipped: 0 },
  { name: 'Security', passed: 45, failed: 3, skipped: 25 },
  { name: 'Compliance', passed: 120, failed: 8, skipped: 20 },
  { name: 'Performance', passed: 71, failed: 2, skipped: 13 },
];

export function TestResultsWidget() {
  const t = useT();

  const [summary, setSummary] = useState<TestSummary | null>(null);
  const [categories, setCategories] = useState<TestCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API fetch - replace with actual API call
    const fetchTestResults = async () => {
      setLoading(true);
      try {
        // In production: const res = await fetch('/api/testing/summary');
        // const data = await res.json();
        await new Promise(resolve => setTimeout(resolve, 500));
        setSummary(mockSummary);
        setCategories(mockCategories);
      } catch (error) {
        console.error('Failed to fetch test results:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTestResults();
    
    // Refresh every 5 minutes
    const interval = setInterval(fetchTestResults, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Card>
        <Heading level={2} size="sm">{t('monitoring.text.testResults')}</Heading>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
          <Spinner aria-label={t('monitoring.ariaLabel.loadingTestResults')} />
        </div>
      </Card>
    );
  }

  if (!summary) {
    return (
      <Card>
        <Heading level={2} size="sm">{t('monitoring.text.testResults')}</Heading>
        <Paragraph>{t('monitoring.text.noTestResultsAvailable')}</Paragraph>
      </Card>
    );
  }

  const getStatusBadge = (failed: number) => {
    if (failed === 0) return <Badge color="success">{t('monitoring.text.allPassing')}</Badge>;
    if (failed < 10) return <Badge color="warning">{failed} Failing</Badge>;
    return <Badge color="danger">{failed} Failing</Badge>;
  };

  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <Heading level={2} size="sm">{t('monitoring.text.testResults')}</Heading>
        {getStatusBadge(summary.failed)}
      </div>
      
      {/* Summary Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ textAlign: 'center' }}>
          <Paragraph size="lg" style={{ fontWeight: 'bold', color: 'var(--ds-color-success-base)' }}>
            {summary.passed}
          </Paragraph>
          <Paragraph size="sm">{t('monitoring.text.passed')}</Paragraph>
        </div>
        <div style={{ textAlign: 'center' }}>
          <Paragraph size="lg" style={{ fontWeight: 'bold', color: 'var(--ds-color-danger-base)' }}>
            {summary.failed}
          </Paragraph>
          <Paragraph size="sm">{t('monitoring.text.failed')}</Paragraph>
        </div>
        <div style={{ textAlign: 'center' }}>
          <Paragraph size="lg" style={{ fontWeight: 'bold', color: 'var(--ds-color-neutral-text-subtle)' }}>
            {summary.skipped}
          </Paragraph>
          <Paragraph size="sm">{t('monitoring.text.skipped')}</Paragraph>
        </div>
        <div style={{ textAlign: 'center' }}>
          <Paragraph size="lg" style={{ fontWeight: 'bold' }}>
            {summary.passRate.toFixed(1)}%
          </Paragraph>
          <Paragraph size="sm">{t('monitoring.text.passRate')}</Paragraph>
        </div>
      </div>

      {/* Category Breakdown */}
      <Table>
        <Table.Head>
          <Table.Row>
            <Table.HeaderCell>{t('monitoring.text.category')}</Table.HeaderCell>
            <Table.HeaderCell>{t('monitoring.text.passed')}</Table.HeaderCell>
            <Table.HeaderCell>{t('monitoring.text.failed')}</Table.HeaderCell>
            <Table.HeaderCell>{t('monitoring.text.skipped')}</Table.HeaderCell>
            <Table.HeaderCell>{t('monitoring.text.status')}</Table.HeaderCell>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          {categories.map((cat) => (
            <Table.Row key={cat.name}>
              <Table.Cell>{cat.name}</Table.Cell>
              <Table.Cell style={{ color: 'var(--ds-color-success-base)' }}>{cat.passed}</Table.Cell>
              <Table.Cell style={{ color: cat.failed > 0 ? 'var(--ds-color-danger-base)' : undefined }}>{cat.failed}</Table.Cell>
              <Table.Cell style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>{cat.skipped}</Table.Cell>
              <Table.Cell>
                {cat.failed === 0 ? (
                  <Badge color="success" size="sm">✓</Badge>
                ) : (
                  <Badge color="danger" size="sm">!</Badge>
                )}
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>

      <Paragraph size="xs" style={{ marginTop: '1rem', color: 'var(--ds-color-neutral-text-subtle)' }}>
        Last run: {new Date(summary.lastRun).toLocaleString('nb-NO')}
      </Paragraph>
    </Card>
  );
}

export default TestResultsWidget;
