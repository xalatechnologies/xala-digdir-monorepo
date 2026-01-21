# Platform Extraction Verification Report

**Generated:** 2026-01-21
**Purpose:** Document verification results for PR D.3 & F.2 (Platform namespace migration and Feature Kits architecture)

---

## Executive Summary

| Verification Script | Status | Violations |
|---------------------|--------|------------|
| `verify-boundaries.sh` | FAILED | 34 violations |
| `verify-terms.sh` | FAILED | 191 violations |
| `verify-platform-only-apps.sh` | FAILED | 27 violations |
| `verify-modules.mjs` | FAILED | 5 issues |

**Overall Readiness:** NOT READY FOR PRODUCTION

The platform extraction is in progress but significant work remains to achieve clean architectural boundaries. The violations are primarily:
1. Documentation/comments referencing `@digilist/*` (not actual imports)
2. Domain-specific terminology in platform packages
3. Platform-only apps containing domain references in documentation

---

## 1. Boundary Verification (`verify-boundaries.sh`)

### Purpose
Ensures platform packages (`@xalatechnologies/*`, `@xala/*`) do not import from domain packages (`@digilist/*`).

### Result: FAILED (34 violations)

### Violation Breakdown

| Category | Count | Description |
|----------|-------|-------------|
| Documentation comments | 28 | JSDoc examples and migration notes |
| Actual code imports | 0 | No runtime violations |
| Type references | 6 | Type documentation references |

### Detailed Violations

#### Documentation/Comment Violations (Non-Critical)

These are JSDoc comments and migration notes, not actual imports:

```
packages/platform/src/ui/blocks/settings/ProfileTab.tsx:11
  * import { useProfile, useAvatarUpload } from '@digilist/client-sdk';

packages/platform/src/ui/blocks/ErrorBoundary.tsx:15
  * import { auditService } from '@digilist/client-sdk';

packages/platform/src/ui/composed/ProtectedRoute.tsx:17
  * import { createFlowContext, saveFlowContextToStorage, sanitizeReturnToUrl } from '@digilist/client-sdk';

packages/platform/src/ui/composed/GlobalSearch.tsx:10
  * import { useTypeahead, useRecentSearches } from '@digilist/client-sdk';
```

#### Governance Package (Intentional)

The governance package's boundary-check.ts legitimately references `@digilist` as it's checking for these imports:

```
packages/governance/src/verification/boundary-check.ts:61
  /@digilist\//
```

#### Contracts Package (Migration Notes)

Migration documentation explaining what moved to `@digilist/contracts`:

```
packages/contracts/src/types/index.ts:7
  * have been REMOVED from this package. They should be imported from @digilist/contracts/types.
```

#### Auth/Config/Runtime Packages (Integration Examples)

These show how domain packages should integrate:

```
packages/auth/src/types/index.ts:120
  * If not provided, falls back to @digilist/client-sdk authService.

packages/config/src/app-profiles.ts:13
  * // Domain package (e.g., @digilist/runtime) registers profiles:
```

### Recommended Fixes

1. **LOW PRIORITY:** Update JSDoc examples to use generic placeholders:
   ```typescript
   // Before:
   * import { useProfile } from '@digilist/client-sdk';

   // After:
   * import { useProfile } from '@your-domain/client-sdk';
   ```

2. **Add `// boundary-ok` comments** to intentional references:
   ```typescript
   // In governance/boundary-check.ts
   /@digilist\//, // boundary-ok - Pattern for detection
   ```

3. **No immediate action required** - These are documentation violations, not runtime violations.

---

## 2. Terms Verification (`verify-terms.sh`)

### Purpose
Ensures platform packages do not contain domain-specific terminology ("listing", "facility").

### Result: FAILED (191 violations)

### Violation Breakdown

| Term | Count | Primary Locations |
|------|-------|-------------------|
| `listing` | ~160 | UI blocks, types, CSS classes |
| `facility` | ~31 | FacilityChips.tsx, RentalObjectListItem.tsx |

