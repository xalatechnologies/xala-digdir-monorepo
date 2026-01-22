# Flow: Details Page and Tabs Matrix

**Date:** 2026-01-19  
**Status:** Implementation Reference  
**Version:** 1.0

---

## Overview

This document describes the **rental object detail page structure**, including all tabs, sidebar behavior, and the data sources for each section.

---

## 1. Page Structure

### 1.1 Layout Components

```
┌─────────────────────────────────────────────────────────────────┐
│ Breadcrumb                                                      │
│ Hjem > Lokaler > Idrettshall A                                  │
├─────────────────────────────────────────────────────────────────┤
│ ┌────────────────────────────────────────────────────────────┐  │
│ │                     Image Slider                           │  │
│ │                                                            │  │
│ └────────────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────┐  ┌────────────────────┐  │
│  │                                  │  │                    │  │
│  │    Main Content Area             │  │   Booking Sidebar  │  │
│  │    (RentalObjectDetailsLayout)   │  │                    │  │
│  │                                  │  │   - Mode selector  │  │
│  │    ┌──────────────────────────┐  │  │   - Calendar       │  │
│  │    │ Header Block             │  │  │   - Selection      │  │
│  │    │ Name, Category, Actions  │  │  │   - Price summary  │  │
│  │    └──────────────────────────┘  │  │   - Book button    │  │
│  │                                  │  │                    │  │
│  │    [Oversikt][Kalender][Regler]  │  │                    │  │
│  │                                  │  │                    │  │
│  │    ┌──────────────────────────┐  │  │                    │  │
│  │    │                          │  │  │                    │  │
│  │    │  Tab Content             │  │  │                    │  │
│  │    │                          │  │  │                    │  │
│  │    │                          │  │  │                    │  │
│  │    └──────────────────────────┘  │  │                    │  │
│  │                                  │  │                    │  │
│  └──────────────────────────────────┘  └────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 Component Hierarchy

```
RentalObjectDetailPage.tsx
├── Breadcrumb
├── ImageSlider
│   └── Images from: listing.images[]
└── RentalObjectDetailsLayout.tsx
    ├── HeaderBlock
    │   ├── Name, Category badge
    │   ├── Location (city, address)
    │   ├── Rating stars
    │   └── Action buttons (Share, Favorite)
    ├── TabNavigation
    │   └── [Oversikt, Kalender, Regler, FAQ, Kart]
    ├── TabContent (conditional)
    │   ├── OverviewTab
    │   ├── CalendarTab
    │   ├── RulesTab
    │   ├── FAQTab
    │   └── LocationTab
    └── Sidebar (Desktop) / BottomSheet (Mobile)
        └── BookingWidgetPlacement.tsx
