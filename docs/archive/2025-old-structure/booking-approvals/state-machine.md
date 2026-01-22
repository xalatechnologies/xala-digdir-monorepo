# Booking State Machine

**Date:** 2026-01-19  
**Status:** Canonical Definition  
**Version:** 1.0

---

## Overview

This document defines the **canonical booking state machine** for the DigiList platform. All booking transitions must follow this state machine, and invalid transitions must return RFC7807 errors.

---

## 1. State Diagram

```
                                    ┌─────────────┐
                                    │   EXPIRED   │
                                    └─────────────┘
                                          ▲
                                          │ (timeout)
                                          │
┌─────────────┐     submit      ┌─────────────────────┐
│   PENDING   │ ───────────────►│  PENDING_APPROVAL   │
│   (draft)   │                 │                     │
└─────────────┘                 └─────────────────────┘
      │                                │         │
      │ confirm                        │         │
      │ (no approval needed)   approve │         │ reject
      │                                │         │
      ▼                                ▼         ▼
┌─────────────┐                 ┌───────────┐ ┌──────────┐
│  CONFIRMED  │◄────────────────│  APPROVED │ │ REJECTED │
│             │     confirm     │           │ │          │
└─────────────┘                 └───────────┘ └──────────┘
      │
      │ complete (after endTime)
      ▼
┌─────────────┐
│  COMPLETED  │
└─────────────┘

Any state except COMPLETED → CANCELLED (user/admin cancel)
```

---

## 2. States

### 2.1 PENDING

**Description:** Initial state when a booking is created but not yet submitted.

- **Entry:** `POST /api/bookings`
- **Valid Transitions:**
  - → `PENDING_APPROVAL` (submit)
  - → `CONFIRMED` (confirm, when no approval required)
  - → `CANCELLED` (cancel)
  - → `EXPIRED` (timeout, if reservation TTL configured)

### 2.2 PENDING_APPROVAL

**Description:** Booking has been submitted and awaits case handler decision.

- **Entry:** `POST /api/bookings/:id/submit`
- **Valid Transitions:**
  - → `APPROVED` (approve)
  - → `REJECTED` (reject)
  - → `PENDING` (request changes - returns to user)
  - → `CANCELLED` (cancel by user or admin)
  - → `EXPIRED` (timeout, if approval window configured)

### 2.3 APPROVED

**Description:** Case handler has approved the booking. May auto-confirm or require payment.

- **Entry:** `POST /api/bookings/:id/approve`
- **Valid Transitions:**
  - → `CONFIRMED` (confirm, or auto-confirm)
  - → `CANCELLED` (cancel)

### 2.4 CONFIRMED

**Description:** Booking is confirmed and will take place.

- **Entry:** `POST /api/bookings/:id/confirm`
- **Valid Transitions:**
  - → `COMPLETED` (complete, after endTime)
  - → `CANCELLED` (cancel)

### 2.5 REJECTED

**Description:** Case handler has rejected the booking. Terminal state.

- **Entry:** `POST /api/bookings/:id/reject`
- **Valid Transitions:** None (terminal)

### 2.6 CANCELLED

**Description:** Booking was cancelled by user or admin. Terminal state.

- **Entry:** `POST /api/bookings/:id/cancel`
- **Valid Transitions:** None (terminal)

### 2.7 COMPLETED

**Description:** Booking has been fulfilled. Terminal state.

- **Entry:** `POST /api/bookings/:id/complete` or automatic after endTime
- **Valid Transitions:** None (terminal)

### 2.8 EXPIRED

**Description:** Reservation or approval window expired. Terminal state.

- **Entry:** Background job/timer
- **Valid Transitions:** None (terminal)

---

## 3. Transition Matrix

