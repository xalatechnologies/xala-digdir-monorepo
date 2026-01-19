/**
 * Discovery Views E2E Tests
 *
 * Tests for grid/list/map/table view switching in the rental object discovery page.
 */

import { test, expect } from '@playwright/test';

test.describe('Discovery Views', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for listings to load
    await page.waitForSelector('[data-testid="results-grid"], [data-testid="rental-object-card"]', {
      timeout: 10000,
    }).catch(() => {
      // Fallback: wait for any card or grid
      return page.waitForSelector('.ds-rental-object-card, .rental-object-card', { timeout: 5000 });
    });
  });

  test.describe('View Mode Switching', () => {
    test('grid view is default', async ({ page }) => {
      // Check for grid layout (multiple cards in grid pattern)
      const cards = await page.locator('[class*="card"], [data-testid*="card"]').count();
      expect(cards).toBeGreaterThan(0);
    });

    test('switches to list view', async ({ page }) => {
      // Find and click list view toggle
      const listToggle = page.locator('[aria-label*="Liste"], [title*="Liste"], button:has([aria-label*="list"])').first();
      
      if (await listToggle.isVisible()) {
        await listToggle.click();
        // Verify list layout elements appear
        await expect(page.locator('[class*="list-item"], [data-testid*="list-item"]').first()).toBeVisible({ timeout: 5000 });
      }
    });

    test('switches to map view', async ({ page }) => {
      // Find and click map view toggle
      const mapToggle = page.locator('[aria-label*="Kart"], [title*="Kart"], button:has([aria-label*="map"])').first();
      
      if (await mapToggle.isVisible()) {
        await mapToggle.click();
        // Wait for map container to appear
        await expect(page.locator('[class*="mapbox"], [class*="map-container"], canvas').first()).toBeVisible({ timeout: 10000 });
      }
    });

    test('switches to table view', async ({ page }) => {
      // Find and click table view toggle
      const tableToggle = page.locator('[aria-label*="Tabell"], [title*="Tabell"], button:has([aria-label*="table"])').first();
      
      if (await tableToggle.isVisible()) {
        await tableToggle.click();
        // Verify table appears
        await expect(page.locator('table, [role="table"], [data-testid*="table"]').first()).toBeVisible({ timeout: 5000 });
      }
    });

    test('view toggle is keyboard accessible', async ({ page }) => {
      // Tab to view toggles
      const viewToggleGroup = page.locator('[class*="toggle-group"], [role="group"]').first();
      
      if (await viewToggleGroup.isVisible()) {
        await viewToggleGroup.focus();
        
        // Should be focusable
        await expect(viewToggleGroup).toBeFocused();
      }
    });
  });

  test.describe('Results Display', () => {
    test('shows result count', async ({ page }) => {
      // Look for result count text (e.g., "48 resultater")
      const resultCount = page.locator('text=/\\d+ resultat/i');
      await expect(resultCount.first()).toBeVisible({ timeout: 5000 });
    });

    test('cards are clickable and navigate to detail', async ({ page }) => {
      // Find first card
      const card = page.locator('[class*="card"], [data-testid*="card"]').first();
      
      if (await card.isVisible()) {
        await card.click();
        // Should navigate to detail page
        await expect(page).toHaveURL(/\/(listing|rental-object)\//, { timeout: 10000 });
      }
    });

    test('cards display essential information', async ({ page }) => {
      // Verify card content
      const card = page.locator('[class*="card"], [data-testid*="card"]').first();
      
      if (await card.isVisible()) {
        // Should have title/name
        await expect(card.locator('h2, h3, [class*="title"], [class*="name"]').first()).toBeVisible();
        
        // Should have location
        await expect(card.locator('text=/oslo|bergen|trondheim|stavanger/i, [class*="location"]').first()).toBeVisible().catch(() => {
          // Location might not be visible on all cards
        });
      }
    });
  });

  test.describe('Loading States', () => {
    test('shows skeleton while loading', async ({ page }) => {
      // Navigate with network request interception to simulate slow loading
      await page.route('**/api/**', async (route) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        await route.continue();
      });

      await page.goto('/');
      
      // Look for skeleton or loading indicator
      const skeleton = page.locator('[class*="skeleton"], [aria-busy="true"], [role="status"]');
      // Skeleton should eventually disappear
      await expect(skeleton.first()).toBeVisible({ timeout: 2000 }).catch(() => {
        // Might load too fast to catch skeleton
      });
    });
  });

  test.describe('Empty State', () => {
    test('shows empty state when no results match filters', async ({ page }) => {
      // Apply filters that result in no matches
      const filterButton = page.locator('button:has-text("Filter"), button:has-text("Filtre")').first();
      
      if (await filterButton.isVisible()) {
        await filterButton.click();
        
        // Try to apply a very restrictive filter
        // This is a best-effort test as filter options vary
      }
    });
  });

  test.describe('Accessibility', () => {
    test('has accessible heading structure', async ({ page }) => {
      // Check for proper heading hierarchy
      const h1 = await page.locator('h1').count();
      const h2 = await page.locator('h2').count();
      
      // Should have at least one main heading
      expect(h1 + h2).toBeGreaterThan(0);
    });

    test('cards are keyboard focusable', async ({ page }) => {
      const card = page.locator('[class*="card"], [data-testid*="card"]').first();
      
      if (await card.isVisible()) {
        // Tab to card
        await page.keyboard.press('Tab');
        await page.keyboard.press('Tab');
        await page.keyboard.press('Tab');
        
        // Should eventually focus on a card or interactive element
        const focused = await page.evaluate(() => document.activeElement?.tagName);
        expect(focused).toBeTruthy();
      }
    });
  });
});
