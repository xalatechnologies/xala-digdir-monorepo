# Testing Guide - @digilist/database-schema

**Test Coverage:** 26 passing tests (11 integration tests skipped without DATABASE_URL)  
**Last Run:** 2026-01-18  
**Status:** ✅ All Tests Passing

---

## 🧪 **Test Suites**

### **1. Migration Validation Tests** (7 tests)
**File:** `tests/migration.test.ts`

Validates that auto-generated migrations are correct and complete.

**Tests:**
- ✅ At least one migration file exists
- ✅ Valid SQL syntax in migrations
- ✅ All 7 entitlement tables created
- ✅ Proper indexes defined
- ✅ Unique constraints in place
- ✅ Correct column types (uuid, varchar, jsonb, etc.)
- ✅ Default values set correctly

**Run:**
```bash
pnpm test:migration
```

### **2. Seed Data Validation Tests** (19 tests)
**File:** `tests/seeds.test.ts`

Validates structure and consistency of seed data files.

**Route Policies Tests (5):**
- ✅ Valid JSON structure
- ✅ Required fields present
- ✅ Unique route keys
- ✅ Valid app names
- ✅ Consistent route key naming

**Navigation Policies Tests (5):**
- ✅ Valid JSON structure
- ✅ Required fields present
- ✅ Unique nav item keys per app
- ✅ Valid parent references
- ✅ Sequential ordering

**Plan Entitlements Tests (7):**
- ✅ Valid JSON structure
- ✅ Required fields present
- ✅ Valid plan names (Free, Pro, Enterprise)
- ✅ Valid key types (module, feature, integration)
- ✅ Unique combinations per plan
- ✅ All plans represented
- ✅ Enterprise has most entitlements

**Cross-File Consistency Tests (2):**
- ✅ Matching route keys between routes and nav
- ✅ Consistent app names across files

**Run:**
```bash
pnpm test:seeds
```

### **3. Integration Tests** (11 tests - requires DATABASE_URL)
**File:** `tests/integration.test.ts`

Tests actual database operations (skipped if no DATABASE_URL).

**Schema Existence Tests:**
- ✅ saas schema exists
- ✅ All 7 entitlement tables exist

**Table Structure Tests:**
- ✅ route_policies has correct columns
- ✅ nav_policies has correct columns
- ✅ plan_entitlements has correct columns

**Indexes Tests:**
- ✅ route_policies has proper indexes
- ✅ nav_policies has proper indexes

**Constraints Tests:**
- ✅ route_key unique constraint
- ✅ nav_item_key unique constraint per app

**CRUD Operations Tests:**
- ✅ Insert and query route policy
- ✅ Idempotent inserts work correctly

**Run:**
```bash
export DATABASE_URL="postgresql://user:pass@host:port/db"
pnpm test:integration
```

---

## 🚀 **Running Tests**

### **All Tests**
```bash
pnpm test
# Runs migration + seeds tests (skips integration without DATABASE_URL)
```

### **Watch Mode**
```bash
pnpm test:watch
# Auto-reruns tests on file changes
```

### **Individual Suites**
```bash
pnpm test:migration    # Migration validation only
pnpm test:seeds        # Seed data validation only
pnpm test:integration  # Database integration (requires DB)
```

---

## 📊 **Test Results**

### **Latest Run**
```
 Test Files  2 passed | 1 skipped (3)
      Tests  26 passed | 11 skipped (37)
   Duration  442ms
```

### **Coverage Breakdown**

| Suite | Tests | Status |
|-------|-------|--------|
| Migration Validation | 7 | ✅ All Passing |
| Seed Data Validation | 19 | ✅ All Passing |
| Integration Tests | 11 | ⏭️ Skipped (no DB) |
| **Total** | **37** | **26 passing** |

---

## 🔍 **What's Tested**

### **Migration Files**
- ✅ SQL syntax validity
- ✅ Table creation statements
- ✅ Index definitions
- ✅ Unique constraints
- ✅ Foreign key references
- ✅ Default values
- ✅ Column data types

### **Seed Data**
- ✅ JSON structure validity
- ✅ Required fields presence
- ✅ Data type correctness
- ✅ Uniqueness constraints
- ✅ Referential integrity
- ✅ Naming conventions
- ✅ Cross-file consistency

### **Database Operations** (with DATABASE_URL)
- ✅ Schema existence
- ✅ Table structure
- ✅ Index creation
- ✅ Constraint enforcement
- ✅ CRUD operations
- ✅ Idempotency

---

## 🐛 **Troubleshooting**

### **Tests Fail After Schema Changes**
```bash
# Regenerate migration
pnpm db:generate

# Run tests again
pnpm test
```

### **Integration Tests Always Skip**
```bash
# Set DATABASE_URL environment variable
export DATABASE_URL="postgresql://user:pass@localhost:5432/testdb"

# Run integration tests
pnpm test:integration
```

### **Seed Validation Fails**
```bash
# Validate JSON syntax
cat seeds/route-policies.json | jq .
cat seeds/nav-policies.json | jq .
cat seeds/plan-entitlements.json | jq .

# Check for duplicate keys
cat seeds/route-policies.json | jq '.[].routeKey' | sort | uniq -d
```

---

## 📝 **Adding New Tests**

### **Migration Test**
```typescript
// tests/migration.test.ts
it('should have new column in table', () => {
  const content = readFileSync(join(migrationsDir, latestMigration), 'utf-8');
  expect(content).toContain('new_column');
});
```

### **Seed Validation Test**
```typescript
// tests/seeds.test.ts
it('should validate new field', () => {
  const data = JSON.parse(readFileSync(join(seedsDir, 'file.json'), 'utf-8'));
  data.forEach((item: any) => {
    expect(item).toHaveProperty('newField');
  });
});
```

### **Integration Test**
```typescript
// tests/integration.test.ts
it('should perform new operation', async () => {
  const result = await db.insert(table).values(data);
  expect(result.length).toBe(1);
});
```

---

## ✅ **Test Checklist**

Before deploying:
- [ ] All migration tests pass
- [ ] All seed validation tests pass
- [ ] Integration tests pass (with DATABASE_URL)
- [ ] No console errors or warnings
- [ ] Migration file reviewed manually
- [ ] Seed data reviewed for correctness

---

## 🎯 **Best Practices**

### **Writing Tests**
1. Test one thing per test case
2. Use descriptive test names
3. Keep tests independent
4. Clean up after integration tests
5. Use meaningful assertions

### **Test Data**
1. Use realistic test data
2. Cover edge cases
3. Test boundary conditions
4. Validate error handling
5. Test idempotency

### **Maintenance**
1. Update tests when schema changes
2. Keep tests fast (< 1 second each)
3. Remove obsolete tests
4. Document complex test logic
5. Review test failures carefully

---

## 📈 **Continuous Integration**

### **CI Pipeline**
```yaml
# .github/workflows/test.yml
- name: Test Database Schema
  run: |
    cd packages/database-schema
    pnpm install
    pnpm test
```

### **Pre-commit Hook**
```bash
#!/bin/sh
cd packages/database-schema
pnpm test || exit 1
```

---

## 🔗 **Related Documentation**

- [README.md](./README.md) - Package overview
- [WORKFLOW.md](./WORKFLOW.md) - Development workflow
- [../../docs/architecture/ENTITLEMENTS_SCHEMA_SYNC.md](../../docs/architecture/ENTITLEMENTS_SCHEMA_SYNC.md) - Schema sync guide

---

**Maintained by:** Development Team  
**Questions?** See main project documentation
