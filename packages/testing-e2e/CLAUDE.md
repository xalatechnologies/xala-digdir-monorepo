# @digilist/testing-e2e - Playwright E2E Configuration

> **Extends:** [Root CLAUDE.md](../../CLAUDE.md)

## Purpose

`@digilist/testing-e2e` provides Playwright E2E test configuration, page objects, and helpers for end-to-end testing across all apps.

**Package Name:** `@digilist/testing-e2e`

---

## Key Features

- **Playwright configuration** - Shared test config
- **Page objects** - Reusable page interactions
- **Test helpers** - Authentication, navigation
- **Fixtures** - Browser contexts, test data
- **Visual testing** - Screenshot comparison

---

## Test Organization

```
tests/e2e/
├── auth/              # Authentication flows
├── booking/           # Booking journeys
├── scenarios/         # Real-world scenarios
└── stories/           # User story tests
```

---

## Running E2E Tests

```bash
# All E2E tests
pnpm test:e2e

# Specific app
pnpm test:e2e tests/e2e/backoffice-*.spec.ts
pnpm test:e2e tests/e2e/minside-*.spec.ts
pnpm test:e2e tests/e2e/monitoring-*.spec.ts

# With UI
pnpm test:e2e --ui
```

---

## Thin App E2E Testing

E2E tests verify that:
1. Components from @xala/ds render correctly
2. SDK hooks fetch data properly
3. User flows work end-to-end
4. No hardcoded values leak through

---

**Last Updated:** 2026-01-20
**Status:** Active
