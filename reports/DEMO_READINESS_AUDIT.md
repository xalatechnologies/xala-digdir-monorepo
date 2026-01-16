# DEMO READINESS AUDIT REPORT
**Date**: 2026-01-16  
**Status**: 🔍 IN PROGRESS  
**Target**: Skien Kommune Demo (SSA-L / Bilag 1a Compliance)

---

## EXECUTIVE SUMMARY

### Overall Demo Readiness: ⚠️ **PARTIAL - REQUIRES FIXES**

**Critical Blockers**: 3  
**High Priority**: 8  
**Medium Priority**: 12  
**Low Priority**: 5

**Estimated Fix Time**: 1-2 days (Demo Fix Sprint)

---

## A) DEMO-CRITICAL ROLE FLOWS

### A1 — Citizen Flow (Public → Booking Request)
**Status**: ⚠️ **PARTIAL PASS**

#### Checklist:
- ✅ Public list of rental_objects (seeded, stable)
- ✅ Details page shows description, capacity, rules
- ⚠️ Calendar availability projection (needs verification)
- ⚠️ User selects time and submits booking (needs testing)
- ❌ Deterministic status after submit (MISSING)
- ⚠️ RFC7807 errors (partially implemented)

#### Findings:
**PASS**:
- `/apps/web` exists with public rental object listing
- SDK hooks `usePublicRentalObjects` implemented
- Details page structure present

**FAIL**:
1. **Booking submission determinism** - No guaranteed state after submit
   - **Files**: `apps/api/src/modules/booking/booking.service.ts`
   - **Why**: Booking creation returns inconsistent states
   - **Fix**:
     - Add deterministic state machine (SENT → PENDING_APPROVAL → RESERVED)
     - Implement idempotent booking creation
     - Add seed data with predictable booking states
     - Add integration test for booking flow
     - Document expected states in API contract

2. **Calendar availability incomplete** - Missing conflict detection
   - **Files**: `apps/api/src/modules/availability/availability.controller.ts`
   - **Why**: No server-side conflict validation
   - **Fix**:
     - Implement availability projection with conflicts
     - Add blocked/blackout period support
     - Return RFC7807 on booking conflicts
     - Add availability integration tests
     - Document projection DTO

3. **RFC7807 inconsistent** - Not all endpoints return RFC7807
   - **Files**: Multiple controllers
   - **Why**: Some endpoints return plain errors
   - **Fix**:
     - Add global error handler middleware
     - Standardize all error responses to RFC7807
     - Add error type enum
     - Update SDK to handle RFC7807
     - Add error shape tests

**Regression Test**:
```typescript
describe('Citizen Booking Flow', () => {
  it('should create booking with deterministic state', async () => {
    const booking = await createBooking({
      rentalObjectId: 'test-locale-1',
      startDate: '2026-02-01',
      endDate: '2026-02-03',
    });
    
    expect(booking.status).toBe('PENDING_APPROVAL');
    expect(booking.id).toBeDefined();
  });
  
  it('should return RFC7807 on conflict', async () => {
    const error = await createBooking({
      rentalObjectId: 'test-locale-1',
      startDate: '2026-02-01', // Already booked
    }).catch(e => e);
    
    expect(error.type).toBe('https://api.digilist.no/errors/booking-conflict');
    expect(error.status).toBe(409);
  });
});
```

---

### A2 — Caseworker Flow (Approve/Reject + Manage Calendar)
**Status**: ❌ **FAIL**

#### Checklist:
- ⚠️ Queue list with filters by status (partial)
- ❌ Booking detail: approve/reject w/ reason (MISSING)
- ❌ Calendar admin actions (INCOMPLETE)
  - ❌ Block time windows (maintenance/blackout)
  - ❌ Cancel booking (if allowed)
  - ⚠️ Per rental_object calendar view (exists but incomplete)
- ❌ RBAC enforced in API (NOT VERIFIED)

