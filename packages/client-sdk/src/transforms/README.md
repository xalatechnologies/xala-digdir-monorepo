# API Response Transformers

Reusable transformation utilities for converting raw API responses into UI-friendly formats. Used across all apps (web, backoffice, minside) for consistent data transformation.

## Overview

Transformers solve the problem of having to repeatedly format API data in UI components. They provide:

- **Consistent formatting**: All apps display data the same way
- **Type safety**: TypeScript types for both input and output
- **Norwegian localization**: Labels and formatting in Norwegian
- **Reusability**: Write once, use everywhere
- **Performance**: Transform data once, not in every component

## Available Transformers

### 1. Listing Transformer (`listing.transform.ts`)

Transforms listing data from the API into display-ready format.

```typescript
import { transformListing, transformListings } from '@digilist/client-sdk/transforms';

// Single listing
const listing = await listingService.getListingById('123');
const uiListing = transformListing(listing);

// Multiple listings
const response = await listingService.getListings();
const uiListings = transformListings(response.data);

// Access transformed data
console.log(uiListing.address.formatted); // "Storgata 1, 0001 Oslo"
console.log(uiListing.pricing?.displayPrice); // "500 NOK/time"
console.log(uiListing.typeLabel); // "Lokale"
```

**Key Features:**
- Formatted address from multiple sources
- Opening hours with Norwegian day names
- Amenities and facilities lists
- Pricing with unit labels
- FAQ and rules formatting
- Coordinates for map display

### 2. Booking Transformer (`booking.transform.ts`)

Transforms booking and calendar event data.

```typescript
import { transformBooking, transformCalendarEvent } from '@digilist/client-sdk/transforms';

// Transform booking
const booking = await bookingService.getBookingById('123');
const uiBooking = transformBooking(booking);

console.log(uiBooking.time.displayDateTime); // "15. januar 2026, 10:00 - 12:00"
console.log(uiBooking.time.durationLabel); // "2 timer"
console.log(uiBooking.statusLabel); // "Bekreftet"
console.log(uiBooking.payment.formatted); // "1 000 NOK"

// Transform calendar events
const events = await bookingService.getCalendarEvents();
const uiEvents = events.map(transformCalendarEvent);
```

**Key Features:**
- Time formatting (date, time, duration)
- Status labels and colors
- Payment information
- Customer/organization details
- Calendar event compatibility

### 3. Organization & User Transformer (`organization.transform.ts`)

Transforms organization and user profile data.

```typescript
import {
  transformOrganization,
  transformUser,
  transformOrganizationMember
} from '@digilist/client-sdk/transforms';

// Transform organization
const org = await organizationService.getOrganizationById('123');
const uiOrg = transformOrganization(org);

console.log(uiOrg.actorTypeLabel); // "Idrettslag"
console.log(uiOrg.statusLabel); // "Aktiv"
console.log(uiOrg.formattedAddress); // "Idrettsvegen 5, 0001 Oslo"

// Transform user
const user = await userService.getCurrentUser();
const uiUser = transformUser(user);

console.log(uiUser.roleLabel); // "Administrator"
console.log(uiUser.statusLabel); // "Aktiv"
console.log(uiUser.age); // 35 (calculated from dateOfBirth)
console.log(uiUser.lastLoginFormatted); // "15. januar 2026"
```

**Key Features:**
- Actor type labels (sports club, school, municipality, etc.)
- Organization/user status and roles
- Formatted addresses
- Age calculation from date of birth
- Member role labels

### 4. Review Transformer (`review.transform.ts`)

Transforms review and rating data.

```typescript
import {
  transformReview,
  transformReviewStats,
  transformReviewSummary
} from '@digilist/client-sdk/transforms';

// Transform review
const review = await reviewService.getReviewById('123');
const uiReview = transformReview(review);

console.log(uiReview.ratingLabel); // "Utmerket"
console.log(uiReview.ratingStars); // "★★★★★"
console.log(uiReview.statusLabel); // "Godkjent"
console.log(uiReview.createdAtFormatted); // "15. januar 2026"

// Transform review stats
const stats = await reviewService.getReviewStats('listing-123');
const uiStats = transformReviewStats(stats);

console.log(uiStats.averageRatingFormatted); // "4.5"
console.log(uiStats.ratingDistribution[5]); // { count: 10, percentage: 50 }
console.log(uiStats.ratingBreakdown); // "5★: 10 | 4★: 5 | 3★: 3"
```

