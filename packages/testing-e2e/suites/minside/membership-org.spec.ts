// Skip E2E tests if not explicitly enabled
import { setupMockApi } from '../../mocks/api-server.mock';
/**
 * Membership Organization E2E Tests
 * Tests for Brreg integration and org management
 * 
 * Test IDs from playwright.md:
 * - MS-MS4-01: Search Brreg org
 * - MS-MS4-02: Create org from Brreg
 * - MS-MS4-03: Switch organization context
 */
import { test, expect } from '@playwright/test';

test.describe('Membership Organizations', () => {
  setupMockApi(test);
  test.beforeEach(async ({ page }) => {
    // Navigate to org selection page
    await page.goto('/minside/organizations');
  });

  test('MS-MS4-01: should search Brreg registry', async ({ page }) => {
    // Click add organization button
    await page.getByRole('button', { name: /legg til organisasjon/i }).click();

    // Verify we're on new org page (not modal)
    await expect(page.url()).toContain('/organizations/new');

    // Search for organization
    await page.getByPlaceholder(/søk i brreg/i).fill('Idrettslaget');
    await page.getByRole('button', { name: /søk/i }).click();

    // Verify search results appear
    await expect(page.getByTestId('brreg-results')).toBeVisible();
    await expect(page.getByText(/idrettslaget/i)).toBeVisible();
  });

  test('MS-MS4-02: should create org from Brreg data', async ({ page }) => {
    // Navigate to new org page
    await page.goto('/minside/organizations/new');

    // Search and select org
    await page.getByPlaceholder(/søk i brreg/i).fill('123456789');
    await page.getByRole('button', { name: /søk/i }).click();

    // Click on result to select
    await page.getByTestId('brreg-result').first().click();

    // Verify org data is populated
    await expect(page.getByLabel(/organisasjonsnavn/i)).toHaveValue(/idrettslaget/i);

    // Submit
    await page.getByRole('button', { name: /opprett/i }).click();

    // Verify success
    await expect(page.getByText(/organisasjon opprettet/i)).toBeVisible();
  });

  test('MS-MS4-03: should switch organization context', async ({ page }) => {
    // Verify org switcher is visible
    const orgSwitcher = page.getByTestId('org-switcher');
    await expect(orgSwitcher).toBeVisible();

    // Click to open dropdown
    await orgSwitcher.click();

    // Verify multiple orgs listed (if user has multiple)
    const orgOptions = page.locator('[data-testid="org-option"]');
    
    // Select different org
    await orgOptions.nth(1).click();

    // Verify context switched (dashboard updates)
    await expect(page.getByTestId('current-org-name')).toBeVisible();
  });
});
