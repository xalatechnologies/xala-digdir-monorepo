# Runbook: Add New UI Component

> **Step-by-step guide for adding a new UI component**
> **Layer:** Runbooks

---

## Decision Tree

```
Is this component domain-specific?
├── YES → Create in @digilist/ui/features/
│         (thin wrapper over platform pattern)
└── NO
    └── Is this a reusable pattern?
        ├── YES → Create in @xalatechnologies/platform/ui/patterns/
        └── NO → Use existing primitives from @xalatechnologies/platform/ui
```

---

## Path A: Platform UI Pattern

Use this when creating a reusable, domain-agnostic pattern.

### Step 1: Define Props Interface

```typescript
// packages/platform/src/ui/patterns/LocationCard/types.ts
export interface LocationCardProps {
  /** Card title */
  title: string;
  /** Address or location description */
  address: string;
  /** Optional image URL */
  imageUrl?: string;
  /** Coordinates for map */
  coordinates?: {
    lat: number;
    lng: number;
  };
  /** Click handler */
  onClick?: () => void;
  /** Open directions handler */
  onDirections?: () => void;
}
```

### Step 2: Create Component

```tsx
// packages/platform/src/ui/patterns/LocationCard/LocationCard.tsx
import { Card, Heading, Paragraph, Button } from '@digdir/designsystemet-react';
import type { LocationCardProps } from './types';

export function LocationCard({
  title,
  address,
  imageUrl,
  coordinates,
  onClick,
  onDirections,
}: LocationCardProps) {
  return (
    <Card onClick={onClick} className="location-card">
      {imageUrl && (
        <img src={imageUrl} alt={title} className="location-card__image" />
      )}
      <Card.Header>
        <Heading level={3} size="sm">{title}</Heading>
      </Card.Header>
      <Card.Content>
        <Paragraph size="sm">{address}</Paragraph>
      </Card.Content>
      {onDirections && coordinates && (
        <Card.Footer>
          <Button variant="secondary" size="sm" onClick={onDirections}>
            Get directions
          </Button>
        </Card.Footer>
      )}
    </Card>
  );
}
```

### Step 3: Export from Index

```typescript
// packages/platform/src/ui/patterns/LocationCard/index.ts
export { LocationCard } from './LocationCard';
export type { LocationCardProps } from './types';

// packages/platform/src/ui/patterns/index.ts
export { LocationCard, type LocationCardProps } from './LocationCard';
```

### Step 4: Add Storybook Story

```tsx
// packages/platform/src/ui/patterns/LocationCard/LocationCard.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { LocationCard } from './LocationCard';

const meta: Meta<typeof LocationCard> = {
  title: 'Patterns/LocationCard',
  component: LocationCard,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof LocationCard>;

export const Default: Story = {
  args: {
    title: 'Main Office',
    address: '123 Business Street, Oslo',
  },
};

export const WithImage: Story = {
  args: {
    title: 'Community Center',
    address: '456 Community Lane, Bergen',
    imageUrl: 'https://example.com/image.jpg',
    coordinates: { lat: 60.39, lng: 5.32 },
  },
};
```

---

## Path B: Domain Feature Kit

Use this when creating a domain-specific component that wraps a platform pattern.

### Step 1: Identify Platform Pattern to Wrap

Check `@xalatechnologies/platform/ui/patterns/` for existing patterns.

### Step 2: Create Mapper Function

```typescript
// packages/digilist-ui/src/features/rental-objects/mappers.ts
import type { ResourceCardProps } from '@xalatechnologies/platform/ui/patterns';
import type { RentalObjectDTO } from '@digilist/domain';

export function mapRentalObjectToResourceCard(
  dto: RentalObjectDTO,
  t: (key: string) => string
): ResourceCardProps {
  return {
    id: dto.id,
    title: dto.name,
    subtitle: dto.categoryName,
    imageUrl: dto.images[0]?.url,
    imageAlt: dto.name,
    badges: dto.badges.map(badge => ({
      label: t(`badge.${badge}`),
      variant: 'info' as const,
    })),
    features: dto.amenities.slice(0, 4).map(amenity => ({
      icon: amenity.icon,
      label: t(`amenity.${amenity.key}`),
    })),
    pricing: dto.pricePerHour ? {
      amount: dto.pricePerHour,
      currency: 'NOK',
      unit: t('common.perHour'),
    } : undefined,
    rating: dto.averageRating,
    reviewCount: dto.reviewCount,
    available: dto.isAvailable,
    availabilityLabel: dto.isAvailable
      ? t('availability.available')
      : t('availability.unavailable'),
  };
}
```

