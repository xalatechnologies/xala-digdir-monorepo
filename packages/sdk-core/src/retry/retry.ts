/**
 * Retry Infrastructure
 *
 * Schema-agnostic retry mechanism with exponential backoff,
 * jitter, and Dead Letter Queue (DLQ) support.
 */

import { ApiError } from '../errors/api-error';

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
  /** Backoff multiplier */
  backoffMultiplier: number;
  /** Jitter factor (0-1) */
  jitterFactor: number;
  /** HTTP status codes that should trigger a retry */
  retryableStatuses: number[];
  /** Error codes that should trigger a retry */
  retryableErrors: string[];
  /** Request timeout in milliseconds */
  timeoutMs: number;
}

/**
 * Retry context passed to callbacks
 */
export interface RetryContext {
  /** Current attempt number (1-based) */
  attempt: number;
  /** Maximum attempts */
  maxAttempts: number;
  /** Time elapsed since first attempt */
  elapsedMs: number;
  /** Generated idempotency key */
  idempotencyKey?: string;
  /** Operation type */
  operationType: string;
  /** Operation ID */
  operationId: string;
}

/**
 * DLQ entry structure
 */
export interface DLQEntry<T = unknown> {
  /** Unique entry ID */
  id: string;
  /** Operation type */
  operationType: string;
  /** Operation ID */
  operationId: string;
  /** Original payload */
  payload: T;
  /** Error that caused the failure */
  error: {
    message: string;
    code: string;
    status?: number;
  };
  /** Number of attempts made */
  attempts: number;
  /** First attempt timestamp */
  firstAttemptAt: string;
  /** Last attempt timestamp */
  lastAttemptAt: string;
  /** Idempotency key used */
  idempotencyKey: string | null;
  /** Tenant ID if applicable */
  tenantId?: string;
  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Retry options
 */
export interface RetryOptions<T = unknown> {
  /** Operation type for logging/tracking */
  operationType: string;
  /** Operation ID for idempotency */
  operationId: string;
  /** Tenant ID for scoping */
  tenantId?: string;
  /** Retry policy (or preset name) */
  policy?: Partial<RetryPolicy> | 'default' | 'critical' | 'light';
  /** Original payload for DLQ */
  payload?: T;
  /** Callback on each retry attempt */
  onRetry?: (context: RetryContext, error: Error) => void;
  /** Callback when sent to DLQ */
  onDLQ?: (entry: DLQEntry<T>) => Promise<void>;
  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Retry result
 */
export interface RetryResult<T> {
  /** Whether the operation succeeded */
  success: boolean;
  /** Result data if successful */
  data?: T;
  /** Error if failed */
  error?: Error;
  /** Number of attempts made */
  attempts: number;
  /** Whether sent to DLQ */
  dlq?: boolean;
}

/**
 * Default retry policy
 */
export const DEFAULT_RETRY_POLICY: RetryPolicy = {
  maxAttempts: 3,
  initialDelayMs: 500,
  maxDelayMs: 30000,
  backoffMultiplier: 2,
  jitterFactor: 0.25,
  retryableStatuses: [408, 429, 500, 502, 503, 504],
  retryableErrors: ['ECONNRESET', 'ETIMEDOUT', 'ECONNREFUSED', 'NETWORK_ERROR', 'TIMEOUT'],
  timeoutMs: 30000,
};

/**
 * Critical operations policy (more retries, longer delays)
 */
export const CRITICAL_RETRY_POLICY: RetryPolicy = {
  ...DEFAULT_RETRY_POLICY,
  maxAttempts: 5,
  initialDelayMs: 1000,
  maxDelayMs: 60000,
};

/**
 * Light operations policy (fewer retries, shorter delays)
 */
export const LIGHT_RETRY_POLICY: RetryPolicy = {
  ...DEFAULT_RETRY_POLICY,
  maxAttempts: 2,
  initialDelayMs: 200,
  maxDelayMs: 2000,
};

/**
 * In-memory DLQ storage (replace with persistent storage in production)
 */
const dlqStore = new Map<string, DLQEntry>();

/**
 * Generate a unique ID
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

/**
 * Generate an idempotency key
 */
function generateIdempotencyKey(operationType: string, operationId: string): string {
  return `${operationType}:${operationId}:${Date.now()}:${generateId()}`;
}

/**
 * Calculate delay with exponential backoff and jitter
 */
function calculateDelay(
  attempt: number,
  policy: RetryPolicy
): number {
  const exponentialDelay = policy.initialDelayMs * Math.pow(policy.backoffMultiplier, attempt - 1);
  const cappedDelay = Math.min(exponentialDelay, policy.maxDelayMs);

  // Add jitter
  const jitter = cappedDelay * policy.jitterFactor * (Math.random() * 2 - 1);
  return Math.max(0, cappedDelay + jitter);
}

/**
 * Check if an error is retryable
 */
export function isRetryableError(error: Error, policy: RetryPolicy): boolean {
  if (error instanceof ApiError) {
    return policy.retryableStatuses.includes(error.status);
  }

  // Check error code/name
  const errorCode = (error as { code?: string }).code || error.name;
  return policy.retryableErrors.includes(errorCode);
}

/**
 * Resolve retry policy from options
 */
function resolvePolicy(policyOption?: Partial<RetryPolicy> | 'default' | 'critical' | 'light'): RetryPolicy {
  if (!policyOption || policyOption === 'default') {
    return DEFAULT_RETRY_POLICY;
  }
  if (policyOption === 'critical') {
    return CRITICAL_RETRY_POLICY;
  }
  if (policyOption === 'light') {
    return LIGHT_RETRY_POLICY;
  }
  return { ...DEFAULT_RETRY_POLICY, ...policyOption };
}

/**
 * Sleep for a given duration
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Execute an operation with retry logic
 */
export async function withRetry<T>(
  operation: (context: RetryContext) => Promise<T>,
  options: RetryOptions
): Promise<RetryResult<T>> {
  const policy = resolvePolicy(options.policy);
  const idempotencyKey = generateIdempotencyKey(options.operationType, options.operationId);
  const startTime = Date.now();

  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= policy.maxAttempts; attempt++) {
    const context: RetryContext = {
      attempt,
      maxAttempts: policy.maxAttempts,
      elapsedMs: Date.now() - startTime,
      idempotencyKey,
      operationType: options.operationType,
      operationId: options.operationId,
    };

    try {
      const result = await operation(context);
      return {
        success: true,
        data: result,
        attempts: attempt,
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Check if we should retry
      if (attempt < policy.maxAttempts && isRetryableError(lastError, policy)) {
        const delay = calculateDelay(attempt, policy);
        options.onRetry?.(context, lastError);
        await sleep(delay);
      } else {
        break;
      }
    }
  }

  // All retries exhausted - send to DLQ if configured
  if (options.onDLQ && lastError) {
    const dlqEntry: DLQEntry = {
      id: generateId(),
      operationType: options.operationType,
      operationId: options.operationId,
      payload: options.payload,
      error: {
        message: lastError.message,
        code: (lastError as ApiError).code || lastError.name,
        status: (lastError as ApiError).status,
      },
      attempts: policy.maxAttempts,
      firstAttemptAt: new Date(startTime).toISOString(),
      lastAttemptAt: new Date().toISOString(),
      idempotencyKey,
      tenantId: options.tenantId,
      metadata: options.metadata,
    };

    // Store in DLQ
    dlqStore.set(dlqEntry.id, dlqEntry);

    // Call DLQ handler
    await options.onDLQ(dlqEntry);

    return {
      success: false,
      error: lastError,
      attempts: policy.maxAttempts,
      dlq: true,
    };
  }

  return {
    success: false,
    error: lastError,
    attempts: policy.maxAttempts,
  };
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
    entries = entries.filter((e) => e.operationType === filter.operationType);
  }

