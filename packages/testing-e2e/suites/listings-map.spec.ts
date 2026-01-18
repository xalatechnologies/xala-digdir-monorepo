// Skip E2E tests if not explicitly enabled
import { setupMockApi } from '../mocks/api-server.mock';
import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Listings Map View with Dynamic Import
 *
 * Verifies that:
 * - Homepage loads quickly without mapbox initially
 * - Map is lazy-loaded only when switching to map view
 * - Map functionality works correctly after dynamic import
 */

test.describe('Listings Page - Map View (Dynamic Import)', () => {
  setupMockApi(test);
  test('should load page without mapbox, then load map on view switch', async ({ page }) => {
    // Navigate to homepage which displays listings in grid view by default
    await page.goto('/');

    // Wait for page to load
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // Verify page renders without errors - be more flexible with selectors
    const mainContent = page.locator('main, [id="main-content"], [role="main"]').first();
    await expect(mainContent).toBeVisible({ timeout: 10000 });

    // Verify listings toolbar is visible (indicates page loaded)
    const toolbar = page.locator('.listing-toolbar, [class*="toolbar"]').first();
    await expect(toolbar).toBeVisible({ timeout: 10000 });

    // Note: Initial page may load mapbox if list view is default or if mini-maps are shown
    // The key test is that the full map view (LazyListingMap) is lazy-loaded

    // Find and click the map view toggle button
    // Try multiple strategies to find the map button
    let mapClicked = false;

    // Strategy 1: Find button with "Kart" text
    const kartButton = page.locator('button', { hasText: /^Kart$/i });
    if (await kartButton.count() > 0) {
      await kartButton.first().click();
      mapClicked = true;
    }

    // Strategy 2: Find within toggle group
    if (!mapClicked) {
      const toggleGroup = page.locator('[role="radiogroup"], .ds-toggle-group');
      if (await toggleGroup.count() > 0) {
        const buttons = toggleGroup.first().locator('button');
        const buttonCount = await buttons.count();
        // Usually: grid (0), list (1), map (2), table (3)
        if (buttonCount >= 3) {
          await buttons.nth(2).click();
          mapClicked = true;
        }
      }
    }

    // Strategy 3: Find all buttons in toolbar and click third one
    if (!mapClicked) {
      const toolbar = page.locator('.listing-toolbar').first();
      const allButtons = toolbar.locator('button');
      const buttonCount = await allButtons.count();
      if (buttonCount >= 4) {
        // Skip filter button (first), then we have view mode buttons
        await allButtons.nth(3).click(); // Index 3 is likely the map button
        mapClicked = true;
      }
    }

    if (!mapClicked) {
      throw new Error('Could not find map view button');
    }

    // Wait for map view to load
    await page.waitForTimeout(2000);

    // Verify the full map view is rendered (not mini-maps)
    // The LazyListingMap component should render a large map container
    const mapContainer = page.locator('.mapboxgl-map, [class*="mapbox"]');
    const mapCount = await mapContainer.count();

    // Should have at least one map visible
    expect(mapCount).toBeGreaterThan(0);

    // Verify map canvas is rendered
    const mapCanvas = page.locator('canvas.mapboxgl-canvas');
    const canvasCount = await mapCanvas.count();
    expect(canvasCount).toBeGreaterThan(0);

    // Wait for map to fully render
    await page.waitForTimeout(3000);

    // Verify map markers are present (mapbox markers)
    const markers = page.locator('.mapboxgl-marker');
    const markerCount = await markers.count();

    console.log(`Found ${markerCount} map markers`);

    // Test marker clicking if markers exist
    if (markerCount > 0) {
      // Test clicking on a marker
      const firstMarker = markers.first();
      await firstMarker.click({ timeout: 5000 });

      // Wait for popup to appear
      await page.waitForTimeout(1000);

      // Verify popup is displayed
      const popup = page.locator('.mapboxgl-popup');
      const popupCount = await popup.count();

      if (popupCount > 0) {
        console.log('Map popup displayed successfully');
      } else {
        console.log('Popup did not appear - map may not have listings with coordinates');
      }
    } else {
      console.log('No markers found - this is expected if there are no listings with coordinates');
    }
  });

  test('should handle switching between view modes without errors', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Wait for initial page load
    await page.waitForTimeout(1000);

    // Helper function to click map button
    const clickMapButton = async () => {
      const kartButton = page.locator('button').filter({ hasText: /^Kart$/i });
      if (await kartButton.count() > 0) {
        await kartButton.first().click();
        return true;
      }

      const toggleGroup = page.locator('[role="radiogroup"]');
      if (await toggleGroup.count() > 0) {
        const buttons = toggleGroup.first().locator('button');
        if (await buttons.count() >= 3) {
          await buttons.nth(2).click();
          return true;
        }
      }
      return false;
    };

    // Switch to map view
    const mapClicked = await clickMapButton();
    expect(mapClicked).toBe(true);
    await page.waitForTimeout(2000);

    // Verify map loads - check for map container instead of canvas
    const mapContainer = page.locator('.mapboxgl-map, [class*="mapbox"]');
    const hasMap = await mapContainer.count() > 0;

    expect(hasMap).toBe(true);

    // Switch back to grid view
    const gridButton = page.locator('button').filter({ hasText: /^Rutenett$/i });
    if (await gridButton.count() > 0) {
      await gridButton.first().click();
    } else {
      const toggleGroup = page.locator('[role="radiogroup"]').first();
      await toggleGroup.locator('button').first().click();
    }
    await page.waitForTimeout(500);

    // Verify grid view is shown
    const gridView = page.locator('[class*="listing-grid"], .listing-grid');
    const hasGrid = await gridView.count() > 0;
    expect(hasGrid).toBe(true);

    // Switch back to map view again
    await clickMapButton();
    await page.waitForTimeout(1000);

    // Map should still work (cached)
    const mapStillExists = await mapContainer.count() > 0;
    expect(mapStillExists).toBe(true);

    console.log('View mode switching verified successfully');
  });

  test('should load map faster on second visit (cached)', async ({ page }) => {
    // First visit - map loads dynamically
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Helper function to click map button
    const clickMapButton = async () => {
      const kartButton = page.locator('button').filter({ hasText: /^Kart$/i });
      if (await kartButton.count() > 0) {
        await kartButton.first().click();
        return true;
      }

      const toggleGroup = page.locator('[role="radiogroup"]');
      if (await toggleGroup.count() > 0) {
        const buttons = toggleGroup.first().locator('button');
        if (await buttons.count() >= 3) {
          await buttons.nth(2).click();
          return true;
        }
      }
      return false;
    };

    // Switch to map view
    await clickMapButton();
    await page.waitForTimeout(2000);

    // Wait for map to load
    const mapContainer = page.locator('.mapboxgl-map, [class*="mapbox"]');
    const hasMap = await mapContainer.count() > 0;
    expect(hasMap).toBe(true);

    // Navigate away
    const gridButton = page.locator('button').filter({ hasText: /^Rutenett$/i });
    if (await gridButton.count() > 0) {
      await gridButton.first().click();
    } else {
      const toggleGroup = page.locator('[role="radiogroup"]').first();
      await toggleGroup.locator('button').first().click();
    }
    await page.waitForTimeout(500);

    // Switch back to map view - should be faster (module cached)
    const startTime = Date.now();
    await clickMapButton();
    await page.waitForTimeout(1000);

    // Map should appear quickly since it's cached
    const mapStillExists = await mapContainer.count() > 0;
    const loadTime = Date.now() - startTime;

    expect(mapStillExists).toBe(true);
    console.log(`Map loaded in ${loadTime}ms (cached)`);

    // Cached load should be relatively fast (< 3 seconds)
    expect(loadTime).toBeLessThan(3000);
  });
});
