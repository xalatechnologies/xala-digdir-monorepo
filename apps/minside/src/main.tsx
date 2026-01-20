/**
 * minside Entry Point
 *
 * Uses @xala/config for centralized configuration validation.
 * Uses @xala/runtime for unified provider management.
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import { validateEnv, createAppConfig } from '@xala/config';
import { RuntimeProvider } from '@xala/runtime';
import { initializeClient } from '@digilist/client-sdk';

import '@xala/ds/styles';
import './root.css';
import { App } from './App';

// Ola Hansen's user ID from seeded database (dev only)
const SEEDED_USER_ID = '01a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c';

// Validate environment at startup
const env = validateEnv(import.meta.env);

// Create all configuration from centralized profiles
const { sdkConfig, runtimeConfig } = createAppConfig('minside', env, {
  headers: { 'X-User-Id': SEEDED_USER_ID },
});

// Initialize SDK with validated config
initializeClient(sdkConfig);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RuntimeProvider config={runtimeConfig}>
      <App />
    </RuntimeProvider>
  </React.StrictMode>,
);
