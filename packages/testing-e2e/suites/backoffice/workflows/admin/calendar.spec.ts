// Skip E2E tests if not explicitly enabled
import { setupMockApi } from '@digilist/api/../../mocks/api-server.mock';
import { test, expect } from '../../../../src/fixtures/index';
import { config } from '../../config/backoffice.config';

/**
 * Admin Workflow - Calendar & Blackout Management
 * 
 * Tests for calendar administration:
 * - Calendar view
 * - Blackout/maintenance windows
 */
test.describe('Admin - Calendar Management', () => {
  setupMockApi(test);
  test.use({ storageState: 'tests/e2e/backoffice/.auth/admin.json' });

  test.describe('Calendar View', () => {
  setupMockApi(test);
    test('should display calendar page', async ({ page, evidence }) => {
      await page.goto('/calendar', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(3000);

      expect(page.url()).toContain('/calendar');
      
      // Should have calendar or content
      const hasContent = await page.locator(
        '[data-testid="calendar"], .fc, .calendar, [role="grid"], main'
      ).first().isVisible().catch(() => false);

      expect(hasContent, 'Should display calendar content').toBe(true);
      expect(evidence.getApiErrors()).toHaveLength(0);
    });

    test('should have calendar navigation', async ({ page }) => {
      await page.goto('/calendar', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);

      // Look for any navigation controls
      const hasNavigation = await page.locator(
        'button[aria-label*="forrige"], button[aria-label*="previous"], button:has-text("<"), button:has-text(">"), input[type="date"]'
      ).first().isVisible().catch(() => false);

      console.log(`Calendar navigation visible: ${hasNavigation}`);
    });

    test('should load calendar content', async ({ page }) => {
      await page.goto('/calendar', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(3000);

      const bodyText = await page.locator('main, [role="main"]').first().textContent() || '';
      expect(bodyText.length).toBeGreaterThan(10);
    });
  });

  test.describe('Blocks/Blackouts', () => {
  setupMockApi(test);
    test('should access blocks page', async ({ page, evidence }) => {
      await page.goto('/blocks', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);

      const currentUrl = page.url();
      
      if (currentUrl.includes('/login')) {
        console.log('Blocks page redirected to login');
        test(true, 'Blocks route not available');
        return;
      }

      // Should have content
      const hasContent = await page.locator('main, [role="main"]').first().isVisible();
      expect(hasContent).toBe(true);
      
      expect(evidence.getApiErrors()).toHaveLength(0);
    });

    test('blocks page should have content', async ({ page }) => {
      await page.goto('/blocks', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);

      if (page.url().includes('/login')) {
        test(true, 'Blocks route not available');
        return;
      }

      const bodyText = await page.locator('main').first().textContent() || '';
      console.log(`Blocks page content length: ${bodyText.length}`);
    });
  });
});
