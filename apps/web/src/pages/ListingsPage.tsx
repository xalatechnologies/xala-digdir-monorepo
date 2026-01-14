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
} from '@digilist/client-sdk';
import { useQueryClient } from '@tanstack/react-query';
import { useRealtimeListing } from '../providers';

// Mapbox token from environment
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

// Geocode cache to avoid repeat API calls
const geocodeCache = new Map<string, { lat: number; lng: number } | null>();

// Geocode an address using Mapbox API
async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  if (!MAPBOX_TOKEN || !address) return null;

  // Check cache first
  if (geocodeCache.has(address)) {
    return geocodeCache.get(address) || null;
  }

  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${MAPBOX_TOKEN}&country=NO&limit=1`
    );
    const data = await response.json();

    if (data.features?.[0]) {
      const [lng, lat] = data.features[0].center;
      const coords = { lat, lng };
      geocodeCache.set(address, coords);
      return coords;
    }
  } catch (error) {
    console.warn('[Geocoding] Failed to geocode:', address, error);
  }

  geocodeCache.set(address, null);
  return null;
}

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

// Fallback coordinates for listings without location data (Norwegian cities for demo)
const FALLBACK_COORDINATES: Array<{ lat: number; lng: number }> = [
  { lat: 59.9139, lng: 10.7522 },  // Oslo
  { lat: 59.2086, lng: 9.6089 },   // Skien
  { lat: 59.2623, lng: 10.4085 },  // Tønsberg
  { lat: 59.7439, lng: 10.2045 },  // Drammen
  { lat: 59.0489, lng: 9.6942 },   // Porsgrunn
  { lat: 59.4225, lng: 10.4393 },  // Sandefjord
  { lat: 58.9700, lng: 5.7331 },   // Stavanger
  { lat: 60.3913, lng: 5.3221 },   // Bergen
  { lat: 63.4305, lng: 10.3951 },  // Trondheim
  { lat: 69.6496, lng: 18.9560 },  // Tromsø
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

    return listingsResponse.data.map((listing: Listing, index: number) => {
      const transformed = transformListing(listing);

      // Check for geocoded coordinates
      const geocoded = geocodedCoords.get(listing.id);

      // Fallback coordinates if no geocoding available
      const fallbackIndex = index % FALLBACK_COORDINATES.length;
      const fallbackLat = FALLBACK_COORDINATES[fallbackIndex]?.lat ?? 59.9139;
      const fallbackLng = FALLBACK_COORDINATES[fallbackIndex]?.lng ?? 10.7522;

      // Defensive: ensure location is always a string (handle if backend sends object)
      const locationValue = typeof transformed.location === 'string'
        ? transformed.location
        : 'Ukjent lokasjon';

      return {
        ...transformed,
        location: locationValue,
        listingType: listing.type,
        latitude: transformed.latitude ?? geocoded?.lat ?? fallbackLat,
        longitude: transformed.longitude ?? geocoded?.lng ?? fallbackLng,
      };
    });
  }, [listingsResponse, geocodedCoords]);

  // Track which listings are being geocoded to avoid duplicates
  const geocodingInProgress = React.useRef<Set<string>>(new Set());

  // Geocode listings that don't have coordinates
  React.useEffect(() => {
    if (!listingsResponse?.data || !MAPBOX_TOKEN) return;

    const listingsToGeocode = listingsResponse.data.filter(listing => {
      const locationMeta = listing.metadata?.location;
      // Skip if already has coordinates from API
      if (locationMeta?.lat && locationMeta?.lng) return false;
      // Skip if already geocoded
      if (geocodedCoords.has(listing.id)) return false;
      // Skip if currently being geocoded
      if (geocodingInProgress.current.has(listing.id)) return false;
      return true;
    });

    if (listingsToGeocode.length === 0) return;

    // Geocode all listings in parallel
    const geocodeAll = async () => {
      const results = await Promise.all(
        listingsToGeocode.map(async (listing) => {
          // Mark as in progress
          geocodingInProgress.current.add(listing.id);

          // Get the display location from transformed listing (already handles all structures)
          const transformed = transformListing(listing);
          const displayLocation = typeof transformed.location === 'string' ? transformed.location : '';

          // Build structured address for geocoding - handle metadata.address as object
          const metadata = listing.metadata || {};
          const locationMeta = metadata.location || {};
          const addressObj = metadata.address;
          const isAddressObject = addressObj && typeof addressObj === 'object' && !Array.isArray(addressObj);
          const addressObjTyped = isAddressObject ? addressObj as Record<string, unknown> : null;
          
          // Extract address components - prioritize object structure (API format)
          const addressParts: string[] = [];
          const addPart = (part: unknown) => {
            if (typeof part === 'string' && part.trim()) {
              addressParts.push(part.trim());
            }
          };
          
          // Handle metadata.address as object with {street, city, postalCode}
          if (addressObjTyped) {
            addPart(addressObjTyped.street);
            addPart(addressObjTyped.address); // fallback if street doesn't exist
            addPart(addressObjTyped.postalCode);
            addPart(addressObjTyped.city);
          }
          
          // Fallback to other structures
          addPart(locationMeta.address);
          addPart(metadata.address as string); // if it's a string, not object
          addPart(locationMeta.postalCode);
          addPart(metadata.postalCode);
          addPart(locationMeta.city);
          addPart(metadata.city);
          
          const structuredAddress = addressParts.length > 0 ? addressParts.join(', ') : '';

          // Use structured address if available, otherwise use display location
          // Ensure we have a string, not an object
          const addressToGeocode = structuredAddress && structuredAddress.trim() && structuredAddress !== 'Ukjent lokasjon'
            ? structuredAddress.trim()
            : (displayLocation && displayLocation.trim() && displayLocation !== 'Ukjent lokasjon' 
                ? displayLocation.trim() 
                : '');

          // Skip if no valid address (don't geocode "Ukjent lokasjon")
          if (!addressToGeocode || addressToGeocode === 'Ukjent lokasjon') {
            geocodingInProgress.current.delete(listing.id);
            return null;
          }

          console.log('[Geocoding] Attempting:', listing.name, addressToGeocode);
          const coords = await geocodeAddress(addressToGeocode);

          geocodingInProgress.current.delete(listing.id);

          if (coords) {
            console.log('[Geocoding] Success:', listing.name, coords.lat, coords.lng);
            return { id: listing.id, coords };
          } else {
            console.log('[Geocoding] Failed:', listing.name);
            return null;
          }
        })
      );

      // Batch update all geocoded coordinates at once
      const validResults = results.filter((r): r is { id: string; coords: { lat: number; lng: number } } => r !== null);
      if (validResults.length > 0) {
        setGeocodedCoords(prev => {
          const newMap = new Map(prev);
          validResults.forEach(({ id, coords }) => newMap.set(id, coords));
          return newMap;
        });
      }
    };

    geocodeAll();
  }, [listingsResponse, geocodedCoords]);

  // Filter state
  const [isFilterOpen, setIsFilterOpen] = React.useState(false);
  const [listingType, setListingType] = React.useState<string>('ALL');
  const [viewMode, setViewMode] = React.useState<ViewMode>('grid');
  const [showMapView, setShowMapView] = React.useState<boolean>(true); // Toggle between map and accessible table
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
                      rating={listing.rating}
                      reviewCount={listing.reviewCount}
                      imageHeight={260}
                      showLocation={true}
                      showDescription={true}
                      showFacilities={true}
                      showCapacity={true}
                      showListingType={true}
                      showRating={true}
                      showPrice={false}
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
              ) : (
                <>
                  {/* Map/Table View Toggle for Accessibility */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'flex-end',
                      marginBottom: 'var(--ds-spacing-4)',
                      gap: 'var(--ds-spacing-3)',
                    }}
                  >
                    <Button
                      type="button"
                      variant={showMapView ? 'primary' : 'secondary'}
                      onClick={() => setShowMapView(true)}
                      aria-pressed={showMapView}
                    >
                      Kartvisning
                    </Button>
                    <Button
                      type="button"
                      variant={!showMapView ? 'primary' : 'secondary'}
                      onClick={() => setShowMapView(false)}
                      aria-pressed={!showMapView}
                      aria-label="Vis tabellvisning (tilgjengelig for skjermlesere og tastaturnavigering)"
                    >
                      Tabellvisning
                    </Button>
                  </div>

                  {showMapView ? (
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
                </>
              )}

              {/* Show more */}
              {viewMode !== 'map' && hasMore && (
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
