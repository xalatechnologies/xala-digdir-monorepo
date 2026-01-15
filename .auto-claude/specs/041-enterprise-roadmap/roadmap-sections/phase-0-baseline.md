# Phase 0: Baseline & Verification

**Phase Type:** Analysis & Assessment
**Priority Level:** FOUNDATION
**Status:** COMPLETE
**Last Updated:** 2026-01-15

---

## Overview

Phase 0 establishes the baseline understanding of the current platform implementation against tender requirements, compliance standards, and architectural principles. Every item is marked with verification status:

- **DONE** - Fully implemented and verified
- **PARTIAL** - Partially implemented, gaps identified
- **MISSING** - Not implemented, requires action

---

## 0.1 Architecture Validation

### 0.1.1 Monorepo Structure

- ✅ **Description**: Turborepo-based monorepo with pnpm workspaces
- 🔍 **Verification**: `cat package.json | grep -A5 '"workspaces"'` and `cat turbo.json`
- 📦 **Affected**: All apps and packages
- 👤 **Roles**: All (developers, DevOps)
- 📊 **Status**: DONE
- 🚨 **Risk**: N/A - Structure is stable
- ➡️ **Action**: None required

### 0.1.2 SDK-First Architecture

- ✅ **Description**: All frontend apps use `@digilist/client-sdk` exclusively for API access
- 🔍 **Verification**: `grep -r "fetch(\|axios\|graphql" apps/ --include="*.ts*" | grep -v node_modules | wc -l` should be 0
- 📦 **Affected**: apps/web, apps/backoffice, apps/minside
- 👤 **Roles**: All
- 📊 **Status**: DONE
- 🚨 **Risk**: Direct API calls bypass caching, types, and error handling
- ➡️ **Action**: None required - SDK-first principle is enforced

### 0.1.3 Design System Facade (@xala/ds)

- ✅ **Description**: All UI components imported from `@xala/ds`, not directly from `@digdir/*`
- 🔍 **Verification**: `grep -r "@digdir/designsystemet" apps/ --include="*.ts*" | wc -l` should be 0
- 📦 **Affected**: apps/web, apps/backoffice, apps/minside
- 👤 **Roles**: All frontend roles
- 📊 **Status**: DONE
- 🚨 **Risk**: Direct imports bypass design token enforcement
- ➡️ **Action**: None required - ESLint guardrails active

### 0.1.4 Zero Transformers Rule

- ✅ **Description**: No transformer functions (toXxx, fromXxx, mapXxx) in frontend apps
- 🔍 **Verification**: `grep -rn "function to[A-Z]\|const to[A-Z]\|= to[A-Z]" apps/ --include="*.ts*"`
- 📦 **Affected**: apps/web, apps/backoffice, apps/minside
- 👤 **Roles**: All
- 📊 **Status**: PARTIAL
- 🚨 **Risk**: Transformers create maintenance burden and type drift
- ➡️ **Action**: Remove `transformApiToListing` in apps/web/src/pages/ListingDetailPage.tsx

### 0.1.5 Multi-Tenant Architecture

- ✅ **Description**: All data scoped by tenantId, tenant isolation enforced
- 🔍 **Verification**: `grep -r "tenantId" apps/api/src/database/schema/index.ts` - All tables have tenantId
- 📦 **Affected**: api, client-sdk
- 👤 **Roles**: All
- 📊 **Status**: DONE
- 🚨 **Risk**: Cross-tenant data leakage if isolation fails
- ➡️ **Action**: None required - Schema enforces tenantId

---

## 0.2 Authentication & Session

### 0.2.1 Email/Password Authentication

- ✅ **Description**: Basic email/password login flow
- 🔍 **Verification**: `POST /api/auth/login` returns JWT token
- 📦 **Affected**: api, client-sdk, all apps
- 👤 **Roles**: All authenticated roles
- 📊 **Status**: DONE
- 🚨 **Risk**: N/A
- ➡️ **Action**: None required

### 0.2.2 Norwegian National eID (BankID/ID-porten)

- ✅ **Description**: Integration with Signicat for BankID and ID-porten authentication
- 🔍 **Verification**: Check `apps/api/src/modules/auth/auth.controller.ts` for Signicat callback handling
- 📦 **Affected**: api, client-sdk (SignicatService)
- 👤 **Roles**: All Norwegian users
- 📊 **Status**: PARTIAL
- 🚨 **Risk**: Cannot go live for municipal use without production OAuth
- ➡️ **Action**: Configure production Signicat credentials, implement OIDC callback flow

