# Decoupled Contract Architecture Design

**Date:** 2026-01-16
**Project:** Xala/Digilist Platform
**Status:** Design Phase - Ready for Implementation

---

## Executive Summary

This document defines a comprehensive **three-layer decoupled architecture** that eliminates tight coupling between database schema and application layers (API, SDK, UI).

**Key Components:**
1. **Anti-Corruption Layer (ACL)** - Mappers between Persistence ↔ Domain ↔ Projection
2. **Metadata Registry** - Dynamic enums replacing hardcoded SDK types
3. **Expand/Contract Pattern** - Safe field migrations with zero downtime
4. **Enforced Projection DTOs** - Stable API contracts at boundary
5. **CI/CD Tripwires** - Automated contract validation

---

## 1. Layer Boundaries

```
CLIENT APPLICATIONS (apps/web, minside, backoffice)
    ↓ consumes
@digilist/client-sdk (Stable Contracts)
    ├── Projection DTOs (display-ready)
    ├── React Query hooks
    ├── Branded types (no enums)
    └── Dynamic metadata hooks
    ↓ HTTP/WebSocket
API BOUNDARY (apps/api)
    ├── Controllers (orchestration, MUST return projections)
    ├── Services (business logic, operate on domain models)
    ├── ACL Mappers ★ NEW (Persistence ↔ Domain ↔ Projection)
    ├── Repositories (data access, return persistence models)
    └── Persistence Schema (PRIVATE, DB-specific naming)
    ↓
PostgreSQL Database
```

**Key Principle:** Each layer has its own types. ACL translates between layers.

---

## 2. Anti-Corruption Layer (ACL)

### Purpose

Isolate database schema changes from API contracts by translating between:
1. **Persistence Model** (DB tables with snake_case, JSONB, legacy naming)
2. **Domain Model** (clean business types with canonical naming)
3. **Projection DTOs** (display-ready, flat structure for UI)

### File Structure

```
apps/api/src/acl/
├── README.md
├── index.ts
├── rental-objects/
│   ├── rental-object.mapper.ts         # THREE transformations
│   ├── rental-object.domain.ts         # Domain model type
│   └── rental-object.mapper.test.ts
├── bookings/
│   ├── booking.mapper.ts
│   ├── booking.domain.ts
│   └── booking.mapper.test.ts
└── organizations/
    └── ...
```

### RentalObjectMapper Interface

```typescript
class RentalObjectMapper {
  // 1. DATABASE → DOMAIN
  static toDomain(db: DbRentalObject): DomainRentalObject {
    // - Normalize DB column names (category_key → categoryKey)
    // - Extract JSONB fields into typed structures
    // - Handle legacy naming
    // - Provide defaults for optional fields
  }

  // 2. DOMAIN → DATABASE
  static toPersistence(domain: DomainRentalObject): Partial<DbRentalObject> {
    // - Reverse field mappings
    // - Serialize to JSONB
    // - Handle nulls
  }

  // 3. DOMAIN → PROJECTION (UI-ready)
  static toCardProjection(domain, permissions?): RentalObjectCardProjectionDTO {
    // - Format strings (priceDisplay, locationFormatted)
    // - Compute i18n keys (categoryLabel)
    // - Add permissions (canBook, canEdit)
    // - Truncate descriptions
    // - Select primary image
  }

  static toDetailsProjection(domain, permissions): RentalObjectDetailsProjectionDTO {
    // - Full details
    // - Nested structures (opening hours, booking config)
    // - Computed availability
  }
}
```

### Domain Model Definition

```typescript
// apps/api/src/domain/rental-objects/rental-object.ts
export interface RentalObject {
  id: string;
  tenantId: string;
  organizationId?: string;

  // Canonical naming (not DB names)
  name: string;
  slug: string;
  description: string;
  category: string;      // NOT categoryKey
  timeMode: string;      // NOT time_mode

  // Typed structures (not JSONB)
  location: DomainLocation;
  pricing: DomainPricing;
  images: string[];
  amenities: string[];

  capacity: number;
  status: string;
  requiresApproval: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export interface DomainLocation {
  street: string;
  postalCode: string;
  city: string;
  municipality: string;
  country: string;
  coordinates?: { lat: number; lng: number };
}
```

