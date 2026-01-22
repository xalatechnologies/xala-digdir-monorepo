# Rental Object Discovery View Matrix

> Last Updated: 2026-01-19

This document maps what data is displayed in each view mode.

---

## View Mode Comparison

### Data Fields by View

| Field | Grid | List | Map | Table |
|-------|------|------|-----|-------|
| **Name** | ✅ Heading | ✅ Heading | ✅ Popup | ✅ Column |
| **Image** | ✅ 260px | ✅ Thumbnail | ❌ | ❌ |
| **Type Badge** | ✅ | ✅ | ✅ Popup | ❌ |
| **Location** | ✅ | ✅ | ✅ Popup | ✅ Column |
| **Description** | ✅ Excerpt | ✅ Excerpt | ❌ | ❌ |
| **Facilities** | ✅ Tags (3 max) | ✅ Tags (4 max) | ❌ | ❌ |
| **More Facilities** | ✅ "+N" | ✅ "+N" | ❌ | ❌ |
| **Capacity** | ✅ Icon + text | ✅ Icon + text | ❌ | ✅ Column |
| **Price** | ✅ | ✅ | ✅ Popup | ✅ Column |
| **Rating** | ⚠️ Hidden | ❌ | ❌ | ❌ |
| **Review Count** | ⚠️ Hidden | ❌ | ❌ | ❌ |
| **Available** | ✅ Badge | ❌ | ❌ | ❌ |
| **Favorite Button** | ✅ | ✅ | ❌ | ❌ |
| **Share Button** | ✅ | ✅ | ❌ | ❌ |
| **Static Map** | ❌ | ✅ | ✅ Main | ❌ |
| **Coordinates** | ❌ | ❌ | ✅ Pin | ✅ (hidden) |

---

## Visual Layout

### Grid View (Default)

```
┌────────────────────────────────────────────────────────────────────────┐
│  [Filter] [N results]           [Chips...]              [🔲][≡][🗺️][📊]  │
├────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐         │
│  │ ┌─────────────┐ │  │ ┌─────────────┐ │  │ ┌─────────────┐ │         │
│  │ │   IMAGE     │ │  │ │   IMAGE     │ │  │ │   IMAGE     │ │         │
│  │ │   260px     │ │  │ │   260px     │ │  │ │   260px     │ │         │
│  │ │  [♡] [↗]    │ │  │ │  [♡] [↗]    │ │  │ │  [♡] [↗]    │ │         │
│  │ └─────────────┘ │  │ └─────────────┘ │  │ └─────────────┘ │         │
│  │ [LOKALE]        │  │ [UTSTYR]        │  │ [OPPLEVELSE]    │         │
│  │ Venue Name      │  │ Equipment Name  │  │ Experience Name │         │
│  │ 📍 Location     │  │ 📍 Location     │  │ 📍 Location     │         │
│  │ Description...  │  │ Description...  │  │ Description...  │         │
│  │ [Tag][Tag][+2]  │  │ [Tag][Tag][+1]  │  │ [Tag][Tag]      │         │
│  │ 👥 50 | 500 kr/t│  │ 👥 10 | 200 kr/t│  │ 👥 100| 1000 kr │         │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘         │
│                                                                         │
│                      [Vis flere (42 gjenstår)]                          │
│                                                                         │
└────────────────────────────────────────────────────────────────────────┘
```

### List View

```
┌────────────────────────────────────────────────────────────────────────┐
│  [Filter] [N results]           [Chips...]              [🔲][≡][🗺️][📊]  │
├────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │ ┌──────────┐ [LOKALE]                               ┌────────┐ │    │
│  │ │          │ Venue Name                 [♡] [↗]    │  MAP   │ │    │
│  │ │  IMAGE   │ 📍 Location                            │ static │ │    │
│  │ │          │ Description excerpt...                 │        │ │    │
│  │ │          │ [Tag][Tag][Tag][+2]                    └────────┘ │    │
│  │ └──────────┘ 👥 50 kapasitet      500 kr/time                  │    │
│  └────────────────────────────────────────────────────────────────┘    │
│                                                                         │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │ ┌──────────┐ [UTSTYR]                               ┌────────┐ │    │
│  │ │          │ Equipment Name             [♡] [↗]    │  MAP   │ │    │
│  │ │  IMAGE   │ 📍 Location                            │ static │ │    │
│  │ │          │ Description excerpt...                 │        │ │    │
│  │ │          │ [Tag][Tag]                             └────────┘ │    │
│  │ └──────────┘ 👥 10 kapasitet      200 kr/time                  │    │
│  └────────────────────────────────────────────────────────────────┘    │
│                                                                         │
└────────────────────────────────────────────────────────────────────────┘
```

