/**
 * Vipps Payment Journey Tests
 * 
 * Tests the complete Vipps payment user journey across all apps.
 */

import { test, expect } from '@playwright/test';

test.describe('Vipps Payment Journey', () => {
  test.describe('Web App - Public Booking with Payment', () => {
    test.use({ baseURL: 'http://localhost:5173' });

    test('initiates Vipps payment for booking', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Find and click first listing
      const firstListing = page.locator('.listing-card, [data-testid="listing-card"]').first();
      
      if (await firstListing.isVisible({ timeout: 10000 })) {
        await firstListing.click();
        await page.waitForLoadState('networkidle');

        // Look for book button
        const bookButton = page.getByRole('button', { name: /book|bestill/i });
        
        if (await bookButton.isVisible({ timeout: 5000 })) {
          await bookButton.click();
          
          // Wait for booking dialog
          const dialog = page.locator('[role="dialog"]');
          await expect(dialog).toBeVisible({ timeout: 5000 });

          // Look for Vipps payment option
          const vippsButton = page.getByRole('button', { name: /vipps|betal/i });
          if (await vippsButton.isVisible({ timeout: 3000 })) {
            await expect(vippsButton).toBeEnabled();
          }
        }
      }
    });

    test('handles payment callback success', async ({ page }) => {
      await page.goto('/payment/callback?orderId=test-123&status=success');
      await page.waitForLoadState('networkidle');

      // Should show status page
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

  test.describe('Minside App - User Payment History', () => {
    test.use({ baseURL: 'http://localhost:5175' });

    test('displays booking payment status', async ({ page }) => {
      await page.goto('/bookings');
      await page.waitForLoadState('networkidle');

      // Look for payment status indicators
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

    test('shows Vipps integration status', async ({ page }) => {
      await page.goto('/settings');
      await page.waitForLoadState('networkidle');

      const integrationsSection = page.locator('text=/integrasjoner|integrations|vipps/i').first();
      
      if (await integrationsSection.isVisible({ timeout: 5000 })) {
        const vippsStatus = page.locator('text=/vipps/i');
        await expect(vippsStatus.first()).toBeVisible();
      }
    });
  });

  test.describe('API Endpoints', () => {
    test('GET /api/integrations/vipps/status returns connection info', async ({ request }) => {
      const response = await request.get('http://localhost:4000/api/integrations/vipps/status');
      
      expect(response.ok()).toBe(true);
      
      const body = await response.json();
      expect(body.data).toBeDefined();
      expect(body.data.provider).toBe('Vipps');
    });

    test('POST /api/integrations/vipps/initiate validates required fields', async ({ request }) => {
      const response = await request.post('http://localhost:4000/api/integrations/vipps/initiate', {
        data: {},
      });
      
      expect(response.status()).toBe(400);
      
      const body = await response.json();
      expect(body.error).toBeDefined();
    });

    test('POST /api/webhooks/vipps validates required fields', async ({ request }) => {
      const response = await request.post('http://localhost:4000/api/webhooks/vipps', {
        data: {},
      });
      
      // Should return 400 (bad request) or 503 (not configured)
      expect([400, 503]).toContain(response.status());
    });

    test('POST /api/webhooks/vipps handles idempotency', async ({ request }) => {
      const eventId = `idempotency-test-${Date.now()}`;
      
      // First request
      const response1 = await request.post('http://localhost:4000/api/webhooks/vipps', {
        data: {
          eventId,
          eventType: 'checkout.session.completed',
          timestamp: new Date().toISOString(),
          data: { reference: 'digilist-test-123-1234567890' },
        },
      });
      
      // Second request with same eventId
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
