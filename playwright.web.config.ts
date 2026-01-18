import { defineConfig, devices } from '@playwright/test';

/**
 * Web E2E Test Configuration
 * 
 * Tests the public-facing booking website
 */
export default defineConfig({
  testDir: './tests/e2e/web',
  
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report-web', open: 'never' }],
    ['json', { outputFile: 'test-results/web-results.json' }],
  ],
  
  use: {
    baseURL: process.env.WEB_URL || 'https://digilist.no',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
    locale: 'nb-NO',
    timezoneId: 'Europe/Oslo',
  },
  
  projects: [
    // Anonymous user tests (no auth required)
    {
      name: 'anonymous-chromium',
      use: { ...devices['Desktop Chrome'] },
      testMatch: /discovery|calendar|accessibility|synthetic-monitoring/,
    },
    
    // Setup for authenticated tests
    {
      name: 'user-setup',
      testMatch: /.*\.setup\.ts/,
    },
    
    // Authenticated user tests
    {
      name: 'user-chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'tests/e2e/web/.auth/user.json',
      },
      dependencies: ['user-setup'],
      testMatch: /booking|payment|security/,
    },
    
    // Mobile viewport
    {
      name: 'mobile-chromium',
      use: { ...devices['iPhone 13'] },
      testMatch: /discovery|accessibility/,
    },
  ],
  
  outputDir: 'test-results/web',
  timeout: 60000,
  expect: { timeout: 10000 },
  
  webServer: process.env.WEB_URL ? undefined : {
    command: 'pnpm --filter @xala/web dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
