/**
 * Bookings Tab Component
 * Displays bookings filtered by listing ID with table view
 * Part of ListingDetailView - shows all bookings for the current listing
 */

import { useMemo } from 'react';
import {
  Table,
  Paragraph,
  Spinner,
  BookingStatusBadge,
  PaymentStatusBadge,
  Text,
} from '@xala/ds';

import {
  useBookings,
  type Booking,
  formatDate,
  formatTime,
  formatCurrency,
} from '@digilist/client-sdk';

interface BookingsTabProps {
  listingId: string;
}

// Helper to calculate duration
function calculateDuration(startTime: string, endTime: string): string {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const diffMs = end.getTime() - start.getTime();
  const hours = diffMs / (1000 * 60 * 60);
  if (hours < 1) return `${Math.round(hours * 60)} min`;
  return hours % 1 === 0 ? `${hours} t` : `${hours.toFixed(1)} t`;
}

export function BookingsTab({ listingId }: BookingsTabProps) {
  // Fetch bookings filtered by listing ID
  const { data: bookingsData, isLoading } = useBookings({ listingId });

  const bookings = useMemo(() => {
    return bookingsData?.data ?? [];
  }, [bookingsData]);

  const totalCount = bookingsData?.meta?.total || bookings.length;

  // Loading state
  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 'var(--ds-spacing-10)',
          minHeight: '300px',
        }}
      >
        <Spinner aria-label="Laster bookinger..." />
      </div>
    );
  }

  // Empty state
  if (bookings.length === 0) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: 'var(--ds-spacing-10)',
        }}
      >
        <Text
          data-size="lg"
          style={{
            color: 'var(--ds-color-neutral-text-subtle)',
            marginBottom: 'var(--ds-spacing-2)',
          }}
        >
          Ingen bookinger funnet
        </Text>
        <Paragraph
          data-size="sm"
          style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}
        >
          Det er ingen bookinger for dette utleieobjektet ennå.
        </Paragraph>
      </div>
    );
  }

  return (
    <div>
      {/* Header with count */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 'var(--ds-spacing-4)',
        }}
      >
        <Paragraph
          data-size="sm"
          style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}
        >
          Viser {bookings.length} av {totalCount} bookinger
        </Paragraph>
      </div>

      {/* Bookings Table */}
      <Table size="sm" style={{ width: '100%' }}>
        <Table.Head>
          <Table.Row>
            <Table.HeaderCell>Booking ID</Table.HeaderCell>
            <Table.HeaderCell>Bruker</Table.HeaderCell>
            <Table.HeaderCell>Dato & Tid</Table.HeaderCell>
            <Table.HeaderCell>Varighet</Table.HeaderCell>
            <Table.HeaderCell>Status</Table.HeaderCell>
            <Table.HeaderCell>Betaling</Table.HeaderCell>
            <Table.HeaderCell style={{ textAlign: 'right' }}>Pris</Table.HeaderCell>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          {bookings.map((booking: Booking) => {
            const duration = calculateDuration(booking.startTime, booking.endTime);
            const startDate = formatDate(booking.startTime);
            const startTime = formatTime(booking.startTime);
            const endTime = formatTime(booking.endTime);

            return (
              <Table.Row
                key={booking.id}
                style={{
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--ds-color-neutral-surface-subtle)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <Table.Cell>
                  <Text
                    data-size="sm"
                    style={{
                      fontFamily: 'monospace',
                      color: 'var(--ds-color-neutral-text-subtle)',
                    }}
                  >
                    {booking.id.slice(0, 8)}
                  </Text>
                </Table.Cell>
                <Table.Cell>
                  <div>
                    <Text data-size="sm" style={{ fontWeight: 500 }}>
                      {booking.userName || 'Ukjent bruker'}
                    </Text>
                    {booking.organizationName && (
                      <Text
                        data-size="xs"
                        style={{
                          display: 'block',
                          color: 'var(--ds-color-neutral-text-subtle)',
                        }}
                      >
                        {booking.organizationName}
                      </Text>
                    )}
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <div>
                    <Text data-size="sm" style={{ fontWeight: 500 }}>
                      {startDate}
                    </Text>
                    <Text
                      data-size="xs"
                      style={{
                        display: 'block',
                        color: 'var(--ds-color-neutral-text-subtle)',
                      }}
                    >
                      {startTime} - {endTime}
                    </Text>
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <Text data-size="sm">{duration}</Text>
                </Table.Cell>
                <Table.Cell>
                  <BookingStatusBadge status={booking.status} />
                </Table.Cell>
                <Table.Cell>
                  {booking.paymentStatus && (
                    <PaymentStatusBadge status={booking.paymentStatus} />
                  )}
                </Table.Cell>
                <Table.Cell style={{ textAlign: 'right' }}>
                  <Text data-size="sm" style={{ fontWeight: 500 }}>
                    {formatCurrency(parseFloat(booking.totalPrice), booking.currency)}
                  </Text>
                </Table.Cell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table>
    </div>
  );
}
