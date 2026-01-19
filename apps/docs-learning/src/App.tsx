import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DesignsystemetProvider, DialogProvider, ErrorBoundary } from '@xala/ds';
import { I18nProvider } from '@xala/i18n';
import { AuthProvider, useOAuthCallback } from '@xala/auth';
import { RealtimeProvider } from '@digilist/client-sdk';
import { ThemeProvider, useTheme } from '@xala/ds';
import { useState, useCallback, createContext, useContext } from 'react';
import { ToastProvider } from './providers';
import { DocsLayout } from './components/layout/DocsLayout';

// Notification Center Context
interface NotificationCenterContextValue {
  openNotificationCenter: () => void;
  closeNotificationCenter: () => void;
  isOpen: boolean;
}

const NotificationCenterContext = createContext<NotificationCenterContextValue | null>(null);

export function useNotificationCenter(): NotificationCenterContextValue {
  const context = useContext(NotificationCenterContext);
  if (!context) {
    throw new Error('useNotificationCenter must be used within NotificationCenterProvider');
  }
  return context;
}

function NotificationCenterProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openNotificationCenter = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeNotificationCenter = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <NotificationCenterContext.Provider value={{ openNotificationCenter, closeNotificationCenter, isOpen }}>
      {children}
    </NotificationCenterContext.Provider>
  );
}

/**
 * OAuth Callback Handler
 * Handles OAuth redirects automatically - must be inside BrowserRouter
 */
function OAuthCallbackHandler() {
  useOAuthCallback();
  return null;
}

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
    <ThemeProvider>
      <AppWithTheme />
    </ThemeProvider>
  );
}

function AppWithTheme() {
  const { colorScheme } = useTheme();

  return (
    <I18nProvider initialLocale="nb">
      <DesignsystemetProvider theme="digilist" colorScheme={colorScheme} size="md">
        <DialogProvider>
        <ErrorBoundary>
          <ToastProvider>
            <BrowserRouter
              basename="/docs"
              future={{
                v7_startTransition: true,
                v7_relativeSplatPath: true,
              }}
            >
              <OAuthCallbackHandler />
              <NotificationCenterProvider>
                <AuthProvider config={{ appType: 'tenant-admin', debug: import.meta.env.DEV }}>
                  <RealtimeProvider
                    wsUrl={import.meta.env.VITE_WS_URL}
                    tenantId={import.meta.env.VITE_TENANT_ID}
                  >
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
                  </RealtimeProvider>
                </AuthProvider>
              </NotificationCenterProvider>
            </BrowserRouter>
          </ToastProvider>
        </ErrorBoundary>
        </DialogProvider>
      </DesignsystemetProvider>
    </I18nProvider>
  );
}
