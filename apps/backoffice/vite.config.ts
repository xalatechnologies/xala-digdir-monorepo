import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'path';
import { sentryVitePlugin } from '@sentry/vite-plugin';

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 5175,
    strictPort: true,
  },
  plugins: [
    react(),
    tsconfigPaths({ root: path.resolve(__dirname, '../..') }),
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
  resolve: {
    alias: {
      // App-internal alias
      '@': path.resolve(__dirname, './src'),
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
    include: ['@digdir/designsystemet-css'],
  },
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
});
