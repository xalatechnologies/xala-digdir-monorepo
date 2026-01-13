import { useState } from 'react';
import {
  Card,
  Heading,
  Paragraph,
  Button,
  Badge,
  Table,
  Dropdown,
  Spinner,
} from '@xala/ds';
import { useBookings, useConfirmBooking, useCancelBooking, type Booking } from '@xala/sdk';

type RequestStatus = 'pending' | 'needs_info';

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

const MessageIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const MoreIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="1" />
    <circle cx="12" cy="5" r="1" />
    <circle cx="12" cy="19" r="1" />
  </svg>
);

function StatusBadge({ status }: { status: RequestStatus }) {
  const config: Record<RequestStatus, { color: 'warning' | 'info'; label: string }> = {
    pending: { color: 'warning', label: 'Venter' },
    needs_info: { color: 'info', label: 'Trenger info' },
  };
  return <Badge data-color={config[status].color} data-size="sm">{config[status].label}</Badge>;
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('nb-NO', { day: 'numeric', month: 'short' });
}

function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('nb-NO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export function RequestsPage() {
  const [filter, setFilter] = useState<'all' | RequestStatus>('all');

  // Fetch pending bookings (requests) from API
  const { data: pendingData, isLoading } = useBookings({ status: 'pending' });
  const pendingBookings = pendingData?.data ?? [];

  const confirmBooking = useConfirmBooking();
  const cancelBooking = useCancelBooking();

  // For now, all pending bookings are in "pending" state
  // In a real implementation, you might have a separate field for "needs_info"
  const pendingCount = pendingBookings.length;
  const needsInfoCount = 0; // Would come from API if tracked separately

  // Filter requests based on selected filter
  const filteredRequests = filter === 'all'
    ? pendingBookings
    : pendingBookings; // In real implementation, filter by needs_info flag

  const handleApprove = async (id: string) => {
    await confirmBooking.mutateAsync(id);
  };

  const handleReject = async (id: string) => {
    if (window.confirm('Er du sikker på at du vil avslå denne forespørselen?')) {
      await cancelBooking.mutateAsync(id);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
      {/* Header */}
      <div>
        <Heading level={1} data-size="lg" style={{ margin: 0 }}>
          Forespørsler
        </Heading>
        <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)', marginTop: 'var(--ds-spacing-2)', marginBottom: 0 }}>
          Behandle innkommende bookingforespørsler.
        </Paragraph>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 'var(--ds-spacing-4)' }}>
        <Card
          style={{
            padding: 'var(--ds-spacing-4) var(--ds-spacing-5)',
            cursor: 'pointer',
            border: filter === 'pending' || filter === 'all' ? '2px solid var(--ds-color-accent-border-default)' : undefined,
          }}
          onClick={() => setFilter('all')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--ds-border-radius-md)',
                backgroundColor: 'var(--ds-color-warning-surface-default)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--ds-color-warning-text-default)',
                fontSize: 'var(--ds-font-size-lg)',
                fontWeight: 'var(--ds-font-weight-bold)',
              }}
            >
              {pendingCount}
            </div>
            <div>
              <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
                Ventende
              </Paragraph>
              <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                Krever behandling
              </Paragraph>
            </div>
          </div>
        </Card>

        <Card
          style={{
            padding: 'var(--ds-spacing-4) var(--ds-spacing-5)',
            cursor: 'pointer',
            border: filter === 'needs_info' ? '2px solid var(--ds-color-accent-border-default)' : undefined,
          }}
          onClick={() => setFilter('needs_info')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--ds-border-radius-md)',
                backgroundColor: 'var(--ds-color-info-surface-default)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--ds-color-info-text-default)',
                fontSize: 'var(--ds-font-size-lg)',
                fontWeight: 'var(--ds-font-weight-bold)',
              }}
            >
              {needsInfoCount}
            </div>
            <div>
              <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
                Trenger info
              </Paragraph>
              <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                Venter på svar
              </Paragraph>
            </div>
          </div>
        </Card>
      </div>

      {/* Table */}
      {isLoading ? (
        <Card style={{ padding: 'var(--ds-spacing-8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Spinner />
        </Card>
      ) : filteredRequests.length === 0 ? (
        <Card style={{ padding: 'var(--ds-spacing-8)', textAlign: 'center' }}>
          <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
            Ingen forespørsler å vise.
          </Paragraph>
        </Card>
      ) : (
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <Table>
            <Table.Head>
              <Table.Row>
                <Table.HeaderCell>ID</Table.HeaderCell>
                <Table.HeaderCell>Søker</Table.HeaderCell>
                <Table.HeaderCell>Lokale</Table.HeaderCell>
                <Table.HeaderCell>Tidsrom</Table.HeaderCell>
                <Table.HeaderCell>Status</Table.HeaderCell>
                <Table.HeaderCell>Opprettet</Table.HeaderCell>
                <Table.HeaderCell style={{ width: '180px' }}>Handlinger</Table.HeaderCell>
              </Table.Row>
            </Table.Head>
            <Table.Body>
              {filteredRequests.map((request) => (
                <Table.Row key={request.id}>
                  <Table.Cell>
                    <span style={{ fontFamily: 'monospace', fontSize: 'var(--ds-font-size-sm)' }}>
                      {request.id.slice(-8)}
                    </span>
                  </Table.Cell>
                  <Table.Cell>
                    <div>
                      <span style={{ fontWeight: 'var(--ds-font-weight-medium)' }}>
                        {request.userName || request.userId || 'Ukjent'}
                      </span>
                      {request.organizationName && (
                        <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                          {request.organizationName}
                        </Paragraph>
                      )}
                    </div>
                  </Table.Cell>
                  <Table.Cell>{request.listingName || request.listingId}</Table.Cell>
                  <Table.Cell>
                    <div>
                      <span style={{ fontSize: 'var(--ds-font-size-sm)' }}>
                        {formatDate(request.startTime)}
                      </span>
                      <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                        {formatTime(request.startTime)} - {formatTime(request.endTime)}
                      </Paragraph>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <StatusBadge status="pending" />
                  </Table.Cell>
                  <Table.Cell>
                    {formatDateTime(request.createdAt)}
                  </Table.Cell>
                  <Table.Cell>
                    <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)' }}>
                      <Button
                        type="button"
                        variant="primary"
                        data-size="sm"
                        title="Godkjenn"
                        onClick={() => handleApprove(request.id)}
                        disabled={confirmBooking.isPending}
                      >
                        <CheckIcon />
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        data-size="sm"
                        title="Avslå"
                        onClick={() => handleReject(request.id)}
                        disabled={cancelBooking.isPending}
                      >
                        <XIcon />
                      </Button>
                      <Button type="button" variant="tertiary" data-size="sm" title="Send melding">
                        <MessageIcon />
                      </Button>
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
                              <Dropdown.Button>Be om mer info</Dropdown.Button>
                            </Dropdown.Item>
                            <Dropdown.Item>
                              <Dropdown.Button>Se i kalender</Dropdown.Button>
                            </Dropdown.Item>
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
