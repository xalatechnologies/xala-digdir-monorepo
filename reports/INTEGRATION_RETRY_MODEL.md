# Integration Retry Model Inventory

**Date:** 2026-01-16
**Purpose:** Document retry strategies, idempotency, and failure handling for all external integrations

---

## 1. Current Integrations

### 1.1 Vipps Payment Integration

**Location:** `apps/api/src/integrations/vipps/`

| Component | File | Status |
|-----------|------|--------|
| VippsClient | `vipps.client.ts` | ✅ Core HTTP client |
| VippsCheckoutService | `vipps-checkout.service.ts` | ✅ Payment sessions |
| VippsLoginService | `vipps-login.service.ts` | ✅ OAuth flow |

#### Idempotency ✅ Implemented

```typescript
// vipps-checkout.service.ts:188
const response = await this.client.post<VippsCheckoutSessionResponse>(
  this.endpoints.checkoutSession,
  vippsRequest,
  { idempotencyKey: reference }  // ✅ Idempotency key
);
```

#### Token Caching ✅ Implemented

```typescript
// vipps.client.ts:52-100
let cachedToken: VippsAccessToken | null = null;

async function getAccessToken(config, endpoints): Promise<string> {
  const now = Date.now();
  
  // Return cached token if still valid (with 60s buffer)
  if (cachedToken && cachedToken.expiresAt > now + 60000) {
    return cachedToken.accessToken;
  }
  // ... fetch new token
}
```

#### Retry Strategy ❌ Missing

**Current State:**
- No exponential backoff
- No retry count limit
- No jitter
- Single attempt only

**Required Implementation:**

```typescript
// RECOMMENDED: Add to vipps.client.ts
interface RetryConfig {
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
  retryableStatuses: number[];
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  baseDelayMs: 1000,
  maxDelayMs: 30000,
  retryableStatuses: [408, 429, 500, 502, 503, 504],
};

async function withRetry<T>(
  operation: () => Promise<T>,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      if (attempt === config.maxAttempts) break;
      if (!isRetryable(error, config.retryableStatuses)) throw error;
      
      const delay = calculateBackoff(attempt, config);
      await sleep(delay);
    }
  }
  
  throw lastError;
}

function calculateBackoff(attempt: number, config: RetryConfig): number {
  const exponentialDelay = config.baseDelayMs * Math.pow(2, attempt - 1);
  const jitter = Math.random() * 0.3 * exponentialDelay; // 30% jitter
  return Math.min(exponentialDelay + jitter, config.maxDelayMs);
}
```

#### DLQ/Failed State ❌ Missing

**Required:** Failed payment table for manual review/retry

```sql
-- RECOMMENDED: Add migration
CREATE TABLE failed_integration_calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  integration_type VARCHAR(50) NOT NULL,
  operation VARCHAR(100) NOT NULL,
  payload JSONB NOT NULL,
  error_message TEXT,
  error_code VARCHAR(50),
  attempt_count INTEGER DEFAULT 1,
  last_attempt_at TIMESTAMPTZ DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'pending', -- pending, retrying, failed, resolved
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_failed_calls_status ON failed_integration_calls(status);
CREATE INDEX idx_failed_calls_tenant ON failed_integration_calls(tenant_id);
```

---

### 1.2 Notification System

**Location:** `apps/api/src/modules/notification-system/`

| Component | File | Status |
|-----------|------|--------|
| NotificationService | `notification.service.ts` | ✅ Core service |
| NotificationRepository | `notification.repository.ts` | ✅ Persistence |
| DeliveryService | `../notifications/delivery.service.ts` | ✅ Multi-channel |

#### Retry Strategy ⚠️ Partial

```typescript
// notification.types.ts - Has retry tracking
interface NotificationDelivery {
  retryCount: number;
  maxRetries: number;
  lastError?: string;
  nextRetryAt?: Date;
}
```

**Implemented:**
- ✅ Retry count tracking
- ✅ Max retries limit
- ⚠️ Backoff strategy unclear
- ❌ DLQ for permanently failed notifications

---

## 2. Recommended Retry Standards

### 2.1 Retry Configuration Per Integration

| Integration | Max Attempts | Base Delay | Max Delay | Retryable Codes |
|-------------|--------------|------------|-----------|-----------------|
| Vipps Payment | 3 | 1000ms | 30s | 408, 429, 500, 502, 503, 504 |
| Vipps Login | 2 | 500ms | 5s | 408, 429, 500, 502, 503 |
| Email (SMTP) | 5 | 2000ms | 60s | Connection errors |
| SMS | 3 | 1000ms | 30s | Gateway errors |
| Push (FCM) | 3 | 1000ms | 10s | 500, 502, 503 |

### 2.2 Backoff Formula

