# @xala/contracts - AGENTS.md

Guidance for agentic coding assistants working with the Contracts package.

## Package Overview

`@xala/contracts` is the **single source of truth** for API contracts across the Xala platform. It contains Zod schemas, TypeScript types, and projection definitions used by both the API and SDK.

## Module Structure

```
packages/contracts/
├── src/
│   ├── schemas/          # Zod validation schemas
│   │   ├── common.schema.ts       # UUID, pagination, etc.
│   │   ├── rental-object.schema.ts
│   │   ├── booking.schema.ts
│   │   ├── organization.schema.ts
│   │   ├── user.schema.ts
│   │   ├── capabilities.schema.ts
│   │   └── index.ts
│   ├── projections/      # UI-ready projection schemas
│   │   ├── rental-object.projection.ts
│   │   ├── booking.projection.ts
│   │   ├── organization.projection.ts
│   │   ├── user.projection.ts
│   │   ├── capabilities.projection.ts
│   │   └── index.ts
│   ├── types/            # TypeScript type exports
│   │   └── index.ts
│   ├── openapi/          # OpenAPI generation
│   │   └── generator.ts
│   └── index.ts
├── __tests__/            # Unit tests
├── package.json
├── tsup.config.ts
└── vitest.config.ts
```

## Essential Commands

```bash
# Build package
pnpm build

# Run tests
pnpm test

# Type check
pnpm typecheck

# Generate OpenAPI spec (if configured)
pnpm openapi:generate
```

## Key Exports

### /schemas
- Common: `UUIDSchema`, `SlugSchema`, `PaginationSchema`, `SortOrderSchema`
- RentalObject: `CreateRentalObjectSchema`, `UpdateRentalObjectSchema`
- Booking: `CreateBookingSchema`, `BookingStatusSchema`
- Organization: `CreateOrganizationSchema`
- User: `CreateUserSchema`
- Capabilities: `CapabilitySchema`, `ActionCodeSchema`, `CAPABILITIES`

### /projections
- `RentalObjectCardProjectionSchema` - List view projection
- `RentalObjectDetailsProjectionSchema` - Detail view projection
- `BookingProjectionSchema` - Booking display data
- `CapabilitiesProjectionSchema` - User capabilities
- `OrganizationProjectionSchema`, `UserProjectionSchema`

### /types
- All TypeScript types inferred from Zod schemas

## Code Style Guidelines

### Schema Definition Pattern
```typescript
// Define schema with Zod
export const UserSchema = z.object({
  id: UUIDSchema,
  email: z.string().email(),
  name: z.string().min(1).max(255),
});

// Infer TypeScript type
export type User = z.infer<typeof UserSchema>;
```

### Projection Pattern
```typescript
// Projections extend base schemas with computed fields
export const UserProjectionSchema = z.object({
  id: z.string(),
  displayName: z.string(),      // Pre-computed
  avatarUrl: z.string().optional(),
  roleLabel: z.string(),        // i18n key for role
  canEdit: z.boolean(),         // Permission flag
  availableActions: z.array(z.string()),
});
```

### No Business Logic
```typescript
// ❌ WRONG - Logic in schema
export const BookingSchema = z.object({
  status: z.string(),
  canCancel: z.boolean().default(status === 'pending'), // ❌ Logic!
});

// ✅ CORRECT - Pure schema
export const BookingSchema = z.object({
  status: z.string(),
  canCancel: z.boolean(),  // Computed by API, not schema
});
```

## Integration Points

### API Usage
```typescript
// In apps/api
import { CreateRentalObjectSchema } from '@xala/contracts/schemas';

const data = CreateRentalObjectSchema.parse(request.body);
```

### SDK Usage
```typescript
// In packages/client-sdk
import type { RentalObjectCardProjection } from '@xala/contracts/projections';

async function getListings(): Promise<RentalObjectCardProjection[]> { ... }
```

### Frontend Usage
```typescript
// In apps/web
import type { CapabilitiesProjection } from '@xala/contracts/projections';

function CapabilityGuard({ data }: { data: CapabilitiesProjection }) { ... }
```

## When Modifying This Package

1. **Schema changes are breaking changes** - Coordinate with API team
2. **Add tests for all schemas** - Validation must be verified
3. **Update projections if API changes** - Keep in sync
4. **Rebuild dependent packages**:
   ```bash
   pnpm --filter @digilist/client-sdk build
   pnpm --filter @digilist/api typecheck
   ```
5. **Run CI checks** - OpenAPI diff will catch breaking changes

## Contract Evolution Rules

1. **ADDITIVE ONLY** - Never remove fields without deprecation period
2. **OPTIONAL NEW FIELDS** - New fields must be optional
3. **DEPRECATION MARKERS** - Mark deprecated fields with JSDoc
4. **VERSION IN TYPES** - Consider versioned projections for major changes
