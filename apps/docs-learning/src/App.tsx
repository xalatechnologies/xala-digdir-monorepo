import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DesignsystemetProvider, ErrorBoundary } from '@xala/ds';
import { I18nProvider } from '@xala/i18n';
import { AuthProvider } from '@xala/auth';
import { ToastProvider } from './providers';
import { DocsLayout } from './components/layout/DocsLayout';

// Import routes (lazy loaded for better performance)
import { DocsHomePage } from './routes/DocsHomePage';
import { DocsSectionPage } from './routes/DocsSectionPage';
import { DocsArticlePage } from './routes/DocsArticlePage';
import { DocsSearchPage } from './routes/DocsSearchPage';
import { RoleGuidePage } from './routes/RoleGuidePage';
import { DocsReleasesPage } from './routes/DocsReleasesPage';

/**
 * Docs Learning Application
 *
 * Documentation and user manual for the Digilist platform.
 * Provides searchable, categorized documentation with role-based guides.
 */
export function App() {
  return (
    <I18nProvider>
      <DesignsystemetProvider theme="digilist" colorScheme="auto" size="md">
        <ErrorBoundary>
          <ToastProvider>
            <BrowserRouter
              basename="/docs"
              future={{
                v7_startTransition: true,
                v7_relativeSplatPath: true,
              }}
            >
              <AuthProvider config={{ appType: 'docs-learning', debug: import.meta.env.DEV }}>
                <Routes>
                  <Route element={<DocsLayout />}>
                    {/* Home/Overview */}
                    <Route path="/" element={<DocsHomePage />} />
                    
                    {/* Search */}
                    <Route path="/search" element={<DocsSearchPage />} />
                    
                    {/* Release notes */}
                    <Route path="/releases" element={<DocsReleasesPage />} />
                    
                    {/* Role guides */}
                    <Route path="/roles/:app/:role" element={<RoleGuidePage />} />
                    
                    {/* Section landing page */}
                    <Route path="/:section" element={<DocsSectionPage />} />
                    
                    {/* Article page */}
                    <Route path="/:section/:articleSlug" element={<DocsArticlePage />} />
                  </Route>
                </Routes>
              </AuthProvider>
            </BrowserRouter>
          </ToastProvider>
        </ErrorBoundary>
      </DesignsystemetProvider>
    </I18nProvider>
  );
}
