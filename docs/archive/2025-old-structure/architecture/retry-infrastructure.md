# Retry Infrastructure & Dead Letter Queue

**Last Updated:** 2026-01-16  
**Status:** Authoritative

---

## Overview

The retry infrastructure provides robust mechanisms for handling transient failures in external integrations. It includes:

- Exponential backoff with jitter
- Configurable retry policies
- Dead Letter Queue (DLQ) for failed operations
- Idempotency key support
- RFC 7807 error integration
- Audit logging integration

---

## Location

```
apps/api/src/core/retry/
├── index.ts       # Public exports
└── retry.ts       # Implementation
```

---

## Quick Start

### Basic Usage

```typescript
import { withRetry } from '../core/retry';

const result = await withRetry(
  async (context) => {
    // Your operation here
    return await externalApi.call();
  },
  {
    operationType: 'external_api_call',
    operationId: 'order-123',
    tenantId: request.tenantId,
  }
);

if (result.success) {
  return result.data;
} else {
  // Handle failure
  console.error('Operation failed after retries:', result.error);
}
```

### HTTP Fetch with Retry

```typescript
import { fetchWithRetry } from '../core/retry';

const response = await fetchWithRetry(
  'https://api.external.com/endpoint',
  {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: { 'Content-Type': 'application/json' },
    operationType: 'payment_capture',
    operationId: `payment-${paymentId}`,
    tenantId: request.tenantId,
  }
);
```

---

## Retry Policies

### Default Policy

```typescript
const DEFAULT_RETRY_POLICY = {
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
```

### Critical Policy

For operations that must succeed:

```typescript
import { CRITICAL_RETRY_POLICY, withRetry } from '../core/retry';

const result = await withRetry(operation, {
  operationType: 'payment',
  operationId: 'payment-123',
  policy: CRITICAL_RETRY_POLICY, // 5 attempts, longer delays
});
```

### Light Policy

For non-critical operations:

```typescript
import { LIGHT_RETRY_POLICY, withRetry } from '../core/retry';

const result = await withRetry(operation, {
  operationType: 'analytics',
  operationId: 'event-456',
  policy: LIGHT_RETRY_POLICY, // 2 attempts, shorter delays
});
```

### Custom Policy

```typescript
const result = await withRetry(operation, {
  operationType: 'sync',
  operationId: 'sync-789',
  policy: {
    maxAttempts: 10,
    initialDelayMs: 1000,
    maxDelayMs: 120000,
    backoffMultiplier: 1.5,
    jitterFactor: 0.3,
    retryableStatuses: [429, 503],
    retryableErrors: ['ECONNRESET'],
    useIdempotencyKey: true,
    timeoutMs: 60000,
  },
});
```

---

## Backoff Algorithm

The delay between retries follows exponential backoff with jitter:

```
delay = min(initialDelay × multiplier^(attempt-1), maxDelay) ± jitter
```

**Example with default policy:**

| Attempt | Base Delay | With Jitter (±25%) |
|---------|------------|-------------------|
| 1 | 500ms | 375-625ms |
| 2 | 1000ms | 750-1250ms |
| 3 | 2000ms | 1500-2500ms |

---

## Dead Letter Queue (DLQ)

Operations that fail after all retries are automatically sent to the DLQ.

### DLQ Entry Structure

```typescript
interface DLQEntry {
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
```

### Custom DLQ Handler

```typescript
const result = await withRetry(operation, {
  operationType: 'webhook',
  operationId: 'webhook-123',
  onDLQ: async (entry) => {
    // Custom handling: send to external queue, notify team, etc.
    await notifySlack(`DLQ entry: ${entry.operationType}/${entry.operationId}`);
    await persistToDatabase(entry);
  },
});
```

### DLQ Management

```typescript
import {
  getDLQEntries,
  getDLQEntry,
  retryDLQEntry,
  removeDLQEntry,
  getDLQStats,
} from '../core/retry';

// List DLQ entries
const entries = getDLQEntries({
  operationType: 'payment',
  tenantId: 'tenant-123',
  limit: 50,
});

// Get statistics
const stats = getDLQStats();
// { total: 5, byOperationType: { payment: 3, webhook: 2 }, ... }

// Retry a failed entry
const result = await retryDLQEntry(entry.id, async (payload) => {
  return await paymentService.capture(payload);
});

if (result.dlqRemoved) {
  console.log('Successfully processed DLQ entry');
}

// Manual removal
removeDLQEntry(entry.id);
```

---

## Idempotency

### Automatic Idempotency Keys

When `useIdempotencyKey: true`, keys are generated automatically:

```typescript
// Generated format: {operationType}:{operationId}:{timestamp}:{random}
// Example: payment:order-123:1705401234567:abc123xyz
```

### Idempotency Store

```typescript
import {
  storeIdempotentResult,
  getIdempotentResult,
  hasIdempotentResult,
  cleanupIdempotencyStore,
} from '../core/retry';

// Store result for idempotency
storeIdempotentResult('payment:order-123', result, 24 * 60 * 60 * 1000);

// Check before processing
const cached = getIdempotentResult('payment:order-123');
if (cached) {
  return cached; // Return cached result
}

// Cleanup expired entries
const cleaned = cleanupIdempotencyStore();
```

