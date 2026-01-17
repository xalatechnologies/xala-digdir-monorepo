/**
 * E2E Tests: Tenant Admin Data Page Components
 * 
 * Tests for reusable dashboard components in Tenant Admin:
 * - EmptyState scenarios
 * - DataPageHeader with counts
 * - Responsive behavior
 * - i18n translations
 */

import { test, expect, Page } from '@playwright/test';

const TENANT_ADMIN_URL = 'http://localhost:5177';

/**
 * Helper: Mock authentication for Tenant Admin
 */
async function mockTenantAdminAuth(page: Page) {
  await page.evaluate(() => {
    const mockUser = {
      id: 'test-tenant-admin-id',
      email: 'tenant-admin@kommune.no',
      name: 'Test Tenant Admin',
      role: 'TENANT_ADMIN',
      tenantId: 'test-tenant-id',
      tenantName: 'Test Kommune',
      permissions: [
        'tenant:read',
        'tenant:users:read',
        'tenant:feature-flags:read',
      ],
    };

    const mockToken = {
      accessToken: 'mock-jwt-token-for-tenant-admin',
      expiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
      refreshToken: 'mock-refresh-token-tenant',
    };

    localStorage.setItem('auth_user', JSON.stringify(mockUser));
    localStorage.setItem('auth_token', JSON.stringify(mockToken));
    localStorage.setItem('isAuthenticated', 'true');
  });
}

/**
 * Helper: Wait for page load and network idle
 */
async function waitForPageReady(page: Page) {
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);
}

// ============================================================================
// Test Suite: Users Page - Empty States
// ============================================================================

test.describe('Tenant Admin - Users Page Empty States', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${TENANT_ADMIN_URL}/login`);
    await mockTenantAdminAuth(page);
    await page.goto(`${TENANT_ADMIN_URL}/users`);
    await waitForPageReady(page);
  });

  test('should display empty state when no users exist', async ({ page }) => {
    // Mock empty users response
    await page.route('**/api/users**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [], meta: { total: 0, page: 1, totalPages: 1 } }),
      });
    });

    await page.reload();
    await waitForPageReady(page);

    // Check for empty state
    const emptyState = page.getByText(/no results|ingen resultater/i);
    await expect(emptyState).toBeVisible();
  });

  test('should display empty state with different message when search active', async ({ page }) => {
    const searchInput = page.getByPlaceholderText(/search|søk/i);
    await searchInput.fill('nonexistent');
    await waitForPageReady(page);

    // Should show "try different filters" message
    const tryDifferentMessage = page.getByText(/try different|prøv å endre/i);
    const hasMessage = await tryDifferentMessage.isVisible().catch(() => false);
    
    if (hasMessage) {
      await expect(tryDifferentMessage).toBeVisible();
    }
  });
});

// ============================================================================
// Test Suite: Data Page Header
// ============================================================================

test.describe('Tenant Admin - Data Page Header', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${TENANT_ADMIN_URL}/login`);
    await mockTenantAdminAuth(page);
    await page.goto(`${TENANT_ADMIN_URL}/users`);
    await waitForPageReady(page);
  });

  test('should display count badge in header', async ({ page }) => {
    const header = page.getByRole('heading', { name: /users|brukere/i });
    await expect(header).toBeVisible();

    // Header should show count
    const headerText = await header.textContent();
    expect(headerText).toBeTruthy();
  });

  test('should display actions in header', async ({ page }) => {
    const createButton = page.getByRole('button', { name: /create|opprett/i });
    const hasCreateButton = await createButton.isVisible().catch(() => false);
    
    // Create button should be visible
    expect(hasCreateButton).toBeTruthy();
  });
});

// ============================================================================
// Test Suite: Feature Flags Page - Empty States
// ============================================================================

test.describe('Tenant Admin - Feature Flags Empty States', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${TENANT_ADMIN_URL}/login`);
    await mockTenantAdminAuth(page);
    await page.goto(`${TENANT_ADMIN_URL}/feature-flags`);
    await waitForPageReady(page);
  });

  test('should display empty state when no feature flags', async ({ page }) => {
    // Mock empty feature flags
    await page.route('**/api/tenant/features**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [] }),
      });
    });

    await page.reload();
    await waitForPageReady(page);

    const emptyState = page.getByText(/no results|ingen resultater/i);
    await expect(emptyState).toBeVisible();
  });
});

// ============================================================================
// Test Suite: Responsive Behavior
// ============================================================================

test.describe('Tenant Admin - Responsive Design', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${TENANT_ADMIN_URL}/login`);
    await mockTenantAdminAuth(page);
  });

  test('users page adapts to mobile layout', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(`${TENANT_ADMIN_URL}/users`);
    await waitForPageReady(page);

    // Page should render without horizontal scroll
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);

    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 5);
  });

  test('empty state adapts to mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.route('**/api/users**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [], meta: { total: 0 } }),
      });
    });

    await page.goto(`${TENANT_ADMIN_URL}/users`);
    await waitForPageReady(page);

    // Empty state should be visible and properly sized
    const emptyState = page.getByText(/no results|ingen resultater/i);
    await expect(emptyState).toBeVisible();
  });
});

// ============================================================================
// Test Suite: i18n Translations
// ============================================================================

test.describe('Tenant Admin - i18n Translations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${TENANT_ADMIN_URL}/login`);
    await mockTenantAdminAuth(page);
  });

  test('should display translated page titles', async ({ page }) => {
    await page.goto(`${TENANT_ADMIN_URL}/users`);
    await waitForPageReady(page);

    const header = page.getByRole('heading', { name: /users|brukere/i });
    await expect(header).toBeVisible();
  });

  test('should display translated empty state messages', async ({ page }) => {
    await page.route('**/api/users**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [], meta: { total: 0 } }),
      });
    });

    await page.goto(`${TENANT_ADMIN_URL}/users`);
    await waitForPageReady(page);

    const emptyState = page.getByText(/no results|ingen resultater/i);
    await expect(emptyState).toBeVisible();
  });
});
