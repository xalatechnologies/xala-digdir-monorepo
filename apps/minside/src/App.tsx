/**
 * minside App Component
 *
 * With RuntimeProvider, this file contains only:
 * - BrowserRouter (app-specific routing)
 * - AccountContextProvider (app-specific account switching)
 * - Routes
 */
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute, AccountSelectionModal } from '@xala/ds';
import { useOAuthCallback } from '@xala/auth';
import { AccountContextProvider, useAccountContext, type DashboardContext } from '@xala/runtime';

// Dashboard context constants
const CONTEXT_PERSONAL: DashboardContext = 'personal';
const CONTEXT_ORGANIZATION: DashboardContext = 'organization';

// Layout and Routes
import { AppLayout } from './components/layout/AppLayout';
import { LoginPage } from './routes/login';
import { DashboardPage } from './routes/dashboard';
import { CalendarPage } from './routes/calendar';
import { BookingsPage } from './routes/bookings';
import { BillingPage } from './routes/billing';
import { MessagesPage } from './routes/messages';
import { SettingsPage } from './routes/settings';
import { OrganizationDashboardPage, OrganizationBookingsPage, OrganizationInvoicesPage, OrganizationMembersPage, SeasonRentalPage, OrganizationSettingsPage, OrganizationActivityPage } from './routes/org';
import { UserPreferencesPage } from './routes/preferences';
import { NotificationsPage } from './routes/notifications';
import { HelpPage } from './routes/help';
import { PrivacyPage } from './routes/privacy';
import { FavoritesPage } from './routes/favorites';
import { SeasonsPage } from './routes/seasons';
import { SeasonApplicationsPage } from './routes/season-applications';
import { SeasonDetailPage } from './routes/season-detail';

/**
 * OAuth Callback Handler
 */
function OAuthCallbackHandler() {
  useOAuthCallback();
  return null;
}

/**
 * Account Selection Wrapper
 * App-specific: displays account selection modal on first login
 */
function AccountSelectionWrapper({ children }: { children: React.ReactNode }) {
  const {
    hasSelectedAccount,
    rememberChoice,
    setRememberChoice,
    organizations,
    isLoadingOrganizations,
    switchToPersonal,
    switchToOrganization,
    markAccountAsSelected,
  } = useAccountContext();

  const showModal = !hasSelectedAccount && !rememberChoice;

  const handlePersonalSelect = () => {
    switchToPersonal();
    markAccountAsSelected();
  };

  const handleOrganizationSelect = (orgId: string) => {
    switchToOrganization(orgId);
    markAccountAsSelected();
  };

  return (
    <>
      <AccountSelectionModal
        open={showModal}
        organizations={organizations}
        isLoadingOrganizations={isLoadingOrganizations}
        rememberChoice={rememberChoice}
        onRememberChoiceChange={setRememberChoice}
        onPersonalSelect={handlePersonalSelect}
        onOrganizationSelect={handleOrganizationSelect}
      />
      {children}
    </>
  );
}

/**
 * MinSide App - Citizen Dashboard
 * Now thin: BrowserRouter + AccountContext + Routes only
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
      <AccountContextProvider storageKeyPrefix="minside">
        <AccountSelectionWrapper>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              {/* Personal context routes */}
              <Route index element={<ProtectedRoute requiredContext={CONTEXT_PERSONAL}><DashboardPage /></ProtectedRoute>} />
              <Route path="bookings" element={<ProtectedRoute requiredContext={CONTEXT_PERSONAL}><BookingsPage /></ProtectedRoute>} />
              <Route path="billing" element={<ProtectedRoute requiredContext={CONTEXT_PERSONAL}><BillingPage /></ProtectedRoute>} />
              <Route path="calendar" element={<ProtectedRoute requiredContext={CONTEXT_PERSONAL}><CalendarPage /></ProtectedRoute>} />
              <Route path="messages" element={<ProtectedRoute requiredContext={CONTEXT_PERSONAL}><MessagesPage /></ProtectedRoute>} />
              <Route path="favorites" element={<ProtectedRoute requiredContext={CONTEXT_PERSONAL}><FavoritesPage /></ProtectedRoute>} />
              <Route path="seasons" element={<ProtectedRoute requiredContext={CONTEXT_PERSONAL}><SeasonsPage /></ProtectedRoute>} />
              <Route path="seasons/:id" element={<ProtectedRoute requiredContext={CONTEXT_PERSONAL}><SeasonDetailPage /></ProtectedRoute>} />
              <Route path="season-applications" element={<ProtectedRoute requiredContext={CONTEXT_PERSONAL}><SeasonApplicationsPage /></ProtectedRoute>} />

              {/* Shared routes */}
              <Route path="settings" element={<SettingsPage />} />
              <Route path="preferences" element={<UserPreferencesPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="privacy" element={<PrivacyPage />} />
              <Route path="help" element={<HelpPage />} />

              {/* Organization portal routes */}
              <Route path="org" element={<ProtectedRoute requiredContext={CONTEXT_ORGANIZATION}><OrganizationDashboardPage /></ProtectedRoute>} />
              <Route path="org/bookings" element={<ProtectedRoute requiredContext={CONTEXT_ORGANIZATION}><OrganizationBookingsPage /></ProtectedRoute>} />
              <Route path="org/invoices" element={<ProtectedRoute requiredContext={CONTEXT_ORGANIZATION}><OrganizationInvoicesPage /></ProtectedRoute>} />
              <Route path="org/members" element={<ProtectedRoute requiredContext={CONTEXT_ORGANIZATION}><OrganizationMembersPage /></ProtectedRoute>} />
              <Route path="org/season-rental" element={<ProtectedRoute requiredContext={CONTEXT_ORGANIZATION}><SeasonRentalPage /></ProtectedRoute>} />
              <Route path="org/settings" element={<ProtectedRoute requiredContext={CONTEXT_ORGANIZATION}><OrganizationSettingsPage /></ProtectedRoute>} />
              <Route path="org/activity" element={<ProtectedRoute requiredContext={CONTEXT_ORGANIZATION}><OrganizationActivityPage /></ProtectedRoute>} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AccountSelectionWrapper>
      </AccountContextProvider>
    </BrowserRouter>
  );
}
