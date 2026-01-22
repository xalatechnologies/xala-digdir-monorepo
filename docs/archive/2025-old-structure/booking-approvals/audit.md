# Booking Approvals Audit Report

**Date:** 2026-01-19  
**Status:** ✅ Implementation Complete  
**Author:** AI Assistant

---

## Implementation Summary (2026-01-19)

The following changes were implemented to align booking approvals across all layers:

### Database Schema (`packages/database-schema/src/domain/bookings.ts`)
- ✅ Added `organizationId` column with FK to organizations
- ✅ Added `version` column for optimistic locking
- ✅ Added `submittedAt` timestamp for approval workflow
- ✅ Added `approvedBy` column with FK to users
- ✅ Added `approvedAt` timestamp
- ✅ Added `rejectionReason` text column
- ✅ Added `organizationIdx`, `approvalQueueIdx`, `timeRangeIdx` indexes
- ✅ Migration: `0002_booking_approvals.sql`

### API Layer (`apps/api`)
- ✅ Added `POST /api/bookings/:id/submit` endpoint
- ✅ Added `POST /api/bookings/:id/reject` endpoint (canonical)
- ✅ Marked `POST /api/bookings/:id/deny` as deprecated
- ✅ Removed duplicate `PUT /api/bookings/:id/reject`
- ✅ Added `BookingService.submit()` method with audit logging
- ✅ Updated `BookingStatusSchema` to include all canonical states

### Client SDK (`packages/client-sdk`)
- ✅ Added `bookingService.submit()` method
- ✅ Updated `bookingService.reject()` to use `/reject` endpoint
- ✅ Added `useSubmitBooking` hook
- ✅ Updated `BookingStatus` enum with all canonical states

### Contracts (`packages/contracts`)
- ✅ Updated `BookingStatusSchema` with canonical states

### Backoffice UI (`apps/backoffice`)
- ✅ Added `pending_approval`, `approved`, `rejected` status tabs

### MinSide UI (`apps/minside`)
- ✅ Updated status filtering to handle canonical states
- ✅ Updated stats calculation for new statuses

---

## Executive Summary

This audit documents the current state of booking reservations and approvals across the DigiList platform. Key findings reveal **status enum inconsistencies** across layers, **duplicate API endpoints**, and **terminology drift** between components.

---

## 1. Current Implementation Overview

### 1.1 Database Layer (`@digilist/database-schema`)

**Location:** `packages/database-schema/src/domain/bookings.ts`

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | Primary key |
| `tenantId` | uuid | FK to tenants |
| `rentalObjectId` | uuid | FK to rental_objects |
| `userId` | uuid | FK to users |
| `status` | varchar(50) | **NOT an enum** - stores string values |
| `startTime` | timestamp | Booking start |
| `endTime` | timestamp | Booking end |
| `totalPrice` | decimal(10,2) | Price |
| `currency` | varchar(3) | Default 'NOK' |
| `notes` | text | Free text |
| `metadata` | jsonb | Stores approvedBy, deniedBy, etc. |
| `createdAt` | timestamp | Created at |
| `updatedAt` | timestamp | Updated at |

**Issues:**
- ❌ No `version` column for optimistic locking (service adds it to responses)
- ❌ No `organizationId` column (stored in metadata or derived from user)
- ❌ No explicit `approval_required` column
- ❌ No `approved_by`, `approved_at`, `rejected_reason` columns (stored in metadata)
- ❌ No unique constraint preventing double-booking

**Indexes:**
- ✅ `bookings_tenant_idx` on `tenantId`
- ✅ `bookings_rental_object_idx` on `rentalObjectId`
- ✅ `bookings_user_idx` on `userId`
- ✅ `bookings_status_idx` on `status`

**Missing:**
- ❌ No composite index for approval queue queries
- ❌ No exclusion constraint for time overlap prevention

### 1.2 Audit Logging

**Location:** `packages/database-schema/src/compliance/audit-logs.ts`

Audit logging exists and is called by the service layer on state transitions.

---

## 2. Status Enum Inconsistencies

### 2.1 API Schema (`apps/api/src/schemas/booking.schema.ts`)

```typescript
BookingStatusSchema = z.enum([
  'pending', 'confirmed', 'cancelled', 'completed', 'approved', 'denied'
]);
```

### 2.2 SDK Types (`packages/client-sdk/src/types/enums.ts`)

```typescript
BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';
```

**Missing:** `approved`, `denied`, `rejected`

### 2.3 Contracts (`packages/contracts/src/schemas/booking.schema.ts`)

