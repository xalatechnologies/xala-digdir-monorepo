# E2E Test Specification: Canonical Booking Approval Flow

**Test ID:** E2E-CANON-001
**Priority:** P0 (Critical)
**Created:** 2026-01-17
**Status:** NOT IMPLEMENTED
**Epic:** Level 0 Validation

---

## TEST OBJECTIVE

Validate the end-to-end canonical flow: **"User books → Admin approves → User sees notification"**

This test ensures the complete booking lifecycle works across multiple applications with proper data flow, RBAC enforcement, audit logging, and real-time notifications.

---

## SYSTEM COMPONENTS VERIFIED

| Component | Location | Status |
|-----------|----------|--------|
| Booking Creation API | `apps/api/src/modules/booking/booking.controller.ts` | ✓ EXISTS |
| Booking Approval API | `POST /api/bookings/:id/approve` | ✓ EXISTS |
| Notification API | `apps/api/src/modules/notifications/` | ✓ EXISTS |
| Backoffice Approval UI | `apps/backoffice/src/routes/bookings/` | ✓ EXISTS |
| Minside Booking List | `apps/minside/src/routes/bookings.tsx` | ✓ EXISTS |
| Notification Center | `apps/minside/src/routes/notifications.tsx` | ✓ EXISTS |
| SDK Booking Service | `packages/client-sdk/src/services/booking.service.ts` | ✓ EXISTS |
| SDK Hooks | `useApproveBooking()`, `useBookings()` | ✓ EXISTS |
| Authentication | BankID + Demo Login | ✓ EXISTS |
| WebSocket Server | Real-time events | ✓ EXISTS |
| Audit Logging | `compliance.audit_logs` | ✓ EXISTS |

---

## ACTORS & PERMISSIONS

### User: Regular User (Booking Creator)
- **Role:** `user` (standard user)
- **Capabilities:** `['booking:create']`
- **Email:** `user@test.com` (demo login)
- **Tenant:** `test-kommune-1`
- **Permissions:**
  - ✓ Can create bookings
  - ✓ Can view own bookings
  - ✓ Can cancel own bookings
  - ✗ Cannot approve bookings
  - ✗ Cannot deny bookings

### Admin: Booking Approver
- **Role:** `admin` (commune admin)
- **Capabilities:** `['booking:create', 'booking:approve', 'booking:deny', 'booking:read']`
- **Email:** `admin@test.com` (demo login)
- **Tenant:** `test-kommune-1`
- **Permissions:**
  - ✓ Can create bookings
  - ✓ Can view all bookings in tenant
  - ✓ Can approve pending bookings
  - ✓ Can deny pending bookings
  - ✓ Can cancel any booking

---

## PRE-CONDITIONS

### Test Data Requirements

1. **Rental Object (Listing)**
   ```json
   {
     "id": "rental-obj-meeting-room-1",
     "title": "Møterom A (Meeting Room A)",
     "status": "published",
     "requiresApproval": true,
     "tenantId": "test-kommune-1",
     "availabilityRules": {
       "bufferMinutes": 15,
       "minBookingDuration": 60,
       "maxBookingDuration": 480
     }
   }
   ```

2. **Available Time Slot**
   - Date: Tomorrow (dynamic calculation)
   - Start Time: 10:00
   - End Time: 12:00
   - Status: AVAILABLE (no conflicts, no blocks)

3. **Database State**
   - Clean slate: No pending bookings for test users
   - Notifications table: Empty for test users
   - Audit logs: Baseline established

### Environment Setup

```bash
# Applications running
- API: http://localhost:4000 (Fastify)
- Web: http://localhost:5173 (Public)
- Minside: http://localhost:5174 (User Portal)
- Backoffice: http://localhost:5175 (Admin Portal)

# Database: PostgreSQL with named schemas
- platform.users
- domain.bookings
- domain.rental_objects
- domain.notifications
- compliance.audit_logs

# Authentication: Demo login enabled
DEMO_LOGIN_ENABLED=true
```

---

## TEST FLOW: COMPLETE SCENARIO

### PHASE 1: User Creates Booking

**Actor:** Regular User
**Application:** Minside (User Portal)
**URL:** http://localhost:5174

