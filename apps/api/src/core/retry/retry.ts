/**
 * Retry Infrastructure with Dead Letter Queue (DLQ) Support
 * 
 * Provides robust retry mechanisms for external integrations:
 * - Exponential backoff with jitter
 * - Configurable retry policies
 * - Dead Letter Queue for failed operations
 * - Idempotency key support
 * - RFC 7807 error mapping
 * - Audit logging integration
 */

import { getAuditService } from '../audit/audit.service';
import { AppError } from '../errors/problem-details';
import { logger } from '../logger';

// =============================================================================
// Types
// =============================================================================

/**
 * Retry policy configuration
 */
export interface RetryPolicy {
  /** Maximum number of retry attempts */
  maxAttempts: number;
  /** Initial delay in milliseconds */
  initialDelayMs: number;
  /** Maximum delay in milliseconds */
  maxDelayMs: number;
  /** Backoff multiplier (e.g., 2 for exponential backoff) */
  backoffMultiplier: number;
  /** Add random jitter to prevent thundering herd (0-1) */
  jitterFactor: number;
  /** HTTP status codes that should trigger a retry */
  retryableStatuses: number[];
  /** Error types that should trigger a retry */
  retryableErrors: string[];
  /** Whether to use idempotency keys */
  useIdempotencyKey: boolean;
  /** Timeout per attempt in milliseconds */
  timeoutMs: number;
}

/**
 * Retry context for tracking attempt metadata
 */
export interface RetryContext {
  /** Current attempt number (1-indexed) */
  attempt: number;
  /** Total elapsed time since first attempt */
  elapsedMs: number;
  /** Time until next retry (if applicable) */
  nextRetryMs: number | null;
  /** Idempotency key for this operation */
  idempotencyKey: string | null;
  /** Whether this is the final attempt */
  isFinalAttempt: boolean;
}

/**
 * Retry result with success/failure info
 */
export interface RetryResult<T> {
  success: boolean;
  data?: T;
  error?: Error;
  attempts: number;
  totalDurationMs: number;
  idempotencyKey: string | null;
}

/**
 * Dead Letter Queue entry
 */
