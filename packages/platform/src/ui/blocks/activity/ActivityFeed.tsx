/**
 * ActivityFeed Block
 * Display timeline of user activity
 */
import { Card, Badge } from '@digdir/designsystemet-react';
import { Paragraph } from '@digdir/designsystemet-react';

export interface ActivityItemData {
  id: string;
  type: 'booking' | 'payment' | 'message' | 'review' | 'system';
  title: string;
  description?: string;
  timestamp: string;
  status?: 'pending' | 'completed' | 'cancelled';
}

export interface ActivityItemProps {
  activity: ActivityItemData;
  onClick?: (id: string) => void;
}

const TYPE_ICONS: Record<string, string> = {
  booking: '📅', payment: '💳', message: '💬', review: '⭐', system: '🔔'
};

const getStatusColor = (status: string): 'success' | 'danger' | 'warning' => {
  switch (status) {
    case 'completed': return 'success';
    case 'cancelled': return 'danger';
    default: return 'warning';
  }
};

export function ActivityItem({ activity, onClick }: ActivityItemProps) {
  return (
    <div onClick={() => onClick?.(activity.id)} style={{ display: 'flex', gap: 'var(--ds-spacing-3)', padding: 'var(--ds-spacing-3)', cursor: onClick ? 'pointer' : 'default', borderBottom: '1px solid var(--ds-color-neutral-border-subtle)' }}>
      <span style={{ fontSize: '1.25rem' }}>{TYPE_ICONS[activity.type] || '📌'}</span>
      <div style={{ flex: 1 }}>
        <Paragraph data-size="sm" style={{ margin: 0 }}>{activity.title}</Paragraph>
        {activity.description && <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>{activity.description}</Paragraph>}
        <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)', marginTop: 'var(--ds-spacing-1)' }}>{new Date(activity.timestamp).toLocaleString('no-NO')}</Paragraph>
      </div>
      {activity.status && <Badge data-size="sm" data-color={getStatusColor(activity.status)}>{activity.status}</Badge>}
    </div>
  );
}

export interface ActivityFeedProps {
  activities: ActivityItemData[];
  onClick?: (id: string) => void;
  maxItems?: number;
  emptyMessage?: string;
}

export function ActivityFeed({ activities, onClick, maxItems = 10, emptyMessage = 'Ingen aktivitet' }: ActivityFeedProps) {
  const items = activities.slice(0, maxItems);
  if (items.length === 0) {
    return <Card style={{ padding: 'var(--ds-spacing-6)', textAlign: 'center' }}><Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>{emptyMessage}</Paragraph></Card>;
  }
  return (
    <Card style={{ padding: 0, overflow: 'hidden' }}>
      {items.map(a => <ActivityItem key={a.id} activity={a} onClick={onClick} />)}
    </Card>
  );
}
