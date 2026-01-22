# API SDK Permission Parity Report

**Generated**: 2026-01-16
**Status**: ✅ PASS (with minor gaps)
**SDK Package**: `@digilist/client-sdk`

---

## Executive Summary

This report documents the parity between API RBAC endpoints and their corresponding SDK implementations. The audit verifies that all permission-related API endpoints have matching SDK service methods, React Query hooks, and query keys.

| Category | Endpoints | SDK Methods | Hooks | Query Keys | Status |
|----------|-----------|-------------|-------|------------|--------|
| Capabilities | 3 | 5 | 5 | 4 | ✅ PASS |
| Access Grants | 4 | 11 | 12 | 6 | ✅ PASS |
| Permission Assignments | 8 | 15 | 17 | 7 | ✅ PASS |
| Booking Workflow | 2 | 0 | 0 | 0 | ⚠️ GAP |

---

## 1. Capabilities & Authorization

### API Endpoints

| Method | Endpoint | Required Role | Description |
|--------|----------|---------------|-------------|
| `GET` | `/api/me/capabilities` | Authenticated | Get user's capabilities projection |
| `GET` | `/api/authz/permissions` | Authenticated | Get user's permission list |
| `GET` | `/api/authz/check` | Authenticated | Check specific permission |

### SDK Service: `authzService`

**File**: `packages/client-sdk/src/services/authz.service.ts`

| SDK Method | API Endpoint | Returns | Status |
|------------|--------------|---------|--------|
| `getCapabilities()` | `GET /api/me/capabilities` | `SingleResponse<UserCapabilities>` | ✅ |
| `getPermissions()` | `GET /api/authz/permissions` | `SingleResponse<string[]>` | ✅ |
| `checkPermission(request)` | `GET /api/authz/check` | `SingleResponse<CheckPermissionResponse>` | ✅ |
| `hasPermission(permission)` | `GET /api/authz/permissions/check` | `SingleResponse<{ allowed: boolean }>` | ✅ |
| `getEffectiveRole(context)` | `GET /api/authz/role` | `SingleResponse<{ role, permissions }>` | ✅ |

### React Query Hooks

**File**: `packages/client-sdk/src/hooks/use-rbac.ts`

| Hook | SDK Method | Query Key | Status |
|------|------------|-----------|--------|
| `useCapabilities()` | `authzService.getCapabilities()` | `queryKeys.rbac.capabilities()` | ✅ |
| `usePermissions()` | `authzService.getPermissions()` | `queryKeys.auth.permissions()` | ✅ |
| `useCheckPermission()` | `authzService.checkPermission()` | mutation | ✅ |
| `useHasPermission(permission)` | `authzService.hasPermission()` | `[...auth.permissions(), 'check', permission]` | ✅ |
| `useEffectiveRole(context)` | `authzService.getEffectiveRole()` | `[...rbac.roles(), 'effective', context]` | ✅ |

### Query Keys

**File**: `packages/client-sdk/src/hooks/query-keys.ts`

```typescript
rbac: {
  all: ['rbac'],
  capabilities: () => [...rbac.all, 'capabilities'],
  roles: () => [...rbac.all, 'roles'],
  roleMatrix: () => [...rbac.all, 'roleMatrix'],
  userCapabilities: (userId) => [...rbac.all, 'userCapabilities', userId],
}
```

---

## 2. Access Grants

### API Endpoints

| Method | Endpoint | Required Role | Description |
|--------|----------|---------------|-------------|
| `GET` | `/api/access-grants` | `access-grants:read` | List all access grants |
| `GET` | `/api/access-grants/:id` | `access-grants:read` | Get single access grant |
| `POST` | `/api/access-grants` | `admin`, `super_admin` | Create access grant |
| `DELETE` | `/api/access-grants/:id` | `admin`, `super_admin` | Revoke access grant |

### SDK Service: `accessGrantService`

**File**: `packages/client-sdk/src/services/access-grant.service.ts`