#### Steps:

1. **Login as User**
   ```typescript
   await page.goto('http://localhost:5174/login');
   await page.fill('[data-testid="email"]', 'user@test.com');
   await page.fill('[data-testid="password"]', 'password123');
   await page.click('[data-testid="login-button"]');
   await expect(page).toHaveURL('http://localhost:5174/dashboard');
   ```

2. **Navigate to Booking Creation**
   ```typescript
   // Option A: From navigation menu
   await page.click('[data-testid="nav-bookings"]');
   await page.click('[data-testid="create-booking-button"]');

   // Option B: From rental object details
   await page.goto('http://localhost:5174/rental-objects');
   await page.click('[data-testid="rental-object-card-meeting-room-1"]');
   await page.click('[data-testid="book-button"]');
   ```

3. **Fill Booking Form**
   ```typescript
   // Select rental object (if not pre-selected)
   await page.selectOption('[data-testid="rental-object-select"]', 'rental-obj-meeting-room-1');

   // Set date (tomorrow)
   const tomorrow = new Date();
   tomorrow.setDate(tomorrow.getDate() + 1);
   const dateStr = tomorrow.toISOString().split('T')[0]; // YYYY-MM-DD
   await page.fill('[data-testid="booking-date"]', dateStr);

   // Set time range
   await page.fill('[data-testid="start-time"]', '10:00');
   await page.fill('[data-testid="end-time"]', '12:00');

   // Optional: Add title/notes
   await page.fill('[data-testid="booking-title"]', 'Team Meeting - Q1 Planning');
   await page.fill('[data-testid="booking-notes"]', 'Need projector and whiteboard');

   // Optional: Select purpose
   await page.selectOption('[data-testid="booking-purpose"]', 'internal_meeting');
   ```

4. **Verify Availability**
   ```typescript
   // System checks availability (buffer time, conflicts)
   await page.click('[data-testid="check-availability-button"]');

   // Wait for availability confirmation
   await expect(page.locator('[data-testid="availability-status"]')).toHaveText('Tilgjengelig (Available)');
   await expect(page.locator('[data-testid="availability-icon"]')).toHaveClass(/success/);
   ```

5. **Review Booking Summary**
   ```typescript
   // Click next/review button
   await page.click('[data-testid="next-button"]');

   // Verify summary page
   await expect(page).toHaveURL(/\/bookings\/new\/review/);
   await expect(page.locator('[data-testid="summary-title"]')).toContainText('Team Meeting - Q1 Planning');
   await expect(page.locator('[data-testid="summary-date"]')).toContainText(dateStr);
   await expect(page.locator('[data-testid="summary-time"]')).toContainText('10:00 - 12:00');
   await expect(page.locator('[data-testid="summary-rental-object"]')).toContainText('Møterom A');

   // Check pricing (if applicable)
   await expect(page.locator('[data-testid="summary-price"]')).toBeVisible();

   // Check approval notice
   await expect(page.locator('[data-testid="approval-notice"]')).toContainText('Requires approval');
   ```

6. **Submit Booking**
   ```typescript
   await page.click('[data-testid="submit-booking-button"]');

   // Wait for success redirect
   await page.waitForURL(/\/bookings\/[a-f0-9-]+/);

   // Capture booking ID from URL
   const url = page.url();
   const bookingId = url.match(/\/bookings\/([a-f0-9-]+)/)[1];

   // Verify success message
   await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
   await expect(page.locator('[data-testid="success-message"]')).toContainText('Booking opprettet (Booking created)');
   ```

7. **Verify Booking Details**
   ```typescript
   // Should be on booking details page
   await expect(page.locator('[data-testid="booking-title"]')).toContainText('Team Meeting - Q1 Planning');
   await expect(page.locator('[data-testid="booking-status"]')).toContainText('pending');
   await expect(page.locator('[data-testid="booking-status-badge"]')).toHaveClass(/warning/);

   // Check approval message
   await expect(page.locator('[data-testid="pending-approval-message"]')).toBeVisible();
   await expect(page.locator('[data-testid="pending-approval-message"]'))
     .toContainText('Venter på godkjenning (Awaiting approval)');

   // User should NOT see approve button
   await expect(page.locator('[data-testid="approve-button"]')).not.toBeVisible();

   // User SHOULD see cancel button
   await expect(page.locator('[data-testid="cancel-button"]')).toBeVisible();
   ```

