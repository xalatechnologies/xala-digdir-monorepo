import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./vitest.setup.ts', './src/setup/vitest.setup.ts'],
    
    // Include all test suites
    include: [
      'suites/**/*.{test,spec}.{ts,tsx}',
      'contracts/**/*.{test,spec}.{ts,tsx}',
    ],
    
    // Exclude E2E tests (run with Playwright) and tests with broken imports
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
    
    // Alias for monorepo packages to resolve unit/integration tests
    alias: {
      '@testing': resolve(__dirname, './'),
      '@digilist/database-schema': resolve(__dirname, '../database-schema/dist'),
      '@digilist/client-sdk': resolve(__dirname, '../client-sdk/src'),
      '@digilist/contracts': resolve(__dirname, '../contracts/src'),
      '@digilist/testing': resolve(__dirname, './src'),
      '@xala/i18n': resolve(__dirname, '../i18n/src'),
      '@xala/ds': resolve(__dirname, '../ds/src'),
      '@xala/auth': resolve(__dirname, '../auth/src'),
      '@xala/api': resolve(__dirname, '../../apps/api/src'),
      '@xala/web': resolve(__dirname, '../../apps/web/src'),
      '@xala/backoffice': resolve(__dirname, '../../apps/backoffice/src'),
      '@xala/saas-admin': resolve(__dirname, '../../apps/saas-admin/src'),
      // Stub API imports for tests
      '../../apps/api/src': resolve(__dirname, '../../apps/api/src'),
      '../projections': resolve(__dirname, '../../apps/api/src/projections'),
      '../schemas': resolve(__dirname, '../../apps/api/src/schemas'),
      'yaml': resolve(__dirname, './stubs/yaml-stub'),
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
