# Playwright Testing Guide

## Quick Start

```bash
# Run smoke tests (fast)
pnpm test:e2e:smoke

# Run full regression (nightly)
pnpm test:e2e:full

# Debug mode
pnpm playwright test --debug

# UI mode
pnpm playwright test --ui
```

## Auth States

Pre-authenticated storage states for each role:

| Role | File | Permissions |
|------|------|-------------|
| citizen | `.auth/citizen.json` | View, book |
| caseworker | `.auth/caseworker.json` | Approve, reject |
| orgAdmin | `.auth/org-admin.json` | Manage org |
| admin | `.auth/admin.json` | Full tenant |
| saasAdmin | `.auth/saas-admin.json` | All tenants |

### Usage

```typescript
import { test } from '@playwright/test';

test.use({ storageState: '.auth/admin.json' });

test('admin can view dashboard', async ({ page }) => {
  await page.goto('/backoffice/dashboard');
  await expect(page.getByTestId('dashboard__title')).toBeVisible();
});
```

## Test ID Policy

Use `data-testid` attributes for all selectors.

**Naming**: `area__component__action__state`

```typescript
// ✅ Good
page.getByTestId('booking__calendar__slot__select')

// ❌ Bad
page.locator('.btn-primary')
page.getByText('Bestill')
```

## Test Packs

### Smoke (PR Gate)
- Login flow
- Browse rental objects
- View details + availability
- Single booking happy path

### Full Regression (Nightly)
- All role permissions
- Booking modes (single, recurring)
- Cancellation flows
- RBAC enforcement
- A11y scans

## Reports

HTML reports: `/reports/playwright/`

Traces and screenshots attached on failure.

```bash
# View report
pnpm playwright show-report reports/playwright
```
