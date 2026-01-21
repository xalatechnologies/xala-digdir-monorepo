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
  CalendarIcon,
  BookOpenIcon,
  MessageIcon,
  SettingsIcon,
} from '@xalatechnologies/platform/ui';
import { useT } from '@xalatechnologies/platform/i18n';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export function AppLayout() {
  const t = useT();
  const location = useLocation();
  
  const pageTitles: Record<string, string> = {
    '/': t('nav.dashboard'),
    '/bookings': t('nav.bookings'),
    '/reports': t('nav.reports'),
    '/users': t('nav.users'),
    '/settings': t('nav.settings'),
  };
  
  const title = pageTitles[location.pathname] ?? '';

  // Bottom navigation items for mobile
  const bottomNavItems: BottomNavigationItem[] = [
    {
      id: 'dashboard',
      label: t('nav.dashboard'),
      icon: <HomeIcon />,
      href: '/',
      active: location.pathname === '/',
    },
    {
      id: 'rental-objects',
      label: t('nav.rentalObjects'),
      icon: <BuildingIcon />,
      href: '/rental-objects',
      active: location.pathname.startsWith('/rental-objects'),
    },
    {
      id: 'calendar',
      label: t('nav.calendar'),
      icon: <CalendarIcon />,
      href: '/calendar',
      active: location.pathname.startsWith('/calendar'),
    },
    {
      id: 'bookings',
      label: t('nav.bookings'),
      icon: <BookOpenIcon />,
      href: '/bookings',
      active: location.pathname.startsWith('/bookings'),
    },
    {
      id: 'messages',
      label: t('nav.messages'),
      icon: <MessageIcon />,
      href: '/messages',
      active: location.pathname.startsWith('/messages'),
    },
    {
      id: 'settings',
      label: t('nav.settings'),
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
      data-testid="backoffice-layout"
    />
  );
}
