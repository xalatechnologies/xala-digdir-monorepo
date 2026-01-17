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
 */
export const TEST_CREDENTIALS = {
  user: {
    email: 'user@test.com',
    password: 'password123',
    role: 'user',
    baseUrl: 'http://localhost:5174', // Minside
  },
  admin: {
    email: 'admin@test.com',
    password: 'admin123',
    role: 'admin',
    baseUrl: 'http://localhost:5175', // Backoffice
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

    // Login as user
    const loginPage = new LoginPage(page);
    await loginPage.goto(TEST_CREDENTIALS.user.baseUrl);
    await loginPage.login(TEST_CREDENTIALS.user.email, TEST_CREDENTIALS.user.password);
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

    // Login as admin
    const loginPage = new LoginPage(page);
    await loginPage.goto(TEST_CREDENTIALS.admin.baseUrl);
    await loginPage.login(TEST_CREDENTIALS.admin.email, TEST_CREDENTIALS.admin.password);
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