### 0.2.3 Vipps Login Integration

- ✅ **Description**: Login via Vipps mobile app
- 🔍 **Verification**: Check VippsService in SDK for login methods
- 📦 **Affected**: api, client-sdk, apps/web
- 👤 **Roles**: Norwegian mobile users
- 📊 **Status**: PARTIAL
- 🚨 **Risk**: Missing popular Norwegian authentication method
- ➡️ **Action**: Implement Vipps Login OAuth flow

### 0.2.4 Session Management

- ✅ **Description**: JWT-based session with refresh token support
- 🔍 **Verification**: `GET /api/auth/session` returns current session, `POST /api/auth/refresh` refreshes token
- 📦 **Affected**: api, client-sdk
- 👤 **Roles**: All authenticated roles
- 📊 **Status**: DONE
- 🚨 **Risk**: N/A
- ➡️ **Action**: None required

### 0.2.5 CSRF Protection

- ✅ **Description**: CSRF token generation and validation
- 🔍 **Verification**: `GET /api/auth/csrf` returns CSRF token
- 📦 **Affected**: api
- 👤 **Roles**: All
- 📊 **Status**: DONE
- 🚨 **Risk**: Cross-site request forgery vulnerability if missing
- ➡️ **Action**: None required

---

## 0.3 Role-Based Access Control (RBAC)

### 0.3.1 Role Definition (7-Role Model)

- ✅ **Description**: Seven roles defined per tender requirements: Public, Authenticated User, Organization User, Case Handler, Admin, Tenant Admin, Super Admin
- 🔍 **Verification**: Check PERMISSION_MATRIX in `apps/api/src/modules/authz/authz.controller.ts`
- 📦 **Affected**: api, all apps
- 👤 **Roles**: All
- 📊 **Status**: PARTIAL (43% - 3/7 roles implemented)
- 🚨 **Risk**: SSA-L compliance failure, incorrect access controls
- ➡️ **Action**: Expand PERMISSION_MATRIX from 3 roles (admin, saksbehandler, user) to 7 roles

**Current Implementation:**
| Role | Status | Notes |
|------|--------|-------|
| Public | PARTIAL | Routes exist, no explicit role in matrix |
| Authenticated User | DONE | Mapped to "user" in matrix |
| Organization User | MISSING | org_admin in schema, not in matrix |
| Case Handler | DONE | Mapped to "saksbehandler" |
| Admin | DONE | Mapped to "admin" |
| Tenant Admin | MISSING | In schema, not in matrix |
| Super Admin | MISSING | Not implemented |

### 0.3.2 Permission Matrix

- ✅ **Description**: Resource-action permission matrix for each role
- 🔍 **Verification**: `grep -A 50 "PERMISSION_MATRIX" apps/api/src/modules/authz/authz.controller.ts`
- 📦 **Affected**: api
- 👤 **Roles**: All
- 📊 **Status**: PARTIAL
- 🚨 **Risk**: Unauthorized access if permissions not enforced
- ➡️ **Action**: Add missing roles and complete permission matrix

### 0.3.3 Route-Level Guards

- ✅ **Description**: Middleware enforcing permissions at API route level
- 🔍 **Verification**: Check for @RequirePermission or similar decorators on routes
- 📦 **Affected**: api
- 👤 **Roles**: All
- 📊 **Status**: MISSING
- 🚨 **Risk**: Endpoints accessible without proper authorization
- ➡️ **Action**: Implement @RequirePermission() decorator and apply to all protected routes

### 0.3.4 Tenant Isolation Middleware

- ✅ **Description**: Automatic tenant filtering on all queries
- 🔍 **Verification**: Check for tenant context propagation in request handlers
- 📦 **Affected**: api
- 👤 **Roles**: All
- 📊 **Status**: MISSING
- 🚨 **Risk**: Cross-tenant data access vulnerability
- ➡️ **Action**: Implement tenant isolation middleware that injects tenantId into all queries

### 0.3.5 Organization Scoping

- ✅ **Description**: Organization-level data access controls for org users
- 🔍 **Verification**: Check for org membership validation in API routes
- 📦 **Affected**: api, apps/minside
- 👤 **Roles**: Organization User
- 📊 **Status**: MISSING
- 🚨 **Risk**: Users may access data from organizations they don't belong to
- ➡️ **Action**: Implement @OrganizationScoped() decorator

---

## 0.4 Audit Logging

