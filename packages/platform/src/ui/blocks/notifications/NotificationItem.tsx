/**
 * NotificationItem Block
 * Display individual notification with actions
 */
import { Card, Paragraph, Badge, Button } from '@digdir/designsystemet-react';

export interface NotificationItemData {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  timestamp: string;
  actionUrl?: string;
}

export interface NotificationItemProps {
  notification: NotificationItemData;
  onMarkRead?: (id: string) => void;
  onClick?: (id: string) => void;
  'data-testid'?: string;
}

const TYPE_COLORS: Record<string, 'info' | 'success' | 'warning' | 'danger'> = {
  info: 'info', success: 'success', warning: 'warning', error: 'danger'
};

export function NotificationItem({ notification, onMarkRead, onClick, 'data-testid': testId = 'notification-item' }: NotificationItemProps) {
  return (
    <Card data-testid={testId} onClick={() => onClick?.(notification.id)} style={{ padding: 'var(--ds-spacing-4)', cursor: onClick ? 'pointer' : 'default', backgroundColor: notification.isRead ? 'var(--ds-color-neutral-background-default)' : 'var(--ds-color-neutral-background-subtle)', border: '1px solid var(--ds-color-neutral-border-default)' }}>
      <div style={{ display: 'flex', gap: 'var(--ds-spacing-3)', alignItems: 'flex-start' }}>
        <Badge data-color={TYPE_COLORS[notification.type]} data-size="sm" />
        <div style={{ flex: 1 }}>
          <Paragraph data-size="sm" style={{ margin: 0, fontWeight: notification.isRead ? 'normal' : '600' }}>{notification.title}</Paragraph>
          <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>{notification.message}</Paragraph>
          <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)', marginTop: 'var(--ds-spacing-2)' }}>{new Date(notification.timestamp).toLocaleString('no-NO')}</Paragraph>
        </div>
        {!notification.isRead && onMarkRead && <Button type="button" variant="tertiary" data-size="sm" onClick={(e) => { e.stopPropagation(); onMarkRead(notification.id); }}>Marker lest</Button>}
      </div>
    </Card>
  );
}

export interface NotificationListProps {
  notifications: NotificationItemData[];
  onMarkRead?: (id: string) => void;
  onClick?: (id: string) => void;
  emptyMessage?: string;
}

export function NotificationList({ notifications, onMarkRead, onClick, emptyMessage = 'Ingen varsler' }: NotificationListProps) {
  if (notifications.length === 0) {
    return <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', textAlign: 'center', padding: 'var(--ds-spacing-6)' }}>{emptyMessage}</Paragraph>;
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-2)' }}>
      {notifications.map(n => <NotificationItem key={n.id} notification={n} onMarkRead={onMarkRead} onClick={onClick} />)}
    </div>
  );
}
