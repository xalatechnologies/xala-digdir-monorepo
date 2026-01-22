# Entitlements & Feature Flags System - Current State Analysis

**Date:** 2026-01-18  
**Analyst:** Cascade AI  
**Purpose:** Analyze existing architecture before implementing comprehensive entitlements system

---

## Executive Summary

The Digilist/Xala platform **already has significant entitlements infrastructure** in place. Before implementing the master prompt requirements, we need to understand what exists, what works, and what gaps remain.

### Key Finding: You Have 3 Overlapping Systems

1. **Feature Flags System** (`feature-flags.service.ts`) - Tenant/org-level boolean toggles
2. **Module System** (`modules.ts` schema) - Module-based feature control with audit
3. **RBAC System** (`rbac.ts`) - Role-based access control with permission matrix

**Critical Decision Required:** Should we consolidate these into one unified system, or extend what exists?

---

## 1. Existing Database Schema Analysis

### ✅ **Already Implemented Tables**

#### A) Feature Flags (SaaS Schema)
```typescript
// Location: apps/api/src/database/schema/index.ts:283-330

✅ featureFlagsCatalog
   - id, key, name, description, type, defaultValue
   - category, status, metadata
   - Indexed by: key, category, status

✅ tenantFeatureFlags
   - tenantId, featureFlagId, value, enabled, reason
   - createdBy, timestamps
   - Unique constraint: (tenantId, featureFlagId)

✅ orgFeatureFlags
   - organizationId, featureFlagId, value, enabled, reason
   - createdBy, timestamps
   - Unique constraint: (organizationId, featureFlagId)
```

**Resolution Hierarchy:**
1. Organization-level override (most specific)
2. Tenant-level override
3. Catalog default value

**Evaluation Logic:** `apps/api/src/modules/feature-flags/feature-flags.service.ts`

#### B) Module System (Platform Schema)
```typescript
// Location: apps/api/src/database/schema/modules.ts

✅ modules
   - key (PK), name (i18n), description (i18n)
   - category, dependencies, capabilities
   - isCore, defaultEnabled

✅ tenantModules
   - tenantId, moduleKey, isEnabled, config
   - updatedAt, updatedBy
   - PK: (tenantId, moduleKey)

✅ orgModules
   - tenantId, orgId, moduleKey, isEnabled, config
   - updatedAt, updatedBy
   - PK: (orgId, moduleKey)

✅ moduleAudit
   - Full audit trail: action, oldState, newState, reason
   - Indexed by: tenant, module, actor, timestamp
```

**Key Features:**
- Module dependencies tracking
- Capability mapping
- Core vs optional modules
- Full audit trail (already implemented!)

#### C) Plans & Subscriptions (SaaS Schema)
```typescript
// Location: apps/api/src/database/schema/index.ts:210-279

✅ plans
   - id, name, slug, description
   - tier, pricing, features, limits
   - displayOrder, status

✅ subscriptions
   - tenantId, planId, status
   - currentPeriodStart/End
   - canceledAt, trialEnd

✅ categoryEntitlements
   - tenantId, organizationId, categoryKey
   - isEnabled, reason
   - Controls rental object category access
```

#### D) RBAC System
```typescript
// Location: apps/api/src/modules/auth/rbac.ts

✅ Role Hierarchy:
   - SaaS Roles: SAAS_SUPER_ADMIN, SAAS_BILLING_ADMIN, SAAS_SUPPORT_AGENT
   - Tenant Roles: TENANT_ADMIN, TENANT_BILLING_ADMIN, TENANT_TECH_ADMIN
   - Commune Roles: admin, saksbehandler
   - Org Roles: org_admin, org_saksbehandler, org_member
   - Base: user

✅ Permission Matrix:
   - Resources: saas:*, tenant:*, commune:*, org:*, user:*
   - Actions: create, read, update, delete, manage (*)
```

### ❌ **Missing Tables (From Master Prompt)**

