/**
 * ListingsPage
 *
 * Main listings page with filters, search, and grid/list/map views.
 * Uses API data from @digilist/client-sdk.
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
import type { SearchResultItem, SearchResultGroup, ViewMode } from '@xala/ds';
import {
  usePublicUiListings,
  usePublicCities,
  LISTING_TYPE_OPTIONS,
  CAPACITY_OPTIONS,
} from '@digilist/client-sdk';
import type { UiListing, ListingType } from '@digilist/client-sdk';
import { useT } from '@xala/i18n';

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

// Extract unique cities/locations from listings
const getUniqueCities = (listingsData: UiListing[]) => {
  const citySet = new Set<string>();
  listingsData.forEach(l => {
    if (l.location) {
      // Extract city from address or use location directly
      const city = l.location.split(',').pop()?.trim() || l.location;
      if (city) citySet.add(city);
    }
  });
  return Array.from(citySet).sort();
};

export function ListingsPage(): React.ReactElement {
  const navigate = useNavigate();
  const t = useT();

  const [searchQuery, setSearchQuery] = React.useState('');
  const [searchResults, setSearchResults] = React.useState<SearchResultGroup[]>([]);
  const [isSearching, setIsSearching] = React.useState(false);

  // Fetch public listings from API
  const { data: listingsResponse, isLoading, error } = usePublicUiListings();

  // Fetch cities for location filter
  const { data: citiesResponse } = usePublicCities();

  // Extract listings from response
  const listings: UiListing[] = React.useMemo(() => {
    return listingsResponse?.data || [];
  }, [listingsResponse]);

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

  // Build location areas from API cities or extract from listings
  const locationAreas = React.useMemo(() => {
    const areas: { id: string; label: string }[] = [{ id: 'all', label: t('listings.allAreas') }];

    if (citiesResponse?.data && citiesResponse.data.length > 0) {
      // Use cities from API
      citiesResponse.data.forEach(city => {
        areas.push({ id: city.slug, label: city.name });
      });
    } else {
      // Fall back to extracting unique cities from listings
      const uniqueCities = getUniqueCities(listings);
      uniqueCities.forEach(city => {
        areas.push({ id: city.toLowerCase().replace(/\s+/g, '-'), label: city });
      });
    }

    return areas;
  }, [citiesResponse, listings, t]);

  // Filter listings by all criteria
  const filteredListings = React.useMemo(() => {
    return listings.filter(l => {
      // Filter by listing type
      if (listingType !== 'ALL' && l.listingType !== listingType) return false;

      // Filter by area/location
      if (selectedArea !== 'all') {
        const locationLower = l.location.toLowerCase();
        const areaLower = selectedArea.replace(/-/g, ' ');
        // Check if location contains the selected area
        if (!locationLower.includes(areaLower)) return false;
      }

      // Filter by capacity
      if (selectedCapacity !== 'all') {
        const capacityOption = CAPACITY_OPTIONS.find(c => c.id === selectedCapacity);
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

  // Search function - filters listings by name, location, description
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);

    if (!value.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);

    // Search through listings
    const query = value.toLowerCase();
    const matchingListings = listings.filter(listing =>
      listing.name.toLowerCase().includes(query) ||
      listing.location.toLowerCase().includes(query) ||
      listing.description.toLowerCase().includes(query) ||
      listing.type.toLowerCase().includes(query)
    );

    // Format as search result groups
    const results: SearchResultGroup[] = matchingListings.length > 0
      ? [{
          id: 'listings',
          label: t('nav.listings'),
          items: matchingListings.slice(0, 5).map(listing => ({
            id: listing.id,
            label: listing.name,
            description: listing.location,
            meta: listing.type,
          })),
        }]
      : [];

    setSearchResults(results);
    setIsSearching(false);
  };

  const handleSearch = (value: string) => {
    console.log('Searching for:', value);
  };

  const handleResultSelect = (result: SearchResultItem) => {
    // Navigate to the selected listing
    const listing = listings.find(l => l.id === result.id);
    if (listing) {
      navigate(`/listing/${listing.slug || listing.id}`);
    }
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleTypeSelect = (typeId: string) => {
    setListingType(typeId as ListingType | 'ALL');
  };

  const handleListingClick = (id: string, slug?: string) => {
    // Use slug if available, otherwise fall back to ID
    navigate(`/listing/${slug || id}`);
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
        title={t('common.filters')}
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
              {t('listings.showingResults', { count: filteredListings.length })}
            </Text>
            <Button
              type="button"
              variant="primary"
              style={{ width: '100%' }}
              onClick={() => setIsFilterOpen(false)}
            >
              {t('common.viewResults')}
            </Button>
          </Stack>
        }
      >
        <DrawerSection title={t('listings.type')} collapsible>
          <Stack spacing="var(--ds-spacing-1)">
            {(showMoreType ? LISTING_TYPE_OPTIONS : LISTING_TYPE_OPTIONS.slice(0, MAX_VISIBLE_ITEMS)).map((type, index) => (
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
            {LISTING_TYPE_OPTIONS.length > MAX_VISIBLE_ITEMS && (
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
                {showMoreType ? t('common.showLess') : `${t('common.showMore')} (${LISTING_TYPE_OPTIONS.length - MAX_VISIBLE_ITEMS})`}
              </Button>
            )}
          </Stack>
        </DrawerSection>

        <DrawerSection title={t('listings.area')} collapsible defaultCollapsed>
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
                {showMoreArea ? t('common.showLess') : `${t('common.showMore')} (${locationAreas.length - MAX_VISIBLE_ITEMS})`}
              </Button>
            )}
          </Stack>
        </DrawerSection>

        <DrawerSection title={t('listings.capacity')} collapsible defaultCollapsed>
          <Stack spacing="var(--ds-spacing-1)">
            {(showMoreCapacity ? CAPACITY_OPTIONS : CAPACITY_OPTIONS.slice(0, MAX_VISIBLE_ITEMS)).map((cap, index) => (
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
            {CAPACITY_OPTIONS.length > MAX_VISIBLE_ITEMS && (
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
                {showMoreCapacity ? t('common.showLess') : `${t('common.showMore')} (${CAPACITY_OPTIONS.length - MAX_VISIBLE_ITEMS})`}
              </Button>
            )}
          </Stack>
        </DrawerSection>

        <DrawerSection title={t('listings.facilities')} collapsible defaultCollapsed>
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
                {showMoreFacilities ? t('common.showLess') : `${t('common.showMore')} (${allFacilities.length - MAX_VISIBLE_ITEMS})`}
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
              placeholder={t('listings.search')}
              value={searchQuery}
              onSearchChange={handleSearchChange}
              onSearch={handleSearch}
              results={searchResults}
              onResultSelect={handleResultSelect}
              isLoading={isSearching}
            />
          </div>

          {/* Loading State */}
          {isLoading && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: 'var(--ds-spacing-8)',
              color: 'var(--ds-color-neutral-text-subtle)'
            }}>
              <Text size="md">{t('listings.loading')}</Text>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div style={{
              padding: 'var(--ds-spacing-4)',
              marginBottom: 'var(--ds-spacing-4)',
              backgroundColor: 'var(--ds-color-danger-background-subtle)',
              borderRadius: 'var(--ds-border-radius-md)',
              border: '1px solid var(--ds-color-danger-border-subtle)'
            }}>
              <Text size="sm" color="var(--ds-color-danger-text-default)">
                {t('listings.error')}
              </Text>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && listings.length === 0 && (
            <div style={{
              padding: 'var(--ds-spacing-8)',
              textAlign: 'center',
              backgroundColor: 'var(--ds-color-neutral-surface-default)',
              borderRadius: 'var(--ds-border-radius-md)',
              border: '1px solid var(--ds-color-neutral-border-subtle)'
            }}>
              <Text size="md" color="var(--ds-color-neutral-text-subtle)">
                {t('listings.noListings')}
              </Text>
            </div>
          )}

          <ListingToolbar
            count={filteredListings.length}
            countLabel={t('common.results')}
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
                  onClick={(id) => handleListingClick(id, listing.slug)}
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
                  mapboxToken={MAPBOX_TOKEN || ''}
                  showListingType={true}
                  showMap={Boolean(listing.latitude && listing.longitude)}
                  onClick={(id) => handleListingClick(id, listing.slug)}
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
              mapboxToken={MAPBOX_TOKEN || ''}
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
                {t('listings.showMore', { remaining: filteredListings.length - visibleCount })}
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
