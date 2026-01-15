/**
 * WebSocket Controller
 * Real-time event streaming for audit logs, notifications, and availability updates
 */
import type { FastifyInstance, FastifyRequest } from 'fastify';
import websocket from '@fastify/websocket';
import type { WebSocket } from 'ws';
import { registerWebSocket } from '../../core/audit/audit.service';

// ============================================================================
// Availability Event Types
// ============================================================================

export interface AvailabilityUpdatedEvent {
  type: 'availability.updated';
  listingId: string;
  from: string;
  to: string;
  reason: 'booking' | 'block' | 'blackout' | 'opening_hours';
}

export interface BookingCreatedEvent {
  type: 'booking.created';
  bookingId: string;
  listingId: string;
  start: string;
  end: string;
}

export interface BookingCancelledEvent {
  type: 'booking.cancelled';
  bookingId: string;
  listingId: string;
  start: string;
  end: string;
}

export interface BookingConfirmedEvent {
  type: 'booking.confirmed';
  bookingId: string;
  listingId: string;
  start: string;
  end: string;
}

export interface BlockCreatedEvent {
  type: 'block.created';
  blockId: string;
  listingId: string;
  start: string;
  end: string;
}

export interface BlockUpdatedEvent {
  type: 'block.updated';
  blockId: string;
  listingId: string;
  start: string;
  end: string;
}

export interface BlockDeletedEvent {
  type: 'block.deleted';
  blockId: string;
  listingId: string;
  start: string;
  end: string;
}

export type AvailabilityEvent =
  | AvailabilityUpdatedEvent
  | BookingCreatedEvent
  | BookingCancelledEvent
  | BookingConfirmedEvent
  | BlockCreatedEvent
  | BlockUpdatedEvent
  | BlockDeletedEvent;

// ============================================================================
// Notification Event Types
// ============================================================================

