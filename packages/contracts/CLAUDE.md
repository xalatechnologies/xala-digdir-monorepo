# @xala/contracts - CLAUDE.md

This file provides guidance to Claude Code when working with the Contracts package.

---

## Package Purpose

`@xala/contracts` is the **platform-level** contracts package containing ONLY generic, domain-agnostic schemas and types.

**What this package contains:**
1. **RFC7807 Problem Details** - Error response schemas
2. **Pagination** - Generic pagination schemas and types
3. **Common Types** - Timestamps, metadata, currency, identifiers
4. **Module System** - Feature flag module registry and DTOs
5. **Monitoring** - Platform monitoring DTOs

**What this package does NOT contain:**
- Domain-specific schemas (rental-object, booking, organization, user)
- Domain-specific projections
- Domain-specific types

**Domain contracts belong in `@digilist/contracts`** (separate package).

---

## Architecture

```
┌──────────────────────────────────────────────────────┐
│                    Frontend Apps                      │
│  Import domain types from @digilist/contracts        │
│  Import platform types from @xala/contracts          │
├──────────────────────────────────────────────────────┤
│              @digilist/client-sdk                    │
│  Uses both platform and domain contracts             │
├──────────────────────────────────────────────────────┤
│  @digilist/contracts (DOMAIN)    @xala/contracts    │
│  ┌────────────────────────┐     ┌─────────────────┐ │
│  │ RentalObjectSchema     │     │ RFC7807         │ │
│  │ BookingSchema          │     │ Pagination      │ │
│  │ OrganizationSchema     │     │ Timestamps      │ │
│  │ UserSchema             │     │ Module Registry │ │
│  │ Domain Projections     │     │ Monitoring DTOs │ │
│  └────────────────────────┘     └─────────────────┘ │
├──────────────────────────────────────────────────────┤
│                   @digilist/api                       │
│  Uses domain contracts for validation                │
│  Uses platform contracts for error responses         │
└──────────────────────────────────────────────────────┘
```

---

## Module Reference

### /schemas - Platform Schemas

```typescript
import {
  // Pagination
  PaginationSchema,          // { page, limit }
  PaginatedResponseMetaSchema,
  createPaginatedResponseSchema,

  // Sorting
  SortOrderSchema,           // z.enum(['asc', 'desc'])
  createSortableQuerySchema,

  // Identifiers
  UUIDSchema,                // z.string().uuid()
  SlugSchema,                // z.string().regex(/^[a-z0-9-]+$/)

  // Timestamps
  TimestampsSchema,          // { createdAt, updatedAt }

  // Metadata
  MetadataSchema,            // z.record(z.unknown())

  // Currency
  CurrencyCodeSchema,        // z.string().length(3)
  MoneySchema,               // { amount, currency }

  // RFC 7807 Error
  ProblemDetailsSchema,      // { type, title, status, detail, ... }
  FieldErrorSchema,          // { field, message, code }

  // Response Wrappers
  createDataResponseSchema,
  createPaginatedResponseSchema,
} from '@xala/contracts/schemas';
```

### /types - Platform Types

```typescript
import type {
  Pagination,
  PaginatedResponseMeta,
  SortOrder,
  Timestamps,
  Metadata,
  CurrencyCode,
  Money,
  FieldError,
  ProblemDetails,
} from '@xala/contracts/types';
```

### /modules - Module System

Feature flag module registry:

```typescript
import {
  // Module keys
  ModuleKey,
  ModuleKeyType,

  // Domain groups
  DomainGroup,
  DomainGroupType,
  DOMAIN_GROUP_MODULES,

  // Module definitions
  MODULE_REGISTRY,
  ModuleDefinition,
  ModuleCategory,

  // Helper functions
  getModulesByCategory,
  getModuleDependencies,
  getModuleDependents,
  canDisableModule,
  computeCapabilities,
  getAllCapabilities,

  // DTOs
  ModuleDTO,
  ModuleInfoDTO,
  EffectiveModulesDTO,
  UpdateModuleDTO,
} from '@xala/contracts/modules';
```

### /monitoring - Monitoring DTOs

```typescript
import {
  // Overview
  SystemHealthDTO,
  ServiceStatusDTO,

  // Incidents
  IncidentDTO,
  IncidentSeverity,

  // Logs
  LogEntryDTO,
  LogLevel,

  // Audit
  AuditLogDTO,
} from '@xala/contracts/monitoring';
```

### /validation - Environment Validation

```typescript
import {
  webEnvSchema,
  minsideEnvSchema,
  backofficeEnvSchema,
  apiEnvSchema,
  validateEnv,
  createEnvValidator,
} from '@xala/contracts/validation';
```

---

## Usage Patterns

### Error Response (RFC 7807)
```typescript
import { ProblemDetailsSchema } from '@xala/contracts/schemas';
import type { ProblemDetails } from '@xala/contracts/types';

function createError(status: number, title: string, detail?: string): ProblemDetails {
  return {
    type: `/errors/${status}`,
    title,
    status,
    detail,
  };
}
```

### Paginated Response
```typescript
import {
  PaginationSchema,
  createPaginatedResponseSchema
} from '@xala/contracts/schemas';
import { z } from 'zod';

// Validate query params
const query = PaginationSchema.parse(request.query);

// Create response schema for domain type
const ItemResponseSchema = createPaginatedResponseSchema(
  z.object({ id: z.string(), name: z.string() })
);
```

### For Domain Types
```typescript
// Domain-specific contracts are in @digilist/contracts
import { RentalObjectSchema, BookingSchema } from '@digilist/contracts/schemas';
import type { RentalObject, Booking } from '@digilist/contracts/types';
import type { RentalObjectCardProjection } from '@digilist/contracts/projections';
```

---

## Non-Negotiable Rules

1. **PLATFORM ONLY** - Only generic, domain-agnostic schemas
2. **NO DOMAIN SCHEMAS** - Domain schemas go in @digilist/contracts
3. **ZOD SCHEMAS FIRST** - TypeScript types are inferred from Zod
4. **NO BUSINESS LOGIC** - Schemas validate shape, not compute values
5. **ADDITIVE CHANGES ONLY** - Never remove fields without deprecation

---

## What Was Removed

The following were moved to `@digilist/contracts`:
- `schemas/rental-object.schema.ts`
- `schemas/booking.schema.ts`
- `schemas/organization.schema.ts`
- `schemas/user.schema.ts`
- `schemas/capabilities.schema.ts`
- `schemas/custody.schema.ts`
- `projections/*` (all domain projections)
- `storage.ts` (domain entity references)
- `openapi/` (domain-specific OpenAPI generation)

---

## Dependencies

- **zod** - Schema definition and validation
- **tsup** - Build tool
- **vitest** - Testing

## Peer Packages
- Used by `@digilist/contracts` (extends platform schemas)
- Used by `@digilist/client-sdk`
- Used by `@digilist/api`
- Platform types consumed by all apps
