import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'path';

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 5174,
    strictPort: true,
  },
  build: {
    // Force unique bundle hashes on every build to prevent cache issues
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name]-[hash]-${Date.now()}.js`,
        chunkFileNames: `assets/[name]-[hash]-${Date.now()}.js`,
        assetFileNames: `assets/[name]-[hash]-${Date.now()}.[ext]`,
      },
    },
  },
  plugins: [
    react(),
    tsconfigPaths({ root: path.resolve(__dirname, '../..') }),
    // PWA DISABLED - Service worker causes aggressive caching issues during development
    // Re-enable for production when offline support is required
    // VitePWA({
    //   registerType: 'autoUpdate',
    //   injectRegister: 'auto',
    //   ...
    // }),
  ],
  resolve: {
    alias: {
      // Force SDK to use dist (avoids @/ path alias conflicts with SDK source)
      '@digilist/client-sdk/hooks': path.resolve(__dirname, '../../packages/client-sdk/dist/hooks/index.mjs'),
      '@digilist/client-sdk/types': path.resolve(__dirname, '../../packages/client-sdk/dist/types/index.mjs'),
      '@digilist/client-sdk/services': path.resolve(__dirname, '../../packages/client-sdk/dist/services/index.mjs'),
      '@digilist/client-sdk': path.resolve(__dirname, '../../packages/client-sdk/dist/index.mjs'),
      // CSS imports cannot be resolved by tsconfig paths
      '@digdir/designsystemet-css': path.resolve(__dirname, '../../node_modules/@digdir/designsystemet-css'),
    },
  },
  optimizeDeps: {
    exclude: ['@digilist/client-sdk'],
  },
});