### Critical Files Requiring Refactoring

| File | Violations | Priority |
|------|------------|----------|
| `packages/platform/src/ui/types/listing-detail.ts` | Source file | HIGH - Rename file |
| `packages/platform/src/ui/blocks/RentalObjectAvailabilityCalendar.tsx` | 15+ | HIGH - CSS classes |
| `packages/platform/src/ui/blocks/RentalObjectListItem.tsx` | 10+ | HIGH - Comments & code |
| `packages/platform/src/ui/blocks/FacilityChips.tsx` | 3 | MEDIUM |
| Various booking components | 20+ | MEDIUM |

### Recommended Fixes

1. **HIGH PRIORITY:** Rename `listing-detail.ts` to `resource-detail.ts`:
   ```bash
   mv packages/platform/src/ui/types/listing-detail.ts packages/platform/src/ui/types/resource-detail.ts
   ```

2. **HIGH PRIORITY:** Update CSS class names:
   ```typescript
   // Before:
   className="listing-calendar-cell"

   // After:
   className="resource-calendar-cell"
   ```

3. **MEDIUM PRIORITY:** Update component prop names:
   ```typescript
   // Before:
   /** Listing name */
   listingName: string;

   // After:
   /** Resource name */
   resourceName: string;
   ```

4. **MEDIUM PRIORITY:** Rename `FacilityChips.tsx` to `AmenityChips.tsx`:
   ```typescript
   // Already has Amenity type, just remove Facility alias
   export type Facility = Amenity; // REMOVE THIS
   ```

---

## 3. Platform-Only Apps Verification (`verify-platform-only-apps.sh`)

### Purpose
Ensures platform-only apps (`monitoring-global`, `docs-global`, `saas-admin`) have no `@digilist/*` dependencies.

### Result: FAILED (27 violations)

### App Status

| App | Status | Violations |
|-----|--------|------------|
| `apps/saas-admin` | PASSED | 0 |
| `apps/monitoring-global` | FAILED | 9 |
| `apps/docs-global` | FAILED | 18 |

### Violation Analysis

#### monitoring-global (9 violations)

All violations are comments stating "No @digilist/* imports allowed":

```
apps/monitoring-global/src/App.tsx:7
  * PLATFORM-ONLY: No @digilist/* imports allowed.

apps/monitoring-global/src/main.tsx:5
  * PLATFORM-ONLY app - no @digilist/* packages allowed.
```

**Assessment:** FALSE POSITIVES - These are compliance comments, not actual imports.

#### docs-global (18 violations)

Mixed violations:

1. **Compliance comments (6):** Same as monitoring-global
2. **Documentation content (12):** Code examples showing how to use SDK

```typescript
// In docs-global/src/routes/sdk-guide.tsx
pnpm add @digilist/client-sdk

import { initializeClient } from '@digilist/client-sdk';
```

**Assessment:** Documentation app legitimately shows domain SDK examples.

### Recommended Fixes

1. **Update verification script** to use smarter detection:
   ```bash
   # Exclude comment lines starting with * or //
   # Exclude code blocks in documentation
   ```

2. **Add `// platform-exempt` comments** to intentional documentation:
   ```typescript
   // platform-exempt - Documentation example
   <code>{`import { useOrganizations } from '@digilist/client-sdk/hooks';`}</code>
   ```

3. **Consider moving SDK docs** to `apps/docs-learning` (domain-specific docs portal).

---

## 4. Module Registry Verification (`verify-modules.mjs`)

### Purpose
Ensures all API modules are properly classified in the module registry.

### Result: FAILED (5 issues)

### Issues Found

| Issue Type | Module | Resolution |
|------------|--------|------------|
| Unclassified | `capabilities` | Add to registry |
| Orphaned | `capability` | Remove from registry (typo) |
| Orphaned | `byOwnership` | Remove from registry |
| Orphaned | `byTier` | Remove from registry |
| Orphaned | `byRegistrationType` | Remove from registry |

