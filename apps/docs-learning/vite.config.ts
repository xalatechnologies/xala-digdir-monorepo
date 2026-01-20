import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'path';
import { sentryVitePlugin } from '@sentry/vite-plugin';

export default defineConfig({
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
  server: {
    port: 5179,
  },
  resolve: {
    alias: {
      // CSS imports cannot be resolved by tsconfig paths
      '@digdir/designsystemet-css': path.resolve(__dirname, '../../node_modules/@digdir/designsystemet-css'),
    },
  },
  optimizeDeps: {
    exclude: ['@digilist/client-sdk'],
  },
  build: {
    sourcemap: true, // Generate source maps for production builds
  },
});
