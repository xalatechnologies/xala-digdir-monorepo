# Entitlements Schema Synchronization Guide

**Purpose:** Maintain consistency between TypeScript schema definitions and SQL migrations for the entitlements system.

---

## 🎯 **The Challenge**

The Digilist codebase has **circular dependencies** in the schema layer:
- `modules.ts` imports from `index.ts`
- `index.ts` exports from `modules.ts`
- This prevents Drizzle from auto-generating migrations

**Solution:** Manual SQL migrations with documented synchronization process.

---

## 📁 **Files to Keep in Sync**

### TypeScript Schema
**File:** `apps/api/src/database/schema/entitlements.ts`

Defines Drizzle table schemas for:
- `planEntitlements`
- `tenantEntitlementOverrides`
- `integrationConfigs`
- `routePolicies`
- `navPolicies`
- `globalKillSwitches`
- `entitlementAuditLog`

### SQL Migration
**File:** `apps/api/drizzle/0040_entitlements_system.sql`

Contains `CREATE TABLE` statements for all 7 tables with:
- Foreign key constraints
- Indexes
- Unique constraints
- Default values
- Comments

---

## ✅ **Synchronization Checklist**

When modifying the entitlements schema:

### 1. **Update TypeScript Schema First**
```typescript
// apps/api/src/database/schema/entitlements.ts
export const planEntitlements = saasSchema.table('plan_entitlements', {
  // Add/modify columns here
  newColumn: varchar('new_column', { length: 100 }),
});
```

### 2. **Update SQL Migration**
```sql
-- apps/api/drizzle/0040_entitlements_system.sql
ALTER TABLE "saas"."plan_entitlements" 
  ADD COLUMN "new_column" varchar(100);
```

**OR** create a new migration:
```sql
-- apps/api/drizzle/0041_add_new_column.sql
ALTER TABLE "saas"."plan_entitlements" 
  ADD COLUMN "new_column" varchar(100);
```

### 3. **Verify Consistency**

**Column names match:**
```typescript
// TypeScript
newColumn: varchar('new_column', { length: 100 })
```
```sql
-- SQL
"new_column" varchar(100)
```

**Data types match:**
| TypeScript | SQL |
|------------|-----|
| `varchar('x', { length: 50 })` | `varchar(50)` |
| `uuid('x')` | `uuid` |
| `boolean('x')` | `boolean` |
| `timestamp('x')` | `timestamp` |
| `jsonb('x')` | `jsonb` |
| `integer('x')` | `integer` |
| `text('x')` | `text` |

**Constraints match:**
- `.notNull()` → `NOT NULL`
- `.default(value)` → `DEFAULT value`
- `.primaryKey()` → `PRIMARY KEY`
- `.unique()` → `UNIQUE`

### 4. **Test Migration**
```bash
# Run migration
pnpm --filter @digilist/api db:migrate

# Verify tables exist
psql -d digilist -c "\d saas.plan_entitlements"
```

---

## 🔄 **Workflow for Schema Changes**

### **Option A: Modify Existing Migration (Pre-Production Only)**

**When:** Before `0040_entitlements_system.sql` has been deployed to production.

1. Update `entitlements.ts`
2. Update `0040_entitlements_system.sql`
3. Drop and recreate local database
4. Run migrations
5. Test

### **Option B: Create New Migration (Production Safe)**

**When:** After `0040_entitlements_system.sql` is in production.

1. Update `entitlements.ts`
2. Create `0041_modify_entitlements.sql`
3. Run migration
4. Test

**Example:**
```sql
-- 0041_add_priority_to_plan_entitlements.sql
ALTER TABLE "saas"."plan_entitlements" 
  ADD COLUMN "priority" integer DEFAULT 0 NOT NULL;

CREATE INDEX "plan_entitlements_priority_idx" 
  ON "saas"."plan_entitlements" ("priority");
```

---

## 🚨 **Common Pitfalls**

### ❌ **Don't Do This**
```typescript
// TypeScript says:
priority: integer('priority').default(0).notNull()

// But SQL has:
"priority" integer  -- Missing DEFAULT and NOT NULL
```

### ✅ **Do This**
```typescript
// TypeScript:
priority: integer('priority').default(0).notNull()

// SQL:
"priority" integer DEFAULT 0 NOT NULL
```

---

## 🛠️ **Validation Script**

Create a validation script to check sync:

```typescript
// scripts/validate-entitlements-schema.ts
import { planEntitlements } from '../src/database/schema/entitlements';
import { readFileSync } from 'fs';

const sqlMigration = readFileSync('./drizzle/0040_entitlements_system.sql', 'utf-8');

// Check each column exists in SQL
for (const [columnName, column] of Object.entries(planEntitlements)) {
  if (!sqlMigration.includes(`"${columnName}"`)) {
    console.error(`❌ Column ${columnName} missing in SQL migration`);
  }
}
```

---

## 📋 **Future Migrations**

### **Adding a New Table**

1. **Add to TypeScript:**
```typescript
// entitlements.ts
export const newTable = saasSchema.table('new_table', {
  id: uuid('id').primaryKey().defaultRandom(),
  // ...
});
```

2. **Create New Migration:**
```sql
-- 0041_add_new_table.sql
CREATE TABLE "saas"."new_table" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  -- ...
);
```

3. **Export from index.ts:**
```typescript
// index.ts
export * from './entitlements';
```

### **Modifying Existing Table**

1. **Update TypeScript:**
```typescript
export const planEntitlements = saasSchema.table('plan_entitlements', {
  // existing columns...
  newField: varchar('new_field', { length: 100 }),
});
```

2. **Create ALTER Migration:**
```sql
-- 0041_add_field_to_plan_entitlements.sql
ALTER TABLE "saas"."plan_entitlements" 
  ADD COLUMN "new_field" varchar(100);
```

---

## 🎓 **Why Manual Migrations?**

**Pros:**
- ✅ Full control over SQL
- ✅ Can add comments, optimizations
- ✅ Avoids circular dependency issues
- ✅ Explicit about schema changes

**Cons:**
- ⚠️ Requires manual synchronization
- ⚠️ Risk of drift if not careful

**Decision:** Manual migrations are worth it for this system due to the circular dependency architecture.

---

## 📝 **Checklist for Every Schema Change**

- [ ] Update TypeScript schema in `entitlements.ts`
- [ ] Create/update SQL migration in `drizzle/`
- [ ] Verify column names match exactly
- [ ] Verify data types match
- [ ] Verify constraints match (NOT NULL, DEFAULT, etc.)
- [ ] Test migration locally
- [ ] Update this documentation if needed
- [ ] Code review with focus on schema sync

---

## 🔗 **Related Files**

- `apps/api/src/database/schema/entitlements.ts` - TypeScript definitions
- `apps/api/drizzle/0040_entitlements_system.sql` - SQL migration
- `apps/api/src/modules/entitlements/types.ts` - Type enums
- `docs/implementation/ENTITLEMENTS_IMPLEMENTATION_STATUS.md` - Implementation status

---

**Last Updated:** 2026-01-18  
**Maintainer:** Development Team
