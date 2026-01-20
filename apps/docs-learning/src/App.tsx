/**
 * docs-learning App Component
 *
 * With RuntimeProvider, this file is now JUST routing.
 * All provider composition is handled by RuntimeProvider in main.tsx.
 */
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useOAuthCallback } from '@xala/auth';
import { DocsLayout } from './components/layout/DocsLayout';

// Import routes
import { DocsHomePage } from './routes/DocsHomePage';
import { DocsSectionPage } from './routes/DocsSectionPage';
import { DocsArticlePage } from './routes/DocsArticlePage';
import { DocsSearchPage } from './routes/DocsSearchPage';
import { RoleGuidePage } from './routes/RoleGuidePage';
import { DocsReleasesPage } from './routes/DocsReleasesPage';

/**
 * OAuth Callback Handler
 * Handles OAuth redirects automatically - must be inside BrowserRouter
 */
function OAuthCallbackHandler() {
  useOAuthCallback();
  return null;
}

/**
 * Docs Learning Application
 *
 * Documentation and user manual for the Digilist platform.
 * With RuntimeProvider, this is now a thin routing layer only.
 */
export function App() {
  return (
    <BrowserRouter
      basename="/docs"
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <OAuthCallbackHandler />
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
    </BrowserRouter>
  );
}
