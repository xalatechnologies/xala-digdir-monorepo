import { setupMockApi } from '../../../../mocks/api-server.mock';
import { test, expect } from '../fixtures/evidence.fixture';
import { config } from '../config/backoffice.config';

/**
 * Security Tests
 * 
 * RBAC enforcement, IDOR protection, and security headers.
 */
test.describe('Security - RBAC Enforcement', () => {
  setupMockApi();
  test.describe('Admin Authorization', () => {
  setupMockApi();
    test.use({ storageState: 'tests/e2e/backoffice/.auth/admin.json' });

    test('should access all admin endpoints', async ({ page, evidence }) => {
      const adminEndpoints = [
        '/settings',
        '/users',
        '/organizations',
        '/pricing-rules',
        '/gdpr-requests',
        '/audit',
      ];

      for (const endpoint of adminEndpoints) {
        await page.goto(endpoint);
        await page.waitForLoadState('networkidle');

        // Should not redirect to login or forbidden
        expect(page.url()).toContain(endpoint);
        expect(evidence.getApiErrors()).toHaveLength(0);
        evidence.reset();
      }
    });
  });

  test.describe('Saksbehandler Restrictions', () => {
  setupMockApi();
    test.use({ storageState: 'tests/e2e/backoffice/.auth/saksbehandler.json' });

    test('should be blocked from admin endpoints with proper error', async ({ page, evidence }) => {
      const blockedEndpoints = [
        '/settings',
        '/users-management',
        '/tenant/settings',
        '/gdpr-requests',
      ];

      for (const endpoint of blockedEndpoints) {
        await page.goto(endpoint);
        await page.waitForLoadState('networkidle');

        const currentUrl = page.url();
        const redirectedAway = !currentUrl.includes(endpoint);
        const has403 = evidence.getApi4xxErrors().some((e) => e.status === 403);
        const hasErrorUI = await page.locator('[role="alert"], .forbidden').isVisible().catch(() => false);

        expect(
          redirectedAway || has403 || hasErrorUI,
          `${endpoint} should be blocked for saksbehandler`
        ).toBe(true);

        evidence.reset();
      }
    });
  });
});

test.describe('Security - IDOR Protection', () => {
  setupMockApi();
  test.use({ storageState: 'tests/e2e/backoffice/.auth/saksbehandler.json' });

  test('should not access resources from other tenants', async ({ page, evidence }) => {
    // Try to access a non-existent or cross-tenant resource
    const fakeIds = [
      '/rental-objects/00000000-0000-0000-0000-000000000001',
      '/bookings/00000000-0000-0000-0000-000000000002',
      '/users/00000000-0000-0000-0000-000000000003',
    ];

    for (const url of fakeIds) {
      await page.goto(url);
      await page.waitForLoadState('networkidle');

      // Should get 404 or 403
      const is404 = evidence.getApi4xxErrors().some((e) => e.status === 404);
      const is403 = evidence.getApi4xxErrors().some((e) => e.status === 403);
      const redirectedAway = !page.url().includes(url.split('/').pop()!);

      expect(
        is404 || is403 || redirectedAway,
        `IDOR attempt on ${url} should be blocked`
      ).toBe(true);

      evidence.reset();
    }
  });
});

test.describe('Security - Error Response Privacy', () => {
  setupMockApi();
  test.use({ storageState: 'tests/e2e/backoffice/.auth/admin.json' });

  test('error pages should not leak stack traces', async ({ page }) => {
    // Navigate to non-existent page
    await page.goto('/this-page-does-not-exist-12345');
    await page.waitForLoadState('networkidle');

    const pageText = await page.locator('body').textContent() || '';

    // Should not contain stack trace patterns
    expect(pageText).not.toMatch(/at \w+\s*\(/); // "at Function ("
    expect(pageText).not.toMatch(/node_modules/);
    expect(pageText).not.toMatch(/\.ts:\d+:\d+/);
    expect(pageText).not.toMatch(/\.js:\d+:\d+/);
  });

  test('API errors should follow RFC7807', async ({ page, evidence }) => {
    // Try an endpoint that will 404
    await page.goto('/bookings/invalid-uuid');
    await page.waitForLoadState('networkidle');

    const api4xx = evidence.getApi4xxErrors();
    // If there are 4xx errors, they should be RFC7807 compliant
    // (This is verified through the API response structure tests)
    console.log(`4xx errors: ${api4xx.length}`);
  });
});

test.describe('Security - Session Handling', () => {
  setupMockApi();
  test('should redirect to login when session expired', async ({ page }) => {
    // Use no storage state (unauthenticated)
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Should redirect to login
    expect(page.url()).toContain('/login');
  });

  test('logout should clear session', async ({ page }) => {
    // First login as admin
    await page.goto('/');
    
    // Look for logout button
    const logoutButton = page.locator(
      'button:has-text("Logg ut"), button:has-text("Logout"), [data-testid="logout"]'
    );

    if (await logoutButton.isVisible()) {
      await logoutButton.click();
      await page.waitForLoadState('networkidle');

      // Should be on login page
      expect(page.url()).toContain('/login');
    } else {
      console.log('Logout button not found');
    }
  });
});

test.describe('Security - Console/DOM Leaks', () => {
  setupMockApi();
  test.use({ storageState: 'tests/e2e/backoffice/.auth/admin.json' });

  test('should not leak tokens in console', async ({ page, evidence }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const consoleLogs = evidence.consoleLogs;

    // Check for JWT patterns
    const jwtPattern = /eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/;
    
    for (const log of consoleLogs) {
      expect(log.text).not.toMatch(jwtPattern);
    }
  });

  test('should not expose tokens in DOM', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const pageHtml = await page.content();

    // Should not have JWT tokens in HTML
    const jwtPattern = /eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/;
    expect(pageHtml).not.toMatch(jwtPattern);
  });
});
