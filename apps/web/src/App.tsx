import React from 'react';
import {
  AppHeader,
  HeaderLogo,
  HeaderSearch,
  HeaderActions,
  HeaderThemeToggle,
  HeaderLanguageSwitch,
  HeaderLoginButton,
  ContentLayout,
  Button,
  Checkbox,
  CalendarIcon,
  UserIcon,
  SettingsIcon,
  MapPinIcon,
  FilterIcon,
  Drawer,
  DrawerSection,
  DrawerItem,
  ListingCard,
  ListingListItem,
  ListingGrid,
  ListingToolbar,
  ListingMap,
  Stack,
  Text
} from '@xala/ds';
import type { SearchResultItem, SearchResultGroup, ViewMode, ListingType } from '@xala/ds';
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

// Filter options - listing types with dynamic counts
const getListingTypeCounts = () => {
  const counts: Record<string, number> = { ALL: listings.length };
  listings.forEach(l => {
    counts[l.listingType] = (counts[l.listingType] || 0) + 1;
  });
  return counts;
};

const listingTypeOptions = [
  { id: 'ALL', label: 'Alle' },
  { id: 'SPACE', label: 'Lokaler' },
  { id: 'RESOURCE', label: 'Ressurser' },
  { id: 'EVENT', label: 'Arrangementer' },
  { id: 'SERVICE', label: 'Tjenester' },
  { id: 'VEHICLE', label: 'Kjøretøy' },
];

// Capacity range options
const capacityOptions = [
  { id: 'all', label: 'Alle størrelser', min: 0, max: Infinity },
  { id: '1-10', label: '1-10 personer', min: 1, max: 10 },
  { id: '11-25', label: '11-25 personer', min: 11, max: 25 },
  { id: '26-50', label: '26-50 personer', min: 26, max: 50 },
  { id: '51-100', label: '51-100 personer', min: 51, max: 100 },
  { id: '100+', label: 'Over 100 personer', min: 101, max: Infinity },
];

// Extract unique facilities from listings
const getAllFacilities = () => {
  const facilitySet = new Set<string>();
  listings.forEach(l => l.facilities?.forEach(f => facilitySet.add(f)));
  return Array.from(facilitySet).sort();
};

// Extract unique areas/locations from listings
const getLocationAreas = () => {
  const areas: { id: string; label: string }[] = [
    { id: 'all', label: 'Alle områder' },
    { id: 'drammen', label: 'Drammen sentrum' },
    { id: 'solbergelva', label: 'Solbergelva' },
    { id: 'gulskogen', label: 'Gulskogen' },
  ];
  return areas;
};

