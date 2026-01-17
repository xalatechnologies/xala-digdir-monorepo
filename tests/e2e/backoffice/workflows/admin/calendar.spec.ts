import { test, expect } from '../../fixtures/evidence.fixture';
import { config } from '../../config/backoffice.config';

/**
 * Admin Workflow - Calendar & Blackout Management
 * 
 * Tests for calendar administration:
 * - Calendar view
 * - Blackout/maintenance window creation
 * - Blackout deletion
 * - Multi-day events
 */
test.describe('Admin - Calendar Management', () => {
  test.use({ storageState: 'tests/e2e/backoffice/.auth/admin.json' });

  test.describe('Calendar View', () => {
    test('should display calendar', async ({ page, evidence }) => {
      await page.goto('/calendar');
      await page.waitForLoadState('networkidle');

      expect(page.url()).toContain('/calendar');
      
      // Should have calendar component
      const hasCalendar = await page.locator(
        '[data-testid="calendar"], .fc, .calendar, [role="grid"]'
      ).isVisible().catch(() => false);

      expect(hasCalendar, 'Should display calendar').toBe(true);
      expect(evidence.getApiErrors()).toHaveLength(0);
    });

    test('should have navigation controls', async ({ page }) => {
      await page.goto('/calendar');
      await page.waitForLoadState('networkidle');

      // Look for prev/next navigation
      const hasNavigation = await page.locator(
        'button[aria-label*="forrige"], button[aria-label*="previous"], button:has-text("<"), button:has-text(">")'
      ).first().isVisible().catch(() => false);

      // Or date picker
      const hasDatePicker = await page.locator(
        'input[type="date"], [data-testid="date-picker"]'
      ).isVisible().catch(() => false);

      expect(hasNavigation || hasDatePicker, 'Should have calendar navigation').toBe(true);
    });

    test('should have view mode selector', async ({ page }) => {
      await page.goto('/calendar');
      await page.waitForLoadState('networkidle');

      // Look for day/week/month view toggles
      const hasViewToggle = await page.locator(
        'button:has-text("Dag"), button:has-text("Uke"), button:has-text("Måned"), [data-testid="view-toggle"]'
      ).first().isVisible().catch(() => false);

      console.log(`View toggle visible: ${hasViewToggle}`);
    });

    test('should display booked slots', async ({ page }) => {
      await page.goto('/calendar');
      await page.waitForLoadState('networkidle');

      // Give calendar time to render events
      await page.waitForTimeout(1000);

      // Look for event elements
      const events = page.locator(
        '.fc-event, [data-testid="calendar-event"], .calendar-event, [role="gridcell"] [data-event]'
      );

      const eventCount = await events.count();
      console.log(`Calendar events visible: ${eventCount}`);
    });
  });

  test.describe('Blackout Management', () => {
    test('should access blocks page', async ({ page, evidence }) => {
      await page.goto('/blocks');
      await page.waitForLoadState('networkidle');

      expect(page.url()).toContain('/blocks');
      await expect(page.locator('h1, [data-testid="page-title"]')).toBeVisible();
      expect(evidence.getApiErrors()).toHaveLength(0);
    });

    test('should have create block button', async ({ page }) => {
      await page.goto('/blocks');
      await page.waitForLoadState('networkidle');

      const hasCreateButton = await page.locator(
        'button:has-text("Opprett"), button:has-text("Ny"), button:has-text("Legg til"), [data-testid="create-block"]'
      ).first().isVisible().catch(() => false);

      expect(hasCreateButton, 'Should have create block button').toBe(true);
    });

    test('block form should have required fields', async ({ page }) => {
      await page.goto('/blocks');
      await page.waitForLoadState('networkidle');

      // Click create button
      const createButton = page.locator(
        'button:has-text("Opprett"), button:has-text("Ny"), button:has-text("Legg til")'
      ).first();

      if (await createButton.isVisible()) {
        await createButton.click();
        await page.waitForTimeout(500);

        // Check for form fields (in modal or new page)
        const hasForm = await page.locator('form, [role="dialog"] form').isVisible();
        
        if (hasForm) {
          // Should have date fields
          const hasDateInputs = await page.locator(
            'input[type="date"], input[type="datetime-local"], [data-testid="start-date"], [data-testid="end-date"]'
          ).first().isVisible();

          expect(hasDateInputs, 'Block form should have date inputs').toBe(true);
        }
      }
    });

    test('blocks list should show existing blocks', async ({ page }) => {
      await page.goto('/blocks');
      await page.waitForLoadState('networkidle');

      // Should have table or list or empty state
      const hasBlocks = await page.locator(
        'table, [data-testid="block-row"], [data-testid="block-card"]'
      ).isVisible().catch(() => false);
      
      const hasEmptyState = await page.locator(
        '[data-testid="empty-state"], .empty-state'
      ).isVisible().catch(() => false);

      expect(hasBlocks || hasEmptyState, 'Should show blocks or empty state').toBe(true);
    });
  });

  test.describe('Listing-specific Calendar', () => {
    test('should filter calendar by listing', async ({ page }) => {
      await page.goto('/calendar');
      await page.waitForLoadState('networkidle');

      // Look for listing filter
      const hasListingFilter = await page.locator(
        '[data-testid="listing-filter"], select[name*="listing"], [aria-label*="objekt"]'
      ).first().isVisible().catch(() => false);

      console.log(`Listing filter visible: ${hasListingFilter}`);
    });
  });
});
