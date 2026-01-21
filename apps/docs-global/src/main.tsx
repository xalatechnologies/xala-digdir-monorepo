/**
 * docs-global Entry Point
 *
 * Global Documentation Portal - Platform-only app.
 * Uses @xala/runtime for unified provider management.
 *
 * IMPORTANT: This app does NOT import any @digilist/* packages.
 * It is domain-agnostic and uses only platform packages.
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import { RuntimeProvider } from '@xala/runtime';

import '@xalatechnologies/platform/ui/styles';
import { App } from './App';

// Create platform-only runtime config (no domain SDK required)
// Note: Using 'docs-learning' as appType since 'docs-global' is not yet registered
// This can be updated once the app type is added to @xala/runtime
const runtimeConfig = {
  appType: 'docs-learning' as const, // Reuse docs-learning config until docs-global is registered
  apiUrl: import.meta.env.VITE_API_URL || 'https://api.digilist.no',
  wsUrl: import.meta.env.VITE_WS_URL,
  tenantId: import.meta.env.VITE_TENANT_ID || 'platform',
  locale: 'en' as const, // Global docs default to English
  theme: 'digilist' as const,
  colorScheme: 'auto' as const,
  authConfig: {
    loginPath: '/login',
    debug: import.meta.env.DEV,
    sessionCheckInterval: 60000,
  },
  featureFlags: {
    'docs.api-reference': true,
    'docs.sdk-guide': true,
    'docs.architecture': true,
    'docs.components': true,
  },
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RuntimeProvider config={runtimeConfig}>
      <App />
    </RuntimeProvider>
  </React.StrictMode>,
);
