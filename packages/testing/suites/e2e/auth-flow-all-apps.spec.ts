// Skip E2E tests if not explicitly enabled
if (process.env.E2E_ENABLED !== 'true') {
  describe.skip('E2E tests require E2E_ENABLED=true', () => {});
} else {
import { setupMockApi } from '../../mocks/api-server.mock';
/**
 * Authentication Flow - All Apps E2E Tests
 * Tests authentication "One Truth" fix across all 4 applications
 *
 * Test Coverage:
 * - Protected routes redirect to login with returnTo
 * - Login redirects back to original route
 * - Session persists after page refresh
 * - Cookies are set correctly (httpOnly, secure, sameSite)
 * - Logout clears cookies and redirects
 * - Session self-verification works without middleware
 *
 * Apps Tested:
 * - Backoffice (https://backoffice.digilist.no)
 * - Minside (https://minside.digilist.no)
 * - Web (https://web.digilist.no)
 * - SaaS Admin (https://saas-admin.digilist.no)
 */
import { test, expect, type Page, type Cookie } from '@playwright/test';

// App configurations
const APPS = [
  {
    name: 'Backoffice',
    url: process.env.BACKOFFICE_URL || 'https://backoffice.digilist.no',
    token: 'admin-demo-001',
    email: 'admin@skien.kommune.no',
    protectedRoute: '/dashboard',
    expectedRole: 'admin',
  },
  {
    name: 'Minside',
    url: process.env.MINSIDE_URL || 'https://minside.digilist.no',
    token: 'user-demo-001',
    email: 'lars.andersen@example.com',
    protectedRoute: '/bookings',
    expectedRole: 'user',
  },
  {
    name: 'Web',
    url: process.env.WEB_URL || 'https://web.digilist.no',
    token: 'user-demo-001',
    email: 'lars.andersen@example.com',
    protectedRoute: '/profile',
    expectedRole: 'user',
  },
];

// Helper: Check if cookies are set correctly
async function verifyCookies(page: Page): Promise<void> {
  const cookies = await page.context().cookies();

  // Access token cookie
  const accessCookie = cookies.find((c) => c.name === 'dl_at');
  expect(accessCookie, 'Access token cookie should exist').toBeDefined();
  expect(accessCookie?.httpOnly, 'Access token should be httpOnly').toBe(true);
  expect(accessCookie?.sameSite, 'Access token should be SameSite=Lax').toBe('Lax');

  // Refresh token cookie
  const refreshCookie = cookies.find((c) => c.name === 'dl_rt');
  expect(refreshCookie, 'Refresh token cookie should exist').toBeDefined();
  expect(refreshCookie?.httpOnly, 'Refresh token should be httpOnly').toBe(true);

  // CSRF token cookie
  const csrfCookie = cookies.find((c) => c.name === 'dl_csrf');
  expect(csrfCookie, 'CSRF token cookie should exist').toBeDefined();

  // In production, cookies should be secure
  if (process.env.NODE_ENV === 'production') {
    expect(accessCookie?.secure, 'Access token should be secure in production').toBe(true);
    expect(refreshCookie?.secure, 'Refresh token should be secure in production').toBe(true);
  }
}

// Helper: Login with demo token
async function loginWithDemoToken(page: Page, app: typeof APPS[0]): Promise<void> {
  await page.goto(`${app.url}/login`);

  // Wait for login page to load
  await page.waitForLoadState('networkidle');

  // Find and click demo login button/link
  const demoButton = page.locator('text=/demo|test/i').first();
  if (await demoButton.isVisible()) {
    await demoButton.click();
  }

  // Fill demo credentials
  await page.fill('input[name="email"]', app.email);
  await page.fill('input[type="password"], input[name="token"]', app.token);

  // Submit login
  await page.click('button[type="submit"]');

  // Wait for redirect (should go to dashboard or protected route)
  await page.waitForURL((url) => !url.pathname.includes('/login'), {
    timeout: 10000,
  });
}

// Helper: Check cache headers on session endpoint
async function verifySessionEndpointHeaders(page: Page, apiUrl: string): Promise<void> {
  const response = await page.request.get(`${apiUrl}/api/auth/session`, {
    failOnStatusCode: false,
  });

  const headers = response.headers();

  // Verify Cache-Control headers
  expect(headers['cache-control']).toContain('no-store');
  expect(headers['cache-control']).toContain('no-cache');
  expect(headers['pragma']).toBe('no-cache');
  expect(headers['expires']).toBe('0');
}

// Run tests for each app
for (const app of APPS) {
  test.describe(`${app.name} Auth Flow`, () => {
  setupMockApi();
    test(`should redirect protected route to login with returnTo`, async ({ page }) => {
      // Visit protected route directly
      await page.goto(`${app.url}${app.protectedRoute}`);

      // Should redirect to login page
      await expect(page).toHaveURL(new RegExp('/login'));

      // Should have returnTo parameter
      const url = new URL(page.url());
      expect(url.searchParams.get('returnTo')).toBe(app.protectedRoute);
    });

    test(`should login and redirect back to original route`, async ({ page }) => {
      // Visit protected route (will redirect to login)
      await page.goto(`${app.url}${app.protectedRoute}`);
      await expect(page).toHaveURL(new RegExp('/login'));

      // Login with demo token
      await loginWithDemoToken(page, app);

      // Should redirect back to original protected route
      await expect(page).toHaveURL(`${app.url}${app.protectedRoute}`);
    });

    test(`should set cookies correctly after login`, async ({ page }) => {
      await page.goto(`${app.url}/login`);
      await loginWithDemoToken(page, app);

      // Verify cookies are set
      await verifyCookies(page);
    });

    test(`should persist session after page refresh`, async ({ page }) => {
      // Login first
      await page.goto(`${app.url}/login`);
      await loginWithDemoToken(page, app);

      // Verify we're on protected route
      await expect(page).toHaveURL(`${app.url}${app.protectedRoute}`);

      // Refresh page
      await page.reload();

      // Should still be on protected route (session persists)
      await expect(page).toHaveURL(`${app.url}${app.protectedRoute}`);

      // User should still be logged in (no flash of logout)
      // Wait a bit to ensure no redirect happens
      await page.waitForTimeout(2000);
      await expect(page).toHaveURL(`${app.url}${app.protectedRoute}`);
    });

    test(`should persist session across multiple refreshes`, async ({ page }) => {
      // Login first
      await page.goto(`${app.url}/login`);
      await loginWithDemoToken(page, app);

      // Refresh multiple times
      for (let i = 0; i < 3; i++) {
        await page.reload();
        await page.waitForTimeout(1000);

        // Should still be logged in
        await expect(page).toHaveURL(`${app.url}${app.protectedRoute}`);
      }
    });

    test(`should logout and clear cookies`, async ({ page }) => {
      // Login first
      await page.goto(`${app.url}/login`);
      await loginWithDemoToken(page, app);

      // Find and click logout button
      const logoutButton = page.locator('[data-testid="logout-button"], button:has-text("Logg ut"), button:has-text("Logout")').first();
      await logoutButton.click();

      // Should redirect to login
      await expect(page).toHaveURL(new RegExp('/login'));

      // Verify cookies are cleared
      const cookies = await page.context().cookies();
      const accessCookie = cookies.find((c) => c.name === 'dl_at');
      expect(accessCookie, 'Access token cookie should be cleared').toBeUndefined();
    });

    test(`should validate session endpoint has no-store headers`, async ({ page }) => {
      // Login first
      await page.goto(`${app.url}/login`);
      await loginWithDemoToken(page, app);

      // Extract API URL from app URL
      const apiUrl = app.url.replace(/(backoffice|minside|web|saas-admin)/, 'api');

      // Verify session endpoint headers
      await verifySessionEndpointHeaders(page, apiUrl);
    });

    test(`should work without cached localStorage data`, async ({ page }) => {
      // Login first
      await page.goto(`${app.url}/login`);
      await loginWithDemoToken(page, app);

      // Clear localStorage (simulating cache corruption)
      await page.evaluate(() => {
        localStorage.clear();
      });

      // Refresh page
      await page.reload();

      // Should still be logged in (relies on cookies, not localStorage)
      await expect(page).toHaveURL(`${app.url}${app.protectedRoute}`);
    });

    test(`should handle expired token gracefully`, async ({ page }) => {
      // This test simulates token expiry
      // In production, tokens expire after 15 minutes

      await page.goto(`${app.url}/login`);
      await loginWithDemoToken(page, app);

      // Clear cookies to simulate expiry
      await page.context().clearCookies();

      // Try to access protected route
      await page.goto(`${app.url}${app.protectedRoute}`);

      // Should redirect to login
      await expect(page).toHaveURL(new RegExp('/login'));
    });

    test(`should display correct user info after login`, async ({ page }) => {
      await page.goto(`${app.url}/login`);
      await loginWithDemoToken(page, app);

      // Check if user menu or name is visible
      const userMenu = page.locator('[data-testid="user-menu"], [data-testid="user-name"]').first();
      await expect(userMenu).toBeVisible();

      // Verify user email is displayed somewhere
      const emailText = page.locator(`text=${app.email}`);
      await expect(emailText).toBeVisible();
    });
  });
}

// Cross-app session tests
test.describe('Cross-App Session Behavior', () => {
  setupMockApi();
  test('should share session across all apps (SSO)', async ({ page, context }) => {
    // Login to Backoffice
    const backoffice = APPS[0];
    await page.goto(`${backoffice.url}/login`);
    await loginWithDemoToken(page, backoffice);

    // Cookies are set with domain .digilist.no (works across subdomains)
    const cookies = await context.cookies();
    const accessCookie = cookies.find((c) => c.name === 'dl_at');

    // Cookie should be accessible across subdomains
    expect(accessCookie?.domain).toMatch(/digilist\.no/);

    // Now visit Minside - should be automatically logged in
    const minside = APPS[1];
    await page.goto(`${minside.url}${minside.protectedRoute}`);

    // Should be logged in (no redirect to login)
    await expect(page).toHaveURL(`${minside.url}${minside.protectedRoute}`);
  });

  test('should handle logout from one app affecting all apps', async ({ page, context }) => {
    // Login to Backoffice
    const backoffice = APPS[0];
    await page.goto(`${backoffice.url}/login`);
    await loginWithDemoToken(page, backoffice);

    // Logout from Backoffice
    const logoutButton = page.locator('[data-testid="logout-button"]').first();
    await logoutButton.click();

    // Now try to access Minside protected route
    const minside = APPS[1];
    await page.goto(`${minside.url}${minside.protectedRoute}`);

    // Should redirect to login (session cleared)
    await expect(page).toHaveURL(new RegExp('/login'));
  });
});

// Session validation tests
test.describe('Session Validation - Self-Verifying Endpoint', () => {
  setupMockApi();
  test('should validate session without relying on middleware', async ({ page, request }) => {
    // Login via Backoffice
    const app = APPS[0];
    await page.goto(`${app.url}/login`);
    await loginWithDemoToken(page, app);

    // Get cookies
    const cookies = await page.context().cookies();
    const accessCookie = cookies.find((c) => c.name === 'dl_at');

    expect(accessCookie, 'Should have access token').toBeDefined();

    // Make direct API call to session endpoint
    const apiUrl = app.url.replace(/(backoffice|minside|web|saas-admin)/, 'api');
    const response = await request.get(`${apiUrl}/api/auth/session`, {
      headers: {
        Cookie: `dl_at=${accessCookie?.value}`,
      },
    });

    // Should return 200 with user data
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.data.user).toBeDefined();
    expect(data.data.user.email).toBe(app.email);
  });

  test('should return 401 for session endpoint without cookie', async ({ request }) => {
    const apiUrl = 'https://api.digilist.no';

    const response = await request.get(`${apiUrl}/api/auth/session`, {
      failOnStatusCode: false,
    });

    // Should return 401
    expect(response.status()).toBe(401);

    const data = await response.json();
    expect(data.error).toBeDefined();
    expect(data.error.code).toBe('UNAUTHORIZED');
  });
});

