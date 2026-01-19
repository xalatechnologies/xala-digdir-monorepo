# Gap Matrix - DigiList Quality Audit

> Generated: 2026-01-19
> Status: STEP 0 Complete

---

## Architecture Summary

### Applications (7)

| App | Path | Purpose | Routes/Modules |
|-----|------|---------|----------------|
| api | `apps/api` | Backend REST API | 67 modules |
| web | `apps/web` | Public rental discovery | 5 pages |
| backoffice | `apps/backoffice` | Admin/Case handler | ~50 routes |
| minside | `apps/minside` | User portal | ~20 routes |
| saas-admin | `apps/saas-admin` | Tenant control plane | ~15 routes |
| docs-learning | `apps/docs-learning` | Documentation portal | MDX content |
| monitoring | `apps/monitoring` | Observability dashboard | Grafana-based |

### Packages (14)

| Package | Purpose | Key Exports |
|---------|---------|-------------|
| `client-sdk` | API client + React Query hooks | 71 hooks, 60 services |
| `database-schema` | Drizzle schemas + migrations | Core/domain/platform schemas |
| `ds` | Design System components | 150+ components |
| `ds-themes` | Theme tokens | Brand themes |
| `ds-registry` | Component registry | Storybook exports |
| `contracts` | Shared DTOs/types | Zod schemas |
| `auth` | Auth utilities | Providers, guards |
| `i18n` | Internationalization | 16k+ keys |
| `observability` | Logging/metrics | Sentry, custom |
| `testing` | Test utilities | 285 unit, 38 integration |
| `testing-e2e` | Playwright E2E | 118 test files |
| `eslint-config` | Lint rules | Shared config |
| `sdk-core` | SDK base utilities | HTTP client |
| `docs-content` | MDX documentation | Content package |

---

## Gap Matrix

### Legend
- **P0**: Critical - Blocks tender compliance
- **P1**: High - Required for demo/production
- **P2**: Medium - Quality/UX improvement
- **P3**: Low - Nice to have

---

### Category: Booking System

| ID | Requirement | Evidence | Gap | Fix | Tests | Priority |
|----|-------------|----------|-----|-----|-------|----------|
| B-001 | Booking status 8-value enum | `CHANGELOG.md` L21 | ✅ Implemented | - | `booking-status.test.ts` | Done |
| B-002 | Booking API returns `{data:T}` | `CHANGELOG.md` L18 | ✅ Implemented | - | `booking-api-contracts.test.ts` | Done |
| B-003 | Recurring booking with conflicts | `modules/booking/` | ⚠️ Partial | Add conflict preview UI | E2E: recurring-booking.spec.ts | P1 |
| B-004 | In-game booking mode | API exists | ⚠️ No UI | Add in-game calendar view | Unit + E2E | P1 |
| B-005 | Cancellation window rules | API exists | ⚠️ No frontend display | Show cancellation policy | Unit test policy | P2 |

---

### Category: Calendar/Availability

| ID | Requirement | Evidence | Gap | Fix | Tests | Priority |
|----|-------------|----------|-----|-----|-------|----------|
| C-001 | Server-driven availability | `modules/calendar/` | ✅ API exists | - | Integration tests exist | Done |
| C-002 | Blackout dates display | API supports | ⚠️ No UI indicator | Add blackout badge to calendar | E2E | P2 |
| C-003 | Seasonal lease calendar | `modules/seasonal-lease/` | ⚠️ Partial UI | Complete season calendar | E2E | P1 |

---

### Category: Discovery UI

| ID | Requirement | Evidence | Gap | Fix | Tests | Priority |
|----|-------------|----------|-----|-----|-------|----------|
| D-001 | Grid/List/Map/Table views | `RentalObjectsPage.tsx` | ✅ All 4 views | - | - | Done |
| D-002 | Filter drawer | `Drawer` component | ✅ Implemented | - | - | Done |
| D-003 | FilterChip component | `primitives/FilterChip.tsx` | ✅ Created today | - | Unit test needed | P0 |
| D-004 | ResultsSkeleton | `blocks/ResultsSkeleton.tsx` | ✅ Created today | - | Unit test needed | P0 |
| D-005 | ResultsEmptyState | `blocks/ResultsEmptyState.tsx` | ✅ Created today | - | Unit test needed | P0 |
| D-006 | UserMenu (DS) | `composed/UserMenu.tsx` | ✅ Created today | - | Unit test needed | P0 |
| D-007 | data-testid coverage | All discovery components | ❌ Missing | Add to all interactive elements | E2E selectors | P0 |
| D-008 | URL-sync for view mode | `RentalObjectsPage.tsx` | ❌ Missing | Add useSearchParams | E2E | P1 |
| D-009 | URL-sync for filters | `RentalObjectsPage.tsx` | ❌ Missing | Add filter sync | E2E | P2 |

