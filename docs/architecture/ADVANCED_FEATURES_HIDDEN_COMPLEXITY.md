# 🔐 **ADVANCED FEATURES - HIDDEN COMPLEXITY ANALYSIS**

**Date:** 2026-01-17  
**Category:** Advanced booking scenarios, permissions, and conflict management  
**Priority:** P0-P1 (Critical for production)

---

## 📋 **OVERVIEW**

This document covers advanced features that have significant complexity:
1. **Season Rentals** - Long-term seasonal bookings
2. **Recurring Rentals** - Repeating booking patterns
3. **Conflict Management** - Double-booking prevention & resolution
4. **Granular Permissions** - Organization-level access control per rental object

---

## 1. SEASON RENTALS

### 1.1 **Current Status** ✅ (Exists!)

**Modules Found:**
```
✅ apps/api/src/modules/seasons/
✅ apps/api/src/modules/season-applications/
✅ apps/api/src/modules/seasonal-lease/
```

**SDK Services:**
```
✅ packages/client-sdk/src/services/season.service.ts
✅ packages/client-sdk/src/services/season-application.service.ts
✅ packages/client-sdk/src/services/seasonal-lease.service.ts
```

**Hooks:**
```
✅ packages/client-sdk/src/hooks/use-seasons.ts
✅ packages/client-sdk/src/hooks/use-season-applications.ts
✅ packages/client-sdk/src/hooks/use-seasonal-leases.ts
```

### 1.2 **Season Rental Flow**

```
User → Apply for Season → Admin Reviews → Approve/Reject → Season Lease Created
```

**Key Features:**
1. **Season Definitions** - Define seasonal periods (e.g., "Winter 2026", "Summer 2026")
2. **Applications** - Users apply for seasonal access
3. **Approval Workflow** - Admin review and approval
4. **Lease Management** - Long-term lease agreements
5. **Recurring Billing** - Monthly/seasonal billing
6. **Priority Access** - Season holders get priority booking

### 1.3 **API Endpoints** (Existing)

```typescript
// Seasons
GET    /api/seasons                      // List seasons
GET    /api/seasons/:id                  // Get season
POST   /api/admin/seasons                // Create season
PATCH  /api/admin/seasons/:id            // Update season
DELETE /api/admin/seasons/:id            // Delete season

// Season Applications
GET    /api/season-applications          // My applications
POST   /api/season-applications          // Apply for season
GET    /api/season-applications/:id      // Get application
PATCH  /api/season-applications/:id      // Update application
DELETE /api/season-applications/:id      // Cancel application

// Admin Operations
GET    /api/admin/season-applications    // All applications
PATCH  /api/admin/season-applications/:id/approve
PATCH  /api/admin/season-applications/:id/reject

// Seasonal Leases
GET    /api/seasonal-leases              // My leases
GET    /api/seasonal-leases/:id          // Get lease
GET    /api/admin/seasonal-leases        // All leases (admin)
```

### 1.4 **Gap Analysis**

| Feature | Status | Gap |
|---------|--------|-----|
| Season creation | ✅ | Complete |
| Application flow | ✅ | Complete |
| Approval workflow | ✅ | Complete |
| Lease management | ✅ | Complete |
| **Season pricing** | ⚠️ | 70% - Needs discount rules |
| **Auto-renewal** | ❌ | **MISSING** |
| **Waitlist for full seasons** | ❌ | **MISSING** |
| **Season cancellation** | ⚠️ | 60% - Needs refund logic |

**Priority Gaps:**
- 🔴 **Auto-renewal** - Automatic season renewal (P1)
- 🔴 **Season waitlist** - When season is full (P1)

### 1.5 **Database Schema** (Existing ✅)

```sql
-- domain.seasons
- id, tenant_id, name, description
- start_date, end_date
- rental_object_id
- max_participants, current_participants
- price_cents, status

-- domain.season_applications
- id, user_id, season_id
- status (PENDING, APPROVED, REJECTED)
- applied_at, reviewed_at

-- domain.seasonal_leases
- id, user_id, season_id
- start_date, end_date
- status (ACTIVE, CANCELLED, EXPIRED)
- payment_status
```

---

## 2. RECURRING RENTALS

### 2.1 **Current Status** 🟡 (Partial)

