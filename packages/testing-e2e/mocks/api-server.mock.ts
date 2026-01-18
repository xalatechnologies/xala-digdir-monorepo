/**
 * Mock API Server Helper for E2E Tests
 * 
 * Provides mock API responses for isolated E2E testing
 */

import { test } from '@playwright/test';

/**
 * Setup mock API routes for E2E tests
 * Call this in test.describe blocks that need mocked API responses
 */
export function setupMockApi() {
  test.beforeEach(async ({ page }) => {
    // Mock common API endpoints
    await page.route('**/api/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: {
            id: 'test-user-id',
            email: 'test@example.com',
            role: 'admin',
            name: 'Test User'
          },
          tenantId: 'test-tenant-id'
        })
      });
    });

    await page.route('**/api/notifications/unread-count', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ count: 0 })
      });
    });

    await page.route('**/api/public/cities', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [{ name: 'Oslo', slug: 'oslo' }] })
      });
    });

    await page.route('**/api/public/rental-objects*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [{
            id: 'test-rental-object-1',
            name: 'Test Rental Object',
            slug: 'test-rental-object',
            category: 'LOKALER_OG_BANER',
            status: 'published'
          }],
          meta: { total: 1, page: 1, limit: 20, totalPages: 1 }
        })
      });
    });
  });
}

/**
 * Setup authenticated session for tests
 */
export function setupAuthenticatedSession() {
  test.beforeEach(async ({ page }) => {
    // Set auth cookies/storage
    await page.context().addCookies([
      {
        name: 'session',
        value: 'test-session-token',
        domain: 'localhost',
        path: '/'
      }
    ]);
  });
}

export default { setupMockApi, setupAuthenticatedSession };
