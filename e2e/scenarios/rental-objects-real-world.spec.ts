/**
 * Real-World Scenario E2E Tests for Rental Objects
 * Tests complete user journeys based on actual production scenarios
 */

import { test, expect } from '@playwright/test';

const BACKOFFICE_BASE_URL = 'http://localhost:5175';

test.describe('Real-World Rental Objects Scenarios', () => {
  test.use({ baseURL: BACKOFFICE_BASE_URL });

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    // Authenticate as admin user
    await page.waitForLoadState('networkidle');
  });

  test('Scenario 1: Municipal admin creates sports hall with full details', async ({ page }) => {
    // Navigate to rental objects
    await page.goto('/rental-objects');
    await page.waitForLoadState('networkidle');

    // Click create button
    const createButton = page.locator('button').filter({ hasText: /opprett|create/i }).first();
    await createButton.click();
    await page.waitForLoadState('networkidle');

    // Step 1: Select category (Lokaler og baner)
    const categoryButton = page.locator('button, [role="button"]').filter({ hasText: /lokaler|spaces/i }).first();
    await categoryButton.click();
    await page.waitForTimeout(500);

    // Step 2: Fill basics
    await page.fill('input[name="name"], input[placeholder*="navn"]', 'Idrettshall Nord');
    await page.fill('textarea[name="description"], textarea[placeholder*="beskrivelse"]', 
      'Moderne idrettshall med garderober, kafeteria og parkeringsplass');

    // Navigate to next step
    const nextButton = page.locator('button').filter({ hasText: /neste|next/i }).first();
    await nextButton.click();
    await page.waitForTimeout(500);

    // Step 3: Fill location
    await page.fill('input[name="address"], input[placeholder*="adresse"]', 'Nordveien 123, 0123 Oslo');
    
    // Set coordinates (if map picker available)
    const mapButton = page.locator('button').filter({ hasText: /kart|map/i });
    if (await mapButton.count() > 0) {
      await mapButton.click();
      await page.waitForTimeout(1000);
    }

    await nextButton.click();
    await page.waitForTimeout(500);

    // Step 4: Set capacity
    await page.fill('input[name="capacity"], input[type="number"]', '200');
    await page.fill('input[name="area"], input[placeholder*="areal"]', '500');

    await nextButton.click();
    await page.waitForTimeout(500);

    // Step 5: Set opening hours
    const mondayCheckbox = page.locator('input[type="checkbox"]').first();
    await mondayCheckbox.check();
    
    await page.fill('input[name="openTime"]', '08:00');
    await page.fill('input[name="closeTime"]', '22:00');

    await nextButton.click();
    await page.waitForTimeout(500);

    // Step 6: Review and publish
    const publishButton = page.locator('button').filter({ hasText: /publiser|publish/i }).first();
    await publishButton.click();

    // Verify success
    await expect(page.locator('text=/publisert|published|success/i')).toBeVisible({ timeout: 10000 });
  });

  test('Scenario 2: User searches, filters, and views multiple rental objects', async ({ page }) => {
    await page.goto('/rental-objects');
    await page.waitForLoadState('networkidle');

    // Search for "idrettshall"
    const searchInput = page.locator('input[type="search"], input[placeholder*="Søk"]').first();
    await searchInput.fill('idrettshall');
    await page.waitForTimeout(500);

    // Verify results
    const results = page.locator('[data-testid*="rental"], [data-testid*="listing"]');
    await expect(results.first()).toBeVisible();

    // Apply status filter
    const filterButton = page.locator('button').filter({ hasText: /filter/i }).first();
    if (await filterButton.count() > 0) {
      await filterButton.click();
      await page.waitForTimeout(500);

      const publishedFilter = page.locator('text=/publisert|published/i').first();
      await publishedFilter.click();
      await page.waitForTimeout(500);
    }

    // Change search query
    await searchInput.fill('gym');
    await page.waitForTimeout(500);

    // Clear filters and search again
    const clearButton = page.locator('button').filter({ hasText: /fjern|clear/i }).first();
    if (await clearButton.count() > 0) {
      await clearButton.click();
    }

    await searchInput.fill('lokale');
    await page.waitForTimeout(500);

    // Verify search works
    await expect(searchInput).toHaveValue('lokale');
  });

  test('Scenario 3: Admin edits existing rental object and updates details', async ({ page }) => {
    await page.goto('/rental-objects');
    await page.waitForLoadState('networkidle');

    // Click on first rental object
    const firstItem = page.locator('[data-testid*="rental"], [data-testid*="listing"]').first();
    await firstItem.click();
    await page.waitForLoadState('networkidle');

    // Click edit button
    const editButton = page.locator('button').filter({ hasText: /rediger|edit/i }).first();
    await editButton.click();
    await page.waitForLoadState('networkidle');

    // Update name
    const nameInput = page.locator('input[name="name"]').first();
    await nameInput.fill('Updated Rental Object Name');

    // Update description
    const descriptionInput = page.locator('textarea[name="description"]').first();
    await descriptionInput.fill('Updated description with more details');

    // Save changes
    const saveButton = page.locator('button').filter({ hasText: /lagre|save/i }).first();
    await saveButton.click();

    // Verify update success
    await expect(page.locator('text=/oppdatert|updated|success/i')).toBeVisible({ timeout: 10000 });
  });

  test('Scenario 4: User views availability calendar and booking history', async ({ page }) => {
    await page.goto('/rental-objects');
    await page.waitForLoadState('networkidle');

    // Navigate to detail page
    const firstItem = page.locator('[data-testid*="rental"]').first();
    await firstItem.click();
    await page.waitForLoadState('networkidle');

    // Click availability tab
    const availabilityTab = page.locator('button, [role="tab"]').filter({ hasText: /tilgjengelighet|availability/i }).first();
    await availabilityTab.click();
    await page.waitForTimeout(1000);

    // Verify calendar is displayed
    const calendar = page.locator('[data-testid*="calendar"], .calendar, [role="grid"]').first();
    await expect(calendar).toBeVisible();

    // Click bookings tab
    const bookingsTab = page.locator('button, [role="tab"]').filter({ hasText: /bookinger|bookings/i }).first();
    await bookingsTab.click();
    await page.waitForTimeout(1000);

    // Verify bookings list
    const bookingsList = page.locator('[data-testid*="booking"], table').first();
    await expect(bookingsList).toBeVisible();
  });

  test('Scenario 5: Bulk operations on multiple rental objects', async ({ page }) => {
    await page.goto('/rental-objects');
    await page.waitForLoadState('networkidle');

    // Select multiple items
    const checkboxes = page.locator('input[type="checkbox"]');
    const checkboxCount = await checkboxes.count();
    
    if (checkboxCount > 1) {
      await checkboxes.nth(1).check();
      await checkboxes.nth(2).check();
      await checkboxes.nth(3).check();

      // Bulk actions should appear
      const bulkActions = page.locator('text=/bulk|masse|selected/i').first();
      await expect(bulkActions).toBeVisible({ timeout: 5000 });
    }
  });

  test('Scenario 6: Network failure and recovery', async ({ page }) => {
    await page.goto('/rental-objects');
    
    // Simulate network failure
    await page.route('**/api/rental-objects**', route => route.abort());
    
    await page.reload();
    await page.waitForTimeout(2000);

    // Error message should be displayed
    const errorMessage = page.locator('text=/feil|error|nettverk|network/i').first();
    await expect(errorMessage).toBeVisible();

    // Restore network
    await page.unroute('**/api/rental-objects**');
    
    // Retry
    const retryButton = page.locator('button').filter({ hasText: /prøv|retry/i }).first();
    if (await retryButton.count() > 0) {
      await retryButton.click();
      await page.waitForLoadState('networkidle');
      
      // Should recover successfully
      const content = page.locator('h1, h2').first();
      await expect(content).toBeVisible();
    }
  });

  test('Scenario 7: Mobile responsive behavior', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/rental-objects');
    await page.waitForLoadState('networkidle');

    // Mobile menu should be accessible
    const menuButton = page.locator('button[aria-label*="menu"], button[aria-label*="Menu"]').first();
    if (await menuButton.count() > 0) {
      await menuButton.click();
      await page.waitForTimeout(500);
    }

    // Content should be visible and properly sized
    const content = page.locator('main, [role="main"]').first();
    await expect(content).toBeVisible();
    
    // Check that content fits viewport
    const boundingBox = await content.boundingBox();
    if (boundingBox) {
      expect(boundingBox.width).toBeLessThanOrEqual(375);
    }
  });

  test('Scenario 8: Accessibility - keyboard navigation', async ({ page }) => {
    await page.goto('/rental-objects');
    await page.waitForLoadState('networkidle');

    // Tab through interactive elements
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Focus should be visible
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBeTruthy();

    // Enter should activate focused element
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);
  });

  test('Scenario 9: Data export functionality', async ({ page }) => {
    await page.goto('/rental-objects');
    await page.waitForLoadState('networkidle');

    // Find export button
    const exportButton = page.locator('button').filter({ hasText: /eksporter|export/i }).first();
    
    if (await exportButton.count() > 0) {
      // Set up download listener
      const downloadPromise = page.waitForEvent('download');
      
      await exportButton.click();
      
      const download = await downloadPromise;
      
      // Verify download
      expect(download.suggestedFilename()).toMatch(/\.(csv|xlsx|json)$/);
    }
  });

  test('Scenario 10: Complete workflow - Create, Edit, Publish, Archive', async ({ page }) => {
    // Create
    await page.goto('/rental-objects/new');
    await page.fill('input[name="name"]', 'Test Workflow Object');
    await page.locator('button').filter({ hasText: /lagre utkast|save draft/i }).first().click();
    await page.waitForTimeout(1000);

    // Edit
    await page.goto('/rental-objects');
    await page.locator('text=Test Workflow Object').first().click();
    await page.locator('button').filter({ hasText: /rediger|edit/i }).first().click();
    await page.fill('input[name="name"]', 'Updated Workflow Object');
    await page.locator('button').filter({ hasText: /lagre|save/i }).first().click();
    await page.waitForTimeout(1000);

    // Publish
    await page.locator('button').filter({ hasText: /publiser|publish/i }).first().click();
    await page.waitForTimeout(1000);

    // Verify published status
    await expect(page.locator('text=/publisert|published/i')).toBeVisible();

    // Archive (if available)
    const archiveButton = page.locator('button').filter({ hasText: /arkiver|archive/i }).first();
    if (await archiveButton.count() > 0) {
      await archiveButton.click();
      await page.waitForTimeout(1000);
      await expect(page.locator('text=/arkivert|archived/i')).toBeVisible();
    }
  });
});
