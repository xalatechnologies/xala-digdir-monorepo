/**
 * monitoring-global App Component
 *
 * Global Control Plane monitoring dashboard.
 * Routes-only component for navigation.
 *
 * PLATFORM-ONLY: No @digilist/* imports allowed.
 */
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardPage } from './routes/index';
import { InfrastructurePage } from './routes/infrastructure';
import { TenantsPage } from './routes/tenants';
import { AlertsPage } from './routes/alerts';

/**
 * App Component - Routes Only
 *
 * This component is thin - just routing.
 * All cross-cutting concerns are handled in main.tsx.
 */
export function App() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/infrastructure" element={<InfrastructurePage />} />
          <Route path="/tenants" element={<TenantsPage />} />
          <Route path="/alerts" element={<AlertsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
