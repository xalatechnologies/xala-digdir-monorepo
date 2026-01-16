import React from 'react';
import ReactDOM from 'react-dom/client';
import { MDXProvider } from '@mdx-js/react';

// Import design system styles - exactly once as per @xala/ds requirements
import '@xala/ds/styles';

import { App } from './App';
import { mdxComponents } from './mdx-components';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* Type assertion needed due to React 18/19 types mismatch between @mdx-js/react and @xala/ds */}
    <MDXProvider components={mdxComponents as Parameters<typeof MDXProvider>[0]['components']}>
      <App />
    </MDXProvider>
  </React.StrictMode>,
);
