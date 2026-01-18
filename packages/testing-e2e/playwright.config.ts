import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E Test Configuration
 * Separated from vitest to avoid expect() conflicts
 */
export default defineConfig({
  testDir: './suites',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'github' : 'list',
  timeout: 60000,
  
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
    extraHTTPHeaders: {
      'X-API-URL': process.env.API_URL || 'http://localhost:4000', // Docker API
    },
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // WebServer is handled by Docker (docker-compose.dev.yml)
  // Don't start a local server - tests run against Docker services
});
