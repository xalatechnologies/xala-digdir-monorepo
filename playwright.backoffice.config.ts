import { defineConfig, devices } from '@playwright/test';

/**
 * Backoffice Playwright Configuration
 * 
 * Specialized config for exhaustive backoffice E2E testing.
 */
export default defineConfig({
  testDir: './tests/e2e/backoffice',
  
  // Run with high parallelism for faster execution
  fullyParallel: true,
  workers: process.env.CI ? 4 : undefined,
  
  // Fail build on test.only in CI
  forbidOnly: !!process.env.CI,
  
  // Retry on CI only
  retries: process.env.CI ? 2 : 0,
  
  // Reporter configuration
  reporter: [
    ['html', { outputFolder: 'playwright-report/backoffice' }],
    ['json', { outputFile: 'playwright-report/backoffice/results.json' }],
    ['list'],
  ],
  
  // Global timeout for each test
  timeout: 60_000,
  
  // Expect timeout
  expect: {
    timeout: 10_000,
  },
  
  use: {
    // Base URL for backoffice
    baseURL: process.env.BACKOFFICE_URL || 'https://backoffice.digilist.no',
    
    // Collect trace on failure
    trace: 'on-first-retry',
    
    // Screenshot on failure
    screenshot: 'only-on-failure',
    
    // Video on failure
    video: 'on-first-retry',
    
    // Extra HTTP headers
    extraHTTPHeaders: {
      'Accept-Language': 'nb-NO,nb,en',
    },
  },

  // Projects for different roles and browsers
  projects: [
    // Auth setup projects
    {
      name: 'admin-setup',
      testMatch: /auth\.setup\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'saksbehandler-setup',
      testMatch: /saksbehandler\.setup\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    
    // Admin tests
    {
      name: 'admin-chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'tests/e2e/backoffice/.auth/admin.json',
      },
      dependencies: ['admin-setup'],
      testIgnore: /saksbehandler/,
    },
    
    // Saksbehandler tests
    {
      name: 'saksbehandler-chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'tests/e2e/backoffice/.auth/saksbehandler.json',
      },
      dependencies: ['saksbehandler-setup'],
      testMatch: /saksbehandler|shared/,
    },
    
    // Smoke tests (fast, both roles)
    {
      name: 'smoke',
      testMatch: /smoke\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    
    // WCAG accessibility tests
    {
      name: 'wcag',
      testMatch: /wcag\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'tests/e2e/backoffice/.auth/admin.json',
      },
      dependencies: ['admin-setup'],
    },
  ],
  
  // Web server (optional for local dev)
  // webServer: {
  //   command: 'pnpm --filter @digilist/backoffice dev',
  //   url: 'http://localhost:5173',
  //   reuseExistingServer: !process.env.CI,
  // },
});
