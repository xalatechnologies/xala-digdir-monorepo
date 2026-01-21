/**
 * Infrastructure Page - Global Control Plane
 *
 * Database, Redis, Network status monitoring.
 * PLATFORM-ONLY: No @digilist/* imports allowed.
 */

import {
  Card,
  Heading,
  Paragraph,
  Badge,
  Table,
  DatabaseIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
} from '@xalatechnologies/platform/ui';
import { useT } from '@xala/i18n';

// Mock data - would be replaced with actual API calls
const MOCK_DATABASE_STATUS = {
  primary: {
    host: 'db-primary.internal',
    status: 'healthy',
    connections: 45,
    maxConnections: 100,
    replicationLag: 0,
    diskUsage: 67.5,
    cpuUsage: 23.4,
    memoryUsage: 58.2,
  },
  replica: {
    host: 'db-replica.internal',
    status: 'healthy',
    connections: 32,
    maxConnections: 100,
    replicationLag: 2,
    diskUsage: 67.3,
    cpuUsage: 18.1,
    memoryUsage: 52.8,
  },
};

const MOCK_REDIS_STATUS = {
  host: 'redis.internal',
  status: 'healthy',
  memoryUsed: 256,
  memoryMax: 512,
  connectedClients: 89,
  hitRate: 98.7,
  evictedKeys: 0,
  uptime: '45 days',
};

const MOCK_NETWORK_STATUS = [
  { endpoint: 'api.digilist.no', status: 'healthy', latency: 23, region: 'eu-north-1' },
  { endpoint: 'cdn.digilist.no', status: 'healthy', latency: 12, region: 'global' },
  { endpoint: 'ws.digilist.no', status: 'healthy', latency: 8, region: 'eu-north-1' },
  { endpoint: 'storage.digilist.no', status: 'degraded', latency: 156, region: 'eu-north-1' },
];

const MOCK_RECENT_QUERIES = [
  { query: 'SELECT * FROM platform.users...', duration: 12, rows: 150, timestamp: '2 min ago' },
  { query: 'INSERT INTO domain.bookings...', duration: 8, rows: 1, timestamp: '3 min ago' },
  { query: 'UPDATE saas.tenants SET...', duration: 5, rows: 1, timestamp: '5 min ago' },
  { query: 'SELECT * FROM compliance.audit_logs...', duration: 45, rows: 5000, timestamp: '8 min ago' },
];

