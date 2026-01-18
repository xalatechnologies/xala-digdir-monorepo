// Skip E2E tests if not explicitly enabled
import { setupMockApi } from '../../../mocks/api-server.mock';
import { test } from '@playwright/test';
import { TEST_CREDENTIALS } from '../../fixtures/auth/auth.fixture';

test('Inspect login page structure', async ({ page }) => {
  console.log(`\n🔍 Inspecting: ${TEST_CREDENTIALS.user.baseUrl}/login`);

  await page.goto(TEST_CREDENTIALS.user.baseUrl + '/login', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  // Get all buttons
  const buttons = await page.locator('button').all();
  console.log(`\n📊 Found ${buttons.length} buttons:`);
  for (const button of buttons) {
    const text = await button.textContent();
    const testid = await button.getAttribute('data-testid');
    const visible = await button.isVisible();
    console.log(`  - "${text?.trim()}" | testid="${testid}" | visible=${visible}`);
  }

  // Get all inputs
  const inputs = await page.locator('input').all();
  console.log(`\n📝 Found ${inputs.length} inputs:`);
  for (const input of inputs) {
    const type = await input.getAttribute('type');
    const name = await input.getAttribute('name');
    const testid = await input.getAttribute('data-testid');
    const visible = await input.isVisible();
    console.log(`  - type="${type}" | name="${name}" | testid="${testid}" | visible=${visible}`);
  }

  // Check specific test IDs we expect
  console.log(`\n🎯 Checking expected test IDs:`);
  const expectedIds = [
    'login-option-demo-innlogging',
    'login-option-demo-login',
    'demo-name',
    'demo-email',
    'demo-token',
    'demo-submit',
  ];

  for (const id of expectedIds) {
    const exists = await page.getByTestId(id).count() > 0;
    const visible = exists ? await page.getByTestId(id).isVisible() : false;
    console.log(`  - ${id}: exists=${exists}, visible=${visible}`);
  }

  // Take screenshot
  await page.screenshot({ path: 'tests/screenshots/page-structure.png', fullPage: true });
  console.log(`\n📸 Screenshot saved to: tests/screenshots/page-structure.png`);

  // Get page HTML for inspection
  const html = await page.content();
  console.log(`\n📄 Page HTML length: ${html.length} characters`);

  // Check if there's a demo login dialog component
  const hasDemoDialog = html.includes('DemoLoginDialog') || html.includes('demo-login') || html.includes('demo-innlogging');
  console.log(`  - Contains demo login references: ${hasDemoDialog}`);
});
}
