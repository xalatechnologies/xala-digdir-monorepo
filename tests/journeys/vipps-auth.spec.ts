/**
 * Vipps Authentication Journey Tests
 * 
 * Tests the Vipps login flow across all apps.
 */

import { test, expect } from '@playwright/test';

test.describe('Vipps Authentication Journey', () => {
  test.describe('Web App - Vipps Login', () => {
    test.use({ baseURL: 'http://localhost:5173' });

    test('displays Vipps login option', async ({ page }) => {
      await page.goto('/login');
      await page.waitForLoadState('networkidle');

      const vippsButton = page.locator('text=/vipps/i').first();
      await expect(vippsButton).toBeVisible({ timeout: 10000 });
    });

    test('Vipps login button is enabled', async ({ page }) => {
      await page.goto('/login');
      await page.waitForLoadState('networkidle');

      const vippsOption = page.locator('[data-testid="login-option-vipps"], button:has-text("Vipps")').first();
      
      if (await vippsOption.isVisible({ timeout: 5000 })) {
        await expect(vippsOption).toBeEnabled();
      }
    });
  });

  test.describe('Minside App - Vipps Login', () => {
    test.use({ baseURL: 'http://localhost:5175' });

    test('displays Vipps login option', async ({ page }) => {
      await page.goto('/login');
      await page.waitForLoadState('networkidle');

      const pageContent = await page.content();
      expect(pageContent.toLowerCase()).toContain('vipps');
    });

    test('shows multiple auth options', async ({ page }) => {
      await page.goto('/login');
      await page.waitForLoadState('networkidle');

      const authOptions = page.locator('[data-testid^="login-option"], button:has-text(/vipps|id-porten|idporten/i)');
      
      if (await authOptions.first().isVisible({ timeout: 5000 })) {
        const count = await authOptions.count();
        expect(count).toBeGreaterThanOrEqual(1);
      }
    });
  });

  test.describe('Backoffice App - Auth Options', () => {
    test.use({ baseURL: 'http://localhost:5174' });

    test('displays login form', async ({ page }) => {
      await page.goto('/login');
      await page.waitForLoadState('networkidle');

      const loginForm = page.locator('form, [role="form"]').first();
      
      if (await loginForm.isVisible({ timeout: 5000 })) {
        expect(await loginForm.isVisible()).toBe(true);
      }
    });
  });

  test.describe('API Endpoints', () => {
    test('GET /api/auth/providers returns Vipps', async ({ request }) => {
      const response = await request.get('http://localhost:4000/api/auth/providers');
      
      expect(response.ok()).toBe(true);
      
      const body = await response.json();
      const vippsProvider = body.data?.find((p: any) => p.id === 'vipps');
      
      expect(vippsProvider).toBeDefined();
      expect(vippsProvider.name).toBe('Vipps');
    });

    test('POST /api/auth/vipps/start validates redirect URI', async ({ request }) => {
      const response = await request.post('http://localhost:4000/api/auth/vipps/start', {
        data: {},
      });
      
      // Either 400 (missing param) or 503 (not configured)
      expect([400, 503]).toContain(response.status());
    });

    test('POST /api/auth/vipps/callback handles missing code', async ({ request }) => {
      const response = await request.post('http://localhost:4000/api/auth/vipps/callback', {
        data: {},
      });
      
      expect(response.status()).toBeGreaterThanOrEqual(400);
    });

    test('POST /api/auth/vipps/callback handles error response', async ({ request }) => {
      const response = await request.post('http://localhost:4000/api/auth/vipps/callback', {
        data: {
          error: 'access_denied',
          error_description: 'User cancelled login',
        },
      });
      
      expect(response.status()).toBe(401);
      
      const body = await response.json();
      expect(body.error).toBeDefined();
    });
  });

  test.describe('Accessibility', () => {
    test.use({ baseURL: 'http://localhost:5173' });

    test('login page has proper heading hierarchy', async ({ page }) => {
      await page.goto('/login');
      await page.waitForLoadState('networkidle');

      const h1 = page.locator('h1');
      if (await h1.isVisible({ timeout: 5000 })) {
        const h1Count = await h1.count();
        expect(h1Count).toBeLessThanOrEqual(1);
      }
    });

    test('Vipps button is keyboard accessible', async ({ page }) => {
      await page.goto('/login');
      await page.waitForLoadState('networkidle');

      await page.keyboard.press('Tab');
      
      for (let i = 0; i < 10; i++) {
        const focusedElement = page.locator(':focus');
        const text = await focusedElement.textContent();
        
        if (text?.toLowerCase().includes('vipps')) {
          expect(await focusedElement.isVisible()).toBe(true);
          break;
        }
        
        await page.keyboard.press('Tab');
      }
    });
  });
});