**Key Features:**
- Rating labels (1-5 stars)
- Star visualization (★★★★☆)
- Status labels (pending, approved, rejected)
- Review stats with percentages
- Moderation information

### 5. Season Transformer (`season.transform.ts`)

Transforms season and season application data.

```typescript
import {
  transformSeason,
  transformSeasonApplication
} from '@digilist/client-sdk/transforms';

// Transform season
const season = await seasonService.getSeasonById('123');
const uiSeason = transformSeason(season);

console.log(uiSeason.dates.startDateFormatted); // "1. august 2026"
console.log(uiSeason.dates.durationLabel); // "9 måneder"
console.log(uiSeason.dates.daysUntilStart); // 45
console.log(uiSeason.statusLabel); // "Åpen for søknader"
console.log(uiSeason.canApply); // true
console.log(uiSeason.stats.approvalRate); // 75 (percentage)

// Transform season application
const app = await seasonService.getApplicationById('123');
const uiApp = transformSeasonApplication(app);

console.log(uiApp.time.weekdayLabel); // "Mandag"
console.log(uiApp.time.timeRange); // "10:00 - 12:00"
console.log(uiApp.time.durationLabel); // "2 timer"
console.log(uiApp.statusLabel); // "Godkjent"
console.log(uiApp.displayName); // Organization or applicant name
```

**Key Features:**
- Date formatting and calculations
- Duration labels
- Application deadline tracking
- Season status and colors
- Weekday labels (Norwegian)
- Application time formatting
- Approval/allocation statistics

## Usage Patterns

### In React Components

```typescript
import { useListings } from '@digilist/client-sdk/hooks';
import { transformListings } from '@digilist/client-sdk/transforms';

function ListingsPage() {
  const { data } = useListings();
  const listings = data?.data ? transformListings(data.data) : [];

  return (
    <div>
      {listings.map(listing => (
        <ListingCard
          key={listing.id}
          name={listing.name}
          location={listing.address.formatted}
          price={listing.pricing?.displayPrice}
          type={listing.typeLabel}
        />
      ))}
    </div>
  );
}
```

### With React Query Hooks

```typescript
import { useQuery } from '@tanstack/react-query';
import { bookingService } from '@digilist/client-sdk';
import { transformBooking } from '@digilist/client-sdk/transforms';

function useBooking(id: string) {
  return useQuery({
    queryKey: ['booking', id],
    queryFn: async () => {
      const booking = await bookingService.getBookingById(id);
      return transformBooking(booking);
    },
  });
}
```

### In Tables/Lists

```typescript
import { transformOrganizations } from '@digilist/client-sdk/transforms';

const orgs = transformOrganizations(response.data);

<Table
  columns={[
    { header: 'Navn', accessor: 'name' },
    { header: 'Type', accessor: 'actorTypeLabel' },
    { header: 'Status', accessor: 'statusLabel' },
    { header: 'Adresse', accessor: 'formattedAddress' },
  ]}
  data={orgs}
/>
```

### Utility Functions

All transformers export utility functions for individual data transformations:

```typescript
import {
  getListingTypeLabel,
  getBookingStatusLabel,
  getBookingStatusColor,
  formatPrice,
  formatDuration,
  getRatingStars,
} from '@digilist/client-sdk/transforms';

// Use individually
const typeLabel = getListingTypeLabel('SPACE'); // "Lokale"
const statusLabel = getBookingStatusLabel('confirmed'); // "Bekreftet"
const statusColor = getBookingStatusColor('confirmed'); // "success"
const price = formatPrice(500, 'NOK'); // "500 NOK"
const duration = formatDuration(120); // "2t 0min"
const stars = getRatingStars(4.5); // "★★★★½"
```

## Type Safety

All transformers provide full TypeScript type definitions:

