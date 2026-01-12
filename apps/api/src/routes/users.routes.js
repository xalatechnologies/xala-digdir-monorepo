/**
 * Example route demonstrating all adapters in action
 */
export const usersRoutes = async (fastify) => {
    /**
     * Create a new user
     * Demonstrates: Flags, AI, DB, Email, Analytics, Cache, Search, Queue
     */
    fastify.post('/users', async (request, reply) => {
        const { adapters } = request;
        const body = request.body;
        // 1. Check feature flag
        const canCreateUser = await adapters.flags.isEnabled('feature.user-creation');
        if (!canCreateUser) {
            return reply.status(403).send({
                error: 'Feature disabled',
                message: 'User creation is currently disabled'
            });
        }
        // 2. AI validation (if enabled)
        const useAiValidation = await adapters.flags.isEnabled('feature.ai-validation');
        if (useAiValidation) {
            const validation = await adapters.ai.chat([
                { role: 'system', content: 'Validate if this looks like a real user registration. Respond with "valid" or "invalid" and reason.' },
                { role: 'user', content: JSON.stringify(body) },
            ]);
            if (validation.content.toLowerCase().includes('invalid')) {
                adapters.log.warn('AI validation failed', { body, reason: validation.content });
                return reply.status(400).send({ error: 'Invalid user data', reason: validation.content });
            }
        }
        // 3. Create user in database
        const user = await adapters.db.insert('users', {
            ...body,
            createdAt: new Date(),
        });
        adapters.log.info('User created', { userId: user.id });
        // 4. Send welcome email
        await adapters.email.send({
            to: user.email,
            subject: 'Welcome to our platform!',
            html: `<h1>Welcome ${user.name}!</h1><p>Thanks for joining us.</p>`,
        });
        // 5. Track analytics event
        await adapters.analytics.identify(user.id, {
            email: user.email,
            name: user.name,
        });
        await adapters.analytics.track('user_created', {
            userId: user.id,
            correlationId: request.correlationId,
        });
        // 6. Cache user data
        await adapters.cache.set(`user:${user.id}`, user, 3600); // 1 hour
        // 7. Index in search
        await adapters.search.index('users', [user]);
        // 8. Queue background job for SMS
        if (user.phone) {
            await adapters.queue.add('send-welcome-sms', {
                userId: user.id,
                phone: user.phone,
            });
        }
        return { user };
    });
    /**
     * Get user by ID
     * Demonstrates: Cache, DB, Analytics
     */
    fastify.get('/users/:id', async (request, reply) => {
        const { adapters } = request;
        const { id } = request.params;
        // 1. Try cache first
        const cached = await adapters.cache.get(`user:${id}`);
        if (cached) {
            adapters.log.info('User fetched from cache', { userId: id });
            await adapters.analytics.track('user_viewed', { userId: id, source: 'cache' });
            return { user: cached };
        }
        // 2. Fetch from database
        const user = await adapters.db.findOne('users', { id });
        if (!user) {
            return reply.status(404).send({ error: 'User not found' });
        }
        // 3. Update cache
        await adapters.cache.set(`user:${id}`, user, 3600);
        // 4. Track analytics
        await adapters.analytics.track('user_viewed', { userId: id, source: 'database' });
        return { user };
    });
    /**
     * Search users
     * Demonstrates: Search adapter
     */
    fastify.get('/users/search', async (request, reply) => {
        const { adapters } = request;
        const { q } = request.query;
        const results = await adapters.search.search('users', q, {
            limit: 20,
            page: 1,
        });
        await adapters.analytics.track('users_searched', {
            query: q,
            resultsCount: results.total,
        });
        return { results };
    });
};
