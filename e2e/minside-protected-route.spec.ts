import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Minside Protected Route Flow Preservation
 *
 * These tests verify that the session-safe return-to-flow authentication
 * works correctly in the minside app (user dashboard):
 * 1. Unauthenticated users are redirected to login
 * 2. Flow context is saved to sessionStorage before redirect
 * 3. After login, users return to their original destination
 * 4. Full navigation context is preserved (path, search params, state)
 *
 * @see spec: 038-session-safe-return-to-flow-authentication
 * @see subtask: 8-3 - Verify minside protected route flow preservation
 */

const MINSIDE_BASE_URL = 'http://localhost:5174';
const FLOW_CONTEXT_KEY = 'digilist:flow-context';

test.describe('Minside Protected Route Flow Preservation', () => {
  // Use minside URL instead of default web app
  test.use({ baseURL: MINSIDE_BASE_URL });

  test.beforeEach(async ({ page }) => {
    // Clear any existing session data
    await page.goto('/login');
    await page.evaluate(() => {
      localStorage.removeItem('backoffice_mock_user');
      localStorage.removeItem('minside_user');
      localStorage.removeItem('minside_token');
      sessionStorage.clear();
    });
  });

  test.describe('Redirect to Login', () => {
    test('redirects unauthenticated user from dashboard to login', async ({ page }) => {
      // Try to access protected dashboard route
      await page.goto('/');

      // Should redirect to login
      await expect(page).toHaveURL(/\/login/);
    });

    test('redirects unauthenticated user from bookings route to login', async ({ page }) => {
      // Try to access protected bookings route
      await page.goto('/bookings');

      // Should redirect to login
      await expect(page).toHaveURL(/\/login/);
    });

    test('redirects unauthenticated user from profile route to login', async ({ page }) => {
      // Try to access protected profile route
      await page.goto('/profile');

      // Should redirect to login
      await expect(page).toHaveURL(/\/login/);
    });

    test('redirects unauthenticated user from settings route to login', async ({ page }) => {
      // Try to access protected settings route
      await page.goto('/settings');

      // Should redirect to login
      await expect(page).toHaveURL(/\/login/);
    });
  });

  test.describe('Flow Context Persistence', () => {
    test('saves flow context to sessionStorage when redirecting to login', async ({ page }) => {
      // Navigate to a protected route
      await page.goto('/bookings');

      // Wait for redirect to login
      await expect(page).toHaveURL(/\/login/);

      // Check that flow context was saved to sessionStorage
      const flowContext = await page.evaluate((key) => {
        const stored = sessionStorage.getItem(key);
        return stored ? JSON.parse(stored) : null;
      }, FLOW_CONTEXT_KEY);

      // Verify flow context structure
      expect(flowContext).not.toBeNull();
      expect(flowContext.returnTo).toBe('/bookings');
      expect(flowContext.tenantId).toBeDefined();
      expect(flowContext.timestamp).toBeDefined();
      expect(flowContext.correlationId).toBeDefined();
    });

    test('preserves query parameters in flow context', async ({ page }) => {
      // Navigate to protected route with query params
      await page.goto('/bookings?status=pending&page=2');

      // Wait for redirect to login
      await expect(page).toHaveURL(/\/login/);

      // Check flow context
      const flowContext = await page.evaluate((key) => {
        const stored = sessionStorage.getItem(key);
        return stored ? JSON.parse(stored) : null;
      }, FLOW_CONTEXT_KEY);

      // Verify query params are preserved
      expect(flowContext).not.toBeNull();
      expect(flowContext.returnTo).toBe('/bookings?status=pending&page=2');
    });

    test('preserves nested route path in flow context', async ({ page }) => {
      // Navigate to nested protected route
      await page.goto('/profile/edit');

      // Wait for redirect to login
      await expect(page).toHaveURL(/\/login/);

      // Check flow context
      const flowContext = await page.evaluate((key) => {
        const stored = sessionStorage.getItem(key);
        return stored ? JSON.parse(stored) : null;
      }, FLOW_CONTEXT_KEY);

      // Verify nested route is preserved
      expect(flowContext).not.toBeNull();
      expect(flowContext.returnTo).toBe('/profile/edit');
    });

    test('saves flow context with minside tenant ID', async ({ page }) => {
      // Navigate to protected route
      await page.goto('/bookings');

      // Wait for redirect to login
      await expect(page).toHaveURL(/\/login/);

      // Check flow context tenant
      const flowContext = await page.evaluate((key) => {
        const stored = sessionStorage.getItem(key);
        return stored ? JSON.parse(stored) : null;
      }, FLOW_CONTEXT_KEY);

      // Verify tenant ID is set (should be 'minside' or from env)
      expect(flowContext).not.toBeNull();
      expect(flowContext.tenantId).toBeDefined();
    });
  });

  test.describe('Post-Login Navigation', () => {
    test('returns to dashboard after login when no flow context', async ({ page }) => {
      // Go directly to login (not via redirect)
      await page.goto('/login');

      // Clear any flow context
      await page.evaluate((key) => {
        sessionStorage.removeItem(key);
      }, FLOW_CONTEXT_KEY);

      // Click ID-porten login (mock auth)
      const idPortenButton = page.getByRole('button', { name: /id-porten/i }).first();
      await idPortenButton.click();

      // Should navigate to dashboard (default)
      await expect(page).toHaveURL('/');
    });

    test('returns to original protected route after login', async ({ page }) => {
      // Navigate to protected route (will redirect to login)
      await page.goto('/bookings');

      // Wait for redirect
      await expect(page).toHaveURL(/\/login/);

      // Verify flow context exists
      const hasFlowContext = await page.evaluate((key) => {
        return sessionStorage.getItem(key) !== null;
      }, FLOW_CONTEXT_KEY);
      expect(hasFlowContext).toBe(true);

      // Complete login (mock auth with ID-porten)
      const idPortenButton = page.getByRole('button', { name: /id-porten/i }).first();
      await idPortenButton.click();

      // Should return to original route
      await expect(page).toHaveURL('/bookings');

      // Flow context should be cleared after restoration
      const flowContextAfterLogin = await page.evaluate((key) => {
        return sessionStorage.getItem(key);
      }, FLOW_CONTEXT_KEY);
      expect(flowContextAfterLogin).toBeNull();
    });

    test('returns to profile route after login', async ({ page }) => {
      // Navigate to protected profile route
      await page.goto('/profile');

      // Wait for redirect
      await expect(page).toHaveURL(/\/login/);

      // Complete login
      const idPortenButton = page.getByRole('button', { name: /id-porten/i }).first();
      await idPortenButton.click();

      // Should return to profile route
      await expect(page).toHaveURL('/profile');
    });

    test('returns to settings route after login', async ({ page }) => {
      // Navigate to protected settings route
      await page.goto('/settings');

      // Wait for redirect
      await expect(page).toHaveURL(/\/login/);

      // Complete login
      const vippsButton = page.getByRole('button', { name: /vipps/i }).first();
      await vippsButton.click();

      // Should return to settings route
      await expect(page).toHaveURL('/settings');
    });
  });

  test.describe('Flow Context Expiration', () => {
    test('handles expired flow context gracefully', async ({ page }) => {
      // Go to login
      await page.goto('/login');

      // Manually set an expired flow context
      const expiredContext = {
        returnTo: '/bookings',
        tenantId: 'minside',
        timestamp: Date.now() - (31 * 60 * 1000), // 31 minutes ago (expired)
        correlationId: 'test-correlation-id',
      };
      await page.evaluate((ctx) => {
        sessionStorage.setItem('digilist:flow-context', JSON.stringify(ctx));
      }, expiredContext);

      // Complete login
      const idPortenButton = page.getByRole('button', { name: /id-porten/i }).first();
      await idPortenButton.click();

      // Should navigate to home (expired context discarded)
      await expect(page).toHaveURL('/');
    });

    test('clears expired flow context after detection', async ({ page }) => {
      // Go to login
      await page.goto('/login');

      // Set expired flow context
      const expiredContext = {
        returnTo: '/profile',
        tenantId: 'minside',
        timestamp: Date.now() - (32 * 60 * 1000), // 32 minutes ago
        correlationId: 'expired-correlation-id',
      };
      await page.evaluate((ctx) => {
        sessionStorage.setItem('digilist:flow-context', JSON.stringify(ctx));
      }, expiredContext);

      // Complete login
      const idPortenButton = page.getByRole('button', { name: /id-porten/i }).first();
      await idPortenButton.click();

      // Wait for navigation
      await expect(page).toHaveURL('/');

      // Verify flow context was cleared
      const flowContextAfter = await page.evaluate((key) => {
        return sessionStorage.getItem(key);
      }, FLOW_CONTEXT_KEY);
      expect(flowContextAfter).toBeNull();
    });
  });

  test.describe('Login Page UI', () => {
    test('login page renders correctly with all providers', async ({ page }) => {
      await page.goto('/login');

      // Should see login layout
      const loginTitle = page.getByRole('heading', { level: 1 });
      await expect(loginTitle).toBeVisible();

      // Should see ID-porten option
      const idPortenButton = page.getByRole('button', { name: /id-porten/i }).first();
      await expect(idPortenButton).toBeVisible();

      // Should see Vipps option
      const vippsButton = page.getByRole('button', { name: /vipps/i }).first();
      await expect(vippsButton).toBeVisible();

      // Should see Microsoft option
      const microsoftButton = page.getByRole('button', { name: /microsoft/i }).first();
      await expect(microsoftButton).toBeVisible();
    });

    test('login page displays MIN SIDE branding', async ({ page }) => {
      await page.goto('/login');

      // Should see MIN SIDE branding
      const panelTitle = page.getByText('MIN SIDE');
      await expect(panelTitle.first()).toBeVisible();
    });
  });

  test.describe('Authentication Flow', () => {
    test('already authenticated users are redirected from login', async ({ page }) => {
      // First login
      await page.goto('/login');
      const idPortenButton = page.getByRole('button', { name: /id-porten/i }).first();
      await idPortenButton.click();

      // Should be on dashboard
      await expect(page).toHaveURL('/');

      // Try to access login again
      await page.goto('/login');

      // Should be redirected away from login (to dashboard)
      await expect(page).toHaveURL('/');
    });

    test('logout clears flow context', async ({ page }) => {
      // Login first
      await page.goto('/login');
      const idPortenButton = page.getByRole('button', { name: /id-porten/i }).first();
      await idPortenButton.click();
      await expect(page).toHaveURL('/');

      // Set some flow context manually (simulating partial booking flow)
      await page.evaluate((key) => {
        const ctx = {
          returnTo: '/bookings',
          tenantId: 'minside',
          timestamp: Date.now(),
          correlationId: 'test-123',
        };
        sessionStorage.setItem(key, JSON.stringify(ctx));
      }, FLOW_CONTEXT_KEY);

      // Find and click logout (usually in a menu or header)
      // Note: This depends on the specific UI - adjust selector as needed
      const logoutButton = page.getByRole('button', { name: /logg ut/i }).first();
      if (await logoutButton.isVisible()) {
        await logoutButton.click();

        // Should be on login page
        await expect(page).toHaveURL(/\/login/);

        // Flow context should be cleared
        const flowContextAfterLogout = await page.evaluate((key) => {
          return sessionStorage.getItem(key);
        }, FLOW_CONTEXT_KEY);
        expect(flowContextAfterLogout).toBeNull();
      }
    });
  });

  test.describe('Multiple Login Providers', () => {
    test('ID-porten login preserves flow context', async ({ page }) => {
      // Navigate to protected route
      await page.goto('/profile');
      await expect(page).toHaveURL(/\/login/);

      // Login with ID-porten
      const idPortenButton = page.getByRole('button', { name: /id-porten/i }).first();
      await idPortenButton.click();

      // Should return to original route
      await expect(page).toHaveURL('/profile');
    });

    test('Vipps login preserves flow context', async ({ page }) => {
      // Navigate to protected route
      await page.goto('/bookings');
      await expect(page).toHaveURL(/\/login/);

      // Login with Vipps
      const vippsButton = page.getByRole('button', { name: /vipps/i }).first();
      await vippsButton.click();

      // Should return to original route
      await expect(page).toHaveURL('/bookings');
    });

    test('Microsoft login preserves flow context', async ({ page }) => {
      // Navigate to protected route
      await page.goto('/settings');
      await expect(page).toHaveURL(/\/login/);

      // Login with Microsoft
      const microsoftButton = page.getByRole('button', { name: /microsoft/i }).first();
      await microsoftButton.click();

      // Should return to original route
      await expect(page).toHaveURL('/settings');
    });
  });
});

