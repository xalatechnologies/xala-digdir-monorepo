/**
 * Tenants Page - Global Control Plane
 *
 * Cross-tenant overview showing all tenants and their status.
 * PLATFORM-ONLY: No @digilist/* imports allowed.
 */

import {
  Card,
  Heading,
  Paragraph,
  Badge,
  Table,
  Button,
  BuildingIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  UsersIcon,
  DatabaseIcon,
} from '@xalatechnologies/platform/ui';
import { useT } from '@xalatechnologies/platform/i18n';

// Mock data - would be replaced with actual API calls
const MOCK_TENANTS = [
  {
    id: '1',
    name: 'Oslo Kommune',
    domain: 'oslo.digilist.no',
    status: 'active',
    plan: 'Enterprise',
    users: 245,
    organizations: 12,
    rentalObjects: 156,
    storageMb: 4523,
    apiCalls24h: 12450,
    lastActive: '2 min ago',
  },
  {
    id: '2',
    name: 'Bergen Kommune',
    domain: 'bergen.digilist.no',
    status: 'active',
    plan: 'Professional',
    users: 89,
    organizations: 5,
    rentalObjects: 67,
    storageMb: 1256,
    apiCalls24h: 5670,
    lastActive: '5 min ago',
  },
  {
    id: '3',
    name: 'Trondheim Kommune',
    domain: 'trondheim.digilist.no',
    status: 'active',
    plan: 'Professional',
    users: 67,
    organizations: 4,
    rentalObjects: 45,
    storageMb: 890,
    apiCalls24h: 3420,
    lastActive: '8 min ago',
  },
  {
    id: '4',
    name: 'Stavanger Kommune',
    domain: 'stavanger.digilist.no',
    status: 'degraded',
    plan: 'Basic',
    users: 34,
    organizations: 2,
    rentalObjects: 23,
    storageMb: 456,
    apiCalls24h: 1890,
    lastActive: '15 min ago',
  },
  {
    id: '5',
    name: 'Kristiansand Kommune',
    domain: 'kristiansand.digilist.no',
    status: 'active',
    plan: 'Basic',
    users: 28,
    organizations: 2,
    rentalObjects: 19,
    storageMb: 234,
    apiCalls24h: 980,
    lastActive: '22 min ago',
  },
  {
    id: '6',
    name: 'Drammen Kommune',
    domain: 'drammen.digilist.no',
    status: 'inactive',
    plan: 'Trial',
    users: 5,
    organizations: 1,
    rentalObjects: 3,
    storageMb: 45,
    apiCalls24h: 0,
    lastActive: '3 days ago',
  },
];

const MOCK_TENANT_STATS = {
  total: 12,
  active: 10,
  degraded: 1,
  inactive: 1,
  totalUsers: 1245,
  totalStorage: 15.6, // GB
};

