# Package Reorganization Analysis & Strategy

**Date:** 2026-01-18  
**Role:** 10x Developer + Documentation Expert + Product Manager + QA Expert  
**Status:** Analysis Complete - Awaiting Approval  
**Breaking Changes:** ZERO ❌

---

## Executive Summary

After comprehensive analysis of 14 packages in the monorepo, I've identified **structural issues** that impact maintainability, discoverability, and developer experience. This report provides a **zero-breaking-change reorganization strategy** based on SOLID principles and separation of concerns.

**Key Findings:**
- ✅ **7 well-structured packages** (auth, contracts, database-schema, ds, eslint-config, i18n, observability)
- ⚠️ **3 packages with unclear purpose** (ai, platform, docs-content)
- ⚠️ **2 SDK packages causing confusion** (sdk-core vs client-sdk)
- ⚠️ **4 design system packages** (could be better organized)

---

## 1. Current Package Analysis

### 1.1 Package Inventory

| Package | Purpose | Status | Dependencies | Used By |
|---------|---------|--------|--------------|---------|
| **@xala/auth** | Authentication system | ✅ Good | React, React Query | All frontend apps |
| **@digilist/client-sdk** | API client with hooks | ✅ Good | @xala/sdk-core, @xala/contracts | All frontend apps |
| **@xala/sdk-core** | Generic HTTP client | ⚠️ Unused directly | - | client-sdk only |
| **@xala/contracts** | API contracts & schemas | ✅ Excellent | Zod | API, client-sdk, apps |
| **@xala/database-schema** | Drizzle ORM schema | ✅ Good | Drizzle, PostgreSQL | API only |
| **@xala/ds** | Design system components | ✅ Good | Designsystemet | All frontend apps |
| **@xala/ds-themes** | Design tokens & themes | ✅ Good | @digdir/designsystemet | ds package |
| **@xala/ds-registry** | Component documentation | ✅ Good | - | Docs site |
| **@xala/eslint-config** | Linting rules | ✅ Excellent | ESLint | All apps |
| **@xala/i18n** | Internationalization | ✅ Good | i18next | All frontend apps |
| **@xala/observability** | Monitoring stack | ✅ Good | Prometheus, Grafana | API |
| **@xala/docs-content** | Documentation content | ⚠️ Questionable | - | Docs site? |
| **@xala/platform** | Single env validation file | ❌ Problem | Zod | **NOT USED** |
| **@xala/ai** | Single AGENTS.md file | ❌ Problem | - | **NOT USED** |

### 1.2 Dependency Graph

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend Apps                          │
│          (web, minside, backoffice, saas-admin)             │
└────┬─────────┬──────────┬─────────┬────────────┬───────────┘
     │         │          │         │            │
     ▼         ▼          ▼         ▼            ▼
┌────────┐ ┌──────┐ ┌──────────┐ ┌─────┐  ┌──────────┐
│ @xala/ │ │ @di  │ │  @xala/  │ │@xala│  │  @xala/  │
│  auth  │ │gilist│ │    ds    │ │ i18n│  │ eslint   │
│        │ │/cli  │ │          │ │     │  │  config  │
│        │ │ent-  │ │          │ │     │  │          │
│        │ │ sdk  │ │          │ │     │  │          │
└────────┘ └──┬───┘ └────┬─────┘ └─────┘  └──────────┘
              │          │
              │          ▼
              │     ┌─────────┐
              │     │ @xala/  │
              │     │ds-themes│
              │     └─────────┘
              │
              ▼
      ┌───────────────┐
      │   @xala/      │
      │  contracts    │
      └───────────────┘
              │
              ▼
      ┌───────────────┐
      │   @xala/      │
      │   sdk-core    │ (Internal only)
      └───────────────┘
