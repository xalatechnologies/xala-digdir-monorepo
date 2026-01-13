import React from 'react';
import ReactDOM from 'react-dom/client';

// ✅ Single import point for Designsystemet CSS (required).
import '@xala/ds/styles';

// Note: Theme CSS is dynamically loaded by DesignsystemetProvider.
// The provider loads CLI-generated base theme + extensions.

// Minimal global font settings (recommended by Designsystemet).
import './root.css';

import { App } from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
