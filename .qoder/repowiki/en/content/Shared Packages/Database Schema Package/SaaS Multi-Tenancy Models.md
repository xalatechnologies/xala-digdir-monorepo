# SaaS Multi-Tenancy Models

<cite>
**Referenced Files in This Document**
- [apps/api/src/modules/entitlements/entitlements.controller.ts](file://apps/api/src/modules/entitlements/entitlements.controller.ts)
- [apps/api/src/modules/entitlements/entitlements.service.ts](file://apps/api/src/modules/entitlements/entitlements.service.ts)
- [apps/api/src/database/schema/entitlements.ts](file://apps/api/src/database/schema/entitlements.ts)
- [packages/database-schema/src/saas/entitlements.ts](file://packages/database-schema/src/saas/entitlements.ts)
- [packages/database-schema/seeds/plan-entitlements.json](file://packages/database-schema/seeds/plan-entitlements.json)
- [packages/database-schema/seeds/nav-policies.json](file://packages/database-schema/seeds/nav-policies.json)
- [packages/database-schema/seeds/route-policies.json](file://packages/database-schema/seeds/route-policies.json)
- [apps/api/src/schemas/saas.schema.ts](file://apps/api/src/schemas/saas.schema.ts)
- [apps/api/src/modules/feature-flags/feature-flags.service.ts](file://apps/api/src/modules/feature-flags/feature-flags.service.ts)
- [apps/api/src/modules/saas/saas.service.ts](file://apps/api/src/modules/saas/saas.service.ts)
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
This document explains the SaaS multi-tenancy models that power the platform’s subscription and licensing features. It focuses on the entitlements system, role-based access control (RBAC), and feature gating mechanisms. The entitlements model supports different subscription tiers and controls feature availability across modules, features, and integrations. It also documents how tenants, entitlements, and user permissions relate, along with practical examples of entitlement evaluation, subscription management, and feature flag implementation. Finally, it covers scalability and performance optimization for multi-tenant operations.

## Project Structure
The entitlements system spans several layers:
- API controllers expose endpoints for entitlements and navigation evaluation.
- The entitlements service orchestrates evaluation across modules, features, integrations, routes, and navigation items.
- Database schema defines the canonical tables for plans, overrides, policies, kill switches, and audit logs.
- Seed data defines default plan entitlements and navigation/route policies.
- Feature flags complement entitlements with dynamic capability projection.
- SaaS admin schemas and service define plan and tenant lifecycle operations.

```mermaid
graph TB
subgraph "API Layer"
C["EntitlementsController<br/>GET /api/me/entitlements<br/>GET /api/nav/:app"]
end
subgraph "Service Layer"
S["EntitlementsService<br/>evaluateEntitlements()"]
FF["FeatureFlagsService<br/>evaluateForContext()"]
end
subgraph "Database Schema"
PE["plan_entitlements"]
TO["tenant_entitlement_overrides"]
IC["integration_configs"]
RP["route_policies"]
NP["nav_policies"]
KS["global_kill_switches"]
AL["entitlement_audit_log"]
end
subgraph "Seed Data"
SEED1["plan-entitlements.json"]
SEED2["route-policies.json"]
SEED3["nav-policies.json"]
end
C --> S
S --> FF
S --> PE
S --> TO
S --> IC
S --> RP
S --> NP
S --> KS
S --> AL
SEED1 --> PE
SEED2 --> RP
SEED3 --> NP
```

**Diagram sources**
- [apps/api/src/modules/entitlements/entitlements.controller.ts](file://apps/api/src/modules/entitlements/entitlements.controller.ts#L124-L142)
- [apps/api/src/modules/entitlements/entitlements.service.ts](file://apps/api/src/modules/entitlements/entitlements.service.ts#L64-L119)
- [packages/database-schema/src/saas/entitlements.ts](file://packages/database-schema/src/saas/entitlements.ts#L14-L154)
- [packages/database-schema/seeds/plan-entitlements.json](file://packages/database-schema/seeds/plan-entitlements.json#L1-L213)
- [packages/database-schema/seeds/route-policies.json](file://packages/database-schema/seeds/route-policies.json#L1-L183)
- [packages/database-schema/seeds/nav-policies.json](file://packages/database-schema/seeds/nav-policies.json#L1-L171)

**Section sources**
- [apps/api/src/modules/entitlements/entitlements.controller.ts](file://apps/api/src/modules/entitlements/entitlements.controller.ts#L1-L143)
- [apps/api/src/modules/entitlements/entitlements.service.ts](file://apps/api/src/modules/entitlements/entitlements.service.ts#L1-L579)
- [packages/database-schema/src/saas/entitlements.ts](file://packages/database-schema/src/saas/entitlements.ts#L1-L154)

## Core Components
- Entitlements Controller: Exposes endpoints to fetch effective entitlements and filtered navigation items per app. Implements ETag caching and authorization checks.
- Entitlements Service: Central evaluation engine that computes enabled modules, features, integrations, route access, and navigation items using precedence rules and seed-driven policies.
- Feature Flags Service: Provides capability projection and flag evaluation with tenant and organization overrides, enforcing restriction-only behavior at the organization level.
- Database Schema: Canonical tables for plan entitlements, tenant overrides, integration configurations, route and navigation policies, global kill switches, and audit logging.
- Seed Data: Defines default entitlements per plan and policy matrices for routes and navigation items.
- SaaS Admin Schemas and Service: Define plan and tenant structures and provide administrative operations (listing, creation, updates, plan assignment, license key rotation).

**Section sources**
- [apps/api/src/modules/entitlements/entitlements.controller.ts](file://apps/api/src/modules/entitlements/entitlements.controller.ts#L10-L142)
- [apps/api/src/modules/entitlements/entitlements.service.ts](file://apps/api/src/modules/entitlements/entitlements.service.ts#L41-L579)
- [apps/api/src/modules/feature-flags/feature-flags.service.ts](file://apps/api/src/modules/feature-flags/feature-flags.service.ts#L65-L652)
- [packages/database-schema/src/saas/entitlements.ts](file://packages/database-schema/src/saas/entitlements.ts#L14-L154)
- [packages/database-schema/seeds/plan-entitlements.json](file://packages/database-schema/seeds/plan-entitlements.json#L1-L213)
- [packages/database-schema/seeds/route-policies.json](file://packages/database-schema/seeds/route-policies.json#L1-L183)
- [packages/database-schema/seeds/nav-policies.json](file://packages/database-schema/seeds/nav-policies.json#L1-L171)
- [apps/api/src/schemas/saas.schema.ts](file://apps/api/src/schemas/saas.schema.ts#L1-L492)
- [apps/api/src/modules/saas/saas.service.ts](file://apps/api/src/modules/saas/saas.service.ts#L44-L655)

## Architecture Overview
The entitlements evaluation pipeline integrates tenant subscription data, plan defaults, tenant overrides, global kill switches, and feature flags to produce a unified projection of enabled capabilities. Routes and navigation items are gated by role, module, and feature requirements defined in policy tables.

```mermaid
sequenceDiagram
participant Client as "Client"
participant Controller as "EntitlementsController"
participant Service as "EntitlementsService"
participant DB as "Database"
participant Flags as "FeatureFlagsService"
Client->>Controller : GET /api/me/entitlements
Controller->>Controller : authenticate + extract user/tenant
Controller->>Service : evaluateEntitlements(context)
Service->>DB : getTenantSubscription(tenantId)
par Parallel Evaluation
Service->>DB : evaluateModules(tenantId, planId)
Service->>Flags : evaluateForContext({tenantId, orgId})
Service->>DB : evaluateIntegrations(tenantId, planId)
Service->>DB : evaluateRoutes(tenantId, roles, planId)
Service->>DB : evaluateNavItems(tenantId, roles, planId)
end
Service-->>Controller : EffectiveEntitlements
Controller-->>Client : 200 OK + ETag + Cache-Control
```

**Diagram sources**
- [apps/api/src/modules/entitlements/entitlements.controller.ts](file://apps/api/src/modules/entitlements/entitlements.controller.ts#L21-L70)
- [apps/api/src/modules/entitlements/entitlements.service.ts](file://apps/api/src/modules/entitlements/entitlements.service.ts#L64-L119)
- [apps/api/src/modules/feature-flags/feature-flags.service.ts](file://apps/api/src/modules/feature-flags/feature-flags.service.ts#L517-L549)

## Detailed Component Analysis

### Entitlements Controller
- Purpose: Expose endpoints for entitlements and navigation evaluation.
- Key behaviors:
  - Validates authenticated session and extracts tenant/user context.
  - Computes entitlements via the service and returns ETag-based caching headers.
  - Supports per-app navigation filtering by delegating to entitlements service.
- Error handling: Returns standardized problem details for unauthorized and internal server errors.

```mermaid
flowchart TD
Start(["Request Received"]) --> Auth["Authenticate Session"]
Auth --> HasCtx{"Has user + tenant?"}
HasCtx --> |No| Unauthorized["401 Unauthorized"]
HasCtx --> |Yes| Eval["Evaluate Entitlements"]
Eval --> CacheCheck{"ETag matches?"}
CacheCheck --> |Yes| NotModified["304 Not Modified"]
CacheCheck --> |No| Headers["Set ETag + Cache-Control"]
Headers --> Ok["200 OK + EffectiveEntitlements"]
Unauthorized --> End(["Exit"])
NotModified --> End
Ok --> End
```

**Diagram sources**
- [apps/api/src/modules/entitlements/entitlements.controller.ts](file://apps/api/src/modules/entitlements/entitlements.controller.ts#L21-L70)

**Section sources**
- [apps/api/src/modules/entitlements/entitlements.controller.ts](file://apps/api/src/modules/entitlements/entitlements.controller.ts#L10-L142)

### Entitlements Service
- Purpose: Unified evaluation engine orchestrating modules, features, integrations, routes, and navigation items.
- Evaluation precedence (highest to lowest):
  1) Global kill switches
  2) Tenant entitlement overrides
  3) Tenant module settings
  4) Plan defaults
  5) Module default enabled flag
- Parallel evaluation: Modules, features, integrations, route policies, and navigation items are computed concurrently for performance.
- Caching: Results are cached per tenant/user/environment with ETag generation for client-side caching.
- Audit logging: Changes trigger audit entries and cache invalidation.

```mermaid
flowchart TD
A["Input: tenantId, userId, roles, orgId, env"] --> B["Get tenant subscription"]
B --> C["Parallel: Modules | Features | Integrations | Routes | NavItems"]
C --> D["Apply precedence rules"]
D --> E["Build EffectiveEntitlements"]
E --> F["Cache result + ETag"]
F --> G["Return"]
```

**Diagram sources**
- [apps/api/src/modules/entitlements/entitlements.service.ts](file://apps/api/src/modules/entitlements/entitlements.service.ts#L64-L119)

**Section sources**
- [apps/api/src/modules/entitlements/entitlements.service.ts](file://apps/api/src/modules/entitlements/entitlements.service.ts#L41-L579)

### Feature Flags Service
- Purpose: Provide capability projection and flag evaluation with tenant and organization overrides.
- Resolution hierarchy:
  1) Organization-level override (restriction-only)
  2) Tenant-level override
  3) Catalog default
- Outputs: Enabled/disabled flags, categorized flags, and capability projection for policy enforcement.

```mermaid
classDiagram
class FeatureFlagsService {
+getCatalog()
+getTenantFlags(tenantId)
+getOrgFlags(organizationId)
+evaluateFlag(flagKey, context)
+getCapabilityProjection(context)
+isFlagEnabled(flagKey, context)
+invalidateAllCaches()
}
```

**Diagram sources**
- [apps/api/src/modules/feature-flags/feature-flags.service.ts](file://apps/api/src/modules/feature-flags/feature-flags.service.ts#L65-L652)

**Section sources**
- [apps/api/src/modules/feature-flags/feature-flags.service.ts](file://apps/api/src/modules/feature-flags/feature-flags.service.ts#L65-L652)

### Database Schema and Seed Data
- Canonical tables:
  - plan_entitlements: Plan defaults for modules, features, and integrations.
  - tenant_entitlement_overrides: Tenant-level toggles overriding plan defaults.
  - integration_configs: Per-tenant integration status and validation metadata.
  - route_policies: Route-level gating by roles, modules, and features.
  - nav_policies: Navigation item gating by roles, modules, and features.
  - global_kill_switches: Emergency kill switches by key type and environment.
  - entitlement_audit_log: Audit trail for entitlement changes.
- Seed data:
  - plan-entitlements.json: Default entitlements per plan (Free, Pro, Enterprise).
  - route-policies.json: Route-level access rules and public flags.
  - nav-policies.json: Navigation item rules and ordering.

```mermaid
erDiagram
PLAN_ENTITLEMENTS {
uuid id PK
uuid plan_id
varchar key_type
varchar key
boolean default_enabled
}
TENANT_ENTITLEMENT_OVERRIDES {
uuid id PK
uuid tenant_id
varchar key_type
varchar key
boolean enabled
}
INTEGRATION_CONFIGS {
uuid id PK
uuid tenant_id
varchar integration_key
jsonb config_json
varchar status
}
ROUTE_POLICIES {
uuid id PK
varchar app
varchar route_key UK
jsonb required_roles
jsonb required_modules
jsonb required_features
boolean is_public
}
NAV_POLICIES {
uuid id PK
varchar app
varchar nav_item_key UK
varchar route_key
jsonb required_roles
jsonb required_modules
jsonb required_features
varchar label_key
varchar icon_key
varchar parent_key
int order
}
GLOBAL_KILL_SWITCHES {
uuid id PK
varchar key_type
varchar key
boolean enabled
varchar environment
}
ENTITLEMENT_AUDIT_LOG {
uuid id PK
uuid tenant_id
varchar action
varchar key_type
varchar key
jsonb before
jsonb after
uuid actor_id
varchar actor_type
uuid correlation_id
}
PLAN_ENTITLEMENTS }o--|| PLAN : "belongs to"
TENANT_ENTITLEMENT_OVERRIDES }o--|| TENANT : "overrides"
INTEGRATION_CONFIGS }o--|| TENANT : "configured by"
ROUTE_POLICIES ||--o{ ROUTE_ACCESS : "gates"
NAV_POLICIES ||--o{ NAV_ACCESS : "gates"
GLOBAL_KILL_SWITCHES ||--o{ KILLSWITCH : "applies to"
```

**Diagram sources**
- [packages/database-schema/src/saas/entitlements.ts](file://packages/database-schema/src/saas/entitlements.ts#L14-L154)

**Section sources**
- [packages/database-schema/src/saas/entitlements.ts](file://packages/database-schema/src/saas/entitlements.ts#L1-L154)
- [packages/database-schema/seeds/plan-entitlements.json](file://packages/database-schema/seeds/plan-entitlements.json#L1-L213)
- [packages/database-schema/seeds/route-policies.json](file://packages/database-schema/seeds/route-policies.json#L1-L183)
- [packages/database-schema/seeds/nav-policies.json](file://packages/database-schema/seeds/nav-policies.json#L1-L171)

### Subscription and Licensing Models
- Plans define seat limits and entitlements (modules, features, integrations).
- Tenants are associated with a plan via subscription records.
- Administrative operations include listing, creating/updating tenants, assigning plans, rotating license keys, and managing seat limits.
- Schemas enforce validation for plans, tenants, and feature flags.

```mermaid
sequenceDiagram
participant Admin as "SaaS Admin"
participant Service as "SaasService"
participant DB as "Database"
Admin->>Service : createTenant({name, slug, planId, seatLimits})
Service->>Service : validate input
Service->>Service : generate license key + hash
Service->>DB : persist tenant + seat limits
Service-->>Admin : TenantDetailResponse
Admin->>Service : assignPlan(tenantId, planId)
Service->>DB : update tenant.subscriptionPlanId
Service-->>Admin : TenantDetailResponse
```

**Diagram sources**
- [apps/api/src/modules/saas/saas.service.ts](file://apps/api/src/modules/saas/saas.service.ts#L143-L219)
- [apps/api/src/modules/saas/saas.service.ts](file://apps/api/src/modules/saas/saas.service.ts#L524-L555)
- [apps/api/src/schemas/saas.schema.ts](file://apps/api/src/schemas/saas.schema.ts#L196-L262)

**Section sources**
- [apps/api/src/modules/saas/saas.service.ts](file://apps/api/src/modules/saas/saas.service.ts#L44-L655)
- [apps/api/src/schemas/saas.schema.ts](file://apps/api/src/schemas/saas.schema.ts#L1-L492)

### Entitlement Evaluation Examples
- Example 1: Evaluating modules for a tenant on the Enterprise plan.
  - Start with plan defaults from seed data.
  - Apply tenant overrides and module settings.
  - Respect global kill switches.
  - Result: Enabled module keys for the session.
- Example 2: Feature gating via feature flags.
  - Use FeatureFlagsService to resolve enabled flags for tenant and organization context.
  - Combine with entitlements to gate routes and navigation items.
- Example 3: Navigation filtering per app.
  - Controller delegates to service to filter nav items by app and entitlements.

**Section sources**
- [apps/api/src/modules/entitlements/entitlements.service.ts](file://apps/api/src/modules/entitlements/entitlements.service.ts#L125-L231)
- [apps/api/src/modules/entitlements/entitlements.service.ts](file://apps/api/src/modules/entitlements/entitlements.service.ts#L237-L272)
- [apps/api/src/modules/entitlements/entitlements.controller.ts](file://apps/api/src/modules/entitlements/entitlements.controller.ts#L76-L112)

### Role-Based Access Control and Feature Gating
- Routes are gated by:
  - isPublic flag
  - requiredRoles
  - requiredModules (enabled by entitlements)
  - requiredFeatures (enabled by feature flags)
- Navigation items are gated similarly and grouped by app and order.
- Policy matrices are defined in seed data for backoffice and minside applications.

**Section sources**
- [apps/api/src/modules/entitlements/entitlements.service.ts](file://apps/api/src/modules/entitlements/entitlements.service.ts#L382-L439)
- [apps/api/src/modules/entitlements/entitlements.service.ts](file://apps/api/src/modules/entitlements/entitlements.service.ts#L445-L498)
- [packages/database-schema/seeds/route-policies.json](file://packages/database-schema/seeds/route-policies.json#L1-L183)
- [packages/database-schema/seeds/nav-policies.json](file://packages/database-schema/seeds/nav-policies.json#L1-L171)

## Dependency Analysis
- Controller depends on EntitlementsService and Fastify authentication middleware.
- EntitlementsService depends on:
  - Database schema tables for plan entitlements, overrides, integrations, policies, kill switches, and audit logs.
  - FeatureFlagsService for capability projection.
  - Optional Cache abstraction for performance.
- FeatureFlagsService depends on catalog and override tables, with optional cache and audit logging.
- SaaS Admin Service depends on schemas and performs administrative operations.

```mermaid
graph LR
Controller["EntitlementsController"] --> Service["EntitlementsService"]
Service --> Flags["FeatureFlagsService"]
Service --> DB["Database Tables"]
Flags --> DB
AdminSvc["SaasService"] --> DB
AdminSvc --> Schemas["SaaS Schemas"]
```

**Diagram sources**
- [apps/api/src/modules/entitlements/entitlements.controller.ts](file://apps/api/src/modules/entitlements/entitlements.controller.ts#L124-L142)
- [apps/api/src/modules/entitlements/entitlements.service.ts](file://apps/api/src/modules/entitlements/entitlements.service.ts#L41-L54)
- [apps/api/src/modules/feature-flags/feature-flags.service.ts](file://apps/api/src/modules/feature-flags/feature-flags.service.ts#L65-L78)
- [apps/api/src/modules/saas/saas.service.ts](file://apps/api/src/modules/saas/saas.service.ts#L44-L47)

**Section sources**
- [apps/api/src/modules/entitlements/entitlements.controller.ts](file://apps/api/src/modules/entitlements/entitlements.controller.ts#L124-L142)
- [apps/api/src/modules/entitlements/entitlements.service.ts](file://apps/api/src/modules/entitlements/entitlements.service.ts#L41-L579)
- [apps/api/src/modules/feature-flags/feature-flags.service.ts](file://apps/api/src/modules/feature-flags/feature-flags.service.ts#L65-L652)
- [apps/api/src/modules/saas/saas.service.ts](file://apps/api/src/modules/saas/saas.service.ts#L44-L655)

## Performance Considerations
- Parallel evaluation: Modules, features, integrations, routes, and navigation items are evaluated concurrently to reduce latency.
- Caching:
  - Service-level cache keyed by tenant, user, and environment with TTL.
  - ETag generation enables efficient client-side caching and 304 Not Modified responses.
  - Optional Redis cache integration is supported via container-resolved Cache.
- Indexing and constraints:
  - Unique and composite indexes on plan_entitlements, tenant overrides, nav policies, and route policies optimize lookups.
- Audit logging:
  - Minimal overhead via asynchronous inserts and correlation IDs for traceability.

[No sources needed since this section provides general guidance]

## Troubleshooting Guide
- Unauthorized requests: Controller returns 401 when user/tenant context is missing.
- Internal server errors: Controller returns standardized problem details on evaluation failures.
- Cache misses or stale data: Clear cache keys for tenant/user/environment or rely on TTL expiration.
- Kill switches: If a feature/module/integration is globally disabled, it will appear disabled regardless of plan or overrides.
- Organization-level flag restrictions: Organization-level overrides can only disable flags; attempting to enable beyond tenant-level results in forbidden errors.

**Section sources**
- [apps/api/src/modules/entitlements/entitlements.controller.ts](file://apps/api/src/modules/entitlements/entitlements.controller.ts#L28-L35)
- [apps/api/src/modules/entitlements/entitlements.controller.ts](file://apps/api/src/modules/entitlements/entitlements.controller.ts#L61-L69)
- [apps/api/src/modules/feature-flags/feature-flags.service.ts](file://apps/api/src/modules/feature-flags/feature-flags.service.ts#L324-L329)

## Conclusion
The entitlements system provides a robust, multi-layered mechanism for controlling access and features across tenants. By combining plan defaults, tenant overrides, global kill switches, and feature flags, it ensures predictable behavior while enabling fine-grained control. The architecture emphasizes performance through parallel evaluation and caching, and it maintains auditability and scalability through well-defined schemas and seed-driven policies. Together with SaaS admin capabilities, it supports flexible subscription management and licensing operations.