**Key Benefits:**
- Domain model is clean business language
- No DB artifacts (JSONB, snake_case, legacy names)
- Easy to understand and test
- Can change DB schema without changing domain

---

## 3. Projection Enforcement

### BaseController Pattern

All controllers MUST extend `BaseController` and return projection DTOs.

```typescript
// apps/api/src/core/base.controller.ts
export abstract class BaseController<TDomain, TCardProjection, TDetailsProjection> {
  protected abstract mapper: {
    toCardProjection(domain: TDomain, permissions?: any): TCardProjection;
    toDetailsProjection(domain: TDomain, permissions: any): TDetailsProjection;
  };

  protected respondWithList(items: TCardProjection[], pagination: any) {
    return {
      data: items,
      meta: {
        total: pagination.total,
        page: pagination.page,
        limit: pagination.limit,
        totalPages: pagination.totalPages,
      },
    };
  }

  protected respondWithOne(item: TCardProjection | TDetailsProjection) {
    return { data: item };
  }
}
```

### Updated Controller Pattern

```typescript
@Controller('/api/rental-objects')
export class RentalObjectController extends BaseController<
  DomainRentalObject,
  RentalObjectCardProjectionDTO,
  RentalObjectDetailsProjectionDTO
> {
  protected mapper = RentalObjectMapper;

  @Get()
  async findAll(request: TenantRequest) {
    // 1. Service returns domain models
    const domains = await this.service.findAll(tenantId, params);

    // 2. Mapper converts to projections
    const projections = domains.map(d =>
      this.mapper.toCardProjection(d, {
        canBook: this.canBook(request.user, d),
        canEdit: this.canEdit(request.user, d),
      })
    );

    // 3. Return standardized response
    return this.respondWithList(projections, pagination);
  }
}
```

---

## 4. Metadata Registry (Dynamic Enums)

### Problem

Hardcoded SDK enums break when database adds new categories:

```typescript
// ❌ BRITTLE
export type RentalObjectCategory = 'LOCALE' | 'EQUIPMENT' | 'VEHICLE';
// If DB adds 'SPORTS', SDK must rebuild
```

### Solution: Dynamic Metadata Endpoints

**New API endpoints:**

```
GET /api/metadata/categories
GET /api/metadata/time-modes
GET /api/metadata/pricing-units
GET /api/metadata/statuses
```

**Response format:**

```json
{
  "data": [
    {
      "key": "LOCALE",
      "labelKey": "sdk.rentalObject.category.LOCALE",
      "enabled": true,
      "order": 1
    },
    {
      "key": "EQUIPMENT",
      "labelKey": "sdk.rentalObject.category.EQUIPMENT",
      "enabled": true,
      "order": 2
    }
  ]
}
```

**SDK Hook:**

```typescript
// packages/client-sdk/src/hooks/useMetadata.ts
export function useCategoriesMetadata() {
  return useQuery({
    queryKey: ['metadata', 'categories'],
    queryFn: () => metadataService.getCategories(),
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}
```

**UI Usage:**

```tsx
import { useCategoriesMetadata } from '@digilist/client-sdk/hooks';
import { useT } from '@xala/i18n';

function CategoryFilter() {
  const t = useT();
  const { data: categories } = useCategoriesMetadata();

  return (
    <Select>
      {categories?.data.map(cat => (
        <option key={cat.key} value={cat.key}>
          {t(cat.labelKey)}
        </option>
      ))}
    </Select>
  );
}
```

### Branded String Types (Type Safety)

```typescript
// packages/client-sdk/src/types/branded-types.ts
export type CategoryKey = string & { readonly __brand: 'CategoryKey' };
export type TimeModeKey = string & { readonly __brand: 'TimeModeKey' };

export function categoryKey(value: string): CategoryKey {
  return value as CategoryKey;
}

// Usage in DTOs
export interface RentalObjectCardProjectionDTO {
  category: CategoryKey;  // ✅ Type-safe, no enum
  categoryLabel: string;  // i18n key
}
```

