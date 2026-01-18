import { defineConfig, devices } from '@playwright/test';

/**
 * MinSide E2E Test Configuration
 */
export default defineConfig({
  testDir: './tests/e2e/minside',
  
  // Run tests in files in parallel
  fullyParallel: true,
  
  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,
  
  // Retry on CI only
  retries: process.env.CI ? 2 : 0,
  
  // Opt out of parallel tests on CI
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter to use
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report-minside', open: 'never' }],
    ['json', { outputFile: 'test-results/minside-results.json' }],
  ],
  
  // Shared settings for all the projects below
  use: {
    // Base URL
    baseURL: process.env.MINSIDE_URL || 'https://minside.digilist.no',
    
    // Collect trace when retrying the failed test
    trace: 'on-first-retry',
    
    // Screenshot on failure
    screenshot: 'only-on-failure',
    
    // Video on first retry
    video: 'on-first-retry',
    
    // Locale
    locale: 'nb-NO',
    timezoneId: 'Europe/Oslo',
  },
  
  // Configure projects for major browsers
  projects: [
    // Setup project for authentication
    {
      name: 'user-setup',
      testMatch: /.*\.setup\.ts/,
    },
    
    // Authenticated user tests
    {
      name: 'user-chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'tests/e2e/minside/.auth/user.json',
      },
      dependencies: ['user-setup'],
    },
    
    // Org admin tests
    {
      name: 'org-admin-chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'tests/e2e/minside/.auth/org-admin.json',
      },
      dependencies: ['user-setup'],
    },
    
    // Mobile viewport
    {
      name: 'user-mobile',
      use: {
        ...devices['iPhone 13'],
        storageState: 'tests/e2e/minside/.auth/user.json',
      },
      dependencies: ['user-setup'],
    },
  ],
  
  // Output directory
  outputDir: 'test-results/minside',
  
  // Global timeout
  timeout: 60000,
  expect: { timeout: 10000 },
  
  // Web server for local dev
  webServer: process.env.MINSIDE_URL ? undefined : {
    command: 'pnpm --filter @xala/minside dev',
    url: 'http://localhost:5174',
    reuseExistingServer: !process.env.CI,
  },
});
