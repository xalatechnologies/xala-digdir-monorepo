import { test } from '@playwright/test';
import { LoginPage } from '../../helpers/pages/LoginPage';
import { TEST_CREDENTIALS } from '../../fixtures/auth/auth.fixture';

test('Login diagnostic - capture full flow', async ({ page }) => {
  const errors: string[] = [];
  const consoleMessages: { type: string; text: string }[] = [];
  const networkRequests: { url: string; status?: number; method: string }[] = [];

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

  // Capture network requests
  page.on('request', request => {
    if (request.url().includes('/api/')) {
      networkRequests.push({
        url: request.url(),
        method: request.method(),
      });
    }
  });

  page.on('response', response => {
    if (response.url().includes('/api/')) {
      const existing = networkRequests.find(r => r.url === response.url());
      if (existing) {
        existing.status = response.status();
      }
    }
  });

  // Navigate to login
  console.log('\n=== NAVIGATING TO LOGIN PAGE ===');
  await page.goto(TEST_CREDENTIALS.user.baseUrl + '/login', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  // Check for demo login button
  const loginPage = new LoginPage(page);
  const demoButtonVisible = await loginPage.demoLoginButton.isVisible().catch(() => false);
  console.log(`Demo login button visible: ${demoButtonVisible}`);

  if (demoButtonVisible) {
    console.log('\n=== CLICKING DEMO LOGIN BUTTON ===');
    await loginPage.demoLoginButton.click();
    await page.waitForTimeout(1000);
  }

  // Check if form fields are visible
  const nameVisible = await loginPage.nameInput.isVisible().catch(() => false);
  const emailVisible = await loginPage.emailInput.isVisible().catch(() => false);
  const tokenVisible = await loginPage.tokenInput.isVisible().catch(() => false);

  console.log(`Form fields visible - Name: ${nameVisible}, Email: ${emailVisible}, Token: ${tokenVisible}`);

  if (nameVisible && emailVisible && tokenVisible) {
    console.log('\n=== FILLING FORM ===');
    await loginPage.nameInput.fill(TEST_CREDENTIALS.user.name);
    await loginPage.emailInput.fill(TEST_CREDENTIALS.user.email);
    await loginPage.tokenInput.fill(TEST_CREDENTIALS.user.token);

    console.log('\n=== CLICKING SUBMIT ===');
    await loginPage.loginButton.click();
    await page.waitForTimeout(3000);

    // Check current URL
    const currentUrl = page.url();
    console.log(`Current URL after submit: ${currentUrl}`);

    // Check if still on login page
    if (currentUrl.includes('/login')) {
      console.log('⚠️ Still on login page after submit');

      // Check for error messages
      const errorMessage = await page.locator('[role="alert"]').textContent().catch(() => null);
      if (errorMessage) {
        console.log(`Error message: ${errorMessage}`);
      }
    } else {
      console.log('✅ Redirected away from login page');
    }
  }

  // Print all captured data
  console.log('\n=== PAGE ERRORS ===');
  if (errors.length > 0) {
    errors.forEach(err => console.log(`ERROR: ${err}`));
  } else {
    console.log('No page errors');
  }

  console.log('\n=== CONSOLE MESSAGES (last 20) ===');
  consoleMessages.slice(-20).forEach(msg => {
    console.log(`[${msg.type.toUpperCase()}] ${msg.text}`);
  });

  console.log('\n=== API REQUESTS ===');
  if (networkRequests.length > 0) {
    networkRequests.forEach(req => {
      console.log(`${req.method} ${req.url} - Status: ${req.status || 'pending'}`);
    });
  } else {
    console.log('No API requests made');
  }

  // Take final screenshot
  await page.screenshot({ path: 'tests/screenshots/login-diagnostic-final.png', fullPage: true });
  console.log('\n📸 Screenshot saved to: tests/screenshots/login-diagnostic-final.png');
});
