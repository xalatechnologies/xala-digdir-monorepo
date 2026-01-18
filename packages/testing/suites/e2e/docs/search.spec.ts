// Skip E2E tests if not explicitly enabled
import { setupMockApi } from '../../../mocks/api-server.mock';
/**
 * Docs Learning E2E Tests - Search
 *
 * Tests for the documentation search functionality:
 * - Search input and submission
 * - Results display and filtering
 * - Keyboard navigation
 * - Search URL parameters
 */

import { test, expect } from '@playwright/test';

const DOCS_URL = process.env.DOCS_URL || 'http://localhost:5178/docs';

test.describe('Docs Search', () => {
  setupMockApi();
  test('Search page loads correctly', async ({ page }) => {
    await page.goto(`${DOCS_URL}/search`);

    // Check search input is visible
    const searchInput = page.locator('input[type="search"], input[placeholder*="søk" i], input[placeholder*="search" i]');
    await expect(searchInput).toBeVisible();
  });

  test('Searching shows results', async ({ page }) => {
    await page.goto(`${DOCS_URL}/search`);

    // Type search query
    const searchInput = page.locator('input[type="search"], input[placeholder*="søk" i], input[placeholder*="search" i]');
    await searchInput.fill('booking');

    // Wait for results
    await page.waitForTimeout(300);

    // Check that results appeared
    const results = page.locator('[class*="result"], a[href*="/booking"]');
    await expect(results.first()).toBeVisible();
  });

  test('Search query is preserved in URL', async ({ page }) => {
    await page.goto(`${DOCS_URL}/search`);

    const searchInput = page.locator('input[type="search"], input[placeholder*="søk" i], input[placeholder*="search" i]');
    await searchInput.fill('betaling');

    // Wait for URL to update
    await page.waitForTimeout(300);

    // Check URL contains query parameter
    await expect(page).toHaveURL(/q=betaling/);
  });

  test('Direct search URL navigates correctly', async ({ page }) => {
    await page.goto(`${DOCS_URL}/search?q=faktura`);

    // Check search input has the query
    const searchInput = page.locator('input[type="search"], input[placeholder*="søk" i], input[placeholder*="search" i]');
    await expect(searchInput).toHaveValue('faktura');
  });

  test('No results message shows for no matches', async ({ page }) => {
    await page.goto(`${DOCS_URL}/search`);

    const searchInput = page.locator('input[type="search"], input[placeholder*="søk" i], input[placeholder*="search" i]');
    await searchInput.fill('xyznonexistent123');

    // Wait for search
    await page.waitForTimeout(300);

    // Check for "no results" message
    const noResults = page.locator('text=/ingen resultater|no results/i');
    await expect(noResults).toBeVisible();
  });
});

test.describe('Header Search', () => {
  setupMockApi();
  test('Header search redirects to search page', async ({ page }) => {
    await page.goto(DOCS_URL);

    // Find and use header search
    const headerSearch = page.locator('header input[type="search"], header form input');
    await headerSearch.fill('roller');
    await page.keyboard.press('Enter');

    // Should navigate to search page with query
    await expect(page).toHaveURL(/\/search.*q=roller/);
  });
});
