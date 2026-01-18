# RBAC & Entitlements Matrix

> **Last Updated**: 2026-01-18  
> **Status**: In Progress

## Role Definitions

| Role | System Level | App Access | Description |
|------|--------------|------------|-------------|
| `super_admin` | Platform | All | SaaS platform administrator |
| `admin` | Tenant | Backoffice | Tenant-wide administrator |
| `saksbehandler` | Tenant | Backoffice | Case handler / approver |
| `org_admin` | Organization | Backoffice, MinSide | Org administrator with delegation |
| `org_member` | Organization | Backoffice, MinSide | Limited org member |
| `user` | User | MinSide, Web | Registered end user |
| `citizen` | Public | Web | Unauthenticated visitor |

---

## Module Entitlements

| Module | Free | Starter | Professional | Enterprise |
|--------|:----:|:-------:|:------------:|:----------:|
| `favorites` | ✅ | ✅ | ✅ | ✅ |
| `share` | ✅ | ✅ | ✅ | ✅ |
| `feedback` | ✅ | ✅ | ✅ | ✅ |
| `rating` | ❌ | ✅ | ✅ | ✅ |
| `recommendations` | ❌ | ❌ | ✅ | ✅ |
| `recurringBookings` | ❌ | ❌ | ✅ | ✅ |
| `seasonalLeases` | ❌ | ❌ | ❌ | ✅ |

---

## Integration Entitlements

| Integration | Free | Starter | Professional | Enterprise |
|-------------|:----:|:-------:|:------------:|:----------:|
| `vipps` | ❌ | ✅ | ✅ | ✅ |
| `outlook` | ❌ | ❌ | ✅ | ✅ |
| `visma` | ❌ | ❌ | ❌ | ✅ |
| `rco` | ❌ | ❌ | ❌ | ✅ |
| `acos` | ❌ | ❌ | ❌ | ✅ |

---

## Feature Entitlements

| Feature | Free | Starter | Professional | Enterprise |
|---------|:----:|:-------:|:------------:|:----------:|
| `customBranding` | ❌ | ❌ | ✅ | ✅ |
| `advancedReporting` | ❌ | ❌ | ✅ | ✅ |
| `apiAccess` | ❌ | ❌ | ❌ | ✅ |
| `prioritySupport` | ❌ | ❌ | ❌ | ✅ |
| `whiteLabel` | ❌ | ❌ | ❌ | ✅ |

---

## Route Access by Role

### Backoffice Routes

| Route | admin | saksbehandler | org_admin | org_member |
|-------|:-----:|:-------------:|:---------:|:----------:|
| `/` (Dashboard) | ✅ | ✅ | ✅ | ✅ |
| `/bookings` | ✅ | ✅ | ✅* | ✅* |
| `/work-queue` | ✅ | ✅ | ❌ | ❌ |
| `/calendar` | ✅ | ✅ | ✅* | ✅* |
| `/rental-objects` | ✅ | ❌ | ✅* | ❌ |
| `/organizations` | ✅ | ❌ | ✅ | ❌ |
| `/users` | ✅ | ❌ | ✅* | ❌ |
| `/settings` | ✅ | ❌ | ❌ | ❌ |
| `/tenant/*` | ✅ | ❌ | ❌ | ❌ |
| `/economy/*` | ✅ | ❌ | ❌ | ❌ |
| `/help` | ✅ | ✅ | ✅ | ✅ |
| `/messages` | ✅ | ✅ | ✅* | ✅* |

*Scoped to granted rental objects only

### MinSide Routes

| Route | user | org_admin | org_member |
|-------|:----:|:---------:|:----------:|
| `/` (Dashboard) | ✅ | ✅ | ✅ |
| `/bookings` | ✅ | ✅ | ✅ |
| `/favorites` | ✅ | ✅ | ✅ |
| `/profile` | ✅ | ✅ | ✅ |
| `/organization` | ❌ | ✅ | ✅ |
| `/org-bookings` | ❌ | ✅ | ✅* |
| `/custody` | ❌ | ✅ | ❌ |

---

## Sidebar Items by Role

### Backoffice Navigation

| Nav Item | admin | saksbehandler | org_admin | org_member |
|----------|:-----:|:-------------:|:---------:|:----------:|
| Dashboard | ✅ | ✅ | ✅ | ✅ |
| Bookings | ✅ | ✅ | ✅ | ✅ |
| Work Queue | ✅ | ✅ | ❌ | ❌ |
| Calendar | ✅ | ✅ | ✅ | ✅ |
| Rental Objects | ✅ | ❌ | ✅ | ❌ |
| Organizations | ✅ | ❌ | ✅ | ❌ |
| Members | ✅ | ❌ | ✅ | ❌ |
| Users | ✅ | ❌ | ❌ | ❌ |
| Messages | ✅ | ✅ | ✅ | ✅ |
| Economy | ✅ | ❌ | ❌ | ❌ |
| Reports | ✅ | ❌ | ❌ | ❌ |
| Settings | ✅ | ❌ | ❌ | ❌ |
| Tenant Config | ✅ | ❌ | ❌ | ❌ |
| Help | ✅ | ✅ | ✅ | ✅ |

---

## Custody Scopes

| Scope | Description | Subdelegatable |
|-------|-------------|:--------------:|
| `RO_VIEW` | View rental object details | ✅ |
| `RO_EDIT` | Edit rental object metadata | ✅ |
| `RO_MEDIA` | Manage images/attachments | ✅ |
| `RO_MAINTENANCE` | Mark maintenance status | ✅ |
| `RO_BOOKING_MANAGE` | Approve/reject bookings | ✅ |
| `RO_PRICING` | Edit pricing rules | ❌ |
| `RO_REPORTING` | Access reports | ❌ |
| `RO_DELEGATE` | Subdelegate to others | ❌ |

---

## Precedence Rules

1. **Kill Switch** (global disable) > all
2. **Tenant Override** > Plan Defaults
3. **Plan Defaults** > Global Defaults
4. **Least Privilege Wins** (most restrictive applies)

---

## Test Coverage for RBAC

| Test Area | Files | Status |
|-----------|-------|--------|
| Role validation | `tests/integration/rbac-flow.test.ts` | ✅ |
| Permission checks | `tests/integration/acl-flow.test.ts` | ✅ |
| Route guards | `tests/e2e/backoffice/rbac/*` | ✅ |
| Sidebar filtering | `tests/e2e/backoffice/blur-eye/shell.spec.ts` | ✅ |
| Custody evaluation | `tests/unit/custody-evaluator.test.ts` | ✅ |
| Entitlement precedence | `tests/unit/saas/feature-flag-evaluation.test.ts` | ✅ |
| Org-scoped views | `tests/e2e/backoffice/org-*-flow.spec.ts` | ✅ |
