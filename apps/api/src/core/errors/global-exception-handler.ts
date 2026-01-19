/**
 * Global Exception Handler
 * 
 * Handles uncaught exceptions and unhandled promise rejections
 * to prevent API crashes and ensure proper logging/audit trail.
 * 
 * Features:
 * - Process-level error handlers (uncaughtException, unhandledRejection)
 * - Audit logging of all errors
 * - Graceful shutdown on critical errors
 * - Error classification and severity detection
 */

import { logger } from '../logger';

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface ErrorContext {
  correlationId?: string;
  userId?: string;
  tenantId?: string;
  method?: string;
  url?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface ErrorAuditEntry {
  errorType: string;
  errorMessage: string;
  errorStack?: string;
  severity: ErrorSeverity;
  context: ErrorContext;
  timestamp: string;
  recovered: boolean;
}

let isShuttingDown = false;
let shutdownCallback: (() => Promise<void>) | null = null;
let auditErrorCallback: ((entry: ErrorAuditEntry) => Promise<void>) | null = null;

export function classifyErrorSeverity(error: Error): ErrorSeverity {
  const errorName = error.name || error.constructor?.name || 'Error';
  const errorMessage = error.message?.toLowerCase() || '';

  if (
    errorName === 'DatabaseError' ||
    errorMessage.includes('database') ||
    errorMessage.includes('connection refused') ||
    errorMessage.includes('econnrefused') ||
    errorMessage.includes('connection reset') ||
    errorMessage.includes('out of memory') ||
    errorMessage.includes('heap')
  ) {
    return 'critical';
  }

  if (
    errorName === 'TypeError' ||
    errorName === 'ReferenceError' ||
    errorName === 'SyntaxError' ||
    errorMessage.includes('cannot read property') ||
    errorMessage.includes('is not defined') ||
    errorMessage.includes('is not a function')
  ) {
    return 'high';
  }

  if (
    errorMessage.includes('timeout') ||
    errorMessage.includes('rate limit') ||
    errorMessage.includes('too many requests')
  ) {
    return 'medium';
  }

  return 'low';
}

export function isRecoverableError(error: Error): boolean {
  const errorName = error.name || error.constructor?.name || 'Error';
  const errorMessage = error.message?.toLowerCase() || '';

  const unrecoverablePatterns = [
    'out of memory',
    'heap out of memory',
    'maximum call stack',
    'fatal error',
    'cannot allocate memory',
  ];

  for (const pattern of unrecoverablePatterns) {
    if (errorMessage.includes(pattern)) {
      return false;
    }
  }

  const unrecoverableTypes = [
    'RangeError',
  ];

  if (unrecoverableTypes.includes(errorName)) {
    return false;
  }

  return true;
}

export function formatErrorForLogging(error: unknown): {
  name: string;
  message: string;
  stack?: string;
  code?: string;
  cause?: unknown;
} {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
      code: (error as NodeJS.ErrnoException).code,
      cause: error.cause,
    };
  }

  if (typeof error === 'string') {
    return {
      name: 'StringError',
      message: error,
    };
  }

  return {
    name: 'UnknownError',
    message: String(error),
  };
}

async function handleCriticalError(error: Error, source: string): Promise<void> {
  const formattedError = formatErrorForLogging(error);
  const severity = classifyErrorSeverity(error);
  const recoverable = isRecoverableError(error);

  logger.error({
    source,
    ...formattedError,
    severity,
    recoverable,
    timestamp: new Date().toISOString(),
  }, `[CRITICAL] ${source}: ${formattedError.message}`);

  if (auditErrorCallback) {
    try {
      await auditErrorCallback({
        errorType: formattedError.name,
        errorMessage: formattedError.message,
        errorStack: formattedError.stack,
        severity,
        context: {},
        timestamp: new Date().toISOString(),
        recovered: recoverable,
      });
    } catch (auditError) {
      logger.error({ auditError }, 'Failed to audit critical error');
    }
  }

  if (!recoverable && !isShuttingDown) {
    isShuttingDown = true;
    logger.error('Unrecoverable error detected, initiating graceful shutdown...');

    if (shutdownCallback) {
      try {
        await shutdownCallback();
      } catch (shutdownError) {
        logger.error({ shutdownError }, 'Error during shutdown');
      }
    }

    setTimeout(() => {
      process.exit(1);
    }, 5000);
  }
}

export function setupGlobalErrorHandlers(options: {
  onShutdown?: () => Promise<void>;
  onAuditError?: (entry: ErrorAuditEntry) => Promise<void>;
}): void {
  shutdownCallback = options.onShutdown || null;
  auditErrorCallback = options.onAuditError || null;

  process.on('uncaughtException', async (error: Error) => {
    await handleCriticalError(error, 'uncaughtException');
  });

  process.on('unhandledRejection', async (reason: unknown) => {
    const error = reason instanceof Error ? reason : new Error(String(reason));
    await handleCriticalError(error, 'unhandledRejection');
  });

  process.on('warning', (warning) => {
    logger.warn({
      name: warning.name,
      message: warning.message,
      stack: warning.stack,
    }, `[WARNING] ${warning.name}: ${warning.message}`);
  });

  logger.info('Global error handlers registered');
}

export function createErrorAuditEntry(
  error: unknown,
  context: ErrorContext,
  recovered: boolean = true
): ErrorAuditEntry {
  const formattedError = formatErrorForLogging(error);
  const severity = error instanceof Error ? classifyErrorSeverity(error) : 'medium';

  return {
    errorType: formattedError.name,
    errorMessage: formattedError.message,
    errorStack: formattedError.stack,
    severity,
    context,
    timestamp: new Date().toISOString(),
    recovered,
  };
}

export async function safeExecute<T>(
  operation: () => Promise<T>,
  options: {
    context?: ErrorContext;
    fallback?: T;
    rethrow?: boolean;
  } = {}
): Promise<T | undefined> {
  try {
    return await operation();
  } catch (error) {
    const formattedError = formatErrorForLogging(error);
    
    logger.error({
      ...formattedError,
      context: options.context,
    }, `[SAFE_EXECUTE] Error: ${formattedError.message}`);

    if (auditErrorCallback && options.context) {
      try {
        await auditErrorCallback(createErrorAuditEntry(error, options.context, true));
      } catch {
        // Ignore audit errors in safe execute
      }
    }

    if (options.rethrow) {
      throw error;
    }

    return options.fallback;
  }
}

export function wrapHandler<T extends (...args: unknown[]) => Promise<unknown>>(
  handler: T,
  context: Partial<ErrorContext> = {}
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await handler(...args);
    } catch (error) {
      const formattedError = formatErrorForLogging(error);
      
      logger.error({
        ...formattedError,
        context,
      }, `[HANDLER_ERROR] ${formattedError.message}`);

      throw error;
    }
  }) as T;
}
