import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DesignsystemetProvider, DialogProvider, ErrorBoundary } from '@xala/ds';
import { I18nProvider } from '@xala/i18n';

import { AuthProvider } from './providers/AuthProvider';
import { BackofficeRoleProvider } from './providers/BackofficeRoleProvider';
import { ToastProvider } from './providers/ToastProvider';
import { RealtimeProvider } from './providers/RealtimeProvider';
import { ThemeProvider, useTheme } from './providers/ThemeProvider';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AppLayout } from './components/layout/AppLayout';
import { LoadingFallback } from './components/LoadingFallback';
import { initSentry } from './lib/sentry';

// Eager imports - frequently accessed pages
import { LoginPage } from './routes/login';
import { RoleSelectionPage } from './routes/role-selection';

// Lazy-loaded page components
const DashboardPage = React.lazy(() => import('./routes/dashboard').then(m => ({ default: m.DashboardPage })));
const RentalObjectsPage = React.lazy(() => import('./routes/rental-objects').then(m => ({ default: m.RentalObjectsPage })));
const RentalObjectEditPage = React.lazy(() => import('./routes/rental-objects').then(m => ({ default: m.RentalObjectEditPage })));
const RentalObjectDetailPage = React.lazy(() => import('./routes/rental-objects').then(m => ({ default: m.RentalObjectDetailPage })));
const CalendarPage = React.lazy(() => import('./routes/calendar').then(m => ({ default: m.CalendarPage })));
const BookingsPage = React.lazy(() => import('./routes/bookings').then(m => ({ default: m.BookingsPage })));
const SeasonsListPage = React.lazy(() => import('./routes/seasons').then(m => ({ default: m.SeasonsListPage })));
const SeasonDetailPage = React.lazy(() => import('./routes/seasons').then(m => ({ default: m.SeasonDetailPage })));
const SeasonFormPage = React.lazy(() => import('./routes/seasons').then(m => ({ default: m.SeasonFormPage })));
const MessagesPage = React.lazy(() => import('./routes/messages').then(m => ({ default: m.MessagesPage })));
const OrganizationsListPage = React.lazy(() => import('./routes/organizations').then(m => ({ default: m.OrganizationsListPage })));
const OrganizationDetailPage = React.lazy(() => import('./routes/organizations').then(m => ({ default: m.OrganizationDetailPage })));
const OrganizationFormPage = React.lazy(() => import('./routes/organizations').then(m => ({ default: m.OrganizationFormPage })));
const UsersPage = React.lazy(() => import('./routes/users').then(m => ({ default: m.UsersPage })));
const ReportsPage = React.lazy(() => import('./routes/reports').then(m => ({ default: m.ReportsPage })));
const AuditPage = React.lazy(() => import('./routes/audit').then(m => ({ default: m.AuditPage })));
const ReviewModerationPage = React.lazy(() => import('./routes/reviews').then(m => ({ default: m.ReviewModerationPage })));
const SettingsPage = React.lazy(() => import('./routes/settings').then(m => ({ default: m.SettingsPage })));

// Saksbehandler pages
const WorkQueuePage = React.lazy(() => import('./routes/work-queue').then(m => ({ default: m.WorkQueuePage })));
const SeasonApplicationsReviewPage = React.lazy(() => import('./routes/season-applications').then(m => ({ default: m.SeasonApplicationsReviewPage })));
const AllocationPlannerPage = React.lazy(() => import('./routes/allocation-planner').then(m => ({ default: m.AllocationPlannerPage })));
const DecisionFormsPage = React.lazy(() => import('./routes/decision-forms').then(m => ({ default: m.DecisionFormsPage })));
const AuditTimelinePage = React.lazy(() => import('./routes/audit-timeline').then(m => ({ default: m.AuditTimelinePage })));

// Admin pages
const RentalObjectWizardPage = React.lazy(() => import('./routes/rental-objects').then(m => ({ default: m.RentalObjectEditPage })));
const PricingRulesPage = React.lazy(() => import('./routes/pricing-rules').then(m => ({ default: m.PricingRulesPage })));
const UsersManagementPage = React.lazy(() => import('./routes/users-management').then(m => ({ default: m.UsersManagementPage })));
const AdminReportsPage = React.lazy(() => import('./routes/admin-reports').then(m => ({ default: m.AdminReportsPage })));

