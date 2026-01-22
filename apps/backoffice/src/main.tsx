/**
 * backoffice Entry Point
 *
 * Uses @digilist/runtime for centralized configuration validation.
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import { validateEnv, createAppConfig, RuntimeProvider } from '@digilist/runtime';
import { initializeClient } from '@digilist/client-sdk';

import './root.css';
import { App } from './App';

// Validate environment at startup
const env = validateEnv(import.meta.env);

// Create all configuration from centralized profiles
const { sdkConfig, runtimeConfig } = createAppConfig('backoffice', env);

// Initialize SDK with validated config
initializeClient(sdkConfig);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RuntimeProvider config={runtimeConfig}>
      <App />
    </RuntimeProvider>
  </React.StrictMode>,
);
