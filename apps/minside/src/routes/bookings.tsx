/**
 * BookingsPage
 *
 * Mobile-first responsive bookings page using @xalatechnologies/platform/ui shared components.
 * - Uses PageHeader for consistent page title
 * - Uses StatCard for stat display
 * - Uses ListToolbar for search/filters
 * - Uses DataTable for desktop, mobile cards handled inline
 * - Uses EmptyState for empty/error states
 */

import { useState, useMemo, useEffect } from 'react';
import {
  Card,
  Heading,
  Paragraph,
  Button,
  Table,
  BookingStatusBadge,
  useDialog,
  CalendarIcon,
  ClockIcon,
  Link,
  DashboardPageHeader,
  StatCard,
  ListToolbar,
  EmptyState,
  Spinner,
  type ListToolbarFilter,
} from '@xalatechnologies/platform/ui';
import {
  useCancelBooking,
  type BookingStatus,
  type Booking,
  formatDate,
  formatTime,
} from '@digilist/client-sdk';
import { useT, useLocale } from '@xalatechnologies/platform/i18n';
import { useOfflineBookings } from '../hooks/useOfflineBookings';

// Web app URL for new bookings
const WEB_APP_URL = import.meta.env.VITE_WEB_APP_URL || 'https://digilist.no';

// Mobile breakpoint
const MOBILE_BREAKPOINT = 768;