**What Exists:**
```typescript
// Basic recurring endpoint exists
POST /api/bookings/recurring

// DTO exists
interface CreateRecurringBookingDTO {
  rentalObjectId: string;
  startTime: string;
  endTime: string;
  pattern: "DAILY" | "WEEKLY" | "CUSTOM";
  interval?: number;
  daysOfWeek?: number[]; // 0=Sunday, 1=Monday, ...
  endDate: string;
}
```

**Coverage:** 🟡 **60%**

### 2.2 **Recurring Patterns Needed**

| Pattern | Description | Status |
|---------|-------------|--------|
| **Daily** | Every day | ✅ **Complete** |
| **Weekly** | Every week (specific days) | ✅ **Complete** |
| **Bi-weekly** | Every 2 weeks | ⚠️ **70%** |
| **Monthly** | Same day each month | ❌ **MISSING** |
| **Custom (iCal RRULE)** | Full iCalendar RRULE | ❌ **MISSING** |
| **Until date** | Repeat until specific date | ✅ **Complete** |  
| **Count-based** | Repeat X times | ❌ **MISSING** |

### 2.3 **Recurring Booking Features**

| Feature | Status | Gap |
|---------|--------|-----|
| **Create series** | ✅ | Complete |
| **View series** | ⚠️ | 70% - Needs UI |
| **Modify single instance** | ❌ | **MISSING** |
| **Modify future instances** | ❌ | **MISSING** |
| **Cancel single instance** | ❌ | **MISSING** |
| **Cancel series** | ⚠️ | 60% |
| **Conflict detection** | ❌ | **MISSING** |
| **Skip/reschedule instance** | ❌ | **MISSING** |

### 2.4 **Critical Gaps**

```typescript
// MISSING: Modify booking series
PATCH /api/bookings/series/:id
{
  modifyFrom: "2026-02-01", // Modify from this date forward
  updates: {
    startTime: "10:00",
    rentalObjectId: "new-object"
  }
}

// MISSING: Cancel single instance
DELETE /api/bookings/:id/instance/:date

// MISSING: Get series overview
GET /api/bookings/series/:id
Response: {
  seriesId: string;
  pattern: {...};
  instances: [
    { date, status: "CONFIRMED" | "CANCELLED" | "MODIFIED" }
  ];
}
```

### 2.5 **iCalendar RRULE Support** ❌

**Need to implement:**
```typescript
// RRULE examples to support:
FREQ=WEEKLY;BYDAY=MO,WE,FR;UNTIL=20260630
FREQ=MONTHLY;BYMONTHDAY=15;COUNT=12
FREQ=DAILY;INTERVAL=2;UNTIL=20260531

// Library: rrule (https://github.com/jakubroztocil/rrule)
import { RRule } from 'rrule';

// Parser service needed
class RecurringBookingService {
  parseRRule(rruleString: string): BookingInstance[];
  validateRRule(rruleString: string): boolean;
  generateInstances(rrule: RRule, maxInstances: number): Date[];
}
```

---

## 3. CONFLICT MANAGEMENT

### 3.1 **Current Status** 🔴 (Missing!)

**Coverage:** 🔴 **30%** - Critical gap!

### 3.2 **Conflict Scenarios**

| Scenario | Description | Status |
|----------|-------------|--------|
| **Hard conflict** | Same time, same resource | ❌ **NO DETECTION** |
| **Buffer conflict** | Within setup/cleanup time | ❌ **NO DETECTION** |
| **Capacity conflict** | Over capacity limit | ⚠️ **50%** |
| **Recurring conflict** | Series overlaps existing | ❌ **NO DETECTION** |
| **Season vs booking** | Booking during season lease | ❌ **NO DETECTION** |

### 3.3 **Conflict Detection API** ❌ MISSING

