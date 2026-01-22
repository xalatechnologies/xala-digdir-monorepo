# Expand/Contract Migration Playbook

**Purpose:** Step-by-step guide for safely renaming or restructuring fields in the Xala platform using the Expand/Contract pattern.

**Target Audience:** Backend and frontend developers making schema changes

**Pattern:** Expand (add new) → Migrate (update clients) → Contract (remove old)

---

## Overview

The **Expand/Contract pattern** (also called "Parallel Change") enables zero-downtime schema migrations by temporarily supporting both old and new versions during a transition period.

**Benefits:**
- No breaking changes during migration
- Clients migrate at their own pace
- Rollback is simple (keep old field)
- Production-safe for multi-tenant systems

**Phases:**
1. **EXPAND** - Add new field, keep old field (backward compatible)
2. **MIGRATE** - Update clients to use new field
3. **CONTRACT** - Remove old field (breaking change, major version)

---

## Scenario: Rename `name` → `title`

**Context:** We want to rename the `name` field to `title` across the entire stack (DB, API, SDK, UI).

**Timeline:**
- v1.5.0: EXPAND (add `title`, deprecate `name`)
- v1.6.0-v1.7.0: MIGRATE (update clients)
- v2.0.0: CONTRACT (remove `name`)

**Total duration:** 4-8 weeks

---

## PHASE 1: EXPAND (Add New Field)

**Goal:** Add new field while keeping old field functional. No breaking changes.

### Step 1: Database Migration

**File:** `apps/api/src/database/migrations/YYYYMMDDHHMMSS_add_title_to_rental_objects.sql`

```sql
-- Step 1: Add new column (nullable initially)
ALTER TABLE rental_objects ADD COLUMN title VARCHAR(255);

-- Step 2: Backfill data from existing column
UPDATE rental_objects SET title = name WHERE title IS NULL;

-- Step 3: Make NOT NULL (after backfill completes)
ALTER TABLE rental_objects ALTER COLUMN title SET NOT NULL;

-- Step 4: Add index if needed
CREATE INDEX idx_rental_objects_title ON rental_objects (title);

-- Note: Do NOT drop old column yet
```

**Verification:**
```sql
SELECT COUNT(*) FROM rental_objects WHERE title IS NULL;  -- Should be 0
SELECT COUNT(*) FROM rental_objects WHERE name != title;  -- Should be 0
```

---

### Step 2: Update Database Schema

**File:** `apps/api/src/database/schema/rental-objects.ts`

```typescript
export const rentalObjects = pgTable('rental_objects', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  organizationId: uuid('organization_id'),

  /**
   * @deprecated Use 'title' field instead.
   * Scheduled for removal in v2.0.0 (2026-03-01)
   */
  name: varchar('name', { length: 255 }).notNull(),

  /** Replaces 'name' field. Use this for all new code. */
  title: varchar('title', { length: 255 }).notNull(),  // NEW

  slug: varchar('slug', { length: 255 }).notNull().unique(),
  description: text('description'),
  // ... rest of schema
});
```

**Key Points:**
- Mark old field with `@deprecated` JSDoc
- Include removal date in deprecation notice
- Keep both fields NOT NULL during migration

---

### Step 3: Update ACL Mapper (Dual Support)

**File:** `apps/api/src/acl/rental-objects/rental-object.mapper.ts`

```typescript
export class RentalObjectMapper {
  /**
   * DATABASE → DOMAIN
   * Support both old and new fields during migration
   */
  static toDomain(db: DbRentalObject): DomainRentalObject {
    return {
      id: db.id,
      tenantId: db.tenantId,

      // PREFER new field, FALLBACK to old field
      title: db.title || db.name,

      // ... rest of mappings
    };
  }

  /**
   * DOMAIN → DATABASE
   * Write to BOTH fields during migration
   */
  static toPersistence(domain: DomainRentalObject): Partial<DbRentalObject> {
    return {
      id: domain.id,
      tenantId: domain.tenantId,

      // CRITICAL: Write to BOTH fields
      title: domain.title,
      name: domain.title,  // Keep old field in sync

      // ... rest of mappings
    };
  }

  /**
   * DOMAIN → PROJECTION
   * Projection DTO exposes both fields (new + deprecated)
   */
  static toCardProjection(
    domain: DomainRentalObject,
    permissions?: any
  ): RentalObjectCardProjectionDTO {
    return {
      id: domain.id,
      slug: domain.slug,

      // NEW field
      title: domain.title,

      // OLD field (same value, deprecated)
      name: domain.title,

      // ... rest of projection
    };
  }
}
```

