import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    server: 'src/server.ts', // Server-only entrypoint - banned in frontend apps
    'feature-flags/index': 'src/feature-flags/index.ts',
    'offline/index': 'src/offline/index.ts',
    'tenant-config/index': 'src/tenant-config/index.ts',
  },
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
  minify: false,
  external: ['react'],
});
