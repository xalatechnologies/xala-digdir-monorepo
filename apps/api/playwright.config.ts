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
    ['html', { outputFolder: '../../tests/reports/e2e' }],
    ['json', { outputFile: '../../tests/reports/e2e/results.json' }],
  ],
  outputDir: '../../tests/artifacts',
  use: {
    baseURL: 'http://localhost:4000',
    extraHTTPHeaders: {
      'Content-Type': 'application/json',
      'x-tenant-id': 'test-tenant',
    },
    trace: 'on-first-retry',
    screenshot: {
      mode: 'only-on-failure',
      fullPage: true,
    },
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
