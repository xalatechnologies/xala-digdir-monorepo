# Projection Strategy

## What are Projections?

Projections are **UI-ready data transfer objects** that contain pre-computed, display-ready fields. They eliminate the need for business logic in UI components.

## Schema vs Projection

| Concept | Purpose | Contains | Where Used |
|---------|---------|----------|------------|
| **Schema** | Storage & validation | Raw data, DB fields | API, Database |
| **Projection** | UI display | Formatted strings, computed fields | SDK, UI |

### Example: Rental Object

**Schema** (raw data):

```typescript
interface RentalObject {
  id: string;
  name: string;
  category: 'LOKALER_OG_BANER' | 'UTSTYR_OG_INVENTAR' | ...;
  pricing: {
    basePrice: number;
    currency: string;
    unit: 'hour' | 'day' | 'week';
  };
  status: 'draft' | 'published' | 'archived';
  location: {
    address: string;
    city: string;
    postalCode: string;
  };
}
```

**Projection** (display-ready):

```typescript
interface RentalObjectCardProjection {
  id: string;
  name: string;
  
  // Pre-formatted strings
  priceDisplay: string;           // "500 kr/time"
  locationFormatted: string;      // "Storgata 1, 0155 Oslo"
  
  // i18n keys (for translation)
  categoryI18nKey: string;        // "categories.sports"
  statusLabel: string;            // "status.published"
  
  // Pre-computed booleans
  isAvailable: boolean;
  isFeatured: boolean;
  
  // Permissions (from RBAC)
  canBook: boolean;
  canEdit: boolean;
}
```

## Projection Types

### 1. Card Projection

Minimal data for list/grid views:

```typescript
interface RentalObjectCardProjection {
  id: string;
  name: string;
  primaryImageUrl?: string;
  priceDisplay: string;
  categoryI18nKey: string;
  isAvailable: boolean;
}
```

**Use case:** Listing pages, search results, carousels

### 2. Details Projection

Full data for detail pages:

```typescript
interface RentalObjectDetailsProjection extends RentalObjectCardProjection {
  description: string;
  images: Array<{ url: string; alt: string }>;
  location: { address: string; coordinates: { lat: number; lng: number } };
  pricing: { formattedPrice: string; breakdown: PriceBreakdown[] };
  
  // Actions based on permissions
  canBook: boolean;
  canEdit: boolean;
  availableActions: Action[];
}
```

**Use case:** Detail pages, modals

### 3. Search Result Projection

Card projection with search metadata:

```typescript
interface RentalObjectSearchResultProjection extends RentalObjectCardProjection {
  score: number;
  highlights: Record<string, string[]>;
}
```

**Use case:** Search results with highlighting

## Creating Projections (Server-Side)

Projections are built on the server in the repository/mapper layer:

```typescript
// apps/api/src/modules/rental-objects/rental-object.mapper.ts

export function toCardProjection(
  entity: RentalObjectEntity,
  permissions: UserPermissions,
  locale: string = 'nb'
): RentalObjectCardProjection {
  return {
    id: entity.id,
    name: entity.name,
    
    // Format price
    priceDisplay: formatPrice(entity.pricing.basePrice, entity.pricing.currency, entity.pricing.unit, locale),
    
    // i18n key
    categoryI18nKey: `categories.${entity.category.toLowerCase()}`,
    
    // Location
    locationFormatted: entity.location
      ? `${entity.location.address}, ${entity.location.postalCode} ${entity.location.city}`
      : undefined,
    
    // Media
    primaryImageUrl: entity.images?.[0] ?? undefined,
    
    // Computed
    isAvailable: entity.status === 'published',
    isFeatured: entity.metadata?.featured === true,
    
    // Permissions
    canBook: permissions.includes('booking:create'),
    canEdit: permissions.includes('rental_object:update'),
  };
}
```

## Using Projections (UI-Side)

UI components receive projections and render directly:

```tsx
// apps/web/src/components/RentalCard.tsx
import type { RentalObjectCardProjection } from '@xala/contracts/projections';
import { useT } from '@xala/i18n';

function RentalCard({ data }: { data: RentalObjectCardProjection }) {
  const t = useT();
  
  return (
    <Card>
      {data.primaryImageUrl && <Image src={data.primaryImageUrl} alt={data.name} />}
      
      <Heading>{data.name}</Heading>
      
      {/* Use pre-formatted price */}
      <Text>{data.priceDisplay}</Text>
      
      {/* Use i18n key */}
      <Badge>{t(data.categoryI18nKey)}</Badge>
      
      {/* Use pre-computed availability */}
      {data.isAvailable ? (
        <Button disabled={!data.canBook}>
          {t('common.book')}
        </Button>
      ) : (
        <Badge variant="warning">{t('status.unavailable')}</Badge>
      )}
    </Card>
  );
}
```

**Key point:** The component has NO business logic. It just renders.

## Projection Fields

### Display Strings

Pre-formatted text for direct rendering:

```typescript
priceDisplay: string;        // "500 kr/time"
dateDisplay: string;         // "15. januar 2026"
durationDisplay: string;     // "2 timer"
locationFormatted: string;   // "Storgata 1, 0155 Oslo"
```

### i18n Keys

Translation keys for multi-language:

```typescript
categoryI18nKey: string;     // "categories.sports"
statusLabel: string;         // "status.published"
typeLabel: string;           // "types.venue"
```

### Truncated Content

Shortened text for cards:

```typescript
descriptionExcerpt: string;  // First 150 chars + "..."
```

### Computed States

Boolean flags for UI logic:

```typescript
isAvailable: boolean;
isFeatured: boolean;
isPast: boolean;
isUpcoming: boolean;
isCancellable: boolean;
```

### Permissions

RBAC-derived flags:

```typescript
canBook: boolean;
canEdit: boolean;
canDelete: boolean;
canApprove: boolean;
```

### Available Actions

Dynamic action list:

```typescript
availableActions: Array<{
  action: string;
  label: string;
  enabled: boolean;
  reason?: string;  // Why disabled
}>;
```

## Benefits

1. **No UI Business Logic** - Components just render
2. **Consistent Formatting** - Server controls all formatting
3. **RBAC Integration** - Permissions computed server-side
4. **i18n Ready** - Keys ready for translation
5. **Performance** - Less client-side computation
6. **Testability** - Easy to test projection builders

## See Also

- [Schema-Agnostic SDK](./schema-agnostic-sdk.md)
- [Contract Evolution](./contract-evolution.md)
- [ACL Mapping](./acl-mapping.md)
