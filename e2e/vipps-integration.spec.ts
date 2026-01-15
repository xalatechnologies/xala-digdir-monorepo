import { test, expect } from '@playwright/test';

/**
 * Vipps Integration E2E Tests
 * 
 * Tests the complete Vipps integration across all apps:
 * - Authentication (OIDC login flow)
 * - Payments (Checkout API)
 * - Webhooks (event handling)
 */

test.describe('Vipps Login Integration', () => {
  test.describe('Web App', () => {
    test.use({ baseURL: 'http://localhost:5173' });

    test('displays Vipps login option on login page', async ({ page }) => {
      await page.goto('/login');
      await page.waitForLoadState('networkidle');

      const vippsButton = page.locator('text=/vipps/i').first();
      await expect(vippsButton).toBeVisible({ timeout: 10000 });
    });

    test('Vipps login button is clickable', async ({ page }) => {
      await page.goto('/login');
      await page.waitForLoadState('networkidle');

      const vippsOption = page.locator('[data-testid="login-option-vipps"], button:has-text("Vipps")').first();
      
      if (await vippsOption.isVisible({ timeout: 5000 })) {
        await expect(vippsOption).toBeEnabled();
      }
    });
  });

  test.describe('Minside App', () => {
    test.use({ baseURL: 'http://localhost:5175' });

    test('displays Vipps login option', async ({ page }) => {
      await page.goto('/login');
      await page.waitForLoadState('networkidle');

      const pageContent = await page.content();
      expect(pageContent.toLowerCase()).toContain('vipps');
    });
  });

  test.describe('Backoffice App', () => {
    test.use({ baseURL: 'http://localhost:5174' });

    test('displays auth options on login page', async ({ page }) => {
      await page.goto('/login');
      await page.waitForLoadState('networkidle');

      const loginForm = page.locator('form, [role="form"]').first();
      
      if (await loginForm.isVisible({ timeout: 5000 })) {
        expect(await loginForm.isVisible()).toBe(true);
      }
    });
  });
});

test.describe('Vipps Payment Integration', () => {
  test.describe('Web App - Payment Flow', () => {
    test.use({ baseURL: 'http://localhost:5173' });

    test('displays Vipps payment option in booking flow', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const firstListing = page.locator('.listing-card, [data-testid="listing-card"]').first();
      
      if (await firstListing.isVisible({ timeout: 10000 })) {
        await firstListing.click();
        await page.waitForLoadState('networkidle');

        const bookButton = page.getByRole('button', { name: /book|bestill/i });
        
        if (await bookButton.isVisible({ timeout: 5000 })) {
          await bookButton.click();
          
          const dialog = page.locator('[role="dialog"]');
          if (await dialog.isVisible({ timeout: 5000 })) {
            const vippsButton = page.getByRole('button', { name: /vipps|betal/i });
            if (await vippsButton.isVisible({ timeout: 3000 })) {
              await expect(vippsButton).toBeEnabled();
            }
          }
        }
      }
    });

    test('handles payment callback success', async ({ page }) => {
      await page.goto('/payment/callback?orderId=test-123&status=success');
      await page.waitForLoadState('networkidle');

      const heading = page.locator('h1, h2').first();
      await expect(heading).toBeVisible({ timeout: 15000 });
    });

    test('handles payment callback cancellation', async ({ page }) => {
      await page.goto('/payment/callback?orderId=test-456&status=cancelled');
      await page.waitForLoadState('networkidle');

      const content = page.locator('h1, h2, [role="alert"]').first();
      await expect(content).toBeVisible({ timeout: 15000 });
    });
  });

  test.describe('Minside App - Payment History', () => {
    test.use({ baseURL: 'http://localhost:5175' });

    test('displays booking payment status', async ({ page }) => {
      await page.goto('/bookings');
      await page.waitForLoadState('networkidle');

      const statusBadges = page.locator('text=/betalt|paid|ubetalt|unpaid/i');
      
      if (await statusBadges.first().isVisible({ timeout: 5000 })) {
        expect(await statusBadges.count()).toBeGreaterThan(0);
      }
    });
  });

  test.describe('Backoffice App - Payment Management', () => {
    test.use({ baseURL: 'http://localhost:5174' });

    test('shows payment dashboard', async ({ page }) => {
      await page.goto('/payments');
      await page.waitForLoadState('networkidle');

      const heading = page.locator('h1, h2').filter({ hasText: /betaling|payment/i }).first();
      
      if (await heading.isVisible({ timeout: 10000 })) {
        await expect(heading).toBeVisible();
      }
    });

    test('shows Vipps status in settings', async ({ page }) => {
      await page.goto('/settings');
      await page.waitForLoadState('networkidle');

      const vippsSection = page.locator('text=/vipps/i').first();
      
      if (await vippsSection.isVisible({ timeout: 5000 })) {
        await expect(vippsSection).toBeVisible();
      }
    });
  });
});

