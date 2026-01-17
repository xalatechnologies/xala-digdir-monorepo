# ACL Migration Guide

**Document:** Controller Migration to Anti-Corruption Layer Pattern
**Version:** 1.0
**Last Updated:** 2026-01-16
**Status:** Phase 1 Complete - Reference Implementation Ready

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Migration Steps](#migration-steps)
4. [Code Examples](#code-examples)
5. [Testing Requirements](#testing-requirements)
6. [Verification Checklist](#verification-checklist)
7. [Troubleshooting](#troubleshooting)
8. [Controller Priority List](#controller-priority-list)

---

## Overview

This guide provides step-by-step instructions for migrating existing API controllers from direct database schema access to the Anti-Corruption Layer (ACL) pattern.

### Why Migrate?

- **Decouple layers:** Separate database schema from business logic and API contracts
- **Safe evolution:** Change database schema without breaking SDK/UI
- **Type safety:** End-to-end type safety with projection DTOs
- **Testability:** ACL mappers are pure functions, easy to unit test
- **Consistency:** Standard patterns across all controllers

### Reference Implementation

The **RentalObjectController** has been fully migrated and serves as the reference implementation:

- Domain model: `apps/api/src/domain/rental-objects/rental-object.ts`
- ACL mapper: `apps/api/src/acl/rental-objects/rental-object.mapper.ts`
- Unit tests: `tests/unit/acl/rental-object-mapper.test.ts` (60 tests)
- Integration tests: `tests/integration/acl-flow.test.ts` (40 tests)
- Security tests: `tests/security/acl-bypass-attempts.test.ts` (28 tests)
- Performance tests: `tests/performance/acl-performance.test.ts` (18 tests)

**Total:** 146 tests, all passing

---

## Prerequisites

### 1. Review Architecture Documents

Read these documents before starting:

- `/reports/DECOUPLED_ARCHITECTURE_PLAN.md` - Overall architecture
- `/reports/EXPAND_CONTRACT_PLAYBOOK.md` - Migration patterns
- `/reports/ACL_TESTING_STRATEGY.md` - Testing approach
- `/CLAUDE.md` - Project guidelines

### 2. Verify Reference Implementation

Study the reference implementation:

```bash
# Domain model
cat apps/api/src/domain/rental-objects/rental-object.ts

# ACL mapper
cat apps/api/src/acl/rental-objects/rental-object.mapper.ts

# BaseController
cat apps/api/src/core/base.controller.ts
```

### 3. Install Dependencies

Ensure all dependencies are installed:

```bash
pnpm install
```

### 4. Run Existing Tests

Verify current tests pass before migration:

```bash
pnpm test:run
```

---

## Migration Steps

### Step 1: Analyze Current Controller

**Location:** `apps/api/src/modules/{module-name}/{module-name}.controller.ts`

Identify:

1. **Direct schema imports:**
   ```typescript
   // ❌ Find these
   import { rentalObjects, bookings } from '../../database/schema';
   ```

2. **Database queries:**
   ```typescript
   // ❌ Find these
   const results = await db.select().from(rentalObjects).where(...);
   ```

3. **Response shape:**
   - What data is returned to clients?
   - What fields are exposed?
   - What computed properties exist?

4. **Business rules:**
   - Validation logic
   - Authorization checks
   - Data transformations

**Output:** List of database entities, response fields, business rules

---

### Step 2: Create Domain Model

**Location:** `apps/api/src/domain/{module-name}/{entity-name}.ts`

Create a clean domain model representing your business entity:

```typescript
/**
 * Domain Model: {EntityName}
 *
 * Clean business representation without database artifacts.
 */

export interface {EntityName} {
  // Identity
  id: string;
  tenantId: string;

  // Core attributes
  name: string;
  description: string;

  // Value objects (group related fields)
  location: Location | null;
  pricing: Pricing | null;

  // Status
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// Value objects
export interface Location {
  street: string;
  city: string;
  postalCode: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface Pricing {
  amount: number;
  currency: string;
  unit: 'HOUR' | 'DAY' | 'WEEK';
}

// Business validation rules
export const {EntityName}Rules = {
  validateName(name: string): void {
    if (!name || name.trim().length < 3) {
      throw new Error('Name must be at least 3 characters');
    }
  },

  validateCanPublish(entity: {EntityName}): void {
    if (!entity.name) throw new Error('Name required to publish');
    if (!entity.pricing) throw new Error('Pricing required to publish');
  },

  validateAll(entity: {EntityName}): void {
    this.validateName(entity.name);
    // ... other validations
  },
};
```

**Guidelines:**

- Use business terminology (not database column names)
- Group related fields into value objects
- Include business validation methods
- No database types (no `InferSelectModel`)
- No Drizzle references

---

### Step 3: Create ACL Mapper

**Location:** `apps/api/src/acl/{module-name}/{entity-name}.mapper.ts`

Create mapper with 4 core transformations:

```typescript
/**
 * ACL Mapper: {EntityName}
 *
 * Transformations:
 * 1. Persistence → Domain (database to business logic)
 * 2. Domain → Persistence (business logic to database)
 * 3. Domain → Card Projection (list view)
 * 4. Domain → Details Projection (detail view)
 */

import type { InferSelectModel } from 'drizzle-orm';
import type { {entityTable} } from '../../database/schema';
import type { {EntityName} } from '../../domain/{module-name}/{entity-name}';
import type {
  {EntityName}CardProjectionDTO,
  {EntityName}DetailsProjectionDTO,
} from '@digilist/client-sdk/types';

// Database type
type Db{EntityName} = InferSelectModel<typeof {entityTable}>;

/**
 * TRANSFORMATION 1: Persistence → Domain
 */
export function toDomain(db: Db{EntityName}): {EntityName} {
  return {
    // Identity
    id: db.id,
    tenantId: db.tenantId,

    // Core attributes
    name: db.name,
    description: db.description || '',

    // Value objects
    location: db.location ? {
      street: db.location.street,
      city: db.location.city,
      postalCode: db.location.postalCode,
      coordinates: db.location.coordinates,
    } : null,

    pricing: db.pricing ? {
      amount: db.pricing.basePrice,
      currency: db.pricing.currency,
      unit: db.pricing.unit.toUpperCase() as 'HOUR' | 'DAY' | 'WEEK',
    } : null,

    // Status
    status: db.status.toUpperCase() as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED',

    // Timestamps
    createdAt: new Date(db.createdAt),
    updatedAt: new Date(db.updatedAt),
  };
}

/**
 * TRANSFORMATION 2: Domain → Persistence
 */
export function toPersistence(
  domain: {EntityName}
): Omit<Db{EntityName}, 'createdAt' | 'updatedAt'> {
  return {
    id: domain.id,
    tenantId: domain.tenantId,
    name: domain.name,
    description: domain.description,
    location: domain.location ? {
      street: domain.location.street,
      city: domain.location.city,
      postalCode: domain.location.postalCode,
      coordinates: domain.location.coordinates,
    } : null,
    pricing: domain.pricing ? {
      basePrice: domain.pricing.amount,
      currency: domain.pricing.currency,
      unit: domain.pricing.unit.toLowerCase(),
    } : null,
    status: domain.status.toLowerCase(),
  };
}

/**
 * TRANSFORMATION 3: Domain → Card Projection (display-ready for lists)
 */
export function toCardProjection(
  domain: {EntityName}
): {EntityName}CardProjectionDTO {
  return {
    id: domain.id,
    name: domain.name,

    // Display-ready fields
    locationFormatted: formatLocation(domain.location),
    priceDisplay: formatPrice(domain.pricing),

    // i18n keys
    statusLabel: `sdk.{entity}.status.${domain.status}`,

    // Metadata
    createdAt: domain.createdAt.toISOString(),
  };
}

/**
 * TRANSFORMATION 4: Domain → Details Projection (full details)
 */
export function toDetailsProjection(
  domain: {EntityName},
  permissions: {
    canEdit?: boolean;
    canDelete?: boolean;
  }
): {EntityName}DetailsProjectionDTO {
  const card = toCardProjection(domain);

  return {
    ...card,

    // Full details
    description: domain.description,
    location: domain.location,
    pricing: domain.pricing,

    // RBAC permissions (computed by service, not client)
    canEdit: permissions.canEdit ?? false,
    canDelete: permissions.canDelete ?? false,
    availableActions: computeAvailableActions(domain, permissions),

    // Timestamps
    updatedAt: domain.updatedAt.toISOString(),
  };
}

/**
 * Helper: Format location for display
 */
function formatLocation(location: Location | null): string {
  if (!location) return '';
  return `${location.street}, ${location.postalCode} ${location.city}`;
}

/**
 * Helper: Format pricing for display
 */
function formatPrice(pricing: Pricing | null): string {
  if (!pricing) return 'Price not set';
  return `${pricing.amount} ${pricing.currency} / ${pricing.unit.toLowerCase()}`;
}

/**
 * Helper: Compute available actions based on permissions
 */
function computeAvailableActions(
  domain: {EntityName},
  permissions: { canEdit?: boolean; canDelete?: boolean }
): string[] {
  const actions: string[] = [];

  if (domain.status === 'DRAFT' && permissions.canEdit) {
    actions.push('publish');
  }

  if (domain.status === 'PUBLISHED' && permissions.canEdit) {
    actions.push('archive');
  }

  if (permissions.canEdit) {
    actions.push('edit');
  }

  if (permissions.canDelete) {
    actions.push('delete');
  }

  return actions;
}
```

**Guidelines:**

- Keep transformations pure (no side effects)
- Handle null values gracefully
- Format dates as ISO strings for JSON
- Use i18n keys for labels
- Compute permissions on server (never client)
- Include helpful comments

---

### Step 4: Update Controller to Use BaseController

**Location:** `apps/api/src/modules/{module-name}/{module-name}.controller.ts`

Refactor controller to extend `BaseController` and use ACL mapper:

**Before:**

```typescript
import { {entityTable} } from '../../database/schema';

export class {EntityName}Controller {
  async getById(request: Request): Promise<Response> {
    const result = await db
      .select()
      .from({entityTable})
      .where(eq({entityTable}.id, request.params.id))
      .limit(1);

    if (result.length === 0) {
      return { status: 404, body: { error: 'Not found' } };
    }

    return { status: 200, body: result[0] };
  }
}
```

**After:**

```typescript
import { BaseController } from '../../core/base.controller';
import { {EntityName}Mapper } from '../../acl/{module-name}/{entity-name}.mapper';
import { {EntityName}Service } from './{entity-name}.service';

export class {EntityName}Controller extends BaseController {
  constructor(private service: {EntityName}Service) {
    super();
  }

  async getById(request: FastifyRequest): Promise<void> {
    const user = this.requireAuth(request);
    const { id } = request.params as { id: string };

    // Service returns domain model (NOT raw database entity)
    const domain = await this.service.findById(id, user.tenantId);

    if (!domain) {
      await this.sendError(request.reply, this.notFound('{EntityName} not found'));
      return;
    }

    // Check permissions
    const canEdit = this.hasPermission(user, '{entity}:update');
    const canDelete = this.hasPermission(user, '{entity}:delete');

    // Transform to projection DTO
    const projection = {EntityName}Mapper.toDetailsProjection(domain, {
      canEdit,
      canDelete,
    });

    await this.sendOk(request.reply, projection);
  }
}
```

**Key Changes:**

1. Extend `BaseController`
2. Remove direct schema imports
3. Service returns domain models
4. Use ACL mapper for transformations
5. Compute permissions server-side
6. Return projection DTOs

---

### Step 5: Update Service Layer

**Location:** `apps/api/src/modules/{module-name}/{entity-name}.service.ts`

Update service to use ACL mapper:

```typescript
import { {EntityName}Mapper } from '../../acl/{module-name}/{entity-name}.mapper';
import { {EntityName}Repository } from '../../repositories/{entity-name}.repository';
import type { {EntityName} } from '../../domain/{module-name}/{entity-name}';

export class {EntityName}Service {
  constructor(private repository: {EntityName}Repository) {}

  async findById(id: string, tenantId: string): Promise<{EntityName} | null> {
    // Repository returns raw database entity
    const db = await this.repository.findById(id, tenantId);

    if (!db) return null;

    // Transform to domain model
    return {EntityName}Mapper.toDomain(db);
  }

  async create(domain: {EntityName}): Promise<{EntityName}> {
    // Validate business rules
    {EntityName}Rules.validateAll(domain);

    // Transform to persistence model
    const persistence = {EntityName}Mapper.toPersistence(domain);

    // Repository inserts and returns raw entity
    const db = await this.repository.create(persistence);

    // Transform back to domain
    return {EntityName}Mapper.toDomain(db);
  }

  async update(id: string, domain: {EntityName}): Promise<{EntityName}> {
    {EntityName}Rules.validateAll(domain);

    const persistence = {EntityName}Mapper.toPersistence(domain);
    const db = await this.repository.update(id, persistence);

    return {EntityName}Mapper.toDomain(db);
  }
}
```

---

### Step 6: Create Repository (if needed)

**Location:** `apps/api/src/repositories/{entity-name}.repository.ts`

Repository handles database access (can use schema directly):

```typescript
import { db } from '../database';
import { {entityTable} } from '../database/schema';
import { eq, and } from 'drizzle-orm';

export class {EntityName}Repository {
  async findById(id: string, tenantId: string) {
    const results = await db
      .select()
      .from({entityTable})
      .where(and(eq({entityTable}.id, id), eq({entityTable}.tenantId, tenantId)))
      .limit(1);

    return results[0] || null;
  }

  async create(data: any) {
    const results = await db.insert({entityTable}).values(data).returning();
    return results[0];
  }

  async update(id: string, data: any) {
    const results = await db
      .update({entityTable})
      .set(data)
      .where(eq({entityTable}.id, id))
      .returning();

    return results[0];
  }
}
```

**Note:** Repositories CAN import schema - they are the data access layer.

---

## Code Examples

### Example: Organization Controller

**Priority:** High (directly imports schema)

**Current:** `apps/api/src/modules/organizations/organizations.controller.ts`

```typescript
// ❌ BEFORE - Direct schema import
import { organizations, users } from '../../database/schema/index';

export class OrganizationsController {
  async getOrganization(request: Request) {
    const result = await db
      .select()
      .from(organizations)
      .where(eq(organizations.id, request.params.id));

    return { status: 200, body: result[0] };
  }
}
```

```typescript
// ✅ AFTER - ACL pattern
import { BaseController } from '../../core/base.controller';
import { OrganizationMapper } from '../../acl/organizations/organization.mapper';
import { OrganizationService } from './organization.service';

export class OrganizationsController extends BaseController {
  constructor(private service: OrganizationService) {
    super();
  }

  async getOrganization(request: FastifyRequest): Promise<void> {
    const user = this.requireAuth(request);
    const { id } = request.params as { id: string };

    const domain = await this.service.findById(id, user.tenantId);

    if (!domain) {
      await this.sendError(request.reply, this.notFound('Organization not found'));
      return;
    }

    const canEdit = this.hasPermission(user, 'organization:update');
    const projection = OrganizationMapper.toDetailsProjection(domain, { canEdit });

    await this.sendOk(request.reply, projection);
  }
}
```

---

## Testing Requirements

### 1. Unit Tests for ACL Mapper

**Location:** `tests/unit/acl/{module-name}-mapper.test.ts`

**Target:** 100% code coverage

**Test Categories:**

```typescript
describe('ACL Mapper - Transformation Correctness', () => {
  it('should map all fields correctly from persistence to domain', () => {});
  it('should handle null values gracefully', () => {});
  it('should perform round-trip transformation without data loss', () => {});
});

describe('ACL Mapper - Edge Cases', () => {
  it('should handle empty arrays', () => {});
  it('should handle missing optional fields', () => {});
  it('should handle malformed data', () => {});
});

describe('ACL Mapper - Projection DTOs', () => {
  it('should create card projection with all required fields', () => {});
  it('should create details projection with permissions', () => {});
  it('should compute available actions correctly', () => {});
});
```

### 2. Integration Tests

**Location:** `tests/integration/{module-name}-flow.test.ts`

**Test Categories:**

```typescript
describe('ACL Integration - Role-Based Access', () => {
  it('should allow ADMIN to view all records', async () => {});
  it('should restrict CITIZEN to own records', async () => {});
});

describe('ACL Integration - Tenant Isolation', () => {
  it('should enforce tenant boundaries', async () => {});
});

describe('ACL Integration - Data Transformation', () => {
  it('should return consistent projection DTOs', async () => {});
});
```

### 3. Security Tests

**Location:** `tests/security/{module-name}-security.test.ts`

**OWASP Top 10 Coverage:**

```typescript
describe('ACL Security - Authorization Bypass', () => {
  it('should not allow permission elevation through metadata', () => {});
});

describe('ACL Security - Injection Attacks', () => {
  it('should sanitize SQL injection attempts', () => {});
});

describe('ACL Security - Mass Assignment', () => {
  it('should ignore protected fields in updates', () => {});
});
```

### 4. Performance Tests

**Location:** `tests/performance/{module-name}-performance.test.ts`

**Targets:**
- Single transformation: <50ms p95
- Batch 100 items: <500ms p95

---

## Verification Checklist

Use this checklist to verify migration is complete:

### Code Quality

- [ ] Domain model created with clear business types
- [ ] ACL mapper implements 4 transformations
- [ ] Controller extends BaseController
- [ ] Controller uses ACL mapper (no direct transformations)
- [ ] Service layer uses domain models
- [ ] No direct schema imports in controller/service
- [ ] RBAC permissions computed server-side
- [ ] All responses use projection DTOs

### Testing

- [ ] Unit tests for ACL mapper (60+ tests)
- [ ] Integration tests for complete flow (40+ tests)
- [ ] Security tests for OWASP Top 10 (28+ tests)
- [ ] Performance tests (18+ tests)
- [ ] All new tests passing
- [ ] All existing tests still passing
- [ ] Test coverage >90%

### ESLint Compliance

- [ ] ESLint rule catches schema imports
- [ ] No ESLint violations in controller
- [ ] No ESLint violations in service

### Documentation

- [ ] Code comments explain transformations
- [ ] Business rules documented in domain model
- [ ] ADR created if architectural decisions made

### Manual Verification

- [ ] API endpoints return projection DTOs
- [ ] RBAC permissions work correctly
- [ ] Tenant isolation enforced
- [ ] Error handling uses RFC 7807 format
- [ ] Audit logging works

---

## Troubleshooting

### Issue: ESLint not catching schema imports

**Solution:**

```bash
# Rebuild ESLint config
pnpm -F @xala/eslint-config build

# Run ESLint
pnpm lint apps/api/src/modules/{module-name}
```

### Issue: Type errors in mapper

**Solution:**

- Verify Projection DTO types exist in `@digilist/client-sdk/types`
- Check database schema types with `InferSelectModel`
- Ensure domain model types match mapper output

### Issue: Tests failing after migration

**Solution:**

1. Check if test data matches new domain model structure
2. Update test assertions to use projection DTO fields
3. Verify RBAC permissions in test fixtures

### Issue: Performance regression

**Solution:**

1. Run performance tests: `pnpm test:run tests/performance/{module-name}-performance.test.ts`
2. Check if N+1 queries introduced (use Drizzle query logging)
3. Add indexes if needed

---

## Controller Priority List

### Priority 1: High (Direct Schema Imports)

These controllers directly import schema and should be migrated first:

1. **MessagesController** (`apps/api/src/modules/messages/messages.controller.ts`)
   - Imports: `conversations`, `messages`, `users`
   - Complexity: Medium
   - Estimated effort: 4 hours

2. **OrganizationsController** (`apps/api/src/modules/organizations/organizations.controller.ts`)
   - Imports: `organizations`, `users`
   - Complexity: Low
   - Estimated effort: 3 hours

3. **CalendarController** (`apps/api/src/modules/calendar/calendar.controller.ts`)
   - Imports: `allocations`, `rentalObjects`, `users`, `bookings`
   - Complexity: High (4 entities)
   - Estimated effort: 6 hours

4. **SeasonalLeaseController** (`apps/api/src/modules/seasonal-lease/seasonal-lease.controller.ts`)
   - Imports: `seasonalLeases`, `rentalObjects`, `organizations`
   - Complexity: Medium
   - Estimated effort: 4 hours

5. **SecurityController** (`apps/api/src/modules/security/security.controller.ts`)
   - Imports: `auditLogs`, `users`, `bookings`, `listings`
   - Complexity: Medium
   - Estimated effort: 4 hours

6. **AuthController** (`apps/api/src/modules/auth/auth.controller.ts`)
   - Imports: `users`, `tenants`
   - Complexity: Low
   - Estimated effort: 3 hours

7. **IdPortenController** (`apps/api/src/modules/auth/idporten.controller.ts`)
   - Imports: `users`
   - Complexity: Low
   - Estimated effort: 2 hours

8. **SeasonApplicationsController** (`apps/api/src/modules/season-applications/season-applications.controller.ts`)
   - Imports: `seasonApplications`, `seasons`, `listings`, `organizations`, `bookings`
   - Complexity: High (5 entities)
   - Estimated effort: 6 hours

9. **DashboardController** (`apps/api/src/modules/dashboard/dashboard.controller.ts`)
   - Imports: `rentalObjects`, `bookings`, `auditLogs`, `users`
   - Complexity: High (aggregation queries)
   - Estimated effort: 6 hours

10. **SettingsController** (`apps/api/src/modules/settings/settings.controller.ts`)
    - Imports: `tenants`
    - Complexity: Low
    - Estimated effort: 2 hours

### Priority 2: Medium (Inconsistent Projections)

Controllers with some projection usage but inconsistent patterns:

11. **BookingController** - Review projection consistency
12. **ConfigurationController** - Enforce projection DTOs
13. **NotificationController** - Standardize responses
14. **AuditController** - Create `AuditLogMapper`
15. **ReportsController** - Review aggregation projections
16. **IntegrationsController** - Create `IntegrationMapper`

### Priority 3: Low (30+ Remaining Controllers)

Gradual migration using patterns from Priority 1/2.

---

## Next Steps

1. **Choose a controller** from Priority 1 list
2. **Follow migration steps** in order
3. **Run verification checklist**
4. **Create PR** with:
   - Domain model
   - ACL mapper
   - Updated controller/service
   - All tests passing
   - Migration notes
5. **Get review** from team
6. **Merge and deploy**
7. **Repeat** for next controller

---

## Support

- Questions: Check `/reports/DECOUPLED_ARCHITECTURE_PLAN.md`
- Issues: Open GitHub issue with `acl-migration` label
- Reference: Study `RentalObjectController` implementation

---

**Document Version:** 1.0
**Last Updated:** 2026-01-16
**Next Review:** After 5 controller migrations
