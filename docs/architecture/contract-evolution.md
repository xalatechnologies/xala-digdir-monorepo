# Contract Evolution Guide

## How to Evolve API Contracts Safely

This guide explains how to make changes to API contracts (schemas, types, projections) without breaking consumers.

## Golden Rules

1. **Never remove a field** without deprecation period
2. **Never change a field type** without versioning
3. **Always add, never modify** existing required fields
4. **Test breaking changes** with CI gate

## Change Categories

### Safe Changes (Non-Breaking)

These changes are always safe:

| Change | Example | Risk |
|--------|---------|------|
| Add optional field | `description?: string` | ✅ None |
| Add new endpoint | `POST /api/v2/bookings` | ✅ None |
| Expand enum | `status: 'draft' | 'published' | 'new'` | ✅ None |
| Add new schema | `SeasonSchema` | ✅ None |
| Add projection field | `formattedPrice: string` | ✅ None |

### Careful Changes (Potentially Breaking)

These require deprecation:

| Change | Migration | Risk |
|--------|-----------|------|
| Rename field | Add alias, deprecate old | ⚠️ Medium |
| Remove optional field | Deprecate, then remove | ⚠️ Medium |
| Change default value | Document in changelog | ⚠️ Low |

### Breaking Changes (Require Version Bump)

These are breaking and require major version:

| Change | Example | Risk |
|--------|---------|------|
| Remove required field | Remove `id` | ❌ High |
| Change field type | `id: string` → `id: number` | ❌ High |
| Narrow enum | Remove status option | ❌ High |
| Remove endpoint | `DELETE /api/listings` | ❌ High |

## Expand-Contract Pattern

For safe schema changes, use the expand-contract pattern:

### Phase 1: Expand (Add New)

```typescript
// Before
const BookingSchema = z.object({
  rentalObjectId: z.string().uuid(),
});

// After - EXPAND: add new field alongside old
const BookingSchema = z.object({
  rentalObjectId: z.string().uuid(),          // Keep old
  listingId: z.string().uuid().optional(),    // Add new
});
```

### Phase 2: Migrate

Update all consumers to use the new field:

```typescript
// API: Map old field to new
if (data.rentalObjectId && !data.listingId) {
  data.listingId = data.rentalObjectId;
}

// SDK: Use new field
const listingId = booking.listingId ?? booking.rentalObjectId;

// UI: Update components
<BookingCard listingId={booking.listingId} />
```

### Phase 3: Contract (Remove Old)

After deprecation period (typically 2-4 weeks):

```typescript
// Remove old field
const BookingSchema = z.object({
  listingId: z.string().uuid(),  // Now required
});
```

## Example: Renaming a Concept

Let's rename "facility" to "listing" across the system:

### Step 1: Add Aliases in Contracts

```typescript
// @xala/contracts/schemas/rental-object.schema.ts
export const RentalObjectSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  
  // New field
  listingType: z.string().optional(),
  
  // Old field (deprecated)
  /** @deprecated Use listingType instead */
  facilityType: z.string().optional(),
});
```

### Step 2: Update API Mappers

```typescript
// apps/api/src/modules/rental-objects/rental-object.mapper.ts
function toProjection(entity: RentalObjectEntity): RentalObjectProjection {
  return {
    id: entity.id,
    name: entity.name,
    listingType: entity.type,           // New name
    facilityType: entity.type,          // Old name (deprecated)
  };
}
```

### Step 3: Update SDK Hooks

```typescript
// packages/client-sdk/src/hooks/use-rental-objects.ts
export function useRentalObjects() {
  return useQuery({
    queryKey: queryKeys.rentalObjects.all,
    queryFn: () => rentalObjectService.getAll(),
    select: (data) => data.map(item => ({
      ...item,
      // Support both old and new consumers
      listingType: item.listingType ?? item.facilityType,
    })),
  });
}
```

### Step 4: Update UI Gradually

```tsx
// apps/web/src/components/RentalCard.tsx
function RentalCard({ item }: { item: RentalObjectCardProjection }) {
  // Use new field, fallback to old
  const type = item.listingType ?? item.facilityType;
  
  return <Card>{type}</Card>;
}
```

### Step 5: Remove Deprecated Field

After all consumers migrated (verify with CI):

```typescript
// Remove facilityType from schema
export const RentalObjectSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  listingType: z.string(),  // Now required, sole field
});
```

## CI Gates

The contracts CI workflow detects breaking changes:

```yaml
# .github/workflows/contracts.yml
- name: Check for breaking changes
  run: oasdiff breaking base-openapi.yaml current-openapi.yaml --fail-on ERR
```

### What CI Catches

- ✅ Removed endpoints
- ✅ Removed required fields
- ✅ Changed field types
- ✅ Narrowed enums
- ✅ Changed status codes

### What CI Allows

- ✅ New endpoints
- ✅ New optional fields
- ✅ Expanded enums
- ✅ New schemas

## Versioning Strategy

For major changes, use API versioning:

```typescript
// Version in path
POST /api/v1/bookings  // Old
POST /api/v2/bookings  // New

// Version in header
X-API-Version: 2

// Version in contracts
import { BookingSchemaV2 } from '@xala/contracts/schemas';
```

## Checklist for Schema Changes

- [ ] Is this a safe change (adding optional field)?
- [ ] If renaming, did I add an alias first?
- [ ] Did I update the ACL mapper?
- [ ] Did I update projections?
- [ ] Did I run the contracts CI locally?
- [ ] Did I update SDK hooks to support both?
- [ ] Did I add deprecation notice to old field?
- [ ] Did I update documentation?

## See Also

- [Schema-Agnostic SDK](./schema-agnostic-sdk.md)
- [Projection Strategy](./projections.md)
- [ACL Mapping](./acl-mapping.md)
