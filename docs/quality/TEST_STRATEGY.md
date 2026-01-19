# Test Strategy - DigiList Quality Audit

> Generated: 2026-01-19
> Status: Active

---

## Testing Architecture

```
packages/
├── testing/                     # Shared test utilities
│   └── suites/
│       ├── unit/               # 285 unit test files
│       ├── integration/        # 38 integration test files
│       ├── e2e/                # 117 E2E test files
│       ├── security/           # 10 security test files
│       ├── compliance/         # 2 compliance test files
│       ├── contracts/          # 5 contract test files
│       └── performance/        # 4 performance test files
│
└── testing-e2e/                 # Playwright E2E
    └── suites/                  # 118 test files
```

---

## Test Layers

### 1. Unit Tests

**Purpose**: Fast, deterministic tests for isolated logic

**Coverage Areas**:
- Policy engine rules (allow/deny matrix)
- Domain rules (booking modes, cancellation, pricing)
- DTO validation (Zod schemas)
- Component rendering (DS components)

**Tooling**: Vitest

**Run Command**:
```bash
pnpm test:unit
# or specific package
pnpm --filter @digilist/client-sdk test
```

**New Tests Required** (P0):
- `packages/ds/src/__tests__/FilterChip.test.tsx`
- `packages/ds/src/__tests__/ResultsSkeleton.test.tsx`
- `packages/ds/src/__tests__/ResultsEmptyState.test.tsx`
- `packages/ds/src/__tests__/UserMenu.test.tsx`

---

### 2. Integration Tests

**Purpose**: Verify API + DB + SDK contract parity

**Coverage Areas**:
- Database migrations apply cleanly
- Repository projections match DTOs
- API endpoints return RFC7807 errors
- SDK client calls match API contracts

**Tooling**: Vitest + Testcontainers (Postgres)

**Run Command**:
```bash
pnpm test:integration
```

**Existing Coverage**:
- 38 integration test files
- Booking approval workflow
- Auth flows
- RBAC enforcement

---

### 3. E2E Tests (Playwright)

**Purpose**: Full user journey validation across all apps

**Coverage Areas**:

#### WEB App
| Journey | Test File | Status |
|---------|-----------|--------|
| Browse listings | `discovery.spec.ts` | To create |
| View listing detail | `listing-detail.spec.ts` | Exists |
| Create booking | `booking-flow.spec.ts` | Exists |
| Recurring booking | `recurring-booking.spec.ts` | To create |
| Payment flow | `payment.spec.ts` | Exists |
| Cancellation | `cancellation.spec.ts` | To create |

#### MINSIDE App
| Journey | Test File | Status |
|---------|-----------|--------|
| Login flow | `auth.spec.ts` | Exists |
| Dashboard view | `dashboard.spec.ts` | Exists |
| Booking management | `bookings.spec.ts` | Exists |
| Organization switch | `org-switch.spec.ts` | Exists |

#### BACKOFFICE App
| Journey | Test File | Status |
|---------|-----------|--------|
| Admin full menu | `admin-menu.spec.ts` | Exists |
| CaseHandler menu | `casehandler-menu.spec.ts` | Exists |
| Booking approval | `approval.spec.ts` | Exists |
| Rental object CRUD | `rental-object.spec.ts` | Exists |

**Tooling**: Playwright

**Run Command**:
```bash
pnpm test:e2e
# or specific app
pnpm --filter @digilist/testing-e2e test:web
```

**New Tests Required** (P1):
- `packages/testing-e2e/suites/web/discovery-views.spec.ts`
- `packages/testing-e2e/suites/web/discovery-filters.spec.ts`
- `packages/testing-e2e/suites/web/discovery-mobile.spec.ts`
- `packages/testing-e2e/suites/web/discovery-a11y.spec.ts`

---

### 4. Contract Tests

**Purpose**: Verify API response matches OpenAPI/DTO schemas

**Coverage**:
- Zod schema validation at runtime
- TypeScript compile-time checks
- Response structure verification

**Existing**:
- `testing/suites/contracts/` - 5 files

---

### 5. Accessibility Tests

**Purpose**: WCAG AA compliance

**Checks**:
- Keyboard navigation works
- Focus order is logical
- ARIA attributes present
- Color contrast passes
- Screen reader compatible

**Tooling**: Playwright + axe-core

**Integration**:
```typescript
import AxeBuilder from '@axe-core/playwright';

test('discovery page is accessible', async ({ page }) => {
  await page.goto('/');
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
```

---

## Test Data Strategy

### Seed Data
- Location: `packages/database-schema/seeds/`
- Minimum: 40 rental objects (tender requirement)
- Includes: All booking modes, categories, price tiers

### Test Fixtures
- Location: `packages/testing-e2e/fixtures/`
- Demo users per role
- Pre-configured bookings

---

## CI/CD Integration

### Pipeline Stages

```yaml
test:
  stages:
    - lint-typecheck
    - unit-tests
    - integration-tests
    - e2e-tests
    - security-audit

  # Parallel execution
  unit-tests:
    script: pnpm test:unit
    artifacts:
      reports:
        coverage: coverage/

  e2e-tests:
    script: pnpm test:e2e
    artifacts:
      when: on_failure
      paths:
        - test-results/
        - playwright-report/
```

### Quality Gates

| Gate | Threshold | Enforcement |
|------|-----------|-------------|
| Unit test pass | 100% | Block merge |
| Coverage | 80% lines | Warning |
| E2E pass | 100% | Block deploy |
| Lint errors | 0 | Block merge |
| Type errors | 0 | Block merge |
| Security vulns | 0 critical | Block deploy |

---

## Test ID Convention

All interactive elements must have `data-testid`:

```typescript
// Pattern: [component]-[element]-[id?]
data-testid="header-search"
data-testid="filter-drawer"
data-testid="rental-object-card-{id}"
data-testid="view-mode-grid"
data-testid="filter-chip-category"
```

---

## Commands Reference

```bash
# All tests
pnpm test

# Unit only
pnpm test:unit

# Integration only
pnpm test:integration

# E2E only
pnpm test:e2e

# E2E with UI (debug)
pnpm test:e2e:ui

# Coverage report
pnpm test:coverage

# Security audit
pnpm audit:security
```
