# Calendar Integration

<cite>
**Referenced Files in This Document**
- [calendar.controller.ts](file://apps/api/src/modules/calendar/calendar.controller.ts)
- [calendar.service.ts](file://apps/api/src/modules/calendar/calendar.service.ts)
- [calendar.repository.ts](file://apps/api/src/modules/calendar/calendar.repository.ts)
- [calendar.schema.ts](file://apps/api/src/schemas/calendar.schema.ts)
- [availability.service.ts](file://apps/api/src/modules/availability/availability.service.ts)
- [conflict-detection.service.ts](file://apps/api/src/services/conflict-detection.service.ts)
- [booking.service.ts](file://apps/api/src/modules/booking/booking.service.ts)
- [websocket.service.ts](file://apps/api/src/services/websocket.service.ts)
- [activity-calendar-feature.md](file://docs/architecture/activity-calendar-feature.md)
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
This document describes the calendar integration system responsible for managing booking availability and scheduling across rental objects. It covers calendar event generation, availability checking algorithms, conflict detection mechanisms, integration between the booking system and calendar views, real-time updates and synchronization, the availability service for slot availability and buffer times, and the calendar controller endpoints for event retrieval and filtering. It also documents conflict resolution strategies, alternative suggestion algorithms for recurring bookings, and integration with external calendar systems.

## Project Structure
The calendar integration spans several modules:
- Calendar controllers and services for configuration, availability matrices, and legacy event management
- Availability service for opening hours, exception days, monthly calendars, and slot availability checks
- Conflict detection service for identifying and resolving booking conflicts
- Booking service for creating bookings, handling buffer times, and generating recurring series
- WebSocket service for real-time updates

```mermaid
graph TB
subgraph "API Layer"
CC["CalendarController"]
AC["AvailabilityController"]
BC["BookingController"]
end
subgraph "Services"
CS["CalendarService"]
AS["AvailabilityService"]
BDS["BookingService"]
CDS["ConflictDetectionService"]
WS["WebSocketService"]
end
subgraph "Repositories"
CR["CalendarRepository"]
end
subgraph "Database"
TBL_BOOKINGS["bookings"]
TBL_ALLOCATIONS["allocations"]
TBL_BLOCKS["blocks"]
TBL_OPENING_HOURS["opening_hours"]
TBL_EXCEPTION_DAYS["exception_days"]
TBL_TIME_BLOCKS["time_blocks"]
end
CC --> CS
AC --> AS
BC --> BDS
CS --> CR
AS --> TBL_OPENING_HOURS
AS --> TBL_EXCEPTION_DAYS
AS --> TBL_TIME_BLOCKS
AS --> TBL_BOOKINGS
AS --> TBL_TIME_BLOCKS
BDS --> TBL_BOOKINGS
CDS --> TBL_BOOKINGS
CDS --> WS
CR --> TBL_ALLOCATIONS
CR --> TBL_BOOKINGS
CR --> TBL_BLOCKS
```

**Diagram sources**
- [calendar.controller.ts](file://apps/api/src/modules/calendar/calendar.controller.ts#L94-L165)
- [calendar.service.ts](file://apps/api/src/modules/calendar/calendar.service.ts#L74-L668)
- [calendar.repository.ts](file://apps/api/src/modules/calendar/calendar.repository.ts#L63-L277)
- [availability.service.ts](file://apps/api/src/modules/availability/availability.service.ts#L32-L457)
- [conflict-detection.service.ts](file://apps/api/src/services/conflict-detection.service.ts#L40-L217)
- [booking.service.ts](file://apps/api/src/modules/booking/booking.service.ts#L44-L800)

**Section sources**
- [calendar.controller.ts](file://apps/api/src/modules/calendar/calendar.controller.ts#L1-L165)
- [calendar.service.ts](file://apps/api/src/modules/calendar/calendar.service.ts#L1-L668)
- [calendar.repository.ts](file://apps/api/src/modules/calendar/calendar.repository.ts#L1-L277)
- [availability.service.ts](file://apps/api/src/modules/availability/availability.service.ts#L1-L457)
- [conflict-detection.service.ts](file://apps/api/src/services/conflict-detection.service.ts#L1-L217)
- [booking.service.ts](file://apps/api/src/modules/booking/booking.service.ts#L1-L800)

## Core Components
- CalendarController: Exposes endpoints for calendar configuration, availability matrix, and legacy calendar events and allocations.
- CalendarService: Generates calendar configurations and availability matrices based on listing metadata, opening hours, allocations, and bookings.
- CalendarRepository: Provides data access for allocations, events, and availability queries.
- AvailabilityService: Manages opening hours, exception days, monthly availability calendars, and slot availability checks.
- ConflictDetectionService: Detects booking conflicts, records them, and supports resolution and real-time alerts.
- BookingService: Creates bookings, applies buffer times, and generates recurring booking series with conflict policies.
- WebSocketService: Enables real-time broadcasting of booking events and conflict alerts.

**Section sources**
- [calendar.controller.ts](file://apps/api/src/modules/calendar/calendar.controller.ts#L27-L165)
- [calendar.service.ts](file://apps/api/src/modules/calendar/calendar.service.ts#L74-L668)
- [calendar.repository.ts](file://apps/api/src/modules/calendar/calendar.repository.ts#L63-L277)
- [availability.service.ts](file://apps/api/src/modules/availability/availability.service.ts#L32-L457)
- [conflict-detection.service.ts](file://apps/api/src/services/conflict-detection.service.ts#L40-L217)
- [booking.service.ts](file://apps/api/src/modules/booking/booking.service.ts#L44-L800)
- [websocket.service.ts](file://apps/api/src/services/websocket.service.ts)

## Architecture Overview
The calendar integration follows a layered architecture:
- Controllers handle HTTP requests and delegate to services.
- Services encapsulate business logic for calendar configuration, availability computation, and conflict detection.
- Repositories abstract database operations.
- Real-time updates are broadcast via WebSocket.

```mermaid
sequenceDiagram
participant Client as "Client"
participant Controller as "CalendarController"
participant Service as "CalendarService"
participant Repo as "CalendarRepository"
participant DB as "Database"
Client->>Controller : GET /api/availability/ : rentalObjectId?from&to
Controller->>Service : getAvailabilityMatrix(rentalObjectId, params)
Service->>DB : select rentalObjects, allocations, bookings
DB-->>Service : results
Service->>Service : generateAvailabilityCells(...)
Service-->>Controller : matrix
Controller-->>Client : { data : matrix }
```

**Diagram sources**
- [calendar.controller.ts](file://apps/api/src/modules/calendar/calendar.controller.ts#L64-L88)
- [calendar.service.ts](file://apps/api/src/modules/calendar/calendar.service.ts#L195-L288)
- [calendar.repository.ts](file://apps/api/src/modules/calendar/calendar.repository.ts#L71-L106)

## Detailed Component Analysis

### Calendar Service: Configuration and Availability Matrix
The CalendarService computes calendar behavior and availability:
- Determines granularity based on listing type and metadata.
- Builds slot configuration, booking windows, opening hours, booking types, UI hints, permissions, and available actions.
- Generates an availability matrix by iterating over the requested date range, checking allocations and bookings, and marking statuses (AVAILABLE, RESERVED, BOOKED, BLOCKED, BLACKOUT, CLOSED).

```mermaid
flowchart TD
Start([Function Entry]) --> Validate["Validate query params"]
Validate --> FetchListing["Fetch rental object"]
FetchListing --> Granularity["Determine granularity"]
Granularity --> OpeningHours["Extract opening hours"]
OpeningHours --> Dates["Parse from/to dates"]
Dates --> FetchAllocations["Fetch allocations in range"]
FetchAllocations --> FetchBookings["Fetch bookings in range"]
FetchBookings --> GenerateCells["Generate availability cells"]
GenerateCells --> StatusCheck["Determine cell status<br/>by checking allocations then bookings"]
StatusCheck --> ReturnMatrix["Return matrix with legend"]
ReturnMatrix --> End([Function Exit])
```

**Diagram sources**
- [calendar.service.ts](file://apps/api/src/modules/calendar/calendar.service.ts#L195-L288)
- [calendar.service.ts](file://apps/api/src/modules/calendar/calendar.service.ts#L488-L578)
- [calendar.service.ts](file://apps/api/src/modules/calendar/calendar.service.ts#L583-L646)

**Section sources**
- [calendar.service.ts](file://apps/api/src/modules/calendar/calendar.service.ts#L147-L189)
- [calendar.service.ts](file://apps/api/src/modules/calendar/calendar.service.ts#L195-L288)
- [calendar.service.ts](file://apps/api/src/modules/calendar/calendar.service.ts#L488-L667)

### Calendar Repository: Data Access
The CalendarRepository provides:
- Finding events/allocations with optional filters by rental object, date range, and status.
- Creating, updating, and deleting allocations.
- Computing availability by combining blocked slots from allocations and bookings.

```mermaid
classDiagram
class CalendarRepository {
+findEvents(params) AllocationRecord[]
+findById(id) AllocationRecord|null
+create(input) AllocationRecord
+update(id, input) AllocationRecord|null
+delete(id) boolean
+getAvailability(rentalObjectId, start, end) TimeSlot[]
}
```

**Diagram sources**
- [calendar.repository.ts](file://apps/api/src/modules/calendar/calendar.repository.ts#L63-L277)

**Section sources**
- [calendar.repository.ts](file://apps/api/src/modules/calendar/calendar.repository.ts#L71-L106)
- [calendar.repository.ts](file://apps/api/src/modules/calendar/calendar.repository.ts#L141-L197)
- [calendar.repository.ts](file://apps/api/src/modules/calendar/calendar.repository.ts#L217-L262)

### Availability Service: Opening Hours, Exceptions, Monthly Calendar, Slot Checks
The AvailabilityService manages:
- Opening hours per day of week and exception days (holidays/closures).
- Monthly availability calendar generation, aggregating bookings and blocks.
- Slot availability checks against opening hours, exceptions, bookings, and blocks.

```mermaid
flowchart TD
CheckStart([Check availability]) --> OpenHours["Check opening hours for day"]
OpenHours --> HoursClosed{"Is closed?"}
HoursClosed --> |Yes| ReturnFalse["Return unavailable"]
HoursClosed --> |No| Exceptions["Check exception days"]
Exceptions --> ExceptionClosed{"Exception closed?"}
ExceptionClosed --> |Yes| ReturnFalse
ExceptionClosed --> |No| Bookings["Check CONFIRMED bookings overlap"]
Bookings --> HasBooking{"Any overlap?"}
HasBooking --> |Yes| ReturnFalse
HasBooking --> |No| Blocks["Check time blocks overlap"]
Blocks --> HasBlock{"Any overlap?"}
HasBlock --> |Yes| ReturnFalse
HasBlock --> |No| ReturnTrue["Return available"]
```

**Diagram sources**
- [availability.service.ts](file://apps/api/src/modules/availability/availability.service.ts#L277-L344)

**Section sources**
- [availability.service.ts](file://apps/api/src/modules/availability/availability.service.ts#L42-L103)
- [availability.service.ts](file://apps/api/src/modules/availability/availability.service.ts#L112-L191)
- [availability.service.ts](file://apps/api/src/modules/availability/availability.service.ts#L200-L272)
- [availability.service.ts](file://apps/api/src/modules/availability/availability.service.ts#L277-L344)

### Conflict Detection Service: Detection, Recording, Resolution, Suggestions
The ConflictDetectionService:
- Identifies overlapping bookings for a rental object within a time range.
- Records conflicts in the database and broadcasts real-time alerts via WebSocket.
- Supports resolution actions and maintains statistics.
- Provides a framework for generating alternative suggestions (placeholder implementation).

```mermaid
sequenceDiagram
participant Client as "Client"
participant Service as "ConflictDetectionService"
participant DB as "Database"
participant WS as "WebSocketService"
Client->>Service : checkConflicts({rentalObjectId, start, end})
Service->>DB : select overlapping CONFIRMED/PENDING bookings
DB-->>Service : overlapping bookings
Service->>Service : build conflicts array
Service->>DB : insert booking_conflicts
DB-->>Service : conflict id
Service->>WS : sendConflictAlert(rentalObjectId, {type : CONFLICT_DETECTED})
Service-->>Client : {hasConflicts, conflicts, suggestions}
```

**Diagram sources**
- [conflict-detection.service.ts](file://apps/api/src/services/conflict-detection.service.ts#L44-L81)
- [conflict-detection.service.ts](file://apps/api/src/services/conflict-detection.service.ts#L86-L118)
- [websocket.service.ts](file://apps/api/src/services/websocket.service.ts)

**Section sources**
- [conflict-detection.service.ts](file://apps/api/src/services/conflict-detection.service.ts#L44-L81)
- [conflict-detection.service.ts](file://apps/api/src/services/conflict-detection.service.ts#L86-L156)
- [conflict-detection.service.ts](file://apps/api/src/services/conflict-detection.service.ts#L176-L212)

### Booking Service: Buffer Times, Recurring Series, Real-time Updates
The BookingService:
- Applies buffer times around existing bookings when validating new requests.
- Creates bookings with optimistic locking and broadcasts real-time events.
- Generates recurring booking series with conflict policies (stopOnConflict, allowPartial) and builds summaries and proposed selections.

```mermaid
sequenceDiagram
participant Client as "Client"
participant Service as "BookingService"
participant Repo as "BookingRepository"
participant Audit as "AuditService"
participant WS as "WebSocketService"
Client->>Service : create({rentalObjectId, startTime, endTime, ...})
Service->>Repo : findByListingAndDateRange(rentalObjectId, start, end)
Repo-->>Service : existing bookings
Service->>Service : check overlaps with buffer time
Service->>Repo : create booking
Repo-->>Service : booking
Service->>Audit : log create
Service->>WS : broadcastBookingEvent({type : created})
Service-->>Client : booking
```

**Diagram sources**
- [booking.service.ts](file://apps/api/src/modules/booking/booking.service.ts#L54-L138)
- [booking.service.ts](file://apps/api/src/modules/booking/booking.service.ts#L413-L423)

**Section sources**
- [booking.service.ts](file://apps/api/src/modules/booking/booking.service.ts#L54-L138)
- [booking.service.ts](file://apps/api/src/modules/booking/booking.service.ts#L565-L774)
- [booking.service.ts](file://apps/api/src/modules/booking/booking.service.ts#L413-L423)

### Calendar Controllers: Endpoints and Filtering
Controllers expose:
- GET /api/rental-objects/:id/calendar-config for calendar configuration.
- GET /api/availability/:rentalObjectId for availability matrices with from/to date range queries.
- Legacy endpoints under /api/calendar for retrieving events, creating allocations, and checking availability.

```mermaid
classDiagram
class RentalObjectCalendarConfigController {
+getCalendarConfig(request, reply)
}
class AvailabilityMatrixController {
+getAvailabilityMatrix(request, reply)
}
class CalendarController {
+getEvents(request, reply)
+getCalendarEvents(request, reply)
+createAllocation(request, reply)
+getAvailability(request, reply)
}
```

**Diagram sources**
- [calendar.controller.ts](file://apps/api/src/modules/calendar/calendar.controller.ts#L32-L54)
- [calendar.controller.ts](file://apps/api/src/modules/calendar/calendar.controller.ts#L65-L88)
- [calendar.controller.ts](file://apps/api/src/modules/calendar/calendar.controller.ts#L95-L165)

**Section sources**
- [calendar.controller.ts](file://apps/api/src/modules/calendar/calendar.controller.ts#L42-L53)
- [calendar.controller.ts](file://apps/api/src/modules/calendar/calendar.controller.ts#L76-L87)
- [calendar.controller.ts](file://apps/api/src/modules/calendar/calendar.controller.ts#L98-L163)

### Calendar Contracts Service: Blocks Management and Calendar Views
The CalendarContractsService manages:
- Generating calendar data with availability status for day/week/month views.
- Creating and listing maintenance or closure blocks with optional recurring patterns.
- Deleting blocks and annotating time slots with block information.

```mermaid
flowchart TD
Start([Get Calendar]) --> ValidateDates["Validate view and date range"]
ValidateDates --> LoadBlocks["Load ACTIVE blocks in range"]
LoadBlocks --> GenerateSlots["Generate date slots"]
GenerateSlots --> Annotate["Annotate slots with block info"]
Annotate --> ReturnData["Return calendar data"]
```

**Diagram sources**
- [calendar-contracts.service.ts](file://apps/api/src/modules/calendar/calendar-contracts.service.ts#L39-L117)

**Section sources**
- [calendar-contracts.service.ts](file://apps/api/src/modules/calendar/calendar-contracts.service.ts#L39-L117)
- [calendar-contracts.service.ts](file://apps/api/src/modules/calendar/calendar-contracts.service.ts#L123-L169)
- [calendar-contracts.service.ts](file://apps/api/src/modules/calendar/calendar-contracts.service.ts#L174-L204)

### External Calendar Systems Integration
The system can be extended to integrate with external calendar systems:
- Unified calendar view combining bookings, activities, and blocked times.
- Conflict detection incorporating activities that block bookings.
- Public activity calendar feature gap analysis outlines required entities, APIs, and integration points.

```mermaid
graph TB
subgraph "Unified Calendar"
Bookings["Bookings"]
Activities["Activities"]
Blocked["Blocked Time"]
end
subgraph "Integration"
External["External Calendar (iCal/Google Calendar)"]
end
Bookings --> Merge["Merge Calendar Items"]
Activities --> Merge
Blocked --> Merge
Merge --> External
```

**Diagram sources**
- [activity-calendar-feature.md](file://docs/architecture/activity-calendar-feature.md#L411-L432)

**Section sources**
- [activity-calendar-feature.md](file://docs/architecture/activity-calendar-feature.md#L1-L708)

## Dependency Analysis
The calendar integration exhibits clear separation of concerns:
- Controllers depend on services for business logic.
- Services depend on repositories for data access and on database tables for persistence.
- Conflict detection integrates with WebSocket for real-time alerts.
- Booking service coordinates with audit and WebSocket services for real-time updates.

```mermaid
graph LR
CC["CalendarController"] --> CS["CalendarService"]
AC["AvailabilityController"] --> AS["AvailabilityService"]
BC["BookingController"] --> BDS["BookingService"]
CS --> CR["CalendarRepository"]
AS --> DB["Database Tables"]
BDS --> DB
CDS["ConflictDetectionService"] --> DB
CDS --> WS["WebSocketService"]
```

**Diagram sources**
- [calendar.controller.ts](file://apps/api/src/modules/calendar/calendar.controller.ts#L94-L165)
- [calendar.service.ts](file://apps/api/src/modules/calendar/calendar.service.ts#L74-L668)
- [calendar.repository.ts](file://apps/api/src/modules/calendar/calendar.repository.ts#L63-L277)
- [availability.service.ts](file://apps/api/src/modules/availability/availability.service.ts#L32-L457)
- [conflict-detection.service.ts](file://apps/api/src/services/conflict-detection.service.ts#L40-L217)
- [booking.service.ts](file://apps/api/src/modules/booking/booking.service.ts#L44-L800)

**Section sources**
- [calendar.controller.ts](file://apps/api/src/modules/calendar/calendar.controller.ts#L1-L165)
- [calendar.service.ts](file://apps/api/src/modules/calendar/calendar.service.ts#L1-L668)
- [calendar.repository.ts](file://apps/api/src/modules/calendar/calendar.repository.ts#L1-L277)
- [availability.service.ts](file://apps/api/src/modules/availability/availability.service.ts#L1-L457)
- [conflict-detection.service.ts](file://apps/api/src/services/conflict-detection.service.ts#L1-L217)
- [booking.service.ts](file://apps/api/src/modules/booking/booking.service.ts#L1-L800)

## Performance Considerations
- Availability matrix generation iterates over the requested date range and checks allocations and bookings. For large ranges, consider pagination or limiting the maximum range.
- Time range overlap checks are O(n) per cell; ensure indexes exist on time-based columns (start_time, end_time) and rental_object_id.
- Real-time updates via WebSocket should batch events and throttle updates to avoid overwhelming clients.
- Conflict detection queries should leverage appropriate indexes and consider partitioning for large datasets.

## Troubleshooting Guide
Common issues and resolutions:
- Validation errors for missing or invalid query parameters in availability endpoints.
- Scope validation failures for calendar access by org_member and saksbehandler users.
- Buffer time conflicts preventing booking creation; adjust buffer time configuration or propose alternative slots.
- Conflicts detected during recurring series creation; apply stopOnConflict or allowPartial policies and review suggested selections.
- Real-time alerts not received; verify WebSocket service connectivity and conflict alert broadcasting.

**Section sources**
- [calendar.controller.ts](file://apps/api/src/modules/calendar/calendar.controller.ts#L142-L150)
- [booking.service.ts](file://apps/api/src/modules/booking/booking.service.ts#L78-L92)
- [conflict-detection.service.ts](file://apps/api/src/services/conflict-detection.service.ts#L123-L156)

## Conclusion
The calendar integration system provides robust calendar configuration, availability computation, and conflict detection. It supports real-time updates and can be extended to incorporate public activities and external calendar systems. The modular design ensures maintainability and scalability, with clear separation between controllers, services, and repositories.