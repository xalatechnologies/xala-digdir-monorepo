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
      // CSS imports cannot be resolved by tsconfig paths
      '@digdir/designsystemet-css': path.resolve(__dirname, '../../node_modules/@digdir/designsystemet-css'),
    },
  },
  optimizeDeps: {
    exclude: ['@digilist/client-sdk'],
  },
});
