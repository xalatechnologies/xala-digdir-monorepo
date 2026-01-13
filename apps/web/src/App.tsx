import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import {
  AppHeader,
  HeaderLogo,
  HeaderSearch,
  HeaderActions,
  HeaderThemeToggle,
  HeaderLanguageSwitch,
  HeaderLoginButton,
  CalendarIcon,
  UserIcon,
  SettingsIcon,
  MapPinIcon,
} from '@xala/ds';
import type { SearchResultItem, SearchResultGroup } from '@xala/ds';
import { DesignsystemetProvider } from '@xala/ds';
import { DEFAULT_THEME, type ThemeId } from '@xala/ds-themes';
import { I18nProvider, useT, useLocale, type SupportedLocale } from '@xala/i18n';
import { ListingsPage } from './pages/ListingsPage';
import { ListingDetailPageV2 } from './pages/ListingDetailPageV2';

function AppContent() {
  const t = useT();
  const { locale, setLocale } = useLocale();

  const [theme] = React.useState<ThemeId>(DEFAULT_THEME);
  const [colorScheme, setColorScheme] = React.useState<'light' | 'dark'>('light');
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [searchResults, setSearchResults] = React.useState<SearchResultGroup[]>([]);
  const [isSearching, setIsSearching] = React.useState(false);

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

  const handleThemeToggle = () => {
    setColorScheme(colorScheme === 'light' ? 'dark' : 'light');
  };

  const handleLanguageSwitch = (lang: string) => {
    setLocale(lang as SupportedLocale);
  };

  const isDarkTheme = colorScheme === 'dark';

  return (
    <DesignsystemetProvider theme={theme} colorScheme={colorScheme} size="auto">
      <style>{`
        *, *::before, *::after {
          transition: background-color 0.3s ease, border-color 0.3s ease, color 0.2s ease;
        }
      `}</style>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <div style={{
          minHeight: '100vh',
          backgroundColor: 'var(--ds-color-neutral-background-default)',
          margin: 0,
          padding: 0
        }}>
          {/* CSS for mobile-specific styles */}
          <style>{`
            @media (max-width: 599px) {
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
                <HeaderLanguageSwitch
                  language={locale === 'nb' ? 'no' : 'en'}
                  onSwitch={handleLanguageSwitch}
                />
                <HeaderThemeToggle
                  onToggle={handleThemeToggle}
                  isDark={isDarkTheme}
                />
                <HeaderLoginButton
                  isLoggedIn={isLoggedIn}
                  userName={isLoggedIn ? 'Ola Nordmann' : undefined}
                  onLogin={() => setIsLoggedIn(true)}
                  onLogout={() => setIsLoggedIn(false)}
                  color="accent"
                />
              </HeaderActions>
            }
          />

          <Routes>
            <Route path="/" element={<ListingsPage />} />
            <Route path="/listing/:id" element={<ListingDetailPageV2 />} />
          </Routes>
        </div>
      </BrowserRouter>
    </DesignsystemetProvider>
  );
}

export function App() {
  return (
    <I18nProvider>
      <AppContent />
    </I18nProvider>
  );
}

export default App;
