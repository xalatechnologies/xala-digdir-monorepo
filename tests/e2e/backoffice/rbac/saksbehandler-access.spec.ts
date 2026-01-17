import { test, expect } from '../fixtures/evidence.fixture';
import { config } from '../config/backoffice.config';

/**
 * RBAC Tests - Saksbehandler Access
 * 
 * Validates that Saksbehandler role has restricted access:
 * - CAN access case handling functions
 * - CANNOT access governance/admin functions
 */
test.describe('Saksbehandler RBAC Access', () => {
  test.use({ storageState: 'tests/e2e/backoffice/.auth/saksbehandler.json' });

  test.describe('Allowed Access', () => {
    test('should access dashboard', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Should see dashboard
      expect(page.url()).not.toContain('/login');
      await expect(page.locator('h1, [data-testid="page-title"]')).toBeVisible();
    });

    test('should access bookings', async ({ page }) => {
      await page.goto('/bookings');
      await page.waitForLoadState('networkidle');

      expect(page.url()).toContain('/bookings');
      await expect(page.locator('h1, [data-testid="page-title"]')).toBeVisible();
    });

    test('should access calendar', async ({ page }) => {
      await page.goto('/calendar');
      await page.waitForLoadState('networkidle');

      expect(page.url()).toContain('/calendar');
      await expect(page.locator('h1, [data-testid="page-title"]')).toBeVisible();
    });

    test('should access work queue', async ({ page }) => {
      await page.goto('/work-queue');
      await page.waitForLoadState('networkidle');

      expect(page.url()).toContain('/work-queue');
      await expect(page.locator('h1, [data-testid="page-title"]')).toBeVisible();
    });

    test('should access decision forms', async ({ page }) => {
      await page.goto('/decision-forms');
      await page.waitForLoadState('networkidle');

      expect(page.url()).toContain('/decision-forms');
      await expect(page.locator('h1, [data-testid="page-title"]')).toBeVisible();
    });

    test('should access help page', async ({ page }) => {
      await page.goto('/help');
      await page.waitForLoadState('networkidle');

      expect(page.url()).toContain('/help');
      await expect(page.locator('h1, [data-testid="page-title"]')).toBeVisible();
    });
  });

  test.describe('Restricted Navigation', () => {
    test('should NOT see admin menu items in sidebar', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const sidebar = page.locator(config.selectors.sidebar);
      const sidebarText = await sidebar.textContent() || '';

      // Should NOT see these admin sections
      const adminOnlyTexts = [
        'Brukeradministrasjon', // User Management
        'Plattforminnstillinger', // Platform Settings
        'GDPR', // GDPR Requests
        'Merkevarebygging', // Branding
      ];

      for (const adminText of adminOnlyTexts) {
        expect(
          sidebarText,
          `Saksbehandler should NOT see "${adminText}" in sidebar`
        ).not.toContain(adminText);
      }
    });
  });

  test.describe('Blocked Access (RBAC Enforcement)', () => {
    const blockedRoutes = [
      { path: '/settings', name: 'System Settings' },
      { path: '/users-management', name: 'User Management' },
      { path: '/tenant/settings', name: 'Tenant Settings' },
      { path: '/tenant/branding', name: 'Branding' },
      { path: '/gdpr-requests', name: 'GDPR Requests' },
      { path: '/pricing-rules', name: 'Pricing Rules' },
      { path: '/allocation-planner', name: 'Allocation Planner' },
    ];

    for (const route of blockedRoutes) {
      test(`should be blocked from ${route.name} (${route.path})`, async ({ page, evidence }) => {
        await page.goto(route.path);
        await page.waitForLoadState('networkidle');

        const currentUrl = page.url();

        // Must be blocked in one of these ways:
        // 1. Redirected to dashboard or allowed page
        // 2. Shows 403/forbidden UI
        // 3. API returns 403

        const redirectedAway = !currentUrl.includes(route.path);
        const hasErrorUI = await page
          .locator('[role="alert"], .forbidden, .access-denied, [data-testid="forbidden"]')
          .isVisible()
          .catch(() => false);
        const has403 = evidence.getApi4xxErrors().some((e) => e.status === 403);

        expect(
          redirectedAway || hasErrorUI || has403,
          `Saksbehandler should NOT access ${route.path}. URL: ${currentUrl}`
        ).toBe(true);

        evidence.reset();
      });
    }
  });

  test.describe('IDOR Protection', () => {
    test('should not access other tenant resources via ID manipulation', async ({ page, evidence }) => {
      // Try accessing a non-existent or other-tenant resource
      await page.goto('/rental-objects/00000000-0000-0000-0000-000000000000');
      await page.waitForLoadState('networkidle');

      const currentUrl = page.url();

      // Should either:
      // 1. 404 - resource not found
      // 2. 403 - forbidden
      // 3. Redirect away

      const has404 = evidence.getApi4xxErrors().some((e) => e.status === 404);
      const has403 = evidence.getApi4xxErrors().some((e) => e.status === 403);
      const redirectedAway = !currentUrl.includes('00000000-0000-0000-0000-000000000000');

      expect(
        has404 || has403 || redirectedAway,
        'Should not expose other tenant resources'
      ).toBe(true);
    });
  });

  test.describe('Read-Only Enforcement', () => {
    test('calendar should be view-only (no create button)', async ({ page }) => {
      await page.goto('/calendar');
      await page.waitForLoadState('networkidle');

      // Look for create/add buttons that saksbehandler shouldn't have
      const createButtons = page.locator(
        'button:has-text("Opprett"), button:has-text("Ny"), button:has-text("Legg til")'
      );

      // May not exist or should be hidden/disabled
      const count = await createButtons.count();
      if (count > 0) {
        // If buttons exist, they should be disabled or hidden
        for (let i = 0; i < count; i++) {
          const button = createButtons.nth(i);
          const isDisabled = await button.isDisabled();
          const isHidden = !(await button.isVisible());
          expect(isDisabled || isHidden, 'Create buttons should be disabled for saksbehandler').toBe(true);
        }
      }
    });
  });
});
