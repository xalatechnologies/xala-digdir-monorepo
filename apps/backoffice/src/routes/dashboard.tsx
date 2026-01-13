import { 
  Card, 
  Heading, 
  Paragraph, 
  Spinner, 
  Button,
  StatCard,
  ActivityItem,
  formatTimeAgo,
  mapBookingStatusToActivity,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowRightIcon,
  UsersIcon,
  type ActivityItemProps,
} from '@xala/ds';
import { useBookings } from '@digilist/client-sdk';
import { useT, useLocale } from '@xala/i18n';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export function DashboardPage(): React.ReactElement {
  const { user, isAdmin, isSaksbehandler } = useAuth();
  const navigate = useNavigate();
  const t = useT();
  const { locale } = useLocale();
  const { data: pendingBookings, isLoading: loadingPending } = useBookings({ status: 'pending' });
  const { data: confirmedBookings, isLoading: loadingConfirmed } = useBookings({ status: 'confirmed' });
  const { data: cancelledBookings, isLoading: loadingCancelled } = useBookings({ status: 'cancelled' });
  // Fetch recent bookings for activity feed (last 10 regardless of status)
  const { data: recentBookingsData, isLoading: loadingRecent } = useBookings({ limit: 10 });

  const isLoading = loadingPending || loadingConfirmed || loadingCancelled || loadingRecent;

  const pendingCount = pendingBookings?.meta?.total ?? 0;
  const confirmedCount = confirmedBookings?.meta?.total ?? 0;
  const cancelledCount = cancelledBookings?.meta?.total ?? 0;
  const totalCount = pendingCount + confirmedCount + cancelledCount;

  // Transform recent bookings to activity items
  const recentActivity: ActivityItemProps[] = (recentBookingsData?.data ?? []).slice(0, 4).map((booking) => ({
    title: `Booking #${booking.id.slice(-4)}`,
    description: `${booking.listingName || booking.listingId} - ${booking.userName || t('booking.unknown')}`,
    time: formatTimeAgo(booking.createdAt),
    status: mapBookingStatusToActivity(booking.status),
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
      {/* Welcome section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Heading level={1} data-size="lg" style={{ margin: 0 }}>
            {t('dashboard.welcomeBack', { name: user?.name.split(' ')[0] || '' })}
          </Heading>
          <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)', marginTop: 'var(--ds-spacing-2)', marginBottom: 0 }}>
            {isAdmin
              ? t('dashboard.fullAccess')
              : isSaksbehandler
              ? t('dashboard.taskOverview')
              : t('dashboard.loggedIn')}
          </Paragraph>
        </div>
        {pendingCount > 0 && (
          <Button
            type="button"
            variant="primary"
            data-color="accent"
            onClick={() => navigate('/bookings?status=pending')}
          >
            {t('dashboard.processPending', { count: pendingCount })}
            <ArrowRightIcon />
          </Button>
        )}
      </div>

      {/* Stats grid */}
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--ds-spacing-8)' }}>
          <Spinner aria-label={t('dashboard.loadingStats')} data-size="lg" />
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 'var(--ds-spacing-4)',
          }}
        >
          <StatCard
            title={t('dashboard.pendingBookings')}
            value={pendingCount}
            description={t('dashboard.requiresAction')}
            color="var(--ds-color-warning-text-default)"
            icon={<ClockIcon />}
            {...(pendingCount > 0 && { trend: { value: 12, isPositive: false as boolean } })}
          />
          <StatCard
            title={t('dashboard.approved')}
            value={confirmedCount}
            description={t('dashboard.thisMonth')}
            color="var(--ds-color-success-text-default)"
            icon={<CheckCircleIcon />}
            trend={{ value: 8, isPositive: true }}
          />
          <StatCard
            title={t('dashboard.rejected')}
            value={cancelledCount}
            description={t('dashboard.thisMonth')}
            color="var(--ds-color-danger-text-default)"
            icon={<XCircleIcon />}
          />
          <StatCard
            title={t('dashboard.total')}
            value={totalCount}
            description={t('dashboard.allBookings')}
            icon={<CalendarIcon />}
            trend={{ value: 15, isPositive: true }}
          />
        </div>
      )}

      {/* Two column layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: 'var(--ds-spacing-6)',
        }}
      >
        {/* Recent activity */}
        <Card style={{ padding: 'var(--ds-spacing-5)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--ds-spacing-4)' }}>
            <Heading level={2} data-size="sm" style={{ margin: 0 }}>
              {t('dashboard.recentActivity')}
            </Heading>
            <Button type="button" variant="tertiary" data-size="sm" onClick={() => navigate('/bookings')}>
              {t('common.seeAll')}
            </Button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-3)' }}>
            {recentActivity.map((activity, index) => (
              <ActivityItem key={index} {...activity} />
            ))}
          </div>
        </Card>

        {/* Quick actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
          <Card style={{ padding: 'var(--ds-spacing-5)' }}>
            <Heading level={2} data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-4)' }}>
              {t('dashboard.quickActions')}
            </Heading>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-2)' }}>
              <Button
                type="button"
                variant="secondary"
                style={{ justifyContent: 'flex-start' }}
                onClick={() => navigate('/bookings?status=pending')}
              >
                <ClockIcon />
                {t('dashboard.processPendingBtn')}
              </Button>
              <Button
                type="button"
                variant="secondary"
                style={{ justifyContent: 'flex-start' }}
                onClick={() => navigate('/bookings')}
              >
                <CalendarIcon />
                {t('dashboard.viewAllBookings')}
              </Button>
              {isAdmin && (
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
            </div>
          </Card>

          {/* System status card */}
          <Card style={{ padding: 'var(--ds-spacing-5)', backgroundColor: 'var(--ds-color-success-surface-default)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)' }}>
              <div
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: 'var(--ds-border-radius-full)',
                  backgroundColor: 'var(--ds-color-success-base-default)',
                }}
              />
              <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
                {t('dashboard.systemStatus')}
              </Paragraph>
            </div>
            <Paragraph
              data-size="xs"
              style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0, marginTop: 'var(--ds-spacing-2)' }}
            >
              {t('dashboard.lastUpdated')}: {new Date().toLocaleTimeString(locale === 'nb' ? 'nb-NO' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
            </Paragraph>
          </Card>
        </div>
      </div>
    </div>
  );
}