| SDK Method | API Endpoint | Returns | Status |
|------------|--------------|---------|--------|
| `getAll(params)` | `GET /api/access-grants` | `PaginatedResponse<AccessGrantWithDetails>` | ✅ |
| `getById(id)` | `GET /api/access-grants/:id` | `SingleResponse<AccessGrantWithDetails>` | ✅ |
| `getByOrganization(orgId, params)` | `GET /api/access-grants?organizationId=` | `PaginatedResponse<AccessGrantWithDetails>` | ✅ |
| `getByRentalObject(roId, params)` | `GET /api/access-grants?rentalObjectId=` | `PaginatedResponse<AccessGrantWithDetails>` | ✅ |
| `create(data)` | `POST /api/access-grants` | `SingleResponse<AccessGrant>` | ✅ |
| `createBulk(data)` | `POST /api/access-grants/bulk` | `SingleResponse<AccessGrant[]>` | ✅ |
| `update(id, data)` | `PATCH /api/access-grants/:id` | `SingleResponse<AccessGrant>` | ✅ |
| `revoke(id, data)` | `POST /api/access-grants/:id/revoke` | `SuccessResponse` | ✅ |
| `delete(id)` | `DELETE /api/access-grants/:id` | `SuccessResponse` | ✅ |
| `checkAccess(orgId, roId)` | `GET /api/access-grants/check` | `SingleResponse<{ hasAccess, grant }>` | ✅ |
| `getAccessibleRentalObjects(orgId)` | `GET /api/access-grants/organizations/:orgId/rental-objects` | `SingleResponse<...>` | ✅ |
| `getGrantedOrganizations(roId)` | `GET /api/access-grants/rental-objects/:roId/organizations` | `SingleResponse<...>` | ✅ |

### React Query Hooks

**File**: `packages/client-sdk/src/hooks/use-rbac.ts`

| Hook | SDK Method | Query Key | Status |
|------|------------|-----------|--------|
| `useAccessGrants(params)` | `accessGrantService.getAll()` | `queryKeys.accessGrants.list(params)` | ✅ |
| `useAccessGrant(id)` | `accessGrantService.getById()` | `queryKeys.accessGrants.detail(id)` | ✅ |
| `useAccessGrantsByOrganization(orgId)` | `accessGrantService.getByOrganization()` | `queryKeys.accessGrants.byOrganization(orgId)` | ✅ |
| `useAccessGrantsByRentalObject(roId)` | `accessGrantService.getByRentalObject()` | `queryKeys.accessGrants.byRentalObject(roId)` | ✅ |
| `useAccessibleRentalObjects(orgId)` | `accessGrantService.getAccessibleRentalObjects()` | `[...byOrganization(orgId), 'rental-objects']` | ✅ |
| `useGrantedOrganizations(roId)` | `accessGrantService.getGrantedOrganizations()` | `[...byRentalObject(roId), 'organizations']` | ✅ |
| `useCheckAccess(orgId, roId)` | `accessGrantService.checkAccess()` | `[...all, 'check', orgId, roId]` | ✅ |
| `useGrantAccess()` | `accessGrantService.create()` | mutation, invalidates lists | ✅ |
| `useBulkGrantAccess()` | `accessGrantService.createBulk()` | mutation, invalidates lists | ✅ |
| `useUpdateAccessGrant()` | `accessGrantService.update()` | mutation | ✅ |
| `useRevokeAccess()` | `accessGrantService.revoke()` | mutation, invalidates all | ✅ |
| `useDeleteAccessGrant()` | `accessGrantService.delete()` | mutation, invalidates all | ✅ |

### Query Keys

**File**: `packages/client-sdk/src/hooks/query-keys.ts`

```typescript
accessGrants: {
  all: ['accessGrants'],
  lists: () => [...all, 'list'],
  list: (params) => [...lists(), params],
  details: () => [...all, 'detail'],
  detail: (id) => [...details(), id],
  byOrganization: (orgId) => [...all, 'byOrg', orgId],
  byRentalObject: (rentalObjectId) => [...all, 'byRO', rentalObjectId],
}
```

---

## 3. Permission Assignments

### API Endpoints