```typescript
// These DO NOT exist yet:

❌ route_policies
   - app, routeKey, requiredRoles[], requiredModules[], requiredFeatures[]
   - isPublic

❌ nav_policies
   - app, navItemKey, routeKey, requiredRoles[], requiredModules[], requiredFeatures[]
   - labelKey (i18n), iconKey, parentKey, order

❌ global_kill_switches
   - keyType, key, enabled, reason, environment
   - Emergency disable for modules/features/integrations

❌ integration_configs
   - tenantId, integrationKey, configJson, status
   - lastValidatedAt, validationError

❌ plan_entitlements
   - planId, keyType, key, defaultEnabled
   - Links plans to modules/features/integrations

❌ tenant_entitlement_overrides
   - tenantId, keyType, key, enabled, reason
   - Unified override system

❌ entitlement_audit_log
   - Separate audit for entitlement changes
   - (Note: moduleAudit exists but is module-specific)
```

---

## 2. Existing Service Layer Analysis

### ✅ **Feature Flags Service**

**Location:** `apps/api/src/modules/feature-flags/feature-flags.service.ts`

**What It Does:**
- ✅ Evaluates flags with tenant/org hierarchy
- ✅ Caching with TTL (1 hour for catalog)
- ✅ Bulk updates
- ✅ Audit logging via `getAuditService()`
- ✅ Projection format: `FeatureFlagsProjection`

**What It Doesn't Do:**
- ❌ Route-level enforcement
- ❌ Navigation item computation
- ❌ Integration status tracking
- ❌ Plan-based defaults
- ❌ Kill switches
- ❌ Action-level policies

**Key Methods:**
```typescript
getCatalog(): Promise<FeatureFlagCatalog[]>
evaluateForContext(ctx: FlagEvaluationContext): Promise<FeatureFlagsProjection>
setTenantFlag(tenantId, flagKey, input): Promise<void>
setOrgFlag(orgId, flagKey, input): Promise<void>
```

### ✅ **RBAC Middleware**

**Location:** `apps/api/src/core/middleware/rbac.middleware.ts`

**What It Does:**
- ✅ Role-based route protection
- ✅ Permission checks: `requireRole()`, `requirePermission()`
- ✅ Tenant isolation enforcement

**What It Doesn't Do:**
- ❌ Feature flag integration
- ❌ Module-based gating
- ❌ Dynamic route policies from DB

---

## 3. Frontend Integration Analysis

### ✅ **Backoffice App**

**Location:** `apps/backoffice/src/components/layout/Sidebar.tsx`

**Current Navigation System:**
```typescript
interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
  roles?: EffectiveBackofficeRole[];  // ⚠️ Deprecated
  capability?: Capability;             // ✅ Current approach
  capabilities?: Capability[];         // ✅ OR logic
}
```

**Key Observations:**
- ✅ Uses `useCapabilityContext()` for capability checks
- ✅ Role-based visibility (being deprecated in favor of capabilities)
- ✅ i18n for labels (via `useT()`)
- ❌ No feature flag integration
- ❌ No module-based gating
- ❌ Hardcoded navigation structure (not from API)

**Capability System:**
```typescript
// Location: apps/backoffice/src/lib/capabilities.ts
type Capability = 
  | 'view:dashboard'
  | 'manage:bookings'
  | 'manage:listings'
  | 'manage:users'
  | 'manage:organizations'
  | 'view:reports'
  | 'manage:integrations'
  | 'view:audit'
  // ... etc
```

### ✅ **Client SDK**

**Location:** `packages/client-sdk/src/`

**Structure:**
```
hooks/          - React hooks for data fetching
services/       - API service classes
dal/            - Data Access Layer (TanStack Query)
providers/      - Context providers
localization/   - i18n utilities
```

**What Exists:**
- ✅ `useAuth()` - Authentication context
- ✅ Service classes for each domain (bookings, listings, users, etc.)
- ✅ TanStack Query integration
- ❌ No `useEntitlements()` hook
- ❌ No `canRoute()` / `canFeature()` utilities
- ❌ No navigation computation from API

---

## 4. Gap Analysis

### Critical Gaps

