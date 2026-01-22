# Rental Object Discovery UI Audit

> Last Updated: 2026-01-19
> App: `apps/web`
> Main Page: `pages/RentalObjectsPage.tsx` (835 lines)

This document audits the public-facing rental object discovery area.

---

## Executive Summary

**Status:** ✅ **Excellent DS component usage**

The discovery page is **well-implemented using DS components**. All view modes (grid, list, map, table) use design system components. Only minor improvements needed.

---

## Route Structure

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | `RentalObjectsPage` | Main discovery page |
| `/rental-objects` | `RentalObjectsPage` | Alias route |
| `/rental-object/:id` | `RentalObjectDetailPage` | Detail page |
| `/listing/:id` | `RentalObjectDetailPage` | Legacy route (redirect) |

---

## Component Inventory

### DS Components Used ✅

| Component | Source | Purpose |
|-----------|--------|---------|
| `RentalObjectCard` | `@xala/ds` | Grid view cards |
| `RentalObjectListItem` | `@xala/ds` | List view items |
| `RentalObjectGrid` | `@xala/ds` | Grid layout |
| `RentalObjectTableView` | `@xala/ds` | Table view |
| `RentalObjectToolbar` | `@xala/ds` | View mode switcher |
| `Drawer` | `@xala/ds` | Filter drawer |
| `DrawerSection` | `@xala/ds` | Filter sections |
| `DrawerItem` | `@xala/ds` | Filter items |
| `Button` | `@xala/ds` | Action buttons |
| `Checkbox` | `@xala/ds` | Filter checkboxes |
| `ContentLayout` | `@xala/ds` | Page layout |
| `HeaderSearch` | `@xala/ds` | Mobile search |
| `Stack` | `@xala/ds` | Layout utility |
| `Text` | `@xala/ds` | Typography |
| `Card` | `@xala/ds` | Skeleton cards |
| `FilterIcon` | `@xala/ds` | Filter button icon |

### App-Local Components

| Component | File | Notes |
|-----------|------|-------|
| `LazyRentalObjectMap` | `components/LazyRentalObjectMap.tsx` | ✅ **SSR-safe** wrapper for DS map |
| `FilterChip` | Inline in page | ⚠️ Should move to DS |
| `RentalObjectSkeleton` | Inline in page | ⚠️ Should move to DS |

### Map Component

**Path:** `apps/web/src/components/LazyRentalObjectMap.tsx`

**SSR Strategy:** ✅ Correctly implemented
```tsx
const RentalObjectMap = React.lazy(() =>
  import('@xala/ds/maps').then((module) => ({
    default: module.RentalObjectMap,
  }))
);

// Uses Suspense with loading fallback
<Suspense fallback={<MapLoadingFallback />}>
  <RentalObjectMap {...props} />
</Suspense>
```

---

## View Modes

### 1. Grid View (Default)

**Component:** `RentalObjectGrid` + `RentalObjectCard`

**Features:**
- Responsive grid (1-3 columns based on viewport)
- Card animations via Framer Motion
- Show more pagination
- Image with gradient overlay
- Location, capacity, price display
- Favorite/Share actions

**Data Props Passed:**
```tsx
<RentalObjectCard
  id, name, type, listingType, location, description, image,
  facilities, moreFacilities, capacity, price, priceUnit, currency,
  rating, reviewCount, imageHeight={260}
  showLocation, showDescription, showFacilities, showCapacity, showPrice
  onClick, onFavorite, onShare
/>
```

### 2. List View

**Component:** `RentalObjectListItem`

**Features:**
- Horizontal layout with image
- Static map preview (when coordinates available)
- Same data as card in list format

### 3. Map View

**Component:** `LazyRentalObjectMap` → `RentalObjectMap`

**Features:**
- Lazy-loaded (SSR-safe)
- Mapbox GL integration
- Clustered pins
- Popup on click
- Full-height viewport

**SSR Behavior:**
- Server: Renders loading skeleton
- Client: Hydrates map after mount
- No hydration mismatch ✅

### 4. Table View

**Component:** `RentalObjectTableView`

**Features:**
- Sortable columns (name, location, capacity, price)
- Row click navigation
- Keyboard accessible
- Horizontal scroll on mobile

---

## Filter System

### Filter Drawer

**Component:** `Drawer` (left position)

**Sections:**
1. **Type** (Category) - Radio-style checkboxes
2. **Area** (Location) - Derived from cities API
3. **Capacity** - Range options (1-5, 6-10, etc.)
4. **Facilities** - Multi-select checkboxes

**Behavior:**
- Desktop: Opens as left panel
- Mobile: Slides from bottom
- Footer shows result count + "Show Results" button

### Filter State

```tsx
const [listingType, setRentalObjectType] = useState<string>('ALL');
const [selectedArea, setSelectedArea] = useState<string>('all');
const [selectedCapacity, setSelectedCapacity] = useState<string>('all');
const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);
```

**Client-side filtering:** Filters are applied client-side after fetching all listings.

**API Params:** Currently fetches all with `{ limit: 100 }` - not server-driven filtering.

### Filter Chips

Applied filters show as removable chips in toolbar (custom `FilterChip` component).

---

## API Integration

### Hooks Used

```tsx
import {
  usePublicRentalObjectsList,
  usePublicCities,
} from '@digilist/client-sdk';

const { data: listingsResponse, isLoading, error } = usePublicRentalObjectsList({ limit: 100 });
const { data: citiesResponse } = usePublicCities();
```

