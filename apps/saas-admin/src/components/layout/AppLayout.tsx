/**
 * SaaS Admin Application Layout
 *
 * Main layout component that wraps all authenticated pages.
 * Provides sidebar navigation, header, and content area.
 */

import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/tenants': 'Tenants',
  '/plans': 'Planer',
  '/feature-flags': 'Feature Flags',
  '/billing': 'Fakturering',
  '/users': 'Brukere',
  '/audit': 'Audit Log',
  '/settings': 'Innstillinger',
};

export function AppLayout() {
  const location = useLocation();
  const title = pageTitles[location.pathname] ?? '';

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        backgroundColor: 'var(--ds-color-neutral-background-default)',
      }}
    >
      <Sidebar />

      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <Header title={title} />

        <main
          style={{
            flex: 1,
            overflow: 'auto',
            padding: 'var(--ds-spacing-8)',
          }}
        >
          <div style={{ maxWidth: '1400px' }}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
