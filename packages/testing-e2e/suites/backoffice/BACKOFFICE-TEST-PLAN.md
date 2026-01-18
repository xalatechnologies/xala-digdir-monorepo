# Backoffice Playwright Test Plan

## Overview

Comprehensive E2E test suite for Digilist Backoffice validating Admin and Saksbehandler roles.

---

## Test Suite Structure

| Suite | Tests | Focus |
|-------|-------|-------|
| Smoke | 8 | Fast PR gate validation |
| Sidebar Crawl | 58 | Full navigation audit |
| RBAC Admin | 12 | Admin access validation |
| RBAC Saksbehandler | 18 | Restricted access |
| Listings Workflow | 10 | Rental object CRUD |
| Bookings Workflow | 12 | Booking management |
| Calendar Workflow | 8 | Blackout management |
| Approvals Workflow | 10 | Case handler tasks |
| WCAG Compliance | 9 | Accessibility audit |
| Localization | 12 | i18n validation |
| Security | 10 | RBAC/IDOR checks |

---

## Role Matrix

| Route | Admin | Saksbehandler |
|-------|-------|---------------|
| `/` | ✅ | ✅ |
| `/bookings` | ✅ | ✅ |
| `/calendar` | ✅ | ✅ |
| `/work-queue` | ✅ | ✅ |
| `/decision-forms` | ✅ | ✅ |
| `/help` | ✅ | ✅ |
| `/rental-objects` | ✅ | ❌ |
| `/users` | ✅ | ❌ |
| `/organizations` | ✅ | ❌ |
| `/settings` | ✅ | ❌ |
| `/tenant/*` | ✅ | ❌ |

---

## Running Tests

```bash
# Smoke tests (fast)
pnpm playwright test --config=playwright.backoffice.config.ts --project=smoke

# Full admin suite
pnpm playwright test --config=playwright.backoffice.config.ts --project=admin-chromium

# Full saksbehandler suite
pnpm playwright test --config=playwright.backoffice.config.ts --project=saksbehandler-chromium

# WCAG accessibility
pnpm playwright test --config=playwright.backoffice.config.ts --project=wcag

# All tests
pnpm playwright test --config=playwright.backoffice.config.ts
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `BACKOFFICE_URL` | Yes | Target URL |
| `ADMIN_EMAIL` | Yes | Admin login |
| `ADMIN_PASSWORD` | Yes | Admin password |
| `SAKSBEHANDLER_EMAIL` | Yes | Case handler login |
| `SAKSBEHANDLER_PASSWORD` | Yes | Case handler password |

---

## Validation Criteria

### Every Page Must:
1. Load without redirects
2. No runtime errors
3. No console errors
4. No 5xx API responses
5. Display UI content
6. No forbidden terminology ("facility")
7. Resolved i18n keys

### RBAC Must:
1. Admin: Full access
2. Saksbehandler: Restricted to case handling
3. Direct URL access: Returns 403 or redirects
4. IDOR attempts: Blocked

### Compliance Must:
1. WCAG 2.1 AA: No critical violations
2. Keyboard navigation: Full support
3. Localization: nb default, en available
4. Security: No token leaks, no stack traces
