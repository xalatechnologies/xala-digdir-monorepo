# Phase 0: Test System Audit

**Generated**: 2026-01-20 17:48  
**Status**: REQUIRES REVIEW

---

## Executive Summary

| Metric | Count |
|--------|-------|
| Total Test Files | 316 |
| Passing | 12 |
| Skipped | 1,017 |
| Failing | 0 (but most skipped) |

**Primary Issue**: Tests are skipped or broken due to stale imports, missing mocks, and API dependencies.

---

## 1. Package/App Inventory

### Apps (6)
| App | Vitest | Playwright | Status |
|-----|--------|------------|--------|
| api | ✅ | ✅ | Entry: `main.ts` |
| backoffice | ✅ | - | |
| minside | ✅ | - | |
| web | ✅ | - | |
| saas-admin | ✅ | - | |
| monitoring | ✅ | ✅ | |

### Packages (10)
| Package | Vitest | Tests In Testing |
|---------|--------|------------------|
| auth | ✅ | Yes |
| client-sdk | ✅ | Yes |
| contracts | ✅ | Yes |
| database-schema | ✅ | Yes |
| ds | ✅ | 5 unit tests |
| i18n | ✅ | Yes |
| observability | ✅ | Yes |
| sdk-core | ✅ | Yes |
| testing | ✅ | Centralized |
| testing-e2e | - | Playwright |

---

## 2. Test Suite Structure

```
packages/testing/suites/
├── unit/           290 files
├── e2e/            118 files (Playwright)
├── integration/     39 files
├── security/        10 files
├── compliance/       5 dirs (gdpr, i18n, wcag, soc2)
├── contracts/        6 files
├── performance/      4 files
├── user-stories/     1 file
└── visual-regression/1 file
```

---

## 3. Storybook Inventory

**Location**: `packages/ds/stories/`

| Category | Stories |
|----------|---------|
| Blocks | 23 |
| Components | 34 |
| Composed | 12 |
| Fundamentals | 8 |
| Shells | 2 |
| **Total** | **~83** |

---

## 4. Playwright Configs

| Location | Purpose |
|----------|---------|
| `/playwright.config.ts` | Root (monorepo) |
| `apps/api/playwright.config.ts` | API E2E |
| `packages/testing-e2e/playwright.config.ts` | Main E2E suite |
| `packages/ds/playwright.config.ts` | DS visual tests |

---

## 5. Current Scripts

```json
"test": "vitest run"
"test:unit": "vitest run suites/unit"
"test:integration": "vitest run suites/integration"
"test:security": "vitest run suites/security"
"test:compliance": "vitest run suites/compliance"
"test:contracts": "vitest run contracts"
"test:performance": "vitest run suites/performance"
```

---

## 6. Failure Analysis

### Root Causes
1. **Stale imports** - Tests import from `./ComponentName` (local copies) instead of `@xala/ds`
2. **Empty mocks** - `nb = {}`, `en = {}` instead of real translations
3. **API dependencies** - Integration tests require API on port 4000
4. **Missing DB** - Some tests need real database connection
5. **Global mock conflicts** - `@xala/ds` partially mocked in vitest.setup.ts

---

## 7. Recommended Stack

| Layer | Tool | Status |
|-------|------|--------|
| Unit/Integration | Vitest | ✅ Already configured |
| E2E | Playwright | ✅ Already configured |
| Visual | Storybook | ✅ 83 stories |
| Contract | Vitest + Zod | Needs implementation |
| A11y | @axe-core/playwright | Needs implementation |
| Performance | k6 or Artillery | Needs implementation |
| Security | Security headers scan | Needs implementation |

---

## 8. Next Steps (Phase 1)

1. **Clean up vitest.setup.ts** - Fix global mocks
2. **Fix import paths** - Use package aliases not local copies
3. **Implement DB lifecycle** - `db:test:reset`, `seed:test`
4. **Add data-testid policy** - Enforce deterministic selectors
5. **Create test utilities** - Shared fixtures, auth helpers
