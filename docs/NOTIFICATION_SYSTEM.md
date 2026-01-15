# Notification System

> Complete notification system for the Digilist platform with multi-channel delivery, templates, and real-time WebSocket support.

## Overview

The Notification System provides a comprehensive solution for sending notifications to users across multiple channels:

- **In-App** - Real-time notifications via WebSocket
- **Email** - Via SendGrid, AWS SES, Postmark, or SMTP
- **SMS** - Via Twilio, Telenor, or Nexmo
- **Push** - Browser push notifications via Web Push API

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      Frontend (React)                            │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │ useNotifications │  │ useUnreadCount  │  │ WebSocket Hook  │  │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘  │
└───────────┼────────────────────┼────────────────────┼───────────┘
            │                    │                    │
            ▼                    ▼                    ▼
┌───────────────────────────────────────────────────────────────────┐
│                         SDK Layer                                  │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │               notificationSystemService                      │  │
│  └─────────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────┘
            │
            ▼
┌───────────────────────────────────────────────────────────────────┐
│                         API Layer                                  │
│  ┌──────────────────┐  ┌──────────────────┐  ┌────────────────┐  │
│  │ NotificationCtrl │  │ WebSocket Routes │  │ Template Ctrl  │  │
│  └────────┬─────────┘  └────────┬─────────┘  └───────┬────────┘  │
└───────────┼────────────────────────────────────────────┼──────────┘
            │                                            │
            ▼                                            ▼
┌───────────────────────────────────────────────────────────────────┐
│                       Service Layer                                │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │                   NotificationService                         │ │
│  │  ┌─────────────────┐  ┌────────────────────────────────────┐ │ │
│  │  │ TemplateService │  │         Dispatcher                 │ │ │
│  │  └─────────────────┘  │  ┌────────┐ ┌────────┐ ┌────────┐ │ │ │
│  │                       │  │ Email  │ │  SMS   │ │ InApp  │ │ │ │
│  │                       │  │Handler │ │Handler │ │Handler │ │ │ │
│  │                       │  └────────┘ └────────┘ └────────┘ │ │ │
│  │                       └────────────────────────────────────┘ │ │
│  └──────────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────────┘
            │
            ▼
┌───────────────────────────────────────────────────────────────────┐
│                       Database Layer                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌──────────┐ │
│  │notifications│  │  templates  │  │delivery_logs│  │  queue   │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └──────────┘ │
└───────────────────────────────────────────────────────────────────┘
```

## Database Schema

### Tables

| Table | Purpose |
|-------|---------|
| `notification_templates` | Template storage with i18n support |
| `notifications` | Individual notification instances |
| `notification_delivery_logs` | Track delivery attempts per channel |
| `notification_queue` | Queue for scheduled/pending notifications |
| `sms_provider_configs` | SMS provider configuration |
| `email_provider_configs` | Email provider configuration |

### Entity Relationships

```
notification_templates (1) ──── (n) notifications
notifications (1) ──── (n) notification_delivery_logs
notification_queue (1) ──── (0..1) notifications
```

## API Endpoints

### User Notifications

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications` | List user notifications |
| GET | `/api/notifications/count` | Get unread count |
| GET | `/api/notifications/stats` | Get statistics |
| GET | `/api/notifications/:id` | Get single notification |
| PUT | `/api/notifications/:id/read` | Mark as read |
| PUT | `/api/notifications/read-all` | Mark all as read |
| PUT | `/api/notifications/:id/dismiss` | Dismiss notification |
| DELETE | `/api/notifications/:id` | Delete notification |

### Send Notifications (Admin)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/notifications/send` | Send to single user |
| POST | `/api/notifications/broadcast` | Send to multiple users |

### Templates

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notification-templates` | List all templates |
| GET | `/api/notification-templates/:code` | Get template by code |
| POST | `/api/notification-templates` | Create template |
| PUT | `/api/notification-templates/:id` | Update template |
| DELETE | `/api/notification-templates/:id` | Delete template |
| POST | `/api/notification-templates/:code/preview` | Preview with variables |

### Configuration

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications/channels` | Available channels |
| GET | `/api/notifications/rate-limits` | Rate limit status |

## WebSocket Integration

### Connection

```typescript
// Connect to user notifications
const ws = new WebSocket('ws://localhost:4000/ws/notifications/{userId}');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  switch (data.type) {
    case 'notification:new':
      // Handle new notification
      break;
    case 'notification:read':
      // Handle notification marked as read
      break;
    case 'notification:count':
      // Handle updated unread count
      break;
  }
};
```

### Event Types

| Event | Payload |
|-------|---------|
| `notification:new` | `{ id, type, title, message, priority, actionUrl, createdAt }` |
| `notification:read` | `{ id }` |
| `notification:dismissed` | `{ id }` |
| `notification:count` | `{ unreadCount }` |

