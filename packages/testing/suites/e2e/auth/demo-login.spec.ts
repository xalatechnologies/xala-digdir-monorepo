// Skip E2E tests if not explicitly enabled
if (process.env.E2E_ENABLED !== 'true') {
  describe.skip('E2E tests require E2E_ENABLED=true', () => {});
} else {
import { setupMockApi } from '../../../mocks/api-server.mock';
/**
 * Demo Login E2E Test
 */
import { test, expect } from '@playwright/test';
import { LoginPage } from '../../helpers/pages/LoginPage';
import { TEST_CREDENTIALS } from '../../fixtures/auth/auth.fixture';

test.describe('Demo Login', () => {
  setupMockApi();
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
}