test.describe('Cross-Tab Synchronization', () => {
  test.use({ baseURL: MINSIDE_BASE_URL });

  test('flow context is isolated to individual browser sessions', async ({ browser }) => {
    // Create two browser contexts (simulating two different sessions)
    const context1 = await browser.newContext();
    const context2 = await browser.newContext({ storageState: undefined });

    const page1 = await context1.newPage();
    const page2 = await context2.newPage();

    try {
      // In page 1, trigger flow context storage by navigating to protected route
      await page1.goto(`${MINSIDE_BASE_URL}/bookings`);
      await expect(page1).toHaveURL(/\/login/);

      // Verify flow context is stored in page1's session
      const flowContext1 = await page1.evaluate((key) => {
        return sessionStorage.getItem(key);
      }, FLOW_CONTEXT_KEY);
      expect(flowContext1).not.toBeNull();

      // In page 2, navigate to a different protected route
      await page2.goto(`${MINSIDE_BASE_URL}/profile`);
      await expect(page2).toHaveURL(/\/login/);

      // Verify page2 has its own flow context
      const flowContext2 = await page2.evaluate((key) => {
        return sessionStorage.getItem(key);
      }, FLOW_CONTEXT_KEY);
      expect(flowContext2).not.toBeNull();

      // Parse both contexts
      const ctx1 = JSON.parse(flowContext1 as string);
      const ctx2 = JSON.parse(flowContext2 as string);

      // They should have different return URLs (sessionStorage is not shared)
      expect(ctx1.returnTo).toBe('/bookings');
      expect(ctx2.returnTo).toBe('/profile');
    } finally {
      await context1.close();
      await context2.close();
    }
  });
});

