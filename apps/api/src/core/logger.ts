/**
 * Pino Logger Configuration
 * Structured logging for production with development-friendly pretty printing
 */
import pino from 'pino';
import type { Logger } from 'pino';

/**
 * Sensitive fields that should be redacted from logs
 * Prevents credential leakage in production logs
 */
const REDACTED_FIELDS = [
  'password',
  'token',
  'accessToken',
  'refreshToken',
  'apiKey',
  'secret',
  'authorization',
  'cookie',
  'sessionId',
  'ssn',
  'creditCard',
  'cvv',
  'pin',
];

/**
 * Create logger instance with environment-specific configuration
 */
function createLogger(): Logger {
  const isDevelopment = process.env.NODE_ENV !== 'production';
  const logLevel = process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info');

  const baseConfig: pino.LoggerOptions = {
    level: logLevel,
    redact: {
      paths: REDACTED_FIELDS,
      censor: '[REDACTED]',
    },
    formatters: {
      level: (label) => {
        return { level: label };
      },
    },
    timestamp: pino.stdTimeFunctions.isoTime,
  };

  // Pretty printing for development
  if (isDevelopment) {
    return pino({
      ...baseConfig,
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname',
          singleLine: false,
        },
      },
    });
  }

  // Structured JSON for production
  return pino(baseConfig);
}

/**
 * Global logger instance
 * Use this throughout the API for structured logging
 */
export const logger = createLogger();

/**
 * Create child logger with additional context
 * @param context - Additional context to include in all log messages
 */
export function createChildLogger(context: Record<string, unknown>): Logger {
  return logger.child(context);
}

/**
 * Export Logger type for dependency injection
 */
export type { Logger };
