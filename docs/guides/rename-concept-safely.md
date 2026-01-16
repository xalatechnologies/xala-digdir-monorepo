# How to Rename a Concept Safely

**Last Updated:** 2026-01-16
**Status:** Authoritative Runbook

---

## Overview

This runbook provides step-by-step instructions for safely renaming a concept (field, entity, or terminology) across the entire Xala platform without breaking production.

**Pattern Used:** Expand → Migrate → Contract

**Key Principle:** Never remove anything until all consumers have migrated.

---

## Prerequisites

- [ ] Understand the scope of the change (DB, API, SDK, UI)
- [ ] Identify all files that reference the old term
- [ ] Plan deprecation timeline (minimum 4 weeks)
- [ ] Communicate change to team

---

## Phase 1: EXPAND (Add New, Keep Old)

### Duration: 1 release

### 1.1 Database Migration

Create a migration that adds the new column:

```sql
-- migrations/YYYYMMDDHHMMSS_add_title_to_rental_objects.sql

-- Step 1: Add new column (nullable)
ALTER TABLE rental_objects ADD COLUMN title VARCHAR(255);

-- Step 2: Backfill from old column
UPDATE rental_objects SET title = name WHERE title IS NULL;

-- Step 3: Make NOT NULL after backfill
ALTER TABLE rental_objects ALTER COLUMN title SET NOT NULL;

-- DO NOT drop old column yet
```

### 1.2 Update Schema Definition

```typescript
// apps/api/src/database/schema/rental-objects.ts

export const rentalObjects = pgTable('rental_objects', {
  /**
   * @deprecated Use 'title' instead.
   * Scheduled for removal in v2.0.0 (YYYY-MM-DD)
   */
  name: varchar('name', { length: 255 }).notNull(),

  /** New field - use this instead of 'name' */
  title: varchar('title', { length: 255 }).notNull(),
});
```

### 1.3 Update ACL Mapper

```typescript
// apps/api/src/acl/*/mapper.ts

export function toDomain(db: DbEntity): DomainEntity {
  return {
    // PREFER new, FALLBACK to old
    title: db.title || db.name,
  };
}

export function toPersistence(domain: DomainEntity) {
  return {
    // WRITE TO BOTH during expansion
    title: domain.title,
    name: domain.title,
  };
}

export function toCardProjection(domain: DomainEntity) {
  return {
    // Return BOTH fields
    title: domain.title,
    name: domain.title, // @deprecated
  };
}
```

### 1.4 Update Projection DTO

```typescript
// packages/client-sdk/src/types/projection-dtos.ts

export interface EntityCardProjectionDTO {
  /** New field */
  title: string;

  /**
   * @deprecated Use 'title' instead.
   * Removed in v2.0.0 (YYYY-MM-DD)
   * Both fields contain the same value during migration.
   */
  name: string;
}
```

### 1.5 Deploy and Verify

```bash
pnpm db:migrate
pnpm build
pnpm test
pnpm deploy:api

# Verify both fields are returned
curl https://api.digilist.no/api/entities/123 | jq '.data | {name, title}'
```

### 1.6 Checklist

- [ ] Database migration succeeded
- [ ] Both columns exist and have data
- [ ] API returns both fields
- [ ] Old clients still work
- [ ] New field available for use

---

## Phase 2: MIGRATE (Update Consumers)

### Duration: 2-4 releases

### 2.1 Update SDK Internally

```typescript
// packages/client-sdk/src/services/entity.service.ts

async create(data: CreateEntityDTO) {
  const payload = {
    ...data,
    title: data.title || data.name, // Accept both, prefer new
  };
  delete payload.name; // Send only new to API
  return this.post('/api/entities', payload);
}
```

### 2.2 Find All UI Usages

```bash
# Find all components using old field
rg "entity\.name|\.name" apps/web/src
rg "entity\.name|\.name" apps/backoffice/src
rg "entity\.name|\.name" apps/minside/src
```

### 2.3 Update Components

```tsx
// Before
<Heading>{entity.name}</Heading>

// After
<Heading>{entity.title}</Heading>
```

### 2.4 Update Forms

```tsx
// Before
<Input
  label={t('entity.form.name')}
  name="name"
  value={formData.name}
/>

// After
<Input
  label={t('entity.form.title')}
  name="title"
  value={formData.title}
/>
```

### 2.5 Update i18n Keys

```typescript
// packages/i18n/src/locales/nb.ts
export const nb = {
  entity: {
    form: {
      name: 'Navn', // @deprecated
      title: 'Tittel', // NEW
    },
  },
};
```

### 2.6 Deploy Frontend Updates

```bash
pnpm build
pnpm test
pnpm deploy:web
pnpm deploy:backoffice
pnpm deploy:minside
```

### 2.7 Checklist

