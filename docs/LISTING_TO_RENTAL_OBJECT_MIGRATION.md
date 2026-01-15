# Listing → Rental Object Migration Guide

**Status:** ✅ Completed  
**Date:** January 2026  
**Type:** Breaking Change - Complete Terminology Migration

## Table of Contents

1. [Overview](#overview)
2. [Rationale](#rationale)
3. [What Changed](#what-changed)
4. [Migration Guide](#migration-guide)
5. [Breaking Changes](#breaking-changes)
6. [API Changes](#api-changes)
7. [SDK Changes](#sdk-changes)
8. [Type Changes](#type-changes)
9. [Common Issues](#common-issues)
10. [Migration Checklist](#migration-checklist)

---

## Overview

This document describes the complete migration from "listing" terminology to "rental-object" (Norwegian: "utleieobjekt") terminology across the entire Digilist platform. This was a **clean migration with no backward compatibility** - all legacy "listing" code was removed and replaced with the new terminology.

### Key Principles

- ✅ **Complete replacement** - No deprecated aliases or backward compatibility
- ✅ **Domain-driven naming** - "Rental Object" accurately reflects the business domain
- ✅ **Consistent terminology** - Same naming across API, SDK, types, and frontend
- ✅ **Type safety** - Full TypeScript support throughout

---

## Rationale

### Why "Rental Object" instead of "Listing"?

1. **Domain Accuracy**: "Rental Object" (utleieobjekt) is the accurate Norwegian business term for bookable resources
2. **Clarity**: More descriptive than the generic "listing"
3. **Consistency**: Aligns with Norwegian municipal terminology
4. **Future-proofing**: Better foundation for domain-specific features

### Migration Strategy

- **No backward compatibility** - Clean break to avoid confusion
- **All-or-nothing** - Complete migration across all layers
- **Type-safe** - TypeScript ensures compile-time safety

---

## What Changed

### High-Level Summary

| Layer | Before | After | Status |
|-------|--------|-------|--------|
| **Database** | `listings` table | `rental_objects` table | ✅ Migrated |
| **API Endpoints** | `/api/listings/*` | `/api/rental-objects/*` | ✅ Migrated |
| **API Module** | `modules/listing/` | `modules/rental-objects/` | ✅ Migrated |
| **SDK Types** | `types/listing.ts` | `types/rental-object.ts` | ✅ Migrated |
| **SDK Service** | `listingService` | `rentalObjectService` | ✅ Migrated |
| **SDK Hooks** | `useListings()` | `useRentalObjects()` | ✅ Migrated |
| **Transforms** | `transforms/listing.transform.ts` | Removed (moved to DAL) | ✅ Migrated |
| **Utils** | `utils/listing-type-migration.ts` | `utils/rental-object-categories.ts` | ✅ Migrated |
| **Geocoding** | `geocodeListingAddress()` | `geocodeRentalObjectAddress()` | ✅ Migrated |

---

## Migration Guide

### API Layer Changes

#### Endpoints

**Before:**
```typescript
GET    /api/listings
GET    /api/listings/:id
POST   /api/listings
PATCH  /api/listings/:id
DELETE /api/listings/:id
```

**After:**
```typescript
GET    /api/rental-objects
GET    /api/rental-objects/:id
POST   /api/rental-objects
PATCH  /api/rental-objects/:id
DELETE /api/rental-objects/:id
```

#### Module Structure

**Before:**
```
apps/api/src/modules/listing/
├── listing.controller.ts
├── listing.service.ts
├── listing.repository.ts
├── listing.projections.ts
└── index.ts
```

**After:**
```
apps/api/src/modules/rental-objects/
├── rental-object.controller.ts
├── rental-object.service.ts
├── rental-object.repository.ts
├── rental-object.projections.ts
└── index.ts
```

#### Controller Example

**Before:**
```typescript
import { ListingController } from './modules/listing';
import { ListingService } from './modules/listing';
```

**After:**
```typescript
import { RentalObjectController } from './modules/rental-objects';
import { RentalObjectService } from './modules/rental-objects';
```

---

### SDK Changes

#### Service Import

**Before:**
```typescript
import { listingService } from '@digilist/client-sdk/services';
import type { Listing, ListingQueryParams } from '@digilist/client-sdk/types';
```

**After:**
```typescript
import { rentalObjectService } from '@digilist/client-sdk/services';
import type { RentalObject, RentalObjectQueryParams } from '@digilist/client-sdk/types';
```

#### Service Usage

**Before:**
```typescript
const listings = await listingService.getAll({ category: 'LOKALER_OG_BANER' });
const listing = await listingService.getById('123');
```

**After:**
```typescript
const rentalObjects = await rentalObjectService.getAll({ category: 'LOKALER_OG_BANER' });
const rentalObject = await rentalObjectService.getById('123');
```

#### React Hooks

**Before:**
```typescript
import { useListings, useListing } from '@digilist/client-sdk/hooks';

function MyComponent() {
  const { data: listings } = useListings({ category: 'LOKALER_OG_BANER' });
  const { data: listing } = useListing('123');
}
```

**After:**
```typescript
import { useRentalObjects, useRentalObject } from '@digilist/client-sdk/hooks';

function MyComponent() {
  const { data: rentalObjects } = useRentalObjects({ category: 'LOKALER_OG_BANER' });
  const { data: rentalObject } = useRentalObject('123');
}
```

#### Query Keys

**Before:**
```typescript
import { listingKeys } from '@digilist/client-sdk/hooks';

queryClient.invalidateQueries({ queryKey: listingKeys.all });
```

**After:**
```typescript
import { rentalObjectKeys } from '@digilist/client-sdk/hooks';

queryClient.invalidateQueries({ queryKey: rentalObjectKeys.all });
```

---

### Type Changes

#### Type Imports

**Before:**
```typescript
import type {
  Listing,
  ListingQueryParams,
  CreateListingDTO,
  UpdateListingDTO,
  ListingCategory,
} from '@digilist/client-sdk/types';
```

**After:**
```typescript
import type {
  RentalObject,
  RentalObjectQueryParams,
  CreateRentalObjectDTO,
  UpdateRentalObjectDTO,
  RentalObjectCategory,
} from '@digilist/client-sdk/types';
```

#### Type Definitions

**Before:**
```typescript
interface Listing {
  id: string;
  title: string;
  category: ListingCategory;
  // ...
}
```

**After:**
```typescript
interface RentalObject {
  id: string;
  title: string;
  category: RentalObjectCategory;
  // ...
}
```

#### Category Types

**Before:**
```typescript
type ListingCategory = 
  | 'LOKALER_OG_BANER'
  | 'UTSTYR_OG_INVENTAR'
  | 'KJORETOY_OG_TRANSPORT'
  | 'OPPLEVELSER_OG_ARRANGEMENT';
```

**After:**
```typescript
type RentalObjectCategory = 
  | 'LOKALER_OG_BANER'
  | 'UTSTYR_OG_INVENTAR'
  | 'KJORETOY_OG_TRANSPORT'
  | 'OPPLEVELSER_OG_ARRANGEMENT';
```

**Note:** Category values remain the same - only the type name changed.

---

### Utility Functions

#### Geocoding

**Before:**
```typescript
import { geocodeListingAddress } from '@digilist/client-sdk/utils';
import type { ListingAddress } from '@digilist/client-sdk/types';

const result = await geocodeListingAddress(address, config);
```

**After:**
```typescript
import { geocodeRentalObjectAddress } from '@digilist/client-sdk/utils';
import type { RentalObjectAddress } from '@digilist/client-sdk/types';

const result = await geocodeRentalObjectAddress(address, config);
```

**Note:** `geocodeListingAddress` still exists as a deprecated alias for backward compatibility during transition, but new code should use `geocodeRentalObjectAddress`.

#### Category Utilities

**Before:**
```typescript
import { CATEGORY_LABELS_NB, CATEGORY_LABELS_EN } from '@digilist/client-sdk/utils/listing-type-migration';
```

**After:**
```typescript
import { CATEGORY_LABEL_KEYS } from '@digilist/client-sdk/utils/rental-object-categories';
```

---

### Transform Functions (Removed)

**Important:** Transform functions were removed as part of the migration. The SDK now uses a Data Access Layer (DAL) pattern instead.

**Before:**
```typescript
import { getCategoryLabel, transformListing } from '@digilist/client-sdk/transforms';
```

**After:**
```typescript
// Transforms removed - use i18n keys directly
import { RENTAL_OBJECT_CATEGORY_KEYS } from '@digilist/client-sdk/localization';
import { useT } from '@xala/i18n';

const t = useT();
const label = t(RENTAL_OBJECT_CATEGORY_KEYS[category]);
```

---

## Breaking Changes

### 1. API Endpoints

**Breaking:** All `/api/listings/*` endpoints removed

**Migration:**
- Update all API calls to use `/api/rental-objects/*`
- Update OpenAPI/Swagger documentation
- Update API client configurations

### 2. SDK Service

**Breaking:** `listingService` removed

**Migration:**
```typescript
// Before
import { listingService } from '@digilist/client-sdk/services';

// After
import { rentalObjectService } from '@digilist/client-sdk/services';
```

### 3. SDK Hooks

**Breaking:** All `useListing*` hooks removed

**Migration:**
```typescript
// Before
import { useListings, useListing, useListingStats } from '@digilist/client-sdk/hooks';

// After
import { useRentalObjects, useRentalObject, useRentalObjectStats } from '@digilist/client-sdk/hooks';
```

### 4. Type Exports

**Breaking:** `Listing`, `ListingQueryParams`, etc. removed

**Migration:**
```typescript
// Before
import type { Listing, ListingQueryParams } from '@digilist/client-sdk/types';

// After
import type { RentalObject, RentalObjectQueryParams } from '@digilist/client-sdk/types';
```

### 5. Transform Functions

**Breaking:** All transform functions removed

**Migration:**
- Use i18n keys directly from `@digilist/client-sdk/localization`
- Use `useT()` hook for translations
- Remove any transform utility imports

---

## API Changes

### Request/Response Format

The API request/response format remains the same - only the endpoint paths and type names changed.

**Request Example:**
```typescript
// Before
GET /api/listings?category=LOKALER_OG_BANER&page=1&limit=20

// After
GET /api/rental-objects?category=LOKALER_OG_BANER&page=1&limit=20
```

**Response Example:**
```json
{
  "data": [
    {
      "id": "123",
      "title": "Møterom A",
      "category": "LOKALER_OG_BANER",
      // ... same structure
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
```

### Projection DTOs

Projection DTOs (card, details, etc.) maintain the same structure - only property names changed where they referenced "listing":

**Before:**
```typescript
interface ListingCardProjection {
  id: string;
  title: string;
  // ...
}
```

**After:**
```typescript
interface RentalObjectCardProjection {
  id: string;
  title: string;
  // ...
}
```

---

## SDK Changes

### Service Methods

All service methods maintain the same signatures - only the service name and return types changed:

**Before:**
```typescript
class ListingService {
  async getAll(params?: ListingQueryParams): Promise<ListingsResponse>;
  async getById(id: string): Promise<ListingResponse>;
  async create(data: CreateListingDTO): Promise<ListingResponse>;
  async update(id: string, data: UpdateListingDTO): Promise<ListingResponse>;
  async delete(id: string): Promise<SuccessResponse>;
}
```

**After:**
```typescript
class RentalObjectService {
  async getAll(params?: RentalObjectQueryParams): Promise<RentalObjectsResponse>;
  async getById(id: string): Promise<RentalObjectResponse>;
  async create(data: CreateRentalObjectDTO): Promise<RentalObjectResponse>;
  async update(id: string, data: UpdateRentalObjectDTO): Promise<RentalObjectResponse>;
  async delete(id: string): Promise<SuccessResponse>;
}
```

### Hook Signatures

Hook signatures remain the same - only names changed:

**Before:**
```typescript
function useListings(params?: ListingQueryParams): UseQueryResult<ListingsResponse>;
function useListing(id: string): UseQueryResult<ListingResponse>;
```

**After:**
```typescript
function useRentalObjects(params?: RentalObjectQueryParams): UseQueryResult<RentalObjectsResponse>;
function useRentalObject(id: string): UseQueryResult<RentalObjectResponse>;
```

---

## Type Changes

### Core Types

| Before | After | Notes |
|--------|-------|-------|
| `Listing` | `RentalObject` | Main entity type |
| `ListingQueryParams` | `RentalObjectQueryParams` | Query parameters |
| `CreateListingDTO` | `CreateRentalObjectDTO` | Create DTO |
| `UpdateListingDTO` | `UpdateRentalObjectDTO` | Update DTO |
| `ListingCategory` | `RentalObjectCategory` | Category enum |
| `ListingAddress` | `RentalObjectAddress` | Address type |
| `ListingCardProjection` | `RentalObjectCardProjection` | Card projection |
| `ListingDetailsProjection` | `RentalObjectDetailsProjection` | Details projection |

### Type Aliases (Temporary)

For backward compatibility during migration, some type aliases exist:

```typescript
// In types/search.ts
type Listing = RentalObject; // Temporary alias

// In types/index.ts
export type { RentalObject as Listing }; // Deprecated
```

**Note:** These aliases are temporary and should not be used in new code.

---

## Common Issues

### Issue 1: Cannot find module '../types/listing'

**Error:**
```
TS2307: Cannot find module '../types/listing'
```

**Solution:**
```typescript
// Before
import type { Listing } from '../types/listing';

// After
import type { RentalObject } from '../types/rental-object';
```

### Issue 2: Cannot find module '../services/listing.service'

**Error:**
```
TS2307: Cannot find module '../services/listing.service'
```

**Solution:**
```typescript
// Before
import { listingService } from '../services/listing.service';

// After
import { rentalObjectService } from '../services/rental-object.service';
```

### Issue 3: Property 'listings' does not exist

**Error:**
```
TS2339: Property 'listings' does not exist on type '...'
```

**Solution:**
```typescript
// Before
const { data: listings } = useListings();

// After
const { data: rentalObjects } = useRentalObjects();
```

### Issue 4: Transform function not found

**Error:**
```
TS2304: Cannot find name 'getCategoryLabel'
```

**Solution:**
```typescript
// Before
import { getCategoryLabel } from '@digilist/client-sdk/transforms';
const label = getCategoryLabel(category);

// After
import { RENTAL_OBJECT_CATEGORY_KEYS } from '@digilist/client-sdk/localization';
import { useT } from '@xala/i18n';
const t = useT();
const label = t(RENTAL_OBJECT_CATEGORY_KEYS[category]);
```

---

## Migration Checklist

### For Frontend Developers

- [ ] Update all imports from `listing` to `rental-object`
- [ ] Update all service calls from `listingService` to `rentalObjectService`
- [ ] Update all hooks from `useListing*` to `useRentalObject*`
- [ ] Update all type references from `Listing*` to `RentalObject*`
- [ ] Update all variable names from `listing`/`listings` to `rentalObject`/`rentalObjects`
- [ ] Remove any transform function imports
- [ ] Update i18n keys to use new localization system
- [ ] Update API endpoint URLs from `/api/listings` to `/api/rental-objects`
- [ ] Update query keys from `listingKeys` to `rentalObjectKeys`
- [ ] Test all rental object-related functionality

### For Backend Developers

- [ ] Verify database migration from `listings` to `rental_objects` table
- [ ] Update all repository methods
- [ ] Update all service methods
- [ ] Update all controller endpoints
- [ ] Update all projection functions
- [ ] Update all type references
- [ ] Update API documentation (OpenAPI/Swagger)
- [ ] Update integration tests
- [ ] Verify no references to old `listing` module remain

### For SDK Maintainers

- [ ] Verify all types exported correctly
- [ ] Verify all services exported correctly
- [ ] Verify all hooks exported correctly
- [ ] Update SDK documentation
- [ ] Verify TypeScript compilation passes
- [ ] Run full test suite
- [ ] Update example code

### For QA/Testing

- [ ] Test all rental object CRUD operations
- [ ] Test search and filtering
- [ ] Test category filtering
- [ ] Test booking creation with rental objects
- [ ] Test calendar/availability features
- [ ] Test public-facing rental object pages
- [ ] Test admin/backoffice rental object management
- [ ] Verify no console errors related to old terminology

---

## Related Documentation

- [API SDK Architecture](./api-sdk.md) - Overall SDK architecture
- [Database Schema](./database-schema.md) - Database structure
- [Type System](./ARCHITECTURE_NO_TRANSFORMERS.md) - Type system design

---

## Support

If you encounter issues during migration:

1. Check this guide for common issues
2. Search codebase for remaining `listing` references
3. Verify TypeScript compilation errors
4. Check API endpoint responses
5. Review SDK exports in `packages/client-sdk/src/index.ts`

---

**Last Updated:** January 2026  
**Migration Status:** ✅ Complete
