# Schema-Agnostic SDK Architecture

## Overview

The Digilist SDK is designed to be **schema-agnostic**: database schema changes do not require SDK or UI changes. This is achieved through a **contract-driven architecture** where API contracts are the source of truth.

```
┌─────────────────────────────────────────────────────────────┐
│                    DATABASE (Private)                       │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Tables    │  │   Indexes   │  │  Triggers   │        │
│  └──────┬──────┘  └─────────────┘  └─────────────┘        │
│         │                                                   │
│         ▼                                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │           Repository Layer (ACL Mappers)            │   │
│  │     DB Entity → Domain Model → Projection DTO       │   │
│  └──────────────────────┬──────────────────────────────┘   │
│                         │                                   │
└─────────────────────────┼───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                   API Layer (Contract)                      │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │    @xala/contracts (Single Source of Truth)         │   │
│  │                                                      │   │
│  │  • Zod Schemas (validation)                         │   │
│  │  • TypeScript Types (z.infer<>)                     │   │
│  │  • Projection Schemas (UI-ready DTOs)               │   │
│  │  • OpenAPI Spec (auto-generated)                    │   │
│  └──────────────────────┬──────────────────────────────┘   │
│                         │                                   │
└─────────────────────────┼───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                      SDK Layer                              │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              @xala/sdk-core (Generic)               │   │
│  │                                                      │   │
│  │  • HttpClient (fetch-based)                         │   │
│  │  • RFC 7807 Error Handling                          │   │
│  │  • Query Key Factory                                │   │
│  │  • Retry with DLQ                                   │   │
│  └──────────────────────┬──────────────────────────────┘   │
│                         │                                   │
│  ┌──────────────────────┴──────────────────────────────┐   │
│  │            @digilist/client-sdk (Domain)            │   │
│  │                                                      │   │
│  │  • Domain Services (rentalObjectService, etc.)      │   │
│  │  • React Query Hooks (useRentalObjects, etc.)       │   │
│  │  • Types from @xala/contracts                       │   │
│  └──────────────────────┬──────────────────────────────┘   │
│                         │                                   │
└─────────────────────────┼───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                      UI Layer                               │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                  React Apps                          │   │
│  │                                                      │   │
│  │  • Import hooks from @digilist/client-sdk            │   │
│  │  • Import types from @xala/contracts                 │   │
│  │  • Render Projection DTOs directly                   │   │
│  │  • NO business logic, NO transformers                │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Package Responsibilities

| Package | Purpose | Schema-Agnostic? |
|---------|---------|------------------|
| `@xala/sdk-core` | Generic HTTP client, errors, retry | ✅ Fully generic |
| `@xala/contracts` | Zod schemas, types, projections | ✅ Contract only |
| `@digilist/client-sdk` | Domain services, hooks | ✅ Uses contracts |

## Key Principles

### 1. Contracts are Source of Truth

All types and validation schemas come from `@xala/contracts`. The API validates requests using these schemas, and the SDK uses the derived types.

```typescript
// @xala/contracts/schemas/booking.schema.ts
export const BookingSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(['pending', 'confirmed', 'cancelled']),
  // ...
});

export type Booking = z.infer<typeof BookingSchema>;
```

### 2. Database Schema is Private

The database schema can change without affecting the SDK or UI. The API's repository layer (ACL) maps DB entities to domain models, then to projection DTOs.

```
DB Entity → Domain Model → Projection DTO
     ↑           ↑              ↑
   Private    Internal       Public
(can change) (stable)     (contract)
```

### 3. UI Uses Projections

UI components receive **projection DTOs** - display-ready data structures with pre-computed fields:

```typescript
// Projection DTO from API
interface RentalObjectCardProjection {
  id: string;
  name: string;
  priceDisplay: string;       // "500 kr/time" (pre-formatted)
  categoryI18nKey: string;    // "categories.sports" (i18n key)
  isAvailable: boolean;       // Pre-computed availability
  canBook: boolean;           // Permission from RBAC
}
```

### 4. RFC 7807 End-to-End

All errors follow RFC 7807 Problem Details format:

```typescript
interface ProblemDetails {
  type: string;      // "/errors/not-found"
  title: string;     // "Not Found"
  status: number;    // 404
  detail?: string;   // "Booking with ID xyz not found"
}
```

## Import Guidelines

### Recommended Imports

```typescript
// Types from contracts (for type annotations)
import type {
  RentalObject,
  Booking,
  RentalObjectCardProjection,
} from '@xala/contracts';

// SDK hooks (for data fetching)
import { useRentalObjects, useBooking } from '@digilist/client-sdk/hooks';

// SDK services (for mutations)
import { bookingService } from '@digilist/client-sdk/services';
```

### Deprecated Imports

```typescript
// ❌ Don't import types from SDK directly
import type { RentalObject } from '@digilist/client-sdk/types';

// ❌ Don't import from internal SDK paths
import { RentalObjectSchema } from '@digilist/client-sdk/src/types/rental-object';
```

## Benefits

1. **Schema Rename Safety** - Renaming a DB column doesn't touch SDK/UI
2. **Type Consistency** - API, SDK, and UI share same types
3. **Validation Reuse** - Same Zod schemas validate everywhere
4. **OpenAPI Generation** - Docs auto-generated from schemas
5. **Breaking Change Detection** - CI catches contract changes
6. **Cleaner UI Code** - No transformers, mappers, or business logic

## See Also

- [Contract Evolution Guide](./contract-evolution.md)
- [Projection Strategy](./projections.md)
- [ACL Mapping](./acl-mapping.md)
