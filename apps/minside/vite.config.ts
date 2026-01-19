import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
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
      '@digilist/client-sdk': path.resolve(__dirname, '../../packages/client-sdk/src'),
      '@digilist/client-sdk/hooks': path.resolve(__dirname, '../../packages/client-sdk/src/hooks'),
      '@digilist/client-sdk/types': path.resolve(__dirname, '../../packages/client-sdk/src/types'),
      '@digilist/client-sdk/realtime': path.resolve(__dirname, '../../packages/client-sdk/src/realtime'),
    },
  },
  optimizeDeps: {
    exclude: ['@digilist/client-sdk'],
  },
});
