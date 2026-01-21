/**
 * Dashboard Page - Global Control Plane
 *
 * System health overview showing platform-wide metrics.
 * PLATFORM-ONLY: No @digilist/* imports allowed.
 */

import {
  Card,
  Heading,
  Paragraph,
  Badge,
  StatCard,
  SparklesIcon,
  DatabaseIcon,
  BuildingIcon,
  UsersIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  ClockIcon,
} from '@xalatechnologies/platform/ui';
import { useT } from '@xalatechnologies/platform/i18n';

// Mock data - would be replaced with actual API calls
const MOCK_PLATFORM_STATS = {
  totalTenants: 12,
  activeTenants: 10,
  totalUsers: 1245,
  totalApiCalls24h: 89420,
  uptime: 99.97,
  avgResponseTime: 45,
};

const MOCK_SERVICE_STATUS = [
  { name: 'API Gateway', status: 'healthy', latency: 23 },
  { name: 'Auth Service', status: 'healthy', latency: 12 },
  { name: 'Database (Primary)', status: 'healthy', latency: 8 },
  { name: 'Database (Replica)', status: 'healthy', latency: 9 },
  { name: 'Redis Cache', status: 'healthy', latency: 2 },
  { name: 'File Storage', status: 'degraded', latency: 156 },
];

const MOCK_RECENT_EVENTS = [
  { id: '1', type: 'info', message: 'New tenant onboarded: Oslo Kommune', time: '5 min ago' },
  { id: '2', type: 'warning', message: 'File storage latency above threshold', time: '12 min ago' },
  { id: '3', type: 'info', message: 'Database backup completed', time: '1 hour ago' },
  { id: '4', type: 'success', message: 'SSL certificates renewed', time: '3 hours ago' },
];

