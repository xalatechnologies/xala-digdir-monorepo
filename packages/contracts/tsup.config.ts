import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'schemas/index': 'src/schemas/index.ts',
    'types/index': 'src/types/index.ts',
    'modules/index': 'src/modules/index.ts',
    'monitoring/index': 'src/monitoring/index.ts',
    'validation/env-schemas': 'src/validation/env-schemas.ts',
  },
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
  minify: false,
  external: ['zod'],
});
