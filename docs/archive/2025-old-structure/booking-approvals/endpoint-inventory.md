# Booking Approvals Endpoint Inventory

**Date:** 2026-01-19  
**Status:** Canonical Reference  
**Version:** 1.0

---

## Canonical Endpoints (POST for commands)

This document defines the **authoritative endpoint inventory** for booking reservations and approvals.

---

## 1. Booking CRUD Endpoints

### 1.1 List Bookings

```
GET /api/bookings
```

**Query Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `rentalObjectId` | uuid | No | Filter by listing |
| `userId` | uuid | No | Filter by user |
| `orgId` | uuid | No | Filter by organization |
| `status` | string | No | Filter by status |
| `from` | ISO date | No | Start date range |
| `to` | ISO date | No | End date range |
| `page` | int | No | Page number (default: 1) |
| `limit` | int | No | Page size (default: 20, max: 100) |

**Response:** `PaginatedResponse<BookingDTO>`

**Authorization:**
- `admin`: All bookings in tenant
- `saksbehandler`: Scoped by case_handler_scopes
- `user`: Own bookings only

---

### 1.2 Get Booking by ID

```
GET /api/bookings/:id
```

**Response:** `SingleResponse<BookingDTO>`

**Authorization:** Tenant member with access to booking

---

### 1.3 Create Booking

```
POST /api/bookings
```

**Request Body:** `CreateBookingDTO`
```typescript
{
  rentalObjectId: string;      // Required
  startTime: string;           // ISO datetime
  endTime: string;             // ISO datetime
  userId?: string;             // Optional (defaults to auth user)
  organizationId?: string;     // Optional
  notes?: string;              // Max 1000 chars
  metadata?: object;           // Additional data
}
```

**Response:** `SingleResponse<BookingDTO>` (201 Created)

**State:** Creates booking in `pending` status

---

### 1.4 Update Booking

```
PUT /api/bookings/:id
```

**Request Body:** `UpdateBookingDTO`
```typescript
{
  startTime?: string;
  endTime?: string;
  notes?: string;
  metadata?: object;
  version?: number;           // For optimistic locking
}
```

**Response:** `SingleResponse<BookingDTO>`

---

### 1.5 Delete Booking

```
DELETE /api/bookings/:id
```

**Response:** `SuccessResponse`

**Authorization:** Admin only

---

## 2. Booking State Transitions

### 2.1 Submit for Approval

```
POST /api/bookings/:id/submit
```

**Purpose:** Move booking from `pending` to `pending_approval`

**Request Body:**
```typescript
{
  notes?: string;
}
```

**Response:** `SingleResponse<BookingDTO>`

**Valid From States:** `pending`  
**Target State:** `pending_approval`

---

### 2.2 Confirm Booking

```
POST /api/bookings/:id/confirm
```

**Purpose:** Confirm a booking (for bookings not requiring approval)

**Response:** `SingleResponse<BookingDTO>`

**Valid From States:** `pending`, `approved`  
**Target State:** `confirmed`

---

### 2.3 Cancel Booking

```
POST /api/bookings/:id/cancel
```

**Request Body:**
```typescript
{
  reason?: string;
}
```

**Response:** `SingleResponse<BookingDTO>`

**Valid From States:** `pending`, `pending_approval`, `approved`, `confirmed`  
**Target State:** `cancelled`

**Authorization:** Owner or Admin

---

### 2.4 Complete Booking

```
POST /api/bookings/:id/complete
```

**Purpose:** Mark booking as fulfilled after end time

**Response:** `SingleResponse<BookingDTO>`

**Valid From States:** `confirmed`  
**Target State:** `completed`

---

## 3. Approval Endpoints (Case Handler Actions)

### 3.1 Approve Booking

```
POST /api/bookings/:id/approve
```

**Purpose:** Approve a pending booking

**Request Body:**
```typescript
{
  notes?: string;             // Optional approval notes
}
```

