# @digilist/contracts - Domain Contracts

> **Extends:** [Root CLAUDE.md](../../CLAUDE.md)

## Purpose

`@digilist/contracts` contains **domain-specific** API contracts for the Digilist rental booking platform. This package is separate from `@xala/contracts` (platform-agnostic contracts) to enable platform decoupling.

**Package Name:** `@digilist/contracts`
**Status:** Production Active

---

## Domain vs Platform Separation

This package contains schemas and projections specific to the **rental booking domain**:

| Domain Contract (This Package) | Platform Contract (@xala/contracts) |
|-------------------------------|-------------------------------------|
| RentalObjectSchema | PaginationSchema |
| BookingSchema | UUIDSchema |
| BookingStatusSchema | RFC7807 ProblemDetailsSchema |
| RentalObjectProjection | SortOrderSchema |
| BookingProjection | TimestampsSchema |

---

## Module Structure

```
packages/digilist-contracts/
├── src/
│   ├── index.ts              # Main exports
│   ├── schemas/
│   │   ├── index.ts
│   │   ├── rental-object.schema.ts
│   │   └── booking.schema.ts
│   ├── projections/
│   │   ├── index.ts
│   │   ├── rental-object.projection.ts
│   │   └── booking.projection.ts
│   └── types/
│       └── index.ts          # TypeScript type exports
├── package.json
├── tsconfig.json
└── CLAUDE.md
```

---

## Usage

### In SDK Services
```typescript
import { RentalObjectSchema, BookingSchema } from '@digilist/contracts/schemas';
import type { RentalObject, Booking } from '@digilist/contracts/types';
```

### In API Validation
```typescript
import { CreateBookingSchema } from '@digilist/contracts/schemas';

const validated = CreateBookingSchema.safeParse(request.body);
```

### In Frontend Components
```typescript
import type { RentalObjectCardProjection } from '@digilist/contracts/projections';

function ListingCard({ listing }: { listing: RentalObjectCardProjection }) {
  // ...
}
```

---

## Dependencies

- **@xala/contracts** - Platform-agnostic contracts (pagination, common schemas)
- **zod** - Schema validation

---

## Non-Negotiable Rules

1. **DOMAIN-SPECIFIC ONLY** - Only rental/booking domain schemas here
2. **NO PLATFORM SCHEMAS** - Pagination, RFC7807, etc. stay in @xala/contracts
3. **SINGLE SOURCE OF TRUTH** - All rental/booking types defined here
4. **ZOD SCHEMAS FIRST** - TypeScript types inferred from Zod

---

**Last Updated:** 2026-01-20
**Status:** New Package - Platform Decoupling Phase 0
