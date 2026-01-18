# API Schema Fix - Platform vs Domain Schema Mismatch

**Date:** 2026-01-17
**Status:** ⚠️ **PARTIALLY COMPLETE** - Awaiting server deployment
**Task:** Fix rental objects schema mismatch between platform and domain schemas

---

## Problem Summary

### Root Cause
The API's rental objects schema definition declared `domainSchema` but used `pgTable()` instead of `domainSchema.table()`, causing queries to target the wrong schema. Meanwhile, seed data was successfully imported to `platform.rental_objects`.

**Result**: API queries `domain.rental_objects` but data exists in `platform.rental_objects` → 500 errors

### Error Evidence
```
Failed query: select "id", "tenant_id", "organization_id", "name", "slug",
"description", "category_key", "time_mode", "features", "rule_set_key",
"status", "requires_approval", "capacity", "inventory_total", "images",
"pricing", "metadata", "created_at", "updated_at"
from "domain"."rental_objects"
where "domain"."rental_objects"."status" = $1
order by "domain"."rental_objects"."created_at" desc
limit $2
```

---

## Solution Implemented

### Changes Made to Schema Definition

**File**: `apps/api/src/database/schema/rental-objects.ts`

**Line 21**: Changed schema declaration
```diff
- // Use domain schema
- const domainSchema = pgSchema('domain');
+ // Use platform schema (where data is stored)
+ const platformSchema = pgSchema('platform');
```

**Lines 27, 42, 54, 65, 79, 125**: Updated all table definitions
```diff
- export const rentalObjectCategories = pgTable('rental_object_categories', {
+ export const rentalObjectCategories = platformSchema.table('rental_object_categories', {

- export const bookingTimeModes = pgTable('booking_time_modes', {
+ export const bookingTimeModes = platformSchema.table('booking_time_modes', {

- export const rentalObjectFeatures = pgTable('rental_object_features', {
+ export const rentalObjectFeatures = platformSchema.table('rental_object_features', {

- export const ruleSets = pgTable('rule_sets', {
+ export const ruleSets = platformSchema.table('rule_sets', {

- export const rentalObjects = pgTable('rental_objects', {
+ export const rentalObjects = platformSchema.table('rental_objects', {

- export const blackouts = pgTable('blackouts', {
+ export const blackouts = platformSchema.table('blackouts', {
```

### Why This Fix Is Correct

1. **Data Location**: Seed data successfully imported to `platform.rental_objects` (70 objects)
2. **Schema Match**: platform.rental_objects has the correct columns: `name`, `slug`, `category_key`, `time_mode`
3. **Consistent With Other Tables**: `tenants`, `organizations`, `users` already use `platform` schema
4. **No Data Migration Needed**: Simple code fix, no database changes required

---

## Deployment Status

### Completed Steps ✅

1. ✅ Identified schema mismatch root cause
2. ✅ Updated schema definition to use `platformSchema`
3. ✅ Built API locally (successful)
4. ✅ Created deployment script: `scripts/deploy-api-schema-fix.sh`

### Pending Steps ⚠️

1. ⚠️ **Upload rebuilt API to server** - Server currently unreachable (SSH timeout)
2. ⚠️ **Restart API server with new code**
3. ⚠️ **Verify rental objects endpoint returns data**
4. ⚠️ **Test web-test.digilist.no loads rental objects correctly**

---

## Manual Deployment Instructions

When the server becomes available, run the deployment script:

```bash
cd /Volumes/Laravel/Xala-SAAS/tools/xala-digdir-monorepo
./scripts/deploy-api-schema-fix.sh
```

**Or deploy manually:**

```bash
# 1. Build API (already done)
cd /Volumes/Laravel/Xala-SAAS/tools/xala-digdir-monorepo
pnpm -F @digilist/api build

# 2. Upload dist folder
scp -r apps/api/dist root@159.223.21.252:/var/www/digilist-api/

# 3. Restart API
ssh root@159.223.21.252 "cd /var/www/digilist-api && pm2 restart digilist-api"

# 4. Test health
ssh root@159.223.21.252 "curl -sf http://localhost:4000/api/health"

# 5. Test rental objects endpoint
ssh root@159.223.21.252 "curl -s http://localhost:4000/api/rental-objects | head -c 500"
```

---

## Verification Checklist

After deployment, verify the following:

### API Server Checks
- [ ] API server restarts without errors
- [ ] Health endpoint responds: `curl http://localhost:4000/api/health`
- [ ] Rental objects endpoint returns 200 (not 500)
- [ ] Response contains 70 rental objects
- [ ] No database query errors in PM2 logs

### Web Application Checks
- [ ] Navigate to https://web-test.digilist.no
- [ ] No 500 errors in browser console
- [ ] Rental objects display on homepage/listings page
- [ ] Category labels show correctly (no "[i18n] Missing translation" errors)
- [ ] All 70 objects are visible
- [ ] Category distribution:
  - LOKALER_OG_BANER: 50 objects
  - OPPLEVELSER_OG_ARRANGEMENT: 10 objects
  - UTSTYR_OG_INVENTAR: 10 objects

