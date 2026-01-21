/**
 * NotificationsPage
 *
 * User portal notifications center
 * - Fetches real data from API
 * - All notifications list
 * - Mark as read/unread
 * - Filter by type
 * - Clear notifications
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
  BellIcon,
  DashboardPageHeader,
} from '@xalatechnologies/platform/ui';
import { useT, useLocale } from '@xala/i18n';
import {
  useMyNotifications,
  useNotificationUnreadCount,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  type Notification,
} from '@digilist/client-sdk';

const MOBILE_BREAKPOINT = 768;

type NotificationType = 'booking' | 'system' | 'message' | 'reminder' | 'all';

export function NotificationsPage() {
  const t = useT();
  const { locale } = useLocale();

  const [typeFilter, setTypeFilter] = useState<NotificationType>('all');
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < MOBILE_BREAKPOINT : false
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch notifications from API
  const { data: notificationsData, isLoading, refetch } = useMyNotifications(
    typeFilter !== 'all' ? { type: typeFilter } : undefined
  );
  const notifications = notificationsData?.data ?? [];

  // Get unread count
  const { data: unreadCountData } = useNotificationUnreadCount();
  const unreadCount = unreadCountData?.count ?? 0;

  // Mutations
  const markAsReadMutation = useMarkNotificationRead();
  const markAllAsReadMutation = useMarkAllNotificationsRead();

  const formatRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return t('notifications.justNow');
    if (diffHours < 24) return t('notifications.hoursAgo', { hours: diffHours });
    if (diffDays < 7) return t('notifications.daysAgo', { days: diffDays });
    return date.toLocaleDateString(locale === 'en' ? 'en-US' : 'nb-NO');
  };

  const getTypeLabel = (type: string) => {
    return t(`notifications.type.${type}`);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'booking': return { bg: 'var(--ds-color-success-surface-default)', text: 'var(--ds-color-success-text-default)' };
      case 'system': return { bg: 'var(--ds-color-info-surface-default)', text: 'var(--ds-color-info-text-default)' };
      case 'message': return { bg: 'var(--ds-color-accent-surface-default)', text: 'var(--ds-color-accent-text-default)' };
      case 'reminder': return { bg: 'var(--ds-color-warning-surface-default)', text: 'var(--ds-color-warning-text-default)' };
      default: return { bg: 'var(--ds-color-neutral-surface-default)', text: 'var(--ds-color-neutral-text-default)' };
    }
  };

  const handleMarkAsRead = async (id: string) => {
    await markAsReadMutation.mutateAsync(id);
    refetch();
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsReadMutation.mutateAsync();
    refetch();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
      {/* Header - Using DashboardPageHeader */}
      <DashboardPageHeader
        title={t('notifications.page.title')}
        subtitle={t('notifications.description') || ''}
        badge={unreadCount > 0 ? <Badge data-color="danger">{unreadCount} {t('notifications.unread')}</Badge> : undefined}
        primaryAction={
          <Button
            type="button"
            variant="secondary"
            data-size="md"
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0 || markAllAsReadMutation.isPending}
          >
            {t('notifications.markAllRead')}
          </Button>
        }
        secondaryAction={
          <Select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as NotificationType)}
            style={{ minWidth: '120px' }}
          >
            <option value="all">{t('notifications.all')}</option>
            <option value="booking">{t('notifications.bookings')}</option>
            <option value="message">{t('notifications.messages')}</option>
            <option value="reminder">{t('notifications.reminders')}</option>
            <option value="system">{t('notifications.system')}</option>
          </Select>
        }
      />

      {/* Notifications List */}
      <Card style={{ padding: 'var(--ds-spacing-5)' }}>
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--ds-spacing-8)' }}>
            <Spinner aria-label={t('state.loading')} data-size="lg" />
          </div>
        ) : notifications.length === 0 ? (
          <div style={{ padding: 'var(--ds-spacing-8)', textAlign: 'center' }}>
            <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
              {t('notifications.empty')}
            </Paragraph>
          </div>
        ) : (
          <div data-testid="notification-dropdown" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-2)' }}>
            {notifications.map((notif: Notification) => {
              const color = getTypeColor(notif.type || 'system');
              const isRead = notif.readAt !== null;
              return (
                <button
                  key={notif.id}
                  data-testid={`notification-item-${notif.id}`}
                  type="button"
                  onClick={() => !isRead && handleMarkAsRead(notif.id)}
                  disabled={markAsReadMutation.isPending}
                  style={{
                    display: 'flex',
                    gap: 'var(--ds-spacing-4)',
                    padding: 'var(--ds-spacing-4)',
                    borderRadius: 'var(--ds-border-radius-md)',
                    backgroundColor: isRead ? 'var(--ds-color-neutral-surface-default)' : 'var(--ds-color-neutral-surface-hover)',
                    border: isRead ? '1px solid var(--ds-color-neutral-border-subtle)' : '2px solid var(--ds-color-accent-border-default)',
                    cursor: isRead ? 'default' : 'pointer',
                    textAlign: 'left',
                    width: '100%',
                  }}
                >
                  <div style={{
                    width: '8px',
                    borderRadius: 'var(--ds-border-radius-full)',
                    backgroundColor: isRead ? 'transparent' : 'var(--ds-color-accent-base-default)',
                    flexShrink: 0,
                  }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--ds-spacing-2)' }}>
                      <Paragraph data-size="sm" style={{ margin: 0, fontWeight: isRead ? 500 : 700 }}>
                        {notif.title}
                      </Paragraph>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
                        {notif.type && (
                          <Badge data-testid="notification-type" data-type={notif.type} style={{ backgroundColor: color.bg, color: color.text }}>
                            {getTypeLabel(notif.type)}
                          </Badge>
                        )}
                        <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                          {formatRelativeTime(notif.createdAt)}
                        </Paragraph>
                      </div>
                    </div>
                    {notif.body && (
                      <Paragraph data-size="sm" style={{ margin: 0, marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                        {notif.body}
                      </Paragraph>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
