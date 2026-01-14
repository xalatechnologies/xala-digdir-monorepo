/**
 * WebSocket Realtime Client
 * Provides real-time event streaming via WebSocket
 */

export type RealtimeEventType = 'audit' | 'booking' | 'listing' | 'message' | 'notification' | 'connected' | 'pong';

export interface RealtimeEvent {
  type: RealtimeEventType;
  data?: unknown;
  timestamp?: string;
  tenantId?: string;
  message?: string;
}

export type RealtimeEventHandler = (event: RealtimeEvent) => void;

export interface RealtimeClientConfig {
  url: string;
  autoReconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  tenantId?: string;
}

class RealtimeClient {
  private socket: WebSocket | null = null;
  private config: RealtimeClientConfig | null = null;
  private handlers: Map<string, Set<RealtimeEventHandler>> = new Map();
  private reconnectAttempts = 0;
  private isConnecting = false;

  /**
   * Connect to WebSocket endpoint
   */
  connect(config: RealtimeClientConfig): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      console.warn('[Realtime] Already connected');
      return;
    }

    this.config = config;
    this.isConnecting = true;

    try {
      this.socket = new WebSocket(config.url);
      
      this.socket.onopen = () => {
        console.log('[Realtime] Connected to', config.url);
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.emit('connected', { type: 'connected', message: 'Connected to realtime server' });

        // Send subscription message to server (required by some WebSocket servers)
        if (config.tenantId) {
          this.send({
            type: 'subscribe',
            tenantId: config.tenantId,
            events: ['booking', 'listing', 'message', 'notification', 'audit'],
          });
          console.log('[Realtime] Sent subscription request for tenant:', config.tenantId);
        }
      };

      this.socket.onmessage = (event) => {
        console.log('[Realtime] Raw message received:', event.data);
        try {
          const data = JSON.parse(event.data) as RealtimeEvent;
          console.log('[Realtime] Parsed event:', data.type, data);
          this.emit(data.type, data);
          this.emit('*', data); // Wildcard handler for all events
        } catch (err) {
          console.error('[Realtime] Failed to parse message:', err);
        }
      };

      this.socket.onclose = () => {
        console.log('[Realtime] Disconnected');
        this.isConnecting = false;
        
        if (config.autoReconnect !== false) {
          this.attemptReconnect();
        }
      };

      this.socket.onerror = (error) => {
        console.error('[Realtime] Error:', error);
      };
    } catch (err) {
      console.error('[Realtime] Failed to connect:', err);
      this.isConnecting = false;
    }
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.handlers.clear();
  }

  /**
   * Subscribe to specific event type
   */
  on(eventType: RealtimeEventType | '*', handler: RealtimeEventHandler): () => void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }
    this.handlers.get(eventType)!.add(handler);

    // Return unsubscribe function
    return () => {
      this.handlers.get(eventType)?.delete(handler);
    };
  }

  /**
   * Subscribe to audit events
   */
  onAudit(handler: RealtimeEventHandler): () => void {
    return this.on('audit', handler);
  }

  /**
   * Subscribe to booking events
   */
  onBooking(handler: RealtimeEventHandler): () => void {
    return this.on('booking', handler);
  }

  /**
   * Subscribe to listing events
   */
  onListing(handler: RealtimeEventHandler): () => void {
    return this.on('listing', handler);
  }

  /**
   * Subscribe to message/notification events
   */
  onMessage(handler: RealtimeEventHandler): () => void {
    return this.on('message', handler);
  }

  /**
   * Subscribe to all events
   */
  onAll(handler: RealtimeEventHandler): () => void {
    return this.on('*', handler);
  }

  /**
   * Send ping to keep connection alive
   */
  ping(): void {
    this.send({ type: 'ping' });
  }

  /**
   * Send message to server
   */
  send(data: unknown): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(data));
    } else {
      console.warn('[Realtime] Cannot send - not connected');
    }
  }

  /**
   * Check if connected
   */
  get isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }

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

  private attemptReconnect(): void {
    const maxAttempts = this.config?.maxReconnectAttempts ?? 5;
    const interval = this.config?.reconnectInterval ?? 3000;

    if (this.reconnectAttempts >= maxAttempts) {
      console.log('[Realtime] Max reconnect attempts reached');
      return;
    }

    this.reconnectAttempts++;
    console.log(`[Realtime] Reconnecting in ${interval}ms (attempt ${this.reconnectAttempts}/${maxAttempts})`);

    setTimeout(() => {
      if (this.config && !this.isConnecting) {
        this.connect(this.config);
      }
    }, interval);
  }
}

// Singleton instance
export const realtimeClient = new RealtimeClient();

/**
 * Create WebSocket URL for audit events
 */
export function createAuditWebSocketUrl(baseUrl: string): string {
  const wsUrl = baseUrl.replace(/^http/, 'ws');
  return `${wsUrl}/ws/audit`;
}

/**
 * Create WebSocket URL for tenant-specific events
 */
export function createTenantWebSocketUrl(baseUrl: string, tenantId: string): string {
  const wsUrl = baseUrl.replace(/^http/, 'ws');
  return `${wsUrl}/ws/events/${tenantId}`;
}