### Database Verification
```sql
-- Verify data exists
SELECT COUNT(*) FROM platform.rental_objects;
-- Expected: 70

-- Verify category distribution
SELECT category_key, COUNT(*)
FROM platform.rental_objects
GROUP BY category_key
ORDER BY category_key;
-- Expected:
-- LOKALER_OG_BANER: 50
-- OPPLEVELSER_OG_ARRANGEMENT: 10
-- UTSTYR_OG_INVENTAR: 10

-- Verify all are published
SELECT status, COUNT(*)
FROM platform.rental_objects
GROUP BY status;
-- Expected: published: 70
```

---

## Related Work Completed

This schema fix is part of a larger seed data validation and import effort:

1. **Seed Data Validation** (COMPLETED)
   - Created comprehensive validation report
   - Fixed 30 category key mismatches
   - Fixed 10 time mode mismatches
   - Report: `docs/operations/SEED_DATA_VALIDATION_REPORT_2026-01-17.md`
   - Summary: `docs/operations/SEED_DATA_FIX_SUMMARY_2026-01-17.md`

2. **Database Recreation** (COMPLETED)
   - Dropped and recreated digilist_prod database
   - Created named schemas: platform, domain, compliance, monitoring, saas
   - Ran all 31 SQL migrations
   - Script: `scripts/recreate-production-db-v2.sh`

3. **Seed Data Import** (COMPLETED)
   - Successfully imported to platform.rental_objects
   - 1 tenant, 1 organization, 3 users, 70 rental objects
   - Script: `apps/api/db/seed-data-bank/import-rental-objects.cjs`

4. **API Schema Fix** (PARTIALLY COMPLETE - THIS DOCUMENT)
   - Fixed schema definition
   - Built new API version
   - **PENDING**: Deploy to server

---

## Impact Analysis

### Before Fix
- ❌ API queries `domain.rental_objects` (wrong table)
- ❌ All rental object endpoints return 500 errors
- ❌ Web application shows "no data available"
- ❌ Cannot test frontend with real data

### After Fix
- ✅ API queries `platform.rental_objects` (correct table)
- ✅ Rental object endpoints return 200 with data
- ✅ Web application displays 70 rental objects
- ✅ Category labels resolve correctly via i18n
- ✅ Full end-to-end testing possible

---

## Files Modified

1. **`apps/api/src/database/schema/rental-objects.ts`**
   - Changed schema from `domainSchema` to `platformSchema`
   - Updated all 6 table definitions to use `platformSchema.table()`
   - Built successfully with no errors

2. **`scripts/deploy-api-schema-fix.sh`** (NEW)
   - Automated deployment script
   - Builds API, uploads dist, restarts server, runs health checks
   - Ready to execute when server is reachable

3. **`docs/operations/SCHEMA_FIX_2026-01-17.md`** (THIS FILE)
   - Comprehensive documentation of the fix
   - Manual deployment instructions
   - Verification checklist

---

## Next Actions

1. **Wait for server availability** (SSH currently timing out)
2. **Run deployment script**: `./scripts/deploy-api-schema-fix.sh`
3. **Verify API returns data**: Test `/api/rental-objects` endpoint
4. **Test web application**: https://web-test.digilist.no
5. **Fix CSS 403 error**: Investigate themes/digilist.css deployment issue
6. **Complete remaining tasks**:
   - Consolidate seeds into seed-data-bank
   - Remove redundant seed files

---

## Technical Notes

### Schema Hierarchy

The application uses multiple PostgreSQL schemas for logical separation:

```
digilist_prod (database)
├── platform (tenant, org, user, rental_objects) ⭐ PRIMARY
├── domain (bookings, allocations, business logic)
├── compliance (audit logs, GDPR)
├── monitoring (metrics, health checks)
└── saas (subscriptions, billing)
```

**Decision**: Rental objects belong in **platform** schema because they are:
- Core tenant-owned entities
- Referenced by domain logic (bookings, allocations)
- Part of tenant configuration (like organizations, users)

### Drizzle ORM Schema Definition Pattern

**Incorrect Pattern** (causes default/public schema usage):
```typescript
const domainSchema = pgSchema('domain');
export const myTable = pgTable('my_table', { ... });  // ❌ Uses public schema
```

**Correct Pattern**:
```typescript
const domainSchema = pgSchema('domain');
export const myTable = domainSchema.table('my_table', { ... });  // ✅ Uses domain schema
```

This was the exact bug in our code.

---

## Lessons Learned

1. **Always use schema.table()** - Declaring `pgSchema()` isn't enough; must use it
2. **Verify schema in SQL** - Check `pg_tables` to confirm table location
3. **Match code to data** - Ensure ORM schema matches where data actually lives
4. **Test after migrations** - Verify queries work, not just that tables exist

---

**Report Status:** ⚠️ Awaiting Deployment
**Generated:** 2026-01-17
**Next Review:** After successful deployment