8. **Store Booking ID for Later Phases**
   ```typescript
   // Save to test context
   testContext.bookingId = bookingId;
   testContext.bookingTitle = 'Team Meeting - Q1 Planning';
   ```

#### Expected Results (Phase 1):

- ✓ Booking created with status `pending`
- ✓ Booking visible in user's booking list
- ✓ Booking requires approval (approval notice shown)
- ✓ User cannot see approve button (RBAC enforced)
- ✓ User can cancel booking
- ✓ API audit log created:
  ```json
  {
    "action": "booking.created",
    "actorId": "user-test-1",
    "tenantId": "test-kommune-1",
    "resourceId": "<bookingId>",
    "severity": "info"
  }
  ```

---

### PHASE 2: Admin Sees Pending Booking

**Actor:** Admin
**Application:** Backoffice (Admin Portal)
**URL:** http://localhost:5175

#### Steps:

1. **Login as Admin (Separate Browser Context)**
   ```typescript
   const adminContext = await browser.newContext();
   const adminPage = await adminContext.newPage();

   await adminPage.goto('http://localhost:5175/login');
   await adminPage.fill('[data-testid="email"]', 'admin@test.com');
   await adminPage.fill('[data-testid="password"]', 'admin123');
   await adminPage.click('[data-testid="login-button"]');
   await expect(adminPage).toHaveURL('http://localhost:5175/dashboard');
   ```

2. **Navigate to Bookings Management**
   ```typescript
   await adminPage.click('[data-testid="nav-bookings"]');
   await expect(adminPage).toHaveURL('http://localhost:5175/bookings');

   // Verify page title
   await expect(adminPage.locator('h1')).toContainText('Bookings');
   ```

3. **Filter to Pending Bookings**
   ```typescript
   // Open filter drawer (mobile) or use filter bar (desktop)
   await adminPage.click('[data-testid="filter-status"]');
   await adminPage.click('[data-testid="status-pending"]');

   // Wait for filtered results
   await adminPage.waitForLoadState('networkidle');
   ```

4. **Find the New Booking**
   ```typescript
   // Search by booking title or ID
   await adminPage.fill('[data-testid="search-input"]', 'Team Meeting - Q1 Planning');
   await adminPage.waitForLoadState('networkidle');

   // Verify booking appears in list
   const bookingRow = adminPage.locator(`[data-testid="booking-row-${testContext.bookingId}"]`);
   await expect(bookingRow).toBeVisible();

   // Verify booking details in row
   await expect(bookingRow.locator('[data-testid="booking-title"]')).toContainText('Team Meeting - Q1 Planning');
   await expect(bookingRow.locator('[data-testid="booking-status"]')).toContainText('pending');
   await expect(bookingRow.locator('[data-testid="booking-user"]')).toContainText('user@test.com');
   ```

