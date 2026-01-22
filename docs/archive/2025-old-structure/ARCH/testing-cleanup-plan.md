# DS-First Testing & Cleanup Plan

## Current State

### Build Status ✅
| App | Status |
|-----|--------|
| MinSide | 3.39s ✅ |
| Web | ✅ |
| Backoffice | 5.45s ✅ |

### CSS Module Files to Clean (19 files)
| App | Count | Files |
|-----|-------|-------|
| saas-admin | 9 | ToastProvider, AppLayout, Sidebar, Header, ProtectedRoute, routes/* |
| docs-learning | 10 | DocsRightTOC, DocsSidebar, DocsHeader, DocsLayout, routes/* |

---

## Cleanup Tasks

### P1: Delete/Migrate CSS Modules
1. `saas-admin/src/components/layout/*.module.css` → Use DS shells
2. `docs-learning/src/components/layout/*.module.css` → Use DS shells

### P2: Domain Block Migrations
- SeasonApplicationCard, SeasonCard, VenueCard
- Settings blocks (Profile, Notifications, Preferences)

---

## Testing Strategy

### Already Documented
See `docs/ARCH/test-matrix.md` for comprehensive:
- Unit tests (DS blocks)
- Integration tests (app wrappers)
- E2E tests (Playwright)
- Visual regression tests
- Accessibility tests (axe-core)

### Immediate Tests to Run
```bash
# Unit tests
pnpm -F @xala/ds test

# E2E tests
pnpm test:e2e

# Build verification (already passing)
pnpm -F minside build && pnpm -F web build && pnpm -F backoffice build
```
