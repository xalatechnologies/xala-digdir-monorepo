# Gap Matrix - DigiList Platform Audit

**Generated:** 2026-01-19  
**Audit Scope:** Full-stack domain audit (DB → API → SDK → DS → Apps)  
**Status:** STEP 3 Complete - Evidence-based gap identification

---

## Executive Summary

| Category | Total Gaps | High Priority | Medium Priority | Low Priority |
|----------|------------|---------------|-----------------|--------------|
| **DS Violations** | 58 | 38 | 15 | 5 |
| **SDK Coverage** | 14 | 8 | 6 | 0 |
| **Contract Drift** | 3 | 1 | 2 | 0 |
| **Business Logic in Apps** | 6 | 4 | 2 | 0 |
| **Test Coverage** | TBD | TBD | TBD | TBD |
| **Total** | **81+** | **51** | **25** | **5** |

---

## 1. DS Adoption Gaps (58 Total)

### 1.1 Duplicate AppLayout Components (HIGH - 4 instances)

| File | Lines | Issue | Fix Action | Tests Needed |
|------|-------|-------|------------|--------------|
| `apps/backoffice/src/components/layout/AppLayout.tsx` | 200+ | Custom layout with CSS modules | Delete. Use `@xala/ds` `AppShell` | Visual regression |
| `apps/saas-admin/src/components/layout/AppLayout.tsx` | 200+ | Custom layout with CSS modules | Delete. Use `@xala/ds` `AppShell` | Visual regression |
| `apps/monitoring/src/components/layout/AppLayout.tsx` | 200+ | Custom layout with CSS modules | Delete. Use `@xala/ds` `AppShell` | Visual regression |
| `apps/minside/src/components/layout/AppLayout.tsx` | 200+ | Custom layout with CSS modules | Delete. Use `@xala/ds` `AppShell` | Visual regression |

**Impact:** HIGH - Violates "thin apps" policy, blocks consistent layout  
**Effort:** 2-3 days (one app at a time)  
**Acceptance Criteria:**
- All apps import `AppShell` from `@xala/ds`
- No custom layout components in apps
- All layout styling via DS tokens
- Visual regression tests pass

---

### 1.2 CSS Module Files in Apps (HIGH - 19 instances)

| File | Lines | Issue | Fix Action | Tests |
|------|-------|-------|------------|-------|
| `apps/saas-admin/src/routes/*.module.css` | 9 files | Custom styling | Delete. Use DS tokens | Visual |
| `apps/docs-learning/src/routes/*.module.css` | 10 files | Custom styling | Delete. Use DS tokens | Visual |
| `apps/saas-admin/src/components/*.module.css` | Multiple | Custom styling | Delete. Use DS components | Visual |

**Impact:** HIGH - Violates "no custom CSS" rule  
**Effort:** 1-2 weeks  
**Acceptance Criteria:**
- Zero `.module.css` files in apps
- CI gate: fail if `.module.css` exists in apps
- All styling via DS tokens or DS components

---

### 1.3 Inline Styles (MEDIUM - 358 files, 10,182 matches)

**Pattern:** `style={...}` or `className={...+...}`

**Sample violations:**
```typescript
// apps/backoffice/src/pages/Dashboard.tsx
<div style={{ padding: '20px', background: '#f5f5f5' }}>

// apps/web/src/components/BookingCard.tsx
<span className={`status ${booking.status === 'confirmed' ? 'active' : ''}`}>
```

**Impact:** MEDIUM - Bypasses design token system  
**Effort:** 2-3 weeks (automated refactor possible)  
**Fix:** Replace with DS token variables or DS components  
**Acceptance Criteria:**
- Zero inline `style=` in apps
- Zero string concatenation in `className=`
- CI gate: fail on inline styles

---

### 1.4 Direct @digdir Imports (LOW - 9 files)

| File | Issue | Fix |
|------|-------|-----|
| `apps/backoffice/src/routes/rental-objects/create.tsx` | `import { Button } from '@digdir/designsystemet-react'` | Change to `from '@xala/ds'` |
| `apps/backoffice/src/routes/bookings/detail.tsx` | Same | Same |
| `apps/web/src/routes/search.tsx` | Same | Same |
| `apps/minside/src/routes/profile.tsx` | Same | Same |
| (5 more files) | Same | Same |

