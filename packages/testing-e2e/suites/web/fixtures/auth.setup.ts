import { test as setup, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Web Auth Setup
 */

const AUTH_DIR = 'tests/e2e/web/.auth';

if (!fs.existsSync(AUTH_DIR)) {
  fs.mkdirSync(AUTH_DIR, { recursive: true });
}

const config = {
  user: {
    email: process.env.WEB_USER_EMAIL || 'ola.hansen@kommune.no',
    token: process.env.WEB_USER_TOKEN || 'skien-citizen-001',
    storageState: path.join(AUTH_DIR, 'user.json'),
  },
};

setup('authenticate as user', async ({ page }) => {
  if (fs.existsSync(config.user.storageState)) {
    const stats = fs.statSync(config.user.storageState);
    const ageMinutes = (Date.now() - stats.mtimeMs) / 1000 / 60;
    
    if (ageMinutes < 60) {
      console.log('Using existing web user auth state');
      return;
    }
  }
  
  try {
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    
    const demoBtn = page.locator('button:has-text("Demo"), [data-testid="demo-login"]').first();
    
    if (await demoBtn.isVisible()) {
      await demoBtn.click();
      await page.waitForTimeout(1000);
      
      const dialog = page.locator('dialog[open], [role="dialog"]').first();
      
      if (await dialog.isVisible()) {
        const emailInput = dialog.locator('input[type="email"]').first();
        const tokenInput = dialog.locator('input[placeholder*="token" i]').first();
        
        if (await emailInput.isVisible()) {
          await emailInput.fill(config.user.email);
        }
        if (await tokenInput.isVisible()) {
          await tokenInput.fill(config.user.token);
        }
        
        const submitBtn = dialog.locator('button[type="submit"]').first();
        await submitBtn.click();
        await page.waitForTimeout(5000);
        
        if (!page.url().includes('/login')) {
          await page.context().storageState({ path: config.user.storageState });
          console.log('Web user authentication successful');
        }
      }
    }
  } catch (error) {
    console.log('Web auth setup failed:', error);
  }
});
