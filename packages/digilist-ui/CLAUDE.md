# @digilist/ui - Domain UI Components

> **Extends:** [Root CLAUDE.md](../../CLAUDE.md)

## Purpose

`@digilist/ui` provides **domain-specific** UI components for the Digilist rental booking platform. This package contains components that are specific to the rental/booking business domain and should NOT be in the platform-agnostic design system.

**Package Name:** `@digilist/ui`
**Status:** Production Active
**Namespace:** Domain Package (Digilist-specific)

---

## Architecture Position

```
+------------------------------------------+
|        @xalatechnologies/platform        |  <-- Platform (domain-agnostic)
|  - /ui (Button, Card, Modal, etc.)       |
|  - /ui/patterns (ResourceCard, etc.)     |
+------------------------------------------+
                    |
                    | imports from
                    v
+------------------------------------------+
|            @digilist/ui                  |  <-- Domain (THIS PACKAGE)
|  - RentalObjectCard                      |
|  - BookingFormModal                      |
|  - SeasonCard                            |
|  - Feature Kit mappers                   |
+------------------------------------------+
                    ^
                    | imports from
                    |
+------------------------------------------+
|          Apps (web, minside, etc.)       |
+------------------------------------------+
```

---

## Import Rules

### CAN Import From (Dependencies)

```typescript
// Platform UI components (primitives and patterns)
import { Button, Card, Modal } from '@xalatechnologies/platform/ui';
import { ResourceCard } from '@xalatechnologies/platform/ui/patterns';

// Platform runtime
import { useAuth } from '@xalatechnologies/platform/auth';

// Internationalization
import { useT } from '@xala/i18n';

// Domain contracts (types and projections)
import type { RentalObjectCardProjection } from '@digilist/contracts/projections';
```

### CANNOT Import From (Forbidden)

```typescript
// Never import raw Designsystemet
import { Button } from '@digdir/designsystemet-react'; // FORBIDDEN

// Never import from apps
import { something } from 'apps/web'; // FORBIDDEN

// Never import from @digilist/sdk (would create circular dependency)
import { useBookings } from '@digilist/sdk'; // FORBIDDEN
```

---

## Export Pattern

This package uses a **Feature Kit pattern** with thin wrappers and mappers:

### Feature Kits (Recommended)

```typescript
// Feature kits provide:
// 1. Thin wrapper components that compose Platform patterns
// 2. Mappers to transform domain DTOs to component props
// 3. Re-exports of domain components for direct use

import {
  // Thin wrapper (recommended)
  RentalObjectCardWrapper,

  // Mapper function
  mapRentalObjectToResourceCard,

  // Direct component (legacy)
  RentalObjectCard,
} from '@digilist/ui/features/rental-objects';
```

### Package Structure

```
src/
├── features/                    # Feature Kits (RECOMMENDED entry point)
│   ├── rental-objects/
│   │   ├── index.ts            # Public API
│   │   ├── mappers.ts          # DTO -> props mapping
│   │   └── RentalObjectCardWrapper.tsx  # Thin wrapper
│   ├── booking/
│   │   ├── index.ts
│   │   └── mappers.ts
│   └── seasons/
│       ├── index.ts
│       └── mappers.ts
├── blocks/                      # Domain components (direct use)
│   ├── rental-objects/
│   │   ├── RentalObjectCard.tsx
│   │   ├── RentalObjectGrid.tsx
│   │   ├── RentalObjectDetailHeader.tsx
│   │   └── ...
│   ├── booking/
│   │   ├── BookingFormModal.tsx
│   │   ├── BookingSuccess.tsx
│   │   └── ...
│   └── seasons/
│       ├── SeasonCard.tsx
│       └── VenueCard.tsx
├── booking-engine/              # Multi-step booking wizard
│   ├── UnifiedBookingEngine.tsx
│   ├── modes/
│   └── steps/
├── primitives/                  # Icons and low-level utilities
├── types/                       # Domain-specific types
└── index.ts                     # Main entry point
```

---

## Usage Examples

### Pattern 1: Feature Kit Wrapper (Recommended)

