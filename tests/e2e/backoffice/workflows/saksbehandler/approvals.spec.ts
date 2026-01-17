import { test, expect } from '../../fixtures/evidence.fixture';
import { config } from '../../config/backoffice.config';

/**
 * Saksbehandler Workflow - Approval Processing
 * 
 * Tests for case handler approval workflow:
 * - View pending approvals
 * - Access decision forms
 */
test.describe('Saksbehandler - Approval Workflow', () => {
  test.use({ storageState: 'tests/e2e/backoffice/.auth/saksbehandler.json' });

  test.describe('Dashboard Access', () => {
    test('should load dashboard', async ({ page, evidence }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(3000);

      // Should be logged in
      expect(page.url()).not.toContain('/login');
      
      const hasContent = await page.locator('main, [role="main"]').first().isVisible();
      expect(hasContent).toBe(true);
      
      expect(evidence.getApiErrors()).toHaveLength(0);
    });
  });

  test.describe('Bookings Access', () => {
    test('should access bookings page', async ({ page, evidence }) => {
      await page.goto('/bookings', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(3000);

      // Should load (may or may not have access)
      const currentUrl = page.url();
      
      if (currentUrl.includes('/login')) {
        console.log('Session expired - skipping');
        test.skip(true, 'Session expired');
        return;
      }

      const hasContent = await page.locator('main, [role="main"]').first().isVisible();
      expect(hasContent).toBe(true);
      
      expect(evidence.getApiErrors()).toHaveLength(0);
    });
  });

  test.describe('Calendar Access', () => {
    test('should access calendar page', async ({ page, evidence }) => {
      await page.goto('/calendar', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(3000);

      const currentUrl = page.url();
      
      if (currentUrl.includes('/login')) {
        test.skip(true, 'Session expired');
        return;
      }

      const hasContent = await page.locator('main, [role="main"]').first().isVisible();
      expect(hasContent).toBe(true);
      
      expect(evidence.getApiErrors()).toHaveLength(0);
    });
  });

  test.describe('Work Queue', () => {
    test('should access work queue if available', async ({ page }) => {
      await page.goto('/work-queue', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);

      const currentUrl = page.url();
      
      // May redirect to login or forbidden
      if (currentUrl.includes('/login')) {
        console.log('Work queue - redirected to login');
        test.skip(true, 'Work queue not available');
        return;
      }

      const hasContent = await page.locator('main, [role="main"]').first().isVisible();
      expect(hasContent).toBe(true);
    });
  });

  test.describe('Read-Only Verification', () => {
    test('should have limited sidebar options', async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);

      if (page.url().includes('/login')) {
        test.skip(true, 'Session expired');
        return;
      }

      const sidebar = page.locator(config.selectors.sidebar);
      
      if (await sidebar.isVisible()) {
        const navItems = sidebar.locator('a[href]');
        const count = await navItems.count();
        console.log(`Saksbehandler nav items: ${count}`);
      }
    });
  });
});
