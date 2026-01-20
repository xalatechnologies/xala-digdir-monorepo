import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  resolve: {
    dedupe: ['react', 'react-dom', 'react-router-dom'],
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: [
      // Only include tests from @digilist/testing package
      'packages/testing/suites/**/*.{test,spec}.{ts,tsx}',
    ],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.turbo/**',
      // Exclude all app and package tests - they should be moved to @digilist/testing
      'apps/**/*.{test,spec}.{ts,tsx}',
      'packages/!(testing)/**/*.{test,spec}.{ts,tsx}',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: [
        'packages/ds/src/**/*.{ts,tsx}',
        'packages/i18n/src/**/*.{ts,tsx}',
        'apps/web/src/**/*.{ts,tsx}',
        'apps/backoffice/src/**/*.{ts,tsx}',
        'apps/saas-admin/src/**/*.{ts,tsx}',
        'apps/tenant-admin/src/**/*.{ts,tsx}',
      ],
      exclude: ['**/*.{test,spec}.{ts,tsx}', '**/*.d.ts', '**/node_modules/**'],
    },
  },
});
