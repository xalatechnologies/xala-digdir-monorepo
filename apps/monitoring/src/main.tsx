import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
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
  // Pass user ID for user-specific endpoints like /api/bookings/my
  defaultHeaders: {
    'X-User-Id': SEEDED_USER_ID,
  },
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
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
