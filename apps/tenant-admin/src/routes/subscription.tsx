/**
 * Subscription Page - Tenant Admin App (Read-Only)
 *
 * Displays current subscription details including:
 * - Plan information and status
 * - Billing period dates
 * - Seat usage vs limits
 * - Storage usage
 *
 * This is a read-only view. Subscription changes are managed by SaaS Admin.
 */

import {
  Card,
  Heading,
  Paragraph,
  Spinner,
  Badge,
  StatCard,
  Progress,
  Alert,
  UsersIcon,
  OrganizationIcon,
  CalendarIcon,
  BuildingIcon,
  StorageIcon,
  CreditCardIcon,
  ClockIcon,
  InfoIcon,
} from '@xala/ds';
import { useTenantSubscription } from '@digilist/client-sdk';
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
function getUsageColor(percent: number): 'success' | 'warning' | 'danger' {
  if (percent >= 90) return 'danger';
  if (percent >= 75) return 'warning';
  return 'success';
}

/**
 * Get CSS color variable based on usage percentage
 */
function getUsageColorVar(percent: number): string {
  if (percent >= 90) return 'var(--ds-color-danger-text-default)';
  if (percent >= 75) return 'var(--ds-color-warning-text-default)';
  return 'var(--ds-color-success-text-default)';
}

/**
 * Format storage size in human-readable format
 */
function formatStorage(mb: number): string {
  if (mb >= 1024) {
    return `${(mb / 1024).toFixed(1)} GB`;
  }
  return `${mb} MB`;
}

/**
 * Get status badge color
 */
function getStatusColor(status: string): 'success' | 'warning' | 'danger' | 'neutral' {
  switch (status) {
    case 'active':
      return 'success';
    case 'trialing':
      return 'info' as 'success'; // Use success for trialing display
    case 'past_due':
      return 'warning';
    case 'cancelled':
    case 'suspended':
      return 'danger';
    default:
      return 'neutral';
  }
}

/**
 * Format status for display
 */
function formatStatus(status: string): string {
  const statusMap: Record<string, string> = {
    active: 'Aktiv',
    trialing: 'Prøveperiode',
    past_due: 'Forfalt',
    cancelled: 'Kansellert',
    suspended: 'Suspendert',
    pending: 'Venter',
  };
  return statusMap[status] ?? status;
}