```typescript
BookingStatusSchema = z.enum([
  'pending', 'confirmed', 'cancelled', 'completed', 'rejected'
]);
```

**Missing:** `approved`, `denied`

### 2.4 Service Layer (API Mapper)

The mapper in `apps/api/src/modules/booking/booking.mapper.ts` references:
- `pending_approval` (not in any schema)
- `rejected` (not in API schema)
- `no_show` (not in any schema)

### Summary of Status Inconsistencies

| Status | API Schema | SDK Types | Contracts | DB Used |
|--------|------------|-----------|-----------|---------|
| `pending` | ✅ | ✅ | ✅ | ✅ |
| `confirmed` | ✅ | ✅ | ✅ | ✅ |
| `cancelled` | ✅ | ✅ | ✅ | ✅ |
| `completed` | ✅ | ✅ | ✅ | ✅ |
| `approved` | ✅ | ❌ | ❌ | ✅ |
| `denied` | ✅ | ❌ | ❌ | ✅ |
| `rejected` | ❌ | ❌ | ✅ | ❌ |
| `pending_approval` | ❌ | ❌ | ❌ | ❌ |

---

## 3. API Endpoints Analysis

### 3.1 Existing Booking Endpoints

| Method | Path | Handler | Purpose | Issues |
|--------|------|---------|---------|--------|
| GET | `/api/bookings` | `findAll` | List bookings | ✅ OK |
| GET | `/api/bookings/:id` | `findById` | Get single | Returns `{ booking }` not `{ data }` |
| POST | `/api/bookings` | `create` | Create | Returns `{ booking }` not `{ data }` |
| PUT | `/api/bookings/:id` | `update` | Update | ✅ Returns `{ data }` |
| PUT | `/api/bookings/:id/confirm` | `confirm` | Confirm | Returns `{ booking }` |
| PUT | `/api/bookings/:id/cancel` | `cancel` | Cancel | Returns `{ booking }` |
| PUT | `/api/bookings/:id/complete` | `complete` | Complete | Returns `{ booking }` |
| PUT | `/api/bookings/:id/status` | `updateStatus` | Change status | ✅ Returns `{ data }` |
| GET | `/api/bookings/my` | `getMyBookings` | User's bookings | ✅ OK |
| GET | `/api/bookings/pricing` | `calculatePricing` | Price calc | ✅ OK |
| GET | `/api/bookings/:id/receipt` | `getReceipt` | Receipt/bilag | ✅ OK |

### 3.2 Approval Endpoints (DUPLICATES EXIST)

| Method | Path | Handler | Purpose | Issues |
|--------|------|---------|---------|--------|
| **POST** | `/api/bookings/:id/approve` | `approve` | Approve (POST) | ✅ Preferred |
| **POST** | `/api/bookings/:id/deny` | `deny` | Deny (POST) | ✅ Preferred |
| **PUT** | `/api/bookings/:id/approve` | `approveWithPut` | Approve (PUT) | ❌ Duplicate |
| **PUT** | `/api/bookings/:id/reject` | `reject` | Reject (PUT) | ❌ Duplicate, uses `/reject` not `/deny` |

**Issues:**
- ❌ Two approve endpoints (POST and PUT)
- ❌ Two reject/deny endpoints with different paths (`/deny` vs `/reject`)
- ❌ Role checking in PUT handlers is manual instead of using RBAC middleware

### 3.3 Recurring Booking Endpoints

| Method | Path | Handler | Purpose |
|--------|------|---------|---------|
| GET | `/api/bookings/recurring` | `getRecurring` | List recurring |
| POST | `/api/bookings/recurring` | `createRecurring` | Create recurring |
| POST | `/api/bookings/recurring/preview` | `previewRecurring` | Preview with conflicts |

---

## 4. Client SDK Analysis

### 4.1 Booking Service (`packages/client-sdk/src/services/booking.service.ts`)

**Correct endpoints:**
- ✅ `approve(id, reason)` → `POST /:id/approve`
- ✅ `reject(id, reason)` → `POST /:id/deny`

**Issue:** The `reject` method calls `/deny` which is correct, but naming is confusing.

### 4.2 Hooks (`packages/client-sdk/src/hooks/use-bookings.ts`)

| Hook | Service Method | Notes |
|------|---------------|-------|
| `useApproveBooking` | `bookingService.approve` | ✅ OK |
| `useRejectBooking` | `bookingService.reject` | ✅ OK (calls /deny) |
| `useCancelBooking` | `bookingService.cancel` | ✅ OK |

---

## 5. Frontend Analysis

