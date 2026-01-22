# Discovery UI Components

> Design System Documentation
> Package: `@xala/ds`
> Last Updated: 2026-01-19

This document provides detailed documentation for the discovery UI components.

---

## Overview

The discovery system provides a complete set of components for browsing and filtering rental objects:

```tsx
// Page composition
<Drawer isOpen={isFilterOpen} onClose={closeFilters} position="left">
  <DrawerSection title="Type">...</DrawerSection>
  <DrawerSection title="Area">...</DrawerSection>
</Drawer>

<ContentLayout>
  <RentalObjectToolbar
    viewMode={viewMode}
    onViewModeChange={setViewMode}
    onFilterClick={openFilters}
  />
  
  {viewMode === 'grid' && <RentalObjectGrid>...</RentalObjectGrid>}
  {viewMode === 'list' && <Stack>...</Stack>}
  {viewMode === 'map' && <LazyRentalObjectMap ... />}
  {viewMode === 'table' && <RentalObjectTableView ... />}
</ContentLayout>
```

---

## Components

### RentalObjectCard

Card component for displaying rental objects in grid view.

#### Import

```tsx
import { RentalObjectCard } from '@xala/ds';
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `id` | `string` | - | Unique identifier |
| `name` | `string` | - | Display name |
| `type` | `string` | - | Type label |
| `listingType` | `'SPACE' \| 'RESOURCE' \| ...` | - | Category for badge color |
| `location` | `string` | - | Formatted location |
| `description` | `string` | - | Description excerpt |
| `image` | `string` | - | Primary image URL |
| `facilities` | `string[]` | `[]` | Facility/amenity tags |
| `moreFacilities` | `number` | `0` | Count of hidden facilities |
| `capacity` | `number` | - | Capacity/seats |
| `price` | `number` | - | Price amount |
| `priceUnit` | `string` | `'time'` | Price unit (hour, day, etc.) |
| `currency` | `string` | `'kr'` | Currency symbol |
| `rating` | `number` | - | Average rating (0-5) |
| `reviewCount` | `number` | - | Number of reviews |
| `available` | `boolean` | `true` | Availability status |
| `onClick` | `(id: string) => void` | - | Click handler |
| `onFavorite` | `(id: string) => void` | - | Favorite button handler |
| `onShare` | `(id: string) => void` | - | Share button handler |
| `imageHeight` | `number` | `200` | Image height in pixels |
| `showLocation` | `boolean` | `true` | Show location |
| `showDescription` | `boolean` | `true` | Show description |
| `showFacilities` | `boolean` | `true` | Show facility tags |
| `showCapacity` | `boolean` | `true` | Show capacity |
| `showRating` | `boolean` | `true` | Show rating |
| `showPrice` | `boolean` | `true` | Show price |
| `showFavoriteButton` | `boolean` | `true` | Show favorite button |
| `showShareButton` | `boolean` | `true` | Show share button |
| `maxFacilities` | `number` | `3` | Max visible facility tags |

#### SSR/Hydration Notes

- ✅ **SSR-safe**: Pure render, no client state
- Uses CSS for hover animations (no JS)

#### Accessibility

- Card is focusable and clickable
- Image has empty alt (decorative, name provides meaning)
- Buttons have aria-labels
- Focus visible on all interactive elements

#### Example

```tsx
<RentalObjectCard
  id="venue-123"
  name="Oslo Conference Center"
  type="Lokale"
  listingType="SPACE"
  location="Oslo, Norway"
  description="Modern conference facilities..."
  image="/images/venue.jpg"
  facilities={["WiFi", "Projector", "Catering"]}
  moreFacilities={3}
  capacity={100}
  price={500}
  priceUnit="time"
  currency="kr"
  imageHeight={260}
  onClick={(id) => navigate(`/rental-object/${id}`)}
  data-testid="rental-object-card"
