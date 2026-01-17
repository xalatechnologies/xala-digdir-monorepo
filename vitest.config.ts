import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@xala/ds': path.resolve(__dirname, './packages/ds/src'),
      '@xala/i18n': path.resolve(__dirname, './packages/i18n/src'),
      '@xala/auth': path.resolve(__dirname, './packages/auth/src'),
      '@digilist/client-sdk': path.resolve(__dirname, './packages/client-sdk/src'),
      '@digilist/client-sdk/hooks': path.resolve(__dirname, './packages/client-sdk/src/hooks'),
      '@digilist/client-sdk/types': path.resolve(__dirname, './packages/client-sdk/src/types'),
    },
    dedupe: ['react', 'react-dom', 'react-router-dom'],
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: [
      'tests/unit/**/*.{test,spec}.{ts,tsx}',
      'tests/integration/**/*.{test,spec}.{ts,tsx}',
      'tests/security/**/*.{test,spec}.{ts,tsx}',
      'tests/performance/**/*.{test,spec}.{ts,tsx}',
      'packages/ds/src/**/*.{test,spec}.{ts,tsx}',
      'packages/i18n/src/**/*.{test,spec}.{ts,tsx}',
      'apps/web/src/**/*.{test,spec}.{ts,tsx}',
      'apps/backoffice/src/**/*.{test,spec}.{ts,tsx}',
      'apps/saas-admin/src/**/*.{test,spec}.{ts,tsx}',
      'apps/tenant-admin/src/**/*.{test,spec}.{ts,tsx}',
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