**Impact:** LOW - Bypasses DS abstraction  
**Effort:** 1 hour (find/replace)  
**Acceptance Criteria:**
- Zero imports from `@digdir/designsystemet-react` in apps
- CI gate: fail on `@digdir/` imports

---

### 1.5 Duplicate Feature Components (HIGH - 30+ instances)

#### Season Management Components (10 files)
| File | Lines | Issue | Fix Action |
|------|-------|-------|------------|
| `apps/backoffice/src/components/seasons/SeasonalLeaseForm.tsx` | 300+ | App-local season form | Move to `@xala/ds/blocks/SeasonFormBlock` |
| `apps/backoffice/src/components/seasons/SeasonVenueManagement.tsx` | 200+ | App-local venue mgmt | Move to `@xala/ds/blocks/SeasonVenueBlock` |
| `apps/backoffice/src/components/seasons/SeasonApplicationManagement.tsx` | 250+ | App-local application UI | Move to `@xala/ds/blocks/SeasonApplicationBlock` |
| `apps/backoffice/src/components/seasons/SeasonAllocationManagement.tsx` | 200+ | App-local allocation UI | Move to `@xala/ds/blocks/SeasonAllocationBlock` |
| (6 more season files) | Various | App-local components | Move to DS blocks |

**Impact:** HIGH - Duplicated business UI, can't reuse  
**Effort:** 1 week  
**Acceptance Criteria:**
- All season UI in DS blocks
- Backoffice uses DS blocks only
- Storybook entries for each block

#### Settings Tabs (15 files across apps)
| App | Files | Issue |
|-----|-------|-------|
| backoffice | 5 settings tabs | Custom settings UI |
| saas-admin | 5 settings tabs | Custom settings UI |
| minside | 3 settings tabs | Custom settings UI |
| monitoring | 2 settings tabs | Custom settings UI |

**Fix:** Create `@xala/ds/blocks/SettingsTabBlock` with plugin system  
**Impact:** HIGH  
**Effort:** 3-4 days

#### GDPR Components (6 files)
| File | Issue | Fix |
|------|-------|-----|
| `apps/backoffice/src/components/gdpr/ConsentManager.tsx` | Custom GDPR UI | Move to `@xala/ds/blocks/GdprConsentBlock` |
| `apps/minside/src/components/gdpr/DataRequest.tsx` | Custom data request UI | Move to `@xala/ds/blocks/GdprDataRequestBlock` |
| `apps/web/src/components/gdpr/CookieBanner.tsx` | Custom cookie banner | Move to `@xala/ds/blocks/CookieBannerBlock` |
| (3 more GDPR files) | App-local GDPR UI | Move to DS blocks |

**Impact:** HIGH - Compliance UI must be consistent  
**Effort:** 2-3 days

---

### 1.6 Missing DS Blocks (10 needed)

| Block Name | Purpose | Used In | Priority |
|------------|---------|---------|----------|
| `ListPageBlock` | List page layout (header+toolbar+table) | All apps | HIGH |
| `DetailPageBlock` | Detail page layout (header+sections) | All apps | HIGH |
| `SeasonFormBlock` | Season booking form | Backoffice | HIGH |
| `SeasonApplicationBlock` | Season application UI | Backoffice | HIGH |
| `GdprConsentBlock` | GDPR consent manager | All apps | HIGH |
| `GdprDataRequestBlock` | Data request form | Minside | MEDIUM |
| `CookieBannerBlock` | Cookie consent banner | Web | MEDIUM |
| `SettingsTabBlock` | Settings tab container | All apps | MEDIUM |
| `BookingWizardBlock` | Multi-step booking flow | Web, Minside | MEDIUM |
| `DashboardGridBlock` | Dashboard grid layout | Backoffice | LOW |

**Impact:** MEDIUM - Blocks apps from being thin  
**Effort:** 2-3 weeks (1-2 days per block)

---

## 2. SDK Coverage Gaps (14 Total)

### 2.1 Missing SDK Services (HIGH - 8 services)

| API Controller | Endpoints | Reason Missing | Priority | Effort |
|----------------|-----------|----------------|----------|--------|
| **allocations** | 5 | Simple CRUD omitted | HIGH | 4 hours |
| **amenities** | 4 | Reference data omitted | HIGH | 3 hours |
| **discount-codes** | 6 | Economy feature omitted | HIGH | 4 hours |
| **settings** | 8 | App settings omitted | HIGH | 5 hours |
| **user-groups** | 6 | User mgmt omitted | MEDIUM | 4 hours |
| **permission-assignment** | 5 | Admin RBAC omitted | MEDIUM | 4 hours |
| **case-handler-scope** | 5 | Custody mgmt omitted | MEDIUM | 4 hours |
| **seasonal-lease** | 4 | Seasons extension omitted | MEDIUM | 3 hours |

