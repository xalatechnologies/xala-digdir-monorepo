import { Link } from 'react-router-dom';
import { Card, Heading, Paragraph, Button, Spinner, CalendarIcon, ChatIcon, SettingsIcon } from '@xala/ds';
import { useT } from '@xala/i18n';
import { useMyBookings, formatDate, formatTime, type Booking } from '@digilist/client-sdk';
import { useAuth } from '../hooks/useAuth';

// Web app URL for booking - can be configured via env
const WEB_APP_URL = import.meta.env.VITE_WEB_APP_URL || 'https://digilist.no';

// Styles for premium design
const styles = {
  heroGradient: {
    background: 'linear-gradient(135deg, var(--ds-color-brand-1-surface-default) 0%, var(--ds-color-brand-2-surface-default) 100%)',
    borderRadius: 'var(--ds-border-radius-lg)',
    padding: 'var(--ds-spacing-8)',
    marginBottom: 'var(--ds-spacing-6)',
    color: 'white',
  },
  statCard: {
    padding: 'var(--ds-spacing-5)',
    borderRadius: 'var(--ds-border-radius-md)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    cursor: 'pointer',
  },
  statCardHover: {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
  },
  iconContainer: {
    width: '40px',
    height: '40px',
    borderRadius: 'var(--ds-border-radius-md)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 'var(--ds-spacing-3)',
  },
  bookingCard: {
    padding: 'var(--ds-spacing-4)',
    borderRadius: 'var(--ds-border-radius-md)',
    border: '1px solid var(--ds-color-neutral-border-default)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
  },
  quickAction: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    padding: 'var(--ds-spacing-4)',
    borderRadius: 'var(--ds-border-radius-md)',
    border: '1px solid var(--ds-color-neutral-border-default)',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    textDecoration: 'none',
    color: 'inherit',
  },
};