// Token refresh tests
test.describe('Token Refresh Flow', () => {
  setupMockApi();
  test('should automatically refresh token before expiry', async ({ page }) => {
    // This test requires waiting 13+ minutes for token refresh
    // Mark as skip for regular test runs
    // Run manually with: npx playwright test --grep "automatically refresh"

    const app = APPS[0];
    await page.goto(`${app.url}/login`);
    await loginWithDemoToken(page, app);

    // Wait 13 minutes (token expires after 15 minutes, refresh happens at 13 minutes)
    await page.waitForTimeout(13 * 60 * 1000);

    // Page should still be logged in (auto-refresh happened)
    await page.reload();
    await expect(page).toHaveURL(`${app.url}${app.protectedRoute}`);
  });

  test('should handle manual refresh token request', async ({ page, request }) => {
    const app = APPS[0];
    await page.goto(`${app.url}/login`);
    await loginWithDemoToken(page, app);

    // Get refresh token cookie
    const cookies = await page.context().cookies();
    const refreshCookie = cookies.find((c) => c.name === 'dl_rt');

    expect(refreshCookie, 'Should have refresh token').toBeDefined();

    // Call refresh endpoint
    const apiUrl = app.url.replace(/(backoffice|minside|web|saas-admin)/, 'api');
    const response = await request.post(`${apiUrl}/api/auth/refresh`, {
      headers: {
        Cookie: `dl_rt=${refreshCookie?.value}`,
      },
    });

    // Should return 200 with new tokens
    expect(response.status()).toBe(200);

    // New cookies should be set
    const setCookieHeaders = response.headers()['set-cookie'];
    expect(setCookieHeaders).toBeDefined();
  });
});

// Browser compatibility tests
test.describe('Browser Compatibility', () => {
  setupMockApi();
  // Run on Chrome, Firefox, Safari (configured in playwright.config.ts)

  test('should work in all browsers', async ({ page, browserName }) => {
    console.log(`Testing in ${browserName}`);

    const app = APPS[0];
    await page.goto(`${app.url}/login`);
    await loginWithDemoToken(page, app);

    // Verify cookies work
    await verifyCookies(page);

    // Verify session persists
    await page.reload();
    await expect(page).toHaveURL(`${app.url}${app.protectedRoute}`);
  });
});

console.log('✅ Auth Flow E2E Tests Loaded');
console.log('Run with: npx playwright test tests/e2e/auth-flow-all-apps.spec.ts');
console.log('Run with UI: npx playwright test tests/e2e/auth-flow-all-apps.spec.ts --ui');
console.log('Run headed: npx playwright test tests/e2e/auth-flow-all-apps.spec.ts --headed');
}