**Key Points:**
- `toDomain`: Prefer new field, fallback to old
- `toPersistence`: Write to BOTH fields (keep in sync)
- `toCardProjection`: Return BOTH fields (clients can use either)

---

### Step 4: Update Domain Model

**File:** `apps/api/src/domain/rental-objects/rental-object.ts`

```typescript
export interface RentalObject {
  id: string;
  tenantId: string;
  organizationId?: string;

  /** New canonical field name */
  title: string;  // Use 'title' in domain model

  slug: string;
  description: string;
  category: string;
  // ... rest of domain model
}
```

**Key Point:** Domain model uses NEW field name only. ACL handles backward compatibility.

---

### Step 5: Update Projection DTO

**File:** `packages/client-sdk/src/types/projection-dtos.ts`

```typescript
export interface RentalObjectCardProjectionDTO {
  id: string;
  slug: string;
  tenantId: string;

  /** New field for rental object title */
  title: string;  // NEW

  /**
   * @deprecated Use 'title' field instead.
   * Scheduled for removal in v2.0.0 (2026-03-01)
   * Both fields contain the same value during migration period.
   */
  name: string;   // OLD (deprecated, but still present)

  // ... rest of projection
}
```

**Key Points:**
- Add new field without removing old field
- Mark old field with `@deprecated` JSDoc
- Include removal date
- Document that both fields have same value

---

### Step 6: Update Validation Schemas

**File:** `apps/api/src/schemas/rental-object.schema.ts`

```typescript
import { z } from 'zod';

export const CreateRentalObjectSchema = z.object({
  // Accept EITHER old or new field (backward compatible)
  title: z.string().min(1).max(255).optional(),
  name: z.string().min(1).max(255).optional(),  // @deprecated

  slug: z.string(),
  description: z.string().optional(),
  // ... rest of schema
}).refine(
  (data) => data.title || data.name,
  {
    message: "Either 'title' or 'name' (deprecated) must be provided",
  }
);

export const UpdateRentalObjectSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  name: z.string().min(1).max(255).optional(),  // @deprecated
  // ... rest of schema
});
```

**Key Point:** Accept both fields in input, but prefer new field in processing.

---

### Step 7: Deploy EXPAND Phase

```bash
# Run database migration
pnpm db:migrate

# Build and test
pnpm build
pnpm test

# Deploy API
pnpm deploy:api

# Verify both fields are returned
curl https://api.digilist.no/api/rental-objects/123 | jq '.data | {name, title}'
# Output: { "name": "Auditorium A", "title": "Auditorium A" }
```

**Verification Checklist:**
- [ ] Database migration succeeded
- [ ] Both `name` and `title` columns exist
- [ ] Both fields contain identical values
- [ ] API returns both fields in responses
- [ ] Old SDK clients still work (using `name`)
- [ ] New SDK clients can use `title`
- [ ] No breaking changes

---

## PHASE 2: MIGRATE (Update Clients)

**Goal:** Update SDK and all UI clients to use new field. No breaking changes yet.

**Duration:** 2-4 releases (4-8 weeks)

### Step 1: Update SDK Service Methods

**File:** `packages/client-sdk/src/services/rental-object.service.ts`

```typescript
export class RentalObjectService extends BaseService {
  async create(data: CreateRentalObjectDTO): Promise<RentalObject> {
    // Use new field name internally
    const payload = {
      ...data,
      title: data.title || data.name,  // Accept both, prefer new
    };

    // Remove deprecated field from payload
    delete payload.name;

    return this.post('/api/rental-objects', payload);
  }

  async update(id: string, data: UpdateRentalObjectDTO): Promise<RentalObject> {
    const payload = {
      ...data,
      title: data.title || data.name,  // Accept both, prefer new
    };

    delete payload.name;

    return this.put(`/api/rental-objects/${id}`, payload);
  }
}
```

---

### Step 2: Update UI Components (All 3 Apps)

**Search for old field usage:**

```bash
# Find all components using old field
rg "rental\.name|listing\.name" apps/web/src
rg "rental\.name|listing\.name" apps/backoffice/src
rg "rental\.name|listing\.name" apps/minside/src
```