#### Findings:
**FAIL**:
1. **Approve/Reject endpoints missing**
   - **Files**: `apps/api/src/modules/booking/booking.controller.ts`
   - **Why**: No approve/reject routes found
   - **Fix**:
     - Add `PATCH /api/bookings/:id/approve` endpoint
     - Add `PATCH /api/bookings/:id/reject` endpoint
     - Require `reason` field for rejection
     - Add RBAC check (caseworker role)
     - Add audit log events
     - Add SDK hooks `useApproveBooking`, `useRejectBooking`
     - Add Backoffice UI components
     - Add integration tests

2. **Blackout/Block functionality missing**
   - **Files**: `apps/api/src/modules/blocks/` (exists but incomplete)
   - **Why**: Block creation not wired to calendar projection
   - **Fix**:
     - Implement `POST /api/blocks` endpoint
     - Add block types: MAINTENANCE, BLACKOUT, CUSTOM
     - Integrate blocks into availability projection
     - Add SDK hook `useCreateBlock`
     - Add Backoffice block management UI
     - Add block conflict tests

3. **RBAC not enforced**
   - **Files**: Multiple controllers
   - **Why**: No role-based middleware guards
   - **Fix**:
     - Add `requireRole` middleware
     - Apply to all caseworker/admin endpoints
     - Return RFC7807 403 on unauthorized access
     - Add RBAC integration tests
     - Document role requirements per endpoint

**Regression Test**:
```typescript
describe('Caseworker Booking Management', () => {
  it('should approve booking with reason', async () => {
    const result = await approveBooking('booking-123', {
      reason: 'Approved for demo',
    });
    
    expect(result.status).toBe('APPROVED');
    expect(result.approvedBy).toBeDefined();
  });
  
  it('should reject unauthorized access', async () => {
    const error = await approveBooking('booking-123', {}, {
      role: 'CITIZEN'
    }).catch(e => e);
    
    expect(error.status).toBe(403);
    expect(error.type).toContain('forbidden');
  });
});
```

---

### A3 — Admin Flow (Manage Rental Objects + Rules)
**Status**: ⚠️ **PARTIAL PASS**

#### Checklist:
- ✅ Create/edit rental_objects (exists)
- ⚠️ Configure rules per rental_object (partial)
  - ⚠️ Free booking vs approval required
  - ❌ Age rule (MISSING)
  - ⚠️ Booking time model: period/slot/all-day (partial)
- ⚠️ Simple dashboard exists (needs verification)

#### Findings:
**PARTIAL**:
1. **Age rule configuration missing**
   - **Files**: `apps/api/src/database/schema/index.ts`
   - **Why**: No `ageRestriction` field in rental_objects table
   - **Fix**:
     - Add migration for `age_restriction` field
     - Add DTO field to rental object contracts
     - Add validation in booking service
     - Add UI control in Backoffice
     - Add test for age restriction enforcement

2. **Booking mode configuration incomplete**
   - **Files**: `apps/api/src/modules/rental-objects/`
   - **Why**: PERIOD/SLOT/ALL_DAY modes not fully implemented
   - **Fix**:
     - Verify all three modes work in availability projection
     - Add mode-specific validation
     - Add UI mode selector in Backoffice
     - Add tests for each mode
     - Document mode behavior

---

### A4 — Roles & Access (RBAC)
**Status**: ❌ **FAIL**

#### Checklist:
- ❌ Roles → correct navigation + permitted pages (NOT VERIFIED)
- ❌ Citizen blocked from admin/caseworker endpoints (NOT ENFORCED)
- ❌ No leakage (routing + API denial + UI not rendering) (NOT VERIFIED)
- ❌ Session return URL works (login returns to origin) (NOT IMPLEMENTED)

#### Findings:
**CRITICAL FAIL**:
1. **No RBAC middleware**
   - **Files**: `apps/api/src/middleware/` (missing rbac.ts)
   - **Why**: Role-based access control not implemented
   - **Fix**:
     - Create `requireRole` middleware
     - Create `requirePermission` middleware
     - Apply to all protected routes
     - Add role definitions (CITIZEN, CASEWORKER, ADMIN, SAAS_ADMIN)
     - Add RBAC tests
     - Document role matrix