### 0.4.1 Core Audit Service

- ✅ **Description**: Database-backed audit logging with PostgreSQL
- 🔍 **Verification**: `SELECT COUNT(*) FROM audit_logs;` returns records
- 📦 **Affected**: api
- 👤 **Roles**: All (write), Admin (read)
- 📊 **Status**: DONE
- 🚨 **Risk**: N/A
- ➡️ **Action**: None required

### 0.4.2 Audit Schema Fields

- ✅ **Description**: Required audit fields: who, what, when, where, tenantId
- 🔍 **Verification**: Check audit_logs table schema in `apps/api/src/database/schema/index.ts`
- 📦 **Affected**: api
- 👤 **Roles**: N/A (system)
- 📊 **Status**: PARTIAL
- 🚨 **Risk**: Incomplete audit trail for compliance
- ➡️ **Action**: Add missing fields: sessionId, correlationId, previousValue, newValue

**Current Fields:**
| Field | Status | Notes |
|-------|--------|-------|
| id (UUID) | DONE | Primary key |
| tenantId | DONE | Tenant isolation |
| userId | DONE | Who |
| action | DONE | What |
| resource | DONE | What |
| resourceId | DONE | What |
| timestamp | DONE | When |
| ipAddress | DONE | Where |
| userAgent | DONE | Context |
| metadata | DONE | Flexible data |
| severity | DONE | info/warn/error |
| sessionId | MISSING | NSM required |
| correlationId | MISSING | Request tracing |
| previousValue | MISSING | GDPR diff |
| newValue | MISSING | GDPR diff |

### 0.4.3 Mutation Coverage

- ✅ **Description**: All state-changing operations logged to audit
- 🔍 **Verification**: `grep -r "getAuditService().log" apps/api/src/modules/ | wc -l`
- 📦 **Affected**: api
- 👤 **Roles**: All
- 📊 **Status**: PARTIAL (60% coverage)
- 🚨 **Risk**: Gaps in audit trail, compliance failure
- ➡️ **Action**: Add audit logging to: tenant, organization, settings, billing, seasonal-lease modules

**Coverage by Module:**
| Module | Log Points | Status |
|--------|-----------|--------|
| User Service | 6 | DONE |
| Listing Service | 6 | DONE |
| Booking Service | 5 | DONE |
| Allocation Controller | 2 | DONE |
| Conversation Controller | 2 | DONE |
| Auth Controller | 2 | DONE |
| Tenant Operations | 0 | MISSING |
| Organization Operations | 0 | MISSING |
| Settings Operations | 0 | MISSING |
| Seasonal Lease | 0 | MISSING |

### 0.4.4 Real-time Audit Streaming

- ✅ **Description**: WebSocket broadcast of audit events
- 🔍 **Verification**: Connect to `/ws/audit`, trigger mutation, observe event
- 📦 **Affected**: api, client-sdk, apps/backoffice
- 👤 **Roles**: Admin
- 📊 **Status**: DONE
- 🚨 **Risk**: N/A
- ➡️ **Action**: None required

### 0.4.5 Audit Log Integrity

- ✅ **Description**: Tamper-evident logging with hash chain
- 🔍 **Verification**: Check for hash chain implementation in audit service
- 📦 **Affected**: api
- 👤 **Roles**: N/A (system)
- 📊 **Status**: MISSING
- 🚨 **Risk**: Audit logs can be modified, Digital Security Act violation
- ➡️ **Action**: Implement hash chain: `hash = SHA256(prevHash + currentEntry)`

### 0.4.6 Audit Retention Policy

- ✅ **Description**: Configurable retention periods with automated purge/archive
- 🔍 **Verification**: Check for retention_policy table or configuration
- 📦 **Affected**: api, database
- 👤 **Roles**: Tenant Admin, Super Admin
- 📊 **Status**: MISSING
- 🚨 **Risk**: Unlimited storage growth, GDPR storage limitation violation
- ➡️ **Action**: Implement retention policy configuration (default: 7 years per Norwegian accounting law)

---

## 0.5 SDK Coverage

### 0.5.1 Service Count

- ✅ **Description**: Comprehensive SDK services covering all platform functionality
- 🔍 **Verification**: `ls packages/client-sdk/src/services/*.ts | wc -l`
- 📦 **Affected**: client-sdk
- 👤 **Roles**: All
- 📊 **Status**: DONE (45 services, exceeds 33 target)
- 🚨 **Risk**: N/A
- ➡️ **Action**: None required