export function DashboardPage() {
  const t = useT();
  const { user } = useAuth();

  // Fetch user's upcoming bookings (confirmed only, sorted by start time)
  const { data: bookingsData, isLoading } = useMyBookings({ status: 'confirmed' });
  const upcomingBookings = (bookingsData?.data ?? [])
    .filter((b: Booking) => new Date(b.startTime) >= new Date())
    .slice(0, 5);

  // Count stats
  const { data: pendingData } = useMyBookings({ status: 'pending' });
  const { data: allData } = useMyBookings();
  
  const pendingCount = pendingData?.meta?.total ?? 0;
  const totalBookings = allData?.meta?.total ?? 0;

  // Get status color
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'confirmed':
        return { backgroundColor: 'var(--ds-color-success-surface-default)', color: 'var(--ds-color-success-text-default)' };
      case 'pending':
        return { backgroundColor: 'var(--ds-color-warning-surface-default)', color: 'var(--ds-color-warning-text-default)' };
      case 'cancelled':
        return { backgroundColor: 'var(--ds-color-danger-surface-default)', color: 'var(--ds-color-danger-text-default)' };
      default:
        return { backgroundColor: 'var(--ds-color-neutral-surface-hover)', color: 'var(--ds-color-neutral-text-default)' };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
      {/* Hero Welcome Section */}
      <div style={styles.heroGradient}>
        <Heading level={1} data-size="xl" style={{ margin: 0, color: 'white' }}>
          {t('minside.welcome')}, {user?.name?.split(' ')[0] || 'Bruker'}! 👋
        </Heading>
        <Paragraph style={{ color: 'rgba(255,255,255,0.9)', marginTop: 'var(--ds-spacing-2)', marginBottom: 'var(--ds-spacing-4)', fontSize: 'var(--ds-font-size-md)' }}>
          {t('minside.dashboardDesc')}
        </Paragraph>
        <a href={WEB_APP_URL} target="_blank" rel="noopener noreferrer">
          <Button type="button" variant="secondary" data-size="md" style={{ backgroundColor: 'white', color: 'var(--ds-color-brand-1-base-default)' }}>
            {t('minside.bookNow')} →
          </Button>
        </a>
      </div>

      {/* Quick Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--ds-spacing-4)' }}>
        <Link to="/bookings" style={{ textDecoration: 'none' }}>
          <Card style={{ ...styles.statCard, borderLeft: '4px solid var(--ds-color-success-base-default)' }}>
            <div style={{ ...styles.iconContainer, backgroundColor: 'var(--ds-color-success-surface-default)' }}>
              <span style={{ fontSize: '20px' }}>📅</span>
            </div>
            <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-default)', margin: 0, fontWeight: 500 }}>
              {t('minside.upcomingBookings')}
            </Paragraph>
            <Heading level={2} data-size="2xl" style={{ margin: 0, marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-success-text-default)' }}>
              {upcomingBookings.length}
            </Heading>
          </Card>
        </Link>
        
        <Link to="/bookings?status=pending" style={{ textDecoration: 'none' }}>
          <Card style={{ ...styles.statCard, borderLeft: '4px solid var(--ds-color-warning-base-default)' }}>
            <div style={{ ...styles.iconContainer, backgroundColor: 'var(--ds-color-warning-surface-default)' }}>
              <span style={{ fontSize: '20px' }}>⏳</span>
            </div>
            <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-default)', margin: 0, fontWeight: 500 }}>
              {t('requests.pending')}
            </Paragraph>
            <Heading level={2} data-size="2xl" style={{ margin: 0, marginTop: 'var(--ds-spacing-1)', color: pendingCount > 0 ? 'var(--ds-color-warning-text-default)' : undefined }}>
              {pendingCount}
            </Heading>
          </Card>
        </Link>
        
        <Link to="/bookings" style={{ textDecoration: 'none' }}>
          <Card style={{ ...styles.statCard, borderLeft: '4px solid var(--ds-color-brand-1-base-default)' }}>
            <div style={{ ...styles.iconContainer, backgroundColor: 'var(--ds-color-brand-1-surface-default)' }}>
              <span style={{ fontSize: '20px' }}>📊</span>
            </div>
            <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-default)', margin: 0, fontWeight: 500 }}>
              {t('bookings.totalBookings')}
            </Paragraph>
            <Heading level={2} data-size="2xl" style={{ margin: 0, marginTop: 'var(--ds-spacing-1)' }}>
              {totalBookings}
            </Heading>
          </Card>
        </Link>
      </div>

      {/* Quick Actions */}
      <div>
        <Heading level={2} data-size="md" style={{ margin: 0, marginBottom: 'var(--ds-spacing-4)' }}>
          {t('common.actions')}
        </Heading>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--ds-spacing-3)' }}>
          <a href={WEB_APP_URL} target="_blank" rel="noopener noreferrer" style={styles.quickAction}>
            <span style={{ fontSize: '28px', marginBottom: 'var(--ds-spacing-2)' }}>🏠</span>
            <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 500, textAlign: 'center' }}>
              {t('minside.bookNow')}
            </Paragraph>
          </a>
          <Link to="/bookings" style={styles.quickAction}>
            <span style={{ fontSize: '28px', marginBottom: 'var(--ds-spacing-2)' }}>📋</span>
            <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 500, textAlign: 'center' }}>
              {t('minside.myBookings')}
            </Paragraph>
          </Link>
          <Link to="/messages" style={styles.quickAction}>
            <span style={{ fontSize: '28px', marginBottom: 'var(--ds-spacing-2)' }}>💬</span>
            <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 500, textAlign: 'center' }}>
              {t('minside.messages')}
            </Paragraph>
          </Link>
          <Link to="/settings" style={styles.quickAction}>
            <span style={{ fontSize: '28px', marginBottom: 'var(--ds-spacing-2)' }}>⚙️</span>
            <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 500, textAlign: 'center' }}>
              {t('minside.settings')}
            </Paragraph>
          </Link>
        </div>
      </div>

      {/* Upcoming Bookings */}
      <Card style={{ padding: 'var(--ds-spacing-5)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--ds-spacing-4)' }}>
          <Heading level={2} data-size="md" style={{ margin: 0 }}>
            {t('minside.upcomingBookings')}
          </Heading>
          <Link to="/bookings">
            <Button type="button" variant="tertiary" data-size="sm">
              {t('minside.viewAll')} →
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div style={{ padding: 'var(--ds-spacing-8)', display: 'flex', justifyContent: 'center' }}>
            <Spinner aria-label={t('common.loading')} data-size="md" />
          </div>
        ) : upcomingBookings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--ds-spacing-8)', backgroundColor: 'var(--ds-color-neutral-surface-hover)', borderRadius: 'var(--ds-border-radius-md)' }}>
            <span style={{ fontSize: '48px', display: 'block', marginBottom: 'var(--ds-spacing-4)' }}>📭</span>
            <Paragraph style={{ color: 'var(--ds-color-neutral-text-default)', margin: 0, marginBottom: 'var(--ds-spacing-4)' }}>
              {t('minside.noUpcomingBookings')}
            </Paragraph>
            <a href={WEB_APP_URL} target="_blank" rel="noopener noreferrer">
              <Button type="button" variant="primary" data-size="md">
                {t('minside.bookNow')}
              </Button>
            </a>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-3)' }}>
            {upcomingBookings.map((booking: Booking) => (
              <Link key={booking.id} to={`/bookings?id=${booking.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={styles.bookingCard}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-4)' }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: 'var(--ds-border-radius-md)',
                      backgroundColor: 'var(--ds-color-brand-1-surface-default)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '20px',
                    }}>
                      🏟️
                    </div>
                    <div>
                      <Paragraph data-size="md" style={{ margin: 0, fontWeight: 600, color: 'var(--ds-color-neutral-text-default)' }}>
                        {booking.listingName || booking.listingId}
                      </Paragraph>
                      <Paragraph data-size="sm" style={{ margin: 0, marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-neutral-text-default)' }}>
                        📅 {formatDate(booking.startTime)} • 🕐 {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                      </Paragraph>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)' }}>
                    {booking.totalPrice && (
                      <Paragraph data-size="md" style={{ margin: 0, fontWeight: 600 }}>
                        {booking.totalPrice.toLocaleString('nb-NO')} kr
                      </Paragraph>
                    )}
                    <div
                      style={{
                        padding: 'var(--ds-spacing-2) var(--ds-spacing-3)',
                        borderRadius: 'var(--ds-border-radius-full)',
                        fontSize: 'var(--ds-font-size-sm)',
                        fontWeight: 500,
                        ...getStatusStyle(booking.status),
                      }}
                    >
                      {booking.status === 'confirmed' ? t('booking.confirmed') : 
                       booking.status === 'pending' ? t('requests.pending') : 
                       booking.status === 'cancelled' ? t('booking.cancelled') : booking.status}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
