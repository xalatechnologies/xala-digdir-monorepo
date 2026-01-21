import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    // Main entry
    index: 'src/index.ts',

    // UI module and sub-modules
    'ui/index': 'src/ui/index.ts',
    'ui/primitives/index': 'src/ui/primitives/index.ts',
    'ui/composed/index': 'src/ui/composed/index.ts',
    'ui/shells/index': 'src/ui/shells/index.ts',
    'ui/blocks/index': 'src/ui/blocks/index.ts',
    'ui/themes/index': 'src/ui/themes/index.ts',
    'ui/patterns/index': 'src/ui/patterns/index.ts',

    // Other modules
    'runtime/index': 'src/runtime/index.ts',
    'auth/index': 'src/auth/index.ts',
    'config/index': 'src/config/index.ts',
    'contracts/index': 'src/contracts/index.ts',
    'sdk/index': 'src/sdk/index.ts',
    'i18n/index': 'src/i18n/index.ts',
    'observability/index': 'src/observability/index.ts',
  },
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
  minify: false,
  external: [
    'react',
    'react-dom',
    'react-router-dom',
    '@digdir/designsystemet-react',
    '@digdir/designsystemet-css',
    '@tanstack/react-query',
    'zod',
  ],
  esbuildOptions(options) {
    options.jsx = 'automatic';
  },
});
