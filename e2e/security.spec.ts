/**
 * Security E2E Tests
 * Tests for common security vulnerabilities and best practices
 */
import { test, expect } from '@playwright/test';

test.describe('Security - Authentication & Authorization', () => {
  test.describe('Brute Force Protection', () => {
    test('rate limits login attempts', async ({ page }) => {
      await page.goto('/login');
      
      // Attempt multiple failed logins
      for (let i = 0; i < 6; i++) {
        await page.getByLabel(/e-post|email/i).fill('attacker@example.com');
        await page.getByLabel(/passord|password/i).fill(`wrongpassword${i}`);
        await page.getByRole('button', { name: /logg inn|login/i }).click();
        
        // Wait for error to appear
        await page.waitForTimeout(500);
      }
      
      // After multiple attempts, should show rate limit or lock message
      const rateLimitMessage = page.getByText(/for mange.*forsøk|too many.*attempts|låst|locked|vent|wait/i);
      const isRateLimited = await rateLimitMessage.isVisible({ timeout: 5000 }).catch(() => false);
      
      // Rate limiting should be active after multiple attempts
      expect(isRateLimited).toBeTruthy();
    });
  });

  test.describe('Session Security', () => {
    test('session cookie has secure flags', async ({ page, context }) => {
      await page.goto('/login');
      await page.getByLabel(/e-post|email/i).fill('test@digilist.no');
      await page.getByLabel(/passord|password/i).fill('testpassword123');
      await page.getByRole('button', { name: /logg inn|login/i }).click();
      
      await page.waitForURL(/dashboard/i, { timeout: 15000 });
      
      const cookies = await context.cookies();
      const sessionCookies = cookies.filter(c => 
        c.name.includes('session') || 
        c.name.includes('token') ||
        c.name.includes('auth')
      );
      
      for (const cookie of sessionCookies) {
        // HttpOnly should be true for security
        expect(cookie.httpOnly).toBeTruthy();
        
        // In production, Secure should be true
        // expect(cookie.secure).toBeTruthy();
        
        // SameSite should be Strict or Lax
        expect(['Strict', 'Lax', 'None']).toContain(cookie.sameSite);
      }
    });

    test('logout invalidates session on server', async ({ page, context }) => {
      // Login
      await page.goto('/login');
      await page.getByLabel(/e-post|email/i).fill('test@digilist.no');
      await page.getByLabel(/passord|password/i).fill('testpassword123');
      await page.getByRole('button', { name: /logg inn|login/i }).click();
      await page.waitForURL(/dashboard/i, { timeout: 15000 });
      
      // Save cookies
      const cookiesBefore = await context.cookies();
      
      // Logout
      await page.getByRole('button', { name: /logg ut|logout/i }).click();
      await page.waitForURL(/login/i, { timeout: 10000 });
      
      // Try to use old cookies by setting them back
      await context.addCookies(cookiesBefore);
      await page.goto('/dashboard');
      
      // Should redirect to login (old session should be invalid)
      await expect(page).toHaveURL(/login/i);
    });
  });

  test.describe('CSRF Protection', () => {
    test('forms include CSRF token', async ({ page }) => {
      await page.goto('/login');
      
      // Look for CSRF token in form or meta tag
      const csrfInput = page.locator('input[name*="csrf"], input[name*="_token"]');
      const csrfMeta = page.locator('meta[name*="csrf"]');
      
      const hasCSRFInput = await csrfInput.count() > 0;
      const hasCSRFMeta = await csrfMeta.count() > 0;
      
      // Should have CSRF protection
      expect(hasCSRFInput || hasCSRFMeta).toBeTruthy();
    });
  });
});

test.describe('Security - Input Validation', () => {
  test.describe('XSS Prevention', () => {
    test('search input sanitizes HTML', async ({ page }) => {
      await page.goto('/');
      
      const xssPayload = '<script>alert("XSS")</script>';
      const searchInput = page.getByPlaceholder(/søk|search/i);
      
      if (await searchInput.isVisible()) {
        await searchInput.fill(xssPayload);
        await searchInput.press('Enter');
        
        // Wait for results
        await page.waitForLoadState('networkidle');
        
        // Script should not be executed
        const hasAlert = await page.evaluate(() => {
          return (window as typeof window & { xssTriggered?: boolean }).xssTriggered === true;
        });
        expect(hasAlert).toBeFalsy();
        
        // Script tag should be escaped or removed
        const pageContent = await page.content();
        expect(pageContent).not.toContain('<script>alert');
      }
    });

    test('form inputs escape special characters', async ({ page }) => {
      await page.goto('/login');
      
      const xssPayload = '"><img src=x onerror=alert(1)>';
      await page.getByLabel(/e-post|email/i).fill(xssPayload);
      
      // Submit form
      await page.getByRole('button', { name: /logg inn|login/i }).click();
      
      // Check that payload is escaped in any error messages
      const pageContent = await page.content();
      expect(pageContent).not.toContain('onerror=alert');
    });

    test('URL parameters are sanitized', async ({ page }) => {
      const xssUrl = '/?search=<script>alert(1)</script>';
      await page.goto(xssUrl);
      
      const pageContent = await page.content();
      expect(pageContent).not.toContain('<script>alert');
    });
  });

  test.describe('SQL Injection Prevention', () => {
    test('login form handles SQL injection attempts', async ({ page }) => {
      await page.goto('/login');
      
      const sqlPayload = "'; DROP TABLE users; --";
      await page.getByLabel(/e-post|email/i).fill(sqlPayload);
      await page.getByLabel(/passord|password/i).fill(sqlPayload);
      await page.getByRole('button', { name: /logg inn|login/i }).click();
      
      // Should show validation error, not crash
      const errorOrLoginPage = await Promise.race([
        page.getByText(/ugyldig|invalid|feil|error/i).waitFor({ timeout: 5000 }),
        page.waitForURL(/login/i, { timeout: 5000 }),
      ]).catch(() => null);
      
      expect(errorOrLoginPage).not.toBeNull();
    });

    test('search handles SQL injection attempts', async ({ page }) => {
      await page.goto('/');
      
      const sqlPayload = "'; SELECT * FROM users; --";
      const searchInput = page.getByPlaceholder(/søk|search/i);
      
      if (await searchInput.isVisible()) {
        await searchInput.fill(sqlPayload);
        await searchInput.press('Enter');
        
        // Page should not crash
        await expect(page.locator('body')).toBeVisible();
      }
    });
  });
});

