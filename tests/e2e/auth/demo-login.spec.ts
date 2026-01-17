/**
 * Demo Login E2E Test
 *
 * Verifies that the demo login flow works correctly
 * Tests both Minside (user) and Backoffice (admin) apps
 */
import { test, expect } from '@playwright/test';
import { LoginPage } from '../../helpers/pages/LoginPage';
import { TEST_CREDENTIALS } from '../../fixtures/auth/auth.fixture';

test.describe('Demo Login Flow', () => {
  test('should login to Minside with demo credentials', async ({ page }) => {
    // Navigate to Minside login
    await page.goto(TEST_CREDENTIALS.user.baseUrl + '/login');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Use LoginPage helper
    const loginPage = new LoginPage(page);

    // Perform demo login
    await loginPage.login(
      TEST_CREDENTIALS.user.name,
      TEST_CREDENTIALS.user.email,
      TEST_CREDENTIALS.user.token
    );

    // Wait for successful login redirect
    await loginPage.waitForLoginSuccess();

    // Verify we're on the dashboard or home page
    await expect(page).toHaveURL(/\/(dashboard|home|minside)/);

    // Take success screenshot
    await page.screenshot({ path: 'tests/screenshots/minside-login-success.png' });
  });

  test('should login to Backoffice with demo credentials', async ({ page }) => {
    // Navigate to Backoffice login
    await page.goto(TEST_CREDENTIALS.admin.baseUrl + '/login');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Use LoginPage helper
    const loginPage = new LoginPage(page);

    // Perform demo login
    await loginPage.login(
      TEST_CREDENTIALS.admin.name,
      TEST_CREDENTIALS.admin.email,
      TEST_CREDENTIALS.admin.token
    );

    // Wait for successful login redirect
    await loginPage.waitForLoginSuccess();

    // Verify we're on the dashboard
    await expect(page).toHaveURL(/\/(dashboard|bookings)/);

    // Take success screenshot
    await page.screenshot({ path: 'tests/screenshots/backoffice-login-success.png' });
  });
});
