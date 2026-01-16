import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DesignsystemetProvider, ErrorBoundary } from '@xala/ds';
import { I18nProvider } from '@xala/i18n';

/**
 * Tenant Admin Application
 *
 * This app provides tenant-level administration capabilities for managing
 * settings, branding, users, and viewing audit logs within a specific tenant.
 */
export function App() {
  return (
    <I18nProvider>
      <DesignsystemetProvider theme="digilist" colorScheme="auto" size="md">
        <ErrorBoundary>
          <BrowserRouter
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true,
            }}
          >
            <Routes>
              <Route path="/" element={<HomePage />} />
            </Routes>
          </BrowserRouter>
        </ErrorBoundary>
      </DesignsystemetProvider>
    </I18nProvider>
  );
}

/**
 * Placeholder home page - to be replaced with full implementation
 */
function HomePage() {
  return (
    <div style={{ padding: 'var(--ds-spacing-6)' }}>
      <h1>Tenant Admin</h1>
      <p>Tenant administration dashboard - scaffold placeholder</p>
    </div>
  );
}
