import { createDbAdapter, createAuthAdapter, createCacheAdapter, createLogAdapter, createQueueAdapter, createStorageAdapter, createEmailAdapter, createRealtimeAdapter, createFlagsAdapter, createPaymentsAdapter, createRateLimitAdapter, createSecretsAdapter, createSchedulerAdapter, createSmsAdapter, createAnalyticsAdapter, createSearchAdapter, createAiAdapter, } from '@xalatechnologies/platform';
/**
 * Initialize all adapters with configuration from environment
 */
export async function initializeAdapters() {
    // Initialize secrets first to load other config
    const secrets = createSecretsAdapter('env', { prefix: 'APP' });
    // Initialize logger early for startup logging
    const log = createLogAdapter('pino', {
        level: process.env.LOG_LEVEL || 'info'
    });
    log.info('Initializing adapters...');
    try {
        const adapters = {
            // Core infrastructure
            db: createDbAdapter('drizzle', {
                connection: await secrets.get('DATABASE_URL') || 'postgresql://localhost/mydb',
            }),
            auth: createAuthAdapter('nextauth', {
                secret: await secrets.get('AUTH_SECRET') || 'dev-secret-change-in-production',
            }),
            cache: createCacheAdapter('redis', {
                url: await secrets.get('REDIS_URL') || 'redis://localhost:6379',
            }),
            log,
            queue: createQueueAdapter('bullmq', {
                connection: {
                    host: await secrets.get('REDIS_HOST') || 'localhost',
                    port: parseInt(await secrets.get('REDIS_PORT') || '6379'),
                },
            }),
            storage: createStorageAdapter('s3', {
                region: await secrets.get('AWS_REGION') || 'us-east-1',
                bucket: await secrets.get('S3_BUCKET') || 'my-bucket',
                credentials: {
                    accessKeyId: await secrets.get('AWS_ACCESS_KEY_ID') || '',
                    secretAccessKey: await secrets.get('AWS_SECRET_ACCESS_KEY') || '',
                },
            }),
            // Communication
            email: createEmailAdapter('resend', {
                apiKey: await secrets.get('RESEND_API_KEY') || '',
                from: await secrets.get('EMAIL_FROM') || 'noreply@example.com',
            }),
            sms: createSmsAdapter('twilio', {
                accountSid: await secrets.get('TWILIO_ACCOUNT_SID') || '',
                authToken: await secrets.get('TWILIO_AUTH_TOKEN') || '',
                from: await secrets.get('TWILIO_FROM') || '',
            }),
            realtime: createRealtimeAdapter('websocket', {
                url: await secrets.get('WS_URL') || 'ws://localhost:3001',
            }),
            // Business features
            payments: createPaymentsAdapter('stripe', {
                secretKey: await secrets.get('STRIPE_SECRET_KEY') || '',
                webhookSecret: await secrets.get('STRIPE_WEBHOOK_SECRET'),
            }),
            search: createSearchAdapter('meilisearch', {
                host: await secrets.get('MEILISEARCH_HOST') || 'http://localhost:7700',
                apiKey: await secrets.get('MEILISEARCH_API_KEY'),
            }),
            ai: createAiAdapter('openai', {
                apiKey: await secrets.get('OPENAI_API_KEY') || '',
                model: 'gpt-4',
            }),
            // Platform services
            flags: createFlagsAdapter('memory', {
                flags: {
                    'feature.new-api': true,
                    'feature.ai-validation': false,
                    'feature.advanced-search': true,
                },
            }),
            rateLimit: createRateLimitAdapter('memory', {
                defaultLimit: 100,
                windowMs: 60000, // 1 minute
            }),
            analytics: createAnalyticsAdapter('posthog', {
                apiKey: await secrets.get('POSTHOG_API_KEY') || '',
                host: await secrets.get('POSTHOG_HOST'),
            }),
            scheduler: createSchedulerAdapter('memory'),
            secrets,
        };
        log.info('All adapters initialized successfully');
        return adapters;
    }
    catch (error) {
        log.error('Failed to initialize adapters', error);
        throw error;
    }
}