### 0.5.2 React Query Hooks

- ✅ **Description**: React Query hooks for all SDK services
- 🔍 **Verification**: `ls packages/client-sdk/src/hooks/*.ts | wc -l`
- 📦 **Affected**: client-sdk
- 👤 **Roles**: Frontend developers
- 📊 **Status**: DONE (25 hook modules)
- 🚨 **Risk**: N/A
- ➡️ **Action**: None required

### 0.5.3 Type Definitions

- ✅ **Description**: TypeScript types for all SDK operations
- 🔍 **Verification**: `ls packages/client-sdk/src/types/*.ts | wc -l`
- 📦 **Affected**: client-sdk
- 👤 **Roles**: Developers
- 📊 **Status**: DONE (18 type files)
- 🚨 **Risk**: N/A
- ➡️ **Action**: None required

### 0.5.4 SDK-to-API Route Coverage

- ✅ **Description**: SDK services cover all API routes
- 🔍 **Verification**: Cross-reference SDK methods with API route inventory
- 📦 **Affected**: client-sdk, api
- 👤 **Roles**: All
- 📊 **Status**: DONE (100% coverage)
- 🚨 **Risk**: N/A
- ➡️ **Action**: None required

**Coverage Summary:**
| Domain | SDK Services | API Coverage |
|--------|--------------|--------------|
| Authentication | AuthService, SignicatService | 100% |
| Listings | ListingService, PublicListingService | 100% |
| Bookings | BookingService, CalendarService, AllocationService | 100% |
| Organizations | OrganizationService, UserService | 100% |
| Economy | EconomyService, BillingService | 100% |
| Seasonal | SeasonService, SeasonalLeaseService | 100% |
| Notifications | NotificationService, PushNotificationService | 100% |
| Audit | AuditService | 100% |
| Reports | ReportsService, DashboardService | 100% |
| Integrations | 7 integration services | 100% |

---

## 0.6 API Route Coverage

### 0.6.1 Total Route Count

- ✅ **Description**: Comprehensive API route implementation
- 🔍 **Verification**: Count routes in all controller files
- 📦 **Affected**: api
- 👤 **Roles**: All
- 📊 **Status**: DONE (140+ routes across 23 modules)
- 🚨 **Risk**: N/A
- ➡️ **Action**: None required

### 0.6.2 Public Endpoints

- ✅ **Description**: Unauthenticated access to public listing data
- 🔍 **Verification**: `curl -s http://localhost:4000/api/public/listings | jq length`
- 📦 **Affected**: api
- 👤 **Roles**: Public
- 📊 **Status**: DONE (6 public endpoints)
- 🚨 **Risk**: N/A
- ➡️ **Action**: None required

### 0.6.3 Booking Engine

- ✅ **Description**: Full booking CRUD with status workflow
- 🔍 **Verification**: Check `/api/bookings/*` routes
- 📦 **Affected**: api
- 👤 **Roles**: Authenticated User, Case Handler, Admin
- 📊 **Status**: DONE (14 booking routes)
- 🚨 **Risk**: N/A
- ➡️ **Action**: None required

### 0.6.4 GDPR Endpoints

- ✅ **Description**: Data export and erasure endpoints for GDPR compliance
- 🔍 **Verification**: Check for `/api/users/me/export`, `/api/users/me/delete`
- 📦 **Affected**: api, client-sdk (UserService.exportData, deleteAccount)
- 👤 **Roles**: Authenticated User
- 📊 **Status**: PARTIAL
- 🚨 **Risk**: GDPR non-compliance, potential fines
- ➡️ **Action**: Verify data export includes all personal data, add confirmation for erasure

### 0.6.5 WebSocket Endpoints

- ✅ **Description**: Real-time event streaming via WebSocket
- 🔍 **Verification**: Check WebSocket routes in websocket.controller.ts
- 📦 **Affected**: api, client-sdk
- 👤 **Roles**: Authenticated users
- 📊 **Status**: PARTIAL
- 🚨 **Risk**: Missing real-time availability updates
- ➡️ **Action**: Implement `/ws/availability/:listingId` endpoint (mentioned in spec but not found)

---

## 0.7 Frontend App Coverage

### 0.7.1 Web App (Public)

