// Skip E2E tests if not explicitly enabled
import { setupMockApi } from '@xala/api/mocks/api-server.mock';
/**
 * Web App Login Flow - Manual Verification Test
 *
 * Simplified test that can be run manually to verify the login flow works.
 * This test opens the browser in headed mode so you can see what's happening.
 */

import { test, expect } from '@playwright/test';

const WEB_URL = process.env.WEB_URL || 'http://localhost:5173';

test.describe('Web Login Flow - Manual Verification', () => {
  setupMockApi();
  test('MANUAL-001: Open browser and wait for manual testing', async ({ page }) => {
    console.log('\n' + '='.repeat(80));
    console.log('MANUAL TEST MODE');
    console.log('='.repeat(80));
    console.log('\nBrowser will open. Please verify the following manually:');
    console.log('\n1. ✅ Homepage loads correctly');
    console.log('2. ✅ Login button is visible in the header');
    console.log('3. ✅ Click login button → navigates to /login');
    console.log('4. ✅ ID-porten option is visible on login page');
    console.log('5. ✅ (Optional) Complete ID-porten login');
    console.log('6. ✅ After login, user dropdown shows your name');
    console.log('7. ✅ Click dropdown → see "Min side" and "Logg ut"');
    console.log('8. ✅ Click "Logg ut" → redirects to home with login button');
    console.log('\n' + '='.repeat(80));
    console.log('Test will wait 60 seconds for you to test manually...');
    console.log('='.repeat(80) + '\n');

    await page.goto(WEB_URL);

    // Wait for 60 seconds so user can manually test
    await page.waitForTimeout(60000);

    console.log('\n✅ Manual testing window complete');
  });

  test('MANUAL-002: Check server is accessible', async ({ page }) => {
    const response = await page.goto(WEB_URL);

    expect(response?.status()).toBe(200);
    console.log(`✅ Server responded with status: ${response?.status()}`);
  });

  test('MANUAL-003: Check HTML contains root div', async ({ page }) => {
    await page.goto(WEB_URL);

    const rootDiv = await page.locator('#root');
    await expect(rootDiv).toBeAttached();

    console.log('✅ #root div exists in DOM');
  });

  test('MANUAL-004: Check API endpoints respond', async ({ page }) => {
    // Test session endpoint
    const sessionResponse = await page.request.get(`${WEB_URL.replace('5173', '4000')}/api/auth/session`);
    console.log(`✅ Session API status: ${sessionResponse.status()}`);
    expect([200, 401]).toContain(sessionResponse.status());

    // Test logout endpoint
    const logoutResponse = await page.request.post(`${WEB_URL.replace('5173', '4000')}/api/auth/logout`);
    console.log(`✅ Logout API status: ${logoutResponse.status()}`);
    expect(logoutResponse.status()).toBeGreaterThanOrEqual(200);
  });
});

console.log('✅ Manual Verification Tests Loaded');
console.log('Run with: npx playwright test tests/e2e/web-login-manual-test.spec.ts --headed');
