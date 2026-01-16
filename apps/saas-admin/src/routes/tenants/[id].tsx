/**
 * Tenant Detail Page
 * SaaS Admin view for managing a single tenant with feature flags editor
 */

/* eslint-disable digdir/prefer-ds-components, digdir/no-hardcoded-typography -- Complex detail page */

import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Card,
  Heading,
  Paragraph,
  Button,
  Badge,
  Spinner,
  Stack,
  Tabs,
  Switch,
  Table,
  StatCard,
  formatTimeAgo,
  ArrowLeftIcon,
  EditIcon,
  PlayIcon,
  PauseIcon,
  RefreshCwIcon,
  KeyIcon,
  UsersIcon,
  BuildingIcon,
  CalendarIcon,
  DatabaseIcon,
  ShieldCheckIcon,
  ToggleLeftIcon,
  CreditCardIcon,
  LockIcon,
  ClockIcon,
} from '@xala/ds';
import {
  useSaasTenant,
  useSaasTenantFlags,
  useSaasFeatureFlagsCatalog,
  useSaasTenantBilling,
  useSaasTenantSecrets,
  useUpdateSaasTenantFlags,
  useSuspendSaasTenant,
  useReactivateSaasTenant,
  useRotateSaasLicenseKey,
} from '@digilist/client-sdk/hooks';
import type {
  SaasTenantStatus,
  FeatureFlagCategory,
} from '@digilist/client-sdk/types';
import { useT } from '@xala/i18n';

const statusColors: Record<SaasTenantStatus, 'success' | 'warning' | 'danger' | 'info'> = {
  active: 'success',
  inactive: 'warning',
  suspended: 'danger',
  pending: 'info',
};

const categoryColors: Record<FeatureFlagCategory, 'info' | 'success' | 'warning'> = {
  module: 'info',
  integration: 'success',
  policy: 'warning',
};

