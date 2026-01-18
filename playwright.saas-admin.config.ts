import { defineConfig, devices } from '@playwright/test';

/**
 * SaaS Admin E2E Test Configuration
 *
 * Dedicated configuration for SaaS Admin control plane testing.
 * Run with: pnpm exec playwright test --config=playwright.saas-admin.config.ts
 */
export default defineConfig({
  testDir: './tests/e2e/saas-admin',
  testMatch: ['**/*.spec.ts'],

  /* Run tests in files in parallel */
  fullyParallel: true,

  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: !!process.env.CI,

  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,

  /* Single worker on CI for stability */
  workers: process.env.CI ? 1 : undefined,

  /* Timeout */
  timeout: 60000,

  /* Reporter */
  reporter: [
    ['html', { outputFolder: 'playwright-report/saas-admin' }],
    ['list'],
    ['json', { outputFile: 'tests/reports/saas-admin-e2e.json' }],
  ],

  /* Shared settings */
  use: {
    baseURL: 'http://localhost:5176',
    trace: 'on-first-retry',
    screenshot: {
      mode: 'only-on-failure',
      fullPage: true,
    },
    video: 'on-first-retry',
  },

  /* Output folders */
  outputDir: 'tests/artifacts/saas-admin',

  /* Projects */
  projects: [
    // Smoke tests (fast)
    {
      name: 'smoke',
      testMatch: '**/saas-admin-flow.spec.ts',
      use: { ...devices['Desktop Chrome'] },
    },

    // Full suite on Chrome
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    // Accessibility tests
    {
      name: 'a11y',
      testMatch: '**/saas-admin-a11y.spec.ts',
      use: { ...devices['Desktop Chrome'] },
    },

    // Localization tests
    {
      name: 'i18n',
      testMatch: '**/saas-admin-i18n.spec.ts',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  /* Web server configuration */
  webServer: {
    command: 'pnpm --filter @xala/saas-admin dev',
    url: 'http://localhost:5176',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