- [ ] SDK uses new field internally
- [ ] All UI components updated
- [ ] All forms updated
- [ ] i18n keys updated
- [ ] No usage of old field in apps
- [ ] E2E tests pass

---

## Phase 3: CONTRACT (Remove Old)

### Duration: 1 release (MAJOR version)

**⚠️ WARNING: This is a BREAKING CHANGE**

### 3.1 Prerequisites Check

- [ ] Deprecation window elapsed (4+ weeks since EXPAND)
- [ ] No usage of old field in logs/monitoring
- [ ] All clients migrated

### 3.2 Remove from Projection DTO

```typescript
// packages/client-sdk/src/types/projection-dtos.ts

export interface EntityCardProjectionDTO {
  title: string;
  // name: string; ← REMOVED
}
```

### 3.3 Update ACL Mapper

```typescript
export function toDomain(db: DbEntity): DomainEntity {
  return {
    title: db.title, // Only new field
  };
}

export function toPersistence(domain: DomainEntity) {
  return {
    title: domain.title, // Only new field
    // name: domain.title, ← STOP writing
  };
}

export function toCardProjection(domain: DomainEntity) {
  return {
    title: domain.title,
    // name: domain.title, ← REMOVED
  };
}
```

### 3.4 Remove from Validation Schema

```typescript
// apps/api/src/schemas/entity.schema.ts

export const CreateEntitySchema = z.object({
  title: z.string().min(1).max(255), // Only new field
  // name: z.string().optional(), ← REMOVED
});
```

### 3.5 Drop Database Column

```sql
-- migrations/YYYYMMDDHHMMSS_drop_name_from_entities.sql

-- Verify no recent writes
SELECT MAX(updated_at) FROM entities WHERE name IS NOT NULL;

-- Drop column
ALTER TABLE entities DROP COLUMN name;
```

### 3.6 Release Major Version

```bash
# Bump version
pnpm version major

# Tag release
git tag v2.0.0
git push origin v2.0.0

# Deploy
pnpm deploy:all
```

### 3.7 Release Notes Template

```markdown
# v2.0.0 - Breaking Changes

## Field Rename: `name` → `title`

The `name` field has been removed. Use `title` instead.

### Migration Guide

**API:**
- Replace `entity.name` with `entity.title`
- Update form submissions to use `title`

**Deprecation Timeline:**
- v1.5.0 (2026-01-15): `title` added, `name` deprecated
- v1.6.0 (2026-02-01): Migration warnings
- v2.0.0 (2026-03-01): `name` removed

**Rollback:** Use v1.7.x if you need the old field.
```

### 3.8 Checklist

- [ ] Projection DTO updated
- [ ] ACL mapper updated
- [ ] Validation schema updated
- [ ] Database column dropped
- [ ] Major version released
- [ ] Release notes published
- [ ] Old clients documented as incompatible

---

## Rollback Procedures

### During EXPAND Phase

No rollback needed - old field still works.

### During MIGRATE Phase

```bash
# Revert UI to use old field
git revert <commit>
pnpm deploy:web
# API still supports both fields
```

### During CONTRACT Phase

```bash
# HARD ROLLBACK - Re-add column
psql -c "ALTER TABLE entities ADD COLUMN name VARCHAR(255);"
psql -c "UPDATE entities SET name = title;"

# Revert API to v1.7.x
git checkout v1.7.0
pnpm deploy:api

# Revert clients
pnpm deploy:all
```

---

## Timeline Template

| Week | Phase | Actions |
|------|-------|---------|
| 0 | EXPAND | Add new field, deprecate old |
| 1 | MIGRATE | Update SDK |
| 2 | MIGRATE | Update apps/web |
| 3 | MIGRATE | Update apps/backoffice |
| 4 | MIGRATE | Update apps/minside, verify |
| 5 | WAIT | Monitor for issues |
| 6 | CONTRACT | Remove old field (v2.0.0) |

**Minimum Duration:** 4 weeks

---

## Compatibility Checklist

Before starting:

- [ ] Field is used in database schema
- [ ] Field is used in API responses
- [ ] Field is used in SDK types
- [ ] Field is used in UI components
- [ ] Field is used in forms
- [ ] Field is used in i18n keys
- [ ] Field is used in tests
- [ ] Field is used in documentation

After completion:

- [ ] Old field removed from database
- [ ] Old field removed from API
- [ ] Old field removed from SDK
- [ ] Old field removed from UI
- [ ] Old i18n keys removed
- [ ] Tests updated
- [ ] Documentation updated
- [ ] Major version released

---

## References

- `reports/EXPAND_CONTRACT_PLAYBOOK.md` - Detailed playbook
- `docs/architecture/boundaries.md` - Layer boundaries
- `docs/architecture/acl-mapping.md` - ACL pattern