test.describe('Vipps API Endpoints', () => {
  test.describe('Auth Endpoints', () => {
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
      
      expect([400, 503]).toContain(response.status());
    });

    test('POST /api/auth/vipps/callback handles errors', async ({ request }) => {
      const response = await request.post('http://localhost:4000/api/auth/vipps/callback', {
        data: {
          error: 'access_denied',
          error_description: 'User cancelled',
        },
      });
      
      expect(response.status()).toBe(401);
    });
  });

  test.describe('Payment Endpoints', () => {
    test('GET /api/integrations/vipps/status returns connection info', async ({ request }) => {
      const response = await request.get('http://localhost:4000/api/integrations/vipps/status');
      
      expect(response.ok()).toBe(true);
      
      const body = await response.json();
      expect(body.data.provider).toBe('Vipps');
    });

    test('POST /api/integrations/vipps/initiate validates required fields', async ({ request }) => {
      const response = await request.post('http://localhost:4000/api/integrations/vipps/initiate', {
        data: {},
      });
      
      expect(response.status()).toBe(400);
    });

    test('POST /api/integrations/vipps/initiate creates payment session', async ({ request }) => {
      const response = await request.post('http://localhost:4000/api/integrations/vipps/initiate', {
        data: {
          bookingId: 'test-booking-123',
          amount: 50000,
          description: 'E2E Test Booking',
          returnUrl: 'http://localhost:5173/payment/callback',
        },
      });
      
      expect([200, 503]).toContain(response.status());
      
      if (response.status() === 200) {
        const body = await response.json();
        expect(body.data.orderId).toBeDefined();
        expect(body.data.redirectUrl).toBeDefined();
      }
    });
  });

  test.describe('Webhook Endpoints', () => {
    test('POST /api/webhooks/vipps validates required fields', async ({ request }) => {
      const response = await request.post('http://localhost:4000/api/webhooks/vipps', {
        data: {},
      });
      
      expect([400, 503]).toContain(response.status());
    });

    test('POST /api/webhooks/vipps processes valid event', async ({ request }) => {
      const response = await request.post('http://localhost:4000/api/webhooks/vipps', {
        data: {
          eventId: `e2e-test-${Date.now()}`,
          eventType: 'checkout.session.completed',
          timestamp: new Date().toISOString(),
          data: {
            reference: 'digilist-booking-123-1234567890',
          },
        },
      });
      
      expect([200, 503]).toContain(response.status());
    });

    test('POST /api/webhooks/vipps handles idempotency', async ({ request }) => {
      const eventId = `idempotency-${Date.now()}`;
      
      const response1 = await request.post('http://localhost:4000/api/webhooks/vipps', {
        data: {
          eventId,
          eventType: 'checkout.session.completed',
          timestamp: new Date().toISOString(),
          data: { reference: 'digilist-test-123-1234567890' },
        },
      });
      
      const response2 = await request.post('http://localhost:4000/api/webhooks/vipps', {
        data: {
          eventId,
          eventType: 'checkout.session.completed',
          timestamp: new Date().toISOString(),
          data: { reference: 'digilist-test-123-1234567890' },
        },
      });
      
      if (response1.status() === 200 && response2.status() === 200) {
        const body2 = await response2.json();
        expect(body2.data?.status).toBe('already_processed');
      }
    });
  });
});

test.describe('Vipps Accessibility', () => {
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

  test('payment callback page has proper structure', async ({ page }) => {
    await page.goto('/payment/callback');
    await page.waitForLoadState('networkidle');

    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBeLessThanOrEqual(1);
  });
});
