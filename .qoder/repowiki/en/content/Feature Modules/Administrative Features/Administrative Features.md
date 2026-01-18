# Administrative Features

<cite>
**Referenced Files in This Document**
- [apps/saas-admin/src/routes/monitoring/index.tsx](file://apps/saas-admin/src/routes/monitoring/index.tsx)
- [apps/saas-admin/src/routes/feature-flags/index.tsx](file://apps/saas-admin/src/routes/feature-flags/index.tsx)
- [apps/backoffice/src/routes/admin-reports.tsx](file://apps/backoffice/src/routes/admin-reports.tsx)
- [packages/client-sdk/src/services/dashboard.service.ts](file://packages/client-sdk/src/services/dashboard.service.ts)
- [packages/client-sdk/src/services/reports.service.ts](file://packages/client-sdk/src/services/reports.service.ts)
- [packages/client-sdk/src/services/security.service.ts](file://packages/client-sdk/src/services/security.service.ts)
- [packages/client-sdk/src/types/additional.ts](file://packages/client-sdk/src/types/additional.ts)
- [apps/api/src/modules/security/security.controller.ts](file://apps/api/src/modules/security/security.controller.ts)
- [apps/api/src/modules/capabilities/capabilities.controller.ts](file://apps/api/src/modules/capabilities/capabilities.controller.ts)
- [packages/database-schema/src/compliance/audit-logs.ts](file://packages/database-schema/src/compliance/audit-logs.ts)
- [apps/api/drizzle/0022_security_hardening.sql](file://apps/api/drizzle/0022_security_hardening.sql)
- [apps/api/drizzle/0011_enterprise_economy.sql](file://apps/api/drizzle/0011_enterprise_economy.sql)
- [docs/quality/backoffice-admin-module-map.md](file://docs/quality/backoffice-admin-module-map.md)
- [tests/e2e/backoffice/rbac/org-admin.journeys.spec.ts](file://tests/e2e/backoffice/rbac/org-admin.journeys.spec.ts)
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
This document describes the administrative and operational features of the platform, focusing on dashboards, analytics, KPI tracking, audit logging, compliance monitoring, configuration management, feature flags, reporting, data export, maintenance workflows, and operational monitoring. It synthesizes frontend UI pages, backend services, and database schemas to present a cohesive picture of how administrators and operators interact with the system.

## Project Structure
Administrative features span three main layers:
- Frontend administrative UIs (SaaS Admin, Backoffice Admin)
- Client SDK services for dashboards, reports, and security
- Backend controllers exposing administrative endpoints and compliance data
- Database schemas supporting audit logs, security events, and monitoring

```mermaid
graph TB
subgraph "Frontend"
SA["SaaS Admin Monitoring<br/>apps/saas-admin/src/routes/monitoring/index.tsx"]
BO["Backoffice Admin Reports<br/>apps/backoffice/src/routes/admin-reports.tsx"]
FF["Feature Flags Catalog<br/>apps/saas-admin/src/routes/feature-flags/index.tsx"]
end
subgraph "Client SDK"
DS["Dashboard Service<br/>packages/client-sdk/src/services/dashboard.service.ts"]
RS["Reports Service<br/>packages/client-sdk/src/services/reports.service.ts"]
SS["Security Service<br/>packages/client-sdk/src/services/security.service.ts"]
end
subgraph "Backend"
SC["Security Controller<br/>apps/api/src/modules/security/security.controller.ts"]
CC["Capabilities Controller<br/>apps/api/src/modules/capabilities/capabilities.controller.ts"]
end
subgraph "Database"
AL["Audit Logs Schema<br/>packages/database-schema/src/compliance/audit-logs.ts"]
SH["Security Hardening Migration<br/>apps/api/drizzle/0022_security_hardening.sql"]
INC["Incidents Schema<br/>apps/api/drizzle/0011_enterprise_economy.sql"]
end
SA --> DS
BO --> RS
FF --> CC
DS --> SC
RS --> SC
SS --> SC
SC --> AL
SC --> SH
SC --> INC
```

**Diagram sources**
- [apps/saas-admin/src/routes/monitoring/index.tsx](file://apps/saas-admin/src/routes/monitoring/index.tsx#L1-L310)
- [apps/backoffice/src/routes/admin-reports.tsx](file://apps/backoffice/src/routes/admin-reports.tsx#L1-L229)
- [apps/saas-admin/src/routes/feature-flags/index.tsx](file://apps/saas-admin/src/routes/feature-flags/index.tsx#L1-L344)
- [packages/client-sdk/src/services/dashboard.service.ts](file://packages/client-sdk/src/services/dashboard.service.ts#L1-L174)
- [packages/client-sdk/src/services/reports.service.ts](file://packages/client-sdk/src/services/reports.service.ts#L1-L287)
- [packages/client-sdk/src/services/security.service.ts](file://packages/client-sdk/src/services/security.service.ts#L116-L148)
- [apps/api/src/modules/security/security.controller.ts](file://apps/api/src/modules/security/security.controller.ts#L1-L395)
- [apps/api/src/modules/capabilities/capabilities.controller.ts](file://apps/api/src/modules/capabilities/capabilities.controller.ts#L1-L257)
- [packages/database-schema/src/compliance/audit-logs.ts](file://packages/database-schema/src/compliance/audit-logs.ts#L1-L35)
- [apps/api/drizzle/0022_security_hardening.sql](file://apps/api/drizzle/0022_security_hardening.sql#L160-L192)
- [apps/api/drizzle/0011_enterprise_economy.sql](file://apps/api/drizzle/0011_enterprise_economy.sql#L213-L227)

**Section sources**
- [apps/saas-admin/src/routes/monitoring/index.tsx](file://apps/saas-admin/src/routes/monitoring/index.tsx#L1-L310)
- [apps/backoffice/src/routes/admin-reports.tsx](file://apps/backoffice/src/routes/admin-reports.tsx#L1-L229)
- [apps/saas-admin/src/routes/feature-flags/index.tsx](file://apps/saas-admin/src/routes/feature-flags/index.tsx#L1-L344)
- [packages/client-sdk/src/services/dashboard.service.ts](file://packages/client-sdk/src/services/dashboard.service.ts#L1-L174)
- [packages/client-sdk/src/services/reports.service.ts](file://packages/client-sdk/src/services/reports.service.ts#L1-L287)
- [packages/client-sdk/src/services/security.service.ts](file://packages/client-sdk/src/services/security.service.ts#L116-L148)
- [apps/api/src/modules/security/security.controller.ts](file://apps/api/src/modules/security/security.controller.ts#L1-L395)
- [apps/api/src/modules/capabilities/capabilities.controller.ts](file://apps/api/src/modules/capabilities/capabilities.controller.ts#L1-L257)
- [packages/database-schema/src/compliance/audit-logs.ts](file://packages/database-schema/src/compliance/audit-logs.ts#L1-L35)
- [apps/api/drizzle/0022_security_hardening.sql](file://apps/api/drizzle/0022_security_hardening.sql#L160-L192)
- [apps/api/drizzle/0011_enterprise_economy.sql](file://apps/api/drizzle/0011_enterprise_economy.sql#L213-L227)

## Core Components
- Dashboard service: Provides KPIs, recent activity, quick actions, upcoming bookings, and pending items.
- Reports service: Generates booking, revenue, utilization, occupancy, heatmap, seasonal patterns, comparisons, and supports export.
- Security service: Retrieves failed login attempts and data export events with pagination and filtering.
- Security controller: Aggregates security metrics, GDPR status, and exposes endpoints for compliance dashboards.
- Feature flags catalog: Lists and filters feature flags across categories and statuses.
- Audit logs schema: Defines the audit trail table with tenant/user references, severity, and metadata.
- Monitoring dashboard (SaaS Admin): Displays platform stats, system status, recent activity, and tenant usage.

**Section sources**
- [packages/client-sdk/src/services/dashboard.service.ts](file://packages/client-sdk/src/services/dashboard.service.ts#L60-L174)
- [packages/client-sdk/src/services/reports.service.ts](file://packages/client-sdk/src/services/reports.service.ts#L48-L287)
- [packages/client-sdk/src/services/security.service.ts](file://packages/client-sdk/src/services/security.service.ts#L116-L148)
- [apps/api/src/modules/security/security.controller.ts](file://apps/api/src/modules/security/security.controller.ts#L23-L158)
- [apps/saas-admin/src/routes/feature-flags/index.tsx](file://apps/saas-admin/src/routes/feature-flags/index.tsx#L46-L344)
- [packages/database-schema/src/compliance/audit-logs.ts](file://packages/database-schema/src/compliance/audit-logs.ts#L16-L35)
- [apps/saas-admin/src/routes/monitoring/index.tsx](file://apps/saas-admin/src/routes/monitoring/index.tsx#L41-L310)

## Architecture Overview
Administrative workflows are driven by capability-aware UIs and authoritative backend endpoints. The frontend SDKs call backend controllers that query the database for audit logs, security metrics, and reporting data. Feature flags are delivered alongside capabilities to enable/disable administrative features dynamically.

```mermaid
sequenceDiagram
participant Admin as "Admin UI (SaaS/Backoffice)"
participant SDK as "Client SDK Services"
participant API as "Backend Controllers"
participant DB as "Database"
Admin->>SDK : Request dashboard KPIs
SDK->>API : GET /api/dashboard/kpis
API->>DB : Query analytics/aggregates
DB-->>API : Results
API-->>SDK : KPI payload
SDK-->>Admin : Render KPI cards
Admin->>SDK : Request reports (CSV/PDF)
SDK->>API : GET /api/reports/export/ : type?params
API->>DB : Build report query
DB-->>API : Rows
API-->>SDK : Binary stream
SDK-->>Admin : Trigger download
Admin->>SDK : Request security metrics
SDK->>API : GET /api/security/metrics
API->>DB : Audit logs + counts
DB-->>API : Metrics
API-->>SDK : Security dashboard payload
SDK-->>Admin : Render metrics
```

**Diagram sources**
- [packages/client-sdk/src/services/dashboard.service.ts](file://packages/client-sdk/src/services/dashboard.service.ts#L94-L96)
- [packages/client-sdk/src/services/reports.service.ts](file://packages/client-sdk/src/services/reports.service.ts#L272-L283)
- [apps/api/src/modules/security/security.controller.ts](file://apps/api/src/modules/security/security.controller.ts#L23-L158)

## Detailed Component Analysis

### Dashboard System for Analytics and KPI Tracking
- Provides KPIs (revenue, bookings, utilization) and recent activity feeds.
- Exposes quick actions and upcoming bookings for operational efficiency.
- Used by SaaS Admin monitoring page and tenant dashboards.

```mermaid
classDiagram
class DashboardService {
+getStats() DashboardStats
+getKPIs() DashboardKPIs
+getRecentActivity(limit) RecentActivity[]
+getQuickActions() QuickAction[]
+getUpcomingBookings(limit) UpcomingBooking[]
+getPendingItems() PendingItems
}
class DashboardKPIs {
+activeListings number
+pendingRequests number
+todayBookings number
+weekBookings number
+monthRevenue number
+previousMonthRevenue number
+revenueGrowth number
+periodRevenue number
+topListings[]
}
class RecentActivity {
+id string
+type "booking"|"listing"|"user"|"message"|"payment"
+action string
+description string
+userId string
+userName string
+resourceId string
+timestamp string
}
class QuickAction {
+id string
+label string
+icon string
+href string
+count number
}
DashboardService --> DashboardKPIs : "returns"
DashboardService --> RecentActivity : "returns"
DashboardService --> QuickAction : "returns"
```

**Diagram sources**
- [packages/client-sdk/src/services/dashboard.service.ts](file://packages/client-sdk/src/services/dashboard.service.ts#L60-L174)
- [packages/client-sdk/src/types/additional.ts](file://packages/client-sdk/src/types/additional.ts#L201-L217)

**Section sources**
- [packages/client-sdk/src/services/dashboard.service.ts](file://packages/client-sdk/src/services/dashboard.service.ts#L60-L174)
- [packages/client-sdk/src/types/additional.ts](file://packages/client-sdk/src/types/additional.ts#L201-L217)
- [apps/saas-admin/src/routes/monitoring/index.tsx](file://apps/saas-admin/src/routes/monitoring/index.tsx#L41-L310)

### Audit Logging, Compliance Tracking, and Activity Monitoring
- Audit logs capture actions, resources, severity, IP, user agent, and metadata.
- Security controller computes audit trail completeness, failed logins, data exports, and retrieves high-severity events.
- GDPR status endpoint aggregates consent across users.
- Security hardening migration introduces a dedicated security events table for risk scoring and flagged events.
- Incidents table tracks operational incidents with severity/status.

```mermaid
erDiagram
AUDIT_LOGS {
uuid id PK
uuid tenant_id FK
uuid user_id FK
varchar action
varchar resource
varchar resource_id
varchar severity
jsonb metadata
varchar ip_address
text user_agent
timestamp timestamp
}
SECURITY_EVENTS {
uuid id PK
uuid tenant_id FK
text event_type
uuid user_id FK
uuid api_key_id FK
inet ip_address
text user_agent
text request_id
jsonb details
integer risk_score
boolean is_flagged
timestamptz created_at
}
INCIDENTS {
uuid id PK
uuid tenant_id FK
text severity
text status
text title
text description
timestamptz created_at
timestamptz resolved_at
jsonb links
}
TENANTS ||--o{ AUDIT_LOGS : "tenant_id"
USERS ||--o{ AUDIT_LOGS : "user_id"
TENANTS ||--o{ SECURITY_EVENTS : "tenant_id"
USERS ||--o{ SECURITY_EVENTS : "user_id"
TENANTS ||--o{ INCIDENTS : "tenant_id"
```

**Diagram sources**
- [packages/database-schema/src/compliance/audit-logs.ts](file://packages/database-schema/src/compliance/audit-logs.ts#L16-L31)
- [apps/api/drizzle/0022_security_hardening.sql](file://apps/api/drizzle/0022_security_hardening.sql#L164-L192)
- [apps/api/drizzle/0011_enterprise_economy.sql](file://apps/api/drizzle/0011_enterprise_economy.sql#L213-L227)

**Section sources**
- [packages/database-schema/src/compliance/audit-logs.ts](file://packages/database-schema/src/compliance/audit-logs.ts#L1-L35)
- [apps/api/src/modules/security/security.controller.ts](file://apps/api/src/modules/security/security.controller.ts#L23-L158)
- [apps/api/drizzle/0022_security_hardening.sql](file://apps/api/drizzle/0022_security_hardening.sql#L160-L192)
- [apps/api/drizzle/0011_enterprise_economy.sql](file://apps/api/drizzle/0011_enterprise_economy.sql#L213-L227)

### Configuration Management, System Settings, and Feature Flags
- Feature flags catalog lists flags by category (module, integration, policy) and status (active, deprecated), with search and filter chips.
- Capabilities controller delivers server-authoritative capabilities and feature flags per app context.
- Tenant dashboards surface enabled/disabled flags for role-based visibility.

```mermaid
flowchart TD
Start(["Admin opens Feature Flags Catalog"]) --> LoadFlags["Load flags via SDK hook"]
LoadFlags --> Filter["Apply category/status/search filters"]
Filter --> Display["Render table with default values and badges"]
Display --> End(["Admin inspects flags"])
```

**Diagram sources**
- [apps/saas-admin/src/routes/feature-flags/index.tsx](file://apps/saas-admin/src/routes/feature-flags/index.tsx#L46-L344)
- [apps/api/src/modules/capabilities/capabilities.controller.ts](file://apps/api/src/modules/capabilities/capabilities.controller.ts#L36-L49)

**Section sources**
- [apps/saas-admin/src/routes/feature-flags/index.tsx](file://apps/saas-admin/src/routes/feature-flags/index.tsx#L1-L344)
- [apps/api/src/modules/capabilities/capabilities.controller.ts](file://apps/api/src/modules/capabilities/capabilities.controller.ts#L1-L257)
- [apps/tenant-admin/src/routes/dashboard.tsx](file://apps/tenant-admin/src/routes/dashboard.tsx#L81-L83)

### Reporting Capabilities and Data Export Functionality
- Reports service supports booking, revenue, utilization, occupancy, heatmap, seasonal patterns, and period comparisons.
- Export endpoint supports CSV, Excel, and PDF formats.
- Backoffice Admin Reports page demonstrates filters, KPI cards, and export buttons.

```mermaid
sequenceDiagram
participant Admin as "Admin UI"
participant SDK as "ReportsService"
participant API as "Backend"
participant DB as "Database"
Admin->>SDK : export(reportType, params, format)
SDK->>API : GET /api/reports/export/ : type?params&format=csv|xlsx|pdf
API->>DB : Execute report query
DB-->>API : Rows
API-->>SDK : Blob
SDK-->>Admin : Trigger browser download
```

**Diagram sources**
- [packages/client-sdk/src/services/reports.service.ts](file://packages/client-sdk/src/services/reports.service.ts#L272-L283)
- [apps/backoffice/src/routes/admin-reports.tsx](file://apps/backoffice/src/routes/admin-reports.tsx#L75-L80)

**Section sources**
- [packages/client-sdk/src/services/reports.service.ts](file://packages/client-sdk/src/services/reports.service.ts#L48-L287)
- [apps/backoffice/src/routes/admin-reports.tsx](file://apps/backoffice/src/routes/admin-reports.tsx#L50-L229)

### Administrative Workflows and Operational Monitoring Tools
- SaaS Admin Monitoring page aggregates platform stats, system status, recent activity, and tenant usage tables.
- Security metrics endpoint surfaces audit trail completeness, failed logins, and recent security events.
- Backoffice Admin Reports page provides filters and export controls for operational insights.

```mermaid
flowchart TD
A["Open Monitoring Page"] --> B["Fetch tenants and billing"]
B --> C["Compute stats (active tenants, users, storage)"]
C --> D["Display system status cards"]
D --> E["Show recent activity log"]
E --> F["Render tenant usage table"]
```

**Diagram sources**
- [apps/saas-admin/src/routes/monitoring/index.tsx](file://apps/saas-admin/src/routes/monitoring/index.tsx#L41-L310)
- [apps/api/src/modules/security/security.controller.ts](file://apps/api/src/modules/security/security.controller.ts#L23-L158)

**Section sources**
- [apps/saas-admin/src/routes/monitoring/index.tsx](file://apps/saas-admin/src/routes/monitoring/index.tsx#L41-L310)
- [apps/api/src/modules/security/security.controller.ts](file://apps/api/src/modules/security/security.controller.ts#L23-L158)

### Administrative Interface Patterns and Security Considerations
- Capability-driven UI: Roles and feature flags determine visible modules and actions.
- Server-authoritative capabilities: Backend endpoints deliver capabilities and feature flags to avoid client-side drift.
- Security events and incidents: Dedicated tables for risk scoring, flagging, and incident lifecycle.
- GDPR consent tracking: Centralized endpoint to compute consent percentages.

```mermaid
graph LR
Role["User Role"] --> |Determines| Caps["Capabilities"]
Flags["Feature Flags"] --> |Enable/Disable| UI["UI Modules"]
Caps --> UI
UI --> AdminOps["Admin Operations"]
SecCtrl["Security Controller"] --> Audit["Audit Logs"]
SecCtrl --> SecEvents["Security Events"]
SecCtrl --> Incidents["Incidents"]
```

**Diagram sources**
- [apps/api/src/modules/capabilities/capabilities.controller.ts](file://apps/api/src/modules/capabilities/capabilities.controller.ts#L36-L49)
- [apps/api/src/modules/security/security.controller.ts](file://apps/api/src/modules/security/security.controller.ts#L23-L158)
- [packages/database-schema/src/compliance/audit-logs.ts](file://packages/database-schema/src/compliance/audit-logs.ts#L16-L31)
- [apps/api/drizzle/0022_security_hardening.sql](file://apps/api/drizzle/0022_security_hardening.sql#L164-L192)
- [apps/api/drizzle/0011_enterprise_economy.sql](file://apps/api/drizzle/0011_enterprise_economy.sql#L213-L227)

**Section sources**
- [apps/api/src/modules/capabilities/capabilities.controller.ts](file://apps/api/src/modules/capabilities/capabilities.controller.ts#L1-L257)
- [docs/quality/backoffice-admin-module-map.md](file://docs/quality/backoffice-admin-module-map.md#L1-L202)

## Dependency Analysis
Administrative features depend on:
- Client SDK services for API abstraction and data modeling.
- Backend controllers for authoritative data and compliance computations.
- Database schemas for audit trails, security events, and incidents.

```mermaid
graph TB
UI["Admin UI Pages"] --> SDK["Client SDK Services"]
SDK --> CTRL["Backend Controllers"]
CTRL --> DB["Database Schemas"]
DB --> AUD["Audit Logs"]
DB --> SEC["Security Events"]
DB --> INC["Incidents"]
```

**Diagram sources**
- [packages/client-sdk/src/services/dashboard.service.ts](file://packages/client-sdk/src/services/dashboard.service.ts#L1-L174)
- [packages/client-sdk/src/services/reports.service.ts](file://packages/client-sdk/src/services/reports.service.ts#L1-L287)
- [packages/client-sdk/src/services/security.service.ts](file://packages/client-sdk/src/services/security.service.ts#L116-L148)
- [apps/api/src/modules/security/security.controller.ts](file://apps/api/src/modules/security/security.controller.ts#L1-L395)
- [packages/database-schema/src/compliance/audit-logs.ts](file://packages/database-schema/src/compliance/audit-logs.ts#L1-L35)
- [apps/api/drizzle/0022_security_hardening.sql](file://apps/api/drizzle/0022_security_hardening.sql#L160-L192)
- [apps/api/drizzle/0011_enterprise_economy.sql](file://apps/api/drizzle/0011_enterprise_economy.sql#L213-L227)

**Section sources**
- [packages/client-sdk/src/services/dashboard.service.ts](file://packages/client-sdk/src/services/dashboard.service.ts#L1-L174)
- [packages/client-sdk/src/services/reports.service.ts](file://packages/client-sdk/src/services/reports.service.ts#L1-L287)
- [packages/client-sdk/src/services/security.service.ts](file://packages/client-sdk/src/services/security.service.ts#L116-L148)
- [apps/api/src/modules/security/security.controller.ts](file://apps/api/src/modules/security/security.controller.ts#L1-L395)
- [packages/database-schema/src/compliance/audit-logs.ts](file://packages/database-schema/src/compliance/audit-logs.ts#L1-L35)
- [apps/api/drizzle/0022_security_hardening.sql](file://apps/api/drizzle/0022_security_hardening.sql#L160-L192)
- [apps/api/drizzle/0011_enterprise_economy.sql](file://apps/api/drizzle/0011_enterprise_economy.sql#L213-L227)

## Performance Considerations
- Use pagination and filtering for security metrics and data exports to avoid large payloads.
- Apply appropriate database indexes on audit logs (tenant, resource, timestamp) to speed up queries.
- Cache frequently accessed KPIs and dashboard summaries where acceptable for staleness policies.
- Batch export jobs for large datasets to prevent blocking the API.

## Troubleshooting Guide
- Verify capability delivery: Ensure the capabilities endpoint returns expected feature flags and UI hints.
- Check audit logs completeness: Confirm audit entries exist for critical actions and that timestamps fall within expected ranges.
- Monitor security events: Review flagged events and risk scores to identify suspicious activity.
- Validate export formats: Confirm supported formats and handle binary downloads gracefully in the UI.
- Test RBAC coverage: Use existing test suites to validate role-based access to reporting and export features.

**Section sources**
- [apps/api/src/modules/capabilities/capabilities.controller.ts](file://apps/api/src/modules/capabilities/capabilities.controller.ts#L1-L257)
- [apps/api/src/modules/security/security.controller.ts](file://apps/api/src/modules/security/security.controller.ts#L23-L158)
- [tests/e2e/backoffice/rbac/org-admin.journeys.spec.ts](file://tests/e2e/backoffice/rbac/org-admin.journeys.spec.ts#L268-L300)

## Conclusion
The administrative and operational layer combines capability-driven UIs, robust audit logging, security metrics, and comprehensive reporting to support informed decision-making and compliance. Feature flags and server-authoritative capabilities ensure safe, controlled access to advanced features while maintaining strong security posture through dedicated security events and incident tracking.

## Appendices
- Administrative module classification and routing are documented in the Backoffice Admin Module Map.
- Capability naming conventions and consistency checks are enforced in unit tests.

**Section sources**
- [docs/quality/backoffice-admin-module-map.md](file://docs/quality/backoffice-admin-module-map.md#L1-L202)
- [tests/unit/capabilities.test.ts](file://tests/unit/capabilities.test.ts#L102-L144)