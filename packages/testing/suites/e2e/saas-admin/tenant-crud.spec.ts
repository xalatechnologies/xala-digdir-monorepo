// Skip E2E tests if not explicitly enabled
if (process.env.E2E_ENABLED !== 'true') {
  describe.skip('E2E tests require E2E_ENABLED=true', () => {});
} else {
import { setupMockApi } from '../../../mocks/api-server.mock';
/**
 * SaaS Admin - Tenant CRUD E2E Tests
 * Tests for tenant creation, editing, and management flows
 */

import { test, expect } from '@playwright/test';

test.describe('Tenant Management', () => {
  setupMockApi();
  test.beforeEach(async ({ page }) => {
    // Login as SaaS Admin
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'admin@platform.test');
    await page.fill('[data-testid="password-input"]', 'test-password');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('/');
  });

  test.describe('Tenant List', () => {
  setupMockApi();
    test('should display tenants list page', async ({ page }) => {
      await page.goto('/tenants');
      await expect(page.locator('h1')).toContainText('Tenanter');
      await expect(page.locator('table')).toBeVisible();
    });

    test('should search tenants by name', async ({ page }) => {
      await page.goto('/tenants');
      await page.fill('[data-testid="search-input"]', 'Demo');
      await expect(page.locator('table tbody tr')).toHaveCount(1);
    });

    test('should filter tenants by status', async ({ page }) => {
      await page.goto('/tenants');
      await page.click('[data-testid="status-filter-active"]');
      const rows = page.locator('table tbody tr');
      for (const row of await rows.all()) {
        await expect(row.locator('[data-testid="status-badge"]')).toContainText('Aktiv');
      }
    });
  });

  test.describe('Create Tenant', () => {
  setupMockApi();
    test('should navigate to create tenant page', async ({ page }) => {
      await page.goto('/tenants');
      await page.click('[data-testid="create-tenant-button"]');
      await expect(page).toHaveURL('/tenants/new');
      await expect(page.locator('h1')).toContainText('Opprett tenant');
    });

    test('should validate required fields', async ({ page }) => {
      await page.goto('/tenants/new');
      await page.click('[type="submit"]');
      await expect(page.locator('[data-testid="name-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="slug-error"]')).toBeVisible();
    });

    test('should auto-generate slug from name', async ({ page }) => {
      await page.goto('/tenants/new');
      await page.fill('[data-testid="name-input"]', 'Test Kommune');
      await expect(page.locator('[data-testid="slug-input"]')).toHaveValue('test-kommune');
    });

    test('should create tenant successfully', async ({ page }) => {
      await page.goto('/tenants/new');
      await page.fill('[data-testid="name-input"]', `E2E Test Tenant ${Date.now()}`);
      await page.fill('[data-testid="domain-input"]', 'e2e-test.example.com');
      await page.selectOption('[data-testid="plan-select"]', { index: 1 });
      await page.click('[type="submit"]');
      await expect(page).toHaveURL(/\/tenants\/[a-f0-9-]+$/);
    });
  });

  test.describe('Edit Tenant', () => {
  setupMockApi();
    test('should navigate to edit page from detail', async ({ page }) => {
      await page.goto('/tenants');
      await page.click('table tbody tr:first-child [data-testid="view-details"]');
      await page.click('[data-testid="edit-button"]');
      await expect(page).toHaveURL(/\/tenants\/[a-f0-9-]+\/edit$/);
    });

    test('should pre-populate form with tenant data', async ({ page }) => {
      await page.goto('/tenants');
      await page.click('table tbody tr:first-child [data-testid="view-details"]');
      const tenantName = await page.locator('h1').textContent();
      await page.click('[data-testid="edit-button"]');
      await expect(page.locator('[data-testid="name-input"]')).toHaveValue(tenantName ?? '');
    });

    test('should update tenant successfully', async ({ page }) => {
      await page.goto('/tenants');
      await page.click('table tbody tr:first-child [data-testid="view-details"]');
      await page.click('[data-testid="edit-button"]');
      const newName = `Updated ${Date.now()}`;
      await page.fill('[data-testid="name-input"]', newName);
      await page.click('[type="submit"]');
      await expect(page.locator('h1')).toContainText(newName);
    });
  });

  test.describe('Tenant Detail', () => {
  setupMockApi();
    test('should display tenant details', async ({ page }) => {
      await page.goto('/tenants');
      await page.click('table tbody tr:first-child [data-testid="view-details"]');
      await expect(page.locator('[data-testid="tenant-name"]')).toBeVisible();
      await expect(page.locator('[data-testid="status-badge"]')).toBeVisible();
    });

    test('should display usage statistics', async ({ page }) => {
      await page.goto('/tenants');
      await page.click('table tbody tr:first-child [data-testid="view-details"]');
      await expect(page.locator('[data-testid="stat-users"]')).toBeVisible();
      await expect(page.locator('[data-testid="stat-organizations"]')).toBeVisible();
    });

    test('should toggle feature flags', async ({ page }) => {
      await page.goto('/tenants');
      await page.click('table tbody tr:first-child [data-testid="view-details"]');
      await page.click('[data-testid="tab-flags"]');
      const flagSwitch = page.locator('[data-testid="flag-toggle"]').first();
      const initialState = await flagSwitch.isChecked();
      await flagSwitch.click();
      await expect(flagSwitch).toHaveChecked(!initialState);
    });
  });

  test.describe('Suspend/Reactivate', () => {
  setupMockApi();
    test('should suspend active tenant', async ({ page }) => {
      await page.goto('/tenants');
      await page.click('table tbody tr:first-child [data-testid="view-details"]');
      const status = await page.locator('[data-testid="status-badge"]').textContent();
      if (status?.includes('Aktiv')) {
        await page.click('[data-testid="suspend-button"]');
        page.on('dialog', dialog => dialog.accept());
        await expect(page.locator('[data-testid="status-badge"]')).toContainText('Suspendert');
      }
    });

    test('should reactivate suspended tenant', async ({ page }) => {
      await page.goto('/tenants');
      await page.click('[data-testid="status-filter-suspended"]');
      await page.click('table tbody tr:first-child [data-testid="view-details"]');
      await page.click('[data-testid="reactivate-button"]');
      await expect(page.locator('[data-testid="status-badge"]')).toContainText('Aktiv');
    });
  });
});
}