- ✅ **Description**: Public-facing listing discovery and booking app
- 🔍 **Verification**: `grep -r "Route path=" apps/web/src/App.tsx`
- 📦 **Affected**: apps/web
- 👤 **Roles**: Public, Authenticated User, Organization User
- 📊 **Status**: PARTIAL (4 routes implemented)
- 🚨 **Risk**: Users cannot complete booking flow
- ➡️ **Action**: Add missing pages: /my-bookings, /my-profile, /register

**Route Coverage:**
| Route | Status | Priority |
|-------|--------|----------|
| `/` (ListingsPage) | DONE | - |
| `/listing/:id` | DONE | - |
| `/login` | DONE | - |
| `/payment/callback` | DONE | - |
| `/my-bookings` | MISSING | MUST-HAVE |
| `/my-profile` | MISSING | MUST-HAVE |
| `/register` | MISSING | MUST-HAVE |
| `/search` | MISSING | SHOULD-HAVE |

### 0.7.2 Backoffice App

- ✅ **Description**: Admin and case handler management application
- 🔍 **Verification**: Count routes in `apps/backoffice/src/App.tsx`
- 📦 **Affected**: apps/backoffice
- 👤 **Roles**: Case Handler, Admin, Tenant Admin
- 📊 **Status**: DONE (34 routes implemented)
- 🚨 **Risk**: N/A
- ➡️ **Action**: None required - comprehensive coverage

### 0.7.3 MinSide App

- ✅ **Description**: User dashboard for booking management
- 🔍 **Verification**: Count routes and features in apps/minside
- 📦 **Affected**: apps/minside
- 👤 **Roles**: Authenticated User, Organization User
- 📊 **Status**: DONE (15+ routes, 6 modules)
- 🚨 **Risk**: N/A
- ➡️ **Action**: None required

### 0.7.4 SDK Integration in Apps

- ✅ **Description**: All apps use SDK hooks for data access
- 🔍 **Verification**: `grep -r "@digilist/client-sdk" apps/ --include="*.ts*" | wc -l`
- 📦 **Affected**: All apps
- 👤 **Roles**: All
- 📊 **Status**: DONE
- 🚨 **Risk**: N/A
- ➡️ **Action**: None required

---

## 0.8 Design System Compliance

### 0.8.1 WCAG 2.1 AA Compliance

- ✅ **Description**: Design system meets WCAG 2.1 AA accessibility standards
- 🔍 **Verification**: `pnpm scan:a11y` and check component ARIA attributes
- 📦 **Affected**: packages/ds, all apps
- 👤 **Roles**: All users
- 📊 **Status**: DONE (90/100 compliance score)
- 🚨 **Risk**: Accessibility lawsuits, tender rejection
- ➡️ **Action**: Plan WCAG 2.2 upgrade path for Q2 2026

### 0.8.2 Design Token Enforcement

- ✅ **Description**: All styling uses design tokens, no hardcoded values
- 🔍 **Verification**: `pnpm scan:tokens` and check for hardcoded colors/spacing
- 📦 **Affected**: packages/ds, all apps
- 👤 **Roles**: Developers
- 📊 **Status**: DONE
- 🚨 **Risk**: Inconsistent UI, branding issues
- ➡️ **Action**: None required - ESLint enforces token usage

### 0.8.3 Component Library Coverage

- ✅ **Description**: Comprehensive component library covering all UI patterns
- 🔍 **Verification**: `ls packages/ds/src/**/*.tsx | wc -l`
- 📦 **Affected**: packages/ds
- 👤 **Roles**: Developers
- 📊 **Status**: DONE
- 🚨 **Risk**: N/A
- ➡️ **Action**: None required

### 0.8.4 Accessibility Monitoring

- ✅ **Description**: Real-time accessibility metrics tracking
- 🔍 **Verification**: Check AccessibilityMonitoringService in SDK
- 📦 **Affected**: client-sdk, packages/ds
- 👤 **Roles**: All users
- 📊 **Status**: DONE
- 🚨 **Risk**: N/A
- ➡️ **Action**: None required

---

## 0.9 Internationalization (i18n)

### 0.9.1 Norwegian (Bokmål) Support

- ✅ **Description**: Full Norwegian Bokmål translation
- 🔍 **Verification**: Check `packages/i18n/src/locales/nb.ts`
- 📦 **Affected**: packages/i18n, all apps
- 👤 **Roles**: Norwegian users
- 📊 **Status**: DONE (313 keys)
- 🚨 **Risk**: N/A
- ➡️ **Action**: None required

### 0.9.2 English Support