```

---

## 2. Identified Problems

### 2.1 **Critical Issues**

#### Problem 1: Orphaned `@xala/platform` Package ❌
- **Location:** `packages/platform/`
- **Contents:** Single file `src/env/validation.ts` (127 lines)
- **Purpose:** Environment variable validation with Zod
- **Usage:** **NOT IMPORTED ANYWHERE**
- **Impact:** Dead code, confusing for developers
- **Root Cause:** Created for centralization but never integrated

**Evidence:**
```bash
$ grep -r "@xala/platform" apps/
# No results - Not used anywhere
```

#### Problem 2: Orphaned `@xala/ai` Package ❌
- **Location:** `packages/ai/`
- **Contents:** Single file `AGENTS.md` (196 lines)
- **Purpose:** AI agent registry documentation
- **Usage:** **NOT REFERENCED ANYWHERE**
- **Impact:** Misleading - looks like code package but it's just docs
- **Root Cause:** Documentation placed in wrong location

**Evidence:**
```bash
$ ls packages/ai/
AGENTS.md  # Just a markdown file, no code
```

#### Problem 3: SDK Confusion ⚠️
- **Packages:** `@xala/sdk-core` + `@digilist/client-sdk`
- **Problem:** Two SDK packages with unclear relationship
- **Developer Confusion:**
  - "Should I import from sdk-core or client-sdk?"
  - "Why are there two SDK packages?"
  - "Is sdk-core deprecated?"
- **Reality:** 
  - `sdk-core` = Generic HTTP client (internal only)
  - `client-sdk` = Digilist-specific SDK (public API)
- **Impact:** Poor discoverability, mental overhead

**Evidence:**
```typescript
// apps NEVER import sdk-core directly
grep -r "from '@xala/sdk-core'" apps/
# 0 results

// Only client-sdk imports it internally
packages/client-sdk/package.json:
  "@xala/sdk-core": "workspace:*"
```

### 2.2 **Moderate Issues**

#### Problem 4: Design System Fragmentation ⚠️
- **Packages:** `@xala/ds`, `@xala/ds-themes`, `@xala/ds-registry`
- **Problem:** 3 separate packages for one design system
- **Developer Experience:**
  ```typescript
  import { Button } from '@xala/ds';
  import { theme } from '@xala/ds-themes';
  // Why not just @xala/ds?
  ```
- **Impact:** More imports, harder to discover features

#### Problem 5: Docs Content Package ⚠️
- **Location:** `packages/docs-content/`
- **Contents:** Markdown docs + loader
- **Problem:** Unclear if it's infrastructure or content
- **Better Location:** Should be in `/docs` or part of docs app

---

## 3. Reorganization Strategy (Zero Breaking Changes)

### Phase 1: Consolidate Dead Code (Immediate)

#### Action 1.1: Merge `@xala/platform` into relevant packages
**Current:**
```
packages/platform/
  └── src/env/validation.ts  (127 lines)
```

**Proposed:**
```
packages/contracts/
  └── src/
      └── validation/
          └── env-schemas.ts  (Move validation here)
```

**Rationale:**
- Contracts already exports shared types/schemas
- Environment validation IS a contract between apps and config
- Reduces package count from 14 → 13

**Migration Path (Zero Breaking):**
1. Copy `validation.ts` to `packages/contracts/src/validation/env-schemas.ts`
2. Add export to `packages/contracts/src/index.ts`:
   ```typescript
   export * from './validation/env-schemas';
   ```
3. Update package.json exports in contracts
4. **Keep `@xala/platform` as deprecated wrapper** (just re-exports) for 1 release
5. Add deprecation notice to README
6. Remove in next major version

**Timeline:** 1 day

---

#### Action 1.2: Move `@xala/ai` to documentation
**Current:**
```
packages/ai/
  └── AGENTS.md  (196 lines - just docs)
```

**Proposed:**
```
docs/development/
  └── AI-AGENTS-REGISTRY.md  (Moved from packages/ai/)
```

**Rationale:**
- It's documentation, not code
- Misleading to have package with no code
- Belongs with other development docs

**Migration Path:**
1. Move `packages/ai/AGENTS.md` → `docs/development/AI-AGENTS-REGISTRY.md`
2. Update any links in docs
3. Delete `packages/ai/` folder
4. Update `.gitignore` if needed

**Timeline:** 1 hour

---

### Phase 2: Clarify SDK Architecture (Short-term)

#### Action 2.1: Rename `@xala/sdk-core` to `@xala/http-client`
**Current Confusion:**
- "sdk-core" sounds like main SDK
- Developers try to import it directly
- Unclear relationship to client-sdk

**Proposed:**
```
packages/sdk-core/       →  packages/http-client/
@xala/sdk-core          →  @xala/http-client
```

**Rationale:**
- Name reflects actual purpose (HTTP client)
- Clear it's infrastructure, not main SDK
- Follows pattern: http-client → client-sdk → apps

**Migration Path (Zero Breaking):**
1. Rename folder: `packages/sdk-core` → `packages/http-client`
2. Update package.json:
   ```json
   {
     "name": "@xala/http-client",
     "exports": { /* same */ }
   }
   ```
3. Update `client-sdk/package.json`:
   ```json
   {
     "dependencies": {
       "@xala/http-client": "workspace:*"
     }
   }
   ```
4. **Keep `@xala/sdk-core` as alias** (re-export wrapper) for 1 release
5. Add deprecation notice
6. Remove in next major version

**Timeline:** 2 days

---

#### Action 2.2: Improve Documentation
Create README in each SDK package explaining architecture:

**packages/http-client/README.md:**
```markdown
# @xala/http-client

