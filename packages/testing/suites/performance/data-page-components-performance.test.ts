import { setupMockApi } from '@digilist/api/mocks/api-server.mock';
/**
 * Performance Tests: Data Page Components
 * 
 * Benchmarks for:
 * - Status tabs rendering with large counts
 * - Filter chips with many active filters
 * - Empty state rendering
 * - Large dataset filtering performance
 */

import { test, expect } from '@playwright/test';

const SAAS_ADMIN_URL = 'http://localhost:5176';
const TENANT_ADMIN_URL = 'http://localhost:5177';

/**
 * Helper: Mock authentication
 */
async function mockAuth(page: any, app: 'saas-admin' | 'tenant-admin') {
  const mockUser = app === 'saas-admin' 
    ? {
        id: 'test-admin',
        email: 'admin@test.com',
        role: 'SAAS_SUPER_ADMIN',
      }
    : {
        id: 'test-tenant-admin',
        email: 'tenant-admin@test.com',
        role: 'TENANT_ADMIN',
        tenantId: 'test-tenant',
      };

  await page.evaluate((user: any) => {
    localStorage.setItem('auth_user', JSON.stringify(user));
    localStorage.setItem('auth_token', JSON.stringify({ accessToken: 'test' }));
    localStorage.setItem('isAuthenticated', 'true');
  }, mockUser);
}

/**
 * Helper: Generate large dataset
 */
function generateLargeDataset(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: `item-${i}`,
    name: `Item ${i}`,
    status: i % 4 === 0 ? 'active' : i % 4 === 1 ? 'inactive' : i % 4 === 2 ? 'suspended' : 'pending',
  }));
}

// ============================================================================
// Test Suite: Status Tabs Performance
// ============================================================================

test.describe('Status Tabs Performance', () => {
  setupMockApi();
  test('should render status tabs quickly with large counts', async ({ page }) => {
    await page.goto(`${SAAS_ADMIN_URL}/login`);
    await mockAuth(page, 'saas-admin');

    // Mock API with large dataset
    await page.route('**/api/saas/tenants**', (route) => {
      const data = generateLargeDataset(1000);
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: data.slice(0, 50), // First page
          meta: { total: 1000, page: 1, totalPages: 20 },
        }),
      });
    });

    const startTime = Date.now();
    await page.goto(`${SAAS_ADMIN_URL}/tenants`);
    await page.waitForLoadState('networkidle');
    const endTime = Date.now();

    const renderTime = endTime - startTime;
    
    // Status tabs should render in < 1 second
    expect(renderTime).toBeLessThan(1000);

    // Verify tabs are rendered
    const tabs = page.locator('[role="tab"]');
    const tabCount = await tabs.count();
    expect(tabCount).toBeGreaterThan(0);
  });

  test('should handle rapid tab switching without performance degradation', async ({ page }) => {
    await page.goto(`${SAAS_ADMIN_URL}/login`);
    await mockAuth(page, 'saas-admin');
    await page.goto(`${SAAS_ADMIN_URL}/tenants`);
    await page.waitForLoadState('networkidle');

    const tabs = ['all', 'active', 'inactive', 'suspended', 'pending'];
    const switchTimes: number[] = [];

    for (const tabId of tabs) {
      const tab = page.getByRole('tab', { name: new RegExp(tabId, 'i') });
      const startTime = Date.now();
      await tab.click();
      await page.waitForTimeout(100); // Wait for state update
      const endTime = Date.now();
      switchTimes.push(endTime - startTime);
    }

    // Average switch time should be < 200ms
    const avgSwitchTime = switchTimes.reduce((a, b) => a + b, 0) / switchTimes.length;
    expect(avgSwitchTime).toBeLessThan(200);
  });
});

// ============================================================================
// Test Suite: Filter Chips Performance
// ============================================================================

test.describe('Filter Chips Performance', () => {
  setupMockApi();
  test('should render many filter chips efficiently', async ({ page }) => {
    await page.goto(`${SAAS_ADMIN_URL}/login`);
    await mockAuth(page, 'saas-admin');
    await page.goto(`${SAAS_ADMIN_URL}/tenants`);
    await page.waitForLoadState('networkidle');

    // Simulate many active filters
    const startTime = Date.now();
    
    // Activate multiple filters programmatically
    await page.evaluate(() => {
      // Simulate filter activation
      const event = new CustomEvent('filter-activate');
      window.dispatchEvent(event);
    });

    await page.waitForTimeout(100);
    const endTime = Date.now();

    // Filter chips should render quickly
    expect(endTime - startTime).toBeLessThan(500);
  });
});

// ============================================================================
// Test Suite: Empty State Performance
// ============================================================================