export interface DLQEntry {
  id: string;
  operationType: string;
  operationId: string;
  payload: unknown;
  error: {
    message: string;
    code: string;
    status?: number;
  };
  attempts: number;
  firstAttemptAt: string;
  lastAttemptAt: string;
  idempotencyKey: string | null;
  tenantId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * DLQ handler for processing failed operations
 */
export type DLQHandler = (entry: DLQEntry) => Promise<void>;

// =============================================================================
// Default Policies
// =============================================================================

/**
 * Default retry policy for external API calls
 */
export const DEFAULT_RETRY_POLICY: RetryPolicy = {
  maxAttempts: 3,
  initialDelayMs: 500,
  maxDelayMs: 30000,
  backoffMultiplier: 2,
  jitterFactor: 0.25,
  retryableStatuses: [408, 429, 500, 502, 503, 504],
  retryableErrors: ['ECONNRESET', 'ETIMEDOUT', 'ECONNREFUSED', 'NETWORK_ERROR'],
  useIdempotencyKey: true,
  timeoutMs: 30000,
};

/**
 * Aggressive retry policy for critical operations
 */
export const CRITICAL_RETRY_POLICY: RetryPolicy = {
  maxAttempts: 5,
  initialDelayMs: 1000,
  maxDelayMs: 60000,
  backoffMultiplier: 2,
  jitterFactor: 0.3,
  retryableStatuses: [408, 429, 500, 502, 503, 504],
  retryableErrors: ['ECONNRESET', 'ETIMEDOUT', 'ECONNREFUSED', 'NETWORK_ERROR'],
  useIdempotencyKey: true,
  timeoutMs: 60000,
};

/**
 * Light retry policy for non-critical operations
 */
export const LIGHT_RETRY_POLICY: RetryPolicy = {
  maxAttempts: 2,
  initialDelayMs: 200,
  maxDelayMs: 5000,
  backoffMultiplier: 2,
  jitterFactor: 0.1,
  retryableStatuses: [429, 503],
  retryableErrors: ['ECONNRESET', 'ETIMEDOUT'],
  useIdempotencyKey: false,
  timeoutMs: 10000,
};

// =============================================================================
// Retry Implementation
// =============================================================================

/**
 * Calculate delay for the next retry with exponential backoff and jitter
 */
export function calculateRetryDelay(
  attempt: number,
  policy: RetryPolicy
): number {
  // Exponential backoff: initialDelay * (multiplier ^ attempt)
  const exponentialDelay = policy.initialDelayMs * Math.pow(policy.backoffMultiplier, attempt - 1);
  
  // Cap at maximum delay
  const cappedDelay = Math.min(exponentialDelay, policy.maxDelayMs);
  
  // Add jitter to prevent thundering herd
  const jitter = cappedDelay * policy.jitterFactor * (Math.random() * 2 - 1);
  
  return Math.max(0, Math.round(cappedDelay + jitter));
}

/**
 * Check if an error is retryable based on policy
 */
export function isRetryableError(
  error: unknown,
  policy: RetryPolicy
): boolean {
  if (!error) return false;
  
  // Check HTTP status codes
  if (error instanceof AppError && policy.retryableStatuses.includes(error.status)) {
    return true;
  }
  
  // Check error codes
  if (error instanceof Error) {
    const errorCode = (error as any).code || (error as any).errno;
    if (errorCode && policy.retryableErrors.includes(errorCode)) {
      return true;
    }
  }
  
  // Check for rate limit headers
  if (error instanceof AppError && error.status === 429) {
    return true;
  }
  
  return false;
}

/**
 * Generate a unique idempotency key
 */
export function generateIdempotencyKey(
  operationType: string,
  operationId: string
): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `${operationType}:${operationId}:${timestamp}:${random}`;
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Execute a function with retry logic
 */
export async function withRetry<T>(
  operation: (context: RetryContext) => Promise<T>,
  options: {
    operationType: string;
    operationId: string;
    policy?: Partial<RetryPolicy>;
    tenantId?: string;
    onRetry?: (context: RetryContext, error: Error) => void;
    onDLQ?: DLQHandler;
    payload?: unknown;
  }
): Promise<RetryResult<T>> {
  const policy: RetryPolicy = { ...DEFAULT_RETRY_POLICY, ...options.policy };
  const startTime = Date.now();
  
  const idempotencyKey = policy.useIdempotencyKey
    ? generateIdempotencyKey(options.operationType, options.operationId)
    : null;
  
  let lastError: Error | undefined;
  
  for (let attempt = 1; attempt <= policy.maxAttempts; attempt++) {
    const elapsedMs = Date.now() - startTime;
    const isFinalAttempt = attempt === policy.maxAttempts;
    const nextRetryMs = isFinalAttempt ? null : calculateRetryDelay(attempt, policy);
    
    const context: RetryContext = {
      attempt,
      elapsedMs,
      nextRetryMs,
      idempotencyKey,
      isFinalAttempt,
    };
    
    try {
      // Execute operation with timeout
      const result = await Promise.race([
        operation(context),
        new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Operation timeout')), policy.timeoutMs);
        }),
      ]);
      
      // Success
      return {
        success: true,
        data: result,
        attempts: attempt,
        totalDurationMs: Date.now() - startTime,
        idempotencyKey,
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      logger.warn(`Retry attempt ${attempt}/${policy.maxAttempts} failed`, {
        operationType: options.operationType,
        operationId: options.operationId,
        error: lastError.message,
        attempt,
        elapsedMs,
      });
      
      // Check if retryable
      if (!isRetryableError(error, policy)) {
        logger.error('Non-retryable error encountered', {
          operationType: options.operationType,
          operationId: options.operationId,
          error: lastError.message,
        });
        break;
      }
      
      // If not final attempt, wait and retry
      if (!isFinalAttempt && nextRetryMs !== null) {
        if (options.onRetry) {
          options.onRetry(context, lastError);
        }
        
        await sleep(nextRetryMs);
      }
    }
  }
  
