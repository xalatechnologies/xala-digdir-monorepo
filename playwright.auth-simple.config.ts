import { defineConfig, devices } from '@playwright/test';

/**
 * Simplified Playwright E2E Test Configuration for Authentication Tests
 *
 * This config assumes servers are already running via `pnpm dev`.
 * Use this when you have apps running and just want to run tests.
 *
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests/e2e',
  testMatch: ['auth/**/*.spec.ts'],

  /* Run tests in files in parallel */
  fullyParallel: false, // Run serially for auth tests to avoid conflicts

  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,

  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,

  /* Single worker for auth tests to avoid session conflicts */
  workers: 1,

  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html', { outputFolder: 'tests/reports/e2e' }],
    ['list'],
  ],

  /* Output folders for artifacts */
  outputDir: 'tests/artifacts',

  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:5173',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',

    /* Take screenshot on failure */
    screenshot: {
      mode: 'only-on-failure',
      fullPage: true,
    },

    /* Increased timeout for auth flows */
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  /* No webServer - assumes apps are already running */
});
