# Backoffice Role × Capability × Scope Matrix

> Authoritative matrix of role permissions with API/SDK/UI mappings.
> Generated: 2026-01-18

## Matrix Legend

| Symbol | Meaning |
|--------|---------|
| ✅ ALLOW | Action permitted |
| ❌ DENY | Action forbidden (403) |
| 📖 READONLY | Read-only access |
| 🔒 SCOPE | Limited to specific scope |

---

## ORG_ADMIN Matrix

| Capability | Expected | Scope | API Endpoint | SDK Method | UI Route |
|------------|----------|-------|--------------|------------|----------|
| Dashboard View | ✅ ALLOW | org | `GET /api/dashboard` | `useDashboard()` | `/` |
| Listings View | ✅ ALLOW | org | `GET /api/listings` | `useListings()` | `/listings` |
| Listings Create | ❌ DENY | - | - | - | - |
| Bookings View | ✅ ALLOW | org | `GET /api/orgs/:id/bookings` | `useOrgBookings()` | `/bookings` |
| Bookings Create | ✅ ALLOW | org | `POST /api/orgs/:id/bookings` | `useCreateBooking()` | `/bookings/new` |
| Bookings Approve | ✅ ALLOW | org | `POST /api/bookings/:id/approve` | `useApproveBooking()` | Work Queue |
| Bookings Cancel | ✅ ALLOW | org | `DELETE /api/bookings/:id` | `useCancelBooking()` | Booking detail |
| Members View | ✅ ALLOW | org | `GET /api/orgs/:id/members` | `useOrgMembers()` | `/org/members` |
| Members Invite | ✅ ALLOW | org | `POST /api/orgs/:id/members/invite` | `useInviteMember()` | `/org/members` |
| Members Remove | ✅ ALLOW | org | `DELETE /api/orgs/:id/members/:uid` | `useRemoveMember()` | `/org/members` |
| Members Role | ✅ ALLOW | org | `PATCH /api/orgs/:id/members/:uid` | `useUpdateMember()` | `/org/members` |
| Org Profile View | ✅ ALLOW | org | `GET /api/orgs/:id` | `useOrganization()` | `/org/settings` |
| Org Profile Update | ✅ ALLOW | org | `PATCH /api/orgs/:id` | `useUpdateOrg()` | `/org/settings` |
| Calendar View | ✅ ALLOW | org | `GET /api/calendar` | `useCalendar()` | `/calendar` |
| Calendar Block | ✅ ALLOW | org | `POST /api/blocks` | `useCreateBlock()` | `/calendar` |
| Messages View | ✅ ALLOW | org | `GET /api/messages` | `useMessages()` | `/messages` |
| Messages Send | ✅ ALLOW | org | `POST /api/messages` | `useSendMessage()` | `/messages` |
| Reports View | ✅ ALLOW | org | `GET /api/orgs/:id/reports` | `useOrgReports()` | `/reports` |
| Reports Export | ✅ ALLOW | org | `GET /api/orgs/:id/exports` | `useExport()` | `/reports` |
| Audit View | ✅ ALLOW | org | `GET /api/orgs/:id/audit` | `useOrgAudit()` | `/org/audit` |
| Settings View | ❌ DENY | - | - | - | - |
| Users Manage | ❌ DENY | - | - | - | - |
| Tenant Admin | ❌ DENY | - | - | - | - |

---

## ORG_MEMBER Matrix

| Capability | Expected | Scope | API Endpoint | SDK Method | UI Route |
|------------|----------|-------|--------------|------------|----------|
| Dashboard View | ✅ ALLOW | org | `GET /api/dashboard` | `useDashboard()` | `/` |
| Listings View | ✅ ALLOW | org | `GET /api/listings` | `useListings()` | `/listings` |
| Listings Create | ❌ DENY | - | - | - | - |
| Bookings View | ✅ ALLOW | org | `GET /api/orgs/:id/bookings` | `useOrgBookings()` | `/bookings` |
| Bookings Create | ✅ ALLOW | org | `POST /api/orgs/:id/bookings` | `useCreateBooking()` | `/bookings/new` |
| Bookings Approve | ❌ DENY | - | - | - | - |
| Bookings Cancel | 📖 READONLY | own | Only own bookings | - | - |
| Members View | ❌ DENY | - | - | - | - |
| Members Invite | ❌ DENY | - | - | - | - |
| Members Remove | ❌ DENY | - | - | - | - |
| Members Role | ❌ DENY | - | - | - | - |
| Org Profile View | 📖 READONLY | org | `GET /api/orgs/:id` | `useOrganization()` | `/org` |
| Org Profile Update | ❌ DENY | - | - | - | - |
| Calendar View | ✅ ALLOW | org | `GET /api/calendar` | `useCalendar()` | `/calendar` |
| Calendar Block | ❌ DENY | - | - | - | - |
| Messages View | ✅ ALLOW | org | `GET /api/messages` | `useMessages()` | `/messages` |
| Messages Send | ✅ ALLOW | org | `POST /api/messages` | `useSendMessage()` | `/messages` |
| Reports View | ❌ DENY | - | - | - | - |
| Reports Export | ❌ DENY | - | - | - | - |
| Audit View | ❌ DENY | - | - | - | - |
| Settings View | ❌ DENY | - | - | - | - |
| Users Manage | ❌ DENY | - | - | - | - |

---

## Boundary Tests Required

### Cross-Org Boundary (IDOR)
| Test | Expected |
|------|----------|
| Org A admin reads Org B bookings | 403/404 |
| Org A member reads Org B members | 403/404 |
| Swap orgId in URL | 403/404 |
| Swap bookingId from different org | 403/404 |

### Cross-Tenant Boundary
| Test | Expected |
|------|----------|
| Tenant A org admin reads Tenant B | 403/404 |
| JWT from Tenant A used in Tenant B | 401/403 |

---

## Test ID Mapping

| Test Category | Test ID Pattern | Location |
|---------------|-----------------|----------|
| E2E Journey | `OA-*`, `OM-*` | `tests/e2e/backoffice/rbac/` |
| Integration | `INT-ORG-*` | `tests/integration/rbac/` |
| Unit | `UNIT-RBAC-*` | `apps/api/src/middleware/__tests__/` |
| Contract | `CONTRACT-*` | `tests/contract/` |

---

## Audit Event Requirements

Every ALLOW mutation must emit:
```json
{
  "actorId": "user-id",
  "actorRole": "org_admin",
  "tenantId": "tenant-id",
  "organizationId": "org-id",
  "action": "member.invite",
  "entityType": "org_membership",
  "entityId": "membership-id",
  "correlationId": "req-id",
  "timestamp": "ISO-8601"
}
```

---

_Last Updated: 2026-01-18_