```
delay = min(baseDelay * 2^(attempt-1) + jitter, maxDelay)
jitter = random(0, 0.3 * exponentialDelay)
```

### 2.3 Idempotency Requirements

| Operation Type | Idempotency Key Source |
|----------------|------------------------|
| Payment Creation | Booking ID + Timestamp |
| Notification Send | Notification ID |
| Webhook Delivery | Event ID |
| Calendar Sync | Sync Job ID |

---

## 3. DLQ Implementation Plan

### 3.1 Database Schema

Already partially defined in notification system:

```typescript
// notification.repository.ts
interface FailedNotification {
  id: string;
  tenantId: string;
  notificationId: string;
  channel: 'email' | 'sms' | 'push' | 'in_app';
  error: string;
  attemptCount: number;
  lastAttemptAt: Date;
  status: 'pending' | 'retrying' | 'permanently_failed' | 'resolved';
}
```

### 3.2 Required: Generic Failed Operations Table

```typescript
// RECOMMENDED: apps/api/src/database/schema/failed-operations.ts
export const failedOperations = pgTable('failed_operations', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  operationType: varchar('operation_type', { length: 100 }).notNull(),
  operationId: varchar('operation_id', { length: 100 }),
  integrationName: varchar('integration_name', { length: 50 }).notNull(),
  payload: jsonb('payload').notNull(),
  errorMessage: text('error_message'),
  errorCode: varchar('error_code', { length: 50 }),
  attemptCount: integer('attempt_count').default(1),
  maxAttempts: integer('max_attempts').default(3),
  lastAttemptAt: timestamp('last_attempt_at').defaultNow(),
  nextRetryAt: timestamp('next_retry_at'),
  status: varchar('status', { length: 20 }).default('pending'),
  resolvedAt: timestamp('resolved_at'),
  resolvedBy: uuid('resolved_by'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
```

### 3.3 Background Retry Worker

```typescript
// RECOMMENDED: apps/api/src/jobs/retry-failed-operations.ts
async function processFailedOperations(): Promise<void> {
  const pendingOperations = await db
    .select()
    .from(failedOperations)
    .where(
      and(
        eq(failedOperations.status, 'pending'),
        lt(failedOperations.nextRetryAt, new Date()),
        lt(failedOperations.attemptCount, failedOperations.maxAttempts)
      )
    )
    .limit(100);

  for (const op of pendingOperations) {
    try {
      await retryOperation(op);
      await markResolved(op.id);
    } catch (error) {
      await incrementAttempt(op.id, error);
      
      if (op.attemptCount + 1 >= op.maxAttempts) {
        await markPermanentlyFailed(op.id);
        await alertOperations(op); // Notify admin
      }
    }
  }
}
```

---

## 4. Secrets Handling

### 4.1 Current State

| Secret | Storage | Exposure Risk |
|--------|---------|---------------|
| Vipps Client Secret | Environment variable | ⚠️ In request headers |
| Vipps Subscription Key | Environment variable | ⚠️ In request headers |
| JWT Secret | Environment variable | ✅ Not exposed |
| Database URL | Environment variable | ✅ Not exposed |

### 4.2 Required: Secrets Redaction

```typescript
// RECOMMENDED: Add to logger middleware
const SENSITIVE_PATTERNS = [
  /client_secret[=:]["']?[\w-]+/gi,
  /access_token[=:]["']?[\w.-]+/gi,
  /bearer [\w.-]+/gi,
  /authorization[=:]["']?[\w.-]+/gi,
];

function redactSecrets(message: string): string {
  let redacted = message;
  for (const pattern of SENSITIVE_PATTERNS) {
    redacted = redacted.replace(pattern, '[REDACTED]');
  }
  return redacted;
}
```

---

## 5. Implementation Priority

### Immediate (P0)
1. Add retry with backoff to VippsClient
2. Add failed operations table migration
3. Add secrets redaction to logging

### Short-term (P1)
1. Implement background retry worker
2. Add admin dashboard for failed operations
3. Add alerting for permanently failed operations

### Medium-term (P2)
1. Standardize retry across all integrations
2. Add circuit breaker pattern
3. Add health checks for external services

---

## 6. Testing Requirements

```typescript
// tests/integration/retry-model.test.ts
describe('Integration Retry Model', () => {
  it('should retry on transient failures with exponential backoff', async () => {
    // Mock 500 responses then success
  });
  
  it('should not retry on client errors (4xx)', async () => {
    // Mock 400/401/403 responses
  });
  
  it('should respect max retry attempts', async () => {
    // Mock continuous failures
  });
  
  it('should store failed operations in DLQ', async () => {
    // Verify database entry after max retries
  });
  
  it('should use idempotency keys for payment operations', async () => {
    // Verify same key produces same result
  });
});
```

---

**Status:** Documentation complete. Implementation pending.
