import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { createContext, useContext, useState, useCallback } from 'react';
import { DesignsystemetProvider, DialogProvider, NotificationCenter } from '@xala/ds';
import type { NotificationFilter, NotificationItemData } from '@xala/ds';
import { I18nProvider } from '@xala/i18n';
import {
  useMyNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  useDeleteNotification
} from '@digilist/client-sdk';

import { AuthProvider } from './providers/AuthProvider';
import { RealtimeProvider } from './providers/RealtimeProvider';
import { ThemeProvider, useTheme } from './providers/ThemeProvider';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AppLayout } from './components/layout/AppLayout';
import { LoginPage } from './routes/login';
import { DashboardPage } from './routes/dashboard';
import { CalendarPage } from './routes/calendar';
import { BookingsPage } from './routes/bookings';
import { MessagesPage } from './routes/messages';
import { SettingsPage } from './routes/settings';

// =============================================================================
// Notification Context
// =============================================================================

interface NotificationContextValue {
  openNotificationCenter: () => void;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

export function useNotificationCenter() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationCenter must be used within NotificationProvider');
  }
  return context;
}

// =============================================================================
// App Component
// =============================================================================

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
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <AuthProvider>
          <RealtimeProvider
            wsUrl={import.meta.env.VITE_WS_URL}
            tenantId={import.meta.env.VITE_TENANT_ID}
          >
          <NotificationProvider>
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
              <Route path="calendar" element={<CalendarPage />} />
              <Route path="messages" element={<MessagesPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </NotificationProvider>
          </RealtimeProvider>
        </AuthProvider>
      </BrowserRouter>
      </DialogProvider>
      </DesignsystemetProvider>
    </I18nProvider>
  );
}

// =============================================================================
// Notification Provider
// =============================================================================

function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<NotificationFilter>('all');

  // SDK hooks for notifications
  const { data: notificationsResponse, isLoading } = useMyNotifications();
  const markAsReadMutation = useMarkNotificationRead();
  const markAllAsReadMutation = useMarkAllNotificationsRead();
  const deleteNotificationMutation = useDeleteNotification();

  const openNotificationCenter = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeNotificationCenter = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleMarkAsRead = useCallback((id: string) => {
    markAsReadMutation.mutate(id);
  }, [markAsReadMutation]);

  const handleMarkAllAsRead = useCallback(() => {
    markAllAsReadMutation.mutate();
  }, [markAllAsReadMutation]);

  const handleDelete = useCallback((id: string) => {
    deleteNotificationMutation.mutate(id);
  }, [deleteNotificationMutation]);

  const handleNotificationClick = useCallback((id: string) => {
    // Mark as read when clicked
    markAsReadMutation.mutate(id);
    // Could also navigate to the relevant page based on notification type
  }, [markAsReadMutation]);

  // Transform API response to NotificationItemData format
  const notifications: NotificationItemData[] = (notificationsResponse?.data ?? []).map((n: any) => ({
    id: n.id,
    type: n.type,
    title: n.title,
    message: n.message,
    createdAt: n.createdAt,
    readAt: n.readAt,
    priority: n.priority,
    metadata: n.metadata,
  }));

  const contextValue: NotificationContextValue = {
    openNotificationCenter,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      <NotificationCenter
        open={isOpen}
        onClose={closeNotificationCenter}
        notifications={notifications}
        loading={isLoading}
        filter={filter}
        onFilterChange={setFilter}
        onNotificationClick={handleNotificationClick}
        onMarkAsRead={handleMarkAsRead}
        onDelete={handleDelete}
        onMarkAllAsRead={handleMarkAllAsRead}
      />
    </NotificationContext.Provider>
  );
}