```

---

## 2. Tabs Matrix

### 2.1 All Available Tabs

| Tab ID | Norwegian Label | Data Source | Always Shown | Status |
|--------|-----------------|-------------|--------------|--------|
| `overview` | Oversikt | description, facilities, amenities | ✅ | ✅ Complete |
| `calendar` | Kalender | /api/availability/:id | ✅ | ✅ Complete |
| `rules` | Regler | metadata.rules, rules | If data exists | ✅ Complete |
| `faq` | FAQ | metadata.faq | If data exists | ✅ Complete |
| `location` | Beliggenhet | location (lat/lng) | If location exists | ✅ Complete |
| `contact` | Kontakt | metadata.contact* | If data exists | ⚠️ Partial |
| `reviews` | Omtaler | /api/rental-objects/:id/reviews | If reviewCount > 0 | ✅ Complete |
| `related` | Lignende | /api/rental-objects?category= | If results exist | ✅ Complete |

### 2.2 Tab Visibility Logic

```typescript
const tabs = useMemo(() => {
  const allTabs = [
    { id: 'overview', label: t('tabs.overview'), always: true },
    { id: 'calendar', label: t('tabs.calendar'), always: true },
  ];
  
  // Conditional tabs
  if (listing.metadata?.rules?.length > 0 || listing.rules) {
    allTabs.push({ id: 'rules', label: t('tabs.rules') });
  }
  
  if (listing.metadata?.faq?.length > 0) {
    allTabs.push({ id: 'faq', label: t('tabs.faq') });
  }
  
  if (listing.location?.latitude && listing.location?.longitude) {
    allTabs.push({ id: 'location', label: t('tabs.location') });
  }
  
  if (listing.reviewCount > 0) {
    allTabs.push({ id: 'reviews', label: t('tabs.reviews') });
  }
  
  return allTabs;
}, [listing, t]);
```

---

## 3. Overview Tab

### 3.1 Content Sections

```
┌────────────────────────────────────────────────────────────┐
│ Beskrivelse                                                │
├────────────────────────────────────────────────────────────┤
│ Lorem ipsum dolor sit amet, consectetur adipiscing elit.   │
│ Sed do eiusmod tempor incididunt ut labore et dolore...    │
│                                                            │
│ [Les mer ▼] (if long text)                                 │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│ Fasiliteter / Amenities                                    │
├────────────────────────────────────────────────────────────┤
│ ☑ Wifi          ☑ Parkering      ☑ Toalett              │
│ ☑ Garderobe     ☑ Dusj           ☑ Tilgjengelighet       │
│ ☑ Kafé          ☑ Klimaanlegg                            │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│ Åpningstider                                               │
├────────────────────────────────────────────────────────────┤
│ Mandag:      08:00 - 21:00                                 │
│ Tirsdag:     08:00 - 21:00                                 │
│ Onsdag:      08:00 - 21:00                                 │
│ Torsdag:     08:00 - 21:00                                 │
│ Fredag:      08:00 - 21:00                                 │
│ Lørdag:      10:00 - 18:00                                 │
│ Søndag:      Stengt                                        │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│ Kapasitet og detaljer                                      │
├────────────────────────────────────────────────────────────┤
│ Kapasitet:     50 personer                                 │
│ Kategori:      Lokaler og baner                            │
│ Type:          Idrettshall                                 │
└────────────────────────────────────────────────────────────┘
```

### 3.2 Data Sources

| Section | Field | Source |
|---------|-------|--------|
| Description | `description` | `listing.description` |
| Facilities | `amenities` | `listing.metadata.amenities[]` |
| Opening Hours | `openingHours` | `listing.metadata.openingHours` or projections |
| Capacity | `capacity` | `listing.capacity` |
| Category | `category` | `listing.category` → label |

---

## 4. Calendar Tab

### 4.1 Content

```
┌────────────────────────────────────────────────────────────┐
│ Tilgjengelighet denne uken                                 │
├────────────────────────────────────────────────────────────┤
│ ← Forrige uke    13. jan - 19. jan 2026    Neste uke →     │
├────────────────────────────────────────────────────────────┤
│                                                            │
│         Man    Tir    Ons    Tor    Fre    Lør    Søn      │
│ 08:00   [ ]    [ ]    [ ]    [ ]    [ ]    [ ]    [─]      │
│ 09:00   [ ]    [█]    [ ]    [ ]    [ ]    [ ]    [─]      │
│ 10:00   [ ]    [█]    [ ]    [ ]    [ ]    [ ]    [─]      │
│ ...                                                        │
│                                                            │
├────────────────────────────────────────────────────────────┤
│ Forklaring:                                                │
│ [ ] Ledig   [█] Opptatt   [─] Stengt                       │
└────────────────────────────────────────────────────────────┘
```

### 4.2 Read-Only vs Interactive

| Context | Behavior | Component |
|---------|----------|-----------|
| Calendar Tab | Read-only, overview only | `CalendarSection.tsx` |
| Sidebar Widget | Interactive, click to select | `BookingWidgetPlacement.tsx` |

### 4.3 Data Source

```typescript
// API call
GET /api/availability/:rentalObjectId?from=2026-01-13&to=2026-01-19

// Response
{
  cells: AvailabilityCellDTO[],
  legend: SlotStatusLegendDTO[],
  granularity: 'TIME_SLOTS'
}
```

---

## 5. Rules Tab

### 5.1 Content

```
┌────────────────────────────────────────────────────────────┐
│ Regler og vilkår                                           │
├────────────────────────────────────────────────────────────┤
│                                                            │
│ Generelle regler                                           │
│ ────────────────                                           │
│ • Ingen mat eller drikke i lokalet                         │
│ • Ordensregler må følges                                   │
│ • Lokalet skal ryddes etter bruk                           │
│                                                            │
│ Kansellering                                               │
│ ────────────────                                           │
│ Avbestilling må skje minst 24 timer før.                   │
│ Ved sen avbestilling belastes 50% av prisen.               │
│                                                            │
│ Depositum                                                  │
│ ────────────────                                           │
│ Depositum på 1000 NOK kreves ved booking.                  │
│ Refunderes innen 14 dager ved normal bruk.                 │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### 5.2 Data Sources

