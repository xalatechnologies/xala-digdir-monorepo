/**
 * ListingsPage
 *
 * Main listings page with filters, search, and grid/list/map views.
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Checkbox,
  FilterIcon,
  Drawer,
  DrawerSection,
  DrawerItem,
  ContentLayout,
  ListingCard,
  ListingListItem,
  ListingGrid,
  ListingToolbar,
  ListingMap,
  Stack,
  Text,
  HeaderSearch,
} from '@xala/ds';
import type { SearchResultItem, SearchResultGroup, ViewMode, ListingType } from '@xala/ds';
import { useUiListings, isUsingMockData } from '@xala/sdk';
import type { UiListing } from '@xala/sdk';
import { demoSearchResults, mockListings, listingTypeOptions, capacityOptions } from '../data/mock-data';

// Mapbox token from environment
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

// Filter options - listing types with dynamic counts
const getListingTypeCounts = (listingsData: UiListing[]) => {
  const counts: Record<string, number> = { ALL: listingsData.length };
  listingsData.forEach(l => {
    counts[l.listingType] = (counts[l.listingType] || 0) + 1;
  });
  return counts;
};

// Extract unique facilities from listings
const getAllFacilities = (listingsData: UiListing[]) => {
  const facilitySet = new Set<string>();
  listingsData.forEach(l => l.facilities?.forEach(f => facilitySet.add(f)));
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

export function ListingsPage(): React.ReactElement {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = React.useState('');
  const [searchResults, setSearchResults] = React.useState<SearchResultGroup[]>([]);
  const [isSearching, setIsSearching] = React.useState(false);

  // Check if running in mock mode (no license key)
  const isMockMode = isUsingMockData();

  // Fetch listings from API (disabled in mock mode)
  const { data: apiListingsData, isLoading: isApiLoading, error: apiError } = useUiListings({
    status: 'published',
  });

  // Use API data if available, otherwise use mock data as fallback
  const listings: UiListing[] = React.useMemo(() => {
    if (!isMockMode && apiListingsData?.data && apiListingsData.data.length > 0) {
      return apiListingsData.data;
    }
    // Use mock data
    return mockListings;
  }, [apiListingsData, isMockMode]);

  // Filter drawer state
  const [isFilterOpen, setIsFilterOpen] = React.useState(false);
  const [listingType, setListingType] = React.useState<ListingType | 'ALL'>('ALL');
  const [viewMode, setViewMode] = React.useState<ViewMode>('grid');

  // Additional filters
  const [selectedArea, setSelectedArea] = React.useState<string>('all');
  const [selectedCapacity, setSelectedCapacity] = React.useState<string>('all');
  const [selectedFacilities, setSelectedFacilities] = React.useState<string[]>([]);

  // "Show more" state for filter sections
  const [showMoreType, setShowMoreType] = React.useState(false);
  const [showMoreArea, setShowMoreArea] = React.useState(false);
  const [showMoreCapacity, setShowMoreCapacity] = React.useState(false);
  const [showMoreFacilities, setShowMoreFacilities] = React.useState(false);
  const MAX_VISIBLE_ITEMS = 4;

  // Get filter options
  const typeCounts = React.useMemo(() => getListingTypeCounts(listings), [listings]);
  const allFacilities = React.useMemo(() => getAllFacilities(listings), [listings]);
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
  }, [listings, listingType, selectedArea, selectedCapacity, selectedFacilities]);

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

  const handleTypeSelect = (typeId: string) => {
    setListingType(typeId as ListingType | 'ALL');
  };

  const handleListingClick = (id: string) => {
    navigate(`/listing/${id}`);
  };

  const activeFilterCount =
    (listingType !== 'ALL' ? 1 : 0) +
    (selectedArea !== 'all' ? 1 : 0) +
    (selectedCapacity !== 'all' ? 1 : 0) +
    selectedFacilities.length;

  return (
    <>
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
            {(showMoreType ? listingTypeOptions : listingTypeOptions.slice(0, MAX_VISIBLE_ITEMS)).map((type, index) => (
              <div
                key={type.id}
                style={{
                  animation: 'filterItemFadeIn 0.2s ease-out forwards',
                  animationDelay: `${index * 0.03}s`,
                  opacity: 0,
                }}
              >
                <DrawerItem
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
              </div>
            ))}
            {listingTypeOptions.length > MAX_VISIBLE_ITEMS && (
              <Button
                type="button"
                variant="tertiary"
                style={{
                  marginTop: 'var(--ds-spacing-2)',
                  width: '100%',
                  transition: 'all 0.2s ease',
                }}
                onClick={() => setShowMoreType(!showMoreType)}
              >
                {showMoreType ? 'Vis mindre' : `Vis ${listingTypeOptions.length - MAX_VISIBLE_ITEMS} flere`}
              </Button>
            )}
          </Stack>
        </DrawerSection>

        <DrawerSection title="Område" collapsible defaultCollapsed>
          <Stack spacing="var(--ds-spacing-1)">
            {(showMoreArea ? locationAreas : locationAreas.slice(0, MAX_VISIBLE_ITEMS)).map((area, index) => (
              <div
                key={area.id}
                style={{
                  animation: 'filterItemFadeIn 0.2s ease-out forwards',
                  animationDelay: `${index * 0.03}s`,
                  opacity: 0,
                }}
              >
                <DrawerItem
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
              </div>
            ))}
            {locationAreas.length > MAX_VISIBLE_ITEMS && (
              <Button
                type="button"
                variant="tertiary"
                style={{
                  marginTop: 'var(--ds-spacing-2)',
                  width: '100%',
                  transition: 'all 0.2s ease',
                }}
                onClick={() => setShowMoreArea(!showMoreArea)}
              >
                {showMoreArea ? 'Vis mindre' : `Vis ${locationAreas.length - MAX_VISIBLE_ITEMS} flere`}
              </Button>
            )}
          </Stack>
        </DrawerSection>

        <DrawerSection title="Kapasitet" collapsible defaultCollapsed>
          <Stack spacing="var(--ds-spacing-1)">
            {(showMoreCapacity ? capacityOptions : capacityOptions.slice(0, MAX_VISIBLE_ITEMS)).map((cap, index) => (
              <div
                key={cap.id}
                style={{
                  animation: 'filterItemFadeIn 0.2s ease-out forwards',
                  animationDelay: `${index * 0.03}s`,
                  opacity: 0,
                }}
              >
                <DrawerItem
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
              </div>
            ))}
            {capacityOptions.length > MAX_VISIBLE_ITEMS && (
              <Button
                type="button"
                variant="tertiary"
                style={{
                  marginTop: 'var(--ds-spacing-2)',
                  width: '100%',
                  transition: 'all 0.2s ease',
                }}
                onClick={() => setShowMoreCapacity(!showMoreCapacity)}
              >
                {showMoreCapacity ? 'Vis mindre' : `Vis ${capacityOptions.length - MAX_VISIBLE_ITEMS} flere`}
              </Button>
            )}
          </Stack>
        </DrawerSection>

        <DrawerSection title="Fasiliteter" collapsible defaultCollapsed>
          <Stack spacing="var(--ds-spacing-1)">
            {(showMoreFacilities ? allFacilities : allFacilities.slice(0, MAX_VISIBLE_ITEMS)).map((facility, index) => (
              <div
                key={facility}
                style={{
                  animation: 'filterItemFadeIn 0.2s ease-out forwards',
                  animationDelay: `${index * 0.03}s`,
                  opacity: 0,
                }}
              >
                <DrawerItem
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
              </div>
            ))}
            {allFacilities.length > MAX_VISIBLE_ITEMS && (
              <Button
                type="button"
                variant="tertiary"
                style={{
                  marginTop: 'var(--ds-spacing-2)',
                  width: '100%',
                  transition: 'all 0.2s ease',
                }}
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

          {/* API Loading State */}
          {!isMockMode && isApiLoading && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: 'var(--ds-spacing-8)',
              color: 'var(--ds-color-neutral-text-subtle)'
            }}>
              <Text size="md">Laster lokaler...</Text>
            </div>
          )}

          {/* API Error State - only show if not in mock mode */}
          {!isMockMode && apiError && !isApiLoading && (
            <div style={{
              padding: 'var(--ds-spacing-4)',
              marginBottom: 'var(--ds-spacing-4)',
              backgroundColor: 'var(--ds-color-warning-background-subtle)',
              borderRadius: 'var(--ds-border-radius-md)',
              border: '1px solid var(--ds-color-warning-border-subtle)'
            }}>
              <Text size="sm" color="var(--ds-color-warning-text-default)">
                Kunne ikke laste data fra API. Viser demo-data.
              </Text>
            </div>
          )}

          {/* Mock Mode Indicator (development) */}
          {isMockMode && import.meta.env.DEV && (
            <div style={{
              padding: 'var(--ds-spacing-3)',
              marginBottom: 'var(--ds-spacing-4)',
              backgroundColor: 'var(--ds-color-info-background-subtle)',
              borderRadius: 'var(--ds-border-radius-md)',
              border: '1px solid var(--ds-color-info-border-subtle)'
            }}>
              <Text size="sm" color="var(--ds-color-info-text-default)">
                Demo-modus: Viser eksempeldata. Legg til VITE_LICENSE_KEY for å koble til API.
              </Text>
            </div>
          )}

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
                  onClick={handleListingClick}
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
                  {...(listing.latitude !== undefined && { latitude: listing.latitude })}
                  {...(listing.longitude !== undefined && { longitude: listing.longitude })}
                  mapboxToken={MAPBOX_TOKEN}
                  showListingType={true}
                  showMap={Boolean(listing.latitude && listing.longitude)}
                  onClick={handleListingClick}
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
              onListingClick={handleListingClick}
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

      {/* Animation styles */}
      <style>{`
        @keyframes filterItemFadeIn {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}

export default ListingsPage;
