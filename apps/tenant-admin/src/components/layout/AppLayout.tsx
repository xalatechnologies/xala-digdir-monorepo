/**
 * Tenant Admin Application Layout
 *
 * Mobile-first responsive layout for Tenant Admin app
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
  UsersIcon,
  ShieldIcon,
  SparklesIcon,
  ChartIcon,
  ClockIcon,
  SettingsIcon,
} from '@xala/ds';
import { useT } from '@xala/i18n';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import styles from './AppLayout.module.css';

const MOBILE_BREAKPOINT = 768;

export function AppLayout() {
  const location = useLocation();
  const t = useT();
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < MOBILE_BREAKPOINT : false
  );

  // Track viewport size for mobile/desktop detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Bottom navigation items for mobile - show most important items
  const bottomNavItems: BottomNavigationItem[] = [
    {
      id: 'dashboard',
      label: t('tenantAdmin.nav.dashboard'),
      icon: <HomeIcon />,
      href: '/',
      active: location.pathname === '/',
    },
    {
      id: 'users',
      label: t('tenantAdmin.nav.users'),
      icon: <UsersIcon />,
      href: '/users',
      active: location.pathname.startsWith('/users'),
    },
    {
      id: 'subscription',
      label: t('tenantAdmin.nav.planAndBilling'),
      icon: <ChartIcon />,
      href: '/subscription',
      active: location.pathname.startsWith('/subscription'),
    },
    {
      id: 'branding',
      label: t('tenantAdmin.nav.branding'),
      icon: <SparklesIcon />,
      href: '/branding',
      active: location.pathname.startsWith('/branding'),
    },
    {
      id: 'settings',
      label: t('tenantAdmin.nav.settings'),
      icon: <SettingsIcon />,
      href: '/settings',
      active: location.pathname.startsWith('/settings'),
    },
  ];

  return (
    <div className={styles.appLayout}>
      {/* Sidebar - Desktop only */}
      {!isMobile && <Sidebar />}

      <div className={styles.contentArea}>
        <Header />

        <main
          className={styles.mainContent}
          style={{
            paddingBottom: isMobile ? 'calc(64px + var(--ds-spacing-4) + env(safe-area-inset-bottom))' : undefined,
          }}
        >
          <div className={styles.maxWidthWrapper}>
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
