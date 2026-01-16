# DEMO TEST MATRIX
**Date**: 2026-01-16  
**Purpose**: Comprehensive test coverage for Skien Kommune demo

---

## TEST CATEGORIES

### 1. ROLE-BASED JOURNEYS (Playwright E2E)

#### Journey 1: Citizen Booking Flow
**Priority**: CRITICAL  
**Status**: ❌ NOT IMPLEMENTED

**Steps**:
1. Navigate to public rental objects page
2. Browse available objects (verify >= 40 objects)
3. Select a LOCALE object
4. View details (description, capacity, rules, calendar)
5. Select available date range
6. Submit booking request
7. Verify confirmation message
8. Verify booking status = PENDING_APPROVAL

**Expected Results**:
- ✅ All 40+ objects visible
- ✅ Calendar shows availability
- ✅ Booking submission succeeds
- ✅ Status is deterministic
- ✅ RFC7807 errors on conflicts

**Test File**: `e2e/journeys/citizen-booking.spec.ts`

```typescript
test('Citizen can submit booking request', async ({ page }) => {
  await page.goto('/rental-objects');
  
  // Verify object count
  const objects = await page.locator('[data-testid="rental-object-card"]').count();
  expect(objects).toBeGreaterThanOrEqual(40);
  
  // Select first object
  await page.locator('[data-testid="rental-object-card"]').first().click();
  
  // Select dates
  await page.locator('[data-testid="start-date"]').fill('2026-03-01');
  await page.locator('[data-testid="end-date"]').fill('2026-03-03');
  
  // Submit
  await page.locator('[data-testid="submit-booking"]').click();
  
  // Verify success
  await expect(page.locator('[data-testid="booking-status"]')).toContainText('PENDING_APPROVAL');
});
```

---

#### Journey 2: Caseworker Approval Flow
**Priority**: CRITICAL  
**Status**: ❌ NOT IMPLEMENTED

**Steps**:
1. Login as caseworker@demo.no
2. Navigate to bookings queue
3. Filter by PENDING_APPROVAL
4. Select a booking
5. View booking details
6. Approve with reason
7. Verify status change to APPROVED
8. Verify audit log entry

**Expected Results**:
- ✅ Queue shows pending bookings
- ✅ Approval succeeds
- ✅ Status updates immediately
- ✅ Audit log created
- ✅ Citizen receives notification

**Test File**: `e2e/journeys/caseworker-approval.spec.ts`

```typescript
test('Caseworker can approve booking', async ({ page }) => {
  await login(page, 'caseworker@demo.no', 'Demo2026!');
  
  await page.goto('/backoffice/bookings?status=PENDING_APPROVAL');
  
  // Select first pending booking
  await page.locator('[data-testid="booking-row"]').first().click();
  
  // Approve
  await page.locator('[data-testid="approve-button"]').click();
  await page.locator('[data-testid="approval-reason"]').fill('Approved for demo');
  await page.locator('[data-testid="confirm-approve"]').click();
  
  // Verify status
  await expect(page.locator('[data-testid="booking-status"]')).toContainText('APPROVED');
});
```

---

#### Journey 3: Admin Rental Object Management
**Priority**: HIGH  
**Status**: ❌ NOT IMPLEMENTED

**Steps**:
1. Login as admin@demo.no
2. Navigate to rental objects management
3. Create new LOCALE object
4. Configure rules (approval required, age restriction)
5. Set pricing
6. Publish object
7. Verify object appears in public list

**Expected Results**:
- ✅ Object creation succeeds
- ✅ Rules are saved
- ✅ Object is published
- ✅ Appears in public list

**Test File**: `e2e/journeys/admin-rental-object.spec.ts`

---

### 2. API INTEGRATION TESTS

#### Booking API Tests
**Priority**: CRITICAL  
**Status**: ⚠️ PARTIAL

**Test File**: `apps/api/src/modules/booking/__tests__/booking.integration.test.ts`

