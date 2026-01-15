# RBAC Implementation Status Analysis

**Analysis Date:** 2026-01-15
**Analyzed By:** Claude Code Agent
**Scope:** Role-Based Access Control implementation for Digilist/Xala Platform

---

## Executive Summary

The current RBAC implementation covers **3 of 7 required roles** (43% coverage). The existing system provides a basic permission matrix but lacks critical enterprise features including tenant hierarchy, organization-scoped access, and super admin capabilities.

| Metric | Current | Required | Gap |
|--------|---------|----------|-----|
| Roles Defined | 3 | 7 | 4 missing |
| Permission Matrix | Basic | Hierarchical | Needs hierarchy |
| Tenant Isolation | Partial | Full | Needs enforcement |
| Organization Scope | Missing | Required | Critical gap |
| Route Guards | None | Required | Critical gap |

---

## Required Role Model (7 Roles)

As defined in `spec.md`, the platform requires these roles:

| # | Role | App Access | API Scope | Priority |
|---|------|------------|-----------|----------|
| 1 | **Public** | web | `/api/public/*` only | P0 |
| 2 | **Authenticated User** | web, minside | User-scoped endpoints | P0 |
| 3 | **Organization User** | web, minside | Org-scoped endpoints | P1 |
| 4 | **Case Handler (Saksbehandler)** | backoffice | Case management endpoints | P0 |
| 5 | **Admin** | backoffice | Tenant-admin endpoints | P0 |
| 6 | **Tenant Admin** | backoffice | Full tenant scope | P1 |
| 7 | **Super Admin** | backoffice | All endpoints | P2 |

---

## Current Implementation Analysis

### File Locations

| File | Purpose |
|------|---------|
| `apps/api/src/modules/authz/authz.controller.ts` | Permission matrix & check endpoints |
| `apps/api/src/modules/auth/auth.controller.ts` | Role-based permission helper |
| `apps/api/src/schemas/user.schema.ts` | User role Zod schema (different roles!) |
| `apps/api/src/database/schema/index.ts` | User table with role column |
| `apps/api/src/core/policy/policy-debug.ts` | Policy evaluation debugging |

### Roles Implemented in PERMISSION_MATRIX

**Location:** `apps/api/src/modules/authz/authz.controller.ts:17-57`

```typescript
const PERMISSION_MATRIX: Record<string, Record<string, string[]>> = {
  admin: { ... },       // ✅ Implemented
  saksbehandler: { ... },  // ✅ Implemented (Norwegian for Case Handler)
  user: { ... },        // ✅ Implemented
};
```

### Roles Defined in User Schema (CONFLICT!)

**Location:** `apps/api/src/schemas/user.schema.ts:10`

```typescript
export const UserRoleSchema = z.enum([
  'owner',        // ❓ Not in PERMISSION_MATRIX
  'tenant_admin', // ❓ Not in PERMISSION_MATRIX
  'org_admin',    // ❓ Not in PERMISSION_MATRIX
  'manager',      // ❓ Not in PERMISSION_MATRIX
  'member',       // ❓ Not in PERMISSION_MATRIX
  'viewer'        // ❓ Not in PERMISSION_MATRIX
]);
```

**CRITICAL:** There is a mismatch between:
- Schema roles: `owner, tenant_admin, org_admin, manager, member, viewer`
- PERMISSION_MATRIX roles: `admin, saksbehandler, user`

This means the database can store roles that have no permission mapping!

---

## Role-by-Role Gap Analysis

### 1. Public (Anonymous)

| Aspect | Status | Details |
|--------|--------|---------|
| **Implementation** | 🟡 PARTIAL | Public endpoints exist but no explicit role |
| **API Routes** | ✅ EXISTS | `/api/public/*` routes available |
| **Permission Matrix** | ❌ MISSING | Not defined in PERMISSION_MATRIX |
| **Verification** | `apps/api/src/modules/public/public.controller.ts` |

**Available Public Endpoints:**
- `GET /api/public/listings` - List published listings
- `GET /api/public/listings/:id` - Listing details
- `GET /api/public/listings/:id/availability` - Check availability
- `GET /api/public/categories` - List categories
- `GET /api/public/cities` - List cities with listings
- `GET /api/public/featured` - Featured listings

**Gap:** No explicit "public" role in permission matrix. Relies on controller-level access control.

### 2. Authenticated User

