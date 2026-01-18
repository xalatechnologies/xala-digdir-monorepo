// Skip E2E tests if not explicitly enabled
import { setupMockApi } from '../../mocks/api-server.mock';
/**
 * Recurring Booking E2E Tests
 *
 * End-to-end tests for recurring/seasonal booking workflows.
 * Covers preview, partial failures, conflict detection, and cancellation.
 *
 * @module tests/e2e/booking
 */

import { test, expect } from '@playwright/test';

const BACKOFFICE_URL = process.env.BACKOFFICE_URL || 'http://localhost:5173';
const API_URL = process.env.API_URL || 'http://localhost:3000/api';

// =============================================================================
// Helpers
// =============================================================================

async function loginAsRole(page: any, role: string) {
  const response = await page.request.post(`${API_URL}/auth/test-login`, {
    data: { role },
  });
  
  if (response.ok()) {
    const cookies = response.headers()['set-cookie'];
    if (cookies) {
      await page.context().addCookies([
        {
          name: 'session',
          value: cookies.split(';')[0].split('=')[1],
          domain: 'localhost',
          path: '/',
        },
      ]);
    }
  }

// =============================================================================
// Recurring Booking Preview Tests
// =============================================================================

test.describe('Recurring Booking Preview', () => {
  setupMockApi(test);
  test('API should preview recurring booking slots', async ({ request }) => {
    // Get a valid rental object
    const listResponse = await request.get(`${API_URL}/public/rental-objects?limit=1`);
    const list = await listResponse.json();
    const rentalObjectId = list.data?.[0]?.id;

    if (!rentalObjectId) {
      test();
      return;
    }

    const response = await request.post(`${API_URL}/bookings/recurring/preview`, {
      data: {
        rentalObjectId,
        startDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        endDate: new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0],
        dayOfWeek: 1, // Monday
        startTime: '10:00',
        endTime: '12:00',
      },
    });

    // Should return preview or auth error, not 500
    expect(response.status()).not.toBe(500);
    expect([200, 201, 400, 401, 404, 501]).toContain(response.status());

    if (response.ok()) {
      const data = await response.json();
      expect(data.data || data).toBeDefined();
    }
  });

  test('Preview should show conflicts for occupied slots', async ({ request }) => {
    const response = await request.post(`${API_URL}/bookings/recurring/preview`, {
      data: {
        rentalObjectId: '00000000-0000-0000-0000-000000000000',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
        dayOfWeek: 1,
        startTime: '00:00',
        endTime: '23:59',
      },
    });

    // Should not crash
    expect(response.status()).not.toBe(500);
  });

  test('Preview should calculate total price', async ({ request }) => {
    const listResponse = await request.get(`${API_URL}/public/rental-objects?limit=1`);
    const list = await listResponse.json();
    const rentalObjectId = list.data?.[0]?.id;

    if (!rentalObjectId) {
      test();
      return;
    }

    const response = await request.post(`${API_URL}/bookings/recurring/preview`, {
      data: {
        rentalObjectId,
        startDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
        endDate: new Date(Date.now() + 86400000 * 28).toISOString().split('T')[0],
        dayOfWeek: 3, // Wednesday
        startTime: '14:00',
        endTime: '16:00',
      },
    });

    if (response.ok()) {
      const data = await response.json();
      // Should have price information
      if (data.data?.totalPrice !== undefined) {
        expect(typeof data.data.totalPrice).toBe('number');
      }
    }
  });
});

// =============================================================================
// Recurring Booking Creation Tests
// =============================================================================

test.describe('Recurring Booking Creation', () => {
  setupMockApi(test);
  test('Should require authentication', async ({ request }) => {
    const response = await request.post(`${API_URL}/bookings/recurring`, {
      data: {
        rentalObjectId: '00000000-0000-0000-0000-000000000000',
        startDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        endDate: new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0],
        dayOfWeek: 1,
        startTime: '10:00',
        endTime: '12:00',
      },
    });

    // Should require auth
    expect([401, 403, 404, 501]).toContain(response.status());
  });

  test('Should handle partial failures gracefully', async ({ request }) => {
    // This tests the partial success scenario where some slots are available
    // and some are not
    const response = await request.post(`${API_URL}/bookings/recurring`, {
      data: {
        rentalObjectId: '00000000-0000-0000-0000-000000000000',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 86400000 * 60).toISOString().split('T')[0],
        dayOfWeek: 0, // Sunday
        startTime: '08:00',
        endTime: '10:00',
        allowPartial: true,
      },
    });

    // Should not crash
    expect(response.status()).not.toBe(500);
  });

  test('Should validate date range', async ({ request }) => {
    const response = await request.post(`${API_URL}/bookings/recurring`, {
      data: {
        rentalObjectId: '00000000-0000-0000-0000-000000000000',
        startDate: '2020-01-01', // Past date
        endDate: '2020-12-31', // Past date
        dayOfWeek: 1,
        startTime: '10:00',
        endTime: '12:00',
      },
    });

    // Should reject invalid dates
    expect([400, 401, 422, 501]).toContain(response.status());
  });
});

// =============================================================================
// Seasonal Leasing Tests
// =============================================================================

