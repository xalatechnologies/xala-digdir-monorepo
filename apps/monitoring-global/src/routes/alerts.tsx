/**
 * Alerts Page - Global Control Plane
 *
 * Global alerts and incident management.
 * PLATFORM-ONLY: No @digilist/* imports allowed.
 */

import { useState } from 'react';
import {
  Card,
  Heading,
  Paragraph,
  Badge,
  Button,
  Table,
  AlertTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
} from '@xalatechnologies/platform/ui';
import { useT } from '@xala/i18n';

type AlertSeverity = 'critical' | 'warning' | 'info';
type AlertStatus = 'active' | 'acknowledged' | 'resolved';

interface Alert {
  id: string;
  title: string;
  description: string;
  severity: AlertSeverity;
  status: AlertStatus;
  source: string;
  tenant?: string;
  createdAt: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  acknowledgedBy?: string;
}

// Mock data - would be replaced with actual API calls
const MOCK_ALERTS: Alert[] = [
  {
    id: '1',
    title: 'High storage latency detected',
    description: 'File storage service experiencing latency above 100ms threshold',
    severity: 'warning',
    status: 'active',
    source: 'storage.digilist.no',
    createdAt: '12 min ago',
  },
  {
    id: '2',
    title: 'Database connection pool exhaustion warning',
    description: 'Connection pool usage at 85% capacity',
    severity: 'warning',
    status: 'acknowledged',
    source: 'db-primary.internal',
    createdAt: '45 min ago',
    acknowledgedAt: '30 min ago',
    acknowledgedBy: 'admin@xala.no',
  },
  {
    id: '3',
    title: 'Tenant API rate limit exceeded',
    description: 'Oslo Kommune exceeded API rate limit of 10000 requests/min',
    severity: 'info',
    status: 'resolved',
    source: 'api.digilist.no',
    tenant: 'Oslo Kommune',
    createdAt: '2 hours ago',
    resolvedAt: '1 hour ago',
  },
  {
    id: '4',
    title: 'SSL certificate expiring soon',
    description: 'Certificate for api.digilist.no expires in 14 days',
    severity: 'warning',
    status: 'active',
    source: 'ssl-monitor',
    createdAt: '3 hours ago',
  },
  {
    id: '5',
    title: 'Memory usage spike detected',
    description: 'API server memory usage exceeded 80% threshold',
    severity: 'warning',
    status: 'resolved',
    source: 'api-server-01',
    createdAt: '5 hours ago',
    resolvedAt: '4 hours ago',
  },
];

const MOCK_ALERT_STATS = {
  active: 2,
  acknowledged: 1,
  resolved: 2,
  critical: 0,
  warning: 4,
  info: 1,
};