- ✅ **Description**: Full English translation for fallback
- 🔍 **Verification**: Check `packages/i18n/src/locales/en.ts`
- 📦 **Affected**: packages/i18n, all apps
- 👤 **Roles**: English speakers
- 📊 **Status**: DONE (313 keys)
- 🚨 **Risk**: N/A
- ➡️ **Action**: None required

### 0.9.3 Nynorsk Support

- ✅ **Description**: Norwegian Nynorsk translation (Språklova requirement)
- 🔍 **Verification**: Check for `packages/i18n/src/locales/nn.ts`
- 📦 **Affected**: packages/i18n
- 👤 **Roles**: Nynorsk users
- 📊 **Status**: MISSING
- 🚨 **Risk**: May not meet all municipal language requirements
- ➡️ **Action**: Create nn.ts locale file with full translation

### 0.9.4 App i18n Integration

- ✅ **Description**: All apps use i18n for user-facing text
- 🔍 **Verification**: `grep -r "useT\|useI18n" apps/ --include="*.tsx" | wc -l`
- 📦 **Affected**: All apps
- 👤 **Roles**: All users
- 📊 **Status**: PARTIAL
- 🚨 **Risk**: Inconsistent language experience
- ➡️ **Action**: Complete i18n coverage in apps/web (many hardcoded Norwegian strings)

**App i18n Status:**
| App | Files Using i18n | Status |
|-----|------------------|--------|
| apps/backoffice | 15+ | PARTIAL |
| apps/minside | 18+ | ACTIVE |
| apps/web | 2 | MINIMAL |

---

## 0.10 Error Handling

### 0.10.1 RFC 7807 Problem Details

- ✅ **Description**: All API errors conform to RFC 7807 Problem Details format
- 🔍 **Verification**: Check error responses from API endpoints
- 📦 **Affected**: api, client-sdk
- 👤 **Roles**: All
- 📊 **Status**: PARTIAL
- 🚨 **Risk**: Inconsistent error handling, poor developer experience
- ➡️ **Action**: Audit all error responses for RFC 7807 compliance

### 0.10.2 Frontend Error Boundaries

- ✅ **Description**: React error boundaries for graceful failure handling
- 🔍 **Verification**: Check for ErrorBoundary components in apps
- 📦 **Affected**: All apps
- 👤 **Roles**: All users
- 📊 **Status**: DONE
- 🚨 **Risk**: White screen crashes
- ➡️ **Action**: None required

---

## Phase 0 Summary

### Overall Status Matrix

| Category | Items | DONE | PARTIAL | MISSING |
|----------|-------|------|---------|---------|
| Architecture | 5 | 4 | 1 | 0 |
| Authentication | 5 | 3 | 2 | 0 |
| RBAC | 5 | 0 | 3 | 2 |
| Audit Logging | 6 | 2 | 2 | 2 |
| SDK Coverage | 4 | 4 | 0 | 0 |
| API Routes | 5 | 3 | 2 | 0 |
| Frontend Apps | 4 | 2 | 2 | 0 |
| Design System | 4 | 4 | 0 | 0 |
| i18n | 4 | 2 | 1 | 1 |
| Error Handling | 2 | 1 | 1 | 0 |
| **TOTAL** | **44** | **25 (57%)** | **14 (32%)** | **5 (11%)** |

### Critical Gaps Identified

1. **RBAC 7-Role Model** - Only 3/7 roles implemented (43%)
2. **Route-Level Guards** - No permission middleware on API routes
3. **Tenant Isolation Middleware** - Missing cross-tenant protection
4. **Audit Log Integrity** - No hash chain for tamper detection
5. **Audit Retention Policy** - No automated retention/purge

### Verification Confidence

- **High Confidence**: Architecture, SDK, Design System
- **Medium Confidence**: Authentication, API Routes, Frontend Apps
- **Low Confidence**: RBAC (schema/matrix mismatch), Audit (incomplete coverage)

### Recommended Phase 1 Priorities

Based on this baseline analysis, Phase 1 (Core Platform Stability) should prioritize:

1. Expand RBAC from 3 to 7 roles
2. Implement route-level permission guards
3. Add tenant isolation middleware
4. Complete audit logging coverage
5. Implement audit log integrity (hash chain)

---

*Document generated as part of Enterprise Platform Roadmap (Task 041)*
*Analysis based on: api-routes.md, rbac-status.md, audit-status.md, sdk-services.md, sdk-hooks.md, app-web.md, app-backoffice.md, app-minside.md, i18n-status.md, ds-compliance.md*
