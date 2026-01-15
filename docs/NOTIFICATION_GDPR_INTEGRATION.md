# GDPR and Notification System Integration

> Automated notification delivery for GDPR data subject request lifecycle events.

## Overview

The GDPR system integrates seamlessly with the notification system to provide automatic, multi-channel notifications for data subject request status updates. This ensures users are informed at every stage of their GDPR request lifecycle while maintaining compliance with transparency requirements.

## Integration Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                    User Action                                  │
│              (Submit GDPR Request)                              │
└────────────────┬───────────────────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────────────────────────┐
│                  GdprController                                 │
│  - Validates request                                            │
│  - Creates database record                                      │
│  - Calls NotificationService                                    │
└────────────────┬───────────────────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────────────────────────┐
│               NotificationService                               │
│  - Looks up template: "gdpr_request_received"                  │
│  - Interpolates variables (requestType, requestId, date)       │
│  - Queues notification for delivery                            │
└────────────────┬───────────────────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────────────────────────┐
│            Multi-Channel Delivery                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │  In-App  │  │  Email   │  │   SMS    │  │   Push   │       │
│  │(WebSocket)│  │(SendGrid)│  │ (Twilio) │  │(WebPush) │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
└────────────────────────────────────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────────────────────────┐
│                  User Receives Notification                     │
│  - Real-time in-app notification                               │
│  - Email confirmation                                           │
└────────────────────────────────────────────────────────────────┘
```

## Notification Templates

Two GDPR-specific templates are seeded in the notification system:

### 1. gdpr_request_received

**Purpose:** Confirm receipt of user's data subject request

**Trigger:** When user submits a data subject request via API

**Channels:** `in-app`, `email`

**Template Structure:**
```json
{
  "code": "gdpr_request_received",
  "name": "GDPR Request Received",
  "description": "Notification when GDPR data request is received",
  "inAppTemplate": {
    "nb": {
      "title": "GDPR-forespørsel mottatt",
      "body": "Din {{requestType}}-forespørsel er mottatt og vil bli behandlet."
    },
    "en": {
      "title": "GDPR Request Received",
      "body": "Your {{requestType}} request has been received and will be processed."
    }
  },
  "emailTemplate": {
    "nb": {
      "subject": "GDPR-forespørsel mottatt",
      "body": "Hei {{userName}},\n\nVi har mottatt din forespørsel om {{requestType}}.\n\nForespørsel-ID: {{requestId}}\nType: {{requestType}}\nMottatt: {{receivedDate}}\n\nDenne forespørselen vil bli behandlet innen 30 dager i henhold til GDPR.\n\nMvh,\nDigilist"
    },
    "en": {
      "subject": "GDPR Request Received",
      "body": "Hi {{userName}},\n\nWe have received your {{requestType}} request.\n\nRequest ID: {{requestId}}\nType: {{requestType}}\nReceived: {{receivedDate}}\n\nThis request will be processed within 30 days according to GDPR.\n\nBest regards,\nDigilist"
    }
  }
}
```

**Variables:**
- `userName` - User's full name
- `requestType` - Type of request (access, erasure, portability, etc.)
- `requestId` - Unique request identifier
- `receivedDate` - Date request was submitted

### 2. gdpr_request_completed

**Purpose:** Notify user when their data subject request has been processed

**Trigger:** When admin updates request status to "completed"

**Channels:** `in-app`, `email`

**Template Structure:**
```json
{
  "code": "gdpr_request_completed",
  "name": "GDPR Request Completed",
  "description": "Notification when GDPR data request is completed",
  "inAppTemplate": {
    "nb": {
      "title": "GDPR-forespørsel fullført",
      "body": "Din {{requestType}}-forespørsel er nå fullført."
    },
    "en": {
      "title": "GDPR Request Completed",
      "body": "Your {{requestType}} request has been completed."
    }
  },
  "emailTemplate": {
    "nb": {
      "subject": "GDPR-forespørsel fullført",
      "body": "Hei {{userName}},\n\nDin forespørsel om {{requestType}} er nå fullført.\n\nForespørsel-ID: {{requestId}}\nFullført: {{completedDate}}\n\n{{completionNotes}}\n\nMvh,\nDigilist"
    },
    "en": {
      "subject": "GDPR Request Completed",
      "body": "Hi {{userName}},\n\nYour {{requestType}} request has been completed.\n\nRequest ID: {{requestId}}\nCompleted: {{completedDate}}\n\n{{completionNotes}}\n\nBest regards,\nDigilist"
    }
  }
}
```

**Variables:**
- `userName` - User's full name
- `requestType` - Type of request (access, erasure, portability, etc.)
- `requestId` - Unique request identifier
- `completedDate` - Date request was completed
- `completionNotes` - Admin notes explaining the outcome

## Implementation Details

### Backend Integration (GdprController)

Located at: `apps/api/src/modules/gdpr/gdpr.controller.ts`

**On Request Submission:**

```typescript
async createDataRequest(request: FastifyRequest, reply: FastifyReply) {
  // ... validation and database insert ...

  // Send notification
  await this.notificationService.notify(
    tenantId,
    {
      id: userId,
      email: user.email,
      phone: user.phone,
    },
    'gdpr_request_received',
    {
      userName: user.name,
      requestType: this.translateRequestType(body.requestType),
      requestId: newRequest.id,
      receivedDate: new Date().toLocaleDateString('nb-NO'),
    },
    {
      channels: ['in_app', 'email'],
      priority: 'normal',
      relatedEntityType: 'gdpr_request',
      relatedEntityId: newRequest.id,
    }
  );

  return reply.status(201).send(newRequest);
}
```

**On Request Completion:**

```typescript
async updateRequestStatus(request: FastifyRequest, reply: FastifyReply) {
  // ... validation and database update ...

  if (body.status === 'completed') {
    await this.notificationService.notify(
      tenantId,
      {
        id: dataRequest.userId,
        email: user.email,
        phone: user.phone,
      },
      'gdpr_request_completed',
      {
        userName: user.name,
        requestType: this.translateRequestType(dataRequest.requestType),
        requestId: dataRequest.id,
        completedDate: new Date().toLocaleDateString('nb-NO'),
        completionNotes: body.adminNotes || 'Your request has been processed.',
      },
      {
        channels: ['in_app', 'email'],
        priority: 'normal',
        relatedEntityType: 'gdpr_request',
        relatedEntityId: dataRequest.id,
      }
    );
  }

  return reply.send(updatedRequest);
}
```

### Frontend Integration

Users receive notifications through:

1. **In-App Notifications** (Real-time via WebSocket)
   - Bell icon badge with unread count
   - Notification panel in header
   - Automatic updates without page refresh

2. **Email Notifications**
   - Sent to user's registered email address
   - Includes request details and next steps
   - Complies with GDPR transparency requirements

### SDK Integration

The notification service is automatically invoked by the GDPR controller. No additional SDK changes needed for basic integration.

**Optional: Frontend can subscribe to real-time notifications:**

```typescript
import { realtimeClient } from '@digilist/client-sdk';