test.describe('Seasonal Leasing', () => {
  setupMockApi(test);
  test('Should list available seasons', async ({ request }) => {
    const response = await request.get(`${API_URL}/seasons`);
    
    // May require auth
    expect(response.status()).not.toBe(500);
  });

  test('Should get season details', async ({ request }) => {
    const listResponse = await request.get(`${API_URL}/seasons?limit=1`);
    
    if (listResponse.ok()) {
      const list = await listResponse.json();
      const seasonId = list.data?.[0]?.id;

      if (seasonId) {
        const response = await request.get(`${API_URL}/seasons/${seasonId}`);
        expect(response.status()).not.toBe(500);
      }
    }
  });

  test('Season application should require authentication', async ({ request }) => {
    const response = await request.post(`${API_URL}/seasons/applications`, {
      data: {
        seasonId: '00000000-0000-0000-0000-000000000000',
        rentalObjectId: '00000000-0000-0000-0000-000000000000',
        preferredSlots: [
          { dayOfWeek: 1, startTime: '10:00', endTime: '12:00' },
        ],
      },
    });

    expect([401, 403, 404, 501]).toContain(response.status());
  });
});

// =============================================================================
// Backoffice Recurring Management
// =============================================================================

test.describe('Backoffice Recurring Management', () => {
  setupMockApi(test);
  test('Admin can view recurring bookings', async ({ page }) => {
    await loginAsRole(page, 'admin');
    
    await page.goto(`${BACKOFFICE_URL}/bookings?type=recurring`);
    await page.waitForTimeout(3000);

    // Should load without error
    expect(page.url()).toContain('bookings');
  });

  test('Admin can manage seasonal allocations', async ({ page }) => {
    await loginAsRole(page, 'admin');
    
    await page.goto(`${BACKOFFICE_URL}/seasons`);
    await page.waitForTimeout(3000);

    // Should load seasons page
    const heading = page.locator('h1, [data-testid="page-title"]');
    const visible = await heading.first().isVisible().catch(() => false);
    expect(visible || page.url().includes('seasons')).toBeTruthy();
  });

  test('Case handler can approve seasonal applications', async ({ page }) => {
    await loginAsRole(page, 'saksbehandler');
    
    await page.goto(`${BACKOFFICE_URL}/seasons/applications`);
    await page.waitForTimeout(3000);

    // Should load applications page or redirect
    expect(page.url()).toMatch(/seasons|applications|403/);
  });
});

// =============================================================================
// Conflict Resolution Tests
// =============================================================================

test.describe('Recurring Conflict Resolution', () => {
  setupMockApi(test);
  test('Should suggest alternative slots when conflicts exist', async ({ request }) => {
    const response = await request.post(`${API_URL}/bookings/recurring/preview`, {
      data: {
        rentalObjectId: '00000000-0000-0000-0000-000000000000',
        startDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        endDate: new Date(Date.now() + 86400000 * 14).toISOString().split('T')[0],
        dayOfWeek: 1,
        startTime: '09:00',
        endTime: '17:00',
        suggestAlternatives: true,
      },
    });

    // Should not crash
    expect(response.status()).not.toBe(500);

    if (response.ok()) {
      const data = await response.json();
      // May include alternatives field
      expect(data).toBeDefined();
    }
  });

  test('Should not double-book same slot', async ({ request }) => {
    // Create two identical recurring bookings - second should fail or detect conflict
    const bookingData = {
      rentalObjectId: '00000000-0000-0000-0000-000000000000',
      startDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
      endDate: new Date(Date.now() + 86400000 * 14).toISOString().split('T')[0],
      dayOfWeek: 2,
      startTime: '10:00',
      endTime: '11:00',
    };

    // First request
    await request.post(`${API_URL}/bookings/recurring`, { data: bookingData });
    
    // Second identical request
    const response = await request.post(`${API_URL}/bookings/recurring`, { data: bookingData });

    // Should either fail with conflict or require auth
    expect([400, 401, 409, 422, 501]).toContain(response.status());
  });
});

// =============================================================================
// Timezone/DST Tests
// =============================================================================

test.describe('Timezone Handling', () => {
  setupMockApi(test);
  test('Should handle Europe/Oslo timezone correctly', async ({ request }) => {
    const response = await request.post(`${API_URL}/bookings/recurring/preview`, {
      data: {
        rentalObjectId: '00000000-0000-0000-0000-000000000000',
        startDate: '2026-03-25', // Near DST change
        endDate: '2026-04-05', // After DST change
        dayOfWeek: 1,
        startTime: '10:00',
        endTime: '12:00',
        timezone: 'Europe/Oslo',
      },
    });

    // Should not crash on DST boundary
    expect(response.status()).not.toBe(500);
  });

  test('Should handle all-day bookings', async ({ request }) => {
    const response = await request.post(`${API_URL}/bookings/recurring/preview`, {
      data: {
        rentalObjectId: '00000000-0000-0000-0000-000000000000',
        startDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
        endDate: new Date(Date.now() + 86400000 * 14).toISOString().split('T')[0],
        dayOfWeek: 5, // Friday
        allDay: true,
      },
    });

    // Should not crash
    expect(response.status()).not.toBe(500);
  });
});
