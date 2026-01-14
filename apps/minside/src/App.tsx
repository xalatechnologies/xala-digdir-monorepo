import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { DesignsystemetProvider, DialogProvider, NotificationCenter, PushNotificationPrompt } from '@xala/ds';
import type { NotificationFilter, NotificationItemData } from '@xala/ds';
import { I18nProvider } from '@xala/i18n';
import {
  useMyNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  useDeleteNotification,
  usePushPermission,
  usePushSubscriptionFlow
} from '@digilist/client-sdk';

// Import notification test utilities in development mode
if (import.meta.env.DEV) {
  import('./utils/notification-test');
}

import { AuthProvider } from './providers/AuthProvider';
import { AccountContextProvider, useAccountContext } from './providers/AccountContextProvider';
import { RealtimeProvider } from './providers/RealtimeProvider';
import { ThemeProvider, useTheme } from './providers/ThemeProvider';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AppLayout } from './components/layout/AppLayout';
import { AccountSelectionModal } from './components/AccountSelectionModal';
import { LoginPage } from './routes/login';
import { DashboardPage } from './routes/dashboard';
import { CalendarPage } from './routes/calendar';
import { BookingsPage } from './routes/bookings';
import { MessagesPage } from './routes/messages';
import { SettingsPage } from './routes/settings';
import { NotificationSettingsPage } from './routes/notification-settings';
import { useAuth } from './hooks/useAuth';

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
          <AccountContextProviderWrapper>
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
                    <AccountSelectionWrapper>
                      <AppLayout />
                    </AccountSelectionWrapper>
                  </ProtectedRoute>
                }
              >
                <Route index element={<DashboardPage />} />
                <Route path="bookings" element={<BookingsPage />} />
                <Route path="calendar" element={<CalendarPage />} />
                <Route path="messages" element={<MessagesPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="settings/notifications" element={<NotificationSettingsPage />} />
                {/* Season routes - will be created */}
                <Route path="seasons" element={<div>Seasons Page (TODO)</div>} />
                <Route path="seasons/:id" element={<div>Season Detail (TODO)</div>} />
                <Route path="seasons/applications" element={<div>My Applications (TODO)</div>} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            </NotificationProvider>
            </RealtimeProvider>
          </AccountContextProviderWrapper>
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
  const [showPushPrompt, setShowPushPrompt] = useState(false);

  // SDK hooks for notifications
  const { data: notificationsResponse, isLoading } = useMyNotifications();
  const markAsReadMutation = useMarkNotificationRead();
  const markAllAsReadMutation = useMarkAllNotificationsRead();
  const deleteNotificationMutation = useDeleteNotification();

  // SDK hooks for push notifications
  const { permission, isSupported, isGranted } = usePushPermission();
  const { subscribe, isSubscribing } = usePushSubscriptionFlow();

  // Check if we should show the push prompt
  // Show prompt if:
  // - Push notifications are supported
  // - Permission is not yet granted
  // - User hasn't dismissed the prompt before
  useEffect(() => {
    const hasBeenPrompted = localStorage.getItem('pushPromptDismissed');

    if (isSupported && !isGranted && !hasBeenPrompted) {
      // Show prompt after a short delay so user isn't immediately bombarded
      const timer = setTimeout(() => {
        setShowPushPrompt(true);
      }, 3000); // 3 second delay

      return () => clearTimeout(timer);
    }
  }, [isSupported, isGranted]);

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

  // Handle push prompt enable
  const handleEnablePush = useCallback(async () => {
    try {
      await subscribe();
      setShowPushPrompt(false);
      // Mark as prompted so we don't show again
      localStorage.setItem('pushPromptDismissed', 'true');
    } catch (error) {
      // Still close the prompt even if subscription fails
      setShowPushPrompt(false);
      localStorage.setItem('pushPromptDismissed', 'true');
    }
  }, [subscribe]);

  // Handle push prompt dismiss
  const handleDismissPush = useCallback(() => {
    setShowPushPrompt(false);
    // Remember that user dismissed so we don't show again
    localStorage.setItem('pushPromptDismissed', 'true');
  }, []);

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
      <PushNotificationPrompt
        isOpen={showPushPrompt}
        onClose={handleDismissPush}
        onEnable={handleEnablePush}
        onDismiss={handleDismissPush}
        context="booking"
      />
    </NotificationContext.Provider>
  );
}

// =============================================================================
// Account Context Provider Wrapper
// =============================================================================

function AccountContextProviderWrapper({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  return (
    <AccountContextProvider userId={user?.id} userName={user?.name}>
      {children}
    </AccountContextProvider>
  );
}

// =============================================================================
// Account Selection Wrapper
// =============================================================================

function AccountSelectionWrapper({ children }: { children: React.ReactNode }) {
  const { hasSelectedAccount } = useAccountContext();

  return (
    <>
      <AccountSelectionModal open={!hasSelectedAccount} />
      {children}
    </>
  );
}
