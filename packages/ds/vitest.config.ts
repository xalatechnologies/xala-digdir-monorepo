import { defineConfig } from 'vitest/config';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
import path from 'node:path';

export default defineConfig({
  plugins: [
    // Storybook plugin to run stories as component tests
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
    // Include story files
    include: ['stories/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
    // Workspace configuration for running alongside other tests
    workspace: undefined,
  },
  resolve: {
    alias: {
      '@xala/ds': path.resolve(__dirname, 'src'),
    },
  },
});
