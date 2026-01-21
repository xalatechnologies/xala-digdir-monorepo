/**
 * AppLayout for Global Control Plane
 *
 * Platform-only layout using @xalatechnologies/platform/ui components.
 * No @digilist/* imports allowed.
 */

import { useMemo } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import {
  AppLayout as DSAppLayout,
  type BottomNavigationItem,
  HomeIcon,
  DatabaseIcon,
  BuildingIcon,
  AlertTriangleIcon,
} from '@xalatechnologies/platform/ui';
import { useT } from '@xala/i18n';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export function AppLayout() {
  const location = useLocation();
  const t = useT();

  // Page title lookup using i18n keys
  const pageTitleKeys: Record<string, string> = {
    '/': 'monitoring.nav.dashboard',
    '/infrastructure': 'monitoring.nav.infrastructure',
    '/tenants': 'monitoring.nav.tenants',
    '/alerts': 'monitoring.nav.alerts',
  };

  const titleKey = pageTitleKeys[location.pathname];
  const title = titleKey ? t(titleKey) : '';

  // Bottom navigation items for mobile
  const bottomNavItems: BottomNavigationItem[] = useMemo(
    () => [
      {
        id: 'dashboard',
        label: t('monitoring.nav.dashboard'),
        icon: <HomeIcon />,
        href: '/',
        active: location.pathname === '/',
      },
      {
        id: 'infrastructure',
        label: t('monitoring.nav.infrastructure'),
        icon: <DatabaseIcon />,
        href: '/infrastructure',
        active: location.pathname.startsWith('/infrastructure'),
      },
      {
        id: 'tenants',
        label: t('monitoring.nav.tenants'),
        icon: <BuildingIcon />,
        href: '/tenants',
        active: location.pathname.startsWith('/tenants'),
      },
      {
        id: 'alerts',
        label: t('monitoring.nav.alerts'),
        icon: <AlertTriangleIcon />,
        href: '/alerts',
        active: location.pathname.startsWith('/alerts'),
      },
    ],
    [location.pathname, t]
  );

  return (
    <DSAppLayout
      sidebar={<Sidebar />}
      header={<Header title={title} />}
      bottomNavItems={bottomNavItems}
      mobileBreakpoint={768}
      data-testid="monitoring-global-layout"
    >
      <Outlet />
    </DSAppLayout>
  );
}