export function SubscriptionPage(): React.ReactElement {
  const { isBillingAdmin, isTenantAdmin } = useAuth();
  const t = useT();
  const { locale } = useLocale();

  // Fetch subscription data
  const { data: subscriptionData, isLoading, error } = useTenantSubscription();
  const subscription = subscriptionData?.subscription;

  // Extract usage and limits
  const usage = subscription?.usage;
  const limits = subscription?.seatLimits;

  // Format date for display
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString(locale === 'nb' ? 'nb-NO' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Calculate days remaining in period
  const getDaysRemaining = (): number | null => {
    if (!subscription?.currentPeriodEnd) return null;
    const end = new Date(subscription.currentPeriodEnd);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  };

  const daysRemaining = getDaysRemaining();

  // Check access
  if (!isBillingAdmin && !isTenantAdmin) {
    return (
      <Alert data-color="warning">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
          <InfoIcon />
          {t('tenantAdmin.subscription.noAccess', {
            defaultValue: 'You do not have permission to view subscription details.',
          })}
        </div>
      </Alert>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--ds-spacing-8)' }}>
        <Spinner data-size="lg" aria-label={t('common.loading', { defaultValue: 'Loading...' })} />
      </div>
    );
  }

  // Error state
  if (error || !subscription) {
    return (
      <Alert data-color="danger">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
          <InfoIcon />
          {t('tenantAdmin.subscription.loadError', {
            defaultValue: 'Failed to load subscription details. Please try again later.',
          })}
        </div>
      </Alert>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
      {/* Header */}
      <div>
        <Heading level={1} data-size="lg" style={{ margin: 0 }}>
          {t('tenantAdmin.subscription.title', { defaultValue: 'Subscription' })}
        </Heading>
        <Paragraph
          style={{
            color: 'var(--ds-color-neutral-text-subtle)',
            marginTop: 'var(--ds-spacing-2)',
            marginBottom: 0,
          }}
        >
          {t('tenantAdmin.subscription.description', {
            defaultValue: 'View your current plan and resource usage',
          })}
        </Paragraph>
      </div>

      {/* Plan Overview Card */}
      <Card style={{ padding: 'var(--ds-spacing-5)' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 'var(--ds-spacing-5)',
          }}
        >
          <div>
            <Heading level={2} data-size="sm" style={{ margin: 0 }}>
              <CreditCardIcon
                style={{ marginRight: 'var(--ds-spacing-2)', verticalAlign: 'middle' }}
              />
              {t('tenantAdmin.subscription.planOverview', { defaultValue: 'Plan Overview' })}
            </Heading>
          </div>
          <Badge data-color={getStatusColor(subscription.status)}>
            {formatStatus(subscription.status)}
          </Badge>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 'var(--ds-spacing-5)',
          }}
        >
          {/* Plan Name */}
          <div>
            <Paragraph
              data-size="sm"
              style={{
                margin: 0,
                marginBottom: 'var(--ds-spacing-1)',
                color: 'var(--ds-color-neutral-text-subtle)',
              }}
            >
              {t('tenantAdmin.subscription.plan', { defaultValue: 'Plan' })}
            </Paragraph>
            <Paragraph
              data-size="md"
              style={{ margin: 0, fontWeight: 'var(--ds-font-weight-semibold)' }}
            >
              {subscription.planName ?? t('tenantAdmin.subscription.noPlan', { defaultValue: 'No Plan' })}
            </Paragraph>
          </div>

          {/* Period Start */}
          <div>
            <Paragraph
              data-size="sm"
              style={{
                margin: 0,
                marginBottom: 'var(--ds-spacing-1)',
                color: 'var(--ds-color-neutral-text-subtle)',
              }}
            >
              {t('tenantAdmin.subscription.periodStart', { defaultValue: 'Period Start' })}
            </Paragraph>
            <Paragraph data-size="md" style={{ margin: 0 }}>
              {formatDate(subscription.currentPeriodStart)}
            </Paragraph>
          </div>

          {/* Period End */}
          <div>
            <Paragraph
              data-size="sm"
              style={{
                margin: 0,
                marginBottom: 'var(--ds-spacing-1)',
                color: 'var(--ds-color-neutral-text-subtle)',
              }}
            >
              {t('tenantAdmin.subscription.periodEnd', { defaultValue: 'Period End' })}
            </Paragraph>
            <Paragraph data-size="md" style={{ margin: 0 }}>
              {formatDate(subscription.currentPeriodEnd)}
              {daysRemaining !== null && daysRemaining <= 30 && (
                <Badge
                  data-color={daysRemaining <= 7 ? 'warning' : 'neutral'}
                  style={{ marginLeft: 'var(--ds-spacing-2)' }}
                >
                  <ClockIcon style={{ marginRight: 'var(--ds-spacing-1)' }} />
                  {daysRemaining}{' '}
                  {t('tenantAdmin.subscription.daysRemaining', { defaultValue: 'days remaining' })}
                </Badge>
              )}
            </Paragraph>
          </div>
        </div>
      </Card>

      {/* Seat Usage Stats */}
      <div>
        <Heading level={2} data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-4)' }}>
          {t('tenantAdmin.subscription.seatUsage', { defaultValue: 'Seat Usage' })}
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
            color={getUsageColorVar(
              calculateUsagePercent(usage?.currentUsers ?? 0, limits?.maxUsers ?? 1)
            )}
            icon={<UsersIcon />}
          />
          <StatCard
            title={t('tenantAdmin.dashboard.organizations', { defaultValue: 'Organizations' })}
            value={usage?.currentOrganizations ?? 0}
            description={`${t('tenantAdmin.dashboard.of', { defaultValue: 'of' })} ${limits?.maxOrganizations ?? 0} ${t('tenantAdmin.dashboard.max', { defaultValue: 'max' })}`}
            color={getUsageColorVar(
              calculateUsagePercent(usage?.currentOrganizations ?? 0, limits?.maxOrganizations ?? 1)
            )}
            icon={<OrganizationIcon />}
          />
          <StatCard
            title={t('tenantAdmin.dashboard.listings', { defaultValue: 'Listings' })}
            value={usage?.currentListings ?? 0}
            description={`${t('tenantAdmin.dashboard.of', { defaultValue: 'of' })} ${limits?.maxListings ?? 0} ${t('tenantAdmin.dashboard.max', { defaultValue: 'max' })}`}
            color={getUsageColorVar(
              calculateUsagePercent(usage?.currentListings ?? 0, limits?.maxListings ?? 1)
            )}
            icon={<BuildingIcon />}
          />
          <StatCard
            title={t('tenantAdmin.dashboard.bookingsThisMonth', { defaultValue: 'Bookings/Month' })}
            value={usage?.bookingsThisMonth ?? 0}
            description={`${t('tenantAdmin.dashboard.of', { defaultValue: 'of' })} ${limits?.maxBookingsPerMonth ?? 0} ${t('tenantAdmin.dashboard.max', { defaultValue: 'max' })}`}
            color={getUsageColorVar(
              calculateUsagePercent(usage?.bookingsThisMonth ?? 0, limits?.maxBookingsPerMonth ?? 1)
            )}
            icon={<CalendarIcon />}
          />
        </div>
      </div>

      {/* Detailed Usage Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 'var(--ds-spacing-5)',
        }}
      >
        {/* Resource Limits */}
        <Card style={{ padding: 'var(--ds-spacing-5)' }}>
          <Heading
            level={2}
            data-size="sm"
            style={{ margin: 0, marginBottom: 'var(--ds-spacing-4)' }}
          >
            {t('tenantAdmin.subscription.resourceLimits', { defaultValue: 'Resource Limits' })}
          </Heading>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
            {/* Users */}
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 'var(--ds-spacing-2)',
                }}
              >
                <Paragraph data-size="sm" style={{ margin: 0 }}>
                  <UsersIcon
                    style={{ marginRight: 'var(--ds-spacing-2)', verticalAlign: 'middle' }}
                  />
                  {t('tenantAdmin.dashboard.users', { defaultValue: 'Users' })}
                </Paragraph>
                <Paragraph data-size="sm" style={{ margin: 0 }}>
                  {usage?.currentUsers ?? 0} / {limits?.maxUsers ?? 0}
                </Paragraph>
              </div>
              <Progress
                value={calculateUsagePercent(usage?.currentUsers ?? 0, limits?.maxUsers ?? 1)}
                data-color={getUsageColor(
                  calculateUsagePercent(usage?.currentUsers ?? 0, limits?.maxUsers ?? 1)
                )}
              />
            </div>

            {/* Organizations */}
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 'var(--ds-spacing-2)',
                }}
              >
                <Paragraph data-size="sm" style={{ margin: 0 }}>
                  <OrganizationIcon
                    style={{ marginRight: 'var(--ds-spacing-2)', verticalAlign: 'middle' }}
                  />
                  {t('tenantAdmin.dashboard.organizations', { defaultValue: 'Organizations' })}
                </Paragraph>
                <Paragraph data-size="sm" style={{ margin: 0 }}>
                  {usage?.currentOrganizations ?? 0} / {limits?.maxOrganizations ?? 0}
                </Paragraph>
              </div>
              <Progress
                value={calculateUsagePercent(
                  usage?.currentOrganizations ?? 0,
                  limits?.maxOrganizations ?? 1
                )}
                data-color={getUsageColor(
                  calculateUsagePercent(
                    usage?.currentOrganizations ?? 0,
                    limits?.maxOrganizations ?? 1
                  )
                )}
              />
            </div>

            {/* Listings */}
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 'var(--ds-spacing-2)',
                }}
              >
                <Paragraph data-size="sm" style={{ margin: 0 }}>
                  <BuildingIcon
                    style={{ marginRight: 'var(--ds-spacing-2)', verticalAlign: 'middle' }}
                  />
                  {t('tenantAdmin.dashboard.listings', { defaultValue: 'Listings' })}
                </Paragraph>
                <Paragraph data-size="sm" style={{ margin: 0 }}>
                  {usage?.currentListings ?? 0} / {limits?.maxListings ?? 0}
                </Paragraph>
              </div>
              <Progress
                value={calculateUsagePercent(usage?.currentListings ?? 0, limits?.maxListings ?? 1)}
                data-color={getUsageColor(
                  calculateUsagePercent(usage?.currentListings ?? 0, limits?.maxListings ?? 1)
                )}
              />
            </div>

            {/* Bookings per month */}
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 'var(--ds-spacing-2)',
                }}
              >
                <Paragraph data-size="sm" style={{ margin: 0 }}>
                  <CalendarIcon
                    style={{ marginRight: 'var(--ds-spacing-2)', verticalAlign: 'middle' }}
                  />
                  {t('tenantAdmin.dashboard.bookingsThisMonth', { defaultValue: 'Bookings/Month' })}
                </Paragraph>
                <Paragraph data-size="sm" style={{ margin: 0 }}>
                  {usage?.bookingsThisMonth ?? 0} / {limits?.maxBookingsPerMonth ?? 0}
                </Paragraph>
              </div>
              <Progress
                value={calculateUsagePercent(
                  usage?.bookingsThisMonth ?? 0,
                  limits?.maxBookingsPerMonth ?? 1
                )}
                data-color={getUsageColor(
                  calculateUsagePercent(
                    usage?.bookingsThisMonth ?? 0,
                    limits?.maxBookingsPerMonth ?? 1
                  )
                )}
              />
            </div>
          </div>
        </Card>

        {/* Storage Usage */}
        <Card style={{ padding: 'var(--ds-spacing-5)' }}>
          <Heading
            level={2}
            data-size="sm"
            style={{ margin: 0, marginBottom: 'var(--ds-spacing-4)' }}
          >
            {t('tenantAdmin.subscription.storageUsage', { defaultValue: 'Storage Usage' })}
          </Heading>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: 'var(--ds-spacing-4)',
            }}
          >
            {/* Large storage display */}
            <div
              style={{
                position: 'relative',
                width: '160px',
                height: '160px',
                borderRadius: 'var(--ds-border-radius-full)',
                background: `conic-gradient(
                  ${getUsageColorVar(calculateUsagePercent(usage?.storageMb ?? 0, limits?.maxStorageMb ?? 1))} ${calculateUsagePercent(usage?.storageMb ?? 0, limits?.maxStorageMb ?? 1)}%,
                  var(--ds-color-neutral-surface-subtle) ${calculateUsagePercent(usage?.storageMb ?? 0, limits?.maxStorageMb ?? 1)}%
                )`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 'var(--ds-spacing-4)',
              }}
            >
              <div
                style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: 'var(--ds-border-radius-full)',
                  backgroundColor: 'var(--ds-color-neutral-background-default)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <StorageIcon
                  style={{
                    fontSize: 'var(--ds-font-size-heading-md)',
                    color: getUsageColorVar(
                      calculateUsagePercent(usage?.storageMb ?? 0, limits?.maxStorageMb ?? 1)
                    ),
                    marginBottom: 'var(--ds-spacing-1)',
                  }}
                />
                <Paragraph
                  data-size="lg"
                  style={{
                    margin: 0,
                    fontWeight: 'var(--ds-font-weight-bold)',
                    color: getUsageColorVar(
                      calculateUsagePercent(usage?.storageMb ?? 0, limits?.maxStorageMb ?? 1)
                    ),
                  }}
                >
                  {calculateUsagePercent(usage?.storageMb ?? 0, limits?.maxStorageMb ?? 1)}%
                </Paragraph>
              </div>
            </div>

            <Paragraph data-size="md" style={{ margin: 0, textAlign: 'center' }}>
              {formatStorage(usage?.storageMb ?? 0)}{' '}
              {t('tenantAdmin.dashboard.of', { defaultValue: 'of' })}{' '}
              {formatStorage(limits?.maxStorageMb ?? 0)}
            </Paragraph>
            <Paragraph
              data-size="sm"
              style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)', textAlign: 'center' }}
            >
              {t('tenantAdmin.subscription.storageAvailable', {
                amount: formatStorage((limits?.maxStorageMb ?? 0) - (usage?.storageMb ?? 0)),
                defaultValue: `${formatStorage((limits?.maxStorageMb ?? 0) - (usage?.storageMb ?? 0))} available`,
              })}
            </Paragraph>
          </div>
        </Card>
      </div>

      {/* Info notice */}
      <Card
        style={{
          padding: 'var(--ds-spacing-4)',
          backgroundColor: 'var(--ds-color-info-surface-default)',
          border: '1px solid var(--ds-color-info-border-subtle)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--ds-spacing-3)' }}>
          <InfoIcon
            style={{
              color: 'var(--ds-color-info-text-default)',
              flexShrink: 0,
              marginTop: '2px',
            }}
          />
          <div>
            <Paragraph
              data-size="sm"
              style={{ margin: 0, fontWeight: 'var(--ds-font-weight-semibold)' }}
            >
              {t('tenantAdmin.subscription.contactAdmin', {
                defaultValue: 'Need to change your subscription?',
              })}
            </Paragraph>
            <Paragraph
              data-size="sm"
              style={{ margin: 0, marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-neutral-text-subtle)' }}
            >
              {t('tenantAdmin.subscription.contactAdminDescription', {
                defaultValue:
                  'To upgrade your plan, increase limits, or make changes to your subscription, please contact your platform administrator or support.',
              })}
            </Paragraph>
          </div>
        </div>
      </Card>
    </div>
  );
}
