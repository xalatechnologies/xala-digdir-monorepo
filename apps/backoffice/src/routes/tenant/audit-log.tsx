/**
 * TenantAuditLogPage
 *
 * TenantAdmin page for viewing system-wide audit trail
 * - All platform events
 * - User actions
 * - System changes
 * - Security events
 */

import { useState, useEffect } from 'react';
import {
  Card,
  Heading,
  Paragraph,
  Button,
  Select,
  Input,
  Badge,
  Table,
  Spinner,
  Label,
} from '@xalatechnologies/platform/ui';
import { useLocale, useT } from '@xala/i18n';

const MOBILE_BREAKPOINT = 768;

type EventType = 'user' | 'booking' | 'system' | 'security';
type EventSeverity = 'info' | 'warning' | 'error';

// Mock audit events
const mockAuditEvents = [
  {
    id: 'evt-001',
    type: 'security' as EventType,
    severity: 'warning' as EventSeverity,
    action: 'Failed login attempt',
    details: 'Multiple failed login attempts for user@example.com',
    ip: '192.168.1.100',
    timestamp: '2026-01-14T16:30:00Z',
  },
  {
    id: 'evt-002',
    type: 'user' as EventType,
    severity: 'info' as EventSeverity,
    action: 'User registered',
    details: 'New user registration: kari.hansen@example.com',
    ip: '10.0.0.50',
    timestamp: '2026-01-14T15:00:00Z',
  },
  {
    id: 'evt-003',
    type: 'system' as EventType,
    severity: 'info' as EventSeverity,
    action: 'Settings updated',
    details: 'Platform settings updated by admin',
    ip: '10.0.0.1',
    timestamp: '2026-01-14T12:00:00Z',
  },
  {
    id: 'evt-004',
    type: 'booking' as EventType,
    severity: 'info' as EventSeverity,
    action: 'Booking created',
    details: 'Booking #B-2026-156 created for Skien IL',
    ip: '192.168.1.50',
    timestamp: '2026-01-14T10:30:00Z',
  },
  {
    id: 'evt-005',
    type: 'security' as EventType,
    severity: 'error' as EventSeverity,
    action: 'API rate limit exceeded',
    details: 'Rate limit exceeded for IP 1.2.3.4',
    ip: '1.2.3.4',
    timestamp: '2026-01-13T22:00:00Z',
  },
];

