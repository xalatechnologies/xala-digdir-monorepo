# WebSocket Realtime Guide

> **System Status:** PRODUCTION | **Last Updated:** 2026-01-16

---

## Policy Statement

The Digilist Platform uses **WebSocket realtime events** to provide:

1. **Live booking updates** - Availability changes, confirmations, cancellations
2. **Listing synchronization** - Published/unpublished status, content updates
3. **Notification delivery** - User notifications, messages, audit events
4. **React Query cache sync** - Automatic query invalidation on server events

**Critical Rules:**

- WebSocket client is a **singleton** - ONE connection per app instance
- Events **automatically invalidate** React Query cache via `wsInvalidationMap`
- All events are **multi-tenant aware** - filtered by `tenantId`
- Reconnection is **automatic** with exponential backoff
- Debug mode is **opt-in** - never enabled in production

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Connection Lifecycle](#connection-lifecycle)
3. [Multi-Tenant Isolation](#multi-tenant-isolation)
4. [Debug Mode](#debug-mode)
5. [Event Types](#event-types)
6. [React Integration](#react-integration)
7. [React Query Cache Sync](#react-query-cache-sync)
8. [Usage Examples](#usage-examples)
9. [Best Practices](#best-practices)
10. [API Reference](#api-reference)

---

## Architecture Overview

### Singleton Pattern

The realtime client uses a **singleton pattern** to ensure only one WebSocket connection per app:

```typescript
// packages/client-sdk/src/realtime/index.ts
export const realtimeClient = new RealtimeClient(); // Singleton instance
```

**Why Singleton?**

| Benefit | Description |
|---------|-------------|
| **Resource Efficiency** | One connection vs. multiple connections per component |
| **Event Consistency** | All subscribers receive events in the same order |
| **Reconnection Management** | Centralized reconnection logic |
| **Multi-Tenant Safety** | Single tenantId subscription per app |

### Architecture Layers

```
┌─────────────────────────────────────────────┐
│  React Components                           │
│  - Use hooks: useRealtimeBookings()         │
│  - Use context: useRealtimeContext()        │
├─────────────────────────────────────────────┤
│  React Hooks Layer                          │
│  - packages/client-sdk/src/hooks/           │
│  - Auto-invalidates React Query cache       │
├─────────────────────────────────────────────┤
│  Realtime Client (Singleton)                │
│  - packages/client-sdk/src/realtime/        │
│  - Event subscription & dispatch            │
│  - Reconnection with backoff                │
├─────────────────────────────────────────────┤
│  WebSocket Connection                       │
│  - wss://api.digilist.no/ws/events/{tid}    │
│  - Tenant-filtered event stream             │
└─────────────────────────────────────────────┘
```

### Event Flow

```
Server Event (booking.created)
    ↓
WebSocket Message
    ↓
realtimeClient.emit('booking', event)
    ↓
All registered handlers invoked
    ↓
React Query invalidation (automatic)
    ↓
Component re-renders with fresh data
```

---

## Connection Lifecycle

### State Machine

```
┌──────────────┐
│ DISCONNECTED │ ←──────────────────┐
└──────────────┘                    │
       ↓ connect()                  │
┌──────────────┐                    │
│  CONNECTING  │                    │
└──────────────┘                    │
       ↓ onopen                     │
┌──────────────┐                    │
│  CONNECTED   │                    │
└──────────────┘                    │
       ↓ onclose                    │
┌──────────────┐                    │
│ RECONNECTING │ ───→ (exponential  │
└──────────────┘      backoff)      │
       ↓ attempt < maxAttempts      │
       └──────────────────────────┬─┘
                                  ↓ max attempts exceeded
                           ┌──────────────┐
                           │    FAILED    │
                           └──────────────┘
```

### Configuration

```typescript
export interface RealtimeClientConfig {
  url: string;                    // WebSocket URL (wss://...)
  autoReconnect?: boolean;        // Default: true
  reconnectInterval?: number;     // Default: 3000ms
  maxReconnectAttempts?: number;  // Default: 5
  tenantId?: string;              // Multi-tenant identifier
  debug?: boolean;                // Debug logging (default: false)
}
```

### Reconnection Behavior

| Attempt | Delay | Calculation |
|---------|-------|-------------|
| 1 | 3s | `reconnectInterval` |
| 2 | 3s | `reconnectInterval` |
| 3 | 3s | `reconnectInterval` |
| 4 | 3s | `reconnectInterval` |
| 5 | 3s | `reconnectInterval` |
| 6+ | ❌ Stops | `maxReconnectAttempts` reached |

**Note:** Current implementation uses **fixed interval**. Future enhancement may add exponential backoff.

---

## Reconnection and Error Handling

### Auto-Reconnect Configuration

The realtime client automatically reconnects when the connection is lost. This behavior is **enabled by default** and configurable:

```typescript
// ✅ CORRECT - Auto-reconnect with defaults
realtimeClient.connect({
  url: wsUrl,
  tenantId: 'kommune-oslo-12345',
  // autoReconnect: true (default)
  // reconnectInterval: 3000ms (default)
  // maxReconnectAttempts: 5 (default)
});

// ✅ CORRECT - Custom reconnect behavior
realtimeClient.connect({
  url: wsUrl,
  tenantId: 'kommune-oslo-12345',
  autoReconnect: true,
  reconnectInterval: 5000,  // 5 seconds between attempts
  maxReconnectAttempts: 10, // Try 10 times before giving up
});

// ✅ CORRECT - Disable auto-reconnect (testing only)
realtimeClient.connect({
  url: wsUrl,
  tenantId: 'test-tenant',
  autoReconnect: false, // Must be explicitly false to disable
});
```

**Configuration Defaults:**

| Parameter | Default | Description |
|-----------|---------|-------------|
| `autoReconnect` | `true` | Auto-reconnect on connection loss |
| `reconnectInterval` | `3000ms` | Fixed delay between reconnection attempts |
| `maxReconnectAttempts` | `5` | Maximum number of reconnection attempts |

**Important Notes:**

- Auto-reconnect is **opt-out**: It defaults to `true` unless explicitly set to `false`
- Reconnection uses a **fixed interval** (not exponential backoff)
- After `maxReconnectAttempts` is reached, reconnection stops
- Manual `connect()` call can restart reconnection after failure

### Reconnection Logic Flow

```typescript
// Internal reconnection logic
private attemptReconnect(): void {
  const maxAttempts = this.config?.maxReconnectAttempts ?? 5;
  const interval = this.config?.reconnectInterval ?? 3000;

  if (this.reconnectAttempts >= maxAttempts) {
    if (this.debug) console.log('[Realtime] Max reconnect attempts reached');
    return; // Stop reconnecting
  }

  this.reconnectAttempts++;
  if (this.debug) console.log(`[Realtime] Reconnecting in ${interval}ms (attempt ${this.reconnectAttempts}/${maxAttempts})`);

  setTimeout(() => {
    if (this.config && !this.isConnecting) {
      this.connect(this.config); // Retry connection
    }
  }, interval);
}
```

**Reconnection Triggers:**

1. **WebSocket `onclose` event** - Connection lost/server closed connection
2. **Network failure** - Client loses internet connectivity
3. **Server restart** - WebSocket server goes down

**Reconnection Does NOT Trigger On:**

- Initial connection failure (throws error immediately)
- Explicit `disconnect()` call
- Maximum attempts exceeded

### Connection State Tracking

The realtime client provides several ways to track connection state:

#### 1. `isConnected` Property

```typescript
// Check if currently connected
if (realtimeClient.isConnected) {
  console.log('WebSocket is connected');
  realtimeClient.send({ type: 'ping' });
}

// Implementation
get isConnected(): boolean {
  return this.socket?.readyState === WebSocket.OPEN;
}
```

**WebSocket ReadyState Values:**

| State | Value | Description |
|-------|-------|-------------|
| `CONNECTING` | `0` | Connection is being established |
| `OPEN` | `1` | Connection is open and ready |
| `CLOSING` | `2` | Connection is in the process of closing |
| `CLOSED` | `3` | Connection is closed or couldn't be opened |

#### 2. Internal State Flags

```typescript
class RealtimeClient {
  private socket: WebSocket | null = null;      // WebSocket instance
  private config: RealtimeClientConfig | null = null; // Connection config
  private reconnectAttempts = 0;                // Current reconnect attempt count
  private isConnecting = false;                 // Flag: connection in progress
}
```

**State Flag Behavior:**

| Flag | When `true` | When `false` |
|------|-------------|--------------|
| `isConnecting` | `connect()` called, WebSocket connecting | Connection open or closed |
| `reconnectAttempts > 0` | Reconnection in progress | First connection or fully connected |
| `socket !== null` | WebSocket instance exists | Not yet connected or disconnected |

#### 3. Connection Events

```typescript
// Listen for 'connected' event
realtimeClient.on('connected', (event) => {
  console.log('[App] Connected to realtime server');
  console.log('Message:', event.message); // "Connected to realtime server"
});

// Example handler
this.socket.onopen = () => {
  this.isConnecting = false;
  this.reconnectAttempts = 0; // Reset counter on successful connection
  this.emit('connected', {
    type: 'connected',
    message: 'Connected to realtime server'
  });
};
```

#### 4. React Context (Recommended)

```tsx
import { useRealtimeContext } from '@/providers/RealtimeProvider';

function ConnectionMonitor() {
  const { isConnected, status, error } = useRealtimeContext();

  return (
    <div>
      <p>Status: {status}</p> {/* 'disconnected' | 'connecting' | 'connected' | 'error' */}
      <p>Connected: {isConnected ? 'Yes' : 'No'}</p>
      {error && <p>Error: {error}</p>}
    </div>
  );
}
```

### Error Handling Patterns

The realtime client uses **silent error handling** to prevent noise and ensure resilience:

#### 1. Connection Errors (Silent)

```typescript
// WebSocket onerror handler
this.socket.onerror = () => {
  // Silent error - WebSocket errors are expected when server is unavailable
  this.isConnecting = false;
};
```

**Why Silent?**

- Connection errors are **normal** when server is down/restarting
- Reconnection logic handles recovery automatically
- No user action required
- Prevents console spam during network issues

#### 2. Subscription Errors (Silent)

```typescript
// Subscription message send (inside onopen)
if (config.tenantId && this.socket) {
  try {
    this.socket.send(JSON.stringify({
      type: 'subscribe',
      tenantId: config.tenantId,
      events: ['booking', 'listing', 'message', 'notification', 'audit'],
    }));
    if (this.debug) console.log('[Realtime] Sent subscription request for tenant:', config.tenantId);
  } catch {
    // Silent error - some servers don't need subscription
  }
}
```

**Why Silent?**

- Some WebSocket servers don't require explicit subscription
- Server will send events anyway if connection is authenticated
- Subscription is **best-effort**, not critical

#### 3. Parse Errors (Silent)

```typescript
// Message parsing
this.socket.onmessage = (event) => {
  if (this.debug) console.log('[Realtime] Raw message received:', event.data);
  try {
    const data = JSON.parse(event.data) as RealtimeEvent;
    if (this.debug) console.log('[Realtime] Parsed event:', data.type, data);
    this.emit(data.type, data);
    this.emit('*', data); // Wildcard handler for all events
  } catch {
    // Silent parse error
  }
};
```

**Why Silent?**

- Server may send non-JSON messages (pings, protocol messages)
- Invalid events should not crash the client
- Handlers are invoked only for valid events

#### 4. Handler Errors (Logged)

```typescript
// Event handler invocation
private emit(eventType: string, event: RealtimeEvent): void {
  const handlers = this.handlers.get(eventType);
  if (handlers) {
    handlers.forEach(handler => {
      try {
        handler(event);
      } catch (err) {
        console.error('[Realtime] Handler error:', err);
      }
    });
  }
}
```

**Why Logged?**

- Handler errors indicate **bugs in application code**
- Must be visible to developers for debugging
- One failing handler should not prevent other handlers from executing

#### 5. Send Errors (Warned)

```typescript
// Send message to server
send(data: unknown): void {
  if (this.socket?.readyState === WebSocket.OPEN) {
    this.socket.send(JSON.stringify(data));
  } else {
    console.warn('[Realtime] Cannot send - not connected');
  }
}
```

**Why Warned?**

- Indicates application is trying to send while disconnected
- Developers should check `isConnected` before sending
- Not an error, but should be visible during development

### Network Failure Scenarios

#### Scenario 1: Initial Connection Failure

```typescript
// User connects but server is down
realtimeClient.connect({
  url: 'wss://api.digilist.no/ws/events/tenant-123',
  tenantId: 'tenant-123',
});

// What happens:
// 1. WebSocket constructor throws or fails to connect
// 2. onerror fires → isConnecting = false
// 3. onclose fires → attemptReconnect() called
// 4. Reconnection attempts start (1/5, 2/5, 3/5...)
```

**Debug Output:**

```
[Realtime] Reconnecting in 3000ms (attempt 1/5)
[Realtime] Reconnecting in 3000ms (attempt 2/5)
[Realtime] Reconnecting in 3000ms (attempt 3/5)
[Realtime] Reconnecting in 3000ms (attempt 4/5)
[Realtime] Reconnecting in 3000ms (attempt 5/5)
[Realtime] Max reconnect attempts reached
```

**Recovery:**

- If server comes back online during attempts → connects successfully
- If all attempts fail → manual `connect()` call required

#### Scenario 2: Connection Loss After Successful Connection

```typescript
// User is connected, then loses internet
// 1. Connected and receiving events
// 2. Network drops (WiFi disconnected, mobile data lost)
// 3. WebSocket detects connection loss
// 4. onclose fires → attemptReconnect() called
// 5. Reconnection attempts start

// Debug output:
[Realtime] Disconnected
[Realtime] Reconnecting in 3000ms (attempt 1/5)
```

**Recovery:**

- Network comes back → reconnects automatically
- `reconnectAttempts` counter reset to 0 on successful reconnection
- All event subscriptions remain active (handlers not cleared)

#### Scenario 3: Server Restart

```typescript
// Server goes down for maintenance, then restarts
// 1. All clients receive WebSocket close event
// 2. Clients start reconnection attempts
// 3. Server comes back online
// 4. Clients reconnect and send subscription message

// On reconnection:
this.socket.onopen = () => {
  this.reconnectAttempts = 0; // Reset counter
  this.emit('connected', { type: 'connected', message: 'Connected to realtime server' });

  // Re-subscribe to events
  if (config.tenantId && this.socket) {
    this.socket.send(JSON.stringify({
      type: 'subscribe',
      tenantId: config.tenantId,
      events: ['booking', 'listing', 'message', 'notification', 'audit'],
    }));
  }
};
```

**Recovery:**

- Automatic - no user action required
- Subscription is re-sent on every reconnection
- Event handlers remain registered

#### Scenario 4: WebSocket Protocol Error

```typescript
// Server sends invalid WebSocket frame or protocol error
// 1. Browser WebSocket API detects protocol violation
// 2. onerror fires → isConnecting = false
// 3. onclose fires → attemptReconnect() called
```

**Recovery:**

- Reconnection attempts may succeed if error was transient
- If protocol error persists → reconnection will fail repeatedly
- Manual investigation required (check server logs)

#### Scenario 5: Firewall/Proxy Blocks WebSocket

```typescript
// Corporate firewall blocks wss:// connections
// 1. Connection attempt hangs or fails immediately
// 2. onerror fires (browser may show "net::ERR_CONNECTION_REFUSED")
// 3. onclose fires → attemptReconnect() called
// 4. All reconnection attempts fail
```

**Recovery:**

- Check browser DevTools Network tab for WebSocket errors
- Verify firewall/proxy allows WebSocket connections
- Contact network administrator if blocked
- Fallback: Use polling (if implemented) or HTTP-only mode

### Best Practices for Error Handling

#### ✅ DO

| Practice | Rationale |
|----------|-----------|
| **Monitor connection status** | Use `useRealtimeContext()` to show connection indicator |
| **Handle temporary disconnections gracefully** | Display "Reconnecting..." message, don't block UI |
| **Log handler errors** | Use try-catch in custom handlers for debugging |
| **Test reconnection logic** | Simulate network loss in development |
| **Use debug mode in development** | See detailed connection/error logs |

#### ❌ DON'T

| Anti-Pattern | Problem | Solution |
|--------------|---------|----------|
| **Disable auto-reconnect in production** | Users lose realtime updates on temporary network issues | Keep `autoReconnect: true` |
| **Throw errors in event handlers** | Breaks other handlers in the chain | Use try-catch, log errors |
| **Block UI on disconnection** | Poor UX, network issues are temporary | Show indicator, allow continued use |
| **Set `maxReconnectAttempts` too low** | Gives up too quickly on network issues | Use 5+ attempts (default: 5) |
| **Set `reconnectInterval` too low** | Hammers server during downtime | Use 3000ms+ (default: 3000ms) |

### Example: Robust Connection Monitoring

```tsx
import { useRealtimeContext } from '@/providers/RealtimeProvider';
import { Badge, Alert } from '@xala/ds';
import { useEffect, useState } from 'react';

function RealtimeStatus() {
  const { isConnected, status, error } = useRealtimeContext();
  const [showReconnecting, setShowReconnecting] = useState(false);

  useEffect(() => {
    if (status === 'connecting') {
      // Show reconnecting message after 1 second (avoid flicker on quick reconnects)
      const timer = setTimeout(() => setShowReconnecting(true), 1000);
      return () => clearTimeout(timer);
    } else {
      setShowReconnecting(false);
    }
  }, [status]);

  if (error) {
    return (
      <Alert variant="danger">
        Connection error: {error}. Retrying...
      </Alert>
    );
  }

  if (showReconnecting) {
    return (
      <Alert variant="warning">
        Reconnecting to realtime server...
      </Alert>
    );
  }

  if (isConnected) {
    return (
      <Badge color="success">
        Live Updates Active
      </Badge>
    );
  }

  return null; // Don't show anything if disconnected briefly
}
```

---

## Multi-Tenant Isolation

### Tenant Filtering

Every WebSocket connection is **scoped to a single tenant**:

```typescript
// URL includes tenantId
const wsUrl = createTenantWebSocketUrl(
  'https://api.digilist.no',
  'kommune-oslo-12345'
);
// → wss://api.digilist.no/ws/events/kommune-oslo-12345

realtimeClient.connect({
  url: wsUrl,
  tenantId: 'kommune-oslo-12345',
});
```

### Server-Side Filtering

The WebSocket server:

1. Validates `tenantId` on connection
2. Only sends events matching the tenant
3. Rejects cross-tenant event subscriptions
4. Logs all tenant access for audit

### Subscription Message

On connection, the client sends a subscription request:

```json
{
  "type": "subscribe",
  "tenantId": "kommune-oslo-12345",
  "events": ["booking", "listing", "message", "notification", "audit"]
}
```

**Security Notes:**

- Subscription is **server-validated** - client cannot bypass tenant filter
- Events include `tenantId` field for additional verification
- RBAC rules apply - users only receive events they're authorized to see

---

## Debug Mode

### Enabling Debug Mode

```typescript
// ✅ CORRECT - Enable for local development
realtimeClient.connect({
  url: wsUrl,
  tenantId: 'test-tenant',
  debug: true, // Logs all events and state changes
});

// ❌ WRONG - NEVER enable in production
realtimeClient.connect({
  url: wsUrl,
  tenantId: import.meta.env.VITE_TENANT_ID,
  debug: import.meta.env.PROD, // DO NOT DO THIS
});
```

### Debug Output

When `debug: true`:

```
[Realtime] Connected to wss://api.digilist.no/ws/events/test-tenant
[Realtime] Sent subscription request for tenant: test-tenant
[Realtime] Raw message received: {"type":"booking.created","payload":{...}}
[Realtime] Parsed event: booking.created {...}
[Realtime] Disconnected
[Realtime] Reconnecting in 3000ms (attempt 1/5)
```

### Best Practices

| Environment | Debug Mode | Rationale |
|-------------|-----------|-----------|
| **Local Dev** | ✅ Enabled | See event flow, troubleshoot issues |
| **Staging** | ⚠️ Optional | Enable for specific debugging sessions |
| **Production** | ❌ NEVER | Performance impact, log noise |

---

## Event Types

### Core Event Types (RealtimeEventType)

These are the **transport-level** event types used by the realtime client:

```typescript
export type RealtimeEventType =
  | 'audit'        // Audit log events
  | 'booking'      // Booking events (all types)
  | 'listing'      // Listing events (all types)
  | 'message'      // Messaging/conversation events
  | 'notification' // User notification events
  | 'connected'    // Connection established
  | 'pong';        // Keep-alive response
```

### WebSocket Event Types (WSEventType)

These are the **business-level** event types with detailed payloads:

#### Booking Events (5 types)

```typescript
type BookingEvents =
  | 'booking.created'    // New booking submitted
  | 'booking.updated'    // Booking details changed
  | 'booking.cancelled'  // Booking cancelled by user/admin
  | 'booking.confirmed'  // Booking approved/confirmed
  | 'booking.completed'; // Booking finished/checked-out
```

**Event Payload Example:**

```typescript
interface WSEvent<T> {
  type: WSEventType;
  payload: T;
  tenantId: string;
  timestamp: string;      // ISO 8601
  correlationId?: string; // Request trace ID
}

// booking.created event
{
  type: 'booking.created',
  payload: {
    id: 'bk_abc123',
    listingId: 'ro_xyz789',
    userId: 'usr_456',
    startDate: '2026-02-15T10:00:00Z',
    endDate: '2026-02-15T12:00:00Z',
    status: 'pending',
  },
  tenantId: 'kommune-oslo-12345',
  timestamp: '2026-01-16T10:30:45Z',
  correlationId: 'req_trace_001',
}
```

#### Listing Events (4 types)

```typescript
type ListingEvents =
  | 'listing.updated'     // Listing details/config changed
  | 'listing.published'   // Listing made visible
  | 'listing.unpublished' // Listing hidden
  | 'listing.deleted';    // Listing soft-deleted
```

**Event Payload Example:**

```typescript
// listing.published event
{
  type: 'listing.published',
  payload: {
    id: 'ro_xyz789',
    name: 'Fjellhytta Conference Room',
    status: 'published',
    publishedAt: '2026-01-16T10:30:45Z',
  },
  tenantId: 'kommune-oslo-12345',
  timestamp: '2026-01-16T10:30:45Z',
}
```

#### Availability Events (3 types)

```typescript
type AvailabilityEvents =
  | 'availability.changed' // Booking/block changed availability
  | 'block.created'        // Blackout period created
  | 'block.removed';       // Blackout period removed
```

**Event Payload Example:**

```typescript
// availability.changed event
{
  type: 'availability.changed',
  payload: {
    listingId: 'ro_xyz789',
    date: '2026-02-15',
    slots: [
      { start: '10:00', end: '12:00', available: false },
      { start: '14:00', end: '16:00', available: true },
    ],
  },
  tenantId: 'kommune-oslo-12345',
  timestamp: '2026-01-16T10:30:45Z',
}
```

#### Organization Events (3 types)

```typescript
type OrganizationEvents =
  | 'organization.updated' // Org details changed
  | 'member.added'         // User added to org
  | 'member.removed';      // User removed from org
```

#### Review Events (2 types)

```typescript
type ReviewEvents =
  | 'review.created'  // New review submitted
  | 'review.approved'; // Review moderated/approved
```

#### Season Events (3 types)

```typescript
type SeasonEvents =
  | 'season.updated'         // Season config changed
  | 'application.submitted'  // LIA application submitted
  | 'application.allocated'; // Allocation assigned
```

### Complete Event Catalog

| Event Type | Triggered When | Affects |
|------------|---------------|---------|
| `booking.created` | New booking submitted | Availability, booking lists |
| `booking.updated` | Booking details changed | Booking detail views |
| `booking.cancelled` | Booking cancelled | Availability, booking lists |
| `booking.confirmed` | Booking approved | Booking status, notifications |
| `booking.completed` | Booking finished | Booking history, stats |
| `listing.updated` | Listing config/details changed | Listing detail pages |
| `listing.published` | Listing made public | Search results, maps |
| `listing.unpublished` | Listing hidden | Search results, maps |
| `listing.deleted` | Listing removed | All listing views |
| `availability.changed` | Slot availability updated | Calendars, booking forms |
| `block.created` | Blackout period added | Calendars, availability |
| `block.removed` | Blackout period deleted | Calendars, availability |
| `organization.updated` | Org details changed | Org profile pages |
| `member.added` | User joined org | Member lists, permissions |
| `member.removed` | User left org | Member lists, permissions |
| `review.created` | New review submitted | Review lists, ratings |
| `review.approved` | Review published | Public review displays |
| `season.updated` | Season config changed | Season dashboards |
| `application.submitted` | LIA app submitted | Application queues |
| `application.allocated` | Allocation assigned | Allocation calendars |

---

## Detailed Event Type Reference

This section documents all 20 WebSocket event types with complete payload structures, triggers, and examples.

### Base Event Structure

All WebSocket events follow this base structure:

```typescript
interface WSEvent<T = unknown> {
  type: WSEventType;      // Event type identifier
  payload: T;             // Event-specific payload
  tenantId: string;       // Multi-tenant identifier (e.g., 'kommune-oslo-12345')
  timestamp: string;      // ISO 8601 timestamp (e.g., '2026-01-16T10:30:45Z')
  correlationId?: string; // Optional request trace ID for debugging
}
```

---

### Booking Events

#### booking.created

**Triggered When:** A new booking is created/submitted by a user or admin.

**Payload Structure:**

```typescript
interface BookingCreatedPayload {
  id: string;              // Booking ID (e.g., 'bk_abc123')
  listingId: string;       // Listing ID (e.g., 'ro_xyz789')
  userId: string;          // User who created the booking
  organizationId?: string; // Organization ID (if org booking)
  startDate: string;       // ISO 8601 start datetime
  endDate: string;         // ISO 8601 end datetime
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  totalPrice?: number;     // Total booking price
  attendees?: number;      // Number of attendees
}
```

**Example Payload:**

```json
{
  "type": "booking.created",
  "payload": {
    "id": "bk_abc123",
    "listingId": "ro_xyz789",
    "userId": "usr_456",
    "startDate": "2026-02-15T10:00:00Z",
    "endDate": "2026-02-15T12:00:00Z",
    "status": "pending",
    "totalPrice": 500,
    "attendees": 10
  },
  "tenantId": "kommune-oslo-12345",
  "timestamp": "2026-01-16T10:30:45Z",
  "correlationId": "req_trace_001"
}
```

**Cache Invalidations:**
- `['listing', 'availability']` - Updates calendar views
- `['booking', 'mine']` - Updates "My bookings" lists
- `['organization', 'bookings']` - Updates org booking queues

---

#### booking.updated

**Triggered When:** Booking details are modified (time, attendees, notes, etc.).

**Payload Structure:**

```typescript
interface BookingUpdatedPayload {
  id: string;              // Booking ID
  listingId: string;       // Listing ID
  userId: string;          // User who owns the booking
  startDate?: string;      // Updated start datetime (if changed)
  endDate?: string;        // Updated end datetime (if changed)
  status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  totalPrice?: number;     // Updated price (if changed)
  attendees?: number;      // Updated attendee count (if changed)
  updatedFields: string[]; // Array of field names that changed
}
```

**Example Payload:**

```json
{
  "type": "booking.updated",
  "payload": {
    "id": "bk_abc123",
    "listingId": "ro_xyz789",
    "userId": "usr_456",
    "attendees": 15,
    "updatedFields": ["attendees"]
  },
  "tenantId": "kommune-oslo-12345",
  "timestamp": "2026-01-16T11:00:00Z"
}
```

**Cache Invalidations:**
- `['booking', 'details']` - Updates booking detail views
- `['booking', 'mine']` - Updates user's booking lists

---

#### booking.cancelled

**Triggered When:** A booking is cancelled by the user, admin, or system (e.g., timeout).

**Payload Structure:**

```typescript
interface BookingCancelledPayload {
  id: string;              // Booking ID
  listingId: string;       // Listing ID
  userId: string;          // User who owned the booking
  cancelledBy: string;     // User ID who cancelled ('system' for auto-cancel)
  cancelReason?: string;   // Reason for cancellation
  refundAmount?: number;   // Refund amount (if applicable)
  cancelledAt: string;     // ISO 8601 cancellation timestamp
}
```

**Example Payload:**

```json
{
  "type": "booking.cancelled",
  "payload": {
    "id": "bk_abc123",
    "listingId": "ro_xyz789",
    "userId": "usr_456",
    "cancelledBy": "usr_789_admin",
    "cancelReason": "Facility maintenance required",
    "refundAmount": 500,
    "cancelledAt": "2026-01-16T12:00:00Z"
  },
  "tenantId": "kommune-oslo-12345",
  "timestamp": "2026-01-16T12:00:01Z"
}
```

**Cache Invalidations:**
- `['listing', 'availability']` - Frees up the time slot
- `['booking', 'mine']` - Updates booking lists
- `['booking', 'details']` - Updates detail views
- `['organization', 'bookings']` - Updates org queues

---

#### booking.confirmed

**Triggered When:** A booking is approved/confirmed by admin or auto-confirmed.

**Payload Structure:**

```typescript
interface BookingConfirmedPayload {
  id: string;              // Booking ID
  listingId: string;       // Listing ID
  userId: string;          // User who owns the booking
  confirmedBy: string;     // User ID who confirmed ('system' for auto-confirm)
  confirmedAt: string;     // ISO 8601 confirmation timestamp
  confirmationCode?: string; // Optional confirmation code
}
```

**Example Payload:**

```json
{
  "type": "booking.confirmed",
  "payload": {
    "id": "bk_abc123",
    "listingId": "ro_xyz789",
    "userId": "usr_456",
    "confirmedBy": "usr_789_admin",
    "confirmedAt": "2026-01-16T13:00:00Z",
    "confirmationCode": "CONF-2026-001"
  },
  "tenantId": "kommune-oslo-12345",
  "timestamp": "2026-01-16T13:00:01Z"
}
```

**Cache Invalidations:**
- `['booking', 'mine']` - Updates booking status in lists
- `['booking', 'details']` - Updates detail views

---

#### booking.completed

**Triggered When:** A booking is marked as completed (checked-out, finished).

**Payload Structure:**

```typescript
interface BookingCompletedPayload {
  id: string;              // Booking ID
  listingId: string;       // Listing ID
  userId: string;          // User who owned the booking
  completedAt: string;     // ISO 8601 completion timestamp
  actualEndTime?: string;  // Actual end time (if different from scheduled)
  requiresReview?: boolean; // Whether user can now leave a review
}
```

**Example Payload:**

```json
{
  "type": "booking.completed",
  "payload": {
    "id": "bk_abc123",
    "listingId": "ro_xyz789",
    "userId": "usr_456",
    "completedAt": "2026-02-15T12:00:00Z",
    "requiresReview": true
  },
  "tenantId": "kommune-oslo-12345",
  "timestamp": "2026-02-15T12:00:01Z"
}
```

**Cache Invalidations:**
- `['booking', 'mine']` - Updates booking history
- `['booking', 'details']` - Updates detail views

---

### Listing Events

#### listing.updated

**Triggered When:** Listing details, configuration, or settings are changed.

**Payload Structure:**

```typescript
interface ListingUpdatedPayload {
  id: string;              // Listing ID
  name?: string;           // Updated name (if changed)
  description?: string;    // Updated description (if changed)
  capacity?: number;       // Updated capacity (if changed)
  pricePerHour?: number;   // Updated price (if changed)
  amenities?: string[];    // Updated amenities (if changed)
  location?: {             // Updated location (if changed)
    lat: number;
    lng: number;
  };
  updatedFields: string[]; // Array of field names that changed
  updatedBy: string;       // User ID who made the update
}
```

**Example Payload:**

```json
{
  "type": "listing.updated",
  "payload": {
    "id": "ro_xyz789",
    "name": "Fjellhytta Conference Room - Updated",
    "capacity": 25,
    "updatedFields": ["name", "capacity"],
    "updatedBy": "usr_789_admin"
  },
  "tenantId": "kommune-oslo-12345",
  "timestamp": "2026-01-16T14:00:00Z"
}
```

**Cache Invalidations:**
- `['listing', 'details']` - Updates detail pages
- `['listing', 'search']` - Updates search results

---

#### listing.published

**Triggered When:** A listing is made visible/public to users.

**Payload Structure:**

```typescript
interface ListingPublishedPayload {
  id: string;              // Listing ID
  name: string;            // Listing name
  category?: string;       // Listing category
  status: 'published';     // New status
  publishedAt: string;     // ISO 8601 publish timestamp
  publishedBy: string;     // User ID who published
}
```

**Example Payload:**

```json
{
  "type": "listing.published",
  "payload": {
    "id": "ro_xyz789",
    "name": "Fjellhytta Conference Room",
    "category": "conference-room",
    "status": "published",
    "publishedAt": "2026-01-16T15:00:00Z",
    "publishedBy": "usr_789_admin"
  },
  "tenantId": "kommune-oslo-12345",
  "timestamp": "2026-01-16T15:00:01Z"
}
```

**Cache Invalidations:**
- `['listing', 'details']` - Updates detail pages
- `['listing', 'search']` - Adds to search results

---

#### listing.unpublished

**Triggered When:** A listing is hidden/made private (no longer visible to users).

**Payload Structure:**

```typescript
interface ListingUnpublishedPayload {
  id: string;              // Listing ID
  name: string;            // Listing name
  status: 'unpublished';   // New status
  unpublishedAt: string;   // ISO 8601 unpublish timestamp
  unpublishedBy: string;   // User ID who unpublished
  reason?: string;         // Reason for unpublishing
}
```

**Example Payload:**

```json
{
  "type": "listing.unpublished",
  "payload": {
    "id": "ro_xyz789",
    "name": "Fjellhytta Conference Room",
    "status": "unpublished",
    "unpublishedAt": "2026-01-16T16:00:00Z",
    "unpublishedBy": "usr_789_admin",
    "reason": "Undergoing renovations"
  },
  "tenantId": "kommune-oslo-12345",
  "timestamp": "2026-01-16T16:00:01Z"
}
```

**Cache Invalidations:**
- `['listing', 'details']` - Updates detail pages
- `['listing', 'search']` - Removes from search results

---

#### listing.deleted

**Triggered When:** A listing is soft-deleted (archived).

**Payload Structure:**

```typescript
interface ListingDeletedPayload {
  id: string;              // Listing ID
  name: string;            // Listing name
  deletedAt: string;       // ISO 8601 deletion timestamp
  deletedBy: string;       // User ID who deleted
  reason?: string;         // Reason for deletion
}
```

**Example Payload:**

```json
{
  "type": "listing.deleted",
  "payload": {
    "id": "ro_xyz789",
    "name": "Fjellhytta Conference Room",
    "deletedAt": "2026-01-16T17:00:00Z",
    "deletedBy": "usr_789_admin",
    "reason": "Facility permanently closed"
  },
  "tenantId": "kommune-oslo-12345",
  "timestamp": "2026-01-16T17:00:01Z"
}
```

**Cache Invalidations:**
- `['listing', 'search']` - Removes from all views

---

### Availability Events

#### availability.changed

**Triggered When:** Time slot availability changes due to booking, unblocking, or manual update.

**Payload Structure:**

```typescript
interface AvailabilityChangedPayload {
  listingId: string;       // Listing ID
  date: string;            // Date affected (YYYY-MM-DD)
  slots: Array<{           // Updated time slots
    start: string;         // HH:MM format
    end: string;           // HH:MM format
    available: boolean;    // Slot availability
    bookingId?: string;    // Booking ID (if booked)
  }>;
  reason?: 'booking' | 'block' | 'unblock' | 'manual';
}
```

**Example Payload:**

```json
{
  "type": "availability.changed",
  "payload": {
    "listingId": "ro_xyz789",
    "date": "2026-02-15",
    "slots": [
      { "start": "10:00", "end": "12:00", "available": false, "bookingId": "bk_abc123" },
      { "start": "14:00", "end": "16:00", "available": true }
    ],
    "reason": "booking"
  },
  "tenantId": "kommune-oslo-12345",
  "timestamp": "2026-01-16T10:30:45Z"
}
```

**Cache Invalidations:**
- `['listing', 'availability']` - Updates calendar views

---

#### block.created

**Triggered When:** A blackout period is created (maintenance, holiday, etc.).

**Payload Structure:**

```typescript
interface BlockCreatedPayload {
  id: string;              // Block ID
  listingId: string;       // Listing ID
  startDate: string;       // ISO 8601 block start
  endDate: string;         // ISO 8601 block end
  reason?: string;         // Reason for blocking
  createdBy: string;       // User ID who created the block
  isRecurring?: boolean;   // Whether this is a recurring block
}
```

**Example Payload:**

```json
{
  "type": "block.created",
  "payload": {
    "id": "blk_123",
    "listingId": "ro_xyz789",
    "startDate": "2026-12-24T00:00:00Z",
    "endDate": "2026-12-26T23:59:59Z",
    "reason": "Christmas holiday closure",
    "createdBy": "usr_789_admin",
    "isRecurring": false
  },
  "tenantId": "kommune-oslo-12345",
  "timestamp": "2026-01-16T18:00:00Z"
}
```

**Cache Invalidations:**
- `['listing', 'availability']` - Updates calendar views

---

#### block.removed

**Triggered When:** A blackout period is deleted/removed.

**Payload Structure:**

```typescript
interface BlockRemovedPayload {
  id: string;              // Block ID
  listingId: string;       // Listing ID
  startDate: string;       // ISO 8601 original block start
  endDate: string;         // ISO 8601 original block end
  removedBy: string;       // User ID who removed the block
  reason?: string;         // Reason for removal
}
```

**Example Payload:**

```json
{
  "type": "block.removed",
  "payload": {
    "id": "blk_123",
    "listingId": "ro_xyz789",
    "startDate": "2026-12-24T00:00:00Z",
    "endDate": "2026-12-26T23:59:59Z",
    "removedBy": "usr_789_admin",
    "reason": "Holiday closure cancelled"
  },
  "tenantId": "kommune-oslo-12345",
  "timestamp": "2026-01-16T19:00:00Z"
}
```

**Cache Invalidations:**
- `['listing', 'availability']` - Updates calendar views

---

### Organization Events

#### organization.updated

**Triggered When:** Organization details or settings are changed.

**Payload Structure:**

```typescript
interface OrganizationUpdatedPayload {
  id: string;              // Organization ID
  name?: string;           // Updated name (if changed)
  email?: string;          // Updated email (if changed)
  phone?: string;          // Updated phone (if changed)
  address?: string;        // Updated address (if changed)
  updatedFields: string[]; // Array of field names that changed
  updatedBy: string;       // User ID who made the update
}
```

**Example Payload:**

```json
{
  "type": "organization.updated",
  "payload": {
    "id": "org_123",
    "name": "Oslo Kommune - Updated",
    "phone": "+47 22 22 22 22",
    "updatedFields": ["name", "phone"],
    "updatedBy": "usr_789_admin"
  },
  "tenantId": "kommune-oslo-12345",
  "timestamp": "2026-01-16T20:00:00Z"
}
```

**Cache Invalidations:**
- `['organization', 'details']` - Updates org profile pages
- `['organization', 'mine']` - Updates user's org list

---

#### member.added

**Triggered When:** A user is added to an organization (invited, joined, or assigned).

**Payload Structure:**

```typescript
interface MemberAddedPayload {
  organizationId: string;  // Organization ID
  userId: string;          // User ID of new member
  role: string;            // Role assigned (e.g., 'admin', 'member', 'viewer')
  addedBy: string;         // User ID who added the member
  addedAt: string;         // ISO 8601 timestamp
  permissions?: string[];  // Permissions granted
}
```

**Example Payload:**

```json
{
  "type": "member.added",
  "payload": {
    "organizationId": "org_123",
    "userId": "usr_999",
    "role": "member",
    "addedBy": "usr_789_admin",
    "addedAt": "2026-01-16T21:00:00Z",
    "permissions": ["view_bookings", "create_booking"]
  },
  "tenantId": "kommune-oslo-12345",
  "timestamp": "2026-01-16T21:00:01Z"
}
```

**Cache Invalidations:**
- `['organization', 'members']` - Updates member lists

---

#### member.removed

**Triggered When:** A user is removed from an organization (left, kicked, or permission revoked).

**Payload Structure:**

```typescript
interface MemberRemovedPayload {
  organizationId: string;  // Organization ID
  userId: string;          // User ID of removed member
  removedBy: string;       // User ID who removed the member ('self' if user left)
  removedAt: string;       // ISO 8601 timestamp
  reason?: string;         // Reason for removal
}
```

**Example Payload:**

```json
{
  "type": "member.removed",
  "payload": {
    "organizationId": "org_123",
    "userId": "usr_999",
    "removedBy": "usr_789_admin",
    "removedAt": "2026-01-16T22:00:00Z",
    "reason": "Position changed"
  },
  "tenantId": "kommune-oslo-12345",
  "timestamp": "2026-01-16T22:00:01Z"
}
```

**Cache Invalidations:**
- `['organization', 'members']` - Updates member lists

---

### Review Events

#### review.created

**Triggered When:** A user submits a new review for a listing.

**Payload Structure:**

```typescript
interface ReviewCreatedPayload {
  id: string;              // Review ID
  listingId: string;       // Listing ID
  userId: string;          // User who wrote the review
  bookingId?: string;      // Associated booking ID (if applicable)
  rating: number;          // Rating (1-5)
  comment?: string;        // Review comment
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;       // ISO 8601 timestamp
}
```

**Example Payload:**

```json
{
  "type": "review.created",
  "payload": {
    "id": "rev_123",
    "listingId": "ro_xyz789",
    "userId": "usr_456",
    "bookingId": "bk_abc123",
    "rating": 5,
    "comment": "Excellent facility, very clean!",
    "status": "pending",
    "createdAt": "2026-02-16T10:00:00Z"
  },
  "tenantId": "kommune-oslo-12345",
  "timestamp": "2026-02-16T10:00:01Z"
}
```

**Cache Invalidations:**
- `['listing', 'details']` - Updates listing detail pages (after moderation)
- `['review', 'listing']` - Updates review lists

---

#### review.approved

**Triggered When:** A review is moderated and approved for public display.

**Payload Structure:**

```typescript
interface ReviewApprovedPayload {
  id: string;              // Review ID
  listingId: string;       // Listing ID
  userId: string;          // User who wrote the review
  rating: number;          // Rating (1-5)
  status: 'approved';      // New status
  approvedBy: string;      // User ID who approved
  approvedAt: string;      // ISO 8601 timestamp
}
```

**Example Payload:**

```json
{
  "type": "review.approved",
  "payload": {
    "id": "rev_123",
    "listingId": "ro_xyz789",
    "userId": "usr_456",
    "rating": 5,
    "status": "approved",
    "approvedBy": "usr_789_admin",
    "approvedAt": "2026-02-16T11:00:00Z"
  },
  "tenantId": "kommune-oslo-12345",
  "timestamp": "2026-02-16T11:00:01Z"
}
```

**Cache Invalidations:**
- `['listing', 'details']` - Updates average rating and review count
- `['review', 'listing']` - Adds to public review display

---

### Season Events

#### season.updated

**Triggered When:** Season configuration or settings are changed (LIA season system).

**Payload Structure:**

```typescript
interface SeasonUpdatedPayload {
  id: string;              // Season ID
  name?: string;           // Updated season name (if changed)
  startDate?: string;      // Updated start date (if changed)
  endDate?: string;        // Updated end date (if changed)
  applicationDeadline?: string; // Updated deadline (if changed)
  updatedFields: string[]; // Array of field names that changed
  updatedBy: string;       // User ID who made the update
}
```

**Example Payload:**

```json
{
  "type": "season.updated",
  "payload": {
    "id": "season_2026_spring",
    "name": "Spring 2026 - Extended",
    "applicationDeadline": "2026-03-01T23:59:59Z",
    "updatedFields": ["name", "applicationDeadline"],
    "updatedBy": "usr_789_admin"
  },
  "tenantId": "kommune-oslo-12345",
  "timestamp": "2026-01-16T23:00:00Z"
}
```

**Cache Invalidations:**
- `['config', 'seasons']` - Updates season configuration
- `['season', 'details']` - Updates season detail pages

---

#### application.submitted

**Triggered When:** A LIA (Leirskole, Idrettsarrangement, Arrangement) application is submitted.

**Payload Structure:**

```typescript
interface ApplicationSubmittedPayload {
  id: string;              // Application ID
  seasonId: string;        // Season ID
  userId: string;          // User who submitted
  organizationId?: string; // Organization ID (if org application)
  type: 'leirskole' | 'idrettsarrangement' | 'arrangement';
  priority?: number;       // Application priority (1-5)
  status: 'submitted';     // Initial status
  submittedAt: string;     // ISO 8601 timestamp
}
```

**Example Payload:**

```json
{
  "type": "application.submitted",
  "payload": {
    "id": "app_123",
    "seasonId": "season_2026_spring",
    "userId": "usr_456",
    "organizationId": "org_789",
    "type": "leirskole",
    "priority": 2,
    "status": "submitted",
    "submittedAt": "2026-02-01T10:00:00Z"
  },
  "tenantId": "kommune-oslo-12345",
  "timestamp": "2026-02-01T10:00:01Z"
}
```

**Cache Invalidations:**
- `['season', 'applications']` - Updates application queues

---

#### application.allocated

**Triggered When:** A LIA application is processed and allocated time/resources.

**Payload Structure:**

```typescript
interface ApplicationAllocatedPayload {
  id: string;              // Application ID
  seasonId: string;        // Season ID
  userId: string;          // User who submitted
  allocationId: string;    // Allocation ID
  listingId: string;       // Allocated listing ID
  startDate: string;       // ISO 8601 allocated start
  endDate: string;         // ISO 8601 allocated end
  status: 'allocated';     // New status
  allocatedBy: string;     // User ID who processed allocation
  allocatedAt: string;     // ISO 8601 timestamp
}
```

**Example Payload:**

```json
{
  "type": "application.allocated",
  "payload": {
    "id": "app_123",
    "seasonId": "season_2026_spring",
    "userId": "usr_456",
    "allocationId": "alloc_789",
    "listingId": "ro_xyz789",
    "startDate": "2026-03-10T09:00:00Z",
    "endDate": "2026-03-15T16:00:00Z",
    "status": "allocated",
    "allocatedBy": "usr_789_admin",
    "allocatedAt": "2026-02-10T14:00:00Z"
  },
  "tenantId": "kommune-oslo-12345",
  "timestamp": "2026-02-10T14:00:01Z"
}
```

**Cache Invalidations:**
- `['season', 'applications']` - Updates application status
- `['allocation']` - Adds to allocation calendars

---

## React Integration

### Provider Pattern

Wrap your app in `RealtimeProvider` to establish connection:

```tsx
// ✅ CORRECT - Provider setup
import { RealtimeProvider } from '@/providers/RealtimeProvider';

function App() {
  return (
    <RealtimeProvider
      baseUrl="https://api.digilist.no"
      tenantId="kommune-oslo-12345"
      autoConnect={true}
      enableInDev={true}
    >
      <YourApp />
    </RealtimeProvider>
  );
}
```

**Provider Props:**

```typescript
interface RealtimeProviderProps {
  children: React.ReactNode;
  baseUrl?: string;        // Default: VITE_API_URL
  tenantId?: string;       // Default: VITE_TENANT_ID
  autoConnect?: boolean;   // Default: true
  enableInDev?: boolean;   // Default: true
}
```

### Context Hook

Access realtime context in any component:

```tsx
import { useRealtimeContext } from '@/providers/RealtimeProvider';

function MyComponent() {
  const { isConnected, status, error, lastEvents } = useRealtimeContext();

  return (
    <div>
      <p>Status: {status}</p>
      {error && <p>Error: {error}</p>}
      <p>Last booking event: {lastEvents.get('booking')?.timestamp}</p>
    </div>
  );
}
```

### Hooks Reference

#### useRealtimeConnection

Connect to realtime server (low-level):

```tsx
import { useRealtimeConnection } from '@digilist/client-sdk/hooks';

function App() {
  const isConnected = useRealtimeConnection({
    url: 'wss://api.digilist.no/ws/events/test-tenant',
    tenantId: 'test-tenant',
    autoReconnect: true,
    reconnectInterval: 3000,
    maxReconnectAttempts: 5,
  });

  return <div>Connected: {isConnected ? 'Yes' : 'No'}</div>;
}
```

#### useRealtimeBookings

Subscribe to booking events with automatic cache invalidation:

```tsx
import { useRealtimeBookings } from '@digilist/client-sdk/hooks';

function BookingList() {
  useRealtimeBookings((event) => {
    console.log('Booking event:', event);
    // Queries are auto-invalidated: ['bookings'], ['calendar-events']
  });

  // Your component automatically re-renders when bookings change
  return <div>Booking List</div>;
}
```

#### useRealtimeListings

Subscribe to listing events:

```tsx
import { useRealtimeListings } from '@digilist/client-sdk/hooks';

function ListingCard({ listingId }: { listingId: string }) {
  useRealtimeListings((event) => {
    if (event.data?.id === listingId) {
      console.log('This listing was updated!');
    }
    // Queries are auto-invalidated: ['listings']
  });

  return <div>Listing Card</div>;
}
```

#### useRealtimeCalendar

Subscribe to all calendar-affecting events (bookings, blocks, allocations):

```tsx
import { useRealtimeCalendar } from '@digilist/client-sdk/hooks';

function CalendarView() {
  useRealtimeCalendar((event) => {
    console.log('Calendar event:', event);
    // Queries are auto-invalidated: ['calendar-events'], ['bookings'], ['blocks'], ['allocations']
  });

  return <div>Calendar View</div>;
}
```

#### useRealtimeMessages

Subscribe to message/conversation events:

```tsx
import { useRealtimeMessages } from '@digilist/client-sdk/hooks';

function Inbox() {
  useRealtimeMessages((event) => {
    console.log('New message:', event);
    // Queries are auto-invalidated: ['conversations'], ['messages']
  });

  return <div>Inbox</div>;
}
```

#### useRealtimeNotifications

Subscribe to notification events:

```tsx
import { useRealtimeNotifications } from '@digilist/client-sdk/hooks';

function NotificationBell() {
  useRealtimeNotifications((event) => {
    console.log('New notification:', event);
    // Queries are auto-invalidated: ['notifications']
  });

  return <div>Notification Bell</div>;
}
```

#### useRealtimeAudit

Subscribe to audit events (admin only):

```tsx
import { useRealtimeAudit } from '@digilist/client-sdk/hooks';

function AuditLog() {
  useRealtimeAudit((event) => {
    console.log('Audit event:', event);
    // No automatic query invalidation (audit is append-only)
  });

  return <div>Audit Log</div>;
}
```

#### useRealtimeEvents

Subscribe to ALL events:

```tsx
import { useRealtimeEvents } from '@digilist/client-sdk/hooks';

function DebugPanel() {
  useRealtimeEvents((event) => {
    console.log('Any event:', event.type, event.data);
  });

  return <div>Debug Panel</div>;
}
```

#### useNotificationBadge

Get real-time unread notification count:

```tsx
import { useNotificationBadge } from '@digilist/client-sdk/hooks';

function NotificationBadge() {
  const { unreadCount, markAsRead } = useNotificationBadge();

  return (
    <button onClick={markAsRead}>
      Notifications {unreadCount > 0 && `(${unreadCount})`}
    </button>
  );
}
```

#### useRealtimeSend

Send messages to server:

```tsx
import { useRealtimeSend } from '@digilist/client-sdk/hooks';

function ChatInput() {
  const { send, ping, isConnected } = useRealtimeSend();

  const handleSend = () => {
    send({ type: 'chat.message', content: 'Hello!' });
  };

  const handlePing = () => {
    ping(); // Keep-alive
  };

  return (
    <div>
      <button onClick={handleSend} disabled={!isConnected}>Send</button>
      <button onClick={handlePing}>Ping</button>
    </div>
  );
}
```

### Custom Hook Patterns

Create domain-specific realtime hooks for your features:

#### Pattern 1: Feature-Specific Hook

```tsx
// apps/web/src/features/listing-details/hooks/useRealtimeUpdates.ts
import { useEffect, useCallback, useState } from 'react';
import { realtimeClient, type RealtimeEvent } from '@digilist/client-sdk';

export interface UseRealtimeResult {
  isConnected: boolean;
  lastEvent: RealtimeEvent | null;
}

/**
 * Custom hook for listing-specific realtime updates
 * Automatically connects and filters events for a specific listing
 */
export function useRealtimeUpdates(
  listingId: string,
  onUpdate?: (event: RealtimeEvent) => void
): UseRealtimeResult {
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<RealtimeEvent | null>(null);

  const handleEvent = useCallback(
    (event: RealtimeEvent) => {
      // Filter events for this listing
      const eventListingId = (event.data as { listingId?: string })?.listingId;
      if (eventListingId === listingId) {
        setLastEvent(event);
        onUpdate?.(event);
      }
    },
    [listingId, onUpdate]
  );

  useEffect(() => {
    // Connect if not already connected
    if (!realtimeClient.isConnected) {
      realtimeClient.connect({
        url: 'wss://api.digilist.no/ws/events/tenant',
        tenantId: 'your-tenant-id',
        autoReconnect: true,
      });
    }

    setIsConnected(realtimeClient.isConnected);

    // Subscribe to listing events
    const unsubscribe = realtimeClient.onListing(handleEvent);

    // Cleanup: unsubscribe on unmount or when listingId changes
    return () => {
      unsubscribe();
    };
  }, [listingId, handleEvent]);

  return { isConnected, lastEvent };
}

// Usage in component
function ListingDetails({ listingId }: { listingId: string }) {
  const { isConnected, lastEvent } = useRealtimeUpdates(
    listingId,
    (event) => {
      console.log('Listing updated:', event);
    }
  );

  return (
    <div>
      <p>Connected: {isConnected ? 'Yes' : 'No'}</p>
      {lastEvent && <p>Last update: {lastEvent.timestamp}</p>}
    </div>
  );
}
```

**Key Pattern Elements:**

| Element | Purpose |
|---------|---------|
| `useCallback` | Memoize handler to prevent re-subscriptions |
| `useState` | Track connection state and last event |
| `useEffect` | Subscribe on mount, unsubscribe on unmount |
| `return unsubscribe` | Cleanup function to prevent memory leaks |
| Filter logic | Only process relevant events (by ID, type, etc.) |

#### Pattern 2: Handler Reference Pattern

All SDK hooks use `useRef` to avoid unnecessary re-subscriptions:

```tsx
import { useEffect, useRef } from 'react';
import { realtimeClient, type RealtimeEventHandler } from '@digilist/client-sdk';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Hook implementation pattern used by all SDK hooks
 * Prevents re-subscription when handler changes
 */
export function useRealtimeBookings(handler?: RealtimeEventHandler) {
  const queryClient = useQueryClient();
  const handlerRef = useRef(handler);

  // Update ref when handler changes (doesn't trigger re-subscription)
  handlerRef.current = handler;

  useEffect(() => {
    const unsubscribe = realtimeClient.onBooking((event) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });

      // Call custom handler if provided (via ref)
      handlerRef.current?.(event);
    });

    // Cleanup on unmount
    return unsubscribe;
  }, [queryClient]); // Only re-subscribe if queryClient changes
}
```

**Why `useRef` for Handlers?**

| Without `useRef` | With `useRef` |
|-----------------|--------------|
| Handler in deps → re-subscribe every render | Ref never changes → subscribe once |
| New subscription on every handler change | Handler updates without re-subscribing |
| Performance overhead | Efficient |
| Potential race conditions | Stable subscription |

#### Pattern 3: Multi-Event Aggregation

Combine multiple event types into a single hook:

```tsx
import { useEffect, useState } from 'react';
import { realtimeClient, type RealtimeEvent } from '@digilist/client-sdk';

/**
 * Hook for calendar-related events (bookings, blocks, allocations)
 * Aggregates multiple event types into a single subscription
 */
export function useCalendarEvents(listingId: string) {
  const [events, setEvents] = useState<RealtimeEvent[]>([]);

  useEffect(() => {
    // Subscribe to multiple event types
    const unsubscribeBooking = realtimeClient.onBooking((event) => {
      const eventListingId = (event.data as { listingId?: string })?.listingId;
      if (eventListingId === listingId) {
        setEvents(prev => [...prev, event]);
      }
    });

    const unsubscribeListing = realtimeClient.onListing((event) => {
      const eventListingId = (event.data as { id?: string })?.id;
      if (eventListingId === listingId) {
        setEvents(prev => [...prev, event]);
      }
    });

    // Cleanup: unsubscribe from all event types
    return () => {
      unsubscribeBooking();
      unsubscribeListing();
    };
  }, [listingId]);

  return events;
}
```

#### Pattern 4: Adapter Pattern

Create feature-specific adapters to encapsulate realtime logic:

```tsx
// apps/web/src/features/listing-details/adapters/realtimeClient.ts
import { realtimeClient as sdkRealtimeClient, type RealtimeEventHandler } from '@digilist/client-sdk';

/**
 * Feature-specific realtime adapter
 * Encapsulates SDK client and provides domain-specific methods
 */
export interface RealtimeClient {
  connect(): Promise<void>;
  disconnect(): void;
  subscribe(listingId: string, handler: RealtimeEventHandler): () => void;
  isConnected(): boolean;
}

class ListingRealtimeAdapter implements RealtimeClient {
  private listingHandlers = new Map<string, Set<RealtimeEventHandler>>();
  private unsubscribeAll: (() => void) | null = null;

  async connect(): Promise<void> {
    if (sdkRealtimeClient.isConnected) {
      return;
    }

    sdkRealtimeClient.connect({
      url: 'wss://api.digilist.no/ws/events/tenant',
      autoReconnect: true,
      tenantId: 'your-tenant-id',
    });

    // Subscribe to listing events and route to handlers
    this.unsubscribeAll = sdkRealtimeClient.onListing((event) => {
      const listingId = (event.data as { listingId?: string })?.listingId;
      if (listingId) {
        const handlers = this.listingHandlers.get(listingId);
        handlers?.forEach(handler => handler(event));
      }
    });
  }

  disconnect(): void {
    this.unsubscribeAll?.();
    this.unsubscribeAll = null;
    this.listingHandlers.clear();
    sdkRealtimeClient.disconnect();
  }

  subscribe(listingId: string, handler: RealtimeEventHandler): () => void {
    if (!this.listingHandlers.has(listingId)) {
      this.listingHandlers.set(listingId, new Set());
    }

    this.listingHandlers.get(listingId)!.add(handler);

    // Return unsubscribe function
    return () => {
      const handlers = this.listingHandlers.get(listingId);
      if (handlers) {
        handlers.delete(handler);
        if (handlers.size === 0) {
          this.listingHandlers.delete(listingId);
        }
      }
    };
  }

  isConnected(): boolean {
    return sdkRealtimeClient.isConnected;
  }
}

// Singleton instance
let realtimeClientInstance: RealtimeClient | null = null;

export function getRealtimeClient(): RealtimeClient {
  if (!realtimeClientInstance) {
    realtimeClientInstance = new ListingRealtimeAdapter();
  }
  return realtimeClientInstance;
}
```

**Adapter Benefits:**

| Benefit | Description |
|---------|-------------|
| **Encapsulation** | Hide SDK complexity from feature code |
| **Type Safety** | Domain-specific types and methods |
| **Testability** | Easy to mock in tests |
| **Flexibility** | Swap implementations without changing consumers |

### Cleanup Patterns

Proper cleanup prevents memory leaks and ensures reliable reconnection:

#### Pattern 1: Basic Cleanup

All hooks MUST return cleanup functions:

```tsx
// ✅ CORRECT - Cleanup on unmount
useEffect(() => {
  const unsubscribe = realtimeClient.onBooking((event) => {
    console.log('Booking event:', event);
  });

  return () => {
    unsubscribe(); // Called when component unmounts
  };
}, []);

// ❌ WRONG - No cleanup (memory leak)
useEffect(() => {
  realtimeClient.onBooking((event) => {
    console.log('Booking event:', event);
  });
  // Missing cleanup!
}, []);
```

#### Pattern 2: Multiple Subscriptions

Clean up all subscriptions:

```tsx
useEffect(() => {
  const unsubscribeBooking = realtimeClient.onBooking(handleBooking);
  const unsubscribeListing = realtimeClient.onListing(handleListing);
  const unsubscribeMessage = realtimeClient.onMessage(handleMessage);

  return () => {
    unsubscribeBooking();
    unsubscribeListing();
    unsubscribeMessage();
  };
}, []);
```

#### Pattern 3: Cleanup with Connection Management

```tsx
useEffect(() => {
  // Connect on mount
  realtimeClient.connect({
    url: 'wss://api.digilist.no/ws/events/tenant',
    tenantId: 'your-tenant-id',
  });

  const unsubscribe = realtimeClient.onBooking(handleBooking);

  // Cleanup on unmount
  return () => {
    unsubscribe();
    realtimeClient.disconnect(); // Only if you want to disconnect on unmount
  };
}, []);
```

**⚠️ Important:** Only disconnect if:
- Component is the connection "owner" (e.g., root provider)
- No other components need the connection
- Testing/cleanup scenario

Otherwise, just unsubscribe without disconnecting.

#### Pattern 4: Provider Cleanup

Centralized cleanup in provider:

```tsx
// apps/web/src/providers/RealtimeProvider.tsx
export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const unsubscribesRef = useRef<Array<() => void>>([]);

  useEffect(() => {
    // Setup connection and subscriptions
    realtimeClient.connect({ url: '...', tenantId: '...' });

    const unsubConnected = realtimeClient.on('connected', () => {
      console.log('Connected');
    });

    const unsubAll = realtimeClient.onAll((event) => {
      console.log('Event:', event);
    });

    // Store unsubscribe functions
    unsubscribesRef.current.push(unsubConnected, unsubAll);

    // Cleanup all subscriptions on unmount
    return () => {
      unsubscribesRef.current.forEach(unsub => unsub());
      unsubscribesRef.current = [];
      realtimeClient.disconnect();
    };
  }, []);

  return <>{children}</>;
}
```

#### Pattern 5: Conditional Cleanup

Clean up based on component state:

```tsx
function ConditionalSubscription({ enabled, listingId }: { enabled: boolean; listingId: string }) {
  useEffect(() => {
    if (!enabled) {
      return; // No subscription, no cleanup needed
    }

    const unsubscribe = realtimeClient.onListing((event) => {
      const eventListingId = (event.data as { id?: string })?.id;
      if (eventListingId === listingId) {
        console.log('Listing updated');
      }
    });

    return () => {
      unsubscribe(); // Only called if subscription was created
    };
  }, [enabled, listingId]);

  return <div>Subscription: {enabled ? 'Active' : 'Inactive'}</div>;
}
```

#### Pattern 6: Cleanup Debugging

Debug cleanup to ensure it's called:

```tsx
useEffect(() => {
  console.log('[Realtime] Subscribing to bookings');

  const unsubscribe = realtimeClient.onBooking((event) => {
    console.log('Booking event:', event);
  });

  return () => {
    console.log('[Realtime] Cleaning up booking subscription');
    unsubscribe();
  };
}, []);
```

**Cleanup Best Practices:**

| Practice | Rationale |
|----------|-----------|
| Always return cleanup function | Prevent memory leaks |
| Store multiple unsubscribe functions | Clean up all subscriptions |
| Use `useRef` for subscription tracking | Avoid stale closures |
| Disconnect only in provider/root | Preserve connection for other components |
| Debug cleanup in development | Verify cleanup is called |
| Test cleanup in unit tests | Ensure no memory leaks |

---

## React Query Cache Sync

### Architecture

The `WebSocketCacheSync` class provides **automatic query invalidation** when WebSocket events arrive:

```
WebSocket Event (booking.created)
    ↓
wsInvalidationMap lookup
    ↓
Invalidate queries: ['listing', 'availability'], ['booking', 'mine']
    ↓
React Query refetches active queries
    ↓
Components re-render with fresh data
```

### Event → Query Mapping

The `wsInvalidationMap` defines which queries to invalidate for each event:

```typescript
// packages/client-sdk/src/realtime/ws-cache-sync.ts
export const wsInvalidationMap: Record<WSEventType, string[][]> = {
  'booking.created': [
    ['listing', 'availability'], // Calendar views
    ['booking', 'mine'],         // "My bookings" lists
    ['organization', 'bookings'], // Org booking queues
  ],
  'listing.updated': [
    ['listing', 'details'],      // Detail pages
    ['listing', 'search'],       // Search results
  ],
  // ... all 20+ event types mapped
};
```

### Integration

#### Option 1: Automatic (via Provider)

Most apps use `RealtimeProvider` which handles cache sync automatically:

```tsx
// ✅ CORRECT - Cache sync enabled automatically
import { RealtimeProvider } from '@/providers/RealtimeProvider';

function App() {
  return (
    <RealtimeProvider>
      <YourApp />
    </RealtimeProvider>
  );
}

// All React hooks (useRealtimeBookings, etc.) auto-invalidate queries
```

#### Option 2: Manual (advanced)

For custom setups, use `WebSocketCacheSync` directly:

```tsx
import { wsCacheSync } from '@digilist/client-sdk';
import { useQueryClient } from '@tanstack/react-query';

function App() {
  const queryClient = useQueryClient();

  useEffect(() => {
    wsCacheSync.initialize(queryClient);
    wsCacheSync.connect('wss://api.digilist.no/ws/events', 'tenant-123');
  }, [queryClient]);

  return <YourApp />;
}
```

### Refetch Strategy

Queries are invalidated with `refetchType: 'active'`:

```typescript
queryClient.invalidateQueries({
  queryKey: ['bookings'],
  refetchType: 'active', // Only refetch if query is currently being used
});
```

**Why `refetchType: 'active'`?**

| Benefit | Description |
|---------|-------------|
| **Performance** | Don't refetch inactive/background queries |
| **Battery Efficiency** | Fewer network requests |
| **UX** | Updates visible screens immediately |
| **Cache Hygiene** | Inactive queries naturally stale out |

### Custom Invalidation

Override default behavior for specific events:

```tsx
import { useRealtimeBookings } from '@digilist/client-sdk/hooks';
import { useQueryClient } from '@tanstack/react-query';

function BookingList() {
  const queryClient = useQueryClient();

  useRealtimeBookings((event) => {
    // Default invalidation happens automatically

    // Add custom logic
    if (event.data?.priority === 'urgent') {
      queryClient.invalidateQueries({
        queryKey: ['notifications'],
        refetchType: 'all', // Force refetch even inactive queries
      });
    }
  });

  return <div>Booking List</div>;
}
```

### Complete Event Mapping Reference

The `wsInvalidationMap` defines **every** WebSocket event and its query invalidations:

#### Booking Events

```typescript
'booking.created': [
  ['listing', 'availability'],  // Update calendar views
  ['booking', 'mine'],          // Update "My bookings" lists
  ['organization', 'bookings'], // Update org booking queues
],
'booking.updated': [
  ['booking', 'details'],       // Update booking detail pages
  ['booking', 'mine'],          // Update booking lists
],
'booking.cancelled': [
  ['listing', 'availability'],  // Free up calendar slots
  ['booking', 'mine'],          // Remove from lists
  ['booking', 'details'],       // Update detail page
  ['organization', 'bookings'], // Update org views
],
'booking.confirmed': [
  ['booking', 'mine'],          // Update status in lists
  ['booking', 'details'],       // Update detail page
],
'booking.completed': [
  ['booking', 'mine'],          // Update status in lists
  ['booking', 'details'],       // Update detail page
],
```

#### Listing Events

```typescript
'listing.updated': [
  ['listing', 'details'],       // Refresh listing detail pages
  ['listing', 'search'],        // Update search results
],
'listing.published': [
  ['listing', 'details'],       // Update detail page status
  ['listing', 'search'],        // Add to search results
],
'listing.unpublished': [
  ['listing', 'details'],       // Update detail page status
  ['listing', 'search'],        // Remove from search results
],
'listing.deleted': [
  ['listing', 'search'],        // Remove from search results
],
```

#### Availability Events

```typescript
'availability.changed': [
  ['listing', 'availability'],  // Update calendar displays
],
'block.created': [
  ['listing', 'availability'],  // Show blocked time slots
],
'block.removed': [
  ['listing', 'availability'],  // Unblock time slots
],
```

#### Organization Events

```typescript
'organization.updated': [
  ['organization', 'details'],  // Update org detail pages
  ['organization', 'mine'],     // Update "My organization" views
],
'member.added': [
  ['organization', 'members'],  // Refresh member lists
],
'member.removed': [
  ['organization', 'members'],  // Remove from member lists
],
```

#### Review Events

```typescript
'review.created': [
  ['listing', 'details'],       // Update listing with new review
  ['review', 'listing'],        // Add to review list
],
'review.approved': [
  ['listing', 'details'],       // Show approved review
  ['review', 'listing'],        // Update review status
],
```

#### Season Events

```typescript
'season.updated': [
  ['config', 'seasons'],        // Refresh season configuration
  ['season', 'details'],        // Update season detail page
],
'application.submitted': [
  ['season', 'applications'],   // Add to application list
],
'application.allocated': [
  ['season', 'applications'],   // Update application status
  ['allocation'],               // Refresh allocation views
],
```

**Total:** 20+ event types mapped to 15+ unique query keys.

### WebSocketCacheSync Class API

The `WebSocketCacheSync` class manages automatic cache invalidation:

#### Methods

##### `initialize(queryClient: QueryClient): void`

Initialize the cache sync with a React Query client.

```typescript
import { wsCacheSync } from '@digilist/client-sdk';
import { useQueryClient } from '@tanstack/react-query';

function App() {
  const queryClient = useQueryClient();

  useEffect(() => {
    wsCacheSync.initialize(queryClient);
  }, [queryClient]);
}
```

**Important:**
- Must be called **before** `connect()`
- Only call once per app instance
- Pass the same `queryClient` used by `QueryClientProvider`

##### `handleEvent(event: WSEvent): void`

Process a WebSocket event and invalidate queries.

```typescript
import { wsCacheSync, type WSEvent } from '@digilist/client-sdk';

const event: WSEvent = {
  type: 'booking.created',
  payload: { id: 'booking-123', listingId: 'ro_456' },
  tenantId: 'kommune-oslo-12345',
  timestamp: '2026-01-16T10:30:00Z',
  correlationId: 'req-789',
};

// Automatically invalidates:
// - ['listing', 'availability']
// - ['booking', 'mine']
// - ['organization', 'bookings']
wsCacheSync.handleEvent(event);
```

**Behavior:**
1. Looks up event type in `wsInvalidationMap`
2. Invalidates all matching query keys
3. Uses `refetchType: 'active'` (only refetch active queries)
4. Logs warning if event type is unknown

##### `connect(wsUrl: string, tenantId: string): void`

Connect to WebSocket and start processing events.

```typescript
wsCacheSync.connect(
  'wss://api.digilist.no/ws/events',
  'kommune-oslo-12345'
);
```

**Behavior:**
- Opens WebSocket connection
- Subscribes to tenant-filtered events
- Automatically calls `handleEvent()` for incoming messages
- Handles reconnection automatically

##### `disconnect(): void`

Close WebSocket connection and stop processing.

```typescript
// On app unmount or tenant switch
wsCacheSync.disconnect();
```

**Behavior:**
- Closes WebSocket connection
- Clears event listeners
- Does NOT clear React Query cache

##### `isConnected(): boolean`

Check if WebSocket is currently connected.

```typescript
if (wsCacheSync.isConnected()) {
  console.log('Realtime updates active');
} else {
  console.log('Realtime updates paused');
}
```

**Returns:**
- `true` if WebSocket is open and connected
- `false` if disconnected, connecting, or error state

### Optimistic Update Patterns

Optimistic updates allow instant UI feedback while WebSocket confirms changes:

#### Pattern 1: Optimistic Mutation + WebSocket Confirmation

```tsx
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRealtimeBookings } from '@digilist/client-sdk/hooks';
import { bookingService } from '@digilist/client-sdk';

function BookingActions({ bookingId }: { bookingId: string }) {
  const queryClient = useQueryClient();

  // 1. Optimistic mutation
  const cancelMutation = useMutation({
    mutationFn: () => bookingService.cancel(bookingId),
    onMutate: async () => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['booking', 'mine'] });

      // Snapshot previous value
      const previousBookings = queryClient.getQueryData(['booking', 'mine']);

      // Optimistically update
      queryClient.setQueryData(['booking', 'mine'], (old: Booking[]) =>
        old.map(b => b.id === bookingId ? { ...b, status: 'cancelled' } : b)
      );

      return { previousBookings };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      queryClient.setQueryData(['booking', 'mine'], context?.previousBookings);
    },
  });

  // 2. WebSocket confirmation (auto-invalidates via wsInvalidationMap)
  useRealtimeBookings((event) => {
    if (event.type === 'booking' && event.data?.id === bookingId) {
      console.log('WebSocket confirmed:', event.data.status);
      // Query automatically refetched by cache sync
    }
  });

  return (
    <button onClick={() => cancelMutation.mutate()}>
      Cancel Booking
    </button>
  );
}
```

**Flow:**
1. User clicks "Cancel Booking"
2. UI updates immediately (optimistic)
3. API request sent in background
4. If success: WebSocket event arrives → cache invalidated → real data refetched
5. If error: Optimistic update rolled back

#### Pattern 2: WebSocket-Only Updates (No Mutation)

For changes initiated by other users or scheduled jobs:

```tsx
import { useQuery } from '@tanstack/react-query';
import { useRealtimeListings } from '@digilist/client-sdk/hooks';
import { listingService } from '@digilist/client-sdk';

function ListingDetails({ listingId }: { listingId: string }) {
  // Query data
  const { data: listing } = useQuery({
    queryKey: ['listing', 'details', listingId],
    queryFn: () => listingService.getDetails(listingId),
  });

  // Auto-updates when listing.updated event arrives
  useRealtimeListings((event) => {
    if (event.data?.id === listingId) {
      console.log('Listing updated by another user');
      // Query auto-refetched via wsInvalidationMap
    }
  });

  return <div>{listing?.title}</div>;
}
```

**Flow:**
1. Another user updates listing
2. WebSocket event arrives: `listing.updated`
3. `wsInvalidationMap` invalidates `['listing', 'details']`
4. React Query refetches (if query is active)
5. Component re-renders with fresh data

#### Pattern 3: Optimistic UI + WebSocket Conflict Resolution

Handle conflicts when multiple users edit the same resource:

```tsx
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRealtimeListings } from '@digilist/client-sdk/hooks';
import { listingService } from '@digilist/client-sdk';

function ListingEditor({ listingId }: { listingId: string }) {
  const queryClient = useQueryClient();
  const [hasConflict, setHasConflict] = useState(false);

  const updateMutation = useMutation({
    mutationFn: (data: Partial<Listing>) =>
      listingService.update(listingId, data),
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey: ['listing', 'details', listingId] });

      const previous = queryClient.getQueryData(['listing', 'details', listingId]);

      // Optimistic update
      queryClient.setQueryData(['listing', 'details', listingId], (old: Listing) => ({
        ...old,
        ...newData,
      }));

      return { previous };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(['listing', 'details', listingId], context?.previous);
    },
  });

  // Detect conflicts from other users
  useRealtimeListings((event) => {
    if (event.data?.id === listingId && updateMutation.isPending) {
      // Another user edited while we're editing
      setHasConflict(true);
      console.warn('Conflict detected: Listing updated by another user');
    }
  });

  if (hasConflict) {
    return (
      <div>
        <p>⚠️ This listing was updated by another user.</p>
        <button onClick={() => {
          queryClient.invalidateQueries({ queryKey: ['listing', 'details', listingId] });
          setHasConflict(false);
        }}>
          Reload Latest Version
        </button>
      </div>
    );
  }

  return <form onSubmit={(e) => {
    e.preventDefault();
    updateMutation.mutate({ title: 'New Title' });
  }}>
    {/* Form fields */}
  </form>;
}
```

**Flow:**
1. User A starts editing listing
2. User B saves changes → WebSocket event arrives
3. Conflict detected (User A still has unsaved changes)
4. User A sees warning and can reload latest version
5. Prevents overwriting User B's changes

#### Pattern 4: Background Sync (Notifications, Messages)

For data that updates in background (not user-initiated):

```tsx
import { useQuery } from '@tanstack/react-query';
import { useRealtimeNotifications } from '@digilist/client-sdk/hooks';
import { notificationService } from '@digilist/client-sdk';

function NotificationBell() {
  const { data: notifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationService.getUnread(),
    refetchInterval: false, // Don't poll - use WebSocket instead
  });

  // Auto-updates when notification events arrive
  useRealtimeNotifications((event) => {
    // Query auto-refetched via wsInvalidationMap
    console.log('New notification:', event.data);
  });

  const unreadCount = notifications?.filter(n => !n.read).length ?? 0;

  return (
    <div>
      <Badge count={unreadCount}>🔔</Badge>
    </div>
  );
}
```

**Benefits:**
- No polling required (saves bandwidth)
- Instant updates (better UX)
- Battery efficient (fewer network requests)

#### Best Practices

| Pattern | Use Case | Trade-offs |
|---------|----------|------------|
| **Optimistic + WebSocket** | User-initiated actions (create, update, delete) | Best UX, requires rollback logic |
| **WebSocket-Only** | Other users' changes, scheduled jobs | Simple, slight delay in UI |
| **Conflict Resolution** | Multi-user editing (listings, bookings) | Complex, but prevents data loss |
| **Background Sync** | Notifications, messages, audit logs | Efficient, no user action needed |

**Rules:**
1. **Always** use optimistic updates for user actions (buttons, forms)
2. **Never** skip rollback logic in `onError`
3. **Always** cancel in-flight queries in `onMutate` to avoid race conditions
4. **Use** WebSocket events as "source of truth" after mutation succeeds
5. **Consider** conflict resolution for resources with concurrent editing

---

## Usage Examples

### Basic Setup

```tsx
// apps/web/src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RealtimeProvider } from './providers/RealtimeProvider';
import App from './App';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RealtimeProvider
        baseUrl={import.meta.env.VITE_API_URL}
        tenantId={import.meta.env.VITE_TENANT_ID}
        autoConnect={true}
      >
        <App />
      </RealtimeProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
```

### Connection Status Indicator

```tsx
import { useRealtimeContext } from '@/providers/RealtimeProvider';
import { Badge } from '@xala/ds';

function ConnectionStatus() {
  const { status, error } = useRealtimeContext();

  const statusColors = {
    connected: 'success',
    connecting: 'warning',
    disconnected: 'neutral',
    error: 'danger',
  } as const;

  return (
    <div>
      <Badge color={statusColors[status]}>
        {status.toUpperCase()}
      </Badge>
      {error && <p>Error: {error}</p>}
    </div>
  );
}
```

### Live Booking Notifications

```tsx
import { useRealtimeBookings } from '@digilist/client-sdk/hooks';
import { useToast } from '@xala/ds';

function BookingNotifications() {
  const { showToast } = useToast();

  useRealtimeBookings((event) => {
    if (event.type === 'booking' && event.data) {
      const booking = event.data as { id: string; status: string };

      showToast({
        title: 'Booking Update',
        description: `Booking ${booking.id} is now ${booking.status}`,
        variant: 'info',
      });
    }
  });

  return null; // No UI, just notifications
}
```

### Live Calendar Updates

```tsx
import { useRealtimeCalendar } from '@digilist/client-sdk/hooks';
import { useQuery } from '@tanstack/react-query';
import { listingService } from '@digilist/client-sdk';

function LiveCalendar({ listingId }: { listingId: string }) {
  // Query for availability
  const { data: availability } = useQuery({
    queryKey: ['listing', 'availability', listingId],
    queryFn: () => listingService.getAvailability(listingId),
  });

  // Auto-updates when availability.changed events arrive
  useRealtimeCalendar((event) => {
    console.log('Calendar updated:', event);
    // Query auto-refetches via cache sync
  });

  return (
    <div>
      {availability?.slots.map(slot => (
        <div key={slot.start}>
          {slot.start} - {slot.available ? 'Available' : 'Booked'}
        </div>
      ))}
    </div>
  );
}
```

### Custom Event Handler

```tsx
import { useRealtimeEvents } from '@digilist/client-sdk/hooks';
import { useState } from 'react';

function EventDebugger() {
  const [events, setEvents] = useState<Array<{ type: string; timestamp: string }>>([]);

  useRealtimeEvents((event) => {
    setEvents(prev => [
      { type: event.type, timestamp: event.timestamp || new Date().toISOString() },
      ...prev.slice(0, 49), // Keep last 50 events
    ]);
  });

  return (
    <div>
      <h3>Recent Events</h3>
      <ul>
        {events.map((e, i) => (
          <li key={i}>{e.timestamp}: {e.type}</li>
        ))}
      </ul>
    </div>
  );
}
```

### Error Handling and Recovery

#### Connection Error Handling with Fallback UI

```tsx
import { useRealtimeContext } from '@/providers/RealtimeProvider';
import { Alert, Button, Stack } from '@xala/ds';
import { useEffect, useState } from 'react';

function RealtimeStatus() {
  const { status, error, connect, disconnect } = useRealtimeContext();
  const [showError, setShowError] = useState(false);

  // Show error banner when connection fails
  useEffect(() => {
    if (status === 'error' && error) {
      setShowError(true);
    } else if (status === 'connected') {
      setShowError(false);
    }
  }, [status, error]);

  // Handle manual reconnection
  const handleReconnect = () => {
    disconnect();
    setTimeout(connect, 100);
  };

  if (!showError) return null;

  return (
    <Alert severity="warning" dismissible onClose={() => setShowError(false)}>
      <Stack gap={8}>
        <div>
          <strong>Real-time updates unavailable</strong>
          <p>You may not receive live updates. {error}</p>
        </div>
        <Button size="small" variant="secondary" onClick={handleReconnect}>
          Retry Connection
        </Button>
      </Stack>
    </Alert>
  );
}
```

#### Safe Event Handler with Error Boundary

```tsx
import { useRealtimeBookings } from '@digilist/client-sdk/hooks';
import { useToast } from '@xala/ds';
import { useCallback } from 'react';

function SafeBookingNotifications() {
  const { showToast } = useToast();

  // Wrap handler in try-catch for safety
  const handleBookingEvent = useCallback((event) => {
    try {
      // Validate event data before processing
      if (!event?.data || typeof event.data !== 'object') {
        console.warn('[Booking] Invalid event data:', event);
        return;
      }

      const booking = event.data as { id?: string; status?: string; listingTitle?: string };

      if (!booking.id || !booking.status) {
        console.warn('[Booking] Missing required fields:', booking);
        return;
      }

      // Process valid event
      showToast({
        title: 'Booking Updated',
        description: `${booking.listingTitle || 'Booking'} - ${booking.status}`,
        variant: 'info',
      });
    } catch (err) {
      // Log error but don't crash
      console.error('[Booking] Handler error:', err);
    }
  }, [showToast]);

  useRealtimeBookings(handleBookingEvent);

  return null;
}
```

#### Graceful Degradation Pattern

```tsx
import { useRealtimeContext } from '@/providers/RealtimeProvider';
import { useRealtimeBookings } from '@digilist/client-sdk/hooks';
import { useQuery } from '@tanstack/react-query';
import { bookingService } from '@digilist/client-sdk';
import { useEffect, useState } from 'react';

/**
 * Booking list that works with or without realtime connection
 * Falls back to polling when WebSocket is unavailable
 */
function ResilientBookingList() {
  const { isConnected } = useRealtimeContext();
  const [pollInterval, setPollInterval] = useState<number | false>(false);

  // Fetch bookings with conditional polling
  const { data: bookings } = useQuery({
    queryKey: ['bookings'],
    queryFn: () => bookingService.getAll(),
    refetchInterval: pollInterval, // Only poll when disconnected
  });

  // Enable polling when disconnected, disable when connected
  useEffect(() => {
    if (isConnected) {
      setPollInterval(false); // Disable polling - use WebSocket
    } else {
      setPollInterval(30000); // Poll every 30s when disconnected
    }
  }, [isConnected]);

  // Subscribe to realtime updates (no-op when disconnected)
  useRealtimeBookings();

  return (
    <div>
      {!isConnected && (
        <Alert severity="info">
          Live updates unavailable. Refreshing every 30 seconds.
        </Alert>
      )}
      {bookings?.map(booking => (
        <BookingCard key={booking.id} booking={booking} />
      ))}
    </div>
  );
}
```

#### Retry Logic with Exponential Backoff

```tsx
import { realtimeClient } from '@digilist/client-sdk';
import { useEffect, useRef } from 'react';

/**
 * Custom connection manager with exponential backoff
 * Use this for critical apps that need custom retry logic
 */
function useCustomReconnect(wsUrl: string, tenantId: string) {
  const attemptsRef = useRef(0);
  const maxAttempts = 10;
  const baseDelay = 1000; // 1 second

  const connect = () => {
    realtimeClient.connect({
      url: wsUrl,
      tenantId,
      autoReconnect: false, // Handle reconnection manually
    });
  };

  useEffect(() => {
    // Listen for disconnection
    const unsubscribe = realtimeClient.on('connected', (event) => {
      if (event.type === 'connected') {
        // Reset attempts on successful connection
        attemptsRef.current = 0;
      }
    });

    // Custom reconnection handler
    const handleDisconnect = () => {
      if (attemptsRef.current >= maxAttempts) {
        console.error('[Realtime] Max reconnection attempts reached');
        return;
      }

      // Exponential backoff: 1s, 2s, 4s, 8s, 16s, 32s, 64s...
      const delay = Math.min(baseDelay * Math.pow(2, attemptsRef.current), 64000);
      attemptsRef.current += 1;

      console.log(`[Realtime] Reconnecting in ${delay}ms (attempt ${attemptsRef.current}/${maxAttempts})`);

      setTimeout(connect, delay);
    };

    // Note: This is a simplified example
    // In practice, you'd need to listen to WebSocket close events

    return unsubscribe;
  }, [wsUrl, tenantId]);

  return { connect };
}
```

#### Event Validation and Type Safety

```tsx
import { useRealtimeBookings } from '@digilist/client-sdk/hooks';
import { z } from 'zod';

// Define event schema with Zod
const BookingEventSchema = z.object({
  id: z.string(),
  status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']),
  listingId: z.string(),
  listingTitle: z.string().optional(),
  startDate: z.string(),
  endDate: z.string(),
});

type BookingEventData = z.infer<typeof BookingEventSchema>;

function TypeSafeBookingHandler() {
  useRealtimeBookings((event) => {
    try {
      // Validate event data matches expected schema
      const booking = BookingEventSchema.parse(event.data);

      // TypeScript now knows exact shape of booking
      console.log(`Booking ${booking.id} is ${booking.status}`);

      // Process validated booking
      handleBookingUpdate(booking);
    } catch (err) {
      if (err instanceof z.ZodError) {
        console.error('[Booking] Invalid event schema:', err.errors);
      } else {
        console.error('[Booking] Validation error:', err);
      }
    }
  });

  return null;
}

function handleBookingUpdate(booking: BookingEventData) {
  // Safe to use booking properties - validated by schema
  console.log(`Processing booking: ${booking.id}`);
}
```

### Advanced Patterns

#### Custom Hook for Specific Events

```tsx
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { realtimeClient, type RealtimeEvent } from '@digilist/client-sdk';

/**
 * Custom hook for listing availability updates
 * Invalidates specific listing queries instead of all calendar queries
 */
export function useListingAvailability(listingId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const handler = (event: RealtimeEvent) => {
      const data = event.data as { listingId?: string };

      // Only invalidate queries for this specific listing
      if (data.listingId === listingId) {
        queryClient.invalidateQueries({
          queryKey: ['listing', 'availability', listingId],
        });
        queryClient.invalidateQueries({
          queryKey: ['calendar-events', listingId],
        });
      }
    };

    const unsubscribe = realtimeClient.onBooking(handler);
    return unsubscribe;
  }, [listingId, queryClient]);
}
```

#### Optimistic Updates with Rollback

```tsx
import { useRealtimeBookings } from '@digilist/client-sdk/hooks';
import { useQueryClient } from '@tanstack/react-query';
import { bookingService } from '@digilist/client-sdk';
import { useMutation } from '@tanstack/react-query';

/**
 * Optimistic booking creation with server confirmation via WebSocket
 */
function useOptimisticBooking() {
  const queryClient = useQueryClient();

  // Listen for booking confirmation events
  useRealtimeBookings((event) => {
    const booking = event.data as { id: string; status: string };

    if (booking.status === 'confirmed') {
      // Server confirmed - update cache with actual data
      queryClient.setQueryData(['bookings', booking.id], booking);
    }
  });

  const createBooking = useMutation({
    mutationFn: bookingService.create,
    onMutate: async (newBooking) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['bookings'] });

      // Snapshot previous value
      const previousBookings = queryClient.getQueryData(['bookings']);

      // Optimistically update cache
      queryClient.setQueryData(['bookings'], (old: any[]) => [
        ...old,
        { ...newBooking, id: 'temp-' + Date.now(), status: 'pending' },
      ]);

      // Return context for rollback
      return { previousBookings };
    },
    onError: (err, newBooking, context) => {
      // Rollback on error
      if (context?.previousBookings) {
        queryClient.setQueryData(['bookings'], context.previousBookings);
      }
    },
    onSettled: () => {
      // Always refetch after mutation
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });

  return { createBooking };
}
```

#### Event Aggregation for Batch Processing

```tsx
import { useRealtimeBookings } from '@digilist/client-sdk/hooks';
import { useQueryClient } from '@tanstack/react-query';
import { useRef, useEffect, useCallback } from 'react';

/**
 * Aggregates multiple booking events and processes them in batches
 * Useful for high-frequency updates (e.g., seasonal applications)
 */
export function useBatchedBookingUpdates(batchInterval = 1000) {
  const queryClient = useQueryClient();
  const eventsRef = useRef<Array<RealtimeEvent>>([]);
  const timerRef = useRef<NodeJS.Timeout>();

  const processBatch = useCallback(() => {
    if (eventsRef.current.length === 0) return;

    const events = [...eventsRef.current];
    eventsRef.current = [];

    console.log(`Processing ${events.length} booking events in batch`);

    // Invalidate queries once for all events
    queryClient.invalidateQueries({ queryKey: ['bookings'] });

    // Custom processing logic
    events.forEach((event) => {
      const booking = event.data as { id: string; status: string };
      // Update specific booking in cache
      queryClient.setQueryData(['bookings', booking.id], booking);
    });
  }, [queryClient]);

  useRealtimeBookings((event) => {
    // Add event to batch
    eventsRef.current.push(event);

    // Clear existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Set new timer
    timerRef.current = setTimeout(processBatch, batchInterval);
  });

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        processBatch(); // Process remaining events
      }
    };
  }, [processBatch]);
}
```

#### Selective Event Subscription

```tsx
import { useEffect } from 'react';
import { realtimeClient } from '@digilist/client-sdk';
import { useUser } from '@/hooks/use-user';

/**
 * Only subscribe to events relevant to current user
 * Reduces unnecessary event processing
 */
export function useUserSpecificEvents() {
  const { user } = useUser();

  useEffect(() => {
    if (!user) return;

    const handlers: Array<() => void> = [];

    // Subscribe to bookings for user's listings only
    const unsubBookings = realtimeClient.onBooking((event) => {
      const booking = event.data as { userId?: string };
      if (booking.userId === user.id) {
        console.log('Booking event for current user:', booking);
      }
    });

    // Subscribe to messages for current user
    const unsubMessages = realtimeClient.onMessage((event) => {
      const message = event.data as { recipientId?: string };
      if (message.recipientId === user.id) {
        console.log('New message for current user:', message);
      }
    });

    handlers.push(unsubBookings, unsubMessages);

    return () => {
      handlers.forEach((unsub) => unsub());
    };
  }, [user]);
}
```

#### Cross-Tab Synchronization

```tsx
import { useRealtimeEvents } from '@digilist/client-sdk/hooks';
import { useEffect } from 'react';

/**
 * Sync realtime events across browser tabs using BroadcastChannel
 * Ensures all tabs stay in sync even if only one has WebSocket connection
 */
export function useCrossTabSync() {
  useEffect(() => {
    const channel = new BroadcastChannel('xala-realtime-events');

    // Broadcast events to other tabs
    const unsubscribe = useRealtimeEvents((event) => {
      channel.postMessage({
        type: 'realtime-event',
        event,
      });
    });

    // Listen for events from other tabs
    channel.onmessage = (message) => {
      if (message.data.type === 'realtime-event') {
        // Process event received from another tab
        console.log('Event from another tab:', message.data.event);
      }
    };

    return () => {
      unsubscribe();
      channel.close();
    };
  }, []);
}
```

#### Connection Health Monitoring

```tsx
import { useRealtimeContext } from '@/providers/RealtimeProvider';
import { useState, useEffect } from 'react';

/**
 * Monitor connection health and track metrics
 */
export function useConnectionHealth() {
  const { isConnected, status } = useRealtimeContext();
  const [metrics, setMetrics] = useState({
    connectedAt: null as Date | null,
    disconnectedAt: null as Date | null,
    reconnectCount: 0,
    uptime: 0,
  });

  useEffect(() => {
    if (isConnected && !metrics.connectedAt) {
      setMetrics((prev) => ({
        ...prev,
        connectedAt: new Date(),
        disconnectedAt: null,
      }));
    } else if (!isConnected && metrics.connectedAt) {
      setMetrics((prev) => ({
        ...prev,
        disconnectedAt: new Date(),
        reconnectCount: prev.reconnectCount + 1,
      }));
    }
  }, [isConnected]);

  // Calculate uptime
  useEffect(() => {
    if (!isConnected || !metrics.connectedAt) return;

    const interval = setInterval(() => {
      setMetrics((prev) => ({
        ...prev,
        uptime: Date.now() - (prev.connectedAt?.getTime() || 0),
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [isConnected, metrics.connectedAt]);

  return {
    isHealthy: isConnected && status === 'connected',
    metrics,
    uptimeSeconds: Math.floor(metrics.uptime / 1000),
  };
}
```

### Multi-App Usage

#### Public Web App

```tsx
// apps/web/src/main.tsx
<RealtimeProvider
  tenantId="kommune-oslo-12345"
  autoConnect={true}
>
  <App />
</RealtimeProvider>

// Only subscribe to public events
function PublicApp() {
  useRealtimeListings(() => {
    // Update search results when listings change
  });

  useRealtimeCalendar(() => {
    // Update availability when bookings change
  });
}
```

#### Backoffice App

```tsx
// apps/backoffice/src/main.tsx
<RealtimeProvider
  tenantId="kommune-oslo-12345"
  autoConnect={true}
>
  <App />
</RealtimeProvider>

// Subscribe to admin events
function BackofficeApp() {
  useRealtimeBookings(() => {
    // Update approval queue
  });

  useRealtimeAudit(() => {
    // Update audit log
  });

  useRealtimeListings(() => {
    // Update listing management
  });
}
```

#### User Dashboard

```tsx
// apps/minside/src/main.tsx
<RealtimeProvider
  tenantId="kommune-oslo-12345"
  autoConnect={true}
>
  <App />
</RealtimeProvider>

// Subscribe to user-specific events
function DashboardApp() {
  useRealtimeBookings(() => {
    // Update "My bookings"
  });

  useRealtimeNotifications(() => {
    // Update notification badge
  });

  useRealtimeMessages(() => {
    // Update inbox
  });
}
```

---

## Best Practices

### ✅ DO

| Practice | Rationale |
|----------|-----------|
| **Use singleton `realtimeClient`** | One connection per app |
| **Use hooks for React integration** | Automatic cleanup, cache sync |
| **Enable debug mode in development** | Troubleshoot event flow |
| **Rely on automatic cache invalidation** | React hooks handle it |
| **Use `refetchType: 'active'`** | Performance optimization |
| **Handle reconnection automatically** | `autoReconnect: true` |
| **Filter events by ID if needed** | `if (event.data?.id === myId)` |
| **Use `RealtimeProvider` in apps** | Context + automatic connection |

### ❌ DON'T

| Anti-Pattern | Problem | Solution |
|--------------|---------|----------|
| **Create multiple connections** | Resource waste, event duplication | Use singleton |
| **Forget to unsubscribe** | Memory leaks | Use hooks (auto-cleanup) |
| **Enable debug in production** | Performance impact, log spam | `debug: false` |
| **Manually invalidate queries** | Duplicate logic | Use hooks |
| **Subscribe in render** | Infinite re-subscriptions | Use `useEffect` |
| **Bypass tenant filtering** | Security risk | Server enforces it |

### Performance Tips

#### 1. Debounce High-Frequency Events

```tsx
// ❌ WRONG - Refetch on every event
useRealtimeCalendar((event) => {
  queryClient.invalidateQueries({ queryKey: ['calendar'] });
});

// ✅ CORRECT - Debounce refetches
import { debounce } from 'lodash-es';

const debouncedInvalidate = debounce(() => {
  queryClient.invalidateQueries({ queryKey: ['calendar'] });
}, 500);

useRealtimeCalendar(() => {
  debouncedInvalidate();
});
```

#### 2. Filter Events Client-Side

```tsx
// ✅ CORRECT - Only handle relevant events
useRealtimeBookings((event) => {
  const booking = event.data as { listingId: string };
  if (booking.listingId === myListingId) {
    // Handle event
  }
});
```

#### 3. Use Specific Hooks

```tsx
// ❌ WRONG - Subscribe to all events
useRealtimeEvents((event) => {
  if (event.type === 'booking') {
    // Handle booking
  }
});

// ✅ CORRECT - Use specific hook
useRealtimeBookings((event) => {
  // Only booking events
});
```

### Testing

#### Mock WebSocket

```tsx
// tests/mocks/realtimeClient.ts
export const mockRealtimeClient = {
  connect: vi.fn(),
  disconnect: vi.fn(),
  on: vi.fn(() => vi.fn()), // Returns unsubscribe function
  onBooking: vi.fn(() => vi.fn()),
  onListing: vi.fn(() => vi.fn()),
  onAll: vi.fn(() => vi.fn()),
  send: vi.fn(),
  ping: vi.fn(),
  isConnected: false,
};

// In tests
vi.mock('@digilist/client-sdk', () => ({
  realtimeClient: mockRealtimeClient,
}));
```

#### Simulate Events

```tsx
import { renderHook } from '@testing-library/react';
import { useRealtimeBookings } from '@digilist/client-sdk/hooks';

test('handles booking events', () => {
  const handler = vi.fn();
  renderHook(() => useRealtimeBookings(handler));

  // Simulate event
  const event = {
    type: 'booking',
    data: { id: 'bk_123', status: 'confirmed' },
    timestamp: new Date().toISOString(),
  };

  // Trigger handler (mocked in test setup)
  const onBookingCall = mockRealtimeClient.onBooking.mock.calls[0];
  const mockHandler = onBookingCall[0];
  mockHandler(event);

  expect(handler).toHaveBeenCalledWith(event);
});
```

#### Test Provider Integration

```tsx
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RealtimeProvider } from '@/providers/RealtimeProvider';
import { mockRealtimeClient } from '@/tests/mocks/realtimeClient';

describe('RealtimeProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('connects on mount with autoConnect', async () => {
    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <RealtimeProvider
          baseUrl="https://api.test.digilist.no"
          tenantId="test-tenant"
          autoConnect={true}
        >
          <div>App Content</div>
        </RealtimeProvider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(mockRealtimeClient.connect).toHaveBeenCalledWith(
        expect.objectContaining({
          url: expect.stringContaining('test-tenant'),
          tenantId: 'test-tenant',
          autoReconnect: true,
        })
      );
    });
  });

  test('disconnects on unmount', () => {
    const queryClient = new QueryClient();

    const { unmount } = render(
      <QueryClientProvider client={queryClient}>
        <RealtimeProvider autoConnect={false}>
          <div>App Content</div>
        </RealtimeProvider>
      </QueryClientProvider>
    );

    unmount();

    expect(mockRealtimeClient.disconnect).toHaveBeenCalled();
  });
});
```

#### Test Cache Invalidation

```tsx
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRealtimeBookings } from '@digilist/client-sdk/hooks';
import { useQuery } from '@tanstack/react-query';
import { mockRealtimeClient } from '@/tests/mocks/realtimeClient';

describe('Realtime Cache Sync', () => {
  test('invalidates bookings query on booking event', async () => {
    const queryClient = new QueryClient();
    const wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    // Setup query
    const { result: queryResult } = renderHook(
      () =>
        useQuery({
          queryKey: ['bookings'],
          queryFn: async () => [{ id: 'bk_1', status: 'pending' }],
        }),
      { wrapper }
    );

    // Setup realtime hook
    const { result: realtimeResult } = renderHook(
      () => useRealtimeBookings(),
      { wrapper }
    );

    await waitFor(() => expect(queryResult.current.data).toBeDefined());

    // Simulate booking event
    const mockHandler = mockRealtimeClient.onBooking.mock.calls[0]?.[0];
    mockHandler?.({
      type: 'booking',
      data: { id: 'bk_1', status: 'confirmed' },
      timestamp: new Date().toISOString(),
    });

    // Verify query was invalidated
    await waitFor(() => {
      const state = queryClient.getQueryState(['bookings']);
      expect(state?.isInvalidated).toBe(true);
    });
  });
});
```

#### Integration Test with Real WebSocket

```tsx
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RealtimeProvider } from '@/providers/RealtimeProvider';
import WS from 'jest-websocket-mock';

/**
 * Integration test with real WebSocket connection (mocked server)
 * Requires: jest-websocket-mock
 */
describe('Realtime Integration', () => {
  let server: WS;

  beforeEach(async () => {
    // Create mock WebSocket server
    server = new WS('ws://localhost:1234');
  });

  afterEach(() => {
    WS.clean();
  });

  test('connects and receives events', async () => {
    const queryClient = new QueryClient();
    const onEvent = vi.fn();

    function TestComponent() {
      const { isConnected } = useRealtimeContext();
      useRealtimeBookings(onEvent);

      return <div>{isConnected ? 'Connected' : 'Disconnected'}</div>;
    }

    render(
      <QueryClientProvider client={queryClient}>
        <RealtimeProvider
          baseUrl="http://localhost:1234"
          tenantId="test-tenant"
          autoConnect={true}
        >
          <TestComponent />
        </RealtimeProvider>
      </QueryClientProvider>
    );

    // Wait for connection
    await server.connected;

    // Send event from server
    server.send(
      JSON.stringify({
        type: 'booking',
        data: { id: 'bk_123', status: 'confirmed' },
        timestamp: new Date().toISOString(),
      })
    );

    // Verify handler was called
    await waitFor(() => {
      expect(onEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'booking',
          data: expect.objectContaining({ id: 'bk_123' }),
        })
      );
    });

    expect(screen.getByText('Connected')).toBeInTheDocument();
  });
});
```

#### E2E Test with Playwright

```typescript
// tests/e2e/realtime-connection.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Realtime WebSocket Connection', () => {
  test('should show connection status indicator', async ({ page }) => {
    await page.goto('/');

    // Wait for WebSocket connection
    await page.waitForTimeout(1000);

    // Check connection status badge
    const statusBadge = page.locator('[data-testid="connection-status"]');
    await expect(statusBadge).toContainText(/connected/i);
  });

  test('should receive live booking updates', async ({ page }) => {
    await page.goto('/bookings');

    // Wait for initial load
    await page.waitForSelector('[data-testid="booking-list"]');

    // Simulate booking creation via API (which triggers WebSocket event)
    await page.evaluate(() => {
      fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId: 'ro_123',
          startDate: '2026-02-01',
          endDate: '2026-02-02',
        }),
      });
    });

    // Wait for new booking to appear (via WebSocket event)
    await expect(page.locator('[data-testid="booking-item"]')).toHaveCount(1);
  });

  test('should handle disconnection gracefully', async ({ page, context }) => {
    await page.goto('/');

    // Wait for connection
    await page.waitForTimeout(1000);
    await expect(page.locator('[data-testid="connection-status"]')).toContainText(/connected/i);

    // Simulate network offline
    await context.setOffline(true);

    // Should show disconnected status
    await expect(page.locator('[data-testid="connection-status"]')).toContainText(/disconnected|reconnecting/i);

    // Restore network
    await context.setOffline(false);

    // Should reconnect
    await expect(page.locator('[data-testid="connection-status"]')).toContainText(/connected/i, {
      timeout: 10000,
    });
  });
});
```

---

## API Reference

### RealtimeClient Class

#### Constructor

```typescript
class RealtimeClient {
  constructor(); // Singleton - use exported instance
}

// Exported singleton instance
export const realtimeClient = new RealtimeClient();
```

#### Public Methods

```typescript
/**
 * Connect to WebSocket endpoint
 * @param config - Connection configuration
 * @returns void
 */
connect(config: RealtimeClientConfig): void;

/**
 * Disconnect from WebSocket
 * Closes connection and clears all handlers
 * @returns void
 */
disconnect(): void;

/**
 * Subscribe to specific event type
 * @param eventType - Event type or '*' for all events
 * @param handler - Event handler function
 * @returns Unsubscribe function
 */
on(eventType: RealtimeEventType | '*', handler: RealtimeEventHandler): () => void;

/**
 * Subscribe to audit events
 * @param handler - Event handler function
 * @returns Unsubscribe function
 */
onAudit(handler: RealtimeEventHandler): () => void;

/**
 * Subscribe to booking events
 * @param handler - Event handler function
 * @returns Unsubscribe function
 */
onBooking(handler: RealtimeEventHandler): () => void;

/**
 * Subscribe to listing events
 * @param handler - Event handler function
 * @returns Unsubscribe function
 */
onListing(handler: RealtimeEventHandler): () => void;

/**
 * Subscribe to message/notification events
 * @param handler - Event handler function
 * @returns Unsubscribe function
 */
onMessage(handler: RealtimeEventHandler): () => void;

/**
 * Subscribe to all events (wildcard)
 * @param handler - Event handler function
 * @returns Unsubscribe function
 */
onAll(handler: RealtimeEventHandler): () => void;

/**
 * Send message to server
 * Only works when connected (isConnected === true)
 * @param data - Data to send (will be JSON stringified)
 * @returns void
 */
send(data: unknown): void;

/**
 * Send ping to keep connection alive
 * Server responds with 'pong' event
 * @returns void
 */
ping(): void;
```

#### Public Properties

```typescript
/**
 * Check if WebSocket is connected
 * @returns true if socket.readyState === WebSocket.OPEN
 */
get isConnected(): boolean;
```

#### Private Properties

```typescript
private socket: WebSocket | null = null;
private config: RealtimeClientConfig | null = null;
private handlers: Map<string, Set<RealtimeEventHandler>> = new Map();
private reconnectAttempts: number = 0;
private isConnecting: boolean = false;
private debug: boolean = false;
```

#### Private Methods

```typescript
/**
 * Emit event to all registered handlers
 * Catches and logs handler errors without stopping execution
 */
private emit(eventType: string, event: RealtimeEvent): void;

/**
 * Attempt to reconnect with exponential backoff
 * Respects maxReconnectAttempts configuration
 */
private attemptReconnect(): void;
```

### Types

#### RealtimeEventType

```typescript
export type RealtimeEventType =
  | 'audit'
  | 'booking'
  | 'listing'
  | 'message'
  | 'notification'
  | 'connected'
  | 'pong';
```

#### RealtimeEvent

```typescript
export interface RealtimeEvent {
  type: RealtimeEventType;
  data?: unknown;          // Event-specific payload
  timestamp?: string;      // ISO 8601 timestamp
  tenantId?: string;       // Multi-tenant identifier
  message?: string;        // Human-readable message
}
```

#### RealtimeEventHandler

```typescript
export type RealtimeEventHandler = (event: RealtimeEvent) => void;
```

#### RealtimeClientConfig

```typescript
export interface RealtimeClientConfig {
  /** WebSocket URL (must start with ws:// or wss://) */
  url: string;

  /** Enable automatic reconnection on disconnect (default: true) */
  autoReconnect?: boolean;

  /** Fixed delay between reconnection attempts in milliseconds (default: 3000) */
  reconnectInterval?: number;

  /** Maximum number of reconnection attempts before giving up (default: 5) */
  maxReconnectAttempts?: number;

  /** Multi-tenant identifier for event filtering */
  tenantId?: string;

  /** Enable debug logging to console (default: false, never enable in production) */
  debug?: boolean;
}
```

**Configuration Defaults:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `url` | `string` | ✅ Yes | - | WebSocket URL (wss://...) |
| `autoReconnect` | `boolean` | ❌ No | `true` | Auto-reconnect on connection loss |
| `reconnectInterval` | `number` | ❌ No | `3000` | Delay between reconnect attempts (ms) |
| `maxReconnectAttempts` | `number` | ❌ No | `5` | Max reconnection attempts |
| `tenantId` | `string` | ❌ No | `undefined` | Multi-tenant identifier |
| `debug` | `boolean` | ❌ No | `false` | Console debug logging |

**Examples:**

```typescript
// Minimal configuration (uses all defaults)
realtimeClient.connect({
  url: 'wss://api.digilist.no/ws/events',
});

// Production configuration
realtimeClient.connect({
  url: 'wss://api.digilist.no/ws/events',
  tenantId: 'kommune-oslo-12345',
  autoReconnect: true,
  maxReconnectAttempts: 10,
});

// Development/debugging configuration
realtimeClient.connect({
  url: 'ws://localhost:3002/ws/events',
  tenantId: 'test-tenant',
  debug: true, // ⚠️ Never enable in production
  reconnectInterval: 1000, // Faster reconnects for testing
});
```

#### WSEventType

```typescript
export type WSEventType =
  // Booking events (5)
  | 'booking.created'
  | 'booking.updated'
  | 'booking.cancelled'
  | 'booking.confirmed'
  | 'booking.completed'
  // Listing events (4)
  | 'listing.updated'
  | 'listing.published'
  | 'listing.unpublished'
  | 'listing.deleted'
  // Availability events (3)
  | 'availability.changed'
  | 'block.created'
  | 'block.removed'
  // Organization events (3)
  | 'organization.updated'
  | 'member.added'
  | 'member.removed'
  // Review events (2)
  | 'review.created'
  | 'review.approved'
  // Season events (3)
  | 'season.updated'
  | 'application.submitted'
  | 'application.allocated';
```

#### WSEvent

```typescript
export interface WSEvent<T = unknown> {
  type: WSEventType;
  payload: T;               // Event-specific payload
  tenantId: string;         // Multi-tenant identifier
  timestamp: string;        // ISO 8601 timestamp
  correlationId?: string;   // Request trace ID
}
```

### WebSocketCacheSync Class

#### Methods

```typescript
class WebSocketCacheSync {
  // Initialize with React Query client
  initialize(queryClient: QueryClient): void;

  // Handle incoming WebSocket event
  // Automatically invalidates correct queries based on event type
  handleEvent(event: WSEvent): void;

  // Connect to WebSocket and start syncing
  connect(wsUrl: string, tenantId: string): void;

  // Disconnect from WebSocket
  disconnect(): void;
}
```

#### Private Properties

```typescript
private queryClient: QueryClient | null = null;
private connected: boolean = false;
```

#### Singleton Instance

```typescript
export const wsCacheSync = new WebSocketCacheSync();
```

#### wsInvalidationMap

**Critical:** This map defines which React Query cache keys are invalidated for each WebSocket event type. This ensures WebSocket events follow the same cache invalidation rules as mutations.

```typescript
export const wsInvalidationMap: Record<WSEventType, string[][]> = {
  // Booking events
  'booking.created': [
    ['listing', 'availability'],
    ['booking', 'mine'],
    ['organization', 'bookings'],
  ],
  'booking.updated': [
    ['booking', 'details'],
    ['booking', 'mine'],
  ],
  'booking.cancelled': [
    ['listing', 'availability'],
    ['booking', 'mine'],
    ['booking', 'details'],
    ['organization', 'bookings'],
  ],
  'booking.confirmed': [
    ['booking', 'mine'],
    ['booking', 'details'],
  ],
  'booking.completed': [
    ['booking', 'mine'],
    ['booking', 'details'],
  ],

  // Listing events
  'listing.updated': [
    ['listing', 'details'],
    ['listing', 'search'],
  ],
  'listing.published': [
    ['listing', 'details'],
    ['listing', 'search'],
  ],
  'listing.unpublished': [
    ['listing', 'details'],
    ['listing', 'search'],
  ],
  'listing.deleted': [
    ['listing', 'search'],
  ],

  // Availability events
  'availability.changed': [
    ['listing', 'availability'],
  ],
  'block.created': [
    ['listing', 'availability'],
  ],
  'block.removed': [
    ['listing', 'availability'],
  ],

  // Organization events
  'organization.updated': [
    ['organization', 'details'],
    ['organization', 'mine'],
  ],
  'member.added': [
    ['organization', 'members'],
  ],
  'member.removed': [
    ['organization', 'members'],
  ],

  // Review events
  'review.created': [
    ['listing', 'details'],
    ['review', 'listing'],
  ],
  'review.approved': [
    ['listing', 'details'],
    ['review', 'listing'],
  ],

  // Season events
  'season.updated': [
    ['config', 'seasons'],
    ['season', 'details'],
  ],
  'application.submitted': [
    ['season', 'applications'],
  ],
  'application.allocated': [
    ['season', 'applications'],
    ['allocation'],
  ],
};
```

**Usage:**

```typescript
// Automatically handled by WebSocketCacheSync
wsCacheSync.handleEvent({
  type: 'booking.created',
  payload: { bookingId: '123' },
  tenantId: 'kommune-oslo-12345',
  timestamp: '2026-01-16T10:30:00Z',
});

// Result: Invalidates queries with keys:
// - ['listing', 'availability']
// - ['booking', 'mine']
// - ['organization', 'bookings']
```

### Helper Functions

#### createAuditWebSocketUrl

```typescript
export function createAuditWebSocketUrl(baseUrl: string): string;

// Example
createAuditWebSocketUrl('https://api.digilist.no');
// → 'wss://api.digilist.no/ws/audit'
```

#### createTenantWebSocketUrl

```typescript
export function createTenantWebSocketUrl(baseUrl: string, tenantId: string): string;

// Example
createTenantWebSocketUrl('https://api.digilist.no', 'kommune-oslo-12345');
// → 'wss://api.digilist.no/ws/events/kommune-oslo-12345'
```

#### createUseWebSocketCacheSync

```typescript
/**
 * Advanced: Create a custom WebSocket cache sync hook
 * Returns a React hook that manages WebSocket cache synchronization
 * @param queryClient - React Query client instance
 * @returns Hook function for cache sync management
 */
export function createUseWebSocketCacheSync(
  queryClient: QueryClient
): () => void;
```

**Usage (Advanced):**

```typescript
import { QueryClient } from '@tanstack/react-query';
import { createUseWebSocketCacheSync } from '@digilist/client-sdk/realtime';

const queryClient = new QueryClient();
const useWebSocketCacheSync = createUseWebSocketCacheSync(queryClient);

function MyComponent() {
  useWebSocketCacheSync(); // Automatically syncs cache with WS events
  // ...
}
```

**Note:** This is an advanced API. Most apps should use the provided hooks instead (`useRealtimeBookings`, etc.).

### React Hooks

All hooks are exported from `@digilist/client-sdk/hooks`:

#### Connection Management

```typescript
/**
 * Connect to WebSocket and manage connection state
 * @param config - Optional partial configuration (merged with defaults)
 * @returns boolean - true if connected, false otherwise
 *
 * @example
 * const isConnected = useRealtimeConnection({
 *   tenantId: 'kommune-oslo-12345',
 *   debug: true,
 * });
 */
function useRealtimeConnection(config?: Partial<RealtimeClientConfig>): boolean;
```

#### Event Subscriptions

All subscription hooks automatically:
- Subscribe to specific event types
- Invalidate React Query cache when events occur
- Clean up subscriptions on unmount

```typescript
/**
 * Subscribe to booking events (booking.created, booking.updated, etc.)
 * Automatically invalidates booking and listing queries
 * @param handler - Optional custom handler (in addition to cache invalidation)
 * @returns void
 */
function useRealtimeBookings(handler?: RealtimeEventHandler): void;

/**
 * Subscribe to listing events (listing.updated, listing.published, etc.)
 * Automatically invalidates listing queries
 * @param handler - Optional custom handler (in addition to cache invalidation)
 * @returns void
 */
function useRealtimeListings(handler?: RealtimeEventHandler): void;

/**
 * Subscribe to availability and calendar events
 * Automatically invalidates availability queries
 * @param handler - Optional custom handler (in addition to cache invalidation)
 * @returns void
 */
function useRealtimeCalendar(handler?: RealtimeEventHandler): void;

/**
 * Subscribe to message events
 * Automatically invalidates message queries
 * @param handler - Optional custom handler (in addition to cache invalidation)
 * @returns void
 */
function useRealtimeMessages(handler?: RealtimeEventHandler): void;

/**
 * Subscribe to notification events
 * Automatically invalidates notification queries
 * @param handler - Optional custom handler (in addition to cache invalidation)
 * @returns void
 */
function useRealtimeNotifications(handler?: RealtimeEventHandler): void;

/**
 * Subscribe to audit log events
 * Automatically invalidates audit queries
 * @param handler - Optional custom handler (in addition to cache invalidation)
 * @returns void
 */
function useRealtimeAudit(handler?: RealtimeEventHandler): void;

/**
 * Subscribe to all events (wildcard subscription)
 * Does NOT automatically invalidate cache - handler is required
 * @param handler - Required event handler
 * @returns void
 */
function useRealtimeEvents(handler: RealtimeEventHandler): void;
```

#### Utility Hooks

```typescript
/**
 * Manage notification badge state
 * @returns Object with unread count and mark-as-read function
 *
 * @example
 * const { unreadCount, markAsRead } = useNotificationBadge();
 * // unreadCount: number - Current unread notification count
 * // markAsRead: () => void - Mark all notifications as read
 */
function useNotificationBadge(): {
  unreadCount: number;
  markAsRead: () => void;
};

/**
 * Send messages and check connection state
 * @returns Object with send, ping, and isConnected
 *
 * @example
 * const { send, ping, isConnected } = useRealtimeSend();
 * if (isConnected) {
 *   send({ type: 'custom', data: 'hello' });
 *   ping(); // Keep-alive
 * }
 */
function useRealtimeSend(): {
  send: (data: unknown) => void;
  ping: () => void;
  isConnected: boolean;
};
```

**Hook Usage Summary:**

| Hook | Purpose | Auto-Invalidates | Handler Required |
|------|---------|------------------|------------------|
| `useRealtimeConnection` | Manage connection | N/A | No |
| `useRealtimeBookings` | Booking events | ✅ Yes | No |
| `useRealtimeListings` | Listing events | ✅ Yes | No |
| `useRealtimeCalendar` | Availability events | ✅ Yes | No |
| `useRealtimeMessages` | Message events | ✅ Yes | No |
| `useRealtimeNotifications` | Notification events | ✅ Yes | No |
| `useRealtimeAudit` | Audit events | ✅ Yes | No |
| `useRealtimeEvents` | All events (wildcard) | ❌ No | Yes |
| `useNotificationBadge` | Badge state | N/A | No |
| `useRealtimeSend` | Send messages | N/A | No |

### Provider Context

The `RealtimeProvider` wraps your app and provides WebSocket connection state and controls via React Context.

#### RealtimeContextValue Interface

```typescript
interface RealtimeContextValue {
  /** Current connection status */
  isConnected: boolean;

  /** Detailed connection state */
  status: 'disconnected' | 'connecting' | 'connected' | 'error';

  /** Error message if status is 'error', null otherwise */
  error: string | null;

  /** Manually initiate connection (usually automatic) */
  connect: () => void;

  /** Manually disconnect (cleanup) */
  disconnect: () => void;

  /**
   * Subscribe to event type
   * @param eventType - Event type or '*' for all events
   * @param handler - Event handler function
   * @returns Unsubscribe function
   */
  subscribe: (
    eventType: RealtimeEventType | '*',
    handler: RealtimeEventHandler
  ) => () => void;

  /**
   * Map of most recent event for each type
   * Useful for displaying last update times or event data
   */
  lastEvents: Map<RealtimeEventType, RealtimeEvent>;
}
```

#### useRealtimeContext Hook

```typescript
/**
 * Access RealtimeProvider context
 * Must be used within a RealtimeProvider component tree
 * @returns RealtimeContextValue
 * @throws Error if used outside RealtimeProvider
 *
 * @example
 * function ConnectionStatus() {
 *   const { isConnected, status, error } = useRealtimeContext();
 *
 *   return (
 *     <div>
 *       Status: {status}
 *       {error && <span>Error: {error}</span>}
 *     </div>
 *   );
 * }
 */
function useRealtimeContext(): RealtimeContextValue;
```

#### RealtimeProvider Component

```typescript
interface RealtimeProviderProps {
  /** Child components */
  children: React.ReactNode;

  /** WebSocket URL (default: from SDK config) */
  url?: string;

  /** Multi-tenant identifier (default: from SDK config) */
  tenantId?: string;

  /** Auto-connect on mount (default: true) */
  autoConnect?: boolean;

  /** Enable debug logging (default: false) */
  debug?: boolean;
}

/**
 * Provider component that manages WebSocket connection
 * Wrap your app with this to enable realtime features
 *
 * @example
 * <RealtimeProvider
 *   url="wss://api.digilist.no/ws/events"
 *   tenantId="kommune-oslo-12345"
 *   autoConnect={true}
 * >
 *   <App />
 * </RealtimeProvider>
 */
function RealtimeProvider(props: RealtimeProviderProps): JSX.Element;
```

**Context State Machine:**

```
disconnected → (connect) → connecting → (onopen) → connected
                              ↓                       ↓
                           (onerror)             (onclose)
                              ↓                       ↓
                            error               disconnected
                              ↓
                        (retry) → connecting
```

---

### Module Exports

Understanding what's exported from each module:

#### `@digilist/client-sdk` (Main Package)

```typescript
// Singleton client instance
import { realtimeClient } from '@digilist/client-sdk';

// Singleton cache sync instance
import { wsCacheSync } from '@digilist/client-sdk';

// Helper functions
import {
  createAuditWebSocketUrl,
  createTenantWebSocketUrl,
} from '@digilist/client-sdk';
```

#### `@digilist/client-sdk/realtime`

```typescript
// Core realtime exports
import {
  realtimeClient,           // Singleton instance
  wsCacheSync,              // Singleton cache sync
  wsInvalidationMap,        // Event → Query mapping
} from '@digilist/client-sdk/realtime';

// Types
import type {
  RealtimeEvent,
  RealtimeEventType,
  RealtimeEventHandler,
  RealtimeClientConfig,
  WSEvent,
  WSEventType,
} from '@digilist/client-sdk/realtime';

// Classes (for advanced usage)
import {
  RealtimeClient,           // Class (use singleton instead)
  WebSocketCacheSync,       // Class (use singleton instead)
} from '@digilist/client-sdk/realtime';
```

#### `@digilist/client-sdk/hooks`

```typescript
// Connection management
import { useRealtimeConnection } from '@digilist/client-sdk/hooks';

// Event subscriptions
import {
  useRealtimeBookings,
  useRealtimeListings,
  useRealtimeCalendar,
  useRealtimeMessages,
  useRealtimeNotifications,
  useRealtimeAudit,
  useRealtimeEvents,
} from '@digilist/client-sdk/hooks';

// Utilities
import {
  useNotificationBadge,
  useRealtimeSend,
  useRealtimeContext,
} from '@digilist/client-sdk/hooks';
```

#### `@digilist/client-sdk/providers`

```typescript
// Provider component
import { RealtimeProvider } from '@digilist/client-sdk/providers';

// Provider props type
import type { RealtimeProviderProps } from '@digilist/client-sdk/providers';
```

**Import Path Decision Tree:**

```
Need to...
├─ Use singleton client directly
│  └─ import { realtimeClient } from '@digilist/client-sdk'
│
├─ Use React integration
│  ├─ Manage connection
│  │  └─ import { useRealtimeConnection } from '@digilist/client-sdk/hooks'
│  ├─ Subscribe to events
│  │  └─ import { useRealtimeBookings } from '@digilist/client-sdk/hooks'
│  └─ Wrap app with provider
│     └─ import { RealtimeProvider } from '@digilist/client-sdk/providers'
│
├─ Access types
│  └─ import type { RealtimeEvent } from '@digilist/client-sdk/realtime'
│
└─ Advanced: Custom cache sync
   └─ import { wsCacheSync, wsInvalidationMap } from '@digilist/client-sdk/realtime'
```

**Best Practice Imports:**

```typescript
// ✅ CORRECT - Most common usage pattern
import { RealtimeProvider } from '@digilist/client-sdk/providers';
import { useRealtimeConnection, useRealtimeBookings } from '@digilist/client-sdk/hooks';
import type { RealtimeEvent } from '@digilist/client-sdk/realtime';

function App() {
  return (
    <RealtimeProvider tenantId="kommune-oslo-12345">
      <Dashboard />
    </RealtimeProvider>
  );
}

function Dashboard() {
  const isConnected = useRealtimeConnection();
  useRealtimeBookings((event) => {
    console.log('Booking event:', event);
  });

  return <div>Connected: {isConnected}</div>;
}

// ❌ WRONG - Don't import from root unless using singleton directly
import { RealtimeProvider } from '@digilist/client-sdk'; // May not be exported

// ❌ WRONG - Don't create new instances
import { RealtimeClient } from '@digilist/client-sdk/realtime';
const client = new RealtimeClient(); // Use singleton instead
```

---

## Related Documents

- [CLAUDE.md](./CLAUDE.md) - AI agent guidelines
- [ARCHITECTURE_NO_TRANSFORMERS.md](./ARCHITECTURE_NO_TRANSFORMERS.md) - Contract-first architecture
- [api-sdk.md](./api-sdk.md) - API & SDK architecture
- [DESIGN_TOKENS_GUIDE.md](./DESIGN_TOKENS_GUIDE.md) - Design system tokens

---

## Changelog

| Date | Change | Author |
|------|--------|--------|
| 2026-01-16 | Initial documentation | Xaheen AI |

---

## Support

For WebSocket realtime issues:

1. Check `debug: true` output for connection/event flow
2. Verify `tenantId` is correct
3. Confirm network allows WebSocket connections (wss://)
4. Check React Query DevTools for cache invalidations
5. Review browser console for errors

**Common Issues:**

| Issue | Cause | Solution |
|-------|-------|----------|
| "Cannot connect" | Network blocks WebSocket | Check firewall/proxy |
| "No events received" | Wrong tenantId | Verify tenant configuration |
| "Queries not refetching" | Hook not used | Add `useRealtimeBookings()` |
| "Memory leak" | Missing cleanup | Use hooks (auto-cleanup) |
| "Too many connections" | Multiple instances | Use singleton pattern |
