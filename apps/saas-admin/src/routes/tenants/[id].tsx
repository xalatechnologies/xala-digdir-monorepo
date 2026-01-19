/**
 * Tenant Detail Page
 * SaaS Admin view for managing a single tenant with feature flags editor
 */

import { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useT } from '@xala/i18n';
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
  Grid,
  Text,
  ListIcon,
} from '@xala/ds';
import { CategoryEntitlementsTab } from '../../components/CategoryEntitlementsTab';
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
  TenantFeatureFlag,
  FeatureFlagCatalogItem,
  FeatureFlagCategory,
} from '@digilist/client-sdk/types';

const categoryLabels: Record<FeatureFlagCategory, string> = {
  module: 'Moduler',
  integration: 'Integrasjoner',
  policy: 'Policyer',
};

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
  const { id } = useParams<{ id: string }>();
  const t = useT();
  const navigate = useNavigate();

  const statusLabels: Record<SaasTenantStatus, string> = {
    active: t('status.active'),
    inactive: t('status.inactive'),
    suspended: t('status.suspended'),
    pending: t('status.pending'),
  };

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
    if (confirm(`Er du sikker på at du vil suspendere ${tenant?.name}?`)) {
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
    if (confirm(t('common.er_du_sikker_paa'))) {
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
      <div style={{ display: "flex", justifyContent: "center", padding: "var(--ds-spacing-8)" }}>
        <Spinner size="lg" aria-label={t('saasAdmin.ariaLabel.laster')} />
      </div>
    );
  }

  if (!tenant) {
    return (
      <div style={{ textAlign: "center", padding: "var(--ds-spacing-8)" }}>
        <Heading level={3} size="sm">
          Tenant ikke funnet
        </Heading>
        <Paragraph size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', marginTop: 'var(--ds-spacing-2)' }}>
          Tenant eksisterer ikke eller er slettet.
        </Paragraph>
        <Link to="/tenants">
          <Button variant="secondary" size="sm" style={{ marginTop: 'var(--ds-spacing-4)' }} type="button">
            <ArrowLeftIcon />
            Tilbake til oversikt
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--ds-spacing-5)", maxWidth: "var(--ds-size-container-xl, 1400px)", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--ds-spacing-3)" }}>
        <Link to="/tenants">
          <Button variant="tertiary" size="sm" style={{ marginBottom: 'var(--ds-spacing-3)' }} type="button">
            <ArrowLeftIcon />
            Tilbake til oversikt
          </Button>
        </Link>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "var(--ds-spacing-4)" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--ds-spacing-2)" }}>
            <Heading level={2} size="lg" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
              {tenant.name}
            </Heading>
            <div style={{ display: "flex", gap: "var(--ds-spacing-2)", flexWrap: "wrap" }}>
              <Badge color={statusColors[tenant.status]}>{statusLabels[tenant.status]}</Badge>
              {tenant.subscriptionPlanName && <Badge color="info">{tenant.subscriptionPlanName}</Badge>}
              {tenant.licenseKeyFingerprint && (
                <Badge color="success">
                  <KeyIcon /> Lisensiert
                </Badge>
              )}
            </div>
            <div style={{ display: "flex", gap: "var(--ds-spacing-4)", color: "var(--ds-color-neutral-text-subtle)", fontSize: "var(--ds-font-size-sm)" }}>
              <div>
                <strong>Slug:</strong>{' '}
                <span style={{ fontFamily: "var(--ds-font-family-monospace)" }}>{tenant.slug}</span>
              </div>
              {tenant.domain && (
                <div>
                  <strong>Domene:</strong> {tenant.domain}
                </div>
              )}
            </div>
          </div>

          <div style={{ display: "flex", gap: "var(--ds-spacing-2)" }}>
            <Link to={`/tenants/${id}/edit`}>
              <Button variant="secondary" size="sm" type="button">
                <EditIcon />
                Rediger
              </Button>
            </Link>
            {tenant.status === 'active' && (
              <Button variant="danger" size="sm" onClick={handleSuspend} type="button">
                <PauseIcon />
                Suspender
              </Button>
            )}
            {tenant.status === 'suspended' && (
              <Button variant="primary" size="sm" onClick={handleReactivate} type="button">
                <PlayIcon />
                Reaktiver
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Usage Statistics Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "var(--ds-spacing-3)" }}>
        <StatCard
          title={t('saasAdmin.title.users')}
          value={`${tenant.usage.usersCount} / ${tenant.seatLimits.maxUsers}`}
          description={`${Math.round((tenant.usage.usersCount / tenant.seatLimits.maxUsers) * 100)}% brukt`}
          color="var(--ds-color-info-text-default)"
          icon={<UsersIcon />}
        />
        <StatCard
          title={t('saasAdmin.title.organisasjoner')}
          value={`${tenant.usage.organizationsCount} / ${tenant.seatLimits.maxOrganizations}`}
          description="Aktive organisasjoner"
          color="var(--ds-color-info-text-default)"
          icon={<UsersIcon />}
        />
        <StatCard
          title={t('saasAdmin.title.leieobjekter')}
          value={`${tenant.usage.listingsCount} / ${tenant.seatLimits.maxListings}`}
          description={`${Math.round((tenant.usage.listingsCount / tenant.seatLimits.maxListings) * 100)}% brukt`}
          color="var(--ds-color-warning-text-default)"
          icon={<CalendarIcon />}
        />
        <StatCard
          title={t('common.bookinger_denne_mnd')}
          value={`${tenant.usage.bookingsThisMonth} / ${tenant.seatLimits.maxBookingsPerMonth}`}
          description={`${Math.round((tenant.usage.bookingsThisMonth / tenant.seatLimits.maxBookingsPerMonth) * 100)}% brukt`}
          color="var(--ds-color-accent-text-default)"
          icon={<CalendarIcon />}
        />
        <StatCard
          title={t('saasAdmin.title.lagring')}
          value={`${tenant.usage.storageMb} / ${tenant.seatLimits.maxStorageMb} MB`}
          description={`${Math.round((tenant.usage.storageMb / tenant.seatLimits.maxStorageMb) * 100)}% brukt`}
          color="var(--ds-color-neutral-text-default)"
          icon={<DatabaseIcon />}
        />
      </div>

      {/* New License Key Alert */}
      {newLicenseKey && (
        <Card style={{ backgroundColor: "var(--ds-color-success-surface-default)", padding: "var(--ds-spacing-4)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <Heading level={4} size="xs" style={{ marginBottom: 'var(--ds-spacing-1)' }}>
                Ny lisensnøkkel generert
              </Heading>
              <Paragraph size="sm" style={{ color: 'var(--ds-color-success-text-default)', marginBottom: 'var(--ds-spacing-2)' }}>
                Kopier denne nøkkelen nå. Den vil ikke vises igjen.
              </Paragraph>
              <code style={{ display: "block", padding: "var(--ds-spacing-2)", backgroundColor: "var(--ds-color-neutral-surface-default)", borderRadius: "var(--ds-border-radius-sm)", fontFamily: "var(--ds-font-family-monospace)", fontSize: "var(--ds-font-size-sm)", wordBreak: "break-all" }}>
                {newLicenseKey}
              </code>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setNewLicenseKey(null)}
              type="button"
            >
              Lukk
            </Button>
          </div>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <Tabs.List>
          <Tabs.Tab value="overview">
            <ShieldCheckIcon />
            Oversikt
          </Tabs.Tab>
          <Tabs.Tab value="flags">
            <ToggleLeftIcon />
            Feature Flags ({flagsWithStatus.length})
          </Tabs.Tab>
          <Tabs.Tab value="billing">
            <CreditCardIcon />
            Fakturering
          </Tabs.Tab>
          <Tabs.Tab value="secrets">
            <LockIcon />
            Secrets ({secrets.length})
          </Tabs.Tab>
          <Tabs.Tab value="license">
            <KeyIcon />
            Lisens
          </Tabs.Tab>
          <Tabs.Tab value="categories">
            <ListIcon />
            Kategorier
          </Tabs.Tab>
        </Tabs.List>

        {/* Overview Tab */}
        <Tabs.Panel value="overview">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "var(--ds-spacing-4)" }}>
            <Card>
              <Heading level={3} size="sm" style={{ marginBottom: 'var(--ds-spacing-4)' }}>
                Grunnleggende informasjon
              </Heading>
              <Stack spacing={3}>
                <div>
                  <div style={{ fontSize: "var(--ds-font-size-sm)", color: "var(--ds-color-neutral-text-subtle)", marginBottom: "var(--ds-spacing-1)" }}>
                    Tenant ID
                  </div>
                  <div style={{ fontFamily: "var(--ds-font-family-monospace)", fontSize: "var(--ds-font-size-sm)" }}>
                    {tenant.id}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "var(--ds-font-size-sm)", color: "var(--ds-color-neutral-text-subtle)", marginBottom: "var(--ds-spacing-1)" }}>{t('saasAdmin.text.status')}</div>
                  <Badge color={statusColors[tenant.status]}>{statusLabels[tenant.status]}</Badge>
                </div>
                <div>
                  <div style={{ fontSize: "var(--ds-font-size-sm)", color: "var(--ds-color-neutral-text-subtle)", marginBottom: "var(--ds-spacing-1)" }}>
                    Abonnementsplan
                  </div>
                  <div>{tenant.subscriptionPlanName ?? 'Ingen plan'}</div>
                </div>
                <div>
                  <div style={{ fontSize: "var(--ds-font-size-sm)", color: "var(--ds-color-neutral-text-subtle)", marginBottom: "var(--ds-spacing-1)" }}>
                    Opprettet
                  </div>
                  <div>{formatDate(tenant.createdAt)}</div>
                  <div style={{ fontSize: "var(--ds-font-size-xs)", color: "var(--ds-color-neutral-text-subtle)" }}>
                    ({formatTimeAgo(tenant.createdAt)})
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "var(--ds-font-size-sm)", color: "var(--ds-color-neutral-text-subtle)", marginBottom: "var(--ds-spacing-1)" }}>
                    Sist oppdatert
                  </div>
                  <div>{formatDate(tenant.updatedAt)}</div>
                  <div style={{ fontSize: "var(--ds-font-size-xs)", color: "var(--ds-color-neutral-text-subtle)" }}>
                    ({formatTimeAgo(tenant.updatedAt)})
                  </div>
                </div>
              </Stack>
            </Card>

            <Card>
              <Heading level={3} size="sm" style={{ marginBottom: 'var(--ds-spacing-4)' }}>
                Grenser (Seat Limits)
              </Heading>
              <Stack spacing={3}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>{t('common.maks_brukere')}</span>
                  <strong>{tenant.seatLimits.maxUsers}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>{t('common.maks_organisasjoner')}</span>
                  <strong>{tenant.seatLimits.maxOrganizations}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>{t('common.maks_leieobjekter')}</span>
                  <strong>{tenant.seatLimits.maxListings}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>{t('common.maks_bookinger_per_mnd')}</span>
                  <strong>{tenant.seatLimits.maxBookingsPerMonth}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>{t('common.maks_lagring')}</span>
                  <strong>{tenant.seatLimits.maxStorageMb} MB</strong>
                </div>
              </Stack>
              <div style={{ marginTop: 'var(--ds-spacing-4)' }}>
                <Link to={`/tenants/${id}/limits`}>
                  <Button variant="secondary" size="sm" type="button">
                    Endre grenser
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </Tabs.Panel>

        {/* Feature Flags Tab */}
        <Tabs.Panel value="flags">
          <Card>
            <div style={{ marginBottom: "var(--ds-spacing-4)" }}>
              <Heading level={3} size="sm" style={{ marginBottom: 'var(--ds-spacing-1)' }}>
                Feature Flags
              </Heading>
              <Paragraph size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                Aktiver eller deaktiver funksjoner for denne tenanten
              </Paragraph>
            </div>

            {loadingFlags ? (
              <div style={{ display: "flex", justifyContent: "center", padding: "var(--ds-spacing-6)" }}>
                <Spinner aria-label={t('state.loading')} />
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--ds-spacing-6)" }}>
                {(Object.keys(flagsByCategory) as FeatureFlagCategory[]).map((category) => (
                  <div key={category}>
                    <div style={{ display: "flex", alignItems: "center", gap: "var(--ds-spacing-2)", marginBottom: "var(--ds-spacing-3)" }}>
                      <Heading level={4} size="xs" style={{ margin: 0 }}>
                        {categoryLabels[category]}
                      </Heading>
                      <Badge color={categoryColors[category]} size="sm">
                        {flagsByCategory[category].length}
                      </Badge>
                    </div>

                    <Stack direction="column" gap={8}>
                      {flagsByCategory[category].map((flag) => (
                        <div
                          key={flag.key}
                          className={flag.overridden ? `${styles.flagItem} ${styles.flagItemOverridden}` : styles.flagItem}
                        >
                          <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "var(--ds-spacing-2)" }}>
                              <Paragraph size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
                                {flag.name}
                              </Paragraph>
                              <code style={{ fontSize: "var(--ds-font-size-xs)", padding: "2px 6px", backgroundColor: "var(--ds-color-neutral-surface-default)", borderRadius: "var(--ds-border-radius-sm)" }}>
                                {flag.key}
                              </code>
                              {flag.overridden && (
                                <Badge color="info" size="sm">
                                  Overstyrt
                                </Badge>
                              )}
                            </div>
                            {flag.description && (
                              <Paragraph size="xs" style={{ margin: 0, marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                                {flag.description}
                              </Paragraph>
                            )}
                            {flag.updatedAt && (
                              <Paragraph size="xs" style={{ margin: 0, marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                                Oppdatert: {formatTimeAgo(flag.updatedAt)}
                                {flag.updatedBy && ` av ${flag.updatedBy}`}
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
                    </Stack>
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
              <div style={{ display: "flex", justifyContent: "center", padding: "var(--ds-spacing-6)" }}>
                <Spinner aria-label={t('state.loading')} />
              </div>
            ) : billing ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--ds-spacing-4)" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "var(--ds-spacing-4)" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "var(--ds-spacing-1)" }}>
                    <div style={{ fontSize: "var(--ds-font-size-sm)", color: "var(--ds-color-neutral-text-subtle)" }}>{t('saasAdmin.text.status')}</div>
                    <Badge color={billing.status === 'paid' ? 'success' : billing.status === 'overdue' ? 'danger' : 'warning'}>
                      {billing.status}
                    </Badge>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "var(--ds-spacing-1)" }}>
                    <div style={{ fontSize: "var(--ds-font-size-sm)", color: "var(--ds-color-neutral-text-subtle)" }}>{t('saasAdmin.text.navaerendePlan')}</div>
                    <div style={{ fontWeight: "var(--ds-font-weight-medium)" }}>{billing.currentPlan ?? 'Ingen'}</div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "var(--ds-spacing-1)" }}>
                    <div style={{ fontSize: "var(--ds-font-size-sm)", color: "var(--ds-color-neutral-text-subtle)" }}>{t('saasAdmin.text.betalt')}</div>
                    <div style={{ fontWeight: "var(--ds-font-weight-medium)" }}>
                      {billing.amountPaid.toLocaleString('nb-NO')} {billing.currency}
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "var(--ds-spacing-1)" }}>
                    <div style={{ fontSize: "var(--ds-font-size-sm)", color: "var(--ds-color-neutral-text-subtle)" }}>{t('saasAdmin.text.skyldig')}</div>
                    <div className={billing.amountDue > 0 ? styles.billingValueDanger : styles.billingValue}>
                      {billing.amountDue.toLocaleString('nb-NO')} {billing.currency}
                    </div>
                  </div>
                </div>

                {billing.nextBillingDate && (
                  <Paragraph size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                    Neste fakturering: {formatDate(billing.nextBillingDate)}
                  </Paragraph>
                )}

                {billing.invoices.length > 0 && (
                  <div style={{ marginTop: "var(--ds-spacing-4)" }}>
                    <Heading level={4} size="xs" style={{ marginBottom: 'var(--ds-spacing-3)' }}>
                      Fakturaer
                    </Heading>
                    <Table>
                      <Table.Head>
                        <Table.Row>
                          <Table.HeaderCell>{t('saasAdmin.text.nummer')}</Table.HeaderCell>
                          <Table.HeaderCell>{t('common.belop')}</Table.HeaderCell>
                          <Table.HeaderCell>{t('saasAdmin.text.status')}</Table.HeaderCell>
                          <Table.HeaderCell>{t('saasAdmin.text.forfallsdato')}</Table.HeaderCell>
                        </Table.Row>
                      </Table.Head>
                      <Table.Body>
                        {billing.invoices.map((invoice) => (
                          <Table.Row key={invoice.id}>
                            <Table.Cell style={{ fontFamily: "var(--ds-font-family-monospace)" }}>
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
                Ingen faktureringsinformasjon tilgjengelig.
              </Paragraph>
            )}
          </Card>
        </Tabs.Panel>

        {/* Secrets Tab */}
        <Tabs.Panel value="secrets">
          <Card>
            <div style={{ marginBottom: "var(--ds-spacing-4)" }}>
              <Heading level={3} size="sm" style={{ marginBottom: 'var(--ds-spacing-1)' }}>
                Integrasjons-secrets
              </Heading>
              <Paragraph size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                Konfigurerte API-nøkler og integrasjonshemmeligheter (maskert for sikkerhet)
              </Paragraph>
            </div>

            {loadingSecrets ? (
              <div style={{ display: "flex", justifyContent: "center", padding: "var(--ds-spacing-6)" }}>
                <Spinner aria-label={t('state.loading')} />
              </div>
            ) : secrets.length === 0 ? (
              <div style={{ textAlign: "center", padding: "var(--ds-spacing-8)" }}>
                <LockIcon style={{ fontSize: "var(--ds-font-size-heading-lg)", color: "var(--ds-color-neutral-text-subtle)", marginBottom: "var(--ds-spacing-3)" }} />
                <Heading level={4} size="xs" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
                  Ingen secrets konfigurert
                </Heading>
                <Paragraph size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                  Integrasjonsnøkler vil vises her når de er konfigurert.
                </Paragraph>
              </div>
            ) : (
              <Table>
                <Table.Head>
                  <Table.Row>
                    <Table.HeaderCell>{t('saasAdmin.text.provider')}</Table.HeaderCell>
                    <Table.HeaderCell>{t('common.nokkel')}</Table.HeaderCell>
                    <Table.HeaderCell>{t('saasAdmin.text.status')}</Table.HeaderCell>
                    <Table.HeaderCell>{t('saasAdmin.text.fingerprint')}</Table.HeaderCell>
                    <Table.HeaderCell>{t('common.sist_rotert')}</Table.HeaderCell>
                  </Table.Row>
                </Table.Head>
                <Table.Body>
                  {secrets.map((secret) => (
                    <Table.Row key={secret.key}>
                      <Table.Cell style={{ fontWeight: "var(--ds-font-weight-medium)" }}>
                        {secret.provider}
                      </Table.Cell>
                      <Table.Cell style={{ fontFamily: "var(--ds-font-family-monospace)" }}>
                        {secret.key}
                      </Table.Cell>
                      <Table.Cell>
                        <Badge color={secret.isConfigured ? 'success' : 'warning'}>
                          {secret.isConfigured ? 'Konfigurert' : 'Ikke konfigurert'}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell style={{ fontFamily: "var(--ds-font-family-monospace)", fontSize: "var(--ds-font-size-xs)" }}>
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
            <Heading level={3} size="sm" style={{ marginBottom: 'var(--ds-spacing-4)' }}>
              Lisensnøkkel
            </Heading>

            <div style={{ display: "flex", flexDirection: "column", gap: "var(--ds-spacing-4)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "var(--ds-spacing-3)" }}>
                {tenant.licenseKeyFingerprint ? (
                  <>
                    <Badge color="success">
                      <KeyIcon /> Lisensiert
                    </Badge>
                    <div style={{ fontFamily: "var(--ds-font-family-monospace)", fontSize: "var(--ds-font-size-sm)", color: "var(--ds-color-neutral-text-subtle)" }}>
                      Fingerprint: {tenant.licenseKeyFingerprint}
                    </div>
                  </>
                ) : (
                  <Badge color="warning">{t('common.ingen_lisensnokkel')}</Badge>
                )}
              </div>

              {tenant.licenseKeyRotatedAt && (
                <Paragraph size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-1)' }}>
                  <ClockIcon />
                  t('table.sist_rotert'): {formatDate(tenant.licenseKeyRotatedAt)} ({formatTimeAgo(tenant.licenseKeyRotatedAt)})
                </Paragraph>
              )}

              <div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleRotateLicense}
                  disabled={rotateLicenseMutation.isPending}
                  type="button"
                >
                  <RefreshCwIcon />
                  {tenant.licenseKeyFingerprint ? t('common.roter_lisensnokkel') : 'Generer lisensnøkkel'}
                </Button>
              </div>

              <div style={{ padding: "var(--ds-spacing-4)", backgroundColor: "var(--ds-color-warning-surface-default)", borderRadius: "var(--ds-border-radius-md)", marginTop: "var(--ds-spacing-2)" }}>
                <Paragraph size="sm" style={{ margin: 0, color: "var(--ds-color-warning-text-default)" }}>
                  <strong>{t('common.advarsel')}</strong> Når du roterer lisensnøkkelen vil den gamle nøkkelen bli ugyldig umiddelbart.
                  Alle systemer som bruker den gamle nøkkelen må oppdateres med den nye.
                </Paragraph>
              </div>
            </div>
          </Card>
        </Tabs.Panel>

        {/* Categories Tab */}
        <Tabs.Panel value="categories">
          <CategoryEntitlementsTab tenantId={id!} />
        </Tabs.Panel>
      </Tabs>
    </div>
  );
}

export default TenantDetailPage;
