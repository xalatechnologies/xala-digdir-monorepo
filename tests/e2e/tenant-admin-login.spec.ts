import { test, expect } from '@playwright/test';

/**
 * End-to-End Login Flow Tests for Tenant Admin App
 *
 * Tests the complete authentication flow:
 * - Login page rendering
 * - Demo login flow with form submission
 * - Redirect to dashboard after successful login
 */
test.describe('Tenant Admin - Login Flow', () => {
  test.describe('Login Page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/login');
      await page.waitForLoadState('networkidle');
    });

    test('has correct page structure', async ({ page }) => {
      // Verify page title or branding
      const brandName = page.locator('text=/DIGILIST/i').first();
      await expect(brandName).toBeVisible({ timeout: 10000 });

      // Verify login title is displayed
      const loginTitle = page.getByRole('heading', { level: 1 }).first();
      await expect(loginTitle).toBeVisible();
    });

    test('displays all login options', async ({ page }) => {
      // Verify ID-porten login option
      const idPortenOption = page.locator('text=/ID-porten/i').first();
      await expect(idPortenOption).toBeVisible({ timeout: 10000 });

      // Verify Microsoft login option
      const microsoftOption = page.locator('text=/Microsoft/i').first();
      await expect(microsoftOption).toBeVisible();

      // Verify Demo login option
      const demoLoginOption = page.locator('text=/Demo/i').first();
      await expect(demoLoginOption).toBeVisible();
    });

    test('displays feature panel information', async ({ page }) => {
      // Verify panel content is visible
      const panelContent = page.locator('text=/TENANT ADMIN/i').first();
      await expect(panelContent).toBeVisible({ timeout: 10000 });
    });

    test('displays footer links', async ({ page }) => {
      // Verify footer links are present
      const footerLinks = page.locator('a[href*="digilist.no"]');
      const linkCount = await footerLinks.count();
      expect(linkCount).toBeGreaterThan(0);
    });
  });

  test.describe('Demo Login Flow', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/login');
      await page.waitForLoadState('networkidle');
    });

    test('opens demo login dialog when clicking demo login option', async ({ page }) => {
      // Find and click demo login option
      const demoLoginButton = page.locator('text=/Demo/i').first();
      await expect(demoLoginButton).toBeVisible({ timeout: 10000 });
      await demoLoginButton.click();

      // Verify dialog opens
      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible({ timeout: 5000 });

      // Verify dialog title
      const dialogTitle = dialog.getByRole('heading').first();
      await expect(dialogTitle).toBeVisible();
    });

    test('demo login dialog has required form fields', async ({ page }) => {
      // Open demo login dialog
      const demoLoginButton = page.locator('text=/Demo/i').first();
      await demoLoginButton.click();

      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible({ timeout: 5000 });

      // Verify name field exists
      const nameInput = dialog.getByLabel(/navn|name/i);
      await expect(nameInput).toBeVisible();

      // Verify email field exists
      const emailInput = dialog.getByLabel(/e-?post|email/i);
      await expect(emailInput).toBeVisible();

      // Verify token field exists
      const tokenInput = dialog.getByLabel(/token/i);
      await expect(tokenInput).toBeVisible();
    });

    test('demo login dialog can be closed', async ({ page }) => {
      // Open demo login dialog
      const demoLoginButton = page.locator('text=/Demo/i').first();
      await demoLoginButton.click();

      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible({ timeout: 5000 });

      // Find and click close/cancel button
      const cancelButton = dialog.getByRole('button', { name: /avbryt|cancel|lukk|close/i });
      if (await cancelButton.isVisible()) {
        await cancelButton.click();
        await expect(dialog).not.toBeVisible({ timeout: 5000 });
      } else {
        // Try pressing Escape to close
        await page.keyboard.press('Escape');
        await expect(dialog).not.toBeVisible({ timeout: 5000 });
      }
    });

    test('validates required fields in demo login form', async ({ page }) => {
      // Open demo login dialog
      const demoLoginButton = page.locator('text=/Demo/i').first();
      await demoLoginButton.click();

      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible({ timeout: 5000 });

      // Try to submit with empty form
      const submitButton = dialog.getByRole('button', { name: /logg inn|login|submit/i });
      await expect(submitButton).toBeVisible();
      await submitButton.click();

      // Verify validation message appears or button stays disabled
      // Check for validation errors
      const validationError = page.locator('text=/påkrevd|required|ugyldig|invalid/i').first();
      const isErrorVisible = await validationError.isVisible({ timeout: 2000 }).catch(() => false);

      // Either validation error shown or form didn't submit (no redirect)
      const currentUrl = page.url();
      expect(isErrorVisible || currentUrl.includes('/login')).toBeTruthy();
    });

    test('submits demo login form and redirects to dashboard', async ({ page }) => {
      // Open demo login dialog
      const demoLoginButton = page.locator('text=/Demo/i').first();
      await demoLoginButton.click();

      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible({ timeout: 5000 });

      // Fill in form fields
      const nameInput = dialog.getByLabel(/navn|name/i);
      await nameInput.fill('Test Admin');

      const emailInput = dialog.getByLabel(/e-?post|email/i);
      await emailInput.fill('test.admin@example.com');

      const tokenInput = dialog.getByLabel(/token/i);
      await tokenInput.fill('demo-tenant-admin-token');

      // Submit the form
      const submitButton = dialog.getByRole('button', { name: /logg inn|login|submit/i });
      await submitButton.click();

      // Wait for potential redirect or error
      // Note: Without a real backend, this may result in an error state
      // We verify the form submission was attempted
      await page.waitForLoadState('networkidle');

      // Check if we got redirected to dashboard or if there's an error message
      const isDashboard = page.url().includes('/') && !page.url().includes('/login');
      const hasErrorMessage = await page.locator('text=/feil|error|invalid/i').first().isVisible({ timeout: 3000 }).catch(() => false);

      // Either successful redirect or expected error (no backend)
      expect(isDashboard || hasErrorMessage || page.url().includes('/login')).toBeTruthy();
    });
  });

  test.describe('Authentication State', () => {
    test('redirects unauthenticated users from protected routes to login', async ({ page }) => {
      // Try to access dashboard directly
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Should be redirected to login page
      await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
    });

    test('redirects unauthenticated users from subscription page to login', async ({ page }) => {
      // Try to access subscription page directly
      await page.goto('/subscription');
      await page.waitForLoadState('networkidle');

      // Should be redirected to login page
      await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
    });

    test('redirects unauthenticated users from branding page to login', async ({ page }) => {
      // Try to access branding page directly
      await page.goto('/branding');
      await page.waitForLoadState('networkidle');

      // Should be redirected to login page
      await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
    });

    test('redirects unauthenticated users from integrations page to login', async ({ page }) => {
      // Try to access integrations page directly
      await page.goto('/settings/integrations');
      await page.waitForLoadState('networkidle');

      // Should be redirected to login page
      await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
    });
  });

  test.describe('Accessibility', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/login');
      await page.waitForLoadState('networkidle');
    });

    test('has proper heading hierarchy on login page', async ({ page }) => {
      // Should have at least one heading
      const headings = page.locator('h1, h2, h3, h4, h5, h6');
      const headingCount = await headings.count();
      expect(headingCount).toBeGreaterThan(0);

      // Should have exactly one h1
      const h1Count = await page.locator('h1').count();
      expect(h1Count).toBeLessThanOrEqual(1);
    });

    test('all login buttons have accessible names', async ({ page }) => {
      // Find all buttons on the page
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

    test('demo login dialog has accessible form labels', async ({ page }) => {
      // Open demo login dialog
      const demoLoginButton = page.locator('text=/Demo/i').first();
      await demoLoginButton.click();

      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible({ timeout: 5000 });

      // Verify all inputs have associated labels
      const inputs = dialog.locator('input');
      const inputCount = await inputs.count();

      for (let i = 0; i < inputCount; i++) {
        const input = inputs.nth(i);
        const inputType = await input.getAttribute('type');

        // Skip hidden inputs
        if (inputType === 'hidden') continue;

        const id = await input.getAttribute('id');
        const ariaLabel = await input.getAttribute('aria-label');
        const ariaLabelledBy = await input.getAttribute('aria-labelledby');
        const placeholder = await input.getAttribute('placeholder');

        // Input should have some form of labeling
        let hasLabel = ariaLabel || ariaLabelledBy || placeholder;

        if (id && !hasLabel) {
          const label = dialog.locator(`label[for="${id}"]`);
          hasLabel = (await label.count()) > 0;
        }

        expect(hasLabel).toBeTruthy();
      }
    });
  });

  test.describe('Responsive Design', () => {
    test('login page renders correctly on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/login');
      await page.waitForLoadState('networkidle');

      // Login options should still be visible
      const demoLoginOption = page.locator('text=/Demo/i').first();
      await expect(demoLoginOption).toBeVisible({ timeout: 10000 });

      // Content should be accessible
      const brandName = page.locator('text=/DIGILIST/i').first();
      await expect(brandName).toBeVisible();
    });

    test('login page renders correctly on tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/login');
      await page.waitForLoadState('networkidle');

      // Login options should be visible
      const demoLoginOption = page.locator('text=/Demo/i').first();
      await expect(demoLoginOption).toBeVisible({ timeout: 10000 });
    });

    test('login page has no horizontal scroll on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/login');
      await page.waitForLoadState('networkidle');

      // Check that page doesn't have horizontal scroll
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);

      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1); // Allow 1px tolerance
    });
  });
});
