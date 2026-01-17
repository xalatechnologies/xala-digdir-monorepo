/**
 * Plan Detail Page
 * SaaS Admin page for viewing plan details and assigned tenants
 */

import { useParams, Link } from 'react-router-dom';
import {
  Card,
  Heading,
  Paragraph,
  Button,
  Badge,
  Spinner,
  Stack,
  Table,
  ArrowLeftIcon,
  EditIcon,
  CheckCircleIcon,
  XCircleIcon,
  BuildingIcon,
} from '@xala/ds';
import { useSaasPlan, useSaasTenants } from '@digilist/client-sdk/hooks';
import type { PlanStatus, BillingPeriod } from '@digilist/client-sdk/types';
import { useT } from '@xala/i18n';

const statusColors: Record<PlanStatus, 'success' | 'warning' | 'danger'> = {
  active: 'success',
  inactive: 'warning',
  deprecated: 'danger',
};

export function PlanDetailPage() {
  const { id } = useParams<{ id: string }>();
  const t = useT();

  // Queries
  const { data: planData, isLoading, error } = useSaasPlan(id!);
  const plan = planData?.data;

  // Get tenants using this plan
  const { data: tenantsData, isLoading: loadingTenants } = useSaasTenants({ planId: id });
  const tenants = tenantsData?.data ?? [];

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

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('nb-NO', {
      style: 'currency',
      currency,
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

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--ds-spacing-8)' }}>
        <Spinner data-size="lg" aria-label={t('common.loading')} />
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: 'var(--ds-spacing-8)' }}>
        <Heading level={3} data-size="sm">
          {t('saasAdmin.planDetail.notFound', { defaultValue: 'Plan ikke funnet' })}
        </Heading>
        <Link to="/plans">
          <Button variant="secondary" style={{ marginTop: 'var(--ds-spacing-4)' }} type="button">
            <ArrowLeftIcon />
            {t('common.back')}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: 'var(--ds-spacing-8)' }}>
      {/* Back navigation */}
      <Link to="/plans">
        <Button variant="tertiary" data-size="sm" style={{ marginBottom: 'var(--ds-spacing-4)' }} type="button">
          <ArrowLeftIcon />
          {t('common.back')}
        </Button>
      </Link>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--ds-spacing-6)' }}>
        <div>
          <Heading level={1} data-size="lg" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
            {plan.name}
          </Heading>
          <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)', alignItems: 'center' }}>
            <Badge color={statusColors[plan.status]}>{statusLabels[plan.status]}</Badge>
            {plan.isPublic ? (
              <Badge color="success">{t('saasAdmin.plans.public')}</Badge>
            ) : (
              <Badge color="neutral">{t('saasAdmin.plans.internal')}</Badge>
            )}
          </div>
        </div>

        <Link to={`/plans/${id}/edit`}>
          <Button variant="secondary" type="button">
            <EditIcon />
            {t('common.edit')}
          </Button>
        </Link>
      </div>

      {/* Pricing Card */}
      <Card style={{ padding: 'var(--ds-spacing-6)', marginBottom: 'var(--ds-spacing-4)' }}>
        <Heading level={2} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-4)' }}>
          {t('saasAdmin.planCreate.pricing', { defaultValue: 'Prising' })}
        </Heading>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 'var(--ds-spacing-4)' }}>
          <div>
            <Paragraph data-size="xs" style={{ color: 'var(--ds-color-neutral-text-subtle)', marginBottom: 'var(--ds-spacing-1)' }}>
              {t('saasAdmin.plans.price')}
            </Paragraph>
            <Heading level={3} data-size="md">
              {formatPrice(plan.basePrice, plan.currency)}
            </Heading>
          </div>
          <div>
            <Paragraph data-size="xs" style={{ color: 'var(--ds-color-neutral-text-subtle)', marginBottom: 'var(--ds-spacing-1)' }}>
              {t('saasAdmin.plans.interval')}
            </Paragraph>
            <Paragraph data-size="md" style={{ fontWeight: 'var(--ds-font-weight-medium)' }}>
              {billingPeriodLabels[plan.billingPeriod]}
            </Paragraph>
          </div>
          <div>
            <Paragraph data-size="xs" style={{ color: 'var(--ds-color-neutral-text-subtle)', marginBottom: 'var(--ds-spacing-1)' }}>
              {t('saasAdmin.plans.trialPeriod')}
            </Paragraph>
            <Paragraph data-size="md" style={{ fontWeight: 'var(--ds-font-weight-medium)' }}>
              {plan.trialDays > 0 ? `${plan.trialDays} ${t('saasAdmin.plans.days')}` : '—'}
            </Paragraph>
          </div>
          <div>
            <Paragraph data-size="xs" style={{ color: 'var(--ds-color-neutral-text-subtle)', marginBottom: 'var(--ds-spacing-1)' }}>
              {t('saasAdmin.tenants.createdAt')}
            </Paragraph>
            <Paragraph data-size="md" style={{ fontWeight: 'var(--ds-font-weight-medium)' }}>
              {formatDate(plan.createdAt)}
            </Paragraph>
          </div>
        </div>

        {plan.description && (
          <Paragraph style={{ marginTop: 'var(--ds-spacing-4)', color: 'var(--ds-color-neutral-text-subtle)' }}>
            {plan.description}
          </Paragraph>
        )}
      </Card>

      {/* Seat Limits */}
      <Card style={{ padding: 'var(--ds-spacing-6)', marginBottom: 'var(--ds-spacing-4)' }}>
        <Heading level={2} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-4)' }}>
          {t('saasAdmin.tenantCreate.seatLimits', { defaultValue: 'Grenser' })}
        </Heading>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 'var(--ds-spacing-4)' }}>
          <div style={{ padding: 'var(--ds-spacing-3)', backgroundColor: 'var(--ds-color-neutral-surface-subtle)', borderRadius: 'var(--ds-border-radius-md)' }}>
            <Paragraph data-size="xs" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
              {t('saasAdmin.tenantCreate.maxUsers', { defaultValue: 'Brukere' })}
            </Paragraph>
            <Heading level={4} data-size="sm">{plan.seatLimits.maxUsers}</Heading>
          </div>
          <div style={{ padding: 'var(--ds-spacing-3)', backgroundColor: 'var(--ds-color-neutral-surface-subtle)', borderRadius: 'var(--ds-border-radius-md)' }}>
            <Paragraph data-size="xs" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
              {t('saasAdmin.tenantCreate.maxOrganizations', { defaultValue: 'Organisasjoner' })}
            </Paragraph>
            <Heading level={4} data-size="sm">{plan.seatLimits.maxOrganizations}</Heading>
          </div>
          <div style={{ padding: 'var(--ds-spacing-3)', backgroundColor: 'var(--ds-color-neutral-surface-subtle)', borderRadius: 'var(--ds-border-radius-md)' }}>
            <Paragraph data-size="xs" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
              {t('saasAdmin.tenantCreate.maxListings', { defaultValue: 'Leieobjekter' })}
            </Paragraph>
            <Heading level={4} data-size="sm">{plan.seatLimits.maxListings}</Heading>
          </div>
          <div style={{ padding: 'var(--ds-spacing-3)', backgroundColor: 'var(--ds-color-neutral-surface-subtle)', borderRadius: 'var(--ds-border-radius-md)' }}>
            <Paragraph data-size="xs" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
              {t('saasAdmin.tenantCreate.maxBookings', { defaultValue: 'Bookinger/mnd' })}
            </Paragraph>
            <Heading level={4} data-size="sm">{plan.seatLimits.maxBookingsPerMonth}</Heading>
          </div>
          <div style={{ padding: 'var(--ds-spacing-3)', backgroundColor: 'var(--ds-color-neutral-surface-subtle)', borderRadius: 'var(--ds-border-radius-md)' }}>
            <Paragraph data-size="xs" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
              {t('saasAdmin.tenantCreate.maxStorage', { defaultValue: 'Lagring' })}
            </Paragraph>
            <Heading level={4} data-size="sm">{plan.seatLimits.maxStorageMb} MB</Heading>
          </div>
        </div>
      </Card>

      {/* Entitlements */}
      <Card style={{ padding: 'var(--ds-spacing-6)', marginBottom: 'var(--ds-spacing-4)' }}>
        <Heading level={2} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-4)' }}>
          {t('saasAdmin.planCreate.entitlements', { defaultValue: 'Berettigelser' })}
        </Heading>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--ds-spacing-6)' }}>
          {/* Modules */}
          <div>
            <Heading level={3} data-size="xs" style={{ marginBottom: 'var(--ds-spacing-3)' }}>
              {t('saasAdmin.planCreate.modules', { defaultValue: 'Moduler' })}
            </Heading>
            <Stack direction="column" gap={4}>
              {Object.entries(plan.entitlements.modules).map(([key, enabled]) => (
                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
                  {enabled ? (
                    <CheckCircleIcon style={{ color: 'var(--ds-color-success-text-default)' }} />
                  ) : (
                    <XCircleIcon style={{ color: 'var(--ds-color-neutral-text-subtle)' }} />
                  )}
                  <Paragraph data-size="sm" style={{ color: enabled ? undefined : 'var(--ds-color-neutral-text-subtle)' }}>
                    {key}
                  </Paragraph>
                </div>
              ))}
            </Stack>
          </div>

          {/* Integrations */}
          <div>
            <Heading level={3} data-size="xs" style={{ marginBottom: 'var(--ds-spacing-3)' }}>
              {t('saasAdmin.planCreate.integrations', { defaultValue: 'Integrasjoner' })}
            </Heading>
            <Stack direction="column" gap={4}>
              {Object.entries(plan.entitlements.integrations).map(([key, enabled]) => (
                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
                  {enabled ? (
                    <CheckCircleIcon style={{ color: 'var(--ds-color-success-text-default)' }} />
                  ) : (
                    <XCircleIcon style={{ color: 'var(--ds-color-neutral-text-subtle)' }} />
                  )}
                  <Paragraph data-size="sm" style={{ color: enabled ? undefined : 'var(--ds-color-neutral-text-subtle)' }}>
                    {key}
                  </Paragraph>
                </div>
              ))}
            </Stack>
          </div>

          {/* Features */}
          <div>
            <Heading level={3} data-size="xs" style={{ marginBottom: 'var(--ds-spacing-3)' }}>
              {t('saasAdmin.planCreate.features', { defaultValue: 'Funksjoner' })}
            </Heading>
            <Stack direction="column" gap={4}>
              {Object.entries(plan.entitlements.features).map(([key, enabled]) => (
                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
                  {enabled ? (
                    <CheckCircleIcon style={{ color: 'var(--ds-color-success-text-default)' }} />
                  ) : (
                    <XCircleIcon style={{ color: 'var(--ds-color-neutral-text-subtle)' }} />
                  )}
                  <Paragraph data-size="sm" style={{ color: enabled ? undefined : 'var(--ds-color-neutral-text-subtle)' }}>
                    {key}
                  </Paragraph>
                </div>
              ))}
            </Stack>
          </div>
        </div>
      </Card>

      {/* Tenants Using This Plan */}
      <Card style={{ padding: 'var(--ds-spacing-6)' }}>
        <Heading level={2} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-4)' }}>
          {t('saasAdmin.planDetail.tenantsUsingPlan', { defaultValue: 'Tenanter med denne planen' })} ({tenants.length})
        </Heading>

        {loadingTenants ? (
          <Spinner aria-label={t('common.loading')} />
        ) : tenants.length === 0 ? (
          <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
            {t('saasAdmin.planDetail.noTenants', { defaultValue: 'Ingen tenanter bruker denne planen.' })}
          </Paragraph>
        ) : (
          <Table>
            <Table.Head>
              <Table.Row>
                <Table.HeaderCell>{t('common.name')}</Table.HeaderCell>
                <Table.HeaderCell>Slug</Table.HeaderCell>
                <Table.HeaderCell>{t('common.status')}</Table.HeaderCell>
                <Table.HeaderCell>{t('saasAdmin.tenants.createdAt')}</Table.HeaderCell>
              </Table.Row>
            </Table.Head>
            <Table.Body>
              {tenants.map((tenant) => (
                <Table.Row key={tenant.id}>
                  <Table.Cell>
                    <Link to={`/tenants/${tenant.id}`} style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
                      <BuildingIcon />
                      {tenant.name}
                    </Link>
                  </Table.Cell>
                  <Table.Cell>
                    <code style={{ fontSize: 'var(--ds-font-size-sm)' }}>{tenant.slug}</code>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge color={tenant.status === 'active' ? 'success' : tenant.status === 'suspended' ? 'danger' : 'warning'}>
                      {tenant.status}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>{formatDate(tenant.createdAt)}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )}
      </Card>
    </div>
  );
}

export default PlanDetailPage;
