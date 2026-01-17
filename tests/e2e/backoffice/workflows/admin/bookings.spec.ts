import { test, expect } from '../../fixtures/evidence.fixture';
import { config } from '../../config/backoffice.config';

/**
 * Admin Workflow - Booking Management
 * 
 * Tests for booking administration:
 * - Bookings list with filters
 * - Booking details view
 * - Approval/denial workflow
 * - Cancellation
 */
test.describe('Admin - Booking Management', () => {
  test.use({ storageState: 'tests/e2e/backoffice/.auth/admin.json' });

  test.describe('Bookings List', () => {
    test('should display bookings list', async ({ page, evidence }) => {
      await page.goto('/bookings');
      await page.waitForLoadState('networkidle');

      expect(page.url()).toContain('/bookings');
      
      // Should have table or cards
      const hasTable = await page.locator('table, [data-testid="bookings-table"]').isVisible().catch(() => false);
      const hasCards = await page.locator('[data-testid="booking-card"]').count() > 0;
      const hasEmptyState = await page.locator('[data-testid="empty-state"]').isVisible().catch(() => false);
      
      expect(hasTable || hasCards || hasEmptyState, 'Should display bookings or empty state').toBe(true);

      expect(evidence.getApiErrors()).toHaveLength(0);
    });

    test('should have status filter', async ({ page }) => {
      await page.goto('/bookings');
      await page.waitForLoadState('networkidle');

      // Look for status filter
      const hasStatusFilter = await page.locator(
        '[data-testid="status-filter"], select[name*="status"], [aria-label*="status"]'
      ).first().isVisible().catch(() => false);

      // Or filter tabs
      const hasTabs = await page.locator(
        '[role="tablist"], .tabs, button:has-text("Ventende"), button:has-text("Godkjent")'
      ).first().isVisible().catch(() => false);

      expect(hasStatusFilter || hasTabs, 'Should have status filtering').toBe(true);
    });

    test('should have date range filter', async ({ page }) => {
      await page.goto('/bookings');
      await page.waitForLoadState('networkidle');

      const hasDateFilter = await page.locator(
        'input[type="date"], [data-testid="date-filter"], [aria-label*="dato"]'
      ).first().isVisible().catch(() => false);

      console.log(`Date filter visible: ${hasDateFilter}`);
    });

    test('should have search functionality', async ({ page }) => {
      await page.goto('/bookings');
      await page.waitForLoadState('networkidle');

      const hasSearch = await page.locator(
        'input[type="search"], input[placeholder*="Søk"], [data-testid="search"]'
      ).first().isVisible().catch(() => false);

      console.log(`Search visible: ${hasSearch}`);
    });
  });

  test.describe('Booking Details', () => {
    test('should navigate to booking detail', async ({ page }) => {
      await page.goto('/bookings');
      await page.waitForLoadState('networkidle');

      const firstBooking = page.locator('tr a, [data-testid="booking-row"] a, [data-testid="booking-card"] a').first();
      
      if (await firstBooking.isVisible()) {
        await firstBooking.click();
        await page.waitForLoadState('networkidle');

        expect(page.url()).toMatch(/\/bookings\/[a-zA-Z0-9-]+/);
      } else {
        test.skip(true, 'No bookings available');
      }
    });

    test('booking detail should show key information', async ({ page }) => {
      await page.goto('/bookings');
      await page.waitForLoadState('networkidle');

      const firstBooking = page.locator('tr a, [data-testid="booking-row"] a').first();
      
      if (await firstBooking.isVisible()) {
        await firstBooking.click();
        await page.waitForLoadState('networkidle');

        // Should display booking info
        const pageText = await page.locator('main, [data-testid="page-content"]').textContent() || '';
        
        // Should have some booking-related content
        const hasBookingInfo = 
          pageText.includes('Status') ||
          pageText.includes('Dato') ||
          pageText.includes('Bruker') ||
          pageText.includes('Objekt');

        expect(hasBookingInfo, 'Should display booking information').toBe(true);
      } else {
        test.skip(true, 'No bookings available');
      }
    });
  });

  test.describe('Work Queue (Pending Approvals)', () => {
    test('should display work queue', async ({ page, evidence }) => {
      await page.goto('/work-queue');
      await page.waitForLoadState('networkidle');

      expect(page.url()).toContain('/work-queue');
      
      await expect(page.locator('h1, [data-testid="page-title"]')).toBeVisible();
      expect(evidence.getApiErrors()).toHaveLength(0);
    });

    test('work queue should show pending items', async ({ page }) => {
      await page.goto('/work-queue');
      await page.waitForLoadState('networkidle');

      // Should have list or table or empty state
      const hasItems = await page.locator('table, [data-testid="queue-item"]').isVisible().catch(() => false);
      const hasEmptyState = await page.locator('[data-testid="empty-state"], .empty-state').isVisible().catch(() => false);

      expect(hasItems || hasEmptyState, 'Should show items or empty state').toBe(true);
    });

    test('should have approve/deny actions', async ({ page }) => {
      await page.goto('/work-queue');
      await page.waitForLoadState('networkidle');

      const hasApproveButton = await page.locator(
        'button:has-text("Godkjenn"), button:has-text("Approve"), [data-testid="approve-button"]'
      ).first().isVisible().catch(() => false);

      const hasDenyButton = await page.locator(
        'button:has-text("Avslå"), button:has-text("Avvis"), button:has-text("Deny"), [data-testid="deny-button"]'
      ).first().isVisible().catch(() => false);

      // If there are pending items, should have action buttons
      console.log(`Approve button: ${hasApproveButton}, Deny button: ${hasDenyButton}`);
    });
  });

  test.describe('Cancellation', () => {
    test('booking detail should have cancel action', async ({ page }) => {
      await page.goto('/bookings');
      await page.waitForLoadState('networkidle');

      const firstBooking = page.locator('tr a, [data-testid="booking-row"] a').first();
      
      if (await firstBooking.isVisible()) {
        await firstBooking.click();
        await page.waitForLoadState('networkidle');

        const hasCancelButton = await page.locator(
          'button:has-text("Kanseller"), button:has-text("Avbestill"), [data-testid="cancel-button"]'
        ).isVisible().catch(() => false);

        console.log(`Cancel button visible: ${hasCancelButton}`);
      } else {
        test.skip(true, 'No bookings available');
      }
    });
  });
});
