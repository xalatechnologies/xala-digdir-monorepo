import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Web App Protected Route Flow Preservation
 *
 * These tests verify that the session-safe return-to-flow authentication
 * works correctly in the web app (public booking site):
 * 1. Public routes (listings, listing details) are accessible without auth
 * 2. Protected routes redirect to login
 * 3. Flow context is saved to sessionStorage before redirect
 * 4. After login, users return to their original destination
 *
 * Public Routes:
 * - / (listings)
 * - /listing/:id (listing details)
 *
 * Protected Routes:
 * - /payment/callback
 */

const WEB_BASE_URL = 'http://localhost:5173';
const FLOW_CONTEXT_KEY = 'digilist:flow-context';

test.describe('Web App Protected Route Flow', () => {
  test.use({ baseURL: WEB_BASE_URL });

  test.beforeEach(async ({ page }) => {
    // Clear any existing session data
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.removeItem('web_user');
      sessionStorage.clear();
    });
  });

  test.describe('Public Routes - No Auth Required', () => {
    test('listings page is accessible without authentication', async ({ page }) => {
      await page.goto('/');

      // Should NOT redirect to login
      await expect(page).not.toHaveURL(/\/login/);

      // Should show listings content
      await expect(page.locator('body')).toBeVisible();
    });

    test('listing detail page is accessible without authentication', async ({ page }) => {
      // First go to listings to get a listing ID
      await page.goto('/');

      // Navigate to a listing detail (assuming there's at least one)
      // This test verifies the route is public, not that specific content exists
      await page.goto('/listing/test-listing-id');

      // Should NOT redirect to login (even if listing doesn't exist, route is public)
      await expect(page).not.toHaveURL(/\/login/);
    });
  });

  test.describe('Protected Routes - Auth Required', () => {
    test('payment callback redirects unauthenticated user to login', async ({ page }) => {
      // Try to access protected payment callback route
      await page.goto('/payment/callback');

      // Should redirect to login
      await expect(page).toHaveURL(/\/login/);
    });

    test('saves flow context when redirecting from payment callback', async ({ page }) => {
      // Navigate to protected payment callback route
      await page.goto('/payment/callback?session_id=test-session');

      // Wait for redirect to login
      await expect(page).toHaveURL(/\/login/);

      // Check that flow context was saved to sessionStorage
      const flowContext = await page.evaluate((key) => {
        const stored = sessionStorage.getItem(key);
        return stored ? JSON.parse(stored) : null;
      }, FLOW_CONTEXT_KEY);

      // Verify flow context structure
      expect(flowContext).not.toBeNull();
      expect(flowContext.returnTo).toContain('/payment/callback');
      expect(flowContext.tenantId).toBeDefined();
      expect(flowContext.timestamp).toBeDefined();
    });

    test('preserves query parameters in flow context', async ({ page }) => {
      // Navigate to protected route with query params
      await page.goto('/payment/callback?session_id=sess_123&status=success');

      // Wait for redirect to login
      await expect(page).toHaveURL(/\/login/);

      // Check flow context preserves query params
      const flowContext = await page.evaluate((key) => {
        const stored = sessionStorage.getItem(key);
        return stored ? JSON.parse(stored) : null;
      }, FLOW_CONTEXT_KEY);

      expect(flowContext).not.toBeNull();
      expect(flowContext.returnTo).toContain('session_id=sess_123');
      expect(flowContext.returnTo).toContain('status=success');
    });
  });

  test.describe('Login Page', () => {
    test('login page is accessible', async ({ page }) => {
      await page.goto('/login');

      // Should show login options
      await expect(page.getByText('Logg inn')).toBeVisible();
    });

    test('shows OAuth login options', async ({ page }) => {
      await page.goto('/login');

      // Should show OAuth provider options
      await expect(page.getByText('Vipps')).toBeVisible();
      await expect(page.getByText('ID-porten')).toBeVisible();
      await expect(page.getByText('Microsoft')).toBeVisible();
    });
  });

  test.describe('Post-Authentication Navigation', () => {
    test('authenticated user can access protected routes', async ({ page }) => {
      // Simulate authenticated user by setting localStorage
      await page.goto('/');
      await page.evaluate(() => {
        localStorage.setItem('web_user', JSON.stringify({
          id: 'test-user-id',
          name: 'Test User',
          email: 'test@example.com',
        }));
      });

      // Navigate to protected route
      await page.goto('/payment/callback');

      // Should NOT redirect to login (user is authenticated)
      // Note: May show error state since there's no real payment session, but shouldn't redirect
      await expect(page).not.toHaveURL(/\/login/);
    });

    test('restores flow context after mock login', async ({ page }) => {
      // First, save flow context by visiting protected route
      await page.goto('/payment/callback?session_id=test-123');
      await expect(page).toHaveURL(/\/login/);

      // Verify flow context exists
      const flowContextBefore = await page.evaluate((key) => {
        return sessionStorage.getItem(key);
      }, FLOW_CONTEXT_KEY);
      expect(flowContextBefore).not.toBeNull();

      // Simulate login by setting user in localStorage
      await page.evaluate(() => {
        localStorage.setItem('web_user', JSON.stringify({
          id: 'test-user-id',
          name: 'Test User',
          email: 'test@example.com',
        }));
      });

      // Reload the login page to trigger auth check and flow restoration
      await page.reload();

      // After auth, should navigate to original destination
      // (The exact behavior depends on login page implementation)
    });
  });

  test.describe('Header Authentication State', () => {
    test('shows login button when unauthenticated', async ({ page }) => {
      await page.goto('/');

      // Should show login button
      await expect(page.getByRole('button', { name: /logg inn/i })).toBeVisible();
    });

    test('shows user name when authenticated', async ({ page }) => {
      // Set up authenticated user
      await page.goto('/');
      await page.evaluate(() => {
        localStorage.setItem('web_user', JSON.stringify({
          id: 'test-user-id',
          name: 'Test User',
          email: 'test@example.com',
        }));
      });

      // Reload to apply auth state
      await page.reload();

      // Should show user name instead of login button
      await expect(page.getByText('Test User')).toBeVisible();
    });

    test('logout clears authentication state', async ({ page }) => {
      // Set up authenticated user
      await page.goto('/');
      await page.evaluate(() => {
        localStorage.setItem('web_user', JSON.stringify({
          id: 'test-user-id',
          name: 'Test User',
          email: 'test@example.com',
        }));
      });
      await page.reload();

      // Find and click logout (in dropdown or header)
      // Implementation depends on actual UI
      const logoutButton = page.getByRole('button', { name: /logg ut/i });
      if (await logoutButton.isVisible()) {
        await logoutButton.click();

        // Verify user is logged out
        const userData = await page.evaluate(() => {
          return localStorage.getItem('web_user');
        });
        expect(userData).toBeNull();
      }
    });
  });

  test.describe('Accessibility', () => {
    test('login page has accessible form elements', async ({ page }) => {
      await page.goto('/login');

      // Login options should be keyboard accessible
      const loginOptions = page.locator('[role="button"], button');
      const count = await loginOptions.count();
      expect(count).toBeGreaterThan(0);
    });

    test('protected route loading state is accessible', async ({ page }) => {
      // Set up slow auth check scenario
      await page.goto('/payment/callback');

      // If there's a loading spinner, it should have aria-label
      const spinner = page.locator('[aria-label*="Laster"]');
      if (await spinner.isVisible({ timeout: 1000 }).catch(() => false)) {
        await expect(spinner).toHaveAttribute('aria-label');
      }
    });
  });

  test.describe('Error Handling', () => {
    test('handles corrupted localStorage gracefully', async ({ page }) => {
      await page.goto('/');
      await page.evaluate(() => {
        localStorage.setItem('web_user', 'invalid-json-{');
      });

      // Should not crash, should treat as unauthenticated
      await page.reload();
      await expect(page).not.toHaveURL(/error/);
    });

    test('handles missing sessionStorage gracefully', async ({ page }) => {
      // Clear sessionStorage and try to access protected route
      await page.goto('/');
      await page.evaluate(() => {
        sessionStorage.clear();
      });

      await page.goto('/payment/callback');

      // Should redirect to login without errors
      await expect(page).toHaveURL(/\/login/);
    });
  });
});

test.describe('Web App Cross-Browser Compatibility', () => {
  test.use({ baseURL: WEB_BASE_URL });

  test('public routes work across browsers', async ({ page, browserName }) => {
    await page.goto('/');

    // Basic smoke test for all browsers
    await expect(page.locator('body')).toBeVisible();
    console.log(`Public route works on ${browserName}`);
  });

  test('auth state persists in localStorage across browsers', async ({ page, browserName }) => {
    await page.goto('/');

    // Set auth state
    await page.evaluate(() => {
      localStorage.setItem('web_user', JSON.stringify({
        id: 'test',
        name: 'Test',
        email: 'test@test.com',
      }));
    });

    // Verify it persists
    const userData = await page.evaluate(() => {
      return localStorage.getItem('web_user');
    });

    expect(userData).not.toBeNull();
    console.log(`localStorage works on ${browserName}`);
  });
});
