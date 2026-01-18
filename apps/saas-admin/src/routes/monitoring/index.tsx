/**
 * Monitoring Dashboard Page
 * Platform health metrics, usage statistics, and system status
 */

import { useState } from 'react';
import {
  Card,
  Heading,
  Paragraph,
  Badge,
  Spinner,
  Table,
  StatCard,
  SparklesIcon,
  UsersIcon,
  DatabaseIcon,
  BuildingIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
} from '@xala/ds';
import { useSaasTenants, useSaasBillingOverview } from '@digilist/client-sdk/hooks';
import { useT } from '@xala/i18n';

// Mock metrics data - will be replaced with real API
const MOCK_SYSTEM_STATUS = {
  api: { status: 'healthy', latency: 45, uptime: 99.9 },
  database: { status: 'healthy', connections: 23, maxConnections: 100 },
  storage: { status: 'healthy', usedGb: 45.2, totalGb: 100 },
  redis: { status: 'healthy', memoryMb: 156, maxMemoryMb: 512 },
};

const MOCK_ACTIVITY_LOG = [
  { id: '1', action: 'Tenant opprettet', actor: 'admin@example.com', timestamp: '2026-01-17T19:45:00Z' },
  { id: '2', action: 'Plan endret', actor: 'admin@example.com', timestamp: '2026-01-17T19:30:00Z' },
  { id: '3', action: 'Feature flag toggled', actor: 'operator@example.com', timestamp: '2026-01-17T19:15:00Z' },
  { id: '4', action: 'Bruker invitert', actor: 'admin@example.com', timestamp: '2026-01-17T19:00:00Z' },
  { id: '5', action: 'Seed data importert', actor: 'operator@example.com', timestamp: '2026-01-17T18:45:00Z' },
];

// Scanner results - will be fetched from API
const MOCK_SCANNER_RESULTS = {
  i18n: {
    lastRun: '2026-01-18T13:30:00Z',
    totalKeys: 9312,
    missingKeys: 0,
    hardcodedStrings: 127,
    status: 'warning' as const,
  },
  designSystem: {
    lastRun: '2026-01-18T12:00:00Z',
    totalComponents: 156,
    violations: 3,
    tokenCompliance: 98.1,
    status: 'success' as const,
  },
  compliance: {
    lastRun: '2026-01-18T11:00:00Z',
    wcagErrors: 0,
    wcagWarnings: 12,
    gdprCompliance: 100,
    status: 'success' as const,
  },
};


