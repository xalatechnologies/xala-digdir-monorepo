import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DesignsystemetProvider, DialogProvider, ErrorBoundary, Heading, Paragraph, ProtectedRoute } from '@xala/ds';
import { I18nProvider, useT } from '@xala/i18n';
import { AuthProvider, useOAuthCallback } from '@xala/auth';
import { RealtimeProvider } from '@digilist/client-sdk';
import { ThemeProvider, useTheme } from '@xala/ds';
import { useState, useCallback, createContext, useContext } from 'react';
import { ToastProvider } from './providers';

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
import { AppLayout } from './components/layout/AppLayout';
import {
  LoginPage,
  TenantsListPage,
  TenantDetailPage,
  TenantCreatePage,
  TenantEditPage,
  PlansListPage,
  PlanCreatePage,
  PlanDetailPage,
  AISeedGeneratorPage,
  FeatureFlagsCatalogPage,
  BillingPage,
  UsersPage,
  AuditLogPage,
  SettingsPage,
  BrandingListPage,
  BrandingEditorPage,
  MonitoringPage,
  TranslationsPage,
} from './routes';

function DashboardPage() {
  const t = useT();
  return (
    <div>
      <Heading level={1} data-size="lg">{t('saasAdmin.dashboard.page.title')}</Heading>
      <Paragraph>{t('saasAdmin.dashboard.welcome')}</Paragraph>
      <Paragraph>{t('saasAdmin.dashboard.description')}</Paragraph>
    </div>
  );
}

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
              future={{
                v7_startTransition: true,
                v7_relativeSplatPath: true,
              }}
            >
              <OAuthCallbackHandler />
              <NotificationCenterProvider>
                <AuthProvider config={{ appType: 'saas-admin', debug: import.meta.env.DEV }}>
                  <RealtimeProvider
                    wsUrl={import.meta.env.VITE_WS_URL}
                    tenantId={import.meta.env.VITE_TENANT_ID}
                  >
                  <Routes>
                  <Route path="/login" element={<LoginPage />} />
                  <Route
                    element={
                      <ProtectedRoute>
                        <AppLayout />
                      </ProtectedRoute>
                    }
                  >
                    <Route path="/" element={<DashboardPage />} />
                    {/* Tenant routes */}
                    <Route path="/tenants" element={<TenantsListPage />} />
                    <Route path="/tenants/new" element={<TenantCreatePage />} />
                    <Route path="/tenants/:id" element={<TenantDetailPage />} />
                    <Route path="/tenants/:id/edit" element={<TenantEditPage />} />
                    {/* Plan routes */}
                    <Route path="/plans" element={<PlansListPage />} />
                    <Route path="/plans/new" element={<PlanCreatePage />} />
                    <Route path="/plans/:id" element={<PlanDetailPage />} />
                    {/* Other routes */}
                    <Route path="/feature-flags" element={<FeatureFlagsCatalogPage />} />
                    <Route path="/billing" element={<BillingPage />} />
                    <Route path="/users" element={<UsersPage />} />
                    <Route path="/audit" element={<AuditLogPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/ai-seeds" element={<AISeedGeneratorPage />} />
                    {/* Branding routes */}
                    <Route path="/branding" element={<BrandingListPage />} />
                    <Route path="/branding/:tenantId" element={<BrandingEditorPage />} />
                    {/* Monitoring routes */}
                    <Route path="/monitoring" element={<MonitoringPage />} />
                    {/* Translations route */}
                    <Route path="/translations" element={<TranslationsPage />} />
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
