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
      '@testing': resolve(__dirname, './'),
      '@digilist/database-schema': resolve(__dirname, '../database-schema/src'),
      '@digilist/client-sdk': resolve(__dirname, '../client-sdk/src'),
      '@digilist/contracts': resolve(__dirname, '../contracts/src'),
      '@xala/i18n': resolve(__dirname, '../i18n/src'),
      '@xala/ds': resolve(__dirname, '../ds/src'),
      // Stub API imports for tests
      '../../apps/api/src': resolve(__dirname, './stubs/api-imports'),
      '../projections': resolve(__dirname, './stubs/api-imports'),
      '../schemas': resolve(__dirname, './stubs/api-imports'),
      'yaml': resolve(__dirname, './stubs/yaml-stub'),
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
