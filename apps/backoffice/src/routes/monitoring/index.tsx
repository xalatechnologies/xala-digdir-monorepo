/**
 * Tenant Monitoring Dashboard
 * Provides tenant-scoped monitoring overview for backoffice admins.
 * Shows health status, key metrics, and recent alerts.
 */
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
} from '@xalatechnologies/platform/ui';
import { Link } from 'react-router-dom';
import { useSession } from '@digilist/client-sdk/hooks';
import {
  useDashboardKPIs,
  useBookingStats,
} from '@digilist/client-sdk/hooks';

// Types for monitoring data
interface TenantHealthSummary {
  status: 'healthy' | 'degraded' | 'critical';
  uptime: number;
  lastChecked: string;
  activeAlerts: number;
}

interface MetricCard {
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
}

/**
 * Status indicator component for health display
 */
function StatusBadge({ status }: { status: TenantHealthSummary['status'] }) {
  const t = useT();

  const statusConfig = {
    healthy: {
      color: 'success' as const,
      label: t('monitoring.status.healthy'),
    },
    degraded: {
      color: 'warning' as const,
      label: t('monitoring.status.degraded'),
    },
    critical: {
      color: 'danger' as const,
      label: t('monitoring.status.critical'),
    },
  };

  const config = statusConfig[status];

  return (
    <Tag color={config.color} size="md">
      {config.label}
    </Tag>
  );
}

/**
 * Metric card component for displaying KPIs
 */
function MetricCardDisplay({ metric }: { metric: MetricCard }) {
  return (
    <Card style={{ padding: 'var(--ds-spacing-4)' }}>
      <Box>
        <Paragraph size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
          {metric.label}
        </Paragraph>
        <Heading level={3} size="lg" style={{ marginTop: 'var(--ds-spacing-1)' }}>
          {metric.value}
        </Heading>
        {metric.trend && metric.trendValue && (
          <Paragraph
            size="sm"
            style={{
              marginTop: 'var(--ds-spacing-1)',
              color:
                metric.trend === 'up'
                  ? 'var(--ds-color-success-text-default)'
                  : metric.trend === 'down'
                    ? 'var(--ds-color-danger-text-default)'
                    : 'var(--ds-color-neutral-text-subtle)',
            }}
          >
            {metric.trend === 'up' ? '+' : metric.trend === 'down' ? '-' : ''}
            {metric.trendValue}
          </Paragraph>
        )}
      </Box>
    </Card>
  );
}

/**
 * Quick links section for navigation to sub-pages
 */
function QuickLinks() {
  const t = useT();

  const links = [
    {
      to: '/monitoring/tenant-health',
      label: t('monitoring.nav.tenantHealth'),
      description: t('monitoring.nav.tenantHealthDesc'),
    },
    {
      to: '/monitoring/booking-metrics',
      label: t('monitoring.nav.bookingMetrics'),
      description: t('monitoring.nav.bookingMetricsDesc'),
    },
    {
      to: '/monitoring/alerts',
      label: t('monitoring.nav.alerts'),
      description: t('monitoring.nav.alertsDesc'),
    },
  ];

  return (
    <Box
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 'var(--ds-spacing-4)',
      }}
    >
      {links.map((link) => (
        <Link key={link.to} to={link.to} style={{ textDecoration: 'none' }}>
          <Card
            style={{
              padding: 'var(--ds-spacing-4)',
              height: '100%',
              cursor: 'pointer',
              transition: 'box-shadow 0.2s ease',
            }}
          >
            <Heading level={4} size="sm">
              {link.label}
            </Heading>
            <Paragraph
              size="sm"
              style={{
                marginTop: 'var(--ds-spacing-2)',
                color: 'var(--ds-color-neutral-text-subtle)',
              }}
            >
              {link.description}
            </Paragraph>
          </Card>
        </Link>
      ))}
    </Box>
  );
}

/**
 * Main Tenant Monitoring Dashboard
 */
export default function TenantMonitoringDashboard() {
  const t = useT();
  const { data: session, isLoading: sessionLoading } = useSession();
  const { data: kpis, isLoading: kpisLoading, error: kpisError } = useDashboardKPIs();
  const { data: bookingStats, isLoading: statsLoading } = useBookingStats();

  const isLoading = sessionLoading || kpisLoading || statsLoading;

  // Mock health data - in production this would come from a monitoring hook
  const healthSummary: TenantHealthSummary = {
    status: 'healthy',
    uptime: 99.9,
    lastChecked: new Date().toISOString(),
    activeAlerts: 0,
  };

  // Build metrics from available data
  const metrics: MetricCard[] = [
    {
      label: t('monitoring.metrics.totalBookings'),
      value: bookingStats?.data?.total ?? '-',
      trend: 'up',
      trendValue: '12%',
    },
    {
      label: t('monitoring.metrics.activeUsers'),
      value: kpis?.data?.activeUsers ?? '-',
      trend: 'stable',
      trendValue: '0%',
    },
    {
      label: t('monitoring.metrics.pendingRequests'),
      value: kpis?.data?.pendingRequests ?? '-',
      trend: 'down',
      trendValue: '5%',
    },
    {
      label: t('monitoring.metrics.systemUptime'),
      value: `${healthSummary.uptime}%`,
      trend: 'stable',
      trendValue: '',
    },
  ];

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
      {/* Header */}
      <Box style={{ marginBottom: 'var(--ds-spacing-6)' }}>
        <Box
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Box>
            <Heading level={1} size="xl">
              {t('monitoring.dashboard.title')}
            </Heading>
            <Paragraph style={{ marginTop: 'var(--ds-spacing-2)' }}>
              {t('monitoring.dashboard.description', {
                tenant: session?.user?.tenantName ?? t('common.unknown'),
              })}
            </Paragraph>
          </Box>
          <StatusBadge status={healthSummary.status} />
        </Box>
      </Box>

      {/* Health Overview Alert */}
      {healthSummary.activeAlerts > 0 && (
        <Alert
          severity="warning"
          style={{ marginBottom: 'var(--ds-spacing-4)' }}
        >
          {t('monitoring.alerts.activeCount', { count: healthSummary.activeAlerts })}
          <Link to="/monitoring/alerts">
            <Button variant="tertiary" size="sm" style={{ marginLeft: 'var(--ds-spacing-2)' }}>
              {t('monitoring.alerts.viewAll')}
            </Button>
          </Link>
        </Alert>
      )}

      {/* Key Metrics Grid */}
      <Box style={{ marginBottom: 'var(--ds-spacing-6)' }}>
        <Heading level={2} size="md" style={{ marginBottom: 'var(--ds-spacing-4)' }}>
          {t('monitoring.metrics.title')}
        </Heading>
        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 'var(--ds-spacing-4)',
          }}
        >
          {metrics.map((metric, index) => (
            <MetricCardDisplay key={index} metric={metric} />
          ))}
        </Box>
      </Box>

      {/* Quick Links */}
      <Box>
        <Heading level={2} size="md" style={{ marginBottom: 'var(--ds-spacing-4)' }}>
          {t('monitoring.quickLinks.title')}
        </Heading>
        <QuickLinks />
      </Box>

      {/* Last Updated */}
      <Box style={{ marginTop: 'var(--ds-spacing-6)' }}>
        <Paragraph size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
          {t('monitoring.lastUpdated', {
            time: new Date(healthSummary.lastChecked).toLocaleString(),
          })}
        </Paragraph>
      </Box>
    </Box>
  );
}
