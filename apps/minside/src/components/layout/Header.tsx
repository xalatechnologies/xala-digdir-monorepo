import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HeaderSearch,
  HeaderActions,
  HeaderIconButton,
  HeaderThemeToggle,
  Button,
  NotificationBell,
  SettingsIcon,
  LogOutIcon,
  SearchIcon,
  CalendarIcon,
  PeopleIcon,
} from '@xala/ds';
import type { SearchResultItem, SearchResultGroup } from '@xala/ds';
import { useNotificationUnreadCount } from '@digilist/client-sdk';
import { useT } from '@xala/i18n';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../providers/ThemeProvider';
import { useNotificationCenter } from '../../App';
import { AccountSwitcher } from '../AccountSwitcher';

interface HeaderProps {
  title?: string;
}

/**
 * Get navigation search results based on query
 * TODO: Replace with SDK global search when available
 */
const getNavigationResults = (query: string, t: ReturnType<typeof useT>): SearchResultGroup[] => {
  if (!query.trim()) return [];

  const q = query.toLowerCase();
  const navItems: SearchResultItem[] = [];

  // Dashboard
  if ('dashboard'.includes(q) || 'hjem'.includes(q) || 'oversikt'.includes(q)) {
    navItems.push({
      id: 'nav-dashboard',
      label: t('components.header.dashboard'),
      description: t('components.header.goToOverview'),
      icon: <SearchIcon size={18} />,
      href: '/',
    });
  }

  // Bookings
  if ('booking'.includes(q) || 'bestilling'.includes(q)) {
    navItems.push({
      id: 'nav-bookings',
      label: t('components.header.bookings'),
      description: t('components.header.seeAllBookings'),
      icon: <CalendarIcon size={18} />,
      href: '/bookings',
    });
  }

  // Calendar
  if ('kalender'.includes(q) || 'calendar'.includes(q)) {
    navItems.push({
      id: 'nav-calendar',
      label: t('components.header.calendar'),
      description: t('components.header.calendarView'),
      icon: <CalendarIcon size={18} />,
      href: '/calendar',
    });
  }

  // Messages
  if ('melding'.includes(q) || 'message'.includes(q) || 'samtale'.includes(q)) {
    navItems.push({
      id: 'nav-messages',
      label: t('components.header.messages'),
      description: t('components.header.conversationsAndMessages'),
      icon: <PeopleIcon size={18} />,
      href: '/messages',
    });
  }

  // Settings
  if ('innstilling'.includes(q) || 'setting'.includes(q)) {
    navItems.push({
      id: 'nav-settings',
      label: t('components.header.settings'),
      description: t('nav.settings'),
      icon: <SettingsIcon size={18} />,
      href: '/settings',
    });
  }

  if (navItems.length === 0) return [];

  return [{ id: 'navigation', label: t('components.header.pages'), items: navItems }];
};

export function Header({ title: _title }: HeaderProps) {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const { openNotificationCenter } = useNotificationCenter();
  const t = useT();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResultGroup[]>([]);

  // Get real unread notification count
  const { data: unreadData } = useNotificationUnreadCount();
  const unreadCount = unreadData?.data?.count ?? 0;

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setSearchResults(getNavigationResults(value, t));
  };

  const handleResultSelect = (result: SearchResultItem) => {
    if (result.href) {
      navigate(result.href);
    }
  };

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: 'var(--ds-color-neutral-surface-default)',
        borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
        boxShadow: 'var(--ds-shadow-xs)',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center',
          height: '72px',
          padding: '0 var(--ds-spacing-6)',
          gap: 'var(--ds-spacing-4)',
        }}
      >
        {/* Left zone - Account Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
          <AccountSwitcher />
        </div>

        {/* Center zone - Search */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            width: '650px',
            maxWidth: '700px',
          }}
        >
          <HeaderSearch
            placeholder={t('components.header.searchPlaceholder')}
            value={searchQuery}
            onSearchChange={handleSearchChange}
            onResultSelect={handleResultSelect}
            results={searchResults}
            showShortcut
            enableGlobalShortcut
            noResultsText={t('components.header.noResults')}
          />
        </div>


        {/* Right zone - Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          <HeaderActions spacing="var(--ds-spacing-2)">
            <HeaderThemeToggle
              isDark={isDark}
              onToggle={toggleTheme}
            />
            <NotificationBell
              count={unreadCount}
              onClick={openNotificationCenter}
              aria-label={unreadCount > 0 ? t('components.header.notificationsWithCount', { count: unreadCount }) : t('components.header.notifications')}
            />
            <HeaderIconButton
              icon={<SettingsIcon size={22} />}
              size="md"
              aria-label={t('components.header.settings')}
              title={t('components.header.settings')}
              onClick={() => navigate('/settings')}
            />
            <div
              style={{
                width: '1px',
                height: '28px',
                backgroundColor: 'var(--ds-color-neutral-border-subtle)',
                margin: '0 var(--ds-spacing-2)',
              }}
            />
            {user && (
              <Button
                type="button"
                variant="tertiary"
                data-size="md"
                onClick={logout}
                aria-label={t('components.header.logout')}
                style={{ whiteSpace: 'nowrap' }}
              >
                <LogOutIcon size={20} />
                {t('components.header.logout')}
              </Button>
            )}
          </HeaderActions>
        </div>
      </div>
    </header>
  );
}
