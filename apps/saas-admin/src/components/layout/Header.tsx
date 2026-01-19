/**
 * SaaS Admin Header
 *
 * Header using DashboardHeader from @xala/ds.
 * Contains app-specific search logic and hooks.
 */

import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useT } from '@xala/i18n';
import {
  DashboardHeader,
  SearchIcon,
  BuildingIcon,
  ChartIcon,
  SettingsIcon,
  useTheme,
} from '@xala/ds';
import type { SearchResultItem, SearchResultGroup } from '@xala/ds';
import { useAuth } from '@xala/auth';

interface HeaderProps {
  title?: string;
}

/**
 * Get navigation search results based on query
 */
const getNavigationResults = (query: string, t: (key: string) => string): SearchResultGroup[] => {
  if (!query.trim()) return [];

  const q = query.toLowerCase();
  const navItems: SearchResultItem[] = [];

  // Dashboard
  if ('dashboard'.includes(q) || 'hjem'.includes(q) || 'oversikt'.includes(q)) {
    navItems.push({
      id: 'nav-dashboard',
      label: t('saasAdmin.nav.dashboard'),
      description: t('common.gaa_til_oversikt') || 'Gå til oversikt',
      icon: <SearchIcon size={18} />,
      href: '/',
    });
  }

  // Tenants
  if ('tenant'.includes(q) || 'leietaker'.includes(q) || 'kunde'.includes(q)) {
    navItems.push({
      id: 'nav-tenants',
      label: t('saasAdmin.nav.tenants'),
      description: t('saasAdmin.nav.tenantsDesc') || 'Administrer leietakere',
      icon: <BuildingIcon size={18} />,
      href: '/tenants',
    });
  }

  // Billing
  if ('billing'.includes(q) || 'faktura'.includes(q) || 'betaling'.includes(q)) {
    navItems.push({
      id: 'nav-billing',
      label: t('saasAdmin.nav.billing'),
      description: t('saasAdmin.nav.billingDesc') || 'Fakturering og betalinger',
      icon: <ChartIcon size={18} />,
      href: '/billing',
    });
  }

  // Settings
  if ('innstilling'.includes(q) || 'setting'.includes(q)) {
    navItems.push({
      id: 'nav-settings',
      label: t('saasAdmin.nav.settings'),
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
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResultGroup[]>([]);

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    setSearchResults(getNavigationResults(value, t));
  }, [t]);

  const handleResultSelect = useCallback((result: SearchResultItem) => {
    if (result.href) {
      navigate(result.href);
      setSearchQuery('');
      setSearchResults([]);
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
      user={user ? { name: user.name || '', email: user.email || '' } : null}
      searchPlaceholder={t('common.sok') || 'Søk'}
      searchValue={searchQuery}
      searchResults={searchResults}
      onSearchChange={handleSearchChange}
      onSearchResultSelect={handleResultSelect}
      noSearchResultsText={t('common.ingen_resultater_funnet') || 'Ingen resultater funnet'}
      showThemeToggle
      isDark={isDark}
      onThemeToggle={toggleTheme}
      onLogout={logout}
      onSettingsClick={() => navigate('/settings')}
      onProfileClick={() => navigate('/settings')}
      data-testid="saas-admin-header"
    />
  );
}