**Need to create:**
```typescript
// POST /api/bookings/check-conflicts
interface ConflictCheckRequest {
  rentalObjectId: string;
  startTime: string;
  endTime: string;
  excludeBookingId?: string; // For updates
  includeBuffer?: boolean; // Check setup/cleanup time
}

interface ConflictCheckResponse {
  hasConflicts: boolean;
  conflicts: Array<{
    type: "HARD" | "SOFT" | "BUFFER" | "CAPACITY";
    bookingId: string;
    bookingTitle: string;
    startTime: string;
    endTime: string;
    severity: "CRITICAL" | "WARNING" | "INFO";
  }>;
  canOverride: boolean; // Admin can force book
  suggestions: Array<{
    alternativeTime: string;
    alternativeObject: string;
  }>;
}

// Real-time conflict detection
WebSocket event: conflict:detected
{
  bookingId: string;
  conflictWith: string;
  message: "Another booking just created conflicts with yours"
}
```

### 3.4 **Conflict Resolution Workflow**

```typescript
// Conflict resolution options
enum ConflictResolutionAction {
  CANCEL_NEW = "CANCEL_NEW",           // Cancel the new booking
  CANCEL_EXISTING = "CANCEL_EXISTING", // Cancel existing (admin only)
  FORCE_ACCEPT = "FORCE_ACCEPT",       // Override (admin only)
  MODIFY_TIME = "MODIFY_TIME",         // Suggest new time
  SPLIT_CAPACITY = "SPLIT_CAPACITY",   // Share if capacity allows
  WAITLIST = "WAITLIST",               // Add to waitlist
}

// POST /api/bookings/resolve-conflict
interface ConflictResolutionRequest {
  newBookingId: string;
  conflictingBookingId: string;
  action: ConflictResolutionAction;
  reason?: string; // Required for admin overrides
  alternativeTime?: string; // For MODIFY_TIME
}
```

### 3.5 **Database Schema** (Need to add)

```sql
-- New table needed
CREATE TABLE domain.booking_conflicts (
  id UUID PRIMARY KEY,
  booking_id_1 UUID REFERENCES domain.bookings(id),
  booking_id_2 UUID REFERENCES domain.bookings(id),
  conflict_type VARCHAR(50), -- HARD, SOFT, BUFFER, CAPACITY
  detected_at TIMESTAMP DEFAULT NOW(),
  resolved_at TIMESTAMP,
  resolution_action VARCHAR(50),
  resolved_by UUID REFERENCES platform.users(id),
  resolution_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_booking_conflicts_booking1 ON domain.booking_conflicts(booking_id_1);
CREATE INDEX idx_booking_conflicts_unresolved ON domain.booking_conflicts(resolved_at) WHERE resolved_at IS NULL;
```

### 3.6 **Conflict Prevention Rules**

```typescript
// Validation rules before booking
interface BookingValidation {
  // 1. Time slot availability
  checkTimeSlotAvailable(rentalObjectId, startTime, endTime): boolean;
  
  // 2. Capacity check
  checkCapacityAvailable(rentalObjectId, startTime, count): boolean;
  
  // 3. Buffer time check (setup/cleanup)
  checkBufferTime(rentalObjectId, startTime, endTime): boolean;
  
  // 4. Business rules
  checkMinBookingDuration(duration): boolean;
  checkMaxAdvanceBooking(startTime): boolean;
  checkBlackoutDates(date): boolean;
  
  // 5. User permissions
  checkUserCanBook(userId, rentalObjectId): boolean;
  checkOrganizationQuota(organizationId): boolean;
}
```

---

## 4. GRANULAR PERMISSIONS (Organization-Level)

### 4.1 **Current Status** ⚠️ (Partial)

**What Exists:**
- ✅ Basic RBAC (role-based access control)
- ✅ Tenant-level permissions
- ⚠️ Organization-level permissions (partial)
- ❌ Rental object-level permissions (**MISSING**)

**Coverage:** 🟡 **50%**

### 4.2 **Permission Hierarchy**

```
Platform (Super Admin)
  ↓
Tenant (Tenant Admin)
  ↓
Organization (Organization Admin) ← NEEDS WORK
  ↓
Rental Object (Object Manager) ← MISSING
  ↓
User (End User)
```

### 4.3 **Rental Object Permissions** ❌ MISSING

**Need to create:**
```typescript
// Domain permissions per rental object
interface RentalObjectPermission {
  rentalObjectId: string;
  userId: string;
  organizationId?: string; // Organization-wide permission
  
  // Granular permissions
  canView: boolean;
  canBook: boolean;
  canManage: boolean; // Edit object settings
  canApproveBookings: boolean;
  canCancelBookings: boolean;
  canViewReports: boolean;
  canSetPricing: boolean;
  canManageAvailability: boolean;
  
  // Time-based permissions
  validFrom?: Date;
  validUntil?: Date;
  
  // Custom permissions
  customPermissions?: Record<string, boolean>;
}
```