| Requirement | Status | Gap Description |
|-------------|--------|-----------------|
| **Route Policies** | ❌ Missing | No DB-driven route access control |
| **Nav Policies** | ❌ Missing | Navigation hardcoded in frontends |
| **Integration Configs** | ❌ Missing | No integration status tracking |
| **Kill Switches** | ❌ Missing | No emergency disable mechanism |
| **Plan Entitlements** | ❌ Missing | Plans don't define default modules/features |
| **Unified Evaluation** | ❌ Missing | No single `GET /me/entitlements` endpoint |
| **SDK Hooks** | ❌ Missing | No `useEntitlements()`, `canRoute()`, etc. |
| **UI Enforcement** | ⚠️ Partial | Capability-based but not feature-flag aware |

### What Works Well

| Component | Status | Notes |
|-----------|--------|-------|
| **Feature Flags** | ✅ Good | Solid evaluation logic, caching, audit |
| **Module System** | ✅ Good | Dependencies, audit trail, i18n names |
| **RBAC** | ✅ Good | Clear role hierarchy, permission matrix |
| **Audit Logging** | ✅ Good | `moduleAudit` table is comprehensive |
| **Capability System** | ✅ Good | Frontend uses capabilities over roles |

---

## 5. Architecture Recommendations

### Option A: **Extend Existing Systems** (Recommended)

**Rationale:** You already have 80% of the infrastructure. Don't rebuild.

**Approach:**
1. **Keep** `featureFlagsCatalog`, `tenantFeatureFlags`, `orgFeatureFlags` as-is
2. **Keep** `modules`, `tenantModules`, `orgModules`, `moduleAudit` as-is
3. **Add** missing tables: `route_policies`, `nav_policies`, `integration_configs`, `global_kill_switches`
4. **Create** unified evaluation engine that combines:
   - Feature flags (boolean toggles)
   - Modules (capability groups)
   - RBAC (role permissions)
   - Plan limits
5. **Expose** via `GET /me/entitlements` endpoint
6. **Build** SDK hooks that consume this endpoint

**Benefits:**
- ✅ Preserves existing data
- ✅ Minimal migration risk
- ✅ Leverages proven patterns
- ✅ Incremental rollout possible

**Drawbacks:**
- ⚠️ Three overlapping concepts (flags, modules, capabilities)
- ⚠️ Requires clear documentation on when to use what

### Option B: **Consolidate into Single System**

**Rationale:** Simplify by merging flags + modules + capabilities into one taxonomy.

**Approach:**
1. **Deprecate** `featureFlagsCatalog` → migrate to unified `entitlements_catalog`
2. **Deprecate** `modules` → migrate to `entitlements_catalog` with type='module'
3. **Create** single evaluation engine
4. **Migrate** existing data

**Benefits:**
- ✅ Single source of truth
- ✅ Simpler mental model
- ✅ Easier to explain to developers

**Drawbacks:**
- ❌ High migration risk
- ❌ Breaks existing code
- ❌ Requires coordinated deployment
- ❌ Data migration complexity

---

## 6. Proposed Implementation Plan (Option A)

### Phase 1: Add Missing Infrastructure (Week 1)
1. Create new schema tables:
   - `route_policies`
   - `nav_policies`
   - `integration_configs`
   - `global_kill_switches`
   - `plan_entitlements`
2. Generate Drizzle migration
3. Seed baseline data

### Phase 2: Unified Evaluation Engine (Week 1-2)
1. Create `EntitlementsService` that orchestrates:
   - `FeatureFlagsService` (existing)
   - Module resolution (new)
   - RBAC checks (existing)
   - Plan limits (new)
   - Kill switches (new)
2. Implement precedence rules:
   - Kill switch > Tenant override > Plan default > Global default
3. Add caching with ETag support

### Phase 3: API Endpoint (Week 2)
1. `GET /api/me/entitlements`
   - Returns `EffectiveEntitlements` DTO
   - ETag/If-None-Match caching
   - Short TTL (5 minutes)
2. Middleware for route enforcement
3. Audit logging for all changes

