# Phase 1: Core Platform Stability

**Phase Type:** Foundation / MUST-HAVE
**Priority Level:** CRITICAL
**Status:** IN PROGRESS
**Estimated Duration:** 4-6 weeks
**Last Updated:** 2026-01-15

---

## Overview

Phase 1 establishes core platform stability required for production deployment and SSA-L tender compliance. All items in this phase are **MUST-HAVE** for production readiness. This phase addresses the critical gaps identified in Phase 0 baseline analysis.

**Key Focus Areas:**
- Authentication with Norwegian National eID (BankID/ID-porten)
- 7-role RBAC model implementation
- Tenant and organization isolation
- SDK-first enforcement
- RFC 7807 error handling
- Complete audit logging coverage

**Dependencies:**
- Phase 0 baseline analysis (COMPLETE)

**Success Criteria:**
- All 7 roles implemented and enforced
- 100% mutation audit coverage
- Zero cross-tenant data leakage
- Production OAuth integration ready
- All API errors RFC 7807 compliant

---

## 1.1 Authentication & Session Management

### 1.1.1 Production BankID/ID-porten Integration

- ✅ **Description**: Replace mock OAuth implementation with production Signicat integration for BankID and ID-porten authentication, required for Norwegian municipal users
- 🔍 **Verification**:
  - Check `apps/api/src/modules/auth/auth.controller.ts` callback handler
  - Verify `SIGNICAT_CLIENT_ID` and `SIGNICAT_CLIENT_SECRET` env vars configured
  - Test OAuth flow end-to-end with test credentials
  - Verify JWT contains verified identity claims
- 📦 **Affected**: api, client-sdk (SignicatService, AuthService), apps/web, apps/minside
- 👤 **Roles**: All Norwegian users
- 📊 **Status**: PARTIAL
- 🚨 **Risk**: Cannot go live for municipal use without production OAuth; SSA-L tender compliance blocked
- ➡️ **Action**:
  1. Obtain production Signicat credentials from municipality
  2. Implement full OIDC callback flow with ID token validation
  3. Map Signicat claims to user profile (fødselsnummer, name)
  4. Add consent prompt for first-time login

### 1.1.2 Vipps Login Integration

- ✅ **Description**: Implement Vipps Login OAuth flow as alternative Norwegian authentication method
- 🔍 **Verification**:
  - Check VippsService in SDK for login method implementation
  - Test Vipps OAuth redirect and callback
  - Verify user creation/linking from Vipps profile
- 📦 **Affected**: api, client-sdk (VippsService), apps/web
- 👤 **Roles**: Norwegian mobile users
- 📊 **Status**: PARTIAL (service exists, flow incomplete)
- 🚨 **Risk**: Missing popular Norwegian authentication method reduces user adoption
- ➡️ **Action**:
  1. Register Vipps Login application
  2. Implement OAuth authorization URL generation
  3. Handle callback with user profile extraction
  4. Link Vipps users to existing accounts by phone number

### 1.1.3 Session Token Security

- ✅ **Description**: Production-grade JWT implementation with secure refresh token rotation
- 🔍 **Verification**:
  - `POST /api/auth/refresh` rotates refresh token on each use
  - JWT expiry is configured (15 min access, 7 day refresh recommended)
  - Refresh tokens are stored hashed in database
  - Check for token revocation capability
- 📦 **Affected**: api
- 👤 **Roles**: All authenticated roles
- 📊 **Status**: PARTIAL
- 🚨 **Risk**: Session hijacking vulnerability if tokens not properly secured
- ➡️ **Action**:
  1. Implement refresh token rotation (invalidate old token on refresh)
  2. Add token family tracking for reuse detection
  3. Store hashed refresh tokens in database
  4. Implement global logout (invalidate all sessions)

### 1.1.4 Multi-Factor Authentication (MFA)

- ✅ **Description**: Optional MFA for admin and case handler accounts using TOTP
- 🔍 **Verification**:
  - Check for MFA setup endpoint `/api/auth/mfa/setup`
  - Verify TOTP validation on login for MFA-enabled accounts
  - Test recovery codes functionality
