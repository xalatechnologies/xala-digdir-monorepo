# GDPR Implementation

> Complete GDPR compliance system with consent management, data subject rights, and Article 30 audit trails.

## Overview

The GDPR implementation provides a comprehensive solution for European data protection compliance:

- **Consent Management** - User consent collection and tracking with versioning
- **Data Subject Rights** - Support for all 6 GDPR rights (access, erasure, portability, rectification, restriction, objection)
- **Audit Trails** - Article 30 compliant processing records
- **Multi-channel Notifications** - Automatic notifications for request status updates
- **Multi-tenant** - Tenant-isolated consent types and requests
- **Internationalized** - Full Norwegian (nb) and English (en) translations

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      Frontend (React)                            │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │  ConsentPopup   │  │ ConsentSettings │  │ DataSubjectForm │  │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘  │
└───────────┼────────────────────┼────────────────────┼───────────┘
            │                    │                    │
            ▼                    ▼                    ▼
┌───────────────────────────────────────────────────────────────────┐
│                         SDK Layer                                  │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │                     gdprService                              │  │
│  └─────────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────┘
            │
            ▼
┌───────────────────────────────────────────────────────────────────┐
│                         API Layer                                  │
│  ┌──────────────────┐  ┌──────────────────┐  ┌────────────────┐  │
│  │  GdprController  │  │ NotificationCtrl │  │  AuditService  │  │
│  └────────┬─────────┘  └────────┬─────────┘  └───────┬────────┘  │
└───────────┼────────────────────────────────────────────┼──────────┘
            │                                            │
            ▼                                            ▼
┌───────────────────────────────────────────────────────────────────┐
│                       Database Layer                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐    │
│  │consent_types │  │user_consents │  │data_subject_requests│    │
│  └──────────────┘  └──────────────┘  └──────────────────────┘    │
│  ┌──────────────────┐  ┌──────────────────────┐                  │
│  │consent_audit_log │  │data_processing_records│                  │
│  └──────────────────┘  └──────────────────────┘                  │
└───────────────────────────────────────────────────────────────────┘
```

## Database Schema

### Tables

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `consent_types` | Definition of consent types | code, name, required, legal_basis, version |
| `user_consents` | User consent records | user_id, consent_type_id, granted_at, revoked_at |
| `consent_audit_log` | Audit trail for consent changes | user_id, action, ip_address, user_agent |
| `data_subject_requests` | GDPR data requests | user_id, request_type, status, deadline |
| `data_processing_records` | Article 30 records | purpose, legal_basis, data_categories |

### Entity Relationships

```
consent_types (1) ──── (n) user_consents
user_consents (1) ──── (n) consent_audit_log
users (1) ──── (n) data_subject_requests
tenants (1) ──── (n) consent_types
tenants (1) ──── (n) data_subject_requests
```

### Consent Types (Seeded)

| Code | Name | Required | Legal Basis |
|------|------|----------|-------------|
| `terms_of_service` | Terms of Service | Yes | Contract |
| `privacy_policy` | Privacy Policy | Yes | Legitimate Interest |
| `marketing_emails` | Marketing Emails | No | Consent |
| `analytics_cookies` | Analytics Cookies | No | Consent |

## API Endpoints

### Consent Management

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/gdpr/consent-types` | List available consent types | Public |
| GET | `/api/gdpr/my-consents` | Get user's current consents | Authenticated |
| POST | `/api/gdpr/consent` | Grant consent | Authenticated |
| DELETE | `/api/gdpr/consent/:consentTypeId` | Revoke consent | Authenticated |
| GET | `/api/gdpr/consent-history` | View consent change history | Authenticated |

### Data Subject Requests

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/gdpr/data-request` | Submit data subject request | Authenticated |
| GET | `/api/gdpr/my-requests` | List user's requests | Authenticated |
| GET | `/api/gdpr/requests` | List all requests (admin) | Admin only |
| GET | `/api/gdpr/pending-requests` | List pending requests | Admin only |
| PUT | `/api/gdpr/request/:id/status` | Update request status | Admin only |

## Frontend Components

### ConsentPopup (apps/web, apps/minside)

Initial consent collection modal that appears for new users.

**Location:** `apps/web/src/components/ConsentPopup.tsx`

**Features:**
- Shows on first visit or when required consents are missing
- Grouped display: Required consents vs Optional consents
- Cannot be dismissed without accepting required consents
- Bulk consent granting with single API call
- Version tracking to detect outdated consents

**Usage:**
```tsx
import { ConsentPopup } from './components/ConsentPopup';

function App() {
  return (
    <>
      <ConsentPopup />
      {/* Rest of app */}
    </>
  );
}
```

**SDK Hooks Used:**
- `useShowConsentPopup()` - Determines if popup should display
- `usePendingRequiredConsents()` - Gets missing required consents
- `useGrantMultipleConsents()` - Bulk consent granting

### ConsentSettings (apps/web, apps/minside)

Full consent management page at `/privacy`.

**Location:** `apps/web/src/components/ConsentSettings.tsx`

**Features:**
- List all consent types with descriptions
- Toggle switches for each consent
- Shows legal basis (Contract, Legitimate Interest, Consent)
- Version mismatch warnings
- Real-time consent granting/revoking
- Loading states and error handling

**Usage:**
```tsx
// In routes
import { ConsentSettings } from './components/ConsentSettings';

