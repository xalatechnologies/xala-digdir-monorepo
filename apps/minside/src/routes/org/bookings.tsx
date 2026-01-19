/**
 * OrganizationBookingsPage
 *
 * Organization bookings list for Minside app
 * - Fetches real data from API
 * - Filterable by status
 * - Mobile responsive
 */

import { useState, useEffect } from 'react';
import {
  Card,
  Heading,
  Paragraph,
  Button,
  Spinner,
  Table,
  BookingStatusBadge,
  DashboardPageHeader,
} from '@xala/ds';
import { useT, useLocale } from '@xala/i18n';
import { NavLink } from 'react-router-dom';
import {
  useBookings,
  type BookingStatus,
  type Booking,
  formatDate,
  formatTime,
} from '@digilist/client-sdk';

const MOBILE_BREAKPOINT = 768;

export function OrganizationBookingsPage() {
  const t = useT();
  const { locale } = useLocale();
  const [statusFilter, setStatusFilter] = useState<BookingStatus | undefined>(undefined);
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < MOBILE_BREAKPOINT : false
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch bookings from API with status filter
  const { data: bookingsData, isLoading } = useBookings(
    statusFilter ? { status: statusFilter } : undefined
  );
  const bookings = bookingsData?.data ?? [];

  // Fetch counts for each status
  const { data: allData } = useBookings();
  const { data: confirmedData } = useBookings({ status: 'confirmed' });
  const { data: pendingData } = useBookings({ status: 'pending' });
  const { data: cancelledData } = useBookings({ status: 'cancelled' });

  const stats = {
    total: allData?.meta?.total ?? 0,
    confirmed: confirmedData?.meta?.total ?? 0,
    pending: pendingData?.meta?.total ?? 0,
    cancelled: cancelledData?.meta?.total ?? 0,
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString(locale === 'en' ? 'en-US' : 'nb-NO') + ' kr';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
      {/* Header - Using DashboardPageHeader */}
      <DashboardPageHeader
        title={t('org.bookings')}
        subtitle={t('org.bookingsDesc') || ''}
        breadcrumb={
          <NavLink to="/org" style={{ color: 'var(--ds-color-accent-text-default)', textDecoration: 'none', fontSize: 'var(--ds-font-size-sm)' }}>
            ← {t('org.backToDashboard')}
          </NavLink>
        }
      />

      {/* Filters */}
      <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)', overflowX: 'auto' }}>
        <Button
          type="button"
          variant={statusFilter === undefined ? 'primary' : 'tertiary'}
          data-size="sm"
          onClick={() => setStatusFilter(undefined)}
          style={{ minHeight: '44px', whiteSpace: 'nowrap' }}
        >
          {t('bookings.all')} ({stats.total})
        </Button>
        <Button
          type="button"
          variant={statusFilter === 'confirmed' ? 'primary' : 'tertiary'}
          data-size="sm"
          onClick={() => setStatusFilter('confirmed')}
          style={{ minHeight: '44px', whiteSpace: 'nowrap' }}
        >
          {t('booking.confirmed')} ({stats.confirmed})
        </Button>
        <Button
          type="button"
          variant={statusFilter === 'pending' ? 'primary' : 'tertiary'}
          data-size="sm"
          onClick={() => setStatusFilter('pending')}
          style={{ minHeight: '44px', whiteSpace: 'nowrap' }}
        >
          {t('requests.pending')} ({stats.pending})
        </Button>
        <Button
          type="button"
          variant={statusFilter === 'cancelled' ? 'primary' : 'tertiary'}
          data-size="sm"
          onClick={() => setStatusFilter('cancelled')}
          style={{ minHeight: '44px', whiteSpace: 'nowrap' }}
        >
          {t('state.cancelled')} ({stats.cancelled})
        </Button>
      </div>

      {/* Bookings List */}
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--ds-spacing-8)' }}>
            <Spinner aria-label={t('state.loading')} data-size="lg" />
          </div>
        ) : bookings.length === 0 ? (
          <div style={{ padding: 'var(--ds-spacing-8)', textAlign: 'center' }}>
            <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
              {t('org.noBookings')}
            </Paragraph>
          </div>
        ) : isMobile ? (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {bookings.map((booking: Booking) => (
              <div
                key={booking.id}
                style={{
                  padding: 'var(--ds-spacing-4)',
                  borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--ds-spacing-2)' }}>
                  <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-semibold)' }}>
                    {booking.listingName || booking.listingId}
                  </Paragraph>
                  <BookingStatusBadge status={booking.status} />
                </div>
                <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                  {formatDate(booking.startTime)} • {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                </Paragraph>
                {booking.userName && (
                  <Paragraph data-size="xs" style={{ margin: 0, marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                    {t('org.bookedBy')}: {booking.userName}
                  </Paragraph>
                )}
                <Paragraph data-size="md" style={{ margin: 0, marginTop: 'var(--ds-spacing-2)', fontWeight: 'var(--ds-font-weight-semibold)' }}>
                  {formatCurrency(booking.totalPrice ?? 0)}
                </Paragraph>
              </div>
            ))}
          </div>
        ) : (
          <Table>
            <Table.Head>
              <Table.Row>
                <Table.HeaderCell>{t('bookings.resource')}</Table.HeaderCell>
                <Table.HeaderCell>{t('bookings.timespan')}</Table.HeaderCell>
                <Table.HeaderCell>{t('org.bookedBy')}</Table.HeaderCell>
                <Table.HeaderCell>{t('label.status')}</Table.HeaderCell>
                <Table.HeaderCell>{t('label.price')}</Table.HeaderCell>
              </Table.Row>
            </Table.Head>
            <Table.Body>
              {bookings.map((booking: Booking) => (
                <Table.Row key={booking.id}>
                  <Table.Cell>
                    <span style={{ fontWeight: 'var(--ds-font-weight-medium)' }}>
                      {booking.listingName || booking.listingId}
                    </span>
                  </Table.Cell>
                  <Table.Cell>
                    <div>
                      <span style={{ fontSize: 'var(--ds-font-size-sm)' }}>{formatDate(booking.startTime)}</span>
                      <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                        {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                      </Paragraph>
                    </div>
                  </Table.Cell>
                  <Table.Cell>{booking.userName || '-'}</Table.Cell>
                  <Table.Cell>
                    <BookingStatusBadge status={booking.status} />
                  </Table.Cell>
                  <Table.Cell>{formatCurrency(booking.totalPrice ?? 0)}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )}
      </Card>
    </div>
  );
}