- 📦 **Affected**: api, client-sdk (AuthService), apps/backoffice
- 👤 **Roles**: Admin, Tenant Admin, Super Admin, Case Handler
- 📊 **Status**: MISSING
- 🚨 **Risk**: Administrative accounts vulnerable to credential theft; NSM security requirement
- ➡️ **Action**:
  1. Add MFA schema fields to users table (mfa_secret, mfa_enabled, recovery_codes)
  2. Implement TOTP setup endpoint with QR code generation
  3. Modify login flow to require TOTP if MFA enabled
  4. Implement recovery code validation

### 1.1.5 GDPR Consent on Login

- ✅ **Description**: Record explicit GDPR consent on user registration and first login
- 🔍 **Verification**:
  - Check user_consents table for consent records
  - Verify consent prompt displayed on first login
  - Test consent withdrawal flow
  - Check audit log for consent events
- 📦 **Affected**: api, client-sdk (UserService), apps/web, apps/minside
- 👤 **Roles**: All authenticated users
- 📊 **Status**: PARTIAL (consent table exists, flow incomplete)
- 🚨 **Risk**: GDPR non-compliance; potential fines up to 4% annual revenue
- ➡️ **Action**:
  1. Add consent modal to login flow for users without recorded consent
  2. Implement `POST /api/users/me/consents` endpoint
  3. Add audit logging for consent_given and consent_withdrawn events
  4. Link consent records to specific terms/privacy policy versions

---

## 1.2 Role-Based Access Control (RBAC)

### 1.2.1 Seven-Role Model Implementation

- ✅ **Description**: Expand PERMISSION_MATRIX from 3 roles (admin, saksbehandler, user) to 7 roles per tender requirements
- 🔍 **Verification**:
  - `grep -A 100 "PERMISSION_MATRIX" apps/api/src/modules/authz/authz.controller.ts`
  - Verify all 7 roles present: public, user, organization_user, saksbehandler, admin, tenant_admin, super_admin
  - Test `GET /api/authz/permissions` returns correct permissions for each role
- 📦 **Affected**: api, client-sdk
- 👤 **Roles**: All
- 📊 **Status**: PARTIAL (43% - 3/7 roles)
- 🚨 **Risk**: SSA-L compliance failure; incorrect access controls; security vulnerabilities
- ➡️ **Action**:
  1. Add `public` role with `/api/public/*` access only
  2. Add `organization_user` role with org-scoped permissions
  3. Add `tenant_admin` role with full tenant configuration access
  4. Add `super_admin` role with cross-tenant access
  5. Migrate database users to new role names

**Required Role Definitions:**

| Role | Current Status | Required Permissions |
|------|----------------|---------------------|
| `public` | MISSING | Read public listings, categories, cities only |
| `user` | EXISTS | User-scoped bookings, profile, messages |
| `organization_user` | MISSING | Org-scoped listings, bookings, members |
| `saksbehandler` | EXISTS | Case management, approval workflows |
| `admin` | EXISTS | Tenant-wide management |
| `tenant_admin` | MISSING | Tenant configuration, billing, integrations |
| `super_admin` | MISSING | Cross-tenant access, platform operations |

### 1.2.2 Role Schema Unification

- ✅ **Description**: Resolve mismatch between UserRoleSchema enum (6 roles) and PERMISSION_MATRIX (3 roles)
- 🔍 **Verification**:
  - Compare `apps/api/src/schemas/user.schema.ts` UserRoleSchema with PERMISSION_MATRIX
  - Ensure database role column uses same values as PERMISSION_MATRIX
  - Run `SELECT DISTINCT role FROM users;` to verify no orphaned roles
- 📦 **Affected**: api, database
- 👤 **Roles**: N/A (system)
- 📊 **Status**: MISSING (schema conflict exists)
- 🚨 **Risk**: Users may have roles with no permission mapping; undefined behavior
- ➡️ **Action**:
  1. Define canonical 7-role enum matching PERMISSION_MATRIX
  2. Update UserRoleSchema to match
  3. Create migration script to map old roles to new
  4. Update all role references in codebase

**Current Schema Conflict:**
```
UserRoleSchema: owner, tenant_admin, org_admin, manager, member, viewer
PERMISSION_MATRIX: admin, saksbehandler, user
```

### 1.2.3 Route-Level Permission Guards

