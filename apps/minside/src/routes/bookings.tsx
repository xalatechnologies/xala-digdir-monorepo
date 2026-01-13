import { useState, useMemo } from 'react';
import {
  Card,
  Heading,
  Paragraph,
  Button,
  Spinner,
  Table,
  Dropdown,
  BookingStatusBadge,
  MoreVerticalIcon,
  CloseIcon,
} from '@xala/ds';
import {
  useMyBookings,
  useCancelBooking,
  type BookingStatus,
  type Booking,
  formatDate,
  formatTime,
} from '@digilist/client-sdk';
import { useT, useLocale } from '@xala/i18n';

// Web app URL for new bookings
const WEB_APP_URL = import.meta.env.VITE_WEB_APP_URL || 'https://digilist.no';

export function BookingsPage() {
  const t = useT();
  const { locale } = useLocale();
  const [statusFilter, setStatusFilter] = useState<BookingStatus | undefined>(undefined);

  // Fetch user's own bookings with optional status filter
  const { data: bookingsData, isLoading } = useMyBookings(
    statusFilter ? { status: statusFilter } : undefined
  );
  const bookings = bookingsData?.data ?? [];

  // Fetch counts for each status for filter badges
  const { data: pendingData } = useMyBookings({ status: 'pending' });
  const { data: confirmedData } = useMyBookings({ status: 'confirmed' });
  const { data: cancelledData } = useMyBookings({ status: 'cancelled' });

  const cancelBooking = useCancelBooking();

  const handleCancel = async (id: string) => {
    if (window.confirm(t('bookings.confirmCancel'))) {
      await cancelBooking.mutateAsync(id);
    }
  };

  // Calculate stats from API data
  const stats = useMemo(() => {
    const pendingCount = pendingData?.meta?.total ?? 0;
    const confirmedCount = confirmedData?.meta?.total ?? 0;
    const cancelledCount = cancelledData?.meta?.total ?? 0;

    return {
      total: pendingCount + confirmedCount + cancelledCount,
      confirmed: confirmedCount,
      pending: pendingCount,
      cancelled: cancelledCount,
    };
  }, [pendingData, confirmedData, cancelledData]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Heading level={1} data-size="lg" style={{ margin: 0 }}>
            {t('minside.myBookings')}
          </Heading>
          <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)', marginTop: 'var(--ds-spacing-2)', marginBottom: 0 }}>
            {t('minside.myBookingsDesc')}
          </Paragraph>
        </div>
        <a href={WEB_APP_URL} target="_blank" rel="noopener noreferrer">
          <Button type="button" variant="primary" data-size="md">
            {t('minside.bookNow')} ↗
          </Button>
        </a>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--ds-spacing-4)' }}>
        <Card style={{ padding: 'var(--ds-spacing-5)' }}>
          <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-default)', margin: 0, fontWeight: 500 }}>
            {t('booking.confirmed')}
          </Paragraph>
          <Heading level={2} data-size="xl" style={{ margin: 0, marginTop: 'var(--ds-spacing-2)', color: 'var(--ds-color-success-text-default)' }}>
            {stats.confirmed}
          </Heading>
        </Card>
        <Card style={{ padding: 'var(--ds-spacing-5)' }}>
          <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-default)', margin: 0, fontWeight: 500 }}>
            {t('requests.pending')}
          </Paragraph>
          <Heading level={2} data-size="xl" style={{ margin: 0, marginTop: 'var(--ds-spacing-2)', color: 'var(--ds-color-warning-text-default)' }}>
            {stats.pending}
          </Heading>
        </Card>
        <Card style={{ padding: 'var(--ds-spacing-5)' }}>
          <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-default)', margin: 0, fontWeight: 500 }}>
            {t('booking.cancelled')}
          </Paragraph>
          <Heading level={2} data-size="xl" style={{ margin: 0, marginTop: 'var(--ds-spacing-2)' }}>
            {stats.cancelled}
          </Heading>
        </Card>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)' }}>
        <Button
          type="button"
          variant={statusFilter === undefined ? 'primary' : 'tertiary'}
          data-size="sm"
          onClick={() => setStatusFilter(undefined)}
        >
          {t('bookings.all')} ({stats.total})
        </Button>
        <Button
          type="button"
          variant={statusFilter === 'confirmed' ? 'primary' : 'tertiary'}
          data-size="sm"
          onClick={() => setStatusFilter('confirmed')}
        >
          {t('booking.confirmed')} ({stats.confirmed})
        </Button>
        <Button
          type="button"
          variant={statusFilter === 'pending' ? 'primary' : 'tertiary'}
          data-size="sm"
          onClick={() => setStatusFilter('pending')}
        >
          {t('requests.pending')} ({stats.pending})
        </Button>
        <Button
          type="button"
          variant={statusFilter === 'cancelled' ? 'primary' : 'tertiary'}
          data-size="sm"
          onClick={() => setStatusFilter('cancelled')}
        >
          {t('booking.cancelled')}
        </Button>
      </div>

      {/* Table */}
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--ds-spacing-8)' }}>
          <Spinner aria-label={t('bookings.loadingBookings')} data-size="lg" />
        </div>
      ) : bookings.length === 0 ? (
        <Card style={{ padding: 'var(--ds-spacing-8)', textAlign: 'center' }}>
          <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
            {t('minside.noUpcomingBookings')}
          </Paragraph>
          <a href={WEB_APP_URL} target="_blank" rel="noopener noreferrer" style={{ marginTop: 'var(--ds-spacing-4)', display: 'inline-block' }}>
            <Button type="button" variant="primary" data-size="md">
              {t('minside.bookNow')} ↗
            </Button>
          </a>
        </Card>
      ) : (
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <Table>
            <Table.Head>
              <Table.Row>
                <Table.HeaderCell>{t('bookings.resource')}</Table.HeaderCell>
                <Table.HeaderCell>{t('bookings.timespan')}</Table.HeaderCell>
                <Table.HeaderCell>{t('common.status')}</Table.HeaderCell>
                <Table.HeaderCell>{t('common.price')}</Table.HeaderCell>
                <Table.HeaderCell style={{ width: '80px' }}>{t('common.actions')}</Table.HeaderCell>
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
                      <span style={{ fontSize: 'var(--ds-font-size-sm)', fontWeight: 500 }}>
                        {formatDate(booking.startTime)}
                      </span>
                      <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-default)' }}>
                        {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                      </Paragraph>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <BookingStatusBadge status={booking.status} />
                  </Table.Cell>
                  <Table.Cell>
                    {(booking.totalPrice ?? 0).toLocaleString(locale === 'en' ? 'en-US' : 'nb-NO')} kr
                  </Table.Cell>
                  <Table.Cell>
                    <div style={{ display: 'flex', gap: 'var(--ds-spacing-1)' }}>
                      {booking.status !== 'cancelled' && (
                        <Button
                          type="button"
                          variant="secondary"
                          data-size="sm"
                          onClick={() => handleCancel(booking.id)}
                          disabled={cancelBooking.isPending}
                          title={t('common.cancel')}
                        >
                          <CloseIcon />
                        </Button>
                      )}
                      <Dropdown.TriggerContext>
                        <Dropdown.Trigger asChild>
                          <Button type="button" variant="tertiary" data-size="sm" aria-label={t('common.moreOptions')}>
                            <MoreVerticalIcon />
                          </Button>
                        </Dropdown.Trigger>
                        <Dropdown placement="bottom-end">
                          <Dropdown.List>
                            <Dropdown.Item>
                              <Dropdown.Button>{t('bookings.viewDetails')}</Dropdown.Button>
                            </Dropdown.Item>
                            {booking.status === 'confirmed' && (
                              <Dropdown.Item>
                                <Dropdown.Button>{t('bookings.viewAccess')}</Dropdown.Button>
                              </Dropdown.Item>
                            )}
                          </Dropdown.List>
                        </Dropdown>
                      </Dropdown.TriggerContext>
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