---

## Integration Examples

### Vipps Payment Integration

```typescript
async capturePayment(orderId: string, amount: number) {
  return withRetry(
    async (context) => {
      const response = await fetch(vippsUrl, {
        method: 'POST',
        headers: {
          'Idempotency-Key': context.idempotencyKey!,
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ amount }),
      });

      if (!response.ok) {
        throw new AppError(
          'Capture failed',
          response.status,
          await response.text(),
          '/errors/vipps-capture'
        );
      }

      return response.json();
    },
    {
      operationType: 'vipps_capture',
      operationId: orderId,
      tenantId: this.tenantId,
      policy: CRITICAL_RETRY_POLICY,
      payload: { orderId, amount },
      onRetry: (context, error) => {
        logger.warn('Vipps capture retry', {
          orderId,
          attempt: context.attempt,
          error: error.message,
        });
      },
    }
  );
}
```

### Webhook Delivery

```typescript
async deliverWebhook(event: WebhookEvent) {
  return withRetry(
    async () => {
      const response = await fetch(event.targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': sign(event.payload),
        },
        body: JSON.stringify(event.payload),
      });

      if (!response.ok) {
        throw new Error(`Webhook delivery failed: ${response.status}`);
      }

      return { delivered: true };
    },
    {
      operationType: 'webhook_delivery',
      operationId: event.id,
      tenantId: event.tenantId,
      policy: {
        ...DEFAULT_RETRY_POLICY,
        maxAttempts: 5,
        maxDelayMs: 60000,
      },
      payload: event,
      onDLQ: async (entry) => {
        await notificationService.notifyWebhookFailure(entry);
      },
    }
  );
}
```

---

## Error Handling

### Retryable vs Non-Retryable Errors

**Retryable (will retry):**
- HTTP 408 (Request Timeout)
- HTTP 429 (Too Many Requests)
- HTTP 500-504 (Server Errors)
- ECONNRESET, ETIMEDOUT, ECONNREFUSED

**Non-Retryable (will not retry):**
- HTTP 400 (Bad Request)
- HTTP 401 (Unauthorized)
- HTTP 403 (Forbidden)
- HTTP 404 (Not Found)
- Validation errors

### Custom Retryable Check

```typescript
import { isRetryableError, DEFAULT_RETRY_POLICY } from '../core/retry';

// Check if error is retryable
if (isRetryableError(error, DEFAULT_RETRY_POLICY)) {
  // Will be retried
}
```

---

## Monitoring & Observability

### Logging

All retry attempts are logged:

```typescript
// Logged on each retry
logger.warn(`Retry attempt ${attempt}/${maxAttempts} failed`, {
  operationType: 'payment',
  operationId: 'order-123',
  error: 'Connection timeout',
  attempt: 2,
  elapsedMs: 1234,
});

// Logged on DLQ entry
logger.info('Operation sent to DLQ', {
  operationType: 'payment',
  operationId: 'order-123',
  dlqEntryId: 'dlq-abc123',
});
```

### Audit Trail

DLQ entries are automatically audit logged:

```typescript
await auditService.logCreate('dlq_entry', entry.id, {
  tenantId: entry.tenantId,
  metadata: {
    operationType: entry.operationType,
    operationId: entry.operationId,
    error: entry.error,
    attempts: entry.attempts,
  },
});
```

---

## Production Considerations

### Persistent DLQ Storage

The current implementation uses in-memory storage. For production:

```typescript
// TODO: Implement PostgreSQL-backed DLQ
// apps/api/src/core/retry/dlq-postgres.repository.ts

export class PostgresDLQRepository implements DLQRepository {
  async add(entry: DLQEntry): Promise<void> {
    await db.insert(dlqEntries).values(entry);
  }

  async getAll(filter: DLQFilter): Promise<DLQEntry[]> {
    return db.select().from(dlqEntries).where(...);
  }

  async remove(id: string): Promise<boolean> {
    const result = await db.delete(dlqEntries).where(eq(dlqEntries.id, id));
    return result.rowCount > 0;
  }
}
```

### Redis for Idempotency

For distributed systems, use Redis:

```typescript
// TODO: Implement Redis-backed idempotency store
// apps/api/src/core/retry/idempotency-redis.repository.ts

export class RedisIdempotencyStore implements IdempotencyStore {
  async store<T>(key: string, result: T, ttlMs: number): Promise<void> {
    await redis.setex(key, ttlMs / 1000, JSON.stringify(result));
  }

  async get<T>(key: string): Promise<T | undefined> {
    const value = await redis.get(key);
    return value ? JSON.parse(value) : undefined;
  }
}
```

---

## References

- [RFC 7807 - Problem Details](https://tools.ietf.org/html/rfc7807)
- [Exponential Backoff And Jitter](https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/)
- [Integration Retry Model Report](../../reports/INTEGRATION_RETRY_MODEL.md)
- [Vipps Integration](../../apps/api/src/integrations/vipps/)
