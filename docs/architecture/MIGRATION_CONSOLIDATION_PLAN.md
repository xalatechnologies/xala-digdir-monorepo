# Migration Consolidation Plan

**Created:** 2026-01-17  
**Priority:** 🔴 HIGH  
**Issue:** Multiple migration sources causing confusion

---

## 🚨 Problem Statement

The codebase currently has **THREE** migration directories, creating confusion about the single source of truth:

```
apps/api/
├── drizzle/                          # ✅ PRIMARY: 17 migrations (0001-0017)
│   ├── 0001_clean_schema.sql        #    50,562 bytes - Full schema
│   ├── 0002_domain_notifications.sql
│   ├── ...
│   └── 0017_domain_payments_complete.sql
│
├── src/database/migrations/          # ⚠️ DUPLICATE: Legacy SQL scripts
│   ├── 0008_add_rental_object_category.sql
│   ├── 20260115_*.sql
│   └── 20260116_001_saas_admin_schema.sql
│
└── migrations/                       # ⚠️ ORPHAN: Single initial schema
    └── 001_initial_schema.sql       #    Only foreign keys & indexes
```

---

## 📋 Current Configuration

### Drizzle Config (`drizzle.config.ts`)
```typescript
export default defineConfig({
  schema: './src/database/schema/index.ts',
  out: './drizzle',  // ✅ Correct: Points to drizzle/
  dialect: 'postgresql',
});
```

### Migration Script (`scripts/migrate.ts`)
The script tries to run migrations from **MULTIPLE** sources:
1. **Drizzle migrations** (`./drizzle`) - PRIMARY
2. **SQL migrations** (`./src/database/migrations`) - FALLBACK
3. **Feature flags seed** (automatic)

This hybrid approach is error-prone and confusing.

---

## ✅ Recommended Solution: Single Source of Truth

### Strategy: **Drizzle-Only Migrations**

Make `apps/api/drizzle/` the **SINGLE** source of truth for all database migrations.

### Action Plan:

#### Phase 1: Audit & Consolidate (Immediate)

1. **Verify Drizzle Completeness**
   - ✅ Migrations 0001-0017 are complete
   - ✅ All roadmap items through 0017 are implemented
   - ❌ SQL migrations in `src/database/migrations/` may contain duplicates

2. **Identify Duplicates**
   ```bash
   # Check if src/database/migrations/ contains anything not in drizzle/
   cd apps/api
   diff -r drizzle/ src/database/migrations/
   ```

3. **Decision Tree**:
   ```
   For each file in src/database/migrations/:
   
   IF content is in drizzle/ migrations:
     → DELETE from src/database/migrations/
   
   ELSE IF content is NEW (not in drizzle/):
     → CREATE new drizzle migration (0018+)
     → DELETE from src/database/migrations/
   
   ELSE IF file is test/seed data:
     → MOVE to src/database/seeds/
   ```

#### Phase 2: Remove Legacy Directories

1. **Delete `apps/api/src/database/migrations/`**
   ```bash
   rm -rf apps/api/src/database/migrations/
   ```

2. **Delete `apps/api/migrations/`**
   ```bash
   rm -rf apps/api/migrations/
   ```

3. **Update `.gitignore`** (if needed)
   ```gitignore
   # Keep only drizzle/ migrations
   # drizzle/  # Do NOT ignore - these are source controlled
   ```

#### Phase 3: Update Migration Script

Simplify `scripts/migrate.ts` to use **ONLY** Drizzle:

```typescript
/**
 * Database Migration Script
 * Single source of truth: ./drizzle/
 */
import { migrate } from 'drizzle-orm/postgres-js/migrator';

const MIGRATIONS_FOLDER = './drizzle';

async function runMigration() {
  const db = drizzle(sql, { schema });
  
  // Single migration source
  await migrate(db, { migrationsFolder: MIGRATIONS_FOLDER });
  
  // Seed feature flags (separate concern)
  await seedFeatureFlags(databaseUrl);
}
```

**Remove**:
- ❌ `runSqlMigrations()` function
- ❌ Dual-path logic
- ❌ `SQL_MIGRATIONS_FOLDER` constant

#### Phase 4: Documentation Updates

1. **Update README.md**
   ```markdown
   ## Database Migrations
   
   **Source of Truth**: `apps/api/drizzle/`
   
   ### Commands:
   - `pnpm db:generate` - Generate new migration from schema changes
   - `pnpm db:migrate` - Run pending migrations
   - `pnpm db:push` - Dev only: Push schema directly
   ```