export function TenantAuditLogPage() {
  const t = useT();
  const { locale } = useLocale();
  const [typeFilter, setTypeFilter] = useState<EventType | 'all'>('all');
  const [severityFilter, setSeverityFilter] = useState<EventSeverity | 'all'>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [isLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < MOBILE_BREAKPOINT : false
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const filteredEvents = mockAuditEvents.filter(event => {
    if (typeFilter !== 'all' && event.type !== typeFilter) return false;
    if (severityFilter !== 'all' && event.severity !== severityFilter) return false;
    return true;
  });

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(locale === 'en' ? 'en-US' : 'nb-NO') + ' ' +
           date.toLocaleTimeString(locale === 'en' ? 'en-US' : 'nb-NO', { hour: '2-digit', minute: '2-digit' });
  };

  const getTypeLabel = (type: EventType) => {
    switch (type) {
      case 'user': return 'Bruker';
      case 'booking': return 'Booking';
      case 'system': return 'System';
      case 'security': return t("rule.safety");
    }
  };

  const getSeverityColor = (severity: EventSeverity) => {
    switch (severity) {
      case 'info': return { bg: 'var(--ds-color-info-surface-default)', text: 'var(--ds-color-info-text-default)' };
      case 'warning': return { bg: 'var(--ds-color-warning-surface-default)', text: 'var(--ds-color-warning-text-default)' };
      case 'error': return { bg: 'var(--ds-color-danger-surface-default)', text: 'var(--ds-color-danger-text-default)' };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between',
        alignItems: isMobile ? 'flex-start' : 'center',
        gap: 'var(--ds-spacing-4)',
      }}>
        <div>
          <Heading level={1} data-size="lg" style={{ margin: 0 }}>
            Systemlogg
          </Heading>
          <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)', marginTop: 'var(--ds-spacing-2)', marginBottom: 0 }}>
            Alle hendelser på plattformen
          </Paragraph>
        </div>
        <Button type="button" variant="secondary" data-size="md" style={{ minHeight: '44px' }}>
          Eksporter logg
        </Button>
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
        gap: 'var(--ds-spacing-4)',
      }}>
        <Card style={{ padding: 'var(--ds-spacing-4)' }}>
          <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>{t('backoffice.text.totaltIDag')}</Paragraph>
          <Heading level={2} data-size="xl" style={{ margin: 0 }}>247</Heading>
        </Card>
        <Card style={{ padding: 'var(--ds-spacing-4)' }}>
          <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>{t('backoffice.text.advarsler')}</Paragraph>
          <Heading level={2} data-size="xl" style={{ margin: 0, color: 'var(--ds-color-warning-text-default)' }}>12</Heading>
        </Card>
        <Card style={{ padding: 'var(--ds-spacing-4)' }}>
          <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>{t("error.generic")}</Paragraph>
          <Heading level={2} data-size="xl" style={{ margin: 0, color: 'var(--ds-color-danger-text-default)' }}>3</Heading>
        </Card>
        <Card style={{ padding: 'var(--ds-spacing-4)' }}>
          <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>{t("rule.safety")}</Paragraph>
          <Heading level={2} data-size="xl" style={{ margin: 0, color: 'var(--ds-color-info-text-default)' }}>8</Heading>
        </Card>
      </div>

      {/* Filters */}
      <Card style={{ padding: 'var(--ds-spacing-4)' }}>
        <div style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: 'var(--ds-spacing-4)',
          alignItems: isMobile ? 'stretch' : 'flex-end',
        }}>
          <div style={{ flex: 1 }}>
            <Label style={{ display: 'block', marginBottom: 'var(--ds-spacing-2)', fontSize: 'var(--ds-font-size-sm)', fontWeight: 'var(--ds-font-weight-medium)' }}>{t('backoffice.text.type')}</Label>
            <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as EventType | 'all')} style={{ width: '100%' }}>
              <option value="all">{t('common.alle_typer')}</option>
              <option value="user">{t('backoffice.text.user')}</option>
              <option value="booking">{t('backoffice.text.booking')}</option>
              <option value="system">{t('backoffice.text.system')}</option>
              <option value="security">{t("rule.safety")}</option>
            </Select>
          </div>
          <div style={{ flex: 1 }}>
            <Label style={{ display: 'block', marginBottom: 'var(--ds-spacing-2)', fontSize: 'var(--ds-font-size-sm)', fontWeight: 'var(--ds-font-weight-medium)' }}>{t('backoffice.text.alvorlighet')}</Label>
            <Select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value as EventSeverity | 'all')} style={{ width: '100%' }}>
              <option value="all">{t('backoffice.text.alle')}</option>
              <option value="info">{t('backoffice.text.info')}</option>
              <option value="warning">{t("ui.warning")}</option>
              <option value="error">{t("error.generic")}</option>
            </Select>
          </div>
          <div style={{ flex: 1 }}>
            <Label style={{ display: 'block', marginBottom: 'var(--ds-spacing-2)', fontSize: 'var(--ds-font-size-sm)', fontWeight: 'var(--ds-font-weight-medium)' }}>{t('common.fra_dato')}</Label>
            <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} style={{ width: '100%' }} />
          </div>
          <div style={{ flex: 1 }}>
            <Label style={{ display: 'block', marginBottom: 'var(--ds-spacing-2)', fontSize: 'var(--ds-font-size-sm)', fontWeight: 'var(--ds-font-weight-medium)' }}>{t('common.til_dato')}</Label>
            <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} style={{ width: '100%' }} />
          </div>
          <Button type="button" variant="primary" data-size="md" style={{ minHeight: '44px' }}>
            Filtrer
          </Button>
        </div>
      </Card>

      {/* Events Table */}
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--ds-spacing-8)' }}>
            <Spinner aria-label={t("state.loading")} data-size="lg" />
          </div>
        ) : (
          <Table>
            <Table.Head>
              <Table.Row>
                <Table.HeaderCell>{t('backoffice.text.tidspunkt')}</Table.HeaderCell>
                <Table.HeaderCell>{t('backoffice.text.type')}</Table.HeaderCell>
                <Table.HeaderCell>{t('backoffice.text.handling')}</Table.HeaderCell>
                <Table.HeaderCell>{t("ui.details")}</Table.HeaderCell>
                <Table.HeaderCell>IP</Table.HeaderCell>
                <Table.HeaderCell>{t('backoffice.text.alvorlighet')}</Table.HeaderCell>
              </Table.Row>
            </Table.Head>
            <Table.Body>
              {filteredEvents.map((event) => {
                const color = getSeverityColor(event.severity);
                return (
                  <Table.Row key={event.id}>
                    <Table.Cell><span style={{ fontSize: 'var(--ds-font-size-sm)' }}>{formatDateTime(event.timestamp)}</span></Table.Cell>
                    <Table.Cell><Badge>{getTypeLabel(event.type)}</Badge></Table.Cell>
                    <Table.Cell><span style={{ fontWeight: 'var(--ds-font-weight-semibold)' }}>{event.action}</span></Table.Cell>
                    <Table.Cell><span style={{ fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-subtle)' }}>{event.details}</span></Table.Cell>
                    <Table.Cell><code style={{ fontSize: 'var(--ds-font-size-xs)' }}>{event.ip}</code></Table.Cell>
                    <Table.Cell>
                      <Badge style={{ backgroundColor: color.bg, color: color.text }}>
                        {event.severity === 'info' ? 'Info' : event.severity === 'warning' ? t("ui.warning") : t("error.generic")}
                      </Badge>
                    </Table.Cell>
                  </Table.Row>
                );
              })}
            </Table.Body>
          </Table>
        )}
      </Card>
    </div>
  );
}
