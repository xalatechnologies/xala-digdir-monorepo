// Skip E2E tests if not explicitly enabled
if (process.env.E2E_ENABLED !== 'true') {
  describe.skip('E2E tests require E2E_ENABLED=true', () => {});
} else {
import { setupMockApi } from '../../../mocks/api-server.mock';
/**
 * Demo Login E2E Test with Mocked API
 *
 * This test uses Playwright's route mocking to intercept API calls,
 * allowing E2E tests to run without requiring the backend API server.
 */
import { test, expect } from '@playwright/test';
import { LoginPage } from '../../helpers/pages/LoginPage';
import { TEST_CREDENTIALS } from '../../fixtures/auth/auth.fixture';

test.describe('Demo Login (Mocked API)', () => {
  setupMockApi();
  test('Minside login with mocked API', async ({ page }) => {
    // Mock the demo-token API endpoint
    await page.route('**/api/auth/demo-token', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            user: {
              id: 'test-user-123',
              name: TEST_CREDENTIALS.user.name,
              email: TEST_CREDENTIALS.user.email,
              role: TEST_CREDENTIALS.user.role,
            },
            token: 'mocked-jwt-token',
            expiresIn: 3600,
          },
        }),
      });
    });

    // Mock the session endpoint
    await page.route('**/api/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            user: {
              id: 'test-user-123',
              name: TEST_CREDENTIALS.user.name,
              email: TEST_CREDENTIALS.user.email,
              role: TEST_CREDENTIALS.user.role,
            },
            authenticated: true,
          },
        }),
      });
    });

    // Navigate to login page
    await page.goto(TEST_CREDENTIALS.user.baseUrl + '/login', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000); // Wait for React to render

    // Perform login
    const loginPage = new LoginPage(page);

    // Click demo button to open dialog
    console.log('Clicking demo login button...');
    await loginPage.demoLoginButton.click();

    // Wait for dialog to open and form fields to be visible
    await loginPage.nameInput.waitFor({ state: 'visible', timeout: 5000 });
    console.log('Demo dialog opened, form fields visible');

    // Fill login form
    await loginPage.nameInput.fill(TEST_CREDENTIALS.user.name);
    await loginPage.emailInput.fill(TEST_CREDENTIALS.user.email);
    await loginPage.tokenInput.fill(TEST_CREDENTIALS.user.token);

    // Submit form
    await loginPage.loginButton.click();

    // Wait for redirect (with longer timeout since we're mocking)
    await page.waitForTimeout(3000);

    // Check if redirected away from login
    const currentUrl = page.url();
    console.log(`Current URL: ${currentUrl}`);

    // Verify we're no longer on login page
    expect(currentUrl).not.toContain('/login');

    // Verify we're on a dashboard-type page
    expect(currentUrl).toMatch(/\/(dashboard|bookings|home|minside|\/(?!login))/);

    // Take screenshot for verification
    await page.screenshot({ path: 'tests/screenshots/demo-login-success.png', fullPage: true });
    console.log('✅ Login successful - screenshot saved');
  });

  test('Should show error for invalid token', async ({ page }) => {
    // Mock API to return 401 for invalid token
    await page.route('**/api/auth/demo-token', async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({
          type: '/errors/authentication',
          title: 'Authentication Failed',
          status: 401,
          detail: 'Invalid demo token',
        }),
      });
    });

    await page.goto(TEST_CREDENTIALS.user.baseUrl + '/login', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    const loginPage = new LoginPage(page);

    // Click demo button to open dialog
    await loginPage.demoLoginButton.click();
    await loginPage.nameInput.waitFor({ state: 'visible', timeout: 5000 });

    // Fill with invalid token
    await loginPage.nameInput.fill('Test User');
    await loginPage.emailInput.fill('test@test.com');
    await loginPage.tokenInput.fill('invalid-token');
    await loginPage.loginButton.click();

    await page.waitForTimeout(2000);

    // Should still be on login page
    expect(page.url()).toContain('/login');

    // Should show error message (check for alert role or error text)
    const hasError = await page.locator('[role="alert"], .error-message, .alert-error').count() > 0;
    expect(hasError).toBeTruthy();
  });
});
}
