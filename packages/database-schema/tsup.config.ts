import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/schemas.ts',
    'src/core/index.ts',
    'src/domain/index.ts',
    'src/platform/index.ts',
    'src/saas/index.ts',
    'src/saas/entitlements.ts',
    'src/compliance/index.ts',
  ],
  format: ['esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  splitting: false,
});
