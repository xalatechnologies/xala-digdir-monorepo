import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'fixtures/index': 'src/fixtures/index.ts',
    'mocks/index': 'src/mocks/index.ts',
    'utils/index': 'src/utils/index.ts',
    'setup/index': 'src/setup/index.ts',
  },
  format: ['esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  target: 'es2020',
  external: [
    'react',
    'react-dom',
    '@playwright/test',
    'vitest',
    '@tanstack/react-query',
    '@testing-library/react',
    '@testing-library/jest-dom',
    '@testing-library/user-event',
    'msw',
    'happy-dom',
    'axe-core',
  ],
});