2. **Create Migration Guide** (`docs/database/MIGRATIONS.md`)
   - How to create new migrations
   - Naming convention (0018, 0019, etc.)
   - Testing locally before committing
   - Production deployment process

---

## 🔍 Verification Steps

After consolidation, verify:

```bash
# 1. Only drizzle/ should exist
ls apps/api/ | grep migration
# Expected output: (nothing) or only drizzle/

# 2. Drizzle folder should contain 0001-0017 (or more)
ls apps/api/drizzle/*.sql | wc -l
# Expected: 17+ files

# 3. Migration script should reference only one path
grep -r "migrationsFolder" apps/api/scripts/
# Expected: Only './drizzle'

# 4. Test migration on fresh database
dropdb digilist_test && createdb digilist_test
DATABASE_URL="postgresql://localhost/digilist_test" pnpm db:migrate
# Expected: Success with 17 migrations applied
```

---

## 🎯 Benefits

1. **Single Source of Truth** - No confusion about which migrations to trust
2. **Simplified Scripts** - Remove dual-path complexity
3. **Better DX** - Clear workflow for developers
4. **Version Control** - Git history is clean and logical
5. **Production Safety** - No risk of running wrong migrations

---

## 📊 Migration Inventory (Current State)

### ✅ Drizzle Migrations (KEEP - Source of Truth)
```
0001_clean_schema.sql                     50,562 bytes  ✅ Primary schema
0002_domain_notifications.sql              2,193 bytes  ✅ Notifications
0003_domain_messaging.sql                  2,854 bytes  ✅ Conversations
0004_domain_feedback.sql                   3,234 bytes  ✅ Ratings/Likes
0005_domain_profiles.sql                   1,278 bytes  ✅ User profiles
0006_domain_support.sql                    1,579 bytes  ✅ Help/Support
0007_domain_rag.sql                        2,476 bytes  ✅ Knowledge base
0008_domain_seo.sql                        1,025 bytes  ✅ SEO metadata
0009_domain_geo.sql                        1,794 bytes  ✅ Geo areas
0010_rls_policies.sql                     15,610 bytes  ✅ Row-level security
0011_enterprise_economy.sql                9,954 bytes  ✅ Invoicing/Ledger
0012_platform_marketplace.sql              6,501 bytes  ✅ Modules/Catalog
0013_platform_branding.sql                 3,235 bytes  ✅ Themes/Tokens
0014_platform_i18n_governance.sql          4,005 bytes  ✅ Translation workflow
0015_domain_availability.sql               4,405 bytes  ✅ Opening hours
0016_domain_pricing_engine.sql             5,762 bytes  ✅ Price rules
0017_domain_payments_complete.sql          6,891 bytes  ✅ Payment intents
```

### ⚠️ SQL Migrations (REVIEW & REMOVE)
```
src/database/migrations/
├── 0008_add_rental_object_category.sql           # DUPLICATE of drizzle/0001?
├── 20260115_add_integration_credentials.sql      # Check if in drizzle/0001
├── 20260115_add_notification_preferences.sql     # DUPLICATE of drizzle/0002?
├── 20260115_add_notification_system.sql          # DUPLICATE of drizzle/0002?
├── 20260115_rename_listings_to_rental_objects.sql # Schema rename - CHECK
├── 20260116_001_saas_admin_schema.sql            # DUPLICATE of drizzle/0012+0013?
├── 20260116_002_add_session_management.sql       # NEW or in drizzle/0011?
└── seed_categories.sql                           # MOVE to seeds/
```

### 🗑️ Orphan Migrations (DELETE)
```
migrations/
└── 001_initial_schema.sql  # Only indexes/FKs - obsolete
```

---

## 🚀 Next Steps

**Immediate (Today)**:
1. ✅ Document this consolidation plan
2. 🔄 Audit `src/database/migrations/` against drizzle/
3. 🔄 Identify any net-new content not in drizzle/

**Short-term (This Week)**:
4. Create migrations 0018-0027 in drizzle/ (from roadmap)
5. Delete legacy migration directories
6. Simplify migrate.ts script
7. Update documentation

**Validation**:
8. Test on fresh database
9. Update CI/CD pipelines
10. Deploy to staging

---

## 📝 Notes

- **DO NOT** delete drizzle/ migrations - these are version controlled
- **Preserve** any custom SQL that isn't in drizzle/ yet
- **Move** seed data to `src/database/seeds/` (not migrations)
- **Test** thoroughly before deploying to production

---

**Status**: 📋 AWAITING USER DECISION  
**Recommendation**: Proceed with consolidation immediately to avoid confusion
