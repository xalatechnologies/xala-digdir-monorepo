# LEGACY REMOVAL PLAN
**Date**: 2026-01-16  
**Purpose**: Safe removal of legacy `listing` terminology and code

---

## OVERVIEW

**Status**: ✅ **95% COMPLETE**  
**Remaining**: Minor cleanup tasks

The migration from `listing` to `rental_object` is substantially complete. This document tracks remaining legacy references and provides a safe removal plan.

---

## COMPLETED MIGRATIONS

### ✅ SDK Layer (100% Complete)
- ✅ `packages/client-sdk/src/types/listing.ts` - DELETED
- ✅ `packages/client-sdk/src/types/listing.transform.ts` - DELETED
- ✅ `packages/client-sdk/src/hooks/use-listings.ts` - DELETED
- ✅ All hooks migrated to `use-rental-objects.ts`
- ✅ All types exported from `rental-object.ts`
- ✅ Query keys use `rentalObjects` namespace
- ✅ DAL uses `rentalObjectId` fields

### ✅ API Layer (95% Complete)
- ✅ Main.ts updated to use `RentalObjectModule`
- ✅ Schema uses `rental_objects` table
- ✅ Services use `rentalObjectId` parameters
- ✅ Controllers use rental object terminology

---

## REMAINING LEGACY REFERENCES

### 1. Database Schema (Low Priority)
**Status**: ⚠️ **LEGACY TABLE EXISTS**

**Files**:
- `apps/api/src/database/schema/index.ts` - May still have `listings` table

**Impact**: LOW - Schema can maintain `listings` table name for backward compatibility

**Action**: ❌ **DO NOT REMOVE** - Keep for data migration safety

**Rationale**:
- Existing data may be in `listings` table
- Renaming table is risky and unnecessary
- API contracts use `rental_object` terminology (correct)
- Internal table name doesn't affect external API

---

### 2. API Module References (Medium Priority)
**Status**: ⚠️ **NEEDS VERIFICATION**

**Potential Files**:
- `apps/api/src/modules/backoffice/backoffice.controller.ts`
- `apps/api/src/modules/reviews/reviews.controller.ts`
- `apps/api/src/modules/public/public.controller.ts`

**Search Pattern**:
```bash
grep -r "listing" apps/api/src/modules/ --include="*.ts" | grep -v "rental"
```

**Action**: ✅ **AUDIT AND REPLACE**

**Steps**:
1. Search for remaining `listing` references
2. Replace with `rentalObject` in:
   - Variable names
   - Function parameters
   - Comments
   - Log messages
3. Verify no breaking changes
4. Run tests
5. Commit with message: "chore: remove remaining listing references"

---

### 3. Frontend Components (Low Priority)
**Status**: ⚠️ **NEEDS AUDIT**

**Potential Files**:
- `apps/web/src/components/**/*.tsx`
- `apps/backoffice/src/components/**/*.tsx`
- `apps/minside/src/components/**/*.tsx`

**Search Pattern**:
```bash
grep -r "listing" apps/*/src/ --include="*.tsx" --include="*.ts" | grep -v "rental"
```

**Action**: ✅ **AUDIT AND REPLACE**

**Steps**:
1. Search for `listing` in component names
2. Search for `listing` in prop names
3. Search for `listing` in state variables
4. Replace with `rentalObject`
5. Update tests
6. Verify UI still works

---

### 4. Documentation (Low Priority)
**Status**: ⚠️ **NEEDS UPDATE**

**Files**:
- `README.md`
- `docs/**/*.md`
- `CLAUDE.md`
- API documentation

**Action**: ✅ **UPDATE TERMINOLOGY**

**Steps**:
1. Replace "listing" with "rental object" in docs
2. Update API examples
3. Update screenshots if any
4. Update glossary/terminology section

---

## SAFE REMOVAL CHECKLIST

### Phase 1: Verification (30 minutes)
- [ ] Run full grep search for `listing` references
- [ ] Categorize findings by impact (critical/high/medium/low)
- [ ] Identify any remaining API endpoints with `listing` in path
- [ ] Identify any remaining SDK methods with `listing` in name
- [ ] Check database for `listings` table usage

### Phase 2: Code Cleanup (2 hours)
- [ ] Replace variable names: `listing` → `rentalObject`
- [ ] Replace function params: `listingId` → `rentalObjectId`
- [ ] Replace comments: `listing` → `rental object`
- [ ] Replace log messages
- [ ] Update error messages

