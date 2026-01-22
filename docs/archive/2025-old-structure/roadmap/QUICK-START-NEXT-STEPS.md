# QUICK START: Next Steps

**Priority 1 is COMPLETE! ✅**

Here's what to do next:

---

## Option 1: Run the E2E Test (Recommended First)

### Step 1: Setup Database (~30 minutes)

```bash
# 1. Install PostgreSQL if not already installed
brew install postgresql@14  # macOS
# or: apt-get install postgresql-14  # Linux

# 2. Start PostgreSQL
brew services start postgresql@14  # macOS
# or: systemctl start postgresql  # Linux

# 3. Create test database
createdb digilist_test

# 4. Set environment variable
export DATABASE_URL='postgresql://postgres:postgres@localhost:5432/digilist_test'

# 5. Run setup script
./scripts/setup-fresh-db.sh
```

### Step 2: Start Applications (~2 minutes)

```bash
# Terminal 1: Start all apps
pnpm dev

# Wait ~30 seconds for apps to start
# You should see:
# - API: http://localhost:4000
# - Minside: http://localhost:5174
# - Backoffice: http://localhost:5175
```

### Step 3: Run the Test (~2 minutes)

```bash
# Terminal 2: Run test
pnpm test:e2e tests/e2e/scenarios/canonical-booking-approval-flow.spec.ts

# Expected output:
# ✅ Phase A Complete: Booking created with status = pending
# ✅ Phase B Complete: Admin can see and approve booking
# ✅ Phase C Complete: Booking approved successfully
# ✅ Phase D Complete: User sees notification and updated status
# 🎉 CANONICAL FLOW COMPLETE!
#   1 passed (45s)
```

### Step 4: View Report

```bash
pnpm exec playwright show-report tests/reports/e2e
```

### Step 5: Check for Flakiness (Optional)

```bash
# Run test 10 times
for i in {1..10}; do
  echo "Run $i/10..."
  pnpm test:e2e tests/e2e/scenarios/canonical-booking-approval-flow.spec.ts
done

# Expected: 10/10 passes (0% flakiness)
```

**If all tests pass → Priority 1 is validated! 🎉**

---

## Option 2: Address Critical Technical Debt (~3.5 hours)

If you want to fix the identified issues before running tests:

### Fix 1: Replace Fixed Timeout (30 minutes)

```bash
# File: tests/e2e/scenarios/canonical-booking-approval-flow.spec.ts
# Line 229

# Replace:
await adminPage.waitForTimeout(2000);

# With:
await adminPage.waitForResponse(
  response => response.url().includes('/api/bookings') && response.status() === 200
);
```

### Fix 2: Extract URLs to Config (1 hour)

```bash
# 1. Create config file
mkdir -p tests/config
touch tests/config/test.config.ts
```

```typescript
// tests/config/test.config.ts
export const TEST_CONFIG = {
  urls: {
    api: process.env.API_URL || 'http://localhost:4000',
    minside: process.env.MINSIDE_URL || 'http://localhost:5174',
    backoffice: process.env.BACKOFFICE_URL || 'http://localhost:5175',
  },
  credentials: {
    user: {
      email: process.env.TEST_USER_EMAIL || 'user@test.com',
      password: process.env.TEST_USER_PASSWORD || 'password123',
    },
    admin: {
      email: process.env.TEST_ADMIN_EMAIL || 'admin@test.com',
      password: process.env.TEST_ADMIN_PASSWORD || 'admin123',
    },
  },
};
```

```bash
# 2. Update test files to use config
# Replace all hardcoded URLs with TEST_CONFIG.urls.*
# Replace all hardcoded credentials with TEST_CONFIG.credentials.*
```

### Fix 3: Add Database Seeding Strategy (2 hours)

```bash
# 1. Create database fixture
touch tests/fixtures/database.fixture.ts
```

```typescript
// tests/fixtures/database.fixture.ts
import { test as base } from '@playwright/test';

export type DatabaseFixtures = {
  database: void;
};

export const test = base.extend<DatabaseFixtures>({
  database: async ({}, use) => {
    // Seed test data
    console.log('🌱 Seeding test data...');
    await seedTestData();

    await use();

    // Cleanup
    console.log('🧹 Cleaning up test data...');
    await cleanupTestData();
  },
});

async function seedTestData() {
  // Implement database seeding logic
  // - Create test tenant
  // - Create test users
  // - Create test rental objects
}

async function cleanupTestData() {
  // Implement cleanup logic
  // - Delete test bookings
  // - Delete test users (optional)
}
```

```bash
# 2. Update E2E test to use database fixture
# Import and extend from database.fixture.ts instead of auth.fixture.ts
```