**Internal Infrastructure Package**

Generic, reusable HTTP client with RFC 7807 error handling, retry logic, and query key factory.

## ⚠️ For Internal Use Only

This package is used by `@digilist/client-sdk`. **Apps should NOT import this directly.**

Use `@digilist/client-sdk` instead for all API interactions.
```

**packages/client-sdk/README.md:**
```markdown
# @digilist/client-sdk

**Official Digilist API Client**

Type-safe SDK for the Digilist API with 24 services, WebSocket realtime, and React Query hooks.

## ✅ Use This Package

All apps should import from here:
- ✅ `import { useBookings } from '@digilist/client-sdk/hooks'`
- ✅ `import { bookingService } from '@digilist/client-sdk/services'`

## ❌ Don't Use

- ❌ `@xala/http-client` (internal only)
- ❌ Direct fetch calls
```

**Timeline:** 1 day

---

### Phase 3: Design System Consolidation (Medium-term)

#### Option A: Keep Separate (Recommended)
**Rationale:**
- Each package has distinct purpose
- `ds-themes`: Tokens only (can be used standalone)
- `ds-registry`: Documentation only (optional)
- `ds`: Components (depends on themes)
- Separation allows selective imports

**No Action Required** ✅

#### Option B: Merge into Monolithic Package
**Not Recommended:**
- Would increase bundle size
- Lose granular imports
- Themes are from `@digdir/designsystemet` - should stay separate

---

### Phase 4: Docs Content Package (Medium-term)

#### Action 4.1: Move to `/docs` or integrate into docs app
**Current:**
```
packages/docs-content/
  ├── content/docs/
  │   ├── api/nb/
  │   ├── booking/
  │   ├── faq/nb/
  │   └── rbac/nb/
  └── src/
      ├── index.ts
      ├── loader.ts
      └── types.ts
```

**Proposed Option 1: Move to /docs** (Recommended)
```
docs/
  ├── user-guides/
  │   ├── api/
  │   ├── booking/
  │   └── faq/
  └── i18n/
      └── nb/ (Norwegian translations)
```

**Proposed Option 2: Keep as Package** (If used by docs site)
- Rename to `@xala/docs-content` (consistent naming)
- Add clear README explaining purpose
- Document how it's consumed

**Decision Needed:** Check if docs site imports this package

**Timeline:** 2 days (investigation + migration)

---

## 4. Final Package Structure

### 4.1 After Phase 1 & 2 (Recommended Immediate Actions)

```
packages/
├── auth/                   ✅ Authentication system
├── client-sdk/            ✅ Main API SDK (public)
├── http-client/           ✅ HTTP infrastructure (internal) [renamed from sdk-core]
├── contracts/             ✅ API contracts + env validation [absorbed platform]
├── database-schema/       ✅ Drizzle ORM schema
├── ds/                    ✅ Design system components
├── ds-themes/             ✅ Design tokens
├── ds-registry/           ✅ Component docs
├── eslint-config/         ✅ Linting rules
├── i18n/                  ✅ Internationalization
├── observability/         ✅ Monitoring stack
└── docs-content/          ⚠️ To be evaluated

docs/
└── development/
    └── AI-AGENTS-REGISTRY.md  ✅ [moved from packages/ai/]
