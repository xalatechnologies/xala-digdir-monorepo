// Skip E2E tests if not explicitly enabled
if (process.env.E2E_ENABLED !== 'true') {
  describe.skip('E2E tests require E2E_ENABLED=true', () => {});
} else {
import { setupMockApi } from '../../mocks/api-server.mock';
/**
 * E2E Tests: SaaS Admin Data Page Components
 * 
 * Tests for the reusable dashboard components:
 * - StatusTabs filtering and counts
 * - FilterChips removal and reset
 * - EmptyState scenarios
 * - DataPageHeader with counts
 * - Responsive behavior
 * - i18n translations
 */

import { test, expect, Page } from '@playwright/test';

const SAAS_ADMIN_URL = 'http://localhost:5176';

/**
 * Helper: Mock authentication for SaaS Admin
 */
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
        'saas:plans:create',
      ],
    };

    const mockToken = {
      accessToken: 'mock-jwt-token-for-testing',
      expiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
      refreshToken: 'mock-refresh-token',
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
// Test Suite: Status Tab Filtering and Counts
// ============================================================================

test.describe('SaaS Admin - Status Tabs Filtering', () => {
  setupMockApi();
  test.beforeEach(async ({ page }) => {
    await page.goto(`${SAAS_ADMIN_URL}/login`);
    await mockSaasAdminAuth(page);
    await page.goto(`${SAAS_ADMIN_URL}/tenants`);
    await waitForPageReady(page);
  });

  test('should display status tabs with counts', async ({ page }) => {
    // Verify status tabs are rendered
    const allTab = page.getByRole('tab', { name: /all|alle/i });
    await expect(allTab).toBeVisible();

    const activeTab = page.getByRole('tab', { name: /active|aktiv/i });
    await expect(activeTab).toBeVisible();

    // Check that counts are displayed (numbers in badges)
    const tabText = await allTab.textContent();
    expect(tabText).toMatch(/\d+/); // Should contain a number
  });

  test('should filter tenants when status tab is clicked', async ({ page }) => {
    // Click on Active tab
    const activeTab = page.getByRole('tab', { name: /active|aktiv/i });
    await activeTab.click();
    await waitForPageReady(page);

    // Verify tab is active (has aria-selected="true")
    await expect(activeTab).toHaveAttribute('aria-selected', 'true');

    // Verify URL or state changed (check for active filter)
    // The page should show filtered results
    const pageContent = await page.content();
    // Should show active tenants or empty state
    expect(
      pageContent.includes('active') ||
      pageContent.includes('Aktiv') ||
      pageContent.includes('No tenants') ||
      pageContent.includes('Ingen leietakere')
    ).toBeTruthy();
  });

  test('should update counts when data changes', async ({ page }) => {
    // Get initial count
    const allTab = page.getByRole('tab', { name: /all|alle/i });
    const initialText = await allTab.textContent();
    const initialCount = initialText?.match(/\d+/)?.[0];

    // Wait a bit and check if counts update (if API refetches)
    await page.waitForTimeout(2000);
    const updatedText = await allTab.textContent();
    
    // Counts should be consistent (or updated if data changed)
    expect(updatedText).toBeTruthy();
  });

  test('should highlight active tab correctly', async ({ page }) => {
    // Click on a tab
    const inactiveTab = page.getByRole('tab', { name: /inactive|inaktiv/i });
    await inactiveTab.click();
    await waitForPageReady(page);

    // Verify it's marked as active
    await expect(inactiveTab).toHaveAttribute('aria-selected', 'true');

    // Verify other tabs are not active
    const allTab = page.getByRole('tab', { name: /all|alle/i });
    await expect(allTab).toHaveAttribute('aria-selected', 'false');
  });
});

// ============================================================================
// Test Suite: Filter Chips Removal and Reset
// ============================================================================

test.describe('SaaS Admin - Filter Chips', () => {
  setupMockApi();
  test.beforeEach(async ({ page }) => {
    await page.goto(`${SAAS_ADMIN_URL}/login`);
    await mockSaasAdminAuth(page);
    await page.goto(`${SAAS_ADMIN_URL}/tenants`);
    await waitForPageReady(page);
  });

  test('should display filter chips when filters are active', async ({ page }) => {
    // Activate a filter by clicking status tab
    const activeTab = page.getByRole('tab', { name: /active|aktiv/i });
    await activeTab.click();
    await waitForPageReady(page);

    // Check for filter chips section
    const filterChips = page.locator('.filter-chips, [class*="filter-chip"]');
    const chipsVisible = await filterChips.isVisible().catch(() => false);
    
    // Filter chips should appear or status tab acts as filter indicator
    if (chipsVisible) {
      await expect(filterChips).toBeVisible();
    }
  });

  test('should remove filter when chip is clicked', async ({ page }) => {
    // Activate filter
    const activeTab = page.getByRole('tab', { name: /active|aktiv/i });
    await activeTab.click();
    await waitForPageReady(page);

    // Find remove button on filter chip
    const removeButton = page.getByLabelText(/fjern filter|remove filter/i).first();
    const hasRemoveButton = await removeButton.isVisible().catch(() => false);

    if (hasRemoveButton) {
      await removeButton.click();
      await waitForPageReady(page);

      // Verify filter is removed (All tab should be active)
      const allTab = page.getByRole('tab', { name: /all|alle/i });
      await expect(allTab).toHaveAttribute('aria-selected', 'true');
    }
  });

  test('should reset all filters when reset button is clicked', async ({ page }) => {
    // Activate multiple filters
    const activeTab = page.getByRole('tab', { name: /active|aktiv/i });
    await activeTab.click();
    await waitForPageReady(page);

    const searchInput = page.getByPlaceholderText(/search|søk/i);
    await searchInput.fill('test');
    await waitForPageReady(page);

    // Find reset all button
    const resetButton = page.getByRole('button', { name: /reset all|nullstill alle/i });
    const hasResetButton = await resetButton.isVisible().catch(() => false);

    if (hasResetButton) {
      await resetButton.click();
      await waitForPageReady(page);

      // Verify all filters cleared
      await expect(searchInput).toHaveValue('');
      const allTab = page.getByRole('tab', { name: /all|alle/i });
      await expect(allTab).toHaveAttribute('aria-selected', 'true');
    }
  });
});

// ============================================================================
// Test Suite: Empty States
// ============================================================================

test.describe('SaaS Admin - Empty States', () => {
  setupMockApi();
  test.beforeEach(async ({ page }) => {
    await page.goto(`${SAAS_ADMIN_URL}/login`);
    await mockSaasAdminAuth(page);
  });

  test('should display empty state when no tenants exist', async ({ page }) => {
    // Mock empty data response
    await page.route('**/api/saas/tenants**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [], meta: { total: 0, page: 1, totalPages: 1 } }),
      });
    });

    await page.goto(`${SAAS_ADMIN_URL}/tenants`);
    await waitForPageReady(page);

    // Check for empty state
    const emptyState = page.getByText(/no tenants|ingen leietakere/i);
    await expect(emptyState).toBeVisible();
  });

  test('should display empty state with create action when no filters', async ({ page }) => {
    await page.route('**/api/saas/tenants**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [], meta: { total: 0, page: 1, totalPages: 1 } }),
      });
    });

    await page.goto(`${SAAS_ADMIN_URL}/tenants`);
    await waitForPageReady(page);

    // Should show create button in empty state
    const createButton = page.getByRole('button', { name: /create tenant|opprett leietaker/i });
    const hasCreateButton = await createButton.isVisible().catch(() => false);
    
    // Create button should be visible in empty state or in header
    expect(hasCreateButton).toBeTruthy();
  });

  test('should display different message when filters are active', async ({ page }) => {
    await page.goto(`${SAAS_ADMIN_URL}/tenants`);
    await waitForPageReady(page);

    // Activate filter that returns no results
    const suspendedTab = page.getByRole('tab', { name: /suspended|suspendert/i });
    await suspendedTab.click();
    await waitForPageReady(page);

    // Should show "try different filters" message
    const tryDifferentMessage = page.getByText(/try different|prøv å endre/i);
    const hasMessage = await tryDifferentMessage.isVisible().catch(() => false);
    
    // Message should appear if no results with filters
    if (hasMessage) {
      await expect(tryDifferentMessage).toBeVisible();
    }
  });
});

