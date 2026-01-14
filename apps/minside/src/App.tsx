import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DesignsystemetProvider, DialogProvider, ErrorBoundary } from '@xala/ds';
import { I18nProvider } from '@xala/i18n';
import { useState, useCallback, createContext, useContext } from 'react';

import { AuthProvider } from './providers/AuthProvider';
import { RealtimeProvider } from './providers/RealtimeProvider';
import { ThemeProvider, useTheme } from './providers/ThemeProvider';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AppLayout } from './components/layout/AppLayout';
import { LoginPage } from './routes/login';
import { DashboardPage } from './routes/dashboard';
import { CalendarPage } from './routes/calendar';
import { BookingsPage } from './routes/bookings';
import { BillingPage } from './routes/billing';
import { MessagesPage } from './routes/messages';
import { SettingsPage } from './routes/settings';
// Organization pages
import { OrganizationDashboardPage, OrganizationBookingsPage, OrganizationInvoicesPage, OrganizationMembersPage } from './routes/org';

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
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <NotificationCenterProvider>
          <AuthProvider>
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
              <Route index element={<DashboardPage />} />
              <Route path="bookings" element={<BookingsPage />} />
              <Route path="billing" element={<BillingPage />} />
              <Route path="calendar" element={<CalendarPage />} />
              <Route path="messages" element={<MessagesPage />} />
              <Route path="settings" element={<SettingsPage />} />
              
              {/* Organization portal routes */}
              <Route path="org" element={<OrganizationDashboardPage />} />
              <Route path="org/bookings" element={<OrganizationBookingsPage />} />
              <Route path="org/invoices" element={<OrganizationInvoicesPage />} />
              <Route path="org/members" element={<OrganizationMembersPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            </RealtimeProvider>
          </AuthProvider>
        </NotificationCenterProvider>
      </BrowserRouter>
      </ErrorBoundary>
      </DialogProvider>
      </DesignsystemetProvider>
    </I18nProvider>
  );
}