// Connect to notification WebSocket
realtimeClient.connect({
  url: 'wss://api.digilist.no/ws/notifications',
  tenantId: 'your-tenant-id',
  userId: currentUser.id,
});

// Listen for GDPR notifications
realtimeClient.onNotification((notification) => {
  if (notification.type.startsWith('gdpr_request_')) {
    // Show toast or update UI
    showToast({
      title: notification.title,
      message: notification.message,
      type: 'info',
    });
  }
});
```

## User Journey

### Scenario 1: User Submits Access Request

1. **User Action:** Fills out data subject request form, selects "Access" type
2. **API Call:** `POST /api/gdpr/data-request` with `{ requestType: 'access' }`
3. **GDPR Controller:**
   - Creates request in database
   - Sets status to `pending`
   - Calculates deadline (30 days)
4. **Notification Service:**
   - Looks up template `gdpr_request_received`
   - Interpolates variables
   - Creates notification in database
   - Queues for multi-channel delivery
5. **Channel Handlers:**
   - In-app: Creates notification record, broadcasts via WebSocket
   - Email: Sends via SendGrid/SMTP
6. **User Receives:**
   - Real-time notification in app (bell icon badge updates)
   - Email confirmation with request details

### Scenario 2: Admin Completes Request

1. **Admin Action:** Updates request status to "completed" in backoffice
2. **API Call:** `PUT /api/gdpr/request/:id/status` with `{ status: 'completed', adminNotes: '...' }`
3. **GDPR Controller:**
   - Updates request in database
   - Sets `completed_at` timestamp
4. **Notification Service:**
   - Looks up template `gdpr_request_completed`
   - Interpolates variables including admin notes
   - Creates notification in database
   - Queues for delivery
5. **Channel Handlers:**
   - In-app: Creates notification, broadcasts via WebSocket
   - Email: Sends completion email with outcome details
6. **User Receives:**
   - Real-time notification in app
   - Email with completion details and admin notes

## Compliance Benefits

### Transparency (GDPR Art. 12)

- Users receive immediate confirmation of request receipt
- Clear communication about processing timeline (30 days)
- Detailed information about request outcome

### Timely Response (GDPR Art. 12.3)

- Automatic deadline tracking
- Visual warnings for approaching deadlines
- Notification upon completion ensures user is informed

### Audit Trail

All notifications logged in `notification_delivery_logs`:
- Delivery status (sent, delivered, failed)
- Channel used
- Timestamp
- Provider response

## Configuration

### Environment Variables

No additional configuration required beyond notification system setup:

```bash
# Email provider
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=your-api-key

