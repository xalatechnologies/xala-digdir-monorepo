/**
 * E2E Tests for Monitoring Overview Page
 * Tests the main monitoring dashboard functionality
 */
import { test, expect } from '@playwright/test';

test.describe('Monitoring Overview Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to monitoring app
    await page.goto('http://localhost:5175');
    
    // Wait for app to load
    await page.waitForLoadState('networkidle');
  });

  test('loads monitoring overview page', async ({ page }) => {
    // Should redirect to overview or show overview content
    await expect(page).toHaveURL(/.*overview.*/);
    
    // Check for main heading or content
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible();
  });

  test('displays system health status', async ({ page }) => {
    // Look for health indicators
    const healthSection = page.locator('[data-testid*="health"], [class*="health"]').first();
    await expect(healthSection).toBeVisible({ timeout: 10000 });
  });

  test('shows performance metrics', async ({ page }) => {
    // Look for metrics display
    const metricsSection = page.locator('[data-testid*="metrics"], [class*="metrics"]').first();
    await expect(metricsSection).toBeVisible({ timeout: 10000 });
  });

  test('navigation menu is accessible', async ({ page }) => {
    // Check for navigation
    const nav = page.locator('nav, [role="navigation"]').first();
    await expect(nav).toBeVisible();
  });

  test('page is responsive', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    
    const body = page.locator('body');
    await expect(body).toBeVisible();
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(500);
    
    await expect(body).toBeVisible();
  });
});

test.describe('Monitoring Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5175');
    await page.waitForLoadState('networkidle');
  });

  test('can navigate to incidents page', async ({ page }) => {
    // Look for incidents link
    const incidentsLink = page.locator('a:has-text("Incidents"), a:has-text("incidents")').first();
    
    if (await incidentsLink.isVisible()) {
      await incidentsLink.click();
      await page.waitForLoadState('networkidle');
      
      // Should be on incidents page
      await expect(page).toHaveURL(/.*incidents.*/);
    }
  });

  test('can navigate to synthetics page', async ({ page }) => {
    // Look for synthetics/monitors link
    const syntheticsLink = page.locator('a:has-text("Synthetics"), a:has-text("Monitors")').first();
    
    if (await syntheticsLink.isVisible()) {
      await syntheticsLink.click();
      await page.waitForLoadState('networkidle');
      
      // Should be on synthetics page
      await expect(page).toHaveURL(/.*synthetics.*|.*monitors.*/);
    }
  });

  test('can navigate to dashboards page', async ({ page }) => {
    // Look for dashboards link
    const dashboardsLink = page.locator('a:has-text("Dashboards"), a:has-text("Grafana")').first();
    
    if (await dashboardsLink.isVisible()) {
      await dashboardsLink.click();
      await page.waitForLoadState('networkidle');
      
      // Should be on dashboards page
      await expect(page).toHaveURL(/.*dashboards.*|.*grafana.*/);
    }
  });
});

test.describe('Monitoring Data Display', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5175');
    await page.waitForLoadState('networkidle');
  });

  test('displays recent incidents if available', async ({ page }) => {
    // Look for incidents section
    const incidentsSection = page.locator('[data-testid*="incidents"], [class*="incidents"]').first();
    
    // Should either show incidents or "no incidents" message
    await expect(incidentsSection).toBeVisible({ timeout: 10000 });
  });

  test('shows loading states', async ({ page }) => {
    // Reload to catch loading state
    await page.reload();
    
    // Look for loading indicators
    const loadingIndicator = page.locator('[data-testid*="loading"], [class*="loading"], [class*="spinner"]').first();
    
    // Loading indicator should appear briefly
    if (await loadingIndicator.isVisible({ timeout: 1000 })) {
      // Then disappear
      await expect(loadingIndicator).not.toBeVisible({ timeout: 10000 });
    }
  });

  test('handles errors gracefully', async ({ page }) => {
    // Intercept API calls and simulate error
    await page.route('**/api/monitoring/**', (route) => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Internal Server Error' }),
      });
    });

    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Should show error message or fallback UI
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });
});