export function DashboardPage() {
  const t = useT();

  const getStatusColor = (status: string): 'success' | 'warning' | 'danger' => {
    if (status === 'healthy') return 'success';
    if (status === 'degraded') return 'warning';
    return 'danger';
  };

  const getEventTypeColor = (type: string): 'success' | 'warning' | 'danger' | 'info' => {
    switch (type) {
      case 'success': return 'success';
      case 'warning': return 'warning';
      case 'error': return 'danger';
      default: return 'info';
    }
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: 'var(--ds-spacing-8)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--ds-spacing-6)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)', marginBottom: 'var(--ds-spacing-2)' }}>
            <SparklesIcon style={{ color: 'var(--ds-color-accent-text-default)', width: 32, height: 32 }} />
            <Heading level={1} size="lg">
              {t('monitoring.dashboard.title')}
            </Heading>
          </div>
          <Paragraph size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
            {t('monitoring.dashboard.description')}
          </Paragraph>
        </div>
        <Badge color="success">
          <CheckCircleIcon />
          {t('monitoring.status.allSystemsOperational')}
        </Badge>
      </div>

      {/* Platform Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--ds-spacing-4)', marginBottom: 'var(--ds-spacing-6)' }}>
        <StatCard
          title={t('monitoring.stats.activeTenants')}
          value={`${MOCK_PLATFORM_STATS.activeTenants}/${MOCK_PLATFORM_STATS.totalTenants}`}
          description={t('monitoring.stats.tenantsOnline')}
          color="var(--ds-color-success-text-default)"
          icon={<BuildingIcon />}
        />
        <StatCard
          title={t('monitoring.stats.totalUsers')}
          value={MOCK_PLATFORM_STATS.totalUsers.toLocaleString('nb-NO')}
          description={t('monitoring.stats.acrossAllTenants')}
          color="var(--ds-color-info-text-default)"
          icon={<UsersIcon />}
        />
        <StatCard
          title={t('monitoring.stats.uptime')}
          value={`${MOCK_PLATFORM_STATS.uptime}%`}
          description={t('monitoring.stats.last30Days')}
          color="var(--ds-color-success-text-default)"
          icon={<ClockIcon />}
        />
        <StatCard
          title={t('monitoring.stats.apiCalls')}
          value={MOCK_PLATFORM_STATS.totalApiCalls24h.toLocaleString('nb-NO')}
          description={t('monitoring.stats.last24Hours')}
          color="var(--ds-color-accent-text-default)"
          icon={<DatabaseIcon />}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 'var(--ds-spacing-6)' }}>
        {/* Service Status */}
        <Card style={{ padding: 'var(--ds-spacing-6)' }}>
          <Heading level={2} size="sm" style={{ marginBottom: 'var(--ds-spacing-4)' }}>
            {t('monitoring.serviceStatus.title')}
          </Heading>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--ds-spacing-4)' }}>
            {MOCK_SERVICE_STATUS.map((service) => (
              <div
                key={service.name}
                style={{
                  padding: 'var(--ds-spacing-4)',
                  border: '1px solid var(--ds-color-neutral-border-subtle)',
                  borderRadius: 'var(--ds-border-radius-md)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--ds-spacing-2)' }}>
                  <Paragraph size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
                    {service.name}
                  </Paragraph>
                  <Badge color={getStatusColor(service.status)}>
                    {service.status === 'healthy' ? <CheckCircleIcon /> : <AlertTriangleIcon />}
                    {service.status}
                  </Badge>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--ds-color-neutral-text-subtle)', fontSize: 'var(--ds-font-size-xs)' }}>
                    {t('monitoring.serviceStatus.latency')}
                  </span>
                  <span style={{ fontSize: 'var(--ds-font-size-xs)' }}>
                    {service.latency}ms
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Events */}
        <Card style={{ padding: 'var(--ds-spacing-6)' }}>
          <Heading level={2} size="sm" style={{ marginBottom: 'var(--ds-spacing-4)' }}>
            {t('monitoring.recentEvents.title')}
          </Heading>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-3)' }}>
            {MOCK_RECENT_EVENTS.map((event) => (
              <div
                key={event.id}
                style={{
                  padding: 'var(--ds-spacing-3)',
                  backgroundColor: 'var(--ds-color-neutral-surface-subtle)',
                  borderRadius: 'var(--ds-border-radius-md)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)', marginBottom: 'var(--ds-spacing-1)' }}>
                  <Badge color={getEventTypeColor(event.type)} size="sm">
                    {event.type}
                  </Badge>
                </div>
                <Paragraph size="sm" style={{ margin: 0 }}>
                  {event.message}
                </Paragraph>
                <span style={{ fontSize: 'var(--ds-font-size-xs)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                  {event.time}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Quick Metrics */}
      <Card style={{ marginTop: 'var(--ds-spacing-6)', padding: 'var(--ds-spacing-6)' }}>
        <Heading level={2} size="sm" style={{ marginBottom: 'var(--ds-spacing-4)' }}>
          {t('monitoring.quickMetrics.title')}
        </Heading>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--ds-spacing-4)' }}>
          <div style={{ textAlign: 'center', padding: 'var(--ds-spacing-4)' }}>
            <Paragraph size="xs" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
              {t('monitoring.quickMetrics.avgResponseTime')}
            </Paragraph>
            <Heading level={3} size="md" style={{ margin: 'var(--ds-spacing-2) 0 0' }}>
              {MOCK_PLATFORM_STATS.avgResponseTime}ms
            </Heading>
          </div>
          <div style={{ textAlign: 'center', padding: 'var(--ds-spacing-4)' }}>
            <Paragraph size="xs" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
              {t('monitoring.quickMetrics.errorRate')}
            </Paragraph>
            <Heading level={3} size="md" style={{ margin: 'var(--ds-spacing-2) 0 0', color: 'var(--ds-color-success-text-default)' }}>
              0.02%
            </Heading>
          </div>
          <div style={{ textAlign: 'center', padding: 'var(--ds-spacing-4)' }}>
            <Paragraph size="xs" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
              {t('monitoring.quickMetrics.activeConnections')}
            </Paragraph>
            <Heading level={3} size="md" style={{ margin: 'var(--ds-spacing-2) 0 0' }}>
              234
            </Heading>
          </div>
          <div style={{ textAlign: 'center', padding: 'var(--ds-spacing-4)' }}>
            <Paragraph size="xs" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
              {t('monitoring.quickMetrics.queuedJobs')}
            </Paragraph>
            <Heading level={3} size="md" style={{ margin: 'var(--ds-spacing-2) 0 0' }}>
              12
            </Heading>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default DashboardPage;
