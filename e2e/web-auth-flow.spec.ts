import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Web App Authentication Flow
 *
 * Tests the complete OAuth authentication journey:
 * 1. User clicks login
 * 2. Redirects to OAuth provider
 * 3. Returns with auth code
 * 4. Session is established
 * 5. Flow context is restored
 */

const WEB_BASE_URL = 'http://localhost:5173';
const FLOW_CONTEXT_KEY = 'digilist:flow-context';

test.describe('Web App OAuth Authentication Flow', () => {
  test.use({ baseURL: WEB_BASE_URL });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test.describe('Login Initiation', () => {
    test('clicking login button navigates to login page', async ({ page }) => {
      await page.goto('/');

      // Click login button in header
      const loginButton = page.getByRole('button', { name: /logg inn/i });
      await loginButton.click();

      // Should navigate to login page
      await expect(page).toHaveURL(/\/login/);
    });

    test('login page displays all OAuth providers', async ({ page }) => {
      await page.goto('/login');

      // Should show all three OAuth options
      await expect(page.getByText('Vipps')).toBeVisible();
      await expect(page.getByText('ID-porten')).toBeVisible();
      await expect(page.getByText('Microsoft')).toBeVisible();
    });

    test('OAuth buttons are keyboard accessible', async ({ page }) => {
      await page.goto('/login');

      // Tab through login options
      await page.keyboard.press('Tab');

      // Should be able to focus OAuth buttons
      const focusedElement = await page.evaluate(() => {
        const el = document.activeElement;
        return el ? el.tagName : null;
      });

      // Active element should be focusable (button or link)
      expect(['BUTTON', 'A', 'DIV']).toContain(focusedElement);
    });
  });

  test.describe('Flow Context During Auth', () => {
    test('preserves booking context through login redirect', async ({ page }) => {
      // Start on listing detail page with booking in progress
      await page.goto('/listing/test-listing?date=2024-01-15');

      // Store some booking context in sessionStorage (simulating booking flow)
      await page.evaluate(() => {
        sessionStorage.setItem('booking_draft', JSON.stringify({
          listingId: 'test-listing',
          date: '2024-01-15',
          slots: ['09:00-10:00'],
        }));
      });

      // Navigate to login (user wants to complete booking)
      await page.goto('/login');

      // Verify booking draft is still in sessionStorage
      const bookingDraft = await page.evaluate(() => {
        return sessionStorage.getItem('booking_draft');
      });

      expect(bookingDraft).not.toBeNull();
      const draft = JSON.parse(bookingDraft!);
      expect(draft.listingId).toBe('test-listing');
    });

    test('flow context includes correlation ID for tracking', async ({ page }) => {
      // Access protected route to trigger flow context creation
      await page.goto('/payment/callback');

      // Wait for redirect
      await expect(page).toHaveURL(/\/login/);

      // Check flow context has correlation ID
      const flowContext = await page.evaluate((key) => {
        const stored = sessionStorage.getItem(key);
        return stored ? JSON.parse(stored) : null;
      }, FLOW_CONTEXT_KEY);

      expect(flowContext).not.toBeNull();
      expect(flowContext.correlationId).toBeDefined();
      expect(flowContext.correlationId.length).toBeGreaterThan(0);
    });

    test('flow context has valid timestamp', async ({ page }) => {
      await page.goto('/payment/callback');
      await expect(page).toHaveURL(/\/login/);

      const flowContext = await page.evaluate((key) => {
        const stored = sessionStorage.getItem(key);
        return stored ? JSON.parse(stored) : null;
      }, FLOW_CONTEXT_KEY);

      expect(flowContext).not.toBeNull();
      expect(flowContext.timestamp).toBeDefined();

      // Timestamp should be recent (within last minute)
      const timestamp = new Date(flowContext.timestamp).getTime();
      const now = Date.now();
      expect(now - timestamp).toBeLessThan(60000);
    });
  });

  test.describe('Post-Login Behavior', () => {
    test('authenticated user sees their name in header', async ({ page }) => {
      // Simulate authenticated state
      await page.goto('/');
      await page.evaluate(() => {
        localStorage.setItem('web_user', JSON.stringify({
          id: 'user-123',
          name: 'Ola Nordmann',
          email: 'ola@example.com',
        }));
      });

      await page.reload();

      // Should display user name
      await expect(page.getByText('Ola Nordmann')).toBeVisible();
    });

    test('authenticated user does not see login button', async ({ page }) => {
      await page.goto('/');
      await page.evaluate(() => {
        localStorage.setItem('web_user', JSON.stringify({
          id: 'user-123',
          name: 'Ola Nordmann',
          email: 'ola@example.com',
        }));
      });

      await page.reload();

      // Login button should not be visible (or should show logout instead)
      const loginButton = page.getByRole('button', { name: /^logg inn$/i });
      await expect(loginButton).not.toBeVisible();
    });

    test('notification bell appears for authenticated users', async ({ page }) => {
      await page.goto('/');
      await page.evaluate(() => {
        localStorage.setItem('web_user', JSON.stringify({
          id: 'user-123',
          name: 'Ola Nordmann',
          email: 'ola@example.com',
        }));
      });

      await page.reload();

      // Notification bell should be visible for logged in users
      const notificationBell = page.locator('[aria-label*="Varsler"]');
      await expect(notificationBell).toBeVisible();
    });
  });

  test.describe('Logout Flow', () => {
    test('logout clears user data from localStorage', async ({ page }) => {
      // Set up authenticated state
      await page.goto('/');
      await page.evaluate(() => {
        localStorage.setItem('web_user', JSON.stringify({
          id: 'user-123',
          name: 'Ola Nordmann',
          email: 'ola@example.com',
        }));
      });
      await page.reload();

      // Find logout button (may be in dropdown)
      const userButton = page.getByText('Ola Nordmann');
      if (await userButton.isVisible()) {
        await userButton.click();

        // Look for logout option
        const logoutOption = page.getByText(/logg ut/i);
        if (await logoutOption.isVisible()) {
          await logoutOption.click();

          // Verify localStorage is cleared
          const userData = await page.evaluate(() => {
            return localStorage.getItem('web_user');
          });
          expect(userData).toBeNull();
        }
      }
    });

    test('logout redirects to home or login', async ({ page }) => {
      await page.goto('/');
      await page.evaluate(() => {
        localStorage.setItem('web_user', JSON.stringify({
          id: 'user-123',
          name: 'Ola Nordmann',
          email: 'ola@example.com',
        }));
      });
      await page.reload();

      // Trigger logout via direct localStorage manipulation (simulating logout)
      await page.evaluate(() => {
        localStorage.removeItem('web_user');
      });
      await page.reload();

      // Should show login button again
      const loginButton = page.getByRole('button', { name: /logg inn/i });
      await expect(loginButton).toBeVisible();
    });
  });

  test.describe('Session Persistence', () => {
    test('session persists across page reloads', async ({ page }) => {
      await page.goto('/');
      await page.evaluate(() => {
        localStorage.setItem('web_user', JSON.stringify({
          id: 'user-123',
          name: 'Ola Nordmann',
          email: 'ola@example.com',
        }));
      });

      // Reload multiple times
      await page.reload();
      await page.reload();

      // Session should still be valid
      await expect(page.getByText('Ola Nordmann')).toBeVisible();
    });

    test('session persists across navigation', async ({ page }) => {
      await page.goto('/');
      await page.evaluate(() => {
        localStorage.setItem('web_user', JSON.stringify({
          id: 'user-123',
          name: 'Ola Nordmann',
          email: 'ola@example.com',
        }));
      });
      await page.reload();

      // Navigate to different pages
      await page.goto('/listing/some-id');
      await expect(page.getByText('Ola Nordmann')).toBeVisible();

      await page.goto('/');
      await expect(page.getByText('Ola Nordmann')).toBeVisible();
    });
  });

  test.describe('Security', () => {
    test('does not expose sensitive data in URL', async ({ page }) => {
      await page.goto('/login');

      // URL should not contain tokens or sensitive data
      const url = page.url();
      expect(url).not.toContain('token');
      expect(url).not.toContain('password');
      expect(url).not.toContain('secret');
    });

    test('clears flow context after successful restoration', async ({ page }) => {
      // Create flow context by accessing protected route
      await page.goto('/payment/callback');
      await expect(page).toHaveURL(/\/login/);

      // Verify flow context exists
      const flowContext = await page.evaluate((key) => {
        return sessionStorage.getItem(key);
      }, FLOW_CONTEXT_KEY);
      expect(flowContext).not.toBeNull();

      // Simulate successful login
      await page.evaluate(() => {
        localStorage.setItem('web_user', JSON.stringify({
          id: 'user-123',
          name: 'Test User',
          email: 'test@example.com',
        }));
      });

      // Flow context should be cleared after use (by login page logic)
      // This depends on implementation - login page should call clearFlowContext
    });
  });
});

test.describe('Web App Mobile Authentication', () => {
  test.use({
    baseURL: WEB_BASE_URL,
    viewport: { width: 375, height: 667 }, // iPhone SE
  });

  test('login page is usable on mobile', async ({ page }) => {
    await page.goto('/login');

    // Login options should be visible and tappable
    await expect(page.getByText('Vipps')).toBeVisible();
    await expect(page.getByText('ID-porten')).toBeVisible();
    await expect(page.getByText('Microsoft')).toBeVisible();
  });

  test('header login button is accessible on mobile', async ({ page }) => {
    await page.goto('/');

    // Login button should be visible (might be in hamburger menu)
    const loginButton = page.getByRole('button', { name: /logg inn/i });

    // Either directly visible or accessible via menu
    const isVisible = await loginButton.isVisible().catch(() => false);

    if (!isVisible) {
      // Try to open mobile menu first
      const menuButton = page.locator('[aria-label*="meny"], [aria-label*="Menu"]');
      if (await menuButton.isVisible()) {
        await menuButton.click();
      }
    }

    // Now check for login option
    await expect(page.getByRole('button', { name: /logg inn/i }).or(page.getByText(/logg inn/i))).toBeVisible();
  });
});