export function AlertsPage() {
  const t = useT();
  const [filter, setFilter] = useState<'all' | AlertStatus>('all');

  const getSeverityColor = (severity: AlertSeverity): 'danger' | 'warning' | 'info' => {
    switch (severity) {
      case 'critical': return 'danger';
      case 'warning': return 'warning';
      default: return 'info';
    }
  };

  const getStatusColor = (status: AlertStatus): 'danger' | 'warning' | 'success' => {
    switch (status) {
      case 'active': return 'danger';
      case 'acknowledged': return 'warning';
      default: return 'success';
    }
  };

  const filteredAlerts = filter === 'all'
    ? MOCK_ALERTS
    : MOCK_ALERTS.filter(alert => alert.status === filter);

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: 'var(--ds-spacing-8)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--ds-spacing-6)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)', marginBottom: 'var(--ds-spacing-2)' }}>
            <AlertTriangleIcon style={{ color: 'var(--ds-color-warning-text-default)', width: 32, height: 32 }} />
            <Heading level={1} size="lg">
              {t('monitoring.alerts.title')}
            </Heading>
          </div>
          <Paragraph size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
            {t('monitoring.alerts.description')}
          </Paragraph>
        </div>
        <Badge color={MOCK_ALERT_STATS.active > 0 ? 'warning' : 'success'}>
          {MOCK_ALERT_STATS.active > 0 ? (
            <>
              <AlertTriangleIcon />
              {MOCK_ALERT_STATS.active} {t('monitoring.alerts.activeAlerts')}
            </>
          ) : (
            <>
              <CheckCircleIcon />
              {t('monitoring.alerts.noActiveAlerts')}
            </>
          )}
        </Badge>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 'var(--ds-spacing-4)', marginBottom: 'var(--ds-spacing-6)' }}>
        <Card style={{ padding: 'var(--ds-spacing-4)', textAlign: 'center', cursor: 'pointer', border: filter === 'all' ? '2px solid var(--ds-color-accent-base-default)' : undefined }} onClick={() => setFilter('all')}>
          <Paragraph size="xs" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
            {t('monitoring.alerts.total')}
          </Paragraph>
          <Heading level={3} size="md" style={{ margin: 'var(--ds-spacing-2) 0 0' }}>
            {MOCK_ALERTS.length}
          </Heading>
        </Card>
        <Card style={{ padding: 'var(--ds-spacing-4)', textAlign: 'center', cursor: 'pointer', border: filter === 'active' ? '2px solid var(--ds-color-danger-base-default)' : undefined }} onClick={() => setFilter('active')}>
          <Paragraph size="xs" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
            {t('monitoring.alerts.active')}
          </Paragraph>
          <Heading level={3} size="md" style={{ margin: 'var(--ds-spacing-2) 0 0', color: 'var(--ds-color-danger-text-default)' }}>
            {MOCK_ALERT_STATS.active}
          </Heading>
        </Card>
        <Card style={{ padding: 'var(--ds-spacing-4)', textAlign: 'center', cursor: 'pointer', border: filter === 'acknowledged' ? '2px solid var(--ds-color-warning-base-default)' : undefined }} onClick={() => setFilter('acknowledged')}>
          <Paragraph size="xs" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
            {t('monitoring.alerts.acknowledged')}
          </Paragraph>
          <Heading level={3} size="md" style={{ margin: 'var(--ds-spacing-2) 0 0', color: 'var(--ds-color-warning-text-default)' }}>
            {MOCK_ALERT_STATS.acknowledged}
          </Heading>
        </Card>
        <Card style={{ padding: 'var(--ds-spacing-4)', textAlign: 'center', cursor: 'pointer', border: filter === 'resolved' ? '2px solid var(--ds-color-success-base-default)' : undefined }} onClick={() => setFilter('resolved')}>
          <Paragraph size="xs" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
            {t('monitoring.alerts.resolved')}
          </Paragraph>
          <Heading level={3} size="md" style={{ margin: 'var(--ds-spacing-2) 0 0', color: 'var(--ds-color-success-text-default)' }}>
            {MOCK_ALERT_STATS.resolved}
          </Heading>
        </Card>
        <Card style={{ padding: 'var(--ds-spacing-4)', textAlign: 'center' }}>
          <Paragraph size="xs" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
            {t('monitoring.alerts.critical')}
          </Paragraph>
          <Heading level={3} size="md" style={{ margin: 'var(--ds-spacing-2) 0 0', color: MOCK_ALERT_STATS.critical > 0 ? 'var(--ds-color-danger-text-default)' : 'var(--ds-color-success-text-default)' }}>
            {MOCK_ALERT_STATS.critical}
          </Heading>
        </Card>
        <Card style={{ padding: 'var(--ds-spacing-4)', textAlign: 'center' }}>
          <Paragraph size="xs" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
            {t('monitoring.alerts.warnings')}
          </Paragraph>
          <Heading level={3} size="md" style={{ margin: 'var(--ds-spacing-2) 0 0', color: 'var(--ds-color-warning-text-default)' }}>
            {MOCK_ALERT_STATS.warning}
          </Heading>
        </Card>
      </div>

      {/* Alerts Table */}
      <Card style={{ padding: 'var(--ds-spacing-6)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--ds-spacing-4)' }}>
          <Heading level={2} size="sm">
            {filter === 'all' ? t('monitoring.alerts.allAlerts') : t(`monitoring.alerts.${filter}Alerts`)}
          </Heading>
          <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)' }}>
            <Button variant="tertiary" size="sm">
              {t('monitoring.alerts.acknowledgeAll')}
            </Button>
            <Button variant="tertiary" size="sm">
              {t('common.eksporter')}
            </Button>
          </div>
        </div>

        <Table>
          <Table.Head>
            <Table.Row>
              <Table.HeaderCell>{t('monitoring.alerts.severity')}</Table.HeaderCell>
              <Table.HeaderCell>{t('monitoring.alerts.alert')}</Table.HeaderCell>
              <Table.HeaderCell>{t('monitoring.alerts.source')}</Table.HeaderCell>
              <Table.HeaderCell>{t('monitoring.alerts.status')}</Table.HeaderCell>
              <Table.HeaderCell>{t('monitoring.alerts.created')}</Table.HeaderCell>
              <Table.HeaderCell>{t('monitoring.alerts.actions')}</Table.HeaderCell>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {filteredAlerts.map((alert) => (
              <Table.Row key={alert.id}>
                <Table.Cell>
                  <Badge color={getSeverityColor(alert.severity)}>
                    {alert.severity === 'critical' ? <AlertTriangleIcon /> : null}
                    {alert.severity}
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  <div>
                    <strong>{alert.title}</strong>
                    <div style={{ fontSize: 'var(--ds-font-size-xs)', color: 'var(--ds-color-neutral-text-subtle)', marginTop: 'var(--ds-spacing-1)' }}>
                      {alert.description}
                    </div>
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <div>
                    <code style={{ fontSize: 'var(--ds-font-size-xs)', backgroundColor: 'var(--ds-color-neutral-surface-subtle)', padding: 'var(--ds-spacing-1) var(--ds-spacing-2)', borderRadius: 'var(--ds-border-radius-sm)' }}>
                      {alert.source}
                    </code>
                    {alert.tenant && (
                      <div style={{ fontSize: 'var(--ds-font-size-xs)', color: 'var(--ds-color-neutral-text-subtle)', marginTop: 'var(--ds-spacing-1)' }}>
                        {alert.tenant}
                      </div>
                    )}
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <Badge color={getStatusColor(alert.status)}>
                    {alert.status === 'active' && <AlertTriangleIcon />}
                    {alert.status === 'acknowledged' && <ClockIcon />}
                    {alert.status === 'resolved' && <CheckCircleIcon />}
                    {alert.status}
                  </Badge>
                  {alert.acknowledgedBy && (
                    <div style={{ fontSize: 'var(--ds-font-size-xs)', color: 'var(--ds-color-neutral-text-subtle)', marginTop: 'var(--ds-spacing-1)' }}>
                      {t('monitoring.alerts.by')} {alert.acknowledgedBy}
                    </div>
                  )}
                </Table.Cell>
                <Table.Cell>
                  <span style={{ fontSize: 'var(--ds-font-size-xs)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                    {alert.createdAt}
                  </span>
                  {alert.resolvedAt && (
                    <div style={{ fontSize: 'var(--ds-font-size-xs)', color: 'var(--ds-color-success-text-default)', marginTop: 'var(--ds-spacing-1)' }}>
                      {t('monitoring.alerts.resolvedAt')} {alert.resolvedAt}
                    </div>
                  )}
                </Table.Cell>
                <Table.Cell>
                  <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)' }}>
                    {alert.status === 'active' && (
                      <Button variant="secondary" size="sm">
                        {t('monitoring.alerts.acknowledge')}
                      </Button>
                    )}
                    {(alert.status === 'active' || alert.status === 'acknowledged') && (
                      <Button variant="secondary" size="sm">
                        {t('monitoring.alerts.resolve')}
                      </Button>
                    )}
                    <Button variant="tertiary" size="sm">
                      {t('common.vis_detaljer')}
                    </Button>
                  </div>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>

        {filteredAlerts.length === 0 && (
          <div style={{ textAlign: 'center', padding: 'var(--ds-spacing-8)' }}>
            <CheckCircleIcon style={{ width: 48, height: 48, color: 'var(--ds-color-success-text-default)', marginBottom: 'var(--ds-spacing-4)' }} />
            <Heading level={3} size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
              {t('monitoring.alerts.noAlerts')}
            </Heading>
            <Paragraph size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
              {t('monitoring.alerts.noAlertsDescription')}
            </Paragraph>
          </div>
        )}
      </Card>

      {/* Alert Configuration */}
      <Card style={{ marginTop: 'var(--ds-spacing-6)', padding: 'var(--ds-spacing-6)' }}>
        <Heading level={2} size="sm" style={{ marginBottom: 'var(--ds-spacing-4)' }}>
          {t('monitoring.alerts.configuration')}
        </Heading>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--ds-spacing-4)' }}>
          <div style={{ padding: 'var(--ds-spacing-4)', border: '1px solid var(--ds-color-neutral-border-subtle)', borderRadius: 'var(--ds-border-radius-md)' }}>
            <Paragraph size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)', marginBottom: 'var(--ds-spacing-2)' }}>
              {t('monitoring.alerts.notificationChannels')}
            </Paragraph>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--ds-spacing-2)' }}>
              <Badge color="success">Email</Badge>
              <Badge color="success">Slack</Badge>
              <Badge color="info">PagerDuty</Badge>
            </div>
          </div>
          <div style={{ padding: 'var(--ds-spacing-4)', border: '1px solid var(--ds-color-neutral-border-subtle)', borderRadius: 'var(--ds-border-radius-md)' }}>
            <Paragraph size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)', marginBottom: 'var(--ds-spacing-2)' }}>
              {t('monitoring.alerts.escalationPolicy')}
            </Paragraph>
            <Paragraph size="xs" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
              {t('monitoring.alerts.escalationDescription')}
            </Paragraph>
          </div>
          <div style={{ padding: 'var(--ds-spacing-4)', border: '1px solid var(--ds-color-neutral-border-subtle)', borderRadius: 'var(--ds-border-radius-md)' }}>
            <Paragraph size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)', marginBottom: 'var(--ds-spacing-2)' }}>
              {t('monitoring.alerts.maintenanceWindow')}
            </Paragraph>
            <Paragraph size="xs" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
              {t('monitoring.alerts.noActiveWindow')}
            </Paragraph>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default AlertsPage;
