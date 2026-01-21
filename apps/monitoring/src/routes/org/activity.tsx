/**
 * OrganizationActivityPage
 *
 * Organization portal activity log
 * - Recent booking activity
 * - Member actions
 * - Invoice events
 * - Season application status
 */

import { useState, useEffect } from 'react';
import {
  Card,
  Heading,
  Paragraph,
  Button,
  Select,
  Badge,
  Spinner,
} from '@xalatechnologies/platform/ui';
import { useLocale, useT } from '@xala/i18n';

const MOBILE_BREAKPOINT = 768;

type ActivityType = 'booking' | 'member' | 'invoice' | 'season';

// Mock activity data
const mockActivities = [
  {
    id: 'act-001',
    type: 'booking' as ActivityType,
    title: t('common.ny_booking_opprettet'),
    description: t('common.idrettshall_a_22_januar'),
    user: 'Ola Nordmann',
    timestamp: '2026-01-14T15:30:00Z',
  },
  {
    id: 'act-002',
    type: 'member' as ActivityType,
    title: t('common.nytt_medlem_invitert'),
    description: 'kari@example.com ble invitert som medlem',
    user: 'Admin',
    timestamp: '2026-01-14T14:00:00Z',
  },
  {
    id: 'act-003',
    type: 'invoice' as ActivityType,
    title: t('common.faktura_betalt'),
    description: t('common.faktura_f2026001_er_betalt'),
    user: 'System',
    timestamp: '2026-01-14T10:15:00Z',
  },
  {
    id: 'act-004',
    type: 'season' as ActivityType,
    title: t('common.sesongsoknad_sendt'),
    description: t('common.soknad_for_vaar_2026'),
    user: 'Ola Nordmann',
    timestamp: '2026-01-13T16:45:00Z',
  },
  {
    id: 'act-005',
    type: 'booking' as ActivityType,
    title: t('common.booking_kansellert'),
    description: t('common.fotballbane_1_20_januar'),
    user: 'Kari Hansen',
    timestamp: '2026-01-13T11:00:00Z',
  },
];

export function OrganizationActivityPage() {
  const { locale } = useLocale();
  const t = useT();
  const [typeFilter, setTypeFilter] = useState<ActivityType | 'all'>('all');
  const [isLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < MOBILE_BREAKPOINT : false
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const filteredActivities = typeFilter === 'all' 
    ? mockActivities 
    : mockActivities.filter(a => a.type === typeFilter);

  const formatRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return t('common.justNow');
    if (diffHours < 24) return t('common.hoursAgo', { count: diffHours });
    if (diffDays < 7) return t('common.daysAgo', { count: diffDays });
    return date.toLocaleDateString(locale === 'en' ? 'en-US' : 'nb-NO');
  };

  const getTypeLabel = (type: ActivityType) => {
    switch (type) {
      case 'booking': return t('org.activity.typeBooking');
      case 'member': return t('org.activity.typeMember');
      case 'invoice': return t('org.activity.typeInvoice');
      case 'season': return t('org.activity.typeSeason');
    }
  };

  const getTypeColor = (type: ActivityType) => {
    switch (type) {
      case 'booking': return { bg: 'var(--ds-color-accent-surface-default)', text: 'var(--ds-color-accent-text-default)' };
      case 'member': return { bg: 'var(--ds-color-info-surface-default)', text: 'var(--ds-color-info-text-default)' };
      case 'invoice': return { bg: 'var(--ds-color-success-surface-default)', text: 'var(--ds-color-success-text-default)' };
      case 'season': return { bg: 'var(--ds-color-warning-surface-default)', text: 'var(--ds-color-warning-text-default)' };
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
            {t('org.activity')}
          </Heading>
          <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)', marginTop: 'var(--ds-spacing-2)', marginBottom: 0 }}>
            {t('org.activityDesc')}
          </Paragraph>
        </div>
        <div style={{ display: 'flex', gap: 'var(--ds-spacing-3)', alignItems: 'center' }}>
          <Select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as ActivityType | 'all')}
            style={{ minWidth: '150px' }}
          >
            <option value="all">{t('org.activity.allTypes')}</option>
            <option value="booking">{t('org.activity.bookings')}</option>
            <option value="member">{t('org.activity.members')}</option>
            <option value="invoice">{t('org.activity.invoices')}</option>
            <option value="season">{t('org.activity.season')}</option>
          </Select>
          <Button type="button" variant="secondary" data-size="md" style={{ minHeight: '44px' }}>
            {t('common.export')}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
        gap: 'var(--ds-spacing-4)',
      }}>
        <Card style={{ padding: 'var(--ds-spacing-4)' }}>
          <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>{t('org.activity.today')}</Paragraph>
          <Heading level={2} data-size="xl" style={{ margin: 0 }}>12</Heading>
        </Card>
        <Card style={{ padding: 'var(--ds-spacing-4)' }}>
          <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>{t('org.activity.thisWeek')}</Paragraph>
          <Heading level={2} data-size="xl" style={{ margin: 0 }}>47</Heading>
        </Card>
        <Card style={{ padding: 'var(--ds-spacing-4)' }}>
          <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>{t('org.activity.bookings')}</Paragraph>
          <Heading level={2} data-size="xl" style={{ margin: 0 }}>23</Heading>
        </Card>
        <Card style={{ padding: 'var(--ds-spacing-4)' }}>
          <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>{t('org.activity.members')}</Paragraph>
          <Heading level={2} data-size="xl" style={{ margin: 0 }}>8</Heading>
        </Card>
      </div>

      {/* Activity List */}
      <Card style={{ padding: 'var(--ds-spacing-5)' }}>
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--ds-spacing-8)' }}>
            <Spinner aria-label={t('state.loading')} data-size="lg" />
          </div>
        ) : filteredActivities.length === 0 ? (
          <div style={{ padding: 'var(--ds-spacing-8)', textAlign: 'center' }}>
            <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
              {t('org.activity.noActivity')}
            </Paragraph>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-3)' }}>
            {filteredActivities.map((activity) => {
              const color = getTypeColor(activity.type);
              return (
                <div
                  key={activity.id}
                  style={{
                    display: 'flex',
                    gap: 'var(--ds-spacing-4)',
                    padding: 'var(--ds-spacing-4)',
                    borderRadius: 'var(--ds-border-radius-md)',
                    backgroundColor: 'var(--ds-color-neutral-surface-hover)',
                  }}
                >
                  <div style={{
                    width: '8px',
                    borderRadius: 'var(--ds-border-radius-full)',
                    backgroundColor: color.bg,
                    flexShrink: 0,
                  }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--ds-spacing-2)' }}>
                      <div>
                        <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 600 }}>
                          {activity.title}
                        </Paragraph>
                        <Paragraph data-size="xs" style={{ margin: 0, marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                          {activity.description}
                        </Paragraph>
                      </div>
                      <Badge style={{ backgroundColor: color.bg, color: color.text }}>
                        {getTypeLabel(activity.type)}
                      </Badge>
                    </div>
                    <Paragraph data-size="xs" style={{ margin: 0, marginTop: 'var(--ds-spacing-2)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                      {activity.user} • {formatRelativeTime(activity.timestamp)}
                    </Paragraph>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