export function TenantDetailPage() {
  const t = useT();
  const { id } = useParams<{ id: string }>();

  // State for license key display (only shown once after rotation)
  const [newLicenseKey, setNewLicenseKey] = useState<string | null>(null);

  // Queries
  const { data: tenantData, isLoading } = useSaasTenant(id!);
  const tenant = tenantData?.data;

  const { data: flagsData, isLoading: loadingFlags } = useSaasTenantFlags(id!);
  const tenantFlags = flagsData?.data ?? [];

  const { data: catalogData } = useSaasFeatureFlagsCatalog();
  const flagsCatalog = catalogData?.data ?? [];

  const { data: billingData, isLoading: loadingBilling } = useSaasTenantBilling(id!);
  const billing = billingData?.data;

  const { data: secretsData, isLoading: loadingSecrets } = useSaasTenantSecrets(id!);
  const secrets = secretsData?.data ?? [];

  // Mutations
  const suspendMutation = useSuspendSaasTenant();
  const reactivateMutation = useReactivateSaasTenant();
  const updateFlagsMutation = useUpdateSaasTenantFlags();
  const rotateLicenseMutation = useRotateSaasLicenseKey();

  // Combine catalog with tenant overrides
  const flagsWithStatus = useMemo(() => {
    const tenantFlagsMap = new Map(tenantFlags.map((f) => [f.flagKey, f]));

    return flagsCatalog.map((catalogItem) => {
      const tenantFlag = tenantFlagsMap.get(catalogItem.key);
      return {
        ...catalogItem,
        enabled: tenantFlag?.enabled ?? (catalogItem.defaultValue as boolean),
        value: tenantFlag?.value ?? catalogItem.defaultValue,
        overridden: !!tenantFlag,
        reason: tenantFlag?.reason,
        updatedAt: tenantFlag?.updatedAt,
        updatedBy: tenantFlag?.updatedBy,
      };
    });
  }, [flagsCatalog, tenantFlags]);

  // Group flags by category
  const flagsByCategory = useMemo(() => {
    const grouped: Record<FeatureFlagCategory, typeof flagsWithStatus> = {
      module: [],
      integration: [],
      policy: [],
    };

    flagsWithStatus.forEach((flag) => {
      if (grouped[flag.category]) {
        grouped[flag.category].push(flag);
      }
    });

    return grouped;
  }, [flagsWithStatus]);

  // Handlers
  const handleSuspend = async () => {
    if (confirm(t('saasAdmin.tenantDetail.confirmSuspend'))) {
      await suspendMutation.mutateAsync({
        tenantId: id!,
        data: { reason: 'Suspended by SaaS Admin', notifyAdmins: true },
      });
    }
  };

  const handleReactivate = async () => {
    await reactivateMutation.mutateAsync(id!);
  };

  const handleToggleFlag = async (flagKey: string, currentEnabled: boolean) => {
    await updateFlagsMutation.mutateAsync({
      tenantId: id!,
      data: {
        flags: {
          [flagKey]: {
            value: !currentEnabled,
            enabled: !currentEnabled,
            reason: `Toggled by SaaS Admin`,
          },
        },
      },
    });
  };

  const handleRotateLicense = async () => {
    if (confirm(t('saasAdmin.tenantDetail.confirmRotateLicense'))) {
      const result = await rotateLicenseMutation.mutateAsync(id!);
      setNewLicenseKey(result.data.licenseKey);
    }
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
        <Spinner data-size="lg" aria-label={t('saasAdmin.tenantDetail.loading')} />
      </div>
    );
  }

  if (!tenant) {
    return (
      <div style={{ textAlign: 'center', padding: 'var(--ds-spacing-8)' }}>
        <Heading level={3} data-size="sm">
          {t('saasAdmin.tenantDetail.notFound')}
        </Heading>
        <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', marginTop: 'var(--ds-spacing-2)' }}>
          {t('saasAdmin.tenantDetail.notFoundDescription')}
        </Paragraph>
        <Link to="/tenants">
          <Button variant="secondary" data-size="sm" style={{ marginTop: 'var(--ds-spacing-4)' }} type="button">
            <ArrowLeftIcon />
            {t('saasAdmin.tenantDetail.backToList')}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-5)', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div>
        <Link to="/tenants">
          <Button variant="tertiary" data-size="sm" style={{ marginBottom: 'var(--ds-spacing-3)' }} type="button">
            <ArrowLeftIcon />
            {t('saasAdmin.tenantDetail.backToList')}
          </Button>
        </Link>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--ds-spacing-4)' }}>
          <div>
            <Heading level={2} data-size="lg" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
              {tenant.name}
            </Heading>
            <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)', flexWrap: 'wrap', marginBottom: 'var(--ds-spacing-2)' }}>
              <Badge color={statusColors[tenant.status]}>{t(`saasAdmin.tenantDetail.status.${tenant.status}`)}</Badge>
              {tenant.subscriptionPlanName && <Badge color="info">{tenant.subscriptionPlanName}</Badge>}
              {tenant.licenseKeyFingerprint && (
                <Badge color="success">
                  <KeyIcon /> {t('saasAdmin.tenantDetail.licensed')}
                </Badge>
              )}
            </div>
            <div style={{ display: 'flex', gap: 'var(--ds-spacing-4)', color: 'var(--ds-color-neutral-text-subtle)', fontSize: 'var(--ds-font-size-sm)' }}>
              <div>
                <strong>{t('saasAdmin.tenantDetail.slug')}:</strong>{' '}
                <span style={{ fontFamily: 'var(--ds-font-family-monospace)' }}>{tenant.slug}</span>
              </div>
              {tenant.domain && (
                <div>
                  <strong>{t('saasAdmin.tenantDetail.domain')}:</strong> {tenant.domain}
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)' }}>
            <Link to={`/tenants/${id}/edit`}>
              <Button variant="secondary" data-size="sm" type="button">
                <EditIcon />
                {t('saasAdmin.tenantDetail.edit')}
              </Button>
            </Link>
            {tenant.status === 'active' && (
              <Button variant="danger" data-size="sm" onClick={handleSuspend} type="button">
                <PauseIcon />
                {t('saasAdmin.tenantDetail.suspend')}
              </Button>
            )}
            {tenant.status === 'suspended' && (
              <Button variant="primary" data-size="sm" onClick={handleReactivate} type="button">
                <PlayIcon />
                {t('saasAdmin.tenantDetail.reactivate')}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Usage Statistics Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 'var(--ds-spacing-3)',
        }}
      >
        <StatCard
          title={t('saasAdmin.tenantDetail.stats.users')}
          value={`${tenant.usage.usersCount} / ${tenant.seatLimits.maxUsers}`}
          description={`${Math.round((tenant.usage.usersCount / tenant.seatLimits.maxUsers) * 100)}%`}
          color="var(--ds-color-info-text-default)"
          icon={<UsersIcon />}
        />
        <StatCard
          title={t('saasAdmin.tenantDetail.stats.organizations')}
          value={`${tenant.usage.organizationsCount} / ${tenant.seatLimits.maxOrganizations}`}
          description={`${Math.round((tenant.usage.organizationsCount / tenant.seatLimits.maxOrganizations) * 100)}%`}
          color="var(--ds-color-success-text-default)"
          icon={<BuildingIcon />}
        />
        <StatCard
          title={t('saasAdmin.tenantDetail.stats.listings')}
          value={`${tenant.usage.listingsCount} / ${tenant.seatLimits.maxListings}`}
          description={`${Math.round((tenant.usage.listingsCount / tenant.seatLimits.maxListings) * 100)}%`}
          color="var(--ds-color-warning-text-default)"
          icon={<CalendarIcon />}
        />
        <StatCard
          title={t('saasAdmin.tenantDetail.stats.bookingsThisMonth')}
          value={`${tenant.usage.bookingsThisMonth} / ${tenant.seatLimits.maxBookingsPerMonth}`}
          description={`${Math.round((tenant.usage.bookingsThisMonth / tenant.seatLimits.maxBookingsPerMonth) * 100)}%`}
          color="var(--ds-color-accent-text-default)"
          icon={<CalendarIcon />}
        />
        <StatCard
          title={t('saasAdmin.tenantDetail.stats.storage')}
          value={`${tenant.usage.storageMb} / ${tenant.seatLimits.maxStorageMb} MB`}
          description={`${Math.round((tenant.usage.storageMb / tenant.seatLimits.maxStorageMb) * 100)}%`}
          color="var(--ds-color-neutral-text-default)"
          icon={<DatabaseIcon />}
        />
      </div>

      {/* New License Key Alert */}
      {newLicenseKey && (
        <Card style={{ backgroundColor: 'var(--ds-color-success-surface-default)', padding: 'var(--ds-spacing-4)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Heading level={4} data-size="xs" style={{ marginBottom: 'var(--ds-spacing-1)' }}>
                {t('saasAdmin.tenantDetail.newLicenseGenerated')}
              </Heading>
              <Paragraph data-size="sm" style={{ color: 'var(--ds-color-success-text-default)', marginBottom: 'var(--ds-spacing-2)' }}>
                {t('saasAdmin.tenantDetail.copyLicenseNow')}
              </Paragraph>
              <code
                style={{
                  display: 'block',
                  padding: 'var(--ds-spacing-2)',
                  backgroundColor: 'var(--ds-color-neutral-surface-default)',
                  borderRadius: 'var(--ds-border-radius-sm)',
                  fontFamily: 'var(--ds-font-family-monospace)',
                  fontSize: 'var(--ds-font-size-sm)',
                  wordBreak: 'break-all',
                }}
              >
                {newLicenseKey}
              </code>
            </div>
            <Button
              variant="secondary"
              data-size="sm"
              onClick={() => setNewLicenseKey(null)}
              type="button"
            >
              {t('saasAdmin.tenantDetail.close')}
            </Button>
          </div>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <Tabs.List>
          <Tabs.Tab value="overview">
            <ShieldCheckIcon />
            {t('saasAdmin.tenantDetail.tabs.overview')}
          </Tabs.Tab>
          <Tabs.Tab value="flags">
            <ToggleLeftIcon />
            {t('saasAdmin.tenantDetail.tabs.flags')} ({flagsWithStatus.length})
          </Tabs.Tab>
          <Tabs.Tab value="billing">
            <CreditCardIcon />
            {t('saasAdmin.tenantDetail.tabs.billing')}
          </Tabs.Tab>
          <Tabs.Tab value="secrets">
            <LockIcon />
            {t('saasAdmin.tenantDetail.tabs.secrets')} ({secrets.length})
          </Tabs.Tab>
          <Tabs.Tab value="license">
            <KeyIcon />
            {t('saasAdmin.tenantDetail.tabs.license')}
          </Tabs.Tab>
        </Tabs.List>

        {/* Overview Tab */}
        <Tabs.Panel value="overview">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 'var(--ds-spacing-4)' }}>
            <Card>
              <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-4)' }}>
                {t('saasAdmin.tenantDetail.basicInfo')}
              </Heading>
              <Stack spacing={3}>
                <div>
                  <div style={{ fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-subtle)', marginBottom: 'var(--ds-spacing-1)' }}>
                    {t('saasAdmin.tenantDetail.tenantId')}
                  </div>
                  <div style={{ fontFamily: 'var(--ds-font-family-monospace)', fontSize: 'var(--ds-font-size-sm)' }}>
                    {tenant.id}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-subtle)', marginBottom: 'var(--ds-spacing-1)' }}>
                    Status
                  </div>
                  <Badge color={statusColors[tenant.status]}>{t(`saasAdmin.tenantDetail.status.${tenant.status}`)}</Badge>
                </div>
                <div>
                  <div style={{ fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-subtle)', marginBottom: 'var(--ds-spacing-1)' }}>
                    {t('saasAdmin.tenantDetail.subscriptionPlan')}
                  </div>
                  <div>{tenant.subscriptionPlanName ?? t('saasAdmin.tenantDetail.noPlan')}</div>
                </div>
                <div>
                  <div style={{ fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-subtle)', marginBottom: 'var(--ds-spacing-1)' }}>
                    {t('saasAdmin.tenantDetail.created')}
                  </div>
                  <div>{formatDate(tenant.createdAt)}</div>
                  <div style={{ fontSize: 'var(--ds-font-size-xs)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                    ({formatTimeAgo(tenant.createdAt)})
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-subtle)', marginBottom: 'var(--ds-spacing-1)' }}>
                    {t('saasAdmin.tenantDetail.lastUpdated')}
                  </div>
                  <div>{formatDate(tenant.updatedAt)}</div>
                  <div style={{ fontSize: 'var(--ds-font-size-xs)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                    ({formatTimeAgo(tenant.updatedAt)})
                  </div>
                </div>
              </Stack>
            </Card>

            <Card>
              <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-4)' }}>
                {t('saasAdmin.tenantDetail.limits')}
              </Heading>
              <Stack spacing={3}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{t('saasAdmin.tenantDetail.maxUsers')}</span>
                  <strong>{tenant.seatLimits.maxUsers}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{t('saasAdmin.tenantDetail.maxOrganizations')}</span>
                  <strong>{tenant.seatLimits.maxOrganizations}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{t('saasAdmin.tenantDetail.maxListings')}</span>
                  <strong>{tenant.seatLimits.maxListings}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{t('saasAdmin.tenantDetail.maxBookingsPerMonth')}</span>
                  <strong>{tenant.seatLimits.maxBookingsPerMonth}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{t('saasAdmin.tenantDetail.maxStorage')}</span>
                  <strong>{tenant.seatLimits.maxStorageMb} MB</strong>
                </div>
              </Stack>
              <div style={{ marginTop: 'var(--ds-spacing-4)' }}>
                <Link to={`/tenants/${id}/limits`}>
                  <Button variant="secondary" data-size="sm" type="button">
                    {t('saasAdmin.tenantDetail.changeLimits')}
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </Tabs.Panel>

        {/* Feature Flags Tab */}
        <Tabs.Panel value="flags">
          <Card>
            <div style={{ marginBottom: 'var(--ds-spacing-4)' }}>
              <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-1)' }}>
                {t('saasAdmin.tenantDetail.featureFlags')}
              </Heading>
              <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                {t('saasAdmin.tenantDetail.featureFlagsDescription')}
              </Paragraph>
            </div>

            {loadingFlags ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--ds-spacing-6)' }}>
                <Spinner aria-label={t('saasAdmin.tenantDetail.loading')} />
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
                {(Object.keys(flagsByCategory) as FeatureFlagCategory[]).map((category) => (
                  <div key={category}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)', marginBottom: 'var(--ds-spacing-3)' }}>
                      <Heading level={4} data-size="xs" style={{ margin: 0 }}>
                        {t(`saasAdmin.tenantDetail.category.${category}`)}
                      </Heading>
                      <Badge color={categoryColors[category]} data-size="sm">
                        {flagsByCategory[category].length}
                      </Badge>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-2)' }}>
                      {flagsByCategory[category].map((flag) => (
                        <div
                          key={flag.key}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: 'var(--ds-spacing-3)',
                            borderRadius: 'var(--ds-border-radius-md)',
                            backgroundColor: flag.overridden
                              ? 'var(--ds-color-info-surface-default)'
                              : 'var(--ds-color-neutral-surface-hover)',
                            border: flag.overridden ? '1px solid var(--ds-color-info-border-default)' : 'none',
                          }}
                        >
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
                              <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
                                {flag.name}
                              </Paragraph>
                              <code
                                style={{
                                  fontSize: 'var(--ds-font-size-xs)',
                                  padding: '2px 6px',
                                  backgroundColor: 'var(--ds-color-neutral-surface-default)',
                                  borderRadius: 'var(--ds-border-radius-sm)',
                                }}
                              >
                                {flag.key}
                              </code>
                              {flag.overridden && (
                                <Badge color="info" data-size="sm">
                                  {t('saasAdmin.tenantDetail.overridden')}
                                </Badge>
                              )}
                            </div>
                            {flag.description && (
                              <Paragraph data-size="xs" style={{ margin: 0, marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                                {flag.description}
                              </Paragraph>
                            )}
                            {flag.updatedAt && (
                              <Paragraph data-size="xs" style={{ margin: 0, marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                                {t('saasAdmin.tenantDetail.updatedAt')}: {formatTimeAgo(flag.updatedAt)}
                                {flag.updatedBy && ` ${flag.updatedBy}`}
                              </Paragraph>
                            )}
                          </div>
                          <Switch
                            checked={flag.enabled}
                            onChange={() => handleToggleFlag(flag.key, flag.enabled)}
                            disabled={updateFlagsMutation.isPending}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </Tabs.Panel>

        {/* Billing Tab */}
        <Tabs.Panel value="billing">
          <Card>
            {loadingBilling ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--ds-spacing-6)' }}>
                <Spinner aria-label={t('saasAdmin.tenantDetail.loading')} />
              </div>
            ) : billing ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--ds-spacing-4)' }}>
                  <div>
                    <div style={{ fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-subtle)' }}>{t('saasAdmin.tenantDetail.billingStatus')}</div>
                    <Badge color={billing.status === 'paid' ? 'success' : billing.status === 'overdue' ? 'danger' : 'warning'}>
                      {billing.status}
                    </Badge>
                  </div>
                  <div>
                    <div style={{ fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-subtle)' }}>{t('saasAdmin.tenantDetail.currentPlan')}</div>
                    <div style={{ fontWeight: 'var(--ds-font-weight-medium)' }}>{billing.currentPlan ?? t('saasAdmin.tenantDetail.noPlan')}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-subtle)' }}>{t('saasAdmin.tenantDetail.amountPaid')}</div>
                    <div style={{ fontWeight: 'var(--ds-font-weight-medium)' }}>
                      {billing.amountPaid.toLocaleString('nb-NO')} {billing.currency}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-subtle)' }}>{t('saasAdmin.tenantDetail.amountDue')}</div>
                    <div style={{ fontWeight: 'var(--ds-font-weight-medium)', color: billing.amountDue > 0 ? 'var(--ds-color-danger-text-default)' : undefined }}>
                      {billing.amountDue.toLocaleString('nb-NO')} {billing.currency}
                    </div>
                  </div>
                </div>

                {billing.nextBillingDate && (
                  <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                    {t('saasAdmin.tenantDetail.nextBilling')}: {formatDate(billing.nextBillingDate)}
                  </Paragraph>
                )}

                {billing.invoices.length > 0 && (
                  <div style={{ marginTop: 'var(--ds-spacing-4)' }}>
                    <Heading level={4} data-size="xs" style={{ marginBottom: 'var(--ds-spacing-3)' }}>
                      {t('saasAdmin.tenantDetail.invoices')}
                    </Heading>
                    <Table>
                      <Table.Head>
                        <Table.Row>
                          <Table.HeaderCell>{t('saasAdmin.tenantDetail.invoiceNumber')}</Table.HeaderCell>
                          <Table.HeaderCell>{t('saasAdmin.tenantDetail.amount')}</Table.HeaderCell>
                          <Table.HeaderCell>Status</Table.HeaderCell>
                          <Table.HeaderCell>{t('saasAdmin.tenantDetail.dueDate')}</Table.HeaderCell>
                        </Table.Row>
                      </Table.Head>
                      <Table.Body>
                        {billing.invoices.map((invoice) => (
                          <Table.Row key={invoice.id}>
                            <Table.Cell style={{ fontFamily: 'var(--ds-font-family-monospace)' }}>
                              {invoice.number}
                            </Table.Cell>
                            <Table.Cell>
                              {invoice.amount.toLocaleString('nb-NO')} {invoice.currency}
                            </Table.Cell>
                            <Table.Cell>
                              <Badge color={invoice.status === 'paid' ? 'success' : invoice.status === 'overdue' ? 'danger' : 'warning'}>
                                {invoice.status}
                              </Badge>
                            </Table.Cell>
                            <Table.Cell>{formatDate(invoice.dueDate)}</Table.Cell>
                          </Table.Row>
                        ))}
                      </Table.Body>
                    </Table>
                  </div>
                )}
              </div>
            ) : (
              <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                {t('saasAdmin.tenantDetail.noBillingInfo')}
              </Paragraph>
            )}
          </Card>
        </Tabs.Panel>

        {/* Secrets Tab */}
        <Tabs.Panel value="secrets">
          <Card>
            <div style={{ marginBottom: 'var(--ds-spacing-4)' }}>
              <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-1)' }}>
                {t('saasAdmin.tenantDetail.secrets')}
              </Heading>
              <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                {t('saasAdmin.tenantDetail.secretsDescription')}
              </Paragraph>
            </div>

            {loadingSecrets ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--ds-spacing-6)' }}>
                <Spinner aria-label={t('saasAdmin.tenantDetail.loading')} />
              </div>
            ) : secrets.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 'var(--ds-spacing-8)' }}>
                <LockIcon style={{ fontSize: 'var(--ds-font-size-heading-lg)', color: 'var(--ds-color-neutral-text-subtle)', marginBottom: 'var(--ds-spacing-3)' }} />
                <Heading level={4} data-size="xs" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
                  {t('saasAdmin.tenantDetail.noSecrets')}
                </Heading>
                <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                  {t('saasAdmin.tenantDetail.noSecretsDescription')}
                </Paragraph>
              </div>
            ) : (
              <Table>
                <Table.Head>
                  <Table.Row>
                    <Table.HeaderCell>{t('saasAdmin.tenantDetail.provider')}</Table.HeaderCell>
                    <Table.HeaderCell>{t('saasAdmin.tenantDetail.key')}</Table.HeaderCell>
                    <Table.HeaderCell>Status</Table.HeaderCell>
                    <Table.HeaderCell>{t('saasAdmin.tenantDetail.fingerprint')}</Table.HeaderCell>
                    <Table.HeaderCell>{t('saasAdmin.tenantDetail.lastRotated')}</Table.HeaderCell>
                  </Table.Row>
                </Table.Head>
                <Table.Body>
                  {secrets.map((secret) => (
                    <Table.Row key={secret.key}>
                      <Table.Cell style={{ fontWeight: 'var(--ds-font-weight-medium)' }}>
                        {secret.provider}
                      </Table.Cell>
                      <Table.Cell style={{ fontFamily: 'var(--ds-font-family-monospace)' }}>
                        {secret.key}
                      </Table.Cell>
                      <Table.Cell>
                        <Badge color={secret.isConfigured ? 'success' : 'warning'}>
                          {secret.isConfigured ? t('saasAdmin.tenantDetail.configured') : t('saasAdmin.tenantDetail.notConfigured')}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell style={{ fontFamily: 'var(--ds-font-family-monospace)', fontSize: 'var(--ds-font-size-xs)' }}>
                        {secret.fingerprint ?? '—'}
                      </Table.Cell>
                      <Table.Cell>
                        {secret.lastRotatedAt ? formatTimeAgo(secret.lastRotatedAt) : '—'}
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            )}
          </Card>
        </Tabs.Panel>

        {/* License Tab */}
        <Tabs.Panel value="license">
          <Card>
            <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-4)' }}>
              {t('saasAdmin.tenantDetail.licenseKey')}
            </Heading>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)' }}>
                {tenant.licenseKeyFingerprint ? (
                  <>
                    <Badge color="success">
                      <KeyIcon /> {t('saasAdmin.tenantDetail.licensed')}
                    </Badge>
                    <div style={{ fontFamily: 'var(--ds-font-family-monospace)', fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                      {t('saasAdmin.tenantDetail.fingerprint')}: {tenant.licenseKeyFingerprint}
                    </div>
                  </>
                ) : (
                  <Badge color="warning">{t('saasAdmin.tenantDetail.noLicense')}</Badge>
                )}
              </div>

              {tenant.licenseKeyRotatedAt && (
                <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-1)' }}>
                  <ClockIcon />
                  {t('saasAdmin.tenantDetail.lastRotated')}: {formatDate(tenant.licenseKeyRotatedAt)} ({formatTimeAgo(tenant.licenseKeyRotatedAt)})
                </Paragraph>
              )}

              <div>
                <Button
                  variant="secondary"
                  data-size="sm"
                  onClick={handleRotateLicense}
                  disabled={rotateLicenseMutation.isPending}
                  type="button"
                >
                  <RefreshCwIcon />
                  {tenant.licenseKeyFingerprint ? t('saasAdmin.tenantDetail.rotateLicense') : t('saasAdmin.tenantDetail.generateLicense')}
                </Button>
              </div>

              <div style={{ padding: 'var(--ds-spacing-4)', backgroundColor: 'var(--ds-color-warning-surface-default)', borderRadius: 'var(--ds-border-radius-md)', marginTop: 'var(--ds-spacing-2)' }}>
                <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-warning-text-default)' }}>
                  {t('saasAdmin.tenantDetail.rotateWarning')}
                </Paragraph>
              </div>
            </div>
          </Card>
        </Tabs.Panel>
      </Tabs>
    </div>
  );
}

export default TenantDetailPage;