### 4.4 **Permission Assignment API** ❌ MISSING

```typescript
// POST /api/admin/rental-objects/:id/permissions
interface AssignPermissionRequest {
  userId?: string;
  organizationId?: string; // Assign to entire org
  permissions: {
    canView?: boolean;
    canBook?: boolean;
    canManage?: boolean;
    canApproveBookings?: boolean;
    // ... etc
  };
  validFrom?: string;
  validUntil?: string;
}

// GET /api/admin/rental-objects/:id/permissions
interface RentalObjectPermissionsResponse {
  users: Array<{
    userId: string;
    userName: string;
    permissions: {...};
  }>;
  organizations: Array<{
    organizationId: string;
    organizationName: string;
    permissions: {...};
  }>;
}

// Check user permission
// GET /api/rental-objects/:id/my-permissions
interface MyPermissionsResponse {
  canView: boolean;
  canBook: boolean;
  canManage: boolean;
  // ... etc
  source: "USER" | "ORGANIZATION" | "ROLE"; // How permission was granted
}
```

### 4.5 **Permission Delegation**

```typescript
// Organization admins can delegate permissions
// POST /api/organizations/:orgId/delegate-permissions
interface DelegatePermissionsRequest {
  delegateToUserId: string;
  rentalObjectIds: string[];
  permissions: {
    canBook: boolean;
    canManage: boolean;
    // ...
  };
  expiresAt?: string; // Temporary delegation
}

// Permission inheritance
// User inherits permissions from:
// 1. Direct user assignment (highest priority)
// 2. Organization membership
// 3. Role-based permissions
// 4. Default tenant permissions (lowest priority)
```

### 4.6 **Database Schema** (Need to add/update)

```sql
-- New table for granular permissions
CREATE TABLE domain.rental_object_permissions (
  id UUID PRIMARY KEY,
  rental_object_id UUID REFERENCES domain.rental_objects(id) ON DELETE CASCADE,
  
  -- Grant to user OR organization
  user_id UUID REFERENCES platform.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES platform.organizations(id) ON DELETE CASCADE,
  
  -- Granular permissions
  can_view BOOLEAN DEFAULT false,
  can_book BOOLEAN DEFAULT false,
  can_manage BOOLEAN DEFAULT false,
  can_approve_bookings BOOLEAN DEFAULT false,
  can_cancel_bookings BOOLEAN DEFAULT false,
  can_view_reports BOOLEAN DEFAULT false,
  can_set_pricing BOOLEAN DEFAULT false,
  can_manage_availability BOOLEAN DEFAULT false,
  
  -- Time-based
  valid_from TIMESTAMP,
  valid_until TIMESTAMP,
  
  -- Audit
  granted_by UUID REFERENCES platform.users(id),
  granted_at TIMESTAMP DEFAULT NOW(),
  revoked_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT user_or_org_required CHECK (
    (user_id IS NOT NULL AND organization_id IS NULL) OR
    (user_id IS NULL AND organization_id IS NOT NULL)
  )
);

CREATE INDEX idx_rental_permissions_object ON domain.rental_object_permissions(rental_object_id);
CREATE INDEX idx_rental_permissions_user ON domain.rental_object_permissions(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_rental_permissions_org ON domain.rental_object_permissions(organization_id) WHERE organization_id IS NOT NULL;

-- Helper function to check permissions
CREATE OR REPLACE FUNCTION domain.check_rental_object_permission(
  p_user_id UUID,
  p_rental_object_id UUID,
  p_permission_name TEXT
) RETURNS BOOLEAN AS $$
BEGIN
  -- Check direct user permission
  -- Check organization permission
  -- Check role-based permission
  -- Return combined result
END;
$$ LANGUAGE plpgsql;
```

---

## 5. IMPLEMENTATION PRIORITY

### P0 (Critical - Week 1-2)
1. **Conflict Detection API** 🔴
   - Basic overlap detection
   - Real-time conflict alerts
   - ETA: 3 days