**Total Effort:** 31 hours (4 days)  
**Impact:** MEDIUM - Forces apps to call API directly  
**Acceptance Criteria:**
- SDK service for each controller
- React Query hooks for each service
- Type-safe DTOs
- Integration tests

---

### 2.2 Keep API-Only (no SDK needed) (6 controllers)

| Controller | Reason |
|------------|--------|
| **public** | Unauthenticated SSR endpoints |
| **brreg** | Integration adapter (internal only) |
| **widgets** | Embed API (external consumers) |
| **blocks** | Calendar internal (used by calendar service) |
| **conversations** | Merged with messages SDK |
| **share** | Tracking endpoint (analytics) |

---

## 3. Business Logic in Apps (6 instances)

### 3.1 RBAC Logic Duplication (HIGH - 2 files)

| File | Lines | Issue | Fix |
|------|-------|-------|-----|
| `apps/backoffice/src/hooks/useRBAC.ts` | 83 | Duplicates server RBAC rules | Delete. Use capabilities API |
| `apps/minside/src/hooks/useRBAC.ts` | Similar | Duplicates server RBAC rules | Delete. Use capabilities API |

**Evidence:**
```typescript
// apps/backoffice/src/hooks/useRBAC.ts
const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  admin: ['bookings.view', 'bookings.approve', ...],
  saksbehandler: ['bookings.view', 'bookings.approve', ...],
  user: ['bookings.view', 'listings.view'],
};
```

**Why It's Wrong:**
- Duplicates `apps/api/src/core/permissions.ts` RBAC rules
- Client-side permission checks are security theater
- RBAC must be server-authoritative only

**Fix:**
1. Delete app-local RBAC hooks
2. Use `useCapabilities()` hook (calls `/api/{app}/me/capabilities`)
3. Server returns capabilities, app renders based on DTO

**Impact:** HIGH - Security risk + business logic in app  
**Effort:** 1 day  
**Acceptance Criteria:**
- Zero RBAC logic in apps
- All permission checks via capabilities API
- Integration tests verify server-driven permissions

---

### 3.2 Offline Booking Logic (MEDIUM - 1 file)

| File | Lines | Issue | Fix |
|------|-------|-------|-----|
| `apps/minside/src/hooks/useOfflineBookings.ts` | 217 | IndexedDB caching + sync logic | Move to `@xala/sdk-core` offline module |

**Evidence:**
```typescript
// apps/minside/src/hooks/useOfflineBookings.ts
class BookingsCache {
  async init() { /* IndexedDB setup */ }
  async getBookings() { /* Cache read */ }
  async saveBookings() { /* Cache write */ }
  async syncWithServer() { /* Sync logic */ }
}
```

**Why It's Wrong:**
- Offline sync is infrastructure, not app logic
- Should be reusable across apps (web, backoffice)
- Hard to test in isolation

**Fix:**
1. Move to `packages/sdk-core/src/offline/bookings-cache.ts`
2. Create `useOfflineSync()` hook in SDK
3. Apps import from SDK

**Impact:** MEDIUM - Business logic in app  
**Effort:** 1 day  
**Acceptance Criteria:**
- Offline logic in SDK package
- All apps can use offline sync
- Unit tests for sync logic

---

### 3.3 Capabilities Logic (LOW - 1 file)

| File | Issue | Fix |
|------|-------|-----|
| `apps/backoffice/src/hooks/useCapabilities.ts` | Wraps capabilities API correctly | ✅ Keep (thin wrapper) |

**Evidence:**
```typescript
export function useCapabilities() {
  const { role } = useBackofficeRole();
  
  const hasCapability = useMemo(
    (capability) => roleHasCapability(role, capability),
    [role]
  );
  
  return { hasCapability, ... };
}
```

**Verdict:** ✅ **Acceptable** - Pure wrapper, no business rules

---

### 3.4 Demo Login Hook (LOW - 3 files)

