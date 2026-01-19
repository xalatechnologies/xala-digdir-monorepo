/**
 * SaaS Admin Application Layout
 *
 * Mobile-first responsive layout for SaaS Admin app
 * - Shows sidebar on desktop (>= 768px)
 * - Shows bottom navigation on mobile (< 768px)
 * - Follows DIGILIST design patterns
 */

import { Outlet, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  BottomNavigation,
  type BottomNavigationItem,
  DashboardContent,
  HomeIcon,
  BuildingIcon,
  ChartIcon,
  UsersIcon,
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

  // Page title lookup using i18n keys
  const pageTitleKeys: Record<string, string> = {
    '/': 'saasAdmin.nav.dashboard',
    '/tenants': 'saasAdmin.nav.tenants',
    '/plans': 'saasAdmin.nav.plans',
    '/feature-flags': 'saasAdmin.nav.featureFlags',
    '/billing': 'saasAdmin.nav.billing',
    '/users': 'saasAdmin.nav.users',
    '/audit': 'saasAdmin.nav.auditLog',
    '/settings': 'saasAdmin.nav.settings',
  };

  const titleKey = pageTitleKeys[location.pathname];
  const title = titleKey ? t(titleKey) : '';

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
      label: t('saasAdmin.nav.dashboard'),
      icon: <HomeIcon />,
      href: '/',
      active: location.pathname === '/',
    },
    {
      id: 'tenants',
      label: t('saasAdmin.nav.tenants'),
      icon: <BuildingIcon />,
      href: '/tenants',
      active: location.pathname.startsWith('/tenants'),
    },
    {
      id: 'billing',
      label: t('saasAdmin.nav.billing'),
      icon: <ChartIcon />,
      href: '/billing',
      active: location.pathname.startsWith('/billing'),
    },
    {
      id: 'users',
      label: t('saasAdmin.nav.users'),
      icon: <UsersIcon />,
      href: '/users',
      active: location.pathname.startsWith('/users'),
    },
    {
      id: 'settings',
      label: t('saasAdmin.nav.settings'),
      icon: <SettingsIcon />,
      href: '/settings',
      active: location.pathname.startsWith('/settings'),
    },
  ];

  return (
    <div className={styles.layout}>
      {/* Sidebar - Desktop only */}
      {!isMobile && <Sidebar />}

      <div className={styles.main}>
        <Header title={title} />

        <DashboardContent
          hasBottomNav={isMobile}
          data-testid="saas-admin-content"
        >
          <Outlet />
        </DashboardContent>
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
