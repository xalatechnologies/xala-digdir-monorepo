# Seed Data Validation Report

**Date:** 2026-01-17
**Task:** Validate seed-data-bank alignment with database schema and API contracts
**Status:** ⚠️ Critical Issues Found - Action Required

---

## Executive Summary

Validated the seed data in `apps/api/db/seed-data-bank/rental-objects-comprehensive.json` against the Drizzle ORM schema and API contracts. **Found critical misalignments in category and time mode enum values** that will cause data integrity issues and frontend display problems.

**Key Findings:**
- ✅ **Field naming:** Correct (seed data uses snake_case matching SQL columns)
- ✅ **JSONB structure:** Valid (images, pricing, metadata well-formed)
- ✅ **Foreign keys:** Valid (tenant_id, organization_id references correct)
- ❌ **Category keys:** 30 of 70 objects (43%) use incorrect/legacy category codes
- ❌ **Time modes:** 10 of 70 objects (14%) use incorrect time mode code
- ⚠️ **Missing fields:** Some optional schema fields not present in seed data

**Impact:**
- Import will succeed but create data inconsistencies
- Frontend i18n translations will fail for incorrect categories
- Filtering and categorization features will break
- User-facing UI will show "[i18n] Missing translation" errors

**Recommendation:** Update seed data file before importing to production.

---

## Database Schema Alignment

### Schema Definition

**Source:** `apps/api/src/database/schema/index.ts` (lines 360-398)

```typescript
export const rentalObjects = domainSchema.table('rental_objects', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  organizationId: uuid('organization_id').nullable(),

  // Core fields
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull(),
  description: text('description'),

  // V3 Model: Category + Time Mode + Features
  categoryKey: varchar('category_key', { length: 50 }).notNull().default('LOKALER_OG_BANER'),
  timeMode: varchar('time_mode', { length: 20 }).notNull().default('PERIOD'),
  features: jsonb('features').notNull().default([]),
  ruleSetKey: varchar('rule_set_key', { length: 50 }),

  // Status & workflow
  status: varchar('status', { length: 50 }).notNull().default('draft'),
  requiresApproval: boolean('requires_approval').notNull().default(false),

  // Capacity & inventory
  capacity: integer('capacity'),
  inventoryTotal: integer('inventory_total'),

  // Content
  images: jsonb('images').default([]),
  pricing: jsonb('pricing').default({}),
  metadata: jsonb('metadata').default({}),

  // Timestamps
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
```

### Field Naming Validation ✅

**Result:** PASSED

The seed data correctly uses **snake_case** field names that match the actual PostgreSQL column names. While the Drizzle schema defines fields in camelCase (e.g., `tenantId`), Drizzle automatically converts these to snake_case in SQL (`tenant_id`).

**Seed Data Format:**
```json
{
  "id": "uuid",
  "tenant_id": "uuid",          ✅ Correct
  "organization_id": "uuid",    ✅ Correct
  "category_key": "...",        ✅ Correct
  "time_mode": "...",           ✅ Correct
  "requires_approval": false    ✅ Correct
}
```

**Import Script Alignment:**
The import script (`import-rental-objects.cjs`) correctly uses snake_case column names in SQL INSERT statements, matching both the seed data and database columns.

---

## Enum Value Validation

### Category Keys ❌ CRITICAL

**Source of Truth:** `apps/api/src/schemas/rental-object.schema.ts` (lines 96-101)

```typescript
export const DEFAULT_CATEGORIES = [
  'LOKALER_OG_BANER',           // Venues & Courts
  'UTSTYR_OG_INVENTAR',         // Equipment & Inventory
  'KJORETOY_OG_TRANSPORT',      // Vehicles & Transport
  'OPPLEVELSER_OG_ARRANGEMENT', // Experiences & Events
] as const;
```

**Seed Data Analysis:**

| Category Key | Count | Status | Should Be |
|-------------|-------|--------|-----------|
| `LOKALER_OG_BANER` | 40 | ✅ Valid | - |
| `ARRANGEMENT` | 10 | ❌ Invalid | `OPPLEVELSER_OG_ARRANGEMENT` |
| `MØTEROM` | 10 | ❌ Invalid | `LOKALER_OG_BANER` (or remove) |
| `UTSTYR` | 10 | ❌ Invalid | `UTSTYR_OG_INVENTAR` |
| **Total** | **70** | **30 invalid (43%)** | |

