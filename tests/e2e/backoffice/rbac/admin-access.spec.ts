import { test, expect } from '../fixtures/evidence.fixture';
import { config } from '../config/backoffice.config';

/**
 * RBAC Tests - Admin Access
 * 
 * Validates that Admin role has full access to all backoffice features.
 */
test.describe('Admin RBAC Access', () => {
  test.use({ storageState: 'tests/e2e/backoffice/.auth/admin.json' });

  test.describe('Navigation Visibility', () => {
    test('should see all admin menu items in sidebar', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const sidebar = page.locator(config.selectors.sidebar);
      await expect(sidebar).toBeVisible();

      // Admin should see all these sections
      const adminMenuTexts = [
        'Utleieobjekter', // Rental Objects
        'Brukere', // Users
        'Organisasjoner', // Organizations
        'Innstillinger', // Settings
      ];

      const sidebarText = await sidebar.textContent() || '';

      for (const menuText of adminMenuTexts) {
        expect(
          sidebarText.includes(menuText),
          `Admin should see "${menuText}" in sidebar`
        ).toBe(true);
      }
    });

    test('should access system settings', async ({ page }) => {
      await page.goto('/settings');
      await page.waitForLoadState('networkidle');

      // Should load settings page
      expect(page.url()).toContain('/settings');
      
      // Should not redirect away
      await expect(page.locator('h1, [data-testid="page-title"]')).toBeVisible();
    });

    test('should access tenant administration', async ({ page }) => {
      await page.goto('/tenant/settings');
      await page.waitForLoadState('networkidle');

      expect(page.url()).toContain('/tenant');
      await expect(page.locator('h1, [data-testid="page-title"]')).toBeVisible();
    });
  });

  test.describe('CRUD Operations', () => {
    test('should access rental object creation wizard', async ({ page }) => {
      await page.goto('/rental-objects/wizard');
      await page.waitForLoadState('networkidle');

      // Should see wizard or creation form
      expect(page.url()).toContain('/rental-objects');
      
      // Check for form or stepper
      const hasForm = await page.locator('form, [data-testid="wizard"], .wizard').isVisible();
      expect(hasForm).toBe(true);
    });

    test('should access user management', async ({ page }) => {
      await page.goto('/users');
      await page.waitForLoadState('networkidle');

      expect(page.url()).toContain('/users');
      
      // Should see user list or management UI
      await expect(page.locator('h1, [data-testid="page-title"]')).toBeVisible();
    });

    test('should access organization management', async ({ page }) => {
      await page.goto('/organizations');
      await page.waitForLoadState('networkidle');

      expect(page.url()).toContain('/organizations');
      await expect(page.locator('h1, [data-testid="page-title"]')).toBeVisible();
    });

    test('should access pricing rules', async ({ page }) => {
      await page.goto('/pricing-rules');
      await page.waitForLoadState('networkidle');

      expect(page.url()).toContain('/pricing');
      await expect(page.locator('h1, [data-testid="page-title"]')).toBeVisible();
    });
  });

  test.describe('Audit Access', () => {
    test('should access audit log', async ({ page }) => {
      await page.goto('/audit');
      await page.waitForLoadState('networkidle');

      expect(page.url()).toContain('/audit');
      await expect(page.locator('h1, [data-testid="page-title"]')).toBeVisible();
    });

    test('should access GDPR requests', async ({ page }) => {
      await page.goto('/gdpr-requests');
      await page.waitForLoadState('networkidle');

      expect(page.url()).toContain('/gdpr');
      await expect(page.locator('h1, [data-testid="page-title"]')).toBeVisible();
    });
  });

  test.describe('Case Handler Functions', () => {
    test('should access work queue with approve capability', async ({ page }) => {
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
  });
});
