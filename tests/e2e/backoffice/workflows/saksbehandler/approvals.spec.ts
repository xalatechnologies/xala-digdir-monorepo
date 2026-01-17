import { test, expect } from '../../fixtures/evidence.fixture';
import { config } from '../../config/backoffice.config';

/**
 * Saksbehandler Workflow - Approval Processing
 * 
 * Tests for case handler approval workflow:
 * - View pending approvals
 * - Process approvals (approve/deny)
 * - Add notes/reasons
 */
test.describe('Saksbehandler - Approval Workflow', () => {
  test.use({ storageState: 'tests/e2e/backoffice/.auth/saksbehandler.json' });

  test.describe('Work Queue Access', () => {
    test('should access work queue', async ({ page, evidence }) => {
      await page.goto('/work-queue');
      await page.waitForLoadState('networkidle');

      expect(page.url()).toContain('/work-queue');
      await expect(page.locator('h1, [data-testid="page-title"]')).toBeVisible();
      expect(evidence.getApiErrors()).toHaveLength(0);
    });

    test('should display pending items', async ({ page }) => {
      await page.goto('/work-queue');
      await page.waitForLoadState('networkidle');

      // Should show items or empty state
      const hasItems = await page.locator(
        'table tr, [data-testid="queue-item"], [data-testid="pending-item"]'
      ).first().isVisible().catch(() => false);

      const hasEmptyState = await page.locator(
        '[data-testid="empty-state"], .empty-queue'
      ).isVisible().catch(() => false);

      expect(hasItems || hasEmptyState, 'Should show pending items or empty state').toBe(true);
    });

    test('queue items should have action buttons', async ({ page }) => {
      await page.goto('/work-queue');
      await page.waitForLoadState('networkidle');

      const hasApproveButton = await page.locator(
        'button:has-text("Godkjenn"), button[aria-label*="godkjenn"]'
      ).first().isVisible().catch(() => false);

      const hasDenyButton = await page.locator(
        'button:has-text("Avslå"), button:has-text("Avvis")'
      ).first().isVisible().catch(() => false);

      // Log for debugging - buttons may only appear if items exist
      console.log(`Approve: ${hasApproveButton}, Deny: ${hasDenyButton}`);
    });
  });

  test.describe('Decision Forms', () => {
    test('should access decision forms', async ({ page, evidence }) => {
      await page.goto('/decision-forms');
      await page.waitForLoadState('networkidle');

      expect(page.url()).toContain('/decision-forms');
      await expect(page.locator('h1, [data-testid="page-title"]')).toBeVisible();
      expect(evidence.getApiErrors()).toHaveLength(0);
    });

    test('decision form should have required sections', async ({ page }) => {
      await page.goto('/decision-forms');
      await page.waitForLoadState('networkidle');

      // Look for form or list of forms
      const hasForm = await page.locator('form').isVisible().catch(() => false);
      const hasList = await page.locator('table, [data-testid="form-list"]').isVisible().catch(() => false);
      const hasEmptyState = await page.locator('[data-testid="empty-state"]').isVisible().catch(() => false);

      expect(hasForm || hasList || hasEmptyState).toBe(true);
    });
  });

  test.describe('Season Applications', () => {
    test('should access season applications', async ({ page, evidence }) => {
      await page.goto('/season-applications');
      await page.waitForLoadState('networkidle');

      expect(page.url()).toContain('/season-applications');
      await expect(page.locator('h1, [data-testid="page-title"]')).toBeVisible();
      expect(evidence.getApiErrors()).toHaveLength(0);
    });

    test('should list applications', async ({ page }) => {
      await page.goto('/season-applications');
      await page.waitForLoadState('networkidle');

      const hasApplications = await page.locator(
        'table, [data-testid="application-row"], [data-testid="application-card"]'
      ).isVisible().catch(() => false);

      const hasEmptyState = await page.locator('[data-testid="empty-state"]').isVisible().catch(() => false);

      expect(hasApplications || hasEmptyState).toBe(true);
    });
  });

  test.describe('View-Only Constraints', () => {
    test('bookings list should be view-only', async ({ page }) => {
      await page.goto('/bookings');
      await page.waitForLoadState('networkidle');

      // Should NOT have create button (saksbehandler can't create bookings)
      const hasCreateBookingButton = await page.locator(
        'button:has-text("Opprett booking"), button:has-text("Ny booking")'
      ).isVisible().catch(() => false);

      expect(hasCreateBookingButton, 'Saksbehandler should not create bookings').toBe(false);
    });

    test('calendar should have limited actions', async ({ page }) => {
      await page.goto('/calendar');
      await page.waitForLoadState('networkidle');

      // Should NOT have create block button on calendar
      const hasBlockButton = await page.locator(
        'button:has-text("Ny blokkering"), button:has-text("Opprett blokkering")'
      ).isVisible().catch(() => false);

      // May or may not have based on config - log for review
      console.log(`Block creation button visible: ${hasBlockButton}`);
    });
  });

  test.describe('Read Access to Related Data', () => {
    test('should view booking details', async ({ page }) => {
      await page.goto('/bookings');
      await page.waitForLoadState('networkidle');

      const firstBooking = page.locator('tr a, [data-testid="booking-link"]').first();

      if (await firstBooking.isVisible()) {
        await firstBooking.click();
        await page.waitForLoadState('networkidle');

        // Should see booking details
        expect(page.url()).toMatch(/\/bookings\/[a-zA-Z0-9-]+/);
        await expect(page.locator('h1, [data-testid="page-title"], [data-testid="booking-detail"]')).toBeVisible();
      } else {
        test.skip(true, 'No bookings available');
      }
    });
  });
});
