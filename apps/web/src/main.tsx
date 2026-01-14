import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// ✅ Single import point for Designsystemet CSS (required).
import '@xala/ds/styles';

// Initialize SDK with API configuration
import { initializeClient } from '@digilist/client-sdk';

initializeClient({
  baseUrl: import.meta.env.VITE_API_URL || 'https://api.digilist.no',
  tenantId: import.meta.env.VITE_TENANT_ID || 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  licenseKey: import.meta.env.VITE_LICENSE_KEY || '',
});

// Note: Theme CSS is dynamically loaded by DesignsystemetProvider.
// The provider loads CLI-generated base theme + extensions.

// Minimal global font settings (recommended by Designsystemet).
import './root.css';

import { App } from './App';

// Create React Query client with default options
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
);