**Update components:**

**Before:**
```tsx
// ❌ apps/web/src/components/RentalObjectCard.tsx
function RentalObjectCard({ rental }: Props) {
  return (
    <Card>
      <Heading>{rental.name}</Heading>
    </Card>
  );
}
```

**After:**
```tsx
// ✅ apps/web/src/components/RentalObjectCard.tsx
function RentalObjectCard({ rental }: Props) {
  return (
    <Card>
      <Heading>{rental.title}</Heading>
    </Card>
  );
}
```

**Repeat for all files:**
- `apps/web/src/pages/RentalObjectsPage.tsx`
- `apps/web/src/features/rental-object-details/components/RentalObjectDetailsLayout.tsx`
- `apps/backoffice/src/features/rental-objects/components/list/RentalObjectsGrid.tsx`
- `apps/minside/src/features/rental-objects/components/list/RentalObjectsGrid.tsx`
- ... (15+ files total)

---

### Step 3: Update Form Components

**Before:**
```tsx
// ❌ apps/backoffice/src/features/rental-objects/forms/RentalObjectForm.tsx
<Input
  label={t('rentalObject.form.name')}
  name="name"
  value={formData.name}
  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
/>
```

**After:**
```tsx
// ✅ apps/backoffice/src/features/rental-objects/forms/RentalObjectForm.tsx
<Input
  label={t('rentalObject.form.title')}
  name="title"
  value={formData.title}
  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
/>
```

---

### Step 4: Update i18n Keys

**File:** `packages/i18n/src/locales/nb.ts`

```typescript
export const nb = {
  rentalObject: {
    form: {
      // Old key (keep for backward compatibility)
      name: 'Navn',  // @deprecated

      // New key
      title: 'Tittel',
    },
  },
};
```

**File:** `packages/i18n/src/locales/en.ts`

```typescript
export const en = {
  rentalObject: {
    form: {
      name: 'Name',   // @deprecated
      title: 'Title', // NEW
    },
  },
};
```

---

### Step 5: Automated Migration Script (Optional)

```bash
#!/bin/bash
# scripts/migrate-name-to-title.sh

# Find and replace in TSX files
find apps/ -type f -name "*.tsx" -exec sed -i '' 's/rental\.name/rental.title/g' {} +
find apps/ -type f -name "*.tsx" -exec sed -i '' 's/listing\.name/listing.title/g' {} +

# Find and replace in TS files
find apps/ -type f -name "*.ts" -exec sed -i '' 's/rental\.name/rental.title/g' {} +
find apps/ -type f -name "*.ts" -exec sed -i '' 's/listing\.name/listing.title/g' {} +

# Rebuild
pnpm build

# Run tests
pnpm test
```

**Manual review required after automated script.**

---

### Step 6: Deploy MIGRATE Phase

```bash
# Build SDK
cd packages/client-sdk
pnpm build

# Build all apps
pnpm build

# Run tests
pnpm test
pnpm test:e2e

# Deploy frontend apps
pnpm deploy:web
pnpm deploy:backoffice
pnpm deploy:minside
```

**Verification Checklist:**
- [ ] SDK uses `title` internally
- [ ] All UI components use `title`
- [ ] Forms submit `title` field
- [ ] i18n keys updated
- [ ] Tests pass
- [ ] E2E tests pass
- [ ] Old clients (if any) still work (API returns both fields)

---

## PHASE 3: CONTRACT (Remove Old Field)

**Goal:** Remove deprecated field. This is a **BREAKING CHANGE** requiring major version bump.

**Timing:** After deprecation window (2-4 releases, 4-8 weeks after EXPAND)

**Prerequisites:**
- [ ] All clients migrated to new field
- [ ] Deprecation window elapsed
- [ ] No usage of old field in logs/monitoring

---

### Step 1: Remove from Projection DTO

**File:** `packages/client-sdk/src/types/projection-dtos.ts`

```typescript
export interface RentalObjectCardProjectionDTO {
  id: string;
  slug: string;
  tenantId: string;

  title: string;  // ONLY new field remains
  // ❌ name: string;  ← REMOVED

  // ... rest of projection
}
```

---

### Step 2: Stop Writing to Old Field (ACL)

**File:** `apps/api/src/acl/rental-objects/rental-object.mapper.ts`