**Benefits:**
- No SDK rebuild when categories change
- Type safety preserved
- Runtime validation possible
- Extensible per tenant

---

## 5. Expand/Contract Pattern

### Safe Field Migration: `name` → `title`

#### PHASE 1: EXPAND (Add New Field)

**Database migration:**

```sql
ALTER TABLE rental_objects ADD COLUMN title VARCHAR(255);
UPDATE rental_objects SET title = name WHERE title IS NULL;
ALTER TABLE rental_objects ALTER COLUMN title SET NOT NULL;
```

**Schema (support both):**

```typescript
export const rentalObjects = pgTable('rental_objects', {
  /** @deprecated Use 'title'. Will be removed in v2.0 */
  name: varchar('name', { length: 255 }).notNull(),

  title: varchar('title', { length: 255 }).notNull(),  // NEW
});
```

**ACL mapper (dual support):**

```typescript
static toDomain(db: DbRentalObject): DomainRentalObject {
  return {
    title: db.title || db.name,  // PREFER new, FALLBACK old
  };
}

static toPersistence(domain: DomainRentalObject): Partial<DbRentalObject> {
  return {
    title: domain.title,
    name: domain.title,  // WRITE TO BOTH during migration
  };
}
```

**Projection DTO (both fields):**

```typescript
export interface RentalObjectCardProjectionDTO {
  title: string;  // NEW

  /** @deprecated Use 'title'. Removed in v2.0 (2026-03-01) */
  name: string;   // OLD (deprecated)
}
```

**Result:** No breaking changes. Clients can use either field.

---

#### PHASE 2: MIGRATE (Update Clients)

**Deprecation window:** 2 releases (4-8 weeks)

1. Update SDK to use `title` internally
2. Update UI components: `rental.name` → `rental.title`
3. Grep for old usage: `rg "rental\.name" apps/`
4. Deploy client updates

**Result:** Frontends use new field, API still supports both.

---

#### PHASE 3: CONTRACT (Remove Old Field)

**Timing:** After deprecation window

1. Remove from DTO:
   ```typescript
   export interface RentalObjectCardProjectionDTO {
     title: string;  // ONLY new field
   }
   ```

2. Stop writing to old field in mapper

3. Drop database column:
   ```sql
   ALTER TABLE rental_objects DROP COLUMN name;
   ```

**Result:** Breaking change completed safely.

---

### Deprecation Policy

| Phase | Version | Duration | Actions |
|-------|---------|----------|---------|
| Expand | v1.5 | - | Add new field, deprecate old |
| Migrate | v1.5-v1.7 | 2-4 releases | Update clients |
| Contract | v2.0 | - | Remove old field (BREAKING) |

**Versioning rules:**
- **Patch (v1.5.1):** Bug fixes only
- **Minor (v1.6.0):** New fields (backward compatible)
- **Major (v2.0.0):** Remove/rename fields (BREAKING)

---

## 6. UI Type Consolidation

### Current Problem

Three parallel type systems:
1. SDK entity types (`RentalObject`)
2. SDK projection DTOs (`RentalObjectCardProjectionDTO`)
3. Custom UI types (`apps/web/types.ts`, `apps/backoffice/types.ts`)

**Issue:** Duplication, drift, manual synchronization

### Solution: SDK Projections as Single Source

**Rule:** Components MUST use SDK projection DTOs directly.

**Before (Custom Types):**

```typescript
// ❌ apps/backoffice/src/types/listing.ts
export interface BackofficeListing {
  id: string;
  displayName: string;      // Custom computed field
  statusBadgeColor: string; // Client logic
}
```

**After (SDK Projection):**

```typescript
// ✅ Use SDK DTO directly
import type { RentalObjectCardProjectionDTO } from '@digilist/client-sdk/types/projection-dtos';

function ListingCard({ rental }: { rental: RentalObjectCardProjectionDTO }) {
  return <Card>{rental.name}</Card>;
}
```

