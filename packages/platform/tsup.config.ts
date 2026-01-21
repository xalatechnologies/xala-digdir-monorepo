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
    'ui/pages/index': 'src/ui/pages/index.ts',
    'ui/tokens/index': 'src/ui/tokens/index.ts',
    'ui/styles': 'src/ui/styles.ts',

    // Runtime module
    'runtime/index': 'src/runtime/index.ts',

    // Auth module
    'auth/index': 'src/auth/index.ts',

    // Config module
    'config/index': 'src/config/index.ts',

    // Contracts module
    'contracts/index': 'src/contracts/index.ts',

    // SDK module and sub-modules
    'sdk/index': 'src/sdk/index.ts',
    'sdk/saas/index': 'src/sdk/saas/index.ts',
    'sdk/http/index': 'src/sdk/http/index.ts',
    'sdk/errors/index': 'src/sdk/errors/index.ts',
    'sdk/query/index': 'src/sdk/query/index.ts',
    'sdk/retry/index': 'src/sdk/retry/index.ts',

    // i18n module and sub-modules
    'i18n/index': 'src/i18n/index.ts',
    'i18n/locales/index': 'src/i18n/locales/index.ts',

    // Observability module and sub-modules
    'observability/index': 'src/observability/index.ts',
    'observability/metrics/index': 'src/observability/metrics/index.ts',
    'observability/exporters/index': 'src/observability/exporters/index.ts',
    'observability/types/index': 'src/observability/types/index.ts',
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
    // Additional externals for observability and i18n
    'prom-client',
    'js-cookie',
  ],
  esbuildOptions(options) {
    options.jsx = 'automatic';
  },
});
