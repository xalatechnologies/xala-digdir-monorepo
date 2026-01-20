/**
 * AppLayout Wrapper
 *
 * Thin wrapper that wires app-specific Sidebar, Header, bottom navigation,
 * search, and alerts to DS AppLayout component.
 */

import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  AppLayout as DSAppLayout,
  type BottomNavigationItem,
  Alert,
  HeaderSearch,
  SearchIcon,
  type SearchResultItem,
  type SearchResultGroup,
  HomeIcon,
  BookOpenIcon,
  CalendarIcon,
  MessageIcon,
  SettingsIcon,
} from '@xala/ds';
import { useT } from '@xala/i18n';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useAccountContext } from '@xala/runtime';

interface LocationState {
  contextRedirectMessage?: string;
  from?: { pathname: string };
  intentionalSwitch?: boolean;
}

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/bookings': 'Bookinger',
  '/reports': 'Rapporter',
  '/users': 'Brukere',
  '/settings': 'Innstillinger',
};

const MOBILE_BREAKPOINT = 768;

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
      label: 'Dashboard',
      description: t('common.gaa_til_oversikt'),
      icon: <SearchIcon size={18} />,
      href: '/',
    });
  }

  // Bookings
  if ('booking'.includes(q) || 'bestilling'.includes(q)) {
    navItems.push({
      id: 'nav-bookings',
      label: 'Bookinger',
      description: t('common.se_alle_dine_bookinger'),
      icon: <CalendarIcon size={18} />,
      href: '/bookings',
    });
  }

  // Calendar
  if ('kalender'.includes(q) || 'calendar'.includes(q)) {
    navItems.push({
      id: 'nav-calendar',
      label: 'Kalender',
      description: t('common.se_bookinger_i_kalendervisning'),
      icon: <CalendarIcon size={18} />,
      href: '/calendar',
    });
  }

  // Messages
  if ('melding'.includes(q) || 'message'.includes(q) || 'samtale'.includes(q)) {
    navItems.push({
      id: 'nav-messages',
      label: 'Meldinger',
      description: t('common.se_samtaler_og_meldinger'),
      icon: <MessageIcon size={18} />,
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

export function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const t = useT();
  const { lostOrganizationMessage, clearLostOrganizationMessage } = useAccountContext();
  const title = pageTitles[location.pathname] ?? '';
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < MOBILE_BREAKPOINT : false
  );
  const [redirectMessage, setRedirectMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResultGroup[]>([]);

  // Handle context redirect message from navigation state
  // Skip showing message if this was an intentional switch via AccountSwitcher
  useEffect(() => {
    const state = location.state as LocationState | null;
    if (state?.contextRedirectMessage && !state?.intentionalSwitch) {
      setRedirectMessage(state.contextRedirectMessage);
      // Clear the message from navigation state to prevent showing on refresh
      navigate(location.pathname, { replace: true, state: {} });
      // Auto-dismiss after 5 seconds
      const timer = setTimeout(() => {
        setRedirectMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    } else if (state?.intentionalSwitch) {
      // Clear the intentionalSwitch flag from state
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate]);

  // Handle lost organization message notification - auto-dismiss after 7 seconds
  useEffect(() => {
    if (lostOrganizationMessage) {
      const timer = setTimeout(() => {
        clearLostOrganizationMessage();
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [lostOrganizationMessage, clearLostOrganizationMessage]);

  // Track viewport size for mobile/desktop detection (DS AppLayout handles this, but we need it for topContent)
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle search
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setSearchResults(getNavigationResults(value, t));
  };

  const handleResultSelect = (result: SearchResultItem) => {
    if (result.href) {
      navigate(result.href);
      setSearchQuery('');
      setSearchResults([]);
    }
  };

  // Bottom navigation items for mobile
  const bottomNavItems: BottomNavigationItem[] = [
    {
      id: 'dashboard',
      label: t('minside.dashboard'),
      icon: <HomeIcon />,
      href: '/',
      active: location.pathname === '/',
    },
    {
      id: 'bookings',
      label: t('minside.myBookings'),
      icon: <BookOpenIcon />,
      href: '/bookings',
      active: location.pathname.startsWith('/bookings'),
    },
    {
      id: 'calendar',
      label: t('minside.myCalendar'),
      icon: <CalendarIcon />,
      href: '/calendar',
      active: location.pathname.startsWith('/calendar'),
    },
    {
      id: 'messages',
      label: t('minside.messages'),
      icon: <MessageIcon />,
      href: '/messages',
      active: location.pathname.startsWith('/messages'),
    },
    {
      id: 'settings',
      label: t('minside.settings'),
      icon: <SettingsIcon />,
      href: '/settings',
      active: location.pathname.startsWith('/settings'),
    },
  ];

  // Build top content (alerts and mobile search)
  const topContent = (
    <>
      {/* Mobile Search - Below header */}
      {isMobile && (
        <div style={{ padding: 'var(--ds-spacing-4) var(--ds-spacing-6)', borderBottom: '1px solid var(--ds-color-neutral-border-subtle)' }}>
          <HeaderSearch
            placeholder={t('common.sok_i_bookinger_brukere')}
            value={searchQuery}
            onSearchChange={handleSearchChange}
            onResultSelect={handleResultSelect}
            results={searchResults}
            showShortcut={false}
            enableGlobalShortcut={false}
            noResultsText={t('common.ingen_resultater_funnet')}
          />
        </div>
      )}

      {/* Context redirect notification */}
      {redirectMessage && (
        <div
          style={{
            padding: isMobile ? 'var(--ds-spacing-3)' : 'var(--ds-spacing-4)',
            paddingBottom: 0,
          }}
        >
          <Alert
            data-color="info"
            data-size="sm"
            role="status"
            aria-live="polite"
          >
            {redirectMessage}
          </Alert>
        </div>
      )}

      {/* Lost organization notification - shown when user's org membership was lost */}
      {lostOrganizationMessage && (
        <div
          style={{
            padding: isMobile ? 'var(--ds-spacing-3)' : 'var(--ds-spacing-4)',
            paddingBottom: 0,
          }}
        >
          <Alert
            data-color="warning"
            data-size="sm"
            role="alert"
            aria-live="assertive"
          >
            {lostOrganizationMessage}
          </Alert>
        </div>
      )}
    </>
  );

  return (
    <DSAppLayout
      sidebar={<Sidebar />}
      header={<Header title={title} />}
      bottomNavItems={bottomNavItems}
      topContent={topContent}
      mobileBreakpoint={MOBILE_BREAKPOINT}
      data-testid="monitoring-layout"
    />
  );
}