export interface NotificationNewEvent {
  type: 'notification:new';
  id: string;
  notificationType: string;
  title: string;
  message: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  actionUrl?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface NotificationReadEvent {
  type: 'notification:read';
  id: string;
}

export interface NotificationDismissedEvent {
  type: 'notification:dismissed';
  id: string;
}

export interface NotificationCountEvent {
  type: 'notification:count';
  unreadCount: number;
}

export type NotificationEvent =
  | NotificationNewEvent
  | NotificationReadEvent
  | NotificationDismissedEvent
  | NotificationCountEvent;

// ============================================================================
// Notification WebSocket Connection Management
// ============================================================================

// Map of userId -> Set of WebSocket connections
const notificationConnections = new Map<string, Set<WebSocket>>();

/**
 * Register a WebSocket connection for user notifications
 */
export function registerNotificationWebSocket(socket: WebSocket, userId: string): void {
  if (!notificationConnections.has(userId)) {
    notificationConnections.set(userId, new Set());
  }
  notificationConnections.get(userId)!.add(socket);

  socket.on('close', () => {
    const connections = notificationConnections.get(userId);
    if (connections) {
      connections.delete(socket);
      if (connections.size === 0) {
        notificationConnections.delete(userId);
      }
    }
  });
}

/**
 * Broadcast a notification event to a specific user
 */
export function broadcastNotificationToUser(userId: string, event: NotificationEvent): void {
  const message = JSON.stringify({
    ...event,
    timestamp: new Date().toISOString(),
  });

  const userConnections = notificationConnections.get(userId);
  if (userConnections) {
    userConnections.forEach((socket) => {
      try {
        if (socket.readyState === 1) { // WebSocket.OPEN
          socket.send(message);
        }
      } catch (err) {
        // Ignore send errors
      }
    });
  }
}

/**
 * Broadcast a new notification to a user
 */
export function broadcastNewNotification(
  userId: string,
  notification: Omit<NotificationNewEvent, 'type'>
): void {
  broadcastNotificationToUser(userId, {
    type: 'notification:new',
    ...notification,
  });
}

/**
 * Broadcast notification read event to user
 */
export function broadcastNotificationRead(userId: string, notificationId: string): void {
  broadcastNotificationToUser(userId, {
    type: 'notification:read',
    id: notificationId,
  });
}

/**
 * Broadcast notification dismissed event to user
 */
export function broadcastNotificationDismissed(userId: string, notificationId: string): void {
  broadcastNotificationToUser(userId, {
    type: 'notification:dismissed',
    id: notificationId,
  });
}

/**
 * Broadcast updated unread count to user
 */
export function broadcastNotificationCount(userId: string, unreadCount: number): void {
  broadcastNotificationToUser(userId, {
    type: 'notification:count',
    unreadCount,
  });
}

/**
 * Get the broadcast function for use in notification service
 */
export function getNotificationBroadcastFunction(): (userId: string, event: string, data: unknown) => void {
  return (userId: string, event: string, data: unknown) => {
    if (event === 'notification:new') {
      const notification = data as Omit<NotificationNewEvent, 'type'>;
      broadcastNewNotification(userId, notification);
    } else if (event === 'notification:read') {
      const { id } = data as { id: string };
      broadcastNotificationRead(userId, id);
    } else if (event === 'notification:dismissed') {
      const { id } = data as { id: string };
      broadcastNotificationDismissed(userId, id);
    } else if (event === 'notification:count') {
      const { unreadCount } = data as { unreadCount: number };
      broadcastNotificationCount(userId, unreadCount);
    }
  };
}

// ============================================================================
// Availability WebSocket Connection Management
// ============================================================================

// Map of listingId -> Set of WebSocket connections
const availabilityConnections = new Map<string, Set<WebSocket>>();

// Global connections for all availability events (listingId = '*')
const globalAvailabilityConnections = new Set<WebSocket>();

/**
 * Register a WebSocket connection for availability updates on a specific listing
 */
export function registerAvailabilityWebSocket(socket: WebSocket, listingId: string): void {
  if (listingId === '*') {
    globalAvailabilityConnections.add(socket);
  } else {
    if (!availabilityConnections.has(listingId)) {
      availabilityConnections.set(listingId, new Set());
    }
    availabilityConnections.get(listingId)!.add(socket);
  }

  socket.on('close', () => {
    if (listingId === '*') {
      globalAvailabilityConnections.delete(socket);
    } else {
      const connections = availabilityConnections.get(listingId);
      if (connections) {
        connections.delete(socket);
        if (connections.size === 0) {
          availabilityConnections.delete(listingId);
        }
      }
    }
  });
}

/**
 * Broadcast an availability event to all relevant WebSocket connections
 */
export function broadcastAvailabilityEvent(event: AvailabilityEvent): void {
  const message = JSON.stringify({
    ...event,
    timestamp: new Date().toISOString(),
  });

  // Send to listing-specific connections
  const listingConnections = availabilityConnections.get(event.listingId);
  if (listingConnections) {
    listingConnections.forEach((socket) => {
      try {
        if (socket.readyState === 1) { // WebSocket.OPEN
          socket.send(message);
        }
      } catch (err) {
        // Ignore send errors
      }
    });
  }

  // Send to global availability connections
  globalAvailabilityConnections.forEach((socket) => {
    try {
      if (socket.readyState === 1) { // WebSocket.OPEN
        socket.send(message);
      }
    } catch (err) {
      // Ignore send errors
    }
  });
}

// ============================================================================
// Convenience Broadcast Functions
// ============================================================================

/**
 * Broadcast availability updated event
 */
export function broadcastAvailabilityUpdated(
  listingId: string,
  from: string,
  to: string,
  reason: AvailabilityUpdatedEvent['reason']
): void {
  broadcastAvailabilityEvent({
    type: 'availability.updated',
    listingId,
    from,
    to,
    reason,
  });
}

/**
 * Broadcast booking created event
 */
export function broadcastBookingCreated(
  bookingId: string,
  listingId: string,
  start: string,
  end: string
): void {
  broadcastAvailabilityEvent({
    type: 'booking.created',
    bookingId,
    listingId,
    start,
    end,
  });
}

/**
 * Broadcast booking cancelled event
 */
export function broadcastBookingCancelled(
  bookingId: string,
  listingId: string,
  start: string,
  end: string
): void {
  broadcastAvailabilityEvent({
    type: 'booking.cancelled',
    bookingId,
    listingId,
    start,
    end,
  });
}

/**
 * Broadcast booking confirmed event
 */
export function broadcastBookingConfirmed(
  bookingId: string,
  listingId: string,
  start: string,
  end: string
): void {
  broadcastAvailabilityEvent({
    type: 'booking.confirmed',
    bookingId,
    listingId,
    start,
    end,
  });
}

/**
 * Broadcast block created event
 */
export function broadcastBlockCreated(
  blockId: string,
  listingId: string,
  start: string,
  end: string
): void {
  broadcastAvailabilityEvent({
    type: 'block.created',
    blockId,
    listingId,
    start,
    end,
  });
}

/**
 * Broadcast block updated event
 */
export function broadcastBlockUpdated(
  blockId: string,
  listingId: string,
  start: string,
  end: string
): void {
  broadcastAvailabilityEvent({
    type: 'block.updated',
    blockId,
    listingId,
    start,
    end,
  });
}

/**
 * Broadcast block deleted event
 */
export function broadcastBlockDeleted(
  blockId: string,
  listingId: string,
  start: string,
  end: string
): void {
  broadcastAvailabilityEvent({
    type: 'block.deleted',
    blockId,
    listingId,
    start,
    end,
  });
}

// ============================================================================
// WebSocket Route Registration
// ============================================================================

export async function registerWebSocketRoutes(app: FastifyInstance) {
  // Register WebSocket plugin
  await app.register(websocket);

  // WebSocket route for real-time audit events
  app.get('/ws/audit', { websocket: true }, (socket: WebSocket, req: FastifyRequest) => {
    console.log('[WS] Client connected to /ws/audit');

    // Register this socket for audit broadcasts
    registerWebSocket(socket);

    // Send welcome message
    socket.send(JSON.stringify({
      type: 'connected',
      message: 'Connected to audit stream',
      timestamp: new Date().toISOString(),
    }));

    // Handle incoming messages (for filtering, etc.)
    socket.on('message', (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString());
        if (message.type === 'ping') {
          socket.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }));
        }
      } catch (err) {
        // Ignore parse errors
      }
    });

    socket.on('close', () => {
      console.log('[WS] Client disconnected from /ws/audit');
    });
  });

  // WebSocket route for tenant-specific events
  app.get('/ws/events/:tenantId', { websocket: true }, (socket: WebSocket, req: FastifyRequest) => {
    const { tenantId } = req.params as { tenantId: string };
    console.log(`[WS] Client connected to /ws/events/${tenantId}`);

    registerWebSocket(socket);

    socket.send(JSON.stringify({
      type: 'connected',
      tenantId,
      message: `Connected to events for tenant ${tenantId}`,
      timestamp: new Date().toISOString(),
    }));

    socket.on('close', () => {
      console.log(`[WS] Client disconnected from /ws/events/${tenantId}`);
    });
  });

  // WebSocket route for listing-specific availability events
  app.get('/ws/availability/:listingId', { websocket: true }, (socket: WebSocket, req: FastifyRequest) => {
    const { listingId } = req.params as { listingId: string };
    console.log(`[WS] Client connected to /ws/availability/${listingId}`);

    // Register for availability broadcasts for this listing
    registerAvailabilityWebSocket(socket, listingId);

    // Also register for general audit broadcasts
    registerWebSocket(socket);

    socket.send(JSON.stringify({
      type: 'connected',
      listingId,
      message: `Connected to availability events for listing ${listingId}`,
      timestamp: new Date().toISOString(),
    }));

    // Handle incoming messages
    socket.on('message', (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString());
        if (message.type === 'ping') {
          socket.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }));
        }
      } catch (err) {
        // Ignore parse errors
      }
    });

    socket.on('close', () => {
      console.log(`[WS] Client disconnected from /ws/availability/${listingId}`);
    });
  });

  // WebSocket route for all availability events (global subscription)
  app.get('/ws/availability', { websocket: true }, (socket: WebSocket, req: FastifyRequest) => {
    console.log('[WS] Client connected to /ws/availability (global)');

    // Register for all availability broadcasts using '*' wildcard
    registerAvailabilityWebSocket(socket, '*');

    // Also register for general audit broadcasts
    registerWebSocket(socket);

    socket.send(JSON.stringify({
      type: 'connected',
      message: 'Connected to all availability events',
      timestamp: new Date().toISOString(),
    }));

    // Handle incoming messages
    socket.on('message', (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString());
        if (message.type === 'ping') {
          socket.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }));
        }
      } catch (err) {
        // Ignore parse errors
      }
    });

    socket.on('close', () => {
      console.log('[WS] Client disconnected from /ws/availability (global)');
    });
  });

  // WebSocket route for user-specific notifications
  app.get('/ws/notifications/:userId', { websocket: true }, (socket: WebSocket, req: FastifyRequest) => {
    const { userId } = req.params as { userId: string };
    console.log(`[WS] Client connected to /ws/notifications/${userId}`);

    // Register for notification broadcasts for this user
    registerNotificationWebSocket(socket, userId);

    socket.send(JSON.stringify({
      type: 'connected',
      userId,
      message: `Connected to notifications for user ${userId}`,
      timestamp: new Date().toISOString(),
    }));

    // Handle incoming messages
    socket.on('message', (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString());
        if (message.type === 'ping') {
          socket.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }));
        }
      } catch (err) {
        // Ignore parse errors
      }
    });

    socket.on('close', () => {
      console.log(`[WS] Client disconnected from /ws/notifications/${userId}`);
    });
  });

  console.log('[WS] WebSocket routes registered: /ws/audit, /ws/events/:tenantId, /ws/availability/:listingId, /ws/availability, /ws/notifications/:userId');
}