/>
```

---

### RentalObjectListItem

Horizontal list item component for list view.

#### Import

```tsx
import { RentalObjectListItem } from '@xala/ds';
```

#### Props

Same as `RentalObjectCard` plus:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `latitude` | `number` | - | Latitude for static map |
| `longitude` | `number` | - | Longitude for static map |
| `mapboxToken` | `string` | - | Mapbox API token |
| `showMap` | `boolean` | `true` | Show static map preview |

#### SSR/Hydration Notes

- ✅ **SSR-safe**: Static map is an image URL
- Map image loads after initial render

#### Example

```tsx
<RentalObjectListItem
  id="venue-123"
  name="Oslo Conference Center"
  location="Oslo, Norway"
  latitude={59.9139}
  longitude={10.7522}
  mapboxToken={MAPBOX_TOKEN}
  showMap={true}
  onClick={(id) => navigate(`/rental-object/${id}`)}
  data-testid="rental-object-list-item"
/>
```

---

### RentalObjectGrid

Responsive grid layout for rental object cards.

#### Import

```tsx
import { RentalObjectGrid } from '@xala/ds';
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | - | Card components |
| `minCardWidth` | `number` | `300` | Minimum card width in pixels |
| `maxColumns` | `number` | `4` | Maximum columns |
| `gap` | `string` | `'var(--ds-spacing-6)'` | Gap between cards |

#### Example

```tsx
<RentalObjectGrid minCardWidth={450} maxColumns={3}>
  {listings.map(listing => (
    <RentalObjectCard key={listing.id} {...listing} />
  ))}
</RentalObjectGrid>
```

---

### RentalObjectTableView

Accessible table view with sorting.

#### Import

```tsx
import { RentalObjectTableView } from '@xala/ds';
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `rentalObjects` | `MapRentalObject[]` | - | Data array |
| `onRentalObjectClick` | `(id, slug?) => void` | - | Row click handler |
| `height` | `string \| number` | `'600px'` | Container height |
| `className` | `string` | - | Additional classes |

#### Columns

- **Name** (sortable)
- **Location** (sortable)
- **Capacity** (sortable)
- **Price** (sortable)

#### SSR/Hydration Notes

- ✅ **SSR-safe**: Pure table HTML
- Sort state is client-only (doesn't break hydration)

#### Accessibility

- Uses `<table>` with proper `<thead>`, `<tbody>`
- Sortable headers have `aria-sort`
- Rows are keyboard focusable
- Enter activates row

#### Example

```tsx
<RentalObjectTableView
  rentalObjects={listings.map(l => ({
    id: l.id,
    name: l.name,
    location: l.location,
    capacity: l.capacity,
    price: l.price,
    priceUnit: l.priceUnit,
  }))}
  onRentalObjectClick={(id) => navigate(`/rental-object/${id}`)}
  height="calc(100vh - 250px)"
  data-testid="rental-object-table"
/>
```

---

### RentalObjectToolbar

Toolbar with filter button, count, and view mode switcher.

#### Import

```tsx
import { RentalObjectToolbar, type ViewMode } from '@xala/ds';
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `count` | `number` | - | Total result count |
| `countLabel` | `string` | `'listings'` | Label after count |
| `activeFilterCount` | `number` | `0` | Number of active filters |
| `onFilterClick` | `() => void` | - | Filter button handler |
| `viewMode` | `ViewMode` | `'grid'` | Current view mode |
| `onViewModeChange` | `(mode) => void` | - | View mode change handler |
| `showViewToggle` | `boolean` | `true` | Show view mode buttons |
| `availableViews` | `ViewMode[]` | `['grid', 'list', 'map', 'table']` | Available view modes |
| `className` | `string` | - | Additional classes |

#### ViewMode Type

```tsx
type ViewMode = 'grid' | 'list' | 'map' | 'table';
```

#### SSR/Hydration Notes

- ✅ **SSR-safe**: Pure render
- View state should be URL-synced for SSR parity

#### Accessibility

- View toggles use `ToggleGroup` from Digdir
- Each toggle has tooltip
- Keyboard navigable

#### Example