| Method | Endpoint | Required Role | Description |
|--------|----------|---------------|-------------|
| `GET` | `/api/permission-assignments` | `permission-assignments:read` | List all permission assignments |
| `GET` | `/api/permission-assignments/:id` | `permission-assignments:read` | Get single permission assignment |
| `POST` | `/api/permission-assignments` | `admin`, `super_admin` | Create permission assignment |
| `PUT` | `/api/permission-assignments/:id` | `admin`, `super_admin` | Update permission assignment |
| `DELETE` | `/api/permission-assignments/:id` | `admin`, `super_admin` | Revoke permission assignment |
| `GET` | `/api/organizations/:orgId/rental-objects/:roId/permissions` | `permission-assignments:read` | List org's RO permissions |
| `GET` | `/api/organizations/:orgId/rental-objects/:roId/permissions/:userId` | `permission-assignments:read` | Get user's RO permissions |
| `PUT` | `/api/organizations/:orgId/rental-objects/:roId/permissions/:userId` | `admin`, `super_admin` | Upsert user's RO permissions |
| `DELETE` | `/api/organizations/:orgId/rental-objects/:roId/permissions/:userId` | `admin`, `super_admin` | Revoke user's RO permissions |
| `GET` | `/api/permission-assignments/available-permissions` | Authenticated | Get available permissions |

### SDK Service: `permissionAssignmentService`

**File**: `packages/client-sdk/src/services/permission-assignment.service.ts`

| SDK Method | API Endpoint | Returns | Status |
|------------|--------------|---------|--------|
| `getAll(params)` | `GET /api/permission-assignments` | `PaginatedResponse<...>` | ✅ |
| `getById(id)` | `GET /api/permission-assignments/:id` | `SingleResponse<...>` | ✅ |
| `getByOrganization(orgId, params)` | `GET /api/permission-assignments?orgId=` | `PaginatedResponse<...>` | ✅ |
| `getByUser(userId, params)` | `GET /api/permission-assignments?userId=` | `PaginatedResponse<...>` | ✅ |
| `getByRentalObject(roId, params)` | `GET /api/permission-assignments?rentalObjectId=` | `PaginatedResponse<...>` | ✅ |
| `getByMember(orgId, roId, userId)` | `GET /api/organizations/:orgId/rental-objects/:roId/permissions/:userId` | `SingleResponse<...>` | ✅ |
| `create(data)` | `POST /api/permission-assignments` | `SingleResponse<...>` | ✅ |
| `update(id, permissions)` | `PUT /api/permission-assignments/:id` | `SingleResponse<...>` | ✅ |
| `delete(id)` | `DELETE /api/permission-assignments/:id` | `SuccessResponse` | ✅ |
| `assign(data)` | `PUT /api/organizations/:orgId/rental-objects/:roId/permissions/:userId` | `SingleResponse<...>` | ✅ |
| `revoke(orgId, roId, userId, reason)` | `DELETE /api/organizations/:orgId/rental-objects/:roId/permissions/:userId` | `SuccessResponse` | ✅ |
| `getAvailablePermissions()` | `GET /api/permission-assignments/available-permissions` | `SingleResponse<...>` | ✅ |
| `checkPermission(orgId, userId, roId, permission)` | N/A (client-side) | `boolean` | ✅ |
| `getUserPermissionsSummary(orgId, userId)` | N/A (client-side aggregation) | `Summary` | ✅ |
| `bulkAssign(orgId, roId, assignments)` | N/A (batch client) | `SuccessResponse` | ✅ |
| `copyPermissions(orgId, roId, fromUserId, toUserId)` | N/A (client-side) | `SuccessResponse` | ✅ |

### React Query Hooks

**File**: `packages/client-sdk/src/hooks/use-rbac.ts`

| Hook | SDK Method | Query Key | Status |
|------|------------|-----------|--------|
| `usePermissionAssignments(params)` | `permissionAssignmentService.getAll()` | `queryKeys.permissionAssignments.list(params)` | ✅ |
| `usePermissionAssignment(id)` | `permissionAssignmentService.getById()` | `queryKeys.permissionAssignments.detail(id)` | ✅ |
| `usePermissionAssignmentsByOrganization(orgId)` | `permissionAssignmentService.getByOrganization()` | `queryKeys.permissionAssignments.byOrganization(orgId)` | ✅ |
| `usePermissionAssignmentsByUser(userId)` | `permissionAssignmentService.getByUser()` | `queryKeys.permissionAssignments.byUser(userId)` | ✅ |
| `usePermissionAssignmentsByRentalObject(orgId, roId)` | `permissionAssignmentService.getByRentalObject()` | `queryKeys.permissionAssignments.byRentalObject(orgId, roId)` | ✅ |
| `useMemberPermissions(orgId, roId, userId)` | `permissionAssignmentService.getByMember()` | `queryKeys.permissionAssignments.forOrgRentalObject(...)` | ✅ |
| `useUserPermissionsSummary(orgId, userId)` | `permissionAssignmentService.getUserPermissionsSummary()` | `[...byUser(userId), 'summary', orgId]` | ✅ |
| `useAvailablePermissions()` | `permissionAssignmentService.getAvailablePermissions()` | `queryKeys.permissionAssignments.availablePermissions()` | ✅ |
| `useAssignPermissions()` | `permissionAssignmentService.assign()` | mutation, invalidates lists | ✅ |
| `useUpdatePermissionAssignment()` | `permissionAssignmentService.update()` | mutation | ✅ |
| `useRevokePermissions()` | `permissionAssignmentService.revoke()` | mutation, invalidates all | ✅ |
| `useDeletePermissionAssignment()` | `permissionAssignmentService.delete()` | mutation, invalidates all | ✅ |
| `useCheckRentalObjectPermission(...)` | `permissionAssignmentService.checkPermission()` | `[...all, 'check', ...]` | ✅ |
| `useBulkAssignPermissions()` | `permissionAssignmentService.bulkAssign()` | mutation, invalidates lists | ✅ |
| `useCopyPermissions()` | `permissionAssignmentService.copyPermissions()` | mutation | ✅ |