<Route path="/privacy" element={<ConsentSettings />} />
```

**SDK Hooks Used:**
- `useConsentTypes()` - Fetches available consent types
- `useMyConsents()` - Gets user's current consents
- `useGrantConsent()` - Grants single consent
- `useRevokeConsent()` - Revokes single consent

### DataSubjectRequestForm (apps/web, apps/minside)

Form for submitting GDPR data subject requests.

**Location:** `apps/web/src/components/DataSubjectRequestForm.tsx`

**Features:**
- 6 request types supported:
  - **Access** - Right to access personal data
  - **Erasure** - Right to be forgotten
  - **Portability** - Data portability
  - **Rectification** - Right to correct data
  - **Restriction** - Restrict processing
  - **Objection** - Object to processing
- Request history table with status tracking
- Description field for additional details
- Status indicators (pending, in_progress, completed, rejected)
- Real-time updates

**Usage:**
```tsx
import { DataSubjectRequestForm } from './components/DataSubjectRequestForm';

<Route path="/privacy/data-requests" element={<DataSubjectRequestForm />} />
```

**SDK Hooks Used:**
- `useCreateDataRequest()` - Submit new request
- `useMyDataRequests()` - View request history

### GDPRManagementPage (apps/backoffice)

Admin dashboard for managing GDPR requests.

**Location:** `apps/backoffice/src/routes/gdpr/index.tsx`

**Features:**
- List of all pending/in-progress requests
- 30-day deadline tracking with color-coded warnings
- Status update functionality
- Admin notes field
- User details display
- Request type filtering
- Deadline countdown display

**Status Colors:**
- Red: < 7 days remaining
- Yellow: 7-14 days remaining
- Green: > 14 days remaining

**Usage:**
```tsx
// In routes
import { GDPRManagementPage } from './routes/gdpr';

<Route path="/gdpr" element={<GDPRManagementPage />} />
```

**SDK Hooks Used:**
- `usePendingDataRequests()` - Fetches pending requests
- `useUpdateDataRequestStatus()` - Updates request status

## SDK Integration

### gdprService

Located at: `packages/client-sdk/src/services/gdprService.ts`

**Methods:**

```typescript
// Consent management
getConsentTypes(): Promise<ConsentType[]>
getMyConsents(): Promise<UserConsent[]>
grantConsent(consentTypeId: string): Promise<void>
grantMultipleConsents(consentTypeIds: string[]): Promise<void>
revokeConsent(consentTypeId: string): Promise<void>
getConsentHistory(): Promise<ConsentAuditLog[]>

// Data subject requests
createDataRequest(type: RequestType, description?: string): Promise<DataSubjectRequest>
getMyDataRequests(): Promise<DataSubjectRequest[]>
getAllDataRequests(): Promise<DataSubjectRequest[]>
getPendingDataRequests(): Promise<DataSubjectRequest[]>
updateDataRequestStatus(requestId: string, status: RequestStatus, adminNotes?: string): Promise<void>
```

### React Query Hooks

Located at: `packages/client-sdk/src/hooks/gdpr.ts`

```typescript
// Consent hooks
useConsentTypes()
useMyConsents()
useGrantConsent()
useGrantMultipleConsents()
useRevokeConsent()
useConsentHistory()

// Data request hooks
useCreateDataRequest()
useMyDataRequests()
useAllDataRequests()
usePendingDataRequests()
useUpdateDataRequestStatus()

// Utility hooks
useShowConsentPopup()
usePendingRequiredConsents()
```

## Internationalization

Full translations provided in both Norwegian (nb) and English (en).

### Translation Keys

**Consent Popup:**
```
gdpr.consentPopup.title
gdpr.consentPopup.description
gdpr.consentPopup.required
gdpr.consentPopup.optional
gdpr.consentPopup.accept
```

**Consent Settings:**
```
gdpr.consentSettings.title
gdpr.consentSettings.description
gdpr.consentSettings.required
gdpr.consentSettings.optional
gdpr.consentSettings.legalBasis
gdpr.consentSettings.granted
gdpr.consentSettings.notGranted
gdpr.consentSettings.versionMismatch
```

**Data Requests:**
```
gdpr.dataRequest.title
gdpr.dataRequest.types.access
gdpr.dataRequest.types.erasure
gdpr.dataRequest.types.portability
gdpr.dataRequest.types.rectification
gdpr.dataRequest.types.restriction
gdpr.dataRequest.types.objection
gdpr.dataRequest.submit
gdpr.dataRequest.status.pending
gdpr.dataRequest.status.in_progress
gdpr.dataRequest.status.completed
gdpr.dataRequest.status.rejected
```

**Admin:**
```
gdpr.admin.title
gdpr.admin.deadlineWarning
gdpr.admin.updateStatus
gdpr.admin.adminNotes
```

## Notification Integration

GDPR system integrates with the notification system to send automatic updates:

### Notification Templates

Two GDPR-specific templates are seeded:

1. **gdpr_request_received**
   - Sent when user submits a data subject request
   - Channels: in-app, email
   - Variables: requestType, requestId, receivedDate

2. **gdpr_request_completed**
   - Sent when admin completes a data subject request
   - Channels: in-app, email
   - Variables: requestType, requestId, completedDate, completionNotes

### Automatic Triggers

```typescript
// When user submits request
await notificationService.notify(
  tenantId,
  user,
  'gdpr_request_received',
  { requestType, requestId, receivedDate },
  { channels: ['in_app', 'email'] }
);