| Section | Field | Source |
|---------|-------|--------|
| General Rules | `rules` | `listing.metadata.rules[]` (string[]) |
| Cancellation | `cancellation` | `listing.rules.cancellation` |
| Deposit | `deposit` | `listing.rules.deposit` |
| Age Requirement | `ageRequirement` | `listing.rules.ageRequirement` |

---

## 6. FAQ Tab

### 6.1 Content

```
┌────────────────────────────────────────────────────────────┐
│ Ofte stilte spørsmål                                       │
├────────────────────────────────────────────────────────────┤
│                                                            │
│ ▼ Hva er inkludert i leien?                               │
│   Leien inkluderer bruk av lokalet og grunnleggende       │
│   utstyr. Ekstra utstyr kan leies separat.                │
│                                                            │
│ ▶ Kan jeg ta med egen mat og drikke?                      │
│                                                            │
│ ▶ Er det parkeringsmuligheter?                            │
│                                                            │
│ ▶ Hvordan får jeg tilgang til lokalet?                    │
│                                                            │
│ ▶ Kan jeg avlyse bookingen min?                           │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### 6.2 Data Source

```typescript
// From listing.metadata.faq
interface FAQ {
  id?: string;
  question: string;
  answer: string;
}

// Array of FAQ items
listing.metadata.faq: FAQ[]
```

### 6.3 Component

**Pattern:** Accordion with expand/collapse

```tsx
{faq.map((item, index) => (
  <Accordion key={item.id || index}>
    <AccordionHeader>{item.question}</AccordionHeader>
    <AccordionContent>{item.answer}</AccordionContent>
  </Accordion>
))}
```

---

## 7. Location Tab

### 7.1 Content

```
┌────────────────────────────────────────────────────────────┐
│ Beliggenhet                                                │
├────────────────────────────────────────────────────────────┤
│                                                            │
│ ┌────────────────────────────────────────────────────────┐ │
│ │                                                        │ │
│ │                     [Mapbox Map]                       │ │
│ │                         📍                             │ │
│ │                                                        │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                            │
│ Adresse:    Sportsveien 1, 3019 Drammen                    │
│ Kommune:    Drammen                                        │
│                                                            │
│ [Åpne i Google Maps ↗]                                     │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### 7.2 Data Source

```typescript
interface Location {
  address?: string;
  city?: string;
  postalCode?: string;
  municipality?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
}

// From listing.location or listing.metadata.location
```

### 7.3 Map Integration

**Provider:** Mapbox GL JS

```tsx
<MapboxMap
  token={mapboxToken}
  center={[listing.location.longitude, listing.location.latitude]}
  zoom={14}
  marker={{
    coordinates: [listing.location.longitude, listing.location.latitude],
    title: listing.name,
  }}
/>
```

---

## 8. Reviews Tab

### 8.1 Content

```
┌────────────────────────────────────────────────────────────┐
│ Omtaler                                    4.7 ★ (42)      │
├────────────────────────────────────────────────────────────┤
│                                                            │
│ ★★★★★  Ola Nordmann                     12. jan 2026      │
│ Fantastisk lokale! Perfekt for vårt arrangement.          │
│                                                            │
│ ─────────────────────────────────────────────────────────  │
│                                                            │
│ ★★★★☆  Kari Hansen                      5. jan 2026       │
│ Veldig bra, men litt kaldt i lokalet.                     │
│                                                            │
│ ─────────────────────────────────────────────────────────  │
│                                                            │
│                    [Last inn flere]                        │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### 8.2 Data Source

```typescript
// API endpoint
GET /api/rental-objects/:id/reviews?page=1&limit=10

// Response
{
  data: Review[],
  meta: { total, page, limit }
}

