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
} from '@xalatechnologies/platform/ui';
import { useT } from '@xala/i18n';

interface ArchiveEvent {
  id: string;
  type: 'booking' | 'document' | 'contract' | 'invoice';
  title: string;
  status: 'sent' | 'failed' | 'pending';
  timestamp: string;
  errorMessage?: string;
  caseNumber?: string;
}

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

export function ArchivePage(): React.ReactElement {
  const t = useT();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isRetrying, setIsRetrying] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const getEventTypeLabel = (type: ArchiveEvent['type']): string => {
    const labels: Record<ArchiveEvent['type'], string> = {
      booking: t('integrations.archive.type.booking'),
      document: t('integrations.archive.type.document'),
      contract: t('integrations.archive.type.contract'),
      invoice: t('integrations.archive.type.invoice'),
    };
    return labels[type];
  };

  const getStatusBadge = (status: ArchiveEvent['status']): React.ReactElement => {
    switch (status) {
      case 'sent':
        return <Badge color="success">{t('integrations.archive.status.sent')}</Badge>;
      case 'failed':
        return <Badge color="danger">{t('integrations.archive.status.failed')}</Badge>;
      case 'pending':
      default:
        return <Badge color="warning">{t('integrations.archive.status.pending')}</Badge>;
    }
  };

  // Mock data - in real implementation, this would come from useAcosArchiveEvents()
  const isActive = true;
  const events: ArchiveEvent[] = [
    {
      id: '1',
      type: 'booking',
      title: t('common.booking_12345_kulturhuset_stor'),
      status: 'sent',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      caseNumber: '2024/1234',
    },
    {
      id: '2',
      type: 'contract',
      title: t('common.leiekontrakt_oslo_il'),
      status: 'sent',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      caseNumber: '2024/1235',
    },
    {
      id: '3',
      type: 'invoice',
      title: t('common.faktura_inv2024001'),
      status: 'failed',
      timestamp: new Date(Date.now() - 10800000).toISOString(),
      errorMessage: t('errors.kunne_ikke_koble_til'),
    },
    {
      id: '4',
      type: 'document',
      title: t('common.vedlegg_til_booking_12340'),
      status: 'pending',
      timestamp: new Date(Date.now() - 1800000).toISOString(),
    },
    {
      id: '5',
      type: 'booking',
      title: t('common.booking_12346_idrettshall_a'),
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
            {t('integrations.archive.backToOverview')}
          </Link>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)' }}>
                <Heading level={1} data-size="lg">{t('integrations.archive.page.title')}</Heading>
                {isActive ? (
                  <Badge color="success">{t('integrations.archive.statusActive')}</Badge>
                ) : (
                  <Badge color="neutral">{t('integrations.archive.statusInactive')}</Badge>
                )}
              </div>
              <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                {t('integrations.archive.description')}
              </Paragraph>
            </div>
            <Button
              variant="secondary"
              onClick={handleRefresh}
              disabled={isRefreshing}
              type="button"
            >
              {isRefreshing ? <Spinner aria-hidden="true" /> : <RefreshIcon />}
              {t('integrations.archive.refresh')}
            </Button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--ds-spacing-4)' }}>
          <Card style={{ textAlign: 'center', padding: 'var(--ds-spacing-4)' }}>
            <Heading level={2} data-size="xl" style={{ margin: 0 }}>
              {stats.total}
            </Heading>
            <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
              {t('integrations.archive.stats.total')}
            </Paragraph>
          </Card>
          <Card style={{ textAlign: 'center', padding: 'var(--ds-spacing-4)' }}>
            <Heading level={2} data-size="xl" style={{ margin: 0, color: 'var(--ds-color-success-text-default)' }}>
              {stats.sent}
            </Heading>
            <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
              {t('integrations.archive.stats.sent')}
            </Paragraph>
          </Card>
          <Card style={{ textAlign: 'center', padding: 'var(--ds-spacing-4)' }}>
            <Heading level={2} data-size="xl" style={{ margin: 0, color: 'var(--ds-color-danger-text-default)' }}>
              {stats.failed}
            </Heading>
            <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
              {t('integrations.archive.stats.failed')}
            </Paragraph>
          </Card>
          <Card style={{ textAlign: 'center', padding: 'var(--ds-spacing-4)' }}>
            <Heading level={2} data-size="xl" style={{ margin: 0, color: 'var(--ds-color-warning-text-default)' }}>
              {stats.pending}
            </Heading>
            <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
              {t('integrations.archive.stats.pending')}
            </Paragraph>
          </Card>
        </div>

        <Card>
          <Stack spacing={4}>
            <Heading level={3} data-size="sm">{t('integrations.archive.events.page.title')}</Heading>

            <div style={{ display: 'flex', gap: 'var(--ds-spacing-3)', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <Textfield
                  aria-label={t('action.search')}
                  placeholder={t('integrations.archive.events.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select
                aria-label={t('integrations.archive.events.filterType')}
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                style={{ minWidth: '150px' }}
              >
                <option value="all">{t('integrations.archive.events.allTypes')}</option>
                <option value="booking">{t('integrations.archive.type.booking')}</option>
                <option value="document">{t('integrations.archive.type.document')}</option>
                <option value="contract">{t('integrations.archive.type.contract')}</option>
                <option value="invoice">{t('integrations.archive.type.invoice')}</option>
              </Select>
              <Select
                aria-label={t('integrations.archive.events.filterStatus')}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ minWidth: '150px' }}
              >
                <option value="all">{t('integrations.archive.events.allStatuses')}</option>
                <option value="sent">{t('integrations.archive.status.sent')}</option>
                <option value="failed">{t('integrations.archive.status.failed')}</option>
                <option value="pending">{t('integrations.archive.status.pending')}</option>
              </Select>
            </div>

            <Table>
              <thead>
                <tr>
                  <th>{t('integrations.archive.table.type')}</th>
                  <th>{t('integrations.archive.table.page.title')}</th>
                  <th>{t('integrations.archive.table.caseNumber')}</th>
                  <th>{t('integrations.archive.table.status')}</th>
                  <th>{t('integrations.archive.table.timestamp')}</th>
                  <th>{t('integrations.archive.table.action')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.map(event => (
                  <tr key={event.id}>
                    <td>
                      <Badge color="neutral">{getEventTypeLabel(event.type)}</Badge>
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
                          {t('integrations.archive.events.retry')}
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
                  {t('integrations.archive.events.noResults')}
                </Paragraph>
              </div>
            )}
          </Stack>
        </Card>

        <Card>
          <Stack spacing={3}>
            <Heading level={3} data-size="sm">{t('integrations.archive.eventTypes.page.title')}</Heading>
            <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
              {t('integrations.archive.eventTypes.description')}
            </Paragraph>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--ds-spacing-3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
                <CheckCircleIcon style={{ color: 'var(--ds-color-success-icon-default)' }} />
                <Paragraph data-size="sm" style={{ margin: 0 }}>{t('integrations.archive.eventTypes.bookings')}</Paragraph>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
                <CheckCircleIcon style={{ color: 'var(--ds-color-success-icon-default)' }} />
                <Paragraph data-size="sm" style={{ margin: 0 }}>{t('integrations.archive.eventTypes.contracts')}</Paragraph>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
                <CheckCircleIcon style={{ color: 'var(--ds-color-success-icon-default)' }} />
                <Paragraph data-size="sm" style={{ margin: 0 }}>{t('integrations.archive.eventTypes.invoices')}</Paragraph>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
                <CheckCircleIcon style={{ color: 'var(--ds-color-success-icon-default)' }} />
                <Paragraph data-size="sm" style={{ margin: 0 }}>{t('integrations.archive.eventTypes.documents')}</Paragraph>
              </div>
            </div>
          </Stack>
        </Card>
      </Stack>
    </div>
  );
}

export default ArchivePage;