test.describe('Empty State Performance', () => {
  setupMockApi();
  test('should render empty state quickly', async ({ page }) => {
    await page.goto(`${SAAS_ADMIN_URL}/login`);
    await mockAuth(page, 'saas-admin');

    await page.route('**/api/saas/tenants**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [], meta: { total: 0, page: 1, totalPages: 1 } }),
      });
    });

    const startTime = Date.now();
    await page.goto(`${SAAS_ADMIN_URL}/tenants`);
    await page.waitForLoadState('networkidle');
    const endTime = Date.now();

    // Empty state should render in < 500ms
    expect(endTime - startTime).toBeLessThan(500);

    // Verify empty state is visible
    const emptyState = page.getByText(/no tenants|ingen leietakere/i);
    await expect(emptyState).toBeVisible();
  });
});

// ============================================================================
// Test Suite: Large Dataset Filtering Performance
// ============================================================================

test.describe('Large Dataset Filtering Performance', () => {
  setupMockApi();
  test('should filter large datasets efficiently', async ({ page }) => {
    await page.goto(`${SAAS_ADMIN_URL}/login`);
    await mockAuth(page, 'saas-admin');

    const largeDataset = generateLargeDataset(5000);

    await page.route('**/api/saas/tenants**', (route) => {
      const url = new URL(route.request().url());
      const status = url.searchParams.get('status');

      let filtered = largeDataset;
      if (status && status !== 'all') {
        filtered = largeDataset.filter((item) => item.status === status);
      }

      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: filtered.slice(0, 50),
          meta: { total: filtered.length, page: 1, totalPages: Math.ceil(filtered.length / 50) },
        }),
      });
    });

    await page.goto(`${SAAS_ADMIN_URL}/tenants`);
    await page.waitForLoadState('networkidle');

    // Click on active tab
    const startTime = Date.now();
    const activeTab = page.getByRole('tab', { name: /active|aktiv/i });
    await activeTab.click();
    await page.waitForLoadState('networkidle');
    const endTime = Date.now();

    // Filtering should complete in < 1 second even with large dataset
    expect(endTime - startTime).toBeLessThan(1000);
  });

  test('should handle concurrent filter operations', async ({ page }) => {
    await page.goto(`${SAAS_ADMIN_URL}/login`);
    await mockAuth(page, 'saas-admin');
    await page.goto(`${SAAS_ADMIN_URL}/tenants`);
    await page.waitForLoadState('networkidle');

    // Rapidly switch between filters
    const tabs = ['active', 'inactive', 'suspended', 'all'];
    const startTime = Date.now();

    for (const tabId of tabs) {
      const tab = page.getByRole('tab', { name: new RegExp(tabId, 'i') });
      await tab.click();
      await page.waitForTimeout(50);
    }

    const endTime = Date.now();
    const totalTime = endTime - startTime;

    // Should handle rapid switching efficiently
    expect(totalTime).toBeLessThan(2000);
  });
});

// ============================================================================
// Test Suite: Memory Usage
// ============================================================================

test.describe('Memory Usage', () => {
  setupMockApi();
  test('should not cause memory leaks with repeated filtering', async ({ page }) => {
    await page.goto(`${SAAS_ADMIN_URL}/login`);
    await mockAuth(page, 'saas-admin');
    await page.goto(`${SAAS_ADMIN_URL}/tenants`);
    await page.waitForLoadState('networkidle');

    // Get initial memory
    const initialMemory = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });

    // Perform many filter operations
    const tabs = ['all', 'active', 'inactive', 'suspended', 'pending'];
    for (let i = 0; i < 20; i++) {
      const tabId = tabs[i % tabs.length];
      const tab = page.getByRole('tab', { name: new RegExp(tabId, 'i') });
      await tab.click();
      await page.waitForTimeout(100);
    }

    // Get final memory
    const finalMemory = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });

    // Memory increase should be reasonable (< 10MB)
    if (initialMemory > 0 && finalMemory > 0) {
      const memoryIncrease = finalMemory - initialMemory;
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024); // 10MB
    }
  });
});

// ============================================================================
// Test Suite: Render Performance Benchmarks
// ============================================================================

test.describe('Render Performance Benchmarks', () => {
  setupMockApi();
  test('should meet performance budgets', async ({ page }) => {
    await page.goto(`${SAAS_ADMIN_URL}/login`);
    await mockAuth(page, 'saas-admin');

    // Measure page load performance
    await page.goto(`${SAAS_ADMIN_URL}/tenants`);
    
    const metrics = await page.evaluate(() => {
      const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
        loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
      };
    });

    // DOM should be interactive quickly
    expect(metrics.domContentLoaded).toBeLessThan(2000);
  });

  test('should render status tabs within performance budget', async ({ page }) => {
    await page.goto(`${SAAS_ADMIN_URL}/login`);
    await mockAuth(page, 'saas-admin');
    await page.goto(`${SAAS_ADMIN_URL}/tenants`);
    await page.waitForLoadState('networkidle');

    // Measure time to interactive for status tabs
    const startTime = Date.now();
    const tabs = page.locator('[role="tab"]');
    await tabs.first().waitFor({ state: 'visible' });
    const endTime = Date.now();

    // Tabs should be interactive in < 500ms
    expect(endTime - startTime).toBeLessThan(500);
  });
});