```

**Package Count:** 14 → 12 (-2 packages)

### 4.2 Clear Separation of Concerns

| Layer | Packages | Purpose |
|-------|----------|---------|
| **Infrastructure** | http-client, contracts, database-schema, eslint-config | Core utilities |
| **Frontend SDK** | client-sdk, auth, i18n | App-facing APIs |
| **UI Components** | ds, ds-themes, ds-registry | Design system |
| **Observability** | observability | Monitoring |
| **Documentation** | docs/ (not packages/) | Guides & specs |

---

## 5. Migration Timeline

### Immediate (Week 1)
- [ ] **Day 1:** Move `packages/ai/AGENTS.md` → `docs/development/AI-AGENTS-REGISTRY.md`
- [ ] **Day 1:** Merge `packages/platform/` into `@xala/contracts`
- [ ] **Day 2-3:** Rename `@xala/sdk-core` → `@xala/http-client`
- [ ] **Day 3:** Add deprecation wrapper for `@xala/sdk-core`
- [ ] **Day 4:** Update all README files with architecture explanations
- [ ] **Day 5:** Create migration guide for package name changes

### Short-term (Week 2)
- [ ] **Day 6-7:** Evaluate `docs-content` package usage
- [ ] **Day 8-10:** Migrate docs-content if needed
- [ ] **Day 10:** Update CLAUDE.md and AGENTS.md files across packages

### Medium-term (Month 1)
- [ ] Release with deprecation warnings
- [ ] Monitor usage and fix any issues
- [ ] Communicate changes to team

### Long-term (Next Major Version)
- [ ] Remove deprecated `@xala/sdk-core` alias
- [ ] Remove deprecated `@xala/platform` alias
- [ ] Clean up any remaining references

---

## 6. Risk Assessment

### Risks & Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Breaking existing imports | Low | High | Use re-export wrappers for 1 release |
| Developer confusion during migration | Medium | Medium | Clear migration guide + Slack announcements |
| Build system errors | Low | Medium | Test in CI before merging |
| Forgotten references | Low | Medium | Use `grep -r` to find all imports |

### Validation Checklist

Before each phase:
- [ ] Run `pnpm build` across all packages
- [ ] Run `pnpm test` across all packages
- [ ] Run `pnpm lint` across all packages
- [ ] Grep for old package names: `grep -r "@xala/platform" .`
- [ ] Check no broken imports in apps
- [ ] Test in development mode
- [ ] Update documentation

---

## 7. Benefits Summary

### Developer Experience
- ✅ **Clearer package purpose** - No confusion about sdk-core vs client-sdk
- ✅ **Fewer packages** - 14 → 12 (easier to navigate)
- ✅ **Better discoverability** - Correct naming helps IDEs suggest right imports
- ✅ **Documentation in right place** - AI agents doc in /docs, not /packages

### Maintainability
- ✅ **Less dead code** - Remove unused platform package
- ✅ **Logical grouping** - Related code stays together
- ✅ **Clear boundaries** - Infrastructure vs. SDK vs. UI

### SOLID Principles
- ✅ **Single Responsibility** - Each package has ONE clear purpose
- ✅ **Open/Closed** - Packages extensible without modification
- ✅ **Dependency Inversion** - Apps depend on abstractions (client-sdk), not implementations (http-client)

---

## 8. Decision Matrix

### Action Items by Priority

| Action | Priority | Effort | Impact | Breaking? | Recommend? |
|--------|----------|--------|--------|-----------|------------|
| Move ai/AGENTS.md to docs/ | **High** | 1 hour | Low | ❌ No | ✅ **YES** |
| Merge platform into contracts | **High** | 1 day | Medium | ❌ No | ✅ **YES** |
| Rename sdk-core → http-client | **Medium** | 2 days | High | ❌ No | ✅ **YES** |
| Improve SDK documentation | **High** | 1 day | High | ❌ No | ✅ **YES** |
| Evaluate docs-content | **Medium** | 2 days | Low | ❌ No | ⚠️ **INVESTIGATE** |
| Merge DS packages | **Low** | 5 days | Medium | ✅ Yes | ❌ **NO** |

---

## 9. Implementation Commands

### Phase 1: AI Package Migration

```bash
# Move AGENTS.md to docs
git mv packages/ai/AGENTS.md docs/development/AI-AGENTS-REGISTRY.md

# Remove empty folder
rmdir packages/ai

# Update any links in docs
grep -r "packages/ai/AGENTS.md" docs/ | # Find references
  xargs sed -i 's|packages/ai/AGENTS.md|docs/development/AI-AGENTS-REGISTRY.md|g'

# Commit
git add -A
git commit -m "docs: move AI agents registry from packages to docs