// When admin completes request
await notificationService.notify(
  tenantId,
  user,
  'gdpr_request_completed',
  { requestType, requestId, completedDate, completionNotes },
  { channels: ['in_app', 'email'] }
);
```

## Compliance Features

### Article 30 Records (GDPR Art. 30)

The `data_processing_records` table maintains required processing records:

- Purpose of processing
- Categories of data subjects
- Categories of personal data
- Categories of recipients
- International transfers
- Retention periods
- Security measures

### 30-Day Response Deadline (GDPR Art. 12.3)

- Automatic deadline calculation (30 days from submission)
- Visual deadline warnings in admin dashboard
- Status tracking to ensure timely responses

### Consent Versioning

- Version field on consent_types
- Detects when consent definitions change
- Prompts users to re-consent when needed

### Audit Trail

All consent changes logged in `consent_audit_log`:
- User who made the change
- Action performed (grant/revoke)
- Timestamp
- IP address
- User agent
- Previous and new values (JSON)

## Deployment

### Database Migration

Migration file: `apps/api/drizzle/0004_gdpr_consent_system.sql`

```bash
# Run migration
cd apps/api
psql -d your_database -f drizzle/0004_gdpr_consent_system.sql
```

### Environment Variables

No additional environment variables required. GDPR system uses existing database connection.

### Route Registration

GDPR controller uses custom registration in main.ts:

```typescript
// apps/api/src/main.ts
const gdprController = container.resolve('GdprController') as GdprController;
await gdprController.register(app);
console.log('✓ GDPR routes registered');
```

## Testing

### End-to-End Test Checklist

**Consent Management:**
- [ ] New user sees consent popup
- [ ] Cannot dismiss popup without accepting required consents
- [ ] Optional consents can be skipped
- [ ] Consent settings page shows all consent types
- [ ] Can grant individual consents
- [ ] Can revoke non-required consents
- [ ] Cannot revoke required consents
- [ ] Version mismatch warning appears when consent definition changes

**Data Subject Requests:**
- [ ] Can submit access request
- [ ] Can submit erasure request
- [ ] Can submit portability request
- [ ] Can submit rectification request
- [ ] Can submit restriction request
- [ ] Can submit objection request
- [ ] Request appears in user's request history
- [ ] Admin sees request in backoffice
- [ ] Admin can update request status
- [ ] User receives notification when request status changes

**Notifications:**
- [ ] User receives "request received" notification
- [ ] User receives "request completed" notification
- [ ] Notifications appear in-app
- [ ] Notifications sent via email

## Security Considerations

- All endpoints require authentication
- Admin endpoints require admin role
- Tenant isolation enforced on all queries
- Consent audit logs never deleted (append-only)
- IP address and user agent logged for compliance
- Cannot revoke required consents
- Request history visible only to user and admins

## Best Practices

1. **Regular Consent Reviews** - Periodically review consent types and update versions
2. **Timely Response** - Monitor pending requests and respond within 30 days
3. **Clear Communication** - Use admin notes to explain request outcomes
4. **Data Minimization** - Only collect necessary consents
5. **Audit Trail Preservation** - Never delete consent audit logs
6. **User Education** - Provide clear descriptions for each consent type

## Monitoring

Check GDPR system health:

```sql
-- Overdue requests (> 30 days)
SELECT * FROM data_subject_requests
WHERE status IN ('pending', 'in_progress')
AND deadline < NOW();

-- Consent compliance rate
SELECT
  ct.code,
  COUNT(*) FILTER (WHERE uc.granted_at IS NOT NULL) * 100.0 / COUNT(*) as compliance_rate
FROM consent_types ct
LEFT JOIN user_consents uc ON ct.id = uc.consent_type_id
WHERE ct.required = true
GROUP BY ct.code;

-- Recent consent changes
SELECT action, COUNT(*)
FROM consent_audit_log
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY action;
```

## References

- GDPR Official Text: https://gdpr-info.eu/
- Article 30 (Records of Processing): https://gdpr-info.eu/art-30-gdpr/
- Article 12.3 (Response Deadline): https://gdpr-info.eu/art-12-gdpr/
- Data Subject Rights (Articles 15-21): https://gdpr-info.eu/chapter-3/
