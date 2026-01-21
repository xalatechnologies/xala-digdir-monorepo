/**
 * Global Control Plane Header
 *
 * Header using DashboardHeader from @xalatechnologies/platform/ui.
 * PLATFORM-ONLY: No @digilist/* imports allowed.
 */

import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useT } from '@xala/i18n';
import {
  DashboardHeader,
  HomeIcon,
  DatabaseIcon,
  BuildingIcon,
  AlertTriangleIcon,
  useTheme,
} from '@xalatechnologies/platform/ui';
import type { SearchResultItem, SearchResultGroup } from '@xalatechnologies/platform/ui';

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
      label: t('monitoring.nav.dashboard'),
      description: t('monitoring.nav.dashboardDesc'),
      icon: <HomeIcon size={18} />,
      href: '/',
    });
  }

  // Infrastructure
  if ('infrastructure'.includes(q) || 'database'.includes(q) || 'redis'.includes(q) || 'nettverk'.includes(q)) {
    navItems.push({
      id: 'nav-infrastructure',
      label: t('monitoring.nav.infrastructure'),
      description: t('monitoring.nav.infrastructureDesc'),
      icon: <DatabaseIcon size={18} />,
      href: '/infrastructure',
    });
  }

  // Tenants
  if ('tenant'.includes(q) || 'leietaker'.includes(q) || 'kommune'.includes(q)) {
    navItems.push({
      id: 'nav-tenants',
      label: t('monitoring.nav.tenants'),
      description: t('monitoring.nav.tenantsDesc'),
      icon: <BuildingIcon size={18} />,
      href: '/tenants',
    });
  }

  // Alerts
  if ('alert'.includes(q) || 'varsel'.includes(q) || 'alarm'.includes(q)) {
    navItems.push({
      id: 'nav-alerts',
      label: t('monitoring.nav.alerts'),
      description: t('monitoring.nav.alertsDesc'),
      icon: <AlertTriangleIcon size={18} />,
      href: '/alerts',
    });
  }

  if (navItems.length === 0) return [];

  return [{ id: 'navigation', label: t('common.pages'), items: navItems }];
};

export function Header({ title: _title }: HeaderProps) {
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
        <span style={{
          fontSize: 'var(--ds-font-size-md)',
          fontWeight: 'var(--ds-font-weight-bold)',
          color: 'var(--ds-color-accent-text-default)',
        }}>
          Xala
        </span>
      }
      user={null}
      searchPlaceholder={t('common.sok')}
      searchValue={searchQuery}
      searchResults={searchResults}
      onSearchChange={handleSearchChange}
      onSearchResultSelect={handleResultSelect}
      noSearchResultsText={t('common.ingen_resultater_funnet')}
      showThemeToggle
      isDark={isDark}
      onThemeToggle={toggleTheme}
      data-testid="monitoring-global-header"
    />
  );
}