export function TenantsPage() {
  const t = useT();

  const getStatusColor = (status: string): 'success' | 'warning' | 'danger' => {
    if (status === 'active') return 'success';
    if (status === 'degraded') return 'warning';
    return 'danger';
  };

  const getPlanColor = (plan: string): 'accent' | 'success' | 'info' | 'warning' => {
    switch (plan) {
      case 'Enterprise': return 'accent';
      case 'Professional': return 'success';
      case 'Basic': return 'info';
      default: return 'warning';
    }
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: 'var(--ds-spacing-8)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--ds-spacing-6)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)', marginBottom: 'var(--ds-spacing-2)' }}>
            <BuildingIcon style={{ color: 'var(--ds-color-accent-text-default)', width: 32, height: 32 }} />
            <Heading level={1} size="lg">
              {t('monitoring.tenants.title')}
            </Heading>
          </div>
          <Paragraph size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
            {t('monitoring.tenants.description')}
          </Paragraph>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 'var(--ds-spacing-4)', marginBottom: 'var(--ds-spacing-6)' }}>
        <Card style={{ padding: 'var(--ds-spacing-4)', textAlign: 'center' }}>
          <Paragraph size="xs" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
            {t('monitoring.tenants.totalTenants')}
          </Paragraph>
          <Heading level={3} size="md" style={{ margin: 'var(--ds-spacing-2) 0 0' }}>
            {MOCK_TENANT_STATS.total}
          </Heading>
        </Card>
        <Card style={{ padding: 'var(--ds-spacing-4)', textAlign: 'center' }}>
          <Paragraph size="xs" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
            {t('monitoring.tenants.activeTenants')}
          </Paragraph>
          <Heading level={3} size="md" style={{ margin: 'var(--ds-spacing-2) 0 0', color: 'var(--ds-color-success-text-default)' }}>
            {MOCK_TENANT_STATS.active}
          </Heading>
        </Card>
        <Card style={{ padding: 'var(--ds-spacing-4)', textAlign: 'center' }}>
          <Paragraph size="xs" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
            {t('monitoring.tenants.degraded')}
          </Paragraph>
          <Heading level={3} size="md" style={{ margin: 'var(--ds-spacing-2) 0 0', color: 'var(--ds-color-warning-text-default)' }}>
            {MOCK_TENANT_STATS.degraded}
          </Heading>
        </Card>
        <Card style={{ padding: 'var(--ds-spacing-4)', textAlign: 'center' }}>
          <Paragraph size="xs" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
            {t('monitoring.tenants.totalUsers')}
          </Paragraph>
          <Heading level={3} size="md" style={{ margin: 'var(--ds-spacing-2) 0 0' }}>
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--ds-spacing-2)' }}>
              <UsersIcon size={20} />
              {MOCK_TENANT_STATS.totalUsers.toLocaleString()}
            </span>
          </Heading>
        </Card>
        <Card style={{ padding: 'var(--ds-spacing-4)', textAlign: 'center' }}>
          <Paragraph size="xs" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
            {t('monitoring.tenants.totalStorage')}
          </Paragraph>
          <Heading level={3} size="md" style={{ margin: 'var(--ds-spacing-2) 0 0' }}>
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--ds-spacing-2)' }}>
              <DatabaseIcon size={20} />
              {MOCK_TENANT_STATS.totalStorage} GB
            </span>
          </Heading>
        </Card>
      </div>

      {/* Tenants Table */}
      <Card style={{ padding: 'var(--ds-spacing-6)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--ds-spacing-4)' }}>
          <Heading level={2} size="sm">
            {t('monitoring.tenants.allTenants')}
          </Heading>
          <Button variant="tertiary" size="sm">
            {t('common.eksporter')}
          </Button>
        </div>

        <Table>
          <Table.Head>
            <Table.Row>
              <Table.HeaderCell>{t('monitoring.tenants.tenant')}</Table.HeaderCell>
              <Table.HeaderCell>{t('monitoring.tenants.status')}</Table.HeaderCell>
              <Table.HeaderCell>{t('monitoring.tenants.plan')}</Table.HeaderCell>
              <Table.HeaderCell>{t('monitoring.tenants.users')}</Table.HeaderCell>
              <Table.HeaderCell>{t('monitoring.tenants.rentalObjects')}</Table.HeaderCell>
              <Table.HeaderCell>{t('monitoring.tenants.storage')}</Table.HeaderCell>
              <Table.HeaderCell>{t('monitoring.tenants.apiCalls')}</Table.HeaderCell>
              <Table.HeaderCell>{t('monitoring.tenants.lastActive')}</Table.HeaderCell>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {MOCK_TENANTS.map((tenant) => (
              <Table.Row key={tenant.id}>
                <Table.Cell>
                  <div>
                    <strong>{tenant.name}</strong>
                    <div style={{ fontSize: 'var(--ds-font-size-xs)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                      {tenant.domain}
                    </div>
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <Badge color={getStatusColor(tenant.status)}>
                    {tenant.status === 'active' ? <CheckCircleIcon /> : <AlertTriangleIcon />}
                    {tenant.status}
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  <Badge color={getPlanColor(tenant.plan)}>
                    {tenant.plan}
                  </Badge>
                </Table.Cell>
                <Table.Cell>{tenant.users.toLocaleString()}</Table.Cell>
                <Table.Cell>{tenant.rentalObjects}</Table.Cell>
                <Table.Cell>{(tenant.storageMb / 1024).toFixed(2)} GB</Table.Cell>
                <Table.Cell>{tenant.apiCalls24h.toLocaleString()}</Table.Cell>
                <Table.Cell>
                  <span style={{ fontSize: 'var(--ds-font-size-xs)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                    {tenant.lastActive}
                  </span>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </Card>

      {/* Usage Distribution */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--ds-spacing-6)', marginTop: 'var(--ds-spacing-6)' }}>
        {/* By Plan */}
        <Card style={{ padding: 'var(--ds-spacing-6)' }}>
          <Heading level={2} size="sm" style={{ marginBottom: 'var(--ds-spacing-4)' }}>
            {t('monitoring.tenants.byPlan')}
          </Heading>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-3)' }}>
            {['Enterprise', 'Professional', 'Basic', 'Trial'].map((plan) => {
              const count = MOCK_TENANTS.filter(t => t.plan === plan).length;
              const percentage = (count / MOCK_TENANTS.length) * 100;
              return (
                <div key={plan}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--ds-spacing-1)' }}>
                    <Badge color={getPlanColor(plan)}>{plan}</Badge>
                    <span style={{ fontSize: 'var(--ds-font-size-sm)' }}>{count} tenants</span>
                  </div>
                  <div style={{ height: 8, backgroundColor: 'var(--ds-color-neutral-surface-subtle)', borderRadius: 4 }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${percentage}%`,
                        backgroundColor: 'var(--ds-color-accent-base-default)',
                        borderRadius: 4,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Top Tenants by Usage */}
        <Card style={{ padding: 'var(--ds-spacing-6)' }}>
          <Heading level={2} size="sm" style={{ marginBottom: 'var(--ds-spacing-4)' }}>
            {t('monitoring.tenants.topByUsage')}
          </Heading>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-3)' }}>
            {MOCK_TENANTS
              .sort((a, b) => b.apiCalls24h - a.apiCalls24h)
              .slice(0, 5)
              .map((tenant, index) => (
                <div
                  key={tenant.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: 'var(--ds-spacing-3)',
                    backgroundColor: 'var(--ds-color-neutral-surface-subtle)',
                    borderRadius: 'var(--ds-border-radius-md)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)' }}>
                    <span style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: 'var(--ds-border-radius-full)',
                      backgroundColor: 'var(--ds-color-accent-surface-default)',
                      color: 'var(--ds-color-accent-text-default)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 'var(--ds-font-size-sm)',
                      fontWeight: 'var(--ds-font-weight-semibold)',
                    }}>
                      {index + 1}
                    </span>
                    <span style={{ fontWeight: 'var(--ds-font-weight-medium)' }}>{tenant.name}</span>
                  </div>
                  <span style={{ fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                    {tenant.apiCalls24h.toLocaleString()} API calls
                  </span>
                </div>
              ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

export default TenantsPage;
