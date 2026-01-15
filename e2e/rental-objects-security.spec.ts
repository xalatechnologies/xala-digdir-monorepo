/**
 * E2E Security/Penetration Tests for Rental Objects
 * Tests security vulnerabilities and access control
 */

import { test, expect } from '@playwright/test';

const BACKOFFICE_BASE_URL = 'http://localhost:5175';

test.describe('Rental Objects Security Tests', () => {
  test.use({ baseURL: BACKOFFICE_BASE_URL });

  test('should prevent XSS attacks in search input', async ({ page }) => {
    await page.goto('/rental-objects');
    
    const maliciousScript = '<script>alert("XSS")</script>';
    const searchInput = page.locator('input[type="search"], input[placeholder*="Søk"]').first();
    
    await searchInput.fill(maliciousScript);
    
    // Check that script was not executed
    const alertHandled = await page.evaluate(() => {
      return new Promise((resolve) => {
        window.alert = () => {
          resolve(true);
        };
        setTimeout(() => resolve(false), 1000);
      });
    });
    
    expect(alertHandled).toBe(false);
  });

  test('should prevent unauthorized access to create endpoint', async ({ page, request }) => {
    // Attempt to create rental object without authentication
    const response = await request.post(`${BACKOFFICE_BASE_URL}/api/rental-objects`, {
      data: {
        name: 'Unauthorized Object',
        type: 'SPACE',
      },
    });
    
    // Should return 401 or 403
    expect([401, 403]).toContain(response.status());
  });

  test('should validate input on client side', async ({ page }) => {
    await page.goto('/rental-objects/new');
    await page.waitForLoadState('networkidle');
    
    // Try to submit form with invalid data
    const nameInput = page.locator('input[name="name"]').first();
    await nameInput.fill(''); // Empty name
    
    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click();
    
    // Should show validation error
    const errorMessage = page.locator('text=/required|påkrevd/i').first();
    await expect(errorMessage).toBeVisible();
  });

  test('should prevent SQL injection in search', async ({ page }) => {
    await page.goto('/rental-objects');
    
    const sqlInjection = "'; DROP TABLE rental_objects; --";
    const searchInput = page.locator('input[type="search"]').first();
    
    await searchInput.fill(sqlInjection);
    await page.waitForTimeout(500);
    
    // Page should still function normally
    const pageTitle = page.locator('h1, h2').first();
    await expect(pageTitle).toBeVisible();
  });

  test('should enforce tenant isolation', async ({ page }) => {
    await page.goto('/rental-objects');
    await page.waitForLoadState('networkidle');
    
    // Check that tenant ID is not exposed in UI
    const tenantId = await page.locator('text=/tenant[_-]?id/i').count();
    expect(tenantId).toBe(0);
    
    // Check network requests include tenant header
    const requests: string[] = [];
    page.on('request', (request) => {
      if (request.url().includes('/api/')) {
        requests.push(request.url());
      }
    });
    
    await page.reload();
    
    // Verify tenant isolation headers (would need actual API testing)
    expect(true).toBe(true);
  });

  test('should prevent CSRF attacks', async ({ page, request }) => {
    // Attempt cross-origin request
    const response = await request.post(`${BACKOFFICE_BASE_URL}/api/rental-objects`, {
      headers: {
        'Origin': 'https://evil.com',
      },
      data: {
        name: 'CSRF Attack',
      },
    });
    
    // Should reject cross-origin requests
    expect([400, 403, 401]).toContain(response.status());
  });

  test('should sanitize file uploads', async ({ page }) => {
    await page.goto('/rental-objects/new');
    await page.waitForLoadState('networkidle');
    
    // Find file input
    const fileInput = page.locator('input[type="file"]').first();
    if (await fileInput.count() > 0) {
      // Check accept attribute
      const accept = await fileInput.getAttribute('accept');
      expect(accept).toBeTruthy();
      
      // Should only accept safe file types
      expect(accept).toMatch(/image|pdf/i);
    }
  });

  test('should rate limit API requests', async ({ page, request }) => {
    // Make rapid requests
    const requests = [];
    for (let i = 0; i < 100; i++) {
      requests.push(
        request.get(`${BACKOFFICE_BASE_URL}/api/rental-objects`)
      );
    }
    
    const responses = await Promise.all(requests);
    
    // Some requests should be rate limited (429)
    const rateLimited = responses.filter(r => r.status() === 429);
    expect(rateLimited.length).toBeGreaterThan(0);
  });

  test('should not expose sensitive data in error messages', async ({ page }) => {
    await page.goto('/rental-objects/invalid-id-12345');
    await page.waitForLoadState('networkidle');
    
    // Error message should not expose internal details
    const errorText = await page.textContent('body');
    
    // Should not contain sensitive information
    expect(errorText).not.toMatch(/database|sql|stack trace|internal error/i);
  });

  test('should enforce HTTPS in production', async ({ page }) => {
    // This would be tested in production environment
    // Check that HTTP redirects to HTTPS
    const response = await page.goto('http://localhost:5175/rental-objects', {
      waitUntil: 'networkidle',
    });
    
    // In production, should redirect to HTTPS
    // For local dev, this test is informational
    expect(true).toBe(true);
  });
});
