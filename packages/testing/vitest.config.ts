import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./src/setup/vitest.setup.ts'],
    
    // Include all test suites
    include: [
      'suites/**/*.test.{ts,tsx}',
      'contracts/**/*.test.{ts,tsx}',
    ],
    
    // Exclude E2E tests (run with Playwright)
    exclude: [
      'suites/e2e/**',
      'suites/compliance/wcag/**',
      '**/node_modules/**',
    ],
    
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './reports/coverage',
      include: [
        'src/**/*.ts',
        'src/**/*.tsx',
      ],
      exclude: [
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
        '**/node_modules/**',
      ],
    },
    
    // Reporter configuration
    reporters: ['default'],
    outputFile: {
      junit: './reports/junit/results.xml',
      html: './reports/html/index.html',
    },
    
    // Alias for easier imports
    alias: {
      '@testing': resolve(__dirname, './src'),
      '@fixtures': resolve(__dirname, './src/fixtures'),
      '@mocks': resolve(__dirname, './src/mocks'),
      '@utils': resolve(__dirname, './src/utils'),
    },
    
    // Pool configuration for faster tests
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: false,
      },
    },
    
    // Timeouts
    testTimeout: 10000,
    hookTimeout: 10000,
  },
  
  resolve: {
    alias: {
      '@digilist/testing': resolve(__dirname, './src'),
    },
  },
});