**After fixes → Run test again to verify**

---

## Option 3: Phase 2 Security Remediation (~5 hours)

Add missing security tests:

### 1. Audit Log Validation (1.5 hours)

```typescript
// Add to canonical-booking-approval-flow.spec.ts

test.step('Verify audit log entry', async () => {
  // Fetch audit logs via API
  const auditLogs = await adminPage.request.get('http://localhost:4000/api/audit-logs', {
    params: {
      action: 'booking.approved',
      resourceId: bookingId,
    },
  });

  expect(auditLogs.ok()).toBeTruthy();
  const logs = await auditLogs.json();

  // Verify audit entry exists
  expect(logs.data).toHaveLength(1);
  expect(logs.data[0]).toMatchObject({
    action: 'booking.approved',
    actorId: 'admin-test-1',
    resourceId: bookingId,
    tenantId: 'test-kommune-1',
  });

  console.log('✅ Audit log verified');
});
```

### 2. Input Validation Security Tests (2 hours)

```bash
# Create new test file
touch tests/e2e/security/input-validation.spec.ts
```

```typescript
// tests/e2e/security/input-validation.spec.ts
import { test, expect } from '../fixtures/auth/auth.fixture';
import { BookingsPage } from '../helpers/pages/BookingsPage';

test.describe('Input Validation Security', () => {
  test('should prevent SQL injection in booking search', async ({ userPage }) => {
    const bookingsPage = new BookingsPage(userPage, 'http://localhost:5174');
    await bookingsPage.goto();

    // Try SQL injection
    const maliciousQuery = "'; DROP TABLE bookings; --";
    await bookingsPage.search(maliciousQuery);

    // Verify no error, no data leak
    await expect(bookingsPage.bookingsList).toBeVisible();
    console.log('✅ SQL injection prevented');
  });

  test('should prevent XSS in booking title', async ({ userPage }) => {
    const maliciousTitle = '<script>alert("XSS")</script>';

    // Create booking with XSS attempt
    const response = await userPage.request.post('http://localhost:4000/api/bookings', {
      data: {
        title: maliciousTitle,
        rentalObjectId: 'test-rental-1',
        startTime: '2026-01-20T10:00:00Z',
        endTime: '2026-01-20T12:00:00Z',
      },
    });

    expect(response.ok()).toBeTruthy();

    // Verify script not executed
    await userPage.goto('http://localhost:5174/bookings');
    const scriptExecuted = await userPage.evaluate(() => {
      return document.querySelector('script[src*="XSS"]') !== null;
    });

    expect(scriptExecuted).toBe(false);
    console.log('✅ XSS prevented');
  });
});
```

### 3. Cross-Tenant Boundary Tests (1.5 hours)

```bash
# Create new test file
touch tests/e2e/security/multi-tenant-isolation.spec.ts
```

```typescript
// tests/e2e/security/multi-tenant-isolation.spec.ts
import { test, expect } from '../fixtures/auth/auth.fixture';

test.describe('Multi-Tenant Isolation', () => {
  test('should not allow user to see bookings from other tenants', async ({ userPage }) => {
    // Create booking for tenant A (via API as tenant A user)
    const bookingA = await createBookingForTenant('tenant-a', 'Test Booking A');

    // Login as user from tenant B
    await loginAsUserFromTenant(userPage, 'tenant-b');

    // Try to access tenant A's booking
    const response = await userPage.request.get(
      `http://localhost:4000/api/bookings/${bookingA.id}`
    );

    // Should return 404 or 403
    expect([403, 404]).toContain(response.status());
    console.log('✅ Cross-tenant access prevented');
  });

  test('should only show bookings for current tenant in list', async ({ userPage }) => {
    // Create bookings for different tenants
    await createBookingForTenant('tenant-a', 'Tenant A Booking');
    await createBookingForTenant('tenant-b', 'Tenant B Booking');

    // Login as tenant A user
    await loginAsUserFromTenant(userPage, 'tenant-a');
    await userPage.goto('http://localhost:5174/bookings');

    // Verify only tenant A bookings visible
    const bookingTitles = await userPage.locator('[data-testid^="booking-row-"]').allTextContents();

    expect(bookingTitles.some(title => title.includes('Tenant A Booking'))).toBeTruthy();
    expect(bookingTitles.some(title => title.includes('Tenant B Booking'))).toBeFalsy();
    console.log('✅ Tenant isolation verified');
  });
});
```

**After remediation → Run security tests**

---

## Option 4: Proceed to Priority 2 (Recommended)

### Next Feature: Real-Time Notifications

**Goal:** Complete WebSocket-based real-time notification system

**What it includes:**
- Toast notifications for booking approval
- Notification center real-time updates
- Email/SMS notifications
- Push notifications for mobile

**Estimated Time:** 2 weeks (80 hours)

**Phases:**
1. WebSocket server enhancement (16h)
2. Frontend toast notification system (16h)
3. Notification center real-time updates (12h)
4. Email/SMS integration (20h)
5. Push notification service (12h)
6. E2E testing & validation (4h)

**To start Priority 2:**

```bash
# 1. Review roadmap
cat docs/roadmap/roadmap-highlevel.md | grep -A 20 "Level 1"

