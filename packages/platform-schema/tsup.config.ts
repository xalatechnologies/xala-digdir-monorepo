import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'core/index': 'src/core/index.ts',
    'platform/index': 'src/platform/index.ts',
    'saas/index': 'src/saas/index.ts',
    'compliance/index': 'src/compliance/index.ts',
    schemas: 'src/schemas.ts',
  },
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
  external: ['drizzle-orm', 'postgres'],
});
