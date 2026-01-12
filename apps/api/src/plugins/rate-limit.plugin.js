import fp from 'fastify-plugin';
/**
 * Rate limiting using RateLimit adapter
 */
export const rateLimitPlugin = fp(async (fastify) => {
    fastify.addHook('preHandler', async (request, reply) => {
        // Use userId if authenticated, otherwise IP address
        const identifier = request.userId || request.ip;
        // Check rate limit
        const result = await request.adapters.rateLimit.limit(identifier);
        // Add rate limit headers
        reply.header('X-RateLimit-Limit', result.limit);
        reply.header('X-RateLimit-Remaining', result.remaining);
        reply.header('X-RateLimit-Reset', result.reset);
        if (!result.success) {
            request.adapters.log.warn('Rate limit exceeded', {
                identifier,
                correlationId: request.correlationId,
            });
            reply.status(429).send({
                error: 'Too Many Requests',
                message: 'Rate limit exceeded. Please try again later.',
                retryAfter: result.retryAfter,
            });
        }
    });
}, {
    name: 'rate-limit-plugin',
});
