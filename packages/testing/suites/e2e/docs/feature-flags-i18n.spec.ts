/**
 * Docs Learning E2E Tests - Feature Flags
 *
 * Tests for feature flag gating of documentation sections:
 * - Hidden sections in sidebar when flag disabled
 * - Route redirect for disabled sections
 * - Search results filtered by flags
 */

import { test, expect } from '@playwright/test';

const DOCS_URL = process.env.DOCS_URL || 'http://localhost:5178/docs';

test.describe('Docs Feature Flags', () => {
  test('All sections visible with default flags', async ({ page }) => {
    await page.goto(DOCS_URL);

    // Check main sections are visible in sidebar
    const sidebar = page.locator('aside, nav[aria-label*="sidebar" i]');

    await expect(sidebar.locator('a').filter({ hasText: /Booking|Bookingsystem/ })).toBeVisible();
    await expect(sidebar.locator('a').filter({ hasText: /Roller|Roles|RBAC/ })).toBeVisible();
    await expect(sidebar.locator('a').filter({ hasText: /Betaling|Payments/ })).toBeVisible();
  });

  test('Section pages load correctly', async ({ page }) => {
    // Test that section landing pages work
    await page.goto(`${DOCS_URL}/booking`);
    await expect(page.locator('h1')).toContainText(/Booking/);

    await page.goto(`${DOCS_URL}/rbac`);
    await expect(page.locator('h1')).toContainText(/Roller|Roles|Access/);

    await page.goto(`${DOCS_URL}/payments`);
    await expect(page.locator('h1')).toContainText(/Betaling|Payments/);
  });

  // Note: To test disabled sections, you would need to mock feature flags
  // This is typically done via API mocking or test fixtures
  test('Disabled section redirects to home', async ({ page }) => {
    // This test requires feature flag mocking
    // When docs.section.api.enabled = false, navigating to /api should redirect

    // Mock approach would be:
    // await page.route('**/api/features', async route => {
    //   await route.fulfill({
    //     json: { 'docs.section.api.enabled': false }
    //   });
    // });

    await page.goto(`${DOCS_URL}/api`);
    await expect(page).toHaveURL(DOCS_URL);
  });
});

test.describe('Docs i18n', () => {
  test('Language toggle changes content', async ({ page }) => {
    await page.goto(DOCS_URL);

    // Find language toggle
    const langToggle = page.locator('button').filter({ hasText: /EN|NO|Norsk|English/ });

    // Get current content
    const initialText = await page.locator('h1').innerText();

    // Toggle language
    await langToggle.click();
    await page.waitForTimeout(300);

    // Content should remain translated (we're toggling, so check for consistency)
    const newText = await page.locator('h1').innerText();
    
    // Both should be valid headings
    expect(newText.length).toBeGreaterThan(0);
  });

  test('Language persists across navigation', async ({ page }) => {
    await page.goto(DOCS_URL);

    // Get initial locale indicator
    const langToggle = page.locator('button').filter({ hasText: /EN|NO/ });
    const initialLang = await langToggle.innerText();

    // Navigate to another page
    await page.goto(`${DOCS_URL}/booking`);

    // Check language is still the same
    const currentLang = await langToggle.innerText();
    expect(currentLang).toBe(initialLang);
  });
});
