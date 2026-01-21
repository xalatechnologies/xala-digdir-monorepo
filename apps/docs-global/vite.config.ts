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
    port: 5180,
  },
  resolve: {
    alias: {
      // Platform subpaths (order matters - more specific first)
      '@xalatechnologies/platform/ui/patterns': path.resolve(__dirname, '../../packages/platform/dist/ui/patterns/index.js'),
      '@xalatechnologies/platform/ui/primitives': path.resolve(__dirname, '../../packages/platform/dist/ui/primitives/index.js'),
      '@xalatechnologies/platform/ui/composed': path.resolve(__dirname, '../../packages/platform/dist/ui/composed/index.js'),
      '@xalatechnologies/platform/ui/blocks': path.resolve(__dirname, '../../packages/platform/dist/ui/blocks/index.js'),
      '@xalatechnologies/platform/ui/shells': path.resolve(__dirname, '../../packages/platform/dist/ui/shells/index.js'),
      '@xalatechnologies/platform/ui/styles': path.resolve(__dirname, '../../packages/platform/dist/ui/styles.js'),
      '@xalatechnologies/platform/ui': path.resolve(__dirname, '../../packages/platform/dist/ui/index.js'),
      '@xalatechnologies/platform/i18n': path.resolve(__dirname, '../../packages/platform/dist/i18n/index.js'),
      '@xalatechnologies/platform/auth': path.resolve(__dirname, '../../packages/platform/dist/auth/index.js'),
      '@xalatechnologies/platform/config': path.resolve(__dirname, '../../packages/platform/dist/config/index.js'),
      '@xalatechnologies/platform/runtime': path.resolve(__dirname, '../../packages/platform/dist/runtime/index.js'),
      '@xalatechnologies/platform/contracts': path.resolve(__dirname, '../../packages/platform/dist/contracts/index.js'),
      '@xalatechnologies/platform/sdk': path.resolve(__dirname, '../../packages/platform/dist/sdk/index.js'),
      '@xalatechnologies/platform': path.resolve(__dirname, '../../packages/platform/dist/index.js'),
      // CSS imports cannot be resolved by tsconfig paths
      '@digdir/designsystemet-css': path.resolve(__dirname, '../../node_modules/@digdir/designsystemet-css'),
    },
  },
  build: {
    sourcemap: true, // Generate source maps for production builds
  },
});