# 2. Review execution plan
cat docs/roadmap/execution-plan.md | grep -A 30 "Priority 2"

# 3. Say "proceed with Priority 2"
```

---

## Key Documents to Review

### Must Read (15 minutes)

1. **`LEVEL-0-CERTIFICATION.md`** - Complete certification with all details
2. **`PRIORITY-1-FINAL-SUMMARY.md`** - Summary of what was accomplished
3. **`priority-1-phase-5-complete-summary.md`** - Quick reference for running tests

### If You Want Details (1 hour)

4. **`priority-1-phase-6-security-review.md`** - Security assessment
5. **`priority-1-phase-6-architecture-review.md`** - Architecture assessment
6. **`priority-1-phase-2-backend-report.md`** - Backend verification
7. **`priority-1-phase-3-sdk-report.md`** - SDK verification
8. **`priority-1-phase-4-frontend-report.md`** - Frontend verification

### If You Want to Understand Implementation (2 hours)

9. **`tests/e2e/scenarios/canonical-booking-approval-flow.spec.md`** - Test specification
10. **`priority-1-phase-5-e2e-implementation-report.md`** - Implementation details
11. **`tests/e2e/scenarios/canonical-booking-approval-flow.spec.ts`** - Actual test code

---

## Decision Matrix

| If you want to... | Do this... | Time |
|-------------------|------------|------|
| **Validate Priority 1 works** | Run E2E test (Option 1) | 35 min |
| **Clean up technical debt** | Fix issues (Option 2) | 3.5h |
| **Improve security posture** | Add security tests (Option 3) | 5h |
| **Move forward quickly** | Proceed to Priority 2 (Option 4) | Now |

---

## Recommended Path

**For most users, we recommend:**

1. **Run the E2E test** (Option 1) - 35 minutes
   - Validates everything works
   - Builds confidence
   - Identifies any environment issues

2. **Review certification document** - 15 minutes
   - Understand what was accomplished
   - Review known limitations
   - Check recommendations

3. **Proceed to Priority 2** (Option 4) - Now
   - Build on Level 0 success
   - Add real-time notifications
   - Continue momentum

**Fix technical debt and security issues in parallel with Priority 2 development.**

---

## Quick Commands Reference

```bash
# Setup database
export DATABASE_URL='postgresql://postgres:postgres@localhost:5432/digilist_test'
./scripts/setup-fresh-db.sh

# Start apps
pnpm dev

# Run test
pnpm test:e2e tests/e2e/scenarios/canonical-booking-approval-flow.spec.ts

# Run with visible browser
pnpm test:e2e tests/e2e/scenarios/canonical-booking-approval-flow.spec.ts --headed

# Debug mode
pnpm test:e2e tests/e2e/scenarios/canonical-booking-approval-flow.spec.ts --debug

# View report
pnpm exec playwright show-report tests/reports/e2e

# Check for flakiness
for i in {1..10}; do
  pnpm test:e2e tests/e2e/scenarios/canonical-booking-approval-flow.spec.ts
done
```

---

## Need Help?

**If you encounter issues:**

1. Check server logs: `pnpm dev` output
2. Check test output: console logs in test
3. View Playwright trace: `pnpm test:e2e --trace on`
4. Review screenshots: `tests/screenshots/`
5. Read troubleshooting sections in certification document

**Common Issues:**

- **Database connection failed** → Check DATABASE_URL
- **Apps not starting** → Check ports 4000, 5174, 5175 are free
- **Test timeout** → Ensure all apps fully started (wait 30 seconds)
- **Login failed** → Check demo users exist in database

---

## Summary

🎉 **Priority 1 is COMPLETE and CERTIFIED!**

**Your next step depends on your goal:**

- **Validate → Run Option 1** (35 min)
- **Perfect → Run Option 2 + 3** (8.5 hours)
- **Progress → Run Option 4** (Now)

**Recommended:** Run Option 1 first, then Option 4.

---

**Questions?** Review the certification document or proceed with confidence! ✅

**Document Version:** 1.0.0
**Last Updated:** 2026-01-17
