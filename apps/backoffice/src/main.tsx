/**
 * backoffice Entry Point
 *
 * Uses @xala/config for centralized configuration validation.
 * Uses @xala/runtime for unified provider management.
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import { validateEnv, createAppConfig } from '@xalatechnologies/platform/config';
import { RuntimeProvider } from '@xalatechnologies/platform/runtime';
import { initializeClient } from '@digilist/client-sdk';

import '@xalatechnologies/platform/ui/styles';
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