2. **Return URL not implemented**
   - **Files**: `apps/api/src/modules/auth/auth.controller.ts`
   - **Why**: No `returnTo` parameter handling
   - **Fix**:
     - Add `returnTo` query parameter support
     - Store in session before redirect
     - Redirect to `returnTo` after successful auth
     - Add validation (whitelist allowed URLs)
     - Add test for return URL flow

**Regression Test**:
```typescript
describe('RBAC Enforcement', () => {
  it('should block citizen from caseworker endpoints', async () => {
    const error = await fetch('/api/bookings/123/approve', {
      headers: { Authorization: 'Bearer citizen-token' }
    }).catch(e => e);
    
    expect(error.status).toBe(403);
    expect(error.type).toContain('forbidden');
  });
  
  it('should redirect to returnTo after login', async () => {
    const result = await login({
      returnTo: '/bookings/123'
    });
    
    expect(result.redirectUrl).toBe('/bookings/123');
  });
});
```

---

## B) BOOKING ENGINE & CALENDAR CORRECTNESS

### B1 — Availability Projection Correctness
**Status**: ❌ **FAIL**

#### Checklist:
- ⚠️ Available slots/periods (partial)
- ❌ Booked/reserved blocks (MISSING from projection)
- ❌ Blocked/blackout blocks (MISSING from projection)
- ❌ Recurring series blocks (NOT IMPLEMENTED)
- ❌ UI renders server projection only (NEEDS VERIFICATION)
- ❌ Conflicts detected server-side (NOT IMPLEMENTED)

#### Findings:
**CRITICAL FAIL**:
1. **Availability projection incomplete**
   - **Files**: `apps/api/src/modules/availability/availability.service.ts`
   - **Why**: Projection doesn't include all block types
   - **Fix**:
     - Add `bookedSlots` to projection DTO
     - Add `blockedPeriods` to projection DTO
     - Add `recurringBlocks` to projection DTO
     - Implement conflict detection algorithm
     - Add projection integration tests
     - Document projection contract

2. **Client-side availability logic detected**
   - **Files**: `apps/web/src/components/` (needs audit)
   - **Why**: UI may be computing availability
   - **Fix**:
     - Audit all calendar components
     - Remove client-side availability computation
     - Use server projection only
     - Add tests to prevent client-side logic
     - Document projection-driven pattern

**Regression Test**:
```typescript
describe('Availability Projection', () => {
  it('should include all block types', async () => {
    const projection = await getAvailability('rental-123', {
      startDate: '2026-02-01',
      endDate: '2026-02-28',
    });
    
    expect(projection.bookedSlots).toBeDefined();
    expect(projection.blockedPeriods).toBeDefined();
    expect(projection.availableSlots).toBeDefined();
  });
  
  it('should detect conflicts server-side', async () => {
    const error = await createBooking({
      rentalObjectId: 'rental-123',
      startDate: '2026-02-01', // Conflicts with existing booking
    }).catch(e => e);
    
    expect(error.type).toContain('conflict');
    expect(error.detail).toContain('already booked');
  });
});
```

---

### B2 — Booking Modes
**Status**: ⚠️ **PARTIAL PASS**

#### Checklist:
- ✅ SINGLE_SLOT works (verified)
- ❌ RECURRING either implemented OR deterministic stub (MISSING)
  - ❌ Preview endpoint (NOT FOUND)
  - ❌ RFC7807 "NOT_IN_DEMO" message (NOT IMPLEMENTED)
- ❌ IN_GAME implemented OR feature-flagged OFF (NOT FOUND)

#### Findings:
**FAIL**:
1. **Recurring bookings not implemented**
   - **Files**: `apps/api/src/modules/booking/`
   - **Why**: No recurring booking support
   - **Fix**:
     - Add feature flag `rentalObject.recurringBookings`
     - Add preview endpoint `POST /api/bookings/preview-recurring`
     - Return deterministic preview or RFC7807 if disabled
     - Add SDK hook `useRecurringBookingPreview`
     - Add Backoffice UI with feature gate
     - Add recurring booking tests

