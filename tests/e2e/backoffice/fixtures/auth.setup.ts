import { test as setup, expect } from '@playwright/test';
import { config } from '../config/backoffice.config';

/**
 * Admin Authentication Setup
 * 
 * Authenticates as Admin and saves session state.
 */
setup('authenticate as admin', async ({ page }) => {
  // Navigate to login
  await page.goto('/login');
  
  // Wait for login form
  await page.waitForSelector('input[type="email"], input[name="email"]', {
    timeout: 10000,
  });

  // Fill credentials
  await page.fill('input[type="email"], input[name="email"]', config.credentials.admin.email);
  await page.fill('input[type="password"], input[name="password"]', config.credentials.admin.password);

  // Submit login
  await page.click('button[type="submit"]');

  // Wait for successful login (dashboard or redirect)
  await page.waitForURL((url) => !url.pathname.includes('/login'), {
    timeout: 30000,
  });

  // Verify we're logged in by checking for sidebar
  await expect(page.locator(config.selectors.sidebar)).toBeVisible({ timeout: 10000 });

  // Save auth state
  await page.context().storageState({ path: 'tests/e2e/backoffice/.auth/admin.json' });
});
