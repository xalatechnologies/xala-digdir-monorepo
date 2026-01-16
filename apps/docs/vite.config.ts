import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import mdx from '@mdx-js/rollup';
import path from 'path';

export default defineConfig({
  plugins: [
    // CRITICAL: React plugin MUST be BEFORE MDX plugin
    // This ensures JSX is properly handled in MDX files
    react(),
    mdx({
      providerImportSource: '@mdx-js/react',
    }),
  ],
  server: {
    port: 5176,
  },
  resolve: {
    alias: {
      '@digilist/client-sdk': path.resolve(__dirname, '../../packages/client-sdk/src'),
      '@digilist/client-sdk/hooks': path.resolve(__dirname, '../../packages/client-sdk/src/hooks'),
      '@digilist/client-sdk/types': path.resolve(__dirname, '../../packages/client-sdk/src/types'),
    },
  },
  optimizeDeps: {
    exclude: ['@digilist/client-sdk'],
  },
  build: {
    sourcemap: true,
  },
});
