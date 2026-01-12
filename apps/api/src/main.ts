import Fastify from 'fastify';
import { initializeAdapters } from './config/adapters';
import { adaptersPlugin } from './plugins/adapters.plugin';
import { loggingPlugin } from './plugins/logging.plugin';
import { rateLimitPlugin } from './plugins/rate-limit.plugin';
import { usersRoutes } from './routes/users.routes';

async function bootstrap() {
  // Initialize all adapters
  const adapters = await initializeAdapters();
  
  // Create Fastify instance
  const app = Fastify({
    logger: false, // Use our Pino adapter instead
    requestIdLogLabel: 'correlationId',
  });

  // Register plugins
  await app.register(adaptersPlugin, { adapters });
  await app.register(loggingPlugin);
  await app.register(rateLimitPlugin);
  
  // Register routes
  await app.register(usersRoutes, { prefix: '/api' });
  
  // Health check
  app.get('/health', async (request) => {
    return { 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      correlationId: request.correlationId,
    };
  });

  // Stripe webhook endpoint
  app.post('/webhooks/stripe', async (request, reply) => {
    const signature = request.headers['stripe-signature'] as string;
    const event = request.adapters.payments.constructWebhookEvent(
      JSON.stringify(request.body),
      signature
    );
    
    request.adapters.log.info('Stripe webhook received', { type: event.type });
    
    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        // Handle successful checkout
        break;
      case 'customer.subscription.updated':
        // Handle subscription update
        break;
    }
    
    return { received: true };
  });
  
  // Start scheduler for background jobs
  await adapters.scheduler.start();
  
  // Schedule a recurring job
  await adapters.scheduler.schedule(
    'cleanup-cache',
    '0 */6 * * *', // Every 6 hours
    async () => {
      adapters.log.info('Running cache cleanup');
      // Cleanup logic here
    }
  );

  // Graceful shutdown
  const shutdown = async () => {
    adapters.log.info('Shutting down gracefully...');
    await adapters.scheduler.stop();
    await app.close();
    process.exit(0);
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);

  // Start server
  const port = parseInt(process.env.PORT || '3000');
  const host = process.env.HOST || '0.0.0.0';
  
  await app.listen({ port, host });
  adapters.log.info(`Server started on ${host}:${port}`);
}

bootstrap().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
