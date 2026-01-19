/**
 * Calendar Integration Page (Microsoft Outlook)
 * 
 * Admin can:
 * - Enable/disable calendar invitations (ICS) to tenants
 * - Choose if municipality uses resource calendar (read-only)
 * - See status on last sends
 * 
 * Admin cannot configure:
 * - API credentials, endpoints (handled in settings)
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
  Switch,
  Table,
  RefreshIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChevronLeftIcon,
  CalendarIcon,
  SendIcon,
} from '@xala/ds';
import { useCalendarSyncStatus, useSyncCalendar } from '@digilist/client-sdk';
import { useT } from '@xala/i18n';

interface CalendarSend {
  id: string;
  type: 'invitation' | 'update' | 'cancellation';
  recipient: string;
  bookingTitle: string;
  status: 'sent' | 'failed' | 'pending';
  timestamp: string;
  errorMessage?: string;
}

const SEND_TYPE_LABELS: Record<CalendarSend['type'], string> = {
  invitation: 'Invitasjon',
  update: 'Oppdatering',
  cancellation: 'Kansellering',
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

function getStatusBadge(status: CalendarSend['status'], t: (key: string) => string): React.ReactElement {
  switch (status) {
    case 'sent':
      return <Badge color="success">{t('integrations.text.sendt')}</Badge>;
    case 'failed':
      return <Badge color="danger">{t('integrations.text.failed')}</Badge>;
    case 'pending':
    default:
      return <Badge color="warning">{t("status.pending")}</Badge>;
  }
}

export function CalendarIntegrationPage(): React.ReactElement {
  const t = useT();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [icsEnabled, setIcsEnabled] = useState(true);
  const [resourceCalendarEnabled, setResourceCalendarEnabled] = useState(false);

  const { data: calendarData, refetch } = useCalendarSyncStatus();
  const syncMutation = useSyncCalendar();

  const isConnected = calendarData?.data?.outlookCalendar?.connected ?? false;
  const lastSync = calendarData?.data?.outlookCalendar?.lastSync;

  // Mock data for recent sends
  const recentSends: CalendarSend[] = [
    {
      id: '1',
      type: 'invitation',
      recipient: 'ola.nordmann@example.com',
      bookingTitle: 'Booking #12345 - Kulturhuset Stor sal',
      status: 'sent',
      timestamp: new Date(Date.now() - 1800000).toISOString(),
    },
    {
      id: '2',
      type: 'update',
      recipient: 'kari.hansen@example.com',
      bookingTitle: 'Booking #12340 - Møterom A',
      status: 'sent',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: '3',
      type: 'cancellation',
      recipient: 'per.olsen@example.com',
      bookingTitle: 'Booking #12338 - Gymsal',
      status: 'failed',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      errorMessage: t('errors.ugyldig_epostadresse'),
    },
    {
      id: '4',
      type: 'invitation',
      recipient: 'anne.berg@example.com',
      bookingTitle: 'Booking #12346 - Idrettshall B',
      status: 'sent',
      timestamp: new Date(Date.now() - 10800000).toISOString(),
    },
  ];

  const handleRefresh = async (): Promise<void> => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  const handleSync = async (): Promise<void> => {
    await syncMutation.mutateAsync('outlook');
  };

  const stats = {
    total: recentSends.length,
    sent: recentSends.filter(s => s.status === 'sent').length,
    failed: recentSends.filter(s => s.status === 'failed').length,
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
                <CalendarIcon style={{ width: 24, height: 24 }} />
                <Heading level={1} data-size="lg">Microsoft Outlook - Kalender</Heading>
                {isConnected ? (
                  <Badge color="success">{t('integrations.text.tilkoblet')}</Badge>
                ) : (
                  <Badge color="neutral">{t('common.ikke_tilkoblet')}</Badge>
                )}
              </div>
              <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                Administrer kalenderinvitasjoner og ressurskalender
              </Paragraph>
            </div>
            <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)' }}>
              <Button 
                variant="secondary" 
                onClick={handleRefresh} 
                disabled={isRefreshing}
                type="button"
              >
                {isRefreshing ? <Spinner aria-hidden="true" /> : <RefreshIcon />}
                Oppdater
              </Button>
              <Button 
                variant="primary" 
                onClick={handleSync} 
                disabled={syncMutation.isPending || !isConnected}
                type="button"
              >
                {syncMutation.isPending ? <Spinner aria-hidden="true" /> : <SendIcon />}
                Synkroniser
              </Button>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--ds-spacing-4)' }}>
          <Card>
            <Stack spacing={4}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <Heading level={3} data-size="sm">Kalenderinvitasjoner (ICS)</Heading>
                  <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
                    Send kalenderinvitasjoner til leietakere ved booking
                  </Paragraph>
                </div>
                <Switch
                  checked={icsEnabled}
                  onChange={() => setIcsEnabled(!icsEnabled)}
                  aria-label={t('common.aktiver_kalenderinvitasjoner')}
                />
              </div>
              {icsEnabled && (
                <div style={{ 
                  padding: 'var(--ds-spacing-3)', 
                  backgroundColor: 'var(--ds-color-success-surface-default)',
                  borderRadius: 'var(--ds-border-radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--ds-spacing-2)',
                }}>
                  <CheckCircleIcon style={{ color: 'var(--ds-color-success-icon-default)' }} />
                  <Paragraph data-size="sm" style={{ margin: 0 }}>
                    Leietakere mottar automatisk kalenderinvitasjoner
                  </Paragraph>
                </div>
              )}
            </Stack>
          </Card>

          <Card>
            <Stack spacing={4}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <Heading level={3} data-size="sm">{t('integrations.text.ressurskalender')}</Heading>
                  <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
                    Bruk kommunens ressurskalender (kun lesing)
                  </Paragraph>
                </div>
                <Switch
                  checked={resourceCalendarEnabled}
                  onChange={() => setResourceCalendarEnabled(!resourceCalendarEnabled)}
                  aria-label={t('common.aktiver_ressurskalender')}
                />
              </div>
              {resourceCalendarEnabled && (
                <div style={{ 
                  padding: 'var(--ds-spacing-3)', 
                  backgroundColor: 'var(--ds-color-info-surface-default)',
                  borderRadius: 'var(--ds-border-radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--ds-spacing-2)',
                }}>
                  <CalendarIcon style={{ color: 'var(--ds-color-info-icon-default)' }} />
                  <Paragraph data-size="sm" style={{ margin: 0 }}>
                    Bookinger vises i kommunens ressurskalender
                  </Paragraph>
                </div>
              )}
            </Stack>
          </Card>
        </div>

        <Card>
          <Stack spacing={4}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Heading level={3} data-size="sm">{t('integrations.text.sisteUtsendelser')}</Heading>
              <div style={{ display: 'flex', gap: 'var(--ds-spacing-3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-1)' }}>
                  <CheckCircleIcon style={{ color: 'var(--ds-color-success-icon-default)', width: 16, height: 16 }} />
                  <Paragraph data-size="sm" style={{ margin: 0 }}>{stats.sent} sendt</Paragraph>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-1)' }}>
                  <XCircleIcon style={{ color: 'var(--ds-color-danger-icon-default)', width: 16, height: 16 }} />
                  <Paragraph data-size="sm" style={{ margin: 0 }}>{stats.failed} feilet</Paragraph>
                </div>
              </div>
            </div>

            <Table>
              <thead>
                <tr>
                  <th>{t('integrations.text.type')}</th>
                  <th>{t('integrations.text.mottaker')}</th>
                  <th>{t('integrations.text.booking')}</th>
                  <th>{t('integrations.text.status')}</th>
                  <th>{t('integrations.text.tidspunkt')}</th>
                </tr>
              </thead>
              <tbody>
                {recentSends.map(send => (
                  <tr key={send.id}>
                    <td>
                      <Badge color="neutral">{SEND_TYPE_LABELS[send.type]}</Badge>
                    </td>
                    <td>{send.recipient}</td>
                    <td>
                      <div>
                        <Paragraph data-size="sm" style={{ margin: 0 }}>
                          {send.bookingTitle}
                        </Paragraph>
                        {send.errorMessage && (
                          <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-danger-text-default)', marginTop: 'var(--ds-spacing-1)' }}>
                            {send.errorMessage}
                          </Paragraph>
                        )}
                      </div>
                    </td>
                    <td>
                      {getStatusBadge(send.status, t)}
                    </td>
                    <td>
                      {formatTimestamp(send.timestamp)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>

            {lastSync && (
              <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
                Sist synkronisert: {formatTimestamp(lastSync)}
              </Paragraph>
            )}
          </Stack>
        </Card>
      </Stack>
    </div>
  );
}

export default CalendarIntegrationPage;
