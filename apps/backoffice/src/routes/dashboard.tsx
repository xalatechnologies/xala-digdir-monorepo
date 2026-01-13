import { Card, Heading, Paragraph, Spinner, Button, Badge } from '@xala/ds';
import { useBookings } from '@xala/sdk';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  color?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  } | undefined;
  icon?: React.ReactNode;
}

// Icons
const TrendUpIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

const TrendDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
    <polyline points="17 18 23 18 23 12" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const XCircleIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);

const ClockIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

function StatCard({ title, value, description, color, trend, icon }: StatCardProps) {
  return (
    <Card
      style={{
        padding: 'var(--ds-spacing-5)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--ds-spacing-3)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Paragraph
          data-size="sm"
          style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}
        >
          {title}
        </Paragraph>
        {icon && (
          <div
            style={{
              color: color || 'var(--ds-color-neutral-text-subtle)',
              opacity: 0.5,
            }}
          >
            {icon}
          </div>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--ds-spacing-3)' }}>
        <Heading
          level={3}
          data-size="2xl"
          style={{ color: color || 'var(--ds-color-neutral-text-default)', margin: 0 }}
        >
          {value}
        </Heading>
        {trend && (
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--ds-spacing-1)',
              fontSize: 'var(--ds-font-size-sm)',
              fontWeight: 'var(--ds-font-weight-medium)',
              color: trend.isPositive
                ? 'var(--ds-color-success-text-default)'
                : 'var(--ds-color-danger-text-default)',
            }}
          >
            {trend.isPositive ? <TrendUpIcon /> : <TrendDownIcon />}
            {trend.value}%
          </span>
        )}
      </div>
      {description && (
        <Paragraph
          data-size="xs"
          style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}
        >
          {description}
        </Paragraph>
      )}
    </Card>
  );
}

interface ActivityItemProps {
  title: string;
  description: string;
  time: string;
  status: 'pending' | 'approved' | 'rejected';
}

function ActivityItem({ title, description, time, status }: ActivityItemProps) {
  const statusColors = {
    pending: 'var(--ds-color-warning-text-default)',
    approved: 'var(--ds-color-success-text-default)',
    rejected: 'var(--ds-color-danger-text-default)',
  };

  const statusLabels = {
    pending: 'Venter',
    approved: 'Godkjent',
    rejected: 'Avslått',
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 'var(--ds-spacing-4)',
        padding: 'var(--ds-spacing-4)',
        borderRadius: 'var(--ds-border-radius-md)',
        backgroundColor: 'var(--ds-color-neutral-surface-hover)',
      }}
    >
      <div
        style={{
          width: '8px',
          height: '8px',
          borderRadius: 'var(--ds-border-radius-full)',
          backgroundColor: statusColors[status],
          marginTop: '6px',
          flexShrink: 0,
        }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--ds-spacing-2)' }}>
          <Paragraph
            data-size="sm"
            style={{ fontWeight: 'var(--ds-font-weight-medium)', margin: 0 }}
          >
            {title}
          </Paragraph>
          <Badge data-color={status === 'pending' ? 'warning' : status === 'approved' ? 'success' : 'danger'} data-size="sm">
            {statusLabels[status]}
          </Badge>
        </div>
        <Paragraph
          data-size="xs"
          style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0, marginTop: 'var(--ds-spacing-1)' }}
        >
          {description}
        </Paragraph>
        <Paragraph
          data-size="xs"
          style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0, marginTop: 'var(--ds-spacing-2)' }}
        >
          {time}
        </Paragraph>
      </div>
    </div>
  );
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Akkurat nå';
  if (diffMins < 60) return `For ${diffMins} minutt${diffMins === 1 ? '' : 'er'} siden`;
  if (diffHours < 24) return `For ${diffHours} time${diffHours === 1 ? '' : 'r'} siden`;
  return `For ${diffDays} dag${diffDays === 1 ? '' : 'er'} siden`;
}

function mapBookingStatusToActivity(status: string): 'pending' | 'approved' | 'rejected' {
  switch (status) {
    case 'pending':
      return 'pending';
    case 'confirmed':
      return 'approved';
    case 'cancelled':
    case 'rejected':
      return 'rejected';
    default:
      return 'pending';
  }
}

export function DashboardPage() {
  const { user, isAdmin, isSaksbehandler } = useAuth();
  const navigate = useNavigate();
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
    description: `${booking.listingName || booking.listingId} - ${booking.userName || 'Ukjent'}`,
    time: formatTimeAgo(booking.createdAt),
    status: mapBookingStatusToActivity(booking.status),
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
      {/* Welcome section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Heading level={1} data-size="lg" style={{ margin: 0 }}>
            Velkommen tilbake, {user?.name.split(' ')[0]}
          </Heading>
          <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)', marginTop: 'var(--ds-spacing-2)', marginBottom: 0 }}>
            {isAdmin
              ? 'Du har full tilgang til alle funksjoner i systemet.'
              : isSaksbehandler
              ? 'Her er en oversikt over dagens oppgaver.'
              : 'Du er logget inn.'}
          </Paragraph>
        </div>
        {pendingCount > 0 && (
          <Button
            type="button"
            variant="primary"
            data-color="accent"
            onClick={() => navigate('/bookings?status=pending')}
          >
            Behandle {pendingCount} ventende
            <ArrowRightIcon />
          </Button>
        )}
      </div>

      {/* Stats grid */}
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--ds-spacing-8)' }}>
          <Spinner aria-label="Laster statistikk..." data-size="lg" />
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
            title="Ventende bookinger"
            value={pendingCount}
            description="Krever din behandling"
            color="var(--ds-color-warning-text-default)"
            icon={<ClockIcon />}
            {...(pendingCount > 0 && { trend: { value: 12, isPositive: false as boolean } })}
          />
          <StatCard
            title="Godkjente"
            value={confirmedCount}
            description="Denne måneden"
            color="var(--ds-color-success-text-default)"
            icon={<CheckCircleIcon />}
            trend={{ value: 8, isPositive: true }}
          />
          <StatCard
            title="Avslått"
            value={cancelledCount}
            description="Denne måneden"
            color="var(--ds-color-danger-text-default)"
            icon={<XCircleIcon />}
          />
          <StatCard
            title="Totalt"
            value={totalCount}
            description="Alle bookinger"
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
              Siste aktivitet
            </Heading>
            <Button type="button" variant="tertiary" data-size="sm" onClick={() => navigate('/bookings')}>
              Se alle
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
              Hurtighandlinger
            </Heading>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-2)' }}>
              <Button
                type="button"
                variant="secondary"
                style={{ justifyContent: 'flex-start' }}
                onClick={() => navigate('/bookings?status=pending')}
              >
                <ClockIcon />
                Behandle ventende
              </Button>
              <Button
                type="button"
                variant="secondary"
                style={{ justifyContent: 'flex-start' }}
                onClick={() => navigate('/bookings')}
              >
                <CalendarIcon />
                Se alle bookinger
              </Button>
              {isAdmin && (
                <Button
                  type="button"
                  variant="secondary"
                  style={{ justifyContent: 'flex-start' }}
                  onClick={() => navigate('/users')}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  Administrer brukere
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
                Alle systemer operative
              </Paragraph>
            </div>
            <Paragraph
              data-size="xs"
              style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0, marginTop: 'var(--ds-spacing-2)' }}
            >
              Sist oppdatert: {new Date().toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' })}
            </Paragraph>
          </Card>
        </div>
      </div>
    </div>
  );
}