### Computed Fields in API, Not UI

**Bad (Client computation):**

```tsx
// ❌ Business logic in UI
function getStatusColor(status: string) {
  return status === 'draft' ? 'neutral' : 'success';
}
```

**Good (API precomputes):**

```typescript
// ✅ API projection includes computed fields
export interface RentalObjectCardProjectionDTO {
  status: string;
  statusColor: string;  // Precomputed by ACL mapper
}

// Mapper
static toCardProjection(domain: DomainRentalObject) {
  return {
    statusColor: this.computeStatusColor(domain.status),
  };
}
```

---

## 7. Repository Pattern Enforcement

### ESLint Rule: no-direct-schema-import

```javascript
// packages/eslint-config/rules/no-direct-schema-import.js
module.exports = {
  meta: {
    type: 'problem',
    messages: {
      noDirectSchemaImport: 'Controllers must not import schema. Use Service → ACL → Repository.',
    },
  },
  create(context) {
    return {
      ImportDeclaration(node) {
        const fileName = context.getFilename();
        const importPath = node.source.value;

        if (fileName.endsWith('.controller.ts') && importPath.includes('/database/schema')) {
          context.report({ node, messageId: 'noDirectSchemaImport' });
        }
      },
    };
  },
};
```

### Enforced Pattern

```
Controller → Service → Repository → ACL → Database
          ↓
     Projection DTO
```

**Controller:** Orchestration, returns projections
**Service:** Business logic, uses domain models
**Repository:** Data access, returns persistence models
**ACL:** Transforms between layers

---

## 8. Response Format Standardization

### List Responses

```json
{
  "data": [RentalObjectCardProjectionDTO],
  "meta": {
    "total": 142,
    "page": 1,
    "limit": 20,
    "totalPages": 8
  }
}
```

### Single Item

```json
{
  "data": RentalObjectDetailsProjectionDTO
}
```

### Errors (RFC 7807)

```json
{
  "type": "/errors/not-found",
  "title": "Resource Not Found",
  "status": 404,
  "detail": "Rental object 'abc123' not found"
}
```

---

## 9. CI/CD Tripwires

### 9.1 OpenAPI Contract Breaking Change Detection

```yaml
# .github/workflows/api-contract-check.yml
- name: Detect breaking changes
  run: |
    npx openapi-diff \
      /tmp/openapi-base.json \
      /tmp/openapi-current.json \
      --fail-on-incompatible
```

### 9.2 SDK Parity Snapshot Tests

```typescript
// packages/client-sdk/tests/projection-parity.test.ts
it('API response matches RentalObjectCardProjectionDTO', async () => {
  const response = await axios.get('/api/rental-objects');
  const firstItem = response.data.data[0];

  const expectedKeys = Object.keys(RentalObjectCardProjectionDTO);
  expectedKeys.forEach(key => expect(firstItem).toHaveProperty(key));

  const actualKeys = Object.keys(firstItem);
  const unexpectedKeys = actualKeys.filter(k => !expectedKeys.includes(k));
  expect(unexpectedKeys).toEqual([]);  // Fail if extra keys
});
```

### 9.3 Pre-commit Hooks

```bash
# .husky/pre-commit
pnpm lint
pnpm scan:compliance
pnpm scan:i18n
pnpm test:unit
```

---

## 10. Migration Roadmap

### Phase 1: Foundation (Weeks 1-2)
- [ ] Create `apps/api/src/acl/` directory structure
- [ ] Implement `RentalObjectMapper` (reference implementation)
- [ ] Create `apps/api/src/domain/rental-objects/` with domain types
- [ ] Create `apps/api/src/core/base.controller.ts`
- [ ] Add ESLint rule `no-direct-schema-import`

### Phase 2: Metadata Registry (Weeks 3-4)
- [ ] Create `apps/api/src/modules/metadata/` module
- [ ] Implement `MetadataController` with endpoints
- [ ] Create `packages/client-sdk/src/services/metadata.service.ts`
- [ ] Add SDK hooks: `useCategoriesMetadata()`, `useTimeModesMetadata()`
- [ ] Update 1-2 UI components to use dynamic metadata (proof of concept)

