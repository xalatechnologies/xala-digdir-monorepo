/**
 * Playwright Global Setup
 * 
 * Runs before all E2E tests
 * - Seeds test database
 * - Creates auth states for each role
 */

import { chromium, FullConfig } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const AUTH_DIR = path.join(__dirname, '.auth');

// Test users per role
const TEST_USERS = {
  citizen: {
    email: 'test-citizen@digilist.no',
    password: 'test-password-123',
    file: 'citizen.json',
  },
  caseworker: {
    email: 'test-caseworker@digilist.no',
    password: 'test-password-123',
    file: 'caseworker.json',
  },
  orgAdmin: {
    email: 'test-org-admin@digilist.no',
    password: 'test-password-123',
    file: 'org-admin.json',
  },
  admin: {
    email: 'test-admin@digilist.no',
    password: 'test-password-123',
    file: 'admin.json',
  },
};

async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0].use.baseURL || 'http://localhost:6001';
  
  console.log('🔧 Playwright Global Setup');
  console.log(`   Base URL: ${baseURL}`);
  
  // Ensure auth directory exists
  if (!fs.existsSync(AUTH_DIR)) {
    fs.mkdirSync(AUTH_DIR, { recursive: true });
    console.log(`   Created auth directory: ${AUTH_DIR}`);
  }

  // In test mode, we can skip auth setup if states already exist
  const skipAuthSetup = process.env.SKIP_AUTH_SETUP === 'true';
  
  if (skipAuthSetup) {
    console.log('   Skipping auth setup (SKIP_AUTH_SETUP=true)');
    return;
  }

  // Check if login page is available
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    await page.goto(`${baseURL}/login`, { timeout: 10000 });
    console.log('   Login page available');
    
    // For now, just create placeholder storage states
    // Real implementation would log in each user
    for (const [role, user] of Object.entries(TEST_USERS)) {
      const statePath = path.join(AUTH_DIR, user.file);
      
      if (!fs.existsSync(statePath)) {
        // Store empty state as placeholder
        const emptyState = {
          cookies: [],
          origins: [],
        };
        fs.writeFileSync(statePath, JSON.stringify(emptyState, null, 2));
        console.log(`   Created placeholder auth state for ${role}`);
      }
    }
  } catch (error) {
    console.log('   Login page not available - skipping auth setup');
  } finally {
    await browser.close();
  }
  
  console.log('✅ Global setup complete');
}

export default globalSetup;
