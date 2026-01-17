/**
 * AppLayout Component
 *
 * Mobile-first responsive layout for Backoffice app
 * - Shows sidebar on desktop (>= 768px)
 * - Shows bottom navigation on mobile (< 768px)
 * - Follows DIGILIST design patterns
 */

import { Outlet, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  BottomNavigation,
  type BottomNavigationItem,
  HomeIcon,
  BuildingIcon,
  CalendarIcon,
  BookOpenIcon,
  MessageIcon,
  SettingsIcon,
} from '@xala/ds';
import { useT } from '@xala/i18n';
import { GlobalSearch } from '../GlobalSearch';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

const MOBILE_BREAKPOINT = 768;

export function AppLayout() {
  const t = useT();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < MOBILE_BREAKPOINT : false
  );
  
  const pageTitles: Record<string, string> = {
    '/': 'Dashboard',
    '/bookings': 'Bookinger',
    '/reports': 'Rapporter',
    '/users': 'Brukere',
    '/settings': t('ui.settings') || 'Innstillinger',
  };
  
  const title = pageTitles[location.pathname] ?? '';

  // Track viewport size for mobile/desktop detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Bottom navigation items for mobile
  const bottomNavItems: BottomNavigationItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <HomeIcon />,
      href: '/',
      active: location.pathname === '/',
    },
    {
      id: 'rental-objects',
      label: 'Utleieobjekter',
      icon: <BuildingIcon />,
      href: '/rental-objects',
      active: location.pathname.startsWith('/rental-objects'),
    },
    {
      id: 'calendar',
      label: 'Kalender',
      icon: <CalendarIcon />,
      href: '/calendar',
      active: location.pathname.startsWith('/calendar'),
    },
    {
      id: 'bookings',
      label: 'Bookinger',
      icon: <BookOpenIcon />,
      href: '/bookings',
      active: location.pathname.startsWith('/bookings'),
    },
    {
      id: 'messages',
      label: 'Meldinger',
      icon: <MessageIcon />,
      href: '/messages',
      active: location.pathname.startsWith('/messages'),
    },
    {
      id: 'settings',
      label: t('ui.settings') || 'Innstillinger',
      icon: <SettingsIcon />,
      href: '/settings',
      active: location.pathname.startsWith('/settings'),
    },
  ];

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        backgroundColor: 'var(--ds-color-neutral-background-default)',
      }}
    >
      {/* Sidebar - Desktop only */}
      {!isMobile && <Sidebar />}

      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <Header title={title} />

        {/* Mobile Search - Below header */}
        {isMobile && (
          <div style={{ padding: 'var(--ds-spacing-4) var(--ds-spacing-6)', borderBottom: '1px solid var(--ds-color-neutral-border-subtle)' }}>
            <GlobalSearch
              placeholder="Søk i bookinger, lokaler, organisasjoner..."
              showShortcut={false}
              enableGlobalShortcut={false}
            />
          </div>
        )}

        <main
          style={{
            flex: 1,
            overflow: 'auto',
            padding: isMobile ? 'var(--ds-spacing-4)' : 'var(--ds-spacing-8)',
            // Add padding at bottom for bottom navigation on mobile
            paddingBottom: isMobile ? 'calc(64px + var(--ds-spacing-4) + env(safe-area-inset-bottom))' : 'var(--ds-spacing-8)',
          }}
        >
          <div style={{ maxWidth: '1400px' }}>
            <Outlet />
          </div>
        </main>
      </div>

      {/* Bottom Navigation - Mobile only */}
      {isMobile && (
        <BottomNavigation
          items={bottomNavItems}
          fixed={true}
          variant="surface"
          showLabels={true}
          safeArea={true}
        />
      )}
    </div>
  );
}
