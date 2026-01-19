/**
 * OrganizationActivityPage
 *
 * Organization portal activity log
 * - Fetches real data from audit API
 * - Recent booking activity
 * - Member actions
 * - Invoice events
 * - Season application status
 */

import { useState, useEffect, useMemo } from 'react';
import {
  Card,
  Heading,
  Paragraph,
  Button,
  Select,
  Badge,
  Spinner,
} from '@xala/ds';
import { useLocale, useT } from '@xala/i18n';
import { useAuditLog, type AuditLogEntry } from '@digilist/client-sdk';

const MOBILE_BREAKPOINT = 768;

type ActivityType = 'booking' | 'member' | 'invoice' | 'season' | 'all';

// Map audit resources to activity types
const getActivityTypeFromResource = (resource: string): ActivityType => {
  switch (resource) {
    case 'booking':
    case 'allocation':
      return 'booking';
    case 'user':
    case 'organization':
      return 'member';
    case 'invoice':
    case 'payment':
      return 'invoice';
    case 'season':
    case 'season_application':
      return 'season';
    default:
      return 'booking'; // Default fallback
  }
};

export function OrganizationActivityPage() {
  const { locale } = useLocale();
  const t = useT();
  const [typeFilter, setTypeFilter] = useState<ActivityType>('all');
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < MOBILE_BREAKPOINT : false
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Build resource filter based on type selection
  const resourceFilter = useMemo(() => {
    switch (typeFilter) {
      case 'booking':
        return 'booking';
      case 'member':
        return 'user';
      case 'invoice':
        return 'invoice';
      case 'season':
        return 'season';
      default:
        return undefined;
    }
  }, [typeFilter]);

  // Fetch audit logs from API
  const { data: auditData, isLoading } = useAuditLog(
    resourceFilter ? { resource: resourceFilter, limit: 50 } : { limit: 50 }
  );
  const activities = auditData?.data ?? [];

  // Calculate stats
  const stats = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const weekStart = todayStart - 7 * 24 * 60 * 60 * 1000;

    const today = activities.filter((a: AuditLogEntry) => new Date(a.createdAt).getTime() >= todayStart).length;
    const thisWeek = activities.filter((a: AuditLogEntry) => new Date(a.createdAt).getTime() >= weekStart).length;
    const bookings = activities.filter((a: AuditLogEntry) => a.resource === 'booking').length;
    const members = activities.filter((a: AuditLogEntry) => a.resource === 'user').length;

    return { today, thisWeek, bookings, members };
  }, [activities]);

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
      default: return t('org.activity.typeBooking');
    }
  };

  const getTypeColor = (type: ActivityType) => {
    switch (type) {
      case 'booking': return { bg: 'var(--ds-color-accent-surface-default)', text: 'var(--ds-color-accent-text-default)' };
      case 'member': return { bg: 'var(--ds-color-info-surface-default)', text: 'var(--ds-color-info-text-default)' };
      case 'invoice': return { bg: 'var(--ds-color-success-surface-default)', text: 'var(--ds-color-success-text-default)' };
      case 'season': return { bg: 'var(--ds-color-warning-surface-default)', text: 'var(--ds-color-warning-text-default)' };
      default: return { bg: 'var(--ds-color-neutral-surface-default)', text: 'var(--ds-color-neutral-text-default)' };
    }
  };

  const getActivityTitle = (entry: AuditLogEntry) => {
    const action = entry.action;
    const resource = entry.resource;
    return t(`audit.${resource}.${action}`, { defaultValue: `${action} ${resource}` });
  };

  const getActivityDescription = (entry: AuditLogEntry) => {
    if (entry.details) {
      return typeof entry.details === 'string' ? entry.details : JSON.stringify(entry.details);
    }
    return entry.resourceId || '';
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
            onChange={(e) => setTypeFilter(e.target.value as ActivityType)}
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
          <Heading level={2} data-size="xl" style={{ margin: 0 }}>{stats.today}</Heading>
        </Card>
        <Card style={{ padding: 'var(--ds-spacing-4)' }}>
          <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>{t('org.activity.thisWeek')}</Paragraph>
          <Heading level={2} data-size="xl" style={{ margin: 0 }}>{stats.thisWeek}</Heading>
        </Card>
        <Card style={{ padding: 'var(--ds-spacing-4)' }}>
          <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>{t('org.activity.bookings')}</Paragraph>
          <Heading level={2} data-size="xl" style={{ margin: 0 }}>{stats.bookings}</Heading>
        </Card>
        <Card style={{ padding: 'var(--ds-spacing-4)' }}>
          <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>{t('org.activity.members')}</Paragraph>
          <Heading level={2} data-size="xl" style={{ margin: 0 }}>{stats.members}</Heading>
        </Card>
      </div>

      {/* Activity List */}
      <Card style={{ padding: 'var(--ds-spacing-5)' }}>
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--ds-spacing-8)' }}>
            <Spinner aria-label={t('state.loading')} data-size="lg" />
          </div>
        ) : activities.length === 0 ? (
          <div style={{ padding: 'var(--ds-spacing-8)', textAlign: 'center' }}>
            <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
              {t('org.activity.noActivity')}
            </Paragraph>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-3)' }}>
            {activities.map((activity: AuditLogEntry) => {
              const activityType = getActivityTypeFromResource(activity.resource);
              const color = getTypeColor(activityType);
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
                          {getActivityTitle(activity)}
                        </Paragraph>
                        <Paragraph data-size="xs" style={{ margin: 0, marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                          {getActivityDescription(activity)}
                        </Paragraph>
                      </div>
                      <Badge style={{ backgroundColor: color.bg, color: color.text }}>
                        {getTypeLabel(activityType)}
                      </Badge>
                    </div>
                    <Paragraph data-size="xs" style={{ margin: 0, marginTop: 'var(--ds-spacing-2)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                      {activity.userName || activity.userId || 'System'} • {formatRelativeTime(activity.createdAt)}
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
