# Backoffice Role Audit

> Complete audit of role implementation for Org Admin and Org Member.
> Generated: 2026-01-18

## Role Constants & Enums

### File Locations
| File | Purpose |
|------|---------|
| `apps/api/src/modules/auth/rbac.ts` | Server-side role definitions |
| `packages/client-sdk/src/types/rbac.ts` | SDK types for RBAC |
| `apps/backoffice/src/hooks/useBackofficeRole.ts` | Backoffice role hook |
| `apps/backoffice/src/providers/BackofficeRoleProvider.tsx` | Role context provider |

### Role Hierarchy

```
Level 100 - SaaS Platform
├── SAAS_SUPER_ADMIN
├── SAAS_BILLING_ADMIN
└── SAAS_SUPPORT_AGENT

Level 80 - Tenant Admin
├── TENANT_ADMIN (inherits COMMUNE_ADMIN)
├── TENANT_BILLING_ADMIN
└── TENANT_TECH_ADMIN

Level 60 - Commune (Backoffice)
├── admin (COMMUNE_ADMIN, inherits COMMUNE_CASE_HANDLER)
└── saksbehandler (COMMUNE_CASE_HANDLER, inherits user)

Level 40 - Organization
├── org_admin (ORG_ADMIN, inherits ORG_CASE_HANDLER)
├── org_saksbehandler (ORG_CASE_HANDLER, inherits ORG_MEMBER)
└── org_member (ORG_MEMBER, inherits user)

Level 20 - Base
└── user
```

### Organization Membership Roles
```typescript
type OrgMembershipRole = 'admin' | 'case_handler' | 'member';
```

---

## Org Context Switching

### How User Selects Org Context
1. **Login** → User authenticates via BankID/credentials
2. **Org Resolution** → API returns `orgMemberships[]` in user capabilities
3. **Context Selection** → UI presents org selector if multiple memberships
4. **Session Storage** → Selected `organizationId` stored in session
5. **API Requests** → `X-Organization-Id` header sent with requests

### Session/Claims Structure
```typescript
interface UserCapabilities {
  systemRole: string;
  backofficeRole: BackofficeRole;
  tenantId: string;
  orgMemberships: {
    organizationId: string;
    organizationName: string;
    orgRole: OrgMembershipRole;
    status: OrgMembershipStatus;
  }[];
  accessibleRentalObjects: {
    rentalObjectId: string;
    permissions: RentalObjectPermission[];
  }[];
}
```

---

## Role Permissions

### ORG_ADMIN Permissions
| Resource | Actions | Scope | Notes |
|----------|---------|-------|-------|
| listings | * (all) | org | Via access grants |
| bookings | * (all) | org | On behalf of org |
| users | read | org | View org members |
| calendar | * (all) | org | Org's rental objects |
| messages | * (all) | org | Org communications |
| seasonal-leases | * (all) | org | Seasonal bookings |

### ORG_MEMBER Permissions
| Resource | Actions | Scope | Notes |
|----------|---------|-------|-------|
| listings | read | org | View only |
| bookings | read, create | org | Cannot cancel/modify others' |
| messages | read, create | org | Org communications |

---

## Routes & Guards

### Backoffice Routes (Org Roles)

| Route | ORG_ADMIN | ORG_MEMBER | Guard |
|-------|-----------|------------|-------|
| `/` | ✅ | ✅ | Dashboard |
| `/bookings` | ✅ | ✅ (limited) | `CAP_NAV_BOOKINGS` |
| `/calendar` | ✅ | ✅ (read) | `CAP_NAV_CALENDAR` |
| `/messages` | ✅ | ✅ | Feature flag |
| `/organizations` | ✅ | ❌ | `CAP_ORG_ADMIN` |
| `/users` | ❌ | ❌ | `CAP_USER_ADMIN` |
| `/settings` | ❌ | ❌ | `CAP_SYSTEM_CONFIG` |
| `/rental-objects` | ❌ | ❌ | Admin only |
| `/work-queue` | ✅ | ❌ | `CAP_BOOKING_APPROVE` |
| `/reports` | ✅ | ❌ | Feature flag |

### MinSide Routes (End-User Org Context)

| Route | ORG_ADMIN | ORG_MEMBER | Notes |
|-------|-----------|------------|-------|
| `/org/dashboard` | ✅ | ✅ | Org overview |
| `/org/bookings` | ✅ | ✅ | Org bookings |
| `/org/members` | ✅ | ❌ | Member management |
| `/org/settings` | ✅ | ❌ | Org settings |
| `/org/billing` | ✅ | ❌ | If economy enabled |

---

## Feature Flags

| Flag | Affects Org Roles |
|------|------------------|
| `FEATURE_MESSAGING` | Messages visible to org roles |
| `FEATURE_ECONOMY` | Invoices/billing for org admin |
| `FEATURE_REPORTS` | Reports for org admin |
| `FEATURE_ORG_BOOKING` | Org booking-on-behalf flows |

---

## Endpoints (Org-Scoped)

### Org Member Management
```
GET    /api/organizations/:orgId/members
POST   /api/organizations/:orgId/members/invite
PATCH  /api/organizations/:orgId/members/:userId
DELETE /api/organizations/:orgId/members/:userId
```

### Org Bookings
```
GET    /api/organizations/:orgId/bookings
POST   /api/organizations/:orgId/bookings
GET    /api/organizations/:orgId/bookings/:id
PATCH  /api/organizations/:orgId/bookings/:id
DELETE /api/organizations/:orgId/bookings/:id
```

### Org Profile
```
GET    /api/organizations/:orgId
PATCH  /api/organizations/:orgId
```

### Org Reports/Export
```
GET    /api/organizations/:orgId/reports
GET    /api/organizations/:orgId/exports/:type
```

---

## Test Coverage Gaps

### Currently Missing
1. ❌ ORG_ADMIN E2E journeys
2. ❌ ORG_MEMBER E2E journeys
3. ❌ Org context switching tests
4. ❌ Cross-org boundary tests (IDOR)
5. ❌ Org-scoped audit trail verification
6. ❌ Org role deep-link blocking tests

### Partially Covered
1. 🔶 RBAC-MATRIX.json has org_member/org_leader rules (not tested)
2. 🔶 Backoffice sidebar crawl (doesn't test org context)

---

_Last Updated: 2026-01-18_