2. **Rental Object Permissions** 🔴
   - Database schema
   - Permission check functions
   - Basic API endpoints
   - ETA: 4 days

### P1 (High - Week 3-4)
3. **Recurring Booking Enhancements** 🟡
   - Modify series
   - Cancel single instance
   - iCal RRULE support
   - ETA: 5 days

4. **Conflict Resolution Workflow** 🟡
   - Resolution UI
   - Admin override
   - Alternative suggestions
   - ETA: 3 days

### P2 (Medium - Week 5-6)
5. **Season Auto-Renewal** 🟡
   - Auto-renewal logic
   - Season waitlist
   - ETA: 3 days

6. **Permission Delegation** 🟡
   - Delegation UI
   - Temporary permissions
   - Permission audit log
   - ETA: 2 days

---

## 6. TESTING SCENARIOS

### 6.1 **Conflict Detection Tests**

```typescript
// Test cases needed
test('should detect hard conflict - same time slot', async () => {
  const existing = await createBooking({
    rentalObjectId: 'hall-1',
    startTime: '2026-01-20T10:00:00Z',
    endTime: '2026-01-20T12:00:00Z'
  });
  
  const result = await checkConflict({
    rentalObjectId: 'hall-1',
    startTime: '2026-01-20T11:00:00Z',
    endTime: '2026-01-20T13:00:00Z'
  });
  
  expect(result.hasConflicts).toBe(true);
  expect(result.conflicts[0].type).toBe('HARD');
});

test('should detect buffer conflict - cleanup time', async () => {
  // Object has 30min cleanup time
  const existing = await createBooking({
    rentalObjectId: 'hall-1',
    startTime: '2026-01-20T10:00:00Z',
    endTime: '2026-01-20T12:00:00Z'
  });
  
  const result = await checkConflict({
    rentalObjectId: 'hall-1',
    startTime: '2026-01-20T12:00:00Z', // Starts right after
    endTime: '2026-01-20T14:00:00Z'
  });
  
  expect(result.hasConflicts).toBe(true);
  expect(result.conflicts[0].type).toBe('BUFFER');
});
```

### 6.2 **Permission Tests**

```typescript
test('organization admin can manage org rental objects', async () => {
  const permission = await checkPermission({
    userId: 'org-admin-1',
    rentalObjectId: 'object-1',
    permission: 'canManage'
  });
  
  expect(permission).toBe(true);
});

test('user inherits organization permissions', async () => {
  // Org 'Sports Club' has canBook on 'Tennis Court'
  // User 'john' is member of 'Sports Club'
  const permission = await checkPermission({
    userId: 'john',
    rentalObjectId: 'tennis-court',
    permission: 'canBook'
  });
  
  expect(permission).toBe(true);
  expect(permission.source).toBe('ORGANIZATION');
});
```

---

## 7. DOCUMENTATION NEEDED

### 7.1 **API Documentation**

- [ ] Conflict detection API reference
- [ ] Recurring booking RRULE guide
- [ ] Permission system documentation
- [ ] Conflict resolution workflows

### 7.2 **User Guides**

- [ ] Season rentals guide (Norwegian)
- [ ] Recurring booking tutorial
- [ ] Conflict resolution for admins
- [ ] Permission management for org admins

---

## 📊 **SUMMARY**

| Feature | Current | Target | Gap | Priority |
|---------|---------|--------|-----|----------|
| **Season Rentals** | 80% | 100% | 20% | P2 |
| **Recurring Rentals** | 60% | 100% | 40% | P1 |
| **Conflict Management** | 30% | 100% | 70% | **P0** |
| **Granular Permissions** | 50% | 100% | 50% | **P0** |

**Overall Hidden Features:** 🟡 **55% Complete**

**Critical Gaps:**
1. 🔴 Conflict detection & resolution (P0)
2. 🔴 Rental object permissions (P0)
3. 🟡 Recurring booking enhancements (P1)
4. 🟡 Season auto-renewal (P2)

**Estimated Effort:** 20 days for all features to 100%

---

**Created:** 2026-01-17  
**Updated:** 2026-01-17  
**Status:** 🟡 **NEEDS ATTENTION**  
**Next:** Implement P0 features (Conflicts + Permissions)
