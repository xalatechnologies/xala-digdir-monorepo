/**
 * monitoring Entry Point
 *
 * Uses @digilist/runtime for centralized configuration validation.
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import { validateEnv, createAppConfig, RuntimeProvider } from '@digilist/runtime';
import { initializeClient } from '@digilist/client-sdk';

import './root.css';
import { App } from './App';

// Ola Hansen's user ID from seeded database (dev only)
const SEEDED_USER_ID = '01a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c';

// Validate environment at startup
const env = validateEnv(import.meta.env);

// Create all configuration from centralized profiles
const { sdkConfig, runtimeConfig } = createAppConfig('monitoring', env, {
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
