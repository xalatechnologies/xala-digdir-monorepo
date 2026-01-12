import React from 'react';
import {
  AppHeader,
  HeaderLogo,
  HeaderSearch,
  HeaderActions,
  HeaderIconButton,
  HeaderThemeToggle,
  HeaderLanguageSwitch,
  HeaderLoginButton,
  ContentLayout,
  Heading,
  Paragraph,
  ShoppingCartIcon,
  CalendarIcon,
  UserIcon,
  SettingsIcon,
  MapPinIcon
} from '@xala/ds';
import type { SearchResultItem, SearchResultGroup } from '@xala/ds';
import { DesignsystemetProvider } from '@xala/ds';
import { DEFAULT_THEME, type ThemeId } from '@xala/ds-themes';

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
    <DesignsystemetProvider theme={theme} colorScheme={colorScheme}>
      <div style={{
        minHeight: '100vh',
        backgroundColor: 'var(--ds-color-neutral-background-default)',
        margin: 0,
        padding: 0
      }}>
        <AppHeader
          sticky={true}
          logo={
            <HeaderLogo
              src="/logo.svg"
              title="DIGILIST"
              subtitle="ENKEL BOOKING"
              href="/"
              height="56px"
            />
          }
          search={
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
              <HeaderIconButton
                icon={<ShoppingCartIcon size={22} />}
                badge={2}
                badgeColor="accent"
                aria-label="Handlekurv"
                title="Handlekurv (2 varer)"
                onClick={() => console.log('Cart clicked')}
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
        <ContentLayout>
          <main id="main" style={{ padding: 'var(--ds-spacing-12)', textAlign: 'center' }}>
            <Heading
              level={1}
              data-size="xl"
              style={{
                marginBottom: 'var(--ds-spacing-4)',
                color: 'var(--ds-color-neutral-text-default)'
              }}
            >
              Header Demo
            </Heading>
            <Paragraph
              data-size="lg"
              style={{ color: 'var(--ds-color-neutral-text-subtle)' }}
            >
              DIGILIST-style sticky header with theme switching
            </Paragraph>
            <Paragraph
              style={{
                marginTop: 'var(--ds-spacing-6)',
                color: 'var(--ds-color-neutral-text-subtle)'
              }}
            >
              Current theme: <strong>{isDarkTheme ? 'Dark' : 'Light'}</strong>
            </Paragraph>
            {/* Add some content to test sticky behavior */}
            <div style={{ marginTop: 'var(--ds-spacing-12)' }}>
              {Array.from({ length: 20 }).map((_, i) => (
                <Paragraph
                  key={i}
                  style={{
                    padding: 'var(--ds-spacing-6)',
                    color: 'var(--ds-color-neutral-text-default)'
                  }}
                >
                  Scroll down to test the sticky header behavior. Content block {i + 1}.
                </Paragraph>
              ))}
            </div>
          </main>
        </ContentLayout>
      </div>
    </DesignsystemetProvider>
  );
}

export default App;