```typescript
import type {
  TransformedListing,
  TransformedBooking,
  TransformedOrganization,
  TransformedUser,
  TransformedReview,
  TransformedSeason,
} from '@digilist/client-sdk/transforms';

// Type-safe component props
interface ListingCardProps {
  listing: TransformedListing;
}

// Type-safe state
const [booking, setBooking] = useState<TransformedBooking | null>(null);

// Type-safe function params
function displayBooking(booking: TransformedBooking) {
  return `${booking.time.displayDateTime} - ${booking.statusLabel}`;
}
```

## Adding New Transformers

To add a new transformer:

1. Create `<entity>.transform.ts` in this directory
2. Define `Transformed<Entity>` interface
3. Implement `transform<Entity>()` function
4. Add utility functions for labels/formatting
5. Export from `index.ts`
6. Add tests (optional but recommended)

Example structure:

```typescript
/**
 * Entity Transformers
 */

import type { Entity, EntityStatus } from '../types';

// UI Types
export interface TransformedEntity {
  id: string;
  name: string;
  status: EntityStatus;
  statusLabel: string;
  statusColor: 'success' | 'warning' | 'danger' | 'neutral';
  displayField: string;
}

// Labels
const STATUS_LABELS: Record<EntityStatus, string> = {
  active: 'Aktiv',
  inactive: 'Inaktiv',
};

// Utility Functions
export function getStatusLabel(status: EntityStatus): string {
  return STATUS_LABELS[status] || status;
}

// Main Transform
export function transformEntity(entity: Entity): TransformedEntity {
  return {
    id: entity.id,
    name: entity.name,
    status: entity.status,
    statusLabel: getStatusLabel(entity.status),
    statusColor: entity.status === 'active' ? 'success' : 'neutral',
    displayField: `${entity.name} (${getStatusLabel(entity.status)})`,
  };
}

// Batch Transform
export function transformEntities(entities: Entity[]): TransformedEntity[] {
  return entities.map(transformEntity);
}
```

## Best Practices

1. **Transform early**: Transform data as soon as you receive it from the API
2. **Transform once**: Don't transform the same data multiple times
3. **Use types**: Always import and use the TypeScript types
4. **Memoize**: Use `useMemo` when transforming in components
5. **Cache**: Store transformed data in React Query cache
6. **Consistent naming**: Use `ui` prefix for transformed data variables
7. **Don't mutate**: Transformers create new objects, never mutate input

## Performance

Transformers are lightweight and performant:

- Pure functions (no side effects)
- No external dependencies
- Minimal object allocation
- Optimized for React rendering
- Can be memoized with `useMemo`

```typescript
// Memoize transformations in components
const uiListings = useMemo(
  () => transformListings(listings),
  [listings]
);
```

## Troubleshooting

**Q: Transform function returns undefined fields**
A: Check that the API data includes the expected fields. Transformers handle missing data gracefully.

**Q: Norwegian labels not displaying**
A: Ensure you're using the transformed data, not raw API data. Check `statusLabel` instead of `status`.

**Q: TypeScript errors on transformed types**
A: Make sure to import types from `@digilist/client-sdk/transforms`, not raw API types.

**Q: Performance issues with large lists**
A: Use `useMemo` to avoid re-transforming on every render. Consider pagination or virtualization.

## Migration Guide

If you're using custom transformation logic in components, migrate to these transformers:

### Before
```typescript
function BookingCard({ booking }) {
  const statusLabel = booking.status === 'confirmed' ? 'Bekreftet' : 'Venter';
  const displayTime = `${new Date(booking.startTime).toLocaleDateString()}`;
  const price = `${booking.totalPrice} ${booking.currency}`;

  return <div>{statusLabel} - {displayTime} - {price}</div>;
}
```

### After
```typescript
import { transformBooking } from '@digilist/client-sdk/transforms';

function BookingCard({ booking }) {
  const uiBooking = useMemo(() => transformBooking(booking), [booking]);

  return (
    <div>
      {uiBooking.statusLabel} - {uiBooking.time.displayDate} - {uiBooking.payment.formatted}
    </div>
  );
}
```

## Support

For questions or issues with transformers:
- Check the TypeScript types for available fields
- Review the transformer source code
- Refer to the API documentation for input data structure
- Create an issue in the repository if you find a bug