```tsx
import { RentalObjectCardWrapper } from '@digilist/ui/features/rental-objects';
import { useT } from '@xala/i18n';

function RentalObjectsGrid({ rentalObjects }) {
  const t = useT();

  return (
    <Grid columns={3}>
      {rentalObjects.map(rentalObject => (
        <RentalObjectCardWrapper
          key={rentalObject.id}
          rentalObject={rentalObject}
          onClick={(id) => navigate(`/rental-objects/${id}`)}
          t={t}
        />
      ))}
    </Grid>
  );
}
```

### Pattern 2: Mapper with Platform Pattern

```tsx
import { mapRentalObjectToResourceCard } from '@digilist/ui/features/rental-objects';
import { ResourceCard } from '@xalatechnologies/platform/ui/patterns';
import { useT } from '@xala/i18n';

function MyCustomCard({ rentalObject }) {
  const t = useT();
  const props = mapRentalObjectToResourceCard(rentalObject, t);

  return <ResourceCard {...props} />;
}
```

### Pattern 3: Direct Component (Legacy)

```tsx
import { RentalObjectCard } from '@digilist/ui';

function ListingsPage({ listings }) {
  return (
    <Grid columns={3}>
      {listings.map(listing => (
        <RentalObjectCard
          key={listing.id}
          {...listing}
          onClick={() => navigate(`/listings/${listing.slug}`)}
        />
      ))}
    </Grid>
  );
}
```

---

## Domain vs Platform Separation

| Domain Component (This Package) | Platform Component (@xalatechnologies/platform/ui) |
|--------------------------------|---------------------------------------------------|
| RentalObjectCard               | ResourceCard (pattern)                            |
| RentalObjectGrid               | Grid                                              |
| BookingFormModal               | FormWizardModal (pattern)                         |
| BookingSuccess                 | SuccessView (pattern)                             |
| AvailabilityCalendar           | SlotCalendar (pattern)                            |
| SeasonCard                     | Card                                              |

---

## Why This Package Exists

Domain components like `RentalObjectCard` and `BookingFormModal`:

1. **Use domain-specific props** (`RentalObjectCardProjection`)
2. **Contain Norwegian domain terminology** (booking, rental object, season)
3. **Include business logic** specific to rental bookings
4. **Cannot be reused** in other platform domains

By moving these to `@digilist/ui`, the `@xalatechnologies/platform` package remains truly **platform-agnostic** and reusable across different domains.

---

## Non-Negotiable Rules

1. **DOMAIN-SPECIFIC ONLY** - Only rental/booking domain components here
2. **NO PLATFORM COMPONENTS** - Generic Card, Grid, etc. stay in @xalatechnologies/platform/ui
3. **USE PROJECTIONS** - Components accept DTO types from @digilist/contracts
4. **i18n REQUIRED** - All text must use @xala/i18n
5. **NO SDK IMPORTS** - Never import from @digilist/sdk (circular dependency)
6. **THIN WRAPPERS** - Feature kit components should be <50 lines

---

## Exports Reference

### Main Entry Point (`@digilist/ui`)

```typescript
// Feature kits (recommended)
export * from './features';

// Booking engine
export * from './booking-engine';

// Types
export type { RentalObjectDetail, CalendarMode, ... } from './types';
```

### Sub-path Exports

| Path | Content |
|------|---------|
| `@digilist/ui` | Main entry (features + booking engine + types) |
| `@digilist/ui/features` | All feature kits |
| `@digilist/ui/features/rental-objects` | Rental object feature kit |
| `@digilist/ui/features/booking` | Booking feature kit |
| `@digilist/ui/features/seasons` | Seasons feature kit |
| `@digilist/ui/blocks` | All domain components (direct) |
| `@digilist/ui/rental-objects` | Rental object components (direct) |
| `@digilist/ui/booking` | Booking components (direct) |
| `@digilist/ui/seasons` | Season components (direct) |
| `@digilist/ui/booking-engine` | Multi-step booking wizard |

---

## Dependencies

- **@xalatechnologies/platform** - Platform UI (primitives, patterns)
- **@xala/i18n** - Internationalization
- **@digilist/contracts** - Domain types and projections

### Peer Dependencies (Optional)

- **react-map-gl** - For map components
- **mapbox-gl** - For map rendering

---

**Last Updated:** 2026-01-21
**Status:** Production Active - Platform Decoupling Phase
