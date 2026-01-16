# @xala/contracts

Shared API contracts: Zod schemas, TypeScript types, and UI projections.

## Overview

This package is the **single source of truth** for all API contracts in the Digilist platform. It provides:

- **Zod Schemas** - For runtime validation in API and SDK
- **TypeScript Types** - Derived from schemas via `z.infer<>`
- **Projection Schemas** - UI-ready DTOs with pre-computed display fields

## Installation

```bash
pnpm add @xala/contracts
```

## Usage

### Schemas (for validation)

```typescript
import {
  RentalObjectSchema,
  CreateRentalObjectSchema,
  BookingSchema,
} from '@xala/contracts/schemas';

// Validate incoming data
const parsed = RentalObjectSchema.parse(data);

// Validate with partial data
const updates = UpdateRentalObjectSchema.parse(partialData);
```

### Types (for type annotations)

```typescript
import type {
  RentalObject,
  Booking,
  User,
  CreateBookingDTO,
} from '@xala/contracts/types';

function processBooking(booking: Booking): void {
  console.log(booking.status);
}

function createBooking(dto: CreateBookingDTO): Promise<Booking> {
  // ...
}
```

### Projections (for UI)

```typescript
import type {
  RentalObjectCardProjection,
  BookingDetailsProjection,
} from '@xala/contracts/projections';

// React component
function RentalCard({ data }: { data: RentalObjectCardProjection }) {
  return (
    <Card>
      <h3>{data.name}</h3>
      <p>{data.priceDisplay}</p>
      <Badge>{data.typeLabel}</Badge>
    </Card>
  );
}
```

## Package Structure

```
packages/contracts/
├── src/
│   ├── schemas/           # Zod validation schemas
│   │   ├── common.schema.ts
│   │   ├── rental-object.schema.ts
│   │   ├── booking.schema.ts
│   │   ├── organization.schema.ts
│   │   ├── user.schema.ts
│   │   └── capabilities.schema.ts
│   ├── projections/       # UI-ready projection schemas
│   │   ├── rental-object.projection.ts
│   │   ├── booking.projection.ts
│   │   ├── organization.projection.ts
│   │   └── user.projection.ts
│   ├── types/             # Re-exported TypeScript types
│   │   └── index.ts
│   └── index.ts           # Main entry point
└── package.json
```

## Schema vs Projection

| Concept | Purpose | Example |
|---------|---------|---------|
| **Schema** | Validation & storage | `RentalObjectSchema` |
| **Projection** | UI display | `RentalObjectCardProjection` |

**Schemas** represent the canonical data model with all fields.

**Projections** are UI-optimized with:
- Pre-computed display strings (`priceDisplay`, `statusLabel`)
- Truncated content (`descriptionExcerpt`)
- Permissions (`canEdit`, `canBook`)
- i18n keys (`categoryI18nKey`)

## Adding New Contracts

### 1. Create Schema

```typescript
// src/schemas/new-entity.schema.ts
import { z } from 'zod';
import { UUIDSchema, TimestampsSchema } from './common.schema';

export const NewEntitySchema = z.object({
  id: UUIDSchema,
  name: z.string().min(1),
  // ...
}).merge(TimestampsSchema);

export type NewEntity = z.infer<typeof NewEntitySchema>;
```

### 2. Create Projection

```typescript
// src/projections/new-entity.projection.ts
import { z } from 'zod';

export const NewEntityCardProjectionSchema = z.object({
  id: z.string(),
  name: z.string(),
  displayLabel: z.string(),
  // Pre-computed fields
});

export type NewEntityCardProjection = z.infer<typeof NewEntityCardProjectionSchema>;
```

### 3. Export

```typescript
// src/schemas/index.ts
export * from './new-entity.schema';

// src/projections/index.ts
export * from './new-entity.projection';

// src/types/index.ts
export type { NewEntity, NewEntityCardProjection } from '...';
```

## OpenAPI Generation

Generate OpenAPI spec from Zod schemas:

```bash
pnpm openapi:generate
```

This creates `openapi.yaml` from all schemas using `@anatine/zod-openapi`.

## License

MIT
