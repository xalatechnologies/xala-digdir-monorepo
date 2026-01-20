import { defineConfig } from 'vitest/config';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
import path from 'node:path';

export default defineConfig({
  plugins: [
    // Storybook plugin to run stories as component tests
    // Stories are defined in .storybook/main.ts
    storybookTest({
      configDir: path.resolve(__dirname, '.storybook'),
    }),
  ],
  test: {
    name: 'ds-storybook',
    // Browser mode for realistic component testing
    browser: {
      enabled: true,
      provider: playwright(),
      headless: true,
    },
    // Setup file for Storybook integration
    setupFiles: ['.storybook/vitest.setup.ts'],
    // Note: test.include is not needed - Storybook plugin uses stories from main.ts
  },
  resolve: {
    alias: {
      '@xala/ds': path.resolve(__dirname, 'src'),
    },
  },
});