```tsx
<RentalObjectToolbar
  count={48}
  countLabel="lokaler"
  activeFilterCount={3}
  onFilterClick={() => setIsFilterOpen(true)}
  viewMode={viewMode}
  onViewModeChange={setViewMode}
  availableViews={['grid', 'list', 'map', 'table']}
  data-testid="discovery-toolbar"
/>
```

---

### RentalObjectMap

Interactive Mapbox map with clustered pins.

#### Import

```tsx
// Direct import (includes ~500KB mapbox-gl)
import { RentalObjectMap } from '@xala/ds/maps';

// Or via lazy loading (recommended)
const RentalObjectMap = React.lazy(() =>
  import('@xala/ds/maps').then(m => ({ default: m.RentalObjectMap }))
);
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `rentalObjects` | `MapRentalObject[]` | - | Objects with coordinates |
| `mapboxToken` | `string` | - | Mapbox API token |
| `height` | `string \| number` | `'100%'` | Map height |
| `center` | `[number, number]` | Auto | Initial center [lng, lat] |
| `zoom` | `number` | Auto | Initial zoom level |
| `onRentalObjectClick` | `(id, slug?) => void` | - | Pin/popup click handler |
| `selectedId` | `string` | - | Currently selected ID |

#### MapRentalObject Type

```tsx
interface MapRentalObject {
  id: string;
  name: string;
  slug?: string;
  location: string;
  latitude: number;
  longitude: number;
  image?: string;
  type?: string;
  price?: number;
  priceUnit?: string;
  capacity?: number;
  available?: boolean;
}
```

#### SSR/Hydration Notes

- ⚠️ **Not SSR-safe**: Must be lazy-loaded
- Server should render a placeholder/skeleton
- Client hydrates map after mount

**Safe pattern:**
```tsx
// In component file
const LazyMap = React.lazy(() =>
  import('@xala/ds/maps').then(m => ({ default: m.RentalObjectMap }))
);

function MapLoadingFallback() {
  return (
    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Spinner size="lg" />
      <Text>Laster kart...</Text>
    </div>
  );
}

// In render
<Suspense fallback={<MapLoadingFallback />}>
  <LazyMap rentalObjects={data} mapboxToken={token} />
</Suspense>
```

#### Accessibility

- **Non-map fallback**: Table view serves as accessible alternative
- Map pins are not keyboard accessible (by design - use table for keyboard users)
- Popup content is readable

---

### Drawer

Sliding panel for filter drawer.

#### Import

```tsx
import { Drawer, DrawerSection, DrawerItem } from '@xala/ds';
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isOpen` | `boolean` | - | Open state |
| `onClose` | `() => void` | - | Close handler |
| `title` | `ReactNode` | - | Header title |
| `icon` | `ReactNode` | - | Header icon |
| `position` | `'left' \| 'right' \| 'top' \| 'bottom'` | `'left'` | Slide direction |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl' \| 'full'` | `'md'` | Drawer width/height |
| `closeOnOverlayClick` | `boolean` | `true` | Close on overlay click |
| `closeOnEscape` | `boolean` | `true` | Close on Escape key |
| `footer` | `ReactNode` | - | Footer content |
| `mobilePosition` | `DrawerPosition` | - | Override position on mobile |
| `mobileSize` | `DrawerSize` | - | Override size on mobile |

#### SSR/Hydration Notes

- ✅ **SSR-safe**: Renders nothing when closed
- Uses portal for proper stacking

#### Accessibility

- **Focus trap**: Focus stays within drawer
- **Escape to close**: Keyboard accessible
- **Return focus**: Returns focus to trigger on close
- **ARIA**: `role="dialog"`, `aria-modal="true"`

#### Example

```tsx
<Drawer
  isOpen={isFilterOpen}
  onClose={() => setIsFilterOpen(false)}
  title="Filtrer"
  icon={<FilterIcon />}
  position="left"
  size="sm"
  mobilePosition="bottom"
  mobileSize="lg"
  footer={
    <Button onClick={() => setIsFilterOpen(false)}>
      Vis resultater
    </Button>
  }
  data-testid="filter-drawer"
>
  <DrawerSection title="Type" collapsible>
    <DrawerItem
      left={<Checkbox checked={type === 'ALL'} />}
      right={<Text>(48)</Text>}
      onClick={() => setType('ALL')}
      selected={type === 'ALL'}
    >
      Alle
    </DrawerItem>
  </DrawerSection>
</Drawer>
```

