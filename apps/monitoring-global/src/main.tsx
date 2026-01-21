/**
 * monitoring-global Entry Point
 *
 * Global Control Plane monitoring dashboard.
 * PLATFORM-ONLY app - no @digilist/* packages allowed.
 *
 * Uses @xala/config for configuration validation.
 * Uses @xala/runtime for unified provider management.
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DesignsystemetProvider } from '@xalatechnologies/platform/ui';
import { I18nProvider } from '@xalatechnologies/platform/i18n';

import '@xalatechnologies/platform/ui/styles';
import { App } from './App';

// Create QueryClient for platform-level data fetching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000, // 30 seconds for monitoring data
      refetchInterval: 60000, // Auto-refresh every minute
      retry: 2,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <I18nProvider locale="nb">
        <DesignsystemetProvider
          theme="digdir"
          colorScheme="auto"
          size="md"
          typography="primary"
        >
          <App />
        </DesignsystemetProvider>
      </I18nProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