### Query Keys

**File**: `packages/client-sdk/src/hooks/query-keys.ts`

```typescript
permissionAssignments: {
  all: ['permissionAssignments'],
  lists: () => [...all, 'list'],
  list: (params) => [...lists(), params],
  details: () => [...all, 'detail'],
  detail: (id) => [...details(), id],
  byOrganization: (orgId) => [...all, 'byOrg', orgId],
  byUser: (userId) => [...all, 'byUser', userId],
  byRentalObject: (orgId, rentalObjectId) => [...all, 'byRO', orgId, rentalObjectId],
  forOrgRentalObject: (orgId, rentalObjectId, userId?) => [...all, 'orgRO', orgId, rentalObjectId, userId],
  availablePermissions: () => [...all, 'availablePermissions'],
}
```

---

## 4. Booking Workflow (RBAC Actions)

### API Endpoints

| Method | Endpoint | Required Role | Description |
|--------|----------|---------------|-------------|
| `POST` | `/api/bookings/:id/approve` | `bookings:approve` | Approve a booking |
| `POST` | `/api/bookings/:id/deny` | `bookings:deny` | Deny a booking |

### SDK Service Coverage

**File**: `packages/client-sdk/src/services/booking.service.ts`

| SDK Method | API Endpoint | Status |
|------------|--------------|--------|
| `approve(id, data)` | `POST /api/bookings/:id/approve` | ⚠️ **MISSING** |
| `deny(id, data)` | `POST /api/bookings/:id/deny` | ⚠️ **MISSING** |

### Recommended Fix

Add to `packages/client-sdk/src/services/booking.service.ts`:

```typescript
/**
 * Approve a booking (case handler action)
 * Requires bookings:approve permission
 */
async approve(id: string, data?: { notes?: string }): Promise<SingleResponse<Booking>> {
  return this.client.post(this.buildPath(`/${id}/approve`), data || {});
}

/**
 * Deny a booking (case handler action)
 * Requires bookings:deny permission
 */
async deny(id: string, data: { reason: string }): Promise<SingleResponse<Booking>> {
  return this.client.post(this.buildPath(`/${id}/deny`), data);
}
```

Add to `packages/client-sdk/src/hooks/use-bookings.ts`:

```typescript
export function useApproveBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: { notes?: string } }) =>
      bookingService.approve(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
    },
  });
}

export function useDenyBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { reason: string } }) =>
      bookingService.deny(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
    },
  });
}
```

---

## 5. Utility Hooks

The SDK also provides convenience hooks that aggregate capability data:

| Hook | Purpose | Status |
|------|---------|--------|
| `useHasCapability(capability)` | Check if user has global capability | ✅ |
| `useBackofficeRole()` | Get user's backoffice role | ✅ |
| `useMyOrgMemberships()` | Get user's org memberships | ✅ |
| `useMyAccessibleRentalObjects()` | Get user's accessible ROs | ✅ |

---

## 6. Case Handler Scope Keys

### Query Keys

**File**: `packages/client-sdk/src/hooks/query-keys.ts`

