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
  Button,
  Checkbox,
  ShoppingCartIcon,
  CalendarIcon,
  UserIcon,
  SettingsIcon,
  MapPinIcon,
  FilterIcon,
  Drawer,
  DrawerSection,
  DrawerItem
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

// Filter options
const venueTypes = [
  { id: 'all', label: 'Alle', count: 7 },
  { id: 'idrettshall', label: 'Idrettshall', count: 3 },
  { id: 'moterom', label: 'Møterom', count: 1 },
  { id: 'svommebasseng', label: 'Svømmebasseng', count: 1 },
  { id: 'utendors', label: 'Utendørs', count: 1 },
  { id: 'kulturhus', label: 'Kulturhus', count: 1 },
];

export function App() {
  const [theme] = React.useState<ThemeId>(DEFAULT_THEME);
  const [colorScheme, setColorScheme] = React.useState<'light' | 'dark'>('light');
  const [language, setLanguage] = React.useState<'en' | 'no'>('no');
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [searchResults, setSearchResults] = React.useState<SearchResultGroup[]>([]);
  const [isSearching, setIsSearching] = React.useState(false);

  // Filter drawer state
  const [isFilterOpen, setIsFilterOpen] = React.useState(false);
  const [selectedTypes, setSelectedTypes] = React.useState<string[]>(['all']);

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

  const handleTypeToggle = (typeId: string) => {
    if (typeId === 'all') {
      setSelectedTypes(['all']);
    } else {
      const newTypes = selectedTypes.filter(t => t !== 'all');
      if (newTypes.includes(typeId)) {
        const filtered = newTypes.filter(t => t !== typeId);
        setSelectedTypes(filtered.length > 0 ? filtered : ['all']);
      } else {
        setSelectedTypes([...newTypes, typeId]);
      }
    }
  };

  const isDarkTheme = colorScheme === 'dark';
  const activeFilterCount = selectedTypes.includes('all') ? 0 : selectedTypes.length;

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

        {/* Left Filter Drawer */}
        <Drawer
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
          title="Filtre"
          icon={<FilterIcon size={20} />}
          position="left"
          size="sm"
          footer={
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{
                fontSize: 'var(--ds-font-size-sm)',
                color: 'var(--ds-color-neutral-text-subtle)',
                textAlign: 'center'
              }}>
                Viser 6 lokaler
              </div>
              <Button
                variant="primary"
                style={{ width: '100%' }}
                onClick={() => setIsFilterOpen(false)}
              >
                Vis resultater
              </Button>
            </div>
          }
        >
          <DrawerSection title="Type anlegg" collapsible>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {venueTypes.map((type) => (
                <DrawerItem
                  key={type.id}
                  left={
                    <Checkbox
                      checked={selectedTypes.includes(type.id)}
                      onChange={() => handleTypeToggle(type.id)}
                      aria-label={type.label}
                    />
                  }
                  right={<span style={{ fontSize: '13px' }}>({type.count})</span>}
                  onClick={() => handleTypeToggle(type.id)}
                  selected={selectedTypes.includes(type.id)}
                >
                  <span style={{
                    fontSize: 'var(--ds-font-size-sm)',
                    color: 'var(--ds-color-neutral-text-default)'
                  }}>
                    {type.label}
                  </span>
                </DrawerItem>
              ))}
            </div>
          </DrawerSection>

          <DrawerSection title="Område" collapsible defaultCollapsed>
            <div style={{
              padding: '8px 0',
              fontSize: 'var(--ds-font-size-sm)',
              color: 'var(--ds-color-neutral-text-subtle)'
            }}>
              Velg område for å filtrere lokaler
            </div>
          </DrawerSection>

          <DrawerSection title="Kapasitet" collapsible defaultCollapsed>
            <div style={{
              padding: '8px 0',
              fontSize: 'var(--ds-font-size-sm)',
              color: 'var(--ds-color-neutral-text-subtle)'
            }}>
              Filtrer etter antall personer
            </div>
          </DrawerSection>

          <DrawerSection title="Fasiliteter" collapsible defaultCollapsed>
            <div style={{
              padding: '8px 0',
              fontSize: 'var(--ds-font-size-sm)',
              color: 'var(--ds-color-neutral-text-subtle)'
            }}>
              Velg ønskede fasiliteter
            </div>
          </DrawerSection>
        </Drawer>

        <ContentLayout>
          <main id="main" style={{ padding: 'var(--ds-spacing-6)' }}>
            {/* Filter toggle button */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              marginBottom: 'var(--ds-spacing-6)'
            }}>
              <Button
                variant="secondary"
                onClick={() => setIsFilterOpen(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <FilterIcon size={18} />
                Filtre
                {activeFilterCount > 0 && (
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: '20px',
                    height: '20px',
                    padding: '0 6px',
                    fontSize: '11px',
                    fontWeight: 600,
                    backgroundColor: 'var(--ds-color-accent-base-default)',
                    color: 'var(--ds-color-accent-contrast-default)',
                    borderRadius: 'var(--ds-border-radius-full)',
                  }}>
                    {activeFilterCount}
                  </span>
                )}
              </Button>
              <span style={{
                fontSize: 'var(--ds-font-size-sm)',
                color: 'var(--ds-color-neutral-text-subtle)'
              }}>
                Viser 6 lokaler
              </span>
            </div>

            {/* Page content */}
            <Heading
              level={1}
              data-size="lg"
              style={{
                marginBottom: 'var(--ds-spacing-4)',
                color: 'var(--ds-color-neutral-text-default)'
              }}
            >
              Finn lokaler
            </Heading>
            <Paragraph
              data-size="md"
              style={{
                color: 'var(--ds-color-neutral-text-subtle)',
                marginBottom: 'var(--ds-spacing-8)'
              }}
            >
              Bla gjennom tilgjengelige lokaler og book direkte
            </Paragraph>

            {/* Venue cards placeholder */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '24px'
            }}>
              {['Demo Bibliotek', 'Demo Fotballbane', 'Demo Idrettshall', 'Demo Kulturhus', 'Demo Møtesenter', 'Demo Svømmehall'].map((venue) => (
                <div
                  key={venue}
                  style={{
                    backgroundColor: 'var(--ds-color-neutral-surface-default)',
                    borderRadius: 'var(--ds-border-radius-lg)',
                    border: '1px solid var(--ds-color-neutral-border-default)',
                    overflow: 'hidden',
                    transition: 'box-shadow 0.2s ease, transform 0.2s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {/* Image placeholder */}
                  <div style={{
                    height: '160px',
                    backgroundColor: 'var(--ds-color-neutral-surface-hover)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--ds-color-neutral-text-subtle)'
                  }}>
                    <MapPinIcon size={32} />
                  </div>
                  {/* Content */}
                  <div style={{ padding: '16px' }}>
                    <h3 style={{
                      margin: '0 0 8px 0',
                      fontSize: 'var(--ds-font-size-md)',
                      fontWeight: 600,
                      color: 'var(--ds-color-neutral-text-default)'
                    }}>
                      {venue}
                    </h3>
                    <p style={{
                      margin: '0 0 12px 0',
                      fontSize: 'var(--ds-font-size-sm)',
                      color: 'var(--ds-color-neutral-text-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <MapPinIcon size={14} />
                      Oslo
                    </p>
                    <p style={{
                      margin: 0,
                      fontSize: 'var(--ds-font-size-sm)',
                      color: 'var(--ds-color-neutral-text-subtle)'
                    }}>
                      Moderne lokale med gode fasiliteter. Perfekt for arrangementer.
                    </p>
                    <div style={{
                      marginTop: '12px',
                      paddingTop: '12px',
                      borderTop: '1px solid var(--ds-color-neutral-border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: 'var(--ds-font-size-xs)',
                      color: 'var(--ds-color-neutral-text-subtle)'
                    }}>
                      <UserIcon size={14} />
                      Kapasitet: 100 personer
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </main>
        </ContentLayout>
      </div>
    </DesignsystemetProvider>
  );
}

export default App;
