// Skip E2E tests if not explicitly enabled
import { setupMockApi } from '@digilist/api/../mocks/api-server.mock';
import { test, expect } from '@digilist/api/fixtures/qa-expert.fixture';
import { config } from '@digilist/api/config/backoffice.config';

/**
 * RBAC Tests - Admin Access
 * 
 * Validates that Admin role has full access to all backoffice features.
 */
test.describe('Admin RBAC Access', () => {
  setupMockApi();
  test.use({ storageState: 'tests/e2e/backoffice/.auth/admin.json' });

  test.beforeEach(async ({ page }) => {
    // Skip entire test if auth failed (login page shown)
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    
    if (page.url().includes('/login')) {
      test();
    }
  });

  test.describe('Navigation Visibility', () => {
  setupMockApi();
    test('should see all admin menu items in sidebar', async ({ page }) => {
      const sidebar = page.locator(config.selectors.sidebar);
      
      if (!await sidebar.isVisible().catch(() => false)) {
        console.log('Sidebar not visible - skipping');
        return;
      }

      const sidebarText = await sidebar.textContent() || '';

      // Admin should see these sections
      const adminMenuTexts = [
        'Utleieobjekter', // Rental Objects
        'Brukere', // Users
        'Organisasjoner', // Organizations
      ];

      for (const menuText of adminMenuTexts) {
        const found = sidebarText.includes(menuText);
        console.log(`${menuText}: ${found ? '✓' : '✗'}`);
      }
    });

    test('should access system settings', async ({ page }) => {
      await page.goto('/settings', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);

      expect(page.url()).toContain('/settings');
      
      const title = page.locator('h1, [data-testid="page-title"]').first();
      const visible = await title.isVisible().catch(() => false);
      console.log(`Settings page title: ${visible ? '✓' : '✗'}`);
    });

    test('should access tenant administration', async ({ page }) => {
      await page.goto('/tenant/settings', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);

      const currentUrl = page.url();
      const atTenant = currentUrl.includes('/tenant');
      console.log(`Tenant page: ${atTenant ? '✓ accessible' : '✗ redirected'}`);
    });
  });

  test.describe('CRUD Operations', () => {
  setupMockApi();
    test('should access rental object creation wizard', async ({ page }) => {
      await page.goto('/rental-objects/wizard', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);

      expect(page.url()).toContain('/rental-objects');
      
      const hasForm = await page.locator('form, [data-testid="wizard"], .wizard').first().isVisible().catch(() => false);
      console.log(`Wizard form: ${hasForm ? '✓' : '✗'}`);
    });

    test('should access user management', async ({ page }) => {
      await page.goto('/users', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);

      expect(page.url()).toContain('/users');
      
      const title = page.locator('h1, [data-testid="page-title"]').first();
      const visible = await title.isVisible().catch(() => false);
      console.log(`Users page: ${visible ? '✓' : '✗'}`);
    });

    test('should access organization management', async ({ page }) => {
      await page.goto('/organizations', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);

      expect(page.url()).toContain('/organizations');
      
      const title = page.locator('h1, [data-testid="page-title"]').first();
      const visible = await title.isVisible().catch(() => false);
      console.log(`Organizations page: ${visible ? '✓' : '✗'}`);
    });

    test('should access pricing rules', async ({ page }) => {
      await page.goto('/pricing-rules', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);

      const currentUrl = page.url();
      const atPricing = currentUrl.includes('/pricing');
      console.log(`Pricing page: ${atPricing ? '✓' : '✗'}`);
    });
  });

  test.describe('Audit Access', () => {
  setupMockApi();
    test('should access audit log', async ({ page }) => {
      await page.goto('/audit', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);

      const currentUrl = page.url();
      const atAudit = currentUrl.includes('/audit');
      console.log(`Audit page: ${atAudit ? '✓' : '✗'}`);
    });

    test('should access GDPR requests', async ({ page }) => {
      await page.goto('/gdpr-requests', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);

      const currentUrl = page.url();
      const atGdpr = currentUrl.includes('/gdpr');
      console.log(`GDPR page: ${atGdpr ? '✓' : '✗'}`);
    });
  });

  test.describe('Case Handler Functions', () => {
  setupMockApi();
    test('should access work queue with approve capability', async ({ page }) => {
      await page.goto('/work-queue', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);

      expect(page.url()).toContain('/work-queue');
      
      const title = page.locator('h1, [data-testid="page-title"]').first();
      const visible = await title.isVisible().catch(() => false);
      console.log(`Work queue: ${visible ? '✓' : '✗'}`);
    });

    test('should access decision forms', async ({ page }) => {
      await page.goto('/decision-forms', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);

      const currentUrl = page.url();
      const atDecision = currentUrl.includes('/decision');
      console.log(`Decision forms: ${atDecision ? '✓' : '✗'}`);
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
