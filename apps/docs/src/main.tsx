import React from 'react';
import ReactDOM from 'react-dom/client';

import { App } from './App';

// Note: @xala/ds/styles will be imported in Phase 2 (Layout Shell)
// when DesignsystemetProvider is integrated

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
