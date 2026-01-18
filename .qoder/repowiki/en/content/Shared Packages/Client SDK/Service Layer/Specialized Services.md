# Specialized Services

<cite>
**Referenced Files in This Document**
- [apps/api/src/main.ts](file://apps/api/src/main.ts)
- [apps/api/src/modules/dashboard/dashboard.controller.ts](file://apps/api/src/modules/dashboard/dashboard.controller.ts)
- [apps/api/src/modules/dashboard/org-dashboard.controller.ts](file://apps/api/src/modules/dashboard/org-dashboard.controller.ts)
- [apps/api/src/modules/monitoring/monitoring.controller.ts](file://apps/api/src/modules/monitoring/monitoring.controller.ts)
- [apps/api/src/modules/monitoring/monitoring.service.ts](file://apps/api/src/modules/monitoring/monitoring.service.ts)
- [apps/api/src/modules/reports/reports.controller.ts](file://apps/api/src/modules/reports/reports.controller.ts)
- [apps/api/src/modules/reports/reports.service.ts](file://apps/api/src/modules/reports/reports.service.ts)
- [apps/api/src/modules/notification-system/notification.controller.ts](file://apps/api/src/modules/notification-system/notification.controller.ts)
- [apps/api/src/modules/notification-system/notification.service.ts](file://apps/api/src/modules/notification-system/notification.service.ts)
- [apps/api/src/modules/notifications/notifications.controller.ts](file://apps/api/src/modules/notifications/notifications.controller.ts)
- [apps/api/src/modules/notifications/notification.service.ts](file://apps/api/src/modules/notifications/notification.service.ts)
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
This document describes specialized services that power dashboards, notifications, reporting, and monitoring across the platform. It focuses on:
- Dashboard analytics for backoffice and organizational contexts
- Notification delivery and lifecycle management
- Report generation and distribution
- System monitoring for audit logs, alerts, and incidents
- Integration with real-time features and scheduling

The goal is to explain APIs, data aggregation patterns, scheduling mechanisms, and composition strategies for building comprehensive application functionality.

## Project Structure
The specialized services are implemented as modular controllers and services under the unified API entry point. The main application registers repositories, services, controllers, and integrates GraphQL and WebSocket routes.

```mermaid
graph TB
subgraph "Unified API"
MAIN["apps/api/src/main.ts"]
MOD_DASH["Dashboard Controllers"]
MOD_MON["Monitoring Controllers"]
MOD_NOTIF_SYS["Notification System Controllers"]
MOD_NOTIF_LEG["Legacy Notifications Controllers"]
MOD_REP["Reports Controllers"]
end
MAIN --> MOD_DASH
MAIN --> MOD_MON
MAIN --> MOD_NOTIF_SYS
MAIN --> MOD_NOTIF_LEG
MAIN --> MOD_REP
```

**Diagram sources**
- [apps/api/src/main.ts](file://apps/api/src/main.ts#L245-L305)

**Section sources**
- [apps/api/src/main.ts](file://apps/api/src/main.ts#L112-L366)

## Core Components
- Dashboard service: Provides KPIs, stats, and recent activity for backoffice; and org-scoped stats, pending items, calendar preview, and alerts for organization users.
- Monitoring service: Manages audit logs, alerts, and incidents with REST endpoints for querying and lifecycle updates.
- Reports service: Defines report templates and orchestrates report generation with queued processing and status retrieval.
- Notification services: Two complementary systems—modern notification system with templates and channels, and legacy notifications with deduplication and delivery tracking.

**Section sources**
- [apps/api/src/modules/dashboard/dashboard.controller.ts](file://apps/api/src/modules/dashboard/dashboard.controller.ts#L18-L112)
- [apps/api/src/modules/dashboard/org-dashboard.controller.ts](file://apps/api/src/modules/dashboard/org-dashboard.controller.ts#L80-L208)
- [apps/api/src/modules/monitoring/monitoring.controller.ts](file://apps/api/src/modules/monitoring/monitoring.controller.ts#L28-L131)
- [apps/api/src/modules/reports/reports.controller.ts](file://apps/api/src/modules/reports/reports.controller.ts#L27-L64)
- [apps/api/src/modules/notification-system/notification.controller.ts](file://apps/api/src/modules/notification-system/notification.controller.ts#L63-L87)
- [apps/api/src/modules/notifications/notifications.controller.ts](file://apps/api/src/modules/notifications/notifications.controller.ts#L86-L115)

## Architecture Overview
The system exposes REST endpoints for each domain, integrates GraphQL for advanced queries, and supports real-time updates via WebSocket routes. Services encapsulate business logic and coordinate with repositories and adapters.

```mermaid
graph TB
CLIENT["Client Apps"]
REST["REST API Controllers"]
GRAPHQL["GraphQL Endpoint"]
WS["WebSocket Routes"]
CLIENT --> REST
CLIENT --> GRAPHQL
CLIENT --> WS
subgraph "Controllers"
DASH_C["DashboardController"]
ORG_DASH_C["OrgDashboardController"]
MON_C["MonitoringController"]
NOTIF_SYS_C["NotificationSystemController"]
NOTIF_LEG_C["NotificationsController"]
REP_C["ReportsController"]
end
subgraph "Services"
DASH_S["Dashboard Service"]
MON_S["MonitoringService"]
NOTIF_SYS_S["NotificationSystemService"]
NOTIF_LEG_S["NotificationService (Legacy)"]
REP_S["ReportsService"]
end
REST --> DASH_C
REST --> ORG_DASH_C
REST --> MON_C
REST --> NOTIF_SYS_C
REST --> NOTIF_LEG_C
REST --> REP_C
DASH_C --> DASH_S
MON_C --> MON_S
NOTIF_SYS_C --> NOTIF_SYS_S
NOTIF_LEG_C --> NOTIF_LEG_S
REP_C --> REP_S
```

**Diagram sources**
- [apps/api/src/main.ts](file://apps/api/src/main.ts#L318-L330)
- [apps/api/src/modules/dashboard/dashboard.controller.ts](file://apps/api/src/modules/dashboard/dashboard.controller.ts#L16-L20)
- [apps/api/src/modules/dashboard/org-dashboard.controller.ts](file://apps/api/src/modules/dashboard/org-dashboard.controller.ts#L74-L75)
- [apps/api/src/modules/monitoring/monitoring.controller.ts](file://apps/api/src/modules/monitoring/monitoring.controller.ts#L15-L16)
- [apps/api/src/modules/notification-system/notification.controller.ts](file://apps/api/src/modules/notification-system/notification.controller.ts#L55-L56)
- [apps/api/src/modules/notifications/notifications.controller.ts](file://apps/api/src/modules/notifications/notifications.controller.ts#L77-L80)
- [apps/api/src/modules/reports/reports.controller.ts](file://apps/api/src/modules/reports/reports.controller.ts#L17-L21)

## Detailed Component Analysis

### Dashboard Analytics
The dashboard service aggregates key metrics and recent activity:
- Backoffice dashboard: active listings, pending requests, daily/weekly bookings, monthly revenue, cancellations, and top listings.
- Organization dashboard: stats scoped to assigned rental objects, pending items requiring approval, calendar preview, operational alerts, and assigned objects.

```mermaid
sequenceDiagram
participant Client as "Client"
participant DashCtrl as "DashboardController"
participant DB as "Database"
Client->>DashCtrl : GET /api/dashboard/kpis
DashCtrl->>DB : Query rentals, bookings, audit logs
DB-->>DashCtrl : Aggregated counts and revenue
DashCtrl-->>Client : KPI JSON response
```

**Diagram sources**
- [apps/api/src/modules/dashboard/dashboard.controller.ts](file://apps/api/src/modules/dashboard/dashboard.controller.ts#L18-L112)

```mermaid
sequenceDiagram
participant Client as "Client"
participant OrgDashCtrl as "OrgDashboardController"
participant DB as "Database"
Client->>OrgDashCtrl : GET /api/org-dashboard/stats
OrgDashCtrl->>DB : Count pending/conf/confirmed bookings<br/>Sum revenue for assigned objects
DB-->>OrgDashCtrl : Stats for assigned objects
OrgDashCtrl-->>Client : Stats JSON response
```

**Diagram sources**
- [apps/api/src/modules/dashboard/org-dashboard.controller.ts](file://apps/api/src/modules/dashboard/org-dashboard.controller.ts#L80-L208)

**Section sources**
- [apps/api/src/modules/dashboard/dashboard.controller.ts](file://apps/api/src/modules/dashboard/dashboard.controller.ts#L18-L185)
- [apps/api/src/modules/dashboard/org-dashboard.controller.ts](file://apps/api/src/modules/dashboard/org-dashboard.controller.ts#L80-L538)

### Notification Delivery and Lifecycle
Two notification systems coexist:
- Modern notification system: templated, multi-channel, scheduled delivery, and real-time broadcasting.
- Legacy notifications: deduplication, delivery attempts, retry mechanism, and admin endpoints.

```mermaid
sequenceDiagram
participant Admin as "Admin Client"
participant NotifSysCtrl as "NotificationSystemController"
participant NotifSysSvc as "NotificationSystemService"
participant Dispatcher as "NotificationDispatcher"
participant Repo as "NotificationRepository"
Admin->>NotifSysCtrl : POST /api/notifications/send
NotifSysCtrl->>NotifSysSvc : notify(tenantId, user, type, vars, options)
NotifSysSvc->>NotifSysSvc : renderAllChannels()
NotifSysSvc->>Dispatcher : dispatch(payload)
Dispatcher->>Repo : persist notification
Dispatcher-->>NotifSysSvc : dispatch results
NotifSysSvc-->>NotifSysCtrl : result
NotifSysCtrl-->>Admin : {success, notificationId}
```

**Diagram sources**
- [apps/api/src/modules/notification-system/notification.controller.ts](file://apps/api/src/modules/notification-system/notification.controller.ts#L220-L263)
- [apps/api/src/modules/notification-system/notification.service.ts](file://apps/api/src/modules/notification-system/notification.service.ts#L59-L125)

```mermaid
sequenceDiagram
participant Client as "Client"
participant NotifCtrl as "NotificationsController"
participant NotifSvc as "NotificationService (Legacy)"
participant Dedup as "DeduplicationService"
participant Delivery as "DeliveryService"
participant Repo as "NotificationRepository"
Client->>NotifCtrl : POST /api/notifications/send
NotifCtrl->>NotifSvc : sendNotification(tenantId, data)
NotifSvc->>Dedup : shouldAllowNotification(...)
Dedup-->>NotifSvc : allow/deny decision
alt Allowed
NotifSvc->>Repo : create(notification)
NotifSvc->>Delivery : sendNotification(notification)
Delivery-->>NotifSvc : success/failure
else Duplicate
NotifSvc-->>NotifCtrl : {isDuplicate, existingId}
end
NotifCtrl-->>Client : Result
```

**Diagram sources**
- [apps/api/src/modules/notifications/notifications.controller.ts](file://apps/api/src/modules/notifications/notifications.controller.ts#L86-L115)
- [apps/api/src/modules/notifications/notification.service.ts](file://apps/api/src/modules/notifications/notification.service.ts#L69-L192)

**Section sources**
- [apps/api/src/modules/notification-system/notification.controller.ts](file://apps/api/src/modules/notification-system/notification.controller.ts#L55-L458)
- [apps/api/src/modules/notification-system/notification.service.ts](file://apps/api/src/modules/notification-system/notification.service.ts#L33-L369)
- [apps/api/src/modules/notifications/notifications.controller.ts](file://apps/api/src/modules/notifications/notifications.controller.ts#L77-L309)
- [apps/api/src/modules/notifications/notification.service.ts](file://apps/api/src/modules/notifications/notification.service.ts#L57-L321)

### Report Generation and Distribution
The reporting service defines templates and orchestrates report generation with queued processing and status retrieval.

```mermaid
sequenceDiagram
participant User as "User"
participant RepCtrl as "ReportsController"
participant RepSvc as "ReportsService"
participant Adapter as "Adapters"
User->>RepCtrl : POST /api/reports/generate
RepCtrl->>RepSvc : generateReport(request, userId)
RepSvc->>Adapter : log "Report generation queued"
RepSvc-->>RepCtrl : {reportId, status=QUEUED}
RepCtrl-->>User : {data}
User->>RepCtrl : GET /api/reports/{id}
RepCtrl->>RepSvc : getReport(reportId)
RepSvc-->>RepCtrl : {reportId, status=READY, downloadUrl,...}
RepCtrl-->>User : {data}
```

**Diagram sources**
- [apps/api/src/modules/reports/reports.controller.ts](file://apps/api/src/modules/reports/reports.controller.ts#L37-L64)
- [apps/api/src/modules/reports/reports.service.ts](file://apps/api/src/modules/reports/reports.service.ts#L87-L128)

**Section sources**
- [apps/api/src/modules/reports/reports.controller.ts](file://apps/api/src/modules/reports/reports.controller.ts#L17-L201)
- [apps/api/src/modules/reports/reports.service.ts](file://apps/api/src/modules/reports/reports.service.ts#L21-L140)

### System Monitoring (Audit Logs, Alerts, Incidents)
The monitoring service manages audit logs, alerts, and incidents with REST endpoints for querying and lifecycle updates.

```mermaid
sequenceDiagram
participant Operator as "Operator"
participant MonCtrl as "MonitoringController"
participant MonSvc as "MonitoringService"
participant AuditRepo as "AuditLogRepository"
participant AlertRepo as "AlertRepository"
participant IncRepo as "IncidentRepository"
Operator->>MonCtrl : GET /api/monitoring/audit-logs?page&limit
MonCtrl->>MonSvc : findAuditLogs(params)
MonSvc->>AuditRepo : findWithFilters(...)
AuditRepo-->>MonSvc : paginated logs
MonSvc-->>MonCtrl : logs
MonCtrl-->>Operator : {data}
Operator->>MonCtrl : POST /api/monitoring/alerts
MonCtrl->>MonSvc : createAlert(tenantId, body)
MonSvc->>AlertRepo : create(...)
AlertRepo-->>MonSvc : alert
MonSvc-->>MonCtrl : alert
MonCtrl-->>Operator : {alert}
Operator->>MonCtrl : PUT /api/monitoring/incidents/ : id/status
MonCtrl->>MonSvc : updateIncidentStatus(id, {status, updatedBy})
MonSvc->>IncRepo : updateStatus(...)
IncRepo-->>MonSvc : incident
MonSvc-->>MonCtrl : incident
MonCtrl-->>Operator : {incident}
```

**Diagram sources**
- [apps/api/src/modules/monitoring/monitoring.controller.ts](file://apps/api/src/modules/monitoring/monitoring.controller.ts#L28-L131)
- [apps/api/src/modules/monitoring/monitoring.service.ts](file://apps/api/src/modules/monitoring/monitoring.service.ts#L41-L160)

**Section sources**
- [apps/api/src/modules/monitoring/monitoring.controller.ts](file://apps/api/src/modules/monitoring/monitoring.controller.ts#L15-L133)
- [apps/api/src/modules/monitoring/monitoring.service.ts](file://apps/api/src/modules/monitoring/monitoring.service.ts#L10-L162)

### Real-Time Features and Scheduling
Real-time updates are exposed via WebSocket routes registered during application bootstrap. Scheduling is supported in the modern notification system for delayed dispatch.

```mermaid
flowchart TD
Start(["Application Bootstrap"]) --> WS["registerWebSocketRoutes(app)"]
WS --> Ready["WebSocket routes ready"]
Ready --> Notify["Dispatch notification"]
Notify --> Scheduled{"scheduledFor in future?"}
Scheduled --> |Yes| Enqueue["Enqueue for later"]
Scheduled --> |No| Deliver["Immediate delivery"]
Enqueue --> Worker["Worker processes queue"]
Worker --> Deliver
```

**Diagram sources**
- [apps/api/src/main.ts](file://apps/api/src/main.ts#L318-L320)
- [apps/api/src/modules/notification-system/notification.service.ts](file://apps/api/src/modules/notification-system/notification.service.ts#L130-L147)

**Section sources**
- [apps/api/src/main.ts](file://apps/api/src/main.ts#L318-L330)
- [apps/api/src/modules/notification-system/notification.service.ts](file://apps/api/src/modules/notification-system/notification.service.ts#L129-L194)

## Dependency Analysis
The specialized services depend on repositories and adapters, and controllers rely on services for business logic.

```mermaid
graph LR
DashCtrl["DashboardController"] --> DashSvc["Dashboard Service"]
OrgDashCtrl["OrgDashboardController"] --> DashSvc
MonCtrl["MonitoringController"] --> MonSvc["MonitoringService"]
NotifSysCtrl["NotificationSystemController"] --> NotifSysSvc["NotificationSystemService"]
NotifLegCtrl["NotificationsController"] --> NotifLegSvc["NotificationService (Legacy)"]
RepCtrl["ReportsController"] --> RepSvc["ReportsService"]
MonSvc --> AuditRepo["AuditLogRepository"]
MonSvc --> AlertRepo["AlertRepository"]
MonSvc --> IncRepo["IncidentRepository"]
NotifLegSvc --> DedupSvc["DeduplicationService"]
NotifLegSvc --> DeliverySvc["DeliveryService"]
NotifLegSvc --> NotifRepo["NotificationRepository"]
```

**Diagram sources**
- [apps/api/src/modules/monitoring/monitoring.service.ts](file://apps/api/src/modules/monitoring/monitoring.service.ts#L12-L17)
- [apps/api/src/modules/notifications/notification.service.ts](file://apps/api/src/modules/notifications/notification.service.ts#L57-L63)

**Section sources**
- [apps/api/src/modules/monitoring/monitoring.service.ts](file://apps/api/src/modules/monitoring/monitoring.service.ts#L10-L162)
- [apps/api/src/modules/notifications/notification.service.ts](file://apps/api/src/modules/notifications/notification.service.ts#L57-L321)

## Performance Considerations
- Dashboard queries aggregate counts and sums; ensure appropriate indexes on status and timestamps for efficient filtering.
- Reports generation is designed to be queued; avoid synchronous heavy computations in controllers.
- Notification scheduling defers work to background processing; tune worker concurrency and retry policies.
- Use pagination for audit logs and reports to limit payload sizes.

## Troubleshooting Guide
- Unauthorized access: Controllers enforce authentication and role checks (e.g., admin-only endpoints).
- Missing environment variables: The main entry point validates DATABASE_URL and JWT_SECRET.
- Notification deduplication: Legacy notifications controller returns duplicate detection errors with existing notification IDs.
- Monitoring endpoints: NotFoundError is thrown when resources (alert/incident) are not found.

**Section sources**
- [apps/api/src/modules/notification-system/notification.controller.ts](file://apps/api/src/modules/notification-system/notification.controller.ts#L224-L231)
- [apps/api/src/modules/monitoring/monitoring.controller.ts](file://apps/api/src/modules/monitoring/monitoring.controller.ts#L104-L106)
- [apps/api/src/modules/monitoring/monitoring.service.ts](file://apps/api/src/modules/monitoring/monitoring.service.ts#L85-L98)
- [apps/api/src/modules/notifications/notifications.controller.ts](file://apps/api/src/modules/notifications/notifications.controller.ts#L106-L114)
- [apps/api/src/main.ts](file://apps/api/src/main.ts#L123-L142)

## Conclusion
The specialized services provide a cohesive foundation for dashboards, notifications, reporting, and monitoring. They leverage modular controllers, robust service layers, and real-time capabilities while supporting scheduling and administrative workflows. Compose these services to build comprehensive application functionality with clear separation of concerns and scalable data aggregation patterns.