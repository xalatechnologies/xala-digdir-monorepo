/**
 * Plans List Page
 * SaaS Admin view for listing and managing subscription plans
 */

import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Card,
  Paragraph,
  Button,
  Badge,
  Table,
  Dropdown,
  Spinner,
  PlusIcon,
  MoreVerticalIcon,
  EditIcon,
  EyeIcon,
  XCircleIcon,
  PlayIcon,
  ChartIcon,
  HeaderSearch,
  EmptyState,
  StatusTabs,
  FilterChips,
  DataPageHeader,
} from '@xalatechnologies/platform/ui';
import {
  useSaasPlans,
  useUpdateSaasPlan,
  type Plan,
  type PlanStatus,
  type BillingPeriod,
} from '@xalatechnologies/platform/sdk';
import { useT } from '@xalatechnologies/platform/i18n';

const statusColors: Record<PlanStatus, 'success' | 'warning' | 'danger'> = {
  active: 'success',
  inactive: 'warning',
  deprecated: 'danger',
};

export function PlansListPage() {
  const t = useT();

  // Localized labels using i18n
  const statusLabels: Record<PlanStatus, string> = {
    active: t('saasAdmin.tenants.statusActive'),
    inactive: t('status.inactive'),
    deprecated: t('saasAdmin.plans.deprecated'),
  };

  const billingPeriodLabels: Record<BillingPeriod, string> = {
    monthly: t('saasAdmin.plans.monthly'),
    yearly: t('saasAdmin.plans.yearly'),
    lifetime: t('saasAdmin.plans.lifetime'),
  };
  const navigate = useNavigate();

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<PlanStatus | 'all'>('all');

  // Queries - fetch all statuses for counts
  const { data: plansData, isLoading } = useSaasPlans({
    status: statusFilter === 'all' ? undefined : statusFilter,
  });
  const plans = plansData?.data ?? [];

  // Fetch counts for each status
  const { data: allPlansData } = useSaasPlans();
  const { data: activePlansData } = useSaasPlans({ status: 'active' });
  const { data: inactivePlansData } = useSaasPlans({ status: 'inactive' });
  const { data: deprecatedPlansData } = useSaasPlans({ status: 'deprecated' });

  // Calculate tab counts
  const tabCounts = useMemo(() => {
    return {
      all: allPlansData?.meta?.total ?? allPlansData?.data?.length ?? 0,
      active: activePlansData?.meta?.total ?? activePlansData?.data?.length ?? 0,
      inactive: inactivePlansData?.meta?.total ?? inactivePlansData?.data?.length ?? 0,
      deprecated: deprecatedPlansData?.meta?.total ?? deprecatedPlansData?.data?.length ?? 0,
    };
  }, [allPlansData, activePlansData, inactivePlansData, deprecatedPlansData]);

  // Mutations
  const updatePlanMutation = useUpdateSaasPlan();

  // Filter plans by search
  const filteredPlans = useMemo(() => {
    if (!searchQuery) return plans;
    const query = searchQuery.toLowerCase();
    return plans.filter(
      (plan) =>
        plan.name.toLowerCase().includes(query) ||
        plan.slug.toLowerCase().includes(query) ||
        (plan.description && plan.description.toLowerCase().includes(query))
    );
  }, [plans, searchQuery]);

  // Handlers
  const handleStatusChange = async (plan: Plan, newStatus: PlanStatus) => {
    if (newStatus === 'deprecated') {
      if (!confirm(t('saasAdmin.plans.confirmDeprecate'))) {
        return;
      }
    }
    await updatePlanMutation.mutateAsync({
      planId: plan.id,
      data: { status: newStatus },
    });
  };

  const handleViewDetail = (plan: Plan) => {
    navigate(`/plans/${plan.id}`);
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('nb-NO', {
      style: 'currency',
      currency,
    }).format(price);
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
    { id: 'all', label: t('label.all'), count: tabCounts.all },
    { id: 'active', label: statusLabels.active, count: tabCounts.active, color: 'success' as const },
    { id: 'inactive', label: statusLabels.inactive, count: tabCounts.inactive, color: 'warning' as const },
    { id: 'deprecated', label: statusLabels.deprecated, count: tabCounts.deprecated, color: 'danger' as const },
  ], [tabCounts, statusLabels, t]);

  // Filter chips
  const filterChips = useMemo(() => {
    const chips = [];
    if (statusFilter !== 'all') {
      chips.push({
        key: 'status',
        label: `${t('label.status')}: ${statusLabels[statusFilter]}`,
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-5)' }}>
      {/* Header */}
      <DataPageHeader
        title={t('saasAdmin.plans.page.title')}
        count={plansData?.meta?.total ?? filteredPlans.length}
        countLabel={`{{count}} ${t('saasAdmin.nav.plans').toLowerCase()}`}
        actions={
          <Link to="/plans/new">
            <Button type="button">
              <PlusIcon />
              {t('saasAdmin.plans.createPlan')}
            </Button>
          </Link>
        }
      />
      {t('saasAdmin.plans.page.description') && (
        <Paragraph size="sm" style={{ marginTop: 'var(--ds-spacing-2)', marginBottom: 'var(--ds-spacing-4)' }}>
          {t('saasAdmin.plans.page.description')}
        </Paragraph>
      )}

      {/* Status Tabs */}
      <StatusTabs
        tabs={statusTabs}
        activeTab={statusFilter}
        onChange={(tabId) => setStatusFilter(tabId as PlanStatus | 'all')}
        style={{ marginBottom: 'var(--ds-spacing-4)' }}
      />

      {/* Search */}
      <Card>
        <div style={{ display: 'flex', gap: 'var(--ds-spacing-3)', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: '1 1 300px', minWidth: '200px' }}>
            <HeaderSearch
              placeholder={t('saasAdmin.plans.searchPlaceholder')}
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
          <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--ds-spacing-8)' }}>
            <Spinner size="lg" aria-label={t('state.loading')} />
          </div>
        ) : filteredPlans.length === 0 ? (
          <EmptyState
            icon={<ChartIcon size={48} />}
            title={t('saasAdmin.plans.noPlans')}
            description={
              searchQuery || statusFilter !== 'all'
                ? t('dataPage.emptyState.tryDifferentFilters')
                : t('saasAdmin.plans.createFirstPlan')
            }
            action={
              !searchQuery && statusFilter === 'all'
                ? {
                    label: t('saasAdmin.plans.createPlan'),
                    onClick: () => navigate('/plans/new'),
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
                <Table.HeaderCell>{t('label.name')}</Table.HeaderCell>
                <Table.HeaderCell>{t('saasAdmin.plans.price')}</Table.HeaderCell>
                <Table.HeaderCell>{t('saasAdmin.plans.interval')}</Table.HeaderCell>
                <Table.HeaderCell>{t('saasAdmin.plans.trialPeriod')}</Table.HeaderCell>
                <Table.HeaderCell>{t('saasAdmin.plans.limits')}</Table.HeaderCell>
                <Table.HeaderCell>{t('label.status')}</Table.HeaderCell>
                <Table.HeaderCell>{t('saasAdmin.plans.visibility')}</Table.HeaderCell>
                <Table.HeaderCell>{t('saasAdmin.tenants.createdAt')}</Table.HeaderCell>
                <Table.HeaderCell style={{ width: '80px' }}>{t('common.actions')}</Table.HeaderCell>
              </Table.Row>
            </Table.Head>
            <Table.Body>
              {filteredPlans.map((plan) => (
                <Table.Row
                  key={plan.id}
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleViewDetail(plan)}
                >
                  <Table.Cell>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
                      <ChartIcon style={{ color: 'var(--ds-color-neutral-text-subtle)' }} />
                      <div>
                        <div style={{ fontWeight: 'var(--ds-font-weight-medium)' }}>{plan.name}</div>
                        <div style={{ fontFamily: 'var(--ds-font-family-monospace)', fontSize: 'var(--ds-font-size-xs)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                          {plan.slug}
                        </div>
                      </div>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <div style={{ fontWeight: 'var(--ds-font-weight-medium)' }}>
                      {formatPrice(plan.basePrice, plan.currency)}
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge color="neutral">{billingPeriodLabels[plan.billingPeriod]}</Badge>
                  </Table.Cell>
                  <Table.Cell>
                    {plan.trialDays > 0 ? (
                      <span>{plan.trialDays} {t('saasAdmin.plans.days')}</span>
                    ) : (
                      <span style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>—</span>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    <div style={{ fontSize: 'var(--ds-font-size-sm)' }}>
                      <div>{t('saasAdmin.plans.users')}: {plan.seatLimits.maxUsers}</div>
                      <div style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                        {t('saasAdmin.plans.orgs')}: {plan.seatLimits.maxOrganizations}
                      </div>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge color={statusColors[plan.status]}>{statusLabels[plan.status]}</Badge>
                  </Table.Cell>
                  <Table.Cell>
                    {plan.isPublic ? (
                      <Badge color="success">{t('saasAdmin.plans.public')}</Badge>
                    ) : (
                      <Badge color="neutral">{t('saasAdmin.plans.internal')}</Badge>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    <div style={{ fontSize: 'var(--ds-font-size-sm)' }}>{formatDate(plan.createdAt)}</div>
                  </Table.Cell>
                  <Table.Cell onClick={(e) => e.stopPropagation()}>
                    <Dropdown.TriggerContext>
                      <Dropdown.Trigger variant="tertiary" size="sm">
                        <MoreVerticalIcon />
                      </Dropdown.Trigger>
                      <Dropdown>
                        <Dropdown.List>
                          <Dropdown.Item>
                            <Dropdown.Button onClick={() => handleViewDetail(plan)}>
                              <EyeIcon />
                              {t('saasAdmin.tenants.viewDetails')}
                            </Dropdown.Button>
                          </Dropdown.Item>
                          <Dropdown.Item>
                            <Dropdown.Button onClick={() => navigate(`/plans/${plan.id}/edit`)}>
                              <EditIcon />
                              {t('action.edit')}
                            </Dropdown.Button>
                          </Dropdown.Item>
                          {plan.status === 'active' && (
                            <Dropdown.Item>
                              <Dropdown.Button
                                onClick={() => handleStatusChange(plan, 'inactive')}
                                color="warning"
                              >
                                <XCircleIcon />
                                {t('saasAdmin.plans.deactivate')}
                              </Dropdown.Button>
                            </Dropdown.Item>
                          )}
                          {plan.status === 'inactive' && (
                            <>
                              <Dropdown.Item>
                                <Dropdown.Button onClick={() => handleStatusChange(plan, 'active')}>
                                  <PlayIcon />
                                  {t('saasAdmin.tenants.activateTenant')}
                                </Dropdown.Button>
                              </Dropdown.Item>
                              <Dropdown.Item>
                                <Dropdown.Button
                                  onClick={() => handleStatusChange(plan, 'deprecated')}
                                  color="danger"
                                >
                                  <XCircleIcon />
                                  {t('saasAdmin.plans.markDeprecated')}
                                </Dropdown.Button>
                              </Dropdown.Item>
                            </>
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
      {plansData?.meta && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            color: 'var(--ds-color-neutral-text-subtle)',
            fontSize: 'var(--ds-font-size-sm)',
          }}
        >
          <span>
            {t('pagination.showing')} {filteredPlans.length} {t('common.of')} {plansData.meta.total} {t('saasAdmin.nav.plans').toLowerCase()}
          </span>
          <span>
            {t('common.page')} {plansData.meta.page} {t('common.of')} {plansData.meta.totalPages}
          </span>
        </div>
      )}
    </div>
  );
}

export default PlansListPage;