**Response:** `SingleResponse<BookingDTO>`

**Valid From States:** `pending_approval`  
**Target State:** `approved`

**Authorization:**
- `admin`, `saksbehandler` with scope
- `ORG_ADMIN`, `ORG_CASE_HANDLER` for org listings

**Audit:** Logs `booking:approve` event

---

### 3.2 Reject Booking

```
POST /api/bookings/:id/reject
```

**Purpose:** Reject a pending booking

**Request Body:**
```typescript
{
  reason: string;             // Required - rejection reason
}
```

**Response:** `SingleResponse<BookingDTO>`

**Valid From States:** `pending_approval`  
**Target State:** `rejected`

**Authorization:**
- `admin`, `saksbehandler` with scope
- `ORG_ADMIN` for org listings
- `ORG_CASE_HANDLER`: Cannot reject (approve only)

**Audit:** Logs `booking:reject` event with reason

---

### 3.3 Request Changes

```
POST /api/bookings/:id/request-changes
```

**Purpose:** Ask user to modify booking before approval

**Request Body:**
```typescript
{
  message: string;            // Required - what to change
  suggestedStartTime?: string;
  suggestedEndTime?: string;
}
```

**Response:** `SingleResponse<BookingDTO>`

**Valid From States:** `pending_approval`  
**Target State:** `pending` (returns to user)

---

## 4. Approval Queue Endpoints

### 4.1 List Pending Approvals

```
GET /api/approvals
```

**Purpose:** Get approval queue for case handler

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `status` | string | Filter: `pending_approval`, `approved`, `rejected` |
| `rentalObjectId` | uuid | Filter by listing |
| `from` | ISO date | Date range start |
| `to` | ISO date | Date range end |
| `orgId` | uuid | Filter by organization |
| `page` | int | Page number |
| `limit` | int | Page size |

**Response:** `PaginatedResponse<ApprovalItemDTO>`

**DTO Structure:**
```typescript
interface ApprovalItemDTO {
  id: string;                  // Booking ID
  status: BookingStatus;
  submittedAt: string;
  
  // Booking details
  startTime: string;
  endTime: string;
  totalPrice: number;
  currency: string;
  
  // Listing info
  listing: {
    id: string;
    name: string;
    category: string;
  };
  
  // User info
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  
  // Organization (if applicable)
  organization?: {
    id: string;
    name: string;
    type: string;
  };
  
  // Actions
  permissions: {
    canApprove: boolean;
    canReject: boolean;
    canRequestChanges: boolean;
  };
}
```

**Authorization:** `admin`, `saksbehandler`, `ORG_CASE_HANDLER`

---

### 4.2 Get Approval Details

```
GET /api/approvals/:id
```

**Purpose:** Get full approval context for decision

**Response:** `SingleResponse<ApprovalDetailsDTO>`

**DTO Structure:**
```typescript
interface ApprovalDetailsDTO extends ApprovalItemDTO {
  // Additional context
  userBookingHistory: {
    totalBookings: number;
    cancelledCount: number;
    noShowCount: number;
  };
  
  // Listing availability context
  listingContext: {
    totalBookingsThisMonth: number;
    conflictingBookings: BookingDTO[];
  };
  
  // Notes
  userNotes?: string;
  internalNotes?: string;
  
  // Decision history
  decisionHistory?: {
    action: 'approve' | 'reject' | 'request_changes';
    userId: string;
    timestamp: string;
    notes?: string;
  }[];
}
```

---

## 5. Read Models

### 5.1 My Bookings (User)

```
GET /api/bookings/my
```

**Response:** `PaginatedResponse<BookingDTO>`

---

### 5.2 Organization Bookings

```
GET /api/bookings/org/:orgId
```

**Response:** `PaginatedResponse<BookingDTO>`

**Authorization:** Org member

---

### 5.3 Listing Calendar

```
GET /api/calendar/events
```

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `rentalObjectId` | uuid | Required |
| `startDate` | ISO date | Required |
| `endDate` | ISO date | Required |