```typescript
describe('Booking API Integration', () => {
  describe('POST /api/bookings', () => {
    it('should create booking with PENDING_APPROVAL status', async () => {
      const response = await request(app)
        .post('/api/bookings')
        .send({
          rentalObjectId: 'test-locale-1',
          startDate: '2026-03-01',
          endDate: '2026-03-03',
        })
        .expect(201);
      
      expect(response.body.data.status).toBe('PENDING_APPROVAL');
      expect(response.body.data.id).toBeDefined();
    });
    
    it('should return RFC7807 on conflict', async () => {
      const response = await request(app)
        .post('/api/bookings')
        .send({
          rentalObjectId: 'test-locale-1',
          startDate: '2026-03-01', // Already booked
        })
        .expect(409);
      
      expect(response.body.type).toContain('booking-conflict');
      expect(response.body.status).toBe(409);
    });
  });
  
  describe('PATCH /api/bookings/:id/approve', () => {
    it('should approve booking', async () => {
      const response = await request(app)
        .patch('/api/bookings/booking-123/approve')
        .send({ reason: 'Approved' })
        .set('Authorization', 'Bearer caseworker-token')
        .expect(200);
      
      expect(response.body.data.status).toBe('APPROVED');
    });
    
    it('should reject unauthorized access', async () => {
      await request(app)
        .patch('/api/bookings/booking-123/approve')
        .set('Authorization', 'Bearer citizen-token')
        .expect(403);
    });
  });
});
```

---

#### Availability API Tests
**Priority**: CRITICAL  
**Status**: ❌ NOT IMPLEMENTED

**Test File**: `apps/api/src/modules/availability/__tests__/availability.integration.test.ts`

```typescript
describe('Availability API Integration', () => {
  it('should return complete projection', async () => {
    const response = await request(app)
      .get('/api/rental-objects/rental-123/availability')
      .query({
        startDate: '2026-03-01',
        endDate: '2026-03-31',
      })
      .expect(200);
    
    expect(response.body.data.availableSlots).toBeDefined();
    expect(response.body.data.bookedSlots).toBeDefined();
    expect(response.body.data.blockedPeriods).toBeDefined();
  });
  
  it('should detect conflicts', async () => {
    // Create booking
    await createBooking({ startDate: '2026-03-01', endDate: '2026-03-03' });
    
    // Try to book same period
    const response = await request(app)
      .post('/api/bookings')
      .send({
        rentalObjectId: 'rental-123',
        startDate: '2026-03-02', // Overlaps
      })
      .expect(409);
    
    expect(response.body.type).toContain('conflict');
  });
});
```

---

#### RBAC Tests
**Priority**: CRITICAL  
**Status**: ❌ NOT IMPLEMENTED

**Test File**: `apps/api/src/middleware/__tests__/rbac.integration.test.ts`

```typescript
describe('RBAC Middleware', () => {
  const protectedEndpoints = [
    { method: 'PATCH', path: '/api/bookings/:id/approve', role: 'CASEWORKER' },
    { method: 'POST', path: '/api/rental-objects', role: 'ADMIN' },
    { method: 'DELETE', path: '/api/users/:id', role: 'SAAS_ADMIN' },
  ];
  
  protectedEndpoints.forEach(({ method, path, role }) => {
    it(`should require ${role} for ${method} ${path}`, async () => {
      const response = await request(app)
        [method.toLowerCase()](path.replace(':id', '123'))
        .set('Authorization', 'Bearer citizen-token')
        .expect(403);
      
      expect(response.body.type).toContain('forbidden');
    });
  });
});
```

---

### 3. SDK CONTRACT TESTS

#### Parity Tests
**Priority**: HIGH  
**Status**: ❌ NOT IMPLEMENTED

**Test File**: `packages/client-sdk/src/__tests__/api-parity.test.ts`

