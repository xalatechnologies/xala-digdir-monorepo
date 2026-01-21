/**
 * Tenant Alerts Page
 * Displays tenant-scoped alerts, notifications, and system events.
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
  Modal,
  Checkbox,
} from '@xalatechnologies/platform/ui';
import { Link } from 'react-router-dom';
import { useSession } from '@digilist/client-sdk/hooks';
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from '@digilist/client-sdk/hooks';

// Types for alerts
type AlertSeverity = 'info' | 'warning' | 'error' | 'critical';
type AlertStatus = 'active' | 'acknowledged' | 'resolved';
type AlertCategory = 'system' | 'security' | 'usage' | 'billing' | 'integration';

interface TenantAlert {
  id: string;
  title: string;
  description: string;
  severity: AlertSeverity;
  status: AlertStatus;
  category: AlertCategory;
  createdAt: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Severity badge component
 */
function SeverityBadge({ severity }: { severity: AlertSeverity }) {
  const t = useT();

  const config = {
    info: { color: 'info' as const, label: t('monitoring.alerts.severity.info') },
    warning: { color: 'warning' as const, label: t('monitoring.alerts.severity.warning') },
    error: { color: 'danger' as const, label: t('monitoring.alerts.severity.error') },
    critical: { color: 'danger' as const, label: t('monitoring.alerts.severity.critical') },
  };

  return (
    <Tag color={config[severity].color} size="sm">
      {config[severity].label}
    </Tag>
  );
}

/**
 * Status badge component
 */
function StatusBadge({ status }: { status: AlertStatus }) {
  const t = useT();

  const config = {
    active: { color: 'danger' as const, label: t('monitoring.alerts.status.active') },
    acknowledged: { color: 'warning' as const, label: t('monitoring.alerts.status.acknowledged') },
    resolved: { color: 'success' as const, label: t('monitoring.alerts.status.resolved') },
  };

  return (
    <Tag color={config[status].color} size="sm">
      {config[status].label}
    </Tag>
  );
}

/**
 * Category badge component
 */
function CategoryBadge({ category }: { category: AlertCategory }) {
  const t = useT();

  const labels: Record<AlertCategory, string> = {
    system: t('monitoring.alerts.category.system'),
    security: t('monitoring.alerts.category.security'),
    usage: t('monitoring.alerts.category.usage'),
    billing: t('monitoring.alerts.category.billing'),
    integration: t('monitoring.alerts.category.integration'),
  };

  return (
    <Tag color="neutral" size="sm">
      {labels[category]}
    </Tag>
  );
}

/**
 * Alert detail modal
 */
function AlertDetailModal({
  alert,
  isOpen,
  onClose,
  onAcknowledge,
  onResolve,
}: {
  alert: TenantAlert | null;
  isOpen: boolean;
  onClose: () => void;
  onAcknowledge: (id: string) => void;
  onResolve: (id: string) => void;
}) {
  const t = useT();

  if (!alert) return null;

  return (
    <Modal open={isOpen} onClose={onClose}>
      <Modal.Header>
        <Heading level={2} size="md">
          {alert.title}
        </Heading>
      </Modal.Header>
      <Modal.Content>
        <Box style={{ display: 'flex', gap: 'var(--ds-spacing-2)', marginBottom: 'var(--ds-spacing-4)' }}>
          <SeverityBadge severity={alert.severity} />
          <StatusBadge status={alert.status} />
          <CategoryBadge category={alert.category} />
        </Box>

        <Paragraph style={{ marginBottom: 'var(--ds-spacing-4)' }}>
          {alert.description}
        </Paragraph>

        <Table>
          <Table.Body>
            <Table.Row>
              <Table.Cell style={{ fontWeight: 500 }}>
                {t('monitoring.alerts.detail.createdAt')}
              </Table.Cell>
              <Table.Cell>{new Date(alert.createdAt).toLocaleString()}</Table.Cell>
            </Table.Row>
            {alert.acknowledgedAt && (
              <Table.Row>
                <Table.Cell style={{ fontWeight: 500 }}>
                  {t('monitoring.alerts.detail.acknowledgedAt')}
                </Table.Cell>
                <Table.Cell>{new Date(alert.acknowledgedAt).toLocaleString()}</Table.Cell>
              </Table.Row>
            )}
            {alert.resolvedAt && (
              <Table.Row>
                <Table.Cell style={{ fontWeight: 500 }}>
                  {t('monitoring.alerts.detail.resolvedAt')}
                </Table.Cell>
                <Table.Cell>{new Date(alert.resolvedAt).toLocaleString()}</Table.Cell>
              </Table.Row>
            )}
            <Table.Row>
              <Table.Cell style={{ fontWeight: 500 }}>
                {t('monitoring.alerts.detail.alertId')}
              </Table.Cell>
              <Table.Cell>
                <code>{alert.id}</code>
              </Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>
      </Modal.Content>
      <Modal.Footer>
        <Box style={{ display: 'flex', gap: 'var(--ds-spacing-2)', justifyContent: 'flex-end' }}>
          {alert.status === 'active' && (
            <Button variant="secondary" onClick={() => onAcknowledge(alert.id)}>
              {t('monitoring.alerts.action.acknowledge')}
            </Button>
          )}
          {alert.status !== 'resolved' && (
            <Button variant="primary" onClick={() => onResolve(alert.id)}>
              {t('monitoring.alerts.action.resolve')}
            </Button>
          )}
          <Button variant="tertiary" onClick={onClose}>
            {t('core.action.close')}
          </Button>
        </Box>
      </Modal.Footer>
    </Modal>
  );
}