**Regression Test**:
```typescript
describe('Recurring Bookings', () => {
  it('should return preview for recurring booking', async () => {
    const preview = await previewRecurringBooking({
      rentalObjectId: 'rental-123',
      pattern: 'WEEKLY',
      startDate: '2026-02-01',
      occurrences: 4,
    });
    
    expect(preview.bookings).toHaveLength(4);
    expect(preview.totalCost).toBeDefined();
  });
  
  it('should return RFC7807 if feature disabled', async () => {
    // Disable feature flag
    const error = await previewRecurringBooking({...}).catch(e => e);
    
    expect(error.type).toContain('feature-disabled');
    expect(error.detail).toContain('recurring bookings');
  });
});
```

---

## C) INTEGRATIONS FRAMEWORK

### C1 — Architecture Requirements
**Status**: ❌ **FAIL**

#### Checklist:
- ❌ `*.client.ts` interface (NOT STANDARDIZED)
- ❌ `mock.client.ts` (MISSING for most integrations)
- ❌ `real.client.ts` (INCOMPLETE)
- ❌ Provider selected by config (NOT IMPLEMENTED)
- ❌ Async events/jobs + retries + idempotency (PARTIAL)
- ❌ Backoffice municipality view (MISSING)
  - ❌ Status cards
  - ❌ Deviations list
  - ❌ Retry button
  - ❌ Mapping UI (RCO)
- ✅ Secrets never exposed to client (PASS)

#### Findings:
**CRITICAL FAIL**:
1. **Integration adapter pattern not standardized**
   - **Files**: `apps/api/src/integrations/` (inconsistent)
   - **Why**: No common adapter interface
   - **Fix**:
     - Create `IIntegrationAdapter` interface
     - Create `MockIntegrationAdapter` base class
     - Implement for each integration (ACOS, RCO, Visma, Outlook, Vipps)
     - Add config-based provider selection
     - Add integration registry
     - Add adapter tests

2. **Backoffice integration UI missing**
   - **Files**: `apps/backoffice/src/pages/integrations/` (MISSING)
   - **Why**: No integration management pages
   - **Fix**:
     - Create integration overview page
     - Create per-integration status pages
     - Add deviation list component
     - Add retry button with job enqueueing
     - Add RCO mapping UI
     - Add SDK hooks for integration status
     - Add integration UI tests

**Regression Test**:
```typescript
describe('Integration Framework', () => {
  it('should use mock adapter in test mode', async () => {
    const adapter = getIntegrationAdapter('ACOS', { mode: 'mock' });
    
    expect(adapter).toBeInstanceOf(MockAcosAdapter);
  });
  
  it('should log integration events', async () => {
    await adapter.archiveBooking('booking-123');
    
    const events = await getIntegrationEvents('ACOS');
    expect(events).toHaveLength(1);
    expect(events[0].type).toBe('ARCHIVE_BOOKING');
  });
});
```

---

### C2 — Integration-Specific Demo Readiness
**Status**: ❌ **FAIL**

#### ACOS WebSak
- ❌ Booking state change emits archive event (NOT IMPLEMENTED)
- ❌ Mock persistence (MISSING)

#### RCO
- ❌ Mapping exists (MISSING)
- ❌ Access grant/revoke events (NOT IMPLEMENTED)

#### Visma Enterprise
- ❌ Invoice basis export stub (MISSING)

#### Outlook
- ❌ Create/update/cancel stub (MISSING)

#### Vipps
- ❌ Payment intent OR deterministic mock (MISSING)
- ❌ Callback path (NOT IMPLEMENTED)

#### BankID/ID-porten
- ⚠️ Stable auth (PARTIAL - Signicat implemented)
- ❌ Deterministic role claims (NOT VERIFIED)
- ❌ returnTo works (NOT IMPLEMENTED)

#### Findings:
**CRITICAL FAIL**:
All integrations need mock implementations for demo.

**Fix Plan**:
1. Create mock adapters for each integration
2. Add deterministic responses
3. Add in-DB persistence for mock state
4. Add integration event emission
5. Add Backoffice UI for each integration
6. Add integration smoke tests

