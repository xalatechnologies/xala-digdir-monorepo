/**
 * docs-global App Component
 *
 * Global Documentation Portal routing layer.
 * All provider composition is handled by RuntimeProvider in main.tsx.
 *
 * IMPORTANT: This app is platform-only. No @digilist/* imports allowed.
 */
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DocsLayout } from './components/layout/DocsLayout';

// Import routes
import { DocsHomePage } from './routes/index';
import { ApiReferencePage } from './routes/api-reference';
import { SdkGuidePage } from './routes/sdk-guide';
import { ArchitecturePage } from './routes/architecture';
import { ComponentsPage } from './routes/components';

/**
 * Global Documentation Portal Application
 *
 * Platform-agnostic documentation for:
 * - API Reference
 * - SDK Guide
 * - Architecture documentation
 * - Component library
 */
export function App() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Routes>
        <Route element={<DocsLayout />}>
          {/* Home/Overview */}
          <Route path="/" element={<DocsHomePage />} />

          {/* API Reference */}
          <Route path="/api-reference" element={<ApiReferencePage />} />

          {/* SDK Guide */}
          <Route path="/sdk-guide" element={<SdkGuidePage />} />

          {/* Architecture */}
          <Route path="/architecture" element={<ArchitecturePage />} />

          {/* Components */}
          <Route path="/components" element={<ComponentsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
