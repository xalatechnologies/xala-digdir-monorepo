/**
 * Plans List Page
 * SaaS Admin view for listing and managing subscription plans
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
  EditIcon,
  EyeIcon,
  XCircleIcon,
  PlayIcon,
  ChartIcon,
  HeaderSearch,
} from '@xala/ds';
import {
  useSaasPlans,
  useUpdateSaasPlan,
} from '@digilist/client-sdk/hooks';
import type { Plan, PlanStatus, BillingPeriod } from '@digilist/client-sdk/types';
import { useT } from '@xala/i18n';
import styles from './PlansListPage.module.css';

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

  // Queries
  const { data: plansData, isLoading } = useSaasPlans({
    status: statusFilter === 'all' ? undefined : statusFilter,
  });
  const plans = plansData?.data ?? [];

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
      currency: currency,
      minimumFractionDigits: 0,
    }).format(price);
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
            {t('saasAdmin.plans.title')}
          </Heading>
          <Paragraph data-size="sm" className={styles.subtitle}>
            {t('saasAdmin.plans.subtitle')}
          </Paragraph>
        </div>
        <Link to="/plans/new">
          <Button type="button">
            <PlusIcon />
            {t('saasAdmin.plans.createPlan')}
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <div className={styles.filters}>
          <div className={styles.searchWrapper}>
            <HeaderSearch
              placeholder={t('saasAdmin.plans.searchPlaceholder')}
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
                  <Dropdown.Button onClick={() => setStatusFilter('deprecated')}>{t('saasAdmin.plans.deprecated')}</Dropdown.Button>
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
        ) : filteredPlans.length === 0 ? (
          <div className={styles.emptyState}>
            <ChartIcon className={styles.emptyIcon} />
            <Heading level={3} data-size="sm" className={styles.emptyTitle}>
              {t('saasAdmin.plans.noPlans')}
            </Heading>
            <Paragraph data-size="sm" className={styles.emptyDescription}>
              {searchQuery || statusFilter !== 'all'
                ? t('common.tryDifferentSearch')
                : t('saasAdmin.plans.createFirstPlan')}
            </Paragraph>
            {!searchQuery && statusFilter === 'all' && (
              <Link to="/plans/new">
                <Button data-size="sm" className={styles.emptyAction} type="button">
                  <PlusIcon />
                  {t('saasAdmin.plans.createPlan')}
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <Table>
            <Table.Head>
              <Table.Row>
                <Table.HeaderCell>{t('common.name')}</Table.HeaderCell>
                <Table.HeaderCell>{t('saasAdmin.plans.price')}</Table.HeaderCell>
                <Table.HeaderCell>{t('saasAdmin.plans.interval')}</Table.HeaderCell>
                <Table.HeaderCell>{t('saasAdmin.plans.trialPeriod')}</Table.HeaderCell>
                <Table.HeaderCell>{t('saasAdmin.plans.limits')}</Table.HeaderCell>
                <Table.HeaderCell>{t('common.status')}</Table.HeaderCell>
                <Table.HeaderCell>{t('saasAdmin.plans.visibility')}</Table.HeaderCell>
                <Table.HeaderCell>{t('saasAdmin.tenants.createdAt')}</Table.HeaderCell>
                <Table.HeaderCell className={styles.actionsCell}>{t('common.actions')}</Table.HeaderCell>
              </Table.Row>
            </Table.Head>
            <Table.Body>
              {filteredPlans.map((plan) => (
                <Table.Row
                  key={plan.id}
                  className={styles.tableRow}
                  onClick={() => handleViewDetail(plan)}
                >
                  <Table.Cell>
                    <div className={styles.planCell}>
                      <ChartIcon className={styles.planIcon} />
                      <div>
                        <div className={styles.planName}>{plan.name}</div>
                        <div className={styles.planSlug}>{plan.slug}</div>
                      </div>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <div className={styles.priceCell}>
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
                      <span className={styles.seatsSubtle}>—</span>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    <div className={styles.seatsCell}>
                      <div>{t('saasAdmin.plans.users')}: {plan.seatLimits.maxUsers}</div>
                      <div className={styles.seatsSubtle}>
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
                    <div className={styles.dateCell}>{formatDate(plan.createdAt)}</div>
                  </Table.Cell>
                  <Table.Cell onClick={(e) => e.stopPropagation()}>
                    <Dropdown.TriggerContext>
                      <Dropdown.Trigger variant="tertiary" data-size="sm">
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
                              {t('common.edit')}
                            </Dropdown.Button>
                          </Dropdown.Item>
                          {plan.status === 'active' && (
                            <Dropdown.Item>
                              <Dropdown.Button
                                onClick={() => handleStatusChange(plan, 'inactive')}
                                data-color="warning"
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
                                  data-color="danger"
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
        <div className={styles.pagination}>
          <span>
            {t('common.showing')} {filteredPlans.length} {t('common.of')} {plansData.meta.total} {t('saasAdmin.nav.plans').toLowerCase()}
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