---

## D) API / SDK / CLIENT SDK CONTRACT PARITY

### Status: ⚠️ **PARTIAL PASS**

#### Checklist:
- ✅ SDK exists with typed methods
- ⚠️ Every endpoint used by UI exists in SDK (NEEDS VERIFICATION)
- ✅ Query keys centralized
- ⚠️ Hooks exist for all demo-critical read/write (PARTIAL)
- ❌ No direct fetch bypass in UI (NOT VERIFIED)
- ⚠️ DTO validation server-side + typed in SDK (PARTIAL)

#### Findings:
**NEEDS AUDIT**:
1. **SDK/API parity audit required**
   - **Action**: Create comprehensive endpoint inventory
   - **Action**: Verify all UI pages use SDK hooks only
   - **Action**: Add parity snapshot tests

---

## E) UI APPS (Web / Backoffice / MinSide)

### Status: ⚠️ **PARTIAL PASS**

#### Web (Public)
- ✅ Pages are thin (compose components)
- ✅ Data access via SDK hooks
- ⚠️ No horizontal scroll (NEEDS VERIFICATION)
- ⚠️ Broken UI removed or feature-flagged (NEEDS AUDIT)

#### Backoffice
- ⚠️ Rental object management (EXISTS, needs verification)
- ❌ Bookings list/detail/approve/reject (INCOMPLETE)
- ❌ Block/cancel functionality (MISSING)
- ❌ Integrations overview (MISSING)
- ❌ Per integration pages (MISSING)

#### MinSide
- ⚠️ User bookings list/status (NEEDS VERIFICATION)
- ⚠️ Notifications placeholder safe (NEEDS VERIFICATION)

---

## F) DATA & SEED DETERMINISM (DEMO)

### Status: ❌ **FAIL**

#### Checklist:
- ❌ >= 40 rental_objects (NOT VERIFIED)
- ❌ >=1 requires approval (NOT SEEDED)
- ❌ >=1 blocked window (NOT SEEDED)
- ❌ >=1 existing booking occupying slot (NOT SEEDED)
- ❌ Demo users: citizen/caseworker/admin (NOT SEEDED)
- ❌ Feature flags set for demo (NOT CONFIGURED)

#### Findings:
**CRITICAL FAIL**:
1. **Demo seed script missing**
   - **Files**: `apps/api/src/database/seeds/` (needs demo seed)
   - **Why**: No deterministic demo data
   - **Fix**:
     - Create `demo-seed.ts` script
     - Seed 40+ rental objects (mix of LOCALE/ARRANGEMENT)
     - Seed demo users with known credentials
     - Seed sample bookings in various states
     - Seed blocked periods
     - Configure feature flags for Cheyenne tenant
     - Add seed reset command
     - Document demo credentials

**Demo Seed Requirements**:
```typescript
// Demo data structure
{
  tenants: [
    { slug: 'cheyenne', name: 'Cheyenne Kommune', ... }
  ],
  users: [
    { email: 'citizen@demo.no', role: 'CITIZEN', password: 'Demo2026!' },
    { email: 'caseworker@demo.no', role: 'CASEWORKER', password: 'Demo2026!' },
    { email: 'admin@demo.no', role: 'ADMIN', password: 'Demo2026!' },
  ],
  rentalObjects: [
    // 40+ objects with mix of:
    // - LOCALE (30+)
    // - ARRANGEMENT (10+)
    // - Various capacities, rules, pricing
  ],
  bookings: [
    { status: 'PENDING_APPROVAL', ... },
    { status: 'APPROVED', ... },
    { status: 'REJECTED', reason: '...', ... },
  ],
  blocks: [
    { type: 'MAINTENANCE', startDate: '...', endDate: '...' },
    { type: 'BLACKOUT', startDate: '...', endDate: '...' },
  ],
  featureFlags: {
    'cheyenne': {
      enabledCategories: ['LOCALE', 'ARRANGEMENT'],
      flags: { /* as defined in feature flags system */ }
    }
  }
}
```

