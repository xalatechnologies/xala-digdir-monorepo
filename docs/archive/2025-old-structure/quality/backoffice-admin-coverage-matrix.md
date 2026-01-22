# Backoffice Admin Coverage Matrix

> Test coverage mapping for all Backoffice Admin modules.
> Generated: 2026-01-18

## Test Organization

| Suite Type | Location | Purpose |
|------------|----------|---------|
| Blur-Eye | `blur-eye/*.spec.ts` | UX structure validation |
| CRUD | `crud/*.spec.ts` | Data operations |
| Compliance | `compliance/*.spec.ts` | Quality gates |
| RBAC | `rbac/*.spec.ts` | Role-based access |
| Workflows | `workflows/*.spec.ts` | Business flows |
| Smoke | `smoke/*.spec.ts` | Critical path |
| Sidebar Crawl | `sidebar-crawl/*.spec.ts` | Navigation health |

---

## Module Coverage Matrix

### ✅ = Complete | 🔶 = Partial | ❌ = Missing

| Module | Blur-Eye | CRUD | Workflow | Flags | RBAC | Audit |
|--------|----------|------|----------|-------|------|-------|
| Dashboard | ✅ | N/A | N/A | N/A | ✅ | N/A |
| Bookings | 🔶 | ✅ | 🔶 | N/A | ✅ | 🔶 |
| Calendar | 🔶 | ✅ | 🔶 | N/A | ✅ | 🔶 |
| Messages | ✅ | N/A | N/A | ✅ | ✅ | N/A |
| Economy/Invoices | ✅ | N/A | N/A | ✅ | ✅ | N/A |
| Reports | ✅ | N/A | N/A | ✅ | ✅ | N/A |
| Help | ✅ | N/A | N/A | N/A | ✅ | N/A |
| Blocks | ✅ | N/A | N/A | ✅ | ✅ | N/A |
| Rental Objects | ✅ | ✅ | ✅ | N/A | ✅ | ✅ |
| Seasons | ✅ | 🔶 | N/A | N/A | ✅ | 🔶 |
| Organizations | 🔶 | ✅ | N/A | N/A | ✅ | 🔶 |
| Users | 🔶 | ✅ | N/A | N/A | ✅ | 🔶 |
| Work Queue | ✅ | N/A | ✅ | N/A | ✅ | 🔶 |
| Season Applications | 🔶 | N/A | 🔶 | N/A | ✅ | 🔶 |
| Allocation Planner | 🔶 | N/A | N/A | N/A | ✅ | N/A |
| Decision Forms | 🔶 | N/A | 🔶 | N/A | ✅ | 🔶 |
| Audit Timeline | ✅ | N/A | N/A | N/A | ✅ | ✅ |
| Pricing Rules | ✅ | 🔶 | N/A | N/A | ✅ | 🔶 |
| Tenant Features | ✅ | N/A | N/A | ✅ | ✅ | N/A |
| Tenant Settings | ✅ | N/A | N/A | N/A | ✅ | N/A |
| Tenant Branding | ✅ | N/A | N/A | N/A | ✅ | N/A |
| Tenant Audit Log | ✅ | N/A | N/A | N/A | ✅ | ✅ |
| GDPR Requests | ✅ | N/A | 🔶 | N/A | ✅ | 🔶 |
| Reviews Moderation | ✅ | N/A | 🔶 | N/A | ✅ | 🔶 |
| Settings | ✅ | N/A | N/A | N/A | ✅ | N/A |

---

## Test File Mapping

### Blur-Eye Tests
| File | Modules Covered |
|------|-----------------|
| `dashboard.spec.ts` | Dashboard |
| `rental-objects.spec.ts` | Rental Objects |
| `messages.spec.ts` | Messages |
| `reports.spec.ts` | Reports |
| `seasons.spec.ts` | Seasons |
| `work-queue.spec.ts` | Work Queue |
| `tenant-settings.spec.ts` | Tenant Features, Settings, Branding, Audit Log |
| `gdpr-requests.spec.ts` | GDPR Requests |
| `reviews-moderation.spec.ts` | Reviews Moderation |
| `pricing-rules.spec.ts` | Pricing Rules |
| `audit-timeline.spec.ts` | Audit Timeline |
| `help.spec.ts` | Help |
| `economy-invoices.spec.ts` | Economy/Invoices |
| `blocks.spec.ts` | Blocks |
| `settings.spec.ts` | Settings |
| `feature-flags.spec.ts` | Feature Flag Integration |
| `shell.spec.ts` | Header, Sidebar, Shell |

### CRUD Tests
| File | Modules Covered |
|------|-----------------|
| `bookings.spec.ts` | Bookings |
| `calendar.spec.ts` | Calendar |
| `rental-objects.spec.ts` | Rental Objects |
| `rental-object-wizard.spec.ts` | Rental Object Wizard |
| `organizations.spec.ts` | Organizations |
| `users.spec.ts` | Users |
| `settings-and-admin.spec.ts` | Various Admin Settings |

### Compliance Tests
| File | Purpose |
|------|---------|
| `feature-flags.spec.ts` | Flag consistency |
| `localization.spec.ts` | i18n parity |
| `security.spec.ts` | Security gates |
| `wcag.spec.ts` | Accessibility |
| `redundancy-check.spec.ts` | Menu hygiene |

### RBAC Tests
| File | Purpose |
|------|---------|
| `admin-access.spec.ts` | Admin role access |
| `saksbehandler-access.spec.ts` | Case handler role access |

---

## Quality Gates Summary

All tests enforce:
- ❌ No console errors (non-allowlisted)
- ❌ No pageerror/unhandledrejection
- ❌ No 5xx API responses
- ❌ No missing i18n keys
- ❌ No forbidden terminology ("facility")

---

## Run Commands

```bash
# Smoke run (fast)
pnpm exec playwright test --project=smoke --config=playwright.backoffice.config.ts

# Full admin suite
pnpm exec playwright test --project=admin-chromium --config=playwright.backoffice.config.ts

# Blur-eye tests only
pnpm exec playwright test tests/e2e/backoffice/blur-eye/ --config=playwright.backoffice.config.ts

# CRUD tests only
pnpm exec playwright test tests/e2e/backoffice/crud/ --config=playwright.backoffice.config.ts

# Compliance tests only
pnpm exec playwright test tests/e2e/backoffice/compliance/ --config=playwright.backoffice.config.ts

# Single module
pnpm exec playwright test tests/e2e/backoffice/blur-eye/dashboard.spec.ts --config=playwright.backoffice.config.ts
```

---

## Artifacts Generated

| Artifact | Path | Purpose |
|----------|------|---------|
| Menu Map | `reports/menu-map-admin.json` | Sidebar items discovered |
| Redundancy Report | `reports/redundancy-report.md` | Duplicate detection |
| Test Results | `playwright-report/backoffice/` | HTML report |

---

_Last Updated: 2026-01-18_