5. **Open Booking Details**
   ```typescript
   // Click on booking row to open details
   await bookingRow.click();

   // Verify details modal/page opened
   await expect(adminPage.locator('[data-testid="booking-details-modal"]')).toBeVisible();

   // OR navigate to details page
   await expect(adminPage).toHaveURL(`http://localhost:5175/bookings/${testContext.bookingId}`);
   ```

6. **Verify Booking Information**
   ```typescript
   // Verify all booking details visible
   await expect(adminPage.locator('[data-testid="booking-title"]')).toContainText('Team Meeting - Q1 Planning');
   await expect(adminPage.locator('[data-testid="booking-status"]')).toContainText('pending');
   await expect(adminPage.locator('[data-testid="booking-rental-object"]')).toContainText('Møterom A');
   await expect(adminPage.locator('[data-testid="booking-date"]')).toBeVisible();
   await expect(adminPage.locator('[data-testid="booking-time"]')).toContainText('10:00 - 12:00');
   await expect(adminPage.locator('[data-testid="booking-notes"]')).toContainText('Need projector and whiteboard');
   await expect(adminPage.locator('[data-testid="booking-user-info"]')).toContainText('user@test.com');

   // Admin SHOULD see approve and deny buttons
   await expect(adminPage.locator('[data-testid="approve-button"]')).toBeVisible();
   await expect(adminPage.locator('[data-testid="deny-button"]')).toBeVisible();
   ```

#### Expected Results (Phase 2):

- ✓ Admin can see all pending bookings
- ✓ Booking appears in filtered list
- ✓ Booking details are complete and accurate
- ✓ Admin sees approve and deny buttons (RBAC)
- ✓ Status badge shows "pending" with warning color
- ✓ User information visible (who created booking)

---

### PHASE 3: Admin Approves Booking

**Actor:** Admin
**Application:** Backoffice (Admin Portal)
**URL:** http://localhost:5175/bookings/:id

#### Steps:

1. **Click Approve Button**
   ```typescript
   await adminPage.click('[data-testid="approve-button"]');

   // Approval modal should open
   await expect(adminPage.locator('[data-testid="approve-modal"]')).toBeVisible();
   await expect(adminPage.locator('[data-testid="modal-title"]')).toContainText('Godkjenn booking (Approve booking)');
   ```

2. **Add Approval Reason (Optional)**
   ```typescript
   // Fill in approval notes
   await adminPage.fill('[data-testid="approval-reason"]', 'Møterom er ledig. Alt utstyr tilgjengelig. (Room available. All equipment ready.)');
   ```

3. **Confirm Approval**
   ```typescript
   // Click confirm button
   await adminPage.click('[data-testid="confirm-approve-button"]');

   // Wait for success feedback
   await expect(adminPage.locator('[data-testid="success-toast"]')).toBeVisible();
   await expect(adminPage.locator('[data-testid="success-toast"]'))
     .toContainText('Booking godkjent (Booking approved)');

   // Modal should close
   await expect(adminPage.locator('[data-testid="approve-modal"]')).not.toBeVisible();
   ```

4. **Verify Status Change**
   ```typescript
   // Wait for React Query to refetch
   await adminPage.waitForTimeout(1000); // Allow time for invalidation

   // Status should now be "approved"
   await expect(adminPage.locator('[data-testid="booking-status"]')).toContainText('approved');
   await expect(adminPage.locator('[data-testid="booking-status-badge"]')).toHaveClass(/success/);

   // Approval metadata should be visible
   await expect(adminPage.locator('[data-testid="approved-by"]')).toContainText('admin@test.com');
   await expect(adminPage.locator('[data-testid="approved-at"]')).toBeVisible();
   await expect(adminPage.locator('[data-testid="approval-reason"]'))
     .toContainText('Møterom er ledig. Alt utstyr tilgjengelig.');

   // Approve button should be disabled or hidden
   await expect(adminPage.locator('[data-testid="approve-button"]')).toBeDisabled();
   ```

5. **Verify Backend State**
   ```typescript
   // Make API call to verify database state (via SDK)
   const response = await fetch(`http://localhost:4000/api/bookings/${testContext.bookingId}`, {
     headers: { 'Cookie': adminPage.context().cookies() }
   });
   const booking = await response.json();

   expect(booking.status).toBe('approved');
   expect(booking.metadata.approvedBy).toBe('admin-test-1');
   expect(booking.metadata.approvalReason).toContain('Møterom er ledig');
   ```

6. **Verify Audit Log Created**
   ```typescript
   // Check audit log (via API or database query)
   const auditResponse = await fetch('http://localhost:4000/api/audit/logs?resourceId=' + testContext.bookingId);
   const auditLogs = await auditResponse.json();

   // Find approval audit entry
   const approvalLog = auditLogs.find(log => log.action === 'booking.approved');
   expect(approvalLog).toBeDefined();
   expect(approvalLog.actorId).toBe('admin-test-1');
   expect(approvalLog.tenantId).toBe('test-kommune-1');
   expect(approvalLog.severity).toBe('info');
   ```

#### Expected Results (Phase 3):

- ✓ Booking status changed to `approved`
- ✓ Approval metadata stored (approvedBy, approvedAt, approvalReason)
- ✓ Status badge updated to success color
- ✓ Approve button disabled/hidden after approval
- ✓ API audit log created:
  ```json
  {
    "action": "booking.approved",
    "actorId": "admin-test-1",
    "tenantId": "test-kommune-1",
    "resourceId": "<bookingId>",
    "severity": "info",
    "metadata": {
      "approvedBy": "admin@test.com",
      "approvalReason": "Møterom er ledig. Alt utstyr tilgjengelig."
    }
  }
  ```
- ✓ WebSocket event broadcasted:
  ```json
  {
    "type": "bookingEvent",
    "event": "approved",
    "tenantId": "test-kommune-1",
    "data": {
      "bookingId": "<bookingId>",
      "status": "approved"
    }
  }
  ```

---

### PHASE 4: User Sees Notification

**Actor:** Regular User
**Application:** Minside (User Portal)
**URL:** http://localhost:5174

#### Steps:

1. **Real-Time Notification Delivery (WebSocket)**
   ```typescript
   // User page should still be open from Phase 1
   // WebSocket connection should receive notification event

   // Check for notification bell badge update
   await expect(page.locator('[data-testid="notification-badge"]')).toBeVisible();
   await expect(page.locator('[data-testid="notification-badge"]')).toHaveText('1');

   // Check for toast notification (if implemented)
   await expect(page.locator('[data-testid="notification-toast"]')).toBeVisible({ timeout: 5000 });
   await expect(page.locator('[data-testid="notification-toast"]'))
     .toContainText('Booking godkjent (Booking approved)');
   await expect(page.locator('[data-testid="notification-toast"]'))
     .toContainText('Team Meeting - Q1 Planning');
   ```

2. **Navigate to Notification Center**
   ```typescript
   // Click notification bell
   await page.click('[data-testid="notification-bell"]');

   // Notification dropdown or navigation to /notifications
   await expect(page).toHaveURL('http://localhost:5174/notifications');

   // OR check dropdown menu
   await expect(page.locator('[data-testid="notification-dropdown"]')).toBeVisible();
   ```

3. **Verify Notification in List**
   ```typescript
   // Find notification for the approved booking
   const notification = page.locator('[data-testid^="notification-item-"]').filter({
     hasText: 'Team Meeting - Q1 Planning'
   });

   await expect(notification).toBeVisible();
   await expect(notification).toContainText('Booking godkjent');
   await expect(notification).toContainText('Team Meeting - Q1 Planning');
   await expect(notification.locator('[data-testid="notification-status"]')).toHaveText('unread');
   await expect(notification.locator('[data-testid="notification-type"]')).toHaveAttribute('data-type', 'booking_approved');
   ```

4. **Click Notification to View Details**
   ```typescript
   // Click notification
   await notification.click();

   // Should navigate to booking details
   await expect(page).toHaveURL(`http://localhost:5174/bookings/${testContext.bookingId}`);

   // Notification marked as read
   await expect(page.locator('[data-testid="notification-badge"]')).toHaveText('0');
   ```

5. **Verify Updated Booking Status**
   ```typescript
   // On booking details page
   await expect(page.locator('[data-testid="booking-title"]')).toContainText('Team Meeting - Q1 Planning');
   await expect(page.locator('[data-testid="booking-status"]')).toContainText('approved');
   await expect(page.locator('[data-testid="booking-status-badge"]')).toHaveClass(/success/);

   // Approval message should be visible
   await expect(page.locator('[data-testid="approval-message"]')).toBeVisible();
   await expect(page.locator('[data-testid="approval-message"]'))
     .toContainText('Din booking er godkjent (Your booking is approved)');

   // Check approval details
   await expect(page.locator('[data-testid="approved-by"]')).toContainText('admin@test.com');
   await expect(page.locator('[data-testid="approval-date"]')).toBeVisible();
   ```

6. **Alternative: Page Refresh (Without WebSocket)**
   ```typescript
   // If WebSocket is not working, user refreshes page
   await page.reload();
   await page.waitForLoadState('networkidle');

   // Status should still be updated (via API)
   await expect(page.locator('[data-testid="booking-status"]')).toContainText('approved');
   await expect(page.locator('[data-testid="notification-badge"]')).toHaveText('1');
   ```

#### Expected Results (Phase 4):

- ✓ User receives real-time notification (WebSocket)
- ✓ Notification bell badge increments (+1)
- ✓ Toast notification appears (optional)
- ✓ Notification appears in notification center
- ✓ Notification contains booking title and approval message
- ✓ Clicking notification navigates to booking details
- ✓ Booking status updated to "approved"
- ✓ Approval metadata visible to user
- ✓ Notification marked as read after viewing
- ✓ Notification stored in database:
  ```json
  {
    "id": "<notificationId>",
    "userId": "user-test-1",
    "tenantId": "test-kommune-1",
    "type": "booking_approved",
    "title": "Booking godkjent",
    "message": "Din booking 'Team Meeting - Q1 Planning' er godkjent av admin@test.com.",
    "relatedEntityType": "booking",
    "relatedEntityId": "<bookingId>",
    "status": "unread",
    "channels": ["in_app"],
    "createdAt": "2026-01-17T..."
  }
  ```

---

## POST-CONDITIONS

### Expected Database State After Test

1. **Booking Record**
   ```sql
   SELECT * FROM domain.bookings WHERE id = '<bookingId>';
   -- status: 'approved'
   -- metadata: { approvedBy, approvedAt, approvalReason }
   ```

2. **Audit Logs**
   ```sql
   SELECT * FROM compliance.audit_logs WHERE resource_id = '<bookingId>' ORDER BY created_at;
   -- Row 1: action='booking.created', actor='user-test-1'
   -- Row 2: action='booking.approved', actor='admin-test-1'
   ```

3. **Notification Record**
   ```sql
   SELECT * FROM domain.notifications WHERE user_id = 'user-test-1' AND related_entity_id = '<bookingId>';
   -- type: 'booking_approved'
   -- status: 'read' (after user viewed)
   ```

### Cleanup

```typescript
// Delete test booking
await fetch(`http://localhost:4000/api/bookings/${testContext.bookingId}`, {
  method: 'DELETE',
  headers: { 'Cookie': adminPage.context().cookies() }
});

