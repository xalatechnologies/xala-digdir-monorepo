# Availability & Calendar System

<cite>
**Referenced Files in This Document**
- [availability.controller.ts](file://apps/api/src/modules/availability/availability.controller.ts)
- [availability.service.ts](file://apps/api/src/modules/availability/availability.service.ts)
- [calendar.controller.ts](file://apps/api/src/modules/calendar/calendar.controller.ts)
- [calendar.service.ts](file://apps/api/src/modules/calendar/calendar.service.ts)
- [calendar.schema.ts](file://apps/api/src/schemas/calendar.schema.ts)
- [booking.service.ts](file://apps/api/src/modules/booking/booking.service.ts)
- [conflict-detection.service.ts](file://apps/api/src/services/conflict-detection.service.ts)
- [booking.schema.ts](file://apps/api/src/schemas/booking.schema.ts)
- [api.ts](file://apps/api/sdk/api.ts)
- [calendar.service.ts](file://packages/client-sdk/src/services/calendar.service.ts)
- [use-calendar.ts](file://packages/client-sdk/src/hooks/use-calendar.ts)
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
This document explains the availability and calendar system powering the booking platform. It covers:
- Availability query endpoints and date-range filtering
- Calendar configuration APIs and booking modes
- Integration with the availability service and booking conflict detection
- Real-time availability updates and buffer time enforcement
- How different categories influence calendar behavior

The system separates concerns across controllers, services, and schemas, with robust validation and flexible calendar configurations per rental object category.

## Project Structure
The availability and calendar system spans backend modules and client SDKs:
- Backend modules: availability, calendar, booking, conflict detection
- Schemas: calendar and booking domain models
- Client SDK: services and hooks for calendar and availability queries

```mermaid
graph TB
subgraph "Backend Modules"
AC["AvailabilityController<br/>(/api/availability/*)"]
AS["AvailabilityService<br/>(business logic)"]
CC["CalendarController<br/>(/api/calendar/*, /api/rental-objects/*)"]
CS["CalendarService<br/>(config + matrix)"]
BS["BookingService<br/>(bookings + recurring)"]
CDS["ConflictDetectionService<br/>(conflicts + alerts)"]
end
subgraph "Schemas"
CA["calendar.schema.ts<br/>(validation + DTOs)"]
BA["booking.schema.ts<br/>(booking models)"]
end
subgraph "Client SDK"
SDK_API["apps/api/sdk/api.ts<br/>(SDK endpoints)"]
SDK_CAL["client-sdk/services/calendar.service.ts<br/>(CalendarService)"]
SDK_HOOK["client-sdk/hooks/use-calendar.ts<br/>(Calendar hooks)"]
end
AC --> AS
CC --> CS
CS --> CA
AS --> BA
BS --> BA
BS --> CDS
SDK_API --> SDK_CAL
SDK_CAL --> SDK_HOOK
```

**Diagram sources**
- [availability.controller.ts](file://apps/api/src/modules/availability/availability.controller.ts#L1-L320)
- [availability.service.ts](file://apps/api/src/modules/availability/availability.service.ts#L1-L457)
- [calendar.controller.ts](file://apps/api/src/modules/calendar/calendar.controller.ts#L1-L165)
- [calendar.service.ts](file://apps/api/src/modules/calendar/calendar.service.ts#L1-L668)
- [calendar.schema.ts](file://apps/api/src/schemas/calendar.schema.ts#L1-L300)
- [booking.service.ts](file://apps/api/src/modules/booking/booking.service.ts#L1-L800)
- [conflict-detection.service.ts](file://apps/api/src/services/conflict-detection.service.ts#L1-L217)
- [api.ts](file://apps/api/sdk/api.ts#L390-L414)
- [calendar.service.ts](file://packages/client-sdk/src/services/calendar.service.ts#L346-L372)
- [use-calendar.ts](file://packages/client-sdk/src/hooks/use-calendar.ts)

**Section sources**
- [availability.controller.ts](file://apps/api/src/modules/availability/availability.controller.ts#L1-L320)
- [calendar.controller.ts](file://apps/api/src/modules/calendar/calendar.controller.ts#L1-L165)
- [calendar.schema.ts](file://apps/api/src/schemas/calendar.schema.ts#L1-L300)
- [api.ts](file://apps/api/sdk/api.ts#L390-L414)

## Core Components
- AvailabilityController: exposes availability endpoints, including legacy slot retrieval and matrix projection
- AvailabilityService: computes availability calendars, checks slot availability, and aggregates opening hours and exceptions
- CalendarController: provides calendar configuration and availability matrix endpoints
- CalendarService: generates calendar configuration and availability matrices based on listing type and metadata
- BookingService: integrates with availability via buffer time and conflict detection
- ConflictDetectionService: detects and records booking conflicts with real-time alerts
- Schemas: define validation and DTOs for calendar and booking domains

**Section sources**
- [availability.controller.ts](file://apps/api/src/modules/availability/availability.controller.ts#L132-L320)
- [availability.service.ts](file://apps/api/src/modules/availability/availability.service.ts#L32-L457)
- [calendar.controller.ts](file://apps/api/src/modules/calendar/calendar.controller.ts#L24-L165)
- [calendar.service.ts](file://apps/api/src/modules/calendar/calendar.service.ts#L74-L668)
- [booking.service.ts](file://apps/api/src/modules/booking/booking.service.ts#L54-L138)
- [conflict-detection.service.ts](file://apps/api/src/services/conflict-detection.service.ts#L40-L217)
- [calendar.schema.ts](file://apps/api/src/schemas/calendar.schema.ts#L1-L300)

## Architecture Overview
The system follows a layered architecture:
- Controllers handle HTTP requests and delegate to services
- Services encapsulate business logic and coordinate repositories
- Schemas enforce validation and define DTOs
- Client SDKs consume backend endpoints for calendar and availability

```mermaid
sequenceDiagram
participant Client as "Client App"
participant SDK as "SDK (calendar.service.ts)"
participant API as "CalendarController"
participant SVC as "CalendarService"
participant DB as "Database"
Client->>SDK : getEvents({startDate,endDate})
SDK->>API : GET /api/calendar/events
API->>SVC : getCalendarEvents()
SVC->>DB : select bookings within date range
DB-->>SVC : events[]
SVC-->>API : events[]
API-->>SDK : { data : events[] }
SDK-->>Client : events[]
```

**Diagram sources**
- [calendar.service.ts](file://apps/api/src/modules/calendar/calendar.service.ts#L413-L423)
- [calendar.controller.ts](file://apps/api/src/modules/calendar/calendar.controller.ts#L94-L116)
- [calendar.service.ts](file://packages/client-sdk/src/services/calendar.service.ts#L367-L371)

## Detailed Component Analysis

### Availability Endpoints and Matrix Projection
- Legacy slot endpoint: returns time slots for a single date with detailed status and optional conflict metadata
- Matrix endpoint: returns cell-by-cell availability for a date range, supporting TIME_SLOTS, ALL_DAY, and MULTI_DAY granularities

```mermaid
sequenceDiagram
participant Client as "Client App"
participant AC as "AvailabilityController"
participant AS as "AvailabilityService"
participant DB as "Database"
Client->>AC : GET /api/availability/slots?rentalObjectId&date&duration
AC->>AC : validate query params
AC->>DB : fetch rental object + allocations + bookings
AC->>AC : compute slot statuses (BLOCKED,BLACKOUT,CLOSED,RESERVED,BOOKED,AVAILABLE)
AC-->>Client : {slots[], allSlots[]}
Client->>AC : GET /api/availability/ : rentalObjectId?from&to&bookingType
AC->>AS : getAvailabilityMatrix()
AS->>DB : fetch allocations + bookings for date range
AS->>AS : generate cells by granularity + status
AS-->>AC : matrix projection
AC-->>Client : {data : matrix}
```

**Diagram sources**
- [availability.controller.ts](file://apps/api/src/modules/availability/availability.controller.ts#L149-L318)
- [availability.service.ts](file://apps/api/src/modules/availability/availability.service.ts#L196-L344)

**Section sources**
- [availability.controller.ts](file://apps/api/src/modules/availability/availability.controller.ts#L149-L318)
- [availability.service.ts](file://apps/api/src/modules/availability/availability.service.ts#L196-L344)

### Calendar Configuration APIs
- Endpoint: GET /api/rental-objects/:id/calendar-config
- Purpose: Returns calendar behavior configuration derived from listing type and metadata
- Configuration includes granularity, slot rules, booking windows, opening hours, booking types, UI hints, permissions, and available actions

```mermaid
flowchart TD
Start(["GET /api/rental-objects/:id/calendar-config"]) --> Validate["Validate query params"]
Validate --> LoadListing["Load rental object"]
LoadListing --> Granularity["Determine granularity by type + metadata"]
Granularity --> SlotConfig["Compute slotSize/min/max/step + buffer"]
SlotConfig --> Window["Compute booking window (notice, horizon, same-day)"]
Window --> Hours["Extract opening hours (weekly + exceptions)"]
Hours --> Types["Extract booking types (defaults or listing metadata)"]
Types --> UI["Determine UI config (views, multi-select)"]
UI --> Perm["Determine permissions"]
Perm --> Actions["Determine available actions"]
Actions --> Return["Return configuration DTO"]
```

**Diagram sources**
- [calendar.controller.ts](file://apps/api/src/modules/calendar/calendar.controller.ts#L31-L54)
- [calendar.service.ts](file://apps/api/src/modules/calendar/calendar.service.ts#L147-L189)

**Section sources**
- [calendar.controller.ts](file://apps/api/src/modules/calendar/calendar.controller.ts#L31-L54)
- [calendar.service.ts](file://apps/api/src/modules/calendar/calendar.service.ts#L147-L189)
- [calendar.schema.ts](file://apps/api/src/schemas/calendar.schema.ts#L156-L195)

### Booking Modes and Category Influence
- Booking modes: SINGLE_SLOT, IN_GAME, RECURRING
- Calendar granularity: TIME_SLOTS (resource-like), ALL_DAY (event-like), MULTI_DAY (accommodation-like)
- Category influence: CalendarService determines granularity from listing.type and metadata overrides

```mermaid
classDiagram
class CalendarService {
+getCalendarConfig()
+getAvailabilityMatrix()
-determineGranularity()
-determineSlotConfig()
-determineBookingWindow()
-extractOpeningHours()
-extractBookingTypes()
-determineUIConfig()
-determinePermissions()
-determineAvailableActions()
}
class CalendarGranularity {
<<enum>>
TIME_SLOTS
ALL_DAY
MULTI_DAY
}
CalendarService --> CalendarGranularity : "uses"
```

**Diagram sources**
- [calendar.service.ts](file://apps/api/src/modules/calendar/calendar.service.ts#L292-L483)
- [calendar.schema.ts](file://apps/api/src/schemas/calendar.schema.ts#L14-L15)

**Section sources**
- [calendar.service.ts](file://apps/api/src/modules/calendar/calendar.service.ts#L292-L483)
- [booking.schema.ts](file://apps/api/src/schemas/booking.schema.ts#L133-L141)

### Availability Checking Workflows
- Slot availability: checks opening hours, exceptions, bookings, and blocks; supports buffer time around existing bookings
- Calendar matrix: generates cells per day or per slot based on granularity and status mapping

```mermaid
flowchart TD
A["checkAvailability(rentalObjectId, start, end)"] --> Hours["Load opening hours"]
Hours --> Exceptions["Load exceptions for date range"]
Exceptions --> Bookings["Find overlapping CONFIRMED bookings"]
Bookings --> Blocks["Find overlapping blocks"]
Blocks --> Decision{"Any conflicts?"}
Decision --> |Yes| NotAvailable["Return unavailable + reason"]
Decision --> |No| Available["Return available"]
```

**Diagram sources**
- [availability.service.ts](file://apps/api/src/modules/availability/availability.service.ts#L277-L344)

**Section sources**
- [availability.service.ts](file://apps/api/src/modules/availability/availability.service.ts#L277-L344)

### Blocking Dates and Buffer Time Enforcement
- Buffer time: configurable per listing; enforced when checking availability and creating bookings
- Blocks: administrative blocks and blackouts take precedence over bookings

```mermaid
sequenceDiagram
participant Client as "Client App"
participant BS as "BookingService"
participant DB as "Database"
Client->>BS : create({rentalObjectId, startTime, endTime})
BS->>DB : load rental object (bufferTimeMinutes)
BS->>DB : find existing bookings in range (+/- buffer)
DB-->>BS : existing bookings[]
BS->>BS : check overlap with buffer applied
alt conflict found
BS-->>Client : error (conflict + buffer explanation)
else no conflict
BS-->>Client : booking created
end
```

**Diagram sources**
- [booking.service.ts](file://apps/api/src/modules/booking/booking.service.ts#L54-L138)
- [conflict-detection.service.ts](file://apps/api/src/services/conflict-detection.service.ts#L44-L81)

**Section sources**
- [booking.service.ts](file://apps/api/src/modules/booking/booking.service.ts#L54-L138)
- [conflict-detection.service.ts](file://apps/api/src/services/conflict-detection.service.ts#L44-L81)

### Integration with Booking System for Conflict Resolution
- Recurring booking previews: generate occurrences and check availability; apply STOP_ON_CONFLICT or ALLOW_PARTIAL policies
- Conflict detection: records conflicts and sends real-time alerts; supports resolution actions

```mermaid
sequenceDiagram
participant Client as "Client App"
participant BS as "BookingService"
participant CDS as "ConflictDetectionService"
participant DB as "Database"
Client->>BS : previewRecurring({selection})
BS->>BS : generateOccurrences()
BS->>BS : checkOccurrenceConflicts()
alt stopOnConflict
BS-->>Client : error (no bookings created)
else allowPartial
BS-->>Client : {proposedSelection, summary}
end
Client->>BS : createRecurringWithPolicy({selection, policies})
BS->>CDS : checkConflicts()
CDS->>DB : find overlapping bookings
DB-->>CDS : conflicts[]
CDS-->>BS : {hasConflicts, canOverride}
BS-->>Client : {created[], failed[], summary}
```

**Diagram sources**
- [booking.service.ts](file://apps/api/src/modules/booking/booking.service.ts#L780-L800)
- [booking.service.ts](file://apps/api/src/modules/booking/booking.service.ts#L565-L774)
- [conflict-detection.service.ts](file://apps/api/src/services/conflict-detection.service.ts#L44-L81)

**Section sources**
- [booking.service.ts](file://apps/api/src/modules/booking/booking.service.ts#L780-L800)
- [booking.service.ts](file://apps/api/src/modules/booking/booking.service.ts#L565-L774)
- [conflict-detection.service.ts](file://apps/api/src/services/conflict-detection.service.ts#L44-L81)

### Client SDK Integration
- SDK endpoints: calendar events and availability slots
- Client services/hooks: typed access to calendar and availability data

```mermaid
sequenceDiagram
participant UI as "UI Component"
participant Hook as "use-calendar.ts"
participant CalSvc as "calendar.service.ts"
participant API as "apps/api/sdk/api.ts"
UI->>Hook : useCalendar()
Hook->>CalSvc : getEvents({startDate,endDate})
CalSvc->>API : GET /api/calendar/events
API-->>CalSvc : { data : events[] }
CalSvc-->>Hook : events[]
Hook-->>UI : render calendar
```

**Diagram sources**
- [use-calendar.ts](file://packages/client-sdk/src/hooks/use-calendar.ts)
- [calendar.service.ts](file://packages/client-sdk/src/services/calendar.service.ts#L367-L371)
- [api.ts](file://apps/api/sdk/api.ts#L394-L401)

**Section sources**
- [api.ts](file://apps/api/sdk/api.ts#L394-L410)
- [calendar.service.ts](file://packages/client-sdk/src/services/calendar.service.ts#L346-L372)
- [use-calendar.ts](file://packages/client-sdk/src/hooks/use-calendar.ts)

## Dependency Analysis
- Controllers depend on services for business logic
- Services depend on schemas for validation and DTOs
- BookingService integrates with ConflictDetectionService and applies buffer time from rental object metadata
- CalendarService depends on listing metadata to derive configuration

```mermaid
graph LR
AC["AvailabilityController"] --> AS["AvailabilityService"]
CC["CalendarController"] --> CS["CalendarService"]
BS["BookingService"] --> CDS["ConflictDetectionService"]
CS --> CA["calendar.schema.ts"]
AS --> BA["booking.schema.ts"]
BS --> BA
```

**Diagram sources**
- [availability.controller.ts](file://apps/api/src/modules/availability/availability.controller.ts#L132-L136)
- [calendar.controller.ts](file://apps/api/src/modules/calendar/calendar.controller.ts#L32-L35)
- [booking.service.ts](file://apps/api/src/modules/booking/booking.service.ts#L45-L49)
- [conflict-detection.service.ts](file://apps/api/src/services/conflict-detection.service.ts#L40-L41)
- [calendar.schema.ts](file://apps/api/src/schemas/calendar.schema.ts#L1-L300)
- [booking.schema.ts](file://apps/api/src/schemas/booking.schema.ts#L1-L485)

**Section sources**
- [availability.controller.ts](file://apps/api/src/modules/availability/availability.controller.ts#L132-L136)
- [calendar.controller.ts](file://apps/api/src/modules/calendar/calendar.controller.ts#L32-L35)
- [booking.service.ts](file://apps/api/src/modules/booking/booking.service.ts#L45-L49)
- [conflict-detection.service.ts](file://apps/api/src/services/conflict-detection.service.ts#L40-L41)
- [calendar.schema.ts](file://apps/api/src/schemas/calendar.schema.ts#L1-L300)
- [booking.schema.ts](file://apps/api/src/schemas/booking.schema.ts#L1-L485)

## Performance Considerations
- Matrix generation: iterate by day or slot depending on granularity; avoid unnecessary allocations by filtering date ranges
- Buffer time: apply only when needed; cache rental object metadata where appropriate
- Conflict detection: limit overlapping booking queries to relevant time ranges and statuses
- Pagination: use query parameters for large datasets (e.g., calendar events)

## Troubleshooting Guide
- Validation errors: ensure from/to dates are valid and from ≤ to; verify bookingType if provided
- Scope access: org_member and saksbehandler users require active case_handler_scope for calendar access
- Buffer time conflicts: when creating bookings, conflicts may arise due to buffer time around existing bookings
- Real-time alerts: conflicts trigger WebSocket alerts; verify WebSocket service configuration

**Section sources**
- [calendar.schema.ts](file://apps/api/src/schemas/calendar.schema.ts#L268-L277)
- [calendar.service.ts](file://apps/api/src/modules/calendar/calendar.service.ts#L84-L141)
- [booking.service.ts](file://apps/api/src/modules/booking/booking.service.ts#L78-L92)
- [conflict-detection.service.ts](file://apps/api/src/services/conflict-detection.service.ts#L109-L115)

## Conclusion
The availability and calendar system provides a robust, extensible foundation for managing rental object availability across multiple booking modes. It enforces buffer times, integrates with conflict detection, and offers flexible calendar configurations per listing category. The client SDK simplifies consumption of calendar and availability data, enabling real-time updates and seamless booking experiences.