/**
 * minside Entry Point
 *
 * Uses @xala/runtime for unified provider management.
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import { RuntimeProvider } from '@xala/runtime';
import { initializeClient } from '@digilist/client-sdk';

import '@xala/ds/styles';
import './root.css';
import { App } from './App';

// Ola Hansen's user ID from seeded database
const SEEDED_USER_ID = '01a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c';

// Initialize SDK with configuration
initializeClient({
  baseUrl: import.meta.env.VITE_API_URL || 'https://api.digilist.no',
  tenantId: import.meta.env.VITE_TENANT_ID || 'default',
  licenseKey: import.meta.env.VITE_LICENSE_KEY || 'dev-key',
  defaultHeaders: {
    'X-User-Id': SEEDED_USER_ID,
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RuntimeProvider
      config={{
        appType: 'minside',
        apiUrl: import.meta.env.VITE_API_URL || 'https://api.digilist.no',
        wsUrl: import.meta.env.VITE_WS_URL,
        tenantId: import.meta.env.VITE_TENANT_ID || 'default',
        licenseKey: import.meta.env.VITE_LICENSE_KEY || 'dev-key',
        locale: 'nb',
        theme: 'digilist',
        colorScheme: 'auto',
        authConfig: {
          loginPath: '/login',
          debug: import.meta.env.DEV,
        },
      }}
    >
      <App />
    </RuntimeProvider>
  </React.StrictMode>,
);
