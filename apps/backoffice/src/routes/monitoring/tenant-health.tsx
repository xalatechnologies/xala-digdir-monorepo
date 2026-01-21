/**
 * Tenant Health Page
 * Displays tenant-specific health status, service status, and performance metrics.
 */
import { useState } from 'react';
import { useT } from '@xala/i18n';
import {
  Box,
  Heading,
  Paragraph,
  Card,
  Spinner,
  Alert,
  Button,
  Tag,
  Table,
  Tabs,
} from '@xalatechnologies/platform/ui';
import { Link } from 'react-router-dom';
import { useSession } from '@digilist/client-sdk/hooks';
import {
  useDashboardKPIs,
  useTenantSettings,
} from '@digilist/client-sdk/hooks';

// Types for health monitoring
interface ServiceStatus {
  name: string;
  status: 'operational' | 'degraded' | 'outage';
  responseTime?: number;
  lastCheck: string;
  message?: string;
}

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  threshold: number;
  status: 'good' | 'warning' | 'critical';
}

/**
 * Service status indicator
 */
function ServiceStatusBadge({ status }: { status: ServiceStatus['status'] }) {
  const t = useT();

  const config = {
    operational: {
      color: 'success' as const,
      label: t('monitoring.health.status.operational'),
    },
    degraded: {
      color: 'warning' as const,
      label: t('monitoring.health.status.degraded'),
    },
    outage: {
      color: 'danger' as const,
      label: t('monitoring.health.status.outage'),
    },
  };

  return (
    <Tag color={config[status].color} size="sm">
      {config[status].label}
    </Tag>
  );
}

/**
 * Performance metric bar component
 */
function PerformanceBar({ metric }: { metric: PerformanceMetric }) {
  const percentage = Math.min((metric.value / metric.threshold) * 100, 100);
  const colors = {
    good: 'var(--ds-color-success-base-default)',
    warning: 'var(--ds-color-warning-base-default)',
    critical: 'var(--ds-color-danger-base-default)',
  };

  return (
    <Box style={{ marginBottom: 'var(--ds-spacing-3)' }}>
      <Box
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: 'var(--ds-spacing-1)',
        }}
      >
        <Paragraph size="sm">{metric.name}</Paragraph>
        <Paragraph size="sm" style={{ fontWeight: 500 }}>
          {metric.value} {metric.unit}
        </Paragraph>
      </Box>
      <Box
        style={{
          height: '8px',
          backgroundColor: 'var(--ds-color-neutral-surface-default)',
          borderRadius: '4px',
          overflow: 'hidden',
        }}
      >
        <Box
          style={{
            height: '100%',
            width: `${percentage}%`,
            backgroundColor: colors[metric.status],
            transition: 'width 0.3s ease',
          }}
        />
      </Box>
    </Box>
  );
}

/**
 * Services status table
 */
