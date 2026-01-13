# Filter Strategy for Digilist Platform

**Date:** 2026-01-13  
**Based on:** Listing schema analysis and UX best practices

---

## Executive Summary

Based on the listing schema analysis, we recommend a **two-tier filter system**:

1. **Primary Filter (Top Level)**: Listing Type - The main categorization
2. **Secondary Filters**: Detailed filters for refinement

This approach provides clear hierarchy, reduces cognitive load, and aligns with Norwegian UX patterns.

---

## Recommended Filter Structure

### 🎯 Primary Filter: Listing Type (Top-Level)

**Purpose:** Main categorization filter that appears prominently at the top

**Options:**
- `ALL` - Alle typer (default)
- `SPACE` - Lokaler (meeting rooms, halls, venues)
- `RESOURCE` - Ressurser (equipment, tools, AV gear)
- `EVENT` - Arrangementer (classes, concerts, workshops)
- `SERVICE` - Tjenester (personal trainers, photographers, instructors)
- `VEHICLE` - Kjøretøy (cars, bikes, vans)

**Display:** Button group (recommended) or prominent dropdown

**Rationale:**
- Users typically know what type of listing they're looking for
- Reduces initial result set significantly
- Clear mental model: "I need a space" vs "I need equipment"
- Aligns with schema structure

---

### 🔍 Secondary Filters (Below Primary)

These filters appear after the primary filter and allow refinement:

#### 1. **Venue/Category Type** (Select)
**When to show:** When `SPACE` is selected in primary filter

**Options:**
- Alle kategorier
- Idrettshall
- Møterom
- Svømmebasseng
- Utendørs
- Kulturhus
- Bibliotek
- Park
- Studio
- Workshop

**Type:** Single select dropdown

---

#### 2. **Price Range** (Select or Range Slider)
**When to show:** Always (but options may vary by listing type)

**Options:**
- 0 - 500 kr
- 500 - 1 000 kr
- 1 000 - 2 000 kr
- 2 000 - 5 000 kr
- 5 000+ kr

**Type:** Select dropdown (simple) or Range slider (advanced)

**Note:** Price units vary (`time`, `dag`, `person`, etc.) - consider showing unit context

---

#### 3. **Capacity** (Select)
**When to show:** When `SPACE` or `EVENT` is selected

**Options:**
- 1-10 personer
- 11-25 personer
- 26-50 personer
- 51-100 personer
- 100+ personer

**Type:** Single select dropdown

---

#### 4. **Rating** (Select)
**When to show:** Always

**Options:**
- 4.5+ stjerner
- 4.0+ stjerner
- 3.5+ stjerner
- 3.0+ stjerner

**Type:** Single select dropdown

---

#### 5. **Availability** (Select)
**When to show:** Always

**Options:**
- Tilgjengelig nå
- Ikke tilgjengelig
- Tilgjengelig snart

**Type:** Single select dropdown

**Note:** Consider date/time picker for advanced booking scenarios

---

#### 6. **Facilities/Amenities** (Multi-select)
**When to show:** Always (but options may vary by listing type)

**Common Options:**
- WiFi
- Parkering
- Projektor
- Catering
- Tilgjengelighet (accessibility)
- Aircondition
- Lydanlegg
- Profesjonell belysning

**Type:** Multi-select dropdown or checkbox group

**Display:** Show selected count badge (e.g., "3 valgt")

---

#### 7. **Location/Area** (Select or Search)
**When to show:** When multiple locations exist

**Options:**
- All areas
- Specific neighborhoods/districts
- Proximity search (within X km)

**Type:** Select dropdown or location search

---

## Smart Filter Recommendations

### ✅ DO

1. **Show primary filter prominently** - Use button group for visual clarity
2. **Conditional secondary filters** - Hide irrelevant filters based on primary selection
3. **Show result counts** - Display count next to each filter option when available
4. **Clear active filters** - Visual indication of active filters
5. **Mobile-first** - Stack filters vertically on mobile, horizontal on desktop
6. **Reset option** - Easy way to clear all filters
7. **URL state** - Sync filters with URL query params for sharing/bookmarking

