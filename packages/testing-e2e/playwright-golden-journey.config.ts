import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E Test Configuration for Golden Booking Journey
 * 
 * Configured for multi-app testing:
 * - Web (public portal)
 * - MinSide (citizen portal)
 * - Backoffice (case handler portal)
 * 
 * Each project uses separate baseURL and authentication storage state.
 */
export default defineConfig({
  testDir: './suites',
  testMatch: ['**/golden-journey*.spec.ts'],
  
  fullyParallel: false, // Sequential for golden journey
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 1, // Single worker for deterministic execution
  
  reporter: [
    ['html', { outputFolder: 'test-results/html', open: 'never' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['list'],
  ],
  
  timeout: 90000, // 90 seconds per test
  expect: {
    timeout: 10000, // 10 seconds for assertions
  },
  
  use: {
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    
    // Add booking reference to test attachments for debugging
    extraHTTPHeaders: {
      'X-Test-Suite': 'golden-journey',
    },
  },

  outputDir: 'test-results/artifacts',

  // Configure projects for each app
  projects: [
    // Setup: Authenticate users before running tests
    {
      name: 'setup',
      testMatch: '**/auth.setup.ts',
    },

    // Web (Public Portal) - Unauthenticated + Authenticated Citizen
    {
      name: 'web-guest',
      testMatch: ['**/golden-journey-web*.spec.ts'],
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env.WEB_BASE_URL || 'http://localhost:5173',
        // No storage state = guest user
      },
      dependencies: ['setup'],
    },

    // MinSide (Citizen Portal) - Authenticated Citizen
    {
      name: 'minside-citizen',
      testMatch: ['**/golden-journey-minside*.spec.ts'],
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env.MINSIDE_BASE_URL || 'http://localhost:5174',
        storageState: 'test-results/auth/citizen.json',
      },
      dependencies: ['setup'],
    },

    // Backoffice (Case Handler Portal) - Authenticated Case Handler
    {
      name: 'backoffice-casehandler',
      testMatch: ['**/golden-journey-backoffice*.spec.ts'],
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env.BACKOFFICE_BASE_URL || 'http://localhost:5175',
        storageState: 'test-results/auth/casehandler.json',
      },
      dependencies: ['setup'],
    },

    // Full Golden Journey (orchestrated across all apps)
    {
      name: 'golden-journey-full',
      testMatch: ['**/golden-journey-full.spec.ts'],
      use: {
        ...devices['Desktop Chrome'],
      },
      dependencies: ['setup'],
    },
  ],

  // Web servers (development mode)
  webServer: process.env.CI ? undefined : [
    {
      command: 'pnpm --filter @xala/web dev',
      url: 'http://localhost:5173',
      reuseExistingServer: true,
      timeout: 120 * 1000,
    },
    {
      command: 'pnpm --filter @xala/minside dev',
      url: 'http://localhost:5174',
      reuseExistingServer: true,
      timeout: 120 * 1000,
    },
    {
      command: 'pnpm --filter @xala/backoffice dev',
      url: 'http://localhost:5175',
      reuseExistingServer: true,
      timeout: 120 * 1000,
    },
    {
      command: 'pnpm --filter @digilist/api dev',
      url: 'http://localhost:4000/health',
      reuseExistingServer: true,
      timeout: 120 * 1000,
    },
  ],
});
