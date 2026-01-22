# Production-Ready Schema-Agnostic SDK Architecture

**Status: ✅ IMPLEMENTED**  
**Date: 2026-01-16**

## Overview

This document describes the production-ready implementation of a schema-agnostic SDK architecture for the Xala/Digilist platform. The architecture ensures that database schema changes do not ripple into the SDK or UI layers.

## Package Structure

```
packages/
├── sdk-core/         # @xala/sdk-core - Generic SDK primitives
├── contracts/        # @xala/contracts - Zod schemas & projections
└── client-sdk/       # @digilist/client-sdk - Domain SDK
```

## @xala/sdk-core

**Purpose**: Generic SDK primitives that never mention domain concepts.

### Modules

#### `/errors`
- `ProblemDetails` - RFC 7807 interface
- `ApiError` - Error class with full RFC 7807 support
  - Status checks: `isValidationError()`, `isAuthError()`, `isRetryable()`
  - Field error extraction: `getFieldErrors()`, `getAllFieldErrors()`
  - Factory methods: `ApiError.network()`, `ApiError.timeout()`

#### `/http`
- `IHttpClient` - Generic HTTP client interface
- `FetchHttpClient` - Browser fetch implementation
  - Auto-parses RFC 7807 errors
  - Configurable timeout
  - Correlation ID injection
- `initializeClient()`, `getClient()` - Client factory

#### `/query`
- `createQueryKeyFactory()` - Type-safe query key factory for React Query
- `mergeQueryKeyFactories()` - Combine multiple factories
- `matchQueryKey()` - Pattern matching for cache invalidation

#### `/retry`
- `withRetry()` - Generic retry with exponential backoff + jitter
- `RetryPolicy` - Configurable retry policies
- DLQ support for failed operations
- Pre-defined policies: `DEFAULT_RETRY_POLICY`, `CRITICAL_RETRY_POLICY`

### Installation

```typescript
import { 
  initializeClient, 
  ApiError, 
  createQueryKeyFactory,
  withRetry 
} from '@xala/sdk-core';
```

## @xala/contracts

**Purpose**: Single source of truth for API contracts.

### Modules

#### `/schemas`
- Common: `UUIDSchema`, `SlugSchema`, `PaginationSchema`
- RentalObject: `CreateRentalObjectSchema`, `UpdateRentalObjectSchema`
- Booking: `CreateBookingSchema`, `BookingStatusSchema`
- Organization: `CreateOrganizationSchema`, `OrganizationBaseSchema`
- User: `CreateUserSchema`, `UserBaseSchema`
- Capabilities: `ActionCodeSchema`, `CapabilitySchema`, `CAPABILITIES`

#### `/projections`
- `RentalObjectCardProjectionSchema` - List view projection
- `RentalObjectDetailsProjectionSchema` - Detail view projection
- `BookingProjectionSchema` - Booking display projection
- `CapabilitiesProjectionSchema` - User capabilities projection
- `OrganizationProjectionSchema`, `UserProjectionSchema`

#### `/types`
- All TypeScript types inferred from Zod schemas

### Installation

```typescript
// Schemas for validation
import { CreateRentalObjectSchema, BookingStatusSchema } from '@xala/contracts/schemas';

// Projections for UI
import { RentalObjectCardProjection, CapabilitiesProjection } from '@xala/contracts/projections';

// Types for type-safety
import type { RentalObject, Booking, Organization } from '@xala/contracts/types';
```

## @digilist/client-sdk

**Purpose**: Domain-specific SDK with React Query hooks.

### Changes Made

1. **Dependencies**: Now depends on `@xala/sdk-core` and `@xala/contracts`
2. **HTTP Client**: Uses `@xala/sdk-core/http`
3. **Errors**: Uses `@xala/sdk-core/errors`
4. **Types**: Re-exports from `@xala/contracts`
5. **Capabilities Hook**: Uses `CapabilitiesProjection` from contracts

### Usage

```typescript
import { useBackofficeCapabilities, useRentalObjects } from '@digilist/client-sdk/hooks';

function MyComponent() {
  const { data: caps } = useBackofficeCapabilities();
  const { data: listings } = useRentalObjects();
  
  if (!caps?.data.capabilities.includes('CAP_RENTAL_OBJECT_VIEW')) {
    return <AccessDenied />;
  }
  
  return <RentalObjectList items={listings.data} />;
}
```

## Data Flow

```
┌─────────────┐     ┌─────────────────┐     ┌────────────┐
│  Database   │────▶│  API Server     │────▶│    SDK     │────▶ UI
│  (Schema)   │     │  (Projections)  │     │ (Contracts)│
└─────────────┘     └─────────────────┘     └────────────┘
     Private              ACL Layer           Public Contract
```

- **Database Schema**: Internal, can change freely
- **API Projections**: Map DB → projection DTOs
- **SDK Contracts**: Stable types from `@xala/contracts`
- **UI Components**: Consume projections directly

## Testing

### sdk-core Tests
```bash
cd packages/sdk-core && pnpm test
# 37 tests passing
```

### contracts Tests
```bash
cd packages/contracts && pnpm test
# 29 tests passing
```

### Test Coverage
- `ApiError`: Constructor, status checks, field errors, factory methods
- `RetryPolicy`: Backoff calculation, jitter, retryable detection, DLQ
- `QueryKeyFactory`: Key generation, pattern matching, serialization
- `Schemas`: Validation, defaults, transforms
- `Projections`: Shape validation, optional fields

## CI Enforcement

GitHub Actions workflow (`.github/workflows/contracts.yml`):

1. **OpenAPI Breaking Change Check**: Validates contract stability
2. **SDK Parity Snapshot**: Ensures SDK exports match contracts
3. **Contract Export Test**: Verifies all exports are accessible

## Migration Guide

### For API Controllers

```typescript
// Before
import { CreateRentalObjectSchema } from '../../schemas/rental-object.schema';

// After
import { CreateRentalObjectSchema } from '@xala/contracts/schemas';
```

### For SDK Types

```typescript
// Before
import type { RentalObject } from './types';

// After  
import type { RentalObject } from '@xala/contracts/types';
```

### For Frontend Components

```typescript
// Before - using SDK types directly
import type { Listing } from '@digilist/client-sdk/types';

// After - using contract projections
import type { RentalObjectCardProjection } from '@xala/contracts/projections';
```

## Benefits

1. **Schema Changes Isolated**: DB changes only require API-side mapper updates
2. **Type Safety End-to-End**: Zod schemas + TypeScript inference
3. **Consistent Validation**: Same schemas used in API and SDK
4. **RFC 7807 Compliant**: Standardized error handling everywhere
5. **Retry Built-In**: Robust retry with DLQ for critical operations
6. **Query Key Management**: Type-safe cache key factories
7. **CI Protected**: Breaking changes caught before merge

## Files Changed

### New Files
- `packages/sdk-core/*` - Core SDK primitives
- `packages/contracts/*` - API contracts
- `docs/architecture/production-ready-sdk.md` - This document

### Modified Files
- `packages/client-sdk/package.json` - Added dependencies
- `packages/client-sdk/src/core/index.ts` - Re-exports from sdk-core
- `packages/client-sdk/src/types/index.ts` - Re-exports from contracts
- `packages/client-sdk/src/hooks/use-capabilities.ts` - Uses contract types
- `apps/api/src/schemas/index.ts` - Re-exports from contracts
- `apps/api/src/modules/rental-objects/rental-object.projections.ts` - References contract types
- `pnpm-workspace.yaml` - Added new packages
