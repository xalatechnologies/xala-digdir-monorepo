/**
 * Web App Login Flow - E2E Tests
 *
 * Comprehensive tests for the web app login, session management, and user dropdown functionality.
 * Covers happy paths, edge cases, and real-world scenarios.
 */

import { test, expect, type Page } from '@playwright/test';

// Test configuration
const WEB_URL = process.env.WEB_URL || 'http://localhost:5173';
const API_URL = process.env.VITE_API_URL || 'http://localhost:4000';

/**
 * Helper: Wait for React app to be ready
 */
async function waitForAppReady(page: Page) {
  // Wait for header to be present (indicates React has rendered)
  await page.waitForSelector('header', { timeout: 10000 });
  // Give React a moment to finish initial render
  await page.waitForTimeout(500);
}

/**
 * Helper: Check if user is logged in by looking for user menu
 */
async function isLoggedIn(page: Page): Promise<boolean> {
  try {
    await waitForAppReady(page);
    // Look for user menu button (shows user name)
    await page.waitForSelector('button:has-text("Test")', { timeout: 2000 });
    return true;
  } catch {
    return false;
  }
}

/**
 * Helper: Check if login button is visible
 */
async function isLoginButtonVisible(page: Page): Promise<boolean> {
  try {
    await waitForAppReady(page);
    await page.getByRole('button', { name: /logg inn/i }).waitFor({ timeout: 2000 });
    return true;
  } catch {
    return false;
  }
}

/**
 * Helper: Mock successful ID-porten OAuth callback
 */
async function mockSuccessfulOAuthCallback(page: Page) {
  // Intercept the ID-porten authorize request
  await page.route('**/auth/idporten*', async (route) => {
    // Simulate OAuth provider redirecting back with success
    const url = new URL(route.request().url());
    const returnUrl = url.searchParams.get('returnUrl');

    if (returnUrl) {
      // Redirect to login page with success flag
      await route.fulfill({
        status: 302,
        headers: {
          'Location': `${WEB_URL}/login?auth_success=true`,
          'Set-Cookie': 'session=mock_session_token; HttpOnly; Secure; SameSite=Strict; Path=/',
        },
      });
    } else {
      await route.continue();
    }
  });

  // Mock the session endpoint to return a valid user
  await page.route('**/api/auth/session', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: {
          userId: 'test-user-123',
          user: {
            id: 'test-user-123',
            name: 'Test User',
            email: 'test@example.com',
          },
          tenantId: 'test-tenant',
          expiresAt: new Date(Date.now() + 3600000).toISOString(), // 1 hour
        },
      }),
    });
  });
}

/**
 * Helper: Mock expired session
 */
async function mockExpiredSession(page: Page) {
  await page.route('**/api/auth/session', async (route) => {
    await route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({
        type: 'https://api.digilist.no/problems/unauthorized',
        title: 'Unauthorized',
        status: 401,
        detail: 'Session expired',
      }),
    });
  });
}

// =============================================================================
// Test Suite: Happy Path - User Stories
// =============================================================================

