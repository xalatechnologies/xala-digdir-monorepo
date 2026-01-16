# @xala/contracts - CLAUDE.md

This file provides guidance to Claude Code when working with the Contracts package.

---

## Package Purpose

`@xala/contracts` is the **single source of truth** for all API contracts in the Xala platform. It provides:

1. **Zod Schemas** - Validation schemas for API requests/responses
2. **Projections** - UI-ready DTO schemas with pre-computed fields
3. **TypeScript Types** - Inferred from Zod schemas for type safety

**Key Principle**: Database schema is private. This package defines the PUBLIC API contract that SDK and UI consume.

---

## Architecture

```
┌──────────────────────────────────────────────────────┐
│                    Frontend Apps                      │
│  Import types for component props                    │
├──────────────────────────────────────────────────────┤
│              @digilist/client-sdk                    │
│  Import projections for return types                 │
├──────────────────────────────────────────────────────┤
│           @xala/contracts (This Package)             │
│  ┌────────────┐ ┌─────────────┐ ┌───────────────┐   │
│  │  Schemas   │ │ Projections │ │ TypeScript    │   │
│  │  (Zod)     │ │ (UI DTOs)   │ │ Types         │   │
│  └────────────┘ └─────────────┘ └───────────────┘   │
├──────────────────────────────────────────────────────┤
│                   @digilist/api                       │
│  Import schemas for request validation               │
│  Build projections from database entities            │
└──────────────────────────────────────────────────────┘
```

---

## Module Reference

### /schemas - Validation Schemas

#### Common Schemas
```typescript
import {
  UUIDSchema,           // z.string().uuid()
  SlugSchema,           // z.string().regex(/^[a-z0-9-]+$/)
  PaginationSchema,     // { page: z.number(), limit: z.number() }
  SortOrderSchema,      // z.enum(['asc', 'desc'])
  MetadataSchema,       // z.record(z.unknown())
  ProblemDetailsSchema, // RFC 7807 error format
} from '@xala/contracts/schemas';
```

#### Domain Schemas
```typescript
import {
  // Rental Objects
  CreateRentalObjectSchema,
  UpdateRentalObjectSchema,
  RentalObjectQuerySchema,
  RentalObjectCategorySchema,
  BookingTimeModeSchema,
  
  // Bookings
  CreateBookingSchema,
  BookingStatusSchema,
  
  // Organizations
  CreateOrganizationSchema,
  OrganizationBaseSchema,
  
  // Users
  CreateUserSchema,
  UserBaseSchema,
  
  // Capabilities
  CapabilitySchema,
  ActionCodeSchema,
  CAPABILITIES,  // Constant object with all capability codes
} from '@xala/contracts/schemas';
```

### /projections - UI-Ready DTOs

Projections are display-optimized schemas with pre-computed fields:

```typescript
import {
  // Rental Objects
  RentalObjectCardProjectionSchema,    // For list views
  RentalObjectDetailsProjectionSchema, // For detail pages
  
  // Bookings
  BookingProjectionSchema,
  BookingQuoteProjectionSchema,
  
  // Organizations
  OrganizationProjectionSchema,
  
  // Users
  UserProjectionSchema,
  
  // Capabilities
  CapabilitiesProjectionSchema,
} from '@xala/contracts/projections';
```

#### Projection Example
```typescript
const RentalObjectCardProjectionSchema = z.object({
  // Identifiers
  id: z.string(),
  slug: z.string(),
  
  // Display content
  name: z.string(),
  typeLabel: z.string(),           // Pre-computed display label
  categoryI18nKey: z.string(),     // i18n key for translation
  locationFormatted: z.string().optional(),
  priceDisplay: z.string(),        // "100 NOK/time"
  
  // Media
  primaryImageUrl: z.string().optional(),
  
  // Computed states
  isAvailable: z.boolean(),
  isFeatured: z.boolean().optional(),
});

type RentalObjectCardProjection = z.infer<typeof RentalObjectCardProjectionSchema>;
```

### /types - TypeScript Types

All types are inferred from schemas:

```typescript
import type {
  // From schemas
  CreateRentalObject,
  UpdateRentalObject,
  CreateBooking,
  CreateOrganization,
  
  // From projections
  RentalObjectCardProjection,
  RentalObjectDetailsProjection,
  BookingProjection,
  CapabilitiesProjection,
} from '@xala/contracts/types';
```

---

## Usage Patterns

### In API (Validation)
```typescript
import { CreateRentalObjectSchema } from '@xala/contracts/schemas';

// Validate request body
const validated = CreateRentalObjectSchema.safeParse(request.body);
if (!validated.success) {
  return reply.status(422).send({
    type: '/errors/validation',
    title: 'Validation Error',
    status: 422,
    errors: validated.error.flatten().fieldErrors,
  });
}
```

### In SDK (Types)
```typescript
import type { RentalObjectCardProjection } from '@xala/contracts/projections';

export function useRentalObjects() {
  return useQuery<{ data: RentalObjectCardProjection[] }>({
    queryKey: ['rental-objects'],
    queryFn: () => client.get('/api/rental-objects'),
  });
}
```

### In Frontend (Props)
```typescript
import type { RentalObjectCardProjection } from '@xala/contracts/projections';

interface ListingCardProps {
  listing: RentalObjectCardProjection;
}

function ListingCard({ listing }: ListingCardProps) {
  return (
    <Card>
      <img src={listing.primaryImageUrl} alt={listing.name} />
      <h2>{listing.name}</h2>
      <p>{listing.priceDisplay}</p>
    </Card>
  );
}
```

---

## Testing

```bash
# Run all tests
pnpm test

# Watch mode
pnpm test:watch
```

Tests are in `src/__tests__/`:
- `schemas.test.ts` - Schema validation tests
- `projections.test.ts` - Projection schema tests

---

## Non-Negotiable Rules

1. **SINGLE SOURCE OF TRUTH** - Types defined here, not duplicated elsewhere
2. **ZOD SCHEMAS FIRST** - TypeScript types are inferred from Zod
3. **NO BUSINESS LOGIC** - Schemas validate shape, not compute values
4. **ADDITIVE CHANGES ONLY** - Never remove fields without deprecation
5. **ALL SCHEMAS TESTED** - Validation must be verified with tests

---

## Contract Evolution

### Adding a New Field
```typescript
// Step 1: Add as optional
const BookingSchema = z.object({
  // existing fields...
  newField: z.string().optional(),  // ✅ Optional first
});

// Step 2: After all consumers updated, make required (if needed)
```

### Deprecating a Field
```typescript
const BookingSchema = z.object({
  /** @deprecated Use newField instead. Will be removed in v3.0 */
  oldField: z.string().optional(),
  newField: z.string(),
});
```

### Breaking Changes
1. Create versioned schema: `BookingSchemaV2`
2. Support both in API for migration period
3. Deprecate old schema in SDK
4. Remove old schema after migration complete

---

## Dependencies

- **zod** - Schema definition and validation
- **tsup** - Build tool
- **vitest** - Testing

## Peer Packages
- Used by `@digilist/client-sdk`
- Used by `@digilist/api`
- Types consumed by all frontend apps
