import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DesignsystemetProvider, ErrorBoundary } from '@xala/ds';
import { I18nProvider } from '@xala/i18n';
import { AuthProvider } from '@xala/auth';
import { ToastProvider } from './providers';
import { ProtectedRoute } from '@xala/ds';
import { AppLayout } from './components/layout/AppLayout';
import {
  LoginPage,
  DashboardPage,
  SubscriptionPage,
  BrandingSettingsPage,
  IntegrationsSettingsPage,
  UsersPage,
  FeatureFlagsPage,
  AuditLogPage,
  SettingsPage,
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
              <AuthProvider config={{ appType: 'tenant-admin', debug: import.meta.env.DEV }}>
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
                    <Route path="/users" element={<UsersPage />} />
                    <Route path="/feature-flags" element={<FeatureFlagsPage />} />
                    <Route path="/audit" element={<AuditLogPage />} />
                    <Route path="/branding" element={<BrandingSettingsPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
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
