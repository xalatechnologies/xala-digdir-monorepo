/**
 * saas-admin App Component
 *
 * With RuntimeProvider, this file is now JUST routing.
 * All provider composition is handled by RuntimeProvider in main.tsx.
 */
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute, Heading, Paragraph } from '@xala/ds';
import { useT } from '@xala/i18n';
import { useOAuthCallback } from '@xala/auth';

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

/**
 * OAuth Callback Handler
 * Handles OAuth redirects automatically - must be inside BrowserRouter
 */
function OAuthCallbackHandler() {
  useOAuthCallback();
  return null;
}

/**
 * Dashboard Page
 */
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

/**
 * App Component - Routes Only
 *
 * With RuntimeProvider in main.tsx, this component is now thin:
 * - BrowserRouter (app-specific, contains router hooks)
 * - Routes
 *
 * All cross-cutting concerns (auth, i18n, theme, SDK) are handled by RuntimeProvider.
 */
export function App() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <OAuthCallbackHandler />
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
    </BrowserRouter>
  );
}
