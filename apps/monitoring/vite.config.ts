import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'path';

export default defineConfig({
  // Load .env from monorepo root
  envDir: path.resolve(__dirname, '../..'),
  plugins: [
    react(),
    tsconfigPaths({ root: path.resolve(__dirname, '../..') }),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['icon.png', 'logo.svg', 'manifest.json'],
      manifest: {
        name: 'Min Side',
        short_name: 'Min Side',
        description: 'Norwegian municipal citizen portal',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: '/icon.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB limit for large bundles
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /\/api\/.*\/*.json/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 10,
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60, // 1 hour
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /\/api\/bookings\/my/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'bookings-cache',
              networkTimeoutSeconds: 10,
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24, // 24 hours for offline viewing
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],
  server: {
    port: 5178,
  },
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
      // Platform UI - point directly to platform dist
      '@xalatechnologies/platform/ui/patterns': path.resolve(__dirname, '../../../xala-platform/packages/platform/dist/ui/patterns/index.js'),
      '@xalatechnologies/platform/ui/primitives': path.resolve(__dirname, '../../../xala-platform/packages/platform/dist/ui/primitives/index.js'),
      '@xalatechnologies/platform/ui/composed': path.resolve(__dirname, '../../../xala-platform/packages/platform/dist/ui/composed/index.js'),
      '@xalatechnologies/platform/ui/blocks': path.resolve(__dirname, '../../../xala-platform/packages/platform/dist/ui/blocks/index.js'),
      '@xalatechnologies/platform/ui/shells': path.resolve(__dirname, '../../../xala-platform/packages/platform/dist/ui/shells/index.js'),
      '@xalatechnologies/platform/ui/styles': path.resolve(__dirname, '../../../xala-platform/packages/platform/dist/ui/styles.js'),
      '@xalatechnologies/platform/ui': path.resolve(__dirname, '../../../xala-platform/packages/platform/dist/ui/index.js'),
      '@xalatechnologies/platform/i18n': path.resolve(__dirname, '../../../xala-platform/packages/platform/dist/i18n/index.js'),
      '@xalatechnologies/platform/auth': path.resolve(__dirname, '../../../xala-platform/packages/platform/dist/auth/index.js'),
      '@xalatechnologies/platform/config': path.resolve(__dirname, '../../../xala-platform/packages/platform/dist/runtime/index.js'),
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
    include: ['@digdir/designsystemet-css'],
  },
});