interface Review {
  id: string;
  rating: number; // 1-5
  comment: string;
  userName: string;
  createdAt: string;
}
```

---

## 9. Sidebar Behavior

### 9.1 Desktop (> 1024px)
- Fixed right sidebar
- Always visible
- Scrolls with content up to sticky point

### 9.2 Tablet (768px - 1024px)
- Narrower sidebar
- May collapse to button

### 9.3 Mobile (< 768px)
- Bottom sheet (initially collapsed)
- Floats above content
- Full-height when expanded

### 9.4 Sidebar Content

```
┌────────────────────────────────┐
│ Book nå                        │
├────────────────────────────────┤
│                                │
│ Fra 500 NOK / time             │
│                                │
│ ☑ Enkeltbooking                │
│ ○ Gjentakende                  │
│                                │
│ ← 13-19 jan →                  │
│ ┌─────────────────────────┐    │
│ │  Calendar Grid          │    │
│ └─────────────────────────┘    │
│                                │
│ Valgt: Ons 15. jan, 10:00      │
│ Varighet: 1 time               │
│ Pris: 500 NOK                  │
│                                │
│ [    Book dette tidspunktet   ]│
│                                │
└────────────────────────────────┘
```

---

## 10. Data Projection Flow

### 10.1 API Response Structure

```typescript
// GET /api/rental-objects/:id
interface RentalObjectDetailProjection {
  // Core
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: RentalObjectCategory;
  status: RentalObjectStatus;
  
  // Media
  images: string[];
  
  // Location
  location: RentalObjectLocation | null;
  
  // Pricing
  pricing: {
    basePrice: number;
    currency: string;
    unit: PricingUnit;
  } | null;
  
  // Capacity
  capacity: number | null;
  
  // Opening hours (projected from metadata)
  openingHours: OpeningHoursDTO | null;
  
  // Amenities (extracted from metadata.amenities)
  amenities: string[];
  
  // Facilities (extracted from metadata.facilities)
  facilities: string[];
  
  // FAQ (extracted from metadata.faq)
  faq: { question: string; answer: string }[];
  
  // Rules
  rules: RentalObjectRules | null;
  
  // Contact
  contact: {
    name?: string;
    email?: string;
    phone?: string;
    website?: string;
  } | null;
  
  // Booking config
  bookingConfig: BookingConfigDTO;
  
  // Stats
  averageRating: number | null;
  reviewCount: number;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}
```

### 10.2 Client Transformation

**Location:** `RentalObjectDetailPage.tsx` → `transformApiToListing()`

```typescript
function transformApiToListing(api: ApiListing, t: TFunction): RentalObject {
  return {
    id: api.id,
    name: api.name,
    description: api.description || '',
    category: api.category,
    
    // Location string
    location: buildLocationString(api.location),
    
    // Opening hours transformation
    openingHours: transformOpeningHours(api.openingHours, t),
    
    // Amenities with labels
    amenities: api.amenities || [],
    
    // ...etc
  };
}
```

---

## 11. Tab Content Components

### 11.1 Component Mapping

| Tab | Component | Location |
|-----|-----------|----------|
| Overview | `OverviewTabContent.tsx` | `features/rental-object-details/components/tabs/` |
| Calendar | `CalendarTabContent.tsx` | Same |
| Rules | `RulesTabContent.tsx` | Same |
| FAQ | `FAQTabContent.tsx` | Same |
| Location | `LocationTabContent.tsx` | Same |
| Reviews | `ReviewsTabContent.tsx` | Same |

### 11.2 Shared Patterns

All tab components follow:
```tsx
interface TabContentProps {
  listing: RentalObject;
  isLoading?: boolean;
}

function TabContent({ listing, isLoading }: TabContentProps) {
  if (isLoading) return <TabSkeleton />;
  
  return (
    <section className="tab-content">
      {/* Content */}
    </section>
  );
}
```

---

## 12. Data Dependencies

| Tab | Required API Calls | Cache Strategy |
|-----|-------------------|----------------|
| Overview | Initial detail fetch | Cached from detail |
| Calendar | `/api/availability/:id` | 5 min cache, refresh on nav |
| Rules | Initial detail fetch | Cached from detail |
| FAQ | Initial detail fetch | Cached from detail |
| Location | Initial detail fetch | Cached from detail |
| Reviews | `/api/rental-objects/:id/reviews` | 10 min cache, paginated |

---

## 13. Implementation Files

### Page
- `apps/web/src/pages/RentalObjectDetailPage.tsx`

### Layout
- `apps/web/src/features/rental-object-details/components/RentalObjectDetailsLayout.tsx`

### Sidebar
- `apps/web/src/features/rental-object-details/components/Sidebar/BookingWidgetPlacement.tsx`

### Tab Components
- `apps/web/src/features/rental-object-details/components/CalendarSection.tsx`
- (Other tabs inline in layout or extracted)

### Design System
- `packages/ds/src/blocks/RentalObjectAvailabilityCalendar.tsx`
- `packages/ds/src/components/Accordion.tsx`
- `packages/ds/src/components/Map.tsx`