// TenantAdmin pages
const TenantSettingsPage = React.lazy(() => import('./routes/tenant/settings').then(m => ({ default: m.TenantSettingsPage })));
const TenantBrandingPage = React.lazy(() => import('./routes/tenant/branding').then(m => ({ default: m.TenantBrandingPage })));
const TenantAuditLogPage = React.lazy(() => import('./routes/tenant/audit-log').then(m => ({ default: m.TenantAuditLogPage })));

// Initialize Sentry error tracking before React rendering
initSentry();

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
    <I18nProvider>
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
        <AuthProvider>
          <BackofficeRoleProvider>
          <RealtimeProvider
            wsUrl={import.meta.env.VITE_WS_URL}
            tenantId={import.meta.env.VITE_TENANT_ID}
          >
          <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/role-selection" element={<RoleSelectionPage />} />

            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardPage />} />
              {/* Rental Objects routes */}
              <Route path="rental-objects" element={<RentalObjectsPage />} />
              <Route path="rental-objects/new" element={<RentalObjectEditPage />} />
              <Route path="rental-objects/:slug" element={<RentalObjectEditPage />} />
              <Route path="rental-objects/:slug/view" element={<RentalObjectDetailPage />} />
              {/* Legacy redirects for backwards compatibility */}
              <Route path="listings" element={<Navigate to="/rental-objects" replace />} />
              <Route path="listings/new" element={<Navigate to="/rental-objects/new" replace />} />
              {/* Note: Dynamic redirects for /listings/:slug routes would require custom component - handled by 404 for now */}
              <Route path="calendar" element={<CalendarPage />} />
              <Route path="requests" element={<Navigate to="/bookings" replace />} />
              <Route path="bookings" element={<BookingsPage />} />
              <Route path="seasons" element={<SeasonsListPage />} />
              <Route path="seasons/new" element={<SeasonFormPage />} />
              <Route path="seasons/:id" element={<SeasonDetailPage />} />
              <Route path="seasons/:id/edit" element={<SeasonFormPage />} />
              <Route path="messages" element={<MessagesPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route
                path="reviews/moderation"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <ReviewModerationPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="audit"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AuditPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="organizations"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <OrganizationsListPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="organizations/new"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <OrganizationFormPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="organizations/:id"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <OrganizationDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="organizations/:id/edit"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <OrganizationFormPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="users"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <UsersPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="settings"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <SettingsPage />
                  </ProtectedRoute>
                }
              />
              
              {/* Saksbehandler routes */}
              <Route
                path="work-queue"
                element={
                  <ProtectedRoute requiredRole="case_handler">
                    <WorkQueuePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="season-applications"
                element={
                  <ProtectedRoute requiredRole="case_handler">
                    <SeasonApplicationsReviewPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="allocation-planner"
                element={
                  <ProtectedRoute requiredRole="case_handler">
                    <AllocationPlannerPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="decision-forms"
                element={
                  <ProtectedRoute requiredRole="case_handler">
                    <DecisionFormsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="audit-timeline"
                element={
                  <ProtectedRoute requiredRole="case_handler">
                    <AuditTimelinePage />
                  </ProtectedRoute>
                }
              />
              
              {/* Admin routes */}
              <Route
                path="rental-objects/wizard"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <RentalObjectWizardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="rental-objects/wizard/:id"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <RentalObjectWizardPage />
                  </ProtectedRoute>
                }
              />
              {/* Legacy wizard redirects */}
              <Route path="listings/wizard" element={<Navigate to="/rental-objects/wizard" replace />} />
              <Route
                path="pricing-rules"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <PricingRulesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="users-management"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <UsersManagementPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin-reports"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminReportsPage />
                  </ProtectedRoute>
                }
              />
              
              {/* TenantAdmin routes */}
              <Route
                path="tenant/settings"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <TenantSettingsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="tenant/branding"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <TenantBrandingPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="tenant/audit-log"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <TenantAuditLogPage />
                  </ProtectedRoute>
                }
              />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </Suspense>
          </RealtimeProvider>
          </BackofficeRoleProvider>
        </AuthProvider>
      </BrowserRouter>
      </ToastProvider>
      </ErrorBoundary>
      </DialogProvider>
      </DesignsystemetProvider>
    </I18nProvider>
  );
}
