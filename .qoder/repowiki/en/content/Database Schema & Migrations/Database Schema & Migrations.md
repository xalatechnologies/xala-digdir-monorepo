# Database Schema & Migrations

<cite>
**Referenced Files in This Document**
- [drizzle.config.ts](file://apps/api/drizzle.config.ts)
- [drizzle.config.ts](file://packages/database-schema/drizzle.config.ts)
- [migrate.ts](file://apps/api/scripts/migrate.ts)
- [index.ts](file://packages/database-schema/src/index.ts)
- [schemas.ts](file://packages/database-schema/src/schemas.ts)
- [core/index.ts](file://packages/database-schema/src/core/index.ts)
- [domain/index.ts](file://packages/database-schema/src/domain/index.ts)
- [platform/index.ts](file://packages/database-schema/src/platform/index.ts)
- [saas/index.ts](file://packages/database-schema/src/saas/index.ts)
- [compliance/index.ts](file://packages/database-schema/src/compliance/index.ts)
- [tenants.ts](file://packages/database-schema/src/core/tenants.ts)
- [organizations.ts](file://packages/database-schema/src/core/organizations.ts)
- [rental-objects.ts](file://packages/database-schema/src/domain/rental-objects.ts)
- [entitlements.ts](file://packages/database-schema/src/saas/entitlements.ts)
- [0000_dazzling_pretty_boy.sql](file://apps/api/drizzle/0000_dazzling_pretty_boy.sql)
- [0001_clean_schema.sql](file://apps/api/drizzle/0001_clean_schema.sql)
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
This document describes the PostgreSQL-based data layer and its migration strategy built with Drizzle. It documents the schema organization across domains and modules, the single source of truth approach, type safety guarantees, governance practices, and operational procedures for migration management, version control, and deployment. It also covers entity relationships, indexing strategies, and the connection between the database schema package and the API server implementation.

## Project Structure
The data layer is organized around two complementary sources:
- A Drizzle-driven schema package that defines the canonical schema as TypeScript modules and exposes a single index for re-export ordering.
- An API application that generates and runs SQL migrations via Drizzle migrator and a dedicated migration script.

```mermaid
graph TB
subgraph "Schema Package (packages/database-schema)"
SP_IDX["src/index.ts"]
SP_CORE["core/*"]
SP_DOMAIN["domain/*"]
SP_PLATFORM["platform/*"]
SP_SAAS["saas/*"]
SP_COMPLIANCE["compliance/*"]
SP_SCHEMAS["schemas.ts<br/>pgSchema namespaces"]
end
subgraph "API Application (apps/api)"
APP_DRIZZLE_CFG["drizzle.config.ts"]
APP_MIGRATE_TS["scripts/migrate.ts"]
APP_DRIZZLE_DIR["drizzle/*.sql<br/>meta/*"]
end
SP_IDX --> SP_CORE
SP_IDX --> SP_DOMAIN
SP_IDX --> SP_PLATFORM
SP_IDX --> SP_SAAS
SP_IDX --> SP_COMPLIANCE
SP_SCHEMAS --> SP_CORE
SP_SCHEMAS --> SP_DOMAIN
SP_SCHEMAS --> SP_PLATFORM
SP_SCHEMAS --> SP_SAAS
SP_SCHEMAS --> SP_COMPLIANCE
APP_DRIZZLE_CFG --> APP_DRIZZLE_DIR
APP_MIGRATE_TS --> APP_DRIZZLE_DIR
APP_MIGRATE_TS --> SP_IDX
```

**Diagram sources**
- [drizzle.config.ts](file://apps/api/drizzle.config.ts#L1-L13)
- [drizzle.config.ts](file://packages/database-schema/drizzle.config.ts#L1-L13)
- [migrate.ts](file://apps/api/scripts/migrate.ts#L1-L152)
- [index.ts](file://packages/database-schema/src/index.ts#L1-L32)
- [schemas.ts](file://packages/database-schema/src/schemas.ts#L1-L13)

**Section sources**
- [drizzle.config.ts](file://apps/api/drizzle.config.ts#L1-L13)
- [drizzle.config.ts](file://packages/database-schema/drizzle.config.ts#L1-L13)
- [migrate.ts](file://apps/api/scripts/migrate.ts#L1-L152)
- [index.ts](file://packages/database-schema/src/index.ts#L1-L32)
- [schemas.ts](file://packages/database-schema/src/schemas.ts#L1-L13)

## Core Components
- Schema package: Defines PostgreSQL schema namespaces and organizes tables by domain and module. It ensures dependency order among core tables and re-exports all modules via a central index.
- API application: Provides a Drizzle configuration pointing to the schema package and a migration runner that validates and applies Drizzle migrations.

Key responsibilities:
- Single source of truth: The schema package is the authoritative definition of tables, enums, and relationships.
- Type safety: Drizzle ORM types infer inserts and selects from schema definitions.
- Governance: Enum tables and schema namespaces enforce referential integrity and policy alignment.
- Operational: The migration script supports validation and execution against a target database URL.

**Section sources**
- [index.ts](file://packages/database-schema/src/index.ts#L1-L32)
- [schemas.ts](file://packages/database-schema/src/schemas.ts#L1-L13)
- [core/index.ts](file://packages/database-schema/src/core/index.ts#L1-L10)
- [domain/index.ts](file://packages/database-schema/src/domain/index.ts#L1-L8)
- [platform/index.ts](file://packages/database-schema/src/platform/index.ts#L1-L8)
- [saas/index.ts](file://packages/database-schema/src/saas/index.ts#L1-L7)
- [compliance/index.ts](file://packages/database-schema/src/compliance/index.ts#L1-L6)
- [drizzle.config.ts](file://packages/database-schema/drizzle.config.ts#L1-L13)
- [drizzle.config.ts](file://apps/api/drizzle.config.ts#L1-L13)
- [migrate.ts](file://apps/api/scripts/migrate.ts#L1-L152)

## Architecture Overview
The schema is split into namespaces and modules to separate concerns:
- Platform: foundational tables (tenants, organizations, users), RBAC, feature flags, notifications, audit, and subscriptions.
- Domain: rental objects, bookings, availability, pricing, and related metadata.
- SaaS: entitlements, plans, and policies.
- Compliance: audit logs.
- Enum tables: centralized, DB-enforced enumerations for strong typing and governance.

```mermaid
graph TB
subgraph "PostgreSQL Schemas"
P["platform"]
D["domain"]
S["saas"]
C["compliance"]
end
subgraph "Platform Tables"
T["tenants"]
O["organizations"]
U["users"]
RBAC["roles, permissions,<br/>role_permissions, user_roles"]
FF["feature_flags"]
SUB["subscriptions, plans"]
AUD["audit_events"]
NOTI["notifications, templates"]
end
subgraph "Domain Tables"
RO["rental_objects"]
BK["bookings"]
AV["availability/time_blocks"]
PR["pricing, addons"]
ATT["attachments"]
end
subgraph "SaaS Tables"
ENT["entitlements, overrides,<br/>route/nav policies, kill switches"]
end
subgraph "Compliance Tables"
AL["audit_logs"]
end
P --- T
P --- O
P --- U
P --- RBAC
P --- FF
P --- SUB
P --- AUD
P --- NOTI
D --- RO
D --- BK
D --- AV
D --- PR
D --- ATT
S --- ENT
C --- AL
```

**Diagram sources**
- [0001_clean_schema.sql](file://apps/api/drizzle/0001_clean_schema.sql#L1-L1183)
- [0000_dazzling_pretty_boy.sql](file://apps/api/drizzle/0000_dazzling_pretty_boy.sql#L1-L893)
- [schemas.ts](file://packages/database-schema/src/schemas.ts#L1-L13)

## Detailed Component Analysis

### Schema Package Organization
The schema package consolidates definitions into modules and namespaces:
- Central index re-exports modules in dependency order to prevent circular dependencies.
- Schema namespaces encapsulate domain-specific tables.
- Core module tables are ordered to satisfy foreign keys (e.g., organizations depend on tenants).

```mermaid
graph LR
IDX["src/index.ts"]
CORE["core/*"]
DOMAIN["domain/*"]
PLATFORM["platform/*"]
SAAS["saas/*"]
COMPL["compliance/*"]
IDX --> CORE
IDX --> DOMAIN
IDX --> PLATFORM
IDX --> SAAS
IDX --> COMPL
```

**Diagram sources**
- [index.ts](file://packages/database-schema/src/index.ts#L1-L32)
- [core/index.ts](file://packages/database-schema/src/core/index.ts#L1-L10)
- [domain/index.ts](file://packages/database-schema/src/domain/index.ts#L1-L8)
- [platform/index.ts](file://packages/database-schema/src/platform/index.ts#L1-L8)
- [saas/index.ts](file://packages/database-schema/src/saas/index.ts#L1-L7)
- [compliance/index.ts](file://packages/database-schema/src/compliance/index.ts#L1-L6)

**Section sources**
- [index.ts](file://packages/database-schema/src/index.ts#L1-L32)
- [core/index.ts](file://packages/database-schema/src/core/index.ts#L1-L10)
- [domain/index.ts](file://packages/database-schema/src/domain/index.ts#L1-L8)
- [platform/index.ts](file://packages/database-schema/src/platform/index.ts#L1-L8)
- [saas/index.ts](file://packages/database-schema/src/saas/index.ts#L1-L7)
- [compliance/index.ts](file://packages/database-schema/src/compliance/index.ts#L1-L6)

### Core Entities: Tenants, Organizations, Users
- Tenants: foundation table with UUID primary key, slug uniqueness, status, seat limits, feature flags, and timestamps. Includes indexes on slug, status, and subscription plan.
- Organizations: depend on tenants with cascade delete; includes tenant+slug composite index and external ID index.
- Users: linked to tenant and organization, with status and locale constraints.

```mermaid
erDiagram
TENANTS {
uuid id PK
text slug UK
text name
text status
jsonb settings
timestamptz created_at
timestamptz updated_at
}
ORGANIZATIONS {
uuid id PK
uuid tenant_id FK
text name
text slug
text type
jsonb settings
text status
text external_org_id
text source
timestamptz last_synced_at
timestamptz created_at
timestamptz updated_at
}
USERS {
uuid id PK
uuid tenant_id FK
uuid organization_id FK
text email
text name
text national_id
text role
text status
text demo_token
jsonb metadata
timestamptz created_at
timestamptz last_login_at
}
TENANTS ||--o{ ORGANIZATIONS : "owns"
TENANTS ||--o{ USERS : "hosts"
ORGANIZATIONS ||--o{ USERS : "contains"
```

**Diagram sources**
- [tenants.ts](file://packages/database-schema/src/core/tenants.ts#L1-L45)
- [organizations.ts](file://packages/database-schema/src/core/organizations.ts#L1-L36)

**Section sources**
- [tenants.ts](file://packages/database-schema/src/core/tenants.ts#L1-L45)
- [organizations.ts](file://packages/database-schema/src/core/organizations.ts#L1-L36)

### Domain Entity: Rental Objects
- Rental objects link to tenants and organizations, include categorization, pricing metadata, and lifecycle fields.
- Indexes support filtering by tenant, category, time mode, status, and tenant+slug.

```mermaid
erDiagram
RENTAL_OBJECTS {
uuid id PK
uuid tenant_id FK
uuid organization_id FK
text name
text slug
text description
text category_key
text time_mode
jsonb features
text rule_set_key
text status
boolean requires_approval
int capacity
int inventory_total
jsonb images
jsonb pricing
jsonb metadata
timestamptz created_at
timestamptz updated_at
}
TENANTS ||--o{ RENTAL_OBJECTS : "owns"
ORGANIZATIONS ||--o{ RENTAL_OBJECTS : "may associate"
```

**Diagram sources**
- [rental-objects.ts](file://packages/database-schema/src/domain/rental-objects.ts#L1-L53)

**Section sources**
- [rental-objects.ts](file://packages/database-schema/src/domain/rental-objects.ts#L1-L53)

### SaaS Module: Entitlements and Policies
- Plan entitlements and tenant entitlement overrides define feature flag and capability governance.
- Route and navigation policies enable role-based UI enforcement.
- Global kill switches provide environment-scoped toggles.
- Audit log tracks entitlement changes.

```mermaid
erDiagram
PLAN_ENTITLEMENTS {
uuid id PK
uuid plan_id
text key_type
text key
boolean default_enabled
jsonb metadata
timestamptz created_at
timestamptz updated_at
}
TENANT_ENTITLEMENT_OVERRIDES {
uuid id PK
uuid tenant_id
text key_type
text key
boolean enabled
text reason
uuid created_by
timestamptz created_at
timestamptz updated_at
}
ROUTE_POLICIES {
uuid id PK
text app
text route_key UK
jsonb required_roles
jsonb required_modules
jsonb required_features
boolean is_public
text description
timestamptz created_at
timestamptz updated_at
}
NAV_POLICIES {
uuid id PK
text app
text nav_item_key
text route_key
jsonb required_roles
jsonb required_modules
jsonb required_features
text label_key
text icon_key
text parent_key
int order
timestamptz created_at
timestamptz updated_at
}
GLOBAL_KILL_SWITCHES {
uuid id PK
text key_type
text key
boolean enabled
text reason
text environment
uuid created_by
timestamptz created_at
timestamptz updated_at
}
ENTITLEMENT_AUDIT_LOG {
uuid id PK
uuid tenant_id
text action
text key_type
text key
jsonb before
jsonb after
uuid actor_id
text actor_type
uuid correlation_id
jsonb metadata
timestamptz created_at
}
```

**Diagram sources**
- [entitlements.ts](file://packages/database-schema/src/saas/entitlements.ts#L1-L154)

**Section sources**
- [entitlements.ts](file://packages/database-schema/src/saas/entitlements.ts#L1-L154)

### Migration Management and Validation
The API’s migration script supports:
- Drizzle migrations: reads the configured migrations folder and applies via Drizzle migrator.
- Validation mode: checks presence and readability of migration files and verifies required schema exports without touching the database.

```mermaid
sequenceDiagram
participant CLI as "CLI"
participant Script as "migrate.ts"
participant Drizzle as "Drizzle Migrator"
participant DB as "PostgreSQL"
CLI->>Script : "pnpm db : migrate [--validate]"
alt validate-only
Script->>Script : "validate migrations and exports"
Script-->>CLI : "validation summary"
else apply migrations
Script->>Drizzle : "migrate(db, { migrationsFolder })"
Drizzle->>DB : "apply *.sql migrations"
DB-->>Drizzle : "migration status"
Drizzle-->>Script : "success"
Script-->>CLI : "migration completed"
end
```

**Diagram sources**
- [migrate.ts](file://apps/api/scripts/migrate.ts#L1-L152)

**Section sources**
- [migrate.ts](file://apps/api/scripts/migrate.ts#L1-L152)

### Relationship Between Schema Package and API Server
- The API Drizzle configuration points to the schema package index, ensuring migrations and ORM queries align with the canonical schema.
- The API migration script loads the schema index and applies Drizzle migrations, while the schema package also supports generating its own migrations via its Drizzle config.

```mermaid
graph LR
API_CFG["apps/api/drizzle.config.ts"]
PKG_CFG["packages/database-schema/drizzle.config.ts"]
API_MIGRATE["apps/api/scripts/migrate.ts"]
PKG_INDEX["packages/database-schema/src/index.ts"]
API_CFG --> API_MIGRATE
PKG_CFG --> PKG_INDEX
API_MIGRATE --> PKG_INDEX
```

**Diagram sources**
- [drizzle.config.ts](file://apps/api/drizzle.config.ts#L1-L13)
- [drizzle.config.ts](file://packages/database-schema/drizzle.config.ts#L1-L13)
- [migrate.ts](file://apps/api/scripts/migrate.ts#L1-L152)
- [index.ts](file://packages/database-schema/src/index.ts#L1-L32)

**Section sources**
- [drizzle.config.ts](file://apps/api/drizzle.config.ts#L1-L13)
- [drizzle.config.ts](file://packages/database-schema/drizzle.config.ts#L1-L13)
- [migrate.ts](file://apps/api/scripts/migrate.ts#L1-L152)
- [index.ts](file://packages/database-schema/src/index.ts#L1-L32)

## Dependency Analysis
- Internal dependencies:
  - organizations depends on tenants (foreign key).
  - rental objects depends on tenants and organizations.
  - Many platform tables depend on tenants and users.
- Namespace isolation:
  - Core, domain, platform, and SaaS tables are grouped under distinct namespaces to reduce cross-domain coupling.
- Enum enforcement:
  - Enum tables in platform and domain schemas constrain values and improve data integrity.

```mermaid
graph TD
T["tenants"] --> O["organizations"]
T --> RO["rental_objects"]
O --> RO
T --> U["users"]
U --> RO
T --> SUB["subscriptions"]
T --> FF["feature_flags"]
T --> AUD["audit_events"]
RO --> BK["bookings"]
T --> ENT["entitlements_*"]
```

**Diagram sources**
- [0001_clean_schema.sql](file://apps/api/drizzle/0001_clean_schema.sql#L1-L1183)
- [0000_dazzling_pretty_boy.sql](file://apps/api/drizzle/0000_dazzling_pretty_boy.sql#L1-L893)

**Section sources**
- [0001_clean_schema.sql](file://apps/api/drizzle/0001_clean_schema.sql#L1-L1183)
- [0000_dazzling_pretty_boy.sql](file://apps/api/drizzle/0000_dazzling_pretty_boy.sql#L1-L893)

## Performance Considerations
- Indexing strategy:
  - Composite indexes on tenant-scoped fields (e.g., tenant+slug, tenant+status) optimize filtering and joins.
  - Multi-column indexes on time-bound entities (e.g., rental objects, bookings) support range queries.
- JSONB fields:
  - Use targeted indexes where queries filter on JSON keys (e.g., metadata filters).
- Enum tables:
  - Enforce small, controlled vocabularies to keep joins efficient and minimize cardinality explosion.
- Partitioning and materialization:
  - Consider partitioning large time-series tables (e.g., audit logs) by time if growth demands it.

[No sources needed since this section provides general guidance]

## Troubleshooting Guide
Common issues and remedies:
- Missing migrations folder:
  - Ensure the Drizzle migrations directory exists and contains .sql files.
- Validation failures:
  - The migration script validates presence and content of migration files and required exports; fix reported errors before applying.
- Environment configuration:
  - Set DATABASE_URL to a valid PostgreSQL connection string; the script requires it for migration execution.
- Foreign key constraint violations:
  - Apply migrations in order and ensure dependent tables are created before referencing ones.
- Index performance regressions:
  - Add or refine indexes based on slow query patterns; monitor execution plans.

**Section sources**
- [migrate.ts](file://apps/api/scripts/migrate.ts#L1-L152)

## Conclusion
The PostgreSQL data layer leverages a disciplined schema package with Drizzle ORM to establish a single source of truth, strong type safety, and governance-grade enums. The API’s migration pipeline enforces validation and reliable application of schema changes. The modular organization across platform, domain, SaaS, and compliance domains enables maintainability and scalability. Adhering to the documented migration and governance practices ensures consistent evolution of the schema and robust data integrity.

## Appendices

### Migration Execution Flow
```mermaid
flowchart TD
Start(["Start"]) --> CheckValidate["Check --validate flag"]
CheckValidate --> |Yes| Validate["Validate migrations and exports"]
CheckValidate --> |No| CheckURL["Check DATABASE_URL"]
CheckURL --> |Missing| Fail["Exit with error"]
CheckURL --> |Present| RunDrizzle["Run Drizzle Migrator"]
Validate --> Report["Report validation result"]
RunDrizzle --> Done(["Done"])
Report --> AskApply{"Proceed to apply?"}
AskApply --> |Yes| RunDrizzle
AskApply --> |No| End(["End"])
```

**Diagram sources**
- [migrate.ts](file://apps/api/scripts/migrate.ts#L1-L152)