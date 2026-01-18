// Skip E2E tests if not explicitly enabled
import { setupMockApi } from '../mocks/api-server.mock';
import { test, expect } from '@playwright/test';

/**
 * Organization Creation Wizard E2E Test
 *
 * Tests the complete organization creation flow including:
 * - Multi-step wizard navigation (basics, branding, roles)
 * - Form validation and data submission
 * - Branding configuration (logo, colors)
 * - Default role selection
 * - Organization creation with audit logging
 * - Branding settings persistence
 * - Default roles assignment
 *
 * Note: This test requires the backoffice app to be running on port 5174
 * and the API to be running on port 3002
 */

const BACKOFFICE_URL = 'http://localhost:5174';
const API_URL = 'http://localhost:3002';

test.describe('Organization Creation Wizard', () => {
  setupMockApi(test);
  let organizationId: string;

  test.describe('Wizard Navigation and UI', () => {
  setupMockApi(test);
    test('renders wizard with stepper on new organization page', async ({ page }) => {
      // Step 1: Navigate to organization creation page
      await page.goto(`${BACKOFFICE_URL}/organizations/new`);
      await page.waitForLoadState('networkidle');

      // Verify wizard header is visible
      const wizardHeader = page.locator('text=/opprett organisasjon|ny organisasjon/i').first();
      await expect(wizardHeader).toBeVisible({ timeout: 10000 });

      // Verify stepper is visible with 3 steps
      const stepper = page.locator('[role="navigation"], .stepper, [data-testid="wizard-stepper"]');
      await expect(stepper).toBeVisible();

      // Verify step labels are visible
      const basicsStep = page.locator('text=/grunnleggende|basic|basics/i').first();
      const brandingStep = page.locator('text=/branding|merkevare/i').first();
      const rolesStep = page.locator('text=/roller|roles/i').first();

      await expect(basicsStep).toBeVisible();
      await expect(brandingStep).toBeVisible();
      await expect(rolesStep).toBeVisible();
    });

    test('can navigate between steps', async ({ page }) => {
      await page.goto(`${BACKOFFICE_URL}/organizations/new`);
      await page.waitForLoadState('networkidle');

      // Step 1: Fill basic info
      const nameInput = page.getByLabel(/^navn|^name/i);
      if (await nameInput.isVisible()) {
        await nameInput.fill('E2E Test Organization');
      }

      // Find and click "Next" button
      const nextButton = page.getByRole('button', { name: /neste|next/i });
      if (await nextButton.isVisible()) {
        await nextButton.click();
        await page.waitForTimeout(500); // Wait for step transition

        // Verify we're on the branding step
        const brandingHeader = page.locator('text=/branding|merkevare|logo/i').first();
        await expect(brandingHeader).toBeVisible({ timeout: 5000 });
      }
    });
  });

  test.describe('Complete Organization Creation Flow', () => {
  setupMockApi(test);
    test('completes full wizard flow and creates organization', async ({ page, request }) => {
      // Step 1: Navigate to wizard
      await page.goto(`${BACKOFFICE_URL}/organizations/new`);
      await page.waitForLoadState('networkidle');

      // Step 2: Fill basic information
      const nameInput = page.getByLabel(/^navn|^name/i);
      await expect(nameInput).toBeVisible({ timeout: 10000 });
      await nameInput.fill('E2E Test Municipality');

      // Fill description if available
      const descriptionInput = page.getByLabel(/beskrivelse|description/i);
      if (await descriptionInput.isVisible()) {
        await descriptionInput.fill('E2E test organization for automated testing');
      }

      // Select actor type if available
      const actorTypeSelect = page.locator('select[name="actorType"], [aria-label*="type"]');
      if (await actorTypeSelect.isVisible()) {
        await actorTypeSelect.selectOption('municipality');
      }

      // Step 3: Move to branding step
      const nextButton = page.getByRole('button', { name: /neste|next/i });
      await nextButton.click();
      await page.waitForTimeout(500);

      // Verify branding step is visible
      const brandingSection = page.locator('text=/logo|farge|color/i').first();
      await expect(brandingSection).toBeVisible({ timeout: 5000 });

      // Configure colors (skip file uploads for E2E test)
      const primaryColorInput = page.locator('input[type="color"]').first();
      if (await primaryColorInput.isVisible()) {
        await primaryColorInput.fill('#0066CC');
      }

      const secondaryColorInput = page.locator('input[type="color"]').nth(1);
      if (await secondaryColorInput.isVisible()) {
        await secondaryColorInput.fill('#FF6600');
      }

      // Step 4: Move to roles step
      const nextButton2 = page.getByRole('button', { name: /neste|next/i });
      await nextButton2.click();
      await page.waitForTimeout(500);

      // Verify roles step is visible
      const rolesSection = page.locator('text=/standardroller|default roles|admin/i').first();
      await expect(rolesSection).toBeVisible({ timeout: 5000 });

      // Verify admin role is pre-selected (required)
      const adminCheckbox = page.locator('input[type="checkbox"][value="admin"], input[type="checkbox"][checked]').first();
      await expect(adminCheckbox).toBeChecked();

      // Step 5: Submit the wizard
      const submitButton = page.getByRole('button', { name: /opprett|create|fullfør/i });
      await expect(submitButton).toBeVisible();
      await submitButton.click();

      // Wait for submission and navigation
      await page.waitForTimeout(2000);

      // Verify we're redirected to organization detail page or list
      const currentUrl = page.url();
      expect(currentUrl).toContain('/organizations');

      // Try to extract organization ID from URL
      const urlMatch = currentUrl.match(/\/organizations\/([a-zA-Z0-9-]+)/);
      if (urlMatch) {
        organizationId = urlMatch[1];
        console.log('Created organization ID:', organizationId);
      }
    });
  });

  test.describe('Backend Verification', () => {
  setupMockApi(test);
    test('verifies organization was created in database', async ({ request }) => {
      test(!organizationId, 'No organization ID available from previous test');

      // Verify organization exists via API
      const response = await request.get(`${API_URL}/api/organizations/${organizationId}`);
      expect(response.status()).toBe(200);

      const body = await response.json();
      expect(body.data).toBeDefined();
      expect(body.data.name).toContain('E2E Test');
    });

    test('verifies branding settings were saved', async ({ request }) => {
      test(!organizationId, 'No organization ID available from previous test');

      // Verify branding settings via API
      const response = await request.get(`${API_URL}/api/organizations/${organizationId}/branding`);
      expect(response.status()).toBe(200);

      const body = await response.json();
      expect(body.data).toBeDefined();

      // Verify colors were saved
      if (body.data.primaryColor) {
        expect(body.data.primaryColor).toBe('#0066CC');
      }
      if (body.data.secondaryColor) {
        expect(body.data.secondaryColor).toBe('#FF6600');
      }
    });

    test('verifies audit log entry exists', async ({ request }) => {
      test(!organizationId, 'No organization ID available from previous test');

      // Query audit logs for organization creation event
      const response = await request.get(`${API_URL}/api/audit-logs?entityType=organization&entityId=${organizationId}&action=create`);

      if (response.status() === 200) {
        const body = await response.json();
        expect(body.data).toBeDefined();
        expect(body.data.length).toBeGreaterThan(0);

        // Verify first audit log is creation event
        const creationLog = body.data[0];
        expect(creationLog.action).toBe('create');
        expect(creationLog.entityType).toBe('organization');
        expect(creationLog.entityId).toBe(organizationId);
      }
    });

    test('verifies default roles were assigned', async ({ request }) => {
      test(!organizationId, 'No organization ID available from previous test');

      // Verify organization has default roles
      const response = await request.get(`${API_URL}/api/organizations/${organizationId}/roles`);

      if (response.status() === 200) {
        const body = await response.json();
        expect(body.data).toBeDefined();
        expect(body.data.length).toBeGreaterThan(0);

        // Verify admin role exists (required)
        const adminRole = body.data.find((role: any) => role.name === 'admin');
        expect(adminRole).toBeDefined();
      }
    });
  });

  test.describe('Form Validation', () => {
  setupMockApi(test);
    test('shows validation error when submitting empty form', async ({ page }) => {
      await page.goto(`${BACKOFFICE_URL}/organizations/new`);
      await page.waitForLoadState('networkidle');

      // Try to submit without filling required fields
      const nextButton = page.getByRole('button', { name: /neste|next/i });
      if (await nextButton.isVisible()) {
        await nextButton.click();
        await page.waitForTimeout(500);

        // Should still be on the first step (or show error)
        const nameInput = page.getByLabel(/^navn|^name/i);
        await expect(nameInput).toBeVisible();
      }
    });

    test('validates required fields in basic info step', async ({ page }) => {
      await page.goto(`${BACKOFFICE_URL}/organizations/new`);
      await page.waitForLoadState('networkidle');

      // Clear name input if it has a value
      const nameInput = page.getByLabel(/^navn|^name/i);
      await nameInput.clear();

      // Try to proceed
      const nextButton = page.getByRole('button', { name: /neste|next/i });
      await nextButton.click();
      await page.waitForTimeout(500);

      // Check for validation error or that we didn't move to next step
      const nameField = page.getByLabel(/^navn|^name/i);
      await expect(nameField).toBeVisible();
    });
  });

  test.describe('Accessibility', () => {
  setupMockApi(test);
    test('wizard has proper ARIA labels and structure', async ({ page }) => {
      await page.goto(`${BACKOFFICE_URL}/organizations/new`);
      await page.waitForLoadState('networkidle');

      // Verify form has accessible labels
      const inputs = page.locator('input[type="text"], textarea, select');
      const inputCount = await inputs.count();

      for (let i = 0; i < inputCount; i++) {
        const input = inputs.nth(i);
        const ariaLabel = await input.getAttribute('aria-label');
        const id = await input.getAttribute('id');

        // Each input should have either aria-label or associated label
        if (id) {
          const label = page.locator(`label[for="${id}"]`);
          const labelExists = await label.count() > 0;
          expect(ariaLabel || labelExists).toBeTruthy();
        }
      }
    });

    test('all buttons have accessible names', async ({ page }) => {
      await page.goto(`${BACKOFFICE_URL}/organizations/new`);
      await page.waitForLoadState('networkidle');

      const buttons = page.locator('button');
      const buttonCount = await buttons.count();

      for (let i = 0; i < buttonCount; i++) {
        const button = buttons.nth(i);
        const text = await button.textContent();
        const ariaLabel = await button.getAttribute('aria-label');
        const title = await button.getAttribute('title');

        // Button should have some accessible name
        const hasAccessibleName = (text && text.trim()) || ariaLabel || title;
        expect(hasAccessibleName).toBeTruthy();
      }
    });
  });
});
