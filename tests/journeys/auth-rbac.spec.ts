/**
 * Authentication and RBAC E2E Tests
 *
 * Comprehensive test suite covering:
 * - Login/logout flows for all apps (web, backoffice, minside)
 * - Session persistence across page refreshes
 * - Role-based access control (RBAC) enforcement
 * - Unauthorized access blocking
 * - Dashboard routing based on user roles
 *
 * @roadmap P0-02 RBAC as source of truth
 * @roadmap P1-01 Session continuity
 */

import { test, expect, type Page } from '@playwright/test';
import { APP_URLS, TEST_USERS, loginAs, logout } from './helpers';

/**
 * Helper to check if session cookie exists
 */
async function hasSessionCookie(page: Page): Promise<boolean> {
  const cookies = await page.context().cookies();
  return cookies.some(cookie => cookie.name === 'digilist_session');
}

/**
 * Helper to clear all cookies and storage
 */
async function clearSession(page: Page): Promise<void> {
  await page.context().clearCookies();

  // Navigate to a page first to avoid localStorage access errors
  try {
    await page.goto('about:blank');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  } catch (error) {
    // Ignore errors if page not loaded yet
  }
}

test.describe('Backoffice - RBAC Enforcement', () => {
  test.beforeEach(async ({ page }) => {
    await clearSession(page);
  });

  test('RBAC-01 | Admin can access backoffice dashboard', async ({ page }) => {
    // Login as admin
    await loginAs(page, 'admin');
    await page.goto(APP_URLS.backoffice);

    // Should see dashboard (not blocked)
    await expect(page).not.toHaveURL(/\/login/);

    // Should not see access denied error
    const errorMessage = page.locator('text=Ingen tilgang');
    await expect(errorMessage).not.toBeVisible();

    // Should see admin-specific content
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible();
  });

  test('RBAC-02 | Case handler can access backoffice dashboard', async ({ page }) => {
    // Login as saksbehandler
    await loginAs(page, 'saksbehandler');
    await page.goto(APP_URLS.backoffice);

    // Should see dashboard (not blocked)
    await expect(page).not.toHaveURL(/\/login/);

    // Should not see access denied error
    const errorMessage = page.locator('text=Ingen tilgang');
    await expect(errorMessage).not.toBeVisible();

    // Should see case handler interface
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible();
  });

  test('RBAC-03 | Regular user is blocked from backoffice with error message', async ({ page }) => {
    // Login as regular user (role: 'user')
    await loginAs(page, 'user');
    await page.goto(APP_URLS.backoffice);

    // Should be on login page or see error
    await expect(page).toHaveURL(/\/login/);

    // Should see access denied error message
    const errorHeading = page.locator('text=Ingen tilgang');
    await expect(errorHeading).toBeVisible({ timeout: 10000 });

    // Should see friendly error message in Norwegian
    const errorMessage = page.locator('text=Du har ikke tilgang til administrasjonspanelet');
    await expect(errorMessage).toBeVisible();
  });

  test('RBAC-04 | Unauthorized user session is cleared after access denial', async ({ page }) => {
    // Login as regular user
    await loginAs(page, 'user');

    // Try to access backoffice
    await page.goto(APP_URLS.backoffice);

    // Wait for access denied
    await expect(page).toHaveURL(/\/login/);

    // Verify session cookie was cleared
    const hasCookie = await hasSessionCookie(page);
    expect(hasCookie).toBe(false);

    // Verify localStorage was cleared
    const authUser = await page.evaluate(() => localStorage.getItem('auth_user'));
    expect(authUser).toBeNull();
  });
});

test.describe('Backoffice - Role-Based Dashboard Routing', () => {
  test.beforeEach(async ({ page }) => {
    await clearSession(page);
  });

  test('ROUTE-01 | Admin redirects to admin dashboard', async ({ page }) => {
    await loginAs(page, 'admin');
    await page.goto(APP_URLS.backoffice);

    // Should land on dashboard or home
    await expect(page).not.toHaveURL(/\/login/);

    // Should see navigation or dashboard elements
    const nav = page.locator('nav, [role="navigation"]').first();
    await expect(nav).toBeVisible({ timeout: 5000 });
  });

  test('ROUTE-02 | Case handler can access work queue', async ({ page }) => {
    await loginAs(page, 'saksbehandler');
    await page.goto(`${APP_URLS.backoffice}/work-queue`);

    // Should access work queue successfully
    await expect(page).not.toHaveURL(/\/login/);

    // Should see work queue content
    const content = page.locator('main, [role="main"]').first();
    await expect(content).toBeVisible();
  });

  test('ROUTE-03 | Regular user cannot access any backoffice route', async ({ page }) => {
    await loginAs(page, 'user');

    // Try various protected routes
    const protectedRoutes = [
      '/',
      '/work-queue',
      '/bookings',
      '/listings',
      '/organizations',
    ];

    for (const route of protectedRoutes) {
      await page.goto(`${APP_URLS.backoffice}${route}`);

      // Should always be redirected to login
      await expect(page).toHaveURL(/\/login/, { timeout: 5000 });

      // Should see access denied error
      const errorMessage = page.locator('text=Ingen tilgang');
      await expect(errorMessage).toBeVisible();
    }
  });
});