```typescript
export class RentalObjectMapper {
  static toDomain(db: DbRentalObject): DomainRentalObject {
    return {
      title: db.title,  // ONLY read from new field
      // No fallback to old field
    };
  }

  static toPersistence(domain: DomainRentalObject): Partial<DbRentalObject> {
    return {
      title: domain.title,  // ONLY write to new field
      // ❌ name: domain.title,  ← STOP writing to old field
    };
  }

  static toCardProjection(domain: DomainRentalObject): RentalObjectCardProjectionDTO {
    return {
      title: domain.title,  // ONLY return new field
      // ❌ name: domain.title,  ← STOP returning old field
    };
  }
}
```

---

### Step 3: Remove from Validation Schema

**File:** `apps/api/src/schemas/rental-object.schema.ts`

```typescript
export const CreateRentalObjectSchema = z.object({
  title: z.string().min(1).max(255),  // ONLY accept new field
  // ❌ name: z.string().optional(),  ← REMOVED

  slug: z.string(),
  description: z.string().optional(),
  // ... rest of schema
});
```

---

### Step 4: Drop Database Column

**File:** `apps/api/src/database/migrations/YYYYMMDDHHMMSS_drop_name_from_rental_objects.sql`

```sql
-- Step 1: Verify no writes to old column (check last updated timestamp)
SELECT MAX(updated_at) FROM rental_objects WHERE name IS NOT NULL;

-- Step 2: Drop column (BREAKING CHANGE)
ALTER TABLE rental_objects DROP COLUMN name;

-- Step 3: Verify column is gone
\d rental_objects;
```

**Verification:**
```sql
-- This should error (column doesn't exist)
SELECT name FROM rental_objects LIMIT 1;
-- ERROR:  column "name" does not exist
```

---

### Step 5: Remove from Database Schema

**File:** `apps/api/src/database/schema/rental-objects.ts`

```typescript
export const rentalObjects = pgTable('rental_objects', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  organizationId: uuid('organization_id'),

  title: varchar('title', { length: 255 }).notNull(),  // ONLY new field
  // ❌ name: varchar('name', { length: 255 }).notNull(),  ← REMOVED

  slug: varchar('slug', { length: 255 }).notNull().unique(),
  description: text('description'),
  // ... rest of schema
});
```

---

### Step 6: Release Major Version

**Bump version to v2.0.0:**

```bash
# Update package.json versions
pnpm version major

# Tag release
git tag v2.0.0
git push origin v2.0.0

# Deploy
pnpm deploy:all
```

**Release Notes Template:**

```markdown
# v2.0.0 - Major Release (BREAKING CHANGES)

## Breaking Changes

### Rental Object Field Rename: `name` → `title`

**Impact:** The `name` field has been removed from all Rental Object DTOs.

**Migration:**
- **API:** Use `title` field instead of `name`
- **SDK:** Update imports to use `RentalObjectCardProjectionDTO.title`
- **UI:** Replace all `rental.name` with `rental.title`

**Deprecation History:**
- v1.5.0 (2025-01-15): `title` field added, `name` deprecated
- v1.6.0 (2025-02-01): Migration guidance published
- v1.7.0 (2025-02-15): Final warning
- v2.0.0 (2026-03-01): `name` field removed

**Rollback:** If you need the old API, use v1.7.x releases.

---

## Other Changes

- Improved performance
- Bug fixes
- Updated dependencies
```

---

### Step 7: Deploy CONTRACT Phase

```bash
# Run database migration
pnpm db:migrate

# Rebuild everything
pnpm build

# Run all tests
pnpm test
pnpm test:e2e

# Deploy
pnpm deploy:all
```

**Verification Checklist:**
- [ ] Database column dropped
- [ ] Schema definition removed
- [ ] Projection DTO only has `title`
- [ ] ACL only reads/writes `title`
- [ ] Validation schema only accepts `title`
- [ ] All tests pass
- [ ] E2E tests pass
- [ ] Release notes published
- [ ] Major version tag created

---

## Timeline Summary