```typescript
describe('SDK/API Parity', () => {
  it('should have SDK method for every API endpoint', () => {
    const apiEndpoints = getApiEndpoints(); // From OpenAPI spec
    const sdkMethods = getSdkMethods(); // From SDK exports
    
    apiEndpoints.forEach(endpoint => {
      expect(sdkMethods).toContain(endpoint.sdkMethod);
    });
  });
  
  it('should match DTO shapes', () => {
    const apiDtos = getApiDtos();
    const sdkDtos = getSdkDtos();
    
    expect(apiDtos).toEqual(sdkDtos);
  });
});
```

---

### 4. INTEGRATION FRAMEWORK TESTS

#### Mock Adapter Tests
**Priority**: MEDIUM  
**Status**: ❌ NOT IMPLEMENTED

**Test File**: `apps/api/src/integrations/__tests__/mock-adapters.test.ts`

```typescript
describe('Integration Mock Adapters', () => {
  describe('ACOS Mock', () => {
    it('should persist archive event', async () => {
      const adapter = new MockAcosAdapter();
      
      await adapter.archiveBooking('booking-123', {
        title: 'Test Booking',
        metadata: {},
      });
      
      const events = await getIntegrationEvents('ACOS');
      expect(events).toHaveLength(1);
      expect(events[0].externalRef).toBeDefined();
    });
  });
  
  describe('RCO Mock', () => {
    it('should grant access', async () => {
      const adapter = new MockRcoAdapter();
      
      const result = await adapter.grantAccess({
        userId: 'user-123',
        doorId: 'door-456',
        startDate: '2026-03-01',
        endDate: '2026-03-03',
      });
      
      expect(result.accessGrantId).toBeDefined();
    });
  });
});
```

---

## TEST EXECUTION PLAN

### Phase 1: Critical Path (Day 1)
1. ✅ Implement RBAC tests
2. ✅ Implement booking API tests
3. ✅ Implement availability tests
4. ✅ Implement citizen journey E2E

### Phase 2: High Priority (Day 1-2)
5. ✅ Implement caseworker journey E2E
6. ✅ Implement admin journey E2E
7. ✅ Implement SDK parity tests
8. ✅ Implement integration mock tests

### Phase 3: Coverage (Day 2)
9. ✅ Add RFC7807 shape tests
10. ✅ Add negative test cases
11. ✅ Add edge case tests
12. ✅ Add performance tests

---

## TEST DATA REQUIREMENTS

### Demo Seed Data
```typescript
{
  rentalObjects: 40+, // Mix of LOCALE (30+) and ARRANGEMENT (10+)
  users: [
    { email: 'citizen@demo.no', role: 'CITIZEN' },
    { email: 'caseworker@demo.no', role: 'CASEWORKER' },
    { email: 'admin@demo.no', role: 'ADMIN' },
  ],
  bookings: [
    { status: 'PENDING_APPROVAL', ... },
    { status: 'APPROVED', ... },
    { status: 'REJECTED', ... },
  ],
  blocks: [
    { type: 'MAINTENANCE', ... },
    { type: 'BLACKOUT', ... },
  ],
}
```

---

## CI/CD INTEGRATION

### Test Commands
```bash
# Unit tests
pnpm test:unit

# Integration tests
pnpm test:integration

# E2E tests
pnpm test:e2e

# All tests
pnpm test:all

# Coverage report
pnpm test:coverage
```

### CI Pipeline
```yaml
test:
  - unit-tests
  - integration-tests
  - e2e-tests
  - coverage-check (>= 80%)
```

---

## SUCCESS CRITERIA

- ✅ All critical path tests passing
- ✅ All E2E journeys complete successfully
- ✅ RBAC enforcement verified
- ✅ RFC7807 compliance verified
- ✅ >= 80% code coverage
- ✅ All tests deterministic and CI-ready

---

**Report Generated**: 2026-01-16 11:25:00  
**Status**: Test implementation required