| From \ To | PENDING | PENDING_APPROVAL | APPROVED | CONFIRMED | REJECTED | CANCELLED | COMPLETED | EXPIRED |
|-----------|---------|------------------|----------|-----------|----------|-----------|-----------|---------|
| **PENDING** | - | ✅ submit | - | ✅ confirm* | - | ✅ cancel | - | ✅ timeout |
| **PENDING_APPROVAL** | ✅ request_changes | - | ✅ approve | - | ✅ reject | ✅ cancel | - | ✅ timeout |
| **APPROVED** | - | - | - | ✅ confirm | - | ✅ cancel | - | - |
| **CONFIRMED** | - | - | - | - | - | ✅ cancel | ✅ complete | - |
| **REJECTED** | - | - | - | - | - | - | - | - |
| **CANCELLED** | - | - | - | - | - | - | - | - |
| **COMPLETED** | - | - | - | - | - | - | - | - |
| **EXPIRED** | - | - | - | - | - | - | - | - |

*confirm from PENDING only allowed if `approval_required = false`

---

## 4. Transition Commands

### 4.1 submit

**Endpoint:** `POST /api/bookings/:id/submit`

**Preconditions:**
- Booking status is `PENDING`
- Booking has valid time range (future start)
- Listing exists and is active

**Effects:**
- Status → `PENDING_APPROVAL`
- `submittedAt` timestamp set
- Notification sent to case handlers
- Audit log entry created

**Error Cases:**
- 422: Invalid status transition
- 400: Start time is in the past
- 404: Booking not found

---

### 4.2 confirm

**Endpoint:** `POST /api/bookings/:id/confirm`

**Preconditions:**
- Booking status is `PENDING` (no approval) OR `APPROVED`
- If `PENDING`: listing has `approval_required = false`
- No conflicting confirmed booking

**Effects:**
- Status → `CONFIRMED`
- `confirmedAt` timestamp set
- Confirmation notification sent to user
- Calendar event created
- Audit log entry created

**Error Cases:**
- 422: Invalid status transition
- 409: Conflicting booking exists
- 403: Approval required for this listing

---

### 4.3 cancel

**Endpoint:** `POST /api/bookings/:id/cancel`

**Preconditions:**
- Booking status is NOT `COMPLETED`, `CANCELLED`, `REJECTED`, `EXPIRED`
- If user-initiated: cancellation deadline not passed
- Requestor has permission (owner or admin)

**Effects:**
- Status → `CANCELLED`
- `cancelledAt` timestamp set
- `cancellationReason` stored
- Refund initiated if applicable
- Slot released for other bookings
- Notification sent
- Audit log entry created

**Error Cases:**
- 422: Invalid status transition
- 403: Cannot cancel (deadline passed or no permission)
- 400: Reason required (if configured)

---

### 4.4 complete

**Endpoint:** `POST /api/bookings/:id/complete`

**Preconditions:**
- Booking status is `CONFIRMED`
- Current time is after booking `endTime`

**Effects:**
- Status → `COMPLETED`
- `completedAt` timestamp set
- Review request sent (optional)
- Audit log entry created

**Error Cases:**
- 422: Invalid status transition
- 400: Booking end time not yet passed

---

### 4.5 approve

**Endpoint:** `POST /api/bookings/:id/approve`

**Preconditions:**
- Booking status is `PENDING_APPROVAL`
- Requestor has approval permission for this listing

**Effects:**
- Status → `APPROVED`
- `approvedBy` set to requestor
- `approvedAt` timestamp set
- `approvalNotes` stored if provided
- Notification sent to user
- May auto-confirm if configured
- Audit log entry created

**Error Cases:**
- 422: Invalid status transition
- 403: No approval permission

---

### 4.6 reject

**Endpoint:** `POST /api/bookings/:id/reject`

**Preconditions:**
- Booking status is `PENDING_APPROVAL`
- Requestor has rejection permission
- Rejection reason provided

**Effects:**
- Status → `REJECTED`
- `rejectedBy` set to requestor
- `rejectedAt` timestamp set
- `rejectionReason` stored (required)
- Notification sent to user with reason
- Audit log entry created

**Error Cases:**
- 422: Invalid status transition
- 403: No rejection permission
- 400: Reason required

---

### 4.7 request_changes

**Endpoint:** `POST /api/bookings/:id/request-changes`

**Preconditions:**
- Booking status is `PENDING_APPROVAL`
- Requestor has approval permission

**Effects:**
- Status → `PENDING`
- Change request message stored
- Notification sent to user
- Audit log entry created

---

### 4.8 expire (system)

**Trigger:** Background job or TTL expiration

