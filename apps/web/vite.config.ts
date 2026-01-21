import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'path';

export default defineConfig({
  // Load .env from app directory (for staging)
  envDir: path.resolve(__dirname, '.'),
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
  },
  plugins: [
    react(),
    tsconfigPaths({ root: path.resolve(__dirname, '../..') }),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['icon.png', 'logo.svg', 'manifest.json'],
      manifest: {
        name: 'Xala Booking',
        short_name: 'Xala',
        description: 'Norwegian municipal booking and resource management system',
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
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB limit for DS bundle
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
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
        ],
      },
      devOptions: {
        enabled: false, // Disabled - causes Vite dev server issues
      },
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Mapbox GL in separate chunk (large, rarely changes)
          if (id.includes('node_modules/mapbox-gl')) {
            return 'vendor-mapbox';
          }

          // React Query in separate chunk
          if (id.includes('node_modules/@tanstack/react-query')) {
            return 'vendor-query';
          }

          // Client SDK in separate chunk
          if (id.includes('packages/client-sdk/src')) {
            return 'vendor-sdk';
          }

          // Design system in separate chunk
          if (id.includes('packages/ds/src') || id.includes('@xalatechnologies/platform/ui')) {
            return 'vendor-ds';
          }

          // Everything else from node_modules goes together
          // This prevents circular dependencies between chunks
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 800,
  },
  resolve: {
    alias: {
      // Force SDK to use dist (avoids @/ path alias conflicts with SDK source)
      '@digilist/client-sdk/hooks': path.resolve(__dirname, '../../packages/client-sdk/dist/hooks/index.mjs'),
      '@digilist/client-sdk/types': path.resolve(__dirname, '../../packages/client-sdk/dist/types/index.mjs'),
      '@digilist/client-sdk/services': path.resolve(__dirname, '../../packages/client-sdk/dist/services/index.mjs'),
      '@digilist/client-sdk': path.resolve(__dirname, '../../packages/client-sdk/dist/index.mjs'),
      // Domain UI package
      '@digilist/ui/features': path.resolve(__dirname, '../../packages/ui/dist/features/index.js'),
      '@digilist/ui/blocks': path.resolve(__dirname, '../../packages/ui/dist/blocks/index.js'),
      '@digilist/ui': path.resolve(__dirname, '../../packages/ui/dist/index.js'),
      // Platform subpaths (order matters - more specific first)
      '@xalatechnologies/platform/ui/patterns': path.resolve(__dirname, '../../packages/platform/dist/ui/patterns/index.js'),
      '@xalatechnologies/platform/ui/primitives': path.resolve(__dirname, '../../packages/platform/dist/ui/primitives/index.js'),
      '@xalatechnologies/platform/ui/composed': path.resolve(__dirname, '../../packages/platform/dist/ui/composed/index.js'),
      '@xalatechnologies/platform/ui/blocks': path.resolve(__dirname, '../../packages/platform/dist/ui/blocks/index.js'),
      '@xalatechnologies/platform/ui/shells': path.resolve(__dirname, '../../packages/platform/dist/ui/shells/index.js'),
      '@xalatechnologies/platform/ui/themes': path.resolve(__dirname, '../../packages/platform/dist/ui/themes/index.js'),
      '@xalatechnologies/platform/ui/pages': path.resolve(__dirname, '../../packages/platform/dist/ui/pages/index.js'),
      '@xalatechnologies/platform/ui/tokens': path.resolve(__dirname, '../../packages/platform/dist/ui/tokens/index.js'),
      '@xalatechnologies/platform/ui/styles': path.resolve(__dirname, '../../packages/platform/dist/ui/styles.js'),
      '@xalatechnologies/platform/ui': path.resolve(__dirname, '../../packages/platform/dist/ui/index.js'),
      '@xalatechnologies/platform/i18n/locales': path.resolve(__dirname, '../../packages/platform/dist/i18n/locales/index.js'),
      '@xalatechnologies/platform/i18n': path.resolve(__dirname, '../../packages/platform/dist/i18n/index.js'),
      '@xalatechnologies/platform/auth': path.resolve(__dirname, '../../packages/platform/dist/auth/index.js'),
      '@xalatechnologies/platform/config': path.resolve(__dirname, '../../packages/platform/dist/config/index.js'),
      '@xalatechnologies/platform/runtime': path.resolve(__dirname, '../../packages/platform/dist/runtime/index.js'),
      '@xalatechnologies/platform/contracts': path.resolve(__dirname, '../../packages/platform/dist/contracts/index.js'),
      '@xalatechnologies/platform/sdk/saas': path.resolve(__dirname, '../../packages/platform/dist/sdk/saas/index.js'),
      '@xalatechnologies/platform/sdk/http': path.resolve(__dirname, '../../packages/platform/dist/sdk/http/index.js'),
      '@xalatechnologies/platform/sdk/errors': path.resolve(__dirname, '../../packages/platform/dist/sdk/errors/index.js'),
      '@xalatechnologies/platform/sdk/query': path.resolve(__dirname, '../../packages/platform/dist/sdk/query/index.js'),
      '@xalatechnologies/platform/sdk/retry': path.resolve(__dirname, '../../packages/platform/dist/sdk/retry/index.js'),
      '@xalatechnologies/platform/sdk': path.resolve(__dirname, '../../packages/platform/dist/sdk/index.js'),
      '@xalatechnologies/platform/observability/metrics': path.resolve(__dirname, '../../packages/platform/dist/observability/metrics/index.js'),
      '@xalatechnologies/platform/observability/exporters': path.resolve(__dirname, '../../packages/platform/dist/observability/exporters/index.js'),
      '@xalatechnologies/platform/observability/types': path.resolve(__dirname, '../../packages/platform/dist/observability/types/index.js'),
      '@xalatechnologies/platform/observability': path.resolve(__dirname, '../../packages/platform/dist/observability/index.js'),
      '@xalatechnologies/platform': path.resolve(__dirname, '../../packages/platform/dist/index.js'),
      // CSS imports cannot be resolved by tsconfig paths
      '@digdir/designsystemet-css': path.resolve(__dirname, '../../node_modules/@digdir/designsystemet-css'),
    },
  },
  optimizeDeps: {
    exclude: ['@digilist/client-sdk'],
    include: [
      'mapbox-gl',
      'react-map-gl',
      'react-map-gl/mapbox',
      '@digdir/designsystemet-css',
    ],
    force: true,
    esbuildOptions: {
      // Mapbox GL requires these Node.js polyfills
      target: 'esnext',
      define: {
        global: 'globalThis',
      },
    },
  },
});
