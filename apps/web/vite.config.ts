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
