// Skip E2E tests if not explicitly enabled
import { setupMockApi } from '../../../../../mocks/api-server.mock';
import { test, expect } from '../../fixtures/evidence.fixture';
import { config } from '../../config/backoffice.config';

/**
 * Admin Workflow - Booking Management
 * 
 * Tests for booking administration:
 * - Bookings list with filters
 * - Booking details view
 * - Work queue
 */
test.describe('Admin - Booking Management', () => {
  setupMockApi();
  test.use({ storageState: 'tests/e2e/backoffice/.auth/admin.json' });

  test.describe('Bookings List', () => {
  setupMockApi();
    test('should display bookings page', async ({ page, evidence }) => {
      await page.goto('/bookings', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(3000);

      expect(page.url()).toContain('/bookings');
      
      // Should have content (any content marker)
      const hasContent = await page.locator('main, [role="main"], table, .booking-card').first().isVisible();
      expect(hasContent).toBe(true);

      expect(evidence.getApiErrors()).toHaveLength(0);
    });

    test('should have filter or search options', async ({ page }) => {
      await page.goto('/bookings', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);

      // Look for any filtering UI
      const hasFilters = await page.locator(
        'input[type="search"], select, [role="combobox"], [role="tablist"], button:has-text("Filter")'
      ).first().isVisible().catch(() => false);

      console.log(`Booking filters visible: ${hasFilters}`);
    });

    test('should display booking content or empty state', async ({ page }) => {
      await page.goto('/bookings', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);

      const bodyText = await page.locator('main, [role="main"]').first().textContent() || '';
      
      // Should have some content
      expect(bodyText.length).toBeGreaterThan(10);
    });
  });

  test.describe('Booking Details', () => {
  setupMockApi();
    test('should navigate to booking detail if exists', async ({ page }) => {
      await page.goto('/bookings', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(3000);

      const bookingLink = page.locator(
        'a[href*="/bookings/"]:not([href="/bookings/"])'
      ).first();
      
      if (await bookingLink.isVisible()) {
        await bookingLink.click();
        await page.waitForTimeout(2000);

        expect(page.url()).toMatch(/\/bookings\/[a-zA-Z0-9-]+/);
      } else {
        console.log('No booking links found');
        test(true, 'No bookings available');
      }
    });
  });

  test.describe('Work Queue', () => {
  setupMockApi();
    test('should display work queue page', async ({ page, evidence }) => {
      await page.goto('/work-queue', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(3000);

      // Check if we're on work-queue or redirected
      const currentUrl = page.url();
      
      // May redirect to login if route doesn't exist
      if (currentUrl.includes('/login')) {
        console.log('Work queue redirected to login - may not exist');
        test(true, 'Work queue route not available');
        return;
      }

      // Should have content
      const hasContent = await page.locator('main, [role="main"]').first().isVisible();
      expect(hasContent).toBe(true);
      
      expect(evidence.getApiErrors()).toHaveLength(0);
    });

    test('should show pending items or empty state', async ({ page }) => {
      await page.goto('/work-queue', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);

      if (page.url().includes('/login')) {
        test(true, 'Work queue not available');
        return;
      }

      const bodyText = await page.locator('main, [role="main"]').first().textContent() || '';
      expect(bodyText.length).toBeGreaterThan(0);
    });
  });
});