**i18n Translation Keys (for reference):**

From `packages/i18n/src/locales/nb.ts`:
```typescript
'sdk.rentalObject.category.LOKALER_OG_BANER': 'Lokaler og baner',
'sdk.rentalObject.category.UTSTYR_OG_INVENTAR': 'Utstyr og inventar',
'sdk.rentalObject.category.KJORETOY_OG_TRANSPORT': 'Kjøretøy og transport',
'sdk.rentalObject.category.OPPLEVELSER_OG_ARRANGEMENT': 'Opplevelser og arrangement',
```

**Impact:**
- Objects with `ARRANGEMENT`, `MØTEROM`, or `UTSTYR` will show `[i18n] Missing translation: sdk.rentalObject.category.ARRANGEMENT`
- Category filters in UI will not work correctly
- API queries filtering by valid categories will exclude these 30 objects

### Time Modes ❌ CRITICAL

**Source of Truth:** `apps/api/src/schemas/rental-object.schema.ts` (line 103)

```typescript
export const DEFAULT_TIME_MODES = ['PERIOD', 'SLOT', 'ALL_DAY'] as const;
```

**Seed Data Analysis:**

| Time Mode | Count | Status | Should Be |
|-----------|-------|--------|-----------|
| `PERIOD` | 60 | ✅ Valid | - |
| `ITEM` | 10 | ❌ Invalid | `ALL_DAY` |
| **Total** | **70** | **10 invalid (14%)** | |

**i18n Translation Keys (for reference):**

From `packages/i18n/src/locales/nb.ts`:
```typescript
'sdk.timeMode.PERIOD': 'Periode',
'sdk.timeMode.SLOT': 'Tidsluke',
'sdk.timeMode.ALL_DAY': 'Hele dagen',
```

**Impact:**
- Objects with `ITEM` time mode will show `[i18n] Missing translation: sdk.timeMode.ITEM`
- Calendar UI rendering will fail or use incorrect variant
- Booking flow will break for these 10 objects

### Status Values ✅

**Valid Statuses:** `draft`, `published`, `archived`

All seed data objects use `"status": "published"` ✅

### Features Array ✅

**Valid Features:** `INVENTORY`, `SHARED_CAPACITY`, `PACKAGES`

Seed data uses `["SHARED_CAPACITY"]` which is valid ✅

---

## JSONB Field Validation

### Images Array ✅ VALID

**Schema Expectation:** Array of image objects with url, alt, thumbnail, is_primary, sort_order

**Seed Data Sample:**
```json
"images": [
  {
    "url": "https://images.unsplash.com/photo-fCk1A3hPJGo?w=1200&q=80",
    "alt": "Fotballbane hovedbilde",
    "thumbnail": "https://images.unsplash.com/photo-fCk1A3hPJGo?w=400&q=80",
    "is_primary": true,
    "sort_order": 1
  }
]
```

**Validation:** ✅ Structure is correct and well-formed

### Pricing Object ✅ VALID

**Schema Expectation:** Object with base_price, currency, unit, optional discounts

**Seed Data Sample:**
```json
"pricing": {
  "base_price": 750,
  "currency": "NOK",
  "unit": "hour",
  "vat_rate": 25,
  "discounts": [
    {
      "type": "nonprofit",
      "rate": 20,
      "description": "20% rabatt for ideelle organisasjoner"
    }
  ]
}
```

**Validation:** ✅ Structure is correct and comprehensive

**Note:** Schema uses `basePrice` (camelCase) but seed data uses `base_price` (snake_case). This is acceptable since pricing is stored as JSONB and the structure is internal. However, for consistency with API contracts, consider using camelCase in JSONB fields.

### Metadata Object ✅ VALID

**Schema Expectation:** Flexible JSONB object with category-specific fields