test.describe('Edge Cases', () => {
  test.use({ baseURL: MINSIDE_BASE_URL });

  test('handles malformed flow context gracefully', async ({ page }) => {
    await page.goto('/login');

    // Set malformed flow context
    await page.evaluate((key) => {
      sessionStorage.setItem(key, 'invalid-json-{');
    }, FLOW_CONTEXT_KEY);

    // Login should still work (falls back to default)
    const idPortenButton = page.getByRole('button', { name: /id-porten/i }).first();
    await idPortenButton.click();

    // Should navigate to default route
    await expect(page).toHaveURL('/');
  });

  test('handles missing returnTo in flow context', async ({ page }) => {
    await page.goto('/login');

    // Set flow context without returnTo
    const incompleteContext = {
      tenantId: 'minside',
      timestamp: Date.now(),
      correlationId: 'test-123',
    };
    await page.evaluate((ctx) => {
      sessionStorage.setItem('digilist:flow-context', JSON.stringify(ctx));
    }, incompleteContext);

    // Login should still work
    const idPortenButton = page.getByRole('button', { name: /id-porten/i }).first();
    await idPortenButton.click();

    // Should navigate to default route (since returnTo is missing)
    await expect(page).toHaveURL('/');
  });

  test('prevents double navigation on flow restoration', async ({ page }) => {
    // Navigate to protected route
    await page.goto('/bookings');
    await expect(page).toHaveURL(/\/login/);

    // Complete login
    const idPortenButton = page.getByRole('button', { name: /id-porten/i }).first();
    await idPortenButton.click();

    // Should only navigate once to the target
    await expect(page).toHaveURL('/bookings');

    // Wait a moment to ensure no additional navigation occurs
    await page.waitForTimeout(500);

    // Should still be on bookings
    await expect(page).toHaveURL('/bookings');
  });
});
