import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DesignsystemetProvider, ErrorBoundary, Heading, Paragraph } from '@xala/ds';
import { I18nProvider } from '@xala/i18n';
import { AuthProvider, ToastProvider } from './providers';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AppLayout } from './components/layout/AppLayout';
import { LoginPage, TenantsListPage, TenantDetailPage } from './routes';

function DashboardPage() {
  return (
    <div>
      <Heading level={1} data-size="lg">SaaS Admin Dashboard</Heading>
      <Paragraph>Welcome to the Digilist SaaS Administration Portal.</Paragraph>
      <Paragraph>This application is used for platform-wide tenant management.</Paragraph>
    </div>
  );
}

export function App() {
  return (
    <I18nProvider>
      <DesignsystemetProvider theme="digilist" colorScheme="auto" size="md">
        <ErrorBoundary>
          <ToastProvider>
            <BrowserRouter
              future={{
                v7_startTransition: true,
                v7_relativeSplatPath: true,
              }}
            >
              <AuthProvider>
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
                    <Route path="/tenants" element={<TenantsListPage />} />
                    <Route path="/tenants/:id" element={<TenantDetailPage />} />
                  </Route>
                </Routes>
              </AuthProvider>
            </BrowserRouter>
          </ToastProvider>
        </ErrorBoundary>
      </DesignsystemetProvider>
    </I18nProvider>
  );
}
