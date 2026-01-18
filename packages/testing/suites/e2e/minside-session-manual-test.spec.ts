import { setupMockApi } from '../../mocks/api-server.mock';
/**
 * Minside App Session - Manual Verification Test
 *
 * Simplified test for manual verification of session persistence fix
 */

import { test, expect } from '@playwright/test';

const MINSIDE_URL = process.env.MINSIDE_URL || 'http://localhost:5174';

test.describe('Minside Session - Manual Verification', () => {
  setupMockApi();
  test('MANUAL-001: Open minside app for manual testing', async ({ page }) => {
    console.log('\n' + '='.repeat(80));
    console.log('MINSIDE SESSION MANUAL TEST');
    console.log('='.repeat(80));
    console.log('\nBrowser will open. Please verify the following manually:');
    console.log('\n📋 Session Persistence Tests:');
    console.log('1. ✅ Open minside app (http://localhost:5174)');
    console.log('2. ✅ If logged in, user menu/name should be visible');
    console.log('3. ✅ Refresh the page (F5 or Cmd+R)');
    console.log('4. ✅ VERIFY: User stays logged in (no flash of logout)');
    console.log('5. ✅ Refresh multiple times');
    console.log('6. ✅ VERIFY: User remains logged in each time');
    console.log('\n📋 Logout Tests:');
    console.log('7. ✅ Click logout button');
    console.log('8. ✅ VERIFY: Redirects to /login page');
    console.log('9. ✅ Open DevTools > Application > Local Storage');
    console.log('10. ✅ VERIFY: "minside_user" key is removed');
    console.log('\n📋 Cache Tests:');
    console.log('11. ✅ Login again');
    console.log('12. ✅ Open DevTools > Application > Local Storage');
    console.log('13. ✅ VERIFY: "minside_user" key exists with user data');
    console.log('14. ✅ Manually delete "minside_user" from localStorage');
    console.log('15. ✅ Refresh page');
    console.log('16. ✅ VERIFY: Still logged in (loads from server cookie)');
    console.log('\n' + '='.repeat(80));
    console.log('Test will wait 60 seconds for manual verification...');
    console.log('='.repeat(80) + '\n');

    await page.goto(MINSIDE_URL);

    // Wait for 60 seconds for manual testing
    await page.waitForTimeout(60000);

    console.log('\n✅ Manual testing window complete');
  });

  test('MANUAL-002: Check minside server is accessible', async ({ page }) => {
    const response = await page.goto(MINSIDE_URL);

    expect(response?.status()).toBe(200);
    console.log(`✅ Minside server responded with status: ${response?.status()}`);
  });

  test('MANUAL-003: Check HTML contains root div', async ({ page }) => {
    await page.goto(MINSIDE_URL);

    const rootDiv = await page.locator('#root');
    await expect(rootDiv).toBeAttached();

    console.log('✅ #root div exists in DOM');
  });

  test('MANUAL-004: Check localStorage after page load', async ({ page }) => {
    await page.goto(MINSIDE_URL);

    // Wait for page to load
    await page.waitForTimeout(2000);

    // Check if minside_user exists in localStorage
    const hasUser = await page.evaluate(() => {
      const user = localStorage.getItem('minside_user');
      return user !== null;
    });

    if (hasUser) {
      const userData = await page.evaluate(() => {
        return localStorage.getItem('minside_user');
      });
      console.log('✅ minside_user found in localStorage:', userData);
    } else {
      console.log('ℹ️  No minside_user in localStorage (not logged in)');
    }
  });
});

console.log('✅ Minside Session Manual Tests Loaded');
console.log('Run with: npx playwright test tests/e2e/minside-session-manual-test.spec.ts --headed --project=chromium');
