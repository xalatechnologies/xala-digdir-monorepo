/**
 * Domain Module E2E Tests
 *
 * End-to-end tests for the domain module infrastructure.
 * Tests module enablement, adapter behavior, and navigation.
 *
 * @module tests/e2e/domain
 */

import { test, expect } from '@playwright/test';

// =============================================================================
// Module Registry Tests
// =============================================================================

test.describe('Domain Module Registry', () => {
  test('should have BOOKING_RENTALS module registered', async ({ request }) => {
    const response = await request.get('/api/modules/catalog');
    expect(response.ok()).toBeTruthy();

    const catalog = await response.json();
    const bookingModule = catalog.data.modules.find(
      (m: any) => m.key === 'BOOKINGS' || m.key === 'RENTAL_OBJECTS'
    );

    expect(bookingModule).toBeDefined();
    expect(bookingModule.defaultEnabled).toBe(true);
  });

  test('should return effective modules for tenant', async ({ request }) => {
    const response = await request.get('/api/modules/effective');
    expect(response.ok()).toBeTruthy();

    const effective = await response.json();
    expect(effective.data.modules).toBeInstanceOf(Array);
    expect(effective.data.capabilities).toBeDefined();
  });

  test('should have booking capability enabled by default', async ({ request }) => {
    const response = await request.get('/api/modules/effective');
    const effective = await response.json();

    // Either 'booking' or 'bookings' capability
    const hasBooking =
      effective.data.capabilities['booking'] ||
      effective.data.capabilities['bookings'];

    expect(hasBooking).toBe(true);
  });
});

// =============================================================================
// Domain Navigation Tests
// =============================================================================

test.describe('Domain Navigation', () => {
  test.describe('Backoffice Navigation', () => {
    test('should show rental objects link when module enabled', async ({
      page,
    }) => {
      await page.goto('/backoffice');

      // Wait for app to load
      await page.waitForSelector('[data-testid="sidebar"]', { timeout: 10000 });

      // Check for rental objects navigation item
      const rentalObjectsLink = page.locator(
        '[data-testid="nav-rental-objects"], a[href*="rental-objects"]'
      );

      await expect(rentalObjectsLink.first()).toBeVisible();
    });

    test('should show bookings link when booking capability enabled', async ({
      page,
    }) => {
      await page.goto('/backoffice');

      await page.waitForSelector('[data-testid="sidebar"]', { timeout: 10000 });

      const bookingsLink = page.locator(
        '[data-testid="nav-bookings"], a[href*="bookings"]'
      );

      await expect(bookingsLink.first()).toBeVisible();
    });

    test('should show calendar link when calendar capability enabled', async ({
      page,
    }) => {
      await page.goto('/backoffice');

      await page.waitForSelector('[data-testid="sidebar"]', { timeout: 10000 });

      const calendarLink = page.locator(
        '[data-testid="nav-calendar"], a[href*="calendar"]'
      );

      await expect(calendarLink.first()).toBeVisible();
    });
  });

  test.describe('MinSide Navigation', () => {
    test('should show my bookings link', async ({ page }) => {
      await page.goto('/minside');

      await page.waitForSelector('[data-testid="sidebar"]', { timeout: 10000 });

      const myBookingsLink = page.locator(
        '[data-testid="nav-my-bookings"], a[href*="bookings"]'
      );

      await expect(myBookingsLink.first()).toBeVisible();
    });

    test('should show favorites link when capability enabled', async ({
      page,
    }) => {
      await page.goto('/minside');

      await page.waitForSelector('[data-testid="sidebar"]', { timeout: 10000 });

      const favoritesLink = page.locator(
        '[data-testid="nav-favorites"], a[href*="favorites"]'
      );

      await expect(favoritesLink.first()).toBeVisible();
    });
  });
});

// =============================================================================
// Adapter Fallback Tests
// =============================================================================

test.describe('Adapter Fallback Behavior', () => {
  test('API should continue working when policy engine disabled', async ({
    request,
  }) => {
    // Create a booking - should work via legacy path
    const response = await request.post('/api/bookings', {
      data: {
        rentalObjectId: 'test-rental-object-id',
        startTime: new Date(Date.now() + 86400000).toISOString(),
        endTime: new Date(Date.now() + 90000000).toISOString(),
      },
    });

    // Should either succeed or fail with validation error, not 500
    expect(response.status()).not.toBe(500);
  });

  test('Price calculation should work via legacy path', async ({ request }) => {
    const response = await request.post('/api/pricing/preview', {
      data: {
        rentalObjectId: 'test-rental-object-id',
        startTime: new Date(Date.now() + 86400000).toISOString(),
        endTime: new Date(Date.now() + 90000000).toISOString(),
      },
    });

    // Should not be a server error
    expect(response.status()).not.toBe(500);
  });
});

// =============================================================================
// Domain Group Status Tests
// =============================================================================

test.describe('Domain Group Status', () => {
  test('BOOKING_RENTALS domain should be active by default', async ({
    request,
  }) => {
    const response = await request.get('/api/modules/effective');
    expect(response.ok()).toBeTruthy();

    const effective = await response.json();
    const enabledModules = effective.data.modules
      .filter((m: any) => m.enabled)
      .map((m: any) => m.key);

    // BOOKING_RENTALS core modules should be enabled
    const hasRentalObjects = enabledModules.includes('RENTAL_OBJECTS');
    const hasBookings = enabledModules.includes('BOOKINGS');

    expect(hasRentalObjects || hasBookings).toBe(true);
  });
});

// =============================================================================
// Zero Breaking Change Tests
// =============================================================================

test.describe('Zero Breaking Changes', () => {
  test('existing rental objects endpoint should work', async ({ request }) => {
    const response = await request.get('/api/rental-objects');
    expect(response.ok()).toBeTruthy();
  });

  test('existing bookings endpoint should work', async ({ request }) => {
    const response = await request.get('/api/bookings');
    // Might require auth, but should not be 500
    expect(response.status()).not.toBe(500);
  });

  test('existing categories endpoint should work', async ({ request }) => {
    const response = await request.get('/api/public/categories');
    expect(response.ok()).toBeTruthy();
  });

  test('existing availability endpoint should work', async ({ request }) => {
    const response = await request.get(
      '/api/public/rental-objects/test-id/availability'
    );
    // Might return 404 for non-existent ID, but should not be 500
    expect(response.status()).not.toBe(500);
  });
});
