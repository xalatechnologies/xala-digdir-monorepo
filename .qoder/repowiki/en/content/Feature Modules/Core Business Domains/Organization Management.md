# Organization Management

<cite>
**Referenced Files in This Document**
- [organization.repository.ts](file://apps/api/src/modules/organizations/organization.repository.ts)
- [organizations.service.ts](file://apps/api/src/modules/organizations/organizations.service.ts)
- [organizations.controller.ts](file://apps/api/src/modules/organizations/organizations.controller.ts)
- [brreg.controller.ts](file://apps/api/src/modules/organizations/brreg.controller.ts)
- [brreg.service.ts](file://packages/client-sdk/src/services/brreg.service.ts)
- [integration.service.ts](file://packages/client-sdk/src/services/integration.service.ts)
- [index.ts (schema re-exports)](file://apps/api/src/database/schema/index.ts)
- [index.ts (database-schema package)](file://packages/database-schema/src/index.ts)
- [tenant.ts (validation)](file://apps/api/src/core/validation/tenant.ts)
- [require-capability.ts](file://apps/api/src/core/decorators/require-capability.ts)
- [OrganizationWizard.tsx](file://apps/backoffice/src/components/organizations/OrganizationWizard.tsx)
- [tenant-isolation.test.ts](file://tests/integration/saas/tenant-isolation.test.ts)
- [rental-object-custody-delegation.md](file://docs/architecture/rental-object-custody-delegation.md)
- [master-prompt.md (org-admin-backoffice)](file://docs/digilist-platform/roles/org-admin-backoffice/master-prompt.md)
- [use-backoffice-orgs.ts](file://packages/client-sdk/src/hooks/use-backoffice-orgs.ts)
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
10. [Appendices](#appendices)

## Introduction
This document explains the organization management subsystem, focusing on multi-entity structures, organizational hierarchies, and tenant isolation. It covers the organization creation workflow, member management, role assignment patterns, integration with Brreg (Norwegian Register), and the multi-tenancy architecture. It also documents the organization setup service, data mapping patterns, administrative interfaces, and the relationships among organizations, users, and rental objects.

## Project Structure
Organization management spans the API backend, client SDK, and front-end applications:
- Backend API modules implement controllers, services, repositories, and schema re-exports.
- The client SDK provides typed services for Brreg integration and organization operations.
- Front-end components include the organization wizard and settings integrations.

```mermaid
graph TB
subgraph "API Backend"
C["OrganizationsController<br/>REST endpoints"]
S["OrganizationsService<br/>business logic"]
R["OrganizationRepository<br/>data access"]
DB["Schema Re-exports<br/>organizations, users, tenants"]
BR["BrregController<br/>mock registry integration"]
end
subgraph "Client SDK"
BS["BrregService<br/>typed client"]
IS["IntegrationService<br/>verify org number"]
H["use-backoffice-orgs<br/>hooks"]
end
subgraph "Frontend"
OW["OrganizationWizard<br/>multi-step form"]
end
C --> S --> R
R --> DB
C --> BR
BS --> BR
IS --> BR
OW --> H
```

**Diagram sources**
- [organizations.controller.ts](file://apps/api/src/modules/organizations/organizations.controller.ts#L1-L208)
- [organizations.service.ts](file://apps/api/src/modules/organizations/organizations.service.ts#L1-L408)
- [organization.repository.ts](file://apps/api/src/modules/organizations/organization.repository.ts#L1-L372)
- [index.ts (schema re-exports)](file://apps/api/src/database/schema/index.ts#L1-L170)
- [brreg.controller.ts](file://apps/api/src/modules/organizations/brreg.controller.ts#L20-L219)
- [brreg.service.ts](file://packages/client-sdk/src/services/brreg.service.ts#L1-L102)
- [integration.service.ts](file://packages/client-sdk/src/services/integration.service.ts#L320-L351)
- [OrganizationWizard.tsx](file://apps/backoffice/src/components/organizations/OrganizationWizard.tsx#L1-L110)
- [use-backoffice-orgs.ts](file://packages/client-sdk/src/hooks/use-backoffice-orgs.ts#L51-L77)

**Section sources**
- [organizations.controller.ts](file://apps/api/src/modules/organizations/organizations.controller.ts#L1-L208)
- [organizations.service.ts](file://apps/api/src/modules/organizations/organizations.service.ts#L1-L408)
- [organization.repository.ts](file://apps/api/src/modules/organizations/organization.repository.ts#L1-L372)
- [index.ts (schema re-exports)](file://apps/api/src/database/schema/index.ts#L1-L170)
- [brreg.controller.ts](file://apps/api/src/modules/organizations/brreg.controller.ts#L20-L219)
- [brreg.service.ts](file://packages/client-sdk/src/services/brreg.service.ts#L1-L102)
- [integration.service.ts](file://packages/client-sdk/src/services/integration.service.ts#L320-L351)
- [OrganizationWizard.tsx](file://apps/backoffice/src/components/organizations/OrganizationWizard.tsx#L1-L110)
- [use-backoffice-orgs.ts](file://packages/client-sdk/src/hooks/use-backoffice-orgs.ts#L51-L77)

## Core Components
- OrganizationsController: Exposes REST endpoints for listing, retrieving, creating, updating, deleting organizations, and managing members and rental object assignments.
- OrganizationsService: Implements business logic for organization lifecycle, member management, and rental object assignment.
- OrganizationRepository: Provides data access patterns for organizations, members, branding, and membership operations.
- BrregController and BrregService: Integrate with the Norwegian organization registry for search, details, and validation.
- Schema Re-exports: Centralizes database table definitions for tenants, organizations, users, and platform tables.
- Frontend OrganizationWizard: Multi-step wizard for creating and configuring organizations in the backoffice.

**Section sources**
- [organizations.controller.ts](file://apps/api/src/modules/organizations/organizations.controller.ts#L1-L208)
- [organizations.service.ts](file://apps/api/src/modules/organizations/organizations.service.ts#L1-L408)
- [organization.repository.ts](file://apps/api/src/modules/organizations/organization.repository.ts#L1-L372)
- [brreg.controller.ts](file://apps/api/src/modules/organizations/brreg.controller.ts#L20-L219)
- [brreg.service.ts](file://packages/client-sdk/src/services/brreg.service.ts#L1-L102)
- [index.ts (schema re-exports)](file://apps/api/src/database/schema/index.ts#L1-L170)
- [OrganizationWizard.tsx](file://apps/backoffice/src/components/organizations/OrganizationWizard.tsx#L1-L110)

## Architecture Overview
The system follows a layered architecture:
- Presentation: Controllers expose REST endpoints.
- Application: Services encapsulate business rules.
- Persistence: Repository abstracts database operations.
- Data: Schema re-exports define core entities.
- Integration: Brreg endpoints and SDK services enable official organization verification.

```mermaid
graph TB
Client["Client Apps<br/>Backoffice, Web, Admin"]
API["API Server"]
Service["OrganizationsService"]
Repo["OrganizationRepository"]
DB["Database Tables<br/>tenants, organizations, users, orgMemberships, accessGrants"]
Brreg["Brreg Registry<br/>Mock API"]
Client --> API
API --> Service
Service --> Repo
Repo --> DB
API --> Brreg
```

**Diagram sources**
- [organizations.controller.ts](file://apps/api/src/modules/organizations/organizations.controller.ts#L1-L208)
- [organizations.service.ts](file://apps/api/src/modules/organizations/organizations.service.ts#L1-L408)
- [organization.repository.ts](file://apps/api/src/modules/organizations/organization.repository.ts#L1-L372)
- [index.ts (schema re-exports)](file://apps/api/src/database/schema/index.ts#L1-L170)
- [brreg.controller.ts](file://apps/api/src/modules/organizations/brreg.controller.ts#L20-L219)

## Detailed Component Analysis

### Organization Creation Workflow
The creation workflow is handled by the controller and service, with repository persistence and tenant scoping.

```mermaid
sequenceDiagram
participant Client as "Backoffice UI"
participant Controller as "OrganizationsController"
participant Service as "OrganizationsService"
participant Repo as "OrganizationRepository"
participant DB as "Database"
Client->>Controller : POST /organizations
Controller->>Service : create(body, {tenantId, userId})
Service->>Repo : create(input)
Repo->>DB : INSERT organizations
DB-->>Repo : OrganizationRecord
Repo-->>Service : OrganizationRecord
Service-->>Controller : Organization DTO
Controller-->>Client : { data : Organization }
```

**Diagram sources**
- [organizations.controller.ts](file://apps/api/src/modules/organizations/organizations.controller.ts#L66-L77)
- [organizations.service.ts](file://apps/api/src/modules/organizations/organizations.service.ts#L1-L408)
- [organization.repository.ts](file://apps/api/src/modules/organizations/organization.repository.ts#L188-L207)

**Section sources**
- [organizations.controller.ts](file://apps/api/src/modules/organizations/organizations.controller.ts#L66-L77)
- [organizations.service.ts](file://apps/api/src/modules/organizations/organizations.service.ts#L1-L408)
- [organization.repository.ts](file://apps/api/src/modules/organizations/organization.repository.ts#L188-L207)

### Member Management and Role Assignment Patterns
Member management supports adding/removing members and assigning rental objects with granular permissions.

```mermaid
sequenceDiagram
participant Client as "Backoffice UI"
participant Controller as "OrganizationsController"
participant Service as "OrganizationsService"
participant Repo as "OrganizationRepository"
participant DB as "Database"
Client->>Controller : POST /organizations/ : id/members
Controller->>Service : addMember(organizationId, request, {userId})
Service->>Repo : addMember(organizationId, member)
Repo->>DB : INSERT users (organizationId, role)
DB-->>Repo : MemberRecord
Repo-->>Service : MemberRecord
Service-->>Controller : MemberRecord
Controller-->>Client : { data : Member }
Client->>Controller : DELETE /organizations/ : id/members/ : userId
Controller->>Service : removeMember(organizationId, userId)
Service->>Repo : removeMember(organizationId, memberId)
Repo->>DB : UPDATE users SET organizationId=null
DB-->>Repo : boolean
Repo-->>Service : boolean
Service-->>Controller : { success : true }
Controller-->>Client : { data : { success : true } }
```

**Diagram sources**
- [organizations.controller.ts](file://apps/api/src/modules/organizations/organizations.controller.ts#L127-L158)
- [organizations.service.ts](file://apps/api/src/modules/organizations/organizations.service.ts#L1-L408)
- [organization.repository.ts](file://apps/api/src/modules/organizations/organization.repository.ts#L292-L343)

**Section sources**
- [organizations.controller.ts](file://apps/api/src/modules/organizations/organizations.controller.ts#L127-L158)
- [organization.repository.ts](file://apps/api/src/modules/organizations/organization.repository.ts#L292-L343)

### Rental Object Assignment and Delegation
Organizations can be assigned rental objects with permission flags. The custody delegation model supports hierarchical sub-delegation and ABAC overlays on RBAC.

```mermaid
sequenceDiagram
participant Client as "Backoffice UI"
participant Controller as "OrganizationsController"
participant Service as "OrganizationsService"
participant DB as "Database"
Client->>Controller : POST /organizations/ : id/rental-objects
Controller->>Service : assignRentalObject(organizationId, request, {userId})
Service->>DB : INSERT/UPDATE accessGrants (orgId, rentalObjectId, permissions)
DB-->>Service : Grant record
Service-->>Controller : Assignment DTO
Controller-->>Client : { data : Assignment }
Client->>Controller : DELETE /organizations/ : id/rental-objects/ : rentalObjectId
Controller->>Service : unassignRentalObject(organizationId, rentalObjectId)
Service->>DB : UPDATE accessGrants SET status=revoked
DB-->>Service : void
Service-->>Controller : void
Controller-->>Client : { data : { success : true } }
```

**Diagram sources**
- [organizations.controller.ts](file://apps/api/src/modules/organizations/organizations.controller.ts#L174-L206)
- [organizations.service.ts](file://apps/api/src/modules/organizations/organizations.service.ts#L369-L387)
- [rental-object-custody-delegation.md](file://docs/architecture/rental-object-custody-delegation.md#L1-L27)

**Section sources**
- [organizations.controller.ts](file://apps/api/src/modules/organizations/organizations.controller.ts#L174-L206)
- [organizations.service.ts](file://apps/api/src/modules/organizations/organizations.service.ts#L369-L387)
- [rental-object-custody-delegation.md](file://docs/architecture/rental-object-custody-delegation.md#L1-L27)

### Integration with Brreg (Norwegian Register)
The system integrates with Brreg via a mock API and typed client services. Clients can search organizations, fetch details, and verify organization numbers.

```mermaid
sequenceDiagram
participant Client as "Backoffice UI"
participant SDK as "BrregService"
participant API as "BrregController"
participant Registry as "Mock Brreg Data"
Client->>SDK : search(query, options)
SDK->>API : GET /api/brreg/search?q=&type=&limit=
API->>Registry : filter(mockBrregOrgs)
Registry-->>API : results
API-->>SDK : { data, meta }
SDK-->>Client : PaginatedResponse
Client->>SDK : getOrganization(orgNumber)
SDK->>API : GET /api/brreg/org/ : orgNumber
API->>Registry : find(org)
Registry-->>API : details
API-->>SDK : SingleResponse
SDK-->>Client : Details
Client->>SDK : verify(organizationNumber)
SDK->>API : POST /api/brreg/verify
API-->>SDK : { verified }
SDK-->>Client : Verification result
```

**Diagram sources**
- [brreg.controller.ts](file://apps/api/src/modules/organizations/brreg.controller.ts#L86-L125)
- [brreg.controller.ts](file://apps/api/src/modules/organizations/brreg.controller.ts#L173-L207)
- [brreg.controller.ts](file://apps/api/src/modules/organizations/brreg.controller.ts#L212-L219)
- [brreg.service.ts](file://packages/client-sdk/src/services/brreg.service.ts#L89-L102)
- [integration.service.ts](file://packages/client-sdk/src/services/integration.service.ts#L338-L340)

**Section sources**
- [brreg.controller.ts](file://apps/api/src/modules/organizations/brreg.controller.ts#L86-L125)
- [brreg.controller.ts](file://apps/api/src/modules/organizations/brreg.controller.ts#L173-L207)
- [brreg.controller.ts](file://apps/api/src/modules/organizations/brreg.controller.ts#L212-L219)
- [brreg.service.ts](file://packages/client-sdk/src/services/brreg.service.ts#L89-L102)
- [integration.service.ts](file://packages/client-sdk/src/services/integration.service.ts#L338-L340)

### Tenant Isolation and Multi-Tenancy
Tenant isolation ensures users can only access resources within their own tenant. Tests demonstrate cross-tenant access prevention and SaaS admin privileges.

```mermaid
flowchart TD
Start(["Request Received"]) --> Extract["Extract tenantId from request"]
Extract --> Validate{"tenantId valid UUID?"}
Validate --> |No| Error["400 Bad Request"]
Validate --> |Yes| Scope["Scope DB queries by tenantId"]
Scope --> Access{"Same tenant as target?"}
Access --> |No| Deny["403 Forbidden"]
Access --> |Yes| Proceed["Proceed with operation"]
Proceed --> End(["Response"])
Error --> End
Deny --> End
```

**Diagram sources**
- [tenant.ts (validation)](file://apps/api/src/core/validation/tenant.ts#L30-L60)
- [organizations.controller.ts](file://apps/api/src/modules/organizations/organizations.controller.ts#L27-L43)
- [tenant-isolation.test.ts](file://tests/integration/saas/tenant-isolation.test.ts#L52-L100)

**Section sources**
- [tenant.ts (validation)](file://apps/api/src/core/validation/tenant.ts#L30-L60)
- [organizations.controller.ts](file://apps/api/src/modules/organizations/organizations.controller.ts#L27-L43)
- [tenant-isolation.test.ts](file://tests/integration/saas/tenant-isolation.test.ts#L52-L100)

### Administrative Interfaces and Organization Setup
The backoffice includes an organization wizard and settings tabs for integrations.

- OrganizationWizard: Multi-step form supporting basics, branding, and roles.
- Settings Integrations Tab: Toggle and manage Brreg integration.
- Client SDK Hooks: Provide typed operations for organization member and rental object management.

```mermaid
sequenceDiagram
participant User as "Backoffice User"
participant Wizard as "OrganizationWizard"
participant SDK as "use-backoffice-orgs"
participant API as "OrganizationsController"
User->>Wizard : Fill steps (basics, branding, roles)
Wizard->>SDK : create/update organization
SDK->>API : POST/PUT /organizations
API-->>SDK : { data : Organization }
SDK-->>Wizard : Success/Error
Wizard-->>User : Completion feedback
```

**Diagram sources**
- [OrganizationWizard.tsx](file://apps/backoffice/src/components/organizations/OrganizationWizard.tsx#L71-L110)
- [use-backoffice-orgs.ts](file://packages/client-sdk/src/hooks/use-backoffice-orgs.ts#L51-L77)
- [organizations.controller.ts](file://apps/api/src/modules/organizations/organizations.controller.ts#L66-L96)

**Section sources**
- [OrganizationWizard.tsx](file://apps/backoffice/src/components/organizations/OrganizationWizard.tsx#L1-L110)
- [use-backoffice-orgs.ts](file://packages/client-sdk/src/hooks/use-backoffice-orgs.ts#L51-L77)
- [organizations.controller.ts](file://apps/api/src/modules/organizations/organizations.controller.ts#L66-L96)

## Dependency Analysis
The organization module depends on shared schema definitions and enforces RBAC via decorators.

```mermaid
graph LR
Controller["OrganizationsController"] --> Service["OrganizationsService"]
Service --> Repository["OrganizationRepository"]
Repository --> Schema["Schema Re-exports"]
Controller --> BrregCtrl["BrregController"]
BrregCtrl --> BrregData["Mock Brreg Data"]
Controller --> RBAC["RequireCapability Decorator"]
```

**Diagram sources**
- [organizations.controller.ts](file://apps/api/src/modules/organizations/organizations.controller.ts#L1-L208)
- [organizations.service.ts](file://apps/api/src/modules/organizations/organizations.service.ts#L1-L408)
- [organization.repository.ts](file://apps/api/src/modules/organizations/organization.repository.ts#L1-L372)
- [index.ts (schema re-exports)](file://apps/api/src/database/schema/index.ts#L1-L170)
- [brreg.controller.ts](file://apps/api/src/modules/organizations/brreg.controller.ts#L20-L219)
- [require-capability.ts](file://apps/api/src/core/decorators/require-capability.ts#L72-L124)

**Section sources**
- [organizations.controller.ts](file://apps/api/src/modules/organizations/organizations.controller.ts#L1-L208)
- [organizations.service.ts](file://apps/api/src/modules/organizations/organizations.service.ts#L1-L408)
- [organization.repository.ts](file://apps/api/src/modules/organizations/organization.repository.ts#L1-L372)
- [index.ts (schema re-exports)](file://apps/api/src/database/schema/index.ts#L1-L170)
- [brreg.controller.ts](file://apps/api/src/modules/organizations/brreg.controller.ts#L20-L219)
- [require-capability.ts](file://apps/api/src/core/decorators/require-capability.ts#L72-L124)

## Performance Considerations
- Pagination and filtering: Repository methods accept page and limit parameters to control result sets.
- Conditional queries: Repository composes WHERE clauses dynamically to avoid unnecessary scans.
- Batch operations: Prefer bulk inserts/updates for member operations when scaling.
- Caching: Consider caching frequently accessed organization metadata and member counts.

[No sources needed since this section provides general guidance]

## Troubleshooting Guide
Common issues and resolutions:
- Validation errors for Brreg search: Ensure query length meets minimum requirements.
- Unauthorized or forbidden responses: Confirm capability grants and role alignment.
- Tenant isolation failures: Verify tenantId extraction and UUID format validation.
- Member removal failures: Ensure the member belongs to the organization before removal.

**Section sources**
- [brreg.controller.ts](file://apps/api/src/modules/organizations/brreg.controller.ts#L88-L98)
- [require-capability.ts](file://apps/api/src/core/decorators/require-capability.ts#L88-L124)
- [tenant.ts (validation)](file://apps/api/src/core/validation/tenant.ts#L30-L60)
- [organization.repository.ts](file://apps/api/src/modules/organizations/organization.repository.ts#L333-L343)

## Conclusion
The organization management subsystem provides a robust foundation for multi-entity structures, tenant isolation, and RBAC-driven access control. It integrates with Brreg for official organization verification, supports member management and rental object delegation, and exposes typed client SDK operations for seamless front-end integration.

[No sources needed since this section summarizes without analyzing specific files]

## Appendices

### Data Model Overview
The system relies on shared schema definitions for tenants, organizations, users, and platform tables.

```mermaid
erDiagram
TENANTS ||--o{ ORGANIZATIONS : "owns"
ORGANIZATIONS ||--o{ USERS : "has members"
ORGANIZATIONS ||--o{ ACCESS_GRANTS : "grants"
USERS ||--o{ ACCESS_GRANTS : "receives"
```

**Diagram sources**
- [index.ts (database-schema package)](file://packages/database-schema/src/index.ts#L1-L32)
- [index.ts (schema re-exports)](file://apps/api/src/database/schema/index.ts#L14-L84)

**Section sources**
- [index.ts (database-schema package)](file://packages/database-schema/src/index.ts#L1-L32)
- [index.ts (schema re-exports)](file://apps/api/src/database/schema/index.ts#L14-L84)

### RBAC and Role Definitions
- Organization Admin cannot create/modify tenant-wide configuration or access non-assigned rental objects.
- SaaS Admins can access all tenants; KOMMUNE_ADMIN has broad tenant-level privileges; ORG_ADMIN scope is limited to their organization.

**Section sources**
- [master-prompt.md (org-admin-backoffice)](file://docs/digilist-platform/roles/org-admin-backoffice/master-prompt.md#L27-L34)
- [require-capability.ts](file://apps/api/src/core/decorators/require-capability.ts#L50-L63)