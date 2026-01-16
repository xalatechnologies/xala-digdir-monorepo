/**
 * ListingsPage
 *
 * Clean listings page using projection DTOs from API.
 * No client-side transformation - uses screen-ready data directly.
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
  RentalObjectCard,
  RentalObjectListItem,
  RentalObjectGrid,
  RentalObjectToolbar,
  RentalObjectTableView,
  Stack,
  Text,
  HeaderSearch,
  Spinner,
} from '@xala/ds';
import type { SearchResultItem, SearchResultGroup, ViewMode } from '@xala/ds';
import {
  usePublicRentalObjectsList,
  usePublicCities,
  type ListingCardProjectionDTO,
  type PublicListingParams,
} from '@digilist/client-sdk';
import { useQueryClient } from '@tanstack/react-query';
import { useRealtimeRentalObject } from '../providers';
import { LazyRentalObjectMap } from '../components/LazyRentalObjectMap';
import { useT } from '@xala/i18n';

// API tokens from environment
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

// Direct category label map for reliable display
const CATEGORY_LABELS: Record<string, string> = {
  'LOKALER_OG_BANER': 'Lokaler og baner',
  'UTSTYR_OG_INVENTAR': 'Utstyr og inventar',
  'KJORETOY_OG_TRANSPORT': 'Kjøretøy og transport',
  'OPPLEVELSER_OG_ARRANGEMENT': 'Opplevelser og arrangement',
};

// Category options using V3 4-category model
// Note: Categories can be disabled per tenant via feature flags
const CATEGORY_OPTIONS = [
  { id: 'ALL', key: 'ALL', label: 'Alle typer' },
  { id: 'LOKALER_OG_BANER', key: 'LOKALER_OG_BANER', label: 'Lokaler og baner' },
  { id: 'UTSTYR_OG_INVENTAR', key: 'UTSTYR_OG_INVENTAR', label: 'Utstyr og inventar' },
  { id: 'KJORETOY_OG_TRANSPORT', key: 'KJORETOY_OG_TRANSPORT', label: 'Kjøretøy og transport' },
  { id: 'OPPLEVELSER_OG_ARRANGEMENT', key: 'OPPLEVELSER_OG_ARRANGEMENT', label: 'Opplevelser og arrangement' },
];

// Feature flag check for disabled categories (Skien has KJORETOY_OG_TRANSPORT disabled)
const DISABLED_CATEGORIES = ['KJORETOY_OG_TRANSPORT']; // TODO: fetch from tenant feature flags


// Capacity filter options (i18n keys)
const CAPACITY_OPTIONS = [
  { id: 'all', labelKey: 'listings.filter.capacity.all', min: 0, max: Infinity },
  { id: '1-5', labelKey: 'listings.filter.capacity.1-5', min: 1, max: 5 },
  { id: '6-10', labelKey: 'listings.filter.capacity.6-10', min: 6, max: 10 },
  { id: '11-20', labelKey: 'listings.filter.capacity.11-20', min: 11, max: 20 },
  { id: '21-50', labelKey: 'listings.filter.capacity.21-50', min: 21, max: 50 },
  { id: '50+', labelKey: 'listings.filter.capacity.50+', min: 50, max: Infinity },
];

// Filter helpers using projection DTO directly (no transformation needed)

// Get rental object category counts for filter badges (uses V3 category_key field)
const getCategoryCounts = (listings: ListingCardProjectionDTO[]) => {
  const counts: Record<string, number> = { ALL: listings.length };
  listings.forEach(l => {
    // Use category field which maps to category_key from DB
    const category = (l as any).category || (l as any).categoryKey;
    if (category) {
      counts[category] = (counts[category] || 0) + 1;
    }
  });
  return counts;
};

// Get all unique amenities for filter options
const getAllAmenities = (listings: ListingCardProjectionDTO[]) => {
  const amenitySet = new Set<string>();
  listings.forEach(l => l.amenities?.forEach((a: string) => amenitySet.add(a)));
  return Array.from(amenitySet).sort();
};

// Get unique cities for location filter
const getUniqueCities = (listings: ListingCardProjectionDTO[]) => {
  const citySet = new Set<string>();
  listings.forEach(l => {
    if (l.city && l.city !== 'Ukjent') citySet.add(l.city);
  });
  return Array.from(citySet).sort();
};

export function RentalObjectsPage(): React.ReactElement {
  const t = useT();
  const navigate = useNavigate();

  // Search state
  const [searchQuery, setSearchQuery] = React.useState('');
  const [searchResults, setSearchResults] = React.useState<SearchResultGroup[]>([]);
  const [isSearching, setIsSearching] = React.useState(false);

  // API query params - load all listings at once for client-side filtering
  const [queryParams] = React.useState<PublicListingParams>({ limit: 100 });

  // Fetch listings from real API - returns ListingCardProjectionDTO[] directly
  const { data: listingsResponse, isLoading, error } = usePublicRentalObjectsList(queryParams);

  // Fetch cities for location filter
  const { data: citiesResponse } = usePublicCities();

  // Realtime updates - refetch when listings are created/updated/published
  const queryClient = useQueryClient();
  const handleRentalObjectEvent = React.useCallback((_event: { type: string; data?: unknown }) => {
    // Invalidate all public listings queries to refetch
    queryClient.invalidateQueries({ queryKey: ['public'] });
  }, [queryClient]);
  useRealtimeRentalObject(handleRentalObjectEvent);

  // Listings from API - already in screen-ready projection DTO format
  const listings = React.useMemo(() => {
    if (!listingsResponse?.data) return [] as ListingCardProjectionDTO[];
    return listingsResponse.data;
  }, [listingsResponse]);


  // Filter state
  const [isFilterOpen, setIsFilterOpen] = React.useState(false);
  const [listingType, setRentalObjectType] = React.useState<string>('ALL');
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

  // Derived filter options (using projection DTO fields)
  const typeCounts = React.useMemo(() => getCategoryCounts(listings), [listings]);
  const allFacilities = React.useMemo(() => getAllAmenities(listings), [listings]);

  const locationAreas = React.useMemo(() => {
    const areas: { id: string; label: string }[] = [{ id: 'all', label: t('alle.områder') }];

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

  // Filter listings using projection DTO fields
  const filteredListings = React.useMemo(() => {
    return listings.filter(l => {
      // Filter by type using DTO's type field directly
      if (listingType !== 'ALL' && l.type !== listingType) return false;

      // Filter by area using DTO's city field
      if (selectedArea !== 'all') {
        const cityLower = l.city.toLowerCase().replace(/\s+/g, '-');
        if (cityLower !== selectedArea) return false;
      }

      // Filter by capacity
      if (selectedCapacity !== 'all') {
        const capacityOption = CAPACITY_OPTIONS.find(c => c.id === selectedCapacity);
        if (capacityOption && (l.capacity < capacityOption.min || l.capacity > capacityOption.max)) return false;
      }

      // Filter by amenities (renamed from facilities)
      if (selectedFacilities.length > 0) {
        const listingAmenities = l.amenities || [];
        if (!selectedFacilities.every(f => listingAmenities.includes(f))) return false;
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
      listing.locationFormatted.toLowerCase().includes(query) ||
      listing.city.toLowerCase().includes(query)
    );

    const results: SearchResultGroup[] = matchingListings.length > 0
      ? [{
          id: 'listings',
          label: t('lokaler'),
          items: matchingListings.slice(0, 5).map(listing => ({
            id: listing.id,
            label: listing.name,
            description: listing.locationFormatted,
            meta: listing.typeLabel,
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
        title={t('filtrer')}
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
        <DrawerSection title={t('type')} collapsible>
          <Stack spacing="var(--ds-spacing-1)">
            {(showMoreType ? CATEGORY_OPTIONS.filter(c => !DISABLED_CATEGORIES.includes(c.id)) : CATEGORY_OPTIONS.filter(c => !DISABLED_CATEGORIES.includes(c.id)).slice(0, MAX_VISIBLE_ITEMS)).map((cat) => (
              <DrawerItem
                key={cat.id}
                left={<Checkbox checked={listingType === cat.id} onChange={() => setRentalObjectType(cat.id)} aria-label={cat.label} />}
                right={<Text size="sm">({typeCounts[cat.id] || 0})</Text>}
                onClick={() => setRentalObjectType(cat.id)}
                selected={listingType === cat.id}
              >
                <Text size="sm" color="var(--ds-color-neutral-text-default)">{cat.label}</Text>
              </DrawerItem>
            ))}
            {CATEGORY_OPTIONS.filter(c => !DISABLED_CATEGORIES.includes(c.id)).length > MAX_VISIBLE_ITEMS && (
              <Button type="button" variant="tertiary" style={{ marginTop: 'var(--ds-spacing-2)', width: '100%' }} onClick={() => setShowMoreType(!showMoreType)}>
                {showMoreType ? t('common.showLess') : `${t('common.showMore')} (${CATEGORY_OPTIONS.filter(c => !DISABLED_CATEGORIES.includes(c.id)).length - MAX_VISIBLE_ITEMS})`}
              </Button>
            )}
          </Stack>
        </DrawerSection>

        <DrawerSection title={t('område')} collapsible defaultCollapsed>
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
                {showMoreArea ? t('common.showLess') : `${t('common.showMore')} (${locationAreas.length - MAX_VISIBLE_ITEMS})`}
              </Button>
            )}
          </Stack>
        </DrawerSection>

        <DrawerSection title={t('kapasitet')} collapsible defaultCollapsed>
          <Stack spacing="var(--ds-spacing-1)">
            {(showMoreCapacity ? CAPACITY_OPTIONS : CAPACITY_OPTIONS.slice(0, MAX_VISIBLE_ITEMS)).map((cap) => (
              <DrawerItem
                key={cap.id}
                left={<Checkbox checked={selectedCapacity === cap.id} onChange={() => setSelectedCapacity(cap.id)} aria-label={t(cap.labelKey)} />}
                onClick={() => setSelectedCapacity(cap.id)}
                selected={selectedCapacity === cap.id}
              >
                <Text size="sm" color="var(--ds-color-neutral-text-default)">{t(cap.labelKey)}</Text>
              </DrawerItem>
            ))}
            {CAPACITY_OPTIONS.length > MAX_VISIBLE_ITEMS && (
              <Button type="button" variant="tertiary" style={{ marginTop: 'var(--ds-spacing-2)', width: '100%' }} onClick={() => setShowMoreCapacity(!showMoreCapacity)}>
                {showMoreCapacity ? t('common.showLess') : `${t('common.showMore')} (${CAPACITY_OPTIONS.length - MAX_VISIBLE_ITEMS})`}
              </Button>
            )}
          </Stack>
        </DrawerSection>

        <DrawerSection title={t('fasiliteter')} collapsible defaultCollapsed>
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
              placeholder={t('søk.etter.lokaler')}
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
              <Spinner aria-label={t('laster.lokaler')} />
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
              <RentalObjectToolbar
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
                <RentalObjectGrid minCardWidth={380} maxColumns={3}>
                  {visibleListings.map((listing) => (
                    <RentalObjectCard
                      key={listing.id}
                      id={listing.id}
                      name={listing.name}
                      type={CATEGORY_LABELS[listing.categoryKey] || listing.categoryKey || 'Lokale'}
                      listingType={listing.categoryKey as 'SPACE' | 'RESOURCE' | 'SERVICE' | 'VEHICLE' | 'EVENT' | 'OTHER'}
                      location={listing.locationFormatted}
                      description={listing.descriptionExcerpt || ''}
                      image={listing.primaryImageUrl}
                      facilities={listing.amenities?.map((key: string) => t(key) || key)}
                      moreFacilities={listing.moreAmenitiesCount}
                      capacity={listing.capacity}
                      price={listing.priceAmount}
                      priceUnit={listing.priceUnit}
                      currency={listing.priceCurrency}
                      rating={listing.averageRating}
                      reviewCount={listing.reviewCount}
                      imageHeight={260}
                      showLocation={true}
                      showDescription={true}
                      showFacilities={true}
                      showCapacity={true}
                      showRating={false}
                      showPrice={true}
                      onClick={(id) => handleListingClick(id, listing.slug)}
                      onFavorite={(_id) => { /* TODO: Implement favorite toggle */ }}
                      onShare={(_id) => { /* TODO: Implement share */ }}
                    />
                  ))}
                </RentalObjectGrid>
              ) : viewMode === 'list' ? (
                <Stack spacing="var(--ds-spacing-4)">
                  {visibleListings.map((listing) => (
                    <RentalObjectListItem
                      key={listing.id}
                      id={listing.id}
                      name={listing.name}
                      type={CATEGORY_LABELS[listing.categoryKey] || listing.categoryKey || 'Lokale'}
                      listingType={listing.categoryKey as 'SPACE' | 'RESOURCE' | 'SERVICE' | 'VEHICLE' | 'EVENT' | 'OTHER'}
                      location={listing.locationFormatted}
                      description={listing.descriptionExcerpt || ''}
                      image={listing.primaryImageUrl}
                      facilities={listing.amenities?.map((key: string) => t(key) || key)}
                      moreFacilities={listing.moreAmenitiesCount}
                      capacity={listing.capacity}
                      price={listing.priceAmount}
                      priceUnit={listing.priceUnit}
                      currency={listing.priceCurrency}
                      {...(listing.latitude != null && { latitude: listing.latitude })}
                      {...(listing.longitude != null && { longitude: listing.longitude })}
                      mapboxToken={MAPBOX_TOKEN || ''}
                      showMap={true}
                      showPrice={true}
                      onClick={(id) => handleListingClick(id, listing.slug)}
                      onFavorite={(_id) => { /* TODO: Implement favorite toggle */ }}
                      onShare={(_id) => { 
                        navigator.share?.({ 
                          title: listing.name, 
                          url: `${window.location.origin}/listings/${listing.slug}` 
                        }).catch(() => {});
                      }}
                    />
                  ))}
                </Stack>
              ) : viewMode === 'map' ? (
                <LazyRentalObjectMap
                  rentalObjects={filteredListings
                    .filter(l => l.latitude != null && l.longitude != null)
                    .map(l => ({
                      id: l.id,
                      name: l.name,
                      ...(l.slug && { slug: l.slug }),
                      location: l.locationFormatted,
                      image: l.primaryImageUrl,
                      latitude: l.latitude!,
                      longitude: l.longitude!,
                      type: l.type,
                      listingType: l.type,
                      description: l.descriptionExcerpt || '',
                      capacity: l.capacity,
                      price: l.priceAmount,
                      priceUnit: l.priceUnit,
                      facilities: l.amenities,
                      available: l.isAvailable,
                    }))}
                  mapboxToken={MAPBOX_TOKEN || ''}
                  height="calc(100vh - 250px)"
                  onRentalObjectClick={handleListingClick}
                  onFavorite={(_id) => { /* TODO: Implement favorite toggle */ }}
                  onShare={(id, slug) => {
                    const listing = filteredListings.find(l => l.id === id);
                    navigator.share?.({
                      title: listing?.name || 'Digilist',
                      url: `${window.location.origin}/listings/${slug || id}`
                    }).catch(() => {});
                  }}
                />
              ) : (
                <RentalObjectTableView
                  rentalObjects={filteredListings.map(l => ({
                    id: l.id,
                    name: l.name,
                    ...(l.slug && { slug: l.slug }),
                    location: l.locationFormatted,
                    latitude: l.latitude ?? 0,
                    longitude: l.longitude ?? 0,
                    type: l.type,
                    capacity: l.capacity,
                    price: l.priceAmount,
                    priceUnit: l.priceUnit,
                  }))}
                  height="calc(100vh - 250px)"
                  onRentalObjectClick={handleListingClick}
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

export default RentalObjectsPage;
