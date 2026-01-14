import React from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation, Outlet, useOutletContext } from 'react-router-dom';
import {
  AppHeader,
  HeaderLogo,
  HeaderSearch,
  HeaderActions,
  HeaderThemeToggle,
  HeaderLoginButton,
  NotificationBell,
  MobileNav,
  MobileNavToggle,
  CalendarIcon,
  UserIcon,
  SettingsIcon,
  MapPinIcon,
  DialogProvider,
  HomeIcon,
} from '@xala/ds';
import type { SearchResultItem, SearchResultGroup, MobileNavItem } from '@xala/ds';
import { DesignsystemetProvider } from '@xala/ds';
import { DEFAULT_THEME, type ThemeId } from '@xala/ds-themes';
import { I18nProvider, useT } from '@xala/i18n';
import { useNotificationUnreadCount } from '@digilist/client-sdk';
import { RealtimeProvider } from './providers';
import { RealtimeToast } from './components';
import { useAuth } from './hooks/useAuth';

// Lazy load route components for better performance
const ListingsPage = React.lazy(() => import('./pages/ListingsPage').then(m => ({ default: m.ListingsPage })));
const ListingDetailPage = React.lazy(() => import('./pages/ListingDetailPage').then(m => ({ default: m.ListingDetailPage })));
const LoginPage = React.lazy(() => import('./pages/login').then(m => ({ default: m.LoginPage })));

// Theme context type
type ColorScheme = 'auto' | 'light' | 'dark';
interface ThemeContextType {
  colorScheme: ColorScheme;
  setColorScheme: (scheme: ColorScheme) => void;
  effectiveScheme: 'light' | 'dark';
}

// Hook to use theme context from outlet
function useThemeContext() {
  return useOutletContext<ThemeContextType>();
}

// Layout with header for main pages
function MainLayout() {
  const t = useT();
  const navigate = useNavigate();
  const location = useLocation();
  const { colorScheme: _colorScheme, setColorScheme, effectiveScheme } = useThemeContext();

  const [searchQuery, setSearchQuery] = React.useState('');
  const [searchResults, setSearchResults] = React.useState<SearchResultGroup[]>([]);
  const [isSearching, setIsSearching] = React.useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = React.useState(false);

  // Auth state from useAuth hook (httpOnly cookie-based in real mode, in-memory in mock mode)
  const { isAuthenticated, user, login, logout: authLogout } = useAuth();

  // Get real unread notification count (only for logged in users)
  const { data: unreadData } = useNotificationUnreadCount();
  const unreadCount = unreadData?.data?.count ?? 0;

  // Toggle between light and dark (skip auto for manual toggle)
  const handleThemeToggle = () => {
    setColorScheme(effectiveScheme === 'dark' ? 'light' : 'dark');
  };

  // Demo search data with translations
  const demoSearchResults: SearchResultGroup[] = [
    {
      id: 'actions',
      label: t('listings.quickActions'),
      items: [
        { id: 'new-booking', label: t('listings.newBooking'), description: t('listings.newBooking'), icon: <CalendarIcon size={18} />, shortcut: '⌘N' },
        { id: 'settings', label: t('nav.settings'), description: t('listings.openSettings'), icon: <SettingsIcon size={18} />, shortcut: '⌘,' },
      ]
    },
    {
      id: 'locations',
      label: t('listings.locations'),
      items: [
        { id: 'oslo', label: 'Oslo', description: t('listings.headquarters'), icon: <MapPinIcon size={18} />, meta: `12 ${t('listings.bookings')}` },
        { id: 'bergen', label: 'Bergen', description: 'Vestlandskontor', icon: <MapPinIcon size={18} />, meta: `8 ${t('listings.bookings')}` },
        { id: 'trondheim', label: 'Trondheim', description: 'Midtbykontor', icon: <MapPinIcon size={18} />, meta: `5 ${t('listings.bookings')}` },
      ]
    },
    {
      id: 'users',
      label: t('listings.users'),
      items: [
        { id: 'user-1', label: 'Ola Nordmann', description: 'ola@example.com', icon: <UserIcon size={18} /> },
        { id: 'user-2', label: 'Kari Hansen', description: 'kari@example.com', icon: <UserIcon size={18} /> },
      ]
    }
  ];

  // Simulated search function
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);

    if (!value.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);

    // Simulate API delay
    setTimeout(() => {
      const query = value.toLowerCase();
      const filtered = demoSearchResults
        .map(group => ({
          ...group,
          items: group.items.filter(item =>
            item.label.toLowerCase().includes(query) ||
            item.description?.toLowerCase().includes(query)
          )
        }))
        .filter(group => group.items.length > 0);

      setSearchResults(filtered);
      setIsSearching(false);
    }, 200);
  };

  const handleSearch = (value: string) => {
    console.log('Searching for:', value);
  };

  const handleResultSelect = (result: SearchResultItem) => {
    console.log('Selected result:', result);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const handleLogout = async () => {
    await authLogout();
  };

  // Mobile navigation items
  const mobileNavItems: MobileNavItem[] = [
    {
      id: 'home',
      label: t('nav.home'),
      href: '/',
      icon: <HomeIcon size={24} />,
      active: location.pathname === '/',
      onClick: () => navigate('/'),
    },
    ...(isAuthenticated
      ? [
          {
            id: 'account',
            label: user?.name || t('nav.account'),
            icon: <UserIcon size={24} />,
            onClick: handleLogout,
          },
        ]
      : [
          {
            id: 'login',
            label: t('nav.login'),
            icon: <UserIcon size={24} />,
            onClick: handleLogin,
          },
        ]),
  ];

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--ds-color-neutral-background-default)',
      margin: 0,
      padding: 0
    }}>
      {/* CSS for mobile-specific styles */}
      <style>{`
        @media (max-width: 599px) {
          /* Show mobile menu toggle on mobile */
          .mobile-menu-toggle {
            display: flex !important;
          }

          .header-search-desktop { display: none !important; }
          .mobile-search-wrapper { display: block !important; }

          /* Mobile padding for header */
          header .ds-container {
            padding-left: var(--ds-spacing-4) !important;
            padding-right: var(--ds-spacing-4) !important;
          }

          /* Mobile padding for main content */
          .main-content-layout {
            padding-left: var(--ds-spacing-4) !important;
            padding-right: var(--ds-spacing-4) !important;
          }

          /* Ensure all child elements respect the container padding */
          .main-content-layout > main {
            padding-left: 0 !important;
            padding-right: 0 !important;
          }

          /* Hide view toggle on mobile - only show grid view */
          .listing-toolbar .ds-toggle-group {
            display: none !important;
          }
        }
        @media (min-width: 600px) {
          .mobile-search-wrapper { display: none !important; }
        }
      `}</style>

      <AppHeader
        sticky={true}
        logo={
          <HeaderLogo
            src="/logo.svg"
            title="DIGILIST"
            subtitle="ENKEL BOOKING"
            href="/"
            height="56px"
            hideTextOnMobile={true}
          />
        }
        search={
          <div className="header-search-desktop">
            <HeaderSearch
              placeholder={t('common.search')}
              value={searchQuery}
              onSearchChange={handleSearchChange}
              onSearch={handleSearch}
              results={searchResults}
              onResultSelect={handleResultSelect}
              isLoading={isSearching}
              showShortcut={true}
              enableGlobalShortcut={true}
            />
          </div>
        }
        actions={
          <HeaderActions spacing="12px">
            {/* Mobile menu toggle - only visible on mobile */}
            <div className="mobile-menu-toggle" style={{ display: 'none' }}>
              <MobileNavToggle
                isOpen={isMobileNavOpen}
                onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
                aria-label={t('nav.menu')}
              />
            </div>
            <HeaderThemeToggle
              isDark={effectiveScheme === 'dark'}
              onToggle={handleThemeToggle}
            />
            {isAuthenticated && (
              <NotificationBell
                count={unreadCount}
                onClick={() => {
                  // TODO: Open notification center modal
                }}
                aria-label={`Varsler${unreadCount > 0 ? ` (${unreadCount} uleste)` : ''}`}
                size="md"
              />
            )}
            <HeaderLoginButton
              isLoggedIn={isAuthenticated}
              userName={user?.name}
              onLogin={handleLogin}
              onLogout={handleLogout}
              color="accent"
            />
          </HeaderActions>
        }
      />

      {/* Mobile navigation drawer */}
      <MobileNav
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
        title={t('nav.menu')}
        items={mobileNavItems}
        closeOnItemClick={true}
      />

      <Outlet />
    </div>
  );
}