- ✅ **Description**: Implement middleware decorator to enforce permissions at API route level
- 🔍 **Verification**:
  - Search for `@RequirePermission` decorator usage on routes
  - Verify unauthorized requests return 403 Forbidden
  - Test each protected endpoint with different roles
  - Check guard logs permission denials
- 📦 **Affected**: api
- 👤 **Roles**: All
- 📊 **Status**: MISSING
- 🚨 **Risk**: Endpoints accessible without proper authorization; data breach potential
- ➡️ **Action**:
  1. Create `@RequirePermission('resource:action')` decorator
  2. Create `@RequireRole('role_name')` decorator
  3. Implement preHandler hook to check permissions
  4. Apply guards to all protected routes
  5. Log all permission denials to audit

**Implementation Pattern:**
```typescript
// Expected usage on routes
@Get('/bookings')
@RequirePermission('bookings:read')
async listBookings() { ... }

@Post('/bookings/:id/confirm')
@RequirePermission('bookings:confirm')
@RequireRole('saksbehandler', 'admin')
async confirmBooking() { ... }
```

### 1.2.4 Resource Ownership Validation

- ✅ **Description**: Enforce "own resource" access rules (users can only read/modify their own bookings, profile, etc.)
- 🔍 **Verification**:
  - Test user A cannot access user B's bookings via direct ID
  - Verify `GET /api/bookings/:id` returns 403 for non-owners
  - Check ownership validation in booking, profile, message controllers
- 📦 **Affected**: api
- 👤 **Roles**: Authenticated User, Organization User
- 📊 **Status**: MISSING
- 🚨 **Risk**: Users may access other users' personal data; GDPR violation
- ➡️ **Action**:
  1. Create `@RequireOwnership('userId')` decorator
  2. Implement ownership check middleware
  3. Apply to user-scoped endpoints (bookings/my, profile, messages)
  4. Log ownership violations to audit

### 1.2.5 Permission Hierarchy

- ✅ **Description**: Implement role hierarchy where higher roles inherit lower role permissions
- 🔍 **Verification**:
  - Verify Super Admin can perform all Admin actions
  - Verify Tenant Admin can perform all Admin actions
  - Verify Admin can perform all Case Handler actions
  - Test permission resolution for inherited permissions
- 📦 **Affected**: api
- 👤 **Roles**: All
- 📊 **Status**: MISSING
- 🚨 **Risk**: Verbose permission matrix; inconsistent access patterns
- ➡️ **Action**:
  1. Define role hierarchy: super_admin > tenant_admin > admin > saksbehandler > organization_user > user > public
  2. Implement permission resolution that includes inherited permissions
  3. Update `GET /api/authz/permissions` to return resolved permissions
  4. Cache resolved permissions per role

**Role Hierarchy:**
```
super_admin
    └── tenant_admin
           └── admin
                  └── saksbehandler
                         └── organization_user
                                └── user
                                       └── public
```

---

## 1.3 Tenant Isolation

### 1.3.1 Tenant Context Middleware

- ✅ **Description**: Automatic tenant filtering on all database queries via middleware
- 🔍 **Verification**:
  - Verify all API responses only contain current tenant's data
  - Test with two tenants: data from tenant A never visible to tenant B users
  - Check tenant context propagation through request lifecycle
  - Verify tenant header/claim extraction
- 📦 **Affected**: api, database
- 👤 **Roles**: All
- 📊 **Status**: MISSING
- 🚨 **Risk**: Cross-tenant data access vulnerability; severe security breach
- ➡️ **Action**:
  1. Create tenant extraction middleware from JWT claims or headers
  2. Inject tenantId into request context
  3. Create Drizzle helper that auto-filters by tenantId
  4. Apply tenant filter to all non-public queries

**Implementation Pattern:**
```typescript
// Middleware extracts and validates tenant
app.addHook('preHandler', async (request) => {
  request.tenantId = await extractTenantFromToken(request);
  if (!request.tenantId) throw new UnauthorizedError();
});

// Queries automatically scoped
const bookings = await db.query.bookings.findMany({
  where: and(eq(bookings.tenantId, request.tenantId), ...)
});
```

### 1.3.2 Tenant Boundary Enforcement

