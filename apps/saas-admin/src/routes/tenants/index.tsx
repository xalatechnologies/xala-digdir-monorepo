/**
 * Tenants List Page
 * SaaS Admin view for listing and managing tenants
 */

import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Card,
  Heading,
  Paragraph,
  Button,
  Badge,
  Table,
  Dropdown,
  Spinner,
  PlusIcon,
  MoreVerticalIcon,
  FilterIcon,
  CheckCircleIcon,
  XCircleIcon,
  BuildingIcon,
  EditIcon,
  EyeIcon,
  PlayIcon,
  PauseIcon,
  HeaderSearch,
} from '@xala/ds';
import {
  useSaasTenants,
  useSuspendSaasTenant,
  useReactivateSaasTenant,
} from '@digilist/client-sdk/hooks';
import type { SaasTenant, SaasTenantStatus } from '@digilist/client-sdk/types';
import { useT } from '@xala/i18n';
import styles from './TenantsListPage.module.css';

const statusColors: Record<SaasTenantStatus, 'success' | 'warning' | 'danger' | 'info'> = {
  active: 'success',
  inactive: 'warning',
  suspended: 'danger',
  pending: 'info',
};

export function TenantsListPage() {
  const t = useT();

  // Status labels using i18n
  const statusLabels: Record<SaasTenantStatus, string> = {
    active: t('saasAdmin.tenants.statusActive'),
    inactive: t('status.inactive'),
    suspended: t('saasAdmin.tenants.statusSuspended'),
    pending: t('saasAdmin.tenants.statusPending'),
  };
  const navigate = useNavigate();

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<SaasTenantStatus | 'all'>('all');

  // Queries
  const { data: tenantsData, isLoading } = useSaasTenants({
    status: statusFilter === 'all' ? undefined : statusFilter,
    search: searchQuery || undefined,
  });
  const tenants = tenantsData?.data ?? [];

  // Mutations
  const suspendMutation = useSuspendSaasTenant();
  const reactivateMutation = useReactivateSaasTenant();

  // Filter tenants by search if needed (in case API doesn't support it)
  const filteredTenants = useMemo(() => {
    if (!searchQuery) return tenants;
    const query = searchQuery.toLowerCase();
    return tenants.filter(
      (tenant) =>
        tenant.name.toLowerCase().includes(query) ||
        tenant.slug.toLowerCase().includes(query) ||
        (tenant.domain && tenant.domain.toLowerCase().includes(query))
    );
  }, [tenants, searchQuery]);

  // Handlers
  const handleSuspend = async (tenant: SaasTenant) => {
    if (confirm(t('saasAdmin.tenants.confirmSuspend'))) {
      await suspendMutation.mutateAsync({
        tenantId: tenant.id,
        data: { reason: 'Suspended by SaaS Admin', notifyAdmins: true },
      });
    }
  };

  const handleReactivate = async (tenant: SaasTenant) => {
    await reactivateMutation.mutateAsync(tenant.id);
  };

  const handleViewDetail = (tenant: SaasTenant) => {
    navigate(`/tenants/${tenant.id}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nb-NO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <Heading level={2} data-size="md">
            {t('saasAdmin.tenants.title')}
          </Heading>
          <Paragraph data-size="sm" className={styles.subtitle}>
            {t('saasAdmin.tenants.subtitle')}
          </Paragraph>
        </div>
        <Link to="/tenants/new">
          <Button type="button">
            <PlusIcon />
            {t('saasAdmin.tenants.createTenant')}
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <div className={styles.filters}>
          <div className={styles.searchWrapper}>
            <HeaderSearch
              placeholder={t('saasAdmin.tenants.searchPlaceholder')}
              value={searchQuery}
              onSearchChange={(value) => setSearchQuery(value)}
            />
          </div>

          <Dropdown.TriggerContext>
            <Dropdown.Trigger variant="secondary" data-size="sm">
              <FilterIcon />
              {t('common.status')}: {statusFilter === 'all' ? t('common.all') : statusLabels[statusFilter]}
            </Dropdown.Trigger>
            <Dropdown>
              <Dropdown.List>
                <Dropdown.Item>
                  <Dropdown.Button onClick={() => setStatusFilter('all')}>{t('common.all')}</Dropdown.Button>
                </Dropdown.Item>
                <Dropdown.Item>
                  <Dropdown.Button onClick={() => setStatusFilter('active')}>{t('saasAdmin.tenants.statusActive')}</Dropdown.Button>
                </Dropdown.Item>
                <Dropdown.Item>
                  <Dropdown.Button onClick={() => setStatusFilter('inactive')}>{t('status.inactive')}</Dropdown.Button>
                </Dropdown.Item>
                <Dropdown.Item>
                  <Dropdown.Button onClick={() => setStatusFilter('suspended')}>{t('saasAdmin.tenants.statusSuspended')}</Dropdown.Button>
                </Dropdown.Item>
                <Dropdown.Item>
                  <Dropdown.Button onClick={() => setStatusFilter('pending')}>{t('saasAdmin.tenants.statusPending')}</Dropdown.Button>
                </Dropdown.Item>
              </Dropdown.List>
            </Dropdown>
          </Dropdown.TriggerContext>
        </div>
      </Card>

      {/* Results */}
      <Card>
        {isLoading ? (
          <div className={styles.loadingContainer}>
            <Spinner data-size="lg" aria-label={t('common.loading')} />
          </div>
        ) : filteredTenants.length === 0 ? (
          <div className={styles.emptyState}>
            <BuildingIcon className={styles.emptyIcon} />
            <Heading level={3} data-size="sm" className={styles.emptyTitle}>
              {t('saasAdmin.tenants.noTenants')}
            </Heading>
            <Paragraph data-size="sm" className={styles.emptyDescription}>
              {searchQuery || statusFilter !== 'all'
                ? t('common.tryDifferentSearch')
                : t('saasAdmin.tenants.createFirstTenant')}
            </Paragraph>
            {!searchQuery && statusFilter === 'all' && (
              <Link to="/tenants/new">
                <Button data-size="sm" className={styles.emptyAction} type="button">
                  <PlusIcon />
                  {t('saasAdmin.tenants.createTenant')}
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <Table>
            <Table.Head>
              <Table.Row>
                <Table.HeaderCell>{t('common.name')}</Table.HeaderCell>
                <Table.HeaderCell>Slug</Table.HeaderCell>
                <Table.HeaderCell>{t('saasAdmin.tenants.domain')}</Table.HeaderCell>
                <Table.HeaderCell>{t('saasAdmin.tenants.plan')}</Table.HeaderCell>
                <Table.HeaderCell>{t('common.status')}</Table.HeaderCell>
                <Table.HeaderCell>{t('saasAdmin.tenants.createdAt')}</Table.HeaderCell>
                <Table.HeaderCell className={styles.actionsCell}>{t('common.actions')}</Table.HeaderCell>
              </Table.Row>
            </Table.Head>
            <Table.Body>
              {filteredTenants.map((tenant) => (
                <Table.Row
                  key={tenant.id}
                  className={styles.tableRow}
                  onClick={() => handleViewDetail(tenant)}
                >
                  <Table.Cell>
                    <div className={styles.tenantCell}>
                      <BuildingIcon className={styles.tenantIcon} />
                      <div className={styles.tenantName}>{tenant.name}</div>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <div className={styles.slugCell}>{tenant.slug}</div>
                  </Table.Cell>
                  <Table.Cell>
                    {tenant.domain ? (
                      <div className={styles.domainCell}>{tenant.domain}</div>
                    ) : (
                      <span className={styles.domainEmpty}>—</span>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    {tenant.subscriptionPlanName ? (
                      <Badge color="info">{tenant.subscriptionPlanName}</Badge>
                    ) : (
                      <Badge color="neutral">{t('saasAdmin.tenants.noPlan')}</Badge>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    <Badge color={statusColors[tenant.status]}>{statusLabels[tenant.status]}</Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <div className={styles.dateCell}>{formatDate(tenant.createdAt)}</div>
                  </Table.Cell>
                  <Table.Cell onClick={(e) => e.stopPropagation()}>
                    <Dropdown.TriggerContext>
                      <Dropdown.Trigger variant="tertiary" data-size="sm">
                        <MoreVerticalIcon />
                      </Dropdown.Trigger>
                      <Dropdown>
                        <Dropdown.List>
                          <Dropdown.Item>
                            <Dropdown.Button onClick={() => handleViewDetail(tenant)}>
                              <EyeIcon />
                              {t('saasAdmin.tenants.viewDetails')}
                            </Dropdown.Button>
                          </Dropdown.Item>
                          <Dropdown.Item>
                            <Dropdown.Button onClick={() => navigate(`/tenants/${tenant.id}/edit`)}>
                              <EditIcon />
                              {t('common.edit')}
                            </Dropdown.Button>
                          </Dropdown.Item>
                          {tenant.status === 'active' && (
                            <Dropdown.Item>
                              <Dropdown.Button onClick={() => handleSuspend(tenant)} data-color="danger">
                                <PauseIcon />
                                {t('saasAdmin.tenants.suspendTenant')}
                              </Dropdown.Button>
                            </Dropdown.Item>
                          )}
                          {tenant.status === 'suspended' && (
                            <Dropdown.Item>
                              <Dropdown.Button onClick={() => handleReactivate(tenant)}>
                                <PlayIcon />
                                {t('saasAdmin.tenants.activateTenant')}
                              </Dropdown.Button>
                            </Dropdown.Item>
                          )}
                          {tenant.licenseKeyFingerprint ? (
                            <Dropdown.Item>
                              <Dropdown.Button onClick={() => navigate(`/tenants/${tenant.id}/license`)}>
                                <CheckCircleIcon />
                                {t('saasAdmin.tenantDetail.licenseKey')}
                              </Dropdown.Button>
                            </Dropdown.Item>
                          ) : (
                            <Dropdown.Item>
                              <Dropdown.Button onClick={() => navigate(`/tenants/${tenant.id}/license`)}>
                                <XCircleIcon />
                                {t('saasAdmin.tenantDetail.createLicense')}
                              </Dropdown.Button>
                            </Dropdown.Item>
                          )}
                        </Dropdown.List>
                      </Dropdown>
                    </Dropdown.TriggerContext>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )}
      </Card>

      {/* Pagination info */}
      {tenantsData?.meta && (
        <div className={styles.pagination}>
          <span>
            {t('common.showing')} {filteredTenants.length} {t('common.of')} {tenantsData.meta.total} {t('saasAdmin.nav.tenants').toLowerCase()}
          </span>
          <span>
            {t('common.page')} {tenantsData.meta.page} {t('common.of')} {tenantsData.meta.totalPages}
          </span>
        </div>
      )}
    </div>
  );
}

export default TenantsListPage;
