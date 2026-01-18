# Subscription & Billing

<cite>
**Referenced Files in This Document**
- [apps/saas-admin/src/routes/billing/index.tsx](file://apps/saas-admin/src/routes/billing/index.tsx)
- [apps/saas-admin/src/routes/plans/index.tsx](file://apps/saas-admin/src/routes/plans/index.tsx)
- [apps/saas-admin/src/routes/plans/new.tsx](file://apps/saas-admin/src/routes/plans/new.tsx)
- [apps/saas-admin/src/routes/plans/[id].tsx](file://apps/saas-admin/src/routes/plans/[id].tsx)
- [apps/api/src/modules/billing/billing.controller.ts](file://apps/api/src/modules/billing/billing.controller.ts)
- [packages/client-sdk/src/services/billing.service.ts](file://packages/client-sdk/src/services/billing.service.ts)
- [packages/client-sdk/src/hooks/use-billing.ts](file://packages/client-sdk/src/hooks/use-billing.ts)
- [packages/client-sdk/src/types/index.ts](file://packages/client-sdk/src/types/index.ts)
- [apps/api/src/modules/saas/saas.controller.ts](file://apps/api/src/modules/saas/saas.controller.ts)
- [apps/api/src/modules/saas/saas.service.ts](file://apps/api/src/modules/saas/saas.service.ts)
- [apps/api/src/modules/saas/saas.types.ts](file://apps/api/src/modules/saas/saas.types.ts)
- [apps/api/src/schemas/saas.schema.ts](file://apps/api/src/schemas/saas.schema.ts)
- [packages/client-sdk/src/services/saas.service.ts](file://packages/client-sdk/src/services/saas.service.ts)
- [packages/client-sdk/src/hooks/use-saas.ts](file://packages/client-sdk/src/hooks/use-saas.ts)
- [packages/client-sdk/src/types/saas.ts](file://packages/client-sdk/src/types/saas.ts)
- [tests/e2e/saas-admin/plan-crud.spec.ts](file://tests/e2e/saas-admin/plan-crud.spec.ts)
- [tests/e2e/backoffice/blur-eye/economy-invoices.spec.ts](file://tests/e2e/backoffice/blur-eye/economy-invoices.spec.ts)
- [apps/api/src/__tests__/integration/vipps-payment.test.ts](file://apps/api/src/__tests__/integration/vipps-payment.test.ts)
- [tests/journeys/vipps-payment.spec.ts](file://tests/journeys/vipps-payment.spec.ts)
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
This document describes the Subscription and Billing management system in the SaaS Admin Application. It covers plan management (creation, modification, deactivation, and deprecation), billing administration (revenue dashboards, invoice listing, and download), and the integration points with the API backend and payment processors. It also outlines plan catalog management, pricing tiers, feature assignments, subscription tracking, and billing cycle management.

## Project Structure
The Subscription and Billing system spans three primary areas:
- Frontend (SaaS Admin): Plan catalog UI, billing dashboard, and tenant assignment views.
- Client SDK: Typed services and React Query hooks for billing and SaaS APIs.
- Backend API: Controllers and services implementing billing and SaaS domain endpoints.

```mermaid
graph TB
subgraph "Frontend (SaaS Admin)"
SA_Plans_List["Plans List Page<br/>(index.tsx)"]
SA_Plans_Create["Plan Create Page<br/>(new.tsx)"]
SA_Plans_Detail["Plan Detail Page<br/>([id].tsx)"]
SA_Billing_Dashboard["Billing Dashboard<br/>(billing/index.tsx)"]
end
subgraph "Client SDK"
SDK_Billing_Service["billing.service.ts"]
SDK_Billing_Hooks["use-billing.ts"]
SDK_SaaS_Service["saas.service.ts"]
SDK_SaaS_Hooks["use-saas.ts"]
SDK_Types["types/index.ts"]
end
subgraph "Backend API"
API_Billing_Controller["billing.controller.ts"]
API_SAAS_Controller["saas.controller.ts"]
API_SAAS_Service["saas.service.ts"]
API_SAAS_Types["saas.types.ts"]
API_SAAS_Schema["saas.schema.ts"]
end
SA_Plans_List --> SDK_SaaS_Hooks
SA_Plans_Create --> SDK_SaaS_Hooks
SA_Plans_Detail --> SDK_SaaS_Hooks
SA_Billing_Dashboard --> SDK_Billing_Hooks
SDK_SaaS_Hooks --> SDK_SaaS_Service
SDK_Billing_Hooks --> SDK_Billing_Service
SDK_SaaS_Service --> API_SAAS_Controller
SDK_Billing_Service --> API_Billing_Controller
API_SAAS_Controller --> API_SAAS_Service
API_SAAS_Service --> API_SAAS_Types
API_SAAS_Controller --> API_SAAS_Schema
```

**Diagram sources**
- [apps/saas-admin/src/routes/plans/index.tsx](file://apps/saas-admin/src/routes/plans/index.tsx#L1-L386)
- [apps/saas-admin/src/routes/plans/new.tsx](file://apps/saas-admin/src/routes/plans/new.tsx#L1-L474)
- [apps/saas-admin/src/routes/plans/[id].tsx](file://apps/saas-admin/src/routes/plans/[id].tsx#L1-L341)
- [apps/saas-admin/src/routes/billing/index.tsx](file://apps/saas-admin/src/routes/billing/index.tsx#L1-L121)
- [packages/client-sdk/src/services/billing.service.ts](file://packages/client-sdk/src/services/billing.service.ts#L1-L181)
- [packages/client-sdk/src/hooks/use-billing.ts](file://packages/client-sdk/src/hooks/use-billing.ts#L1-L134)
- [packages/client-sdk/src/services/saas.service.ts](file://packages/client-sdk/src/services/saas.service.ts)
- [packages/client-sdk/src/hooks/use-saas.ts](file://packages/client-sdk/src/hooks/use-saas.ts)
- [packages/client-sdk/src/types/index.ts](file://packages/client-sdk/src/types/index.ts#L1-L226)
- [apps/api/src/modules/billing/billing.controller.ts](file://apps/api/src/modules/billing/billing.controller.ts#L1-L330)
- [apps/api/src/modules/saas/saas.controller.ts](file://apps/api/src/modules/saas/saas.controller.ts)
- [apps/api/src/modules/saas/saas.service.ts](file://apps/api/src/modules/saas/saas.service.ts)
- [apps/api/src/modules/saas/saas.types.ts](file://apps/api/src/modules/saas/saas.types.ts)
- [apps/api/src/schemas/saas.schema.ts](file://apps/api/src/schemas/saas.schema.ts)

**Section sources**
- [apps/saas-admin/src/routes/plans/index.tsx](file://apps/saas-admin/src/routes/plans/index.tsx#L1-L386)
- [apps/saas-admin/src/routes/plans/new.tsx](file://apps/saas-admin/src/routes/plans/new.tsx#L1-L474)
- [apps/saas-admin/src/routes/plans/[id].tsx](file://apps/saas-admin/src/routes/plans/[id].tsx#L1-L341)
- [apps/saas-admin/src/routes/billing/index.tsx](file://apps/saas-admin/src/routes/billing/index.tsx#L1-L121)
- [packages/client-sdk/src/services/billing.service.ts](file://packages/client-sdk/src/services/billing.service.ts#L1-L181)
- [packages/client-sdk/src/hooks/use-billing.ts](file://packages/client-sdk/src/hooks/use-billing.ts#L1-L134)
- [packages/client-sdk/src/services/saas.service.ts](file://packages/client-sdk/src/services/saas.service.ts)
- [packages/client-sdk/src/hooks/use-saas.ts](file://packages/client-sdk/src/hooks/use-saas.ts)
- [packages/client-sdk/src/types/index.ts](file://packages/client-sdk/src/types/index.ts#L1-L226)
- [apps/api/src/modules/billing/billing.controller.ts](file://apps/api/src/modules/billing/billing.controller.ts#L1-L330)
- [apps/api/src/modules/saas/saas.controller.ts](file://apps/api/src/modules/saas/saas.controller.ts)
- [apps/api/src/modules/saas/saas.service.ts](file://apps/api/src/modules/saas/saas.service.ts)
- [apps/api/src/modules/saas/saas.types.ts](file://apps/api/src/modules/saas/saas.types.ts)
- [apps/api/src/schemas/saas.schema.ts](file://apps/api/src/schemas/saas.schema.ts)

## Core Components
- Plan Catalog Management
  - Listing plans with filtering, searching, and status tabs.
  - Creating new plans with pricing, billing interval, trial days, visibility, seat limits, and entitlements.
  - Viewing plan details, assigned tenants, and entitlements.
- Billing Administration
  - Billing dashboard displaying total revenue, monthly recurring revenue, active subscriptions, and overdue invoice counts.
  - Invoice listing and download (PDF) via client SDK hooks and services.
- SaaS Domain Integration
  - Plan CRUD operations and tenant assignment via SaaS controller/service.
  - Type-safe contracts and schemas for plan and tenant data.
- Payment and Invoicing Integration
  - Invoice endpoints for user and organization scopes.
  - Download and signed URL retrieval for invoices.
  - Payment journey tests and VIPPS integration examples.

**Section sources**
- [apps/saas-admin/src/routes/plans/index.tsx](file://apps/saas-admin/src/routes/plans/index.tsx#L1-L386)
- [apps/saas-admin/src/routes/plans/new.tsx](file://apps/saas-admin/src/routes/plans/new.tsx#L1-L474)
- [apps/saas-admin/src/routes/plans/[id].tsx](file://apps/saas-admin/src/routes/plans/[id].tsx#L1-L341)
- [apps/saas-admin/src/routes/billing/index.tsx](file://apps/saas-admin/src/routes/billing/index.tsx#L1-L121)
- [packages/client-sdk/src/services/billing.service.ts](file://packages/client-sdk/src/services/billing.service.ts#L1-L181)
- [packages/client-sdk/src/hooks/use-billing.ts](file://packages/client-sdk/src/hooks/use-billing.ts#L1-L134)
- [apps/api/src/modules/billing/billing.controller.ts](file://apps/api/src/modules/billing/billing.controller.ts#L1-L330)
- [apps/api/src/modules/saas/saas.controller.ts](file://apps/api/src/modules/saas/saas.controller.ts)
- [apps/api/src/modules/saas/saas.service.ts](file://apps/api/src/modules/saas/saas.service.ts)
- [apps/api/src/modules/saas/saas.types.ts](file://apps/api/src/modules/saas/saas.types.ts)
- [apps/api/src/schemas/saas.schema.ts](file://apps/api/src/schemas/saas.schema.ts)

## Architecture Overview
The system follows a contract-first, schema-agnostic architecture:
- Frontend SaaS Admin uses typed hooks and services from the Client SDK.
- Client SDK communicates with the Backend API using REST endpoints.
- Backend API controllers expose billing and SaaS endpoints.
- Tests validate flows for plan CRUD and payment processing.

```mermaid
sequenceDiagram
participant Admin as "SaaS Admin UI"
participant Hooks as "React Query Hooks<br/>(use-billing.ts, use-saas.ts)"
participant Service as "SDK Services<br/>(billing.service.ts, saas.service.ts)"
participant API as "API Controllers<br/>(billing.controller.ts, saas.controller.ts)"
participant DB as "API Services & Schemas"
Admin->>Hooks : "useSaasPlans/useSaasPlan/useSaasTenants"
Hooks->>Service : "Call typed SDK methods"
Service->>API : "HTTP requests to REST endpoints"
API->>DB : "Query plan/tenant data"
DB-->>API : "Typed response"
API-->>Service : "JSON payload"
Service-->>Hooks : "Parsed data"
Hooks-->>Admin : "Render lists, forms, charts"
Admin->>Hooks : "useBillingSummary/useInvoices"
Hooks->>Service : "Fetch billing data"
Service->>API : "GET /api/me/billing/summary<br/>GET /api/me/invoices"
API-->>Service : "Billing summary and invoices"
Service-->>Hooks : "Return data"
Hooks-->>Admin : "Display dashboard and invoice list"
```

**Diagram sources**
- [packages/client-sdk/src/hooks/use-billing.ts](file://packages/client-sdk/src/hooks/use-billing.ts#L1-L134)
- [packages/client-sdk/src/services/billing.service.ts](file://packages/client-sdk/src/services/billing.service.ts#L1-L181)
- [packages/client-sdk/src/hooks/use-saas.ts](file://packages/client-sdk/src/hooks/use-saas.ts)
- [packages/client-sdk/src/services/saas.service.ts](file://packages/client-sdk/src/services/saas.service.ts)
- [apps/api/src/modules/billing/billing.controller.ts](file://apps/api/src/modules/billing/billing.controller.ts#L1-L330)
- [apps/api/src/modules/saas/saas.controller.ts](file://apps/api/src/modules/saas/saas.controller.ts)
- [apps/api/src/modules/saas/saas.service.ts](file://apps/api/src/modules/saas/saas.service.ts)
- [apps/api/src/modules/saas/saas.types.ts](file://apps/api/src/modules/saas/saas.types.ts)
- [apps/api/src/schemas/saas.schema.ts](file://apps/api/src/schemas/saas.schema.ts)

## Detailed Component Analysis

### Plan Management
Plan management is implemented across three pages:
- Plans List: Filters, status tabs, search, pagination, and inline status updates.
- Plan Create: Contract-first form with validation, defaults, and submission.
- Plan Detail: Pricing, seat limits, entitlements, and assigned tenants.

```mermaid
flowchart TD
Start(["Open Plans List"]) --> Filter["Apply filters and search"]
Filter --> ViewDetail["View Plan Details"]
ViewDetail --> Edit["Edit Plan"]
ViewDetail --> ChangeStatus["Change Status<br/>(active/inactive/deprecated)"]
Start --> Create["Create New Plan"]
Create --> Validate["Validate form fields"]
Validate --> Submit["Submit create request"]
Submit --> Success["Redirect to Plan Detail"]
ChangeStatus --> Confirm{"Confirm deprecation?"}
Confirm --> |Yes| Update["Update plan status"]
Confirm --> |No| Cancel["Abort"]
Update --> Success
Cancel --> End(["Done"])
Success --> End
```

**Diagram sources**
- [apps/saas-admin/src/routes/plans/index.tsx](file://apps/saas-admin/src/routes/plans/index.tsx#L104-L114)
- [apps/saas-admin/src/routes/plans/new.tsx](file://apps/saas-admin/src/routes/plans/new.tsx#L168-L215)
- [apps/saas-admin/src/routes/plans/[id].tsx](file://apps/saas-admin/src/routes/plans/[id].tsx#L32-L94)

**Section sources**
- [apps/saas-admin/src/routes/plans/index.tsx](file://apps/saas-admin/src/routes/plans/index.tsx#L1-L386)
- [apps/saas-admin/src/routes/plans/new.tsx](file://apps/saas-admin/src/routes/plans/new.tsx#L1-L474)
- [apps/saas-admin/src/routes/plans/[id].tsx](file://apps/saas-admin/src/routes/plans/[id].tsx#L1-L341)
- [tests/e2e/saas-admin/plan-crud.spec.ts](file://tests/e2e/saas-admin/plan-crud.spec.ts)

### Billing Administration
The Billing Dashboard displays key financial metrics and provides access to invoices. The underlying SDK exposes typed hooks and services for fetching summaries and invoices.

```mermaid
sequenceDiagram
participant UI as "Billing Dashboard"
participant Hook as "useBillingSummary/useInvoices"
participant Service as "billing.service.ts"
participant Ctrl as "billing.controller.ts"
UI->>Hook : "Load billing summary and invoices"
Hook->>Service : "getSummary() / listInvoices()"
Service->>Ctrl : "GET /api/me/billing/summary"
Ctrl-->>Service : "Billing summary payload"
Service-->>Hook : "Return summary"
Hook-->>UI : "Render revenue and counts"
UI->>Hook : "Load invoices"
Hook->>Service : "listInvoices()"
Service->>Ctrl : "GET /api/me/invoices"
Ctrl-->>Service : "Invoices payload"
Service-->>Hook : "Return invoices"
Hook-->>UI : "Render invoice list"
```

**Diagram sources**
- [apps/saas-admin/src/routes/billing/index.tsx](file://apps/saas-admin/src/routes/billing/index.tsx#L21-L118)
- [packages/client-sdk/src/hooks/use-billing.ts](file://packages/client-sdk/src/hooks/use-billing.ts#L39-L86)
- [packages/client-sdk/src/services/billing.service.ts](file://packages/client-sdk/src/services/billing.service.ts#L64-L91)
- [apps/api/src/modules/billing/billing.controller.ts](file://apps/api/src/modules/billing/billing.controller.ts#L110-L123)

**Section sources**
- [apps/saas-admin/src/routes/billing/index.tsx](file://apps/saas-admin/src/routes/billing/index.tsx#L1-L121)
- [packages/client-sdk/src/hooks/use-billing.ts](file://packages/client-sdk/src/hooks/use-billing.ts#L1-L134)
- [packages/client-sdk/src/services/billing.service.ts](file://packages/client-sdk/src/services/billing.service.ts#L1-L181)
- [apps/api/src/modules/billing/billing.controller.ts](file://apps/api/src/modules/billing/billing.controller.ts#L1-L330)

### SaaS Domain: Plans and Tenants
The SaaS domain integrates plan and tenant management with typed contracts and services.

```mermaid
classDiagram
class SaasTypes {
+Plan
+Tenant
+SeatLimits
+Entitlements
}
class SaasService {
+getPlans()
+getPlan(id)
+createPlan(data)
+updatePlan(id, data)
+deletePlan(id)
+getTenants(params)
}
class SaasController {
+GET /saas/plans
+GET /saas/plans/ : id
+POST /saas/plans
+PUT /saas/plans/ : id
+DELETE /saas/plans/ : id
+GET /saas/tenants
}
SaasController --> SaasService : "calls"
SaasService --> SaasTypes : "uses"
```

**Diagram sources**
- [apps/api/src/modules/saas/saas.types.ts](file://apps/api/src/modules/saas/saas.types.ts)
- [apps/api/src/modules/saas/saas.service.ts](file://apps/api/src/modules/saas/saas.service.ts)
- [apps/api/src/modules/saas/saas.controller.ts](file://apps/api/src/modules/saas/saas.controller.ts)
- [apps/api/src/schemas/saas.schema.ts](file://apps/api/src/schemas/saas.schema.ts)
- [packages/client-sdk/src/types/saas.ts](file://packages/client-sdk/src/types/saas.ts)
- [packages/client-sdk/src/services/saas.service.ts](file://packages/client-sdk/src/services/saas.service.ts)
- [packages/client-sdk/src/hooks/use-saas.ts](file://packages/client-sdk/src/hooks/use-saas.ts)

**Section sources**
- [apps/api/src/modules/saas/saas.types.ts](file://apps/api/src/modules/saas/saas.types.ts)
- [apps/api/src/modules/saas/saas.service.ts](file://apps/api/src/modules/saas/saas.service.ts)
- [apps/api/src/modules/saas/saas.controller.ts](file://apps/api/src/modules/saas/saas.controller.ts)
- [apps/api/src/schemas/saas.schema.ts](file://apps/api/src/schemas/saas.schema.ts)
- [packages/client-sdk/src/types/saas.ts](file://packages/client-sdk/src/types/saas.ts)
- [packages/client-sdk/src/services/saas.service.ts](file://packages/client-sdk/src/services/saas.service.ts)
- [packages/client-sdk/src/hooks/use-saas.ts](file://packages/client-sdk/src/hooks/use-saas.ts)

### Payment and Invoicing Integration
Payment and invoicing are integrated via invoice endpoints and payment journey tests. The billing controller supports invoice listing, retrieval, and PDF downloads.

```mermaid
sequenceDiagram
participant Test as "VIPPS Payment Test"
participant API as "billing.controller.ts"
participant Storage as "Storage Service"
Test->>API : "GET /api/me/invoices/ : id/download"
API->>Storage : "Generate or retrieve signed URL"
Storage-->>API : "Signed URL or PDF bytes"
API-->>Test : "Return PDF or URL"
```

**Diagram sources**
- [apps/api/src/modules/billing/billing.controller.ts](file://apps/api/src/modules/billing/billing.controller.ts#L180-L226)
- [apps/api/src/__tests__/integration/vipps-payment.test.ts](file://apps/api/src/__tests__/integration/vipps-payment.test.ts)
- [tests/journeys/vipps-payment.spec.ts](file://tests/journeys/vipps-payment.spec.ts)

**Section sources**
- [apps/api/src/modules/billing/billing.controller.ts](file://apps/api/src/modules/billing/billing.controller.ts#L1-L330)
- [apps/api/src/__tests__/integration/vipps-payment.test.ts](file://apps/api/src/__tests__/integration/vipps-payment.test.ts)
- [tests/journeys/vipps-payment.spec.ts](file://tests/journeys/vipps-payment.spec.ts)

## Dependency Analysis
- Frontend depends on the Client SDK for typed API access.
- Client SDK depends on the Backend API for REST endpoints.
- Backend API controllers depend on services and shared schemas/types.
- Tests validate both plan CRUD and payment flows.

```mermaid
graph LR
SA_Plans_List["SaaS Admin Plans List"] --> SDK_SaaS_Hooks["use-saas.ts"]
SA_Plans_Create["SaaS Admin Plan Create"] --> SDK_SaaS_Hooks
SA_Plans_Detail["SaaS Admin Plan Detail"] --> SDK_SaaS_Hooks
SA_Billing_Dashboard["SaaS Admin Billing Dashboard"] --> SDK_Billing_Hooks["use-billing.ts"]
SDK_SaaS_Hooks --> SDK_SaaS_Service["saas.service.ts"]
SDK_Billing_Hooks --> SDK_Billing_Service["billing.service.ts"]
SDK_SaaS_Service --> API_SAAS_Controller["saas.controller.ts"]
SDK_Billing_Service --> API_Billing_Controller["billing.controller.ts"]
API_SAAS_Controller --> API_SAAS_Service["saas.service.ts"]
API_SAAS_Service --> API_SAAS_Types["saas.types.ts"]
API_SAAS_Controller --> API_SAAS_Schema["saas.schema.ts"]
Tests["E2E & Integration Tests"] --> API_SAAS_Controller
Tests --> API_Billing_Controller
```

**Diagram sources**
- [apps/saas-admin/src/routes/plans/index.tsx](file://apps/saas-admin/src/routes/plans/index.tsx#L1-L386)
- [apps/saas-admin/src/routes/plans/new.tsx](file://apps/saas-admin/src/routes/plans/new.tsx#L1-L474)
- [apps/saas-admin/src/routes/plans/[id].tsx](file://apps/saas-admin/src/routes/plans/[id].tsx#L1-L341)
- [apps/saas-admin/src/routes/billing/index.tsx](file://apps/saas-admin/src/routes/billing/index.tsx#L1-L121)
- [packages/client-sdk/src/hooks/use-billing.ts](file://packages/client-sdk/src/hooks/use-billing.ts#L1-L134)
- [packages/client-sdk/src/services/billing.service.ts](file://packages/client-sdk/src/services/billing.service.ts#L1-L181)
- [packages/client-sdk/src/hooks/use-saas.ts](file://packages/client-sdk/src/hooks/use-saas.ts)
- [packages/client-sdk/src/services/saas.service.ts](file://packages/client-sdk/src/services/saas.service.ts)
- [apps/api/src/modules/billing/billing.controller.ts](file://apps/api/src/modules/billing/billing.controller.ts#L1-L330)
- [apps/api/src/modules/saas/saas.controller.ts](file://apps/api/src/modules/saas/saas.controller.ts)
- [apps/api/src/modules/saas/saas.service.ts](file://apps/api/src/modules/saas/saas.service.ts)
- [apps/api/src/modules/saas/saas.types.ts](file://apps/api/src/modules/saas/saas.types.ts)
- [apps/api/src/schemas/saas.schema.ts](file://apps/api/src/schemas/saas.schema.ts)

**Section sources**
- [packages/client-sdk/src/types/index.ts](file://packages/client-sdk/src/types/index.ts#L1-L226)
- [apps/api/src/modules/billing/billing.controller.ts](file://apps/api/src/modules/billing/billing.controller.ts#L1-L330)
- [apps/api/src/modules/saas/saas.controller.ts](file://apps/api/src/modules/saas/saas.controller.ts)
- [apps/api/src/modules/saas/saas.service.ts](file://apps/api/src/modules/saas/saas.service.ts)
- [apps/api/src/modules/saas/saas.types.ts](file://apps/api/src/modules/saas/saas.types.ts)
- [apps/api/src/schemas/saas.schema.ts](file://apps/api/src/schemas/saas.schema.ts)

## Performance Considerations
- Use pagination and filtering on plan and invoice lists to reduce payload sizes.
- Cache frequently accessed billing summaries with appropriate stale times.
- Debounce search inputs to minimize network requests during typing.
- Batch mutations for status updates to avoid redundant reloads.
- Lazy-load plan detail and tenant tables to improve initial render performance.

## Troubleshooting Guide
- Plan Creation Validation
  - Ensure required fields (name, slug) meet validation rules before submission.
  - Slug must match allowed characters and length constraints.
- Status Updates
  - Deprecating a plan requires explicit confirmation; confirmations can prevent accidental deactivation.
- Invoice Downloads
  - If PDF download fails, try retrieving a temporary signed URL and reattempt download.
  - Verify endpoint availability and permissions for the current user or organization context.
- Payment Journeys
  - Review VIPPS integration tests for expected behavior and error handling patterns.

**Section sources**
- [apps/saas-admin/src/routes/plans/new.tsx](file://apps/saas-admin/src/routes/plans/new.tsx#L168-L187)
- [apps/saas-admin/src/routes/plans/index.tsx](file://apps/saas-admin/src/routes/plans/index.tsx#L104-L114)
- [packages/client-sdk/src/services/billing.service.ts](file://packages/client-sdk/src/services/billing.service.ts#L104-L116)
- [apps/api/src/modules/billing/billing.controller.ts](file://apps/api/src/modules/billing/billing.controller.ts#L180-L226)
- [tests/journeys/vipps-payment.spec.ts](file://tests/journeys/vipps-payment.spec.ts)

## Conclusion
The SaaS Admin Subscription and Billing system provides a comprehensive, contract-first solution for managing plan catalogs, billing dashboards, and invoice workflows. The frontend leverages typed SDK hooks and services to interact with backend controllers, while tests validate plan CRUD and payment processing. Extending the system involves adding new endpoints, updating schemas, and enriching the UI with additional analytics and reconciliation features.