/**
 * Alert statistics summary
 */
function AlertStatistics({ alerts }: { alerts: TenantAlert[] }) {
  const t = useT();

  const stats = {
    total: alerts.length,
    active: alerts.filter((a) => a.status === 'active').length,
    acknowledged: alerts.filter((a) => a.status === 'acknowledged').length,
    resolved: alerts.filter((a) => a.status === 'resolved').length,
    critical: alerts.filter((a) => a.severity === 'critical' && a.status === 'active').length,
  };

  return (
    <Box
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: 'var(--ds-spacing-4)',
        marginBottom: 'var(--ds-spacing-6)',
      }}
    >
      <Card style={{ padding: 'var(--ds-spacing-3)', textAlign: 'center' }}>
        <Heading level={3} size="lg">
          {stats.total}
        </Heading>
        <Paragraph size="sm">{t('monitoring.alerts.stats.total')}</Paragraph>
      </Card>
      <Card style={{ padding: 'var(--ds-spacing-3)', textAlign: 'center' }}>
        <Heading level={3} size="lg" style={{ color: 'var(--ds-color-danger-text-default)' }}>
          {stats.active}
        </Heading>
        <Paragraph size="sm">{t('monitoring.alerts.stats.active')}</Paragraph>
      </Card>
      <Card style={{ padding: 'var(--ds-spacing-3)', textAlign: 'center' }}>
        <Heading level={3} size="lg" style={{ color: 'var(--ds-color-warning-text-default)' }}>
          {stats.acknowledged}
        </Heading>
        <Paragraph size="sm">{t('monitoring.alerts.stats.acknowledged')}</Paragraph>
      </Card>
      <Card style={{ padding: 'var(--ds-spacing-3)', textAlign: 'center' }}>
        <Heading level={3} size="lg" style={{ color: 'var(--ds-color-success-text-default)' }}>
          {stats.resolved}
        </Heading>
        <Paragraph size="sm">{t('monitoring.alerts.stats.resolved')}</Paragraph>
      </Card>
      <Card style={{ padding: 'var(--ds-spacing-3)', textAlign: 'center' }}>
        <Heading
          level={3}
          size="lg"
          style={{
            color: stats.critical > 0 ? 'var(--ds-color-danger-text-default)' : 'inherit',
          }}
        >
          {stats.critical}
        </Heading>
        <Paragraph size="sm">{t('monitoring.alerts.stats.critical')}</Paragraph>
      </Card>
    </Box>
  );
}

/**
 * Alerts table component
 */
