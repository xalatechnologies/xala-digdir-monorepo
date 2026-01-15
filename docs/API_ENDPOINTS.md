# API Endpoints Reference

> Complete API endpoint documentation for Digilist platform.

**Base URL:** `https://api.digilist.no`

**Last Updated:** 2026-01-15

## Authentication

All endpoints (except public ones) require authentication via Bearer token.

**Header:**
```
Authorization: Bearer <jwt_token>
```

**Public Endpoints:**
- `/health` - Health check
- `/api/gdpr/consent-types` - List consent types
- `/api/public/*` - Public-facing endpoints

---

## Health & Monitoring

### GET /health

Check API health status.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-01-15T12:00:00Z",
  "uptime": 86400,
  "database": "connected",
  "version": "2.1.0"
}
```

---

## GDPR Endpoints

### Consent Management

#### GET /api/gdpr/consent-types

List all available consent types.

**Access:** Public

**Response:**
```json
{
  "consentTypes": [
    {
      "id": "uuid",
      "code": "terms_of_service",
      "name": "Terms of Service",
      "description": "Agreement to terms and conditions",
      "required": true,
      "legalBasis": "Contract",
      "version": 1,
      "isActive": true,
      "showOnRegistration": true,
      "displayOrder": 1
    }
  ]
}
```

#### GET /api/gdpr/my-consents

Get current user's consent records.

**Access:** Authenticated

**Response:**
```json
{
  "consents": [
    {
      "id": "uuid",
      "consentTypeId": "uuid",
      "consentType": {
        "code": "terms_of_service",
        "name": "Terms of Service",
        "version": 1
      },
      "granted": true,
      "grantedAt": "2026-01-15T12:00:00Z",
      "revokedAt": null,
      "version": 1
    }
  ]
}
```

#### POST /api/gdpr/consent

Grant a single consent.

**Access:** Authenticated

**Body:**
```json
{
  "consentTypeId": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "consent": {
    "id": "uuid",
    "consentTypeId": "uuid",
    "grantedAt": "2026-01-15T12:00:00Z"
  }
}
```

#### POST /api/gdpr/consents/grant-multiple

Grant multiple consents at once.

**Access:** Authenticated

**Body:**
```json
{
  "consentTypeIds": ["uuid1", "uuid2", "uuid3"]
}
```

**Response:**
```json
{
  "success": true,
  "granted": ["uuid1", "uuid2", "uuid3"]
}
```

#### DELETE /api/gdpr/consent/:consentTypeId

Revoke a consent (only if not required).

**Access:** Authenticated

**Response:**
```json
{
  "success": true,
  "revokedAt": "2026-01-15T12:00:00Z"
}
```

#### GET /api/gdpr/consent-history

View user's consent change history.

**Access:** Authenticated

**Response:**
```json
{
  "history": [
    {
      "id": "uuid",
      "consentTypeId": "uuid",
      "action": "grant",
      "ipAddress": "192.168.1.1",
      "userAgent": "Mozilla/5.0...",
      "createdAt": "2026-01-15T12:00:00Z"
    }
  ]
}
```

### Data Subject Requests

#### POST /api/gdpr/data-request

Submit a data subject request.

**Access:** Authenticated

**Body:**
```json
{
  "requestType": "access",
  "description": "Optional description"
}
```

**Request Types:**
- `access` - Right to access personal data
- `erasure` - Right to be forgotten
- `portability` - Data portability
- `rectification` - Right to correct data
- `restriction` - Restrict processing
- `objection` - Object to processing

**Response:**
```json
{
  "id": "uuid",
  "requestType": "access",
  "status": "pending",
  "submittedAt": "2026-01-15T12:00:00Z",
  "deadline": "2026-02-14T12:00:00Z"
}
```

#### GET /api/gdpr/my-requests

List current user's data subject requests.

**Access:** Authenticated

**Response:**
```json
{
  "requests": [
    {
      "id": "uuid",
      "requestType": "access",
      "status": "pending",
      "submittedAt": "2026-01-15T12:00:00Z",
      "deadline": "2026-02-14T12:00:00Z",
      "description": "I need a copy of my data",
      "adminNotes": null,
      "completedAt": null
    }
  ]
}
```

#### GET /api/gdpr/pending-requests

List all pending requests (admin only).

**Access:** Admin

**Response:**
```json
{
  "requests": [
    {
      "id": "uuid",
      "userId": "uuid",
      "userName": "Ola Nordmann",
      "userEmail": "ola@example.com",
      "requestType": "access",
      "status": "pending",
      "submittedAt": "2026-01-15T12:00:00Z",
      "deadline": "2026-02-14T12:00:00Z",
      "daysRemaining": 29
    }
  ]
}
```

#### PUT /api/gdpr/request/:id/status

Update request status (admin only).

**Access:** Admin

**Body:**
```json
{
  "status": "completed",
  "adminNotes": "Data exported and sent via email"
}
```

**Status Values:**
- `pending` - Awaiting processing
- `in_progress` - Being processed
- `completed` - Fulfilled
- `rejected` - Denied (with reason)

**Response:**
```json
{
  "id": "uuid",
  "status": "completed",
  "completedAt": "2026-01-20T12:00:00Z",
  "adminNotes": "Data exported and sent via email"
}
```

---

## Notification System

### User Notifications

#### GET /api/notifications

List user's notifications.

**Access:** Authenticated

**Query Parameters:**
- `unreadOnly` (boolean) - Only unread notifications
- `type` (string) - Filter by notification type
- `limit` (number) - Max results (default: 50)
- `offset` (number) - Pagination offset

**Response:**
```json
{
  "notifications": [
    {
      "id": "uuid",
      "type": "gdpr_request_received",
      "title": "GDPR Request Received",
      "message": "Your data access request has been received...",
      "priority": "normal",
      "relatedEntityType": "gdpr_request",
      "relatedEntityId": "uuid",
      "actionUrl": "/privacy/data-requests",
      "readAt": null,
      "createdAt": "2026-01-15T12:00:00Z"
    }
  ],
  "total": 10,
  "unreadCount": 3
}
```

#### GET /api/notifications/count

Get unread notification count.

**Access:** Authenticated

**Response:**
```json
{
  "count": 3
}
```

#### GET /api/notifications/stats

Get notification statistics.

**Access:** Authenticated

**Response:**
```json
{
  "total": 50,
  "unread": 3,
  "byType": {
    "gdpr_request_received": 2,
    "booking_approved": 10,
    "booking_rejected": 5
  },
  "byPriority": {
    "urgent": 1,
    "normal": 45,
    "low": 4
  }
}
```

#### GET /api/notifications/:id

Get single notification details.

**Access:** Authenticated (own notifications only)

**Response:**
```json
{
  "id": "uuid",
  "type": "gdpr_request_received",
  "title": "GDPR Request Received",
  "message": "Your data access request has been received...",
  "priority": "normal",
  "metadata": {
    "requestId": "uuid",
    "requestType": "access"
  },
  "readAt": null,
  "createdAt": "2026-01-15T12:00:00Z"
}
```

#### PUT /api/notifications/:id/read

Mark notification as read.

**Access:** Authenticated

**Response:**
```json
{
  "success": true,
  "readAt": "2026-01-15T12:00:00Z"
}
```

#### PUT /api/notifications/read-all

Mark all notifications as read.

**Access:** Authenticated

**Response:**
```json
{
  "success": true,
  "markedRead": 5
}
```

#### PUT /api/notifications/:id/dismiss

Dismiss a notification.

**Access:** Authenticated

**Response:**
```json
{
  "success": true,
  "dismissedAt": "2026-01-15T12:00:00Z"
}
```

#### DELETE /api/notifications/:id

Delete a notification.

**Access:** Authenticated

**Response:**
```json
{
  "success": true
}
```

### Send Notifications (Admin)

#### POST /api/notifications/send

Send notification to single user.

**Access:** Admin

**Body:**
```json
{
  "userId": "uuid",
  "type": "custom_notification",
  "variables": {
    "userName": "Ola Nordmann",
    "message": "Your account has been updated"
  },
  "channels": ["in_app", "email"],
  "priority": "normal",
  "scheduledFor": null
}
```

**Response:**
```json
{
  "success": true,
  "notificationId": "uuid",
  "queueId": "uuid"
}
```

#### POST /api/notifications/broadcast

Send notification to multiple users.

**Access:** Admin

**Body:**
```json
{
  "userIds": ["uuid1", "uuid2", "uuid3"],
  "type": "system_announcement",
  "variables": {
    "subject": "System Maintenance",
    "message": "The system will be down for maintenance..."
  },
  "channels": ["in_app", "email"],
  "priority": "urgent"
}
```

**Response:**
```json
{
  "success": true,
  "queued": 3,
  "queueIds": ["uuid1", "uuid2", "uuid3"]
}
```

### Notification Templates

#### GET /api/notification-templates

List all notification templates.

**Access:** Admin

**Response:**
```json
{
  "templates": [
    {
      "id": "uuid",
      "code": "gdpr_request_received",
      "name": "GDPR Request Received",
      "description": "Sent when user submits data request",
      "isActive": true,
      "isSystem": true,
      "availableVariables": ["userName", "requestType", "requestId"],
      "createdAt": "2026-01-15T12:00:00Z"
    }
  ]
}
```

#### GET /api/notification-templates/:code

Get template by code.

**Access:** Admin

**Response:**
```json
{
  "id": "uuid",
  "code": "gdpr_request_received",
  "name": "GDPR Request Received",
  "description": "Sent when user submits data request",
  "inAppTemplate": {
    "nb": {
      "title": "GDPR-forespørsel mottatt",
      "body": "Din {{requestType}}-forespørsel er mottatt..."
    },
    "en": {
      "title": "GDPR Request Received",
      "body": "Your {{requestType}} request has been received..."
    }
  },
  "emailTemplate": {
    "nb": {
      "subject": "GDPR-forespørsel mottatt",
      "body": "Hei {{userName}},..."}
    },
    "en": { ... }
  },
  "availableVariables": ["userName", "requestType", "requestId"],
  "isActive": true,
  "isSystem": true
}
```

#### POST /api/notification-templates

Create custom template.

**Access:** Admin

**Body:**
```json
{
  "code": "custom_reminder",
  "name": "Custom Reminder",
  "description": "Send custom reminders to users",
  "inAppTemplate": {
    "nb": { "title": "Påminnelse", "body": "{{message}}" },
    "en": { "title": "Reminder", "body": "{{message}}" }
  },
  "emailTemplate": {
    "nb": { "subject": "Påminnelse", "body": "{{message}}" },
    "en": { "subject": "Reminder", "body": "{{message}}" }
  },
  "availableVariables": ["message", "userName"]
}
```

**Response:**
```json
{
  "id": "uuid",
  "code": "custom_reminder",
  "createdAt": "2026-01-15T12:00:00Z"
}
```

#### PUT /api/notification-templates/:id

Update template.

**Access:** Admin

**Note:** System templates (`isSystem: true`) cannot be modified, only custom templates.

#### DELETE /api/notification-templates/:id

Delete custom template.

**Access:** Admin

**Note:** System templates cannot be deleted.

#### POST /api/notification-templates/:code/preview

Preview template with variables.

**Access:** Admin

**Body:**
```json
{
  "variables": {
    "userName": "Test User",
    "requestType": "Data Access Request",
    "requestId": "test-123"
  },
  "locale": "nb"
}
```

**Response:**
```json
{
  "inApp": {
    "title": "GDPR-forespørsel mottatt",
    "body": "Din Data Access Request-forespørsel er mottatt..."
  },
  "email": {
    "subject": "GDPR-forespørsel mottatt",
    "body": "Hei Test User,\n\nVi har mottatt din forespørsel..."
  }
}
```

### Configuration

#### GET /api/notifications/channels

Get available notification channels.

**Access:** Admin

**Response:**
```json
{
  "channels": [
    {
      "channel": "in_app",
      "enabled": true,
      "description": "In-app notifications via WebSocket"
    },
    {
      "channel": "email",
      "enabled": true,
      "provider": "sendgrid",
      "description": "Email notifications via SendGrid"
    },
    {
      "channel": "sms",
      "enabled": false,
      "description": "SMS notifications (not configured)"
    },
    {
      "channel": "push",
      "enabled": false,
      "description": "Push notifications (not configured)"
    }
  ]
}
```

#### GET /api/notifications/rate-limits

Get rate limit status for tenant.

**Access:** Admin

**Response:**
```json
{
  "email": {
    "dailyLimit": 10000,
    "dailyUsed": 542,
    "monthlyLimit": 100000,
    "monthlyUsed": 15234
  },
  "sms": {
    "dailyLimit": 1000,
    "dailyUsed": 0,
    "monthlyLimit": 10000,
    "monthlyUsed": 0
  }
}
```

---

## WebSocket Endpoints

### WS /ws/notifications

Real-time notification updates.

**Connection:**
```javascript
const ws = new WebSocket('wss://api.digilist.no/ws/notifications/{userId}');
```

**Authentication:**
Pass JWT token as query parameter:
```javascript
const ws = new WebSocket(`wss://api.digilist.no/ws/notifications/${userId}?token=${jwtToken}`);
```

**Event Types:**

**notification:new**
```json
{
  "type": "notification:new",
  "data": {
    "id": "uuid",
    "type": "gdpr_request_received",
    "title": "GDPR Request Received",
    "message": "Your request has been received...",
    "priority": "normal",
    "actionUrl": "/privacy/data-requests",
    "createdAt": "2026-01-15T12:00:00Z"
  }
}
```

**notification:read**
```json
{
  "type": "notification:read",
  "data": {
    "id": "uuid"
  }
}
```

**notification:dismissed**
```json
{
  "type": "notification:dismissed",
  "data": {
    "id": "uuid"
  }
}
```

**notification:count**
```json
{
  "type": "notification:count",
  "data": {
    "unreadCount": 3
  }
}
```

### WS /ws/audit

Real-time audit log events (admin only).

**Connection:**
```javascript
const ws = new WebSocket('wss://api.digilist.no/ws/audit');
```

**Event Format:**
```json
{
  "type": "audit:event",
  "data": {
    "id": "uuid",
    "action": "user.consent.granted",
    "userId": "uuid",
    "userName": "Ola Nordmann",
    "timestamp": "2026-01-15T12:00:00Z",
    "metadata": {
      "consentType": "terms_of_service"
    }
  }
}
```

---

## Error Responses

All endpoints return RFC 7807 Problem Details for errors:

```json
{
  "type": "https://api.digilist.no/errors/validation-failed",
  "title": "Validation Failed",
  "status": 400,
  "detail": "Request validation failed: consentTypeId is required"
}
```

**Common Error Types:**

| Status | Type | Description |
|--------|------|-------------|
| 400 | `validation-failed` | Invalid request body |
| 401 | `unauthorized` | Missing or invalid token |
| 403 | `forbidden` | Insufficient permissions |
| 404 | `not-found` | Resource not found |
| 409 | `conflict` | Resource conflict (e.g., duplicate consent) |
| 429 | `rate-limit-exceeded` | Too many requests |
| 500 | `internal-server-error` | Server error |

---

## Rate Limiting

API enforces rate limits per IP address and per user:

**Limits:**
- Anonymous: 100 requests per 15 minutes
- Authenticated: 1000 requests per 15 minutes
- Admin: 5000 requests per 15 minutes

**Headers:**
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1642248000
```

