import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DesignsystemetProvider, DialogProvider, ErrorBoundary } from '@xala/ds';
import { I18nProvider } from '@xala/i18n';
import { useState, useCallback, createContext, useContext } from 'react';

import { AuthProvider, useOAuthCallback } from '@xala/auth';
import { RealtimeProvider } from '@digilist/client-sdk';
import { ThemeProvider, useTheme } from '@xala/ds';
import { AccountContextProvider, useAccountContext, type DashboardContext } from './providers/AccountContextProvider';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AccountSelectionModal } from './components/AccountSelectionModal';

// Dashboard context constants (technical identifiers, not user-facing strings)
const CONTEXT_PERSONAL: DashboardContext = 'personal';
const CONTEXT_ORGANIZATION: DashboardContext = 'organization';
import { AppLayout } from './components/layout/AppLayout';
import { LoginPage } from './routes/login';
import { DashboardPage } from './routes/dashboard';
import { CalendarPage } from './routes/calendar';
import { BookingsPage } from './routes/bookings';
import { BillingPage } from './routes/billing';
import { MessagesPage } from './routes/messages';
import { SettingsPage } from './routes/settings';
// Organization pages
import { OrganizationDashboardPage, OrganizationBookingsPage, OrganizationInvoicesPage, OrganizationMembersPage, SeasonRentalPage, OrganizationSettingsPage, OrganizationActivityPage } from './routes/org';
import { UserPreferencesPage } from './routes/preferences';
import { NotificationsPage } from './routes/notifications';
import { HelpPage } from './routes/help';
import { PrivacyPage } from './routes/privacy';
import { FavoritesPage } from './routes/favorites';
import { SeasonsPage } from './routes/seasons';
import { SeasonApplicationsPage } from './routes/season-applications';
import { SeasonDetailPage } from './routes/season-detail';

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

/**
 * Account Selection Wrapper
 * Displays the AccountSelectionModal when user hasn't selected an account yet
 * and hasn't chosen to remember their choice.
 *
 * Edge case handling:
 * - If rememberChoice is true (from localStorage), the modal is skipped
 * - The persisted context (personal/organization) is automatically restored
 *   by AccountContextProvider when rememberChoice is true
 */
function AccountSelectionWrapper({ children }: { children: React.ReactNode }) {
  const { hasSelectedAccount, rememberChoice } = useAccountContext();

  // Show modal only if:
  // 1. User hasn't selected an account yet (hasSelectedAccount = false)
  // 2. User hasn't chosen to remember their choice (rememberChoice = false)
  // If rememberChoice is true, skip modal and use persisted context
  const showModal = !hasSelectedAccount && !rememberChoice;

  return (
    <>
      <AccountSelectionModal open={showModal} />
      {children}
    </>
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
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <OAuthCallbackHandler />
        <NotificationCenterProvider>
          <AuthProvider config={{ appType: 'minside', debug: import.meta.env.DEV }}>
            <AccountContextProvider>
            <AccountSelectionWrapper>
            <RealtimeProvider
              wsUrl={import.meta.env.VITE_WS_URL}
              tenantId={import.meta.env.VITE_TENANT_ID}
            >
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

              {/* Shared routes (any context) */}
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
            </RealtimeProvider>
            </AccountSelectionWrapper>
            </AccountContextProvider>
          </AuthProvider>
        </NotificationCenterProvider>
      </BrowserRouter>
      </ErrorBoundary>
      </DialogProvider>
      </DesignsystemetProvider>
    </I18nProvider>
  );
}
