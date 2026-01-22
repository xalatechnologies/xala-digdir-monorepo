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
      // Domain runtime package
      '@digilist/runtime': path.resolve(__dirname, '../../packages/runtime/dist/index.js'),
      // Domain UI package
      '@digilist/ui/features': path.resolve(__dirname, '../../packages/ui/dist/features/index.js'),
      '@digilist/ui/blocks': path.resolve(__dirname, '../../packages/ui/dist/blocks/index.js'),
      '@digilist/ui': path.resolve(__dirname, '../../packages/ui/dist/index.js'),
      // Platform UI via @digilist/ui/compat (extends platform)
      '@xalatechnologies/platform/ui/patterns': path.resolve(__dirname, '../../packages/ui/dist/compat/index.js'),
      '@xalatechnologies/platform/ui/primitives': path.resolve(__dirname, '../../packages/ui/dist/compat/index.js'),
      '@xalatechnologies/platform/ui/composed': path.resolve(__dirname, '../../packages/ui/dist/compat/index.js'),
      '@xalatechnologies/platform/ui/blocks': path.resolve(__dirname, '../../packages/ui/dist/compat/index.js'),
      '@xalatechnologies/platform/ui/shells': path.resolve(__dirname, '../../packages/ui/dist/compat/index.js'),
      '@xalatechnologies/platform/ui/styles': path.resolve(__dirname, '../../packages/ui/dist/compat/index.js'),
      '@xalatechnologies/platform/ui': path.resolve(__dirname, '../../packages/ui/dist/compat/index.js'),
      '@xalatechnologies/platform/i18n': path.resolve(__dirname, '../../../xala-platform/packages/platform/dist/i18n/index.js'),
      '@xalatechnologies/platform/auth': path.resolve(__dirname, '../../../xala-platform/packages/platform/dist/auth/index.js'),
      '@xalatechnologies/platform/config': path.resolve(__dirname, '../../../xala-platform/packages/platform/dist/config/index.js'),
      '@xalatechnologies/platform/runtime': path.resolve(__dirname, '../../../xala-platform/packages/platform/dist/runtime/index.js'),
      '@xalatechnologies/platform/contracts': path.resolve(__dirname, '../../../xala-platform/packages/platform/dist/contracts/index.js'),
      '@xalatechnologies/platform/sdk': path.resolve(__dirname, '../../../xala-platform/packages/platform/dist/sdk/index.js'),
      '@xalatechnologies/platform': path.resolve(__dirname, '../../../xala-platform/packages/platform/dist/index.js'),
      // CSS imports cannot be resolved by tsconfig paths
      '@digdir/designsystemet-css': path.resolve(__dirname, '../../node_modules/@digdir/designsystemet-css'),
    },
  },
  optimizeDeps: {
    exclude: ['@digilist/client-sdk'],
  },
});
