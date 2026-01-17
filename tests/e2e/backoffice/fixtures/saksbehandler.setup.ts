import { test as setup, expect } from '@playwright/test';
import { config } from '../config/backoffice.config';

/**
 * Saksbehandler Authentication Setup
 * 
 * Authenticates as Saksbehandler (staff) using Demo Login flow.
 */
setup('authenticate as saksbehandler', async ({ page }) => {
  // Navigate to login
  await page.goto('/login', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  // Click "Admin Demo" (same button, different credentials)
  const adminDemoButton = page.locator('button[data-testid="login-option-admin-demo"]');
  await expect(adminDemoButton).toBeVisible({ timeout: 20000 });
  await adminDemoButton.click();

  // Wait for the demo login form to appear
  await page.waitForTimeout(1000);

  // Fill demo login credentials with staff/saksbehandler credentials
  const emailInput = page.locator('input[data-testid="demo-email"]');
  const tokenInput = page.locator('input[data-testid="demo-token"]');
  const nameInput = page.locator('input[data-testid="demo-name"]');

  await expect(emailInput).toBeVisible({ timeout: 5000 });

  // Fill the form with staff credentials
  await emailInput.fill(config.credentials.saksbehandler.email);
  await tokenInput.fill(config.credentials.saksbehandler.password);
  await nameInput.fill('Staff User');

  // Submit login
  const submitButton = page.locator('button[data-testid="demo-submit"]');
  await expect(submitButton).toBeEnabled({ timeout: 5000 });
  await submitButton.click();

  // Wait for successful login
  await page.waitForURL((url) => !url.pathname.includes('/login'), {
    timeout: 30000,
  });

  await page.waitForTimeout(2000);

  // Verify we're logged in by checking for sidebar
  await expect(page.locator(config.selectors.sidebar)).toBeVisible({ timeout: 15000 });

  // Save auth state
  await page.context().storageState({ path: 'tests/e2e/backoffice/.auth/saksbehandler.json' });
});