### Phase 3: Expand/Contract Demo (Weeks 5-6)
- [ ] Choose test field (e.g., `name` → `title`)
- [ ] Execute EXPAND phase (add new field)
- [ ] Execute MIGRATE phase (update clients)
- [ ] Execute CONTRACT phase (remove old field)
- [ ] Document lessons learned in playbook

### Phase 4: Controller Refactor (Weeks 7-10)
**High Priority (Direct Schema Imports):**
- [ ] MessagesController
- [ ] OrganizationsController
- [ ] CalendarController
- [ ] SeasonalLeaseController

**Medium Priority (Inconsistent Projections):**
- [ ] BookingController
- [ ] 5 other controllers

**Low Priority:**
- [ ] 30 remaining controllers

### Phase 5: UI Consolidation (Weeks 11-12)
- [ ] Remove `apps/web/src/features/rental-object-details/types.ts`
- [ ] Remove `apps/backoffice/src/features/rental-objects/types.ts`
- [ ] Update all components to use SDK projection DTOs
- [ ] Grep for custom types: `rg "interface.*Listing|interface.*RentalObject" apps/`

### Phase 6: CI/CD Integration (Weeks 13-14)
- [ ] Add OpenAPI contract validation to CI
- [ ] Add SDK parity snapshot tests
- [ ] Configure pre-commit hooks
- [ ] Add E2E tests for projection DTOs

**Total Estimated Duration:** 14 weeks

---

## 11. Critical Files for Implementation

### Priority 1 (Reference Implementation)

1. **`apps/api/src/acl/rental-objects/rental-object.mapper.ts`**
   - Defines all three transformations
   - Template for other mappers
   - ~200-300 lines

2. **`apps/api/src/domain/rental-objects/rental-object.ts`**
   - Canonical domain model
   - Clean business types
   - ~50-100 lines

3. **`apps/api/src/core/base.controller.ts`**
   - Enforces projection usage
   - Standard response formats
   - ~100 lines

### Priority 2 (Metadata Registry)

4. **`apps/api/src/modules/metadata/metadata.controller.ts`**
   - Dynamic enum endpoints
   - ~150 lines

5. **`packages/client-sdk/src/hooks/useMetadata.ts`**
   - React Query hooks for metadata
   - ~50 lines

### Priority 3 (Enforcement)

6. **`packages/eslint-config/rules/no-direct-schema-import.js`**
   - Prevent schema imports in controllers
   - ~30 lines

7. **`packages/client-sdk/tests/projection-parity.test.ts`**
   - Validate API responses match DTOs
   - ~100 lines

---

## 12. Breaking Change Policy

### What Constitutes a Breaking Change

**Breaking (Requires Major Version):**
- Remove field from DTO
- Rename field in DTO
- Change field type (string → number)
- Remove endpoint
- Change response structure

**Non-Breaking (Minor/Patch Version):**
- Add new field to DTO (optional)
- Add new endpoint
- Add new enum value
- Deprecate field (with notice)
- Fix bugs

### Handling Breaking Changes

1. **Announce deprecation** (2 releases ahead)
2. **Use Expand/Contract** (add new, deprecate old)
3. **Document migration guide**
4. **Wait deprecation window** (4-8 weeks)
5. **Release major version** (remove old)

---

## Summary

This architecture establishes **clear boundaries** between persistence, domain, and API layers:

**Key Components:**
1. **ACL Mappers** - Isolate DB schema from domain models
2. **Projection DTOs** - Stable API contracts
3. **Metadata Registry** - Dynamic enums, no hardcoded dependencies
4. **Expand/Contract** - Safe migrations with zero downtime
5. **Automated Enforcement** - ESLint, CI, snapshot tests

**Benefits:**
- Schema changes DON'T break SDK/UI
- Domain models are clean business language
- Incremental migration (no big-bang refactor)
- Production-safe with deprecation windows
- Type-safe at all boundaries

**Next Steps:** Proceed to implementation using migration roadmap.