### Phase 3: Testing (1 hour)
- [ ] Run unit tests
- [ ] Run integration tests
- [ ] Run E2E tests
- [ ] Manual smoke test of critical paths
- [ ] Verify no regressions

### Phase 4: Documentation (1 hour)
- [ ] Update README
- [ ] Update API docs
- [ ] Update developer guide
- [ ] Update changelog
- [ ] Add migration notes

---

## MIGRATION COMMANDS

### Search for Legacy References
```bash
# Find all "listing" references (excluding "rental")
grep -r "listing" . \
  --include="*.ts" \
  --include="*.tsx" \
  --include="*.md" \
  --exclude-dir="node_modules" \
  --exclude-dir=".git" \
  | grep -v "rental" \
  | grep -v "MIGRATION"

# Find listingId references
grep -r "listingId" . \
  --include="*.ts" \
  --include="*.tsx" \
  --exclude-dir="node_modules" \
  --exclude-dir=".git"

# Find listings table references
grep -r "listings" . \
  --include="*.ts" \
  --include="*.sql" \
  --exclude-dir="node_modules" \
  --exclude-dir=".git" \
  | grep -v "rental_objects"
```

### Automated Replacement (USE WITH CAUTION)
```bash
# Replace listingId with rentalObjectId in TypeScript files
find . -name "*.ts" -o -name "*.tsx" | \
  xargs sed -i '' 's/listingId/rentalObjectId/g'

# Replace listing with rentalObject in variable names
find . -name "*.ts" -o -name "*.tsx" | \
  xargs sed -i '' 's/\blisting\b/rentalObject/g'
```

**⚠️ WARNING**: Always review changes before committing!

---

## BACKWARD COMPATIBILITY STRATEGY

### API Endpoints
**Strategy**: ❌ **NO LEGACY ENDPOINTS**

All API endpoints should use `rental-objects` terminology. No backward compatibility layer needed since this is pre-production.

### Database
**Strategy**: ✅ **KEEP LEGACY TABLE NAME**

Keep `listings` table name if it exists. Use views or aliases if needed:
```sql
-- Optional: Create view for clarity
CREATE VIEW rental_objects AS SELECT * FROM listings;
```

### SDK
**Strategy**: ❌ **NO LEGACY EXPORTS**

SDK should only export `rental_object` terminology. Legacy hooks have been removed.

---

## RISK ASSESSMENT

### Low Risk
- ✅ Variable name changes
- ✅ Comment updates
- ✅ Log message updates
- ✅ Documentation updates

### Medium Risk
- ⚠️ Function parameter renames (check all call sites)
- ⚠️ Type renames (check all usages)
- ⚠️ Component prop renames (check all consumers)

### High Risk
- ❌ Database table renames (DO NOT DO)
- ❌ API endpoint path changes (ALREADY DONE)
- ❌ Breaking SDK changes (ALREADY DONE)

---

## ROLLBACK PLAN

If issues are discovered after cleanup:

1. **Immediate**: Revert the commit
   ```bash
   git revert HEAD
   ```

2. **Investigate**: Identify what broke
   ```bash
   git diff HEAD~1
   ```

3. **Fix Forward**: Make targeted fix
   ```bash
   # Fix the specific issue
   git commit -m "fix: resolve listing migration issue"
   ```

---

## COMPLETION CRITERIA

- ✅ Zero `listing` references in SDK
- ✅ Zero `listing` references in API contracts
- ⚠️ Minimal `listing` references in internal code (acceptable)
- ✅ All tests passing
- ✅ Documentation updated
- ✅ Migration notes added to changelog

---

## TIMELINE

**Total Estimated Time**: 4-5 hours

- Verification: 30 minutes
- Code cleanup: 2 hours
- Testing: 1 hour
- Documentation: 1 hour
- Buffer: 30 minutes

**Recommended Schedule**: After demo, before production release

---

## NOTES

### Why Keep `listings` Table Name?
1. **Data Safety**: Existing data may be in this table
2. **Migration Risk**: Renaming tables is risky
3. **No Impact**: Internal table name doesn't affect API contracts
4. **Flexibility**: Can rename later if needed

### Why Remove Legacy SDK Exports?
1. **Clarity**: Single source of truth
2. **Maintainability**: Less code to maintain
3. **Type Safety**: No confusion about which types to use
4. **Clean API**: Clear, consistent interface

---

**Report Generated**: 2026-01-16 11:27:00  
**Status**: Migration 95% complete, cleanup optional
