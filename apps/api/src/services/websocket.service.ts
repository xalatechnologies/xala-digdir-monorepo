import { FastifyInstance } from 'fastify';
import type { Server } from 'http';

// Socket.IO types - using any for optional dependency
// TODO: Install @types/socket.io when implementing WebSocket features
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SocketServer = any;

/**
 * WebSocket Server
 * 
 * Real-time updates for:
 * - Calendar changes
 * - Booking conflicts
 * - Live dashboard
 * - Activity updates
 */

interface SocketUser {
  userId: string;
  tenantId: string;
  organizationId?: string;
}

interface CalendarUpdate {
  type: 'BOOKING_CREATED' | 'BOOKING_UPDATED' | 'BOOKING_CANCELLED' | 'ACTIVITY_CREATED';
  data: any;
  rentalObjectId?: string;
  timestamp: string;
}

interface ConflictAlert {
  type: 'CONFLICT_DETECTED' | 'CONFLICT_RESOLVED';
  bookingId: string;
  conflictId: string;
  message: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
}

export class WebSocketService {
  private io: SocketServer | null = null;
  private userSockets = new Map<string, string[]>(); // userId -> socketIds

  /**
   * Initialize WebSocket server
   */
  initialize(server: Server) {
    try {
      // Dynamic import for optional socket.io dependency
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { Server: SocketIOServer } = require('socket.io');
      this.io = new SocketIOServer(server, {
        cors: {
          origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
          credentials: true,
        },
        path: '/socket.io',
      });

      this.setupHandlers();
      console.log('✅ WebSocket server initialized');
    } catch {
      console.warn('⚠️ socket.io not available, WebSocket features disabled');
    }
  }

  /**
   * Setup Socket.IO event handlers
   */
  private setupHandlers() {
    if (!this.io) return;

    this.io.on('connection', (socket: any) => {
      console.log(`🔌 Client connected: ${socket.id}`);

      // Authenticate
      socket.on('authenticate', (data: { userId: string; tenantId: string; token: string }) => {
        // TODO: Verify JWT token
        const { userId, tenantId } = data;
        
        // Store user mapping
        const sockets = this.userSockets.get(userId) || [];
        sockets.push(socket.id);
        this.userSockets.set(userId, sockets);

        // Join rooms
        socket.join(`user:${userId}`);
        socket.join(`tenant:${tenantId}`);

        socket.emit('authenticated', { success: true });
        console.log(`✅ User authenticated: ${userId}`);
      });

      // Subscribe to calendar
      socket.on('subscribe:calendar', (data: { rentalObjectId: string }) => {
        socket.join(`calendar:${data.rentalObjectId}`);
        console.log(`📅 Subscribed to calendar: ${data.rentalObjectId}`);
      });

      // Subscribe to conflicts
      socket.on('subscribe:conflicts', (data: { rentalObjectId: string }) => {
        socket.join(`conflicts:${data.rentalObjectId}`);
        console.log(`⚠️ Subscribed to conflicts: ${data.rentalObjectId}`);
      });

      // Unsubscribe
      socket.on('unsubscribe:calendar', (data: { rentalObjectId: string }) => {
        socket.leave(`calendar:${data.rentalObjectId}`);
      });

      socket.on('unsubscribe:conflicts', (data: { rentalObjectId: string }) => {
        socket.leave(`conflicts:${data.rentalObjectId}`);
      });

      // Disconnect
      socket.on('disconnect', () => {
        console.log(`🔌 Client disconnected: ${socket.id}`);
        
        // Remove from user mappings
        this.userSockets.forEach((sockets, userId) => {
          const filtered = sockets.filter(id => id !== socket.id);
          if (filtered.length === 0) {
            this.userSockets.delete(userId);
          } else {
            this.userSockets.set(userId, filtered);
          }
        });
      });
    });
  }

  /**
   * Broadcast calendar update
   */
  broadcastCalendarUpdate(rentalObjectId: string, update: CalendarUpdate) {
    if (!this.io) return;

    this.io.to(`calendar:${rentalObjectId}`).emit('calendar:update', update);
    console.log(`📅 Broadcast calendar update: ${rentalObjectId}`);
  }

  /**
   * Send conflict alert
   */
  sendConflictAlert(rentalObjectId: string, userId: string, alert: ConflictAlert) {
    if (!this.io) return;

    // Send to specific user
    this.io.to(`user:${userId}`).emit('conflict:alert', alert);
    
    // Also broadcast to calendar subscribers
    this.io.to(`conflicts:${rentalObjectId}`).emit('conflict:alert', alert);
    
    console.log(`⚠️ Conflict alert sent: ${alert.severity}`);
  }

  /**
   * Broadcast to tenant
   */
  broadcastToTenant(tenantId: string, event: string, data: any) {
    if (!this.io) return;

    this.io.to(`tenant:${tenantId}`).emit(event, data);
  }

  /**
   * Send to specific user
   */
  sendToUser(userId: string, event: string, data: any) {
    if (!this.io) return;

    this.io.to(`user:${userId}`).emit(event, data);
  }

  /**
   * Get connected users count
   */
  getConnectedUsersCount(): number {
    return this.userSockets.size;
  }

  /**
   * Check if user is connected
   */
  isUserConnected(userId: string): boolean {
    return this.userSockets.has(userId);
  }
}

// Singleton instance
export const webSocketService = new WebSocketService();

/**
 * Fastify plugin to initialize WebSocket
 */
export async function registerWebSocket(fastify: FastifyInstance) {
  webSocketService.initialize(fastify.server);
}
