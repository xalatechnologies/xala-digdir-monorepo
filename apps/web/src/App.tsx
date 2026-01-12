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
  DrawerItem,
  ListingCard,
  ListingGrid,
  ListingToolbar
} from '@xala/ds';
import type { SearchResultItem, SearchResultGroup, ViewMode } from '@xala/ds';
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
  { id: 'all', label: 'Alle', count: 8 },
  { id: 'idrettshall', label: 'Idrettshall', count: 3 },
  { id: 'moterom', label: 'Møterom', count: 2 },
  { id: 'svommebasseng', label: 'Svømmebasseng', count: 2 },
  { id: 'utendors', label: 'Utendørs', count: 1 },
];

// Demo venues
const venues = [
  {
    id: '1',
    name: 'Bragernes Møterom',
    type: 'Møterom',
    listingType: 'SPACE' as const,
    location: 'Nedre Storgate 15',
    description: 'Profesjonelt møterom i hjertet av Drammen. Utstyrt med moderne teknologi for presentasjoner og videokonferanser.',
    facilities: ['Projektor', 'Tavle', 'WiFi'],
    moreFacilities: 2,
    capacity: 25,
    price: 450,
    priceUnit: 'time',
    rating: 4.8,
    reviewCount: 24,
    available: true,
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=400&fit=crop'
  },
  {
    id: '2',
    name: 'Solberghallen',
    type: 'Idrettshall',
    listingType: 'SPACE' as const,
    location: 'Gamle Riksvei 102A, 3057 Solbergelva',
    description: 'Solberghallen er en moderne idrettshall for innedretter, foreninger og arrangementer.',
    facilities: ['Garderober', 'Dusj', 'Fotball'],
    moreFacilities: 1,
    capacity: 100,
    price: 1200,
    priceUnit: 'time',
    rating: 4.6,
    reviewCount: 18,
    available: true,
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=400&fit=crop'
  },
  {
    id: '3',
    name: 'Drammen Svømmehall',
    type: 'Svømmehall',
    listingType: 'SPACE' as const,
    location: 'Danvikgata 40, 3045 Drammen',
    description: 'Moderne svømmeanlegg med 25m basseng, barnebasseng og badstue.',
    facilities: ['25m basseng', 'Barnebasseng', 'Badstue'],
    moreFacilities: 3,
    capacity: 80,
    price: 180,
    priceUnit: 'person',
    rating: 4.9,
    reviewCount: 56,
    available: false,
    image: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=600&h=400&fit=crop'
  },
  {
    id: '4',
    name: 'Konnerud Idrettshall',
    type: 'Idrettshall',
    listingType: 'SPACE' as const,
    location: 'Konnerudgata 45, 3045 Drammen',
    description: 'Stor idrettshall med plass til flere aktiviteter samtidig. Perfekt for lag og foreninger.',
    facilities: ['Garderober', 'Tribuner', 'Parkering'],
    moreFacilities: 2,
    capacity: 200,
    price: 1500,
    priceUnit: 'time',
    rating: 4.5,
    reviewCount: 32,
    available: true,
    image: 'https://images.unsplash.com/photo-1519766304817-4f37bda74a26?w=600&h=400&fit=crop'
  },
  {
    id: '5',
    name: 'Sentrum Møtelokale',
    type: 'Møterom',
    listingType: 'SPACE' as const,
    location: 'Bragernes Torg 12',
    description: 'Moderne møtelokale midt i sentrum. Ideelt for workshops og seminarer.',
    facilities: ['AV-utstyr', 'Whiteboard', 'Kaffe'],
    moreFacilities: 1,
    capacity: 40,
    price: 650,
    priceUnit: 'time',
    rating: 4.7,
    reviewCount: 15,
    available: true,
    image: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=600&h=400&fit=crop'
  },
  {
    id: '6',
    name: 'Fjell Svømmehall',
    type: 'Svømmehall',
    listingType: 'SPACE' as const,
    location: 'Fjellveien 8, 3050 Drammen',
    description: 'Familievennlig svømmehall med flere bassenger og vannlek for barn.',
    facilities: ['Vannlek', 'Stupetårn', 'Kafé'],
    moreFacilities: 2,
    capacity: 120,
    price: 150,
    priceUnit: 'person',
    rating: 4.4,
    reviewCount: 42,
    available: true,
    image: 'https://images.unsplash.com/photo-1575429198097-0414ec08e8cd?w=600&h=400&fit=crop'
  },
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
  const [viewMode, setViewMode] = React.useState<ViewMode>('grid');

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
          <main id="main" style={{ padding: '24px' }}>
            <ListingToolbar
              count={venues.length}
              countLabel="listings"
              activeFilterCount={activeFilterCount}
              onFilterClick={() => setIsFilterOpen(true)}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              showViewToggle={true}
              availableViews={['grid', 'list', 'map']}
            />

            <ListingGrid columns={3} gap={32}>
              {venues.map((venue) => (
                <ListingCard
                  key={venue.id}
                  id={venue.id}
                  name={venue.name}
                  type={venue.type}
                  listingType={venue.listingType}
                  location={venue.location}
                  description={venue.description}
                  image={venue.image}
                  facilities={venue.facilities}
                  moreFacilities={venue.moreFacilities}
                  capacity={venue.capacity}
                  price={venue.price}
                  priceUnit={venue.priceUnit}
                  // rating={venue.rating} // TODO: Enable when rating system is ready
                  // reviewCount={venue.reviewCount}
                  available={venue.available}
                  showRating={false}
                  showPrice={false}
                  showListingType={true}
                  onClick={(id) => console.log('Navigate to listing:', id)}
                  onFavorite={(id) => console.log('Toggle favorite:', id)}
                  onShare={(id) => console.log('Share listing:', id)}
                />
              ))}
            </ListingGrid>
          </main>
        </ContentLayout>
      </div>
    </DesignsystemetProvider>
  );
}

export default App;