### Real-time Updates

```tsx
import { useRealtimeRentalObject } from '../providers';

useRealtimeRentalObject((event) => {
  queryClient.invalidateQueries({ queryKey: ['public'] });
});
```

---

## State Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         RentalObjectsPage                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   ┌──────────────┐     ┌──────────────────┐     ┌──────────────────┐   │
│   │ API Query    │────▶│ Client Filtering │────▶│ Visible Items    │   │
│   │ (limit=100)  │     │ (5 filter states)│     │ (pagination)     │   │
│   └──────────────┘     └──────────────────┘     └──────────────────┘   │
│                                                                          │
│   ┌──────────────┐                                                       │
│   │ View Mode    │ ─── 'grid' | 'list' | 'map' | 'table'                │
│   └──────────────┘                                                       │
│                                                                          │
│   ┌──────────────┐                                                       │
│   │ Filter Open  │ ─── Controls Drawer visibility                        │
│   └──────────────┘                                                       │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Accessibility Analysis

### Keyboard Navigation

| Element | Tab | Enter | Escape | Arrow |
|---------|-----|-------|--------|-------|
| Filter Button | ✅ | Opens drawer | - | - |
| Filter Drawer | - | - | ✅ Closes | - |
| Checkbox | ✅ | Toggle | - | - |
| View Toggles | ✅ | Switch view | - | - |
| Card | ✅ | Navigate | - | - |
| Table Row | ✅ | Navigate | - | ↑↓ |

### Filter Drawer Accessibility

- ✅ Focus trap implemented
- ✅ Escape to close
- ✅ ARIA attributes present
- ✅ Overlay click to close

### Missing ARIA

| Element | Issue |
|---------|-------|
| Filter chips | Missing `role="listitem"` |
| Applied filters list | Missing `role="list"` |
| Result count | Should be `aria-live="polite"` |

---

## SSR/Hydration Analysis

### ✅ Safe Components

| Component | SSR Behavior |
|-----------|--------------|
| Grid/List/Table | Render fully on server |
| Cards | Static HTML |
| Filter drawer | Client-only open state |

### ⚠️ Hydration Considerations

| Issue | Impact | Mitigation |
|-------|--------|------------|
| Map view | Would break SSR | ✅ Lazy-loaded with Suspense |
| Framer Motion | Animation-only | ✅ Safe (animations client-only) |
| View mode state | Not URL-synced | ⚠️ Could cause URL bookmark issues |

---

## URL State Sync

**Current:** View mode and filters are **NOT synced to URL**.

**Impact:**
- Refreshing page resets view to grid
- Bookmarking filtered results not possible
- Back button doesn't restore filter state

**Recommendation:** Sync to URL query params:
```
/rental-objects?view=list&category=LOKALER_OG_BANER&city=oslo&capacity=11-20
```

---

## Test ID Coverage

| Element | data-testid | Status |
|---------|-------------|--------|
| Filter button | - | ❌ Missing |
| Filter drawer | - | ❌ Missing |
| Filter sections | - | ❌ Missing |
| View toggles | - | ❌ Missing |
| Card | - | ❌ Missing |
| Table row | - | ❌ Missing |
| Search input | - | ❌ Missing |

**Recommendation:** Add `data-testid` to all interactive elements.

---

## Performance Analysis

### Bundle Size

| Component | Size |
|-----------|------|
| Page (RentalObjectsPage) | 36KB |
| Mapbox GL (lazy) | ~500KB |
| Framer Motion | ~30KB |

### Query Performance

- Fetches 100 listings on mount
- Client-side filtering (fast)
- Real-time updates via WebSocket

---

## Duplicates Across Apps

### RentalObjectCard Usage

| App | Uses DS Card |
|-----|-------------|
| `web` | ✅ `@xala/ds` |
| `backoffice` | ✅ Uses different patterns |
| `minside` | ✅ Uses different patterns |

**No duplicates found** - DS card is only used in web app.

---

## Issues Identified

### P0 - Critical
- [ ] Add `data-testid` to all interactive elements
- [ ] Add `aria-live` to result count

### P1 - High Priority
- [ ] Move `FilterChip` to DS
- [ ] Move `RentalObjectSkeleton` to DS
- [ ] Sync view mode to URL

### P2 - Medium Priority
- [ ] Sync filters to URL query params
- [ ] Server-side filtering (API params)
- [ ] Add loading state for filter changes

### P3 - Low Priority
- [ ] Optimize skeleton animation performance
- [ ] Add filter count announcements for screen readers

---

## Files Summary

```
apps/web/src/
├── pages/
│   └── RentalObjectsPage.tsx       # Main discovery page (835 lines)
├── components/
│   └── LazyRentalObjectMap.tsx     # SSR-safe map wrapper (70 lines)
└── providers/
    └── RealtimeProvider.tsx        # Real-time updates

packages/ds/src/
├── blocks/
│   ├── RentalObjectCard.tsx        # Grid cards (680 lines)
│   ├── RentalObjectListItem.tsx    # List items (483 lines)
│   ├── RentalObjectGrid.tsx        # Grid layout
│   ├── RentalObjectTableView.tsx   # Table view (418 lines)
│   ├── RentalObjectToolbar.tsx     # View switcher (116 lines)
│   └── RentalObjectMap.tsx         # Mapbox map
├── composed/
│   └── Drawer.tsx                  # Filter drawer (738 lines)
└── maps/
    └── RentalObjectMap.tsx         # Full map component
```