**Seed Data Sample:**
```json
"metadata": {
  "address": {
    "street": "Fotballbaneveien 2",
    "postal_code": "3720",
    "city": "Skien",
    "country": "Norway",
    "coordinates": {
      "latitude": 59.2099,
      "longitude": 9.6089
    }
  },
  "amenities": ["WiFi", "Parkering", "Garderober"],
  "opening_hours": {
    "monday": [{"from": "07:00", "to": "23:00"}]
  },
  "rules": ["Avbestilling må gjøres minst 24 timer i forveien"],
  "contact": {
    "email": "fotballbane@skien.kommune.no",
    "phone": "+47 35 58 50 00"
  }
}
```

**Validation:** ✅ Structure is rich, comprehensive, and well-organized

**Recommendation:** This metadata structure is excellent and should be documented as the standard for LOKALER_OG_BANER category.

---

## Foreign Key Validation

### Tenant References ✅

**All 70 rental objects reference:** `f47ac10b-58cc-4372-a567-0e02b2c3d479` (Skien Kommune)

**Validation:**
- Tenant exists in seed data ✅
- Valid UUID format ✅
- Will reference `platform.tenants` table ✅

### Organization References ✅

**All 70 rental objects reference:** `11111111-1111-1111-1111-111111111111` (Skien Kommune org)

**Validation:**
- Organization exists in seed data ✅
- Valid UUID format ✅
- Will reference `platform.organizations` table ✅
- tenant_id matches rental object's tenant ✅

### User References ✅

**Seed data includes 3 users:**
- Admin: `00000000-0000-0000-0000-000000000001`
- Case Handler: `00000000-0000-0000-0000-000000000002`
- Member: `00000000-0000-0000-0000-000000000003`

**Validation:**
- All users have correct tenant_id ✅
- All users have correct organization_id ✅
- Demo tokens provided for testing ✅

---

## Missing Optional Fields

These fields are in the schema but not present in seed data:

1. **`rule_set_key`** - Optional reference to reusable booking rules
   - Impact: None (optional field)
   - Recommendation: Consider adding if standard rule sets exist

2. **`inventory_total`** - Total inventory count for equipment categories
   - Impact: Missing for UTSTYR category objects
   - Recommendation: Add for UTSTYR_OG_INVENTAR objects (should match quantity in metadata)

3. **`created_at` / `updated_at`** - Timestamps
   - Impact: None (auto-generated by database)
   - Note: Import script does not set these, relies on DEFAULT NOW()

---

## Import Script Validation

**File:** `apps/api/db/seed-data-bank/import-rental-objects.cjs`

### SQL Alignment ✅

The import script correctly:
- Uses named schema prefixes (`platform.`, `domain.`)
- Uses snake_case column names matching database
- Serializes JSONB fields with `JSON.stringify()`
- Handles conflicts with `ON CONFLICT DO UPDATE`
- Sets `updated_at = NOW()` on updates

### Potential Issues ⚠️

1. **No category validation** - Script will insert invalid category codes without error
2. **No time mode validation** - Script will insert invalid time modes without error
3. **No transaction wrapper** - If import fails mid-way, database will have partial data
4. **No rollback mechanism** - Cannot easily undo a bad import

**Recommendation:** Add validation step before insertion:

```javascript
// Validate category keys
const validCategories = ['LOKALER_OG_BANER', 'UTSTYR_OG_INVENTAR', 'KJORETOY_OG_TRANSPORT', 'OPPLEVELSER_OG_ARRANGEMENT'];
const validTimeModes = ['PERIOD', 'SLOT', 'ALL_DAY'];

for (const obj of seedData.rental_objects) {
  if (!validCategories.includes(obj.category_key)) {
    throw new Error(`Invalid category_key: ${obj.category_key} for object ${obj.name}`);
  }
  if (!validTimeModes.includes(obj.time_mode)) {
    throw new Error(`Invalid time_mode: ${obj.time_mode} for object ${obj.name}`);
  }
}
```

---

## Category System Conflicts RESOLVED

### Historical Context

During validation, discovered **3 different category systems** in the codebase:

1. **Legacy System** (`apps/api/src/modules/rental-objects/category-metadata.ts`):
   - LOCALE, ARRANGEMENT, UTSTYR
   - Status: Deprecated, should be removed

2. **Current System** (`apps/api/src/schemas/rental-object.schema.ts`):
   - LOKALER_OG_BANER, UTSTYR_OG_INVENTAR, KJORETOY_OG_TRANSPORT, OPPLEVELSER_OG_ARRANGEMENT
   - Status: ✅ Source of Truth