- ✅ **Description**: Prevent cross-tenant data access in all API operations (read, write, delete)
- 🔍 **Verification**:
  - Test `GET /api/bookings/:id` with ID from different tenant returns 404
  - Test `PUT /api/listings/:id` with ID from different tenant fails
  - Verify error responses don't leak tenant information
  - Run integration tests with multi-tenant setup
- 📦 **Affected**: api
- 👤 **Roles**: All
- 📊 **Status**: PARTIAL (schema has tenantId, enforcement missing)
- 🚨 **Risk**: Data breach across municipality boundaries; legal liability
- ➡️ **Action**:
  1. Add tenantId validation to all resource lookups
  2. Return 404 (not 403) for cross-tenant resources to avoid enumeration
  3. Add tenant boundary check to batch operations
  4. Implement integration tests for tenant isolation

### 1.3.3 Super Admin Cross-Tenant Access

- ✅ **Description**: Allow Super Admin role to access data across all tenants for platform operations
- 🔍 **Verification**:
  - Super Admin can query `/api/tenants` to list all tenants
  - Super Admin can access resources from any tenant when impersonating
  - Verify all cross-tenant access is logged to audit
  - Normal users cannot access cross-tenant data
- 📦 **Affected**: api
- 👤 **Roles**: Super Admin
- 📊 **Status**: MISSING
- 🚨 **Risk**: Platform operations blocked without cross-tenant access
- ➡️ **Action**:
  1. Add `isSuperAdmin` check to tenant middleware
  2. Allow Super Admin to specify tenant via header `X-Tenant-Id`
  3. Log all Super Admin cross-tenant access with elevated severity
  4. Implement impersonation audit trail

---

## 1.4 Organization Scoping

### 1.4.1 Organization-Level Permissions

- ✅ **Description**: Implement organization-scoped data access for Organization User role
- 🔍 **Verification**:
  - Test org user can only see listings belonging to their organization
  - Verify org user cannot access other organizations' bookings
  - Check org membership is validated on every org-scoped request
  - Test org admin can manage org members
- 📦 **Affected**: api, apps/minside
- 👤 **Roles**: Organization User
- 📊 **Status**: MISSING
- 🚨 **Risk**: Organizations may access each other's data; privacy violation
- ➡️ **Action**:
  1. Create `@OrganizationScoped()` decorator
  2. Add organization membership validation middleware
  3. Implement org-scoped queries for listings, bookings
  4. Add org context to session/JWT claims

### 1.4.2 Organization Membership Validation

- ✅ **Description**: Validate user belongs to organization before granting org-level access
- 🔍 **Verification**:
  - Test `/api/organizations/:orgId/*` routes check membership
  - Verify removed members lose access immediately
  - Check membership status (active, pending, suspended)
  - Test organization invite flow
- 📦 **Affected**: api
- 👤 **Roles**: Organization User
- 📊 **Status**: PARTIAL (membership table exists, validation incomplete)
- 🚨 **Risk**: Former members may retain access; unauthorized data access
- ➡️ **Action**:
  1. Add membership status check to org-scoped middleware
  2. Implement real-time membership validation (not just JWT)
  3. Add organization to session claims for quick lookup
  4. Handle multi-organization membership

### 1.4.3 Organization User Role Matrix

- ✅ **Description**: Define specific permissions for Organization User role in PERMISSION_MATRIX
- 🔍 **Verification**:
  - Check `organization_user` key exists in PERMISSION_MATRIX
  - Verify org users can: manage org listings, view org bookings, view org members
  - Verify org users cannot: access other orgs, modify tenant settings
- 📦 **Affected**: api
- 👤 **Roles**: Organization User
- 📊 **Status**: MISSING
- 🚨 **Risk**: Organization users have undefined permissions; inconsistent access
- ➡️ **Action**:
  1. Add `organization_user` to PERMISSION_MATRIX with:
     - listings: ['create', 'read', 'update'] (org-scoped)
     - bookings: ['read'] (org-scoped)
     - organizations: ['read'] (own org)
     - members: ['read'] (own org)