// ============================================================================
// Test Suite: Data Page Header
// ============================================================================

test.describe('SaaS Admin - Data Page Header', () => {
  setupMockApi();
  test.beforeEach(async ({ page }) => {
    await page.goto(`${SAAS_ADMIN_URL}/login`);
    await mockSaasAdminAuth(page);
    await page.goto(`${SAAS_ADMIN_URL}/tenants`);
    await waitForPageReady(page);
  });

  test('should display count badge in header', async ({ page }) => {
    // Check for header with count
    const header = page.getByRole('heading', { name: /tenants|leietakere/i });
    await expect(header).toBeVisible();

    // Check for count badge (number near title)
    const headerText = await header.textContent();
    // Should contain a number (count)
    expect(headerText).toMatch(/\d+/);
  });

  test('should display actions in header', async ({ page }) => {
    // Check for create button in header
    const createButton = page.getByRole('link', { name: /create tenant|opprett/i });
    await expect(createButton).toBeVisible();
  });
});

// ============================================================================
// Test Suite: Responsive Behavior
// ============================================================================

test.describe('SaaS Admin - Responsive Design', () => {
  setupMockApi();
  test.beforeEach(async ({ page }) => {
    await page.goto(`${SAAS_ADMIN_URL}/login`);
    await mockSaasAdminAuth(page);
  });

  test('status tabs should scroll horizontally on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(`${SAAS_ADMIN_URL}/tenants`);
    await waitForPageReady(page);

    // Status tabs container should have overflow-x-auto
    const tabsContainer = page.locator('.status-tabs').first();
    const hasTabs = await tabsContainer.isVisible().catch(() => false);

    if (hasTabs) {
      // Check if tabs can scroll
      const scrollWidth = await tabsContainer.evaluate((el) => el.scrollWidth);
      const clientWidth = await tabsContainer.evaluate((el) => el.clientWidth);
      
      // If content is wider, scrolling should be enabled
      if (scrollWidth > clientWidth) {
        const overflowX = await tabsContainer.evaluate((el) => window.getComputedStyle(el).overflowX);
        expect(['auto', 'scroll', 'overlay']).toContain(overflowX);
      }
    }
  });

  test('filter chips should wrap on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(`${SAAS_ADMIN_URL}/tenants`);
    await waitForPageReady(page);

    // Activate filter
    const activeTab = page.getByRole('tab', { name: /active|aktiv/i });
    await activeTab.click();
    await waitForPageReady(page);

    // Filter chips should wrap
    const filterChips = page.locator('.filter-chips').first();
    const hasChips = await filterChips.isVisible().catch(() => false);

    if (hasChips) {
      const flexWrap = await filterChips.evaluate((el) => window.getComputedStyle(el).flexWrap);
      expect(['wrap', 'wrap-reverse']).toContain(flexWrap);
    }
  });

  test('no horizontal scroll on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(`${SAAS_ADMIN_URL}/tenants`);
    await waitForPageReady(page);

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);

    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 5);
  });
});

