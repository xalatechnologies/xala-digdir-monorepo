import { z } from 'zod';

/**
 * Environment Validation Schema
 * 
 * Validates required environment variables at application boot.
 * Fails fast with clear error messages if configuration is invalid.
 */

// Base schema for all apps
const baseEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

// Web app environment
export const webEnvSchema = baseEnvSchema.extend({
  VITE_API_URL: z.string().url('VITE_API_URL must be a valid URL'),
  VITE_WS_URL: z.string().url('VITE_WS_URL must be a valid WebSocket URL').optional(),
  VITE_TENANT_ID: z.string().uuid('VITE_TENANT_ID must be a valid UUID').optional(),
  VITE_SENTRY_DSN: z.string().url().optional(),
  VITE_GA_ID: z.string().optional(),
});

// MinSide app environment
export const minsideEnvSchema = baseEnvSchema.extend({
  VITE_API_URL: z.string().url('VITE_API_URL must be a valid URL'),
  VITE_WS_URL: z.string().url().optional(),
  VITE_TENANT_ID: z.string().uuid().optional(),
  VITE_SENTRY_DSN: z.string().url().optional(),
  VITE_OAUTH_CLIENT_ID: z.string().optional(),
});

// Backoffice app environment
export const backofficeEnvSchema = baseEnvSchema.extend({
  VITE_API_URL: z.string().url('VITE_API_URL must be a valid URL'),
  VITE_WS_URL: z.string().url().optional(),
  VITE_TENANT_ID: z.string().uuid().optional(),
  VITE_SENTRY_DSN: z.string().url().optional(),
});

// API environment
export const apiEnvSchema = baseEnvSchema.extend({
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  REDIS_URL: z.string().url().optional(),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  CORS_ORIGIN: z.string().optional(),
  SENTRY_DSN: z.string().url().optional(),
  
  // Payment configuration (optional)
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  
  // Email configuration (optional)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  
  // OAuth configuration (optional)
  SIGNICAT_CLIENT_ID: z.string().optional(),
  SIGNICAT_CLIENT_SECRET: z.string().optional(),
  SIGNICAT_REDIRECT_URI: z.string().url().optional(),
});

/**
 * Validate environment and fail fast if invalid
 */
export function validateEnv<T extends z.ZodSchema>(
  schema: T,
  env: Record<string, string | undefined> = process.env as Record<string, string | undefined>,
  appName = 'App'
): z.infer<T> {
  console.log(`🔧 Validating ${appName} environment...`);
  
  const result = schema.safeParse(env);
  
  if (!result.success) {
    console.error(`\n❌ Environment validation failed for ${appName}:\n`);
    
    for (const error of result.error.errors) {
      const path = error.path.join('.');
      console.error(`  • ${path}: ${error.message}`);
    }
    
    console.error('\n💡 Check your .env file and ensure all required variables are set.\n');
    
    // In development, just warn
    if (process.env.NODE_ENV !== 'production') {
      console.warn('⚠️  Continuing in development mode despite validation errors.\n');
      return env as z.infer<T>;
    }
    
    // In production, fail fast
    process.exit(1);
  }
  
  console.log(`✅ ${appName} environment validated successfully.\n`);
  return result.data;
}

/**
 * Create a validated environment getter for an app
 */
export function createEnvValidator<T extends z.ZodSchema>(schema: T, appName: string) {
  let validated: z.infer<T> | null = null;
  
  return {
    validate: (env?: Record<string, string | undefined>) => {
      validated = validateEnv(schema, env, appName);
      return validated;
    },
    get: () => {
      if (!validated) {
        throw new Error(`${appName} environment not validated. Call validate() first.`);
      }
      return validated;
    },
  };
}

// Pre-configured validators
export const webEnv = createEnvValidator(webEnvSchema, 'Web');
export const minsideEnv = createEnvValidator(minsideEnvSchema, 'MinSide');
export const backofficeEnv = createEnvValidator(backofficeEnvSchema, 'Backoffice');
export const apiEnv = createEnvValidator(apiEnvSchema, 'API');
