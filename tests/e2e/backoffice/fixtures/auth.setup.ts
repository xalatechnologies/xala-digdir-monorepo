import { test as setup, expect } from '@playwright/test';
import { config } from '../config/backoffice.config';

/**
 * Admin Authentication Setup
 * 
 * Authenticates as Admin using the Demo Login flow:
 * 1. Click "Admin Demo" button to open modal
 * 2. Fill email, token, and name
 * 3. Submit
 */
setup('authenticate as admin', async ({ page }) => {
  // Navigate to login - use domcontentloaded to avoid networkidle timeout
  await page.goto('/login', { waitUntil: 'domcontentloaded' });

  // Wait for page to be interactive
  await page.waitForTimeout(2000);

  // Click "Admin Demo" button to open the login modal
  const adminDemoButton = page.locator('button[data-testid="login-option-admin-demo"]');
  
  // Wait for and click the Admin Demo option
  await expect(adminDemoButton).toBeVisible({ timeout: 20000 });
  await adminDemoButton.click();

  // Wait for the demo login form to appear
  await page.waitForTimeout(1000);

  // Fill demo login credentials
  const emailInput = page.locator('input[data-testid="demo-email"]');
  const tokenInput = page.locator('input[data-testid="demo-token"]');
  const nameInput = page.locator('input[data-testid="demo-name"]');

  await expect(emailInput).toBeVisible({ timeout: 5000 });
  
  // Fill the form
  await emailInput.fill(config.credentials.admin.email);
  await tokenInput.fill(config.credentials.admin.password); // Token acts as password
  await nameInput.fill('Admin User');

  // Submit login
  const submitButton = page.locator('button[data-testid="demo-submit"]');
  await expect(submitButton).toBeEnabled({ timeout: 5000 });
  await submitButton.click();

  // Wait for redirect away from login
  await page.waitForURL((url) => !url.pathname.includes('/login'), {
    timeout: 30000,
  });

  // Wait for page to settle
  await page.waitForTimeout(2000);

  // Verify we're logged in by checking for sidebar
  await expect(page.locator(config.selectors.sidebar)).toBeVisible({ timeout: 15000 });

  // Save auth state
  await page.context().storageState({ path: 'tests/e2e/backoffice/.auth/admin.json' });
});