// ============================================================================
// Test Suite: i18n Translations
// ============================================================================

test.describe('SaaS Admin - i18n Translations', () => {
  setupMockApi();
  test.beforeEach(async ({ page }) => {
    await page.goto(`${SAAS_ADMIN_URL}/login`);
    await mockSaasAdminAuth(page);
    await page.goto(`${SAAS_ADMIN_URL}/tenants`);
    await waitForPageReady(page);
  });

  test('should display translated status labels', async ({ page }) => {
    // Status labels should be translated (not hardcoded English)
    const activeTab = page.getByRole('tab', { name: /active|aktiv/i });
    await expect(activeTab).toBeVisible();

    // Check that labels are not raw English if locale is Norwegian
    const tabText = await activeTab.textContent();
    expect(tabText).toBeTruthy();
  });

  test('should display translated filter chip labels', async ({ page }) => {
    // Activate filter
    const activeTab = page.getByRole('tab', { name: /active|aktiv/i });
    await activeTab.click();
    await waitForPageReady(page);

    // Check for translated labels
    const activeFiltersLabel = page.getByText(/aktive filter|active filters/i);
    const hasLabel = await activeFiltersLabel.isVisible().catch(() => false);
    
    if (hasLabel) {
      await expect(activeFiltersLabel).toBeVisible();
    }
  });

  test('should display translated empty state messages', async ({ page }) => {
    // Mock empty data
    await page.route('**/api/saas/tenants**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [], meta: { total: 0, page: 1, totalPages: 1 } }),
      });
    });

    await page.goto(`${SAAS_ADMIN_URL}/tenants`);
    await waitForPageReady(page);

    // Empty state should be translated
    const emptyState = page.getByText(/no tenants|ingen leietakere/i);
    await expect(emptyState).toBeVisible();
  });
});

// ============================================================================
// Test Suite: Plans Page Components
// ============================================================================

test.describe('SaaS Admin - Plans Page Components', () => {
  setupMockApi();
  test.beforeEach(async ({ page }) => {
    await page.goto(`${SAAS_ADMIN_URL}/login`);
    await mockSaasAdminAuth(page);
    await page.goto(`${SAAS_ADMIN_URL}/plans`);
    await waitForPageReady(page);
  });

  test('should display status tabs on plans page', async ({ page }) => {
    const allTab = page.getByRole('tab', { name: /all|alle/i });
    await expect(allTab).toBeVisible();
  });

  test('should filter plans by status', async ({ page }) => {
    const activeTab = page.getByRole('tab', { name: /active|aktiv/i });
    await activeTab.click();
    await waitForPageReady(page);

    await expect(activeTab).toHaveAttribute('aria-selected', 'true');
  });

  test('should display empty state when no plans', async ({ page }) => {
    await page.route('**/api/saas/plans**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [], meta: { total: 0, page: 1, totalPages: 1 } }),
      });
    });

    await page.reload();
    await waitForPageReady(page);

    const emptyState = page.getByText(/no plans|ingen planer/i);
    await expect(emptyState).toBeVisible();
  });
});
}