// Wrapper to provide theme context to MainLayout
function MainLayoutWithContext({ colorScheme, setColorScheme, effectiveScheme }: ThemeContextType) {
  return <Outlet context={{ colorScheme, setColorScheme, effectiveScheme }} />;
}

// App content with theme provider
function AppContent() {
  const [theme] = React.useState<ThemeId>(DEFAULT_THEME);
  const [colorScheme, setColorScheme] = React.useState<ColorScheme>('auto');
  const [systemScheme, setSystemScheme] = React.useState<'light' | 'dark'>('light');

  // Detect system color scheme
  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemScheme(mediaQuery.matches ? 'dark' : 'light');

    const handler = (e: MediaQueryListEvent) => {
      setSystemScheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Compute effective scheme
  const effectiveScheme = colorScheme === 'auto' ? systemScheme : colorScheme;

  return (
    <DesignsystemetProvider theme={theme} colorScheme={colorScheme} size="auto">
      <DialogProvider>
        <RealtimeProvider autoConnect={true} enableInDev={true}>
          <RealtimeToast />
          <style>{`
            *, *::before, *::after {
              transition: background-color 0.3s ease, border-color 0.3s ease, color 0.2s ease;
            }
          `}</style>
          <React.Suspense fallback={
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '100vh',
              backgroundColor: 'var(--ds-color-neutral-background-default)'
            }}>
              <div>Loading...</div>
            </div>
          }>
            <Routes>
              {/* Login page - no header */}
              <Route path="/login" element={<LoginPage />} />

              {/* Main pages with header - wrapped to provide theme context */}
              <Route element={<MainLayoutWithContext colorScheme={colorScheme} setColorScheme={setColorScheme} effectiveScheme={effectiveScheme} />}>
                <Route element={<MainLayout />}>
                  <Route path="/" element={<ListingsPage />} />
                  <Route path="/listing/:id" element={<ListingDetailPage />} />
                </Route>
              </Route>
            </Routes>
          </React.Suspense>
        </RealtimeProvider>
      </DialogProvider>
    </DesignsystemetProvider>
  );
}

export function App() {
  return (
    <I18nProvider>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <AppContent />
      </BrowserRouter>
    </I18nProvider>
  );
}

export default App;