export function InfrastructurePage() {
  const t = useT();

  const getStatusColor = (status: string): 'success' | 'warning' | 'danger' => {
    if (status === 'healthy') return 'success';
    if (status === 'degraded') return 'warning';
    return 'danger';
  };

  const getUsageColor = (usage: number): string => {
    if (usage < 60) return 'var(--ds-color-success-text-default)';
    if (usage < 80) return 'var(--ds-color-warning-text-default)';
    return 'var(--ds-color-danger-text-default)';
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: 'var(--ds-spacing-8)' }}>
      {/* Header */}
      <div style={{ marginBottom: 'var(--ds-spacing-6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)', marginBottom: 'var(--ds-spacing-2)' }}>
          <DatabaseIcon style={{ color: 'var(--ds-color-accent-text-default)', width: 32, height: 32 }} />
          <Heading level={1} size="lg">
            {t('monitoring.infrastructure.title')}
          </Heading>
        </div>
        <Paragraph size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
          {t('monitoring.infrastructure.description')}
        </Paragraph>
      </div>

      {/* Database Status */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--ds-spacing-6)', marginBottom: 'var(--ds-spacing-6)' }}>
        {/* Primary Database */}
        <Card style={{ padding: 'var(--ds-spacing-6)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--ds-spacing-4)' }}>
            <Heading level={2} size="sm">
              {t('monitoring.infrastructure.primaryDatabase')}
            </Heading>
            <Badge color={getStatusColor(MOCK_DATABASE_STATUS.primary.status)}>
              {MOCK_DATABASE_STATUS.primary.status === 'healthy' ? <CheckCircleIcon /> : <AlertTriangleIcon />}
              {MOCK_DATABASE_STATUS.primary.status}
            </Badge>
          </div>

          <Paragraph size="xs" style={{ color: 'var(--ds-color-neutral-text-subtle)', marginBottom: 'var(--ds-spacing-4)' }}>
            {MOCK_DATABASE_STATUS.primary.host}
          </Paragraph>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--ds-spacing-4)' }}>
            <div>
              <Paragraph size="xs" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
                {t('monitoring.infrastructure.connections')}
              </Paragraph>
              <Paragraph size="md" style={{ margin: 'var(--ds-spacing-1) 0 0', fontWeight: 'var(--ds-font-weight-semibold)' }}>
                {MOCK_DATABASE_STATUS.primary.connections} / {MOCK_DATABASE_STATUS.primary.maxConnections}
              </Paragraph>
            </div>
            <div>
              <Paragraph size="xs" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
                {t('monitoring.infrastructure.diskUsage')}
              </Paragraph>
              <Paragraph size="md" style={{ margin: 'var(--ds-spacing-1) 0 0', fontWeight: 'var(--ds-font-weight-semibold)', color: getUsageColor(MOCK_DATABASE_STATUS.primary.diskUsage) }}>
                {MOCK_DATABASE_STATUS.primary.diskUsage}%
              </Paragraph>
            </div>
            <div>
              <Paragraph size="xs" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
                {t('monitoring.infrastructure.cpuUsage')}
              </Paragraph>
              <Paragraph size="md" style={{ margin: 'var(--ds-spacing-1) 0 0', fontWeight: 'var(--ds-font-weight-semibold)', color: getUsageColor(MOCK_DATABASE_STATUS.primary.cpuUsage) }}>
                {MOCK_DATABASE_STATUS.primary.cpuUsage}%
              </Paragraph>
            </div>
            <div>
              <Paragraph size="xs" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
                {t('monitoring.infrastructure.memoryUsage')}
              </Paragraph>
              <Paragraph size="md" style={{ margin: 'var(--ds-spacing-1) 0 0', fontWeight: 'var(--ds-font-weight-semibold)', color: getUsageColor(MOCK_DATABASE_STATUS.primary.memoryUsage) }}>
                {MOCK_DATABASE_STATUS.primary.memoryUsage}%
              </Paragraph>
            </div>
          </div>
        </Card>

        {/* Replica Database */}
        <Card style={{ padding: 'var(--ds-spacing-6)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--ds-spacing-4)' }}>
            <Heading level={2} size="sm">
              {t('monitoring.infrastructure.replicaDatabase')}
            </Heading>
            <Badge color={getStatusColor(MOCK_DATABASE_STATUS.replica.status)}>
              {MOCK_DATABASE_STATUS.replica.status === 'healthy' ? <CheckCircleIcon /> : <AlertTriangleIcon />}
              {MOCK_DATABASE_STATUS.replica.status}
            </Badge>
          </div>

          <Paragraph size="xs" style={{ color: 'var(--ds-color-neutral-text-subtle)', marginBottom: 'var(--ds-spacing-4)' }}>
            {MOCK_DATABASE_STATUS.replica.host}
          </Paragraph>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--ds-spacing-4)' }}>
            <div>
              <Paragraph size="xs" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
                {t('monitoring.infrastructure.replicationLag')}
              </Paragraph>
              <Paragraph size="md" style={{ margin: 'var(--ds-spacing-1) 0 0', fontWeight: 'var(--ds-font-weight-semibold)' }}>
                {MOCK_DATABASE_STATUS.replica.replicationLag}ms
              </Paragraph>
            </div>
            <div>
              <Paragraph size="xs" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
                {t('monitoring.infrastructure.connections')}
              </Paragraph>
              <Paragraph size="md" style={{ margin: 'var(--ds-spacing-1) 0 0', fontWeight: 'var(--ds-font-weight-semibold)' }}>
                {MOCK_DATABASE_STATUS.replica.connections} / {MOCK_DATABASE_STATUS.replica.maxConnections}
              </Paragraph>
            </div>
            <div>
              <Paragraph size="xs" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
                {t('monitoring.infrastructure.cpuUsage')}
              </Paragraph>
              <Paragraph size="md" style={{ margin: 'var(--ds-spacing-1) 0 0', fontWeight: 'var(--ds-font-weight-semibold)', color: getUsageColor(MOCK_DATABASE_STATUS.replica.cpuUsage) }}>
                {MOCK_DATABASE_STATUS.replica.cpuUsage}%
              </Paragraph>
            </div>
            <div>
              <Paragraph size="xs" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
                {t('monitoring.infrastructure.memoryUsage')}
              </Paragraph>
              <Paragraph size="md" style={{ margin: 'var(--ds-spacing-1) 0 0', fontWeight: 'var(--ds-font-weight-semibold)', color: getUsageColor(MOCK_DATABASE_STATUS.replica.memoryUsage) }}>
                {MOCK_DATABASE_STATUS.replica.memoryUsage}%
              </Paragraph>
            </div>
          </div>
        </Card>
      </div>

      {/* Redis Status */}
      <Card style={{ padding: 'var(--ds-spacing-6)', marginBottom: 'var(--ds-spacing-6)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--ds-spacing-4)' }}>
          <Heading level={2} size="sm">
            {t('monitoring.infrastructure.redisCache')}
          </Heading>
          <Badge color={getStatusColor(MOCK_REDIS_STATUS.status)}>
            {MOCK_REDIS_STATUS.status === 'healthy' ? <CheckCircleIcon /> : <AlertTriangleIcon />}
            {MOCK_REDIS_STATUS.status}
          </Badge>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 'var(--ds-spacing-4)' }}>
          <div>
            <Paragraph size="xs" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
              {t('monitoring.infrastructure.memoryUsed')}
            </Paragraph>
            <Paragraph size="md" style={{ margin: 'var(--ds-spacing-1) 0 0', fontWeight: 'var(--ds-font-weight-semibold)' }}>
              {MOCK_REDIS_STATUS.memoryUsed} / {MOCK_REDIS_STATUS.memoryMax} MB
            </Paragraph>
          </div>
          <div>
            <Paragraph size="xs" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
              {t('monitoring.infrastructure.connectedClients')}
            </Paragraph>
            <Paragraph size="md" style={{ margin: 'var(--ds-spacing-1) 0 0', fontWeight: 'var(--ds-font-weight-semibold)' }}>
              {MOCK_REDIS_STATUS.connectedClients}
            </Paragraph>
          </div>
          <div>
            <Paragraph size="xs" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
              {t('monitoring.infrastructure.hitRate')}
            </Paragraph>
            <Paragraph size="md" style={{ margin: 'var(--ds-spacing-1) 0 0', fontWeight: 'var(--ds-font-weight-semibold)', color: 'var(--ds-color-success-text-default)' }}>
              {MOCK_REDIS_STATUS.hitRate}%
            </Paragraph>
          </div>
          <div>
            <Paragraph size="xs" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
              {t('monitoring.infrastructure.evictedKeys')}
            </Paragraph>
            <Paragraph size="md" style={{ margin: 'var(--ds-spacing-1) 0 0', fontWeight: 'var(--ds-font-weight-semibold)' }}>
              {MOCK_REDIS_STATUS.evictedKeys}
            </Paragraph>
          </div>
          <div>
            <Paragraph size="xs" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
              {t('monitoring.infrastructure.uptime')}
            </Paragraph>
            <Paragraph size="md" style={{ margin: 'var(--ds-spacing-1) 0 0', fontWeight: 'var(--ds-font-weight-semibold)' }}>
              {MOCK_REDIS_STATUS.uptime}
            </Paragraph>
          </div>
        </div>
      </Card>

      {/* Network Status */}
      <Card style={{ padding: 'var(--ds-spacing-6)', marginBottom: 'var(--ds-spacing-6)' }}>
        <Heading level={2} size="sm" style={{ marginBottom: 'var(--ds-spacing-4)' }}>
          {t('monitoring.infrastructure.networkStatus')}
        </Heading>

        <Table>
          <Table.Head>
            <Table.Row>
              <Table.HeaderCell>{t('monitoring.infrastructure.endpoint')}</Table.HeaderCell>
              <Table.HeaderCell>{t('monitoring.infrastructure.region')}</Table.HeaderCell>
              <Table.HeaderCell>{t('monitoring.infrastructure.status')}</Table.HeaderCell>
              <Table.HeaderCell>{t('monitoring.infrastructure.latency')}</Table.HeaderCell>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {MOCK_NETWORK_STATUS.map((endpoint) => (
              <Table.Row key={endpoint.endpoint}>
                <Table.Cell>
                  <strong>{endpoint.endpoint}</strong>
                </Table.Cell>
                <Table.Cell>{endpoint.region}</Table.Cell>
                <Table.Cell>
                  <Badge color={getStatusColor(endpoint.status)}>
                    {endpoint.status === 'healthy' ? <CheckCircleIcon /> : <AlertTriangleIcon />}
                    {endpoint.status}
                  </Badge>
                </Table.Cell>
                <Table.Cell>{endpoint.latency}ms</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </Card>

      {/* Recent Queries */}
      <Card style={{ padding: 'var(--ds-spacing-6)' }}>
        <Heading level={2} size="sm" style={{ marginBottom: 'var(--ds-spacing-4)' }}>
          {t('monitoring.infrastructure.recentQueries')}
        </Heading>

        <Table>
          <Table.Head>
            <Table.Row>
              <Table.HeaderCell>{t('monitoring.infrastructure.query')}</Table.HeaderCell>
              <Table.HeaderCell>{t('monitoring.infrastructure.duration')}</Table.HeaderCell>
              <Table.HeaderCell>{t('monitoring.infrastructure.rows')}</Table.HeaderCell>
              <Table.HeaderCell>{t('monitoring.infrastructure.time')}</Table.HeaderCell>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {MOCK_RECENT_QUERIES.map((query, index) => (
              <Table.Row key={index}>
                <Table.Cell>
                  <code style={{ fontSize: 'var(--ds-font-size-xs)', backgroundColor: 'var(--ds-color-neutral-surface-subtle)', padding: 'var(--ds-spacing-1) var(--ds-spacing-2)', borderRadius: 'var(--ds-border-radius-sm)' }}>
                    {query.query}
                  </code>
                </Table.Cell>
                <Table.Cell>{query.duration}ms</Table.Cell>
                <Table.Cell>{query.rows.toLocaleString()}</Table.Cell>
                <Table.Cell>{query.timestamp}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </Card>
    </div>
  );
}

export default InfrastructurePage;