export function BookingsPage() {
  const t = useT();
  const { locale } = useLocale();
  const [statusFilter, setStatusFilter] = useState<BookingStatus | undefined>(undefined);
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

  // Fetch all bookings once - we'll filter client-side for reliability
  const { data: allData, isLoading, isOffline, isCached } = useOfflineBookings();
  
  // Filter bookings client-side based on statusFilter
  const bookings = useMemo(() => {
    const allBookings = allData?.data ?? [];
    if (!statusFilter) return allBookings;
    
    // Handle status mapping for canonical states
    if (statusFilter === 'confirmed') {
      return allBookings.filter(b => 
        b.status === 'confirmed' || (b.status as string) === 'approved'
      );
    }
    if (statusFilter === 'pending') {
      return allBookings.filter(b => 
        b.status === 'pending' || (b.status as string) === 'pending_approval'
      );
    }
    if (statusFilter === 'cancelled') {
      return allBookings.filter(b => 
        b.status === 'cancelled' || (b.status as string) === 'rejected'
      );
    }
    return allBookings.filter(b => b.status === statusFilter);
  }, [allData, statusFilter]);

  const cancelBooking = useCancelBooking();
  const { confirm } = useDialog();

  const handleCancel = async (id: string) => {
    const confirmed = await confirm({
      title: t('bookings.cancelBooking'),
      description: t('bookings.confirmCancel'),
      confirmText: t('bookings.cancel'),
      cancelText: t('common.abort'),
      variant: 'danger',
    });
    if (confirmed) {
      await cancelBooking.mutateAsync({ id });
    }
  };

  // Calculate stats from actual booking data
  const stats = useMemo(() => {
    const allBookings = allData?.data ?? [];
    const total = allBookings.length;
    
    const confirmed = allBookings.filter(b => 
      b.status === 'confirmed' || (b.status as string) === 'approved'
    ).length;
    const pending = allBookings.filter(b => 
      b.status === 'pending' || (b.status as string) === 'pending_approval'
    ).length;
    const cancelled = allBookings.filter(b => 
      b.status === 'cancelled' || (b.status as string) === 'rejected'
    ).length;
    
    return { total, confirmed, pending, cancelled };
  }, [allData]);

  // Filter configuration for ListToolbar
  const statusFilters: ListToolbarFilter[] = [{
    id: 'status',
    label: t('label.status'),
    options: [
      { id: 'all', label: t('bookings.all'), count: stats.total },
      { id: 'confirmed', label: t('booking.confirmed'), count: stats.confirmed },
      { id: 'pending', label: t('requests.pending'), count: stats.pending },
      { id: 'cancelled', label: t('state.cancelled'), count: stats.cancelled },
    ],
  }];

  const handleFilterChange = (filterId: string, value: string | undefined) => {
    if (filterId === 'status') {
      if (value === 'all' || !value) {
        setStatusFilter(undefined);
      } else {
        setStatusFilter(value as BookingStatus);
      }
    }
  };

  // Primary action button
  const primaryAction = (
    <Link href={WEB_APP_URL} target="_blank" rel="noopener noreferrer">
      <Button
        data-testid="create-booking-button"
        type="button"
        variant="primary"
        data-size="md"
        style={{ minHeight: '44px' }}
      >
        {t('minside.bookNow')}
      </Button>
    </Link>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
      {/* Offline Indicator */}
      {isOffline && isCached && (
        <Card
          data-color="warning"
          style={{
            padding: 'var(--ds-spacing-4)',
            borderLeft: '4px solid var(--ds-color-warning-border-default)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
            <div>
              <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-semibold)', color: 'var(--ds-color-warning-text-default)' }}>
                {t('minside.offlineMode')}
              </Paragraph>
              <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                {t('minside.viewingCachedBookings')}
              </Paragraph>
            </div>
          </div>
        </Card>
      )}

      {/* Page Header - Using DS DashboardPageHeader */}
      <DashboardPageHeader
        title={t('minside.myBookings')}
        subtitle={t('minside.myBookingsDesc')}
        primaryAction={!isMobile ? primaryAction : undefined}
      />

      {/* Mobile primary action */}
      {isMobile && (
        <div style={{ marginTop: 'calc(var(--ds-spacing-4) * -1)' }}>
          {primaryAction}
        </div>
      )}

      {/* Stats Cards - Using DS StatCard */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
        gap: 'var(--ds-spacing-4)'
      }}>
        <StatCard
          title={t('booking.confirmed')}
          value={stats.confirmed}
          color="var(--ds-color-success-text-default)"
        />
        <StatCard
          title={t('requests.pending')}
          value={stats.pending}
          color="var(--ds-color-warning-text-default)"
        />
        <StatCard
          title={t('state.cancelled')}
          value={stats.cancelled}
        />
      </div>

      {/* Filters - Using DS ListToolbar */}
      <ListToolbar
        filters={statusFilters}
        activeFilters={{ status: statusFilter ?? 'all' }}
        onFilterChange={handleFilterChange}
        resultsCount={bookings.length}
        resultsLabel={t('minside.myBookings') || 'bookings'}
        variant="compact"
        data-testid="bookings-toolbar"
      />

      {/* Bookings List */}
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--ds-spacing-8)' }}>
          <Spinner aria-label={t('state.loading')} data-size="lg" />
        </div>
      ) : bookings.length === 0 ? (
        <EmptyState
          icon={<CalendarIcon size={48} />}
          title={t('minside.noUpcomingBookings')}
          action={{
            label: t('minside.bookNow'),
            onClick: () => window.open(WEB_APP_URL, '_blank'),
          }}
          bordered
        />
      ) : isMobile ? (
        // Mobile: Card-based layout
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-3)' }}>
          {bookings.map((booking: Booking) => (
            <Card key={booking.id} data-testid={`booking-row-${booking.id}`} style={{ padding: 'var(--ds-spacing-4)' }}>
              {/* Resource Name & Status */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: 'var(--ds-spacing-3)',
              }}>
                <Heading level={3} data-size="sm" data-testid="booking-title" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-semibold)' }}>
                  {booking.listingName || booking.rentalObjectId}
                </Heading>
                <div data-testid="booking-status-badge">
                  <BookingStatusBadge status={booking.status} />
                </div>
              </div>

              {/* Date & Time */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--ds-spacing-2)',
                marginBottom: 'var(--ds-spacing-2)',
              }}>
                <CalendarIcon style={{ width: '16px', height: '16px', color: 'var(--ds-color-neutral-text-subtle)' }} />
                <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-default)' }}>
                  {formatDate(booking.startTime)}
                </Paragraph>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--ds-spacing-2)',
                marginBottom: 'var(--ds-spacing-3)',
              }}>
                <ClockIcon style={{ width: '16px', height: '16px', color: 'var(--ds-color-neutral-text-subtle)' }} />
                <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-default)' }}>
                  {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                </Paragraph>
              </div>

              {/* Price */}
              <Paragraph data-size="md" style={{
                margin: 0,
                marginBottom: 'var(--ds-spacing-4)',
                fontWeight: 'var(--ds-font-weight-semibold)',
                color: 'var(--ds-color-neutral-text-default)',
              }}>
                {parseFloat(booking.totalPrice ?? '0').toLocaleString(locale === 'en' ? 'en-US' : 'nb-NO')} kr
              </Paragraph>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)', width: '100%' }}>
                {booking.status !== 'cancelled' && (
                  <Button
                    data-testid="cancel-button"
                    type="button"
                    variant="secondary"
                    data-size="sm"
                    onClick={() => handleCancel(booking.id)}
                    disabled={cancelBooking.isPending}
                    style={{ flex: 1, minHeight: '44px' }}
                  >
                    {t('action.cancel')}
                  </Button>
                )}
                <Button
                  data-testid="view-details-button"
                  type="button"
                  variant="tertiary"
                  data-size="sm"
                  style={{ flex: 1, minHeight: '44px' }}
                >
                  {t('common.details')}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        // Desktop: Table layout
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <Table>
            <Table.Head>
              <Table.Row>
                <Table.HeaderCell>{t('bookings.resource')}</Table.HeaderCell>
                <Table.HeaderCell>{t('bookings.timespan')}</Table.HeaderCell>
                <Table.HeaderCell>{t('label.status')}</Table.HeaderCell>
                <Table.HeaderCell>{t('label.price')}</Table.HeaderCell>
                <Table.HeaderCell style={{ width: '80px' }}>{t('common.actions')}</Table.HeaderCell>
              </Table.Row>
            </Table.Head>
            <Table.Body>
              {bookings.map((booking: Booking) => (
                <Table.Row key={booking.id} data-testid={`booking-row-${booking.id}`}>
                  <Table.Cell>
                    <span data-testid="booking-title" style={{ fontWeight: 'var(--ds-font-weight-medium)' }}>
                      {booking.listingName || booking.rentalObjectId}
                    </span>
                  </Table.Cell>
                  <Table.Cell>
                    <div>
                      <span style={{ fontSize: 'var(--ds-font-size-sm)', fontWeight: 'var(--ds-font-weight-medium)' }}>
                        {formatDate(booking.startTime)}
                      </span>
                      <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-default)' }}>
                        {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                      </Paragraph>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <div data-testid="booking-status-badge">
                      <BookingStatusBadge status={booking.status} />
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    {parseFloat(booking.totalPrice ?? '0').toLocaleString(locale === 'en' ? 'en-US' : 'nb-NO')} kr
                  </Table.Cell>
                  <Table.Cell>
                    <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)' }}>
                      {booking.status !== 'cancelled' && (
                        <Button
                          data-testid="cancel-button"
                          type="button"
                          variant="secondary"
                          data-size="sm"
                          onClick={() => handleCancel(booking.id)}
                          disabled={cancelBooking.isPending}
                        >
                          {t('action.cancel')}
                        </Button>
                      )}
                      <Button
                        data-testid="view-details-button"
                        type="button"
                        variant="tertiary"
                        data-size="sm"
                      >
                        {t('common.details')}
                      </Button>
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </Card>
      )}
    </div>
  );
}
