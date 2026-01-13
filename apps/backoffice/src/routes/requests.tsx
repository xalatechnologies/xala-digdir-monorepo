import { useState } from 'react';
import {
  Card,
  Heading,
  Paragraph,
  Button,
  Badge,
  Table,
  Dropdown,
} from '@xala/ds';

// Mock data
interface RequestItem {
  id: string;
  userId: string;
  userName: string;
  organization?: string;
  listingName: string;
  startTime: string;
  endTime: string;
  status: 'pending' | 'needs_info' | 'approved' | 'rejected';
  createdAt: string;
}

const mockRequests: RequestItem[] = [
  { id: 'REQ-2847', userId: '1', userName: 'Nordre Follo IL', organization: 'Nordre Follo IL', listingName: 'Storhallen A', startTime: '2024-01-20 18:00', endTime: '2024-01-20 21:00', status: 'pending', createdAt: '2024-01-13 09:30' },
  { id: 'REQ-2846', userId: '2', userName: 'Ås Turnforening', organization: 'Ås Turnforening', listingName: 'Gymsalen', startTime: '2024-01-22 16:00', endTime: '2024-01-22 19:00', status: 'pending', createdAt: '2024-01-13 08:15' },
  { id: 'REQ-2845', userId: '3', userName: 'Erik Hansen', listingName: 'Møterom 3B', startTime: '2024-01-21 10:00', endTime: '2024-01-21 12:00', status: 'needs_info', createdAt: '2024-01-12 15:45' },
  { id: 'REQ-2844', userId: '4', userName: 'Ski Håndball', organization: 'Ski Håndball', listingName: 'Storhallen A', startTime: '2024-01-25 17:00', endTime: '2024-01-25 20:00', status: 'pending', createdAt: '2024-01-12 14:20' },
  { id: 'REQ-2843', userId: '5', userName: 'Langhus Fotball', organization: 'Langhus Fotball', listingName: 'Kunstgressbanen', startTime: '2024-01-19 16:00', endTime: '2024-01-19 18:00', status: 'pending', createdAt: '2024-01-12 11:00' },
  { id: 'REQ-2842', userId: '6', userName: 'Mari Olsen', listingName: 'Konferanserom', startTime: '2024-01-18 09:00', endTime: '2024-01-18 12:00', status: 'pending', createdAt: '2024-01-11 16:30' },
  { id: 'REQ-2841', userId: '7', userName: 'Ås Kultur', organization: 'Ås Kultur', listingName: 'Storhallen A', startTime: '2024-02-01 18:00', endTime: '2024-02-01 22:00', status: 'pending', createdAt: '2024-01-11 10:00' },
  { id: 'REQ-2840', userId: '8', userName: 'Vestby Korps', organization: 'Vestby Korps', listingName: 'Aulaen', startTime: '2024-01-27 14:00', endTime: '2024-01-27 17:00', status: 'needs_info', createdAt: '2024-01-10 14:45' },
];

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

function StatusBadge({ status }: { status: RequestItem['status'] }) {
  const config: Record<RequestItem['status'], { color: 'warning' | 'info' | 'success' | 'danger'; label: string }> = {
    pending: { color: 'warning', label: 'Venter' },
    needs_info: { color: 'info', label: 'Trenger info' },
    approved: { color: 'success', label: 'Godkjent' },
    rejected: { color: 'danger', label: 'Avslått' },
  };
  return <Badge data-color={config[status].color} data-size="sm">{config[status].label}</Badge>;
}

export function RequestsPage() {
  const [filter, setFilter] = useState<'all' | 'pending' | 'needs_info'>('all');

  const filteredRequests = mockRequests.filter((r) => {
    if (filter === 'all') return r.status === 'pending' || r.status === 'needs_info';
    return r.status === filter;
  });

  const pendingCount = mockRequests.filter((r) => r.status === 'pending').length;
  const needsInfoCount = mockRequests.filter((r) => r.status === 'needs_info').length;

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
            border: filter === 'pending' ? '2px solid var(--ds-color-accent-border-default)' : undefined,
          }}
          onClick={() => setFilter('pending')}
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
                    {request.id}
                  </span>
                </Table.Cell>
                <Table.Cell>
                  <div>
                    <span style={{ fontWeight: 'var(--ds-font-weight-medium)' }}>
                      {request.userName}
                    </span>
                    {request.organization && (
                      <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                        {request.organization}
                      </Paragraph>
                    )}
                  </div>
                </Table.Cell>
                <Table.Cell>{request.listingName}</Table.Cell>
                <Table.Cell>
                  <div>
                    <span style={{ fontSize: 'var(--ds-font-size-sm)' }}>
                      {new Date(request.startTime).toLocaleDateString('nb-NO', { day: 'numeric', month: 'short' })}
                    </span>
                    <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                      {request.startTime.split(' ')[1]} - {request.endTime.split(' ')[1]}
                    </Paragraph>
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <StatusBadge status={request.status} />
                </Table.Cell>
                <Table.Cell>
                  {new Date(request.createdAt).toLocaleDateString('nb-NO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </Table.Cell>
                <Table.Cell>
                  <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)' }}>
                    <Button type="button" variant="primary" data-size="sm" title="Godkjenn">
                      <CheckIcon />
                    </Button>
                    <Button type="button" variant="secondary" data-size="sm" title="Avslå">
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

      {filteredRequests.length === 0 && (
        <Card style={{ padding: 'var(--ds-spacing-8)', textAlign: 'center' }}>
          <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
            Ingen forespørsler å vise.
          </Paragraph>
        </Card>
      )}
    </div>
  );
}
