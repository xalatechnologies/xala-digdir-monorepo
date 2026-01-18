import { setupMockApi } from '../../../mocks/api-server.mock';
import { test, expect } from '@playwright/test';

test('check Minside login page', async ({ page }) => {
  await page.goto('http://localhost:5176/login');
  await page.waitForLoadState('networkidle');
  
  // Wait a bit for React to render
  await page.waitForTimeout(3000);
  
  // Take screenshot
  await page.screenshot({ path: 'tests/screenshots/minside-page-check.png', fullPage: true });
  
  // Get all buttons
  const buttons = await page.locator('button').all();
  console.log(`Found ${buttons.length} buttons`);
  
  for (const button of buttons) {
    const text = await button.textContent();
    const testid = await button.getAttribute('data-testid');
    console.log(`Button: "${text}" testid="${testid}"`);
  }
  
  // Get page title
  const title = await page.title();
  console.log(`Page title: ${title}`);
  
  // Check if root div has content
  const rootContent = await page.locator('#root').innerHTML();
  console.log(`Root has ${rootContent.length} characters`);
});
