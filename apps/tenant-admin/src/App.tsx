import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DesignsystemetProvider, ErrorBoundary } from '@xala/ds';
import { I18nProvider } from '@xala/i18n';
import { AuthProvider, ToastProvider } from './providers';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AppLayout } from './components/layout/AppLayout';
import {
  LoginPage,
  DashboardPage,
  SubscriptionPage,
  BrandingSettingsPage,
  IntegrationsSettingsPage,
} from './routes';

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
          <ToastProvider>
            <BrowserRouter
              future={{
                v7_startTransition: true,
                v7_relativeSplatPath: true,
              }}
            >
              <AuthProvider>
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
                    <Route path="/subscription" element={<SubscriptionPage />} />
                    <Route path="/branding" element={<BrandingSettingsPage />} />
                    <Route path="/settings/integrations" element={<IntegrationsSettingsPage />} />
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
