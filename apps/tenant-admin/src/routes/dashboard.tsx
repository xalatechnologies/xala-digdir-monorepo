/**
 * Dashboard Page - Tenant Admin App
 *
 * Displays capability summary including:
 * - Seat usage vs limits (users, orgs, listings, bookings)
 * - Enabled feature flags overview
 * - Quick actions based on role
 * - System status
 */

import { useNavigate } from 'react-router-dom';
import {
  Card,
  Heading,
  Paragraph,
  Spinner,
  Button,
  StatCard,
  Badge,
  UsersIcon,
  OrganizationIcon,
  CalendarIcon,
  BuildingIcon,
  SettingsIcon,
  SparklesIcon,
  ChartIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
} from '@xala/ds';
import { useTenantCapabilities, useTenantSubscription } from '@digilist/client-sdk';
import { useT, useLocale } from '@xala/i18n';
import { useAuth } from '../hooks/useAuth';

/**
 * Calculate percentage of usage against limit
 */
function calculateUsagePercent(current: number, max: number): number {
  if (max <= 0) return 0;
  return Math.min(Math.round((current / max) * 100), 100);
}

/**
 * Get color based on usage percentage
 */
function getUsageColor(percent: number): string {
  if (percent >= 90) return 'var(--ds-color-danger-text-default)';
  if (percent >= 75) return 'var(--ds-color-warning-text-default)';
  return 'var(--ds-color-success-text-default)';
}

/**
 * Format feature flag key to display name
 */