  if (filter?.tenantId) {
    entries = entries.filter((e) => e.tenantId === filter.tenantId);
  }

  if (filter?.limit) {
    entries = entries.slice(0, filter.limit);
  }

  return entries;
}

/**
 * Get a specific DLQ entry
 */
export function getDLQEntry(id: string): DLQEntry | undefined {
  return dlqStore.get(id);
}

/**
 * Remove a DLQ entry
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
): Promise<RetryResult<T> & { dlqRemoved?: boolean }> {
  const entry = dlqStore.get(id);
  if (!entry) {
    return {
      success: false,
      error: new Error(`DLQ entry ${id} not found`),
      attempts: 0,
    };
  }

  try {
    const result = await operation(entry.payload);
    dlqStore.delete(id);
    return {
      success: true,
      data: result,
      attempts: 1,
      dlqRemoved: true,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error : new Error(String(error)),
      attempts: 1,
    };
  }
}

/**
 * Get DLQ statistics
 */
export function getDLQStats(): {
  total: number;
  byOperationType: Record<string, number>;
  byTenant: Record<string, number>;
} {
  const entries = Array.from(dlqStore.values());

  const byOperationType: Record<string, number> = {};
  const byTenant: Record<string, number> = {};

  for (const entry of entries) {
    byOperationType[entry.operationType] = (byOperationType[entry.operationType] || 0) + 1;
    if (entry.tenantId) {
      byTenant[entry.tenantId] = (byTenant[entry.tenantId] || 0) + 1;
    }
  }

  return {
    total: entries.length,
    byOperationType,
    byTenant,
  };
}

/**
 * Clear all DLQ entries (for testing)
 */
export function clearDLQ(): void {
  dlqStore.clear();
}
