import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@xala/auth': path.resolve(__dirname, 'packages/auth/src'),
      '@xala/ds': path.resolve(__dirname, 'packages/ds/src'),
      '@xala/i18n': path.resolve(__dirname, 'packages/i18n/src'),
      '@digilist/client-sdk': path.resolve(__dirname, 'packages/client-sdk/src'),
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
      'apps/tenant-admin/src/**/*.{test,spec}.{ts,tsx}',
      'tests/unit/**/*.{test,spec}.{ts,tsx}',
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
      include: ['packages/ds/src/**/*.{ts,tsx}', 'apps/web/src/**/*.{ts,tsx}', 'apps/backoffice/src/**/*.{ts,tsx}', 'apps/tenant-admin/src/**/*.{ts,tsx}'],
      exclude: ['**/*.{test,spec}.{ts,tsx}', '**/*.d.ts', '**/node_modules/**'],
    },
  },
});
