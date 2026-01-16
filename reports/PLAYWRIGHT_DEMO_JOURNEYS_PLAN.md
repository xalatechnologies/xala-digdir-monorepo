# PLAYWRIGHT DEMO JOURNEYS PLAN

**Date**: 2026-01-16  
**Purpose**: E2E test implementation for demo scenarios

---

## JOURNEY 1: Citizen Booking Flow ⭐ CRITICAL

**File**: `e2e/demo/citizen-booking.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Citizen Booking Journey', () => {
  test('should complete full booking flow', async ({ page }) => {
    // 1. Navigate to public site
    await page.goto('/');
    
    // 2. Browse rental objects
    await expect(page.locator('[data-testid="rental-object-card"]')).toHaveCount(40, { timeout: 10000 });
    
    // 3. Select first LOCALE object
    await page.locator('[data-testid="rental-object-card"]').first().click();
    
    // 4. View details
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('[data-testid="capacity"]')).toBeVisible();
    
    // 5. Select dates
    await page.locator('[data-testid="start-date"]').fill('2026-03-01');
    await page.locator('[data-testid="end-date"]').fill('2026-03-03');
    
    // 6. Submit booking
    await page.locator('[data-testid="submit-booking"]').click();
    
    // 7. Verify confirmation
    await expect(page.locator('[data-testid="booking-status"]')).toContainText('PENDING_APPROVAL');
    await expect(page.locator('[data-testid="booking-id"]')).toBeVisible();
  });
  
  test('should show RFC7807 error on conflict', async ({ page }) => {
    await page.goto('/rental-objects/test-locale-1');
    
    // Try to book already occupied slot
    await page.locator('[data-testid="start-date"]').fill('2026-02-01');
    await page.locator('[data-testid="submit-booking"]').click();
    
    // Verify error message
    await expect(page.locator('[data-testid="error-message"]')).toContainText('not available');
  });
});
```

---

## JOURNEY 2: Caseworker Approval Flow ⭐ CRITICAL

**File**: `e2e/demo/caseworker-approval.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Caseworker Approval Journey', () => {
  test.use({ storageState: 'playwright/.auth/caseworker.json' });
  
  test('should approve pending booking', async ({ page }) => {
    // 1. Navigate to bookings queue
    await page.goto('/backoffice/bookings?status=PENDING_APPROVAL');
    
    // 2. Verify queue has bookings
    await expect(page.locator('[data-testid="booking-row"]')).toHaveCount(1, { minimum: true });
    
    // 3. Click first booking
    await page.locator('[data-testid="booking-row"]').first().click();
    
    // 4. Verify details page
    await expect(page.locator('h1')).toContainText('Booking Details');
    
    // 5. Click approve button
    await page.locator('[data-testid="approve-button"]').click();
    
    // 6. Enter reason
    await page.locator('[data-testid="approval-reason"]').fill('Approved for demo');
    
    // 7. Confirm
    await page.locator('[data-testid="confirm-approve"]').click();
    
    // 8. Verify status change
    await expect(page.locator('[data-testid="booking-status"]')).toContainText('APPROVED');
  });
  
  test('should reject booking with reason', async ({ page }) => {
    await page.goto('/backoffice/bookings?status=PENDING_APPROVAL');
    
    await page.locator('[data-testid="booking-row"]').first().click();
    await page.locator('[data-testid="reject-button"]').click();
    await page.locator('[data-testid="rejection-reason"]').fill('Not available');
    await page.locator('[data-testid="confirm-reject"]').click();
    
    await expect(page.locator('[data-testid="booking-status"]')).toContainText('REJECTED');
  });
});
```

---

## JOURNEY 3: Admin Rental Object Management

**File**: `e2e/demo/admin-rental-object.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Admin Rental Object Management', () => {
  test.use({ storageState: 'playwright/.auth/admin.json' });
  
  test('should create new rental object', async ({ page }) => {
    await page.goto('/backoffice/rental-objects');
    
    await page.locator('[data-testid="create-button"]').click();
    
    // Fill form
    await page.locator('[data-testid="name"]').fill('Test Lokale');
    await page.locator('[data-testid="category"]').selectOption('LOCALE');
    await page.locator('[data-testid="capacity"]').fill('50');
    await page.locator('[data-testid="requires-approval"]').check();
    
    // Submit
    await page.locator('[data-testid="submit"]').click();
    
    // Verify created
    await expect(page).toHaveURL(/\/rental-objects\/[a-f0-9-]+$/);
    await expect(page.locator('h1')).toContainText('Test Lokale');
  });
});
```

---

## AUTH SETUP

**File**: `e2e/auth.setup.ts`

```typescript
import { test as setup } from '@playwright/test';

const DEMO_USERS = {
  citizen: { email: 'citizen@demo.no', password: 'Demo2026!' },
  caseworker: { email: 'caseworker@demo.no', password: 'Demo2026!' },
  admin: { email: 'admin@demo.no', password: 'Demo2026!' },
};

setup('authenticate as citizen', async ({ page }) => {
  await page.goto('/auth/login');
  await page.locator('[data-testid="email"]').fill(DEMO_USERS.citizen.email);
  await page.locator('[data-testid="password"]').fill(DEMO_USERS.citizen.password);
  await page.locator('[data-testid="submit"]').click();
  await page.waitForURL('/');
  await page.context().storageState({ path: 'playwright/.auth/citizen.json' });
});

setup('authenticate as caseworker', async ({ page }) => {
  await page.goto('/auth/login');
  await page.locator('[data-testid="email"]').fill(DEMO_USERS.caseworker.email);
  await page.locator('[data-testid="password"]').fill(DEMO_USERS.caseworker.password);
  await page.locator('[data-testid="submit"]').click();
  await page.waitForURL('/backoffice');
  await page.context().storageState({ path: 'playwright/.auth/caseworker.json' });
});

setup('authenticate as admin', async ({ page }) => {
  await page.goto('/auth/login');
  await page.locator('[data-testid="email"]').fill(DEMO_USERS.admin.email);
  await page.locator('[data-testid="password"]').fill(DEMO_USERS.admin.password);
  await page.locator('[data-testid="submit"]').click();
  await page.waitForURL('/backoffice');
  await page.context().storageState({ path: 'playwright/.auth/admin.json' });
});
```

---

## IMPLEMENTATION CHECKLIST

### Phase 1: Setup (30 min)
- [ ] Install Playwright
- [ ] Configure playwright.config.ts
- [ ] Create auth setup file
- [ ] Create demo user accounts

### Phase 2: Critical Journeys (2 hours)
- [ ] Implement citizen booking flow
- [ ] Implement caseworker approval flow
- [ ] Implement admin rental object management

### Phase 3: Edge Cases (1 hour)
- [ ] Test conflict scenarios
- [ ] Test RBAC enforcement
- [ ] Test RFC7807 errors

### Phase 4: CI Integration (30 min)
- [ ] Add to CI pipeline
- [ ] Configure test data reset
- [ ] Add screenshot/video capture

---

## TEST DATA REQUIREMENTS

- 40+ rental objects seeded
- Demo users created with known passwords
- At least 1 pending booking
- At least 1 blocked period
- Feature flags configured

---

## SUCCESS CRITERIA

- ✅ All 3 critical journeys pass
- ✅ Tests run in CI
- ✅ Deterministic results
- ✅ < 5 minute execution time

---

**Status**: Ready for implementation  
**Priority**: HIGH - Required for demo validation
