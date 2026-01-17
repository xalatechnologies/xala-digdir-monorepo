# Test Pyramid

## Overview

This document describes the test categorization and when each test type runs.

---

## PR Pipeline (Fast Lane)

**Runs on**: Every pull request
**Target**: < 5 minutes

| Test Type | Location | Command |
|-----------|----------|---------|
| TypeScript | All | `pnpm typecheck` |
| ESLint | All | `pnpm lint` |
| Unit Tests | `tests/unit/` | `pnpm test:unit` |
| Contract Tests | `tests/contracts/` | `pnpm test:contract` |
| Integration (fast) | `tests/integration/` | `pnpm test:integration` |

---

## Nightly Pipeline (Full Suite)

**Runs on**: Nightly (2 AM)
**Target**: < 30 minutes

| Test Type | Location | Command |
|-----------|----------|---------|
| All PR tests | - | `pnpm test:ci` |
| E2E Tests | `tests/e2e/` | `pnpm test:e2e` |
| Booking E2E | `tests/e2e/booking/` | `npx playwright test tests/e2e/booking/` |
| Security Tests | `tests/security/` | `pnpm test:security` |
| Performance Tests | `tests/performance/` | `pnpm test:performance` |
| WCAG/A11y Tests | `tests/e2e/accessibility/` | `npx playwright test tests/e2e/accessibility/` |
| Domain Tests | `tests/e2e/domain/` | `npx playwright test tests/e2e/domain/` |

---

## Release Pipeline

**Runs on**: Before production deploy
**Target**: < 45 minutes

| Test Type | Description |
|-----------|-------------|
| All nightly tests | Full suite |
| Mutation Testing | `pnpm test:mutation` |
| Schema Coverage | `pnpm test:schema` |
| GDPR Evidence | `pnpm test:gdpr` |
| Load Testing | `pnpm test:load` |

---

## Test Scripts

```json
{
  "test:unit": "vitest run tests/unit/",
  "test:integration": "vitest run tests/integration/",
  "test:contract": "vitest run tests/contracts/",
  "test:e2e": "playwright test tests/e2e/",
  "test:security": "vitest run tests/security/",
  "test:performance": "vitest run tests/performance/",
  "test:schema": "vitest run tests/integration/schema/",
  "test:gdpr": "vitest run tests/integration/gdpr/",
  "test:wcag": "playwright test tests/e2e/accessibility/",
  "test:ci": "vitest run tests/unit/ tests/integration/ tests/contracts/",
  "test:all": "vitest run && playwright test",
  "test:mutation": "stryker run"
}
```

---

## Coverage Targets

| Layer | Target | Current |
|-------|--------|---------|
| Domain/Services | ≥ 95% | ~40% |
| API Controllers | ≥ 90% | ~60% |
| UI Critical Flows | ≥ 90% | ~50% |
| Mutation Score | ≥ 70% | N/A |

---

## CI Gates

### PR Blocking

- TypeScript errors: **Block**
- ESLint errors: **Block**
- Unit test failures: **Block**
- Contract drift: **Block**

### Nightly Alerts

- E2E failures: **Alert**
- Security vulnerabilities: **Alert (Critical = Block)**
- WCAG violations (critical): **Alert**
- Performance regression > 20%: **Alert**

---

*Generated: 2026-01-17*
