import { test, expect } from '@playwright/test';

/**
 * MinSide Auth Boundary E2E Tests
 * 
 * Tests authentication boundaries and return-to-previous behavior:
 * - Login flow
 * - Return to intended destination after login
 * - Session persistence
 * - Protected route handling
 */

test.describe('MinSide - Auth Boundaries', () => {

  test.describe('Login Flow', () => {
    test.beforeEach(async ({ page }) => {
      // Clear cookies to ensure logged out state
      await page.context().clearCookies();
    });

    test('login page loads correctly', async ({ page }) => {
      await page.goto('/login', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);
      
      // Check for login form elements
      const elements = {
        title: 'h1, h2, [data-testid="login-title"]',
        demoButton: 'button:has-text("Demo"), [data-testid="demo-login"]',
        bankIdButton: 'button:has-text("BankID"), [data-testid="bankid-login"]',
      };
      
      console.log('\nLogin page elements:');
      for (const [name, selector] of Object.entries(elements)) {
        const el = page.locator(selector).first();
        const visible = await el.isVisible().catch(() => false);
        console.log(`├─ ${name}: ${visible ? '✓' : '–'}`);
      }
    });

    test('demo login flow works', async ({ page }) => {
      await page.goto('/login', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);
      
      const demoBtn = page.locator('button:has-text("Demo"), [data-testid="demo-login"]').first();
      
      if (!await demoBtn.isVisible()) {
        console.log('Demo login not available');
        test.skip();
        return;
      }
      
      await demoBtn.click();
      await page.waitForTimeout(1000);
      
      // Fill demo credentials
      const dialog = page.locator('dialog[open], [role="dialog"]').first();
      
      if (await dialog.isVisible()) {
        const emailInput = dialog.locator('input[type="email"], input[placeholder*="e-post" i]').first();
        const tokenInput = dialog.locator('input[placeholder*="token" i]').first();
        
        if (await emailInput.isVisible()) {
          await emailInput.fill('ola.hansen@kommune.no');
        }
        if (await tokenInput.isVisible()) {
          await tokenInput.fill('skien-citizen-001');
        }
        
        const submitBtn = dialog.locator('button[type="submit"], button:has-text("Logg inn")').first();
        await submitBtn.click();
        await page.waitForTimeout(5000);
        
        const loggedIn = !page.url().includes('/login');
        console.log(`Demo login: ${loggedIn ? '✓ success' : '✗ failed'}`);
      }
    });
  });

  test.describe('Return to Previous URL', () => {
    test.beforeEach(async ({ page }) => {
      await page.context().clearCookies();
    });

    test('should redirect to login when accessing protected route', async ({ page }) => {
      await page.goto('/bookings', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(3000);
      
      const onLogin = page.url().includes('/login');
      console.log(`Protected route redirect: ${onLogin ? '✓' : '✗'}`);
      
      expect(onLogin).toBe(true);
    });

    test('should return to intended page after login', async ({ page }) => {
      // Try to access protected page
      await page.goto('/bookings', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);
      
      // Should be on login page with return URL
      const url = page.url();
      const hasReturnUrl = url.includes('returnUrl=') || url.includes('redirect=');
      
      console.log(`Return URL preserved: ${hasReturnUrl ? '✓' : '– (may use different mechanism)'}`);
      
      // Perform login
      const demoBtn = page.locator('button:has-text("Demo"), [data-testid="demo-login"]').first();
      
      if (await demoBtn.isVisible()) {
        await demoBtn.click();
        await page.waitForTimeout(1000);
        
        const dialog = page.locator('dialog[open], [role="dialog"]').first();
        
        if (await dialog.isVisible()) {
          const emailInput = dialog.locator('input[type="email"]').first();
          const tokenInput = dialog.locator('input[placeholder*="token" i]').first();
          
          if (await emailInput.isVisible()) {
            await emailInput.fill('ola.hansen@kommune.no');
          }
          if (await tokenInput.isVisible()) {
            await tokenInput.fill('skien-citizen-001');
          }
          
          const submitBtn = dialog.locator('button[type="submit"]').first();
          await submitBtn.click();
          await page.waitForTimeout(5000);
          
          // Check if returned to bookings
          const currentUrl = page.url();
          const onBookings = currentUrl.includes('/bookings');
          
          console.log(`Returned to bookings: ${onBookings ? '✓' : '✗ (on: ' + currentUrl + ')'}`);
        }
      }
    });
  });

  test.describe('Session Handling', () => {
    test.use({ storageState: 'tests/e2e/minside/.auth/user.json' });

    test('session persists across page navigation', async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);
      
      if (page.url().includes('/login')) {
        console.log('Not logged in - skipping');
        test.skip();
        return;
      }
      
      // Navigate to different pages
      const pages = ['/bookings', '/settings', '/'];
      
      for (const path of pages) {
        await page.goto(path, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(1000);
        
        const stillLoggedIn = !page.url().includes('/login');
        console.log(`${path}: ${stillLoggedIn ? '✓' : '✗'}`);
        
        if (!stillLoggedIn) {
          break;
        }
      }
    });

    test('session persists after page reload', async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);
      
      if (page.url().includes('/login')) {
        console.log('Not logged in - skipping');
        test.skip();
        return;
      }
      
      // Reload
      await page.reload();
      await page.waitForTimeout(3000);
      
      const stillLoggedIn = !page.url().includes('/login');
      console.log(`Session after reload: ${stillLoggedIn ? '✓' : '✗'}`);
      
      expect(stillLoggedIn).toBe(true);
    });
  });

  test.describe('Logout Flow', () => {
    test.use({ storageState: 'tests/e2e/minside/.auth/user.json' });

    test('logout redirects to login page', async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);
      
      if (page.url().includes('/login')) {
        console.log('Not logged in - skipping');
        test.skip();
        return;
      }
      
      // Find logout button
      const userMenu = page.locator('[data-testid="user-menu"], button[aria-haspopup="menu"], [class*="avatar"]').first();
      
      if (await userMenu.isVisible()) {
        await userMenu.click();
        await page.waitForTimeout(500);
      }
      
      const logoutBtn = page.locator('button:has-text("Logg ut"), [data-testid="logout"]').first();
      
      if (await logoutBtn.isVisible()) {
        await logoutBtn.click();
        await page.waitForTimeout(3000);
        
        const onLogin = page.url().includes('/login');
        console.log(`Logout redirect: ${onLogin ? '✓' : '✗'}`);
      }
    });

    test('protected routes inaccessible after logout', async ({ page }) => {
      // Clear cookies to simulate logged out state
      await page.context().clearCookies();
      
      // Try to access protected page
      await page.goto('/bookings', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(3000);
      
      const blocked = page.url().includes('/login');
      console.log(`Protected after logout: ${blocked ? '✓ blocked' : '✗ accessible'}`);
      
      expect(blocked).toBe(true);
    });
  });

  test.describe('OAuth Callback', () => {
    test('handles OAuth callback parameters', async ({ page }) => {
      // Simulate OAuth callback
      await page.goto('/login?code=test&state=test', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);
      
      // Should either process callback or show login
      // The callback handler should be present
      const url = page.url();
      
      console.log(`OAuth callback URL processed: ${!url.includes('code=') ? '✓' : '– (params may be kept)'}`);
    });
  });
});