---

## Pagination

List endpoints support pagination:

**Query Parameters:**
- `limit` - Max results per page (default: 50, max: 100)
- `offset` - Number of results to skip

**Response:**
```json
{
  "items": [...],
  "total": 250,
  "limit": 50,
  "offset": 0,
  "hasMore": true
}
```

---

## Filtering & Sorting

**Common filters:**
- `status` - Filter by status
- `type` - Filter by type
- `search` - Text search
- `from` - Start date (ISO 8601)
- `to` - End date (ISO 8601)

**Sorting:**
- `sortBy` - Field to sort by
- `sortOrder` - `asc` or `desc`

**Example:**
```
GET /api/notifications?type=gdpr&sortBy=createdAt&sortOrder=desc&limit=20
```

---

## Changelog

### 2026-01-15 - GDPR + Notification System

**Added:**
- 9 GDPR endpoints for consent and data requests
- 17+ notification system endpoints
- WebSocket endpoint for real-time notifications
- Template management endpoints

**Changed:**
- None

**Deprecated:**
- Old `/api/notifications` controller (replaced by notification system)

### 2025-01-14 - Initial Production Release

**Added:**
- Core booking endpoints
- Authentication endpoints
- Organization management
- Audit logging

---

## Additional Resources

- **GDPR Documentation:** `/docs/GDPR_IMPLEMENTATION.md`
- **Notification System:** `/docs/NOTIFICATION_SYSTEM.md`
- **Integration Guide:** `/docs/NOTIFICATION_GDPR_INTEGRATION.md`
- **Deployment Status:** `/docs/DEPLOYMENT_STATUS.md`