**Required Organization User Permissions:**
```typescript
organization_user: {
  dashboard: ['read'],
  listings: ['create', 'read', 'update'],  // org-scoped
  bookings: ['read'],                        // org listings only
  users: [],
  organizations: ['read'],                   // own org only
  reports: ['read'],                         // org data only
  settings: [],
  calendar: ['read'],
  messages: ['read', 'write'],
  'seasonal-leases': ['read'],              // org leases
  audit: [],
}
```

---

## 1.5 SDK-First Enforcement

### 1.5.1 Direct API Call Detection

- ✅ **Description**: Ensure no direct fetch/axios calls in frontend apps; all data access via SDK
- 🔍 **Verification**:
  - `grep -r "fetch(\|axios\|graphql" apps/web apps/backoffice apps/minside --include="*.ts*" | grep -v node_modules` should return 0 results
  - All data fetching uses `@digilist/client-sdk/hooks`
  - ESLint rule blocks direct API imports
- 📦 **Affected**: apps/web, apps/backoffice, apps/minside
- 👤 **Roles**: Developers
- 📊 **Status**: DONE
- 🚨 **Risk**: Direct calls bypass caching, error handling, and type safety
- ➡️ **Action**: None required - SDK-first principle is enforced

### 1.5.2 SDK Service Coverage

- ✅ **Description**: SDK services cover all API routes with proper typing
- 🔍 **Verification**:
  - `ls packages/client-sdk/src/services/*.ts | wc -l` should match API module count
  - Each API route has corresponding SDK method
  - Cross-reference SDK methods with API route inventory
- 📦 **Affected**: client-sdk
- 👤 **Roles**: Developers
- 📊 **Status**: DONE (45 services, exceeds target)
- 🚨 **Risk**: N/A
- ➡️ **Action**: None required

### 1.5.3 React Query Hook Coverage

- ✅ **Description**: All SDK services have corresponding React Query hooks
- 🔍 **Verification**:
  - `ls packages/client-sdk/src/hooks/*.ts | wc -l` covers all services
  - Each query hook follows `use[Resource]` naming
  - Each mutation hook follows `use[Resource]Mutation` naming
  - Stale time and cache configuration consistent
- 📦 **Affected**: client-sdk
- 👤 **Roles**: Frontend developers
- 📊 **Status**: DONE (25 hook modules)
- 🚨 **Risk**: N/A
- ➡️ **Action**: None required

### 1.5.4 Zero Transformers Rule Enforcement

- ✅ **Description**: No transformer functions (toXxx, fromXxx, mapXxx) in frontend apps
- 🔍 **Verification**:
  - `grep -rn "function to[A-Z]\|const to[A-Z]\|= to[A-Z]" apps/ --include="*.ts*"` should return 0 results
  - No ViewModel types in app code
  - Components use SDK types directly
- 📦 **Affected**: apps/web, apps/backoffice, apps/minside
- 👤 **Roles**: Developers
- 📊 **Status**: PARTIAL (one violation found)
- 🚨 **Risk**: Transformers create maintenance burden and type drift
- ➡️ **Action**: Remove `transformApiToListing` in `apps/web/src/pages/ListingDetailPage.tsx`

---

## 1.6 Error Handling (RFC 7807)

### 1.6.1 API Error Response Standardization

- ✅ **Description**: All API errors conform to RFC 7807 Problem Details format
- 🔍 **Verification**:
  - Trigger validation error: response includes `type`, `title`, `status`, `detail`
  - Trigger 404: response follows Problem Details format
  - Trigger 500: error details don't leak sensitive information
  - Content-Type header is `application/problem+json`
- 📦 **Affected**: api
- 👤 **Roles**: All
- 📊 **Status**: PARTIAL
- 🚨 **Risk**: Inconsistent error handling; poor developer experience; debugging difficulty
- ➡️ **Action**:
  1. Create centralized error handler using RFC 7807 format
  2. Define error type URIs (e.g., `/errors/validation`, `/errors/not-found`)
  3. Update all error responses to use Problem Details
  4. Add error reference documentation

**RFC 7807 Error Format:**
```json
{
  "type": "https://api.digilist.no/errors/validation",
  "title": "Validation Error",
  "status": 400,
  "detail": "The request body contains invalid data",
  "instance": "/api/bookings",
  "errors": [
    { "field": "startDate", "message": "Must be a future date" }
  ]
}
```

