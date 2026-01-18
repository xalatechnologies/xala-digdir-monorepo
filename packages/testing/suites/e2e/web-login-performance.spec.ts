// Skip E2E tests if not explicitly enabled
import { setupMockApi } from '@xala/api/mocks/api-server.mock';
/**
 * Web App Login Flow - Performance Tests
 *
 * Tests for login performance, session load times, and user experience metrics.
 */

import { test, expect } from '@playwright/test';

const WEB_URL = process.env.WEB_URL || 'http://localhost:5173';

/**
 * Helper: Mock successful session
 */
async function mockSession(page: any) {
  await page.route('**/api/auth/session', async (route: any) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: {
          userId: 'perf-test-user',
          user: { id: 'perf-test-user', name: 'Performance Test', email: 'perf@test.com' },
          tenantId: 'test-tenant',
        },
      }),
    });
  });
}

test.describe('Web Login Flow - Performance Tests', () => {
  setupMockApi();
  test('PERF-001: Homepage loads within acceptable time', async ({ page }) => {
    const startTime = Date.now();

    await page.goto(WEB_URL);

    // Wait for login button to be visible (indicates page is fully loaded)
    await page.waitForSelector('button:has-text("Logg inn")');

    const loadTime = Date.now() - startTime;

    console.log(`✅ Homepage load time: ${loadTime}ms`);

    // Should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test('PERF-002: Session check completes quickly', async ({ page }) => {
    await mockSession(page);

    await page.context().addCookies([{
      name: 'session',
      value: 'perf_session_token',
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      secure: false,
      sameSite: 'Strict',
    }]);

    const startTime = Date.now();

    await page.goto(WEB_URL);

    // Wait for user menu to appear (indicates session loaded)
    await page.waitForSelector('button', { hasText: 'Performance Test' });

    const sessionLoadTime = Date.now() - startTime;

    console.log(`✅ Session load time: ${sessionLoadTime}ms`);

    // Session check should complete within 2 seconds
    expect(sessionLoadTime).toBeLessThan(2000);
  });

  test('PERF-003: User dropdown opens without lag', async ({ page }) => {
    await mockSession(page);

    await page.context().addCookies([{
      name: 'session',
      value: 'perf_session_token',
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      secure: false,
      sameSite: 'Strict',
    }]);

    await page.goto(WEB_URL);
    await page.waitForSelector('button', { hasText: 'Performance Test' });

    const startTime = Date.now();

    // Click to open dropdown
    await page.click('button', { hasText: 'Performance Test' });

    // Wait for dropdown menu item
    await page.waitForSelector('button:has-text("Min side")');

    const dropdownOpenTime = Date.now() - startTime;

    console.log(`✅ Dropdown open time: ${dropdownOpenTime}ms`);

    // Dropdown should open within 500ms (instant feel)
    expect(dropdownOpenTime).toBeLessThan(500);
  });

  test('PERF-004: Login page transition is smooth', async ({ page }) => {
    await page.goto(WEB_URL);

    const startTime = Date.now();

    // Click login button
    await page.click('button:has-text("Logg inn")');

    // Wait for URL change and login page to load
    await page.waitForURL(`${WEB_URL}/login`);
    await page.waitForSelector('button:has-text("ID-porten")');

    const transitionTime = Date.now() - startTime;

    console.log(`✅ Login page transition time: ${transitionTime}ms`);

    // Page transition should be smooth (< 1 second)
    expect(transitionTime).toBeLessThan(1000);
  });

  test('PERF-005: Logout completes quickly', async ({ page }) => {
    await mockSession(page);

    // Mock logout endpoint
    await page.route('**/api/auth/logout', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: { success: true } }),
      });
    });

    await page.context().addCookies([{
      name: 'session',
      value: 'perf_session_token',
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      secure: false,
      sameSite: 'Strict',
    }]);

    await page.goto(WEB_URL);
    await page.waitForSelector('button', { hasText: 'Performance Test' });

    // Open dropdown
    await page.click('button', { hasText: 'Performance Test' });

    const startTime = Date.now();

    // Click logout
    await page.click('button:has-text("Logg ut")');

    // Wait for redirect and login button to appear
    await page.waitForSelector('button:has-text("Logg inn")');

    const logoutTime = Date.now() - startTime;

    console.log(`✅ Logout time: ${logoutTime}ms`);

    // Logout should complete within 2 seconds
    expect(logoutTime).toBeLessThan(2000);
  });

  test('PERF-006: Multiple rapid dropdown opens/closes perform well', async ({ page }) => {
    await mockSession(page);

    await page.context().addCookies([{
      name: 'session',
      value: 'perf_session_token',
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      secure: false,
      sameSite: 'Strict',
    }]);

    await page.goto(WEB_URL);
    await page.waitForSelector('button', { hasText: 'Performance Test' });

    const iterations = 10;
    const startTime = Date.now();

    for (let i = 0; i < iterations; i++) {
      // Open dropdown
      await page.click('button', { hasText: 'Performance Test' });
      await page.waitForSelector('button:has-text("Min side")');

      // Close by clicking outside
      await page.click('body', { position: { x: 10, y: 10 } });
      await page.waitForTimeout(100); // Small delay between cycles
    }

    const totalTime = Date.now() - startTime;
    const avgTime = totalTime / iterations;

    console.log(`✅ Average dropdown cycle time: ${avgTime}ms (${iterations} iterations)`);

    // Average cycle should be under 300ms
    expect(avgTime).toBeLessThan(300);
  });

  test('PERF-007: Session persistence check is non-blocking', async ({ page }) => {
    await mockSession(page);

    await page.context().addCookies([{
      name: 'session',
      value: 'perf_session_token',
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      secure: false,
      sameSite: 'Strict',
    }]);

    // Measure time to first paint/interaction
    await page.goto(WEB_URL);

    const metrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
      };
    });

    console.log(`✅ DOM Content Loaded: ${metrics.domContentLoaded}ms`);
    console.log(`✅ Load Complete: ${metrics.loadComplete}ms`);

    // DOM should be ready quickly even with session check
    expect(metrics.domContentLoaded).toBeLessThan(1500);
  });

  test('PERF-008: No memory leaks on repeated dropdown interactions', async ({ page }) => {
    await mockSession(page);

    await page.context().addCookies([{
      name: 'session',
      value: 'perf_session_token',
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      secure: false,
      sameSite: 'Strict',
    }]);

    await page.goto(WEB_URL);
    await page.waitForSelector('button', { hasText: 'Performance Test' });

    // Get initial memory usage
    const initialMemory = await page.evaluate(() => {
      if (performance.memory) {
        return performance.memory.usedJSHeapSize;
      }
      return 0;
    });

    // Perform many interactions
    for (let i = 0; i < 50; i++) {
      await page.click('button', { hasText: 'Performance Test' });
      await page.click('body', { position: { x: 10, y: 10 } });
    }

    // Get final memory usage
    const finalMemory = await page.evaluate(() => {
      if (performance.memory) {
        return performance.memory.usedJSHeapSize;
      }
      return 0;
    });

    if (initialMemory > 0 && finalMemory > 0) {
      const memoryIncrease = finalMemory - initialMemory;
      const increasePercent = (memoryIncrease / initialMemory) * 100;

      console.log(`✅ Memory increase: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB (${increasePercent.toFixed(1)}%)`);

      // Memory shouldn't increase by more than 50%
      expect(increasePercent).toBeLessThan(50);
    } else {
      console.log('⚠️  Memory API not available, skipping memory leak check');
    }
  });

  test('PERF-009: Concurrent session checks handle gracefully', async ({ browser }) => {
    const context = await browser.newContext();

    await context.route('**/api/auth/session', async (route) => {
      // Simulate slow network
      await new Promise(resolve => setTimeout(resolve, 100));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            userId: 'concurrent-test',
            user: { id: 'concurrent-test', name: 'Concurrent Test', email: 'concurrent@test.com' },
          },
        }),
      });
    });

    await context.addCookies([{
      name: 'session',
      value: 'concurrent_session_token',
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      secure: false,
      sameSite: 'Strict',
    }]);

    // Open multiple pages simultaneously
    const pages = await Promise.all([
      context.newPage(),
      context.newPage(),
      context.newPage(),
    ]);

    const startTime = Date.now();

    // Navigate all pages simultaneously
    await Promise.all(pages.map(p => p.goto(WEB_URL)));

    // Wait for all to show user menu
    await Promise.all(pages.map(p =>
      p.waitForSelector('button', { hasText: 'Concurrent Test' })
    ));

    const concurrentLoadTime = Date.now() - startTime;

    console.log(`✅ Concurrent load time (3 tabs): ${concurrentLoadTime}ms`);

    // All pages should load within 3 seconds even with concurrent requests
    expect(concurrentLoadTime).toBeLessThan(3000);

    // Cleanup
    await Promise.all(pages.map(p => p.close()));
    await context.close();
  });
});

console.log('✅ Web Login Performance Tests Loaded');
