/**
 * Acos WebSak Archive Page
 * 
 * Admin can:
 * - See if integration is active
 * - See what's archived (types of events/documents)
 * - See status on archive (sent/failed)
 * - See error messages + "Try again" per event
 * 
 * Admin cannot configure:
 * - Endpoints, keys, certificates, folder structure in archive
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Card,
  Heading,
  Paragraph,
  Button,
  Spinner,
  Badge,
  Stack,
  Table,
  RefreshIcon,
  CheckCircleIcon,
  ChevronLeftIcon,
  Textfield,
  Select,
} from '@xala/ds';

interface ArchiveEvent {
  id: string;
  type: 'booking' | 'document' | 'contract' | 'invoice';
  title: string;
  status: 'sent' | 'failed' | 'pending';
  timestamp: string;
  errorMessage?: string;
  caseNumber?: string;
}

const EVENT_TYPE_LABELS: Record<ArchiveEvent['type'], string> = {
  booking: 'Booking',
  document: 'Dokument',
  contract: 'Kontrakt',
  invoice: 'Faktura',
};

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString('nb-NO', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric',
    hour: '2-digit', 
    minute: '2-digit' 
  });
}

function getStatusBadge(status: ArchiveEvent['status']): React.ReactElement {
  switch (status) {
    case 'sent':
      return <Badge color="success">Sendt</Badge>;
    case 'failed':
      return <Badge color="danger">Feilet</Badge>;
    case 'pending':
    default:
      return <Badge color="warning">Venter</Badge>;
  }
}

export function ArchivePage(): React.ReactElement {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isRetrying, setIsRetrying] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Mock data - in real implementation, this would come from useAcosArchiveEvents()
  const isActive = true;
  const events: ArchiveEvent[] = [
    {
      id: '1',
      type: 'booking',
      title: 'Booking #12345 - Kulturhuset Stor sal',
      status: 'sent',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      caseNumber: '2024/1234',
    },
    {
      id: '2',
      type: 'contract',
      title: 'Leiekontrakt - Oslo IL',
      status: 'sent',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      caseNumber: '2024/1235',
    },
    {
      id: '3',
      type: 'invoice',
      title: 'Faktura INV-2024-001',
      status: 'failed',
      timestamp: new Date(Date.now() - 10800000).toISOString(),
      errorMessage: 'Kunne ikke koble til arkivsystemet. Sjekk nettverkstilkobling.',
    },
    {
      id: '4',
      type: 'document',
      title: 'Vedlegg til booking #12340',
      status: 'pending',
      timestamp: new Date(Date.now() - 1800000).toISOString(),
    },
    {
      id: '5',
      type: 'booking',
      title: 'Booking #12346 - Idrettshall A',
      status: 'sent',
      timestamp: new Date(Date.now() - 14400000).toISOString(),
      caseNumber: '2024/1236',
    },
  ];

  const handleRefresh = async (): Promise<void> => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  const handleRetry = async (eventId: string): Promise<void> => {
    setIsRetrying(eventId);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsRetrying(null);
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.caseNumber?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || event.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const stats = {
    total: events.length,
    sent: events.filter(e => e.status === 'sent').length,
    failed: events.filter(e => e.status === 'failed').length,
    pending: events.filter(e => e.status === 'pending').length,
  };

  return (
    <div style={{ padding: 'var(--ds-spacing-6)' }}>
      <Stack spacing={6}>
        <div>
          <Link to="/integrations" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 'var(--ds-spacing-1)', marginBottom: 'var(--ds-spacing-3)', color: 'var(--ds-color-accent-text-default)' }}>
            <ChevronLeftIcon />
            Tilbake til oversikt
          </Link>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)' }}>
                <Heading level={1} data-size="lg">Acos WebSak - Arkiv</Heading>
                {isActive ? (
                  <Badge color="success">Aktiv</Badge>
                ) : (
                  <Badge color="neutral">Inaktiv</Badge>
                )}
              </div>
              <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                Se hva som arkiveres og status på arkivering
              </Paragraph>
            </div>
            <Button 
              variant="secondary" 
              onClick={handleRefresh} 
              disabled={isRefreshing}
              type="button"
            >
              {isRefreshing ? <Spinner aria-hidden="true" /> : <RefreshIcon />}
              Oppdater
            </Button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--ds-spacing-4)' }}>
          <Card style={{ textAlign: 'center', padding: 'var(--ds-spacing-4)' }}>
            <Heading level={2} data-size="xl" style={{ margin: 0 }}>
              {stats.total}
            </Heading>
            <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
              Totalt
            </Paragraph>
          </Card>
          <Card style={{ textAlign: 'center', padding: 'var(--ds-spacing-4)' }}>
            <Heading level={2} data-size="xl" style={{ margin: 0, color: 'var(--ds-color-success-text-default)' }}>
              {stats.sent}
            </Heading>
            <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
              Sendt
            </Paragraph>
          </Card>
          <Card style={{ textAlign: 'center', padding: 'var(--ds-spacing-4)' }}>
            <Heading level={2} data-size="xl" style={{ margin: 0, color: 'var(--ds-color-danger-text-default)' }}>
              {stats.failed}
            </Heading>
            <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
              Feilet
            </Paragraph>
          </Card>
          <Card style={{ textAlign: 'center', padding: 'var(--ds-spacing-4)' }}>
            <Heading level={2} data-size="xl" style={{ margin: 0, color: 'var(--ds-color-warning-text-default)' }}>
              {stats.pending}
            </Heading>
            <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
              Venter
            </Paragraph>
          </Card>
        </div>

        <Card>
          <Stack spacing={4}>
            <Heading level={3} data-size="sm">Arkiverte hendelser</Heading>
            
            <div style={{ display: 'flex', gap: 'var(--ds-spacing-3)', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <Textfield
                  aria-label="Søk"
                  placeholder="Søk etter tittel eller saksnummer..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select
                aria-label="Filter type"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                style={{ minWidth: '150px' }}
              >
                <option value="all">Alle typer</option>
                <option value="booking">Booking</option>
                <option value="document">Dokument</option>
                <option value="contract">Kontrakt</option>
                <option value="invoice">Faktura</option>
              </Select>
              <Select
                aria-label="Filter status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ minWidth: '150px' }}
              >
                <option value="all">Alle statuser</option>
                <option value="sent">Sendt</option>
                <option value="failed">Feilet</option>
                <option value="pending">Venter</option>
              </Select>
            </div>

            <Table>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Tittel</th>
                  <th>Saksnummer</th>
                  <th>Status</th>
                  <th>Tidspunkt</th>
                  <th>Handling</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.map(event => (
                  <tr key={event.id}>
                    <td>
                      <Badge color="neutral">{EVENT_TYPE_LABELS[event.type]}</Badge>
                    </td>
                    <td>
                      <div>
                        <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
                          {event.title}
                        </Paragraph>
                        {event.errorMessage && (
                          <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-danger-text-default)', marginTop: 'var(--ds-spacing-1)' }}>
                            {event.errorMessage}
                          </Paragraph>
                        )}
                      </div>
                    </td>
                    <td>
                      {event.caseNumber || '-'}
                    </td>
                    <td>
                      {getStatusBadge(event.status)}
                    </td>
                    <td>
                      {formatTimestamp(event.timestamp)}
                    </td>
                    <td>
                      {event.status === 'failed' && (
                        <Button 
                          variant="tertiary" 
                          data-size="sm" 
                          onClick={() => handleRetry(event.id)}
                          disabled={isRetrying === event.id}
                          type="button"
                        >
                          {isRetrying === event.id ? (
                            <Spinner aria-hidden="true" />
                          ) : (
                            <RefreshIcon />
                          )}
                          Prøv igjen
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>

            {filteredEvents.length === 0 && (
              <div style={{ textAlign: 'center', padding: 'var(--ds-spacing-6)' }}>
                <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                  Ingen hendelser funnet
                </Paragraph>
              </div>
            )}
          </Stack>
        </Card>

        <Card>
          <Stack spacing={3}>
            <Heading level={3} data-size="sm">Arkiverte hendelsestyper</Heading>
            <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
              Følgende hendelsestyper arkiveres automatisk til Acos WebSak:
            </Paragraph>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--ds-spacing-3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
                <CheckCircleIcon style={{ color: 'var(--ds-color-success-icon-default)' }} />
                <Paragraph data-size="sm" style={{ margin: 0 }}>Bookinger og reservasjoner</Paragraph>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
                <CheckCircleIcon style={{ color: 'var(--ds-color-success-icon-default)' }} />
                <Paragraph data-size="sm" style={{ margin: 0 }}>Leiekontrakter</Paragraph>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
                <CheckCircleIcon style={{ color: 'var(--ds-color-success-icon-default)' }} />
                <Paragraph data-size="sm" style={{ margin: 0 }}>Fakturaer</Paragraph>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
                <CheckCircleIcon style={{ color: 'var(--ds-color-success-icon-default)' }} />
                <Paragraph data-size="sm" style={{ margin: 0 }}>Dokumenter og vedlegg</Paragraph>
              </div>
            </div>
          </Stack>
        </Card>
      </Stack>
    </div>
  );
}

export default ArchivePage;