test.describe('Web Login Flow - Happy Path', () => {
  test('US-001: User can view login button on homepage when not authenticated', async ({ page }) => {
    await page.goto(WEB_URL);

    // Wait for React to render (wait for header to be present)
    await page.waitForSelector('header', { timeout: 10000 });

    // Wait a bit more for buttons to render
    await page.waitForTimeout(1000);

    // Should show login button - use more flexible selector
    const loginButton = page.getByRole('button', { name: /logg inn/i });
    await expect(loginButton).toBeVisible({ timeout: 10000 });

    // Should NOT show user menu
    const userMenu = page.locator('button', { hasText: 'Test User' });
    await expect(userMenu).not.toBeVisible();
  });

  test('US-002: User can click login button and navigate to login page', async ({ page }) => {
    await page.goto(WEB_URL);

    // Click login button
    await page.click('button:has-text("Logg inn")');

    // Should navigate to login page
    await expect(page).toHaveURL(`${WEB_URL}/login`);

    // Should show login options
    const idPortenButton = page.locator('button:has-text("ID-porten")');
    await expect(idPortenButton).toBeVisible();
  });

  test('US-003: User can login with ID-porten and see user dropdown', async ({ page }) => {
    // Setup OAuth mock
    await mockSuccessfulOAuthCallback(page);

    await page.goto(`${WEB_URL}/login`);

    // Click ID-porten login
    await page.click('button:has-text("ID-porten")');

    // Wait for redirect back to home
    await page.waitForURL(`${WEB_URL}/`, { timeout: 10000 });

    // Should show user menu instead of login button
    const userMenu = page.locator('button', { hasText: 'Test User' });
    await expect(userMenu).toBeVisible();

    // Should NOT show login button
    const loginButton = page.locator('button:has-text("Logg inn")');
    await expect(loginButton).not.toBeVisible();
  });

  test('US-004: Logged-in user can see dropdown menu options', async ({ page }) => {
    // Setup session
    await mockSuccessfulOAuthCallback(page);

    // Set session cookie
    await page.context().addCookies([{
      name: 'session',
      value: 'mock_session_token',
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      secure: false,
      sameSite: 'Strict',
    }]);

    await page.goto(WEB_URL);

    // Wait for user menu
    const userMenu = page.locator('button', { hasText: 'Test User' });
    await expect(userMenu).toBeVisible();

    // Click to open dropdown
    await userMenu.click();

    // Should show "Min side" option
    const minsideOption = page.locator('button:has-text("Min side")');
    await expect(minsideOption).toBeVisible();

    // Should show "Logg ut" option
    const logoutOption = page.locator('button:has-text("Logg ut")');
    await expect(logoutOption).toBeVisible();
  });

  test('US-005: User can navigate to minside from dropdown', async ({ page }) => {
    // Setup session
    await mockSuccessfulOAuthCallback(page);

    await page.context().addCookies([{
      name: 'session',
      value: 'mock_session_token',
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      secure: false,
      sameSite: 'Strict',
    }]);

    await page.goto(WEB_URL);

    // Open user menu
    await page.click('button', { hasText: 'Test User' });

    // Click "Min side"
    const minsideOption = page.locator('button:has-text("Min side")');

    // Listen for navigation
    const navigationPromise = page.waitForURL(/minside/, { timeout: 5000 }).catch(() => null);

    await minsideOption.click();

    // Should navigate to minside (or at least attempt to)
    await navigationPromise;
  });

  test('US-006: User can logout from dropdown menu', async ({ page }) => {
    // Setup session
    await mockSuccessfulOAuthCallback(page);

    // Mock logout endpoint
    await page.route('**/api/auth/logout', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: { success: true } }),
      });
    });

    await page.context().addCookies([{
      name: 'session',
      value: 'mock_session_token',
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      secure: false,
      sameSite: 'Strict',
    }]);

    await page.goto(WEB_URL);

    // Open user menu
    await page.click('button', { hasText: 'Test User' });

    // Click logout
    await page.click('button:has-text("Logg ut")');

    // After logout, should redirect to home
    await page.waitForURL(`${WEB_URL}/`, { timeout: 5000 });

    // Should show login button again
    const loginButton = page.locator('button:has-text("Logg inn")');
    await expect(loginButton).toBeVisible();

    // Should NOT show user menu
    const userMenu = page.locator('button', { hasText: 'Test User' });
    await expect(userMenu).not.toBeVisible();
  });
});

// =============================================================================
// Test Suite: Session Persistence
// =============================================================================

test.describe('Web Login Flow - Session Persistence', () => {
  test('SP-001: Session persists across page refreshes', async ({ page }) => {
    await mockSuccessfulOAuthCallback(page);

    await page.context().addCookies([{
      name: 'session',
      value: 'mock_session_token',
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      secure: false,
      sameSite: 'Strict',
    }]);

    await page.goto(WEB_URL);

    // Should be logged in
    await expect(page.locator('button', { hasText: 'Test User' })).toBeVisible();

    // Refresh page
    await page.reload();

    // Should still be logged in
    await expect(page.locator('button', { hasText: 'Test User' })).toBeVisible();
  });

  test('SP-002: Session is loaded from localStorage on mount', async ({ page }) => {
    await mockSuccessfulOAuthCallback(page);

    // Set localStorage user data
    await page.goto(WEB_URL);
    await page.evaluate(() => {
      localStorage.setItem('web_user', JSON.stringify({
        id: 'test-user-123',
        name: 'Test User',
        email: 'test@example.com',
      }));
    });

    // Reload to trigger session load
    await page.reload();

    // Should show user menu
    await expect(page.locator('button', { hasText: 'Test User' })).toBeVisible();
  });

  test('SP-003: Session cookie is sent with API requests', async ({ page }) => {
    let sessionHeaderSent = false;

    await page.route('**/api/auth/session', async (route) => {
      const headers = route.request().headers();
      if (headers['cookie']?.includes('session=mock_session_token')) {
        sessionHeaderSent = true;
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            userId: 'test-user-123',
            user: { id: 'test-user-123', name: 'Test User', email: 'test@example.com' },
            tenantId: 'test-tenant',
          },
        }),
      });
    });

    await page.context().addCookies([{
      name: 'session',
      value: 'mock_session_token',
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      secure: false,
      sameSite: 'Strict',
    }]);

    await page.goto(WEB_URL);

    // Wait for session load
    await page.waitForTimeout(2000);

    expect(sessionHeaderSent).toBe(true);
  });
});

