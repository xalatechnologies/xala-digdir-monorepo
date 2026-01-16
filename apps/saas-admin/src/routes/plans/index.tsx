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

const statusLabels: Record<PlanStatus, string> = {
  active: 'Aktiv',
  inactive: 'Inaktiv',
  deprecated: 'Utgått',
};

const statusColors: Record<PlanStatus, 'success' | 'warning' | 'danger'> = {
  active: 'success',
  inactive: 'warning',
  deprecated: 'danger',
};

const billingPeriodLabels: Record<BillingPeriod, string> = {
  monthly: 'Månedlig',
  yearly: 'Årlig',
  lifetime: 'Livstid',
};

export function PlansListPage() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const t = useT();
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
      if (!confirm(`Er du sikker på at du vil merke ${plan.name} som utgått? Dette kan ikke reverseres.`)) {
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-5)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Heading level={2} data-size="md">
            Abonnementsplaner
          </Heading>
          <Paragraph
            data-size="sm"
            style={{ color: 'var(--ds-color-neutral-text-subtle)', marginTop: 'var(--ds-spacing-1)' }}
          >
            Administrer abonnementsplaner, priser og rettigheter
          </Paragraph>
        </div>
        <Link to="/plans/new">
          <Button type="button">
            <PlusIcon />
            Ny plan
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <div style={{ display: 'flex', gap: 'var(--ds-spacing-3)', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: '1 1 300px', minWidth: '200px' }}>
            <HeaderSearch
              placeholder="Søk etter plan..."
              value={searchQuery}
              onSearchChange={(value) => setSearchQuery(value)}
            />
          </div>

          <Dropdown.TriggerContext>
            <Dropdown.Trigger variant="secondary" data-size="sm">
              <FilterIcon />
              Status: {statusFilter === 'all' ? 'Alle' : statusLabels[statusFilter]}
            </Dropdown.Trigger>
            <Dropdown>
              <Dropdown.List>
                <Dropdown.Item>
                  <Dropdown.Button onClick={() => setStatusFilter('all')}>Alle</Dropdown.Button>
                </Dropdown.Item>
                <Dropdown.Item>
                  <Dropdown.Button onClick={() => setStatusFilter('active')}>Aktiv</Dropdown.Button>
                </Dropdown.Item>
                <Dropdown.Item>
                  <Dropdown.Button onClick={() => setStatusFilter('inactive')}>Inaktiv</Dropdown.Button>
                </Dropdown.Item>
                <Dropdown.Item>
                  <Dropdown.Button onClick={() => setStatusFilter('deprecated')}>Utgått</Dropdown.Button>
                </Dropdown.Item>
              </Dropdown.List>
            </Dropdown>
          </Dropdown.TriggerContext>
        </div>
      </Card>

      {/* Results */}
      <Card>
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--ds-spacing-8)' }}>
            <Spinner data-size="lg" aria-label="Laster..." />
          </div>
        ) : filteredPlans.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--ds-spacing-8)' }}>
            <ChartIcon
              style={{
                fontSize: 'var(--ds-font-size-heading-lg)',
                color: 'var(--ds-color-neutral-text-subtle)',
                marginBottom: 'var(--ds-spacing-3)',
              }}
            />
            <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
              Ingen planer funnet
            </Heading>
            <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
              {searchQuery || statusFilter !== 'all'
                ? 'Prøv å endre søkekriteriene'
                : 'Opprett din første abonnementsplan for å komme i gang'}
            </Paragraph>
            {!searchQuery && statusFilter === 'all' && (
              <Link to="/plans/new">
                <Button data-size="sm" style={{ marginTop: 'var(--ds-spacing-4)' }} type="button">
                  <PlusIcon />
                  Ny plan
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <Table>
            <Table.Head>
              <Table.Row>
                <Table.HeaderCell>{t('common.name')}</Table.HeaderCell>
                <Table.HeaderCell>Pris</Table.HeaderCell>
                <Table.HeaderCell>Fakturering</Table.HeaderCell>
                <Table.HeaderCell>Prøveperiode</Table.HeaderCell>
                <Table.HeaderCell>Seter</Table.HeaderCell>
                <Table.HeaderCell>{t('common.status')}</Table.HeaderCell>
                <Table.HeaderCell>Synlighet</Table.HeaderCell>
                <Table.HeaderCell>Opprettet</Table.HeaderCell>
                <Table.HeaderCell style={{ width: '80px' }}>Handlinger</Table.HeaderCell>
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
                        <div
                          style={{
                            fontFamily: 'var(--ds-font-family-monospace)',
                            fontSize: 'var(--ds-font-size-xs)',
                            color: 'var(--ds-color-neutral-text-subtle)',
                          }}
                        >
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
                      <span>{plan.trialDays} dager</span>
                    ) : (
                      <span style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>—</span>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    <div style={{ fontSize: 'var(--ds-font-size-sm)' }}>
                      <div>Brukere: {plan.seatLimits.maxUsers}</div>
                      <div style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                        Org: {plan.seatLimits.maxOrganizations}
                      </div>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge color={statusColors[plan.status]}>{statusLabels[plan.status]}</Badge>
                  </Table.Cell>
                  <Table.Cell>
                    {plan.isPublic ? (
                      <Badge color="success">Offentlig</Badge>
                    ) : (
                      <Badge color="neutral">Intern</Badge>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    <div style={{ fontSize: 'var(--ds-font-size-sm)' }}>{formatDate(plan.createdAt)}</div>
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
                              Vis detaljer
                            </Dropdown.Button>
                          </Dropdown.Item>
                          <Dropdown.Item>
                            <Dropdown.Button onClick={() => navigate(`/plans/${plan.id}/edit`)}>
                              <EditIcon />
                              Rediger
                            </Dropdown.Button>
                          </Dropdown.Item>
                          {plan.status === 'active' && (
                            <Dropdown.Item>
                              <Dropdown.Button
                                onClick={() => handleStatusChange(plan, 'inactive')}
                                data-color="warning"
                              >
                                <XCircleIcon />
                                Deaktiver
                              </Dropdown.Button>
                            </Dropdown.Item>
                          )}
                          {plan.status === 'inactive' && (
                            <>
                              <Dropdown.Item>
                                <Dropdown.Button onClick={() => handleStatusChange(plan, 'active')}>
                                  <PlayIcon />
                                  Aktiver
                                </Dropdown.Button>
                              </Dropdown.Item>
                              <Dropdown.Item>
                                <Dropdown.Button
                                  onClick={() => handleStatusChange(plan, 'deprecated')}
                                  data-color="danger"
                                >
                                  <XCircleIcon />
                                  Merk som utgått
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
            Viser {filteredPlans.length} av {plansData.meta.total} planer
          </span>
          <span>
            Side {plansData.meta.page} av {plansData.meta.totalPages}
          </span>
        </div>
      )}
    </div>
  );
}

export default PlansListPage;