---

### Category: Header

| ID | Requirement | Evidence | Gap | Fix | Tests | Priority |
|----|-------------|----------|-----|-----|-------|----------|
| H-001 | AppHeader composition | `composed/header.tsx` | ✅ DS component | - | - | Done |
| H-002 | Language switcher in header | `LanguageSwitcher.tsx` | ❌ Not in header | Add to HeaderActions | E2E | P1 |
| H-003 | data-testid on header | Header components | ❌ Missing | Add testids | E2E | P0 |
| H-004 | aria-live result count | Toolbar | ❌ Missing | Add announcement | A11y test | P0 |

---

### Category: RBAC/Authorization

| ID | Requirement | Evidence | Gap | Fix | Tests | Priority |
|----|-------------|----------|-----|-----|-------|----------|
| R-001 | Role matrix (6 roles) | `modules/auth/` | ✅ Implemented | - | RBAC matrix tests | Done |
| R-002 | Menu filtering by role | SDK `getAdminNav()` | ✅ Implemented | - | E2E role tests | Done |
| R-003 | CaseHandler scope | `case-handler-scope/` | ✅ Module exists | - | Integration tests | Done |

---

### Category: Testing Coverage

| ID | Requirement | Evidence | Gap | Fix | Tests | Priority |
|----|-------------|----------|-----|-----|-------|----------|
| T-001 | Unit tests | `testing/suites/unit/` | ✅ 285 files | Extend for new components | - | Ongoing |
| T-002 | Integration tests | `testing/suites/integration/` | ✅ 38 files | Extend for booking flows | - | Ongoing |
| T-003 | E2E tests | `testing-e2e/suites/` | ✅ 118 files | Add discovery E2E | - | P1 |
| T-004 | Security tests | `testing/suites/security/` | ✅ 10 files | - | - | Done |
| T-005 | Compliance tests | `testing/suites/compliance/` | ✅ 2 files | - | - | Done |
| T-006 | New DS component tests | - | ❌ Missing | Create for FilterChip, etc. | Unit | P0 |

---

### Category: Design System Compliance

| ID | Requirement | Evidence | Gap | Fix | Tests | Priority |
|----|-------------|----------|-----|-----|-------|----------|
| DS-001 | Token-only styling | DS components | ✅ Generally compliant | Audit inline styles | Lint rule | P2 |
| DS-002 | No custom CSS in pages | App pages | ⚠️ Some inline styles | Migrate to tokens | Lint rule | P2 |
| DS-003 | Icon consistency | `primitives/icons.tsx` | ✅ SVG components | - | - | Done |
| DS-004 | Typography scale | Theme tokens | ✅ Defined | - | - | Done |

---

## Priority Summary

| Priority | Count | Category |
|----------|-------|----------|
| P0 | 7 | Tests for new components, data-testid, aria-live |
| P1 | 6 | Recurring booking UI, in-game calendar, URL sync, E2E |
| P2 | 5 | Cancellation display, blackout dates, inline style audit |
| Done | 15 | Already implemented |

---

## Immediate Action Items (P0)

1. **Create unit tests** for:
   - `FilterChip.test.tsx`
   - `ResultsSkeleton.test.tsx`
   - `ResultsEmptyState.test.tsx`
   - `UserMenu.test.tsx`

2. **Add data-testid** to:
   - All header components
   - All discovery components
   - Filter drawer elements

3. **Add aria-live** to result count in toolbar

4. **Create E2E tests** for:
   - Discovery grid/list/map/table switching
   - Filter apply/reset
   - Card click navigation
