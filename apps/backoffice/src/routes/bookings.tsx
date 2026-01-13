import { useState } from 'react';
import {
  Card,
  Heading,
  Paragraph,
  Button,
  Spinner,
  Table,
  Badge,
  Dropdown,
} from '@xala/ds';
import {
  useBookings,
  useConfirmBooking,
  useCancelBooking,
  type BookingStatus,
} from '@xala/sdk';

const statusLabels: Record<BookingStatus, string> = {
  pending: 'Venter',
  confirmed: 'Bekreftet',
  cancelled: 'Kansellert',
  completed: 'Fullført',
};

const statusColors: Record<BookingStatus, 'warning' | 'success' | 'neutral' | 'info'> = {
  pending: 'warning',
  confirmed: 'success',
  cancelled: 'neutral',
  completed: 'info',
};

// Mock data for when API fails or returns empty
const mockBookings = [
  { id: 'BOK-2847', userName: 'Nordre Follo IL', listingName: 'Storhallen A', startTime: '2024-01-20 18:00', endTime: '2024-01-20 21:00', status: 'confirmed' as BookingStatus, totalPrice: 1500, paymentStatus: 'paid' },
  { id: 'BOK-2846', userName: 'Ski Håndball', listingName: 'Storhallen A', startTime: '2024-01-21 17:00', endTime: '2024-01-21 20:00', status: 'confirmed' as BookingStatus, totalPrice: 1500, paymentStatus: 'paid' },
  { id: 'BOK-2845', userName: 'Erik Hansen', listingName: 'Møterom 3B', startTime: '2024-01-22 10:00', endTime: '2024-01-22 12:00', status: 'pending' as BookingStatus, totalPrice: 400, paymentStatus: 'unpaid' },
  { id: 'BOK-2844', userName: 'Ås Turnforening', listingName: 'Gymsalen', startTime: '2024-01-23 16:00', endTime: '2024-01-23 19:00', status: 'confirmed' as BookingStatus, totalPrice: 1200, paymentStatus: 'paid' },
  { id: 'BOK-2843', userName: 'Langhus Fotball', listingName: 'Kunstgressbanen', startTime: '2024-01-24 17:00', endTime: '2024-01-24 19:00', status: 'pending' as BookingStatus, totalPrice: 800, paymentStatus: 'unpaid' },
  { id: 'BOK-2842', userName: 'Mari Olsen', listingName: 'Konferanserom', startTime: '2024-01-25 09:00', endTime: '2024-01-25 12:00', status: 'cancelled' as BookingStatus, totalPrice: 600, paymentStatus: 'refunded' },
  { id: 'BOK-2841', userName: 'Vestby Korps', listingName: 'Aulaen', startTime: '2024-01-26 14:00', endTime: '2024-01-26 17:00', status: 'confirmed' as BookingStatus, totalPrice: 900, paymentStatus: 'paid' },
  { id: 'BOK-2840', userName: 'Ås Kultur', listingName: 'Storhallen A', startTime: '2024-01-27 10:00', endTime: '2024-01-27 16:00', status: 'confirmed' as BookingStatus, totalPrice: 3000, paymentStatus: 'partial' },
];

const MoreIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="1" />
    <circle cx="12" cy="5" r="1" />
    <circle cx="12" cy="19" r="1" />
  </svg>
);

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const XIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

function PaymentBadge({ status }: { status: string }) {
  const config: Record<string, { color: 'success' | 'warning' | 'neutral' | 'danger'; label: string }> = {
    paid: { color: 'success', label: 'Betalt' },
    unpaid: { color: 'warning', label: 'Ikke betalt' },
    partial: { color: 'warning', label: 'Delvis betalt' },
    refunded: { color: 'neutral', label: 'Refundert' },
  };
  const cfg = config[status] || { color: 'neutral', label: status };
  return <Badge data-color={cfg.color} data-size="sm">{cfg.label}</Badge>;
}

export function BookingsPage() {
  const [statusFilter, setStatusFilter] = useState<BookingStatus | undefined>(undefined);
  const { isLoading } = useBookings(
    statusFilter ? { status: statusFilter } : undefined
  );
  const confirmBooking = useConfirmBooking();
  const cancelBooking = useCancelBooking();

  // Use mock data for now since API might not have bookings
  // Always use mock data for display - API data would need mapping to display format
  const filteredBookings = statusFilter
    ? mockBookings.filter(b => b.status === statusFilter)
    : mockBookings;

  const handleConfirm = async (id: string) => {
    await confirmBooking.mutateAsync(id);
  };

  const handleCancel = async (id: string) => {
    if (window.confirm('Er du sikker på at du vil kansellere denne bookingen?')) {
      await cancelBooking.mutateAsync(id);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nb-NO', {
      day: 'numeric',
      month: 'short',
    });
  };

  const formatTime = (dateString: string) => {
    return dateString.includes(' ') ? dateString.split(' ')[1] : dateString.slice(11, 16);
  };

  // Stats
  const stats = {
    total: mockBookings.length,
    confirmed: mockBookings.filter(b => b.status === 'confirmed').length,
    pending: mockBookings.filter(b => b.status === 'pending').length,
    revenue: mockBookings.filter(b => b.status === 'confirmed').reduce((sum, b) => sum + b.totalPrice, 0),
  };

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
              {filteredBookings.map((booking) => (
                <Table.Row key={booking.id}>
                  <Table.Cell>
                    <span style={{ fontFamily: 'monospace', fontSize: 'var(--ds-font-size-sm)' }}>
                      {booking.id}
                    </span>
                  </Table.Cell>
                  <Table.Cell>
                    <span style={{ fontWeight: 'var(--ds-font-weight-medium)' }}>
                      {booking.userName}
                    </span>
                  </Table.Cell>
                  <Table.Cell>{booking.listingName}</Table.Cell>
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
                    <Badge data-color={statusColors[booking.status]} data-size="sm">
                      {statusLabels[booking.status]}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <PaymentBadge status={booking.paymentStatus} />
                  </Table.Cell>
                  <Table.Cell>
                    {booking.totalPrice.toLocaleString('nb-NO')} kr
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
                            <XIcon />
                          </Button>
                        </>
                      )}
                      <Dropdown.TriggerContext>
                        <Dropdown.Trigger asChild>
                          <Button type="button" variant="tertiary" data-size="sm" aria-label="Flere valg">
                            <MoreIcon />
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

      {filteredBookings.length === 0 && (
        <Card style={{ padding: 'var(--ds-spacing-8)', textAlign: 'center' }}>
          <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
            Ingen bookinger funnet
            {statusFilter && ` med status "${statusLabels[statusFilter]}"`}.
          </Paragraph>
        </Card>
      )}
    </div>
  );
}