### Step 3: Create Thin Wrapper Component

```tsx
// packages/digilist-ui/src/features/rental-objects/RentalObjectCard.tsx
import { ResourceCard } from '@xalatechnologies/platform/ui/patterns';
import { mapRentalObjectToResourceCard } from './mappers';
import type { RentalObjectDTO } from '@digilist/domain';

export interface RentalObjectCardProps {
  rentalObject: RentalObjectDTO;
  onClick?: () => void;
  onFavorite?: (id: string) => void;
  t: (key: string) => string;
}

/**
 * RentalObjectCard - Thin wrapper over ResourceCard
 * Maps Digilist rental object DTO to generic resource card props.
 */
export function RentalObjectCard({
  rentalObject,
  onClick,
  onFavorite,
  t,
}: RentalObjectCardProps) {
  const cardProps = mapRentalObjectToResourceCard(rentalObject, t);

  return (
    <ResourceCard
      {...cardProps}
      onClick={onClick}
      onFavorite={onFavorite ? () => onFavorite(rentalObject.id) : undefined}
    />
  );
}
```

### Step 4: Export from Feature Kit

```typescript
// packages/digilist-ui/src/features/rental-objects/index.ts
export { RentalObjectCard, type RentalObjectCardProps } from './RentalObjectCard';
export { mapRentalObjectToResourceCard } from './mappers';

// packages/digilist-ui/src/features/index.ts
export * from './rental-objects';
export * from './booking';
export * from './seasons';
```

---

## Path C: Composite from Existing

When you need a component that's just a composition of existing ones.

```tsx
// apps/web/src/pages/RentalObjectsPage.tsx
import { ResourceGrid } from '@xalatechnologies/platform/ui/patterns';
import { RentalObjectCard } from '@digilist/ui/features/rental-objects';
import { FilterBar, Pagination } from '@xalatechnologies/platform/ui';
import { useRentalObjects } from '@digilist/sdk/hooks';
import { useT } from '@xalatechnologies/platform/i18n';

// No new component needed - just compose in page
export function RentalObjectsPage() {
  const t = useT();
  const { data: objects, isLoading } = useRentalObjects();

  return (
    <PageLayout>
      <FilterBar />
      <ResourceGrid columns={{ sm: 1, md: 2, lg: 3 }}>
        {objects?.map(obj => (
          <RentalObjectCard
            key={obj.id}
            rentalObject={obj}
            t={t}
          />
        ))}
      </ResourceGrid>
      <Pagination />
    </PageLayout>
  );
}
```

---

## Verification Checklist

### For Platform Patterns

- [ ] Component is domain-agnostic (no booking/rental/etc. terms)
- [ ] Props are pre-localized strings (no i18n keys)
- [ ] Uses Designsystemet primitives internally
- [ ] Storybook story added
- [ ] Types exported
- [ ] No `@digilist/*` imports

### For Feature Kits

- [ ] Wrapper is thin (<50 lines)
- [ ] Mapper function handles all DTO → Props conversion
- [ ] Uses platform pattern as base
- [ ] Accepts `t` function for localization
- [ ] Types exported

### Build Verification

```bash
# Build packages
pnpm -F @xalatechnologies/platform build
pnpm -F @digilist/ui build

# Type check
pnpm typecheck

# Verify no boundary violations
pnpm verify:boundaries

# Run Storybook
pnpm -F @xalatechnologies/platform storybook
```

---

## Anti-Patterns to Avoid

```tsx
// ❌ FORBIDDEN - Business logic in component
function RentalObjectCard({ obj }) {
  const canBook = obj.status === 'available' && obj.price > 0;
  // Logic should be in API/DTO
}

// ❌ FORBIDDEN - Direct @digdir import in feature kit
import { Card } from '@digdir/designsystemet-react';

// ❌ FORBIDDEN - Hardcoded strings
<Badge>Available</Badge>  // Should use t()

// ❌ FORBIDDEN - Domain component in platform
// packages/platform/src/ui/patterns/BookingCard.tsx
```