### 1.6.2 SDK Error Type Handling

- ✅ **Description**: SDK parses RFC 7807 errors into typed error objects
- 🔍 **Verification**:
  - Check SDK error types in `packages/client-sdk/src/types/`
  - Verify SDK catches and transforms API errors
  - Test error handling in React Query hooks
  - Verify error type discrimination in components
- 📦 **Affected**: client-sdk
- 👤 **Roles**: Developers
- 📊 **Status**: PARTIAL
- 🚨 **Risk**: Error handling inconsistent across apps
- ➡️ **Action**:
  1. Create `ProblemDetails` type matching RFC 7807
  2. Create specific error types (ValidationError, NotFoundError, etc.)
  3. Add error parsing to SDK HTTP client
  4. Export error types for component usage

### 1.6.3 Frontend Error Boundaries

- ✅ **Description**: React error boundaries for graceful failure handling
- 🔍 **Verification**:
  - Check for ErrorBoundary components in each app
  - Verify errors are caught and displayed user-friendly
  - Test error recovery (retry buttons)
  - Verify errors are logged to error tracking service
- 📦 **Affected**: apps/web, apps/backoffice, apps/minside
- 👤 **Roles**: All users
- 📊 **Status**: DONE
- 🚨 **Risk**: White screen crashes; poor user experience
- ➡️ **Action**: None required - error boundaries implemented

### 1.6.4 Validation Error User Feedback

- ✅ **Description**: Form validation errors displayed inline with clear user guidance
- 🔍 **Verification**:
  - Submit invalid form: errors appear next to fields
  - Error messages are i18n translated
  - Focus moves to first error field
  - ARIA attributes announce errors to screen readers
- 📦 **Affected**: apps/web, apps/backoffice, apps/minside
- 👤 **Roles**: All users
- 📊 **Status**: PARTIAL
- 🚨 **Risk**: Users cannot understand why form submission failed
- ➡️ **Action**:
  1. Map API validation errors to form fields
  2. Add field-level error display components
  3. Implement i18n for error messages
  4. Add ARIA error announcements

---

## 1.7 Audit Logging

### 1.7.1 Complete Mutation Coverage

- ✅ **Description**: All state-changing operations logged to audit trail
- 🔍 **Verification**:
  - `grep -r "getAuditService().log" apps/api/src/modules/ | wc -l` shows all modules covered
  - Every POST/PUT/DELETE route has corresponding audit log
  - Check coverage: tenant, organization, settings, billing, seasonal-lease modules
- 📦 **Affected**: api
- 👤 **Roles**: All
- 📊 **Status**: PARTIAL (60% coverage)
- 🚨 **Risk**: Incomplete audit trail; compliance gaps; forensic capability limited
- ➡️ **Action**:
  1. Add audit logging to tenant operations (create, update, delete, settings_change)
  2. Add audit logging to organization operations (all CRUD + member changes)
  3. Add audit logging to settings changes
  4. Add audit logging to seasonal lease operations
  5. Add audit logging to billing operations

**Modules Requiring Audit Coverage:**

| Module | Current | Required Actions |
|--------|---------|-----------------|
| Tenant | 0 | create, update, delete, settings_change |
| Organization | 0 | create, update, delete, member_add, member_remove, verify |
| Settings | 0 | update, integration_enable, integration_disable |
| Seasonal Lease | 0 | create, update, delete, terminate |
| Billing | 0 | invoice_generated, payment_received, payment_failed |
| Notifications | 0 | send, bulk_send |
| Profile | 0 | update, preferences_change |
| RBAC | 0 | permission_denied, role_change |

### 1.7.2 GDPR-Specific Audit Events

- ✅ **Description**: Logging of GDPR-specific events (consent, data access, erasure)
- 🔍 **Verification**:
  - Search audit logs: `action IN ('consent_given', 'consent_withdrawn', 'data_export', 'data_erasure')`
  - Verify consent changes include version of terms agreed to
  - Verify data export requests logged with format and scope
  - Verify erasure requests logged with confirmation
