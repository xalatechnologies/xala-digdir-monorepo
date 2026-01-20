/**
 * Authentication Setup for Golden Journey E2E Tests
 * 
 * Creates authenticated storage states for:
 * - Citizen user
 * - Case handler user
 * - Admin user
 * 
 * These storage states are used by Playwright projects to avoid repeated logins.
 */

import { test as setup, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const AUTH_DIR = path.join(__dirname, '../../../test-results/auth');

// Ensure auth directory exists
if (!fs.existsSync(AUTH_DIR)) {
  fs.mkdirSync(AUTH_DIR, { recursive: true });
}

const CITIZEN_FILE = path.join(AUTH_DIR, 'citizen.json');
const CASEHANDLER_FILE = path.join(AUTH_DIR, 'casehandler.json');
const ADMIN_FILE = path.join(AUTH_DIR, 'admin.json');

// Test credentials (from E2E seed)
const E2E_USERS = {
  citizen: {
    email: 'e2e.citizen@example.com',
    password: 'E2ETest123!',
  },
  caseHandler: {
    email: 'e2e.casehandler@example.com',
    password: 'E2ETest123!',
  },
  admin: {
    email: 'e2e.admin@example.com',
    password: 'E2ETest123!',
  },
};

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:4000';
const MINSIDE_BASE_URL = process.env.MINSIDE_BASE_URL || 'http://localhost:5174';
const BACKOFFICE_BASE_URL = process.env.BACKOFFICE_BASE_URL || 'http://localhost:5175';

/**
 * Authenticate citizen user and save storage state
 */
setup('authenticate citizen', async ({ page, context }) => {
  console.log('🔐 Authenticating citizen user...');
  
  // Navigate to MinSide login
  await page.goto(MINSIDE_BASE_URL);
  
  // Check for demo login button (if available)
  const demoLoginButton = page.locator('[data-testid="demo-login-button"]');
  const hasDemoLogin = await demoLoginButton.isVisible({ timeout: 3000 }).catch(() => false);
  
  if (hasDemoLogin) {
    console.log('   Using demo login flow...');
    await demoLoginButton.click();
    
    // Select citizen role
    const citizenOption = page.locator('[data-testid="demo-role-citizen"]');
    await citizenOption.click();
    
    // Submit
    const submitButton = page.locator('[data-testid="demo-login-submit"]');
    await submitButton.click();
  } else {
    console.log('   Using standard login flow...');
    // Standard login flow
    await page.fill('input[type="email"]', E2E_USERS.citizen.email);
    await page.fill('input[type="password"]', E2E_USERS.citizen.password);
    await page.click('button[type="submit"]');
  }
  
  // Wait for navigation to dashboard
  await page.waitForURL('**/dashboard', { timeout: 15000 });
  
  // Verify authentication succeeded
  const userMenuButton = page.locator('[data-testid="user-menu-button"]');
  await expect(userMenuButton).toBeVisible({ timeout: 5000 });
  
  console.log('   ✅ Citizen authenticated successfully');
  
  // Save signed-in state
  await context.storageState({ path: CITIZEN_FILE });
  console.log(`   ✅ Storage state saved to ${CITIZEN_FILE}`);
});

/**
 * Authenticate case handler user and save storage state
 */
setup('authenticate case handler', async ({ page, context }) => {
  console.log('🔐 Authenticating case handler user...');
  
  // Navigate to Backoffice login
  await page.goto(BACKOFFICE_BASE_URL);
  
  // Check for demo login button
  const demoLoginButton = page.locator('[data-testid="demo-login-button"]');
  const hasDemoLogin = await demoLoginButton.isVisible({ timeout: 3000 }).catch(() => false);
  
  if (hasDemoLogin) {
    console.log('   Using demo login flow...');
    await demoLoginButton.click();
    
    // Select case handler role
    const caseHandlerOption = page.locator('[data-testid="demo-role-casehandler"]');
    await caseHandlerOption.click();
    
    // Submit
    const submitButton = page.locator('[data-testid="demo-login-submit"]');
    await submitButton.click();
  } else {
    console.log('   Using standard login flow...');
    await page.fill('input[type="email"]', E2E_USERS.caseHandler.email);
    await page.fill('input[type="password"]', E2E_USERS.caseHandler.password);
    await page.click('button[type="submit"]');
  }
  
  // Wait for navigation to dashboard
  await page.waitForURL('**/dashboard', { timeout: 15000 });
  
  // Verify authentication succeeded
  const userMenuButton = page.locator('[data-testid="user-menu-button"]');
  await expect(userMenuButton).toBeVisible({ timeout: 5000 });
  
  console.log('   ✅ Case handler authenticated successfully');
  
  // Save signed-in state
  await context.storageState({ path: CASEHANDLER_FILE });
  console.log(`   ✅ Storage state saved to ${CASEHANDLER_FILE}`);
});

/**
 * Authenticate admin user and save storage state
 */
setup('authenticate admin', async ({ page, context }) => {
  console.log('🔐 Authenticating admin user...');
  
  // Navigate to Backoffice login
  await page.goto(BACKOFFICE_BASE_URL);
  
  // Check for demo login button
  const demoLoginButton = page.locator('[data-testid="demo-login-button"]');
  const hasDemoLogin = await demoLoginButton.isVisible({ timeout: 3000 }).catch(() => false);
  
  if (hasDemoLogin) {
    console.log('   Using demo login flow...');
    await demoLoginButton.click();
    
    // Select admin role
    const adminOption = page.locator('[data-testid="demo-role-admin"]');
    await adminOption.click();
    
    // Submit
    const submitButton = page.locator('[data-testid="demo-login-submit"]');
    await submitButton.click();
  } else {
    console.log('   Using standard login flow...');
    await page.fill('input[type="email"]', E2E_USERS.admin.email);
    await page.fill('input[type="password"]', E2E_USERS.admin.password);
    await page.click('button[type="submit"]');
  }
  
  // Wait for navigation to dashboard
  await page.waitForURL('**/dashboard', { timeout: 15000 });
  
  // Verify authentication succeeded
  const userMenuButton = page.locator('[data-testid="user-menu-button"]');
  await expect(userMenuButton).toBeVisible({ timeout: 5000 });
  
  console.log('   ✅ Admin authenticated successfully');
  
  // Save signed-in state
  await context.storageState({ path: ADMIN_FILE });
  console.log(`   ✅ Storage state saved to ${ADMIN_FILE}`);
});