| Date | Version | Phase | Action |
|------|---------|-------|--------|
| 2026-01-15 | v1.5.0 | EXPAND | Add `title`, deprecate `name` |
| 2026-01-22 | v1.5.1 | MIGRATE | Update SDK to prefer `title` |
| 2026-02-01 | v1.6.0 | MIGRATE | Update apps/web to use `title` |
| 2026-02-08 | v1.6.1 | MIGRATE | Update apps/backoffice to use `title` |
| 2026-02-15 | v1.7.0 | MIGRATE | Update apps/minside to use `title` |
| 2026-02-22 | v1.7.1 | MIGRATE | Final migration check |
| 2026-03-01 | v2.0.0 | CONTRACT | Remove `name` field (BREAKING) |

**Total Duration:** ~6 weeks

---

## Rollback Procedures

### Rollback During EXPAND Phase

**If issues found after EXPAND deployment:**

```sql
-- No rollback needed - old field still works
-- Just fix the bug and redeploy
```

### Rollback During MIGRATE Phase

**If clients have issues with new field:**

```bash
# Revert client code to use old field
git revert <commit-hash>

# Redeploy clients
pnpm deploy:web
pnpm deploy:backoffice
pnpm deploy:minside

# API still supports both fields, no API changes needed
```

### Rollback During CONTRACT Phase

**If breaking change causes issues:**

```bash
# This is HARD - requires restoring old field

# Step 1: Re-add column to database
ALTER TABLE rental_objects ADD COLUMN name VARCHAR(255);
UPDATE rental_objects SET name = title;

# Step 2: Revert API code to v1.7.x
git checkout v1.7.0
pnpm deploy:api

# Step 3: Revert SDK and UI to v1.7.x
pnpm deploy:all
```

**Lesson:** Always wait full deprecation window before CONTRACT phase.

---

## Checklist Template

Use this checklist for any Expand/Contract migration:

```markdown
## EXPAND Phase
- [ ] Database migration written
- [ ] Schema updated (both fields)
- [ ] ACL mapper updated (read both, write both)
- [ ] Projection DTO updated (both fields)
- [ ] Validation schema updated (accept both)
- [ ] Tests updated
- [ ] Deploy API
- [ ] Verify both fields returned

## MIGRATE Phase
- [ ] SDK service methods updated
- [ ] All UI components updated (15+ files)
- [ ] Form components updated
- [ ] i18n keys updated
- [ ] Grep for old field usage (none found)
- [ ] Tests pass
- [ ] Deploy all clients
- [ ] Monitor for errors (1-2 weeks)

## CONTRACT Phase
- [ ] Deprecation window elapsed (4-8 weeks)
- [ ] No usage of old field in logs
- [ ] Projection DTO updated (remove old field)
- [ ] ACL mapper updated (stop writing old field)
- [ ] Validation schema updated (reject old field)
- [ ] Database migration written (drop column)
- [ ] Schema definition updated (remove old field)
- [ ] Tests updated
- [ ] Major version bump
- [ ] Release notes written
- [ ] Deploy all
- [ ] Monitor for errors
```

---

## Common Pitfalls

### 1. Forgetting to Write to Both Fields

**Wrong:**
```typescript
static toPersistence(domain) {
  return {
    title: domain.title,  // ❌ Only writes to new field
  };
}
```

**Right:**
```typescript
static toPersistence(domain) {
  return {
    title: domain.title,
    name: domain.title,  // ✅ Writes to BOTH during EXPAND/MIGRATE
  };
}
```

### 2. Removing Old Field Too Early

**Problem:** Removing old field before all clients migrate causes immediate breakage.

**Solution:** Always wait full deprecation window (2-4 releases).

### 3. Forgetting to Update Validation Schemas

**Problem:** API accepts old field in POST/PUT, but ACL doesn't map it correctly.

**Solution:** Update validation schemas in EXPAND phase to accept both fields.

### 4. Not Documenting Deprecation

**Problem:** Clients don't know old field is deprecated.

**Solution:** Use JSDoc `@deprecated` tags with removal date.

---

## Summary

The **Expand/Contract pattern** enables safe schema migrations by:
1. **EXPAND:** Add new field, keep old field (backward compatible)
2. **MIGRATE:** Update clients to new field (2-4 releases)
3. **CONTRACT:** Remove old field (breaking change, major version)

**Key Success Factors:**
- Database supports both fields during migration
- ACL writes to both fields during EXPAND/MIGRATE
- Projection DTO returns both fields until CONTRACT
- Clients have 4-8 weeks to migrate
- Major version bump for CONTRACT phase

This pattern prevents breaking changes and enables zero-downtime migrations in production multi-tenant systems.
