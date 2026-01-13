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
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export function DashboardPage(): React.ReactElement {
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
                  <UsersIcon size={20} />
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