3. **Seed Data System** (mixed legacy + current):
   - Contains both old and new category codes
   - Status: Needs update to match Current System

### Resolution

**Official Category Codes (Canonical):**

| Code | Norwegian | English | Time Mode Default |
|------|-----------|---------|-------------------|
| `LOKALER_OG_BANER` | Lokaler og baner | Spaces and venues | PERIOD |
| `UTSTYR_OG_INVENTAR` | Utstyr og inventar | Equipment and inventory | ALL_DAY |
| `KJORETOY_OG_TRANSPORT` | Kjøretøy og transport | Vehicles and transport | ALL_DAY |
| `OPPLEVELSER_OG_ARRANGEMENT` | Opplevelser og arrangement | Experiences and events | SLOT |

**Action Required:**
- Update seed data to use only these 4 category codes
- Remove or update `category-metadata.ts` to align with canonical codes
- Ensure all frontend code uses these exact codes

---

## Recommendations

### Immediate Actions (Required)

1. **Fix Category Keys in Seed Data**
   ```
   ARRANGEMENT → OPPLEVELSER_OG_ARRANGEMENT (10 objects)
   MØTEROM → LOKALER_OG_BANER (10 objects, if meeting rooms = venues)
   UTSTYR → UTSTYR_OG_INVENTAR (10 objects)
   ```

2. **Fix Time Modes in Seed Data**
   ```
   ITEM → ALL_DAY (10 objects)
   ```

3. **Add Validation to Import Script**
   - Validate category_key against DEFAULT_CATEGORIES
   - Validate time_mode against DEFAULT_TIME_MODES
   - Wrap import in transaction for atomicity

4. **Add Missing Field: inventoryTotal**
   - For objects with category UTSTYR_OG_INVENTAR
   - Should match metadata.quantity if present

### Short-Term Improvements (Recommended)

1. **Standardize JSONB Field Naming**
   - Use camelCase in JSONB objects (e.g., `basePrice` not `base_price`)
   - Aligns with API contract conventions
   - Update import script to transform if needed

2. **Add Seed Data Validation Script**
   - Create `scripts/validate-seed-data.js`
   - Run validation before every import
   - Integrate into CI/CD pipeline

3. **Document Category-Specific Metadata Schemas**
   - LOKALER_OG_BANER: address, amenities, opening_hours
   - UTSTYR_OG_INVENTAR: quantity, condition, deposit
   - KJORETOY_OG_TRANSPORT: license, fuel_type, mileage
   - OPPLEVELSER_OG_ARRANGEMENT: duration, max_guests, packages

4. **Add More Categories (Optional)**
   - Consider if MØTEROM should be its own category
   - Or clarify that meeting rooms are a subcategory of LOKALER_OG_BANER

### Long-Term Enhancements (Future)

1. **Seed Data Versioning**
   - Track seed data schema version in meta.schema_version
   - Create migration scripts for version upgrades
   - Document breaking changes between versions

2. **Automated Seed Generation**
   - Build tool to generate seed data from production (anonymized)
   - Ensure realistic test data
   - Keep seed data fresh and comprehensive

3. **Category & Time Mode as Database Tables**
   - Schema already defines `rental_object_categories` and `booking_time_modes` tables
   - Seed these tables with canonical definitions
   - Add foreign key constraints to enforce referential integrity
   - Make categories dynamically configurable per tenant

---

## Required Seed Data Changes

### File to Update
`apps/api/db/seed-data-bank/rental-objects-comprehensive.json`

### Search & Replace Operations

1. **Fix ARRANGEMENT → OPPLEVELSER_OG_ARRANGEMENT**
   ```bash
   sed -i '' 's/"category_key": "ARRANGEMENT"/"category_key": "OPPLEVELSER_OG_ARRANGEMENT"/g' rental-objects-comprehensive.json
   ```

2. **Fix MØTEROM → LOKALER_OG_BANER**
   ```bash
   sed -i '' 's/"category_key": "MØTEROM"/"category_key": "LOKALER_OG_BANER"/g' rental-objects-comprehensive.json
   ```

   Or if meeting rooms should be their own category, add `MØTEROM` to the canonical list.

