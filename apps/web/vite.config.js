import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

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
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunks for core React libraries
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'vendor-react';
          }

          // Vendor chunk for React Router
          if (id.includes('node_modules/react-router-dom') || id.includes('node_modules/react-router')) {
            return 'vendor-router';
          }

          // Vendor chunk for React Query
          if (id.includes('node_modules/@tanstack/react-query')) {
            return 'vendor-query';
          }

          // Vendor chunk for i18next
          if (id.includes('node_modules/i18next') || id.includes('node_modules/react-i18next')) {
            return 'vendor-i18n';
          }

          // Vendor chunk for Mapbox (large library)
          if (id.includes('node_modules/mapbox-gl')) {
            return 'vendor-mapbox';
          }

          // Design system in separate chunk
          if (id.includes('packages/ds/src')) {
            return 'vendor-ds';
          }

          // Client SDK in separate chunk
          if (id.includes('packages/client-sdk/src')) {
            return 'vendor-sdk';
          }

          // All other node_modules in a generic vendor chunk
          if (id.includes('node_modules')) {
            return 'vendor-misc';
          }
        },
      },
    },
    // Increase chunk size warning limit for large libraries like Mapbox
    chunkSizeWarningLimit: 600,
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
});