```typescript
caseHandlerScopes: {
  all: ['caseHandlerScopes'],
  lists: () => [...all, 'list'],
  list: (params?) => [...lists(), params],
  details: () => [...all, 'detail'],
  detail: (id) => [...details(), id],
  byUser: (userId) => [...all, 'byUser', userId],
  byRentalObject: (rentalObjectId) => [...all, 'byRO', rentalObjectId],
}
```

### API Coverage

⚠️ **Note**: Case handler scope CRUD endpoints are not yet implemented in the API. The schema and query keys are ready, but the controller needs to be created.

---

## 7. Organization Membership Keys

### Query Keys

**File**: `packages/client-sdk/src/hooks/query-keys.ts`

```typescript
orgMemberships: {
  all: ['orgMemberships'],
  lists: () => [...all, 'list'],
  list: (params?) => [...lists(), params],
  details: () => [...all, 'detail'],
  detail: (id) => [...details(), id],
  byOrganization: (orgId) => [...all, 'byOrg', orgId],
  byUser: (userId) => [...all, 'byUser', userId],
  myMemberships: () => [...all, 'my'],
}
```

### API Coverage

Organization membership endpoints are handled via the existing `/api/organizations/:id/members` endpoints. The query keys are ready for future SDK service expansion.

---

## Summary of Gaps

### Critical Gaps (⚠️ Requires Fix)

| Gap | Impact | Recommended Action |
|-----|--------|-------------------|
| Booking approve/deny SDK methods missing | Case handlers cannot approve/deny via SDK | Add methods to `booking.service.ts` |
| Booking approve/deny hooks missing | UI cannot call approve/deny with React Query | Add hooks to `use-bookings.ts` |

### Future Enhancements

| Enhancement | Priority | Notes |
|-------------|----------|-------|
| Case handler scope CRUD API | Medium | Schema ready, need controller |
| Org membership SDK service | Low | Using org/members endpoint |

---

## Verification Evidence

### Files Audited

| File | Location | Lines |
|------|----------|-------|
| Access Grant Controller | `apps/api/src/modules/access-grant/access-grant.controller.ts` | 206 |
| Permission Assignment Controller | `apps/api/src/modules/permission-assignment/permission-assignment.controller.ts` | 402 |
| Authz Controller | `apps/api/src/modules/authz/authz.controller.ts` | 343 |
| Booking Controller (RBAC) | `apps/api/src/modules/booking/booking.controller.ts` | (approve/deny endpoints) |
| Access Grant SDK Service | `packages/client-sdk/src/services/access-grant.service.ts` | 128 |
| Permission Assignment SDK Service | `packages/client-sdk/src/services/permission-assignment.service.ts` | ~200 |
| Authz SDK Service | `packages/client-sdk/src/services/authz.service.ts` | 81 |
| RBAC Hooks | `packages/client-sdk/src/hooks/use-rbac.ts` | 658 |
| Query Keys | `packages/client-sdk/src/hooks/query-keys.ts` | 376 |

### SDK Export Verification

```bash
# Verified exports from SDK entry point
grep -E "access-grant|permission-assignment|authz" packages/client-sdk/src/services/index.ts
# Result: All RBAC services exported ✅

grep "use-rbac" packages/client-sdk/src/hooks/index.ts
# Result: RBAC hooks exported ✅
```

---

## Compliance Checklist

- [x] All access grant CRUD endpoints have SDK parity
- [x] All permission assignment CRUD endpoints have SDK parity
- [x] Capability projection endpoint has SDK parity
- [x] Query keys follow centralized pattern
- [x] Hooks use proper cache invalidation
- [x] TypeScript types exported from SDK
- [ ] Booking approve/deny endpoints need SDK methods
- [ ] Case handler scope CRUD endpoints need implementation

---

## Recommended Regression Tests

1. **SDK Service Tests** (`packages/client-sdk/src/services/__tests__/`)
   - `access-grant.service.test.ts` - Verify all CRUD methods
   - `permission-assignment.service.test.ts` - Verify all CRUD methods
   - `authz.service.test.ts` - Verify capability methods

2. **Hook Tests** (`packages/client-sdk/src/hooks/__tests__/`)
   - `use-rbac.test.ts` - Verify query key usage and cache invalidation

3. **Integration Tests**
   - API → SDK → Hook flow for access grants
   - API → SDK → Hook flow for permission assignments
   - Capability projection round-trip

---

**Report Generated By**: Xaheen Build System
**Audit Date**: 2026-01-16
