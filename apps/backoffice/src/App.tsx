import React, { Suspense, useState, useCallback, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DesignsystemetProvider, DialogProvider, ErrorBoundary } from '@xala/ds';
import { I18nProvider } from '@xala/i18n';

import { AuthProvider, useOAuthCallback } from '@xala/auth';
import { BackofficeRoleProvider } from './providers/BackofficeRoleProvider';
import { CapabilityProvider } from './providers/CapabilityProvider';
import { ToastProvider } from './providers/ToastProvider';
import { RealtimeProvider } from '@digilist/client-sdk';
import { ThemeProvider, useTheme } from '@xala/ds';
import { ProtectedRoute } from '@xala/ds';
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
const BookingDetailPage = React.lazy(() => import('./routes/bookings/detail'));
const PendingBookingsPage = React.lazy(() => import('./routes/bookings/pending'));
const SeasonsListPage = React.lazy(() => import('./routes/seasons').then(m => ({ default: m.SeasonsListPage })));
const SeasonDetailPage = React.lazy(() => import('./routes/seasons').then(m => ({ default: m.SeasonDetailPage })));
const SeasonFormPage = React.lazy(() => import('./routes/seasons').then(m => ({ default: m.SeasonFormPage })));
const MessagesPage = React.lazy(() => import('./routes/messages').then(m => ({ default: m.MessagesPage })));
const OrganizationsListPage = React.lazy(() => import('./routes/organizations').then(m => ({ default: m.OrganizationsListPage })));
const OrganizationDetailPage = React.lazy(() => import('./routes/organizations').then(m => ({ default: m.OrganizationDetailPage })));
const OrganizationFormPage = React.lazy(() => import('./routes/organizations').then(m => ({ default: m.OrganizationFormPage })));
// RBAC Organization pages
const OrganizationMembersPage = React.lazy(() => import('./routes/organizations').then(m => ({ default: m.OrganizationMembersPage })));
const PermissionAssignmentPage = React.lazy(() => import('./routes/organizations').then(m => ({ default: m.PermissionAssignmentPage })));
// RBAC Access Grants pages
const AccessGrantsPage = React.lazy(() => import('./routes/access-grants').then(m => ({ default: m.AccessGrantsPage })));
const NewAccessGrantPage = React.lazy(() => import('./routes/access-grants').then(m => ({ default: m.NewAccessGrantPage })));
const UsersPage = React.lazy(() => import('./routes/users').then(m => ({ default: m.UsersPage })));
const ReportsPage = React.lazy(() => import('./routes/reports').then(m => ({ default: m.ReportsPage })));
const AuditPage = React.lazy(() => import('./routes/audit').then(m => ({ default: m.AuditPage })));
const ReviewModerationPage = React.lazy(() => import('./routes/reviews').then(m => ({ default: m.ReviewModerationPage })));
const SettingsPage = React.lazy(() => import('./routes/settings').then(m => ({ default: m.SettingsPage })));
const GdprRequestsPage = React.lazy(() => import('./routes/gdpr-requests').then(m => ({ default: m.GdprRequestsPage })));

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
const TenantUsersListPage = React.lazy(() => import('./routes/tenant/users').then(m => ({ default: m.TenantUsersListPage })));
const TenantUserInvitePage = React.lazy(() => import('./routes/tenant/users/invite').then(m => ({ default: m.TenantUserInvitePage })));
const TenantFeaturesPage = React.lazy(() => import('./routes/tenant/features').then(m => ({ default: m.TenantFeaturesPage })));
const OrganizationRentalObjectsPage = React.lazy(() => import('./routes/organizations/rental-objects').then(m => ({ default: m.OrganizationRentalObjectsPage })));

// OrgAdmin pages
const OrgAdminDashboardPage = React.lazy(() => import('./routes/org-admin').then(m => ({ default: m.OrgAdminDashboardPage })));

// Blocks pages
const BlocksListPage = React.lazy(() => import('./routes/blocks').then(m => ({ default: m.BlocksListPage })));
const BlockDetailPage = React.lazy(() => import('./routes/blocks').then(m => ({ default: m.BlockDetailPage })));
const BlockFormPage = React.lazy(() => import('./routes/blocks').then(m => ({ default: m.BlockFormPage })));

// Help pages
const HelpPage = React.lazy(() => import('./routes/help/index'));
const HelpGuidesPage = React.lazy(() => import('./routes/help/guides'));
const HelpFAQPage = React.lazy(() => import('./routes/help/faq'));

// Initialize Sentry error tracking before React rendering
initSentry();

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
 * Handles OAuth/BankID redirects automatically - must be inside BrowserRouter
 */
function OAuthCallbackHandler() {
  useOAuthCallback();
  return null;
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
          <AuthProvider config={{ appType: 'backoffice', debug: import.meta.env.DEV }}>
            <AppContent />
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

function AppContent() {
  return (
    <BackofficeRoleProvider>
          <CapabilityProvider>
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
              <Route path="bookings/pending" element={<PendingBookingsPage />} />
              <Route path="bookings/:id" element={<BookingDetailPage />} />
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
                path="organizations/:id/members"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <OrganizationMembersPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="organizations/:id/permissions"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <PermissionAssignmentPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="organizations/:id/rental-objects"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <OrganizationRentalObjectsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="access-grants"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AccessGrantsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="access-grants/new"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <NewAccessGrantPage />
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
              <Route
                path="gdpr-requests"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <GdprRequestsPage />
                  </ProtectedRoute>
                }
              />
              
              {/* Saksbehandler routes - case_handler role only */}
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
              <Route
                path="tenant/users"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <TenantUsersListPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="tenant/users/invite"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <TenantUserInvitePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="tenant/features"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <TenantFeaturesPage />
                  </ProtectedRoute>
                }
              />

              {/* OrgAdmin routes */}
              <Route
                path="org-admin/dashboard"
                element={
                  <ProtectedRoute requiredRole="org_admin">
                    <OrgAdminDashboardPage />
                  </ProtectedRoute>
                }
              />

              {/* Blocks routes - accessible to org_admin, org_member, case_handler, and admin */}
              <Route path="blocks" element={<BlocksListPage />} />
              <Route path="blocks/new" element={<BlockFormPage />} />
              <Route path="blocks/:id" element={<BlockDetailPage />} />
              <Route path="blocks/:id/edit" element={<BlockFormPage />} />

              {/* Help routes - accessible to all authenticated users */}
              <Route path="help" element={<HelpPage />} />
              <Route path="help/guides" element={<HelpGuidesPage />} />
              <Route path="help/faq" element={<HelpFAQPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </Suspense>
          </RealtimeProvider>
          </CapabilityProvider>
          </BackofficeRoleProvider>
  );
}