---

## Missing Components (To Be Created)

### FilterChip

Currently inline in `RentalObjectsPage.tsx`. Should be moved to DS.

**Proposed API:**
```tsx
interface FilterChipProps {
  label: string;
  onRemove: () => void;
  variant?: 'default' | 'accent';
  'data-testid'?: string;
}

<FilterChip label="Oslo" onRemove={() => removeArea('oslo')} />
```

### ResultsSkeleton

Loading skeleton for grid/list views.

**Proposed API:**
```tsx
interface ResultsSkeletonProps {
  viewMode: 'grid' | 'list';
  count?: number;
}

<ResultsSkeleton viewMode="grid" count={6} />
```

### ResultsEmptyState

Empty state when no results match filters.

**Proposed API:**
```tsx
interface ResultsEmptyStateProps {
  title?: string;
  description?: string;
  action?: ReactNode;
  variant?: 'no-results' | 'no-data' | 'error';
}

<ResultsEmptyState
  variant="no-results"
  title={t('discovery.empty.title')}
  description={t('discovery.empty.description')}
  action={<Button onClick={clearFilters}>Fjern filtre</Button>}
/>
```

---

## Composition Patterns

### Full Discovery Page

```tsx
function DiscoveryPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({ type: 'ALL', area: 'all' });
  
  const { data, isLoading, error } = useRentalObjects(filters);
  
  const filteredData = useMemo(() => filterData(data, filters), [data, filters]);

  return (
    <>
      {/* Filter Drawer */}
      <Drawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        position="left"
        title="Filtrer"
      >
        <FilterSections filters={filters} onChange={setFilters} />
      </Drawer>

      <ContentLayout>
        {/* Toolbar */}
        <RentalObjectToolbar
          count={filteredData.length}
          countLabel="resultater"
          activeFilterCount={getActiveFilterCount(filters)}
          onFilterClick={() => setIsFilterOpen(true)}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        {/* Loading State */}
        {isLoading && <ResultsSkeleton viewMode={viewMode} count={6} />}

        {/* Error State */}
        {error && <ResultsErrorState error={error} onRetry={refetch} />}

        {/* Empty State */}
        {!isLoading && !error && filteredData.length === 0 && (
          <ResultsEmptyState onClearFilters={() => setFilters({})} />
        )}

        {/* Results */}
        {!isLoading && !error && filteredData.length > 0 && (
          <>
            {viewMode === 'grid' && (
              <RentalObjectGrid>
                {filteredData.map(item => (
                  <RentalObjectCard key={item.id} {...item} />
                ))}
              </RentalObjectGrid>
            )}
            {viewMode === 'list' && (
              <Stack>
                {filteredData.map(item => (
                  <RentalObjectListItem key={item.id} {...item} />
                ))}
              </Stack>
            )}
            {viewMode === 'map' && (
              <Suspense fallback={<MapLoadingFallback />}>
                <LazyRentalObjectMap rentalObjects={filteredData} />
              </Suspense>
            )}
            {viewMode === 'table' && (
              <RentalObjectTableView rentalObjects={filteredData} />
            )}
          </>
        )}
      </ContentLayout>
    </>
  );
}
```

---

## Test IDs Reference

```tsx
// Recommended data-testid values
<RentalObjectToolbar data-testid="discovery-toolbar" />
<Drawer data-testid="filter-drawer" />
<DrawerSection data-testid="filter-section-type" />
<RentalObjectGrid data-testid="results-grid" />
<RentalObjectCard data-testid="rental-object-card-{id}" />
<RentalObjectListItem data-testid="rental-object-list-item-{id}" />
<RentalObjectTableView data-testid="results-table" />
<LazyRentalObjectMap data-testid="results-map" />
```
