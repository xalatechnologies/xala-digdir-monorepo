import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'hooks/index': 'src/hooks/index.ts',
    'types/index': 'src/types/index.ts',
    'services/index': 'src/services/index.ts',
  },
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
  external: ['react', '@tanstack/react-query'],
  esbuildOptions(options) {
    options.banner = {
      js: '/* @digilist/client-sdk v1.1.0 - Xala Technologies */',
    };
  },
});
