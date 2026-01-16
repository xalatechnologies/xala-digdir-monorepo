import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useT } from '@xala/i18n';

export function AppLayout() {
  const t = useT();
  const location = useLocation();
  
  const pageTitles: Record<string, string> = {
    '/': 'Dashboard',
    '/bookings': 'Bookinger',
    '/reports': 'Rapporter',
    '/users': 'Brukere',
    '/settings': t('ui.settings') || 'Innstillinger',
  };
  
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
