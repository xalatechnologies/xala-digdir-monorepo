/**
 * Pending Bookings Page
 * Shows bookings with status 'pending' that require approval
 * Available to org_member users with CAP_BOOKINGS_APPROVE_ASSIGNED capability
 */
import { Heading, Paragraph, Card, Skeleton, Button } from '@xala/ds';
import { useNavigate, Link } from 'react-router-dom';
import { useBookings } from '@digilist/client-sdk';

export default function PendingBookingsPage() {
  const navigate = useNavigate();
  const { data, isLoading, error } = useBookings({ status: 'pending', limit: 50 });

  if (isLoading) {
    return (
      <div style={{ padding: 'var(--ds-spacing-6)' }}>
        <Skeleton width="40%" height={32} style={{ marginBottom: 'var(--ds-spacing-4)' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-3)' }}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} width="100%" height={80} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 'var(--ds-spacing-6)', textAlign: 'center' }}>
        <Paragraph style={{ color: 'var(--ds-color-danger-text-default)' }}>
          Kunne ikke laste ventende bookinger
        </Paragraph>
      </div>
    );
  }

  const bookings = data?.data ?? [];

  return (
    <div style={{ padding: 'var(--ds-spacing-6)' }}>
      <header style={{ marginBottom: 'var(--ds-spacing-6)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Heading level={1} data-size="lg">
              Ventende godkjenninger
            </Heading>
            <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)', marginTop: 'var(--ds-spacing-1)' }}>
              {bookings.length} forespørsler som venter på behandling
            </Paragraph>
          </div>
          <Link to="/bookings" style={{ textDecoration: 'none' }}>
            <Button type="button" variant="tertiary">
              Se alle bookinger
            </Button>
          </Link>
        </div>
      </header>

      {bookings.length === 0 ? (
        <Card style={{ padding: 'var(--ds-spacing-8)', textAlign: 'center' }}>
          <Paragraph data-size="lg" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
            🎉
          </Paragraph>
          <Heading level={2} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
            Ingen ventende forespørsler
          </Heading>
          <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
            Alle forespørsler er behandlet
          </Paragraph>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
          {bookings.map((booking: any) => (
            <Card
              key={booking.id}
              style={{
                padding: 'var(--ds-spacing-4)',
                cursor: 'pointer',
                border: '1px solid var(--ds-color-warning-border-default)',
                backgroundColor: 'var(--ds-color-warning-surface-default)',
              }}
              onClick={() => navigate(`/bookings/${booking.id}`)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <Heading level={3} data-size="xs" style={{ marginBottom: 'var(--ds-spacing-1)' }}>
                    {booking.rentalObjectName || 'Ukjent objekt'}
                  </Heading>
                  <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', marginBottom: 'var(--ds-spacing-2)' }}>
                    Fra: {booking.user?.name || 'Ukjent bruker'}
                  </Paragraph>
                  <Paragraph data-size="sm">
                    {new Date(booking.startTime).toLocaleDateString('nb-NO', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                    {' kl. '}
                    {new Date(booking.startTime).toLocaleTimeString('nb-NO', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                    {' - '}
                    {new Date(booking.endTime).toLocaleTimeString('nb-NO', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Paragraph>
                </div>
                <span
                  style={{
                    padding: 'var(--ds-spacing-1) var(--ds-spacing-3)',
                    borderRadius: 'var(--ds-border-radius-full)',
                    backgroundColor: 'var(--ds-color-warning-base-default)',
                    color: 'white',
                    fontSize: 'var(--ds-font-size-xs)',
                    fontWeight: 'var(--ds-font-weight-medium)',
                  }}
                >
                  Venter
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