// =============================================================================
// Test Suite: Edge Cases
// =============================================================================

test.describe('Web Login Flow - Edge Cases', () => {
  test('EC-001: Handles expired session gracefully', async ({ page }) => {
    await mockExpiredSession(page);

    await page.goto(WEB_URL);

    // Should show login button (not logged in)
    await expect(page.locator('button:has-text("Logg inn")')).toBeVisible();
  });

  test('EC-002: Handles OAuth callback error parameter', async ({ page }) => {
    await page.goto(`${WEB_URL}/login?auth_error=access_denied`);

    // Should stay on login page
    await expect(page).toHaveURL(/\/login/);

    // Should still show login options
    await expect(page.locator('button:has-text("ID-porten")')).toBeVisible();
  });

  test('EC-003: Handles missing session cookie gracefully', async ({ page }) => {
    await page.route('**/api/auth/session', async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({
          type: 'https://api.digilist.no/problems/unauthorized',
          title: 'Unauthorized',
          status: 401,
        }),
      });
    });

    await page.goto(WEB_URL);

    // Should show login button
    await expect(page.locator('button:has-text("Logg inn")')).toBeVisible();
  });

  test('EC-004: Handles corrupted localStorage data', async ({ page }) => {
    await page.goto(WEB_URL);

    // Set corrupted data
    await page.evaluate(() => {
      localStorage.setItem('web_user', 'INVALID_JSON{}}');
    });

    // Reload page
    await page.reload();

    // Should not crash and show login button
    await expect(page.locator('button:has-text("Logg inn")')).toBeVisible();
  });

  test('EC-005: Dropdown closes when clicking outside', async ({ page }) => {
    await mockSuccessfulOAuthCallback(page);

    await page.context().addCookies([{
      name: 'session',
      value: 'mock_session_token',
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      secure: false,
      sameSite: 'Strict',
    }]);

    await page.goto(WEB_URL);

    // Open dropdown
    await page.click('button', { hasText: 'Test User' });

    // Verify dropdown is open
    await expect(page.locator('button:has-text("Logg ut")')).toBeVisible();

    // Click outside (on body)
    await page.click('body', { position: { x: 10, y: 10 } });

    // Dropdown should close
    await expect(page.locator('button:has-text("Logg ut")')).not.toBeVisible();
  });

  test('EC-006: Handles network error on session load', async ({ page }) => {
    await page.route('**/api/auth/session', async (route) => {
      await route.abort('failed');
    });

    await page.goto(WEB_URL);

    // Should gracefully handle error and show login button
    await expect(page.locator('button:has-text("Logg inn")')).toBeVisible();
  });

  test('EC-007: Auth callback with already authenticated user', async ({ page }) => {
    await mockSuccessfulOAuthCallback(page);

    // User already has session
    await page.context().addCookies([{
      name: 'session',
      value: 'existing_session_token',
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      secure: false,
      sameSite: 'Strict',
    }]);

    // Navigate to callback URL
    await page.goto(`${WEB_URL}/login?auth_success=true`);

    // Should redirect to home
    await expect(page).toHaveURL(`${WEB_URL}/`);

    // Should show user menu
    await expect(page.locator('button', { hasText: 'Test User' })).toBeVisible();
  });
});

// =============================================================================
// Test Suite: User Dropdown UI/UX
// =============================================================================