### Phase 4: SDK Integration (Week 2-3)
1. Add hooks:
   - `useEntitlements()`
   - `canRoute(routeKey)`
   - `canFeature(featureKey)`
   - `navItems(app)`
2. Update existing hooks to check entitlements
3. Add TypeScript contracts

### Phase 5: UI Integration (Week 3-4)
1. Backoffice: Replace hardcoded nav with `navItems('backoffice')`
2. Minside: Same for `navItems('minside')`
3. Add route guards using `canRoute()`
4. Feature gating using `canFeature()`

### Phase 6: Testing & Documentation (Week 4)
1. Unit tests for evaluation engine
2. Integration tests for API
3. E2E tests for each app
4. Contract tests for DTO
5. Documentation: entitlements matrix, CI gates

---

## 7. Critical Questions for User

Before proceeding, we need decisions on:

### Q1: **Consolidate or Extend?**
- **Option A:** Keep existing systems, add missing pieces (lower risk)
- **Option B:** Consolidate into single system (cleaner but riskier)

### Q2: **Module vs Feature Flag Semantics?**
Current state has both:
- **Modules:** Groups of capabilities (e.g., "BOOKING" module includes booking.create, booking.approve)
- **Feature Flags:** Boolean toggles (e.g., "BOOKING_RECURRING" = true/false)

Should we:
- Keep both (modules = capability groups, flags = fine-grained toggles)?
- Merge into single taxonomy?

### Q3: **Navigation Source of Truth?**
- **Option A:** Frontends fetch nav structure from API (`GET /nav-policies?app=backoffice`)
- **Option B:** Frontends define nav structure, API only returns visibility/enabled state

### Q4: **Integration Config Validation?**
Who validates integration configs?
- **Option A:** API validates on save (synchronous)
- **Option B:** Background job validates periodically (async)
- **Option C:** Lazy validation on first use

### Q5: **Kill Switch Scope?**
- **Global only** (affects all tenants)?
- **Per-environment** (dev/staging/prod)?
- **Per-tenant** (tenant-specific emergency disable)?

---

## 8. Immediate Next Steps

**Awaiting User Input:**
1. Choose Option A (extend) or Option B (consolidate)
2. Answer Q2-Q5 above
3. Confirm implementation timeline expectations

**Once Decided:**
1. Create detailed schema design document
2. Generate Drizzle migrations
3. Implement evaluation engine with tests
4. Build API endpoint
5. Create SDK hooks
6. Integrate into frontends

---

## Appendix: File Inventory

### Database Schema
- ✅ `apps/api/src/database/schema/index.ts` - Main schema (tenants, users, plans, feature flags)
- ✅ `apps/api/src/database/schema/modules.ts` - Module system
- ✅ `apps/api/src/database/schema/policy.ts` - (Need to check contents)
- ❌ `apps/api/src/database/schema/entitlements.ts` - **DOES NOT EXIST** (created by me, not committed)

### Services
- ✅ `apps/api/src/modules/feature-flags/feature-flags.service.ts` - Feature flag evaluation
- ✅ `apps/api/src/modules/auth/rbac.ts` - RBAC definitions
- ✅ `apps/api/src/core/middleware/rbac.middleware.ts` - RBAC enforcement
- ❌ `apps/api/src/modules/entitlements/` - **ONLY HAS types.ts** (created by me)

### Frontend
- ✅ `apps/backoffice/src/components/layout/Sidebar.tsx` - Navigation with capability checks
- ✅ `apps/backoffice/src/lib/capabilities.ts` - Capability definitions
- ✅ `apps/backoffice/src/providers/CapabilityProvider.tsx` - Capability context
- ❌ `packages/client-sdk/src/hooks/useEntitlements.ts` - **DOES NOT EXIST**

### Seed Data
- ✅ `apps/api/db/seed-data-bank/` - Unified seed system (just implemented)
- ❌ No seed data for feature flags, modules, or entitlements yet

---

**Status:** Analysis complete. Awaiting user decisions before implementation.
