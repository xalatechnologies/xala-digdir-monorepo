import { Outlet, useLocation } from 'react-router-dom';
import { DocsSidebar } from '../components/layout/DocsSidebar';
import { DocsHeader } from '../components/layout/DocsHeader';

const pageTitles: Record<string, string> = {
  '/': 'Documentation',
  '/roles': 'Roles & Permissions',
  '/roles/admin': 'Admin Role',
  '/roles/case-handler': 'Case Handler Role',
  '/roles/booker': 'Booker Role',
  '/journeys': 'User Journeys',
  '/journeys/booking': 'Booking Flow',
  '/journeys/seasonal': 'Seasonal Leases',
  '/platform': 'Platform Overview',
  '/integrations': 'Integrations',
  '/seeding': 'Seeding Guide',
};

export function DocsLayout() {
  const location = useLocation();

  // Find the matching title - check exact match first, then prefix matches
  let title = pageTitles[location.pathname];
  if (!title) {
    // Try to find a prefix match
    const matchingKey = Object.keys(pageTitles)
      .filter(key => location.pathname.startsWith(key) && key !== '/')
      .sort((a, b) => b.length - a.length)[0];
    title = matchingKey ? pageTitles[matchingKey] : 'Documentation';
  }

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        backgroundColor: 'var(--ds-color-neutral-background-default)',
      }}
    >
      <DocsSidebar />

      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <DocsHeader title={title} />

        <main
          style={{
            flex: 1,
            overflow: 'auto',
            padding: 'var(--ds-spacing-8)',
          }}
        >
          <div style={{ maxWidth: '1200px' }}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