export function MonitoringPage() {
  const t = useT();
  const [refreshing, setRefreshing] = useState(false);

  // Queries
  const { data: tenantsData, isLoading: loadingTenants } = useSaasTenants({ limit: 1000 });
  const { data: billingData, isLoading: loadingBilling } = useSaasBillingOverview();
  
  const tenants = tenantsData?.data ?? [];
  const billing = billingData?.data;

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRefreshing(false);
  };
  // Note: handleRefresh available for future refresh button

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('nb-NO', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string): 'success' | 'warning' | 'danger' => {
    if (status === 'healthy') return 'success';
    if (status === 'degraded') return 'warning';
    return 'danger';
  };

  const isLoading = loadingTenants || loadingBilling;

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--ds-spacing-8)' }}>
        <Spinner data-size="lg" aria-label={t('common.loading')} />
      </div>
    );
  }

  // Calculate stats
  const activeTenants = tenants.filter((t) => t.status === 'active').length;
  const totalUsers = tenants.reduce((sum, t) => sum + (t.usage?.usersCount ?? 0), 0);
  const totalStorage = tenants.reduce((sum, t) => sum + (t.usage?.storageMb ?? 0), 0);

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: 'var(--ds-spacing-8)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--ds-spacing-6)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)', marginBottom: 'var(--ds-spacing-2)' }}>
            <SparklesIcon style={{ color: 'var(--ds-color-accent-text-default)', width: 32, height: 32 }} />
            <Heading level={1} data-size="lg">
              {t('saasAdmin.monitoring.title', { defaultValue: 'Plattformovervåking' })}
            </Heading>
          </div>
          <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
            {t('saasAdmin.monitoring.description', { defaultValue: 'Sanntids helse- og bruksmetrikker for plattformen' })}
          </Paragraph>
        </div>
        <Badge color={refreshing ? 'warning' : 'success'}>
          {refreshing ? t('common.oppdaterer') : 'Live'}
        </Badge>
      </div>

      {/* Platform Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--ds-spacing-4)', marginBottom: 'var(--ds-spacing-6)' }}>
        <StatCard
          title={t('common.aktive_tenanter')}
          value={activeTenants.toString()}
          description={`${tenants.length} totalt`}
          color="var(--ds-color-success-text-default)"
          icon={<BuildingIcon />}
        />
        <StatCard
          title={t('common.totale_brukere')}
          value={totalUsers.toLocaleString('nb-NO')}
          description={t('common.paa_tvers_av_alle')}
          color="var(--ds-color-info-text-default)"
          icon={<UsersIcon />}
        />
        <StatCard
          title={t('common.lagring_brukt')}
          value={`${(totalStorage / 1024).toFixed(1)} GB`}
          description={`Av ${MOCK_SYSTEM_STATUS.storage.totalGb} GB`}
          color="var(--ds-color-warning-text-default)"
          icon={<DatabaseIcon />}
        />
        <StatCard
          title="MRR"
          value={billing?.monthlyRecurring ? `${billing.monthlyRecurring.toLocaleString('nb-NO')} NOK` : '—'}
          description={t('common.maanedlig_inntekt')}
          color="var(--ds-color-accent-text-default)"
          icon={<SparklesIcon />}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 'var(--ds-spacing-6)' }}>
        {/* System Status */}
        <Card style={{ padding: 'var(--ds-spacing-6)' }}>
          <Heading level={2} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-4)' }}>
            Systemstatus
          </Heading>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--ds-spacing-4)' }}>
            {/* API Status */}
            <div style={{ padding: 'var(--ds-spacing-4)', border: '1px solid var(--ds-color-neutral-border-subtle)', borderRadius: 'var(--ds-border-radius-md)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--ds-spacing-2)' }}>
                <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>API</Paragraph>
                <Badge color={getStatusColor(MOCK_SYSTEM_STATUS.api.status)}>
                  {MOCK_SYSTEM_STATUS.api.status === 'healthy' ? <CheckCircleIcon /> : <AlertTriangleIcon />}
                  {MOCK_SYSTEM_STATUS.api.status}
                </Badge>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--ds-color-neutral-text-subtle)', fontSize: 'var(--ds-font-size-xs)' }}>Latency</span>
                <span style={{ fontSize: 'var(--ds-font-size-xs)' }}>{MOCK_SYSTEM_STATUS.api.latency}ms</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--ds-color-neutral-text-subtle)', fontSize: 'var(--ds-font-size-xs)' }}>Uptime</span>
                <span style={{ fontSize: 'var(--ds-font-size-xs)' }}>{MOCK_SYSTEM_STATUS.api.uptime}%</span>
              </div>
            </div>

            {/* Database Status */}
            <div style={{ padding: 'var(--ds-spacing-4)', border: '1px solid var(--ds-color-neutral-border-subtle)', borderRadius: 'var(--ds-border-radius-md)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--ds-spacing-2)' }}>
                <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>Database</Paragraph>
                <Badge color={getStatusColor(MOCK_SYSTEM_STATUS.database.status)}>
                  {MOCK_SYSTEM_STATUS.database.status === 'healthy' ? <CheckCircleIcon /> : <AlertTriangleIcon />}
                  {MOCK_SYSTEM_STATUS.database.status}
                </Badge>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--ds-color-neutral-text-subtle)', fontSize: 'var(--ds-font-size-xs)' }}>Connections</span>
                <span style={{ fontSize: 'var(--ds-font-size-xs)' }}>{MOCK_SYSTEM_STATUS.database.connections}/{MOCK_SYSTEM_STATUS.database.maxConnections}</span>
              </div>
            </div>

            {/* Storage Status */}
            <div style={{ padding: 'var(--ds-spacing-4)', border: '1px solid var(--ds-color-neutral-border-subtle)', borderRadius: 'var(--ds-border-radius-md)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--ds-spacing-2)' }}>
                <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>Storage</Paragraph>
                <Badge color={getStatusColor(MOCK_SYSTEM_STATUS.storage.status)}>
                  {MOCK_SYSTEM_STATUS.storage.status === 'healthy' ? <CheckCircleIcon /> : <AlertTriangleIcon />}
                  {MOCK_SYSTEM_STATUS.storage.status}
                </Badge>
              </div>
              <div style={{ marginTop: 'var(--ds-spacing-2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--ds-spacing-1)' }}>
                  <span style={{ color: 'var(--ds-color-neutral-text-subtle)', fontSize: 'var(--ds-font-size-xs)' }}>Used</span>
                  <span style={{ fontSize: 'var(--ds-font-size-xs)' }}>{MOCK_SYSTEM_STATUS.storage.usedGb} / {MOCK_SYSTEM_STATUS.storage.totalGb} GB</span>
                </div>
                <div style={{ height: 8, backgroundColor: 'var(--ds-color-neutral-surface-subtle)', borderRadius: 4 }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${(MOCK_SYSTEM_STATUS.storage.usedGb / MOCK_SYSTEM_STATUS.storage.totalGb) * 100}%`,
                      backgroundColor: 'var(--ds-color-success-base-default)',
                      borderRadius: 4,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Redis Status */}
            <div style={{ padding: 'var(--ds-spacing-4)', border: '1px solid var(--ds-color-neutral-border-subtle)', borderRadius: 'var(--ds-border-radius-md)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--ds-spacing-2)' }}>
                <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>Redis</Paragraph>
                <Badge color={getStatusColor(MOCK_SYSTEM_STATUS.redis.status)}>
                  {MOCK_SYSTEM_STATUS.redis.status === 'healthy' ? <CheckCircleIcon /> : <AlertTriangleIcon />}
                  {MOCK_SYSTEM_STATUS.redis.status}
                </Badge>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--ds-color-neutral-text-subtle)', fontSize: 'var(--ds-font-size-xs)' }}>Memory</span>
                <span style={{ fontSize: 'var(--ds-font-size-xs)' }}>{MOCK_SYSTEM_STATUS.redis.memoryMb} / {MOCK_SYSTEM_STATUS.redis.maxMemoryMb} MB</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Recent Activity */}
        <Card style={{ padding: 'var(--ds-spacing-6)' }}>
          <Heading level={2} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-4)' }}>
            Nylig aktivitet
          </Heading>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-3)' }}>
            {MOCK_ACTIVITY_LOG.map((activity) => (
              <div
                key={activity.id}
                style={{
                  padding: 'var(--ds-spacing-3)',
                  backgroundColor: 'var(--ds-color-neutral-surface-subtle)',
                  borderRadius: 'var(--ds-border-radius-md)',
                }}
              >
                <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
                  {activity.action}
                </Paragraph>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--ds-spacing-1)' }}>
                  <span style={{ fontSize: 'var(--ds-font-size-xs)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                    {activity.actor}
                  </span>
                  <span style={{ fontSize: 'var(--ds-font-size-xs)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                    {formatDate(activity.timestamp)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Compliance Scanners */}
      <Card style={{ marginTop: 'var(--ds-spacing-6)', padding: 'var(--ds-spacing-6)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--ds-spacing-4)' }}>
          <Heading level={2} data-size="sm">
            {t('saasAdmin.monitoring.scanners.title', { defaultValue: 'Kodekvalitet og samsvar' })}
          </Heading>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--ds-spacing-4)' }}>
          {/* i18n Scanner */}
          <div style={{ padding: 'var(--ds-spacing-4)', border: '1px solid var(--ds-color-neutral-border-subtle)', borderRadius: 'var(--ds-border-radius-md)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--ds-spacing-3)' }}>
              <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>i18n Scanner</Paragraph>
              <Badge color={MOCK_SCANNER_RESULTS.i18n.status === 'success' ? 'success' : 'warning'}>
                {MOCK_SCANNER_RESULTS.i18n.status === 'success' ? <CheckCircleIcon /> : <AlertTriangleIcon />}
                {MOCK_SCANNER_RESULTS.i18n.status}
              </Badge>
            </div>
            <div style={{ fontSize: 'var(--ds-font-size-xs)', color: 'var(--ds-color-neutral-text-subtle)', marginBottom: 'var(--ds-spacing-3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--ds-spacing-1)' }}>
                <span>Total keys</span>
                <span style={{ color: 'var(--ds-color-neutral-text-default)' }}>{MOCK_SCANNER_RESULTS.i18n.totalKeys.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--ds-spacing-1)' }}>
                <span>Missing keys</span>
                <span style={{ color: 'var(--ds-color-success-text-default)' }}>{MOCK_SCANNER_RESULTS.i18n.missingKeys}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Hardcoded strings</span>
                <span style={{ color: 'var(--ds-color-warning-text-default)' }}>{MOCK_SCANNER_RESULTS.i18n.hardcodedStrings}</span>
              </div>
            </div>
            <button
              style={{
                width: '100%',
                padding: 'var(--ds-spacing-2)',
                backgroundColor: 'var(--ds-color-accent-base-default)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--ds-border-radius-md)',
                cursor: 'pointer',
                fontSize: 'var(--ds-font-size-sm)',
              }}
              onClick={() => alert('Running i18n scanner...')}
            >
              {t('saasAdmin.monitoring.scanners.runScan', { defaultValue: 'Kjør skanning' })}
            </button>
          </div>

          {/* Design System Scanner */}
          <div style={{ padding: 'var(--ds-spacing-4)', border: '1px solid var(--ds-color-neutral-border-subtle)', borderRadius: 'var(--ds-border-radius-md)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--ds-spacing-3)' }}>
              <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>Design System</Paragraph>
              <Badge color={MOCK_SCANNER_RESULTS.designSystem.status === 'success' ? 'success' : 'warning'}>
                {MOCK_SCANNER_RESULTS.designSystem.status === 'success' ? <CheckCircleIcon /> : <AlertTriangleIcon />}
                {MOCK_SCANNER_RESULTS.designSystem.status}
              </Badge>
            </div>
            <div style={{ fontSize: 'var(--ds-font-size-xs)', color: 'var(--ds-color-neutral-text-subtle)', marginBottom: 'var(--ds-spacing-3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--ds-spacing-1)' }}>
                <span>Components</span>
                <span style={{ color: 'var(--ds-color-neutral-text-default)' }}>{MOCK_SCANNER_RESULTS.designSystem.totalComponents}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--ds-spacing-1)' }}>
                <span>Violations</span>
                <span style={{ color: MOCK_SCANNER_RESULTS.designSystem.violations > 0 ? 'var(--ds-color-danger-text-default)' : 'var(--ds-color-success-text-default)' }}>{MOCK_SCANNER_RESULTS.designSystem.violations}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Token compliance</span>
                <span style={{ color: 'var(--ds-color-success-text-default)' }}>{MOCK_SCANNER_RESULTS.designSystem.tokenCompliance}%</span>
              </div>
            </div>
            <button
              style={{
                width: '100%',
                padding: 'var(--ds-spacing-2)',
                backgroundColor: 'var(--ds-color-accent-base-default)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--ds-border-radius-md)',
                cursor: 'pointer',
                fontSize: 'var(--ds-font-size-sm)',
              }}
              onClick={() => alert('Running Design System scanner...')}
            >
              {t('saasAdmin.monitoring.scanners.runScan', { defaultValue: 'Kjør skanning' })}
            </button>
          </div>

          {/* Compliance Scanner */}
          <div style={{ padding: 'var(--ds-spacing-4)', border: '1px solid var(--ds-color-neutral-border-subtle)', borderRadius: 'var(--ds-border-radius-md)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--ds-spacing-3)' }}>
              <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>WCAG / Compliance</Paragraph>
              <Badge color={MOCK_SCANNER_RESULTS.compliance.status === 'success' ? 'success' : 'warning'}>
                {MOCK_SCANNER_RESULTS.compliance.status === 'success' ? <CheckCircleIcon /> : <AlertTriangleIcon />}
                {MOCK_SCANNER_RESULTS.compliance.status}
              </Badge>
            </div>
            <div style={{ fontSize: 'var(--ds-font-size-xs)', color: 'var(--ds-color-neutral-text-subtle)', marginBottom: 'var(--ds-spacing-3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--ds-spacing-1)' }}>
                <span>WCAG Errors</span>
                <span style={{ color: MOCK_SCANNER_RESULTS.compliance.wcagErrors > 0 ? 'var(--ds-color-danger-text-default)' : 'var(--ds-color-success-text-default)' }}>{MOCK_SCANNER_RESULTS.compliance.wcagErrors}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--ds-spacing-1)' }}>
                <span>WCAG Warnings</span>
                <span style={{ color: 'var(--ds-color-warning-text-default)' }}>{MOCK_SCANNER_RESULTS.compliance.wcagWarnings}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>GDPR Compliance</span>
                <span style={{ color: 'var(--ds-color-success-text-default)' }}>{MOCK_SCANNER_RESULTS.compliance.gdprCompliance}%</span>
              </div>
            </div>
            <button
              style={{
                width: '100%',
                padding: 'var(--ds-spacing-2)',
                backgroundColor: 'var(--ds-color-accent-base-default)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--ds-border-radius-md)',
                cursor: 'pointer',
                fontSize: 'var(--ds-font-size-sm)',
              }}
              onClick={() => alert('Running Compliance scanner...')}
            >
              {t('saasAdmin.monitoring.scanners.runScan', { defaultValue: 'Kjør skanning' })}
            </button>
          </div>
        </div>
      </Card>

      {/* Tenants by Usage */}
      <Card style={{ marginTop: 'var(--ds-spacing-6)', padding: 'var(--ds-spacing-6)' }}>
        <Heading level={2} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-4)' }}>
          Tenanter etter bruk
        </Heading>

        <Table>
          <Table.Head>
            <Table.Row>
              <Table.HeaderCell>Tenant</Table.HeaderCell>
              <Table.HeaderCell>Status</Table.HeaderCell>
              <Table.HeaderCell>Brukere</Table.HeaderCell>
              <Table.HeaderCell>Organisasjoner</Table.HeaderCell>
              <Table.HeaderCell>Leieobjekter</Table.HeaderCell>
              <Table.HeaderCell>{t('common.lagring_mb')}</Table.HeaderCell>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {tenants.slice(0, 10).map((tenant) => (
              <Table.Row key={tenant.id}>
                <Table.Cell>
                  <strong>{tenant.name}</strong>
                </Table.Cell>
                <Table.Cell>
                  <Badge color={tenant.status === 'active' ? 'success' : 'warning'}>
                    {tenant.status}
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  {tenant.usage?.usersCount ?? 0} / {tenant.seatLimits?.maxUsers ?? '-'}
                </Table.Cell>
                <Table.Cell>
                  {tenant.usage?.organizationsCount ?? 0} / {tenant.seatLimits?.maxOrganizations ?? '-'}
                </Table.Cell>
                <Table.Cell>
                  {tenant.usage?.listingsCount ?? 0} / {tenant.seatLimits?.maxListings ?? '-'}
                </Table.Cell>
                <Table.Cell>
                  {tenant.usage?.storageMb ?? 0}
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </Card>
    </div>
  );
}

export default MonitoringPage;
