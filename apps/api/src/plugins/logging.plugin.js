import fp from 'fastify-plugin';
/**
 * Request/Response logging using Pino adapter
 */
export const loggingPlugin = fp(async (fastify) => {
    // Log incoming requests
    fastify.addHook('onRequest', async (request) => {
        request.adapters.log.info('Request received', {
            correlationId: request.correlationId,
            method: request.method,
            url: request.url,
            ip: request.ip,
            userAgent: request.headers['user-agent'],
        });
    });
    // Log completed responses
    fastify.addHook('onResponse', async (request, reply) => {
        const responseTime = reply.elapsedTime;
        const level = reply.statusCode >= 500 ? 'error' : reply.statusCode >= 400 ? 'warn' : 'info';
        request.adapters.log[level]('Request completed', {
            correlationId: request.correlationId,
            method: request.method,
            url: request.url,
            statusCode: reply.statusCode,
            responseTime: `${responseTime}ms`,
        });
    });
    // Log errors
    fastify.addHook('onError', async (request, reply, error) => {
        request.adapters.log.error('Request error', {
            correlationId: request.correlationId,
            method: request.method,
            url: request.url,
            error: error.message,
            stack: error.stack,
        });
    });
}, {
    name: 'logging-plugin',
});
