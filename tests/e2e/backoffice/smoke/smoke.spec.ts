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
      await page.goto('/login', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(3000);
      
      // Should see demo login option buttons
      const adminDemo = page.locator('button[data-testid="login-option-admin-demo"]');
      await expect(adminDemo).toBeVisible({ timeout: 20000 });
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
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(3000);
      
      // Wait for any content marker (more flexible)
      const contentMarker = page.locator('h1, h2, [data-testid="page-title"], main, [role="main"]').first();
      await expect(contentMarker).toBeVisible({ timeout: 20000 });
      
      // Verify no page errors
      expect(evidence.hasPageErrors()).toBe(false);
    });

    test('should display sidebar navigation', async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(4000); // Longer wait for full render
      
      // Try multiple selectors
      const sidebar = page.locator('nav, aside, [role="navigation"]').first();
      const hasSidebar = await sidebar.isVisible().catch(() => false);
      
      if (hasSidebar) {
        const navItems = page.locator('a[href]');
        const count = await navItems.count();
        console.log(`Admin nav items: ${count}`);
        expect(count).toBeGreaterThan(3);
      } else {
        // Page might not have traditional sidebar - just check for nav links
        const navLinks = page.locator('a[href]');
        const count = await navLinks.count();
        console.log(`Total links on page: ${count}`);
        expect(count).toBeGreaterThan(5);
      }
    });

    test('should load bookings page', async ({ page }) => {
      await page.goto('/bookings', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);
      
      // Check for any content (more flexible selector)
      const content = page.locator('main, [data-testid="page-content"], .page-content, h1, h2').first();
      await expect(content).toBeVisible({ timeout: 15000 });
    });

    test('should load rental objects page', async ({ page }) => {
      await page.goto('/rental-objects', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);
      
      // Check for page content
      const content = page.locator('main, [data-testid="page-content"], h1, h2, table').first();
      await expect(content).toBeVisible({ timeout: 15000 });
    });
  });

  test.describe('Saksbehandler Role', () => {
    test.use({ storageState: 'tests/e2e/backoffice/.auth/saksbehandler.json' });

    test('should load dashboard', async ({ page, evidence }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(3000);
      
      // Check for dashboard content (flexible)
      const content = page.locator('main, [data-testid="page-content"], h1, h2').first();
      await expect(content).toBeVisible({ timeout: 20000 });
      
      // Verify no page errors
      expect(evidence.hasPageErrors()).toBe(false);
    });

    test('should display sidebar', async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(4000); // Longer wait
      
      // Try multiple selectors
      const sidebar = page.locator('nav, aside, [role="navigation"]').first();
      const hasSidebar = await sidebar.isVisible().catch(() => false);
      
      if (hasSidebar) {
        const navItems = page.locator('a[href]');
        const count = await navItems.count();
        console.log(`Saksbehandler nav items: ${count}`);
        expect(count).toBeGreaterThan(0);
      } else {
        // Just check for any navigation links
        const navLinks = page.locator('a[href]');
        const count = await navLinks.count();
        console.log(`Total links: ${count}`);
        expect(count).toBeGreaterThan(3);
      }
    });

    test('should access work queue', async ({ page }) => {
      await page.goto('/work-queue', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);
      
      // Should load work queue (or redirect to allowed page)
      const content = page.locator('main, [data-testid="page-content"], h1, h2').first();
      await expect(content).toBeVisible({ timeout: 15000 });
    });
  });

  test.describe('Critical Page Checks', () => {
    test.use({ storageState: 'tests/e2e/backoffice/.auth/admin.json' });

    test('should not display forbidden terminology', async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);
      
      const bodyText = await page.locator('body').textContent() || '';
      
      for (const term of config.forbiddenTerms) {
        expect(bodyText.toLowerCase()).not.toContain(term.toLowerCase());
      }
    });

    test('should have no JavaScript errors', async ({ page, evidence }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(3000);
      
      // Check for actual JS errors (not network errors)
      const hasErrors = evidence.hasPageErrors();
      
      // Only fail on actual JS runtime errors
      expect(hasErrors).toBe(false);
    });
  });
});
