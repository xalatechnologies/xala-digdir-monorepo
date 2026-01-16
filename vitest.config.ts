import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: [
      'packages/ds/src/**/*.{test,spec}.{ts,tsx}',
      'apps/web/src/**/*.{test,spec}.{ts,tsx}',
      'apps/backoffice/src/**/*.{test,spec}.{ts,tsx}',
      'apps/saas-admin/src/**/*.{test,spec}.{ts,tsx}',
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
      exclude: ['**/*.{test,spec}.{ts,tsx}', '**/*.d.ts', '**/node_modules/**'],
    },
  },
});
