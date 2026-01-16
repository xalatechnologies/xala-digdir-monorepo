/**
 * WebSocket Controller
 * Real-time event streaming for audit logs and notifications
 */
import type { FastifyInstance, FastifyRequest } from 'fastify';
import websocket from '@fastify/websocket';
import type { WebSocket } from 'ws';
import { registerWebSocket } from '../../core/audit/audit.service';
import { logger } from '../../core/logger';

export async function registerWebSocketRoutes(app: FastifyInstance) {
  // Register WebSocket plugin
  await app.register(websocket);

  // WebSocket route for real-time audit events
  app.get('/ws/audit', { websocket: true }, (socket: WebSocket, req: FastifyRequest) => {
    logger.info({ path: '/ws/audit' }, 'WebSocket client connected');
    
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
      logger.info({ path: '/ws/audit' }, 'WebSocket client disconnected');
    });
  });

  // WebSocket route for tenant-specific events
  app.get('/ws/events/:tenantId', { websocket: true }, (socket: WebSocket, req: FastifyRequest) => {
    const { tenantId } = req.params as { tenantId: string };
    logger.info({ path: '/ws/events/:tenantId', tenantId }, 'WebSocket client connected to tenant events');
    
    registerWebSocket(socket);
    
    socket.send(JSON.stringify({
      type: 'connected',
      tenantId,
      message: `Connected to events for tenant ${tenantId}`,
      timestamp: new Date().toISOString(),
    }));
    
    socket.on('close', () => {
      logger.info({ path: '/ws/events/:tenantId', tenantId }, 'WebSocket client disconnected from tenant events');
    });
  });

  logger.info({ routes: ['/ws/audit', '/ws/events/:tenantId'] }, 'WebSocket routes registered');
}
