// Skip E2E tests if not explicitly enabled
import { setupMockApi } from '../../../mocks/api-server.mock';
import { test } from '@playwright/test';

test('check for browser errors preventing React mount', async ({ page }) => {
  const errors: string[] = [];
  const consoleMessages: { type: string; text: string }[] = [];

  // Capture page errors
  page.on('pageerror', error => {
    errors.push(error.message);
  });

  // Capture console messages
  page.on('console', msg => {
    consoleMessages.push({
      type: msg.type(),
      text: msg.text(),
    });
  });

  await page.goto('http://localhost:5176/login', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000); // Wait for errors to appear

  console.log('\n=== PAGE ERRORS ===');
  if (errors.length > 0) {
    errors.forEach(err => console.log('ERROR:', err));
  } else {
    console.log('No page errors found');
  }

  console.log('\n=== CONSOLE MESSAGES ===');
  consoleMessages.forEach(msg => {
    console.log(`[${msg.type.toUpperCase()}] ${msg.text}`);
  });

  // Check if React mounted
  const rootContent = await page.locator('#root').innerHTML();
  console.log(`\n=== ROOT DIV STATUS ===`);
  console.log(`Root has ${rootContent.length} characters`);

  if (rootContent.length === 0) {
    console.log('\n⚠️ React app DID NOT mount - check errors above');
  } else {
    console.log('\n✅ React app mounted successfully');
  }
});
}
