// Skip E2E tests if not explicitly enabled
import { setupMockApi } from '../../../mocks/api-server.mock';
/**
 * Docs Learning E2E Tests - TOC & Navigation
 *
 * Tests for the right-side Table of Contents component:
 * - TOC visibility and structure
 * - Scroll-tracking highlighting
 * - Click-to-navigate functionality
 * - Anchor links and URL hash updates
 */

import { test, expect } from '@playwright/test';

const DOCS_URL = process.env.DOCS_URL || 'http://localhost:5178/docs';

test.describe('Docs TOC Component', () => {
  setupMockApi();
  test('TOC displays headings from article content', async ({ page }) => {
    await page.goto(`${DOCS_URL}/booking/create-booking`);

    // Wait for TOC to be visible
    const toc = page.locator('nav[aria-label*="Innholdsfortegnelse"], nav[aria-label*="Table of contents"]');
    await expect(toc).toBeVisible();

    // Check that TOC has items
    const tocItems = toc.locator('a');
    await expect(tocItems).toHaveCount({ min: 3 });
  });

  test('TOC highlights active section on scroll', async ({ page }) => {
    await page.goto(`${DOCS_URL}/booking/create-booking`);

    // Scroll to a heading
    await page.evaluate(() => {
      const heading = document.getElementById('trinn-2');
      heading?.scrollIntoView({ behavior: 'instant', block: 'start' });
    });

    // Wait for intersection observer to update
    await page.waitForTimeout(500);

    // Check that the corresponding TOC link is active
    const activeLink = page.locator('nav a.active, nav a[aria-current="location"]');
    await expect(activeLink).toContainText(/Trinn 2|Step 2/);
  });

  test('Clicking TOC item scrolls to heading', async ({ page }) => {
    await page.goto(`${DOCS_URL}/booking/create-booking`);

    // Click a TOC link
    const tocLink = page.locator('nav a').filter({ hasText: /Trinn 3|Step 3/ }).first();
    await tocLink.click();

    // Verify URL hash updated
    await expect(page).toHaveURL(/#trinn-3/);

    // Verify the heading is in view
    const heading = page.locator('#trinn-3');
    await expect(heading).toBeInViewport();
  });

  test('Direct anchor link navigation works', async ({ page }) => {
    await page.goto(`${DOCS_URL}/booking/create-booking#ofte-stilte-sporsmal`);

    // Wait for page to scroll to anchor
    await page.waitForTimeout(500);

    // Verify the heading is in view
    const heading = page.locator('#ofte-stilte-sporsmal');
    await expect(heading).toBeInViewport();
  });
});

test.describe('Docs Navigation', () => {
  setupMockApi();
  test('Sidebar navigation works correctly', async ({ page }) => {
    await page.goto(DOCS_URL);

    // Click on a section in sidebar
    const bookingLink = page.locator('aside a').filter({ hasText: /Booking|Bookingsystem/ }).first();
    await bookingLink.click();

    // Verify navigation occurred
    await expect(page).toHaveURL(/\/booking/);
  });

  test('Breadcrumbs show correct hierarchy', async ({ page }) => {
    await page.goto(`${DOCS_URL}/booking/create-booking`);

    // Check breadcrumb items
    const breadcrumbs = page.locator('[class*="breadcrumb"], nav[aria-label="Breadcrumb"]');
    await expect(breadcrumbs).toContainText(/Dokumentasjon|Documentation/);
    await expect(breadcrumbs).toContainText(/Booking/);
  });
});
}
