import { test, expect } from '../fixtures/evidence.fixture';
import { config } from '../config/backoffice.config';

/**
 * Smoke Tests
 * 
 * Fast validation suite (< 2 min) for PR gates.
 * Tests critical paths for both Admin and Saksbehandler roles.
 */
test.describe('Backoffice Smoke Tests', () => {
  test.describe('Authentication', () => {
    test('should display login page with demo options', async ({ page }) => {
      await page.goto('/login');
      await page.waitForLoadState('networkidle');
      
      // Should see demo login option buttons
      const adminDemo = page.locator('button[data-testid="login-option-admin-demo"]');
      await expect(adminDemo).toBeVisible({ timeout: 15000 });
    });

    test('should redirect unauthenticated users to login', async ({ page }) => {
      await page.goto('/');
      await page.waitForURL(/\/login/, { timeout: 15000 });
      expect(page.url()).toContain('/login');
    });
  });

  test.describe('Admin Role', () => {
    test.use({ storageState: 'tests/e2e/backoffice/.auth/admin.json' });

    test('should load dashboard', async ({ page, evidence }) => {
      await page.goto('/');
      
      // Wait for page to stabilize
      await page.waitForLoadState('networkidle');
      
      // Check for dashboard content
      await expect(page.locator('h1, [data-testid="page-title"]')).toBeVisible({ timeout: 15000 });
      
      // Verify no page errors
      expect(evidence.hasPageErrors()).toBe(false);
      
      // Verify no 5xx errors
      const apiErrors = evidence.getApiErrors();
      expect(apiErrors).toHaveLength(0);
    });

    test('should display sidebar navigation', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await expect(page.locator(config.selectors.sidebar)).toBeVisible();
      
      // Admin should see multiple nav items
      const navItems = page.locator(`${config.selectors.sidebar} a[href]`);
      const count = await navItems.count();
      expect(count).toBeGreaterThan(5);
    });

    test('should load bookings page', async ({ page, evidence }) => {
      await page.goto('/bookings');
      await page.waitForLoadState('networkidle');
      
      // Check for page content
      await expect(page.locator('h1, [data-testid="page-title"]')).toBeVisible();
      
      // No 5xx errors
      expect(evidence.getApiErrors()).toHaveLength(0);
    });

    test('should load rental objects page', async ({ page, evidence }) => {
      await page.goto('/rental-objects');
      await page.waitForLoadState('networkidle');
      
      // Check for page content
      await expect(page.locator('h1, [data-testid="page-title"]')).toBeVisible();
      
      // No 5xx errors
      expect(evidence.getApiErrors()).toHaveLength(0);
    });
  });

  test.describe('Saksbehandler Role', () => {
    test.use({ storageState: 'tests/e2e/backoffice/.auth/saksbehandler.json' });

    test('should load dashboard', async ({ page, evidence }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Check for dashboard content
      await expect(page.locator('h1, [data-testid="page-title"]')).toBeVisible({ timeout: 15000 });
      
      // Verify no page errors
      expect(evidence.hasPageErrors()).toBe(false);
    });

    test('should display restricted sidebar', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await expect(page.locator(config.selectors.sidebar)).toBeVisible();
      
      // Saksbehandler should see fewer nav items than admin
      const navItems = page.locator(`${config.selectors.sidebar} a[href]`);
      const count = await navItems.count();
      
      // Should have at least dashboard, bookings, calendar
      expect(count).toBeGreaterThanOrEqual(3);
      // Should be restricted (typically < 15 items)
      expect(count).toBeLessThan(20);
    });

    test('should be blocked from admin-only pages', async ({ page }) => {
      // Try to access rental objects (admin only)
      await page.goto('/rental-objects');
      await page.waitForLoadState('networkidle');
      
      // Should either redirect or show forbidden
      const url = page.url();
      const is403 = await page.locator('[role="alert"], .error, .forbidden').isVisible().catch(() => false);
      const redirectedToAllowed = !url.includes('/rental-objects');
      
      expect(is403 || redirectedToAllowed).toBe(true);
    });
  });

  test.describe('Critical Page Checks', () => {
    test.use({ storageState: 'tests/e2e/backoffice/.auth/admin.json' });

    test('should not display forbidden terminology', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const bodyText = await page.locator('body').textContent() || '';
      
      for (const term of config.forbiddenTerms) {
        expect(bodyText).not.toContain(term);
      }
    });

    test('should have no console errors', async ({ page, evidence }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const consoleErrors = evidence.getConsoleErrors();
      expect(consoleErrors).toHaveLength(0);
    });
  });
});
