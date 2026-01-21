import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import {
  Card,
  Heading,
  Paragraph,
  Button,
} from '@xalatechnologies/platform/ui';
import { NotificationBell } from '../../src/blocks/NotificationBell';
import { NotificationCenter } from '../../src/blocks/NotificationCenter';
import { NotificationItem, type NotificationItemData, type NotificationType } from '../../src/blocks/NotificationItem';

/**
 * Notification components for managing user alerts and messages.
 *
 * ## Components
 * - **NotificationBell**: Header icon with badge count
 * - **NotificationCenter**: Modal for viewing all notifications
 * - **NotificationItem**: Individual notification display
 *
 * ## Features
 * - Unread count badge
 * - Filter by status (all, unread, read)
 * - Mark as read/delete actions
 * - Priority indicators
 * - Time formatting
 */
const meta: Meta<typeof NotificationBell> = {
  title: 'Blocks/Notifications',
  component: NotificationBell,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
Notification system components for municipal applications.

## Notification Types
- **booking_confirmed**: Booking has been confirmed
- **booking_reminder_24h**: Reminder 24 hours before
- **booking_reminder_1h**: Reminder 1 hour before
- **booking_cancelled**: Booking was cancelled
- **booking_modified**: Booking was changed
- **booking_upcoming**: Upcoming booking notice
- **booking_completed**: Booking completed

## Priority Levels
- **urgent**: Critical alerts (red)
- **high**: Important (yellow)
- **normal**: Standard notifications
- **low**: Informational
        `,
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof NotificationBell>;

// =============================================================================
// Sample Data
// =============================================================================

const now = new Date();

const sampleNotifications: NotificationItemData[] = [
  {
    id: 'notif-1',
    type: 'booking_confirmed',
    title: 'Booking bekreftet',
    message: 'Din booking av Møterom 101 er nå bekreftet for 15. januar kl. 10:00-12:00.',
    priority: 'normal',
    createdAt: new Date(now.getTime() - 5 * 60 * 1000).toISOString(), // 5 min ago
    readAt: null,
    relatedBookingId: 'booking-123',
  },
  {
    id: 'notif-2',
    type: 'booking_reminder_24h',
    title: 'Påminnelse: Booking i morgen',
    message: 'Du har en booking av Idrettshall A i morgen kl. 18:00-20:00. Husk å ta med gyldig ID.',
    priority: 'normal',
    createdAt: new Date(now.getTime() - 30 * 60 * 1000).toISOString(), // 30 min ago
    readAt: null,
    relatedBookingId: 'booking-456',
  },
  {
    id: 'notif-3',
    type: 'booking_cancelled',
    title: 'Booking kansellert',
    message: 'Din booking av Konferansesal Fjord den 20. januar ble kansellert av administrator.',
    priority: 'high',
    createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    readAt: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(), // read 1 hour ago
    relatedBookingId: 'booking-789',
  },
  {
    id: 'notif-4',
    type: 'booking_modified',
    title: 'Booking endret',
    message: 'Tidspunktet for din booking er endret til kl. 14:00-16:00.',
    priority: 'normal',
    createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    readAt: new Date(now.getTime() - 23 * 60 * 60 * 1000).toISOString(),
    relatedBookingId: 'booking-101',
  },
  {
    id: 'notif-5',
    type: 'booking_upcoming',
    title: 'Kommende booking',
    message: 'Du har 3 bookinger de neste 7 dagene. Se oversikt i kalenderen.',
    priority: 'low',
    createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    readAt: null,
  },
  {
    id: 'notif-6',
    type: 'booking_completed',
    title: 'Booking fullført',
    message: 'Takk for at du brukte Møterom 102. Vi håper du var fornøyd!',
    priority: 'low',
    createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    readAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    relatedBookingId: 'booking-102',
  },
];

// =============================================================================
// NotificationBell Stories
// =============================================================================

/**
 * Notification bell with unread count
 */
export const BellWithCount: Story = {
  render: () => (
    <div style={{ padding: 'var(--ds-spacing-4)', backgroundColor: 'var(--ds-color-neutral-surface-hover)', borderRadius: 'var(--ds-border-radius-md)', display: 'inline-block' }}>
      <NotificationBell
        count={5}
        onClick={() => console.log('Bell clicked')}
      />
    </div>
  ),
};

/**
 * Notification bell without notifications
 */
export const BellEmpty: Story = {
  render: () => (
    <div style={{ padding: 'var(--ds-spacing-4)', backgroundColor: 'var(--ds-color-neutral-surface-hover)', borderRadius: 'var(--ds-border-radius-md)', display: 'inline-block' }}>
      <NotificationBell
        count={0}
        onClick={() => console.log('Bell clicked')}
      />
    </div>
  ),
};

/**
 * Notification bell with high count
 */
export const BellHighCount: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--ds-spacing-4)' }}>
      <div style={{ padding: 'var(--ds-spacing-4)', backgroundColor: 'var(--ds-color-neutral-surface-hover)', borderRadius: 'var(--ds-border-radius-md)', textAlign: 'center' }}>
        <NotificationBell count={99} onClick={() => {}} />
        <Paragraph data-size="xs" style={{ margin: 0, marginTop: 'var(--ds-spacing-2)' }}>99</Paragraph>
      </div>
      <div style={{ padding: 'var(--ds-spacing-4)', backgroundColor: 'var(--ds-color-neutral-surface-hover)', borderRadius: 'var(--ds-border-radius-md)', textAlign: 'center' }}>
        <NotificationBell count={150} onClick={() => {}} />
        <Paragraph data-size="xs" style={{ margin: 0, marginTop: 'var(--ds-spacing-2)' }}>150+</Paragraph>
      </div>
    </div>
  ),
};

// =============================================================================
// NotificationItem Stories
// =============================================================================

/**
 * Unread notification item
 */
export const ItemUnread: Story = {
  render: () => (
    <div style={{ maxWidth: '500px', border: '1px solid var(--ds-color-neutral-border-subtle)', borderRadius: 'var(--ds-border-radius-md)' }}>
      <NotificationItem
        notification={sampleNotifications[0]!}
        onClick={(id) => console.log('Clicked:', id)}
        onMarkAsRead={(id) => console.log('Mark as read:', id)}
        onDelete={(id) => console.log('Delete:', id)}
      />
    </div>
  ),
};

/**
 * Read notification item
 */
export const ItemRead: Story = {
  render: () => (
    <div style={{ maxWidth: '500px', border: '1px solid var(--ds-color-neutral-border-subtle)', borderRadius: 'var(--ds-border-radius-md)' }}>
      <NotificationItem
        notification={sampleNotifications[2]!}
        onClick={(id) => console.log('Clicked:', id)}
        onDelete={(id) => console.log('Delete:', id)}
      />
    </div>
  ),
};

/**
 * High priority notification
 */
export const ItemHighPriority: Story = {
  render: () => {
    const urgentNotification: NotificationItemData = {
      id: 'urgent-1',
      type: 'booking_cancelled',
      title: 'VIKTIG: Booking avvist',
      message: 'Din booking ble avvist på grunn av manglende betaling. Kontakt oss umiddelbart.',
      priority: 'urgent',
      createdAt: new Date().toISOString(),
      readAt: null,
    };

    return (
      <div style={{ maxWidth: '500px', border: '1px solid var(--ds-color-neutral-border-subtle)', borderRadius: 'var(--ds-border-radius-md)' }}>
        <NotificationItem
          notification={urgentNotification}
          onClick={(id) => console.log('Clicked:', id)}
          onMarkAsRead={(id) => console.log('Mark as read:', id)}
          onDelete={(id) => console.log('Delete:', id)}
        />
      </div>
    );
  },
};

/**
 * All notification types
 */
export const AllNotificationTypes: Story = {
  render: () => {
    const types: NotificationType[] = [
      'booking_confirmed',
      'booking_reminder_24h',
      'booking_reminder_1h',
      'booking_cancelled',
      'booking_modified',
      'booking_upcoming',
      'booking_completed',
    ];

    const notifications: NotificationItemData[] = types.map((type, index) => ({
      id: `type-${index}`,
      type,
      title: `${type.replace(/_/g, ' ')} example`,
      message: `This is an example of a ${type} notification.`,
      priority: type === 'booking_cancelled' ? 'high' : 'normal',
      createdAt: new Date(now.getTime() - index * 60 * 60 * 1000).toISOString(),
      readAt: index > 3 ? new Date().toISOString() : null,
    }));

    return (
      <div style={{ maxWidth: '500px', display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-2)' }}>
        {notifications.map((notification) => (
          <div key={notification.id} style={{ border: '1px solid var(--ds-color-neutral-border-subtle)', borderRadius: 'var(--ds-border-radius-md)' }}>
            <NotificationItem
              notification={notification}
              showActions={false}
            />
          </div>
        ))}
      </div>
    );
  },
};

// =============================================================================
// NotificationCenter Stories
// =============================================================================

/**
 * Notification center with items
 */
export const CenterDefault: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState(sampleNotifications);
    const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

    const handleMarkAsRead = (id: string) => {
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, readAt: new Date().toISOString() } : n)
      );
    };

    const handleMarkAllAsRead = () => {
      setNotifications(prev =>
        prev.map(n => n.readAt ? n : { ...n, readAt: new Date().toISOString() })
      );
    };

    const handleDelete = (id: string) => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const unreadCount = notifications.filter(n => !n.readAt).length;

    return (
      <>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-4)' }}>
          <NotificationBell
            count={unreadCount}
            onClick={() => setOpen(true)}
          />
          <Paragraph data-size="sm" style={{ margin: 0 }}>
            Klikk på bjellen for å åpne varslingssenteret
          </Paragraph>
        </div>
        <NotificationCenter
          open={open}
          onClose={() => setOpen(false)}
          notifications={notifications}
          filter={filter}
          onFilterChange={setFilter}
          onNotificationClick={(id) => console.log('Clicked:', id)}
          onMarkAsRead={handleMarkAsRead}
          onMarkAllAsRead={handleMarkAllAsRead}
          onDelete={handleDelete}
        />
      </>
    );
  },
};

/**
 * Empty notification center
 */
export const CenterEmpty: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

    return (
      <>
        <Button variant="secondary" onClick={() => setOpen(true)}>
          Åpne tomt varslingssenter
        </Button>
        <NotificationCenter
          open={open}
          onClose={() => setOpen(false)}
          notifications={[]}
          filter={filter}
          onFilterChange={setFilter}
        />
      </>
    );
  },
};

/**
 * Loading state
 */
export const CenterLoading: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <>
        <Button variant="secondary" onClick={() => setOpen(true)}>
          Åpne (laster...)
        </Button>
        <NotificationCenter
          open={open}
          onClose={() => setOpen(false)}
          notifications={[]}
          loading={true}
        />
      </>
    );
  },
};

// =============================================================================
// Interactive Demo
// =============================================================================

/**
 * Complete notification system demo
 */
export const InteractiveDemo: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState(sampleNotifications);
    const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

    const handleMarkAsRead = (id: string) => {
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, readAt: new Date().toISOString() } : n)
      );
    };

    const handleMarkAllAsRead = () => {
      setNotifications(prev =>
        prev.map(n => n.readAt ? n : { ...n, readAt: new Date().toISOString() })
      );
    };

    const handleDelete = (id: string) => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const addNotification = () => {
      const types: NotificationType[] = ['booking_confirmed', 'booking_reminder_24h', 'booking_modified'];
      const type = types[Math.floor(Math.random() * types.length)]!;

      const newNotification: NotificationItemData = {
        id: `new-${Date.now()}`,
        type,
        title: 'Ny varsling',
        message: `Dette er en ny ${type.replace(/_/g, ' ')} varsling.`,
        priority: 'normal',
        createdAt: new Date().toISOString(),
        readAt: null,
      };

      setNotifications(prev => [newNotification, ...prev]);
    };

    const unreadCount = notifications.filter(n => !n.readAt).length;

    return (
      <div>
        {/* Header simulation */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 'var(--ds-spacing-4)',
          backgroundColor: 'var(--ds-color-neutral-background-default)',
          borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
          marginBottom: 'var(--ds-spacing-4)',
        }}>
          <Heading level={2} data-size="sm" style={{ margin: 0 }}>
            Min side
          </Heading>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
            <NotificationBell
              count={unreadCount}
              onClick={() => setOpen(true)}
            />
          </div>
        </div>

        {/* Controls */}
        <Card style={{ padding: 'var(--ds-spacing-4)', marginBottom: 'var(--ds-spacing-4)' }}>
          <Heading level={3} data-size="xs" style={{ margin: 0, marginBottom: 'var(--ds-spacing-3)' }}>
            Demo-kontroller
          </Heading>
          <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)', flexWrap: 'wrap' }}>
            <Button variant="secondary" data-size="sm" onClick={addNotification}>
              Legg til varsling
            </Button>
            <Button variant="secondary" data-size="sm" onClick={handleMarkAllAsRead}>
              Merk alle som lest
            </Button>
            <Button
              variant="secondary"
              data-size="sm"
              onClick={() => setNotifications(sampleNotifications)}
            >
              Tilbakestill
            </Button>
          </div>
        </Card>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--ds-spacing-4)' }}>
          <Card style={{ padding: 'var(--ds-spacing-4)', textAlign: 'center' }}>
            <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
              Totalt
            </Paragraph>
            <Paragraph data-size="lg" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-bold)' }}>
              {notifications.length}
            </Paragraph>
          </Card>
          <Card style={{ padding: 'var(--ds-spacing-4)', textAlign: 'center' }}>
            <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
              Uleste
            </Paragraph>
            <Paragraph data-size="lg" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-bold)', color: 'var(--ds-color-accent-base-default)' }}>
              {unreadCount}
            </Paragraph>
          </Card>
          <Card style={{ padding: 'var(--ds-spacing-4)', textAlign: 'center' }}>
            <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
              Leste
            </Paragraph>
            <Paragraph data-size="lg" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-bold)' }}>
              {notifications.length - unreadCount}
            </Paragraph>
          </Card>
        </div>

        {/* Notification Center */}
        <NotificationCenter
          open={open}
          onClose={() => setOpen(false)}
          notifications={notifications}
          filter={filter}
          onFilterChange={setFilter}
          onNotificationClick={(id) => {
            console.log('Notification clicked:', id);
            handleMarkAsRead(id);
          }}
          onMarkAsRead={handleMarkAsRead}
          onMarkAllAsRead={handleMarkAllAsRead}
          onDelete={handleDelete}
        />
      </div>
    );
  },
};

// =============================================================================
// In Header Context
// =============================================================================

/**
 * Notification bell in header context
 */
export const InHeaderContext: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 'var(--ds-spacing-3) var(--ds-spacing-5)',
        backgroundColor: 'var(--ds-color-neutral-background-default)',
        borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
      }}>
        <Heading level={1} data-size="sm" style={{ margin: 0, color: 'var(--ds-color-accent-base-default)' }}>
          DIGILIST
        </Heading>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)' }}>
          <NotificationBell
            count={3}
            onClick={() => setOpen(true)}
          />
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: 'var(--ds-border-radius-full)',
            backgroundColor: 'var(--ds-color-accent-surface-default)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 'var(--ds-font-size-sm)',
            fontWeight: 'var(--ds-font-weight-semibold)',
            color: 'var(--ds-color-accent-base-default)',
          }}>
            ON
          </div>
        </div>

        <NotificationCenter
          open={open}
          onClose={() => setOpen(false)}
          notifications={sampleNotifications.slice(0, 3)}
          onNotificationClick={(id) => console.log('Clicked:', id)}
          onMarkAsRead={(id) => console.log('Mark as read:', id)}
        />
      </div>
    );
  },
};