| File | Issue | Verdict |
|------|-------|---------|
| `apps/backoffice/src/hooks/useDemoLogin.tsx` | Demo auth logic | ✅ Keep (dev-only) |
| `apps/web/src/hooks/useDemoLogin.tsx` | Demo auth logic | ✅ Keep (dev-only) |
| `apps/minside/src/hooks/useDemoLogin.tsx` | Demo auth logic | ✅ Keep (dev-only) |

**Verdict:** ✅ **Acceptable** - Development convenience, not business logic

---

## 4. Contract Drift (3 instances)

### 4.1 Booking Schema Drift (LOW)

| Layer | File | Issue |
|-------|------|-------|
| **Contracts** | `packages/contracts/src/schemas/booking.schema.ts` | Has `paymentStatus` field |
| **DB Schema** | `packages/database-schema/src/domain/bookings.ts` | Missing `paymentStatus` field |
| **API Schema** | `apps/api/src/schemas/booking.schema.ts` | Missing `paymentStatus` field |

**Impact:** LOW - Future field (not yet used)  
**Fix:** Add `paymentStatus` column to DB schema in next migration  
**Effort:** 1 hour

---

### 4.2 Calendar Projection Drift (MEDIUM)

| Layer | Issue |
|-------|-------|
| **API Schema** | `apps/api/src/schemas/calendar.schema.ts` has 15+ types |
| **Contracts** | `packages/contracts/src/schemas/calendar.schema.ts` has 8 types |

**Impact:** MEDIUM - Projection mismatch  
**Fix:** Document which types are API-internal vs client-facing  
**Effort:** 2 hours (documentation)

---

### 4.3 No Contract Tests (HIGH)

**Issue:** No automated tests verify DTO parity across layers

**Impact:** HIGH - Drift can occur silently  
**Fix:** Add contract tests:
```typescript
// packages/contracts/tests/contract-parity.test.ts
describe('Booking Schema Parity', () => {
  it('API schema matches contracts schema', () => {
    const apiBooking = ApiBookingSchema.parse(sampleBooking);
    const contractBooking = ContractBookingSchema.parse(sampleBooking);
    expect(apiBooking).toEqual(contractBooking);
  });
});
```

**Effort:** 1 week (add tests for all schemas)  
**Acceptance Criteria:**
- Contract tests for 10 major schemas
- CI fails on schema drift
- Tests run on every commit

---

## 5. Test Coverage Gaps (TBD - Full audit in STEP 5)

### 5.1 Preliminary Findings

| Module | Unit Tests | Integration Tests | E2E Tests | Contract Tests |
|--------|------------|-------------------|-----------|----------------|
| **Booking** | ⚠️ Partial | ⚠️ Partial | ✅ Exists | ❌ Missing |
| **Pricing** | ❌ Missing | ❌ Missing | ❌ Missing | ❌ Missing |
| **Calendar** | ❌ Missing | ❌ Missing | ⚠️ Partial | ❌ Missing |
| **RBAC** | ⚠️ Partial | ❌ Missing | ❌ Missing | ❌ Missing |
| **Feature Flags** | ❌ Missing | ❌ Missing | ❌ Missing | ❌ Missing |

**Note:** Full test gap audit deferred to STEP 5

---

## 6. Prioritized Gap List (Top 20)

| # | Gap | Category | Impact | Effort | Priority | Files |
|---|-----|----------|--------|--------|----------|-------|
| 1 | RBAC logic in apps | Business Logic | HIGH | 1 day | **P0** | 2 |
| 2 | Duplicate AppLayout | DS Violation | HIGH | 3 days | **P0** | 4 |
| 3 | CSS modules in apps | DS Violation | HIGH | 2 weeks | **P0** | 19 |
| 4 | Season components in apps | DS Violation | HIGH | 1 week | **P0** | 10 |
| 5 | GDPR components in apps | DS Violation | HIGH | 3 days | **P0** | 6 |
| 6 | Settings tabs in apps | DS Violation | HIGH | 4 days | **P0** | 15 |
| 7 | Missing SDK: allocations | SDK Gap | HIGH | 4 hours | **P1** | 1 |
| 8 | Missing SDK: amenities | SDK Gap | HIGH | 3 hours | **P1** | 1 |
| 9 | Missing SDK: discount-codes | SDK Gap | HIGH | 4 hours | **P1** | 1 |
| 10 | Missing SDK: settings | SDK Gap | HIGH | 5 hours | **P1** | 1 |
| 11 | Offline booking logic in app | Business Logic | MEDIUM | 1 day | **P1** | 1 |
| 12 | Inline styles | DS Violation | MEDIUM | 3 weeks | **P2** | 358 |
| 13 | Missing contract tests | Contract Drift | HIGH | 1 week | **P2** | - |
| 14 | Missing SDK: user-groups | SDK Gap | MEDIUM | 4 hours | **P2** | 1 |
| 15 | Missing SDK: permission-assignment | SDK Gap | MEDIUM | 4 hours | **P2** | 1 |
| 16 | Missing SDK: case-handler-scope | SDK Gap | MEDIUM | 4 hours | **P2** | 1 |
| 17 | Missing SDK: seasonal-lease | SDK Gap | MEDIUM | 3 hours | **P2** | 1 |
| 18 | Calendar projection drift | Contract Drift | MEDIUM | 2 hours | **P2** | 2 |
| 19 | Direct @digdir imports | DS Violation | LOW | 1 hour | **P3** | 9 |
| 20 | Payment status field missing | Contract Drift | LOW | 1 hour | **P3** | 1 |

