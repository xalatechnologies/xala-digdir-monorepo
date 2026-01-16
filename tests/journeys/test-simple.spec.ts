import { test, expect } from '@playwright/test';
import { APP_URLS } from './helpers';

test.describe('Simple Test', () => {
  test('should load web app', async ({ page }) => {
    await page.goto(APP_URLS.web);
    expect(await page.title()).toBeTruthy();
  });
});
