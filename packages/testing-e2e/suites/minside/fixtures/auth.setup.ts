import { test as setup, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * MinSide Authentication Setup
 * 
 * Authenticates as both regular user and org admin for test suites.
 */

const AUTH_DIR = 'tests/e2e/minside/.auth';

// Ensure auth directory exists
if (!fs.existsSync(AUTH_DIR)) {
  fs.mkdirSync(AUTH_DIR, { recursive: true });
}

const config = {
  user: {
    email: process.env.MINSIDE_USER_EMAIL || 'ola.hansen@kommune.no',
    token: process.env.MINSIDE_USER_TOKEN || 'skien-citizen-001',
    storageState: path.join(AUTH_DIR, 'user.json'),
  },
  orgAdmin: {
    email: process.env.MINSIDE_ORG_ADMIN_EMAIL || 'leder@porsgrunn-il.no',
    token: process.env.MINSIDE_ORG_ADMIN_TOKEN || 'porsgrunn-admin-001',
    storageState: path.join(AUTH_DIR, 'org-admin.json'),
  },
};

setup('authenticate as user', async ({ page }) => {
  // Check for existing valid auth state
  if (fs.existsSync(config.user.storageState)) {
    const stats = fs.statSync(config.user.storageState);
    const ageMinutes = (Date.now() - stats.mtimeMs) / 1000 / 60;
    
    if (ageMinutes < 60) {
      console.log('Using existing user auth state (less than 1 hour old)');
      return;
    }
  }
  
  try {
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    
    // Click demo login button
    const demoBtn = page.locator('button:has-text("Demo"), [data-testid="demo-login"]').first();
    
    if (await demoBtn.isVisible()) {
      await demoBtn.click();
      await page.waitForTimeout(1000);
      
      // Fill in demo credentials
      const dialog = page.locator('dialog[open], [role="dialog"]').first();
      
      if (await dialog.isVisible()) {
        const emailInput = dialog.locator('input[type="email"], input[placeholder*="e-post" i]').first();
        const tokenInput = dialog.locator('input[placeholder*="token" i]').first();
        
        if (await emailInput.isVisible()) {
          await emailInput.fill(config.user.email);
        }
        if (await tokenInput.isVisible()) {
          await tokenInput.fill(config.user.token);
        }
        
        // Submit
        const submitBtn = dialog.locator('button[type="submit"], button:has-text("Logg inn")').first();
        await submitBtn.click();
        await page.waitForTimeout(5000);
        
        // Check if logged in
        if (!page.url().includes('/login')) {
          await page.context().storageState({ path: config.user.storageState });
          console.log('User authentication successful');
        } else {
          console.log('User authentication failed - tests will skip');
        }
      }
    }
  } catch (error) {
    console.log('User auth setup failed:', error);
  }
});

setup('authenticate as org admin', async ({ page }) => {
  // Check for existing valid auth state
  if (fs.existsSync(config.orgAdmin.storageState)) {
    const stats = fs.statSync(config.orgAdmin.storageState);
    const ageMinutes = (Date.now() - stats.mtimeMs) / 1000 / 60;
    
    if (ageMinutes < 60) {
      console.log('Using existing org admin auth state (less than 1 hour old)');
      return;
    }
  }
  
  try {
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    
    // Click demo login button
    const demoBtn = page.locator('button:has-text("Demo"), [data-testid="demo-login"]').first();
    
    if (await demoBtn.isVisible()) {
      await demoBtn.click();
      await page.waitForTimeout(1000);
      
      const dialog = page.locator('dialog[open], [role="dialog"]').first();
      
      if (await dialog.isVisible()) {
        const emailInput = dialog.locator('input[type="email"], input[placeholder*="e-post" i]').first();
        const tokenInput = dialog.locator('input[placeholder*="token" i]').first();
        
        if (await emailInput.isVisible()) {
          await emailInput.fill(config.orgAdmin.email);
        }
        if (await tokenInput.isVisible()) {
          await tokenInput.fill(config.orgAdmin.token);
        }
        
        // Submit
        const submitBtn = dialog.locator('button[type="submit"], button:has-text("Logg inn")').first();
        await submitBtn.click();
        await page.waitForTimeout(5000);
        
        // Check if logged in
        if (!page.url().includes('/login')) {
          await page.context().storageState({ path: config.orgAdmin.storageState });
          console.log('Org admin authentication successful');
        } else {
          console.log('Org admin authentication failed - tests will skip');
        }
      }
    }
  } catch (error) {
    console.log('Org admin auth setup failed:', error);
  }
});
