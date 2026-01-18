# Real-time Notifications

<cite>
**Referenced Files in This Document**
- [websocket.controller.ts](file://apps/api/src/modules/websocket/websocket.controller.ts)
- [websocket.middleware.ts](file://apps/api/src/modules/websocket/websocket.middleware.ts)
- [websocket.service.ts](file://apps/api/src/services/websocket.service.ts)
- [index.ts](file://packages/client-sdk/src/realtime/index.ts)
- [use-realtime.ts](file://packages/client-sdk/src/hooks/use-realtime.ts)
- [RealtimeProvider.tsx](file://packages/client-sdk/src/providers/RealtimeProvider.tsx)
- [ws-cache-sync.ts](file://packages/client-sdk/src/realtime/ws-cache-sync.ts)
- [notification.dispatcher.ts](file://apps/api/src/modules/notification-system/notification.dispatcher.ts)
- [notification.service.ts](file://apps/api/src/modules/notification-system/notification.service.ts)
- [notification.repository.ts](file://apps/api/src/modules/notification-system/notification.repository.ts)
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
This document explains the real-time notification system built on WebSocket technology. It covers the notification dispatcher, tenant-specific event routing, real-time event broadcasting, and client-side handling. It also documents the WebSocket event format, retry mechanisms for failed deliveries, and integration with the broader notification system.

## Project Structure
The real-time notification system spans backend WebSocket routes and services, a notification pipeline, and a client SDK with React hooks and providers.

```mermaid
graph TB
subgraph "Backend API"
WSRoute["WebSocket Routes<br/>/ws/audit, /ws/events/:tenantId"]
WSMiddleware["WebSocket Auth Middleware"]
WSService["Socket.IO Service<br/>Rooms, Broadcasting"]
NotifService["Notification Service"]
NotifDispatcher["Notification Dispatcher"]
NotifRepo["Notification Repository"]
end
subgraph "Client SDK"
RealtimeClient["RealtimeClient<br/>WebSocket + Handlers"]
Hooks["React Hooks<br/>useRealtime*, useRealtimeSend"]
Provider["RealtimeProvider<br/>Tenant-aware Subscription"]
CacheSync["WebSocket Cache Sync<br/>Invalidation Rules"]
end
WSRoute --> WSMiddleware
WSMiddleware --> WSService
NotifService --> NotifDispatcher
NotifDispatcher --> WSService
NotifService --> NotifRepo
RealtimeClient --> Hooks
Provider --> RealtimeClient
RealtimeClient --> CacheSync
```

**Diagram sources**
- [websocket.controller.ts](file://apps/api/src/modules/websocket/websocket.controller.ts#L10-L60)
- [websocket.middleware.ts](file://apps/api/src/modules/websocket/websocket.middleware.ts#L17-L53)
- [websocket.service.ts](file://apps/api/src/services/websocket.service.ts#L36-L177)
- [notification.service.ts](file://apps/api/src/modules/notification-system/notification.service.ts#L33-L50)
- [notification.dispatcher.ts](file://apps/api/src/modules/notification-system/notification.dispatcher.ts#L40-L61)
- [notification.repository.ts](file://apps/api/src/modules/notification-system/notification.repository.ts#L26-L482)
- [index.ts](file://packages/client-sdk/src/realtime/index.ts#L28-L279)
- [use-realtime.ts](file://packages/client-sdk/src/hooks/use-realtime.ts#L17-L41)
- [RealtimeProvider.tsx](file://packages/client-sdk/src/providers/RealtimeProvider.tsx#L47-L90)
- [ws-cache-sync.ts](file://packages/client-sdk/src/realtime/ws-cache-sync.ts#L152-L219)

**Section sources**
- [websocket.controller.ts](file://apps/api/src/modules/websocket/websocket.controller.ts#L10-L60)
- [websocket.middleware.ts](file://apps/api/src/modules/websocket/websocket.middleware.ts#L17-L53)
- [websocket.service.ts](file://apps/api/src/services/websocket.service.ts#L36-L177)
- [notification.service.ts](file://apps/api/src/modules/notification-system/notification.service.ts#L33-L50)
- [notification.dispatcher.ts](file://apps/api/src/modules/notification-system/notification.dispatcher.ts#L40-L61)
- [notification.repository.ts](file://apps/api/src/modules/notification-system/notification.repository.ts#L26-L482)
- [index.ts](file://packages/client-sdk/src/realtime/index.ts#L28-L279)
- [use-realtime.ts](file://packages/client-sdk/src/hooks/use-realtime.ts#L17-L41)
- [RealtimeProvider.tsx](file://packages/client-sdk/src/providers/RealtimeProvider.tsx#L47-L90)
- [ws-cache-sync.ts](file://packages/client-sdk/src/realtime/ws-cache-sync.ts#L152-L219)

## Core Components
- Backend WebSocket routes and authentication:
  - Audit stream and tenant-specific event streams.
  - Authentication via headers or query parameters; tenant scope validation.
- Socket.IO service:
  - Room-based broadcasting for tenants and users.
  - Event handlers for calendar, conflicts, and user/tenant targeting.
- Notification pipeline:
  - Dispatcher routes notifications to channels and sets WebSocket broadcast callback for in-app notifications.
  - Service orchestrates templating, scheduling, queue processing, and delivery logs.
  - Repository persists notifications, templates, delivery logs, and queue items.
- Client SDK:
  - RealtimeClient manages WebSocket lifecycle, handlers, reconnection, and event emission.
  - React hooks provide subscription and cache invalidation for notifications and other domains.
  - Provider wires tenant-aware subscriptions and connection.
  - Cache sync enforces strict invalidation rules per event type.

**Section sources**
- [websocket.controller.ts](file://apps/api/src/modules/websocket/websocket.controller.ts#L14-L60)
- [websocket.middleware.ts](file://apps/api/src/modules/websocket/websocket.middleware.ts#L17-L82)
- [websocket.service.ts](file://apps/api/src/services/websocket.service.ts#L36-L177)
- [notification.dispatcher.ts](file://apps/api/src/modules/notification-system/notification.dispatcher.ts#L40-L119)
- [notification.service.ts](file://apps/api/src/modules/notification-system/notification.service.ts#L33-L194)
- [notification.repository.ts](file://apps/api/src/modules/notification-system/notification.repository.ts#L26-L482)
- [index.ts](file://packages/client-sdk/src/realtime/index.ts#L28-L279)
- [use-realtime.ts](file://packages/client-sdk/src/hooks/use-realtime.ts#L140-L156)
- [RealtimeProvider.tsx](file://packages/client-sdk/src/providers/RealtimeProvider.tsx#L47-L90)
- [ws-cache-sync.ts](file://packages/client-sdk/src/realtime/ws-cache-sync.ts#L152-L219)

## Architecture Overview
The system delivers real-time notifications via two complementary paths:
- WebSocket-based in-app notifications for live UI updates.
- Traditional notification channels (email, SMS, push) with delivery logs and retry.

```mermaid
sequenceDiagram
participant API as "API WebSocket Route"
participant MW as "WebSocket Auth Middleware"
participant IO as "Socket.IO Service"
participant SVC as "Notification Service"
participant DISP as "Notification Dispatcher"
participant REPO as "Notification Repository"
participant CLIENT as "Client SDK RealtimeClient"
API->>MW : Upgrade WebSocket with tenantId/userId
MW-->>API : Authenticated tenantId/userId
API->>IO : Register socket for tenant
IO-->>CLIENT : "connected" event
CLIENT->>IO : "subscribe" with tenantId and event types
IO-->>CLIENT : Acknowledge subscription
SVC->>DISP : dispatch(payload)
DISP->>IO : broadcastToTenant(userId, "notification", data)
IO-->>CLIENT : "notification" event
CLIENT->>CLIENT : Invalidate queries and update UI
DISP->>REPO : createDeliveryLog(...)
```

**Diagram sources**
- [websocket.controller.ts](file://apps/api/src/modules/websocket/websocket.controller.ts#L14-L60)
- [websocket.middleware.ts](file://apps/api/src/modules/websocket/websocket.middleware.ts#L17-L82)
- [websocket.service.ts](file://apps/api/src/services/websocket.service.ts#L36-L177)
- [notification.service.ts](file://apps/api/src/modules/notification-system/notification.service.ts#L33-L119)
- [notification.dispatcher.ts](file://apps/api/src/modules/notification-system/notification.dispatcher.ts#L40-L119)
- [notification.repository.ts](file://apps/api/src/modules/notification-system/notification.repository.ts#L244-L321)
- [index.ts](file://packages/client-sdk/src/realtime/index.ts#L39-L101)

## Detailed Component Analysis

### Backend WebSocket Routing and Authentication
- Routes:
  - Audit stream: unauthenticated welcome and ping/pong.
  - Tenant-specific events: authenticated registration and tenant-scoped welcome.
- Authentication:
  - Supports headers (X-Tenant-Id, X-User-Id) and query parameters (tenantId, userId).
  - Throws unauthorized errors for missing credentials; tenant scope enforced via middleware.

```mermaid
flowchart TD
Start(["Upgrade Request"]) --> CheckHeaders["Extract tenantId/userId from headers or query"]
CheckHeaders --> Validate["Validate tenantId and userId"]
Validate --> Valid{"Valid?"}
Valid --> |Yes| Register["Register socket for tenant"]
Valid --> |No| ThrowErr["Throw Unauthorized/Forbidden"]
Register --> Welcome["Send 'connected' message"]
Welcome --> PingPong["Handle 'ping' -> 'pong'"]
```

**Diagram sources**
- [websocket.controller.ts](file://apps/api/src/modules/websocket/websocket.controller.ts#L14-L41)
- [websocket.middleware.ts](file://apps/api/src/modules/websocket/websocket.middleware.ts#L17-L53)

**Section sources**
- [websocket.controller.ts](file://apps/api/src/modules/websocket/websocket.controller.ts#L14-L60)
- [websocket.middleware.ts](file://apps/api/src/modules/websocket/websocket.middleware.ts#L17-L82)

### Socket.IO Service: Rooms and Broadcasting
- Rooms:
  - user:{userId}, tenant:{tenantId}, calendar:{id}, conflicts:{id}.
- Events:
  - Calendar updates, conflict alerts, tenant broadcasts, user-specific sends.
- Lifecycle:
  - On authenticate: join rooms and emit authenticated.
  - On disconnect: remove socket from user mappings.

```mermaid
classDiagram
class WebSocketService {
-io
-userSockets
+initialize(server)
+broadcastCalendarUpdate(rentalObjectId, update)
+sendConflictAlert(rentalObjectId, userId, alert)
+broadcastToTenant(tenantId, event, data)
+sendToUser(userId, event, data)
+getConnectedUsersCount() number
+isUserConnected(userId) boolean
}
```

**Diagram sources**
- [websocket.service.ts](file://apps/api/src/services/websocket.service.ts#L36-L177)

**Section sources**
- [websocket.service.ts](file://apps/api/src/services/websocket.service.ts#L36-L177)

### Notification Dispatcher and Real-time In-App Delivery
- Responsibilities:
  - Dispatch to channels: email, SMS, in-app, push.
  - For in-app: persist notification and broadcast via WebSocket.
  - Create delivery logs for each channel.
  - Expose available channels and rate limits.
- Real-time integration:
  - Accepts a broadcast callback to send "notification" events to the WebSocket service.

```mermaid
flowchart TD
Dispatch["dispatch(payload)"] --> Channels["Iterate channels"]
Channels --> Send["sendToChannel(channel, payload)"]
Send --> InApp{"channel == 'in_app'?"}
InApp --> |Yes| Persist["Create in-app notification"]
Persist --> Broadcast["Broadcast via WebSocket"]
InApp --> |No| Other["Other channel handler"]
Broadcast --> Log["Create delivery log"]
Other --> Log
Log --> Done["Return results"]
```

**Diagram sources**
- [notification.dispatcher.ts](file://apps/api/src/modules/notification-system/notification.dispatcher.ts#L66-L119)
- [websocket.service.ts](file://apps/api/src/services/websocket.service.ts#L148-L162)

**Section sources**
- [notification.dispatcher.ts](file://apps/api/src/modules/notification-system/notification.dispatcher.ts#L40-L119)
- [websocket.service.ts](file://apps/api/src/services/websocket.service.ts#L148-L162)

### Notification Service: Orchestrator and Queue
- Responsibilities:
  - Render templates across channels.
  - Select channels and build dispatch payload.
  - Schedule notifications and process queue with retries.
  - Manage user notifications, read/dismiss/delete, and statistics.
- Integration:
  - Sets WebSocket broadcast callback on the dispatcher.

```mermaid
sequenceDiagram
participant Caller as "Caller"
participant NS as "NotificationService"
participant TS as "TemplateService"
participant ND as "NotificationDispatcher"
participant NR as "NotificationRepository"
Caller->>NS : notify(tenant, user, type, vars, options)
NS->>TS : renderAllChannels(type, vars, locale, tenant)
NS->>ND : dispatch(payload)
ND->>NR : createDeliveryLog(...)
ND-->>NS : DispatchResult
NS-->>Caller : NotificationResult
```

**Diagram sources**
- [notification.service.ts](file://apps/api/src/modules/notification-system/notification.service.ts#L59-L125)
- [notification.dispatcher.ts](file://apps/api/src/modules/notification-system/notification.dispatcher.ts#L66-L119)
- [notification.repository.ts](file://apps/api/src/modules/notification-system/notification.repository.ts#L244-L321)

**Section sources**
- [notification.service.ts](file://apps/api/src/modules/notification-system/notification.service.ts#L33-L194)
- [notification.repository.ts](file://apps/api/src/modules/notification-system/notification.repository.ts#L26-L482)

### Client SDK: RealtimeClient and React Hooks
- RealtimeClient:
  - Connects to tenant-specific WebSocket, handles ping/pong, emits events, supports reconnection.
  - Emits "notification" events to subscribed handlers.
- React Hooks:
  - useRealtimeNotifications: subscribes to notification events and invalidates queries.
  - useRealtimeConnection: manages connection lifecycle and tenantId.
  - useRealtimeSend: exposes send/ping utilities.
- Provider:
  - Builds tenant-aware WebSocket URL and subscribes to multiple event categories.

```mermaid
sequenceDiagram
participant Provider as "RealtimeProvider"
participant Hooks as "useRealtimeNotifications"
participant RC as "RealtimeClient"
participant UI as "React Components"
Provider->>RC : connect({url : wsUrl/{tenantId}, tenantId})
RC-->>Provider : "connected"
Provider->>Hooks : subscribe to "notification"
Hooks->>RC : on("notification", handler)
RC-->>Hooks : event {type : "notification", data}
Hooks->>UI : Invalidate queries and update badge
```

**Diagram sources**
- [RealtimeProvider.tsx](file://packages/client-sdk/src/providers/RealtimeProvider.tsx#L47-L90)
- [use-realtime.ts](file://packages/client-sdk/src/hooks/use-realtime.ts#L140-L156)
- [index.ts](file://packages/client-sdk/src/realtime/index.ts#L39-L101)

**Section sources**
- [index.ts](file://packages/client-sdk/src/realtime/index.ts#L28-L279)
- [use-realtime.ts](file://packages/client-sdk/src/hooks/use-realtime.ts#L140-L156)
- [RealtimeProvider.tsx](file://packages/client-sdk/src/providers/RealtimeProvider.tsx#L47-L90)

### WebSocket Cache Sync (Risk Mitigation)
- Ensures WebSocket events trigger the same cache invalidation rules as mutations.
- Maintains a strict mapping from event types to query keys and invalidates them automatically.

```mermaid
flowchart TD
WS["WebSocket Message"] --> Parse["Parse event"]
Parse --> Map["Lookup invalidation keys"]
Map --> Invalidate["Invalidate matching query keys"]
Invalidate --> Done["Refetch active queries"]
```

**Diagram sources**
- [ws-cache-sync.ts](file://packages/client-sdk/src/realtime/ws-cache-sync.ts#L152-L188)

**Section sources**
- [ws-cache-sync.ts](file://packages/client-sdk/src/realtime/ws-cache-sync.ts#L152-L219)

## Dependency Analysis
- Backend:
  - WebSocket routes depend on authentication middleware and the Socket.IO service.
  - Notification service depends on the dispatcher and repository.
  - Dispatcher depends on channel handlers and repositories for persistence/logging.
- Frontend:
  - RealtimeClient depends on WebSocket API and event handlers.
  - React hooks depend on RealtimeClient and React Query for cache invalidation.
  - Provider composes connection and subscription logic.

```mermaid
graph LR
WSRoute["WebSocket Routes"] --> WSMW["Auth Middleware"]
WSRoute --> WSSvc["Socket.IO Service"]
NotifSvc["Notification Service"] --> NotifDisp["Notification Dispatcher"]
NotifDisp --> WSSvc
NotifSvc --> NotifRepo["Notification Repository"]
RealtimeClient["RealtimeClient"] --> Hooks["React Hooks"]
Provider["RealtimeProvider"] --> RealtimeClient
CacheSync["WebSocket Cache Sync"] --> RealtimeClient
```

**Diagram sources**
- [websocket.controller.ts](file://apps/api/src/modules/websocket/websocket.controller.ts#L14-L60)
- [websocket.middleware.ts](file://apps/api/src/modules/websocket/websocket.middleware.ts#L17-L82)
- [websocket.service.ts](file://apps/api/src/services/websocket.service.ts#L36-L177)
- [notification.service.ts](file://apps/api/src/modules/notification-system/notification.service.ts#L33-L119)
- [notification.dispatcher.ts](file://apps/api/src/modules/notification-system/notification.dispatcher.ts#L40-L119)
- [notification.repository.ts](file://apps/api/src/modules/notification-system/notification.repository.ts#L26-L482)
- [index.ts](file://packages/client-sdk/src/realtime/index.ts#L28-L279)
- [use-realtime.ts](file://packages/client-sdk/src/hooks/use-realtime.ts#L140-L156)
- [RealtimeProvider.tsx](file://packages/client-sdk/src/providers/RealtimeProvider.tsx#L47-L90)
- [ws-cache-sync.ts](file://packages/client-sdk/src/realtime/ws-cache-sync.ts#L152-L219)

**Section sources**
- [websocket.controller.ts](file://apps/api/src/modules/websocket/websocket.controller.ts#L14-L60)
- [websocket.middleware.ts](file://apps/api/src/modules/websocket/websocket.middleware.ts#L17-L82)
- [websocket.service.ts](file://apps/api/src/services/websocket.service.ts#L36-L177)
- [notification.service.ts](file://apps/api/src/modules/notification-system/notification.service.ts#L33-L119)
- [notification.dispatcher.ts](file://apps/api/src/modules/notification-system/notification.dispatcher.ts#L40-L119)
- [notification.repository.ts](file://apps/api/src/modules/notification-system/notification.repository.ts#L26-L482)
- [index.ts](file://packages/client-sdk/src/realtime/index.ts#L28-L279)
- [use-realtime.ts](file://packages/client-sdk/src/hooks/use-realtime.ts#L140-L156)
- [RealtimeProvider.tsx](file://packages/client-sdk/src/providers/RealtimeProvider.tsx#L47-L90)
- [ws-cache-sync.ts](file://packages/client-sdk/src/realtime/ws-cache-sync.ts#L152-L219)

## Performance Considerations
- Connection lifecycle:
  - RealtimeClient supports configurable auto-reconnect with capped attempts and intervals.
  - Socket.IO rooms minimize fan-out by targeting specific rooms.
- Throughput:
  - Tenant-specific WebSocket endpoints reduce unnecessary broadcasts.
  - Delivery logs and queue processing decouple immediate delivery from background processing.
- Caching:
  - Cache invalidation rules ensure UI consistency without redundant polling.

[No sources needed since this section provides general guidance]

## Troubleshooting Guide
- Authentication failures:
  - Missing or invalid tenantId/userId cause unauthorized/forbidden responses; verify headers or query parameters.
- Connection drops:
  - RealtimeClient attempts reconnection up to configured attempts; inspect debug logs and network conditions.
- No notifications received:
  - Ensure tenantId is included in the WebSocket URL and subscription message is accepted by the server.
  - Confirm the "notification" event handler is registered and cache invalidation is triggered.
- Delivery failures:
  - Check delivery logs for channel-specific errors and retry counts; repository marks items as failed after max retries.

**Section sources**
- [websocket.middleware.ts](file://apps/api/src/modules/websocket/websocket.middleware.ts#L44-L52)
- [index.ts](file://packages/client-sdk/src/realtime/index.ts#L85-L101)
- [notification.repository.ts](file://apps/api/src/modules/notification-system/notification.repository.ts#L367-L384)

## Conclusion
The real-time notification system combines WebSocket-based in-app delivery with a robust notification pipeline supporting multiple channels, scheduling, retries, and comprehensive delivery tracking. The client SDK provides ergonomic React hooks and cache synchronization to maintain UI consistency and responsiveness.