## SDK Usage

### React Query Hooks

```typescript
import {
  useNotifications,
  useUnreadNotificationCount,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
  useSendNotification,
} from '@digilist/client-sdk/hooks';

// Get notifications
function NotificationList() {
  const { data, isLoading } = useNotifications({
    unreadOnly: true,
    limit: 20,
  });

  if (isLoading) return <Spinner />;

  return (
    <ul>
      {data?.notifications.map((n) => (
        <li key={n.id}>{n.title}</li>
      ))}
    </ul>
  );
}

// Get unread count (auto-refreshes every 30s)
function NotificationBadge() {
  const { data } = useUnreadNotificationCount();
  return <Badge>{data?.count || 0}</Badge>;
}

// Mark as read
function NotificationItem({ notification }) {
  const markAsRead = useMarkNotificationAsRead();

  return (
    <div onClick={() => markAsRead.mutate(notification.id)}>
      {notification.title}
    </div>
  );
}
```

### Service Direct Usage

```typescript
import { notificationSystemService } from '@digilist/client-sdk/services';

// Get notifications
const { notifications, total } = await notificationSystemService.getNotifications({
  type: 'approved',
  limit: 10,
});

// Send notification (admin)
await notificationSystemService.sendNotification({
  userId: 'user-123',
  type: 'approved',
  variables: {
    userName: 'Ola Nordmann',
    listingName: 'Fotballbane A',
    startDate: '2026-01-20',
  },
  channels: ['in_app', 'email'],
});
```

## Templates

### Template Structure

Templates support multiple channels and locales (Norwegian and English):

```json
{
  "code": "approved",
  "name": "Booking Approved",
  "emailTemplate": {
    "nb": {
      "subject": "Din booking er godkjent!",
      "body": "Hei {{userName}},\n\nDin booking av {{listingName}} er godkjent!"
    },
    "en": {
      "subject": "Your Booking is Approved!",
      "body": "Hi {{userName}},\n\nYour booking for {{listingName}} has been approved!"
    }
  },
  "smsTemplate": {
    "nb": "Din booking av {{listingName}} {{startDate}} er godkjent!",
    "en": "Your booking for {{listingName}} {{startDate}} is approved!"
  },
  "inAppTemplate": {
    "nb": { "title": "Booking godkjent", "body": "{{listingName}} - {{startDate}}" },
    "en": { "title": "Booking Approved", "body": "{{listingName}} - {{startDate}}" }
  },
  "availableVariables": ["userName", "listingName", "startDate", "endTime", "bookingId"]
}
```

### Pre-seeded System Templates

| Code | Description |
|------|-------------|
| `booking_approved` | Booking approved |
| `booking_rejected` | Booking rejected |
| `gdpr_request_received` | GDPR data request received |
| `gdpr_request_completed` | GDPR data request completed |

**Note:** More templates can be added via the API or database seeding.

### Variable Interpolation

Templates use `{{variableName}}` syntax:

```
Hei {{userName}}, din booking av {{listingName}} starter {{startDate}} kl {{startTime}}.
```

## Channel Handlers

### Email Handler

Supports multiple providers:
- **SendGrid** - `POST https://api.sendgrid.com/v3/mail/send`
- **AWS SES** - AWS SDK integration
- **Postmark** - `POST https://api.postmarkapp.com/email`
- **SMTP** - Direct SMTP via nodemailer

### SMS Handler

Supports Norwegian phone numbers with automatic normalization:
- **Twilio** - Global SMS delivery
- **Telenor** - Norwegian carrier integration
- **Nexmo/Vonage** - Alternative provider

### Push Handler

Uses Web Push API with VAPID authentication:
- Requires `VAPID_PUBLIC_KEY` and `VAPID_PRIVATE_KEY` environment variables
- Sends to all user's registered devices

### In-App Handler

- Creates notification in database
- Broadcasts via WebSocket for real-time delivery

## Rate Limiting

Each channel has configurable rate limits per tenant:

| Channel | Default Daily | Default Monthly |
|---------|---------------|-----------------|
| Email | 10,000 | 100,000 |
| SMS | 1,000 | 10,000 |
| Push | Unlimited | Unlimited |
| In-App | Unlimited | Unlimited |

## Sending Notifications (Backend)

### Using the Service

```typescript
import { NotificationService } from './modules/notification-system';

// Inject the service
const notificationService = container.resolve('NotificationService');

// Send notification using template
await notificationService.notify(
  tenantId,
  { id: userId, email: 'user@example.com', phone: '+4712345678' },
  'approved',
  {
    userName: 'Ola Nordmann',
    listingName: 'Fotballbane A',
    startDate: '20. januar 2026',
    startTime: '18:00',
    endTime: '20:00',
    totalPrice: '500',
    bookingId: 'booking-123',
  },
  {
    channels: ['in_app', 'email'],
    priority: 'normal',
    relatedEntityType: 'booking',
    relatedEntityId: 'booking-123',
  }
);
```

