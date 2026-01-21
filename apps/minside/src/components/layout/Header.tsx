/**
 * Header
 *
 * MinSide header using DashboardHeader from @xalatechnologies/platform/ui.
 * Contains app-specific search logic and hooks.
 */

import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useT } from '@xalatechnologies/platform/i18n';
import {
  DashboardHeader,
  SearchIcon,
  CalendarIcon,
  PeopleIcon,
  SettingsIcon,
} from '@xalatechnologies/platform/ui';
import type { SearchResultItem, SearchResultGroup } from '@xalatechnologies/platform/ui';
import { useNotificationUnreadCount } from '@digilist/client-sdk';
import { useAuth } from '@xalatechnologies/platform/auth';
import { useTheme } from '@xalatechnologies/platform/ui';
import { useNotificationCenter } from '@xalatechnologies/platform/runtime';
import { AccountSwitcher } from '../AccountSwitcher';

interface HeaderProps {
  title?: string;
}

/**
 * Get navigation search results based on query
 * TODO: Replace with SDK global search when available
 */
const getNavigationResults = (query: string, t: (key: string) => string): SearchResultGroup[] => {
  if (!query.trim()) return [];

  const q = query.toLowerCase();
  const navItems: SearchResultItem[] = [];

  // Dashboard
  if ('dashboard'.includes(q) || 'hjem'.includes(q) || 'oversikt'.includes(q)) {
    navItems.push({
      id: 'nav-dashboard',
      label: 'Dashboard',
      description: t('common.gaa_til_oversikt') || 'Gå til oversikt',
      icon: <SearchIcon size={18} />,
      href: '/',
    });
  }

  // Bookings
  if ('booking'.includes(q) || 'bestilling'.includes(q)) {
    navItems.push({
      id: 'nav-bookings',
      label: 'Bookinger',
      description: t('common.se_alle_dine_bookinger') || 'Se alle dine bookinger',
      icon: <CalendarIcon size={18} />,
      href: '/bookings',
    });
  }

  // Calendar
  if ('kalender'.includes(q) || 'calendar'.includes(q)) {
    navItems.push({
      id: 'nav-calendar',
      label: 'Kalender',
      description: t('common.se_bookinger_i_kalendervisning') || 'Se bookinger i kalendervisning',
      icon: <CalendarIcon size={18} />,
      href: '/calendar',
    });
  }

  // Messages
  if ('melding'.includes(q) || 'message'.includes(q) || 'samtale'.includes(q)) {
    navItems.push({
      id: 'nav-messages',
      label: 'Meldinger',
      description: t('common.se_samtaler_og_meldinger') || 'Se samtaler og meldinger',
      icon: <PeopleIcon size={18} />,
      href: '/messages',
    });
  }

  // Settings
  if ('innstilling'.includes(q) || 'setting'.includes(q)) {
    navItems.push({
      id: 'nav-settings',
      label: 'Innstillinger',
      description: 'Systemkonfigurasjon',
      icon: <SettingsIcon size={18} />,
      href: '/settings',
    });
  }

  if (navItems.length === 0) return [];

  return [{ id: 'navigation', label: 'Sider', items: navItems }];
};

export function Header({ title: _title }: HeaderProps) {
  const { user, logout } = useAuth();
  const t = useT();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const { openNotificationCenter } = useNotificationCenter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResultGroup[]>([]);

  // Get real unread notification count
  const { data: unreadData } = useNotificationUnreadCount();
  const unreadCount = unreadData?.data?.count ?? 0;

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    setSearchResults(getNavigationResults(value, t));
  }, [t]);

  const handleResultSelect = useCallback((result: SearchResultItem) => {
    if (result.href) {
      navigate(result.href);
    }
  }, [navigate]);

  return (
    <DashboardHeader
      logo={
        <img
          src="/logo.svg"
          alt="Digilist"
          style={{ height: '32px', width: 'auto' }}
        />
      }
      leftSlot={<AccountSwitcher />}
      user={user ? { name: user.name || '', email: user.email || '' } : null}
      searchPlaceholder={t('common.sok_i_bookinger_brukere')}
      searchValue={searchQuery}
      searchResults={searchResults}
      onSearchChange={handleSearchChange}
      onSearchResultSelect={handleResultSelect}
      noSearchResultsText={t('common.ingen_resultater_funnet')}
      showThemeToggle
      isDark={isDark}
      onThemeToggle={toggleTheme}
      showNotifications
      notificationCount={unreadCount}
      onNotificationClick={openNotificationCenter}
      onLogout={logout}
      onSettingsClick={() => navigate('/settings')}
      onProfileClick={() => navigate('/profile')}
      data-testid="minside-header"
    />
  );
}
