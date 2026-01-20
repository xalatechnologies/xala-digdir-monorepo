// Skip E2E tests if not explicitly enabled
import { setupMockApi } from '@digilist/api/mocks/api-server.mock';
/**
 * Message Templates E2E Tests
 * Tests for templates CRUD and preview functionality
 * 
 * Test IDs from playwright.md:
 * - BO-BO7-01: Templates list view
 * - BO-BO7-02: Template create
 * - BO-BO7-03: Template preview with variables
 */
import { test, expect } from '@playwright/test';

test.describe('Message Templates', () => {
  setupMockApi();
  test.beforeEach(async ({ page }) => {
    // Navigate to templates page
    await page.goto('/backoffice/templates');
  });

  test('BO-BO7-01: should display templates list', async ({ page }) => {
    // Verify page header
    await expect(page.getByRole('heading', { name: /maler/i })).toBeVisible();

    // Verify templates table exists
    await expect(page.getByRole('table')).toBeVisible();

    // Verify at least one template row
    const rows = page.locator('tbody tr');
    await expect(rows).toHaveCount({ minimum: 1 });
  });

  test('BO-BO7-02: should create new template', async ({ page }) => {
    // Click create button
    await page.getByRole('button', { name: /ny mal/i }).click();

    // Verify form appears (full page, not modal per PRD)
    await expect(page.url()).toContain('/templates/new');

    // Fill form
    await page.getByLabel(/type/i).selectOption('confirmation');
    await page.getByLabel(/navn/i).fill('Test Template');
    await page.getByLabel(/emne/i).fill('Din booking er bekreftet - {{rentalObjectName}}');
    await page.getByLabel(/innhold/i).fill('<p>Hei {{userName}}!</p>');

    // Submit
    await page.getByRole('button', { name: /lagre/i }).click();

    // Verify success toast
    await expect(page.getByText(/mal opprettet/i)).toBeVisible();
  });

  test('BO-BO7-03: should preview template with variables', async ({ page }) => {
    // Click on first template
    await page.locator('tbody tr').first().click();

    // Click preview button
    await page.getByRole('button', { name: /forhåndsvis/i }).click();

    // Verify preview modal/panel shows rendered content
    await expect(page.getByText(/ola nordmann/i)).toBeVisible();
    
    // Verify variables were substituted
    await expect(page.locator('.preview-content')).not.toContainText('{{userName}}');
  });
});
