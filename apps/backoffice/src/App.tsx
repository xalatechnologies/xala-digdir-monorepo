import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DesignsystemetProvider } from '@xala/ds';
import { I18nProvider } from '@xala/i18n';

import { AuthProvider } from './providers/AuthProvider';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AppLayout } from './components/layout/AppLayout';
import { LoginPage } from './routes/login';
import { DashboardPage } from './routes/dashboard';
import { ListingsPage, ListingEditPage, ListingDetailPage } from './routes/listings';
import { CalendarPage } from './routes/calendar';
import { RequestsPage } from './routes/requests';
import { BookingsPage } from './routes/bookings';
import { SeasonsPage } from './routes/seasons';
import { MessagesPage } from './routes/messages';
import { OrganizationsPage } from './routes/organizations';
import { UsersPage } from './routes/users';
import { ReportsPage } from './routes/reports';
import { SettingsPage } from './routes/settings';

export function App() {
  return (
    <I18nProvider>
      <DesignsystemetProvider theme="digilist" colorScheme="light" size="md">
      <BrowserRouter>
        <AuthProvider>
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
              <Route path="listings" element={<ListingsPage />} />
              <Route path="listings/new" element={<ListingEditPage />} />
              <Route path="listings/:slug" element={<ListingEditPage />} />
              <Route path="listings/:slug/view" element={<ListingDetailPage />} />
              <Route path="calendar" element={<CalendarPage />} />
              <Route path="requests" element={<RequestsPage />} />
              <Route path="bookings" element={<BookingsPage />} />
              <Route path="seasons" element={<SeasonsPage />} />
              <Route path="messages" element={<MessagesPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route
                path="organizations"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <OrganizationsPage />
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
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
      </DesignsystemetProvider>
    </I18nProvider>
  );
}