**Response:** `SingleResponse<CalendarEvent[]>`

---

## 6. DTOs

### 6.1 BookingDTO

```typescript
interface BookingDTO {
  id: string;
  tenantId: string;
  rentalObjectId: string;
  userId: string;
  organizationId?: string;
  
  status: BookingStatus;
  startTime: string;
  endTime: string;
  
  totalPrice: number;
  currency: string;
  
  notes?: string;
  metadata?: Record<string, unknown>;
  version: number;
  
  createdAt: string;
  updatedAt: string;
  
  // Denormalized display fields
  listingName?: string;
  userName?: string;
  organizationName?: string;
  
  // Approval fields
  approvalRequired?: boolean;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  
  // Permissions (computed for requesting user)
  permissions: {
    canView: boolean;
    canCancel: boolean;
    canModify: boolean;
    canApprove: boolean;
    canReject: boolean;
  };
}
```

### 6.2 BookingStatus Enum

```typescript
type BookingStatus =
  | 'pending'            // Initial draft/hold
  | 'pending_approval'   // Submitted, awaiting decision
  | 'approved'           // Approved by caseworker
  | 'confirmed'          // Confirmed booking
  | 'rejected'           // Rejected with reason
  | 'cancelled'          // Cancelled by user/admin
  | 'completed'          // Booking fulfilled
  | 'expired';           // Reservation expired
```

---

## 7. Error Responses (RFC7807)

All errors follow RFC7807 format:

```typescript
interface ProblemDetails {
  type: string;           // Error type URI
  title: string;          // Human-readable title
  status: number;         // HTTP status code
  detail: string;         // Specific error message
  instance?: string;      // Request path
  errors?: object;        // Validation errors
}
```

### Common Error Types

| Type | Status | When |
|------|--------|------|
| `/errors/not-found` | 404 | Resource not found |
| `/errors/forbidden` | 403 | Insufficient permissions |
| `/errors/unauthorized` | 401 | Authentication required |
| `/errors/validation-error` | 400 | Invalid input |
| `/errors/conflict` | 409 | Double booking/state conflict |
| `/errors/invalid-transition` | 422 | Invalid state transition |

---

## 8. Deprecations

The following endpoints are **deprecated** and will be removed:

| Endpoint | Replacement |
|----------|-------------|
| `PUT /api/bookings/:id/approve` | `POST /api/bookings/:id/approve` |
| `PUT /api/bookings/:id/reject` | `POST /api/bookings/:id/reject` |
| `PUT /api/bookings/:id/confirm` | `POST /api/bookings/:id/confirm` |
| `PUT /api/bookings/:id/cancel` | `POST /api/bookings/:id/cancel` |
| `POST /api/bookings/:id/deny` | `POST /api/bookings/:id/reject` |

---

## 9. SDK Method Mapping

| SDK Method | HTTP | Endpoint |
|------------|------|----------|
| `bookingService.getAll()` | GET | `/api/bookings` |
| `bookingService.getById()` | GET | `/api/bookings/:id` |
| `bookingService.create()` | POST | `/api/bookings` |
| `bookingService.update()` | PUT | `/api/bookings/:id` |
| `bookingService.submit()` | POST | `/api/bookings/:id/submit` |
| `bookingService.confirm()` | POST | `/api/bookings/:id/confirm` |
| `bookingService.cancel()` | POST | `/api/bookings/:id/cancel` |
| `bookingService.complete()` | POST | `/api/bookings/:id/complete` |
| `bookingService.approve()` | POST | `/api/bookings/:id/approve` |
| `bookingService.reject()` | POST | `/api/bookings/:id/reject` |
| `bookingService.getMyBookings()` | GET | `/api/bookings/my` |
| `approvalService.getQueue()` | GET | `/api/approvals` |
| `approvalService.getDetails()` | GET | `/api/approvals/:id` |
