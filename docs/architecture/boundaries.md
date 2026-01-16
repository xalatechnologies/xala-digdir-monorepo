# Architecture Boundaries

**Last Updated:** 2026-01-16
**Status:** Authoritative

---

## Overview

This document defines the architectural boundaries that ensure loose coupling between database schema, API contracts, and UI components. Following these boundaries makes schema changes painless and prevents terminology changes from cascading across the codebase.

---

## 1. Layer Definitions

### 1.1 Persistence Layer

**Location:** `apps/api/src/database/`

**Contains:**
- Drizzle ORM schema definitions
- Database migrations
- Seed data
- Repository implementations

**Rules:**
- ❌ NEVER import persistence types in SDK
- ❌ NEVER import persistence types in UI apps
- ❌ NEVER expose raw DB entities in API responses
- ✅ Use snake_case for column names
- ✅ Use JSONB for flexible metadata

```typescript
// apps/api/src/database/schema/rental-objects.ts
export const rentalObjects = pgTable('rental_objects', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenant_id: uuid('tenant_id').notNull(),
  category_key: varchar('category_key', { length: 50 }),
  metadata: jsonb('metadata'),
  // ...
});
```

### 1.2 Domain Layer

**Location:** `apps/api/src/domain/`

**Contains:**
- Canonical business entities
- Domain validation rules
- Domain events
- Value objects

**Rules:**
- ✅ Clean business language (no DB artifacts)
- ✅ Immutable where possible
- ✅ Contains validation logic
- ❌ No ORM dependencies
- ❌ No API serialization concerns

```typescript
// apps/api/src/domain/rental-objects/rental-object.ts
export interface RentalObject {
  id: string;
  tenantId: string;
  category: { key: string; label: string };
  timeMode: 'PERIOD' | 'SLOT' | 'ALL_DAY';
  // Clean business properties...
}
```

### 1.3 API Contracts Layer

**Location:** `packages/client-sdk/src/types/`

**Contains:**
- Projection DTOs (display-ready)
- Request/response types
- RFC7807 error types
- SDK service interfaces

**Rules:**
- ✅ Stable API contracts
- ✅ Display-ready values (pre-formatted strings)
- ✅ camelCase for all fields
- ❌ No business logic
- ❌ No DB schema references

```typescript
// packages/client-sdk/src/types/projection-dtos.ts
export interface RentalObjectCardProjectionDTO {
  id: string;
  name: string;
  typeLabel: string;          // Pre-computed display string
  locationFormatted: string;  // Pre-formatted address
  priceDisplay: string;       // "500 NOK/time"
  // ...
}
```

### 1.4 UI Layer

**Location:** `apps/web/`, `apps/backoffice/`, `apps/minside/`

**Contains:**
- React components
- Page layouts
- UI state management
- Rendering logic only

**Rules:**
- ✅ Use SDK hooks for data
- ✅ Render projection DTOs directly
- ✅ Capability-driven UI (not role-driven)
- ❌ No business logic
- ❌ No data transformations
- ❌ No direct API calls (use SDK)

---

## 2. Anti-Corruption Layer (ACL)

**Location:** `apps/api/src/acl/`

The ACL provides translation between layers:

```
Persistence → Domain → Projection
```

### 2.1 Mapper Structure

```typescript
// apps/api/src/acl/rental-objects/rental-object.mapper.ts

export function toDomain(db: DbRentalObject): RentalObject {
  // Convert DB entity to domain model
}

export function toPersistence(domain: RentalObject): DbRentalObject {
  // Convert domain model to DB format
}

export function toCardProjection(domain: RentalObject): RentalObjectCardProjectionDTO {
  // Convert domain to display-ready DTO
}
```

### 2.2 Benefits

- Schema changes stay in ACL mappers
- Domain model is clean business language
- API contracts remain stable
- UI components don't break on DB changes

---

## 3. Import Rules

### 3.1 What Can Import What

| From → To | Persistence | Domain | Contracts | UI |
|-----------|-------------|--------|-----------|-----|
| Persistence | ✅ | ❌ | ❌ | ❌ |
| Domain | ❌ | ✅ | ❌ | ❌ |
| ACL | ✅ | ✅ | ✅ | ❌ |
| Controllers | ❌* | ✅ | ✅ | ❌ |
| SDK | ❌ | ❌ | ✅ | ❌ |
| UI | ❌ | ❌ | ✅ (SDK) | ✅ |

*Controllers should use services/ACL, not direct schema imports

### 3.2 ESLint Enforcement

```javascript
// packages/eslint-config/rules/no-direct-schema-import.js
// Prevents: import { table } from '../../database/schema'
// In: **/modules/**/*.controller.ts
```

---

## 4. Controller Pattern

Controllers should follow this pattern:

```typescript
@Controller('/api/rental-objects')
export class RentalObjectController {
  @Get()
  async findAll(request: TenantRequest): Promise<ResponseDTO> {
    // 1. Service returns domain models
    const domains = await this.service.findAll(tenantId, params);

    // 2. ACL converts to projections
    const projections = domains.map(d =>
      RentalObjectMapper.toCardProjection(d, {
        canBook: this.canBook(request.user, d),
        canEdit: this.canEdit(request.user, d),
      })
    );

    // 3. Return standardized response
    return { data: projections, meta: pagination };
  }
}
```

---

## 5. Terminology Governance

### 5.1 Canonical Terms

| ✅ Use | ❌ Don't Use |
|--------|--------------|
| rental object | listing, facility |
| rental-object | listing |
| utleieobjekt | anlegg, lokale |

### 5.2 Migration Path

When terminology changes:

1. **EXPAND:** Add new term, keep old (alias)
2. **MIGRATE:** Update clients to new term
3. **CONTRACT:** Remove old term (major version)

See: `reports/EXPAND_CONTRACT_PLAYBOOK.md`

---

## 6. Capabilities Pattern

### 6.1 Server-Side Capabilities

Capabilities are computed server-side and returned per app:

```
GET /api/web/me/capabilities
GET /api/minside/me/capabilities
GET /api/backoffice/me/capabilities
```

### 6.2 UI Consumption

```tsx
import { useBackofficeCapabilities } from '@digilist/client-sdk/hooks';

function AdminNav() {
  const { data } = useBackofficeCapabilities();
  const { uiHints } = data?.data ?? {};

  return (
    <Nav>
      {uiHints?.showReports && <NavLink to="/reports">Reports</NavLink>}
      {uiHints?.showAudit && <NavLink to="/audit">Audit</NavLink>}
    </Nav>
  );
}
```

---

## 7. CI Enforcement

The following CI jobs enforce boundaries:

1. **Contract Parity Test** - SDK types match API responses
2. **No Direct Schema Import** - Controllers use ACL
3. **No Raw Fetch** - Apps use SDK hooks
4. **Terminology Check** - No deprecated terms in routes
5. **Capabilities Check** - Endpoints exist and export hooks

---

## References

- `reports/COUPLING_LOOPHOLES_AUDIT.md`
- `reports/LOOPHOLES_FIX_PLAN.md`
- `reports/DECOUPLED_ARCHITECTURE_PLAN.md`
- `reports/EXPAND_CONTRACT_PLAYBOOK.md`
