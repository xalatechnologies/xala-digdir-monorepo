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
import { useUnreadCount } from '@digilist/client-sdk';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../providers/ThemeProvider';

interface HeaderProps {
  title?: string;
}

// Mock search results for demonstration
const getMockSearchResults = (query: string): SearchResultGroup[] => {
  if (!query.trim()) return [];

  const q = query.toLowerCase();

  const results: SearchResultGroup[] = [];

  // Bookings
  const bookingItems: SearchResultItem[] = [];
  if ('booking'.includes(q) || 'ventende'.includes(q)) {
    bookingItems.push({
      id: 'booking-pending',
      label: 'Ventende bookinger',
      description: 'Se alle bookinger som venter på godkjenning',
      icon: <CalendarIcon size={18} />,
      href: '/bookings?status=pending',
      meta: '12',
    });
  }
  if ('booking'.includes(q) || 'godkjent'.includes(q) || 'bekreftet'.includes(q)) {
    bookingItems.push({
      id: 'booking-confirmed',
      label: 'Bekreftede bookinger',
      description: 'Se alle godkjente bookinger',
      icon: <CalendarIcon size={18} />,
      href: '/bookings?status=confirmed',
    });
  }
  if (bookingItems.length > 0) {
    results.push({ id: 'bookings', label: 'Bookinger', items: bookingItems });
  }

  // Users
  const userItems: SearchResultItem[] = [];
  if ('bruker'.includes(q) || 'admin'.includes(q)) {
    userItems.push({
      id: 'users-all',
      label: 'Alle brukere',
      description: 'Administrer brukere og tilganger',
      icon: <PeopleIcon size={18} />,
      href: '/users',
    });
  }
  if (userItems.length > 0) {
    results.push({ id: 'users', label: 'Brukere', items: userItems });
  }

  // Navigation shortcuts
  const navItems: SearchResultItem[] = [];
  if ('dashboard'.includes(q) || 'hjem'.includes(q) || 'oversikt'.includes(q)) {
    navItems.push({
      id: 'nav-dashboard',
      label: 'Dashboard',
      description: 'Gå til oversikt',
      icon: <SearchIcon size={18} />,
      href: '/',
      shortcut: '⌘D',
    });
  }
  if ('innstilling'.includes(q) || 'setting'.includes(q)) {
    navItems.push({
      id: 'nav-settings',
      label: 'Innstillinger',
      description: 'Systemkonfigurasjon',
      icon: <SettingsIcon size={18} />,
      href: '/settings',
      shortcut: '⌘,',
    });
  }
  if (navItems.length > 0) {
    results.push({ id: 'navigation', label: 'Navigasjon', items: navItems });
  }

  return results;
};

export function Header({ title: _title }: HeaderProps) {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResultGroup[]>([]);
  
  // Get real unread notification count
  const { data: unreadData } = useUnreadCount();
  const unreadCount = unreadData?.data?.count ?? 0;

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setSearchResults(getMockSearchResults(value));
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
          display: 'flex',
          alignItems: 'center',
          height: '72px',
          padding: '0 var(--ds-spacing-6)',
        }}
      >
        {/* Left spacer for balance */}
        <div style={{ flex: '1 1 0', minWidth: 0 }} />

        {/* Search - centered */}
        <div
          style={{
            flex: '0 1 600px',
            maxWidth: '600px',
            width: '100%',
          }}
        >
          <HeaderSearch
            placeholder="Søk i bookinger, brukere, innstillinger..."
            value={searchQuery}
            onSearchChange={handleSearchChange}
            onResultSelect={handleResultSelect}
            results={searchResults}
            showShortcut
            enableGlobalShortcut
            noResultsText="Ingen resultater funnet"
          />
        </div>

        {/* Right side - Actions */}
        <div style={{ flex: '1 1 0', minWidth: 0, display: 'flex', justifyContent: 'flex-end' }}>
          <HeaderActions spacing="var(--ds-spacing-3)">
            <HeaderThemeToggle
              isDark={isDark}
              onToggle={toggleTheme}
            />
            <NotificationBell
              count={unreadCount}
              onClick={() => navigate('/messages')}
              aria-label={`Varsler${unreadCount > 0 ? ` (${unreadCount} uleste)` : ''}`}
              size="md"
            />
            <HeaderIconButton
              icon={<SettingsIcon size={22} />}
              size="md"
              aria-label="Innstillinger"
              title="Innstillinger"
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
                aria-label="Logg ut"
                style={{ whiteSpace: 'nowrap' }}
              >
                <LogOutIcon size={20} />
                Logg ut
              </Button>
            )}
          </HeaderActions>
        </div>
      </div>
    </header>
  );
}