### Map View

```
┌────────────────────────────────────────────────────────────────────────┐
│  [Filter] [N results]           [Chips...]              [🔲][≡][🗺️][📊]  │
├────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ╔════════════════════════════════════════════════════════════════╗    │
│  ║                                                                ║    │
│  ║           MAPBOX MAP (full viewport height)                   ║    │
│  ║                                                                ║    │
│  ║                    📍              📍                          ║    │
│  ║              📍           📍                                   ║    │
│  ║     ┌──────────────────┐                                       ║    │
│  ║     │ Venue Name       │             📍                        ║    │
│  ║     │ [LOKALE]         │    📍                                 ║    │
│  ║     │ Location         │                    📍                 ║    │
│  ║     │ 500 kr/time      │          📍                           ║    │
│  ║     └──────────────────┘   📍                                  ║    │
│  ║                                                                ║    │
│  ║                    📍         📍            📍                 ║    │
│  ║                                                                ║    │
│  ╚════════════════════════════════════════════════════════════════╝    │
│                                                                         │
└────────────────────────────────────────────────────────────────────────┘
```

### Table View

```
┌────────────────────────────────────────────────────────────────────────┐
│  [Filter] [N results]           [Chips...]              [🔲][≡][🗺️][📊]  │
├────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Navn ▲         │ Sted          │ Kapasitet    │ Pris             │  │
│  ├─────────────────┼───────────────┼──────────────┼──────────────────┤  │
│  │ Venue Alpha    │ Oslo          │ 50           │ 500 kr/time      │  │
│  ├─────────────────┼───────────────┼──────────────┼──────────────────┤  │
│  │ Venue Beta     │ Bergen        │ 30           │ 400 kr/time      │  │
│  ├─────────────────┼───────────────┼──────────────┼──────────────────┤  │
│  │ Equipment Gam  │ Trondheim     │ 10           │ 200 kr/time      │  │
│  ├─────────────────┼───────────────┼──────────────┼──────────────────┤  │
│  │ Space Delta    │ Stavanger     │ 100          │ 800 kr/time      │  │
│  ├─────────────────┼───────────────┼──────────────┼──────────────────┤  │
│  │ ...            │ ...           │ ...          │ ...              │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                         │
└────────────────────────────────────────────────────────────────────────┘
```

---

## Filter Drawer

```
┌──────────────────────────────────┐
│ ← Filtrer                    ✕   │
├──────────────────────────────────┤
│                                  │
│ ▼ Type                           │
│   ☑ Alle                    (48) │
│   ☐ Lokaler og baner        (32) │
│   ☐ Utstyr og inventar      (10) │
│   ☐ Opplevelser             (6)  │
│      [Vis mer (1)]               │
│                                  │
│ ▶ Område (collapsed)             │
│                                  │
│ ▶ Kapasitet (collapsed)          │
│                                  │
│ ▶ Fasiliteter (collapsed)        │
│                                  │
├──────────────────────────────────┤
│   Viser 48 resultater            │
│   [      Vis resultater      ]   │
└──────────────────────────────────┘
```

---

## Data Flow

```
API Response (ListingCardProjectionDTO[])
│
├── name: string
├── id: string
├── slug: string
├── category: 'LOKALER_OG_BANER' | 'UTSTYR_OG_INVENTAR' | ...
├── categoryLabel: string (i18n key)
├── typeLabel: string
├── locationFormatted: string
├── city: string
├── descriptionExcerpt: string
├── primaryImageUrl: string
├── amenities: string[]
├── moreAmenitiesCount: number
├── capacity: number
├── priceAmount: number
├── priceUnit: 'hour' | 'day' | ...
├── priceCurrency: string
├── averageRating: number
├── reviewCount: number
├── latitude: number | null
├── longitude: number | null
├── isAvailable: boolean
│
└──▶ Rendered in each view
```