function formatFlagName(key: string): string {
  return key
    .replace(/^(module\.|integration\.|policy\.)/, '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function DashboardPage(): React.ReactElement {
  const { user, isTenantAdmin, isBillingAdmin, isTechAdmin } = useAuth();
  const navigate = useNavigate();
  const t = useT();
  const { locale } = useLocale();

  // Fetch tenant capabilities and subscription
  const { data: capabilitiesData, isLoading: loadingCapabilities } = useTenantCapabilities();
  const { data: subscriptionData, isLoading: loadingSubscription } = useTenantSubscription();

  const isLoading = loadingCapabilities || loadingSubscription;

  // Extract data from responses
  const capabilities = capabilitiesData?.capabilities;
  const subscription = subscriptionData?.subscription;
  const usage = capabilities?.usage ?? subscription?.usage;
  const limits = capabilities?.seatLimits ?? subscription?.seatLimits;
  const featureFlags = capabilities?.featureFlags ?? {};

  // Count enabled/disabled feature flags
  const enabledFlags = Object.entries(featureFlags).filter(([, enabled]) => enabled);
  const disabledFlags = Object.entries(featureFlags).filter(([, enabled]) => !enabled);

  // Get role-specific subtitle
  const getSubtitle = (): string => {
    if (isTenantAdmin) {
      return t('tenantAdmin.dashboard.fullAccess', { defaultValue: 'Full access to tenant administration' });
    }
    if (isBillingAdmin) {
      return t('tenantAdmin.dashboard.billingAccess', { defaultValue: 'Billing and subscription management' });
    }
    if (isTechAdmin) {
      return t('tenantAdmin.dashboard.techAccess', { defaultValue: 'Technical and integration management' });
    }
    return t('dashboard.loggedIn');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
      {/* Welcome section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Heading level={1} data-size="lg" style={{ margin: 0 }}>
            {t('dashboard.welcomeBack', { name: user?.name.split(' ')[0] || '' })}
          </Heading>
          <Paragraph
            style={{
              color: 'var(--ds-color-neutral-text-subtle)',
              marginTop: 'var(--ds-spacing-2)',
              marginBottom: 0,
            }}
          >
            {user?.tenantName && (
              <Badge data-color="info" style={{ marginRight: 'var(--ds-spacing-2)' }}>
                {user.tenantName}
              </Badge>
            )}
            {getSubtitle()}
          </Paragraph>
        </div>
        {isTenantAdmin && (
          // eslint-disable-next-line digdir/require-interactive-labels -- Button has text content
          <Button type="button" variant="primary" data-color="accent" onClick={() => navigate('/settings')}>
            {t('tenantAdmin.dashboard.manageSettings', { defaultValue: 'Manage Settings' })}
            <ArrowRightIcon />
          </Button>
        )}
      </div>

      {/* Loading state */}
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--ds-spacing-8)' }}>
          <Spinner aria-label={t('dashboard.loadingStats')} data-size="lg" />
        </div>
      ) : (
        <>
          {/* Seat Usage Stats */}
          <div>
            <Heading level={2} data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-4)' }}>
              {t('tenantAdmin.dashboard.seatUsage', { defaultValue: 'Seat Usage' })}
            </Heading>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 'var(--ds-spacing-4)',
              }}
            >
              <StatCard
                title={t('tenantAdmin.dashboard.users', { defaultValue: 'Users' })}
                value={usage?.currentUsers ?? 0}
                description={`${t('tenantAdmin.dashboard.of', { defaultValue: 'of' })} ${limits?.maxUsers ?? 0} ${t('tenantAdmin.dashboard.max', { defaultValue: 'max' })}`}
                color={getUsageColor(calculateUsagePercent(usage?.currentUsers ?? 0, limits?.maxUsers ?? 1))}
                icon={<UsersIcon />}
              />
              <StatCard
                title={t('tenantAdmin.dashboard.organizations', { defaultValue: 'Organizations' })}
                value={usage?.currentOrganizations ?? 0}
                description={`${t('tenantAdmin.dashboard.of', { defaultValue: 'of' })} ${limits?.maxOrganizations ?? 0} ${t('tenantAdmin.dashboard.max', { defaultValue: 'max' })}`}
                color={getUsageColor(
                  calculateUsagePercent(usage?.currentOrganizations ?? 0, limits?.maxOrganizations ?? 1)
                )}
                icon={<OrganizationIcon />}
              />
              <StatCard
                title={t('tenantAdmin.dashboard.listings', { defaultValue: 'Listings' })}
                value={usage?.currentListings ?? 0}
                description={`${t('tenantAdmin.dashboard.of', { defaultValue: 'of' })} ${limits?.maxListings ?? 0} ${t('tenantAdmin.dashboard.max', { defaultValue: 'max' })}`}
                color={getUsageColor(calculateUsagePercent(usage?.currentListings ?? 0, limits?.maxListings ?? 1))}
                icon={<BuildingIcon />}
              />
              <StatCard
                title={t('tenantAdmin.dashboard.bookingsThisMonth', { defaultValue: 'Bookings/Month' })}
                value={usage?.bookingsThisMonth ?? 0}
                description={`${t('tenantAdmin.dashboard.of', { defaultValue: 'of' })} ${limits?.maxBookingsPerMonth ?? 0} ${t('tenantAdmin.dashboard.max', { defaultValue: 'max' })}`}
                color={getUsageColor(
                  calculateUsagePercent(usage?.bookingsThisMonth ?? 0, limits?.maxBookingsPerMonth ?? 1)
                )}
                icon={<CalendarIcon />}
              />
            </div>
          </div>

          {/* Two column layout */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr',
              gap: 'var(--ds-spacing-6)',
            }}
          >
            {/* Feature Flags Summary */}
            <Card style={{ padding: 'var(--ds-spacing-5)' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 'var(--ds-spacing-4)',
                }}
              >
                <Heading level={2} data-size="sm" style={{ margin: 0 }}>
                  {t('tenantAdmin.dashboard.featureFlags', { defaultValue: 'Feature Flags' })}
                </Heading>
                {(isTenantAdmin || isTechAdmin) && (
                  <Button
                    type="button"
                    variant="tertiary"
                    data-size="sm"
                    onClick={() => navigate('/feature-flags')}
                  >
                    {t('common.seeAll', { defaultValue: 'See All' })}
                  </Button>
                )}
              </div>

              {/* Enabled features */}
              <div style={{ marginBottom: 'var(--ds-spacing-4)' }}>
                <Paragraph
                  data-size="sm"
                  style={{
                    margin: 0,
                    marginBottom: 'var(--ds-spacing-2)',
                    fontWeight: 'var(--ds-font-weight-medium)',
                    color: 'var(--ds-color-success-text-default)',
                  }}
                >
                  <CheckCircleIcon style={{ marginRight: 'var(--ds-spacing-2)', verticalAlign: 'middle' }} />
                  {t('tenantAdmin.dashboard.enabled', { defaultValue: 'Enabled' })} ({enabledFlags.length})
                </Paragraph>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--ds-spacing-2)' }}>
                  {enabledFlags.slice(0, 6).map(([key]) => (
                    <Badge key={key} data-color="success">
                      {formatFlagName(key)}
                    </Badge>
                  ))}
                  {enabledFlags.length > 6 && (
                    <Badge data-color="neutral">+{enabledFlags.length - 6} more</Badge>
                  )}
                  {enabledFlags.length === 0 && (
                    <Paragraph
                      data-size="sm"
                      style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}
                    >
                      {t('tenantAdmin.dashboard.noEnabledFlags', { defaultValue: 'No features enabled' })}
                    </Paragraph>
                  )}
                </div>
              </div>

              {/* Disabled features */}
              <div>
                <Paragraph
                  data-size="sm"
                  style={{
                    margin: 0,
                    marginBottom: 'var(--ds-spacing-2)',
                    fontWeight: 'var(--ds-font-weight-medium)',
                    color: 'var(--ds-color-neutral-text-subtle)',
                  }}
                >
                  {t('tenantAdmin.dashboard.disabled', { defaultValue: 'Disabled' })} ({disabledFlags.length})
                </Paragraph>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--ds-spacing-2)' }}>
                  {disabledFlags.slice(0, 4).map(([key]) => (
                    <Badge key={key} data-color="neutral">
                      {formatFlagName(key)}
                    </Badge>
                  ))}
                  {disabledFlags.length > 4 && (
                    <Badge data-color="neutral">+{disabledFlags.length - 4} more</Badge>
                  )}
                </div>
              </div>
            </Card>

            {/* Quick actions & status */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
              {/* Quick actions */}
              <Card style={{ padding: 'var(--ds-spacing-5)' }}>
                <Heading
                  level={2}
                  data-size="sm"
                  style={{ margin: 0, marginBottom: 'var(--ds-spacing-4)' }}
                >
                  {t('dashboard.quickActions')}
                </Heading>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-2)' }}>
                  {/* eslint-disable-next-line digdir/require-interactive-labels -- Button has text content */}
                  {(isTenantAdmin || isTechAdmin) && (
                    <Button
                      type="button"
                      variant="secondary"
                      style={{ justifyContent: 'flex-start' }}
                      onClick={() => navigate('/branding')}
                    >
                      <SparklesIcon />
                      {t('tenantAdmin.dashboard.customizeBranding', { defaultValue: 'Customize Branding' })}
                    </Button>
                  )}
                  {/* eslint-disable-next-line digdir/require-interactive-labels -- Button has text content */}
                  {(isTenantAdmin || isBillingAdmin) && (
                    <Button
                      type="button"
                      variant="secondary"
                      style={{ justifyContent: 'flex-start' }}
                      onClick={() => navigate('/subscription')}
                    >
                      <ChartIcon />
                      {t('tenantAdmin.dashboard.viewSubscription', { defaultValue: 'View Subscription' })}
                    </Button>
                  )}
                  {/* eslint-disable-next-line digdir/require-interactive-labels -- Button has text content */}
                  {isTenantAdmin && (
                    <Button
                      type="button"
                      variant="secondary"
                      style={{ justifyContent: 'flex-start' }}
                      onClick={() => navigate('/users')}
                    >
                      <UsersIcon size={20} />
                      {t('dashboard.manageUsers')}
                    </Button>
                  )}
                  {/* eslint-disable-next-line digdir/require-interactive-labels -- Button has text content */}
                  {isTenantAdmin && (
                    <Button
                      type="button"
                      variant="secondary"
                      style={{ justifyContent: 'flex-start' }}
                      onClick={() => navigate('/settings')}
                    >
                      <SettingsIcon />
                      {t('tenantAdmin.dashboard.settings', { defaultValue: 'Settings' })}
                    </Button>
                  )}
                </div>
              </Card>

              {/* Subscription status card */}
              {subscription && (
                <Card
                  style={{
                    padding: 'var(--ds-spacing-5)',
                    backgroundColor:
                      subscription.status === 'active'
                        ? 'var(--ds-color-success-surface-default)'
                        : 'var(--ds-color-warning-surface-default)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)' }}>
                    <div
                      style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: 'var(--ds-border-radius-full)',
                        backgroundColor:
                          subscription.status === 'active'
                            ? 'var(--ds-color-success-base-default)'
                            : 'var(--ds-color-warning-base-default)',
                      }}
                    />
                    <Paragraph
                      data-size="sm"
                      style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}
                    >
                      {subscription.planName ?? t('tenantAdmin.dashboard.noPlan', { defaultValue: 'No Plan' })}
                    </Paragraph>
                    <Badge
                      data-color={subscription.status === 'active' ? 'success' : 'warning'}
                      style={{ marginLeft: 'auto' }}
                    >
                      {subscription.status}
                    </Badge>
                  </div>
                  {subscription.currentPeriodEnd && (
                    <Paragraph
                      data-size="xs"
                      style={{
                        color: 'var(--ds-color-neutral-text-subtle)',
                        margin: 0,
                        marginTop: 'var(--ds-spacing-2)',
                      }}
                    >
                      {t('tenantAdmin.dashboard.periodEnds', { defaultValue: 'Period ends' })}:{' '}
                      {new Date(subscription.currentPeriodEnd).toLocaleDateString(
                        locale === 'nb' ? 'nb-NO' : 'en-US'
                      )}
                    </Paragraph>
                  )}
                </Card>
              )}

              {/* System status card */}
              <Card
                style={{
                  padding: 'var(--ds-spacing-5)',
                  backgroundColor: 'var(--ds-color-success-surface-default)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)' }}>
                  <ShieldCheckIcon style={{ color: 'var(--ds-color-success-text-default)' }} />
                  <Paragraph
                    data-size="sm"
                    style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}
                  >
                    {t('dashboard.systemStatus')}
                  </Paragraph>
                </div>
                <Paragraph
                  data-size="xs"
                  style={{
                    color: 'var(--ds-color-neutral-text-subtle)',
                    margin: 0,
                    marginTop: 'var(--ds-spacing-2)',
                  }}
                >
                  {t('dashboard.lastUpdated')}:{' '}
                  {new Date().toLocaleTimeString(locale === 'nb' ? 'nb-NO' : 'en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Paragraph>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
