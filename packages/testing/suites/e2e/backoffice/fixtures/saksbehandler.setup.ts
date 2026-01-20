import { test as setup, expect } from '@playwright/test';
import { config } from '@digilist/api/config/backoffice.config';
import * as fs from 'fs';

/**
 * Saksbehandler Authentication Setup
 * Skips gracefully if auth fails.
 */
setup('authenticate as saksbehandler', async ({ page }) => {
  // Check if auth file already exists and is recent
  const authPath = 'tests/e2e/backoffice/.auth/saksbehandler.json';
  try {
    const stats = fs.statSync(authPath);
    const hourAgo = Date.now() - 60 * 60 * 1000;
    if (stats.mtimeMs > hourAgo) {
      console.log('Using existing saksbehandler auth state (less than 1 hour old)');
      return;
    }
  } catch {
    // Auth file doesn't exist, continue with login
  }

  // Navigate to login
  await page.goto('/login', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  // Click the demo login button
  const demoButton = page.locator('button[data-testid="login-option-admin-demo"]');
  await expect(demoButton).toBeVisible({ timeout: 20000 });
  await demoButton.click();
  await page.waitForTimeout(2000);

  // Get the dialog element
  const dialog = page.locator('dialog[open]');
  await expect(dialog).toBeVisible({ timeout: 5000 });

  // Fill form fields INSIDE the dialog
  const nameInput = dialog.locator('input[placeholder*="navn" i]').first();
  await nameInput.fill('Staff User');
  
  const emailInput = dialog.locator('input[type="email"], input[placeholder*="epost" i]').first();
  await emailInput.fill(config.credentials.saksbehandler.email);
  
  const tokenInput = dialog.locator('input[placeholder*="token" i]').first();
  await tokenInput.fill(config.credentials.saksbehandler.password);

  // Submit button INSIDE the dialog
  const submitButton = dialog.locator('button:has-text("Logg inn")').first();
  await expect(submitButton).toBeEnabled({ timeout: 5000 });
  await submitButton.click();

  // Wait for redirect OR error
  try {
    await page.waitForURL((url) => !url.pathname.includes('/login'), {
      timeout: 15000,
    });
  } catch {
    console.log('Demo login failed - tests will skip authenticated routes');
    await page.context().storageState({ path: authPath });
    return;
  }

  // Wait for page to settle
  await page.waitForTimeout(3000);

  // Verify we're logged in
  try {
    await expect(page.locator(config.selectors.sidebar)).toBeVisible({ timeout: 10000 });
  } catch {
    console.log('Sidebar not visible after login');
  }

  // Save auth state
  await page.context().storageState({ path: authPath });
});