3. **Fix UTSTYR → UTSTYR_OG_INVENTAR**
   ```bash
   sed -i '' 's/"category_key": "UTSTYR"/"category_key": "UTSTYR_OG_INVENTAR"/g' rental-objects-comprehensive.json
   ```

4. **Fix ITEM → ALL_DAY**
   ```bash
   sed -i '' 's/"time_mode": "ITEM"/"time_mode": "ALL_DAY"/g' rental-objects-comprehensive.json
   ```

5. **Update metadata version**
   ```json
   {
     "meta": {
       "version": "1.0.2",
       "created": "2026-01-17T[timestamp]",
       "schema_version": "v3",
       "description": "Comprehensive seed data - CATEGORY KEYS FIXED",
       "total_objects": 70
     }
   }
   ```

---

## Validation Checklist

Before importing seed data to production:

- [ ] All category_key values match DEFAULT_CATEGORIES
- [ ] All time_mode values match DEFAULT_TIME_MODES
- [ ] All status values are valid (draft/published/archived)
- [ ] All features arrays contain valid feature codes
- [ ] All tenant_id references exist in tenants table
- [ ] All organization_id references exist in organizations table
- [ ] Images array structure is valid for all objects
- [ ] Pricing object structure is valid for all objects
- [ ] Metadata structure matches category requirements
- [ ] Import script includes validation logic
- [ ] Import script uses transaction wrapping
- [ ] Backup of current database exists
- [ ] Rollback plan is documented

---

## Test Plan

### Unit Tests

Create `apps/api/src/__tests__/seed-data-validation.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import seedData from '../../db/seed-data-bank/rental-objects-comprehensive.json';
import { DEFAULT_CATEGORIES, DEFAULT_TIME_MODES } from '../schemas/rental-object.schema';

describe('Seed Data Validation', () => {
  it('should have valid category keys', () => {
    const invalidObjects = seedData.rental_objects.filter(
      obj => !DEFAULT_CATEGORIES.includes(obj.category_key as any)
    );
    expect(invalidObjects).toHaveLength(0);
  });

  it('should have valid time modes', () => {
    const invalidObjects = seedData.rental_objects.filter(
      obj => !DEFAULT_TIME_MODES.includes(obj.time_mode as any)
    );
    expect(invalidObjects).toHaveLength(0);
  });

  it('should have valid tenant references', () => {
    const tenantIds = seedData.tenants.map(t => t.id);
    const invalidObjects = seedData.rental_objects.filter(
      obj => !tenantIds.includes(obj.tenant_id)
    );
    expect(invalidObjects).toHaveLength(0);
  });
});
```

### Integration Test

Test actual import to staging database:

```bash
# 1. Backup staging database
pg_dump -d digilist_staging > backup_before_seed.sql

# 2. Run import
DATABASE_URL="postgresql://..." node import-rental-objects.cjs

# 3. Verify data
psql -d digilist_staging -c "SELECT category_key, COUNT(*) FROM domain.rental_objects GROUP BY category_key;"

# Expected output:
#        category_key         | count
# ----------------------------+-------
#  LOKALER_OG_BANER           |    50
#  UTSTYR_OG_INVENTAR         |    10
#  OPPLEVELSER_OG_ARRANGEMENT |    10
# (3 rows)

# 4. Test frontend display
# Navigate to https://web-test.digilist.no
# Verify all objects show correct category labels
# Verify no "[i18n] Missing translation" errors
```

---

## Conclusion

The seed data is **structurally sound** with excellent metadata organization, but contains **critical enum value mismatches** that will cause immediate issues if imported without fixes.

**Priority:** 🔴 HIGH - Fix before any production import

**Estimated Fix Time:** 15 minutes (search & replace + validation)

**Risk if Not Fixed:**
- 43% of rental objects will have broken categories
- 14% of rental objects will have broken time modes
- Frontend UI will show translation errors
- Filtering and search features will malfunction
- Poor user experience on launch

**Next Steps:**
1. Apply sed commands to fix category and time mode values
2. Run validation tests
3. Test import on staging database
4. Verify frontend display
5. Document changes in git commit
6. Import to production

---

**Report Generated:** 2026-01-17
**Validated By:** Claude Code Agent
**Approved By:** [Pending User Review]
**Status:** Draft - Awaiting Approval for Seed Data Fix