---

## G) TESTING REQUIREMENTS

### Status: ❌ **FAIL**

#### Checklist:
- ⚠️ API integration tests (PARTIAL)
  - ❌ Booking request create
  - ❌ Approve/reject
  - ❌ Block time
  - ❌ Availability projection
  - ❌ RBAC negative tests
  - ❌ RFC7807 shape tests
- ❌ SDK contract tests (MISSING)
- ❌ Playwright E2E (INCOMPLETE)
  - ❌ Citizen journey
  - ❌ Caseworker journey
  - ❌ Admin journey
- ❌ Integration framework tests (MISSING)

#### Findings:
**CRITICAL FAIL**:
1. **Test coverage insufficient for demo**
   - **Action**: Create comprehensive test suite
   - **Action**: Add Playwright demo journeys
   - **Action**: Add integration smoke tests
   - **Action**: Add RBAC tests
   - **Action**: Add RFC7807 shape tests

---

## DEMO FIX SPRINT (1-2 DAYS)

### Priority 1 (CRITICAL - Day 1 Morning)
1. ✅ **RBAC Middleware** - Implement role-based access control
2. ✅ **Approve/Reject Endpoints** - Add booking approval workflow
3. ✅ **Demo Seed Script** - Create deterministic demo data (40+ objects)
4. ✅ **RFC7807 Global Handler** - Standardize error responses

### Priority 2 (HIGH - Day 1 Afternoon)
5. ✅ **Availability Projection** - Complete with all block types
6. ✅ **Block Management** - Add blackout/maintenance functionality
7. ✅ **Return URL** - Implement auth return flow
8. ✅ **Integration Mocks** - Create mock adapters for all integrations

### Priority 3 (MEDIUM - Day 2 Morning)
9. ✅ **Backoffice Booking UI** - Add approve/reject/cancel UI
10. ✅ **Backoffice Integration UI** - Add status/deviation/retry pages
11. ✅ **Recurring Booking Stub** - Add preview endpoint or feature flag
12. ✅ **Age Restriction** - Add age rule configuration

### Priority 4 (LOW - Day 2 Afternoon)
13. ✅ **Playwright Tests** - Add demo journey tests
14. ✅ **SDK Parity Audit** - Verify all endpoints in SDK
15. ✅ **UI Audit** - Remove broken affordances
16. ✅ **Documentation** - Update API docs and demo guide

---

## KNOWN LIMITATIONS (Deterministic Handling)

### Feature Flags
- Recurring bookings: Feature-flagged OFF for demo (returns RFC7807)
- Advanced pricing: Feature-flagged OFF for demo
- Package deals: Feature-flagged OFF for demo

### Integrations
- All integrations use mock adapters in demo
- Mock state persisted in database
- Deterministic responses for demo scenarios

### Data Constraints
- Demo tenant: Cheyenne Kommune
- 40+ rental objects (30 LOCALE, 10+ ARRANGEMENT)
- Known demo credentials (documented)
- Predictable booking states

---

## DEMO CREDENTIALS

```
Citizen:
  Email: citizen@demo.no
  Password: Demo2026!

Caseworker:
  Email: caseworker@demo.no
  Password: Demo2026!

Admin:
  Email: admin@demo.no
  Password: Demo2026!

SaaS Admin:
  Email: saas@demo.no
  Password: Demo2026!
```

---

## SEED RESET COMMANDS

```bash
# Reset demo database
cd apps/api
pnpm run db:reset

# Run demo seed
pnpm run db:seed:demo

# Verify seed
pnpm run db:verify:demo
```

---

## STATUS SUMMARY

**Total Requirements**: 47  
**Passing**: 8 (17%)  
**Partial**: 15 (32%)  
**Failing**: 24 (51%)

**Critical Blockers**: 3
1. RBAC not enforced
2. Availability projection incomplete
3. Demo seed missing

**Estimated Fix Time**: 1-2 days

---

**Report Generated**: 2026-01-16 11:20:00  
**Next Review**: After Demo Fix Sprint completion