### 5.1 Backoffice (`apps/backoffice/src/routes/bookings.tsx`)

**Current Implementation:**
- ✅ Uses SDK hooks (`useApproveBooking`, `useRejectBooking`, `useCancelBooking`)
- ✅ Has approve/reject buttons for pending bookings
- ✅ Uses design system components
- ⚠️ Client-side filtering for status tabs (API doesn't support multi-status)
- ⚠️ Manual status grouping (`confirmed` + `approved` shown together)

**Missing:**
- ❌ No dedicated approvals queue page/route
- ❌ Reject action uses cancel mutation, not reject
- ❌ No rejection reason prompt

### 5.2 MinSide (`apps/minside/src/routes/bookings.tsx`)

**Current Implementation:**
- ✅ Uses SDK hooks (`useCancelBooking`)
- ✅ Displays booking statuses correctly
- ✅ Offline support with IndexedDB
- ⚠️ Same client-side status filtering issue

**Missing:**
- ❌ No view of rejection reason when rejected
- ❌ Status `approved` not in SDK types (cast to string)

---

## 6. RFC7807 Compliance

### 6.1 Compliant Endpoints
- `approveWithPut` (PUT) - Returns RFC7807 on 401/403/400
- `reject` (PUT) - Returns RFC7807 on 401/403/400

### 6.2 Non-Compliant Endpoints
- Most POST endpoints return `{ error: { code, message } }` format
- `findById` returns `{ booking }` directly without error handling
- `calculatePricing` returns `{ error: { code, message } }`

---

## 7. Identified Inconsistencies Summary

### Critical Issues

1. **Status Enum Mismatch**
   - API uses `approved`/`denied`
   - SDK types missing these values
   - Contracts use `rejected` instead of `denied`

2. **Duplicate Approval Endpoints**
   - POST and PUT both exist for approve/reject
   - Different paths: `/deny` vs `/reject`

3. **Response Format Inconsistency**
   - Some endpoints return `{ data }`, others `{ booking }`

### Medium Issues

4. **No Dedicated Approvals Table**
   - Approval metadata stored in booking.metadata JSON
   - No separate approval queue/decisions table

5. **Missing Database Constraints**
   - No double-booking prevention
   - No exclusion constraint on time ranges

6. **RBAC Inconsistency**
   - POST endpoints use service-level RBAC
   - PUT endpoints have inline role checks

### Low Issues

7. **Terminology Drift**
   - SDK: `reject` → API: `/deny`
   - Backoffice: `denied` status
   - Contracts: `rejected` status

---

## 8. Recommendations

### Immediate Actions

1. **Unify Status Enum** across all layers:
   ```typescript
   type BookingStatus = 
     | 'pending'           // Initial state
     | 'pending_approval'  // Submitted, awaiting decision
     | 'approved'          // Approved by caseworker
     | 'confirmed'         // Confirmed (auto or manual)
     | 'rejected'          // Rejected with reason
     | 'cancelled'         // Cancelled by user/admin
     | 'completed'         // Booking fulfilled
     | 'expired';          // Reservation expired
   ```

2. **Remove Duplicate Endpoints**
   - Keep POST for approve/deny (command pattern)
   - Deprecate PUT versions

3. **Standardize Response Format**
   - All endpoints return `{ data: T }` or RFC7807 error

### Schema Additions

4. **Add approval columns to bookings table:**
   ```sql
   ALTER TABLE domain.bookings ADD COLUMN approval_required BOOLEAN DEFAULT false;
   ALTER TABLE domain.bookings ADD COLUMN approved_by UUID REFERENCES platform.users(id);
   ALTER TABLE domain.bookings ADD COLUMN approved_at TIMESTAMP;
   ALTER TABLE domain.bookings ADD COLUMN rejection_reason TEXT;
   ALTER TABLE domain.bookings ADD COLUMN version INTEGER DEFAULT 1;
   ALTER TABLE domain.bookings ADD COLUMN organization_id UUID REFERENCES platform.organizations(id);
   ```

5. **Add exclusion constraint:**
   ```sql
   ALTER TABLE domain.bookings ADD CONSTRAINT no_double_booking 
     EXCLUDE USING gist (
       rental_object_id WITH =,
       tsrange(start_time, end_time) WITH &&
     )
     WHERE (status NOT IN ('cancelled', 'rejected', 'expired'));
   ```

---

## Next Steps

1. Review and approve this audit
2. Create canonical state machine document
3. Implement database alignment
4. Align API contracts
5. Update SDK types and services
6. Wire frontends to use aligned SDK
7. Add tests
