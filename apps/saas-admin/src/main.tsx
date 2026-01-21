/**
 * saas-admin Entry Point
 *
 * Uses @xala/config for centralized configuration validation.
 * Uses @xala/runtime for unified provider management.
 *
 * @example Configuration Flow
 * 1. validateEnv() validates and parses environment variables
 * 2. createAppConfig() creates SDK and RuntimeProvider configs
 * 3. initializeClient() initializes the SDK
 * 4. RuntimeProvider provides all cross-cutting concerns
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import { validateEnv, createAppConfig } from '@xalatechnologies/platform/config';
import { RuntimeProvider } from '@xalatechnologies/platform/runtime';
import { initializeClient } from '@xalatechnologies/platform/sdk';

import '@xalatechnologies/platform/ui/styles';
import './root.css';
import { App } from './App';

// Validate environment at startup (throws on invalid config)
const env = validateEnv(import.meta.env);

// Create all configuration from centralized profiles
const { sdkConfig, runtimeConfig } = createAppConfig('saas-admin', env);

// Initialize SDK with validated config
initializeClient(sdkConfig);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RuntimeProvider config={runtimeConfig}>
      <App />
    </RuntimeProvider>
  </React.StrictMode>,
);