| Aspect | Status | Details |
|--------|--------|---------|
| **Implementation** | 🟡 PARTIAL | Basic "user" role exists |
| **Permissions** | ✅ DEFINED | `listings:read`, `bookings:create,read`, `messages:read,write` |
| **User Scoping** | ❌ MISSING | No enforcement of "own resources only" |
| **Verification** | `PERMISSION_MATRIX.user` |

**Current Permissions (`user` role):**
```typescript
user: {
  dashboard: [],
  listings: ['read'],
  bookings: ['create', 'read'],  // Should be scoped to OWN bookings
  users: [],
  organizations: [],
  reports: [],
  settings: [],
  calendar: ['read'],
  messages: ['read', 'write'],
  'seasonal-leases': [],
  audit: [],
}
```

**Gaps:**
- No user-scoping (can potentially read ALL bookings, not just own)
- No profile management permissions
- No "own data" qualifier in permission model

### 3. Organization User

| Aspect | Status | Details |
|--------|--------|---------|
| **Implementation** | ❌ MISSING | No organization-scoped role |
| **Permission Matrix** | ❌ MISSING | Not defined |
| **Schema** | 🟡 EXISTS | `org_admin` in schema, not in matrix |
| **Scoping** | ❌ MISSING | No org-level data isolation |

**Required Capabilities:**
- Manage listings for their organization
- View bookings for org's listings
- Manage org members

**Gap:** Complete role missing. The schema has `org_admin` but it's not mapped to any permissions.

### 4. Case Handler (Saksbehandler)

| Aspect | Status | Details |
|--------|--------|---------|
| **Implementation** | ✅ EXISTS | `saksbehandler` role defined |
| **Permissions** | ✅ DEFINED | Comprehensive permissions |
| **App Access** | ✅ BACKOFFICE | Correct app assignment |

**Current Permissions:**
```typescript
saksbehandler: {
  dashboard: ['read'],
  listings: ['create', 'read', 'update', 'publish', 'archive'],
  bookings: ['create', 'read', 'update', 'confirm', 'cancel'],
  users: [],  // ⚠️ Cannot manage requesters
  organizations: ['read'],
  reports: ['read'],
  settings: [],
  calendar: ['read', 'write', 'block'],
  messages: ['read', 'write', 'resolve'],
  'seasonal-leases': ['create', 'read', 'update'],
  audit: [],  // ⚠️ Cannot view audit trail
}
```

**Gaps:**
- Cannot delete bookings (intentional?)
- No audit log access (may need for case documentation)
- No user read access (cannot view requester details)

### 5. Admin

| Aspect | Status | Details |
|--------|--------|---------|
| **Implementation** | ✅ EXISTS | `admin` role defined |
| **Permissions** | ✅ COMPREHENSIVE | Full tenant-level access |
| **Scope Enforcement** | ❌ MISSING | No tenant boundary enforcement |

**Current Permissions:**
```typescript
admin: {
  dashboard: ['read', 'write'],
  listings: ['create', 'read', 'update', 'delete', 'publish', 'archive'],
  bookings: ['create', 'read', 'update', 'delete', 'confirm', 'cancel'],
  users: ['create', 'read', 'update', 'delete', 'deactivate', 'reactivate'],
  organizations: ['create', 'read', 'update', 'delete', 'verify'],
  reports: ['read', 'export'],
  settings: ['read', 'write'],
  calendar: ['read', 'write', 'block'],
  messages: ['read', 'write', 'resolve'],
  'seasonal-leases': ['create', 'read', 'update', 'delete', 'terminate'],
  audit: ['read'],
}
```

**Gaps:**
- No distinction from Tenant Admin
- No tenant configuration access
- Billing/subscription access not defined

### 6. Tenant Admin

| Aspect | Status | Details |
|--------|--------|---------|
| **Implementation** | ❌ MISSING | Not in PERMISSION_MATRIX |
| **Schema** | 🟡 EXISTS | `tenant_admin` in UserRoleSchema |
| **Configuration** | ❌ MISSING | No tenant settings permissions |

**Required Capabilities:**
- All Admin permissions
- Tenant configuration
- Billing/subscription management
- White-label settings
- Integration management
- API key management

### 7. Super Admin

| Aspect | Status | Details |
|--------|--------|---------|
| **Implementation** | ❌ MISSING | Not in PERMISSION_MATRIX |
| **Cross-Tenant** | ❌ MISSING | No cross-tenant access model |
| **Platform Ops** | ❌ MISSING | No platform-level permissions |

**Required Capabilities:**
- Cross-tenant access
- Platform monitoring
- Tenant provisioning
- Global configuration
- Support impersonation

---

## Missing Infrastructure

### 1. Route-Level Guards

**Status:** ❌ MISSING

