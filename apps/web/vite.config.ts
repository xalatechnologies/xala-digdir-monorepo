import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';
import { sentryVitePlugin } from '@sentry/vite-plugin';

export default defineConfig({
  plugins: [
    react(),
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
        enabled: true,
      },
    }),
    // Upload source maps to Sentry on production builds
    sentryVitePlugin({
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      authToken: process.env.SENTRY_AUTH_TOKEN,
      // Only upload source maps in production builds
      disable: process.env.NODE_ENV !== 'production',
      sourcemaps: {
        assets: './dist/**',
      },
    }),
  ],
  build: {
    sourcemap: true, // Generate source maps for production builds
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
          if (id.includes('packages/ds/src') || id.includes('@xala/ds')) {
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
      '@digilist/client-sdk': path.resolve(__dirname, '../../packages/client-sdk/src'),
      '@digilist/client-sdk/hooks': path.resolve(__dirname, '../../packages/client-sdk/src/hooks'),
      '@digilist/client-sdk/types': path.resolve(__dirname, '../../packages/client-sdk/src/types'),
    },
  },
  optimizeDeps: {
    exclude: ['@digilist/client-sdk'],
    include: [
      'mapbox-gl',
      'react-map-gl',
      'react-map-gl/mapbox',
    ],
    esbuildOptions: {
      // Mapbox GL requires these Node.js polyfills
      target: 'esnext',
    },
  },
});