### Scheduling Notifications

```typescript
// Schedule for future delivery
await notificationService.notify(
  tenantId,
  user,
  'reminder_24h',
  variables,
  {
    scheduledFor: new Date('2026-01-19T18:00:00Z'),
  }
);
```

## Queue Processing

The notification queue is processed by a background worker:

```typescript
// Process pending queue items
const result = await notificationService.processQueue(100);
console.log(`Processed: ${result.processed}, Failed: ${result.failed}`);
```

## Configuration

### Environment Variables

```bash
# Email Provider (SendGrid example)
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=your-api-key

# SMS Provider (Twilio example)
SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_FROM_NUMBER=+47xxxxxxxx

# Push Notifications
VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key
```

### Database Migration

```bash
cd apps/api
psql -d your_database -f src/database/migrations/20260115_add_notification_system.sql
```

## Error Handling

All channel handlers return a consistent result:

```typescript
interface ChannelSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
  errorCode?: string;
}
```

Common error codes:
- `INVALID_PAYLOAD` - Missing required fields
- `RATE_LIMIT_EXCEEDED` - Daily/monthly limit reached
- `PROVIDER_NOT_CONFIGURED` - No provider config for tenant
- `MISSING_CREDENTIALS` - Provider credentials not set
- `SEND_FAILED` - Provider returned an error

## Best Practices

1. **Use Templates** - Don't hardcode notification content
2. **Include Action URLs** - Deep link to relevant pages
3. **Set Priority Appropriately** - Use `urgent` sparingly
4. **Log Delivery** - All attempts are logged for debugging
5. **Handle Failures** - Queue items retry automatically (3x)
6. **Respect Preferences** - Check user preferences before sending

## Security Considerations

- All provider credentials stored encrypted in database
- Rate limiting prevents abuse
- Tenant isolation enforced on all queries
- WebSocket connections authenticated by user ID
- No PII in logs

## GDPR Integration

The notification system is integrated with the GDPR module to provide automatic notifications for data subject requests.

### GDPR Templates

Two GDPR-specific templates are seeded automatically:

1. **gdpr_request_received**
   - Sent when user submits a data subject request
   - Channels: in-app, email
   - Variables: requestType, requestId, receivedDate, userName
   - Purpose: Confirm receipt and set expectations (30-day timeline)

2. **gdpr_request_completed**
   - Sent when admin completes a data subject request
   - Channels: in-app, email
   - Variables: requestType, requestId, completedDate, completionNotes, userName
   - Purpose: Inform user of outcome

### Automatic Triggers

The GDPR controller automatically sends notifications:

```typescript
// On request submission
await notificationService.notify(
  tenantId,
  user,
  'gdpr_request_received',
  {
    userName: user.name,
    requestType: 'Data Access Request',
    requestId: request.id,
    receivedDate: '15. januar 2026',
  },
  {
    channels: ['in_app', 'email'],
    priority: 'normal',
    relatedEntityType: 'gdpr_request',
    relatedEntityId: request.id,
  }
);

// On request completion
await notificationService.notify(
  tenantId,
  user,
  'gdpr_request_completed',
  {
    userName: user.name,
    requestType: 'Data Access Request',
    requestId: request.id,
    completedDate: '20. januar 2026',
    completionNotes: 'Your data has been exported and is available for download.',
  },
  {
    channels: ['in_app', 'email'],
    priority: 'normal',
    relatedEntityType: 'gdpr_request',
    relatedEntityId: request.id,
  }
);
```

### Compliance Benefits

- **Transparency (GDPR Art. 12)** - Users receive clear communication about their requests
- **Timely Response (GDPR Art. 12.3)** - 30-day timeline communicated upfront
- **Audit Trail** - All notifications logged in `notification_delivery_logs`

For detailed GDPR integration documentation, see: `/docs/NOTIFICATION_GDPR_INTEGRATION.md`

## Monitoring

Check notification health:

```sql
-- Unprocessed queue items
SELECT status, COUNT(*) FROM notification_queue GROUP BY status;

-- Recent delivery failures
SELECT channel, error_code, COUNT(*) 
FROM notification_delivery_logs 
WHERE status = 'failed' AND created_at > NOW() - INTERVAL '24 hours'
GROUP BY channel, error_code;

-- Delivery success rate by channel
SELECT 
  channel,
  COUNT(*) FILTER (WHERE status = 'delivered') * 100.0 / COUNT(*) as success_rate
FROM notification_delivery_logs
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY channel;
```
