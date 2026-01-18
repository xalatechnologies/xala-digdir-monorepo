# User Management

<cite>
**Referenced Files in This Document**
- [apps/tenant-admin/src/routes/users/index.tsx](file://apps/tenant-admin/src/routes/users/index.tsx)
- [packages/client-sdk/src/services/tenant-admin-user.service.ts](file://packages/client-sdk/src/services/tenant-admin-user.service.ts)
- [apps/api/src/modules/user-management/tenant-admin-user.controller.ts](file://apps/api/src/modules/user-management/tenant-admin-user.controller.ts)
- [apps/api/src/modules/user/user.service.ts](file://apps/api/src/modules/user/user.service.ts)
- [apps/api/src/modules/user/user.controller.ts](file://apps/api/src/modules/user/user.controller.ts)
- [apps/api/src/core/middleware/rbac.middleware.ts](file://apps/api/src/core/middleware/rbac.middleware.ts)
- [apps/api/src/core/rbac/permission-matrix.ts](file://apps/api/src/core/rbac/permission-matrix.ts)
- [apps/api/src/schemas/user.schema.ts](file://apps/api/src/schemas/user.schema.ts)
</cite>

## Table of Contents
1. [Introduction](#introduction)
2. [Project Structure](#project-structure)
3. [Core Components](#core-components)
4. [Architecture Overview](#architecture-overview)
5. [Detailed Component Analysis](#detailed-component-analysis)
6. [Dependency Analysis](#dependency-analysis)
7. [Performance Considerations](#performance-considerations)
8. [Troubleshooting Guide](#troubleshooting-guide)
9. [Conclusion](#conclusion)

## Introduction
This document describes the User Management functionality within the Tenant Admin application. It covers user administration features such as user creation, modification, role assignment, and permission management. It also documents the user listing interface, search and filtering capabilities, bulk user operations, integration with the platform’s RBAC system, tenant administrators’ access control, user lifecycle management, account status controls, and user profile administration.

## Project Structure
The User Management feature spans three layers:
- Frontend (Tenant Admin): Provides the user listing UI, search/filtering, and navigation to create actions.
- Client SDK: Encapsulates typed APIs for user operations and pagination.
- Backend API: Implements REST endpoints, validation, RBAC enforcement, and business logic.

```mermaid
graph TB
subgraph "Tenant Admin Frontend"
TA_UI["UsersPage<br/>apps/tenant-admin/src/routes/users/index.tsx"]
end
subgraph "Client SDK"
SDK_Service["TenantAdminUserService<br/>packages/client-sdk/src/services/tenant-admin-user.service.ts"]
end
subgraph "API Layer"
API_Controller["TenantAdminUserController<br/>apps/api/src/modules/user-management/tenant-admin-user.controller.ts"]
RBAC_MW["RBAC Middleware<br/>apps/api/src/core/middleware/rbac.middleware.ts"]
Perm_Matrix["Permission Matrix<br/>apps/api/src/core/rbac/permission-matrix.ts"]
User_Service["UserService<br/>apps/api/src/modules/user/user.service.ts"]
User_Controller["UserController<br/>apps/api/src/modules/user/user.controller.ts"]
Schemas["User Schemas<br/>apps/api/src/schemas/user.schema.ts"]
end
TA_UI --> SDK_Service
SDK_Service --> API_Controller
API_Controller --> RBAC_MW
RBAC_MW --> Perm_Matrix
API_Controller --> User_Service
User_Service --> User_Controller
API_Controller --> Schemas
```

**Diagram sources**
- [apps/tenant-admin/src/routes/users/index.tsx](file://apps/tenant-admin/src/routes/users/index.tsx#L1-L135)
- [packages/client-sdk/src/services/tenant-admin-user.service.ts](file://packages/client-sdk/src/services/tenant-admin-user.service.ts#L126-L319)
- [apps/api/src/modules/user-management/tenant-admin-user.controller.ts](file://apps/api/src/modules/user-management/tenant-admin-user.controller.ts#L36-L543)
- [apps/api/src/core/middleware/rbac.middleware.ts](file://apps/api/src/core/middleware/rbac.middleware.ts#L108-L132)
- [apps/api/src/core/rbac/permission-matrix.ts](file://apps/api/src/core/rbac/permission-matrix.ts#L45-L215)
- [apps/api/src/modules/user/user.service.ts](file://apps/api/src/modules/user/user.service.ts#L28-L305)
- [apps/api/src/modules/user/user.controller.ts](file://apps/api/src/modules/user/user.controller.ts#L19-L159)
- [apps/api/src/schemas/user.schema.ts](file://apps/api/src/schemas/user.schema.ts#L88-L98)

**Section sources**
- [apps/tenant-admin/src/routes/users/index.tsx](file://apps/tenant-admin/src/routes/users/index.tsx#L1-L135)
- [packages/client-sdk/src/services/tenant-admin-user.service.ts](file://packages/client-sdk/src/services/tenant-admin-user.service.ts#L126-L319)
- [apps/api/src/modules/user-management/tenant-admin-user.controller.ts](file://apps/api/src/modules/user-management/tenant-admin-user.controller.ts#L36-L543)
- [apps/api/src/modules/user/user.service.ts](file://apps/api/src/modules/user/user.service.ts#L28-L305)
- [apps/api/src/modules/user/user.controller.ts](file://apps/api/src/modules/user/user.controller.ts#L19-L159)
- [apps/api/src/core/middleware/rbac.middleware.ts](file://apps/api/src/core/middleware/rbac.middleware.ts#L108-L132)
- [apps/api/src/core/rbac/permission-matrix.ts](file://apps/api/src/core/rbac/permission-matrix.ts#L45-L215)
- [apps/api/src/schemas/user.schema.ts](file://apps/api/src/schemas/user.schema.ts#L88-L98)

## Core Components
- Tenant Admin Users Page: Renders a paginated table of users with search and a Create button. It fetches data via the SDK hook and applies client-side filtering.
- Tenant Admin User Service: Provides typed methods for listing, inviting, role assignment, organization assignment, status changes, bulk operations, and retrieving effective permissions.
- Tenant Admin User Controller: Exposes REST endpoints for user listing, retrieval, invitations, role/organization assignment, deactivation/reactivation/suspension, bulk operations, and effective permissions.
- User Service: Implements core user operations (create, invite, update, assign role, deactivate/delete) with validation, audit logging, and adapter hooks.
- RBAC Middleware and Permission Matrix: Enforce role-based access control and compute permissions for requests.
- User Schemas: Define validation for user operations and query parameters.

**Section sources**
- [apps/tenant-admin/src/routes/users/index.tsx](file://apps/tenant-admin/src/routes/users/index.tsx#L26-L132)
- [packages/client-sdk/src/services/tenant-admin-user.service.ts](file://packages/client-sdk/src/services/tenant-admin-user.service.ts#L126-L319)
- [apps/api/src/modules/user-management/tenant-admin-user.controller.ts](file://apps/api/src/modules/user-management/tenant-admin-user.controller.ts#L46-L68)
- [apps/api/src/modules/user/user.service.ts](file://apps/api/src/modules/user/user.service.ts#L38-L75)
- [apps/api/src/core/middleware/rbac.middleware.ts](file://apps/api/src/core/middleware/rbac.middleware.ts#L108-L132)
- [apps/api/src/core/rbac/permission-matrix.ts](file://apps/api/src/core/rbac/permission-matrix.ts#L45-L215)
- [apps/api/src/schemas/user.schema.ts](file://apps/api/src/schemas/user.schema.ts#L88-L98)

## Architecture Overview
The Tenant Admin user management follows a layered architecture:
- UI layer (Tenant Admin) renders the Users page and triggers SDK operations.
- SDK layer encapsulates HTTP calls and exposes strongly-typed methods.
- API controller validates inputs, enforces RBAC, and delegates to the user service.
- User service executes business logic, persists changes, logs audits, and integrates with adapters.
- RBAC middleware and permission matrix ensure tenant-level access and role-based permissions.

```mermaid
sequenceDiagram
participant UI as "UsersPage<br/>apps/tenant-admin/src/routes/users/index.tsx"
participant SDK as "TenantAdminUserService<br/>SDK"
participant API as "TenantAdminUserController<br/>API"
participant MW as "RBAC Middleware<br/>requireTenantContext, requireRole"
participant PM as "Permission Matrix"
participant US as "UserService<br/>API"
UI->>SDK : "getAll({ search, page, limit })"
SDK->>API : "GET /api/admin/users"
API->>MW : "preHandler : requireTenantContext, requireRole(['admin','tenant_admin'])"
MW->>PM : "check role and permissions"
PM-->>MW : "authorized"
MW-->>API : "proceed"
API->>US : "findAll(tenantId, params)"
US-->>API : "Paginated users"
API-->>SDK : "200 OK { data, meta }"
SDK-->>UI : "usersData"
UI->>UI : "client-side filter by search"
```

**Diagram sources**
- [apps/tenant-admin/src/routes/users/index.tsx](file://apps/tenant-admin/src/routes/users/index.tsx#L31-L46)
- [packages/client-sdk/src/services/tenant-admin-user.service.ts](file://packages/client-sdk/src/services/tenant-admin-user.service.ts#L135-L139)
- [apps/api/src/modules/user-management/tenant-admin-user.controller.ts](file://apps/api/src/modules/user-management/tenant-admin-user.controller.ts#L46-L68)
- [apps/api/src/core/middleware/rbac.middleware.ts](file://apps/api/src/core/middleware/rbac.middleware.ts#L292-L304)
- [apps/api/src/core/rbac/permission-matrix.ts](file://apps/api/src/core/rbac/permission-matrix.ts#L45-L215)
- [apps/api/src/modules/user/user.service.ts](file://apps/api/src/modules/user/user.service.ts#L150-L157)

## Detailed Component Analysis

### Users Listing and Search (Frontend)
- Fetches users with optional search term.
- Applies client-side filtering by name, email, or ID.
- Displays a table with user name, email, and active status.
- Provides a Create button for adding new users.

```mermaid
flowchart TD
Start(["Render UsersPage"]) --> LoadHook["useUsers({ search })"]
LoadHook --> HasData{"Has usersData?"}
HasData --> |No| Loading["Show Spinner"]
HasData --> |Yes| Filter["Filter by searchQuery"]
Filter --> Render["Render Table"]
Render --> End(["Done"])
```

**Diagram sources**
- [apps/tenant-admin/src/routes/users/index.tsx](file://apps/tenant-admin/src/routes/users/index.tsx#L31-L46)
- [apps/tenant-admin/src/routes/users/index.tsx](file://apps/tenant-admin/src/routes/users/index.tsx#L100-L128)

**Section sources**
- [apps/tenant-admin/src/routes/users/index.tsx](file://apps/tenant-admin/src/routes/users/index.tsx#L26-L132)

### SDK Service Methods (Tenant Admin)
- getAll(params): Paginated listing with role, status, organizationId, search, sort, and limit.
- getById(id): Retrieve a single user.
- inviteUser(data): Invite a new user; returns invitation details.
- getInvitations(params): List pending invitations.
- resendInvitation(data), cancelInvitation(data): Manage invitations.
- assignRole(data), assignToOrganization(data), removeFromOrganization(userId, orgId): Role and organization assignment.
- assignScopes(data): Delegate scopes (organization/rental object/category) with permissions.
- getEffectivePermissions(userId): Compute effective permissions for a user.
- deactivate/reactivate/suspend/unsuspend(userId, reason, expiresAt): Lifecycle controls.
- getActivityLog(userId, params): Retrieve user activity log.
- bulkInvite(users), bulkDeactivate(userIds, reason), bulkAssignRole(userIds, role): Bulk operations.

```mermaid
classDiagram
class TenantAdminUserService {
+getAll(params) PaginatedResponse<TenantUser>
+getById(id) SingleResponse<TenantUser>
+inviteUser(data) SingleResponse<UserInvitation>
+getInvitations(params) PaginatedResponse<UserInvitation>
+resendInvitation(data) SuccessResponse
+cancelInvitation(data) SuccessResponse
+assignRole(data) SingleResponse<TenantUser>
+assignToOrganization(data) SuccessResponse
+removeFromOrganization(userId, orgId) SuccessResponse
+assignScopes(data) SuccessResponse
+getEffectivePermissions(userId) SingleResponse<EffectivePermissions>
+deactivate(userId, reason) SuccessResponse
+reactivate(userId) SuccessResponse
+suspend(userId, reason, expiresAt?) SuccessResponse
+unsuspend(userId) SuccessResponse
+getActivityLog(userId, params) PaginatedResponse<any>
+bulkInvite(users) SingleResponse
+bulkDeactivate(userIds, reason) SuccessResponse
+bulkAssignRole(userIds, role) SuccessResponse
}
```

**Diagram sources**
- [packages/client-sdk/src/services/tenant-admin-user.service.ts](file://packages/client-sdk/src/services/tenant-admin-user.service.ts#L126-L319)

**Section sources**
- [packages/client-sdk/src/services/tenant-admin-user.service.ts](file://packages/client-sdk/src/services/tenant-admin-user.service.ts#L126-L319)

### API Controller Endpoints (Tenant Admin)
- GET /api/admin/users: List users with pagination and filters (role, status, organizationId, search).
- GET /api/admin/users/:id: Get user by ID.
- POST /api/admin/users/invite: Invite a user.
- POST /api/admin/users/:id/role: Assign role.
- POST /api/admin/users/:id/organization: Assign user to organization.
- DELETE /api/admin/users/:id/organization/:orgId: Remove user from organization.
- POST /api/admin/users/:id/deactivate, :id/reactivate, :id/suspend, :id/unsuspend: Lifecycle controls.
- GET /api/admin/users/:id/effective-permissions: Compute effective permissions.
- GET /api/admin/users/:id/activity: Retrieve activity log.
- GET /api/admin/users/invitations: List pending invitations.
- POST /api/admin/users/invitations/:id/resend, :id/cancel: Manage invitations.
- POST /api/admin/users/bulk/invite, bulk/deactivate, bulk/assign-role: Bulk operations.

```mermaid
sequenceDiagram
participant Client as "Tenant Admin UI"
participant SDK as "TenantAdminUserService"
participant Ctrl as "TenantAdminUserController"
participant RBAC as "RBAC Middleware"
participant Perm as "Permission Matrix"
participant Svc as "UserService"
Client->>SDK : "inviteUser({ email, role, organizationId? })"
SDK->>Ctrl : "POST /api/admin/users/invite"
Ctrl->>RBAC : "requireTenantContext, requireRole(['admin','tenant_admin'])"
RBAC->>Perm : "authorize"
Perm-->>RBAC : "ok"
RBAC-->>Ctrl : "proceed"
Ctrl->>Svc : "invite(tenantId, data)"
Svc-->>Ctrl : "{ invitationId }"
Ctrl-->>SDK : "201 Created { data, message }"
SDK-->>Client : "UserInvitation"
```

**Diagram sources**
- [apps/api/src/modules/user-management/tenant-admin-user.controller.ts](file://apps/api/src/modules/user-management/tenant-admin-user.controller.ts#L85-L98)
- [apps/api/src/core/middleware/rbac.middleware.ts](file://apps/api/src/core/middleware/rbac.middleware.ts#L108-L132)
- [apps/api/src/core/rbac/permission-matrix.ts](file://apps/api/src/core/rbac/permission-matrix.ts#L45-L215)
- [apps/api/src/modules/user/user.service.ts](file://apps/api/src/modules/user/user.service.ts#L80-L120)

**Section sources**
- [apps/api/src/modules/user-management/tenant-admin-user.controller.ts](file://apps/api/src/modules/user-management/tenant-admin-user.controller.ts#L46-L398)

### User Service Operations
- create(tenantId, data): Validates input, checks uniqueness, creates user, logs audit, tracks analytics.
- invite(tenantId, data): Validates input, ensures no existing user, creates pending user, sends invitation email, logs audit.
- findAll(tenantId, params): Validates query params and returns paginated results.
- update(id, data), assignRole(id, data), deactivate(id): Updates user attributes, role, or status; logs audit.
- delete(id): Permanently deletes user; logs audit.

```mermaid
flowchart TD
A["create(tenantId, data)"] --> V["Validate CreateUserSchema"]
V --> U["Check unique email"]
U --> C["repository.create(...)"]
C --> L["Audit log"]
L --> E["Analytics track"]
E --> R["Return User"]
subgraph "invite(tenantId, data)"
V2["Validate InviteUserSchema"] --> U2["Check existing user"]
U2 --> P["Create pending user (status=pending)"]
P --> M["Send invitation email"]
M --> L2["Audit log"]
L2 --> R2["Return { invitationId }"]
end
```

**Diagram sources**
- [apps/api/src/modules/user/user.service.ts](file://apps/api/src/modules/user/user.service.ts#L38-L75)
- [apps/api/src/modules/user/user.service.ts](file://apps/api/src/modules/user/user.service.ts#L80-L120)

**Section sources**
- [apps/api/src/modules/user/user.service.ts](file://apps/api/src/modules/user/user.service.ts#L28-L305)

### RBAC Integration and Permissions
- requireTenantContext: Ensures tenant context is present.
- requireRole(['admin','tenant_admin']): Restricts endpoints to authorized tenant-level roles.
- Permission Matrix: Defines resource:action permissions for system and backoffice roles.
- Effective Permissions Endpoint: Returns computed permissions for a user (placeholder logic currently).

```mermaid
flowchart TD
Req["Incoming Request"] --> CTX["requireTenantContext"]
CTX --> ROLE["requireRole(['admin','tenant_admin'])"]
ROLE --> PERM["requirePermission/resource:action (optional)"]
PERM --> OK["Proceed to Handler"]
```

**Diagram sources**
- [apps/api/src/core/middleware/rbac.middleware.ts](file://apps/api/src/core/middleware/rbac.middleware.ts#L292-L304)
- [apps/api/src/core/middleware/rbac.middleware.ts](file://apps/api/src/core/middleware/rbac.middleware.ts#L108-L132)
- [apps/api/src/core/rbac/permission-matrix.ts](file://apps/api/src/core/rbac/permission-matrix.ts#L45-L215)
- [apps/api/src/modules/user-management/tenant-admin-user.controller.ts](file://apps/api/src/modules/user-management/tenant-admin-user.controller.ts#L248-L287)

**Section sources**
- [apps/api/src/core/middleware/rbac.middleware.ts](file://apps/api/src/core/middleware/rbac.middleware.ts#L108-L132)
- [apps/api/src/core/rbac/permission-matrix.ts](file://apps/api/src/core/rbac/permission-matrix.ts#L45-L215)
- [apps/api/src/modules/user-management/tenant-admin-user.controller.ts](file://apps/api/src/modules/user-management/tenant-admin-user.controller.ts#L248-L287)

### User Lifecycle Management and Account Status Controls
- Deactivate: Prevents login while preserving data.
- Reactivate: Restores access for previously deactivated users.
- Suspend: Temporarily restricts access (placeholder endpoint).
- Unsuspend: Reinstates access after suspension.
- Delete: Permanently removes user (service supports deletion).

```mermaid
stateDiagram-v2
[*] --> Active
Active --> Suspended : "suspend()"
Active --> Inactive : "deactivate()"
Suspended --> Active : "unsuspend()"
Inactive --> Active : "reactivate()"
Active --> Deleted : "delete()"
Inactive --> Deleted : "delete()"
Suspended --> Deleted : "delete()"
```

**Diagram sources**
- [apps/api/src/modules/user-management/tenant-admin-user.controller.ts](file://apps/api/src/modules/user-management/tenant-admin-user.controller.ts#L170-L244)
- [apps/api/src/modules/user/user.service.ts](file://apps/api/src/modules/user/user.service.ts#L200-L235)

**Section sources**
- [apps/api/src/modules/user-management/tenant-admin-user.controller.ts](file://apps/api/src/modules/user-management/tenant-admin-user.controller.ts#L170-L244)
- [apps/api/src/modules/user/user.service.ts](file://apps/api/src/modules/user/user.service.ts#L200-L235)

### Bulk User Operations
- Bulk Invite: Accepts an array of user invitations; returns successes and failures.
- Bulk Deactivate: Accepts an array of user IDs; returns successes and failures.
- Bulk Assign Role: Accepts an array of user IDs and target role; returns successes and failures.

```mermaid
sequenceDiagram
participant UI as "Tenant Admin UI"
participant SDK as "TenantAdminUserService"
participant Ctrl as "TenantAdminUserController"
participant Svc as "UserService"
UI->>SDK : "bulkInvite(users[])"
SDK->>Ctrl : "POST /api/admin/users/bulk/invite"
Ctrl->>Ctrl : "validate users[]"
Ctrl->>Svc : "invite(tenantId, userData) for each"
Svc-->>Ctrl : "results/errors"
Ctrl-->>SDK : "{ successful, failed, results, errors }"
SDK-->>UI : "BulkInviteResult"
```

**Diagram sources**
- [packages/client-sdk/src/services/tenant-admin-user.service.ts](file://packages/client-sdk/src/services/tenant-admin-user.service.ts#L296-L301)
- [apps/api/src/modules/user-management/tenant-admin-user.controller.ts](file://apps/api/src/modules/user-management/tenant-admin-user.controller.ts#L401-L444)

**Section sources**
- [packages/client-sdk/src/services/tenant-admin-user.service.ts](file://packages/client-sdk/src/services/tenant-admin-user.service.ts#L296-L315)
- [apps/api/src/modules/user-management/tenant-admin-user.controller.ts](file://apps/api/src/modules/user-management/tenant-admin-user.controller.ts#L401-L444)

### Search and Filtering Capabilities
- Frontend: Client-side search across name, email, and ID.
- Backend: Query parameters support role, status, organizationId, search, page, limit, sort, and order.

**Section sources**
- [apps/tenant-admin/src/routes/users/index.tsx](file://apps/tenant-admin/src/routes/users/index.tsx#L37-L46)
- [apps/api/src/schemas/user.schema.ts](file://apps/api/src/schemas/user.schema.ts#L88-L98)
- [apps/api/src/modules/user/user.controller.ts](file://apps/api/src/modules/user/user.controller.ts#L28-L43)

### Profile Administration
- Current user profile: Available via dedicated endpoints.
- Consent management: Retrieval and update endpoints for user consents.

**Section sources**
- [apps/api/src/modules/user/user.controller.ts](file://apps/api/src/modules/user/user.controller.ts#L48-L79)
- [apps/api/src/modules/user/user.service.ts](file://apps/api/src/modules/user/user.service.ts#L238-L303)

## Dependency Analysis
- UI depends on SDK hooks/services.
- SDK depends on API base path and typed DTOs.
- API controller depends on RBAC middleware and schemas.
- API controller delegates to UserService.
- UserService depends on repositories and adapters; logs via audit service.

```mermaid
graph LR
UI["UsersPage"] --> SDK["TenantAdminUserService"]
SDK --> CTRL["TenantAdminUserController"]
CTRL --> MW["RBAC Middleware"]
CTRL --> SVC["UserService"]
SVC --> AUDIT["Audit Service"]
CTRL --> SCHEMAS["User Schemas"]
MW --> PM["Permission Matrix"]
```

**Diagram sources**
- [apps/tenant-admin/src/routes/users/index.tsx](file://apps/tenant-admin/src/routes/users/index.tsx#L23-L33)
- [packages/client-sdk/src/services/tenant-admin-user.service.ts](file://packages/client-sdk/src/services/tenant-admin-user.service.ts#L126-L139)
- [apps/api/src/modules/user-management/tenant-admin-user.controller.ts](file://apps/api/src/modules/user-management/tenant-admin-user.controller.ts#L36-L68)
- [apps/api/src/core/middleware/rbac.middleware.ts](file://apps/api/src/core/middleware/rbac.middleware.ts#L108-L132)
- [apps/api/src/core/rbac/permission-matrix.ts](file://apps/api/src/core/rbac/permission-matrix.ts#L45-L215)
- [apps/api/src/modules/user/user.service.ts](file://apps/api/src/modules/user/user.service.ts#L59-L74)
- [apps/api/src/schemas/user.schema.ts](file://apps/api/src/schemas/user.schema.ts#L88-L98)

**Section sources**
- [apps/tenant-admin/src/routes/users/index.tsx](file://apps/tenant-admin/src/routes/users/index.tsx#L23-L33)
- [packages/client-sdk/src/services/tenant-admin-user.service.ts](file://packages/client-sdk/src/services/tenant-admin-user.service.ts#L126-L139)
- [apps/api/src/modules/user-management/tenant-admin-user.controller.ts](file://apps/api/src/modules/user-management/tenant-admin-user.controller.ts#L36-L68)
- [apps/api/src/core/middleware/rbac.middleware.ts](file://apps/api/src/core/middleware/rbac.middleware.ts#L108-L132)
- [apps/api/src/core/rbac/permission-matrix.ts](file://apps/api/src/core/rbac/permission-matrix.ts#L45-L215)
- [apps/api/src/modules/user/user.service.ts](file://apps/api/src/modules/user/user.service.ts#L59-L74)
- [apps/api/src/schemas/user.schema.ts](file://apps/api/src/schemas/user.schema.ts#L88-L98)

## Performance Considerations
- Pagination: Use page and limit parameters to avoid large payloads.
- Client-side filtering: Keep searchQuery minimal and avoid unnecessary re-renders.
- Bulk operations: Prefer batch endpoints to reduce round trips.
- RBAC checks: Ensure middleware is applied early to fail fast on unauthorized requests.

## Troubleshooting Guide
- Authentication/Authorization errors: Verify tenant context and required roles.
- Validation errors: Ensure request bodies conform to schemas (Zod validation).
- Invitation issues: Confirm pending status and implement resend/cancel logic.
- Activity log: Endpoint returns empty data; implement audit logging integration.
- Effective permissions: Placeholder logic; extend to compute inherited permissions and scopes.

**Section sources**
- [apps/api/src/core/middleware/rbac.middleware.ts](file://apps/api/src/core/middleware/rbac.middleware.ts#L108-L132)
- [apps/api/src/schemas/user.schema.ts](file://apps/api/src/schemas/user.schema.ts#L88-L98)
- [apps/api/src/modules/user-management/tenant-admin-user.controller.ts](file://apps/api/src/modules/user-management/tenant-admin-user.controller.ts#L314-L341)
- [apps/api/src/modules/user-management/tenant-admin-user.controller.ts](file://apps/api/src/modules/user-management/tenant-admin-user.controller.ts#L291-L311)
- [apps/api/src/modules/user-management/tenant-admin-user.controller.ts](file://apps/api/src/modules/user-management/tenant-admin-user.controller.ts#L252-L287)

## Conclusion
The Tenant Admin User Management feature provides a comprehensive set of capabilities for tenant administrators to manage users within their organization. It combines a user-friendly UI, a robust SDK, and a secure backend with strict RBAC enforcement. The system supports listing, searching, role and organization assignment, lifecycle controls, bulk operations, and permission computation. Extending the effective permissions and activity log endpoints will further enhance visibility and governance.