// Mapbox token from environment
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

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
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=400&fit=crop',
    latitude: 59.7439,
    longitude: 10.2045
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
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=400&fit=crop',
    latitude: 59.7312,
    longitude: 10.1523
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
    image: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=600&h=400&fit=crop',
    latitude: 59.7401,
    longitude: 10.1892
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
    image: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=600&h=400&fit=crop',
    latitude: 59.7425,
    longitude: 10.2038
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
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=400&fit=crop',
    latitude: 59.7448,
    longitude: 10.2112
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
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&h=400&fit=crop',
    latitude: 59.7389,
    longitude: 10.1956
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
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=400&fit=crop',
    latitude: 59.7441,
    longitude: 10.2048
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
    image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&h=400&fit=crop',
    latitude: 59.7462,
    longitude: 10.1978
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
    image: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=600&h=400&fit=crop',
    latitude: 59.7398,
    longitude: 10.2089
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
    image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&h=400&fit=crop',
    latitude: 59.7456,
    longitude: 10.2134
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
    image: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=600&h=400&fit=crop',
    latitude: 59.7478,
    longitude: 10.1923
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
    image: 'https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=600&h=400&fit=crop',
    latitude: 59.7412,
    longitude: 10.2067
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
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop',
    latitude: 59.7435,
    longitude: 10.2025
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
    image: 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=600&h=400&fit=crop',
    latitude: 59.7367,
    longitude: 10.2145
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
    image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&h=400&fit=crop',
    latitude: 59.7289,
    longitude: 10.1834
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
  const [listingType, setListingType] = React.useState<ListingType | 'ALL'>('ALL');
  const [viewMode, setViewMode] = React.useState<ViewMode>('grid');

  // Additional filters
  const [selectedArea, setSelectedArea] = React.useState<string>('all');
  const [selectedCapacity, setSelectedCapacity] = React.useState<string>('all');
  const [selectedFacilities, setSelectedFacilities] = React.useState<string[]>([]);

  // "Show more" state for filter sections
  const [showMoreCapacity, setShowMoreCapacity] = React.useState(false);
  const [showMoreFacilities, setShowMoreFacilities] = React.useState(false);
  const MAX_VISIBLE_ITEMS = 4;

  // Get filter options
  const typeCounts = React.useMemo(() => getListingTypeCounts(), []);
  const allFacilities = React.useMemo(() => getAllFacilities(), []);
  const locationAreas = React.useMemo(() => getLocationAreas(), []);

  // Filter listings by all criteria
  const filteredListings = React.useMemo(() => {
    return listings.filter(l => {
      // Filter by listing type
      if (listingType !== 'ALL' && l.listingType !== listingType) return false;

      // Filter by area/location
      if (selectedArea !== 'all') {
        const locationLower = l.location.toLowerCase();
        if (selectedArea === 'drammen' && !locationLower.includes('drammen') && !locationLower.includes('storgate') && !locationLower.includes('danvik') && !locationLower.includes('bragernes')) return false;
        if (selectedArea === 'solbergelva' && !locationLower.includes('solbergelva') && !locationLower.includes('solberg')) return false;
        if (selectedArea === 'gulskogen' && !locationLower.includes('gulskogen')) return false;
      }

      // Filter by capacity
      if (selectedCapacity !== 'all') {
        const capacityOption = capacityOptions.find(c => c.id === selectedCapacity);
        if (capacityOption && (l.capacity < capacityOption.min || l.capacity > capacityOption.max)) return false;
      }

      // Filter by facilities (all selected must be present)
      if (selectedFacilities.length > 0) {
        const listingFacilities = l.facilities || [];
        if (!selectedFacilities.every(f => listingFacilities.includes(f))) return false;
      }

      return true;
    });
  }, [listingType, selectedArea, selectedCapacity, selectedFacilities]);

  // Pagination - 2 rows at a time (6 items with 3 columns)
  const ITEMS_PER_PAGE = 6;
  const [visibleCount, setVisibleCount] = React.useState(ITEMS_PER_PAGE);
  const visibleListings = filteredListings.slice(0, visibleCount);
  const hasMore = visibleCount < filteredListings.length;

  // Reset visible count when any filter changes
  React.useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [listingType, selectedArea, selectedCapacity, selectedFacilities]);

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

  const handleTypeSelect = (typeId: string) => {
    setListingType(typeId as ListingType | 'ALL');
  };

  const activeFilterCount =
    (listingType !== 'ALL' ? 1 : 0) +
    (selectedArea !== 'all' ? 1 : 0) +
    (selectedCapacity !== 'all' ? 1 : 0) +
    selectedFacilities.length;

  const isDarkTheme = colorScheme === 'dark';

  return (
    <DesignsystemetProvider theme={theme} colorScheme={colorScheme} size="auto">
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

        {/* Left Filter Drawer - switches to bottom on mobile */}
        <Drawer
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
          title="Filtre"
          icon={<FilterIcon size={20} />}
          position="left"
          size="sm"
          mobilePosition="bottom"
          mobileSize="lg"
          footer={
            <Stack spacing="var(--ds-spacing-3)">
              <Text
                size="sm"
                color="var(--ds-color-neutral-text-subtle)"
                style={{ textAlign: 'center' }}
              >
                Viser {filteredListings.length} resultater
              </Text>
              <Button
                type="button"
                variant="primary"
                style={{ width: '100%' }}
                onClick={() => setIsFilterOpen(false)}
              >
                Vis resultater
              </Button>
            </Stack>
          }
        >
          <DrawerSection title="Type" collapsible>
            <Stack spacing="var(--ds-spacing-1)">
              {listingTypeOptions.map((type) => (
                <DrawerItem
                  key={type.id}
                  left={
                    <Checkbox
                      checked={listingType === type.id}
                      onChange={() => handleTypeSelect(type.id)}
                      aria-label={type.label}
                    />
                  }
                  right={<Text size="sm">({typeCounts[type.id] || 0})</Text>}
                  onClick={() => handleTypeSelect(type.id)}
                  selected={listingType === type.id}
                >
                  <Text size="sm" color="var(--ds-color-neutral-text-default)">
                    {type.label}
                  </Text>
                </DrawerItem>
              ))}
            </Stack>
          </DrawerSection>

          <DrawerSection title="Område" collapsible defaultCollapsed>
            <Stack spacing="var(--ds-spacing-1)">
              {locationAreas.map((area) => (
                <DrawerItem
                  key={area.id}
                  left={
                    <Checkbox
                      checked={selectedArea === area.id}
                      onChange={() => setSelectedArea(area.id)}
                      aria-label={area.label}
                    />
                  }
                  onClick={() => setSelectedArea(area.id)}
                  selected={selectedArea === area.id}
                >
                  <Text size="sm" color="var(--ds-color-neutral-text-default)">
                    {area.label}
                  </Text>
                </DrawerItem>
              ))}
            </Stack>
          </DrawerSection>

          <DrawerSection title="Kapasitet" collapsible defaultCollapsed>
            <Stack spacing="var(--ds-spacing-1)">
              {(showMoreCapacity ? capacityOptions : capacityOptions.slice(0, MAX_VISIBLE_ITEMS)).map((cap) => (
                <DrawerItem
                  key={cap.id}
                  left={
                    <Checkbox
                      checked={selectedCapacity === cap.id}
                      onChange={() => setSelectedCapacity(cap.id)}
                      aria-label={cap.label}
                    />
                  }
                  onClick={() => setSelectedCapacity(cap.id)}
                  selected={selectedCapacity === cap.id}
                >
                  <Text size="sm" color="var(--ds-color-neutral-text-default)">
                    {cap.label}
                  </Text>
                </DrawerItem>
              ))}
              {capacityOptions.length > MAX_VISIBLE_ITEMS && (
                <Button
                  type="button"
                  variant="tertiary"
                  style={{ marginTop: 'var(--ds-spacing-2)', width: '100%' }}
                  onClick={() => setShowMoreCapacity(!showMoreCapacity)}
                >
                  {showMoreCapacity ? 'Vis mindre' : `Vis ${capacityOptions.length - MAX_VISIBLE_ITEMS} flere`}
                </Button>
              )}
            </Stack>
          </DrawerSection>

          <DrawerSection title="Fasiliteter" collapsible defaultCollapsed>
            <Stack spacing="var(--ds-spacing-1)">
              {(showMoreFacilities ? allFacilities : allFacilities.slice(0, MAX_VISIBLE_ITEMS)).map((facility) => (
                <DrawerItem
                  key={facility}
                  left={
                    <Checkbox
                      checked={selectedFacilities.includes(facility)}
                      onChange={() => {
                        setSelectedFacilities(prev =>
                          prev.includes(facility)
                            ? prev.filter(f => f !== facility)
                            : [...prev, facility]
                        );
                      }}
                      aria-label={facility}
                    />
                  }
                  onClick={() => {
                    setSelectedFacilities(prev =>
                      prev.includes(facility)
                        ? prev.filter(f => f !== facility)
                        : [...prev, facility]
                    );
                  }}
                  selected={selectedFacilities.includes(facility)}
                >
                  <Text size="sm" color="var(--ds-color-neutral-text-default)">
                    {facility}
                  </Text>
                </DrawerItem>
              ))}
              {allFacilities.length > MAX_VISIBLE_ITEMS && (
                <Button
                  type="button"
                  variant="tertiary"
                  style={{ marginTop: 'var(--ds-spacing-2)', width: '100%' }}
                  onClick={() => setShowMoreFacilities(!showMoreFacilities)}
                >
                  {showMoreFacilities ? 'Vis mindre' : `Vis ${allFacilities.length - MAX_VISIBLE_ITEMS} flere`}
                </Button>
              )}
            </Stack>
          </DrawerSection>
        </Drawer>

        <ContentLayout maxWidth="1440px" className="main-content-layout">
          <main id="main" style={{ paddingTop: 'var(--ds-spacing-6)', paddingBottom: 'var(--ds-spacing-6)' }}>
            {/* Mobile search - shown above filter bar on mobile */}
            <div className="mobile-search-wrapper" style={{ marginBottom: 'var(--ds-spacing-4)' }}>
              <HeaderSearch
                placeholder="Søk lokaler..."
                value={searchQuery}
                onSearchChange={handleSearchChange}
                onSearch={handleSearch}
                results={searchResults}
                onResultSelect={handleResultSelect}
                isLoading={isSearching}
              />
            </div>

            <ListingToolbar
              count={filteredListings.length}
              countLabel="resultater"
              activeFilterCount={activeFilterCount}
              onFilterClick={() => setIsFilterOpen(true)}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              showViewToggle={true}
              className="listing-toolbar"
            />

            {viewMode === 'grid' ? (
              <ListingGrid minCardWidth={300}>
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
            ) : viewMode === 'list' ? (
              <Stack spacing="var(--ds-spacing-4)">
                {visibleListings.map((listing) => (
                  <ListingListItem
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
                    latitude={listing.latitude}
                    longitude={listing.longitude}
                    mapboxToken={MAPBOX_TOKEN}
                    showListingType={true}
                    showMap={true}
                    onClick={(id) => console.log('Navigate to listing:', id)}
                    onFavorite={(id) => console.log('Toggle favorite:', id)}
                  />
                ))}
              </Stack>
            ) : (
              <ListingMap
                listings={listings
                  .filter(l => l.latitude && l.longitude)
                  .map(l => ({
                    id: l.id,
                    name: l.name,
                    location: l.location,
                    image: l.image,
                    latitude: l.latitude!,
                    longitude: l.longitude!,
                    type: l.type,
                    listingType: l.listingType,
                    description: l.description,
                    capacity: l.capacity,
                    price: l.price,
                    priceUnit: l.priceUnit,
                    facilities: l.facilities,
                    available: l.available,
                  }))}
                mapboxToken={MAPBOX_TOKEN}
                height="calc(100vh - 250px)"
                onListingClick={(id) => console.log('Navigate to listing:', id)}
              />
            )}

            {/* Show more button - hidden for map view */}
            {viewMode !== 'map' && hasMore && (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                marginTop: 'var(--ds-spacing-8)'
              }}>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setVisibleCount(prev => prev + ITEMS_PER_PAGE)}
                  style={{ paddingInline: 'var(--ds-spacing-8)' }}
                >
                  Vis flere ({filteredListings.length - visibleCount} igjen)
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