---

## 7. Remediation Effort Summary

| Category | Total Gaps | Effort (Days) | Priority |
|----------|------------|---------------|----------|
| **P0 - Critical** | 6 | 10-15 days | Must fix before launch |
| **P1 - High** | 5 | 3-4 days | Fix in sprint 1 |
| **P2 - Medium** | 9 | 6-8 weeks | Fix in sprint 2-3 |
| **P3 - Low** | 3 | 1 day | Fix when convenient |
| **Total** | **23** | **13-20 weeks** | Phased approach |

---

## 8. CI/CD Quality Gates (Recommended)

### 8.1 Build-Time Checks

```bash
# Fail if apps contain forbidden patterns
- name: Check for CSS modules in apps
  run: |
    if find apps/*/src -name "*.module.css" | grep -q .; then
      echo "ERROR: CSS modules found in apps"
      exit 1
    fi

- name: Check for direct @digdir imports
  run: |
    if grep -r "from '@digdir/designsystemet-react'" apps/*/src; then
      echo "ERROR: Direct @digdir imports found"
      exit 1
    fi

- name: Check for inline styles
  run: |
    if grep -r "style=\{" apps/*/src | grep -v test | grep -q .; then
      echo "ERROR: Inline styles found"
      exit 1
    fi

- name: Check for RBAC logic in apps
  run: |
    if grep -r "ROLE_PERMISSIONS" apps/*/src; then
      echo "ERROR: RBAC logic found in apps"
      exit 1
    fi
```

### 8.2 Schema Parity Checks

```bash
- name: Verify contract parity
  run: pnpm -F @xala/contracts test:parity
```

### 8.3 SDK Coverage Check

```bash
- name: Verify SDK covers all API endpoints
  run: node scripts/verify-sdk-coverage.js
```

---

## 9. Acceptance Criteria (Definition of Done)

### DS-First Compliance
- [ ] Zero CSS modules in apps
- [ ] Zero inline styles in apps
- [ ] Zero direct @digdir imports
- [ ] All reusable UI in `@xala/ds`
- [ ] All apps use DS tokens only
- [ ] CI gates enforce rules

### Thin App Compliance
- [ ] Zero business logic in apps
- [ ] Zero RBAC logic in apps
- [ ] All data fetching via SDK hooks
- [ ] All event handlers call SDK mutations
- [ ] Pages/wrappers < 150 lines

### SDK Coverage
- [ ] SDK service for every API controller (except 6 excluded)
- [ ] React Query hook for every SDK method
- [ ] Type-safe DTOs across layers
- [ ] Integration tests for all SDK services

### Contract Alignment
- [ ] Contract tests for 10 major schemas
- [ ] Zero schema drift detected
- [ ] Payment status field added to DB
- [ ] Calendar projections documented

### Test Coverage
- [ ] Contract tests: 100%
- [ ] Unit tests: 80%+
- [ ] Integration tests: Key flows covered
- [ ] E2E tests: Critical journeys covered

---

## 10. Next Steps

1. **Review this gap matrix** with team
2. **STEP 4:** Create detailed remediation plan with phases
3. **STEP 5:** Complete test gap audit
4. **Kick off Phase 1:** Fix P0 gaps (10-15 days)

---

*This gap matrix provides evidence-based, actionable remediation guidance for achieving 100% compliance with DigiList architectural standards.*