function ServicesTable({ services }: { services: ServiceStatus[] }) {
  const t = useT();

  return (
    <Table>
      <Table.Head>
        <Table.Row>
          <Table.HeaderCell>{t('monitoring.health.table.service')}</Table.HeaderCell>
          <Table.HeaderCell>{t('monitoring.health.table.status')}</Table.HeaderCell>
          <Table.HeaderCell>{t('monitoring.health.table.responseTime')}</Table.HeaderCell>
          <Table.HeaderCell>{t('monitoring.health.table.lastCheck')}</Table.HeaderCell>
        </Table.Row>
      </Table.Head>
      <Table.Body>
        {services.map((service, index) => (
          <Table.Row key={index}>
            <Table.Cell>
              <Paragraph size="sm" style={{ fontWeight: 500 }}>
                {service.name}
              </Paragraph>
              {service.message && (
                <Paragraph size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                  {service.message}
                </Paragraph>
              )}
            </Table.Cell>
            <Table.Cell>
              <ServiceStatusBadge status={service.status} />
            </Table.Cell>
            <Table.Cell>
              {service.responseTime ? `${service.responseTime}ms` : '-'}
            </Table.Cell>
            <Table.Cell>
              <Paragraph size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                {new Date(service.lastCheck).toLocaleTimeString()}
              </Paragraph>
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
}

/**
 * Tenant Health Page Component
 */
export default function TenantHealthPage() {
  const t = useT();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { data: session, isLoading: sessionLoading } = useSession();
  const { data: kpis, isLoading: kpisLoading, error: kpisError, refetch } = useDashboardKPIs();
  const { data: tenantSettings, isLoading: settingsLoading } = useTenantSettings();

  const isLoading = sessionLoading || kpisLoading || settingsLoading;

  // Mock service data - in production this would come from a health check endpoint
  const services: ServiceStatus[] = [
    {
      name: t('monitoring.health.services.api'),
      status: 'operational',
      responseTime: 45,
      lastCheck: new Date().toISOString(),
    },
    {
      name: t('monitoring.health.services.database'),
      status: 'operational',
      responseTime: 12,
      lastCheck: new Date().toISOString(),
    },
    {
      name: t('monitoring.health.services.cache'),
      status: 'operational',
      responseTime: 3,
      lastCheck: new Date().toISOString(),
    },
    {
      name: t('monitoring.health.services.storage'),
      status: 'operational',
      responseTime: 89,
      lastCheck: new Date().toISOString(),
    },
    {
      name: t('monitoring.health.services.email'),
      status: 'operational',
      responseTime: 234,
      lastCheck: new Date().toISOString(),
    },
    {
      name: t('monitoring.health.services.websocket'),
      status: 'operational',
      responseTime: 8,
      lastCheck: new Date().toISOString(),
    },
  ];

  // Mock performance metrics - in production this would come from monitoring hook
  const performanceMetrics: PerformanceMetric[] = [
    {
      name: t('monitoring.health.performance.cpuUsage'),
      value: 32,
      unit: '%',
      threshold: 100,
      status: 'good',
    },
    {
      name: t('monitoring.health.performance.memoryUsage'),
      value: 58,
      unit: '%',
      threshold: 100,
      status: 'good',
    },
    {
      name: t('monitoring.health.performance.diskUsage'),
      value: 45,
      unit: '%',
      threshold: 100,
      status: 'good',
    },
    {
      name: t('monitoring.health.performance.avgResponseTime'),
      value: 125,
      unit: 'ms',
      threshold: 500,
      status: 'good',
    },
  ];

  // Calculate overall health status
  const overallStatus = services.some((s) => s.status === 'outage')
    ? 'critical'
    : services.some((s) => s.status === 'degraded')
      ? 'degraded'
      : 'healthy';

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  if (isLoading) {
    return (
      <Box
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
        }}
      >
        <Spinner size="lg" aria-label={t('common.loading')} />
      </Box>
    );
  }

  if (kpisError) {
    return (
      <Box style={{ padding: 'var(--ds-spacing-6)' }}>
        <Alert severity="danger">
          {t('monitoring.error.loadFailed')}
        </Alert>
      </Box>
    );
  }

  return (
    <Box style={{ padding: 'var(--ds-spacing-6)' }}>
      {/* Breadcrumb */}
      <Box style={{ marginBottom: 'var(--ds-spacing-4)' }}>
        <Link
          to="/monitoring"
          style={{
            color: 'var(--ds-color-accent-text-default)',
            textDecoration: 'none',
          }}
        >
          {t('monitoring.nav.backToDashboard')}
        </Link>
      </Box>

      {/* Header */}
      <Box
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 'var(--ds-spacing-6)',
        }}
      >
        <Box>
          <Heading level={1} size="xl">
            {t('monitoring.health.title')}
          </Heading>
          <Paragraph style={{ marginTop: 'var(--ds-spacing-2)' }}>
            {t('monitoring.health.description', {
              tenant: session?.user?.tenantName ?? t('common.unknown'),
            })}
          </Paragraph>
        </Box>
        <Box style={{ display: 'flex', gap: 'var(--ds-spacing-2)', alignItems: 'center' }}>
          <Tag
            color={
              overallStatus === 'healthy'
                ? 'success'
                : overallStatus === 'degraded'
                  ? 'warning'
                  : 'danger'
            }
            size="md"
          >
            {t(`monitoring.status.${overallStatus}`)}
          </Tag>
          <Button
            variant="secondary"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            {isRefreshing ? t('common.loading') : t('core.action.refresh')}
          </Button>
        </Box>
      </Box>

      {/* Main Content Tabs */}
      <Tabs defaultValue="services">
        <Tabs.List>
          <Tabs.Tab value="services">{t('monitoring.health.tabs.services')}</Tabs.Tab>
          <Tabs.Tab value="performance">{t('monitoring.health.tabs.performance')}</Tabs.Tab>
          <Tabs.Tab value="configuration">{t('monitoring.health.tabs.configuration')}</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="services">
          <Box style={{ marginTop: 'var(--ds-spacing-4)' }}>
            <Card style={{ padding: 'var(--ds-spacing-4)' }}>
              <Heading level={3} size="sm" style={{ marginBottom: 'var(--ds-spacing-4)' }}>
                {t('monitoring.health.services.title')}
              </Heading>
              <ServicesTable services={services} />
            </Card>
          </Box>
        </Tabs.Panel>

        <Tabs.Panel value="performance">
          <Box style={{ marginTop: 'var(--ds-spacing-4)' }}>
            <Card style={{ padding: 'var(--ds-spacing-4)' }}>
              <Heading level={3} size="sm" style={{ marginBottom: 'var(--ds-spacing-4)' }}>
                {t('monitoring.health.performance.title')}
              </Heading>
              {performanceMetrics.map((metric, index) => (
                <PerformanceBar key={index} metric={metric} />
              ))}
            </Card>

            {/* Request Statistics */}
            <Card style={{ padding: 'var(--ds-spacing-4)', marginTop: 'var(--ds-spacing-4)' }}>
              <Heading level={3} size="sm" style={{ marginBottom: 'var(--ds-spacing-4)' }}>
                {t('monitoring.health.requestStats.title')}
              </Heading>
              <Box
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                  gap: 'var(--ds-spacing-4)',
                }}
              >
                <Box>
                  <Paragraph size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                    {t('monitoring.health.requestStats.totalRequests')}
                  </Paragraph>
                  <Heading level={4} size="md">
                    {kpis?.data?.totalRequests ?? '12,456'}
                  </Heading>
                </Box>
                <Box>
                  <Paragraph size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                    {t('monitoring.health.requestStats.successRate')}
                  </Paragraph>
                  <Heading level={4} size="md">
                    99.8%
                  </Heading>
                </Box>
                <Box>
                  <Paragraph size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                    {t('monitoring.health.requestStats.avgLatency')}
                  </Paragraph>
                  <Heading level={4} size="md">
                    125ms
                  </Heading>
                </Box>
                <Box>
                  <Paragraph size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                    {t('monitoring.health.requestStats.errorRate')}
                  </Paragraph>
                  <Heading level={4} size="md">
                    0.2%
                  </Heading>
                </Box>
              </Box>
            </Card>
          </Box>
        </Tabs.Panel>

        <Tabs.Panel value="configuration">
          <Box style={{ marginTop: 'var(--ds-spacing-4)' }}>
            <Card style={{ padding: 'var(--ds-spacing-4)' }}>
              <Heading level={3} size="sm" style={{ marginBottom: 'var(--ds-spacing-4)' }}>
                {t('monitoring.health.configuration.title')}
              </Heading>
              <Table>
                <Table.Head>
                  <Table.Row>
                    <Table.HeaderCell>{t('monitoring.health.configuration.setting')}</Table.HeaderCell>
                    <Table.HeaderCell>{t('monitoring.health.configuration.value')}</Table.HeaderCell>
                  </Table.Row>
                </Table.Head>
                <Table.Body>
                  <Table.Row>
                    <Table.Cell>{t('monitoring.health.configuration.tenantId')}</Table.Cell>
                    <Table.Cell>
                      <code>{session?.user?.tenantId ?? '-'}</code>
                    </Table.Cell>
                  </Table.Row>
                  <Table.Row>
                    <Table.Cell>{t('monitoring.health.configuration.tenantName')}</Table.Cell>
                    <Table.Cell>{session?.user?.tenantName ?? '-'}</Table.Cell>
                  </Table.Row>
                  <Table.Row>
                    <Table.Cell>{t('monitoring.health.configuration.plan')}</Table.Cell>
                    <Table.Cell>
                      <Tag color="info" size="sm">
                        {tenantSettings?.data?.plan ?? 'standard'}
                      </Tag>
                    </Table.Cell>
                  </Table.Row>
                  <Table.Row>
                    <Table.Cell>{t('monitoring.health.configuration.apiVersion')}</Table.Cell>
                    <Table.Cell>v2.1.0</Table.Cell>
                  </Table.Row>
                  <Table.Row>
                    <Table.Cell>{t('monitoring.health.configuration.region')}</Table.Cell>
                    <Table.Cell>eu-north-1</Table.Cell>
                  </Table.Row>
                </Table.Body>
              </Table>
            </Card>
          </Box>
        </Tabs.Panel>
      </Tabs>

      {/* Last Updated */}
      <Box style={{ marginTop: 'var(--ds-spacing-6)' }}>
        <Paragraph size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
          {t('monitoring.lastUpdated', {
            time: new Date().toLocaleString(),
          })}
        </Paragraph>
      </Box>
    </Box>
  );
}
