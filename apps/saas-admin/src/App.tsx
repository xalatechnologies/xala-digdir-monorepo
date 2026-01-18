import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DesignsystemetProvider, ErrorBoundary, Heading, Paragraph } from '@xala/ds';
import { LazyI18nProvider, useT } from '@xala/i18n';
import { AuthProvider } from '@xala/auth';
import { ToastProvider } from './providers';
import { ProtectedRoute } from '@xala/ds';
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
      <Heading level={1} size="lg">{t('saasAdmin.dashboard.page.title')}</Heading>
      <Paragraph>{t('saasAdmin.dashboard.welcome')}</Paragraph>
      <Paragraph>{t('saasAdmin.dashboard.description')}</Paragraph>
    </div>
  );
}

export function App() {
  return (
    <LazyI18nProvider>
      <DesignsystemetProvider theme="digilist" colorScheme="auto" size="md">
        <ErrorBoundary>
          <ToastProvider>
            <BrowserRouter
              future={{
                v7_startTransition: true,
                v7_relativeSplatPath: true,
              }}
            >
              <AuthProvider config={{ appType: 'saas-admin', debug: import.meta.env.DEV }}>
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
              </AuthProvider>
            </BrowserRouter>
          </ToastProvider>
        </ErrorBoundary>
      </DesignsystemetProvider>
    </LazyI18nProvider>
  );
}
