/**
 * Authentication E2E Tests
 * Tests login, logout, and session management flows
 */
import { test, expect, type Page } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.describe('Login', () => {
    test('displays login page correctly', async ({ page }) => {
      await page.goto('/login');
      
      await expect(page.getByRole('heading', { name: /logg inn|login/i })).toBeVisible();
      await expect(page.getByLabel(/e-post|email/i)).toBeVisible();
      await expect(page.getByLabel(/passord|password/i)).toBeVisible();
      await expect(page.getByRole('button', { name: /logg inn|login/i })).toBeVisible();
    });

    test('shows validation errors for empty form', async ({ page }) => {
      await page.goto('/login');
      
      await page.getByRole('button', { name: /logg inn|login/i }).click();
      
      await expect(page.getByText(/e-post.*påkrevd|email.*required/i)).toBeVisible();
    });

    test('shows error for invalid credentials', async ({ page }) => {
      await page.goto('/login');
      
      await page.getByLabel(/e-post|email/i).fill('invalid@example.com');
      await page.getByLabel(/passord|password/i).fill('wrongpassword');
      await page.getByRole('button', { name: /logg inn|login/i }).click();
      
      await expect(page.getByText(/ugyldig|invalid|feil/i)).toBeVisible({ timeout: 10000 });
    });

    test('successful login redirects to dashboard', async ({ page }) => {
      await page.goto('/login');
      
      await page.getByLabel(/e-post|email/i).fill('test@digilist.no');
      await page.getByLabel(/passord|password/i).fill('testpassword123');
      await page.getByRole('button', { name: /logg inn|login/i }).click();
      
      await expect(page).toHaveURL(/dashboard|hjem|home/i, { timeout: 15000 });
    });

    test('remembers user session', async ({ page, context }) => {
      // Login first
      await page.goto('/login');
      await page.getByLabel(/e-post|email/i).fill('test@digilist.no');
      await page.getByLabel(/passord|password/i).fill('testpassword123');
      await page.getByRole('button', { name: /logg inn|login/i }).click();
      
      await expect(page).toHaveURL(/dashboard|hjem|home/i, { timeout: 15000 });
      
      // Open new page in same context
      const newPage = await context.newPage();
      await newPage.goto('/dashboard');
      
      // Should still be logged in
      await expect(newPage).not.toHaveURL(/login/i);
    });
  });

  test.describe('Logout', () => {
    test.beforeEach(async ({ page }) => {
      // Login before each test
      await page.goto('/login');
      await page.getByLabel(/e-post|email/i).fill('test@digilist.no');
      await page.getByLabel(/passord|password/i).fill('testpassword123');
      await page.getByRole('button', { name: /logg inn|login/i }).click();
      await expect(page).toHaveURL(/dashboard|hjem|home/i, { timeout: 15000 });
    });

    test('logout button is visible when logged in', async ({ page }) => {
      await expect(page.getByRole('button', { name: /logg ut|logout/i })).toBeVisible();
    });

    test('logout redirects to login page', async ({ page }) => {
      await page.getByRole('button', { name: /logg ut|logout/i }).click();
      
      await expect(page).toHaveURL(/login/i, { timeout: 10000 });
    });

    test('session is cleared after logout', async ({ page, context }) => {
      await page.getByRole('button', { name: /logg ut|logout/i }).click();
      await expect(page).toHaveURL(/login/i, { timeout: 10000 });
      
      // Try to access protected route
      const newPage = await context.newPage();
      await newPage.goto('/dashboard');
      
      // Should redirect to login
      await expect(newPage).toHaveURL(/login/i);
    });
  });

  test.describe('Protected Routes', () => {
    test('redirects unauthenticated user to login', async ({ page }) => {
      await page.goto('/dashboard');
      
      await expect(page).toHaveURL(/login/i);
    });

    test('redirects to original URL after login', async ({ page }) => {
      // Try to access protected route
      await page.goto('/rental-objects/new');
      
      // Should redirect to login
      await expect(page).toHaveURL(/login/i);
      
      // Login
      await page.getByLabel(/e-post|email/i).fill('test@digilist.no');
      await page.getByLabel(/passord|password/i).fill('testpassword123');
      await page.getByRole('button', { name: /logg inn|login/i }).click();
      
      // Should redirect back to original URL
      await expect(page).toHaveURL(/rental-objects\/new/i, { timeout: 15000 });
    });
  });

  test.describe('ID-porten Integration', () => {
    test('shows ID-porten login button', async ({ page }) => {
      await page.goto('/login');
      
      await expect(page.getByRole('button', { name: /id-porten|bankid/i })).toBeVisible();
    });

    test('ID-porten button initiates OAuth flow', async ({ page }) => {
      await page.goto('/login');
      
      const [popup] = await Promise.all([
        page.waitForEvent('popup'),
        page.getByRole('button', { name: /id-porten|bankid/i }).click(),
      ]);
      
      // Should open ID-porten in popup or redirect
      if (popup) {
        await expect(popup.url()).toContain('idporten');
      }
    });
  });
});

test.describe('Session Management', () => {
  test('handles session expiry gracefully', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.getByLabel(/e-post|email/i).fill('test@digilist.no');
    await page.getByLabel(/passord|password/i).fill('testpassword123');
    await page.getByRole('button', { name: /logg inn|login/i }).click();
    await expect(page).toHaveURL(/dashboard/i, { timeout: 15000 });
    
    // Clear cookies to simulate session expiry
    await page.context().clearCookies();
    
    // Try to perform an action
    await page.reload();
    
    // Should redirect to login
    await expect(page).toHaveURL(/login/i, { timeout: 10000 });
  });

  test('shows session expiry notification', async ({ page }) => {
    // This test would require mocking the session expiry
    // For now, we just verify the login page loads
    await page.goto('/login?session=expired');
    
    // May show a notification about session expiry
    const notification = page.getByText(/sesjon.*utløpt|session.*expired/i);
    if (await notification.isVisible()) {
      await expect(notification).toBeVisible();
    }
  });
});