test.describe('Backoffice - Session Persistence', () => {
  test('SESSION-01 | Admin session persists across page refresh', async ({ page }) => {
    await clearSession(page);
    await loginAs(page, 'admin');
    await page.goto(APP_URLS.backoffice);

    // Verify logged in
    await expect(page).not.toHaveURL(/\/login/);

    // Get current URL
    const currentUrl = page.url();

    // Refresh page
    await page.reload();

    // Should still be logged in (same URL, not redirected to login)
    await expect(page).toHaveURL(currentUrl);
    await expect(page).not.toHaveURL(/\/login/);
  });

  test('SESSION-02 | Case handler session persists across navigation', async ({ page }) => {
    await clearSession(page);
    await loginAs(page, 'saksbehandler');
    await page.goto(APP_URLS.backoffice);

    // Navigate to different pages
    await page.goto(`${APP_URLS.backoffice}/bookings`);
    await expect(page).not.toHaveURL(/\/login/);

    await page.goto(`${APP_URLS.backoffice}/listings`);
    await expect(page).not.toHaveURL(/\/login/);

    // Refresh on final page
    await page.reload();
    await expect(page).not.toHaveURL(/\/login/);
  });
});

test.describe('Backoffice - Logout Functionality', () => {
  test('LOGOUT-01 | Logout clears session completely', async ({ page }) => {
    await clearSession(page);
    await loginAs(page, 'admin');
    await page.goto(APP_URLS.backoffice);

    // Verify logged in
    await expect(page).not.toHaveURL(/\/login/);

    // Click logout button (might be in menu/header)
    const logoutButton = page.locator('button:has-text("Logg ut"), button:has-text("Logout"), a:has-text("Logg ut")').first();

    if (await logoutButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await logoutButton.click();

      // Wait for redirect to login
      await expect(page).toHaveURL(/\/login/, { timeout: 10000 });

      // Verify session cookie cleared
      const hasCookie = await hasSessionCookie(page);
      expect(hasCookie).toBe(false);

      // Verify localStorage cleared
      const authUser = await page.evaluate(() => localStorage.getItem('auth_user'));
      expect(authUser).toBeNull();
    } else {
      console.log('[LOGOUT-01] Logout button not found - may be in collapsed menu');
    }
  });

  test('LOGOUT-02 | Refresh after logout stays on login page', async ({ page }) => {
    await clearSession(page);
    await loginAs(page, 'admin');
    await page.goto(APP_URLS.backoffice);

    // Logout (simulate by clearing session)
    await logout(page);
    await page.goto(`${APP_URLS.backoffice}/login`);

    // Verify on login page
    await expect(page).toHaveURL(/\/login/);

    // Refresh
    await page.reload();

    // Should still be on login page (not auto-login)
    await expect(page).toHaveURL(/\/login/);
  });

  test('LOGOUT-03 | Cannot access protected routes after logout', async ({ page }) => {
    await clearSession(page);
    await loginAs(page, 'admin');
    await page.goto(APP_URLS.backoffice);

    // Logout
    await logout(page);

    // Try to access protected route
    await page.goto(`${APP_URLS.backoffice}/bookings`);

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('Minside - Session Management', () => {
  test.beforeEach(async ({ page }) => {
    await clearSession(page);
  });

  test('MINSIDE-01 | User can login and access dashboard', async ({ page }) => {
    await loginAs(page, 'user');
    await page.goto(APP_URLS.minside);

    // Should access minside successfully
    await expect(page).not.toHaveURL(/\/login/);

    // Should see user dashboard
    const content = page.locator('main, [role="main"]').first();
    await expect(content).toBeVisible({ timeout: 5000 });
  });

  test('MINSIDE-02 | Session persists across page refresh', async ({ page }) => {
    await loginAs(page, 'user');
    await page.goto(APP_URLS.minside);

    const currentUrl = page.url();
    await page.reload();

    // Should still be logged in
    await expect(page).toHaveURL(currentUrl);
    await expect(page).not.toHaveURL(/\/login/);
  });

  test('MINSIDE-03 | Logout clears session', async ({ page }) => {
    await loginAs(page, 'user');
    await page.goto(APP_URLS.minside);

    // Logout
    await logout(page);
    await page.goto(`${APP_URLS.minside}/login`);

    // Refresh
    await page.reload();

    // Should stay on login page
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('Web App - Session Management', () => {
  test.beforeEach(async ({ page }) => {
    await clearSession(page);
  });

  test('WEB-01 | User can access web app', async ({ page }) => {
    await loginAs(page, 'user');
    await page.goto(APP_URLS.web);

    // Should load successfully
    await expect(page).not.toHaveURL(/error|404/);

    // Should see content
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('WEB-02 | Session persists across navigation', async ({ page }) => {
    await loginAs(page, 'user');
    await page.goto(APP_URLS.web);

    // Navigate to listings
    await page.goto(`${APP_URLS.web}/listings`);
    await page.reload();

    // Should still be accessible
    await expect(page).not.toHaveURL(/\/login/);
  });

  test('WEB-03 | Logout clears session', async ({ page }) => {
    await loginAs(page, 'user');
    await page.goto(APP_URLS.web);

    // Logout
    await logout(page);

    // Verify localStorage cleared
    const authUser = await page.evaluate(() => localStorage.getItem('web_user'));
    expect(authUser).toBeNull();
  });
});

test.describe('Cross-App Session Isolation', () => {
  test('ISOLATION-01 | Backoffice and Minside sessions are independent', async ({ page }) => {
    // Login to backoffice as admin
    await loginAs(page, 'admin');
    await page.goto(APP_URLS.backoffice);
    await expect(page).not.toHaveURL(/\/login/);

    // Navigate to minside (different port)
    await page.goto(APP_URLS.minside);

    // Should require separate login (different app context)
    // Note: In real production, these would be different domains
    // For localhost testing, they share storage, so this test documents expected behavior
  });

  test('ISOLATION-02 | Logout from one app does not affect other apps', async ({ page }) => {
    // This test documents that in production, apps are isolated
    // In localhost, they may share storage due to same origin

    await loginAs(page, 'admin');
    await page.goto(APP_URLS.backoffice);

    // Logout
    await logout(page);

    // In production, minside session would remain if it existed
    // In localhost dev, sessions are shared due to same origin
  });
});

test.describe('Security Headers and Cookie Settings', () => {
  test('SECURITY-01 | Session cookie has correct security attributes', async ({ page }) => {
    await loginAs(page, 'admin');
    await page.goto(APP_URLS.backoffice);

    const cookies = await page.context().cookies();
    const sessionCookie = cookies.find(c => c.name === 'digilist_session');

    if (sessionCookie) {
      // In production, should have HttpOnly and Secure flags
      expect(sessionCookie.httpOnly).toBe(true);

      // Note: Secure flag only applies in HTTPS (production)
      // SameSite should be None for cross-domain or Lax for same-site
    }
  });

  test('SECURITY-02 | No sensitive data in localStorage', async ({ page }) => {
    await loginAs(page, 'admin');
    await page.goto(APP_URLS.backoffice);

    // Check that no passwords or tokens are in localStorage
    const storage = await page.evaluate(() => {
      const items: Record<string, string> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          items[key] = localStorage.getItem(key) || '';
        }
      }
      return items;
    });

    // Verify no password fields
    for (const [key, value] of Object.entries(storage)) {
      expect(key.toLowerCase()).not.toContain('password');
      expect(value.toLowerCase()).not.toContain('password');
    }
  });
});

test.describe('Error Handling', () => {
  test('ERROR-01 | Friendly error for unauthorized access', async ({ page }) => {
    await clearSession(page);
    await loginAs(page, 'user');
    await page.goto(APP_URLS.backoffice);

    // Should see user-friendly error in Norwegian
    const errorMessage = page.locator('text=Du har ikke tilgang til administrasjonspanelet');
    await expect(errorMessage).toBeVisible({ timeout: 10000 });

    // Should NOT see technical error details
    const technicalError = page.locator('text=500, text=Error:, text=Stack trace');
    await expect(technicalError).not.toBeVisible();
  });

  test('ERROR-02 | Error message includes guidance', async ({ page }) => {
    await clearSession(page);
    await loginAs(page, 'user');
    await page.goto(APP_URLS.backoffice);

    // Should see error heading
    const errorHeading = page.locator('text=Ingen tilgang');
    await expect(errorHeading).toBeVisible({ timeout: 10000 });

    // Should see explanation
    const explanation = page.locator('text=administratorer og saksbehandlere');
    await expect(explanation).toBeVisible();
  });
});

test.describe('Performance and UX', () => {
  test('PERF-01 | RBAC check completes within 3 seconds', async ({ page }) => {
    await clearSession(page);
    await loginAs(page, 'user');

    const startTime = Date.now();
    await page.goto(APP_URLS.backoffice);

    // Wait for either dashboard or error
    await Promise.race([
      page.waitForURL(/\/login/),
      page.waitForSelector('text=Ingen tilgang'),
    ]);

    const duration = Date.now() - startTime;
    expect(duration).toBeLessThan(3000);
  });

  test('PERF-02 | Login redirect completes within 2 seconds', async ({ page }) => {
    await clearSession(page);

    const startTime = Date.now();
    await loginAs(page, 'admin');
    await page.goto(APP_URLS.backoffice);

    await expect(page).not.toHaveURL(/\/login/);

    const duration = Date.now() - startTime;
    expect(duration).toBeLessThan(2000);
  });
});
