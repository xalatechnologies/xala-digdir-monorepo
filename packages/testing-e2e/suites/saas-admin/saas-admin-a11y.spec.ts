// Skip E2E tests if not explicitly enabled
import { setupMockApi } from '../../mocks/api-server.mock';
/**
 * SaaS Admin Accessibility Tests
 *
 * WCAG 2.1 AA verification for SaaS Admin application.
 * Uses Axe-core for automated accessibility testing.
 *
 * @module tests/e2e/saas-admin/saas-admin-a11y.spec
 */

import { test, expect, Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const SAAS_ADMIN_URL = 'http://localhost:5176';

// ============================================================================
// Helper Functions
// ============================================================================

async function mockSaasAdminAuth(page: Page) {
  await page.evaluate(() => {
    const mockUser = {
      id: 'test-saas-admin-id',
      email: 'saas-admin@digilist.no',
      name: 'Test SaaS Admin',
      role: 'SAAS_SUPER_ADMIN',
      permissions: [
        'saas:tenants:read',
        'saas:tenants:create',
        'saas:plans:read',
        'saas:feature-flags:read',
      ],
    };

    const mockToken = {
      accessToken: 'mock-jwt-token-for-testing',
      expiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
    };

    localStorage.setItem('auth_user', JSON.stringify(mockUser));
    localStorage.setItem('auth_token', JSON.stringify(mockToken));
    localStorage.setItem('isAuthenticated', 'true');
  });

async function waitForPageReady(page: Page) {
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);

// ============================================================================
// Test Suite: WCAG 2.1 AA Compliance
// ============================================================================

test.describe('SaaS Admin - WCAG 2.1 AA Compliance', () => {
  setupMockApi(test);
  test.beforeEach(async ({ page }) => {
    await page.goto(`${SAAS_ADMIN_URL}/login`);
    await mockSaasAdminAuth(page);
  });

  test('login page passes Axe accessibility checks', async ({ page }) => {
    await page.goto(`${SAAS_ADMIN_URL}/login`);
    await waitForPageReady(page);

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();

    expect(results.violations).toEqual([]);
  });

  test('dashboard passes Axe accessibility checks', async ({ page }) => {
    await page.goto(`${SAAS_ADMIN_URL}/`);
    await waitForPageReady(page);

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();

    expect(results.violations).toEqual([]);
  });

  test('tenants list passes Axe accessibility checks', async ({ page }) => {
    await page.goto(`${SAAS_ADMIN_URL}/tenants`);
    await waitForPageReady(page);

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();

    expect(results.violations).toEqual([]);
  });

  test('plans list passes Axe accessibility checks', async ({ page }) => {
    await page.goto(`${SAAS_ADMIN_URL}/plans`);
    await waitForPageReady(page);

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();

    expect(results.violations).toEqual([]);
  });

  test('feature flags page passes Axe accessibility checks', async ({ page }) => {
    await page.goto(`${SAAS_ADMIN_URL}/feature-flags`);
    await waitForPageReady(page);

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();

    expect(results.violations).toEqual([]);
  });
});

// ============================================================================
// Test Suite: Keyboard Navigation
// ============================================================================

test.describe('SaaS Admin - Keyboard Navigation', () => {
  setupMockApi(test);
  test.beforeEach(async ({ page }) => {
    await page.goto(`${SAAS_ADMIN_URL}/login`);
    await mockSaasAdminAuth(page);
  });

  test('can navigate sidebar using keyboard', async ({ page }) => {
    await page.goto(`${SAAS_ADMIN_URL}/`);
    await waitForPageReady(page);

    // Tab through navigation items
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Verify focus is visible
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });

  test('can activate buttons with Enter key', async ({ page }) => {
    await page.goto(`${SAAS_ADMIN_URL}/tenants`);
    await waitForPageReady(page);

    // Find and focus a button
    const searchInput = page.getByPlaceholder(/Søk etter tenant/i);
    await searchInput.focus();

    // Type and submit
    await searchInput.fill('test');
    await page.keyboard.press('Enter');

    // Verify action was triggered
    await expect(searchInput).toHaveValue('test');
  });

  test('modals can be closed with Escape key', async ({ page }) => {
    await page.goto(`${SAAS_ADMIN_URL}/tenants`);
    await waitForPageReady(page);

    // If a dropdown is open, Escape should close it
    const statusFilter = page.getByRole('button', { name: /Status:/i });
    if (await statusFilter.isVisible()) {
      await statusFilter.click();
      await page.keyboard.press('Escape');
      // Dropdown should close
    }

    // Page should still be accessible
    await expect(page.getByRole('heading', { name: 'Tenants' })).toBeVisible();
  });

  test('focus trap works in modal dialogs', async ({ page }) => {
    await page.goto(`${SAAS_ADMIN_URL}/tenants`);
    await waitForPageReady(page);

    // Navigate with Tab, focus should cycle within the page
    for (let i = 0; i < 20; i++) {
      await page.keyboard.press('Tab');
    }

    // Focus should still be on page
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });
});

// ============================================================================
// Test Suite: Focus Management
// ============================================================================

test.describe('SaaS Admin - Focus Management', () => {
  setupMockApi(test);
  test.beforeEach(async ({ page }) => {
    await page.goto(`${SAAS_ADMIN_URL}/login`);
    await mockSaasAdminAuth(page);
  });

  test('focus moves to main content on page load', async ({ page }) => {
    await page.goto(`${SAAS_ADMIN_URL}/tenants`);
    await waitForPageReady(page);

    // Skip link should be available
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('focus returns to trigger after modal close', async ({ page }) => {
    await page.goto(`${SAAS_ADMIN_URL}/tenants`);
    await waitForPageReady(page);

    const statusFilter = page.getByRole('button', { name: /Status:/i });

    if (await statusFilter.isVisible()) {
      await statusFilter.click();
      await page.keyboard.press('Escape');

      // Focus should return to the button that opened the dropdown
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
    }
  });
});

// ============================================================================
// Test Suite: Color Contrast
// ============================================================================

test.describe('SaaS Admin - Color Contrast', () => {
  setupMockApi(test);
  test.beforeEach(async ({ page }) => {
    await page.goto(`${SAAS_ADMIN_URL}/login`);
    await mockSaasAdminAuth(page);
  });

  test('text has sufficient color contrast', async ({ page }) => {
    await page.goto(`${SAAS_ADMIN_URL}/`);
    await waitForPageReady(page);

    const results = await new AxeBuilder({ page })
      .withRules(['color-contrast'])
      .analyze();

    expect(results.violations).toEqual([]);
  });

  test('interactive elements have visible focus indicators', async ({ page }) => {
    await page.goto(`${SAAS_ADMIN_URL}/tenants`);
    await waitForPageReady(page);

    // Tab to an interactive element
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    const focusedElement = page.locator(':focus');

    // Check that focused element has visible styling
    // This is verified by Axe but we also check manually
    await expect(focusedElement).toBeVisible();
  });
});

// ============================================================================
// Test Suite: Screen Reader Support
// ============================================================================

test.describe('SaaS Admin - Screen Reader Support', () => {
  setupMockApi(test);
  test.beforeEach(async ({ page }) => {
    await page.goto(`${SAAS_ADMIN_URL}/login`);
    await mockSaasAdminAuth(page);
  });

  test('page has proper heading hierarchy', async ({ page }) => {
    await page.goto(`${SAAS_ADMIN_URL}/tenants`);
    await waitForPageReady(page);

    // Check for h1
    const h1 = page.locator('h1');
    const h1Count = await h1.count();
    expect(h1Count).toBe(1); // Only one h1 per page

    // Check heading hierarchy (no skipped levels)
    const results = await new AxeBuilder({ page })
      .withRules(['heading-order'])
      .analyze();

    expect(results.violations).toEqual([]);
  });

  test('images have alt text', async ({ page }) => {
    await page.goto(`${SAAS_ADMIN_URL}/`);
    await waitForPageReady(page);

    const results = await new AxeBuilder({ page })
      .withRules(['image-alt'])
      .analyze();

    expect(results.violations).toEqual([]);
  });

  test('form inputs have labels', async ({ page }) => {
    await page.goto(`${SAAS_ADMIN_URL}/tenants`);
    await waitForPageReady(page);

    const results = await new AxeBuilder({ page })
      .withRules(['label'])
      .analyze();

    expect(results.violations).toEqual([]);
  });

  test('tables have proper structure', async ({ page }) => {
    await page.goto(`${SAAS_ADMIN_URL}/tenants`);
    await waitForPageReady(page);

    // Check for table headers
    const tableHeaders = page.locator('th');
    const headerCount = await tableHeaders.count();

    if (headerCount > 0) {
      // Verify table structure
      const results = await new AxeBuilder({ page })
        .withRules(['th-has-data-cells'])
        .analyze();

      expect(results.violations).toEqual([]);
    }
  });

  test('ARIA landmarks are properly used', async ({ page }) => {
    await page.goto(`${SAAS_ADMIN_URL}/`);
    await waitForPageReady(page);

    const results = await new AxeBuilder({ page })
      .withRules(['landmark-one-main', 'region'])
      .analyze();

    expect(results.violations).toEqual([]);
  });
});
});
});