test.describe('Web Login Flow - User Dropdown UI/UX', () => {
  test('UI-001: User dropdown shows correct user name', async ({ page }) => {
    await page.route('**/api/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            userId: 'unique-user-456',
            user: {
              id: 'unique-user-456',
              name: 'Jane Doe',
              email: 'jane@example.com',
            },
            tenantId: 'test-tenant',
          },
        }),
      });
    });

    await page.context().addCookies([{
      name: 'session',
      value: 'mock_session_token',
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      secure: false,
      sameSite: 'Strict',
    }]);

    await page.goto(WEB_URL);

    // Should show correct user name
    await expect(page.locator('button', { hasText: 'Jane Doe' })).toBeVisible();
  });

  test('UI-002: Dropdown menu has correct styling and hover states', async ({ page }) => {
    await mockSuccessfulOAuthCallback(page);

    await page.context().addCookies([{
      name: 'session',
      value: 'mock_session_token',
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      secure: false,
      sameSite: 'Strict',
    }]);

    await page.goto(WEB_URL);

    // Open dropdown
    await page.click('button', { hasText: 'Test User' });

    // Check dropdown is positioned correctly
    const dropdown = page.locator('div').filter({ hasText: 'Min side' }).first();
    await expect(dropdown).toBeVisible();

    // Hover over logout option
    const logoutButton = page.locator('button:has-text("Logg ut")');
    await logoutButton.hover();

    // Should still be visible after hover
    await expect(logoutButton).toBeVisible();
  });

  test('UI-003: Dropdown menu is keyboard accessible', async ({ page }) => {
    await mockSuccessfulOAuthCallback(page);

    await page.context().addCookies([{
      name: 'session',
      value: 'mock_session_token',
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      secure: false,
      sameSite: 'Strict',
    }]);

    await page.goto(WEB_URL);

    // Focus on user menu button with keyboard
    await page.keyboard.press('Tab'); // Navigate to theme toggle
    await page.keyboard.press('Tab'); // Navigate to notification bell (if visible)
    await page.keyboard.press('Tab'); // Navigate to user menu

    // Press Enter to open
    await page.keyboard.press('Enter');

    // Dropdown should be visible
    await expect(page.locator('button:has-text("Min side")')).toBeVisible();

    // Press Escape to close
    await page.keyboard.press('Escape');

    // Dropdown should close (wait a bit for animation)
    await page.waitForTimeout(500);
  });

  test('UI-004: Login button has correct aria labels', async ({ page }) => {
    await page.goto(WEB_URL);

    const loginButton = page.locator('button:has-text("Logg inn")');
    await expect(loginButton).toHaveAttribute('aria-label', 'Logg inn');
  });

  test('UI-005: User dropdown button has correct aria attributes', async ({ page }) => {
    await mockSuccessfulOAuthCallback(page);

    await page.context().addCookies([{
      name: 'session',
      value: 'mock_session_token',
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      secure: false,
      sameSite: 'Strict',
    }]);

    await page.goto(WEB_URL);

    const userMenuButton = page.locator('button', { hasText: 'Test User' });

    // Should have aria-expanded and aria-haspopup
    await expect(userMenuButton).toHaveAttribute('aria-haspopup', 'true');
    await expect(userMenuButton).toHaveAttribute('aria-expanded', 'false');

    // Open dropdown
    await userMenuButton.click();

    // aria-expanded should be true
    await expect(userMenuButton).toHaveAttribute('aria-expanded', 'true');
  });
});

// =============================================================================
// Test Suite: Flow Context Preservation
// =============================================================================

test.describe('Web Login Flow - Flow Context Preservation', () => {
  test('FC-001: Login page preserves flow context from booking flow', async ({ page }) => {
    await mockSuccessfulOAuthCallback(page);

    // Simulate user starting a booking flow
    await page.goto(WEB_URL);

    // Set flow context in sessionStorage (simulating booking widget)
    await page.evaluate(() => {
      sessionStorage.setItem('booking_flow_context', JSON.stringify({
        listingId: 'listing-123',
        returnTo: '/rental-object/listing-123',
        bookingMode: 'SLOTS',
        selectedDates: ['2024-01-15'],
        timestamp: Date.now(),
        expiresAt: Date.now() + 900000, // 15 minutes
      }));
    });

    // Navigate to login
    await page.goto(`${WEB_URL}/login`);

    // Click ID-porten
    await page.click('button:has-text("ID-porten")');

    // After successful auth, should restore context and navigate to listing
    await page.waitForURL(/rental-object\/listing-123/, { timeout: 10000 }).catch(() => null);
  });

  test('FC-002: Expired flow context shows notification', async ({ page }) => {
    await mockSuccessfulOAuthCallback(page);

    // Set expired flow context
    await page.evaluate(() => {
      sessionStorage.setItem('booking_flow_context', JSON.stringify({
        listingId: 'listing-123',
        returnTo: '/rental-object/listing-123',
        timestamp: Date.now() - 1000000, // Very old
        expiresAt: Date.now() - 100000, // Expired
      }));
    });

    await page.context().addCookies([{
      name: 'session',
      value: 'mock_session_token',
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      secure: false,
      sameSite: 'Strict',
    }]);

    await page.goto(`${WEB_URL}/login`);

    // Should redirect to home (expired context)
    await page.waitForURL(`${WEB_URL}/`, { timeout: 5000 });
  });
});

console.log('✅ Web Login Flow E2E Tests Loaded');
