/**
 * DashboardPage
 *
 * Mobile-first responsive dashboard using @xalatechnologies/platform/ui shared components.
 * - Uses PageHeader for consistent welcome section
 * - Uses StatCard for KPI display
 * - Uses QuickActionCard for quick actions
 * - Uses ActivityItem for upcoming bookings
 */

import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  Card,
  Heading,
  Paragraph,
  Button,
  Skeleton,
  CalendarIcon,
  MessageSquareIcon,
  ClockIcon,
  SettingsIcon,
  HomeIcon,
  CheckCircleIcon,
  BookingStatusBadge,
  DashboardPageHeader,
  StatCard,
  QuickActionCard,
  EmptyState,
} from '@xalatechnologies/platform/ui';
import { useT } from '@xalatechnologies/platform/i18n';
import { useMyBookings, formatDate, formatTime, type Booking } from '@digilist/client-sdk';
import { useAuth } from '@xalatechnologies/platform/auth';

// Web app URL for booking - can be configured via env
const WEB_APP_URL = import.meta.env.VITE_WEB_APP_URL || 'https://digilist.no';

const MOBILE_BREAKPOINT = 768;

export function DashboardPage() {
  const t = useT();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < MOBILE_BREAKPOINT : false
  );

  // Track viewport size for mobile/desktop detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  // Loading state - Skeleton screen
  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
        {/* Welcome Section Skeleton */}
        <div>
          <Skeleton width="50%" height={40} style={{ marginBottom: 'var(--ds-spacing-2)' }} />
          <Skeleton width="70%" height={20} />
        </div>

        {/* Quick Stats Skeleton */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
          gap: isMobile ? 'var(--ds-spacing-3)' : 'var(--ds-spacing-4)'
        }}>
          {[1, 2, 3].map((i) => (
            <Card key={i} style={{ padding: 'var(--ds-spacing-5)' }}>
              <Skeleton width="60%" height={20} style={{ marginBottom: 'var(--ds-spacing-3)' }} />
              <Skeleton width={60} height={40} />
            </Card>
          ))}
        </div>

        {/* Quick Actions Skeleton */}
        <div>
          <Skeleton width="30%" height={28} style={{ marginBottom: 'var(--ds-spacing-4)' }} />
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
            gap: 'var(--ds-spacing-3)'
          }}>
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} style={{ padding: 'var(--ds-spacing-4)' }}>
                <Skeleton width={48} height={48} style={{ borderRadius: 'var(--ds-border-radius-md)', marginBottom: 'var(--ds-spacing-2)' }} />
                <Skeleton width="80%" height={20} />
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
      {/* Welcome Section - Using DS DashboardPageHeader */}
      <DashboardPageHeader
        title={`${t('minside.welcome')}, ${user?.name?.split(' ')[0] || 'Bruker'}!`}
        subtitle={t('minside.dashboardDesc')}
        primaryAction={
          <Button
            type="button"
            variant="primary"
            onClick={() => window.open(WEB_APP_URL, '_blank')}
          >
            {t('minside.newBooking')}
          </Button>
        }
      />

      {/* Quick Stats - Using DS StatCard */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
        gap: isMobile ? 'var(--ds-spacing-3)' : 'var(--ds-spacing-4)'
      }}>
        <Link to="/bookings" style={{ textDecoration: 'none' }}>
          <StatCard
            title={t('minside.upcomingBookings')}
            value={upcomingBookings.length}
            color="var(--ds-color-success-text-default)"
            icon={<CalendarIcon />}
          />
        </Link>
        
        <Link to="/bookings?status=pending" style={{ textDecoration: 'none' }}>
          <StatCard
            title={t('requests.pending')}
            value={pendingCount}
            color={pendingCount > 0 ? 'var(--ds-color-warning-text-default)' : undefined}
            icon={<ClockIcon />}
          />
        </Link>
        
        <Link to="/bookings" style={{ textDecoration: 'none' }}>
          <StatCard
            title={t('bookings.totalBookings')}
            value={totalBookings}
            icon={<CheckCircleIcon />}
          />
        </Link>
      </div>

      {/* Quick Actions - Using DS QuickActionCard */}
      <div>
        <Heading level={2} data-size="md" style={{ margin: 0, marginBottom: 'var(--ds-spacing-4)' }}>
          {t('common.actions')}
        </Heading>
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
          gap: 'var(--ds-spacing-3)'
        }}>
          <QuickActionCard
            title={t('minside.bookNow')}
            icon={<HomeIcon size={24} />}
            onClick={() => window.open(WEB_APP_URL, '_blank')}
          />
          <QuickActionCard
            title={t('minside.myBookings')}
            icon={<CalendarIcon size={24} />}
            onClick={() => navigate('/bookings')}
          />
          <QuickActionCard
            title={t('nav.messages')}
            icon={<MessageSquareIcon size={24} />}
            onClick={() => navigate('/messages')}
          />
          <QuickActionCard
            title={t('nav.settings')}
            icon={<SettingsIcon size={24} />}
            onClick={() => navigate('/settings')}
          />
        </div>
      </div>

      {/* Upcoming Bookings Section */}
      <Card style={{ padding: isMobile ? 'var(--ds-spacing-4)' : 'var(--ds-spacing-5)' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 'var(--ds-spacing-4)',
        }}>
          <Heading level={2} data-size="md" style={{ margin: 0 }}>
            {t('minside.upcomingBookings')}
          </Heading>
          <Link to="/bookings">
            <Button type="button" variant="tertiary" data-size="sm">
              {t('common.seeAll')}
            </Button>
          </Link>
        </div>

        {upcomingBookings.length === 0 ? (
          <EmptyState
            icon={<CalendarIcon size={48} />}
            title={t('minside.noUpcomingBookings')}
            description={t('minside.noUpcomingBookingsDesc')}
            action={{
              label: t('minside.bookNow'),
              onClick: () => window.open(WEB_APP_URL, '_blank'),
            }}
            size="sm"
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-3)' }}>
            {upcomingBookings.map((booking: Booking) => (
              <div
                key={booking.id}
                style={{
                  padding: isMobile ? 'var(--ds-spacing-3)' : 'var(--ds-spacing-4)',
                  borderRadius: 'var(--ds-border-radius-md)',
                  border: '1px solid var(--ds-color-neutral-border-default)',
                  display: 'flex',
                  flexDirection: isMobile ? 'column' : 'row',
                  justifyContent: 'space-between',
                  alignItems: isMobile ? 'stretch' : 'center',
                  gap: isMobile ? 'var(--ds-spacing-3)' : 'var(--ds-spacing-4)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 'var(--ds-spacing-3)' : 'var(--ds-spacing-4)' }}>
                  <div style={{
                    width: isMobile ? '40px' : '48px',
                    height: isMobile ? '40px' : '48px',
                    borderRadius: 'var(--ds-border-radius-md)',
                    backgroundColor: 'var(--ds-color-brand-1-surface-default)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--ds-color-brand-1-base-default)',
                    flexShrink: 0,
                  }}>
                    <CalendarIcon />
                  </div>
                  <div>
                    <Paragraph data-size="sm" style={{
                      margin: 0,
                      fontWeight: 'var(--ds-font-weight-semibold)',
                      color: 'var(--ds-color-neutral-text-default)',
                    }}>
                      {booking.listingName || booking.rentalObjectId}
                    </Paragraph>
                    <Paragraph data-size="xs" style={{
                      margin: 0,
                      color: 'var(--ds-color-neutral-text-subtle)',
                    }}>
                      {formatDate(booking.startTime)} • {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                    </Paragraph>
                  </div>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--ds-spacing-3)',
                  marginLeft: isMobile ? 'calc(40px + var(--ds-spacing-3))' : '0'
                }}>
                  <Paragraph data-size="sm" style={{
                    margin: 0,
                    fontWeight: 'var(--ds-font-weight-semibold)',
                    color: 'var(--ds-color-neutral-text-default)',
                  }}>
                    {parseFloat(booking.totalPrice ?? '0').toLocaleString('nb-NO')} kr
                  </Paragraph>
                  <BookingStatusBadge status={booking.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
