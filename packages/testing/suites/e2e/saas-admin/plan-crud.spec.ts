// Skip E2E tests if not explicitly enabled
import { setupMockApi } from '../../../mocks/api-server.mock';
/**
 * SaaS Admin - Plan CRUD E2E Tests
 * Tests for subscription plan creation, viewing, and management
 */

import { test, expect } from '@playwright/test';

test.describe('Plan Management', () => {
  setupMockApi();
  test.beforeEach(async ({ page }) => {
    // Login as SaaS Admin
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'admin@platform.test');
    await page.fill('[data-testid="password-input"]', 'test-password');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('/');
  });

  test.describe('Plans List', () => {
  setupMockApi();
    test('should display plans list page', async ({ page }) => {
      await page.goto('/plans');
      await expect(page.locator('h1')).toContainText('Abonnementsplaner');
      await expect(page.locator('table')).toBeVisible();
    });

    test('should search plans by name', async ({ page }) => {
      await page.goto('/plans');
      await page.fill('[data-testid="search-input"]', 'Starter');
      await expect(page.locator('table tbody tr').first()).toContainText('Starter');
    });

    test('should filter plans by status', async ({ page }) => {
      await page.goto('/plans');
      await page.click('[data-testid="status-filter-active"]');
      const rows = page.locator('table tbody tr');
      for (const row of await rows.all()) {
        await expect(row.locator('[data-testid="status-badge"]')).toContainText('Aktiv');
      }
    });

    test('should display plan pricing info', async ({ page }) => {
      await page.goto('/plans');
      const firstRow = page.locator('table tbody tr').first();
      await expect(firstRow.locator('[data-testid="plan-price"]')).toBeVisible();
      await expect(firstRow.locator('[data-testid="plan-interval"]')).toBeVisible();
    });
  });

  test.describe('Create Plan', () => {
  setupMockApi();
    test('should navigate to create plan page', async ({ page }) => {
      await page.goto('/plans');
      await page.click('[data-testid="create-plan-button"]');
      await expect(page).toHaveURL('/plans/new');
      await expect(page.locator('h1')).toContainText('Opprett plan');
    });

    test('should validate required fields', async ({ page }) => {
      await page.goto('/plans/new');
      await page.click('[type="submit"]');
      await expect(page.locator('[data-testid="name-error"]')).toBeVisible();
    });

    test('should auto-generate slug from name', async ({ page }) => {
      await page.goto('/plans/new');
      await page.fill('[data-testid="name-input"]', 'Enterprise Plus');
      await expect(page.locator('[data-testid="slug-input"]')).toHaveValue('enterprise-plus');
    });

    test('should set pricing options', async ({ page }) => {
      await page.goto('/plans/new');
      await page.fill('[data-testid="price-input"]', '999');
      await page.selectOption('[data-testid="currency-select"]', 'NOK');
      await page.selectOption('[data-testid="billing-period-select"]', 'monthly');
      await expect(page.locator('[data-testid="price-input"]')).toHaveValue('999');
    });

    test('should configure seat limits', async ({ page }) => {
      await page.goto('/plans/new');
      await page.fill('[data-testid="max-users-input"]', '50');
      await page.fill('[data-testid="max-orgs-input"]', '10');
      await expect(page.locator('[data-testid="max-users-input"]')).toHaveValue('50');
    });

    test('should toggle entitlements', async ({ page }) => {
      await page.goto('/plans/new');
      const moduleToggle = page.locator('[data-testid="entitlement-toggle"]').first();
      await moduleToggle.click();
      await expect(moduleToggle).toBeChecked();
    });

    test('should create plan successfully', async ({ page }) => {
      await page.goto('/plans/new');
      await page.fill('[data-testid="name-input"]', `E2E Test Plan ${Date.now()}`);
      await page.fill('[data-testid="price-input"]', '299');
      await page.selectOption('[data-testid="billing-period-select"]', 'monthly');
      await page.click('[type="submit"]');
      await expect(page).toHaveURL(/\/plans\/[a-f0-9-]+$/);
    });
  });

  test.describe('Plan Detail', () => {
  setupMockApi();
    test('should display plan details', async ({ page }) => {
      await page.goto('/plans');
      await page.click('table tbody tr:first-child [data-testid="view-details"]');
      await expect(page.locator('[data-testid="plan-name"]')).toBeVisible();
      await expect(page.locator('[data-testid="plan-price"]')).toBeVisible();
    });

    test('should display seat limits', async ({ page }) => {
      await page.goto('/plans');
      await page.click('table tbody tr:first-child [data-testid="view-details"]');
      await expect(page.locator('[data-testid="seat-limits-section"]')).toBeVisible();
    });

    test('should display entitlements matrix', async ({ page }) => {
      await page.goto('/plans');
      await page.click('table tbody tr:first-child [data-testid="view-details"]');
      await expect(page.locator('[data-testid="entitlements-section"]')).toBeVisible();
    });

    test('should display subscribed tenants', async ({ page }) => {
      await page.goto('/plans');
      await page.click('table tbody tr:first-child [data-testid="view-details"]');
      await expect(page.locator('[data-testid="tenants-section"]')).toBeVisible();
    });
  });

  test.describe('Plan Status', () => {
  setupMockApi();
    test('should change plan to inactive', async ({ page }) => {
      await page.goto('/plans');
      await page.click('table tbody tr:first-child [data-testid="actions-menu"]');
      await page.click('[data-testid="action-deactivate"]');
      await expect(page.locator('table tbody tr:first-child [data-testid="status-badge"]')).toContainText('Inaktiv');
    });

    test('should change plan to deprecated', async ({ page }) => {
      await page.goto('/plans');
      await page.click('table tbody tr:first-child [data-testid="actions-menu"]');
      await page.click('[data-testid="action-deprecate"]');
      await expect(page.locator('table tbody tr:first-child [data-testid="status-badge"]')).toContainText('Utgått');
    });
  });
});
}
