// Skip E2E tests if not explicitly enabled
import { setupMockApi } from '../../mocks/api-server.mock';
/**
 * Demo Login E2E Test
 */
import { test, expect } from '@playwright/test';
import { LoginPage } from '../../src/helpers/pages/LoginPage';
import { TEST_CREDENTIALS } from '../../src/fixtures/auth-credentials';

test.describe('Demo Login', () => {
  setupMockApi(test);
  test('Minside login', async ({ page }) => {
    await page.goto(TEST_CREDENTIALS.user.baseUrl + '/login', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000); // Wait for React to render

    const loginPage = new LoginPage(page);
    await loginPage.login(
      TEST_CREDENTIALS.user.name,
      TEST_CREDENTIALS.user.email,
      TEST_CREDENTIALS.user.token
    );

    await loginPage.waitForLoginSuccess();
    await expect(page).toHaveURL(/\/(dashboard|home|minside)/);
  });
});
