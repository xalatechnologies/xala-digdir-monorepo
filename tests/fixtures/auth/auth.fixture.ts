import { test as base, Page } from '@playwright/test';
import { LoginPage } from '../../helpers/pages/LoginPage';

/**
 * Authentication fixture types
 */
export type AuthFixtures = {
  userPage: Page;      // Regular user session (Minside)
  adminPage: Page;     // Admin session (Backoffice)
};

/**
 * Test credentials for demo login
 * Demo login uses name/email/token instead of email/password
 */
export const TEST_CREDENTIALS = {
  user: {
    name: 'Test User',
    email: 'user@test.com',
    token: 'demo-token-user',
    role: 'user',
    baseUrl: 'http://localhost:5176', // Minside
  },
  admin: {
    name: 'Test Admin',
    email: 'admin@test.com',
    token: 'demo-token-admin',
    role: 'admin',
    baseUrl: 'http://localhost:5177', // Backoffice
  },
};

/**
 * Extended test with authentication fixtures
 *
 * Usage:
 * ```typescript
 * import { test } from './fixtures/auth/auth.fixture';
 *
 * test('user can create booking', async ({ userPage }) => {
 *   // userPage is already logged in as regular user
 *   await userPage.goto('/bookings');
 * });
 *
 * test('admin can approve booking', async ({ adminPage }) => {
 *   // adminPage is already logged in as admin
 *   await adminPage.goto('/bookings');
 * });
 * ```
 */
export const test = base.extend<AuthFixtures>({
  /**
   * Regular user session (Minside app)
   */
  userPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      baseURL: TEST_CREDENTIALS.user.baseUrl,
    });
    const page = await context.newPage();

    // Login as user (demo login with name/email/token)
    const loginPage = new LoginPage(page);
    await loginPage.goto(TEST_CREDENTIALS.user.baseUrl);
    await loginPage.login(TEST_CREDENTIALS.user.name, TEST_CREDENTIALS.user.email, TEST_CREDENTIALS.user.token);
    await loginPage.waitForLoginSuccess();

    // Use the authenticated page
    await use(page);

    // Cleanup
    await context.close();
  },

  /**
   * Admin session (Backoffice app)
   */
  adminPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      baseURL: TEST_CREDENTIALS.admin.baseUrl,
    });
    const page = await context.newPage();

    // Login as admin (demo login with name/email/token)
    const loginPage = new LoginPage(page);
    await loginPage.goto(TEST_CREDENTIALS.admin.baseUrl);
    await loginPage.login(TEST_CREDENTIALS.admin.name, TEST_CREDENTIALS.admin.email, TEST_CREDENTIALS.admin.token);
    await loginPage.waitForLoginSuccess();

    // Use the authenticated page
    await use(page);

    // Cleanup
    await context.close();
  },
});

/**
 * Expect from the extended test
 */
export { expect } from '@playwright/test';
