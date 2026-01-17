# PRIORITY 2: Real-Time Notification System

**Date:** 2026-01-17
**Status:** 🟡 READY TO START
**Priority Level:** P1 (High)
**Estimated Duration:** 2 weeks (80 hours)

---

## Executive Summary

**Goal:** Complete the notification system with real-time WebSocket delivery, toast notifications, notification center, and multi-channel support (in-app, email, SMS).

**Current State:**
- ✅ Backend notification service exists
- ✅ WebSocket server configured
- ⚠️ Frontend toast notifications partially implemented
- ⚠️ Notification center needs real-time updates
- ❌ Email/SMS integration not complete

**Target State:**
- ✅ Real-time toast notifications working
- ✅ Notification center with live updates
- ✅ Email/SMS notifications integrated
- ✅ User notification preferences
- ✅ E2E tests for all notification flows

---

## Table of Contents

1. [Scope & Requirements](#scope--requirements)
2. [Current Implementation Assessment](#current-implementation-assessment)
3. [Phase-by-Phase Plan](#phase-by-phase-plan)
4. [Agent Assignments](#agent-assignments)
5. [Technical Specifications](#technical-specifications)
6. [Success Criteria](#success-criteria)
7. [Timeline & Milestones](#timeline--milestones)

---

## Scope & Requirements

### From PRD (Section 8.2)

**Notifications & Messaging:**
- Real-time via WebSockets
- Configurable per tenant
- Supports:
  - System notifications
  - Booking messages
  - Admin communications

### From Roadmap (Level 0.4)

**Acceptance Criteria:**
- [x] Booking created → notification *(backend exists)*
- [x] Booking approved → notification *(backend exists)*
- [x] Booking rejected → notification *(backend exists)*
- [x] Booking cancelled → notification *(backend exists)*
- [ ] User can view notification list *(needs real-time updates)*
- [ ] Mark notification as read *(needs implementation)*
- [ ] At least in-app notifications work *(needs toast UI)*
- [ ] Real-time updates (WebSocket) *(needs frontend integration)*

### Additional Requirements

**Multi-Channel Support:**
- [ ] In-app notifications (toast + notification center)
- [ ] Email notifications (via SendGrid/similar)
- [ ] SMS notifications (via Twilio/similar) *(optional for Level 1)*
- [ ] Push notifications *(future - Level 2)*

**User Preferences:**
- [ ] User can configure notification preferences
- [ ] Per-channel settings (in-app, email, SMS)
- [ ] Per-notification-type settings (booking, system, admin)
- [ ] Quiet hours / do not disturb

**Performance:**
- [ ] Real-time delivery (<1 second latency)
- [ ] Graceful degradation if WebSocket fails
- [ ] Batch notifications for bulk operations
- [ ] Rate limiting per user

---

## Current Implementation Assessment

### Backend ✅ (Mostly Complete)

**Verified Components:**
- ✅ `apps/api/src/modules/notifications/` - Notification service exists
- ✅ WebSocket server configured (from Phase 2 report)
- ✅ Database schema: `domain.notifications` table
- ✅ Notification triggers on booking lifecycle events
- ✅ `notificationService.create()` working

**Gaps:**
- ⚠️ Email/SMS integration incomplete
- ⚠️ Notification preferences not implemented
- ⚠️ Batch notification handling
- ⚠️ Rate limiting

### SDK ✅ (Mostly Complete)

**Verified Components:**
- ✅ `@digilist/client-sdk/services/notificationService` exists
- ✅ `useNotifications()` hook exists
- ✅ Realtime client exists (WebSocket wrapper)

**Gaps:**
- ⚠️ Missing `markAsRead()` method
- ⚠️ Missing `getUnreadCount()` method
- ⚠️ Missing notification preferences methods
- ⚠️ WebSocket reconnection logic needs testing

### Frontend ⚠️ (Partially Complete)

**Verified Components:**
- ✅ Notification bell component exists (from Phase 4)
- ✅ `data-testid="notification-bell"` added
- ✅ `data-testid="notification-badge"` added
- ✅ Basic notification center route exists

**Gaps:**
- ❌ Toast notification UI not implemented
- ❌ Real-time WebSocket integration not connected
- ❌ Notification center doesn't update in real-time
- ❌ Mark as read functionality missing
- ❌ Notification preferences UI missing

---

## Phase-by-Phase Plan

### Phase 1: Backend Enhancement (16 hours)

**Goal:** Complete backend notification system with email/SMS support and preferences.

**Tasks:**

1. **Notification Preferences API** (4h)
   - Create `notification_preferences` table migration
   - Implement `NotificationPreferencesController`
   - Add endpoints:
     - `GET /api/notifications/preferences` - Get user preferences
     - `PUT /api/notifications/preferences` - Update preferences
   - Add Zod schemas for validation

2. **Email Integration** (6h)
   - Install SendGrid SDK (or similar)
   - Create `EmailService` in `apps/api/src/modules/notifications/email.service.ts`
   - Create email templates (Handlebars or Mustache)
     - Booking created template
     - Booking approved template
     - Booking rejected template
     - Booking cancelled template
   - Implement email queue (BullMQ or similar)
   - Add environment variables for SendGrid API key

3. **SMS Integration** (4h) *(Optional for Level 1)*
   - Install Twilio SDK (or similar)
   - Create `SmsService` in `apps/api/src/modules/notifications/sms.service.ts`
   - Implement SMS templates
   - Add environment variables for Twilio credentials

4. **Notification Enhancement** (2h)
   - Add `markAsRead` method to notification service
   - Add `getUnreadCount` method
   - Add batch notification support
   - Implement rate limiting (max 10 notifications/minute per user)

**Agent:** api-backend-expert

**Deliverables:**
- Migration file for notification preferences
- Email service with templates
- SMS service (optional)
- Enhanced notification endpoints
- Unit tests

---

### Phase 2: SDK Enhancement (8 hours)

**Goal:** Add missing SDK methods and improve WebSocket reliability.

**Tasks:**

1. **Notification Service Methods** (2h)
   - Add `markAsRead(notificationId: string)` method
   - Add `markAllAsRead()` method
   - Add `getUnreadCount()` method
   - Add `getPreferences()` method
   - Add `updatePreferences(preferences)` method

2. **WebSocket Reliability** (3h)
   - Implement automatic reconnection with exponential backoff
   - Add connection status tracking
   - Add heartbeat/ping mechanism
   - Handle token refresh on reconnection
   - Add error handling and logging

3. **React Query Hooks** (3h)
   - Create `useMarkAsRead()` mutation hook
   - Create `useUnreadCount()` query hook
   - Create `useNotificationPreferences()` query hook
   - Create `useUpdateNotificationPreferences()` mutation hook
   - Add optimistic updates for mark as read

**Agent:** client-sdk-expert

**Deliverables:**
- Enhanced notification service
- Improved WebSocket client
- New React Query hooks
- TypeScript types
- Unit tests

---

### Phase 3: Toast Notification System (12 hours)

**Goal:** Implement real-time toast notifications in all apps.

**Tasks:**

1. **Toast Component** (4h)
   - Create `ToastNotification` component in `@xala/ds`
   - Use Designsystemet `Alert` component as base
   - Support notification types: success, info, warning, error
   - Add auto-dismiss with configurable timeout
   - Add close button
   - Add sound effects (optional)
   - Make it accessible (ARIA, keyboard navigation)

2. **Toast Provider** (3h)
   - Create `NotificationToastProvider` in SDK or app-level
   - Manage toast queue (max 3 visible at once)
   - Stack toasts vertically
   - Auto-dismiss after 5 seconds
   - Position: top-right or bottom-right (configurable)

3. **WebSocket Integration** (3h)
   - Connect WebSocket to toast system
   - Listen for notification events
   - Display toast on notification received
   - Include notification content (title, message, type)
   - Add click-to-navigate functionality

4. **Integration in Apps** (2h)
   - Add `NotificationToastProvider` to `apps/minside/src/main.tsx`
   - Add `NotificationToastProvider` to `apps/backoffice/src/main.tsx`
   - Test toast display on booking approval
   - Add data-testid attributes for E2E tests

**Agent:** frontend-developer

**Deliverables:**
- `ToastNotification` component
- `NotificationToastProvider`
- WebSocket integration
- Integration in both apps
- Storybook stories

---

### Phase 4: Notification Center Enhancement (8 hours)

**Goal:** Add real-time updates and mark as read functionality to notification center.

**Tasks:**

1. **Real-Time Updates** (3h)
   - Connect WebSocket to notification center
   - Auto-refresh notification list on new notifications
   - Update unread count badge in real-time
   - Add visual indicator for new notifications (animation)

2. **Mark as Read** (2h)
   - Add "Mark as read" button to each notification
   - Add "Mark all as read" button
   - Update UI optimistically
   - Invalidate React Query cache on success

3. **Notification Types** (2h)
   - Add icons for different notification types
   - Add colors for notification severity
   - Add "View booking" action button
   - Format timestamps (relative time: "5 minutes ago")

4. **Empty States & Loading** (1h)
   - Add empty state for no notifications
   - Add loading skeleton
   - Add error state with retry button

**Agent:** frontend-developer

**Deliverables:**
- Enhanced notification center
- Real-time WebSocket integration
- Mark as read functionality
- Improved UX

---

### Phase 5: Notification Preferences UI (8 hours)

**Goal:** Allow users to configure notification preferences.

**Tasks:**

1. **Preferences Page** (4h)
   - Create `/settings/notifications` route
   - Create `NotificationPreferences` component
   - Add sections:
     - In-app notifications (toggle)
     - Email notifications (toggle)
     - SMS notifications (toggle) *(if implemented)*
   - Add per-type toggles:
     - Booking created
     - Booking approved
     - Booking rejected
     - Booking cancelled
     - System notifications
     - Admin messages

2. **Form Implementation** (3h)
   - Use React Hook Form for form management
   - Add Zod validation
   - Connect to SDK hooks
   - Add optimistic updates
   - Show success/error messages

3. **UX Polish** (1h)
   - Add help text for each setting
   - Add "Restore defaults" button
   - Add confirmation dialog for destructive actions
   - Make it mobile-responsive

**Agent:** frontend-developer

**Deliverables:**
- Notification preferences page
- Form with validation
- Integration with backend

---

### Phase 6: E2E Testing (8 hours)

**Goal:** Comprehensive E2E tests for all notification flows.

**Tasks:**

1. **Toast Notification Tests** (3h)
   - Test: User receives toast on booking approval
   - Test: Toast auto-dismisses after 5 seconds
   - Test: User can manually close toast
   - Test: Multiple toasts stack correctly
   - Test: Click toast navigates to booking

2. **Notification Center Tests** (3h)
   - Test: Notification center shows all notifications
   - Test: Mark as read updates UI
   - Test: Mark all as read works
   - Test: Unread count updates in real-time
   - Test: Click notification navigates to booking

3. **Preferences Tests** (2h)
   - Test: User can update notification preferences
   - Test: Preferences persist across sessions
   - Test: Disabling in-app stops toast notifications
   - Test: Disabling email stops email delivery

**Agent:** testing-expert

**Deliverables:**
- 10+ E2E tests
- Updated Page Objects
- Test fixtures
- Test report

---

### Phase 7: Email Templates & Testing (6 hours)

**Goal:** Create professional email templates and test email delivery.

**Tasks:**

1. **Email Template Design** (3h)
   - Design responsive HTML email templates
   - Use Designsystemet colors/typography
   - Create templates for:
     - Booking created
     - Booking approved
     - Booking rejected
     - Booking cancelled
   - Add CTA buttons (View Booking, Contact Admin)
   - Test in major email clients

2. **Email Testing** (2h)
   - Create test script for email delivery
   - Test SendGrid integration
   - Test template rendering
   - Test localization (Norwegian/English)

3. **Documentation** (1h)
   - Document email setup
   - Document template customization
   - Add troubleshooting guide

**Agent:** fullstack-expert

**Deliverables:**
- 4+ email templates
- Email delivery tests
- Documentation

---

### Phase 8: Integration Testing & Polish (6 hours)

**Goal:** End-to-end integration testing and final polish.

**Tasks:**

1. **Full Flow Testing** (3h)
   - Test complete notification flow:
     - User creates booking → pending notification
     - Admin approves → approval notification (toast + email)
     - User sees toast in real-time
     - User sees notification in notification center
     - User marks as read
     - User checks email

2. **Performance Testing** (2h)
   - Test WebSocket under load (100 concurrent users)
   - Test notification delivery latency
   - Test batch notifications (10+ bookings approved at once)
   - Verify rate limiting works

3. **Final Polish** (1h)
   - Fix any UI bugs
   - Improve error messages
   - Add loading states
   - Accessibility audit

**Agent:** fullstack-expert + testing-expert

**Deliverables:**
- Integration test report
- Performance benchmarks
- Bug fixes

---

## Agent Assignments

| Phase | Agent | Duration | Dependencies |
|-------|-------|----------|--------------|
| Phase 1 | api-backend-expert | 16h | None |
| Phase 2 | client-sdk-expert | 8h | Phase 1 |
| Phase 3 | frontend-developer | 12h | Phase 2 |
| Phase 4 | frontend-developer | 8h | Phase 3 |
| Phase 5 | frontend-developer | 8h | Phase 2 |
| Phase 6 | testing-expert | 8h | Phase 3, 4, 5 |
| Phase 7 | fullstack-expert | 6h | Phase 1 |
| Phase 8 | fullstack-expert + testing-expert | 6h | All |

**Parallelization Opportunities:**
- Phase 3, 4, 5 can run in parallel after Phase 2
- Phase 6, 7 can run in parallel after Phase 5

**Critical Path:** Phase 1 → Phase 2 → Phase 3 → Phase 6 → Phase 8

---

## Technical Specifications

### Database Schema

```sql
-- apps/api/drizzle/0032_notification_preferences.sql
CREATE TABLE domain.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform.users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES platform.tenants(id) ON DELETE CASCADE,

  -- Channel preferences
  in_app_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  email_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  sms_enabled BOOLEAN NOT NULL DEFAULT FALSE,

  -- Notification type preferences
  booking_created BOOLEAN NOT NULL DEFAULT TRUE,
  booking_approved BOOLEAN NOT NULL DEFAULT TRUE,
  booking_rejected BOOLEAN NOT NULL DEFAULT TRUE,
  booking_cancelled BOOLEAN NOT NULL DEFAULT TRUE,
  system_notifications BOOLEAN NOT NULL DEFAULT TRUE,
  admin_messages BOOLEAN NOT NULL DEFAULT TRUE,

  -- Advanced settings
  quiet_hours_start TIME,
  quiet_hours_end TIME,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(user_id, tenant_id)
);

CREATE INDEX idx_notification_preferences_user ON domain.notification_preferences(user_id);
```

### API Endpoints

**Notification Preferences:**
```typescript
GET    /api/notifications/preferences
PUT    /api/notifications/preferences
POST   /api/notifications/:id/read
POST   /api/notifications/read-all
GET    /api/notifications/unread-count
```

### SDK Methods

```typescript
// Notification Service
notificationService.markAsRead(id: string): Promise<void>
notificationService.markAllAsRead(): Promise<void>
notificationService.getUnreadCount(): Promise<number>
notificationService.getPreferences(): Promise<NotificationPreferences>
notificationService.updatePreferences(prefs: Partial<NotificationPreferences>): Promise<void>

// React Query Hooks
useMarkAsRead(): UseMutationResult
useMarkAllAsRead(): UseMutationResult
useUnreadCount(): UseQueryResult<number>
useNotificationPreferences(): UseQueryResult<NotificationPreferences>
useUpdateNotificationPreferences(): UseMutationResult
```

### WebSocket Events

```typescript
// Server → Client
{
  type: 'notification',
  data: {
    id: string,
    type: 'booking.approved' | 'booking.rejected' | 'booking.created' | 'booking.cancelled',
    title: string,
    message: string,
    bookingId: string,
    createdAt: string,
  }
}

// Client → Server (heartbeat)
{
  type: 'ping',
  timestamp: number
}

// Server → Client (heartbeat response)
{
  type: 'pong',
  timestamp: number
}
```

### Toast Component API

```typescript
interface ToastProps {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
  duration?: number; // Auto-dismiss timeout (ms)
  onClose?: () => void;
  onClick?: () => void;
  icon?: React.ReactNode;
}
```

---

## Success Criteria

### Functional Requirements

- [ ] User receives toast notification within 1 second of booking approval
- [ ] Toast notifications display correctly on all screen sizes
- [ ] Notification center updates in real-time without refresh
- [ ] User can mark individual notifications as read
- [ ] User can mark all notifications as read
- [ ] Unread count badge updates in real-time
- [ ] User can configure notification preferences
- [ ] Email notifications delivered within 5 seconds
- [ ] Email templates render correctly in major email clients
- [ ] SMS notifications work (if implemented)

### Non-Functional Requirements

- [ ] WebSocket reconnects automatically on disconnect
- [ ] Notification delivery latency < 1 second (p95)
- [ ] System handles 100+ concurrent WebSocket connections
- [ ] Rate limiting prevents spam (max 10 notifications/minute per user)
- [ ] All notification features work with JavaScript disabled (graceful degradation)
- [ ] WCAG 2.1 AA compliant (keyboard navigation, screen readers)
- [ ] i18n support (Norwegian and English)

### Testing Requirements

- [ ] 10+ E2E tests passing (100% pass rate)
- [ ] 0% test flakiness
- [ ] Unit test coverage > 80%
- [ ] Integration tests for WebSocket flows
- [ ] Email delivery tests
- [ ] Performance benchmarks documented

### Documentation Requirements

- [ ] API documentation updated
- [ ] SDK documentation updated
- [ ] Email template customization guide
- [ ] Troubleshooting guide
- [ ] Architecture decision records (ADRs)

---

## Timeline & Milestones

### Week 1 (40 hours)

**Milestone 1: Backend & SDK Complete**
- ✅ Day 1-2: Phase 1 - Backend Enhancement (16h)
- ✅ Day 3: Phase 2 - SDK Enhancement (8h)
- ✅ Day 4-5: Phase 3 - Toast Notification System (12h)
- ⏳ Remaining: 4h buffer

**Deliverables:**
- Working backend with email integration
- Enhanced SDK with all methods
- Toast notification UI functional

### Week 2 (40 hours)

**Milestone 2: Frontend Complete & Tested**
- ✅ Day 6-7: Phase 4 - Notification Center Enhancement (8h)
- ✅ Day 8-9: Phase 5 - Notification Preferences UI (8h)
- ✅ Day 10: Phase 6 - E2E Testing (8h)
- ✅ Day 10: Phase 7 - Email Templates (6h, parallel with Phase 6)
- ✅ Day 11: Phase 8 - Integration Testing (6h)
- ⏳ Remaining: 4h buffer

**Deliverables:**
- Complete notification system
- All E2E tests passing
- Email templates ready
- Performance benchmarks
- Documentation complete

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| WebSocket scalability issues | Medium | High | Load testing early, implement connection pooling |
| Email delivery delays | Medium | Medium | Use email queue, monitor SendGrid status |
| Toast notification UI conflicts | Low | Medium | Use z-index management, test with existing UI |
| Missing Sentry dependency | High | Low | Install @sentry/react first (already identified) |
| Database migration conflicts | Low | High | Test migrations on staging first |

---

## Dependencies & Prerequisites

### External Services

**Required:**
- SendGrid account (for email notifications)
- Environment variables:
  ```bash
  SENDGRID_API_KEY=xxx
  SENDGRID_FROM_EMAIL=noreply@digilist.no
  SENDGRID_FROM_NAME="Digilist Notification"
  ```

**Optional:**
- Twilio account (for SMS notifications)
- Environment variables:
  ```bash
  TWILIO_ACCOUNT_SID=xxx
  TWILIO_AUTH_TOKEN=xxx
  TWILIO_PHONE_NUMBER=+47xxxxxxxx
  ```

### Package Dependencies

**To Install:**
```bash
# Backend
pnpm add @sendgrid/mail
pnpm add twilio  # optional

# Frontend
pnpm add react-hot-toast  # or similar, if not using custom

# Monitoring (fix existing issue)
pnpm add @sentry/react
```

### Infrastructure

- PostgreSQL database (already configured)
- WebSocket server (already configured)
- Redis (optional, for caching/queue)

---

## Monitoring & Observability

### Metrics to Track

1. **Notification Delivery:**
   - Time from trigger to delivery (p50, p95, p99)
   - Success rate (in-app, email, SMS)
   - Failure reasons

2. **WebSocket Performance:**
   - Active connections
   - Reconnection rate
   - Message delivery latency

3. **User Engagement:**
   - Notification open rate
   - Mark as read rate
   - Preferences update frequency

### Logging

**Required Log Events:**
- Notification created
- Notification sent (per channel)
- Notification delivered
- Notification read
- WebSocket connection established/dropped
- Email sent/failed
- SMS sent/failed

---

## Acceptance & Sign-Off

**Definition of Done:**
- [ ] All phases complete
- [ ] All E2E tests passing (100%)
- [ ] Code reviewed by senior-architect
- [ ] Security reviewed by security-gdpr-expert
- [ ] Documentation complete
- [ ] Performance benchmarks meet requirements
- [ ] User acceptance testing passed

**Sign-Off Criteria:**
- [ ] Product Owner approval
- [ ] Architecture review: > 85/100
- [ ] Security review: > 80% confidence
- [ ] Test coverage: > 80%
- [ ] Zero critical bugs

---

## Next Steps After Priority 2

**Priority 3: Calendar & Blocking** (Level 1.1)
- Admin can block time slots for maintenance
- Recurring blocks
- Block overrides bookings
- Estimated: 1.5 weeks (60 hours)

---

**Document Version:** 1.0.0
**Last Updated:** 2026-01-17
**Status:** 🟡 READY TO START
