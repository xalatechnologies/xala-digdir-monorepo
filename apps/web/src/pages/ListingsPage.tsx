/**
 * ListingsPage
 *
 * Clean listings page using only real API data.
 * No mock data fallback - shows proper empty/error states.
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
  ListingTableView,
  Stack,
  Text,
  HeaderSearch,
  Spinner,
} from '@xala/ds';
import type { SearchResultItem, SearchResultGroup, ViewMode } from '@xala/ds';
import {
  usePublicListings,
  usePublicCities,
  type Listing,
  type ListingType,
  type PublicListingParams,
  transformListing,
  geocodeAddress,
  buildAddressString,
  type GeocodeConfig,
} from '@digilist/client-sdk';
import { useQueryClient } from '@tanstack/react-query';
import { useRealtimeListing } from '../providers';

// API tokens from environment
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
const GOOGLE_API_KEY = import.meta.env.VITE_GEOCODING_API_KEY;

// Geocoding configuration - Mapbox for accurate Norwegian address geocoding
const GEOCODE_CONFIG: GeocodeConfig = {
  googleApiKey: GOOGLE_API_KEY,
  mapboxToken: MAPBOX_TOKEN,
  country: 'NO',
  language: 'no',
};

// Listing type options (UI filter types)
// Note: API types SPACE maps to FACILITY, RESOURCE maps to EQUIPMENT
const LISTING_TYPE_OPTIONS = [
  { id: 'ALL', label: 'Alle typer' },
  { id: 'FACILITY', label: 'Lokale' },  // Includes SPACE from API
  { id: 'EQUIPMENT', label: 'Utstyr' },  // Includes RESOURCE from API
  { id: 'SERVICE', label: 'Tjeneste' },
  { id: 'VEHICLE', label: 'Kjøretøy' },
  { id: 'EVENT', label: 'Arrangement' },
  { id: 'OTHER', label: 'Annet' },
];

// Capacity filter options
const CAPACITY_OPTIONS = [
  { id: 'all', label: 'Alle størrelser', min: 0, max: Infinity },
  { id: '1-5', label: '1-5 personer', min: 1, max: 5 },
  { id: '6-10', label: '6-10 personer', min: 6, max: 10 },
  { id: '11-20', label: '11-20 personer', min: 11, max: 20 },
  { id: '21-50', label: '21-50 personer', min: 21, max: 50 },
  { id: '50+', label: '50+ personer', min: 50, max: Infinity },
];

// UI listing type for local use (matches SDK's UiListing)
interface ExtendedUiListing {
  id: string;
  name: string;
  type: string;
  listingType: ListingType;
  location: string;
  description: string;
  facilities: string[];
  moreFacilities: number;
  capacity: number;
  price: number;
  priceUnit: string;
  currency: string;
  rating: number;
  reviewCount: number;
  available: boolean;
  image: string;
  images: string[];
  latitude?: number;
  longitude?: number;
  slug?: string;
}

// Map API listing types to UI filter types
const mapApiTypeToFilterType = (apiType: ListingType): string => {
  const typeMap: Record<ListingType, string> = {
    SPACE: 'FACILITY',      // SPACE maps to FACILITY (Lokale)
    RESOURCE: 'EQUIPMENT',  // RESOURCE maps to EQUIPMENT (Utstyr)
    SERVICE: 'SERVICE',     // SERVICE stays SERVICE (Tjeneste)
    EVENT: 'EVENT',         // EVENT stays EVENT
    VEHICLE: 'VEHICLE',     // VEHICLE stays VEHICLE (Kjøretøy)
    OTHER: 'OTHER',         // OTHER stays OTHER
  };
  return typeMap[apiType] || 'OTHER';
};

// Filter helpers
const getListingTypeCounts = (listings: ExtendedUiListing[]) => {
  const counts: Record<string, number> = { ALL: listings.length };
  listings.forEach(l => {
    // Map API type to filter type for counting
    const filterType = mapApiTypeToFilterType(l.listingType);
    counts[filterType] = (counts[filterType] || 0) + 1;
    // Also count by original API type for backwards compatibility
    counts[l.listingType] = (counts[l.listingType] || 0) + 1;
  });
  return counts;
};

const getAllFacilities = (listings: ExtendedUiListing[]) => {
  const facilitySet = new Set<string>();
  listings.forEach(l => l.facilities?.forEach(f => facilitySet.add(f)));
  return Array.from(facilitySet).sort();
};

const getUniqueCities = (listings: ExtendedUiListing[]) => {
  const citySet = new Set<string>();
  listings.forEach(l => {
    if (l.location) {
      const city = l.location.split(',').pop()?.trim() || l.location;
      if (city) citySet.add(city);
    }
  });
  return Array.from(citySet).sort();
};

export function ListingsPage(): React.ReactElement {
  const navigate = useNavigate();

  // Search state
  const [searchQuery, setSearchQuery] = React.useState('');
  const [searchResults, setSearchResults] = React.useState<SearchResultGroup[]>([]);
  const [isSearching, setIsSearching] = React.useState(false);

  // API query params
  const [queryParams] = React.useState<PublicListingParams>({});

  // Fetch listings from real API
  const { data: listingsResponse, isLoading, error } = usePublicListings(queryParams);

  // Fetch cities for location filter
  const { data: citiesResponse } = usePublicCities();

  // Realtime updates - refetch when listings are created/updated/published
  const queryClient = useQueryClient();
  const handleListingEvent = React.useCallback((event: { type: string; data?: unknown }) => {
    console.log('[ListingsPage] Realtime listing event received:', event);
    // Invalidate all public listings queries to refetch
    queryClient.invalidateQueries({ queryKey: ['public'] });
  }, [queryClient]);
  useRealtimeListing(handleListingEvent);

  // Geocoded coordinates state
  const [geocodedCoords, setGeocodedCoords] = React.useState<Map<string, { lat: number; lng: number }>>(new Map());

  // Transform API listings to UI format using SDK transform
  const listings: ExtendedUiListing[] = React.useMemo(() => {
    if (!listingsResponse?.data) return [];

    return listingsResponse.data.map((listing: Listing) => {
      const transformed = transformListing(listing);

      // Check for geocoded coordinates
      const geocoded = geocodedCoords.get(listing.id);

      // Defensive: ensure location is always a string (handle if backend sends object)
      const locationValue = typeof transformed.location === 'string'
        ? transformed.location
        : 'Ukjent lokasjon';

      // IMPORTANT: Destructure to EXCLUDE API coordinates (they are often incorrect)
      // Only use freshly geocoded coordinates from addresses
      const { latitude: _apiLat, longitude: _apiLng, ...transformedWithoutCoords } = transformed;

      return {
        ...transformedWithoutCoords,
        location: locationValue,
        listingType: listing.type,
        // Only include coordinates from geocoding (NOT from API)
        ...(geocoded && { latitude: geocoded.lat, longitude: geocoded.lng }),
      };
    });
  }, [listingsResponse, geocodedCoords]);

  // Track which listings have been geocoded (ref to avoid re-renders)
  const geocodedIds = React.useRef<Set<string>>(new Set());
  const geocodingInProgress = React.useRef<boolean>(false);

  // Check if we have any geocoding API keys configured
  const hasGeocodingKeys = Boolean(GOOGLE_API_KEY || MAPBOX_TOKEN);

  // Geocode ALL listings based on their addresses
  // ALWAYS geocode from address - do NOT rely on API coordinates (they are often incorrect)
  // Uses Mapbox for accurate Norwegian address geocoding
  React.useEffect(() => {
    if (!listingsResponse?.data || !hasGeocodingKeys || geocodingInProgress.current) return;

    const listingsToGeocode = listingsResponse.data.filter(listing => {
      // Skip if already geocoded in this session
      if (geocodedIds.current.has(listing.id)) return false;
      // Geocode ALL listings regardless of whether API has coordinates
      return true;
    });

    if (listingsToGeocode.length === 0) return;

    // Mark geocoding as in progress to prevent duplicate runs
    geocodingInProgress.current = true;

    // Geocode all listings in batches
    const geocodeAll = async () => {
      const batchSize = GOOGLE_API_KEY ? 5 : 3; // Google allows higher rate limits
      const allResults: Array<{ id: string; coords: { lat: number; lng: number } }> = [];

      for (let i = 0; i < listingsToGeocode.length; i += batchSize) {
        const batch = listingsToGeocode.slice(i, i + batchSize);

        const batchResults = await Promise.all(
          batch.map(async (listing) => {
            // Mark as geocoded immediately to prevent duplicates
            geocodedIds.current.add(listing.id);

            // Build structured address using SDK helper
            const metadata = listing.metadata || {};
            const locationMeta = metadata.location || {};
            const addressObj = metadata.address;
            const isAddressObject = addressObj && typeof addressObj === 'object' && !Array.isArray(addressObj);
            const addressObjTyped = isAddressObject ? addressObj as Record<string, unknown> : null;

            // Debug: log the raw metadata to understand structure
            console.log('[Geocoding] Raw metadata for', listing.name, ':', JSON.stringify(metadata, null, 2));

            // Extract address components with explicit logging
            const street = (addressObjTyped?.street as string) || (locationMeta.address as string) || '';
            const postalCode = (addressObjTyped?.postalCode as string) || (locationMeta.postalCode as string) || (metadata.postalCode as string) || '';
            const city = (addressObjTyped?.city as string) || (locationMeta.city as string) || (metadata.city as string) || '';

            console.log('[Geocoding] Extracted components:', { street, postalCode, city });

            // Build address string from components
            const addressString = buildAddressString({
              street,
              postalCode,
              city,
            });

            // Fallback to display location if no structured address
            const transformed = transformListing(listing);
            const displayLocation = typeof transformed.location === 'string' ? transformed.location : '';

            const addressToGeocode = addressString && addressString !== 'Norway' && addressString.trim() !== ''
              ? addressString
              : (displayLocation && displayLocation !== 'Ukjent lokasjon' ? displayLocation : '');

            // Skip if no valid address
            if (!addressToGeocode || addressToGeocode === 'Ukjent lokasjon' || addressToGeocode === 'Norway') {
              console.log('[Geocoding] Skipped (no valid address):', listing.name);
              return null;
            }

            console.log('[Geocoding] Final address to geocode:', listing.name, '->', addressToGeocode);
            const result = await geocodeAddress(addressToGeocode, GEOCODE_CONFIG);

            if (result) {
              console.log(`[Geocoding] Success (${result.provider}):`, listing.name, result.latitude, result.longitude);
              return { id: listing.id, coords: { lat: result.latitude, lng: result.longitude } };
            } else {
              console.log('[Geocoding] Failed:', listing.name);
              return null;
            }
          })
        );

        // Collect valid results
        batchResults.forEach(r => {
          if (r) allResults.push(r);
        });

        // Small delay between batches to respect rate limits
        if (i + batchSize < listingsToGeocode.length) {
          await new Promise(resolve => setTimeout(resolve, GOOGLE_API_KEY ? 100 : 150));
        }
      }

      // Update state once with all results
      if (allResults.length > 0) {
        setGeocodedCoords(prev => {
          const newMap = new Map(prev);
          allResults.forEach(({ id, coords }) => newMap.set(id, coords));
          return newMap;
        });
      }

      geocodingInProgress.current = false;
    };

    geocodeAll();
  }, [listingsResponse, hasGeocodingKeys]);

  // Filter state
  const [isFilterOpen, setIsFilterOpen] = React.useState(false);
  const [listingType, setListingType] = React.useState<string>('ALL');
  const [viewMode, setViewMode] = React.useState<ViewMode>('grid');
  const [selectedArea, setSelectedArea] = React.useState<string>('all');
  const [selectedCapacity, setSelectedCapacity] = React.useState<string>('all');
  const [selectedFacilities, setSelectedFacilities] = React.useState<string[]>([]);

  // Show more state
  const [showMoreType, setShowMoreType] = React.useState(false);
  const [showMoreArea, setShowMoreArea] = React.useState(false);
  const [showMoreCapacity, setShowMoreCapacity] = React.useState(false);
  const [showMoreFacilities, setShowMoreFacilities] = React.useState(false);
  const MAX_VISIBLE_ITEMS = 4;

  // Derived filter options (cast needed for filter helpers)
  const typeCounts = React.useMemo(() => getListingTypeCounts(listings), [listings]);
  const allFacilities = React.useMemo(() => getAllFacilities(listings), [listings]);

  const locationAreas = React.useMemo(() => {
    const areas: { id: string; label: string }[] = [{ id: 'all', label: 'Alle områder' }];

    if (citiesResponse?.data && citiesResponse.data.length > 0) {
      citiesResponse.data.forEach((city: { slug: string; name: string }) => {
        areas.push({ id: city.slug, label: city.name });
      });
    } else {
      const uniqueCities = getUniqueCities(listings);
      uniqueCities.forEach(city => {
        areas.push({ id: city.toLowerCase().replace(/\s+/g, '-'), label: city });
      });
    }

    return areas;
  }, [citiesResponse, listings]);

  // Filter listings
  const filteredListings = React.useMemo(() => {
    return listings.filter(l => {
      // Map API type to filter type for comparison
      if (listingType !== 'ALL') {
        const filterType = mapApiTypeToFilterType(l.listingType);
        if (filterType !== listingType) return false;
      }

      if (selectedArea !== 'all') {
        const locationLower = l.location.toLowerCase();
        const areaLower = selectedArea.replace(/-/g, ' ');
        if (!locationLower.includes(areaLower)) return false;
      }

      if (selectedCapacity !== 'all') {
        const capacityOption = CAPACITY_OPTIONS.find(c => c.id === selectedCapacity);
        if (capacityOption && (l.capacity < capacityOption.min || l.capacity > capacityOption.max)) return false;
      }

      if (selectedFacilities.length > 0) {
        const listingFacilities = l.facilities || [];
        if (!selectedFacilities.every(f => listingFacilities.includes(f))) return false;
      }

      return true;
    });
  }, [listings, listingType, selectedArea, selectedCapacity, selectedFacilities]);

  // Pagination
  const ITEMS_PER_PAGE = 6;
  const [visibleCount, setVisibleCount] = React.useState(ITEMS_PER_PAGE);
  const visibleListings = filteredListings.slice(0, visibleCount);
  const hasMore = visibleCount < filteredListings.length;

  React.useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [listingType, selectedArea, selectedCapacity, selectedFacilities]);

  // Search handler
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);

    if (!value.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    const query = value.toLowerCase();
    const matchingListings = listings.filter(listing =>
      listing.name.toLowerCase().includes(query) ||
      listing.location.toLowerCase().includes(query) ||
      listing.description.toLowerCase().includes(query)
    );

    const results: SearchResultGroup[] = matchingListings.length > 0
      ? [{
          id: 'listings',
          label: 'Lokaler',
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

  const handleResultSelect = (result: SearchResultItem) => {
    const listing = listings.find(l => l.id === result.id);
    if (listing) {
      navigate(`/listing/${listing.slug || listing.id}`);
    }
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleListingClick = (id: string, slug?: string) => {
    navigate(`/listing/${slug || id}`);
  };

  const activeFilterCount =
    (listingType !== 'ALL' ? 1 : 0) +
    (selectedArea !== 'all' ? 1 : 0) +
    (selectedCapacity !== 'all' ? 1 : 0) +
    selectedFacilities.length;

  return (
    <>
      {/* Filter Drawer */}
      <Drawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        title="Filtrer"
        icon={<FilterIcon size={20} />}
        position="left"
        size="sm"
        mobilePosition="bottom"
        mobileSize="lg"
        footer={
          <Stack spacing="var(--ds-spacing-3)">
            <Text size="sm" color="var(--ds-color-neutral-text-subtle)" style={{ textAlign: 'center' }}>
              Viser {filteredListings.length} resultater
            </Text>
            <Button type="button" variant="primary" style={{ width: '100%' }} onClick={() => setIsFilterOpen(false)}>
              Vis resultater
            </Button>
          </Stack>
        }
      >
        <DrawerSection title="Type" collapsible>
          <Stack spacing="var(--ds-spacing-1)">
            {(showMoreType ? LISTING_TYPE_OPTIONS : LISTING_TYPE_OPTIONS.slice(0, MAX_VISIBLE_ITEMS)).map((type) => (
              <DrawerItem
                key={type.id}
                left={<Checkbox checked={listingType === type.id} onChange={() => setListingType(type.id)} aria-label={type.label} />}
                right={<Text size="sm">({typeCounts[type.id] || 0})</Text>}
                onClick={() => setListingType(type.id)}
                selected={listingType === type.id}
              >
                <Text size="sm" color="var(--ds-color-neutral-text-default)">{type.label}</Text>
              </DrawerItem>
            ))}
            {LISTING_TYPE_OPTIONS.length > MAX_VISIBLE_ITEMS && (
              <Button type="button" variant="tertiary" style={{ marginTop: 'var(--ds-spacing-2)', width: '100%' }} onClick={() => setShowMoreType(!showMoreType)}>
                {showMoreType ? 'Vis mindre' : `Vis mer (${LISTING_TYPE_OPTIONS.length - MAX_VISIBLE_ITEMS})`}
              </Button>
            )}
          </Stack>
        </DrawerSection>

        <DrawerSection title="Område" collapsible defaultCollapsed>
          <Stack spacing="var(--ds-spacing-1)">
            {(showMoreArea ? locationAreas : locationAreas.slice(0, MAX_VISIBLE_ITEMS)).map((area) => (
              <DrawerItem
                key={area.id}
                left={<Checkbox checked={selectedArea === area.id} onChange={() => setSelectedArea(area.id)} aria-label={area.label} />}
                onClick={() => setSelectedArea(area.id)}
                selected={selectedArea === area.id}
              >
                <Text size="sm" color="var(--ds-color-neutral-text-default)">{area.label}</Text>
              </DrawerItem>
            ))}
            {locationAreas.length > MAX_VISIBLE_ITEMS && (
              <Button type="button" variant="tertiary" style={{ marginTop: 'var(--ds-spacing-2)', width: '100%' }} onClick={() => setShowMoreArea(!showMoreArea)}>
                {showMoreArea ? 'Vis mindre' : `Vis mer (${locationAreas.length - MAX_VISIBLE_ITEMS})`}
              </Button>
            )}
          </Stack>
        </DrawerSection>

        <DrawerSection title="Kapasitet" collapsible defaultCollapsed>
          <Stack spacing="var(--ds-spacing-1)">
            {(showMoreCapacity ? CAPACITY_OPTIONS : CAPACITY_OPTIONS.slice(0, MAX_VISIBLE_ITEMS)).map((cap) => (
              <DrawerItem
                key={cap.id}
                left={<Checkbox checked={selectedCapacity === cap.id} onChange={() => setSelectedCapacity(cap.id)} aria-label={cap.label} />}
                onClick={() => setSelectedCapacity(cap.id)}
                selected={selectedCapacity === cap.id}
              >
                <Text size="sm" color="var(--ds-color-neutral-text-default)">{cap.label}</Text>
              </DrawerItem>
            ))}
            {CAPACITY_OPTIONS.length > MAX_VISIBLE_ITEMS && (
              <Button type="button" variant="tertiary" style={{ marginTop: 'var(--ds-spacing-2)', width: '100%' }} onClick={() => setShowMoreCapacity(!showMoreCapacity)}>
                {showMoreCapacity ? 'Vis mindre' : `Vis mer (${CAPACITY_OPTIONS.length - MAX_VISIBLE_ITEMS})`}
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
                    onChange={() => setSelectedFacilities(prev => prev.includes(facility) ? prev.filter(f => f !== facility) : [...prev, facility])}
                    aria-label={facility}
                  />
                }
                onClick={() => setSelectedFacilities(prev => prev.includes(facility) ? prev.filter(f => f !== facility) : [...prev, facility])}
                selected={selectedFacilities.includes(facility)}
              >
                <Text size="sm" color="var(--ds-color-neutral-text-default)">{facility}</Text>
              </DrawerItem>
            ))}
            {allFacilities.length > MAX_VISIBLE_ITEMS && (
              <Button type="button" variant="tertiary" style={{ marginTop: 'var(--ds-spacing-2)', width: '100%' }} onClick={() => setShowMoreFacilities(!showMoreFacilities)}>
                {showMoreFacilities ? 'Vis mindre' : `Vis mer (${allFacilities.length - MAX_VISIBLE_ITEMS})`}
              </Button>
            )}
          </Stack>
        </DrawerSection>
      </Drawer>

      <ContentLayout maxWidth="1440px" className="main-content-layout">
        <main id="main-content" style={{ paddingTop: 'var(--ds-spacing-6)', paddingBottom: 'var(--ds-spacing-6)' }}>
          {/* Search */}
          <div className="mobile-search-wrapper" style={{ marginBottom: 'var(--ds-spacing-4)' }}>
            <HeaderSearch
              placeholder="Søk etter lokaler..."
              value={searchQuery}
              onSearchChange={handleSearchChange}
              onSearch={() => {}}
              results={searchResults}
              onResultSelect={handleResultSelect}
              isLoading={isSearching}
            />
          </div>

          {/* Loading State */}
          {isLoading && (
            <div
              role="status"
              aria-live="polite"
              aria-busy="true"
              style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 'var(--ds-spacing-8)' }}
            >
              <Spinner aria-label="Laster lokaler..." />
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div
              role="alert"
              aria-live="assertive"
              style={{
                padding: 'var(--ds-spacing-6)',
                marginBottom: 'var(--ds-spacing-4)',
                backgroundColor: 'var(--ds-color-danger-surface-default)',
                borderRadius: 'var(--ds-border-radius-md)',
                border: '1px solid var(--ds-color-danger-border-default)',
                textAlign: 'center',
              }}
            >
              <Text size="md" color="var(--ds-color-danger-text-default)">
                Kunne ikke laste lokaler. Prøv igjen senere.
              </Text>
              <Button
                type="button"
                variant="secondary"
                style={{ marginTop: 'var(--ds-spacing-4)' }}
                onClick={() => window.location.reload()}
              >
                Prøv igjen
              </Button>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && listings.length === 0 && (
            <div style={{
              padding: 'var(--ds-spacing-8)',
              textAlign: 'center',
              backgroundColor: 'var(--ds-color-neutral-surface-default)',
              borderRadius: 'var(--ds-border-radius-lg)',
              border: '1px solid var(--ds-color-neutral-border-subtle)',
            }}>
              <Text size="lg" color="var(--ds-color-neutral-text-default)" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
                Ingen lokaler tilgjengelig
              </Text>
              <Text size="md" color="var(--ds-color-neutral-text-subtle)">
                Det er ingen lokaler registrert ennå. Kom tilbake senere.
              </Text>
            </div>
          )}

          {/* Content */}
          {!isLoading && !error && listings.length > 0 && (
            <>
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
                      currency={listing.currency}
                      rating={listing.rating}
                      reviewCount={listing.reviewCount}
                      imageHeight={260}
                      showLocation={true}
                      showDescription={true}
                      showFacilities={true}
                      showCapacity={true}
                      showListingType={false}
                      showRating={true}
                      showPrice={true}
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
                      showMap={true}
                      onClick={(id) => handleListingClick(id, listing.slug)}
                      onFavorite={(id) => console.log('Toggle favorite:', id)}
                    />
                  ))}
                </Stack>
              ) : viewMode === 'map' ? (
                <ListingMap
                  listings={filteredListings
                    .filter(l => l.latitude !== undefined && l.longitude !== undefined)
                    .map(l => ({
                      id: l.id,
                      name: l.name,
                      ...(l.slug && { slug: l.slug }),
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
              ) : (
                <ListingTableView
                  listings={filteredListings.map(l => ({
                    id: l.id,
                    name: l.name,
                    ...(l.slug && { slug: l.slug }),
                    location: l.location,
                    type: l.type,
                    capacity: l.capacity,
                    price: l.price,
                    priceUnit: l.priceUnit,
                  }))}
                  height="calc(100vh - 250px)"
                  onListingClick={handleListingClick}
                />
              )}

              {/* Show more - only for grid/list views */}
              {(viewMode === 'grid' || viewMode === 'list') && hasMore && (
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: 'var(--ds-spacing-8)' }}>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setVisibleCount(prev => prev + ITEMS_PER_PAGE)}
                    style={{ paddingInline: 'var(--ds-spacing-8)' }}
                  >
                    Vis flere ({filteredListings.length - visibleCount} gjenstår)
                  </Button>
                </div>
              )}
            </>
          )}
        </main>
      </ContentLayout>
    </>
  );
}

export default ListingsPage;