### Statistics

- Total module folders: 68
- Total registered modules: 71
- Unclassified: 1
- Orphaned: 4

### Recommended Fixes

1. **Add `capabilities` to module-registry.ts:**
   ```typescript
   {
     name: 'capabilities',
     category: 'core',
     description: 'Capability management',
   }
   ```

2. **Remove orphaned registrations:**
   - `capability` (likely typo for `capabilities`)
   - `byOwnership`, `byTier`, `byRegistrationType` (likely old filter modules)

---

## Overall Assessment

### Readiness Score: 3/10

| Criterion | Score | Notes |
|-----------|-------|-------|
| Runtime boundary violations | 10/10 | No actual import violations |
| Documentation compliance | 4/10 | Many references to domain packages |
| Terminology compliance | 2/10 | Significant "listing/facility" usage |
| Platform-only apps | 6/10 | Mostly documentation violations |
| Module registry | 8/10 | Minor cleanup needed |

### Blocking Issues for Production

1. **CRITICAL:** 191 banned term violations need resolution
2. **HIGH:** Type file `listing-detail.ts` needs renaming
3. **MEDIUM:** CSS class names contain "listing"

### Non-Blocking Issues

1. JSDoc examples referencing `@digilist/*`
2. Documentation apps showing SDK usage examples
3. Module registry has minor orphaned entries

---

## Recommended Action Plan

### Phase 1: Critical Fixes (1-2 days)

1. Rename `listing-detail.ts` to `resource-detail.ts`
2. Update all imports across platform package
3. Rename CSS classes from `listing-*` to `resource-*`
4. Remove `Facility` type alias from `FacilityChips.tsx`

### Phase 2: Documentation Updates (1 day)

1. Update JSDoc examples to use generic placeholders
2. Add `// boundary-ok` comments to intentional references
3. Add `// platform-exempt` comments to documentation examples

### Phase 3: Registry Cleanup (2 hours)

1. Add `capabilities` module to registry
2. Remove orphaned module registrations

### Phase 4: Script Improvements (4 hours)

1. Improve boundary verification to ignore comments
2. Improve platform-only verification to detect code blocks
3. Add false-positive filtering

---

## Verification Commands

```bash
# Run all verifications
pnpm verify:boundaries
pnpm verify:terms
pnpm verify:platform-only-apps
node scripts/verify-modules.mjs

# Or run scripts directly
./scripts/verify-boundaries.sh
./scripts/verify-terms.sh
./scripts/verify-platform-only-apps.sh
node scripts/verify-modules.mjs
```

---

## Appendix: Full Script Outputs

### A. verify-boundaries.sh Output

```
==============================================
Platform Package Boundary Verification
==============================================

Checking that platform packages don't import from @digilist/*...

Scanning directories: packages/platform packages/enterprise packages/governance
packages/sdk-core packages/contracts packages/auth packages/config packages/i18n
packages/observability packages/runtime

==============================================
ERROR: Platform packages contain @digilist imports!
==============================================

Total violations: 34
```

### B. verify-terms.sh Output

```
==============================================
Platform Banned Terms Verification
==============================================

Checking for banned terms in PLATFORM packages only...

Banned terms: listing facility

==============================================
ERROR: Banned terms found in platform packages!
==============================================

Total violations: 191
```

### C. verify-platform-only-apps.sh Output

```
==============================================
Platform-Only Apps Verification
==============================================

Checking monitoring-global... Found 9 violations
Checking docs-global... Found 18 violations
Checking saas-admin... OK

==============================================
ERROR: Platform-only apps contain @digilist/* imports!
==============================================

Total violations: 27
```

### D. verify-modules.mjs Output

```
Verifying API modules...

Found 68 module folders
Found 71 registered modules

UNCLASSIFIED MODULES: capabilities
ORPHANED REGISTRATIONS: capability, byOwnership, byTier, byRegistrationType

Verification FAILED
```

---

**Report generated by:** Claude Code
**Verification date:** 2026-01-21
