/**
 * Integrations Overview Page
 * 
 * Shows operational status and deviations for all integrations.
 * Admin-focused view - no configuration of endpoints/keys here.
 * 
 * Content:
 * - Status card per integration: OK / Feil / Deaktivert
 * - Last sync / last event
 * - Deviation list (errors requiring follow-up)
 * - Contact point / escalation (vendor contacts)
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
  Alert,
  Table,
  RefreshIcon,
  CheckCircleIcon,
  XCircleIcon,
  AlertTriangleIcon,
  ChevronRightIcon,
  InboxIcon,
  CalendarIcon,
  SettingsIcon,
} from '@xala/ds';
import {
  useRcoStatus,
  useVismaStatus,
  useVippsStatus,
  useCalendarSyncStatus,
} from '@digilist/client-sdk';
import { useT } from '@xala/i18n';

interface IntegrationStatus {
  provider: string;
  name: string;
  description: string;
  status: 'ok' | 'error' | 'disabled' | 'warning';
  lastSync: string | null;
  lastEvent: string | null;
  deviations: Deviation[];
  contact: VendorContact | null;
  detailsPath?: string;
}

interface Deviation {
  id: string;
  type: 'error' | 'warning';
  message: string;
  timestamp: string;
  canRetry: boolean;
}

interface VendorContact {
  name: string;
  email: string;
  phone?: string;
}

const VENDOR_CONTACTS: Record<string, VendorContact> = {
  rco: { name: 'RCO Support', email: 'support@rco.no', phone: '+47 22 00 00 00' },
  visma: { name: 'Visma Kundeservice', email: 'support@visma.no', phone: '+47 22 00 00 01' },
  acos: { name: 'ACOS Support', email: 'support@acos.no', phone: '+47 22 00 00 02' },
  vipps: { name: 'Vipps Bedrift', email: 'merchant@vipps.no', phone: '+47 22 48 28 00' },
  outlook: { name: 'Microsoft 365 Support', email: 'support@microsoft.com' },
};

function getStatusBadge(status: IntegrationStatus['status']): React.ReactElement {
  switch (status) {
    case 'ok':
      return <Badge color="success">{t("ui.ok")}</Badge>;
    case 'error':
      return <Badge color="danger">{t("ui.error")}</Badge>;
    case 'warning':
      return <Badge color="warning">Avvik</Badge>;
    case 'disabled':
    default:
      return <Badge color="neutral">Deaktivert</Badge>;
  }
}

function getStatusIcon(status: IntegrationStatus['status']): React.ReactElement {
  switch (status) {
    case 'ok':
      return <CheckCircleIcon style={{ color: 'var(--ds-color-success-icon-default)' }} />;
    case 'error':
      return <XCircleIcon style={{ color: 'var(--ds-color-danger-icon-default)' }} />;
    case 'warning':
      return <AlertTriangleIcon style={{ color: 'var(--ds-color-warning-icon-default)' }} />;
    case 'disabled':
    default:
      return <XCircleIcon style={{ color: 'var(--ds-color-neutral-icon-subtle)' }} />;
  }
}

function formatTimestamp(timestamp: string | null): string {
  if (!timestamp) return 'Aldri';
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'Akkurat nå';
  if (diffMins < 60) return `${diffMins} min siden`;
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)} timer siden`;
  return date.toLocaleDateString('nb-NO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function IntegrationCard({ integration }: { integration: IntegrationStatus }): React.ReactElement {
  const hasDeviations = integration.deviations.length > 0;
  
  return (
    <Card style={{ height: '100%' }}>
      <Stack spacing={4}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)' }}>
            {getStatusIcon(integration.status)}
            <div>
              <Heading level={4} data-size="xs" style={{ margin: 0 }}>
                {integration.name}
              </Heading>
              <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
                {integration.description}
              </Paragraph>
            </div>
          </div>
          {getStatusBadge(integration.status)}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--ds-spacing-3)' }}>
          <div>
            <Paragraph data-size="xs" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
              Sist synkronisert
            </Paragraph>
            <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
              {formatTimestamp(integration.lastSync)}
            </Paragraph>
          </div>
          <div>
            <Paragraph data-size="xs" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
              Siste hendelse
            </Paragraph>
            <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
              {formatTimestamp(integration.lastEvent)}
            </Paragraph>
          </div>
        </div>

        {hasDeviations && (
          <Alert 
            style={{ 
              backgroundColor: 'var(--ds-color-warning-surface-default)',
              border: '1px solid var(--ds-color-warning-border-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
              <AlertTriangleIcon style={{ color: 'var(--ds-color-warning-icon-default)', flexShrink: 0 }} />
              <Paragraph data-size="sm" style={{ margin: 0 }}>
                {integration.deviations.length} avvik krever oppfølging
              </Paragraph>
            </div>
          </Alert>
        )}

        {integration.contact && (
          <div style={{ 
            padding: 'var(--ds-spacing-3)', 
            backgroundColor: 'var(--ds-color-neutral-surface-subtle)',
            borderRadius: 'var(--ds-border-radius-md)',
          }}>
            <Paragraph data-size="xs" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0, marginBottom: 'var(--ds-spacing-1)' }}>
              Kontaktpunkt
            </Paragraph>
            <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
              {integration.contact.name}
            </Paragraph>
            <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
              {integration.contact.email}
              {integration.contact.phone && ` · ${integration.contact.phone}`}
            </Paragraph>
          </div>
        )}

        {integration.detailsPath && (
          <Link to={integration.detailsPath} style={{ textDecoration: 'none' }}>
            <Button variant="secondary" data-size="sm" style={{ width: '100%' }} type="button">
              Se detaljer
              <ChevronRightIcon />
            </Button>
          </Link>
        )}
      </Stack>
    </Card>
  );
}

export function IntegrationsOverviewPage():
  const t = useT(); React.ReactElement {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { data: rcoData } = useRcoStatus();
  const { data: vismaData } = useVismaStatus();
  const { data: vippsData } = useVippsStatus();
  const { data: calendarData } = useCalendarSyncStatus();


  const integrations: IntegrationStatus[] = [
    {
      provider: 'rco',
      name: 'RCO Adgangskontroll',
      description: 'Låser og tilgangskoder',
      status: rcoData?.data?.connected ? 'ok' : 'disabled',
      lastSync: null,
      lastEvent: null,
      deviations: [],
      contact: VENDOR_CONTACTS.rco || null,
      detailsPath: undefined,
    },
    {
      provider: 'visma',
      name: 'Visma',
      description: 'Fakturering og regnskap',
      status: vismaData?.data?.connected ? 'ok' : 'disabled',
      lastSync: null,
      lastEvent: null,
      deviations: vismaData?.data?.pendingInvoices ? [{
        id: '1',
        type: 'warning',
        message: `${vismaData.data.pendingInvoices} fakturaer venter på behandling`,
        timestamp: new Date().toISOString(),
        canRetry: false,
      }] : [],
      contact: VENDOR_CONTACTS.visma || null,
      detailsPath: undefined,
    },
    {
      provider: 'acos',
      name: 'Acos WebSak',
      description: 'Arkivering og dokumenthåndtering',
      status: 'ok',
      lastSync: new Date().toISOString(),
      lastEvent: new Date(Date.now() - 3600000).toISOString(),
      deviations: [],
      contact: VENDOR_CONTACTS.acos || null,
      detailsPath: '/integrations/archive',
    },
    {
      provider: 'vipps',
      name: 'Vipps',
      description: 'Betalingsløsning',
      status: vippsData?.data?.connected ? 'ok' : 'disabled',
      lastSync: null,
      lastEvent: null,
      deviations: [],
      contact: VENDOR_CONTACTS.vipps || null,
      detailsPath: undefined,
    },
    {
      provider: 'outlook',
      name: 'Microsoft Outlook',
      description: 'Kalenderintegrasjon',
      status: calendarData?.data?.outlookCalendar?.connected ? 'ok' : 'disabled',
      lastSync: calendarData?.data?.outlookCalendar?.lastSync || null,
      lastEvent: null,
      deviations: [],
      contact: VENDOR_CONTACTS.outlook || null,
      detailsPath: '/integrations/calendar',
    },
  ];

  const activeIntegrations = integrations.filter(i => i.status !== 'disabled');
  const hasErrors = integrations.some(i => i.status === 'error');
  const totalDeviations = integrations.reduce((acc, i) => acc + i.deviations.length, 0);

  const handleRefresh = async (): Promise<void> => {
    setIsRefreshing(true);
    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  return (
    <div style={{ padding: 'var(--ds-spacing-6)' }}>
      <Stack spacing={6}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <Heading level={1} data-size="lg">Integrasjoner</Heading>
            <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
              Oversikt over driftstilstand og avvik for alle integrasjoner
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
            <Link to="/settings?tab=integrations">
              <Button variant="tertiary" type="button">
                <SettingsIcon />{t("ui.settings")}</Button>
            </Link>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--ds-spacing-4)' }}>
          <Card style={{ textAlign: 'center', padding: 'var(--ds-spacing-4)' }}>
            <Heading level={2} data-size="xl" style={{ margin: 0, color: 'var(--ds-color-success-text-default)' }}>
              {activeIntegrations.length}
            </Heading>
            <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
              Aktive integrasjoner
            </Paragraph>
          </Card>
          <Card style={{ textAlign: 'center', padding: 'var(--ds-spacing-4)' }}>
            <Heading level={2} data-size="xl" style={{ margin: 0, color: hasErrors ? 'var(--ds-color-danger-text-default)' : 'var(--ds-color-success-text-default)' }}>
              {hasErrors ? t("ui.error") : t("ui.ok")}
            </Heading>
            <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
              Driftstatus
            </Paragraph>
          </Card>
          <Card style={{ textAlign: 'center', padding: 'var(--ds-spacing-4)' }}>
            <Heading level={2} data-size="xl" style={{ margin: 0, color: totalDeviations > 0 ? 'var(--ds-color-warning-text-default)' : 'var(--ds-color-neutral-text-default)' }}>
              {totalDeviations}
            </Heading>
            <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
              Avvik til oppfølging
            </Paragraph>
          </Card>
        </div>

        <div style={{ display: 'flex', gap: 'var(--ds-spacing-3)', marginBottom: 'var(--ds-spacing-2)' }}>
          <Link to="/integrations/archive" style={{ textDecoration: 'none' }}>
            <Button variant="secondary" type="button">
              <InboxIcon />
              Arkiv (Acos WebSak)
            </Button>
          </Link>
          <Link to="/integrations/calendar" style={{ textDecoration: 'none' }}>
            <Button variant="secondary" type="button">
              <CalendarIcon />
              Kalender (Outlook)
            </Button>
          </Link>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
          gap: 'var(--ds-spacing-4)' 
        }}>
          {integrations.map(integration => (
            <IntegrationCard key={integration.provider} integration={integration} />
          ))}
        </div>

        {totalDeviations > 0 && (
          <Card>
            <Stack spacing={4}>
              <Heading level={3} data-size="sm">Avviksliste</Heading>
              <Table>
                <thead>
                  <tr>
                    <th>Integrasjon</th>
                    <th>Type</th>
                    <th>Beskrivelse</th>
                    <th>Tidspunkt</th>
                    <th>Handling</th>
                  </tr>
                </thead>
                <tbody>
                  {integrations.flatMap(integration => 
                    integration.deviations.map(deviation => (
                      <tr key={deviation.id}>
                        <td>{integration.name}</td>
                        <td>
                          <Badge color={deviation.type === 'error' ? 'danger' : 'warning'}>
                            {deviation.type === 'error' ? t("ui.error") : t("ui.warning")}
                          </Badge>
                        </td>
                        <td>{deviation.message}</td>
                        <td>{formatTimestamp(deviation.timestamp)}</td>
                        <td>
                          {deviation.canRetry && (
                            <Button variant="tertiary" data-size="sm" type="button">
                              Prøv igjen
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </Stack>
          </Card>
        )}
      </Stack>
    </div>
  );
}

export default IntegrationsOverviewPage;
