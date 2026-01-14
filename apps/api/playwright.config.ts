import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E Test Configuration
 * For API journey testing
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/e2e-results.json' }],
  ],
  use: {
    baseURL: 'http://localhost:4000',
    extraHTTPHeaders: {
      'Content-Type': 'application/json',
      'x-tenant-id': 'test-tenant',
    },
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'API Tests',
      testMatch: /.*\.spec\.ts/,
    },
  ],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:4000/health',
    reuseExistingServer: !process.env.CI,
    timeout: 30000,
  },
});