- 📦 **Affected**: api
- 👤 **Roles**: All (as data subjects)
- 📊 **Status**: MISSING
- 🚨 **Risk**: GDPR non-compliance; cannot demonstrate lawful processing; potential fines
- ➡️ **Action**:
  1. Add consent_given event on consent submission
  2. Add consent_withdrawn event on consent revocation
  3. Add data_export_requested event with scope details
  4. Add data_deleted event with confirmation details
  5. Add data_access event for subject access requests

### 1.7.3 Audit Schema Enhancement

- ✅ **Description**: Add missing fields to audit_logs table for full compliance
- 🔍 **Verification**:
  - Check audit_logs schema includes: sessionId, correlationId, previousValue, newValue
  - Verify new fields populated on audit events
  - Test audit query filtering by new fields
- 📦 **Affected**: api, database
- 👤 **Roles**: N/A (system)
- 📊 **Status**: PARTIAL (core fields present, compliance fields missing)
- 🚨 **Risk**: Cannot correlate user sessions; cannot show data changes; NSM requirement gap
- ➡️ **Action**:
  1. Add `sessionId` column for user session tracking
  2. Add `correlationId` column for request tracing
  3. Add `previousValue` JSONB column for before state
  4. Add `newValue` JSONB column for after state
  5. Create migration and update audit service

**Required Schema Changes:**
```sql
ALTER TABLE audit_logs ADD COLUMN session_id UUID;
ALTER TABLE audit_logs ADD COLUMN correlation_id UUID;
ALTER TABLE audit_logs ADD COLUMN previous_value JSONB;
ALTER TABLE audit_logs ADD COLUMN new_value JSONB;
CREATE INDEX audit_logs_session_idx ON audit_logs(session_id);
CREATE INDEX audit_logs_correlation_idx ON audit_logs(correlation_id);
```

### 1.7.4 Audit Log Integrity (Hash Chain)

- ✅ **Description**: Tamper-evident logging with hash chain for Digital Security Act compliance
- 🔍 **Verification**:
  - Each audit entry contains hash of previous entry
  - Hash includes: previousHash + entryData
  - Verification endpoint to check chain integrity
  - Alert on hash chain break detection
- 📦 **Affected**: api, database
- 👤 **Roles**: N/A (system)
- 📊 **Status**: MISSING
- 🚨 **Risk**: Audit logs can be tampered with; Digital Security Act violation
- ➡️ **Action**:
  1. Add `previousHash` and `currentHash` columns to audit_logs
  2. Implement hash calculation: `SHA256(previousHash + JSON.stringify(entry))`
  3. Create integrity verification endpoint
  4. Add scheduled job to verify chain integrity
  5. Alert on integrity violations

### 1.7.5 Audit Retention Policy

- ✅ **Description**: Configurable retention periods with automated archive/purge
- 🔍 **Verification**:
  - Check for retention_policy configuration table or settings
  - Verify scheduled job for archive/purge
  - Test retention policy: entries older than retention period archived
  - Default retention: 7 years (Norwegian accounting law)
- 📦 **Affected**: api, database
- 👤 **Roles**: Tenant Admin, Super Admin
- 📊 **Status**: MISSING
- 🚨 **Risk**: Unlimited storage growth; GDPR storage limitation violation
- ➡️ **Action**:
  1. Create retention_policy configuration table
  2. Implement archive function (move to cold storage)
  3. Implement purge function (GDPR right to erasure)
  4. Create scheduled cron job for retention enforcement
  5. Add retention policy to tenant settings

### 1.7.6 Audit Export Capability

- ✅ **Description**: Export audit logs for compliance reporting and legal requests
- 🔍 **Verification**:
  - `GET /api/audit/export?format=csv` returns downloadable file
  - `GET /api/audit/export?format=json` returns JSON array
  - Export includes all required fields for compliance
  - Export is logged to audit (meta-audit)
- 📦 **Affected**: api, client-sdk
- 👤 **Roles**: Admin, Tenant Admin
- 📊 **Status**: MISSING
- 🚨 **Risk**: Cannot provide audit data for compliance audits or legal requests
- ➡️ **Action**:
  1. Implement `/api/audit/export` endpoint
  2. Support CSV and JSON formats
  3. Add date range filtering
  4. Add to SDK AuditService
  5. Log export requests to audit

### 1.7.7 Backoffice Real Audit Integration