# SMS provider (optional)
SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=your-sid
TWILIO_AUTH_TOKEN=your-token
```

### Notification Preferences

Users can control notification channels in their preferences:

```typescript
// Check user's notification preferences
const preferences = await notificationService.getUserPreferences(userId);

// Respect user's channel preferences
const enabledChannels = preferences.channels
  .filter(ch => ch.enabled)
  .map(ch => ch.channel);

// Only send via enabled channels
await notificationService.notify(
  tenantId,
  user,
  'gdpr_request_received',
  variables,
  { channels: enabledChannels }
);
```

## Error Handling

### Failed Notification Delivery

If notification delivery fails:

1. **Logged in `notification_delivery_logs`** with error details
2. **Automatic retry** (up to 3 attempts with exponential backoff)
3. **Admin alert** if critical notification fails after retries
4. **GDPR request still processed** - notification failure doesn't block request

**Example error handling:**

```typescript
try {
  await notificationService.notify(/* ... */);
} catch (error) {
  // Log error but don't block GDPR request
  logger.error('Failed to send GDPR notification', { error, requestId });

  // Request is still valid - admin can manually notify user
}
```

### Missing Template

If template is missing (shouldn't happen after migration):

```typescript
// Fallback to generic notification
if (!template) {
  logger.warn('GDPR template not found, using fallback', { templateCode });

  await notificationService.createGenericNotification({
    userId,
    title: 'GDPR Request Received',
    message: 'Your data subject request has been received.',
    type: 'gdpr',
  });
}
```

## Testing

### Integration Test Checklist

**Request Submission Flow:**
- [ ] Submit GDPR access request
- [ ] Verify in-app notification created
- [ ] Verify email notification sent
- [ ] Check notification includes request ID
- [ ] Check notification includes 30-day timeline
- [ ] Verify notification logged in delivery logs

**Request Completion Flow:**
- [ ] Admin updates request to completed
- [ ] Verify in-app notification created
- [ ] Verify email notification sent
- [ ] Check notification includes admin notes
- [ ] Check notification includes completion date
- [ ] Verify notification logged in delivery logs

**Real-time Updates:**
- [ ] WebSocket connection established
- [ ] In-app notification appears without refresh
- [ ] Bell icon badge updates
- [ ] Notification panel shows new notification

**Error Handling:**
- [ ] Email provider unavailable - logs error, request still processed
- [ ] WebSocket disconnected - notification still in database for later retrieval
- [ ] Template missing - fallback notification sent

## Monitoring

Check integration health:

```sql
-- GDPR notifications sent in last 7 days
SELECT
  nt.code,
  ndl.channel,
  ndl.status,
  COUNT(*) as count
FROM notification_delivery_logs ndl
JOIN notifications n ON ndl.notification_id = n.id
JOIN notification_templates nt ON n.type = nt.code
WHERE nt.code IN ('gdpr_request_received', 'gdpr_request_completed')
AND ndl.created_at > NOW() - INTERVAL '7 days'
GROUP BY nt.code, ndl.channel, ndl.status;

-- Failed GDPR notifications needing attention
SELECT
  n.id,
  n.user_id,
  n.type,
  ndl.channel,
  ndl.error_message,
  ndl.retry_count
FROM notification_delivery_logs ndl
JOIN notifications n ON ndl.notification_id = n.id
WHERE n.type IN ('gdpr_request_received', 'gdpr_request_completed')
AND ndl.status = 'failed'
AND ndl.retry_count >= 3
ORDER BY ndl.created_at DESC;

-- GDPR requests without notifications (data integrity check)
SELECT
  dsr.id,
  dsr.user_id,
  dsr.request_type,
  dsr.status,
  dsr.created_at
FROM data_subject_requests dsr
LEFT JOIN notifications n ON n.related_entity_id = dsr.id AND n.related_entity_type = 'gdpr_request'
WHERE n.id IS NULL
AND dsr.created_at > NOW() - INTERVAL '30 days';
```

## Best Practices

1. **Don't Block on Notification Failures** - GDPR requests must be processed even if notifications fail
2. **Log All Delivery Attempts** - Maintain audit trail of all notification attempts
3. **Respect User Preferences** - Check notification preferences before sending
4. **Provide Admin Visibility** - Admins should see notification delivery status
5. **Include Action URLs** - Link to request details in notifications
6. **Localize Content** - Use user's preferred language (nb/en)
7. **Monitor Delivery Rates** - Alert if delivery success rate drops below threshold

## Future Enhancements

**Planned Features:**
- SMS notifications for urgent/overdue requests
- Push notifications for mobile app users
- Digest emails (daily/weekly summary of pending requests)
- Custom notification templates per tenant
- Webhook notifications for external systems
- Rich email templates with branding

## References

- GDPR Article 12 (Transparency): https://gdpr-info.eu/art-12-gdpr/
- Notification System Documentation: `/docs/NOTIFICATION_SYSTEM.md`
- GDPR Implementation Documentation: `/docs/GDPR_IMPLEMENTATION.md`