  // All retries exhausted - send to DLQ
  const totalDurationMs = Date.now() - startTime;
  
  if (options.onDLQ && lastError) {
    const dlqEntry: DLQEntry = {
      id: `dlq-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      operationType: options.operationType,
      operationId: options.operationId,
      payload: options.payload,
      error: {
        message: lastError.message,
        code: (lastError as any).code || 'UNKNOWN',
        status: (lastError as any).status,
      },
      attempts: policy.maxAttempts,
      firstAttemptAt: new Date(startTime).toISOString(),
      lastAttemptAt: new Date().toISOString(),
      idempotencyKey,
      tenantId: options.tenantId,
    };
    
    try {
      await options.onDLQ(dlqEntry);
      logger.info('Operation sent to DLQ', {
        operationType: options.operationType,
        operationId: options.operationId,
        dlqEntryId: dlqEntry.id,
      });
    } catch (dlqError) {
      logger.error('Failed to send to DLQ', {
        operationType: options.operationType,
        operationId: options.operationId,
        dlqError: dlqError instanceof Error ? dlqError.message : String(dlqError),
      });
    }
  }
  
  return {
    success: false,
    error: lastError,
    attempts: policy.maxAttempts,
    totalDurationMs,
    idempotencyKey,
  };
}

// =============================================================================
// Dead Letter Queue Implementation
// =============================================================================

/**
 * In-memory DLQ storage (for development/testing)
 * In production, this would be backed by a persistent store (PostgreSQL, Redis, etc.)
 */
const dlqStore: Map<string, DLQEntry> = new Map();

/**
 * Add entry to DLQ
 */
export async function addToDLQ(entry: DLQEntry): Promise<void> {
  dlqStore.set(entry.id, entry);
  
  // Audit log the DLQ entry
  try {
    const auditService = getAuditService();
    await auditService.logCreate('dlq_entry', entry.id, {
      tenantId: entry.tenantId,
      metadata: {
        operationType: entry.operationType,
        operationId: entry.operationId,
        error: entry.error,
        attempts: entry.attempts,
      },
    });
  } catch (e) {
    logger.warn('Failed to audit log DLQ entry', { error: e });
  }
}

/**
 * Get all DLQ entries
 */
export function getDLQEntries(filter?: {
  operationType?: string;
  tenantId?: string;
  limit?: number;
}): DLQEntry[] {
  let entries = Array.from(dlqStore.values());
  
  if (filter?.operationType) {
    entries = entries.filter(e => e.operationType === filter.operationType);
  }
  
  if (filter?.tenantId) {
    entries = entries.filter(e => e.tenantId === filter.tenantId);
  }
  
  if (filter?.limit) {
    entries = entries.slice(0, filter.limit);
  }
  
  return entries;
}

/**
 * Get DLQ entry by ID
 */
export function getDLQEntry(id: string): DLQEntry | undefined {
  return dlqStore.get(id);
}

/**
 * Remove entry from DLQ (after successful retry or manual resolution)
 */
export function removeDLQEntry(id: string): boolean {
  return dlqStore.delete(id);
}

/**
 * Retry a DLQ entry
 */
export async function retryDLQEntry<T>(
  id: string,
  operation: (payload: unknown) => Promise<T>
): Promise<RetryResult<T> & { dlqRemoved: boolean }> {
  const entry = dlqStore.get(id);
  
  if (!entry) {
    return {
      success: false,
      error: new Error(`DLQ entry not found: ${id}`),
      attempts: 0,
      totalDurationMs: 0,
      idempotencyKey: null,
      dlqRemoved: false,
    };
  }
  
  const result = await withRetry(
    async () => operation(entry.payload),
    {
      operationType: entry.operationType,
      operationId: entry.operationId,
      tenantId: entry.tenantId,
      payload: entry.payload,
    }
  );
  
  if (result.success) {
    dlqStore.delete(id);
  }
  
  return {
    ...result,
    dlqRemoved: result.success,
  };
}

/**
 * Get DLQ statistics
 */
export function getDLQStats(): {
  total: number;
  byOperationType: Record<string, number>;
  byTenant: Record<string, number>;
  oldestEntry: string | null;
} {
  const entries = Array.from(dlqStore.values());
  
  const byOperationType: Record<string, number> = {};
  const byTenant: Record<string, number> = {};
  let oldestTimestamp: string | null = null;
  
  for (const entry of entries) {
    byOperationType[entry.operationType] = (byOperationType[entry.operationType] || 0) + 1;
    
    if (entry.tenantId) {
      byTenant[entry.tenantId] = (byTenant[entry.tenantId] || 0) + 1;
    }
    
    if (!oldestTimestamp || entry.firstAttemptAt < oldestTimestamp) {
      oldestTimestamp = entry.firstAttemptAt;
    }
  }
  
  return {
    total: entries.length,
    byOperationType,
    byTenant,
    oldestEntry: oldestTimestamp,
  };
}

// =============================================================================
// Idempotency Store
// =============================================================================

/**
 * In-memory idempotency store (for development/testing)
 * In production, this would be backed by Redis or a database
 */
interface IdempotencyEntry {
  key: string;
  result: unknown;
  createdAt: number;
  expiresAt: number;
}

const idempotencyStore: Map<string, IdempotencyEntry> = new Map();

/**
 * Store idempotent result
 */
export function storeIdempotentResult<T>(
  key: string,
  result: T,
  ttlMs: number = 24 * 60 * 60 * 1000 // 24 hours default
): void {
  const now = Date.now();
  idempotencyStore.set(key, {
    key,
    result,
    createdAt: now,
    expiresAt: now + ttlMs,
  });
}

/**
 * Get idempotent result
 */
export function getIdempotentResult<T>(key: string): T | undefined {
  const entry = idempotencyStore.get(key);
  
  if (!entry) return undefined;
  
  if (Date.now() > entry.expiresAt) {
    idempotencyStore.delete(key);
    return undefined;
  }
  
  return entry.result as T;
}

/**
 * Check if an idempotency key exists
 */
export function hasIdempotentResult(key: string): boolean {
  return getIdempotentResult(key) !== undefined;
}

/**
 * Clean up expired idempotency entries
 */
export function cleanupIdempotencyStore(): number {
  const now = Date.now();
  let cleaned = 0;
  
  for (const [key, entry] of idempotencyStore) {
    if (now > entry.expiresAt) {
      idempotencyStore.delete(key);
      cleaned++;
    }
  }
  
  return cleaned;
}

// =============================================================================
// Helper: Wrap external API calls with retry
// =============================================================================

/**
 * Convenience wrapper for HTTP fetch with retry
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit & {
    operationType?: string;
    operationId?: string;
    tenantId?: string;
    retryPolicy?: Partial<RetryPolicy>;
    onDLQ?: DLQHandler;
  } = {}
): Promise<Response> {
  const {
    operationType = 'http_request',
    operationId = url,
    tenantId,
    retryPolicy,
    onDLQ,
    ...fetchOptions
  } = options;
  
  const result = await withRetry(
    async (context) => {
      const headers: Record<string, string> = {
        ...(fetchOptions.headers as Record<string, string>),
      };
      
      // Add idempotency key header if available
      if (context.idempotencyKey) {
        headers['Idempotency-Key'] = context.idempotencyKey;
      }
      
      const response = await fetch(url, {
        ...fetchOptions,
        headers,
      });
      
      // Throw error for non-OK responses to trigger retry logic
      if (!response.ok) {
        const error = new AppError(
          `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          `Request to ${url} failed`,
          '/errors/http-error'
        );
        throw error;
      }
      
      return response;
    },
    {
      operationType,
      operationId,
      tenantId,
      policy: retryPolicy,
      onDLQ: onDLQ || addToDLQ,
      payload: { url, options: fetchOptions },
    }
  );
  
  if (!result.success || !result.data) {
    throw result.error || new Error('Request failed after all retries');
  }
  
  return result.data;
}
