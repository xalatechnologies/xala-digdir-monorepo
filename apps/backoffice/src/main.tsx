/**
 * backoffice Entry Point
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

// Initialize SDK with configuration
initializeClient({
  baseUrl: import.meta.env.VITE_API_URL || 'https://api.digilist.no',
  tenantId: import.meta.env.VITE_TENANT_ID || 'default',
  licenseKey: import.meta.env.VITE_LICENSE_KEY || 'dev-key',
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RuntimeProvider
      config={{
        appType: 'backoffice',
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