### ❌ DON'T

1. **Don't show all filters at once** - Overwhelming, especially on mobile
2. **Don't hide primary filter** - It's the most important filter
3. **Don't use too many filters** - 5-7 secondary filters max
4. **Don't forget mobile UX** - Filters should be accessible on small screens
5. **Don't ignore performance** - Debounce filter changes, use virtual scrolling for large lists

---

## Implementation Pattern

```tsx
import { FilterBar, mockFilterData, type ListingType } from '@xala/ds';

function ListingPage() {
  const [listingType, setListingType] = useState<ListingType | 'ALL'>('ALL');
  const [venueType, setVenueType] = useState('all');
  const [priceRange, setPriceRange] = useState<string>('');
  const [capacity, setCapacity] = useState<string>('');
  
  // Get filter options based on primary selection
  const venueTypeOptions = listingType === 'SPACE' 
    ? mockFilterData.venueTypes() 
    : [];
  
  const filters = [
    {
      id: 'venueType',
      label: 'Kategori',
      type: 'select' as const,
      options: venueTypeOptions,
      value: venueType,
      onChange: setVenueType,
      isActive: venueType !== 'all',
    },
    {
      id: 'priceRange',
      label: 'Pris',
      type: 'select' as const,
      options: mockFilterData.priceRanges(),
      value: priceRange,
      onChange: setPriceRange,
      isActive: !!priceRange,
    },
    {
      id: 'capacity',
      label: 'Kapasitet',
      type: 'select' as const,
      options: mockFilterData.capacityRanges(),
      value: capacity,
      onChange: setCapacity,
      isActive: !!capacity,
    },
  ].filter(f => f.options && f.options.length > 0); // Only show relevant filters
  
  return (
    <FilterBar
      primaryFilter={{
        value: listingType,
        options: mockFilterData.listingTypes(),
        onChange: setListingType,
        label: 'Type av listing',
      }}
      filters={filters}
      resultsCount={filteredListings.length}
      resultsLabel="lokaler"
      viewMode={viewMode}
      onViewModeChange={setViewMode}
    />
  );
}
```

---

## Filter Priority (Mobile)

On mobile, consider showing filters in this order:

1. **Primary Filter** (always visible)
2. **Search** (if applicable)
3. **Price Range** (most common filter)
4. **Availability** (important for booking)
5. **Other filters** (in drawer/modal)

---

## Accessibility Considerations

- ✅ All filters keyboard accessible
- ✅ Clear labels and help text
- ✅ Screen reader announcements for filter changes
- ✅ Focus management when filters open/close
- ✅ High contrast for active filter states

---

## Performance Considerations

- **Debounce filter changes** - Wait 300ms before applying filters
- **Virtual scrolling** - For long filter option lists
- **Lazy load options** - Load filter options on demand
- **Cache filter results** - Store filtered results in state/memory
- **URL sync** - Use query params, not state for shareable URLs

---

## Future Enhancements

1. **Saved filter presets** - "My favorite filters"
2. **Filter suggestions** - "Others also filtered by..."
3. **Smart defaults** - Remember user's common filter choices
4. **Advanced date/time picker** - For booking availability
5. **Map-based location filter** - Visual location selection
6. **Facility search** - Search within facilities list

---

## Type Safety

All filters are fully typed using TypeScript:

```typescript
import type {
  ListingType,
  VenueType,
  FilterState,
  FilterConfig,
  PriceRangeFilter,
  CapacityRangeFilter,
} from '@xala/ds';
```

Mock data is available for development:

```typescript
import { mockFilterData } from '@xala/ds';

const listingTypes = mockFilterData.listingTypes();
const venueTypes = mockFilterData.venueTypes();
const priceRanges = mockFilterData.priceRanges();
// ... etc
```

---

*This strategy is based on analysis of the listing schema, Norwegian UX patterns, and best practices for filter design in listing/search applications.*
