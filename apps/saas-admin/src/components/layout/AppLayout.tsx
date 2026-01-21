/**
 * AppLayout Wrapper
 *
 * Thin wrapper that wires app-specific Sidebar, Header, and bottom navigation
 * to DS AppLayout component.
 */

import { useLocation } from 'react-router-dom';
import {
  AppLayout as DSAppLayout,
  type BottomNavigationItem,
  HomeIcon,
  BuildingIcon,
  ChartIcon,
  UsersIcon,
  SettingsIcon,
} from '@xalatechnologies/platform/ui';
import { useT } from '@xalatechnologies/platform/i18n';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export function AppLayout() {
  const location = useLocation();
  const t = useT();

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
    <DSAppLayout
      sidebar={<Sidebar />}
      header={<Header title={title} />}
      bottomNavItems={bottomNavItems}
      mobileBreakpoint={768}
      data-testid="saas-admin-layout"
    />
  );
}