// Delete test notifications
await fetch(`http://localhost:4000/api/notifications/${testContext.notificationId}`, {
  method: 'DELETE',
  headers: { 'Cookie': page.context().cookies() }
});
```

---

## VALIDATION CHECKPOINTS

### Functional Requirements

- [ ] User can create booking (anonymous or authenticated)
- [ ] Booking requires approval (status: pending)
- [ ] Admin can see pending bookings
- [ ] Admin can filter bookings by status
- [ ] Admin can approve booking with optional reason
- [ ] Booking status updates to approved
- [ ] User receives notification (real-time or on refresh)
- [ ] Notification appears in notification center
- [ ] User can view updated booking status
- [ ] Approval metadata visible to user

### Non-Functional Requirements

- [ ] RBAC enforced: User cannot approve booking
- [ ]RBAC enforced: Admin can approve any booking in tenant
- [ ] Multi-tenant isolation: User only sees own bookings
- [ ] Multi-tenant isolation: Admin only sees tenant bookings
- [ ] Audit logging: All actions logged
- [ ] WebSocket real-time updates (if available)
- [ ] API performance: All requests < 500ms
- [ ] UI responsive: Works on mobile and desktop
- [ ] i18n: All text localized (Norwegian primary, English secondary)
- [ ] Accessibility: WCAG 2.1 AA compliant

### Security Requirements

- [ ] Authentication required for all actions
- [ ] Cookie-based session (HTTP-only, secure)
- [ ] CSRF protection enabled
- [ ] SQL injection prevented (parameterized queries)
- [ ] XSS prevented (React auto-escaping)
- [ ] Sensitive data not exposed in logs

### Data Integrity

- [ ] Booking creation atomic (transaction)
- [ ] Approval update atomic (transaction)
- [ ] Notification delivery reliable (or queued)
- [ ] No duplicate bookings (conflict detection)
- [ ] No orphaned records after cleanup

---

## TEST IMPLEMENTATION CHECKLIST

### Phase 1: Setup Test Infrastructure

- [ ] Create `tests/e2e/scenarios/` directory
- [ ] Create `canonical-booking-approval-flow.spec.ts` file
- [ ] Add Playwright test configuration
- [ ] Create Page Objects:
  - [ ] `LoginPage.ts`
  - [ ] `BookingCreatePage.ts`
  - [ ] `BookingDetailsPage.ts`
  - [ ] `BookingListPage.ts` (Backoffice)
  - [ ] `NotificationCenterPage.ts`
- [ ] Create authentication fixtures:
  - [ ] `userAuthFixture.ts`
  - [ ] `adminAuthFixture.ts`
- [ ] Create test data fixtures:
  - [ ] `mockBooking.ts`
  - [ ] `mockRentalObject.ts`
  - [ ] `mockNotification.ts`

### Phase 2: Add data-testid Attributes

**Priority: HIGH** - Required for stable selectors

#### Minside App (apps/minside/src/)

**Booking Creation Form:**
- [ ] `[data-testid="rental-object-select"]`
- [ ] `[data-testid="booking-date"]`
- [ ] `[data-testid="start-time"]`
- [ ] `[data-testid="end-time"]`
- [ ] `[data-testid="booking-title"]`
- [ ] `[data-testid="booking-notes"]`
- [ ] `[data-testid="booking-purpose"]`
- [ ] `[data-testid="check-availability-button"]`
- [ ] `[data-testid="availability-status"]`
- [ ] `[data-testid="next-button"]`
- [ ] `[data-testid="submit-booking-button"]`

**Booking Details Page:**
- [ ] `[data-testid="booking-title"]`
- [ ] `[data-testid="booking-status"]`
- [ ] `[data-testid="booking-status-badge"]`
- [ ] `[data-testid="pending-approval-message"]`
- [ ] `[data-testid="approval-message"]`
- [ ] `[data-testid="approved-by"]`
- [ ] `[data-testid="approval-date"]`
- [ ] `[data-testid="cancel-button"]`

**Notification Center:**
- [ ] `[data-testid="notification-bell"]`
- [ ] `[data-testid="notification-badge"]`
- [ ] `[data-testid="notification-dropdown"]`
- [ ] `[data-testid="notification-item-{id}"]`
- [ ] `[data-testid="notification-toast"]`
- [ ] `[data-testid="notification-status"]`
- [ ] `[data-testid="notification-type"]`

#### Backoffice App (apps/backoffice/src/)

**Booking List:**
- [ ] `[data-testid="nav-bookings"]`
- [ ] `[data-testid="filter-status"]`
- [ ] `[data-testid="status-pending"]`
- [ ] `[data-testid="search-input"]`
- [ ] `[data-testid="booking-row-{id}"]`

**Booking Details:**
- [ ] `[data-testid="booking-details-modal"]`
- [ ] `[data-testid="approve-button"]`
- [ ] `[data-testid="deny-button"]`
- [ ] `[data-testid="approve-modal"]`
- [ ] `[data-testid="approval-reason"]`
- [ ] `[data-testid="confirm-approve-button"]`
- [ ] `[data-testid="success-toast"]`

#### Shared Components (packages/ds/src/)

**Authentication:**
- [ ] `[data-testid="email"]`
- [ ] `[data-testid="password"]`
- [ ] `[data-testid="login-button"]`
- [ ] `[data-testid="logout-button"]`

### Phase 3: Write Test Code

- [ ] Implement Page Object classes
- [ ] Implement authentication fixtures
- [ ] Write test setup (beforeAll)
- [ ] Write test cleanup (afterAll)
- [ ] Write Phase 1: User Creates Booking
- [ ] Write Phase 2: Admin Sees Pending Booking
- [ ] Write Phase 3: Admin Approves Booking
- [ ] Write Phase 4: User Sees Notification
- [ ] Add assertions for all validation checkpoints
- [ ] Add screenshots on failure
- [ ] Add video recording (optional)

### Phase 4: Integration & Debugging

- [ ] Run test locally (development environment)
- [ ] Fix any failing steps
- [ ] Verify WebSocket connection
- [ ] Verify audit logging
- [ ] Verify notification delivery
- [ ] Run test in CI/CD (staging environment)
- [ ] Performance profiling (< 30s total test time)
- [ ] Flakiness check (run 10 times, 100% pass rate)

### Phase 5: Documentation & Reporting

- [ ] Add test to CI/CD pipeline
- [ ] Update test report template
- [ ] Document known issues
- [ ] Create troubleshooting guide
- [ ] Add to test suite documentation

---

## SUCCESS CRITERIA

### Test Must Pass When:

1. ✓ User successfully creates booking (status: pending)
2. ✓ Admin sees booking in pending list within 5 seconds
3. ✓ Admin successfully approves booking
4. ✓ Booking status changes to approved within 2 seconds
5. ✓ User receives notification within 5 seconds (WebSocket)
6. ✓ Notification appears in notification center
7. ✓ User can view updated booking status
8. ✓ All audit logs created correctly
9. ✓ No errors in API logs
10. ✓ No console errors in browser logs

### Test Must Fail When:

1. ✗ Booking creation fails (API error)
2. ✗ Admin cannot see pending booking
3. ✗ Approval fails (permission denied)
4. ✗ Status does not update
5. ✗ Notification not delivered
6. ✗ RBAC violated (user can approve)
7. ✗ Multi-tenant isolation broken
8. ✗ Audit log missing
9. ✗ WebSocket disconnected (gracefully handle)

---

## RISK ASSESSMENT

| Risk | Impact | Likelihood | Mitigation |
|------|--------|-----------|------------|
| WebSocket connection fails | MEDIUM | LOW | Fall back to polling, verify via page refresh |
| API timeout (slow DB) | HIGH | MEDIUM | Increase timeout to 10s, optimize queries |
| Flaky selectors (no data-testid) | HIGH | HIGH | Add data-testid attributes (Phase 2) |
| Race condition (status update) | MEDIUM | MEDIUM | Use waitForTimeout, React Query invalidation |
| Multi-tenant isolation bug | CRITICAL | LOW | Verify tenantId in all queries, add test |
| RBAC bypass | CRITICAL | LOW | Verify permissions in test, security review |
| Notification delivery failure | MEDIUM | MEDIUM | Retry mechanism, check delivery status API |

---

## RELATED TESTS

### Prerequisite Tests (Must Pass First)

- [ ] `auth-flow-all-apps.spec.ts` - Authentication works
- [ ] `rental-objects.e2e.spec.ts` - Rental objects exist

### Related Tests (Run After)

- [ ] `booking-denial-flow.spec.ts` - Admin denies booking
- [ ] `booking-cancellation-flow.spec.ts` - User cancels booking
- [ ] `rbac-enforcement.spec.ts` - Permission checks
- [ ] `notification-delivery.spec.ts` - Multi-channel notifications

---

## APPENDIX

### Test Data Seeding Script

```typescript
// tests/fixtures/seed-test-data.ts
export async function seedTestData() {
  const tenant = await db.insert(tenants).values({
    id: 'test-kommune-1',
    name: 'Test Kommune',
  });

  const rentalObject = await db.insert(rentalObjects).values({
    id: 'rental-obj-meeting-room-1',
    tenantId: 'test-kommune-1',
    title: 'Møterom A (Meeting Room A)',
    status: 'published',
    requiresApproval: true,
  });

  const user = await db.insert(users).values({
    id: 'user-test-1',
    email: 'user@test.com',
    tenantId: 'test-kommune-1',
    role: 'user',
  });

  const admin = await db.insert(users).values({
    id: 'admin-test-1',
    email: 'admin@test.com',
    tenantId: 'test-kommune-1',
    role: 'admin',
  });
}
```

### API Contract Verification

```typescript
// Verify API responses match expected contracts
import { BookingSchema } from '@xala/contracts';

const booking = await bookingService.getById(bookingId);
const validation = BookingSchema.safeParse(booking);

expect(validation.success).toBe(true);
```

---

**Document Version:** 1.0
**Last Updated:** 2026-01-17
**Author:** Testing Expert (Xala AI Agent)
**Status:** READY FOR IMPLEMENTATION
