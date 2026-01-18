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
  EmptyState,
  StatusTabs,
  FilterChips,
  DataPageHeader,
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

  // Queries - fetch all statuses for counts
  const { data: tenantsData, isLoading } = useSaasTenants({
    status: statusFilter === 'all' ? undefined : statusFilter,
    search: searchQuery || undefined,
  });
  const tenants = tenantsData?.data ?? [];

  // Fetch counts for each status
  const { data: allTenantsData } = useSaasTenants();
  const { data: activeData } = useSaasTenants({ status: 'active' });
  const { data: inactiveData } = useSaasTenants({ status: 'inactive' });
  const { data: suspendedData } = useSaasTenants({ status: 'suspended' });
  const { data: pendingData } = useSaasTenants({ status: 'pending' });

  // Calculate tab counts
  const tabCounts = useMemo(() => {
    return {
      all: allTenantsData?.meta?.total ?? allTenantsData?.data?.length ?? 0,
      active: activeData?.meta?.total ?? activeData?.data?.length ?? 0,
      inactive: inactiveData?.meta?.total ?? inactiveData?.data?.length ?? 0,
      suspended: suspendedData?.meta?.total ?? suspendedData?.data?.length ?? 0,
      pending: pendingData?.meta?.total ?? pendingData?.data?.length ?? 0,
    };
  }, [allTenantsData, activeData, inactiveData, suspendedData, pendingData]);

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

  // Status tabs configuration
  const statusTabs = useMemo(() => [
    { id: 'all', label: t('common.all'), count: tabCounts.all },
    { id: 'active', label: statusLabels.active, count: tabCounts.active, color: 'success' as const },
    { id: 'inactive', label: statusLabels.inactive, count: tabCounts.inactive, color: 'warning' as const },
    { id: 'suspended', label: statusLabels.suspended, count: tabCounts.suspended, color: 'danger' as const },
    { id: 'pending', label: statusLabels.pending, count: tabCounts.pending, color: 'info' as const },
  ], [tabCounts, statusLabels, t]);

  // Filter chips
  const filterChips = useMemo(() => {
    const chips = [];
    if (statusFilter !== 'all') {
      chips.push({
        key: 'status',
        label: `${t('common.status')}: ${statusLabels[statusFilter]}`,
        onRemove: () => setStatusFilter('all'),
      });
    }
    return chips;
  }, [statusFilter, statusLabels, t]);

  const handleResetFilters = () => {
    setStatusFilter('all');
    setSearchQuery('');
  };

  return (
    <div className={styles.page}>
      {/* Header */}
      <DataPageHeader
        title={t('saasAdmin.tenants.title')}
        count={tenantsData?.meta?.total ?? filteredTenants.length}
        countLabel={`{{count}} ${t('saasAdmin.nav.tenants').toLowerCase()}`}
        actions={
          <Link to="/tenants/new">
            <Button type="button">
              <PlusIcon />
              {t('saasAdmin.tenants.createTenant')}
            </Button>
          </Link>
        }
      />
      {t('saasAdmin.tenants.subtitle') && (
        <Paragraph size="sm" style={{ marginTop: 'var(--ds-spacing-2)', marginBottom: 'var(--ds-spacing-4)' }}>
          {t('saasAdmin.tenants.subtitle')}
        </Paragraph>
      )}

      {/* Status Tabs */}
      <StatusTabs
        tabs={statusTabs}
        activeTab={statusFilter}
        onChange={(tabId) => setStatusFilter(tabId as SaasTenantStatus | 'all')}
        style={{ marginBottom: 'var(--ds-spacing-4)' }}
      />

      {/* Search and Filters */}
      <Card>
        <div className={styles.filters}>
          <div className={styles.searchWrapper}>
            <HeaderSearch
              placeholder={t('saasAdmin.tenants.searchPlaceholder')}
              value={searchQuery}
              onSearchChange={(value) => setSearchQuery(value)}
            />
          </div>
        </div>
      </Card>

      {/* Filter Chips */}
      {filterChips.length > 0 && (
        <FilterChips
          chips={filterChips}
          onResetAll={handleResetFilters}
          resetLabel={t('dataPage.filterChips.resetAll')}
          activeFiltersLabel={t('dataPage.filterChips.activeFilters')}
          style={{ marginBottom: 'var(--ds-spacing-4)' }}
        />
      )}

      {/* Results */}
      <Card>
        {isLoading ? (
          <div className={styles.loadingContainer}>
            <Spinner size="lg" aria-label={t('common.loading')} />
          </div>
        ) : filteredTenants.length === 0 ? (
          <EmptyState
            icon={<BuildingIcon size={48} />}
            title={t('saasAdmin.tenants.noTenants')}
            description={
              searchQuery || statusFilter !== 'all'
                ? t('dataPage.emptyState.tryDifferentFilters')
                : t('saasAdmin.tenants.createFirstTenant')
            }
            action={
              !searchQuery && statusFilter === 'all'
                ? {
                    label: t('saasAdmin.tenants.createTenant'),
                    onClick: () => navigate('/tenants/new'),
                    variant: 'primary' as const,
                  }
                : undefined
            }
            size="md"
            bordered
          />
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
                      <Dropdown.Trigger variant="tertiary" size="sm">
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
                              <Dropdown.Button onClick={() => handleSuspend(tenant)} color="danger">
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