No middleware enforcing permissions at route level. Current implementation:
- Endpoints check permissions manually (inconsistent)
- No decorator-based guards like `@RequirePermission('bookings:create')`
- Policy debug exists but not integrated

**Required:**
```typescript
// Example of what's needed
@Get('/bookings')
@RequirePermission('bookings:read')
@TenantScoped()
async listBookings() { ... }
```

### 2. Tenant Isolation Middleware

**Status:** ❌ MISSING

No middleware enforcing tenant boundaries. Database schema has `tenantId` but:
- No automatic tenant filtering
- No cross-tenant access prevention
- No tenant context propagation

### 3. Organization Scoping

**Status:** ❌ MISSING

- Organizations exist in schema
- No org-level permission checking
- No org membership enforcement

### 4. Resource Ownership Validation

**Status:** ❌ MISSING

- No "own resource" validation
- User can potentially access other users' data
- No ownership decorator/middleware

### 5. Hierarchical Permission Resolution

**Status:** ❌ MISSING

Current: Flat lookup `PERMISSION_MATRIX[role]`
Required: Hierarchy where Tenant Admin > Admin > Saksbehandler > User

---

## Recommendations

### Priority 0 (Critical - Before Production)

1. **Unify Role Definitions**
   - Align `UserRoleSchema` with `PERMISSION_MATRIX`
   - Choose one canonical role set
   - Database migration for existing users

2. **Implement Route Guards**
   - Create `@RequirePermission()` decorator
   - Create `@RequireRole()` decorator
   - Apply to all protected endpoints

3. **Add Tenant Isolation Middleware**
   - Inject `tenantId` into all queries
   - Prevent cross-tenant data access

### Priority 1 (Required for Enterprise)

4. **Add Missing Roles to PERMISSION_MATRIX**
   - `public` - explicit public access
   - `organization_user` - org-scoped access
   - `tenant_admin` - tenant configuration
   - `super_admin` - platform operations

5. **Implement Organization Scoping**
   - `@OrganizationScoped()` decorator
   - Org membership checks

6. **Add Resource Ownership Validation**
   - `@RequireOwnership()` decorator
   - User-scoped data access

### Priority 2 (Nice-to-Have)

7. **Implement Role Hierarchy**
   - Super Admin inherits all permissions
   - Tenant Admin inherits Admin
   - Admin inherits Saksbehandler

8. **Add Permission Caching**
   - Cache resolved permissions
   - Invalidate on role change

---

## Verification Commands

```bash
# Check current PERMISSION_MATRIX roles
grep -A 50 "PERMISSION_MATRIX" apps/api/src/modules/authz/authz.controller.ts

# Check UserRoleSchema roles
grep "UserRoleSchema" apps/api/src/schemas/user.schema.ts

# Find role usage across codebase
grep -r "role:" apps/api/src/modules --include="*.ts"

# Check public endpoints (no auth)
grep -r "@Get\|@Post" apps/api/src/modules/public --include="*.ts"
```

---

## Summary Matrix

| Role | PERMISSION_MATRIX | UserRoleSchema | Routes | Guards | Status |
|------|-------------------|----------------|--------|--------|--------|
| Public | ❌ | ❌ | ✅ | ❌ | PARTIAL |
| Authenticated User | ✅ (`user`) | ❌ | ✅ | ❌ | PARTIAL |
| Organization User | ❌ | ✅ (`org_admin`) | ❌ | ❌ | MISSING |
| Case Handler | ✅ (`saksbehandler`) | ❌ | ✅ | ❌ | EXISTS |
| Admin | ✅ (`admin`) | ❌ | ✅ | ❌ | EXISTS |
| Tenant Admin | ❌ | ✅ (`tenant_admin`) | ❌ | ❌ | MISSING |
| Super Admin | ❌ | ❌ | ❌ | ❌ | MISSING |

**Overall RBAC Status: 🟡 PARTIAL (43% role coverage, 0% enforcement)**

---

## Appendix: File References

| File | Line | Content |
|------|------|---------|
| `authz.controller.ts` | 17-57 | PERMISSION_MATRIX definition |
| `authz.controller.ts` | 64-99 | GET /permissions endpoint |
| `authz.controller.ts` | 104-149 | GET /check endpoint |
| `auth.controller.ts` | 214-248 | getPermissionsForRole helper |
| `user.schema.ts` | 10 | UserRoleSchema enum |
| `database/schema/index.ts` | 61 | users.role column |
| `policy-debug.ts` | 1-280 | Policy evaluation debugging (not integrated) |