---

## View Component Props

### RentalObjectCard (Grid)

```tsx
<RentalObjectCard
  id={listing.id}
  name={listing.name}
  type={t(listing.categoryLabel)}
  listingType={listing.category}
  location={listing.locationFormatted}
  description={listing.descriptionExcerpt}
  image={listing.primaryImageUrl}
  facilities={listing.amenities?.map(key => t(key))}
  moreFacilities={listing.moreAmenitiesCount}
  capacity={listing.capacity}
  price={listing.priceAmount}
  priceUnit={PRICE_UNIT_LABELS[listing.priceUnit]}
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
  onFavorite={(id) => { /* TODO */ }}
  onShare={(id) => { /* TODO */ }}
/>
```

### RentalObjectListItem (List)

```tsx
<RentalObjectListItem
  id={listing.id}
  name={listing.name}
  type={t(listing.categoryLabel)}
  listingType={listing.category}
  location={listing.locationFormatted}
  description={listing.descriptionExcerpt}
  image={listing.primaryImageUrl}
  facilities={listing.amenities?.map(key => t(key))}
  moreFacilities={listing.moreAmenitiesCount}
  capacity={listing.capacity}
  price={listing.priceAmount}
  priceUnit={PRICE_UNIT_LABELS[listing.priceUnit]}
  currency={listing.priceCurrency}
  latitude={listing.latitude}
  longitude={listing.longitude}
  mapboxToken={MAPBOX_TOKEN}
  showMap={true}
  showPrice={true}
  onClick={(id) => handleListingClick(id, listing.slug)}
  onFavorite={(id) => { /* TODO */ }}
  onShare={(id) => { /* TODO */ }}
/>
```

### LazyRentalObjectMap (Map)

```tsx
<LazyRentalObjectMap
  rentalObjects={filteredListings.filter(l => l.latitude && l.longitude).map(l => ({
    id: l.id,
    name: l.name,
    slug: l.slug,
    location: l.locationFormatted,
    image: l.primaryImageUrl,
    latitude: l.latitude,
    longitude: l.longitude,
    type: l.type,
    listingType: l.type,
    description: l.descriptionExcerpt,
    capacity: l.capacity,
    price: l.priceAmount,
    priceUnit: l.priceUnit,
    facilities: l.amenities,
    available: l.isAvailable,
  }))}
  mapboxToken={MAPBOX_TOKEN}
  height="calc(100vh - 250px)"
  onRentalObjectClick={handleListingClick}
/>
```

### RentalObjectTableView (Table)

```tsx
<RentalObjectTableView
  rentalObjects={filteredListings.map(l => ({
    id: l.id,
    name: l.name,
    slug: l.slug,
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
```

---

## Filter Categories

### Type (Category)

| Key | Label Key | Norwegian |
|-----|-----------|-----------|
| `ALL` | `listings.category.all` | Alle |
| `LOKALER_OG_BANER` | `sdk.rentalObject.category.LOKALER_OG_BANER` | Lokaler og baner |
| `UTSTYR_OG_INVENTAR` | `sdk.rentalObject.category.UTSTYR_OG_INVENTAR` | Utstyr og inventar |
| `KJORETOY_OG_TRANSPORT` | - | (Disabled) |
| `OPPLEVELSER_OG_ARRANGEMENT` | `sdk.rentalObject.category.OPPLEVELSER_OG_ARRANGEMENT` | Opplevelser |

### Capacity

| ID | Label Key | Range |
|----|-----------|-------|
| `all` | `listings.filter.capacity.all` | All |
| `1-5` | `listings.filter.capacity.1-5` | 1-5 |
| `6-10` | `listings.filter.capacity.6-10` | 6-10 |
| `11-20` | `listings.filter.capacity.11-20` | 11-20 |
| `21-50` | `listings.filter.capacity.21-50` | 21-50 |
| `50+` | `listings.filter.capacity.50+` | 50+ |

### Areas (Dynamic)

Populated from `usePublicCities()` API or extracted from listing cities.

### Facilities (Dynamic)

Extracted from all listings' amenities arrays.
