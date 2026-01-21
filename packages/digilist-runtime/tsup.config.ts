import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'providers/index': 'src/providers/index.ts',
    'hooks/index': 'src/hooks/index.ts',
    'config/index': 'src/config/index.ts',
  },
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom', '@tanstack/react-query'],
  esbuildOptions(options) {
    options.banner = {
      js: '/* @digilist/runtime v1.0.0 - Domain-specific runtime for Digilist */',
    };
  },
  sideEffects: false,
});