- Moved packages/ai/AGENTS.md → docs/development/AI-AGENTS-REGISTRY.md
- Removed packages/ai/ folder (no code, just docs)
- Updated references in documentation"
```

### Phase 1: Platform Package Migration

```bash
# Copy env validation to contracts
mkdir -p packages/contracts/src/validation
cp packages/platform/src/env/validation.ts packages/contracts/src/validation/env-schemas.ts

# Add export to contracts
echo "export * from './validation/env-schemas';" >> packages/contracts/src/index.ts

# Create deprecation wrapper in platform
cat > packages/platform/src/index.ts << 'EOF'
/**
 * @deprecated
 * @xala/platform has been merged into @xala/contracts
 * Import from '@xala/contracts' instead
 * 
 * This package will be removed in v2.0.0
 */
export * from '@xala/contracts/validation/env-schemas';
EOF

# Update package.json in platform
# (Add deprecation notice, mark as deprecated)

# Commit
git add -A
git commit -m "refactor(platform): deprecate @xala/platform, merge into @xala/contracts

BREAKING: None (backward compatible)

- Moved env validation to @xala/contracts/validation/env-schemas
- @xala/platform now re-exports from contracts (deprecated wrapper)
- Will be removed in v2.0.0
- No breaking changes for existing code"
```

### Phase 2: SDK Rename

```bash
# Rename folder
git mv packages/sdk-core packages/http-client

# Update package.json
cd packages/http-client
sed -i 's/"@xala\/sdk-core"/"@xala\/http-client"/g' package.json

# Update client-sdk dependency
cd ../client-sdk
sed -i 's/"@xala\/sdk-core"/"@xala\/http-client"/g' package.json

# Run build and test
pnpm build
pnpm test

# Commit
git add -A
git commit -m "refactor(sdk): rename @xala/sdk-core → @xala/http-client

BREAKING: None (will add deprecation wrapper)

- Renamed package to better reflect purpose (HTTP client infrastructure)
- Updated internal dependencies
- No breaking changes - adding deprecated wrapper in next commit"
```

---

## 10. Communication Plan

### Team Announcement (Slack)

```markdown
📦 **Package Reorganization - Zero Breaking Changes**

We're improving our package structure for better maintainability! 

**Changes:**
✅ `packages/ai/` moved to `docs/development/AI-AGENTS-REGISTRY.md`
✅ `@xala/platform` merged into `@xala/contracts` (deprecated wrapper provided)
✅ `@xala/sdk-core` renamed to `@xala/http-client` (deprecated wrapper provided)

**Action Required:**
- ❌ **NONE** - All changes are backward compatible
- Update imports when convenient (deprecation warnings will guide you)
- Old package names will be removed in v2.0.0 (future major version)

**Questions?** Check the migration guide: docs/PACKAGES_REORGANIZATION_ANALYSIS.md
```

---

## 11. Success Metrics

### Quantitative
- ✅ Package count reduced: 14 → 12 (-14%)
- ✅ Zero breaking changes in current release
- ✅ 100% backward compatibility with wrappers
- ✅ Build time unchanged (no new dependencies)

### Qualitative
- ✅ Clearer package naming (sdk-core → http-client)
- ✅ Better documentation structure (AI docs in /docs)
- ✅ Improved developer onboarding (less confusion)
- ✅ SOLID principles maintained

---

## 12. Conclusion

This reorganization plan achieves your goals of:
1. ✅ **No breaking changes** - Deprecated wrappers ensure compatibility
2. ✅ **Better structure** - Logical grouping and naming
3. ✅ **No duplication** - Dead code removed
4. ✅ **SOLID principles** - Clear responsibilities
5. ✅ **Separation of concerns** - Proper layering

### Recommended Actions (Prioritized)

**Immediate (Do This Week):**
1. ✅ Move `packages/ai/AGENTS.md` → `docs/development/` (1 hour)
2. ✅ Merge `@xala/platform` into `@xala/contracts` with deprecation wrapper (1 day)
3. ✅ Improve SDK documentation (README files) (1 day)

**Short-term (Next 2 Weeks):**
4. ✅ Rename `@xala/sdk-core` → `@xala/http-client` with wrapper (2 days)
5. ⚠️ Investigate `docs-content` package usage (2 days)

**Long-term (Next Major Version):**
6. Remove deprecated wrappers
7. Clean up any remaining references

---

**Questions or concerns?** Review this analysis and approve phase-by-phase implementation.

**Ready to proceed?** Start with Phase 1 (AI + Platform migration) - lowest risk, highest clarity gain.
