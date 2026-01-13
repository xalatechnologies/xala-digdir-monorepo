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
import { ListingsPage } from './pages/ListingsPage';
import { ListingDetailPage } from './pages/ListingDetailPage';

// Demo search data
const demoSearchResults: SearchResultGroup[] = [
  {
    id: 'actions',
    label: 'Hurtighandlinger',
    items: [
      { id: 'new-booking', label: 'Ny booking', description: 'Opprett en ny booking', icon: <CalendarIcon size={18} />, shortcut: '⌘N' },
      { id: 'settings', label: 'Innstillinger', description: 'Åpne innstillinger', icon: <SettingsIcon size={18} />, shortcut: '⌘,' },
    ]
  },
  {
    id: 'locations',
    label: 'Steder',
    items: [
      { id: 'oslo', label: 'Oslo', description: 'Hovedkontor', icon: <MapPinIcon size={18} />, meta: '12 bookinger' },
      { id: 'bergen', label: 'Bergen', description: 'Vestlandskontor', icon: <MapPinIcon size={18} />, meta: '8 bookinger' },
      { id: 'trondheim', label: 'Trondheim', description: 'Midtbykontor', icon: <MapPinIcon size={18} />, meta: '5 bookinger' },
    ]
  },
  {
    id: 'users',
    label: 'Brukere',
    items: [
      { id: 'user-1', label: 'Ola Nordmann', description: 'ola@example.com', icon: <UserIcon size={18} /> },
      { id: 'user-2', label: 'Kari Hansen', description: 'kari@example.com', icon: <UserIcon size={18} /> },
    ]
  }
];

export function App() {
  const [theme] = React.useState<ThemeId>(DEFAULT_THEME);
  const [colorScheme, setColorScheme] = React.useState<'light' | 'dark'>('light');
  const [language, setLanguage] = React.useState<'en' | 'no'>('no');
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [searchResults, setSearchResults] = React.useState<SearchResultGroup[]>([]);
  const [isSearching, setIsSearching] = React.useState(false);

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

  const isDarkTheme = colorScheme === 'dark';

  return (
    <DesignsystemetProvider theme={theme} colorScheme={colorScheme} size="auto">
      <style>{`
        *, *::before, *::after {
          transition: background-color 0.3s ease, border-color 0.3s ease, color 0.2s ease;
        }
      `}</style>
      <BrowserRouter>
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
                  placeholder="Søk"
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
                  language={language}
                  onSwitch={(lang) => setLanguage(lang as 'en' | 'no')}
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
            <Route path="/listing/:id" element={<ListingDetailPage />} />
          </Routes>
        </div>
      </BrowserRouter>
    </DesignsystemetProvider>
  );
}

export default App;
