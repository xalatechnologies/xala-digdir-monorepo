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

// Demo listings - various types according to schema
const listings = [
  // SPACE listings
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
  // RESOURCE listings
  {
    id: '4',
    name: 'Projektor og lerret',
    type: 'AV-utstyr',
    listingType: 'RESOURCE' as const,
    location: 'Drammen Bibliotek',
    description: 'Profesjonell projektor med stort lerret. Perfekt for presentasjoner og filmvisninger.',
    facilities: ['4K oppløsning', 'HDMI', 'Fjernkontroll'],
    moreFacilities: 0,
    capacity: 1,
    price: 200,
    priceUnit: 'dag',
    rating: 4.7,
    reviewCount: 12,
    available: true,
    image: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=600&h=400&fit=crop'
  },
  {
    id: '5',
    name: 'PA-anlegg komplett',
    type: 'Lydutstyr',
    listingType: 'RESOURCE' as const,
    location: 'Kulturhuset Drammen',
    description: 'Komplett PA-anlegg med mikrofoner, miksebord og høyttalere for arrangementer.',
    facilities: ['2x høyttalere', 'Miksebord', '4x mikrofoner'],
    moreFacilities: 3,
    capacity: 1,
    price: 800,
    priceUnit: 'dag',
    rating: 4.5,
    reviewCount: 8,
    available: true,
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=400&fit=crop'
  },
  {
    id: '6',
    name: 'Kajakk dobbeltseter',
    type: 'Vannsport',
    listingType: 'RESOURCE' as const,
    location: 'Drammenselva Padleklubb',
    description: 'Stabil dobbelkajakk perfekt for turer på Drammenselva. Inkluderer årer og redningsvester.',
    facilities: ['2 årer', 'Redningsvester', 'Tørrpose'],
    moreFacilities: 0,
    capacity: 2,
    price: 350,
    priceUnit: 'dag',
    rating: 4.8,
    reviewCount: 22,
    available: true,
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&h=400&fit=crop'
  },
  // EVENT listings
  {
    id: '7',
    name: 'Yoga i parken',
    type: 'Trening',
    listingType: 'EVENT' as const,
    location: 'Bragernes Torg',
    description: 'Utendørs yoga-klasse for alle nivåer. Ta med egen matte eller lån på stedet.',
    facilities: ['Instruktør', 'Utlånsmatter', 'Parkering'],
    moreFacilities: 0,
    capacity: 30,
    price: 150,
    priceUnit: 'person',
    rating: 4.9,
    reviewCount: 45,
    available: true,
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=400&fit=crop'
  },
  {
    id: '8',
    name: 'Keramikk-kurs for nybegynnere',
    type: 'Kurs',
    listingType: 'EVENT' as const,
    location: 'Drammens Kunstverksted',
    description: '3-timers introduksjonskurs i dreiing og glasering. Alt materiale inkludert.',
    facilities: ['Materiale inkl.', 'Forkle', 'Brenning'],
    moreFacilities: 1,
    capacity: 8,
    price: 650,
    priceUnit: 'person',
    rating: 4.6,
    reviewCount: 19,
    available: true,
    image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&h=400&fit=crop'
  },
  {
    id: '9',
    name: 'Sommerkonsert: Drammens Storband',
    type: 'Konsert',
    listingType: 'EVENT' as const,
    location: 'Union Scene',
    description: 'Storband-konsert med klassiske jazz-standarder og moderne arrangementer.',
    facilities: ['Sitteplasser', 'Bar', 'Garderobe'],
    moreFacilities: 0,
    capacity: 250,
    price: 350,
    priceUnit: 'person',
    rating: 4.8,
    reviewCount: 67,
    available: false,
    image: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=600&h=400&fit=crop'
  },
  // SERVICE listings
  {
    id: '10',
    name: 'Personlig trener - Ole Berg',
    type: 'PT',
    listingType: 'SERVICE' as const,
    location: 'SATS Drammen',
    description: 'Sertifisert personlig trener med 10 års erfaring. Spesialisert på styrketrening og vektnedgang.',
    facilities: ['Treningsprogram', 'Kostholdsråd', 'Oppfølging'],
    moreFacilities: 1,
    capacity: 1,
    price: 750,
    priceUnit: 'time',
    rating: 4.9,
    reviewCount: 34,
    available: true,
    image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&h=400&fit=crop'
  },
  {
    id: '11',
    name: 'Gitarlærer - Lise Haugen',
    type: 'Musikk',
    listingType: 'SERVICE' as const,
    location: 'Drammen Kulturskole',
    description: 'Gitarundervisning for barn og voksne. Klassisk, akustisk og elektrisk gitar.',
    facilities: ['Lånegitar', 'Noter inkl.', 'Øvingsrom'],
    moreFacilities: 0,
    capacity: 1,
    price: 450,
    priceUnit: 'time',
    rating: 4.7,
    reviewCount: 28,
    available: true,
    image: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=600&h=400&fit=crop'
  },
  {
    id: '12',
    name: 'Fotograf - Bryllup & Events',
    type: 'Foto',
    listingType: 'SERVICE' as const,
    location: 'Drammen og omegn',
    description: 'Profesjonell fotograf for bryllup, konfirmasjon og bedriftsarrangementer.',
    facilities: ['Redigering inkl.', 'Digitale filer', 'Album'],
    moreFacilities: 2,
    capacity: 1,
    price: 8500,
    priceUnit: 'dag',
    rating: 4.8,
    reviewCount: 52,
    available: true,
    image: 'https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=600&h=400&fit=crop'
  },
  // VEHICLE listings
  {
    id: '13',
    name: 'Elektrisk varebil',
    type: 'Varebil',
    listingType: 'VEHICLE' as const,
    location: 'Drammen sentrum',
    description: 'Miljøvennlig elektrisk varebil for flytting og transport. Rekkevidde 250 km.',
    facilities: ['GPS', 'Lastestropper', 'Tralle'],
    moreFacilities: 1,
    capacity: 2,
    price: 890,
    priceUnit: 'dag',
    rating: 4.6,
    reviewCount: 31,
    available: true,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop'
  },
  {
    id: '14',
    name: 'Elsykkel - Bysykkel',
    type: 'Sykkel',
    listingType: 'VEHICLE' as const,
    location: 'Drammen Stasjon',
    description: 'Komfortabel elsykkel for bytur eller lengre turer langs Drammenselva.',
    facilities: ['Hjelm inkl.', 'Lås', 'Kurv'],
    moreFacilities: 0,
    capacity: 1,
    price: 250,
    priceUnit: 'dag',
    rating: 4.5,
    reviewCount: 18,
    available: true,
    image: 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=600&h=400&fit=crop'
  },
  {
    id: '15',
    name: 'Minibuss 9-seter',
    type: 'Minibuss',
    listingType: 'VEHICLE' as const,
    location: 'Gulskogen',
    description: 'Romslig minibuss perfekt for familieturer, lagsport eller gruppereiser.',
    facilities: ['Aircondition', 'Bluetooth', 'Bagasjerom'],
    moreFacilities: 2,
    capacity: 9,
    price: 1400,
    priceUnit: 'dag',
    rating: 4.7,
    reviewCount: 14,
    available: false,
    image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&h=400&fit=crop'
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

  // Pagination - 2 rows at a time (6 items with 3 columns)
  const ITEMS_PER_PAGE = 6;
  const [visibleCount, setVisibleCount] = React.useState(ITEMS_PER_PAGE);
  const visibleListings = listings.slice(0, visibleCount);
  const hasMore = visibleCount < listings.length;

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
      <style>{`
        *, *::before, *::after {
          transition: background-color 0.3s ease, border-color 0.3s ease, color 0.2s ease;
        }
      `}</style>
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

        <ContentLayout maxWidth="1440px" padding="0 var(--ds-spacing-8)">
          <main id="main" style={{ paddingTop: '24px', paddingBottom: '24px' }}>
            <ListingToolbar
              count={listings.length}
              countLabel="listings"
              activeFilterCount={activeFilterCount}
              onFilterClick={() => setIsFilterOpen(true)}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              showViewToggle={true}
              availableViews={['grid', 'list', 'map']}
            />

            <ListingGrid columns={3} gap={32}>
              {visibleListings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  id={listing.id}
                  name={listing.name}
                  type={listing.type}
                  listingType={listing.listingType}
                  location={listing.location}
                  description={listing.description}
                  image={listing.image}
                  facilities={listing.facilities}
                  moreFacilities={listing.moreFacilities}
                  capacity={listing.capacity}
                  price={listing.price}
                  priceUnit={listing.priceUnit}
                  // rating={listing.rating} // TODO: Enable when rating system is ready
                  // reviewCount={listing.reviewCount}
                  available={listing.available}
                  showRating={false}
                  showPrice={false}
                  showListingType={true}
                  onClick={(id) => console.log('Navigate to listing:', id)}
                  onFavorite={(id) => console.log('Toggle favorite:', id)}
                  onShare={(id) => console.log('Share listing:', id)}
                />
              ))}
            </ListingGrid>

            {/* Show more button */}
            {hasMore && (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                marginTop: '32px'
              }}>
                <Button
                  variant="secondary"
                  onClick={() => setVisibleCount(prev => prev + ITEMS_PER_PAGE)}
                  style={{ paddingInline: '2rem' }}
                >
                  Vis flere ({listings.length - visibleCount} igjen)
                </Button>
              </div>
            )}
          </main>
        </ContentLayout>
      </div>
    </DesignsystemetProvider>
  );
}

export default App;
