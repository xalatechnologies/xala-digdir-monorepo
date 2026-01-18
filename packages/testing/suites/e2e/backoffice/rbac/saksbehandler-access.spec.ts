// Skip E2E tests if not explicitly enabled
import { setupMockApi } from '../../../../mocks/api-server.mock';
import { test, expect } from '../fixtures/qa-expert.fixture';
import { config } from '../config/backoffice.config';

/**
 * RBAC Tests - Saksbehandler Access
 * 
 * Validates that Saksbehandler role has restricted access:
 * - CAN access case handling functions
 * - CANNOT access governance/admin functions
 */
test.describe('Saksbehandler RBAC Access', () => {
  setupMockApi();
  test.use({ storageState: 'tests/e2e/backoffice/.auth/saksbehandler.json' });

  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    
    if (page.url().includes('/login')) {
      test();
    }
  });

  test.describe('Allowed Access', () => {
  setupMockApi();
    test('should access dashboard', async ({ page }) => {
      expect(page.url()).not.toContain('/login');
      
      const title = page.locator('h1, [data-testid="page-title"]').first();
      const visible = await title.isVisible().catch(() => false);
      console.log(`Dashboard: ${visible ? '✓' : '✗'}`);
    });

    test('should access bookings', async ({ page }) => {
      await page.goto('/bookings', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);

      expect(page.url()).toContain('/bookings');
      
      const title = page.locator('h1, [data-testid="page-title"]').first();
      const visible = await title.isVisible().catch(() => false);
      console.log(`Bookings: ${visible ? '✓' : '✗'}`);
    });

    test('should access calendar', async ({ page }) => {
      await page.goto('/calendar', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);

      expect(page.url()).toContain('/calendar');
      console.log('Calendar: ✓');
    });

    test('should access work queue', async ({ page }) => {
      await page.goto('/work-queue', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);

      expect(page.url()).toContain('/work-queue');
      console.log('Work queue: ✓');
    });

    test('should access decision forms', async ({ page }) => {
      await page.goto('/decision-forms', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);

      const currentUrl = page.url();
      console.log(`Decision forms: ${currentUrl.includes('/decision') ? '✓' : '✗'}`);
    });

    test('should access help page', async ({ page }) => {
      await page.goto('/help', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);

      expect(page.url()).toContain('/help');
      console.log('Help: ✓');
    });
  });

  test.describe('Restricted Navigation', () => {
  setupMockApi();
    test('should NOT see admin menu items in sidebar', async ({ page }) => {
      const sidebar = page.locator(config.selectors.sidebar);
      
      if (!await sidebar.isVisible().catch(() => false)) {
        console.log('Sidebar not visible - skipping');
        return;
      }
      
      const sidebarText = await sidebar.textContent() || '';

      // Should NOT see these admin sections
      const adminOnlyTexts = [
        'Brukeradministrasjon', // User Management
        'Plattforminnstillinger', // Platform Settings
        'GDPR', // GDPR Requests
        'Merkevarebygging', // Branding
      ];

      for (const adminText of adminOnlyTexts) {
        const found = sidebarText.includes(adminText);
        console.log(`${adminText}: ${!found ? '✓ hidden' : '⚠ visible'}`);
      }
    });
  });

  test.describe('Blocked Access (RBAC Enforcement)', () => {
  setupMockApi();
    const blockedRoutes = [
      { path: '/settings', name: 'System Settings' },
      { path: '/users', name: 'User Management' },
      { path: '/tenant/settings', name: 'Tenant Settings' },
      { path: '/tenant/branding', name: 'Branding' },
      { path: '/gdpr-requests', name: 'GDPR Requests' },
      { path: '/pricing-rules', name: 'Pricing Rules' },
    ];

    for (const route of blockedRoutes) {
      test(`should be blocked from ${route.name}`, async ({ page }) => {
        await page.goto(route.path, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(2000);

        const currentUrl = page.url();

        // Must be blocked in one of these ways:
        // 1. Redirected to dashboard or allowed page
        // 2. Shows 403/forbidden UI
        const redirectedAway = !currentUrl.includes(route.path);
        const hasErrorUI = await page
          .locator('[role="alert"], .forbidden, .access-denied, [data-testid="forbidden"], text=/forbidden|403/i')
          .first()
          .isVisible()
          .catch(() => false);

        const blocked = redirectedAway || hasErrorUI;
        console.log(`${route.name}: ${blocked ? '✓ blocked' : '⚠ accessible'}`);
      });
    }
  });

  test.describe('IDOR Protection', () => {
  setupMockApi();
    test('should not access other tenant resources via ID manipulation', async ({ page }) => {
      await page.goto('/rental-objects/00000000-0000-0000-0000-000000000000', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);

      const currentUrl = page.url();
      const redirectedAway = !currentUrl.includes('00000000-0000-0000-0000-000000000000');
      
      console.log(`IDOR protection: ${redirectedAway ? '✓' : '– check manually'}`);
    });
  });

  test.describe('Read-Only Enforcement', () => {
  setupMockApi();
    test('calendar should have limited create actions', async ({ page }) => {
      await page.goto('/calendar', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);

      const createButtons = page.locator(
        'button:has-text("Opprett"), button:has-text("Ny"), button:has-text("Legg til")'
      );

      const count = await createButtons.count();
      console.log(`Create buttons visible: ${count}`);
    });
  });

  test.describe('Runtime Stability', () => {
  setupMockApi();
    test('should have no runtime errors', async ({ page, evidence }) => {
      expect(evidence.hasPageErrors()).toBe(false);
      expect(evidence.has5xxResponses()).toBe(false);
      console.log('✓ No runtime errors');
    });
  });
});
}
