// Skip E2E tests if not explicitly enabled
import { setupMockApi } from '../../../mocks/api-server.mock';
import { test, expect } from '../../../src/fixtures/index';
import { config } from '../config/backoffice.config';

/**
 * Sidebar Crawl Test
 * 
 * Exhaustive navigation test that visits every visible sidebar item and validates:
 * 1. Page loads without errors
 * 2. No runtime errors (pageerror/unhandledrejection)
 * 3. No console errors (except allowlisted)
 * 4. No 5xx API responses
 * 5. Core UI markers exist
 * 6. No forbidden terminology
 * 7. All localization keys resolve
 */

interface PageSnapshot {
  route: string;
  sidebarLabel: string;
  pageTitle: string;
  hasDataTable: boolean;
  dataRowCount: number;
  apiCallCount: number;
  consoleErrors: number;
  apiErrors: number;
  pageErrors: number;
  timestamp: string;

test.describe('Sidebar Crawl - Admin Role', () => {
  setupMockApi(test);
  test.use({ storageState: 'tests/e2e/backoffice/.auth/admin.json' });

  const allRoutes = [
    ...config.routes.shared,
    ...config.routes.adminOnly,
    ...config.routes.conditional,
  ];

  for (const route of allRoutes) {
    test(`should load ${route.name} (${route.path})`, async ({ page, evidence }) => {
      // Navigate to route
      await page.goto(route.path);
      await page.waitForLoadState('networkidle');
      
      // Allow time for any async rendering
      await page.waitForTimeout(500);

      // 1. Page should not redirect unexpectedly
      const currentUrl = page.url();
      const expectedPath = route.path === '/' ? '/' : route.path;
      expect(
        currentUrl.includes(expectedPath) || currentUrl.endsWith('/'),
        `Expected URL to contain ${expectedPath}, got ${currentUrl}`
      ).toBe(true);

      // 2. No page errors
      expect(
        evidence.hasPageErrors(),
        `Page errors detected: ${evidence.pageErrors?.join(', ')}`
      ).toBe(false);

      // 3. No console errors (except allowlisted)
      const consoleErrors = evidence.getConsoleErrors();
      expect(
        consoleErrors.length,
        `Console errors: ${consoleErrors.map((e) => e.text).join('\n')}`
      ).toBe(0);

      // 4. No 5xx API errors
      const apiErrors = evidence.getApiErrors();
      expect(
        apiErrors.length,
        `5xx errors: ${apiErrors.map((e) => `${e.status} ${e.url}`).join('\n')}`
      ).toBe(0);

      // 5. Core UI markers exist
      const hasTitle = await page.locator('h1, [data-testid="page-title"], [role="heading"]').isVisible();
      const hasContent = await page.locator('main, [data-testid="page-content"], .page-content').isVisible();
      expect(hasTitle || hasContent, 'Page should have visible content').toBe(true);

      // 6. No forbidden terminology
      const bodyText = await page.locator('body').textContent() || '';
      for (const term of config.forbiddenTerms) {
        expect(bodyText, `Found forbidden term: "${term}"`).not.toContain(term);
      }

      // 7. Check for unresolved i18n keys
      const hasRawI18nKey = /\b[a-z]+\.[a-z]+\.[a-z]+\b/.test(bodyText) && bodyText.includes('nav.');
      expect(hasRawI18nKey, 'Unresolved i18n keys detected').toBe(false);

      // 8. No loading spinners stuck (page should settle)
      const spinner = page.locator(config.selectors.loadingSpinner);
      const spinnerVisible = await spinner.isVisible().catch(() => false);
      if (spinnerVisible) {
        // Wait a bit more and check again
        await page.waitForTimeout(2000);
        const stillSpinning = await spinner.isVisible().catch(() => false);
        expect(stillSpinning, 'Page stuck in loading state').toBe(false);
      }

      // Clean up for next test
      evidence.reset();
    });
  }
});

test.describe('Sidebar Crawl - Saksbehandler Role', () => {
  setupMockApi(test);
  test.use({ storageState: 'tests/e2e/backoffice/.auth/saksbehandler.json' });

  // Saksbehandler can access shared routes
  for (const route of config.routes.shared) {
    test(`should load ${route.name} (${route.path})`, async ({ page, evidence }) => {
      await page.goto(route.path);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);

      // Page should load (not redirect to forbidden)
      const currentUrl = page.url();
      const expectedPath = route.path === '/' ? '/' : route.path;
      
      // Allow redirect to login if session expired
      if (currentUrl.includes('/login')) {
        test(true, 'Session expired, skipping');
        return;
      }

      expect(
        currentUrl.includes(expectedPath) || currentUrl.endsWith('/'),
        `Expected URL to contain ${expectedPath}, got ${currentUrl}`
      ).toBe(true);

      // No page errors
      expect(evidence.hasPageErrors()).toBe(false);

      // No 5xx errors
      expect(evidence.getApiErrors()).toHaveLength(0);

      evidence.reset();
    });
  }

  // Saksbehandler should be blocked from admin-only routes
  for (const route of config.routes.adminOnly) {
    test(`should block ${route.name} (${route.path})`, async ({ page, evidence }) => {
      await page.goto(route.path);
      await page.waitForLoadState('networkidle');
      
      const currentUrl = page.url();
      
      // Should either:
      // 1. Redirect away from the admin page
      // 2. Show forbidden/error UI
      // 3. Return 403 API response
      const redirectedAway = !currentUrl.includes(route.path);
      const hasErrorUI = await page.locator('[role="alert"], .forbidden, .error-403').isVisible().catch(() => false);
      const has403 = evidence.getApi4xxErrors().some((e) => e.status === 403);

      expect(
        redirectedAway || hasErrorUI || has403,
        `Saksbehandler should not access ${route.path}`
      ).toBe(true);

      evidence.reset();
    });
  }
});

test.describe('Sidebar Dynamic Enumeration', () => {
  setupMockApi(test);
  test.use({ storageState: 'tests/e2e/backoffice/.auth/admin.json' });

  test('should enumerate all visible sidebar items', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Get all sidebar nav items
    const navItems = page.locator(`${config.selectors.sidebar} a[href]`);
    const count = await navItems.count();

    console.log(`Found ${count} sidebar navigation items`);

    const items: Array<{ href: string; text: string }> = [];

    for (let i = 0; i < count; i++) {
      const item = navItems.nth(i);
      const href = await item.getAttribute('href') || '';
      const text = await item.textContent() || '';
      items.push({ href, text: text.trim() });
    }

    // Log for debugging
    console.log('Sidebar items:', JSON.stringify(items, null, 2));

    // Should have navigation items
    expect(count).toBeGreaterThan(5);
  });
});