- ✅ **Description**: Replace mock audit data in backoffice with SDK hooks
- 🔍 **Verification**:
  - Open audit pages in backoffice, verify data matches database
  - Check for `useAuditLog()` and `useAuditStats()` hook usage
  - Verify real-time updates via WebSocket
  - Check filtering and pagination work with real data
- 📦 **Affected**: apps/backoffice
- 👤 **Roles**: Admin, Tenant Admin
- 📊 **Status**: MISSING (uses mock data)
- 🚨 **Risk**: Administrators cannot view actual audit trail; blind to system activity
- ➡️ **Action**:
  1. Replace `mockAuditEntries` with `useAuditLog()` hook in audit-timeline.tsx
  2. Replace `mockAuditEvents` with `useAuditLog()` hook in tenant/audit-log.tsx
  3. Connect WebSocket for real-time updates
  4. Implement proper pagination with SDK

---

## Phase 1 Summary

### Status Matrix

| Category | Items | DONE | PARTIAL | MISSING |
|----------|-------|------|---------|---------|
| Authentication | 5 | 0 | 3 | 2 |
| RBAC | 5 | 0 | 2 | 3 |
| Tenant Isolation | 3 | 0 | 1 | 2 |
| Organization Scoping | 3 | 0 | 1 | 2 |
| SDK-First | 4 | 3 | 1 | 0 |
| Error Handling | 4 | 1 | 3 | 0 |
| Audit Logging | 7 | 0 | 2 | 5 |
| **TOTAL** | **31** | **4 (13%)** | **13 (42%)** | **14 (45%)** |

### Priority Order

Based on risk and dependency analysis, implement in this order:

**Week 1-2: Critical Security**
1. 1.2.3 Route-Level Permission Guards
2. 1.3.1 Tenant Context Middleware
3. 1.3.2 Tenant Boundary Enforcement
4. 1.2.1 Seven-Role Model Implementation

**Week 2-3: RBAC Completion**
5. 1.2.2 Role Schema Unification
6. 1.2.4 Resource Ownership Validation
7. 1.4.1 Organization-Level Permissions
8. 1.4.2 Organization Membership Validation

**Week 3-4: Authentication**
9. 1.1.1 Production BankID/ID-porten Integration
10. 1.1.3 Session Token Security
11. 1.1.5 GDPR Consent on Login

**Week 4-5: Audit Compliance**
12. 1.7.1 Complete Mutation Coverage
13. 1.7.2 GDPR-Specific Audit Events
14. 1.7.3 Audit Schema Enhancement
15. 1.7.4 Audit Log Integrity (Hash Chain)

**Week 5-6: Error Handling & Polish**
16. 1.6.1 API Error Response Standardization
17. 1.6.2 SDK Error Type Handling
18. 1.7.7 Backoffice Real Audit Integration

### Critical Blockers

| # | Blocker | Impact | Required By |
|---|---------|--------|-------------|
| 1 | 7-Role RBAC | SSA-L compliance | Phase 2 |
| 2 | Route Guards | Security | Immediate |
| 3 | Tenant Isolation | Data protection | Immediate |
| 4 | Production OAuth | Go-live | Phase 2 |
| 5 | Audit Integrity | Digital Security Act | Oct 2025 |

### Success Metrics

| Metric | Current | Target | Measurement |
|--------|---------|--------|-------------|
| Role coverage | 43% (3/7) | 100% (7/7) | PERMISSION_MATRIX count |
| Route guard coverage | 0% | 100% | Protected routes with @RequirePermission |
| Audit mutation coverage | 60% | 100% | Modules with audit logging |
| RFC 7807 compliance | PARTIAL | 100% | Error response format audit |
| Tenant isolation tests | 0 | 100% | Integration test pass rate |

### Dependencies on Later Phases

| This Phase Item | Required By |
|-----------------|-------------|
| 7-Role RBAC | Phase 3 (Role-Specific UX) |
| Tenant Isolation | Phase 4 (Multi-Municipality) |
| Audit Integrity | Phase 5 (Observability) |
| Organization Scoping | Phase 2 (Booking Workflows) |

---

*Document generated as part of Enterprise Platform Roadmap (Task 041)*
*Based on analysis files: api-routes.md, rbac-status.md, audit-status.md, Phase 0 baseline*
