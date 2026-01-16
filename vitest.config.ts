import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@xala/i18n': path.resolve(__dirname, 'packages/i18n/src'),
      '@xala/ds': path.resolve(__dirname, 'packages/ds/src'),
      '@digilist/client-sdk': path.resolve(__dirname, 'packages/client-sdk/src'),
      '@digilist/client-sdk/hooks': path.resolve(__dirname, 'packages/client-sdk/src/hooks'),
      '@digilist/client-sdk/types': path.resolve(__dirname, 'packages/client-sdk/src/types'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: [
      'packages/ds/src/**/*.{test,spec}.{ts,tsx}',
      'apps/web/src/**/*.{test,spec}.{ts,tsx}',
      'apps/backoffice/src/**/*.{test,spec}.{ts,tsx}',
      'apps/saas-admin/src/**/*.{test,spec}.{ts,tsx}',
      'tests/**/*.{test,spec}.{ts,tsx}',
    ],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.turbo/**',
      'apps/api/**',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['packages/ds/src/**/*.{ts,tsx}', 'apps/web/src/**/*.{ts,tsx}', 'apps/backoffice/src/**/*.{ts,tsx}', 'apps/saas-admin/src/**/*.{ts,tsx}'],
      exclude: [
        '**/*.{test,spec}.{ts,tsx}',
        '**/*.d.ts',
        '**/node_modules/**',
        // Exclude entry points and bootstrap files (not meaningfully testable)
        '**/main.tsx',
        '**/App.tsx',
        '**/vite-env.d.ts',
        // Exclude barrel files (re-exports only)
        '**/index.ts',
      ],
    },
  },
});
