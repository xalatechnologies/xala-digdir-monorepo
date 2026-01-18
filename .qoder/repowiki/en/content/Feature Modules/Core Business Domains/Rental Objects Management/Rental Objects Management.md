# Rental Objects Management

<cite>
**Referenced Files in This Document**
- [apps/api/src/domain/rental-objects/index.ts](file://apps/api/src/domain/rental-objects/index.ts)
- [apps/api/src/domain/rental-objects/rental-object.ts](file://apps/api/src/domain/rental-objects/rental-object.ts)
- [apps/api/src/modules/rental-objects/rental-object.controller.ts](file://apps/api/src/modules/rental-objects/rental-object.controller.ts)
- [apps/api/src/modules/rental-objects/rental-object.service.ts](file://apps/api/src/modules/rental-objects/rental-object.service.ts)
- [apps/api/src/modules/rental-objects/rental-object.repository.ts](file://apps/api/src/modules/rental-objects/rental-object.repository.ts)
- [apps/api/src/modules/rental-objects/rental-object.projections.ts](file://apps/api/src/modules/rental-objects/rental-object.projections.ts)
- [apps/api/src/modules/rental-objects/category-metadata.ts](file://apps/api/src/modules/rental-objects/category-metadata.ts)
- [apps/api/src/schemas/rental-object.schema.ts](file://apps/api/src/schemas/rental-object.schema.ts)
- [apps/api/src/acl/rental-objects/rental-object.mapper.ts](file://apps/api/src/acl/rental-objects/rental-object.mapper.ts)
- [apps/api/src/acl/rental-objects/index.ts](file://apps/api/src/acl/rental-objects/index.ts)
- [apps/api/drizzle/0034_rental_object_categories_enum.sql](file://apps/api/drizzle/0034_rental_object_categories_enum.sql)
- [apps/api/drizzle/0039_rental_object_custody.sql](file://apps/api/drizzle/0039_rental_object_custody.sql)
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
This document provides comprehensive documentation for the rental objects management domain. It covers the complete CRUD lifecycle for rental properties, including creation, updates, publishing, archiving, duplication, and deletion. It explains the contract-first approach for booking and payment policies, plus tab configurations. It details the category system with property types (venues, equipment, vehicles, experiences) and their booking modes (period, slot, all-day). Media management for images and documents, availability queries, and statistical reporting are documented alongside tenant isolation patterns, custody delegation scopes, and real-time synchronization mechanisms. The projection system for optimized data retrieval and validation schemas for data integrity are also explained.

## Project Structure
The rental objects domain is implemented as a cohesive module within the API application, with clear separation of concerns across domain modeling, validation, persistence, projections, and controllers. Supporting database migrations define canonical categories and custody delegation tables.

```mermaid
graph TB
subgraph "API Application"
CTRL["Controller<br/>rental-object.controller.ts"]
SVC["Service<br/>rental-object.service.ts"]
REPO["Repository<br/>rental-object.repository.ts"]
MAPPER["ACL Mapper<br/>acl/rental-objects/rental-object.mapper.ts"]
PROJ["Projections<br/>rental-object.projections.ts"]
DOMAIN["Domain Model<br/>domain/rental-objects/rental-object.ts"]
SCHEMAS["Validation Schemas<br/>schemas/rental-object.schema.ts"]
end
subgraph "Database"
ENUM["Categories Enum<br/>drizzle/0034_rental_object_categories_enum.sql"]
CUSTODY["Custody Grants<br/>drizzle/0039_rental_object_custody.sql"]
end
CTRL --> SVC
SVC --> REPO
REPO --> MAPPER
MAPPER --> DOMAIN
PROJ --> DOMAIN
SVC --> SCHEMAS
REPO --> ENUM
CTRL --> CUSTODY
```

**Diagram sources**
- [apps/api/src/modules/rental-objects/rental-object.controller.ts](file://apps/api/src/modules/rental-objects/rental-object.controller.ts#L20-L245)
- [apps/api/src/modules/rental-objects/rental-object.service.ts](file://apps/api/src/modules/rental-objects/rental-object.service.ts#L20-L468)
- [apps/api/src/modules/rental-objects/rental-object.repository.ts](file://apps/api/src/modules/rental-objects/rental-object.repository.ts#L10-L185)
- [apps/api/src/acl/rental-objects/rental-object.mapper.ts](file://apps/api/src/acl/rental-objects/rental-object.mapper.ts#L1-L778)
- [apps/api/src/modules/rental-objects/rental-object.projections.ts](file://apps/api/src/modules/rental-objects/rental-object.projections.ts#L1-L590)
- [apps/api/src/domain/rental-objects/rental-object.ts](file://apps/api/src/domain/rental-objects/rental-object.ts#L1-L435)
- [apps/api/src/schemas/rental-object.schema.ts](file://apps/api/src/schemas/rental-object.schema.ts#L1-L351)
- [apps/api/drizzle/0034_rental_object_categories_enum.sql](file://apps/api/drizzle/0034_rental_object_categories_enum.sql#L1-L72)
- [apps/api/drizzle/0039_rental_object_custody.sql](file://apps/api/drizzle/0039_rental_object_custody.sql#L1-L105)

**Section sources**
- [apps/api/src/modules/rental-objects/rental-object.controller.ts](file://apps/api/src/modules/rental-objects/rental-object.controller.ts#L20-L245)
- [apps/api/src/modules/rental-objects/rental-object.service.ts](file://apps/api/src/modules/rental-objects/rental-object.service.ts#L20-L468)
- [apps/api/src/modules/rental-objects/rental-object.repository.ts](file://apps/api/src/modules/rental-objects/rental-object.repository.ts#L10-L185)
- [apps/api/src/acl/rental-objects/rental-object.mapper.ts](file://apps/api/src/acl/rental-objects/rental-object.mapper.ts#L1-L778)
- [apps/api/src/modules/rental-objects/rental-object.projections.ts](file://apps/api/src/modules/rental-objects/rental-object.projections.ts#L1-L590)
- [apps/api/src/domain/rental-objects/rental-object.ts](file://apps/api/src/domain/rental-objects/rental-object.ts#L1-L435)
- [apps/api/src/schemas/rental-object.schema.ts](file://apps/api/src/schemas/rental-object.schema.ts#L1-L351)
- [apps/api/drizzle/0034_rental_object_categories_enum.sql](file://apps/api/drizzle/0034_rental_object_categories_enum.sql#L1-L72)
- [apps/api/drizzle/0039_rental_object_custody.sql](file://apps/api/drizzle/0039_rental_object_custody.sql#L1-L105)

## Core Components
- Domain model: Defines the canonical business representation of rental objects, including value objects for location, pricing, capacity, images, contact info, opening hours, booking configuration, amenities, equipment, rules, FAQs, and additional services. It includes domain events and validation rules.
- Service layer: Implements business operations such as create, update, publish, unpublish, archive, restore, duplicate, delete, availability queries, media management, and policy/tab generation.
- Repository: Handles data access with tenant-aware filtering, public listing, slug-based lookup, availability computation stubs, and statistics stubs.
- Controller: Exposes REST endpoints for CRUD operations, availability, media, statistics, and policy/tab endpoints with custody scope enforcement.
- Projections: Transforms domain entities into display-ready DTOs for cards and details, handling i18n keys and computed fields.
- ACL Mapper: Bridges persistence and domain, parsing database JSONB fields into domain types and serializing domain back to persistence format.
- Validation schemas: Zod-based schemas for create/update DTOs, query parameters, and category/time-mode/status/pricing-unit validation with dynamic enums.
- Database migrations: Canonical category enumeration and custody delegation tables.

**Section sources**
- [apps/api/src/domain/rental-objects/rental-object.ts](file://apps/api/src/domain/rental-objects/rental-object.ts#L1-L435)
- [apps/api/src/modules/rental-objects/rental-object.service.ts](file://apps/api/src/modules/rental-objects/rental-object.service.ts#L20-L468)
- [apps/api/src/modules/rental-objects/rental-object.repository.ts](file://apps/api/src/modules/rental-objects/rental-object.repository.ts#L10-L185)
- [apps/api/src/modules/rental-objects/rental-object.controller.ts](file://apps/api/src/modules/rental-objects/rental-object.controller.ts#L20-L245)
- [apps/api/src/modules/rental-objects/rental-object.projections.ts](file://apps/api/src/modules/rental-objects/rental-object.projections.ts#L1-L590)
- [apps/api/src/acl/rental-objects/rental-object.mapper.ts](file://apps/api/src/acl/rental-objects/rental-object.mapper.ts#L1-L778)
- [apps/api/src/schemas/rental-object.schema.ts](file://apps/api/src/schemas/rental-object.schema.ts#L1-L351)
- [apps/api/drizzle/0034_rental_object_categories_enum.sql](file://apps/api/drizzle/0034_rental_object_categories_enum.sql#L1-L72)
- [apps/api/drizzle/0039_rental_object_custody.sql](file://apps/api/drizzle/0039_rental_object_custody.sql#L1-L105)

## Architecture Overview
The system follows a layered architecture with explicit separation between domain, service, repository, controller, projections, and ACL mapping. The domain model is schema-agnostic and independent of database or API concerns. Validation schemas enforce data integrity at the boundaries. The projection system ensures consistent presentation across clients. Custody delegation and tenant isolation are enforced via decorators and database constraints.

```mermaid
graph TB
CLIENT["Client Applications"]
API["REST API Controllers"]
SVC["Business Service"]
REPO["Repository"]
DB[("Database")]
ENUM["Categories Enum"]
CUSTODY["Custody Grants"]
CLIENT --> API
API --> SVC
SVC --> REPO
REPO --> DB
DB --> ENUM
API --> CUSTODY
```

**Diagram sources**
- [apps/api/src/modules/rental-objects/rental-object.controller.ts](file://apps/api/src/modules/rental-objects/rental-object.controller.ts#L20-L245)
- [apps/api/src/modules/rental-objects/rental-object.service.ts](file://apps/api/src/modules/rental-objects/rental-object.service.ts#L20-L468)
- [apps/api/src/modules/rental-objects/rental-object.repository.ts](file://apps/api/src/modules/rental-objects/rental-object.repository.ts#L10-L185)
- [apps/api/drizzle/0034_rental_object_categories_enum.sql](file://apps/api/drizzle/0034_rental_object_categories_enum.sql#L1-L72)
- [apps/api/drizzle/0039_rental_object_custody.sql](file://apps/api/drizzle/0039_rental_object_custody.sql#L1-L105)

## Detailed Component Analysis

### Domain Model and Validation
The domain model defines a rich, immutable representation of rental objects with value objects for location, pricing, capacity, images, contact info, opening hours, booking configuration, amenities, equipment, rules, FAQs, and additional services. It includes domain events and validation rules that ensure business invariants such as required fields for publishing, capacity constraints, and feature dependencies.

```mermaid
classDiagram
class RentalObject {
+string id
+string tenantId
+string? organizationId
+string name
+string title
+string slug
+string description
+Category category
+string timeMode
+string[] features
+string? ruleSet
+string status
+boolean requiresApproval
+Location? location
+Capacity? capacity
+Pricing? pricing
+Image[] images
+ContactInfo? contact
+OpeningHours[] openingHours
+BookingConfig? bookingConfig
+Amenity[] amenities
+Equipment[] equipment
+Rule[] rules
+FaqEntry[] faq
+AdditionalService[] additionalServices
+string[] highlights
+boolean isFeatured
+number? averageRating
+number reviewCount
+Record metadata
+Date createdAt
+Date updatedAt
}
class Location {
+string street
+string postalCode
+string city
+string municipality
+string country
+number? latitude
+number? longitude
}
class Pricing {
+number amount
+string currency
+string unit
+boolean taxIncluded
+number taxRate
}
class Capacity {
+number maximum
+number? inventoryTotal
+number? inventoryAvailable
}
class Image {
+string id
+string url
+string thumbnailUrl
+string alt
+boolean isPrimary
+number order
}
class ContactInfo {
+string name
+string email
+string phone
+string? website
}
class OpeningHours {
+number dayOfWeek
+string openTime
+string closeTime
+boolean isClosed
}
class BookingConfig {
+number minDurationMinutes
+number maxDurationMinutes
+number advanceBookingDays
+number cancellationDeadlineHours
+boolean requiresApproval
+boolean instantBookingEnabled
+string calendarType
}
class Amenity {
+string id
+string name
+string icon
+string category
}
class Equipment {
+string id
+string name
+number quantity
+string description
}
class Rule {
+string id
+string title
+string content
+number order
}
class FaqEntry {
+string id
+string question
+string answer
+number order
}
class AdditionalService {
+string id
+string name
+string description
+Pricing pricing
+boolean isOptional
}
RentalObject --> Location
RentalObject --> Pricing
RentalObject --> Capacity
RentalObject --> Image
RentalObject --> ContactInfo
RentalObject --> OpeningHours
RentalObject --> BookingConfig
RentalObject --> Amenity
RentalObject --> Equipment
RentalObject --> Rule
RentalObject --> FaqEntry
RentalObject --> AdditionalService
```

**Diagram sources**
- [apps/api/src/domain/rental-objects/rental-object.ts](file://apps/api/src/domain/rental-objects/rental-object.ts#L193-L289)

**Section sources**
- [apps/api/src/domain/rental-objects/rental-object.ts](file://apps/api/src/domain/rental-objects/rental-object.ts#L1-L435)

### Service Layer Operations
The service layer orchestrates business operations, applying validation, enforcing rules, and emitting audit logs. It supports:
- Creation with slug generation and default values
- Updates with partial field updates
- Publishing/unpublishing with validation
- Archiving/restoring with status transitions
- Duplication preserving most fields except identity and timestamps
- Availability queries and statistics (placeholders)
- Policy and tab generation for contract-first UI behavior

```mermaid
sequenceDiagram
participant Client as "Client"
participant Controller as "RentalObjectController"
participant Service as "RentalObjectService"
participant Repo as "RentalObjectRepository"
Client->>Controller : "POST /api/rental-objects"
Controller->>Controller : "validate(CreateRentalObjectSchema)"
Controller->>Service : "create(tenantId, data)"
Service->>Repo : "create(entity)"
Repo-->>Service : "saved entity"
Service-->>Controller : "entity"
Controller-->>Client : "201 Created {data}"
Note over Client,Controller : "Publish workflow"
Client->>Controller : "PUT /api/rental-objects/ : id/publish"
Controller->>Service : "publish(id)"
Service->>Repo : "update(id, {status : 'published'})"
Repo-->>Service : "published entity"
Service-->>Controller : "entity"
Controller-->>Client : "{data}"
```

**Diagram sources**
- [apps/api/src/modules/rental-objects/rental-object.controller.ts](file://apps/api/src/modules/rental-objects/rental-object.controller.ts#L65-L92)
- [apps/api/src/modules/rental-objects/rental-object.service.ts](file://apps/api/src/modules/rental-objects/rental-object.service.ts#L30-L65)
- [apps/api/src/modules/rental-objects/rental-object.repository.ts](file://apps/api/src/modules/rental-objects/rental-object.repository.ts#L10-L21)

**Section sources**
- [apps/api/src/modules/rental-objects/rental-object.service.ts](file://apps/api/src/modules/rental-objects/rental-object.service.ts#L20-L468)

### Repository and Tenant Isolation
The repository implements tenant-aware filtering, public listing restrictions, and flexible query parameters including category, subcategory, time mode, organization, search, capacity, and price ranges. It also handles JSON field post-filtering for city/municipality and pricing ranges.

```mermaid
flowchart TD
Start(["findWithFilters"]) --> CheckTenant["Tenant provided?"]
CheckTenant --> |Yes| AddTenant["Filter by tenantId"]
CheckTenant --> |No| PublicFilter["Filter by status=published"]
AddTenant --> StatusFilter["Apply status filter"]
PublicFilter --> StatusFilter
StatusFilter --> CategoryFilter["Apply category filter"]
CategoryFilter --> SubcategoryFilter["Apply subcategory filter"]
SubcategoryFilter --> TimeModeFilter["Apply timeMode filter"]
TimeModeFilter --> OrgFilter["Apply organizationId filter"]
OrgFilter --> SearchFilter["Apply text search"]
SearchFilter --> CapacityFilter["Apply capacity range"]
CapacityFilter --> PriceFilter["Apply price range"]
PriceFilter --> JsonFields["Post-filter JSON fields (city, municipality)"]
JsonFields --> Sort["Sort and paginate"]
Sort --> End(["Return paginated result"])
```

**Diagram sources**
- [apps/api/src/modules/rental-objects/rental-object.repository.ts](file://apps/api/src/modules/rental-objects/rental-object.repository.ts#L36-L139)

**Section sources**
- [apps/api/src/modules/rental-objects/rental-object.repository.ts](file://apps/api/src/modules/rental-objects/rental-object.repository.ts#L10-L185)

### Contract-First Policies and Tabs
The service exposes contract-first endpoints for booking policy, payment policy, and tab configuration. These DTOs encode UI behavior and constraints derived from the rental object’s category, time mode, and booking features.

```mermaid
sequenceDiagram
participant Client as "Client"
participant Controller as "RentalObjectController"
participant Service as "RentalObjectService"
Client->>Controller : "GET /api/rental-objects/ : id/booking-policy"
Controller->>Service : "getBookingPolicy(id)"
Service-->>Controller : "BookingPolicyDTO"
Controller-->>Client : "{data}"
Client->>Controller : "GET /api/rental-objects/ : id/payment-policy"
Controller->>Service : "getPaymentPolicy(id)"
Service-->>Controller : "PaymentPolicyDTO"
Controller-->>Client : "{data}"
Client->>Controller : "GET /api/rental-objects/ : id/tabs"
Controller->>Service : "getTabs(id)"
Service-->>Controller : "TabConfigDTO[]"
Controller-->>Client : "{data}"
```

**Diagram sources**
- [apps/api/src/modules/rental-objects/rental-object.controller.ts](file://apps/api/src/modules/rental-objects/rental-object.controller.ts#L214-L244)
- [apps/api/src/modules/rental-objects/rental-object.service.ts](file://apps/api/src/modules/rental-objects/rental-object.service.ts#L316-L466)

**Section sources**
- [apps/api/src/modules/rental-objects/rental-object.service.ts](file://apps/api/src/modules/rental-objects/rental-object.service.ts#L316-L466)

### Category System and Booking Modes
The system defines canonical categories enforced at the database level and supports three booking modes: PERIOD, SLOT, and ALL_DAY. The category metadata provides defaults and structures for different property types.

```mermaid
erDiagram
ENUM_CATEGORY {
text code PK
text name_nb
text name_en
text description_nb
text description_en
int sort_order
}
RENTAL_OBJECTS {
uuid id PK
text category_code FK
}
ENUM_CATEGORY ||--o{ RENTAL_OBJECTS : "category_code"
```

**Diagram sources**
- [apps/api/drizzle/0034_rental_object_categories_enum.sql](file://apps/api/drizzle/0034_rental_object_categories_enum.sql#L16-L64)

**Section sources**
- [apps/api/drizzle/0034_rental_object_categories_enum.sql](file://apps/api/drizzle/0034_rental_object_categories_enum.sql#L1-L72)
- [apps/api/src/modules/rental-objects/category-metadata.ts](file://apps/api/src/modules/rental-objects/category-metadata.ts#L1-L77)

### Media Management
The controller exposes endpoints for uploading and deleting media associated with a rental object. The service adds/removes media URLs from the images collection.

```mermaid
sequenceDiagram
participant Client as "Client"
participant Controller as "RentalObjectController"
participant Service as "RentalObjectService"
Client->>Controller : "POST /api/rental-objects/ : id/media {url,type}"
Controller->>Service : "addMedia(id, url, type)"
Service-->>Controller : "updated rental object"
Controller-->>Client : "{data}"
Client->>Controller : "DELETE /api/rental-objects/ : id/media/ : mediaId"
Controller->>Service : "removeMedia(id, mediaId)"
Service-->>Controller : "void"
Controller-->>Client : "{success : true}"
```

**Diagram sources**
- [apps/api/src/modules/rental-objects/rental-object.controller.ts](file://apps/api/src/modules/rental-objects/rental-object.controller.ts#L171-L191)
- [apps/api/src/modules/rental-objects/rental-object.service.ts](file://apps/api/src/modules/rental-objects/rental-object.service.ts#L259-L275)

**Section sources**
- [apps/api/src/modules/rental-objects/rental-object.controller.ts](file://apps/api/src/modules/rental-objects/rental-object.controller.ts#L171-L191)
- [apps/api/src/modules/rental-objects/rental-object.service.ts](file://apps/api/src/modules/rental-objects/rental-object.service.ts#L259-L275)

### Availability Queries and Statistics
The controller exposes availability and statistics endpoints. The repository currently returns stubbed results; these can be extended to integrate with availability and pricing engines.

```mermaid
sequenceDiagram
participant Client as "Client"
participant Controller as "RentalObjectController"
participant Service as "RentalObjectService"
participant Repo as "RentalObjectRepository"
Client->>Controller : "GET /api/rental-objects/ : id/availability?startDate&endDate"
Controller->>Service : "getAvailability(id, startDate, endDate)"
Service->>Repo : "getAvailability(id, startDate, endDate)"
Repo-->>Service : "availability stub"
Service-->>Controller : "availability"
Controller-->>Client : "{data}"
Client->>Controller : "GET /api/rental-objects/ : id/stats"
Controller->>Service : "getStats(id)"
Service->>Repo : "getStats(id)"
Repo-->>Service : "stats stub"
Service-->>Controller : "stats"
Controller-->>Client : "{data}"
```

**Diagram sources**
- [apps/api/src/modules/rental-objects/rental-object.controller.ts](file://apps/api/src/modules/rental-objects/rental-object.controller.ts#L157-L201)
- [apps/api/src/modules/rental-objects/rental-object.service.ts](file://apps/api/src/modules/rental-objects/rental-object.service.ts#L254-L282)
- [apps/api/src/modules/rental-objects/rental-object.repository.ts](file://apps/api/src/modules/rental-objects/rental-object.repository.ts#L155-L179)

**Section sources**
- [apps/api/src/modules/rental-objects/rental-object.controller.ts](file://apps/api/src/modules/rental-objects/rental-object.controller.ts#L157-L201)
- [apps/api/src/modules/rental-objects/rental-object.repository.ts](file://apps/api/src/modules/rental-objects/rental-object.repository.ts#L155-L179)

### Projection System
The projection system converts domain entities into display-ready DTOs for cards and details, handling i18n keys, computed fields, and flexible image formats. It ensures consistent presentation across clients.

```mermaid
flowchart TD
Domain["Domain Entity"] --> Mapper["ACL Mapper"]
Mapper --> Projections["Projections"]
Projections --> Card["Card Projection DTO"]
Projections --> Details["Details Projection DTO"]
```

**Diagram sources**
- [apps/api/src/acl/rental-objects/rental-object.mapper.ts](file://apps/api/src/acl/rental-objects/rental-object.mapper.ts#L81-L157)
- [apps/api/src/modules/rental-objects/rental-object.projections.ts](file://apps/api/src/modules/rental-objects/rental-object.projections.ts#L362-L582)

**Section sources**
- [apps/api/src/acl/rental-objects/rental-object.mapper.ts](file://apps/api/src/acl/rental-objects/rental-object.mapper.ts#L1-L778)
- [apps/api/src/modules/rental-objects/rental-object.projections.ts](file://apps/api/src/modules/rental-objects/rental-object.projections.ts#L1-L590)

### Validation Schemas
Zod schemas define strict validation for create/update DTOs, query parameters, and category/time-mode/status/pricing-unit codes. They support dynamic validation against database-defined enums and enforce business rules.

```mermaid
flowchart TD
Input["Request Body/Query"] --> Schema["Zod Schema"]
Schema --> Validated["Validated DTO"]
Validated --> Service["Service Layer"]
```

**Diagram sources**
- [apps/api/src/schemas/rental-object.schema.ts](file://apps/api/src/schemas/rental-object.schema.ts#L237-L332)

**Section sources**
- [apps/api/src/schemas/rental-object.schema.ts](file://apps/api/src/schemas/rental-object.schema.ts#L1-L351)

### Tenant Isolation and Custody Delegation
Tenant isolation is enforced in queries and public listings. Custody delegation scopes are applied via decorators on endpoints, and the custody grants/subgrants tables define hierarchical delegation with effective dates, scopes, and revocation.

```mermaid
erDiagram
TENANTS {
uuid id PK
}
ORGANIZATIONS {
uuid id PK
}
USERS {
uuid id PK
}
RENTAL_OBJECTS {
uuid id PK
}
RENTAL_OBJECT_CUSTODY_GRANTS {
uuid id PK
uuid tenant_id FK
uuid rental_object_id FK
varchar grantee_type
uuid grantee_id
text[] scopes
boolean can_subdelegate
timestamptz effective_from
timestamptz effective_to
text status
}
RENTAL_OBJECT_CUSTODY_SUBGRANTS {
uuid id PK
uuid tenant_id FK
uuid parent_grant_id FK
uuid org_id FK
uuid member_user_id FK
text[] scopes
timestamptz effective_from
timestamptz effective_to
text status
}
TENANTS ||--o{ RENTAL_OBJECT_CUSTODY_GRANTS : "tenant_id"
RENTAL_OBJECTS ||--o{ RENTAL_OBJECT_CUSTODY_GRANTS : "rental_object_id"
ORGANIZATIONS ||--o{ RENTAL_OBJECT_CUSTODY_SUBGRANTS : "org_id"
USERS ||--o{ RENTAL_OBJECT_CUSTODY_SUBGRANTS : "member_user_id"
RENTAL_OBJECT_CUSTODY_GRANTS ||--o{ RENTAL_OBJECT_CUSTODY_SUBGRANTS : "parent_grant_id"
```

**Diagram sources**
- [apps/api/drizzle/0039_rental_object_custody.sql](file://apps/api/drizzle/0039_rental_object_custody.sql#L5-L105)

**Section sources**
- [apps/api/drizzle/0039_rental_object_custody.sql](file://apps/api/drizzle/0039_rental_object_custody.sql#L1-L105)
- [apps/api/src/modules/rental-objects/rental-object.controller.ts](file://apps/api/src/modules/rental-objects/rental-object.controller.ts#L76-L138)

## Dependency Analysis
The module exhibits strong cohesion within the domain and service layers, with clear decoupling from persistence via the ACL mapper and projections. Dependencies flow downward from controllers to services to repositories, with validation schemas and domain models at the center.

```mermaid
graph LR
Controller["Controller"] --> Service["Service"]
Service --> Repository["Repository"]
Repository --> Mapper["ACL Mapper"]
Mapper --> Domain["Domain Model"]
Service --> Schemas["Validation Schemas"]
Controller --> Custody["Custody Decorators"]
Repository --> DB[("Database")]
```

**Diagram sources**
- [apps/api/src/modules/rental-objects/rental-object.controller.ts](file://apps/api/src/modules/rental-objects/rental-object.controller.ts#L20-L245)
- [apps/api/src/modules/rental-objects/rental-object.service.ts](file://apps/api/src/modules/rental-objects/rental-object.service.ts#L20-L468)
- [apps/api/src/modules/rental-objects/rental-object.repository.ts](file://apps/api/src/modules/rental-objects/rental-object.repository.ts#L10-L185)
- [apps/api/src/acl/rental-objects/rental-object.mapper.ts](file://apps/api/src/acl/rental-objects/rental-object.mapper.ts#L1-L778)
- [apps/api/src/schemas/rental-object.schema.ts](file://apps/api/src/schemas/rental-object.schema.ts#L1-L351)

**Section sources**
- [apps/api/src/modules/rental-objects/rental-object.controller.ts](file://apps/api/src/modules/rental-objects/rental-object.controller.ts#L20-L245)
- [apps/api/src/modules/rental-objects/rental-object.service.ts](file://apps/api/src/modules/rental-objects/rental-object.service.ts#L20-L468)
- [apps/api/src/modules/rental-objects/rental-object.repository.ts](file://apps/api/src/modules/rental-objects/rental-object.repository.ts#L10-L185)
- [apps/api/src/acl/rental-objects/rental-object.mapper.ts](file://apps/api/src/acl/rental-objects/rental-object.mapper.ts#L1-L778)
- [apps/api/src/schemas/rental-object.schema.ts](file://apps/api/src/schemas/rental-object.schema.ts#L1-L351)

## Performance Considerations
- Indexing: Category filtering and tenant scoping benefit from database indices on category_code and tenant_id.
- Pagination: Repository applies pagination and sorting; avoid selecting unnecessary fields in projections.
- JSONB queries: Post-filtering on JSON fields (city, municipality, pricing) may impact performance; consider denormalized columns for frequent filters.
- Projections: Computation-heavy transformations should be minimized; cache where appropriate.
- Audit logging: Logging within service operations is lightweight but consider batching for high-volume writes.

[No sources needed since this section provides general guidance]

## Troubleshooting Guide
Common issues and resolutions:
- Validation errors: Ensure request payloads conform to Zod schemas; check category/time-mode/status/pricing-unit codes against database-defined enums.
- Publishing failures: Verify required fields (name, description, images, pricing) per domain validation rules.
- Tenant visibility: Public listings only return published objects; tenant-scoped queries require proper tenant context.
- Media operations: Confirm custody scopes (RO_MEDIA) for media endpoints; ensure URLs are accessible.
- Custody delegation: Verify active grants and subgrants for delegated actions; check effective dates and scopes.

**Section sources**
- [apps/api/src/schemas/rental-object.schema.ts](file://apps/api/src/schemas/rental-object.schema.ts#L1-L351)
- [apps/api/src/domain/rental-objects/rental-object.ts](file://apps/api/src/domain/rental-objects/rental-object.ts#L328-L434)
- [apps/api/src/modules/rental-objects/rental-object.controller.ts](file://apps/api/src/modules/rental-objects/rental-object.controller.ts#L76-L138)
- [apps/api/drizzle/0039_rental_object_custody.sql](file://apps/api/drizzle/0039_rental_object_custody.sql#L40-L49)

## Conclusion
The rental objects management domain is built on a robust, contract-first foundation with clear separation of concerns, tenant isolation, and custody delegation. The domain model, validation schemas, projections, and service/repository layers work together to support a comprehensive CRUD lifecycle, policy-driven UI behavior, and extensible category and booking mode systems. The projection system ensures consistent presentation, while the custody and tenant isolation patterns safeguard data access and delegation. Extending availability and statistics to integrate with dedicated engines will further enhance operational insights and user experience.