function AlertsTable({
  alerts,
  selectedIds,
  onSelectAlert,
  onToggleSelect,
  onSelectAll,
}: {
  alerts: TenantAlert[];
  selectedIds: Set<string>;
  onSelectAlert: (alert: TenantAlert) => void;
  onToggleSelect: (id: string) => void;
  onSelectAll: (selected: boolean) => void;
}) {
  const t = useT();
  const allSelected = alerts.length > 0 && selectedIds.size === alerts.length;

  return (
    <Table>
      <Table.Head>
        <Table.Row>
          <Table.HeaderCell style={{ width: '40px' }}>
            <Checkbox
              checked={allSelected}
              onChange={(e) => onSelectAll(e.target.checked)}
              aria-label={t('common.selectAll')}
            />
          </Table.HeaderCell>
          <Table.HeaderCell>{t('monitoring.alerts.table.severity')}</Table.HeaderCell>
          <Table.HeaderCell>{t('monitoring.alerts.table.title')}</Table.HeaderCell>
          <Table.HeaderCell>{t('monitoring.alerts.table.category')}</Table.HeaderCell>
          <Table.HeaderCell>{t('monitoring.alerts.table.status')}</Table.HeaderCell>
          <Table.HeaderCell>{t('monitoring.alerts.table.createdAt')}</Table.HeaderCell>
          <Table.HeaderCell>{t('common.actions')}</Table.HeaderCell>
        </Table.Row>
      </Table.Head>
      <Table.Body>
        {alerts.length === 0 ? (
          <Table.Row>
            <Table.Cell colSpan={7} style={{ textAlign: 'center', padding: 'var(--ds-spacing-6)' }}>
              <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                {t('monitoring.alerts.empty')}
              </Paragraph>
            </Table.Cell>
          </Table.Row>
        ) : (
          alerts.map((alert) => (
            <Table.Row
              key={alert.id}
              style={{
                backgroundColor:
                  alert.severity === 'critical' && alert.status === 'active'
                    ? 'var(--ds-color-danger-surface-default)'
                    : undefined,
              }}
            >
              <Table.Cell>
                <Checkbox
                  checked={selectedIds.has(alert.id)}
                  onChange={() => onToggleSelect(alert.id)}
                  aria-label={t('common.select')}
                />
              </Table.Cell>
              <Table.Cell>
                <SeverityBadge severity={alert.severity} />
              </Table.Cell>
              <Table.Cell>
                <Paragraph size="sm" style={{ fontWeight: 500 }}>
                  {alert.title}
                </Paragraph>
                <Paragraph
                  size="sm"
                  style={{
                    color: 'var(--ds-color-neutral-text-subtle)',
                    maxWidth: '300px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {alert.description}
                </Paragraph>
              </Table.Cell>
              <Table.Cell>
                <CategoryBadge category={alert.category} />
              </Table.Cell>
              <Table.Cell>
                <StatusBadge status={alert.status} />
              </Table.Cell>
              <Table.Cell>
                <Paragraph size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                  {new Date(alert.createdAt).toLocaleString()}
                </Paragraph>
              </Table.Cell>
              <Table.Cell>
                <Button variant="tertiary" size="sm" onClick={() => onSelectAlert(alert)}>
                  {t('common.viewDetails')}
                </Button>
              </Table.Cell>
            </Table.Row>
          ))
        )}
      </Table.Body>
    </Table>
  );
}

/**
 * Tenant Alerts Page Component
 */
export default function TenantAlertsPage() {
  const t = useT();
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'resolved'>('all');
  const [selectedAlert, setSelectedAlert] = useState<TenantAlert | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const { data: session, isLoading: sessionLoading } = useSession();
  const { data: notifications, isLoading: notificationsLoading, error: notificationsError, refetch } = useNotifications();
  const { mutate: markRead } = useMarkNotificationRead();
  const { mutate: markAllRead } = useMarkAllNotificationsRead();

  const isLoading = sessionLoading || notificationsLoading;

  // Mock alerts data - in production this would come from a dedicated alerts endpoint
  const mockAlerts: TenantAlert[] = [
    {
      id: '1',
      title: t('monitoring.alerts.samples.highUsage.title'),
      description: t('monitoring.alerts.samples.highUsage.description'),
      severity: 'warning',
      status: 'active',
      category: 'usage',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '2',
      title: t('monitoring.alerts.samples.apiError.title'),
      description: t('monitoring.alerts.samples.apiError.description'),
      severity: 'error',
      status: 'acknowledged',
      category: 'system',
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      acknowledgedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '3',
      title: t('monitoring.alerts.samples.integrationFailed.title'),
      description: t('monitoring.alerts.samples.integrationFailed.description'),
      severity: 'error',
      status: 'active',
      category: 'integration',
      createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '4',
      title: t('monitoring.alerts.samples.maintenanceScheduled.title'),
      description: t('monitoring.alerts.samples.maintenanceScheduled.description'),
      severity: 'info',
      status: 'active',
      category: 'system',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '5',
      title: t('monitoring.alerts.samples.securityLogin.title'),
      description: t('monitoring.alerts.samples.securityLogin.description'),
      severity: 'warning',
      status: 'resolved',
      category: 'security',
      createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      resolvedAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
    },
  ];

  // Filter alerts based on active tab
  const filteredAlerts = mockAlerts.filter((alert) => {
    if (activeTab === 'active') return alert.status === 'active' || alert.status === 'acknowledged';
    if (activeTab === 'resolved') return alert.status === 'resolved';
    return true;
  });

  const handleToggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedIds(new Set(filteredAlerts.map((a) => a.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleAcknowledge = (id: string) => {
    // In production, this would call an API endpoint
    console.log('Acknowledge alert:', id);
    setSelectedAlert(null);
    refetch();
  };

  const handleResolve = (id: string) => {
    // In production, this would call an API endpoint
    console.log('Resolve alert:', id);
    setSelectedAlert(null);
    refetch();
  };

  const handleBulkAcknowledge = () => {
    // In production, this would call an API endpoint
    console.log('Bulk acknowledge:', Array.from(selectedIds));
    setSelectedIds(new Set());
    refetch();
  };

  const handleBulkResolve = () => {
    // In production, this would call an API endpoint
    console.log('Bulk resolve:', Array.from(selectedIds));
    setSelectedIds(new Set());
    refetch();
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

  if (notificationsError) {
    return (
      <Box style={{ padding: 'var(--ds-spacing-6)' }}>
        <Alert severity="danger">
          {t('monitoring.error.loadFailed')}
        </Alert>
      </Box>
    );
  }

  const activeAlerts = mockAlerts.filter((a) => a.status === 'active');
  const criticalAlerts = activeAlerts.filter((a) => a.severity === 'critical');

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
            {t('monitoring.alerts.title')}
          </Heading>
          <Paragraph style={{ marginTop: 'var(--ds-spacing-2)' }}>
            {t('monitoring.alerts.description', {
              tenant: session?.user?.tenantName ?? t('common.unknown'),
            })}
          </Paragraph>
        </Box>
        <Box style={{ display: 'flex', gap: 'var(--ds-spacing-2)' }}>
          <Button variant="secondary" onClick={() => refetch()}>
            {t('core.action.refresh')}
          </Button>
        </Box>
      </Box>

      {/* Critical Alert Banner */}
      {criticalAlerts.length > 0 && (
        <Alert severity="danger" style={{ marginBottom: 'var(--ds-spacing-4)' }}>
          <strong>{t('monitoring.alerts.criticalBanner.title', { count: criticalAlerts.length })}</strong>
          <br />
          {t('monitoring.alerts.criticalBanner.description')}
        </Alert>
      )}

      {/* Statistics */}
      <AlertStatistics alerts={mockAlerts} />

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <Box
          style={{
            display: 'flex',
            gap: 'var(--ds-spacing-2)',
            alignItems: 'center',
            marginBottom: 'var(--ds-spacing-4)',
            padding: 'var(--ds-spacing-3)',
            backgroundColor: 'var(--ds-color-accent-surface-default)',
            borderRadius: 'var(--ds-border-radius-md)',
          }}
        >
          <Paragraph size="sm" style={{ fontWeight: 500 }}>
            {t('monitoring.alerts.bulkActions.selected', { count: selectedIds.size })}
          </Paragraph>
          <Button variant="secondary" size="sm" onClick={handleBulkAcknowledge}>
            {t('monitoring.alerts.action.acknowledgeSelected')}
          </Button>
          <Button variant="primary" size="sm" onClick={handleBulkResolve}>
            {t('monitoring.alerts.action.resolveSelected')}
          </Button>
          <Button variant="tertiary" size="sm" onClick={() => setSelectedIds(new Set())}>
            {t('core.action.clear')}
          </Button>
        </Box>
      )}

      {/* Tabs and Table */}
      <Card style={{ padding: 'var(--ds-spacing-4)' }}>
        <Tabs value={activeTab} onChange={(value) => setActiveTab(value as typeof activeTab)}>
          <Tabs.List>
            <Tabs.Tab value="all">
              {t('monitoring.alerts.tabs.all')} ({mockAlerts.length})
            </Tabs.Tab>
            <Tabs.Tab value="active">
              {t('monitoring.alerts.tabs.active')} (
              {mockAlerts.filter((a) => a.status !== 'resolved').length})
            </Tabs.Tab>
            <Tabs.Tab value="resolved">
              {t('monitoring.alerts.tabs.resolved')} (
              {mockAlerts.filter((a) => a.status === 'resolved').length})
            </Tabs.Tab>
          </Tabs.List>

          <Box style={{ marginTop: 'var(--ds-spacing-4)' }}>
            <AlertsTable
              alerts={filteredAlerts}
              selectedIds={selectedIds}
              onSelectAlert={setSelectedAlert}
              onToggleSelect={handleToggleSelect}
              onSelectAll={handleSelectAll}
            />
          </Box>
        </Tabs>
      </Card>

      {/* Alert Detail Modal */}
      <AlertDetailModal
        alert={selectedAlert}
        isOpen={selectedAlert !== null}
        onClose={() => setSelectedAlert(null)}
        onAcknowledge={handleAcknowledge}
        onResolve={handleResolve}
      />

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
