/**
 * WebSocket Controller
 * Real-time event streaming for audit logs and notifications
 */
import type { FastifyInstance, FastifyRequest } from 'fastify';
import websocket from '@fastify/websocket';
import type { WebSocket } from 'ws';
import { registerWebSocket } from '../../core/audit/audit.service';

export async function registerWebSocketRoutes(app: FastifyInstance) {
  // Register WebSocket plugin
  await app.register(websocket);

  // WebSocket route for real-time audit events
  app.get('/ws/audit', { websocket: true }, (socket: WebSocket, req: FastifyRequest) => {
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
      // Client disconnected - cleanup handled by registerWebSocket
    });
  });

  // WebSocket route for tenant-specific events
  app.get('/ws/events/:tenantId', { websocket: true }, (socket: WebSocket, req: FastifyRequest) => {
    const { tenantId } = req.params as { tenantId: string };

    registerWebSocket(socket);
    
    socket.send(JSON.stringify({
      type: 'connected',
      tenantId,
      message: `Connected to events for tenant ${tenantId}`,
      timestamp: new Date().toISOString(),
    }));
    
    socket.on('close', () => {
      // Client disconnected - cleanup handled by registerWebSocket
    });
  });
}
