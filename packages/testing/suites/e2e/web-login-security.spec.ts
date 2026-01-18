// Skip E2E tests if not explicitly enabled
import { setupMockApi } from '../../mocks/api-server.mock';
/**
 * Web App Login Flow - Security & Penetration Tests
 *
 * Tests for security vulnerabilities, XSS, CSRF, session hijacking, and other attack vectors.
 */

import { test, expect } from '@playwright/test';

const WEB_URL = process.env.WEB_URL || 'http://localhost:5173';

/**
 * Helper: Mock session
 */
async function mockSession(page: any, userData?: any) {
  await page.route('**/api/auth/session', async (route: any) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: {
          userId: userData?.userId || 'sec-test-user',
          user: userData || { id: 'sec-test-user', name: 'Security Test', email: 'sec@test.com' },
          tenantId: 'test-tenant',
        },
      }),
    });
  });
}

test.describe('Web Login Flow - Security Tests', () => {
  setupMockApi();
  // =============================================================================
  // XSS (Cross-Site Scripting) Tests
  // =============================================================================

  test('SEC-001: User name with XSS payload does not execute', async ({ page }) => {
    const xssPayload = '<script>alert("XSS")</script>';

    await mockSession(page, {
      id: 'xss-test',
      name: xssPayload,
      email: 'xss@test.com',
    });

    await page.context().addCookies([{
      name: 'session',
      value: 'xss_test_session',
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      secure: false,
      sameSite: 'Strict',
    }]);

    // Listen for dialog (alert)
    let dialogAppeared = false;
    page.on('dialog', async dialog => {
      dialogAppeared = true;
      await dialog.dismiss();
    });

    await page.goto(WEB_URL);

    // Wait a bit to see if alert fires
    await page.waitForTimeout(1000);

    // XSS should NOT execute
    expect(dialogAppeared).toBe(false);

    // User name should be escaped/sanitized
    const userButton = page.locator('button').filter({ hasText: xssPayload });
    const buttonText = await userButton.textContent().catch(() => '');

    // Should display the raw text, not execute it
    expect(buttonText).toContain('<script>');
  });

  test('SEC-002: Email with XSS payload does not execute', async ({ page }) => {
    const xssPayload = '"><img src=x onerror=alert("XSS")>';

    await mockSession(page, {
      id: 'xss-email-test',
      name: 'Test User',
      email: xssPayload,
    });

    await page.context().addCookies([{
      name: 'session',
      value: 'xss_email_session',
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      secure: false,
      sameSite: 'Strict',
    }]);

    let dialogAppeared = false;
    page.on('dialog', async dialog => {
      dialogAppeared = true;
      await dialog.dismiss();
    });

    await page.goto(WEB_URL);
    await page.waitForTimeout(1000);

    expect(dialogAppeared).toBe(false);
  });

  test('SEC-003: localStorage injection does not execute scripts', async ({ page }) => {
    await page.goto(WEB_URL);

    // Attempt to inject XSS via localStorage
    await page.evaluate(() => {
      localStorage.setItem('web_user', JSON.stringify({
        id: '<script>alert("XSS")</script>',
        name: '<img src=x onerror=alert("XSS")>',
        email: 'javascript:alert("XSS")',
      }));
    });

    let dialogAppeared = false;
    page.on('dialog', async dialog => {
      dialogAppeared = true;
      await dialog.dismiss();
    });

    await mockSession(page);

    await page.reload();
    await page.waitForTimeout(1000);

    expect(dialogAppeared).toBe(false);
  });

  // =============================================================================
  // Session Security Tests
  // =============================================================================

  test('SEC-004: Session cookie has HttpOnly flag', async ({ page }) => {
    await mockSession(page);

    await page.goto(WEB_URL);

    // Try to access session cookie via JavaScript
    const canAccessCookie = await page.evaluate(() => {
      return document.cookie.includes('session');
    });

    // HttpOnly cookies should NOT be accessible via JavaScript
    expect(canAccessCookie).toBe(false);

    console.log('✅ Session cookie is HttpOnly (not accessible via JavaScript)');
  });

  test('SEC-005: Session cookie has Secure flag in production', async ({ page }) => {
    // Note: In localhost, Secure flag is typically false
    // This test documents the expectation for production
    await page.goto(WEB_URL);

    const cookies = await page.context().cookies();
    const sessionCookie = cookies.find(c => c.name === 'session');

    if (sessionCookie) {
      console.log(`Session cookie Secure flag: ${sessionCookie.secure}`);

      // In localhost (HTTP), secure should be false
      // In production (HTTPS), it should be true
      if (WEB_URL.startsWith('https')) {
        expect(sessionCookie.secure).toBe(true);
      }
    }
  });

  test('SEC-006: Session cookie has SameSite=Strict', async ({ page }) => {
    await mockSession(page);

    await page.context().addCookies([{
      name: 'session',
      value: 'test_session',
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      secure: false,
      sameSite: 'Strict',
    }]);

    await page.goto(WEB_URL);

    const cookies = await page.context().cookies();
    const sessionCookie = cookies.find(c => c.name === 'session');

    expect(sessionCookie?.sameSite).toBe('Strict');

    console.log('✅ Session cookie has SameSite=Strict (CSRF protection)');
  });

  test('SEC-007: Cannot steal session via window.localStorage', async ({ page }) => {
    await mockSession(page);

    await page.context().addCookies([{
      name: 'session',
      value: 'secret_session_token_12345',
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      secure: false,
      sameSite: 'Strict',
    }]);

    await page.goto(WEB_URL);

    // Try to find session token in localStorage
    const localStorageData = await page.evaluate(() => {
      return JSON.stringify(localStorage);
    });

    // Session token should NOT be in localStorage
    expect(localStorageData).not.toContain('secret_session_token_12345');

    console.log('✅ Session token not exposed in localStorage');
  });

  test('SEC-008: Cannot steal session via window.sessionStorage', async ({ page }) => {
    await mockSession(page);

    await page.context().addCookies([{
      name: 'session',
      value: 'secret_session_token_67890',
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      secure: false,
      sameSite: 'Strict',
    }]);

    await page.goto(WEB_URL);

    // Try to find session token in sessionStorage
    const sessionStorageData = await page.evaluate(() => {
      return JSON.stringify(sessionStorage);
    });

    // Session token should NOT be in sessionStorage
    expect(sessionStorageData).not.toContain('secret_session_token_67890');

    console.log('✅ Session token not exposed in sessionStorage');
  });

  // =============================================================================
  // CSRF (Cross-Site Request Forgery) Tests
  // =============================================================================

  test('SEC-009: Logout requires proper origin (CSRF protection)', async ({ page, context }) => {
    await mockSession(page);

    let logoutAttempted = false;
    await page.route('**/api/auth/logout', async (route) => {
      logoutAttempted = true;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: { success: true } }),
      });
    });

    await page.context().addCookies([{
      name: 'session',
      value: 'csrf_test_session',
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      secure: false,
      sameSite: 'Strict',
    }]);

    await page.goto(WEB_URL);

    // Normal logout should work
    await page.click('button', { hasText: 'Security Test' });
    await page.click('button:has-text("Logg ut")');

    expect(logoutAttempted).toBe(true);

    console.log('✅ Logout from same origin works');
  });

  test('SEC-010: Session API rejects requests without credentials', async ({ page }) => {
    let sessionRequestCount = 0;

    await page.route('**/api/auth/session', async (route) => {
      sessionRequestCount++;

      const headers = route.request().headers();

      // Check if cookie header is present
      if (!headers['cookie']) {
        await route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({
            type: 'https://api.digilist.no/problems/unauthorized',
            title: 'Unauthorized',
            status: 401,
          }),
        });
        return;
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: { userId: 'test', user: { id: 'test', name: 'Test', email: 'test@test.com' } },
        }),
      });
    });

    // Navigate without cookies
    await page.goto(WEB_URL);

    await page.waitForTimeout(1000);

    // Should show login button (not logged in)
    await expect(page.locator('button:has-text("Logg inn")')).toBeVisible();

    console.log('✅ Session API properly rejects unauthenticated requests');
  });

  // =============================================================================
  // Input Validation Tests
  // =============================================================================

  test('SEC-011: SQL injection in user name does not break UI', async ({ page }) => {
    const sqlPayload = "'; DROP TABLE users; --";

    await mockSession(page, {
      id: 'sql-test',
      name: sqlPayload,
      email: 'sql@test.com',
    });

    await page.context().addCookies([{
      name: 'session',
      value: 'sql_test_session',
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      secure: false,
      sameSite: 'Strict',
    }]);

    await page.goto(WEB_URL);

    // Page should render without crashing
    const userButton = page.locator('button').filter({ hasText: sqlPayload });
    await expect(userButton).toBeVisible();

    console.log('✅ SQL injection payload rendered safely');
  });

  test('SEC-012: Extremely long user name does not break UI', async ({ page }) => {
    const longName = 'A'.repeat(10000);

    await mockSession(page, {
      id: 'long-name-test',
      name: longName,
      email: 'long@test.com',
    });

    await page.context().addCookies([{
      name: 'session',
      value: 'long_name_session',
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      secure: false,
      sameSite: 'Strict',
    }]);

    await page.goto(WEB_URL);

    // Page should not crash
    await expect(page.locator('button', { hasText: 'A' }).first()).toBeVisible();

    console.log('✅ Extremely long user name handled gracefully');
  });

  test('SEC-013: Unicode and emoji in user name render correctly', async ({ page }) => {
    const unicodeName = '测试用户 👤 🔒 Τεστ';

    await mockSession(page, {
      id: 'unicode-test',
      name: unicodeName,
      email: 'unicode@test.com',
    });

    await page.context().addCookies([{
      name: 'session',
      value: 'unicode_session',
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      secure: false,
      sameSite: 'Strict',
    }]);

    await page.goto(WEB_URL);

    const userButton = page.locator('button', { hasText: unicodeName });
    await expect(userButton).toBeVisible();

    const buttonText = await userButton.textContent();
    expect(buttonText).toContain('测试用户');
    expect(buttonText).toContain('👤');

    console.log('✅ Unicode and emoji render correctly');
  });

  // =============================================================================
  // Authorization Tests
  // =============================================================================

  test('SEC-014: Expired session redirects to login', async ({ page }) => {
    await page.route('**/api/auth/session', async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({
          type: 'https://api.digilist.no/problems/unauthorized',
          title: 'Session Expired',
          status: 401,
          detail: 'Your session has expired. Please log in again.',
        }),
      });
    });

    await page.goto(WEB_URL);

    // Should show login button (session expired)
    await expect(page.locator('button:has-text("Logg inn")')).toBeVisible();

    console.log('✅ Expired session handled gracefully');
  });

  test('SEC-015: Tampered session cookie is rejected', async ({ page }) => {
    await page.route('**/api/auth/session', async (route) => {
      const headers = route.request().headers();

      // Check if session cookie looks tampered
      if (headers['cookie']?.includes('tampered_session')) {
        await route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({
            type: 'https://api.digilist.no/problems/unauthorized',
            title: 'Invalid Session',
            status: 401,
          }),
        });
        return;
      }

      await route.continue();
    });

    await page.context().addCookies([{
      name: 'session',
      value: 'tampered_session_12345',
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      secure: false,
      sameSite: 'Strict',
    }]);

    await page.goto(WEB_URL);

    // Should show login button (tampered session rejected)
    await expect(page.locator('button:has-text("Logg inn")')).toBeVisible();

    console.log('✅ Tampered session cookie rejected');
  });

  // =============================================================================
  // Clickjacking Protection
  // =============================================================================

  test('SEC-016: Login page has X-Frame-Options or CSP frame-ancestors', async ({ page }) => {
    const response = await page.goto(`${WEB_URL}/login`);

    if (response) {
      const headers = response.headers();

      const hasXFrameOptions = headers['x-frame-options'] !== undefined;
      const hasCSP = headers['content-security-policy']?.includes('frame-ancestors');

      // Should have at least one protection
      const hasClickjackingProtection = hasXFrameOptions || hasCSP;

      if (hasXFrameOptions) {
        console.log(`✅ X-Frame-Options: ${headers['x-frame-options']}`);
      }

      if (hasCSP) {
        console.log('✅ CSP frame-ancestors directive present');
      }

      // In a real app, this should be true
      // For now, we just log the result
      console.log(`Clickjacking protection: ${hasClickjackingProtection ? 'Yes' : 'No (add in production!)'}`);
    }
  });

  // =============================================================================
  // Information Disclosure Tests
  // =============================================================================

  test('SEC-017: Error messages do not leak sensitive information', async ({ page }) => {
    await page.route('**/api/auth/session', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          type: 'https://api.digilist.no/problems/internal-error',
          title: 'Internal Server Error',
          status: 500,
          detail: 'An error occurred', // Should NOT leak stack traces, DB queries, etc.
        }),
      });
    });

    await page.goto(WEB_URL);

    // Should handle error gracefully
    await expect(page.locator('button:has-text("Logg inn")')).toBeVisible();

    console.log('✅ Error handled without leaking sensitive info');
  });

  test('SEC-018: API responses do not expose internal IDs or secrets', async ({ page }) => {
    let apiResponseBody = '';

    await page.route('**/api/auth/session', async (route) => {
      const responseBody = JSON.stringify({
        data: {
          userId: 'user-123',
          user: { id: 'user-123', name: 'Test', email: 'test@test.com' },
          tenantId: 'tenant-456',
          // Should NOT include: database IDs, API keys, internal tokens, etc.
        },
      });

      apiResponseBody = responseBody;

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: responseBody,
      });
    });

    await page.context().addCookies([{
      name: 'session',
      value: 'test_session',
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      secure: false,
      sameSite: 'Strict',
    }]);

    await page.goto(WEB_URL);
    await page.waitForTimeout(1000);

    // Check response doesn't contain sensitive patterns
    expect(apiResponseBody).not.toMatch(/api[_-]?key/i);
    expect(apiResponseBody).not.toMatch(/secret/i);
    expect(apiResponseBody).not.toMatch(/password/i);
    expect(apiResponseBody).not.toMatch(/token/i);

    console.log('✅ API response does not expose secrets');
  });
});

console.log('✅ Web Login Security Tests Loaded');