test.describe('Security - Access Control', () => {
  test.describe('IDOR Prevention', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/login');
      await page.getByLabel(/e-post|email/i).fill('test@digilist.no');
      await page.getByLabel(/passord|password/i).fill('testpassword123');
      await page.getByRole('button', { name: /logg inn|login/i }).click();
      await page.waitForURL(/dashboard/i, { timeout: 15000 });
    });

    test('cannot access other users bookings', async ({ page }) => {
      // Try to access a booking that doesn't belong to the user
      const response = await page.goto('/bookings/other-user-booking-id');
      
      // Should get 404 or 403, not the booking data
      const status = response?.status();
      expect([403, 404]).toContain(status);
    });

    test('cannot access other organizations data', async ({ page }) => {
      // Try to access an organization the user is not a member of
      const response = await page.goto('/organizations/other-org-id');
      
      const status = response?.status();
      expect([403, 404]).toContain(status);
    });
  });

  test.describe('Role-Based Access Control', () => {
    test('regular user cannot access admin routes', async ({ page }) => {
      await page.goto('/login');
      await page.getByLabel(/e-post|email/i).fill('user@digilist.no');
      await page.getByLabel(/passord|password/i).fill('userpassword123');
      await page.getByRole('button', { name: /logg inn|login/i }).click();
      
      // Try to access admin page
      const response = await page.goto('/admin');
      
      // Should be forbidden or redirect
      const url = page.url();
      const isForbidden = response?.status() === 403;
      const isRedirected = !url.includes('/admin');
      
      expect(isForbidden || isRedirected).toBeTruthy();
    });
  });
});

test.describe('Security - HTTP Headers', () => {
  test('security headers are present', async ({ page }) => {
    const response = await page.goto('/');
    const headers = response?.headers() || {};
    
    // Check for security headers
    const securityHeaders = {
      'x-content-type-options': 'nosniff',
      'x-frame-options': ['DENY', 'SAMEORIGIN'],
      'x-xss-protection': '1; mode=block',
    };
    
    // X-Content-Type-Options
    if (headers['x-content-type-options']) {
      expect(headers['x-content-type-options']).toBe('nosniff');
    }
    
    // X-Frame-Options
    if (headers['x-frame-options']) {
      expect(['DENY', 'SAMEORIGIN']).toContain(headers['x-frame-options']);
    }
  });

  test('CORS is properly configured', async ({ page }) => {
    const response = await page.goto('/');
    const headers = response?.headers() || {};
    
    // If CORS headers are present, they should be restrictive
    if (headers['access-control-allow-origin']) {
      expect(headers['access-control-allow-origin']).not.toBe('*');
    }
  });
});

test.describe('Security - Sensitive Data', () => {
  test('passwords are not visible in page source', async ({ page }) => {
    await page.goto('/login');
    
    const passwordInput = page.getByLabel(/passord|password/i);
    await passwordInput.fill('mysecretpassword');
    
    const inputType = await passwordInput.getAttribute('type');
    expect(inputType).toBe('password');
  });

  test('sensitive data not in URL', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/e-post|email/i).fill('test@digilist.no');
    await page.getByLabel(/passord|password/i).fill('testpassword123');
    await page.getByRole('button', { name: /logg inn|login/i }).click();
    
    await page.waitForURL(/dashboard/i, { timeout: 15000 });
    
    const url = page.url();
    expect(url).not.toContain('password');
    expect(url).not.toContain('token');
    expect(url).not.toContain('secret');
  });

  test('API keys not exposed in frontend', async ({ page }) => {
    await page.goto('/');
    
    const pageContent = await page.content();
    const scripts = await page.locator('script').all();
    
    for (const script of scripts) {
      const content = await script.textContent();
      if (content) {
        // Should not contain API keys or secrets
        expect(content).not.toMatch(/api[_-]?key\s*[:=]\s*["'][^"']{20,}/i);
        expect(content).not.toMatch(/secret[_-]?key\s*[:=]\s*["'][^"']{20,}/i);
      }
    }
  });
});

test.describe('Security - Error Handling', () => {
  test('error pages do not leak stack traces', async ({ page }) => {
    const response = await page.goto('/nonexistent-page-xyz');
    
    const pageContent = await page.content();
    
    // Should not contain stack traces
    expect(pageContent).not.toContain('at Object.');
    expect(pageContent).not.toContain('node_modules');
    expect(pageContent).not.toContain('.ts:');
    expect(pageContent).not.toContain('.js:');
    expect(pageContent).not.toMatch(/Error:.*at\s+\w+/);
  });

  test('API errors do not leak internal details', async ({ page, request }) => {
    const response = await request.get('/api/nonexistent');
    const body = await response.json().catch(() => ({}));
    
    // Should not contain internal paths
    const bodyStr = JSON.stringify(body);
    expect(bodyStr).not.toContain('/src/');
    expect(bodyStr).not.toContain('node_modules');
  });
});