**Preconditions:**
- Booking status is `PENDING` or `PENDING_APPROVAL`
- Expiration time reached

**Effects:**
- Status → `EXPIRED`
- `expiredAt` timestamp set
- Notification sent to user
- Audit log entry created

---

## 5. Business Rules

### 5.1 Approval Required

Determined by listing configuration:

```typescript
function isApprovalRequired(listing: RentalObject): boolean {
  return listing.bookingRules?.requiresApproval ?? false;
}
```

**When approval required:**
- `PENDING` → `PENDING_APPROVAL` → `APPROVED` → `CONFIRMED`

**When no approval required:**
- `PENDING` → `CONFIRMED`

---

### 5.2 Auto-Confirmation

Some listings may auto-confirm after approval:

```typescript
function shouldAutoConfirm(listing: RentalObject, booking: Booking): boolean {
  if (listing.bookingRules?.autoConfirmAfterApproval) {
    return true;
  }
  if (listing.pricingRules?.freeBooking && booking.totalPrice === 0) {
    return true;
  }
  return false;
}
```

---

### 5.3 Cancellation Deadlines

```typescript
function canUserCancel(booking: Booking, listing: RentalObject): boolean {
  const deadline = listing.bookingRules?.cancellationDeadlineHours ?? 24;
  const cutoff = new Date(booking.startTime);
  cutoff.setHours(cutoff.getHours() - deadline);
  return new Date() < cutoff;
}
```

---

### 5.4 Case Handler Scope

Case handlers (saksbehandler) can only approve/reject bookings within their scope:

```typescript
async function hasApprovalScope(userId: string, booking: Booking): Promise<boolean> {
  const scopes = await db.select()
    .from(caseHandlerScopes)
    .where(eq(caseHandlerScopes.userId, userId))
    .where(eq(caseHandlerScopes.tenantId, booking.tenantId))
    .where(eq(caseHandlerScopes.status, 'active'));
  
  return scopes.some(scope => 
    scope.scopeType === 'all' || 
    scope.rentalObjectId === booking.rentalObjectId
  );
}
```

---

## 6. Audit Events

Every transition creates an audit log entry:

```typescript
interface BookingAuditEvent {
  tenantId: string;
  userId: string;
  action: 
    | 'booking:create'
    | 'booking:submit'
    | 'booking:approve'
    | 'booking:reject'
    | 'booking:confirm'
    | 'booking:cancel'
    | 'booking:complete'
    | 'booking:expire';
  resource: 'booking';
  resourceId: string;
  timestamp: string;
  metadata: {
    previousStatus: BookingStatus;
    newStatus: BookingStatus;
    reason?: string;
    notes?: string;
  };
}
```

---

## 7. RFC7807 Error Types

### Invalid Transition

```json
{
  "type": "https://api.digilist.no/errors/invalid-transition",
  "title": "Invalid State Transition",
  "status": 422,
  "detail": "Cannot transition from 'confirmed' to 'approved'",
  "instance": "/api/bookings/123/approve",
  "currentStatus": "confirmed",
  "attemptedStatus": "approved",
  "validTransitions": ["complete", "cancel"]
}
```

### Conflict

```json
{
  "type": "https://api.digilist.no/errors/conflict",
  "title": "Booking Conflict",
  "status": 409,
  "detail": "Time slot conflicts with existing booking",
  "instance": "/api/bookings/123/confirm",
  "conflictingBookingId": "456"
}
```

### Forbidden

```json
{
  "type": "https://api.digilist.no/errors/forbidden",
  "title": "Forbidden",
  "status": 403,
  "detail": "You do not have permission to approve bookings for this listing"
}
```

---

## 8. Implementation Checklist

- [ ] Add `pending_approval` status to all enum definitions
- [ ] Add `expired` status to all enum definitions
- [ ] Implement state machine validation in service layer
- [ ] Add transition validation middleware
- [ ] Implement RFC7807 error responses for invalid transitions
- [ ] Add audit logging for all transitions
- [ ] Implement TTL expiration job for pending reservations
- [ ] Add WebSocket events for real-time status updates
- [ ] Update SDK types to match state machine
- [ ] Update UI to handle all states
