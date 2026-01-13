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
  PaymentStatusBadge,
  CheckIcon,
  CloseIcon,
  MoreVerticalIcon,
} from '@xala/ds';
import {
  useBookings,
  useConfirmBooking,
  useCancelBooking,
  type BookingStatus,
  type Booking,
  formatDate,
  formatTime,
} from '@digilist/client-sdk';

export function BookingsPage() {
  const [statusFilter, setStatusFilter] = useState<BookingStatus | undefined>(undefined);

  // Fetch bookings from API with optional status filter
  const { data: bookingsData, isLoading } = useBookings(
    statusFilter ? { status: statusFilter } : undefined
  );
  const bookings = bookingsData?.data ?? [];

  // Fetch counts for each status for filter badges
  const { data: pendingData } = useBookings({ status: 'pending' });
  const { data: confirmedData } = useBookings({ status: 'confirmed' });
  const { data: cancelledData } = useBookings({ status: 'cancelled' });

  const confirmBooking = useConfirmBooking();
  const cancelBooking = useCancelBooking();

  const handleConfirm = async (id: string) => {
    await confirmBooking.mutateAsync(id);
  };

  const handleCancel = async (id: string) => {
    if (window.confirm('Er du sikker på at du vil kansellere denne bookingen?')) {
      await cancelBooking.mutateAsync(id);
    }
  };

  // Calculate stats from API data
  const stats = useMemo(() => {
    const pendingCount = pendingData?.meta?.total ?? 0;
    const confirmedCount = confirmedData?.meta?.total ?? 0;
    const cancelledCount = cancelledData?.meta?.total ?? 0;
    const confirmedBookings = confirmedData?.data ?? [];
    const revenue = confirmedBookings.reduce((sum, b) => sum + (b.totalPrice ?? 0), 0);

    return {
      total: pendingCount + confirmedCount + cancelledCount,
      confirmed: confirmedCount,
      pending: pendingCount,
      cancelled: cancelledCount,
      revenue,
    };
  }, [pendingData, confirmedData, cancelledData]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
      {/* Header */}
      <div>
        <Heading level={1} data-size="lg" style={{ margin: 0 }}>
          Bookinger
        </Heading>
        <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)', marginTop: 'var(--ds-spacing-2)', marginBottom: 0 }}>
          Oversikt over alle bekreftede og ventende bookinger.
        </Paragraph>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--ds-spacing-4)' }}>
        <Card style={{ padding: 'var(--ds-spacing-5)' }}>
          <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
            Totalt bookinger
          </Paragraph>
          <Heading level={2} data-size="xl" style={{ margin: 0, marginTop: 'var(--ds-spacing-2)' }}>
            {stats.total}
          </Heading>
        </Card>
        <Card style={{ padding: 'var(--ds-spacing-5)' }}>
          <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
            Bekreftede
          </Paragraph>
          <Heading level={2} data-size="xl" style={{ margin: 0, marginTop: 'var(--ds-spacing-2)', color: 'var(--ds-color-success-text-default)' }}>
            {stats.confirmed}
          </Heading>
        </Card>
        <Card style={{ padding: 'var(--ds-spacing-5)' }}>
          <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
            Ventende
          </Paragraph>
          <Heading level={2} data-size="xl" style={{ margin: 0, marginTop: 'var(--ds-spacing-2)', color: 'var(--ds-color-warning-text-default)' }}>
            {stats.pending}
          </Heading>
        </Card>
        <Card style={{ padding: 'var(--ds-spacing-5)' }}>
          <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
            Total omsetning
          </Paragraph>
          <Heading level={2} data-size="xl" style={{ margin: 0, marginTop: 'var(--ds-spacing-2)' }}>
            {stats.revenue.toLocaleString('nb-NO')} kr
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
          Alle ({stats.total})
        </Button>
        <Button
          type="button"
          variant={statusFilter === 'pending' ? 'primary' : 'tertiary'}
          data-size="sm"
          onClick={() => setStatusFilter('pending')}
        >
          Venter ({stats.pending})
        </Button>
        <Button
          type="button"
          variant={statusFilter === 'confirmed' ? 'primary' : 'tertiary'}
          data-size="sm"
          onClick={() => setStatusFilter('confirmed')}
        >
          Bekreftet ({stats.confirmed})
        </Button>
        <Button
          type="button"
          variant={statusFilter === 'cancelled' ? 'primary' : 'tertiary'}
          data-size="sm"
          onClick={() => setStatusFilter('cancelled')}
        >
          Kansellert
        </Button>
      </div>

      {/* Table */}
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--ds-spacing-8)' }}>
          <Spinner aria-label="Laster bookinger..." data-size="lg" />
        </div>
      ) : bookings.length === 0 ? (
        <Card style={{ padding: 'var(--ds-spacing-8)', textAlign: 'center' }}>
          <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
            Ingen bookinger funnet
            {statusFilter && ` med status "${statusFilter}"`}.
          </Paragraph>
        </Card>
      ) : (
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <Table>
            <Table.Head>
              <Table.Row>
                <Table.HeaderCell>Booking-ID</Table.HeaderCell>
                <Table.HeaderCell>Bruker / Org</Table.HeaderCell>
                <Table.HeaderCell>Ressurs</Table.HeaderCell>
                <Table.HeaderCell>Tidsrom</Table.HeaderCell>
                <Table.HeaderCell>Status</Table.HeaderCell>
                <Table.HeaderCell>Betaling</Table.HeaderCell>
                <Table.HeaderCell>Pris</Table.HeaderCell>
                <Table.HeaderCell style={{ width: '120px' }}>Handlinger</Table.HeaderCell>
              </Table.Row>
            </Table.Head>
            <Table.Body>
              {bookings.map((booking) => (
                <Table.Row key={booking.id}>
                  <Table.Cell>
                    <span style={{ fontFamily: 'monospace', fontSize: 'var(--ds-font-size-sm)' }}>
                      {booking.id.slice(-8)}
                    </span>
                  </Table.Cell>
                  <Table.Cell>
                    <span style={{ fontWeight: 'var(--ds-font-weight-medium)' }}>
                      {booking.userName || booking.userId || 'Ukjent'}
                    </span>
                  </Table.Cell>
                  <Table.Cell>{booking.listingName || booking.listingId}</Table.Cell>
                  <Table.Cell>
                    <div>
                      <span style={{ fontSize: 'var(--ds-font-size-sm)' }}>
                        {formatDate(booking.startTime)}
                      </span>
                      <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                        {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                      </Paragraph>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <BookingStatusBadge status={booking.status} />
                  </Table.Cell>
                  <Table.Cell>
                    <PaymentStatusBadge status={booking.paymentStatus || 'unpaid'} />
                  </Table.Cell>
                  <Table.Cell>
                    {(booking.totalPrice ?? 0).toLocaleString('nb-NO')} kr
                  </Table.Cell>
                  <Table.Cell>
                    <div style={{ display: 'flex', gap: 'var(--ds-spacing-1)' }}>
                      {booking.status === 'pending' && (
                        <>
                          <Button
                            type="button"
                            variant="primary"
                            data-size="sm"
                            onClick={() => handleConfirm(booking.id)}
                            disabled={confirmBooking.isPending}
                            title="Bekreft"
                          >
                            <CheckIcon />
                          </Button>
                          <Button
                            type="button"
                            variant="secondary"
                            data-size="sm"
                            onClick={() => handleCancel(booking.id)}
                            disabled={cancelBooking.isPending}
                            title="Kanseller"
                          >
                            <CloseIcon />
                          </Button>
                        </>
                      )}
                      <Dropdown.TriggerContext>
                        <Dropdown.Trigger asChild>
                          <Button type="button" variant="tertiary" data-size="sm" aria-label="Flere valg">
                            <MoreVerticalIcon />
                          </Button>
                        </Dropdown.Trigger>
                        <Dropdown placement="bottom-end">
                          <Dropdown.List>
                            <Dropdown.Item>
                              <Dropdown.Button>Se detaljer</Dropdown.Button>
                            </Dropdown.Item>
                            <Dropdown.Item>
                              <Dropdown.Button>Endre</Dropdown.Button>
                            </Dropdown.Item>
                            <Dropdown.Item>
                              <Dropdown.Button>Se fakturagrunnlag</Dropdown.Button>
                            </Dropdown.Item>
                            <Dropdown.Item>
                              <Dropdown.Button>Se tilgang (låssystem)</Dropdown.Button>
                            </Dropdown.Item>
                            {booking.status !== 'cancelled' && (
                              <Dropdown.Item>
                                <Dropdown.Button>Avbryt booking</Dropdown.Button>
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
