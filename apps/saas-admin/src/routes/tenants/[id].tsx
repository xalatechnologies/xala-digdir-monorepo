/**
 * Tenant Detail Page
 * SaaS Admin view for managing a single tenant with feature flags editor
 */

import { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
import { useT } from '@xala/i18n';
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
import styles from './TenantDetailPage.module.css';
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

const statusLabels: Record<SaasTenantStatus, string> = {
  active: 'Aktiv',
  inactive: 'Inaktiv',
  suspended: 'Suspendert',
  pending: 'Venter',
};

const statusColors: Record<SaasTenantStatus, 'success' | 'warning' | 'danger' | 'info'> = {
  active: 'success',
  inactive: 'warning',
  suspended: 'danger',
  pending: 'info',
};

const categoryLabels: Record<FeatureFlagCategory, string> = {
  module: 'Moduler',
  integration: 'Integrasjoner',
  policy: 'Policyer',
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
    if (confirm('t('common.er_du_sikker_paa')')) {
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
      <div className={styles.loadingContainer}>
        <Spinner data-size="lg" aria-label="Laster..." />
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className={styles.notFoundContainer}>
        <Heading level={3} data-size="sm">
          Tenant ikke funnet
        </Heading>
        <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', marginTop: 'var(--ds-spacing-2)' }}>
          Tenant eksisterer ikke eller er slettet.
        </Paragraph>
        <Link to="/tenants">
          <Button variant="secondary" data-size="sm" style={{ marginTop: 'var(--ds-spacing-4)' }} type="button">
            <ArrowLeftIcon />
            Tilbake til oversikt
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <Link to="/tenants">
          <Button variant="tertiary" data-size="sm" style={{ marginBottom: 'var(--ds-spacing-3)' }} type="button">
            <ArrowLeftIcon />
            Tilbake til oversikt
          </Button>
        </Link>

        <div className={styles.headerTop}>
          <div className={styles.headerLeft}>
            <Heading level={2} data-size="lg" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
              {tenant.name}
            </Heading>
            <div className={styles.badges}>
              <Badge color={statusColors[tenant.status]}>{statusLabels[tenant.status]}</Badge>
              {tenant.subscriptionPlanName && <Badge color="info">{tenant.subscriptionPlanName}</Badge>}
              {tenant.licenseKeyFingerprint && (
                <Badge color="success">
                  <KeyIcon /> Lisensiert
                </Badge>
              )}
            </div>
            <div className={styles.metaInfo}>
              <div>
                <strong>Slug:</strong>{' '}
                <span className={styles.monospace}>{tenant.slug}</span>
              </div>
              {tenant.domain && (
                <div>
                  <strong>Domene:</strong> {tenant.domain}
                </div>
              )}
            </div>
          </div>

          <div className={styles.headerActions}>
            <Link to={`/tenants/${id}/edit`}>
              <Button variant="secondary" data-size="sm" type="button">
                <EditIcon />
                Rediger
              </Button>
            </Link>
            {tenant.status === 'active' && (
              <Button variant="danger" data-size="sm" onClick={handleSuspend} type="button">
                <PauseIcon />
                Suspender
              </Button>
            )}
            {tenant.status === 'suspended' && (
              <Button variant="primary" data-size="sm" onClick={handleReactivate} type="button">
                <PlayIcon />
                Reaktiver
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Usage Statistics Grid */}
      <div className={styles.statsGrid}>
        <StatCard
          title="Brukere"
          value={`${tenant.usage.usersCount} / ${tenant.seatLimits.maxUsers}`}
          description={`${Math.round((tenant.usage.usersCount / tenant.seatLimits.maxUsers) * 100)}% brukt`}
          color="var(--ds-color-info-text-default)"
          icon={<UsersIcon />}
        />
        <StatCard
          title="Organisasjoner"
          value={`${tenant.usage.organizationsCount} / ${tenant.seatLimits.maxOrganizations}`}
          description={`${Math.round((tenant.usage.organizationsCount / tenant.seatLimits.maxOrganizations) * 100)}% brukt`t('common.colorvardscolorsuccesstextdefault_iconbuildingicon_statcard_titleleieobjekter')`${tenant.usage.listingsCount} / ${tenant.seatLimits.maxListings}`}
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
          title="Lagring"
          value={`${tenant.usage.storageMb} / ${tenant.seatLimits.maxStorageMb} MB`}
          description={`${Math.round((tenant.usage.storageMb / tenant.seatLimits.maxStorageMb) * 100)}% brukt`}
          color="var(--ds-color-neutral-text-default)"
          icon={<DatabaseIcon />}
        />
      </div>

      {/* New License Key Alert */}
      {newLicenseKey && (
        <Card className={styles.licenseKeyCard}>
          <div className={styles.licenseKeyContent}>
            <div>
              <Heading level={4} data-size="xs" style={{ marginBottom: 'var(--ds-spacing-1)' }}>
                Ny lisensnøkkel generert
              </Heading>
              <Paragraph data-size="sm" style={{ color: 'var(--ds-color-success-text-default)', marginBottom: 'var(--ds-spacing-2)' }}>
                Kopier denne nøkkelen nå. Den vil ikke vises igjen.
              </Paragraph>
              <code className={styles.licenseKeyCode}>
                {newLicenseKey}
              </code>
            </div>
            <Button
              variant="secondary"
              data-size="sm"
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
          <div className={styles.overviewGrid}>
            <Card>
              <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-4)' }}>
                Grunnleggende informasjon
              </Heading>
              <Stack spacing={3}>
                <div>
                  <div className={styles.infoLabel}>
                    Tenant ID
                  </div>
                  <div className={styles.infoValue}>
                    {tenant.id}
                  </div>
                </div>
                <div>
                  <div className={styles.infoLabel}>
                    Status
                  </div>
                  <Badge color={statusColors[tenant.status]}>{statusLabels[tenant.status]}</Badge>
                </div>
                <div>
                  <div className={styles.infoLabel}>
                    Abonnementsplan
                  </div>
                  <div>{tenant.subscriptionPlanName ?? 'Ingen plan'}</div>
                </div>
                <div>
                  <div className={styles.infoLabel}>
                    Opprettet
                  </div>
                  <div>{formatDate(tenant.createdAt)}</div>
                  <div className={styles.infoValueSmall}>
                    ({formatTimeAgo(tenant.createdAt)})
                  </div>
                </div>
                <div>
                  <div className={styles.infoLabel}>
                    Sist oppdatert
                  </div>
                  <div>{formatDate(tenant.updatedAt)}</div>
                  <div className={styles.infoValueSmall}>
                    ({formatTimeAgo(tenant.updatedAt)})
                  </div>
                </div>
              </Stack>
            </Card>

            <Card>
              <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-4)' }}>
                Grenser (Seat Limits)
              </Heading>
              <Stack spacing={3}>
                <div className={styles.limitsRow}>
                  <span>{t('common.maks_brukere')}</span>
                  <strong>{tenant.seatLimits.maxUsers}</strong>
                </div>
                <div className={styles.limitsRow}>
                  <span>{t('common.maks_organisasjoner')}</span>
                  <strong>{tenant.seatLimits.maxOrganizations}</strong>
                </div>
                <div className={styles.limitsRow}>
                  <span>{t('common.maks_leieobjekter')}</span>
                  <strong>{tenant.seatLimits.maxListings}</strong>
                </div>
                <div className={styles.limitsRow}>
                  <span>{t('common.maks_bookinger_per_mnd')}</span>
                  <strong>{tenant.seatLimits.maxBookingsPerMonth}</strong>
                </div>
                <div className={styles.limitsRow}>
                  <span>{t('common.maks_lagring')}</span>
                  <strong>{tenant.seatLimits.maxStorageMb} MB</strong>
                </div>
              </Stack>
              <div style={{ marginTop: 'var(--ds-spacing-4)' }}>
                <Link to={`/tenants/${id}/limits`}>
                  <Button variant="secondary" data-size="sm" type="button">
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
            <div className={styles.flagsHeader}>
              <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-1)' }}>
                Feature Flags
              </Heading>
              <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                Aktiver eller deaktiver funksjoner for denne tenanten
              </Paragraph>
            </div>

            {loadingFlags ? (
              <div className={styles.flagsLoading}>
                <Spinner aria-label={t('common.laster_flags')} />
              </div>
            ) : (
              <div className={styles.flagsList}>
                {(Object.keys(flagsByCategory) as FeatureFlagCategory[]).map((category) => (
                  <div key={category}>
                    <div className={styles.categoryHeader}>
                      <Heading level={4} data-size="xs" style={{ margin: 0 }}>
                        {categoryLabels[category]}
                      </Heading>
                      <Badge color={categoryColors[category]} data-size="sm">
                        {flagsByCategory[category].length}
                      </Badge>
                    </div>

                    <Stack direction="column" gap={8}>
                      {flagsByCategory[category].map((flag) => (
                        <div
                          key={flag.key}
                          className={flag.overridden ? `${styles.flagItem} ${styles.flagItemOverridden}` : styles.flagItem}
                        >
                          <div className={styles.flagContent}>
                            <div className={styles.flagHeader}>
                              <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
                                {flag.name}
                              </Paragraph>
                              <code className={styles.flagKey}>
                                {flag.key}
                              </code>
                              {flag.overridden && (
                                <Badge color="info" data-size="sm">
                                  Overstyrt
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
              <div className={styles.billingLoading}>
                <Spinner aria-label={t('common.laster_fakturering')} />
              </div>
            ) : billing ? (
              <div className={styles.billingContent}>
                <div className={styles.billingGrid}>
                  <div className={styles.billingField}>
                    <div className={styles.billingLabel}>Status</div>
                    <Badge color={billing.status === 'paid' ? 'success' : billing.status === 'overdue' ? 'danger' : 'warning'}>
                      {billing.status}
                    </Badge>
                  </div>
                  <div className={styles.billingField}>
                    <div className={styles.billingLabel}>Nåværende plan</div>
                    <div className={styles.billingValue}>{billing.currentPlan ?? 'Ingen'}</div>
                  </div>
                  <div className={styles.billingField}>
                    <div className={styles.billingLabel}>Betalt</div>
                    <div className={styles.billingValue}>
                      {billing.amountPaid.toLocaleString('nb-NO')} {billing.currency}
                    </div>
                  </div>
                  <div className={styles.billingField}>
                    <div className={styles.billingLabel}>Skyldig</div>
                    <div className={billing.amountDue > 0 ? styles.billingValueDanger : styles.billingValue}>
                      {billing.amountDue.toLocaleString('nb-NO')} {billing.currency}
                    </div>
                  </div>
                </div>

                {billing.nextBillingDate && (
                  <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                    Neste fakturering: {formatDate(billing.nextBillingDate)}
                  </Paragraph>
                )}

                {billing.invoices.length > 0 && (
                  <div className={styles.invoicesSection}>
                    <Heading level={4} data-size="xs" style={{ marginBottom: 'var(--ds-spacing-3)' }}>
                      Fakturaer
                    </Heading>
                    <Table>
                      <Table.Head>
                        <Table.Row>
                          <Table.HeaderCell>Nummer</Table.HeaderCell>
                          <Table.HeaderCell>{t('common.belop')}</Table.HeaderCell>
                          <Table.HeaderCell>Status</Table.HeaderCell>
                          <Table.HeaderCell>Forfallsdato</Table.HeaderCell>
                        </Table.Row>
                      </Table.Head>
                      <Table.Body>
                        {billing.invoices.map((invoice) => (
                          <Table.Row key={invoice.id}>
                            <Table.Cell className={styles.tableCellMonospace}>
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
            <div className={styles.secretsHeader}>
              <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-1)' }}>
                Integrasjons-secrets
              </Heading>
              <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                Konfigurerte API-nøkler og integrasjonshemmeligheter (maskert for sikkerhet)
              </Paragraph>
            </div>

            {loadingSecrets ? (
              <div className={styles.secretsLoading}>
                <Spinner aria-label={t('common.laster_secrets')} />
              </div>
            ) : secrets.length === 0 ? (
              <div className={styles.secretsEmpty}>
                <LockIcon className={styles.secretsEmptyIcon} />
                <Heading level={4} data-size="xs" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
                  Ingen secrets konfigurert
                </Heading>
                <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                  Integrasjonsnøkler vil vises her når de er konfigurert.
                </Paragraph>
              </div>
            ) : (
              <Table>
                <Table.Head>
                  <Table.Row>
                    <Table.HeaderCell>Provider</Table.HeaderCell>
                    <Table.HeaderCell>{t('common.nokkel')}</Table.HeaderCell>
                    <Table.HeaderCell>Status</Table.HeaderCell>
                    <Table.HeaderCell>Fingerprint</Table.HeaderCell>
                    <Table.HeaderCell>{t('common.sist_rotert')}</Table.HeaderCell>
                  </Table.Row>
                </Table.Head>
                <Table.Body>
                  {secrets.map((secret) => (
                    <Table.Row key={secret.key}>
                      <Table.Cell className={styles.tableCellMedium}>
                        {secret.provider}
                      </Table.Cell>
                      <Table.Cell className={styles.tableCellMonospace}>
                        {secret.key}
                      </Table.Cell>
                      <Table.Cell>
                        <Badge color={secret.isConfigured ? 'success' : 'warning'}>
                          {secret.isConfigured ? 'Konfigurert' : 'Ikke konfigurert'}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell className={styles.tableCellMonospaceSmall}>
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
              Lisensnøkkel
            </Heading>

            <div className={styles.licenseContent}>
              <div className={styles.licenseInfo}>
                {tenant.licenseKeyFingerprint ? (
                  <>
                    <Badge color="success">
                      <KeyIcon /> Lisensiert
                    </Badge>
                    <div className={styles.licenseFingerprint}>
                      Fingerprint: {tenant.licenseKeyFingerprint}
                    </div>
                  </>
                ) : (
                  <Badge color="warning">{t('common.ingen_lisensnokkel')}</Badge>
                )}
              </div>

              {tenant.licenseKeyRotatedAt && (
                <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-1)' }}>
                  <ClockIcon />
                  t('table.sist_rotert'): {formatDate(tenant.licenseKeyRotatedAt)} ({formatTimeAgo(tenant.licenseKeyRotatedAt)})
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
                  {tenant.licenseKeyFingerprint ? 't('common.roter_lisensnokkel')' : 'Generer lisensnøkkel'}
                </Button>
              </div>

              <div className={styles.licenseWarning}>
                <Paragraph data-size="sm" className={styles.licenseWarningText}>
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
