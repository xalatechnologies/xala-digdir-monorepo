import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'hooks/index': 'src/hooks/index.ts',
    'types/index': 'src/types/index.ts',
  },
  format: ['cjs', 'esm'],
  dts: false, // Using tsc for declarations due to composite mode
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
  external: ['react', '@tanstack/react-query'],
  esbuildOptions(options) {
    options.banner = {
      js: '/* @digilist/client-sdk v1.0.0 - Xala Technologies */',
    };
  },
});
