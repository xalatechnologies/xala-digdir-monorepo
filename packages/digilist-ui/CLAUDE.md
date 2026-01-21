# @digilist/ui - Domain UI Components

> **Extends:** [Root CLAUDE.md](../../CLAUDE.md)

## Purpose

`@digilist/ui` provides **domain-specific** UI components for the Digilist rental booking platform. This package separates domain components from `@xala/ds` (platform-agnostic design system) to enable platform decoupling.

**Package Name:** `@digilist/ui`
**Status:** Production Active

---

## Domain vs Platform Separation

| Domain Component (This Package) | Platform Component (@xala/ds) |
|-------------------------------|-------------------------------|
| RentalObjectCard | Card |
| RentalObjectGrid | Grid |
| BookingFormModal | Modal |
| BookingSuccess | Alert |
| AvailabilityCalendar | (custom) |
| SeasonCard | Card |

---

## Component Hierarchy

### Rental Object Components
```
src/blocks/rental-objects/
├── RentalObjectCard.tsx          # Card view for listings
├── RentalObjectGrid.tsx          # Grid layout for listings
├── RentalObjectList.tsx          # List view for listings
├── RentalObjectDetailHeader.tsx  # Detail page header
├── RentalObjectTableView.tsx     # Admin table view
├── RentalObjectToolbar.tsx       # Search/filter toolbar
├── RentalObjectMap.tsx           # Mapbox map view
├── RentalObjectTabs.tsx          # Detail page tabs
└── AvailabilityCalendar.tsx      # Availability display
```

### Booking Components
```
src/blocks/booking/
├── BookingFormModal.tsx         # Booking creation form
├── BookingConfirmation.tsx      # Confirmation screen
├── BookingSuccess.tsx           # Success message
├── PriceSummaryCard.tsx         # Price calculation
└── booking-engine/              # Multi-step booking flow
    ├── UnifiedBookingEngine.tsx
    ├── modes/
    └── steps/
```

### Season Components
```
src/blocks/seasons/
├── SeasonCard.tsx               # Season display
└── VenueCard.tsx                # Venue in season context
```

---

## Usage

```tsx
import { RentalObjectCard, BookingSuccess } from '@digilist/ui';
import type { RentalObjectCardProjection } from '@digilist/contracts/projections';

function ListingsPage({ listings }: { listings: RentalObjectCardProjection[] }) {
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

## Dependencies

- **@xala/ds** - Platform design system (primitives, composed components)
- **@xala/i18n** - Internationalization
- **@digilist/contracts** - Domain types and projections

---

## Why This Package Exists

Domain components like `RentalObjectCard` and `BookingFormModal`:
1. Use domain-specific props (`RentalObjectCardProjection`)
2. Contain Norwegian domain terminology
3. Include business logic specific to rental bookings
4. Cannot be reused in other platform domains

By moving these to `@digilist/ui`, the `@xala/ds` package becomes truly platform-agnostic and reusable.

---

## Non-Negotiable Rules

1. **DOMAIN-SPECIFIC ONLY** - Only rental/booking domain components here
2. **NO PLATFORM COMPONENTS** - Generic Card, Grid, etc. stay in @xala/ds
3. **USE PROJECTIONS** - Components accept DTO types from @digilist/contracts
4. **i18n REQUIRED** - All text must use @xala/i18n

---

**Last Updated:** 2026-01-20
**Status:** New Package - Platform Decoupling Phase 0
