/**
 * BookingsPage
 *
 * Mobile-first responsive bookings page for Minside app with offline support
 * - Stacks stats cards on mobile (< 768px)
 * - Converts table to cards on mobile for better touch UX
 * - Touch-friendly buttons (44px+ touch targets)
 * - Horizontal scrollable filters on mobile
 * - Offline-first with IndexedDB caching
 * - Shows offline indicator when viewing cached data
 * - Follows DIGILIST design patterns
 */

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import {
  Card,
  Heading,
  Paragraph,
  Button,
  Spinner,
  Table,
  BookingStatusBadge,
  useDialog,
  CalendarIcon,
  ClockIcon,
  Link,
} from '@xala/ds';
import {
  useCancelBooking,
  type BookingStatus,
  type Booking,
  formatDate,
  formatTime,
} from '@digilist/client-sdk';
import { useT, useLocale } from '@xala/i18n';
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

  // Scroll indicator state for filter buttons
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const filterContainerRef = useRef<HTMLDivElement>(null);

  // Track viewport size for mobile/desktop detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Update scroll indicators based on scroll position
  const updateScrollIndicators = useCallback(() => {
    const container = filterContainerRef.current;
    if (!container || !isMobile) {
      setCanScrollLeft(false);
      setCanScrollRight(false);
      return;
    }

    const { scrollLeft, scrollWidth, clientWidth } = container;
    const scrollRight = scrollWidth - clientWidth - scrollLeft;

    setCanScrollLeft(scrollLeft > 5); // 5px threshold to avoid flicker
    setCanScrollRight(scrollRight > 5);
  }, [isMobile]);

  // Check scroll indicators on mount and when mobile state changes
  useEffect(() => {
    updateScrollIndicators();
    // Also check after a short delay to ensure content is rendered
    const timer = setTimeout(updateScrollIndicators, 100);
    return () => clearTimeout(timer);
  }, [updateScrollIndicators, isMobile]);

  // Fetch all bookings once - we'll filter client-side for reliability
  const { data: allData, isLoading, isOffline, isCached } = useOfflineBookings();
  
  // Filter bookings client-side based on statusFilter
  const bookings = useMemo(() => {
    const allBookings = allData?.data ?? [];
    if (!statusFilter) return allBookings;
    
    // Handle status mapping: 'confirmed' filter should match 'approved' and 'confirmed'
    if (statusFilter === 'confirmed') {
      return allBookings.filter(b => 
        b.status === 'confirmed' || (b.status as string) === 'approved'
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

  // Calculate stats from actual booking data - count by status from the response
  const stats = useMemo(() => {
    const allBookings = allData?.data ?? [];
    const total = allBookings.length;
    
    // Count by actual status values from API (handles 'approved', 'confirmed', etc.)
    // Type assertion needed because API may return 'approved' which isn't in BookingStatus type
    const confirmed = allBookings.filter(b => 
      b.status === 'confirmed' || (b.status as string) === 'approved'
    ).length;
    const pending = allBookings.filter(b => b.status === 'pending').length;
    const cancelled = allBookings.filter(b => b.status === 'cancelled').length;
    
    return { total, confirmed, pending, cancelled };
  }, [allData]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
      {/* Offline Indicator - Shows when viewing cached data */}
      {isOffline && isCached && (
        <Card style={{
          padding: 'var(--ds-spacing-4)',
          backgroundColor: 'var(--ds-color-warning-surface-default)',
          borderLeft: '4px solid var(--ds-color-warning-border-default)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
            <span style={{ fontSize: 'var(--ds-font-size-lg)' }}>📡</span>
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

      {/* Header - Responsive: stacks on mobile */}
      <div style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between',
        alignItems: isMobile ? 'flex-start' : 'flex-start',
        gap: isMobile ? 'var(--ds-spacing-4)' : '0',
      }}>
        <div>
          <Heading level={1} data-size="lg" style={{ margin: 0 }}>
            {t('minside.myBookings')}
          </Heading>
          <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)', marginTop: 'var(--ds-spacing-2)', marginBottom: 0 }}>
            {t('minside.myBookingsDesc')}
          </Paragraph>
        </div>
        <Link href={WEB_APP_URL} target="_blank" rel="noopener noreferrer" style={{ width: isMobile ? '100%' : 'auto' }}>
          <Button
            data-testid="create-booking-button"
            type="button"
            variant="primary"
            data-size="md"
            style={{
              width: isMobile ? '100%' : 'auto',
              minHeight: '44px', // WCAG AA touch target
            }}
          >
            {t('minside.bookNow')} ↗
          </Button>
        </Link>
      </div>

      {/* Stats Cards - Responsive: 1 column on mobile, 3 columns on desktop */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
        gap: 'var(--ds-spacing-4)'
      }}>
        <Card style={{ padding: 'var(--ds-spacing-5)' }}>
          <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-default)', margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
            {t('booking.confirmed')}
          </Paragraph>
          <Heading level={2} data-size="xl" style={{ margin: 0, marginTop: 'var(--ds-spacing-2)', color: 'var(--ds-color-success-text-default)' }}>
            {stats.confirmed}
          </Heading>
        </Card>
        <Card style={{ padding: 'var(--ds-spacing-5)' }}>
          <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-default)', margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
            {t('requests.pending')}
          </Paragraph>
          <Heading level={2} data-size="xl" style={{ margin: 0, marginTop: 'var(--ds-spacing-2)', color: 'var(--ds-color-warning-text-default)' }}>
            {stats.pending}
          </Heading>
        </Card>
        <Card style={{ padding: 'var(--ds-spacing-5)' }}>
          <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-default)', margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
            {t('state.cancelled')}
          </Paragraph>
          <Heading level={2} data-size="xl" style={{ margin: 0, marginTop: 'var(--ds-spacing-2)' }}>
            {stats.cancelled}
          </Heading>
        </Card>
      </div>

      {/* Filters - Responsive: horizontal scroll on mobile with scroll indicators */}
      <div style={{
        position: 'relative',
        margin: isMobile ? '0 calc(var(--ds-spacing-4) * -1)' : '0', // Bleed to edges on mobile
      }}>
        {/* Left scroll indicator gradient */}
        {isMobile && canScrollLeft && (
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: '40px',
              background: 'linear-gradient(to right, var(--ds-color-neutral-background-default), transparent)',
              pointerEvents: 'none',
              zIndex: 1,
              transition: 'opacity 0.3s ease',
            }}
            aria-hidden="true"
          />
        )}

        {/* Right scroll indicator gradient */}
        {isMobile && canScrollRight && (
          <div
            style={{
              position: 'absolute',
              right: 0,
              top: 0,
              bottom: 0,
              width: '40px',
              background: 'linear-gradient(to left, var(--ds-color-neutral-background-default), transparent)',
              pointerEvents: 'none',
              zIndex: 1,
              transition: 'opacity 0.3s ease',
            }}
            aria-hidden="true"
          />
        )}

        {/* Scrollable filter container */}
        <div
          ref={filterContainerRef}
          onScroll={updateScrollIndicators}
          style={{
            display: 'flex',
            gap: 'var(--ds-spacing-2)',
            overflowX: isMobile ? 'auto' : 'visible',
            WebkitOverflowScrolling: 'touch', // Smooth scroll on iOS
            paddingBottom: isMobile ? 'var(--ds-spacing-2)' : '0',
            padding: isMobile ? '0 var(--ds-spacing-4)' : '0',
            scrollbarWidth: 'none', // Hide scrollbar on Firefox
            msOverflowStyle: 'none', // Hide scrollbar on IE/Edge
          }}
        >
          <Button
            type="button"
            variant={statusFilter === undefined ? 'primary' : 'tertiary'}
            data-size="sm"
            onClick={() => setStatusFilter(undefined)}
            style={{
              minHeight: '44px', // WCAG AA touch target
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            {t('bookings.all')} ({stats.total})
          </Button>
          <Button
            type="button"
            variant={statusFilter === 'confirmed' ? 'primary' : 'tertiary'}
            data-size="sm"
            onClick={() => setStatusFilter('confirmed')}
            style={{
              minHeight: '44px', // WCAG AA touch target
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            {t('booking.confirmed')} ({stats.confirmed})
          </Button>
          <Button
            type="button"
            variant={statusFilter === 'pending' ? 'primary' : 'tertiary'}
            data-size="sm"
            onClick={() => setStatusFilter('pending')}
            style={{
              minHeight: '44px', // WCAG AA touch target
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            {t('requests.pending')} ({stats.pending})
          </Button>
          <Button
            type="button"
            variant={statusFilter === 'cancelled' ? 'primary' : 'tertiary'}
            data-size="sm"
            onClick={() => setStatusFilter('cancelled')}
            style={{
              minHeight: '44px', // WCAG AA touch target
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            {t('state.cancelled')} ({stats.cancelled})
          </Button>
        </div>
      </div>

      {/* Bookings List - Responsive: cards on mobile, table on desktop */}
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--ds-spacing-8)' }}>
          <Spinner aria-label={t('state.loading')} data-size="lg" />
        </div>
      ) : bookings.length === 0 ? (
        <Card style={{ padding: 'var(--ds-spacing-8)', textAlign: 'center' }}>
          <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
            {t('minside.noUpcomingBookings')}
          </Paragraph>
          <Link href={WEB_APP_URL} target="_blank" rel="noopener noreferrer" style={{ marginTop: 'var(--ds-spacing-4)', display: 'inline-block' }}>
            <Button type="button" variant="primary" data-size="md">
              {t('minside.bookNow')} ↗
            </Button>
          </Link>
        </Card>
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
                  {booking.listingName || booking.listingId}
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
                {(booking.totalPrice ?? 0).toLocaleString(locale === 'en' ? 'en-US' : 'nb-NO')} kr
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
                    style={{
                      flex: 1,
                      minHeight: '44px', // WCAG AA touch target
                    }}
                  >
                    {t('action.cancel')}
                  </Button>
                )}
                <Button
                  data-testid="view-details-button"
                  type="button"
                  variant="tertiary"
                  data-size="sm"
                  style={{
                    flex: 1,
                    minHeight: '44px', // WCAG AA touch target
                  }}
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
                      {booking.listingName || booking.listingId}
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
                    {(booking.totalPrice ?? 0).toLocaleString(locale === 'en' ? 'en-US' : 'nb-NO')} kr
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
