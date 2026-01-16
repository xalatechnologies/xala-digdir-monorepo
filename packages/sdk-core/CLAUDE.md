# @xala/sdk-core - CLAUDE.md

This file provides guidance to Claude Code when working with the SDK Core package.

---

## Package Purpose

`@xala/sdk-core` is the **generic foundation layer** for the Xala SDK ecosystem. It provides schema-agnostic utilities that can be used by any SDK without coupling to specific domain models.

**Key Principle**: This package knows NOTHING about listings, bookings, users, or any domain concept. It only provides generic HTTP, error handling, caching, and retry infrastructure.

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│         @digilist/client-sdk (Domain)           │
│  - Booking hooks, Listing services, etc.        │
├─────────────────────────────────────────────────┤
│           @xala/contracts (Types)               │
│  - Zod schemas, Projections, TypeScript types   │
├─────────────────────────────────────────────────┤
│            @xala/sdk-core (This Package)        │
│  - HTTP client, Errors, Retry, Query keys       │
└─────────────────────────────────────────────────┘
```

---

## Module Reference

### /errors - RFC 7807 Error Handling

**ProblemDetails Interface**:
```typescript
interface ProblemDetails {
  type: string;        // URI identifying error type
  title: string;       // Human-readable summary
  status: number;      // HTTP status code
  detail?: string;     // Detailed explanation
  instance?: string;   // URI of specific occurrence
  correlationId?: string;
  timestamp?: string;
  errors?: FieldError[];
}
```

**ApiError Class**:
```typescript
// From ProblemDetails
const error = new ApiError({
  type: '/errors/not-found',
  title: 'Not Found',
  status: 404,
  detail: 'User not found',
});

// From message
const error = new ApiError('Something went wrong', 'INTERNAL_ERROR', 500);

// Status checks
error.isValidationError();  // 400, 422
error.isAuthError();        // 401
error.isForbiddenError();   // 403
error.isNotFoundError();    // 404
error.isServerError();      // 5xx
error.isRetryable();        // 408, 429, 5xx

// Field errors
error.getFieldErrors('email');  // string[]
error.getAllFieldErrors();      // Record<string, string[]>

// Factory methods
ApiError.network('Connection refused');
ApiError.timeout();
```

### /http - Generic HTTP Client

**Client Interface**:
```typescript
interface IHttpClient {
  get<T>(url: string, options?: RequestOptions): Promise<T>;
  post<T>(url: string, body: RequestBody, options?: RequestOptions): Promise<T>;
  put<T>(url: string, body: RequestBody, options?: RequestOptions): Promise<T>;
  patch<T>(url: string, body: RequestBody, options?: RequestOptions): Promise<T>;
  delete<T>(url: string, options?: RequestOptions): Promise<T>;
}
```

**Initialization**:
```typescript
import { initializeClient, getClient } from '@xala/sdk-core/http';

// Initialize once at app startup
initializeClient({
  baseUrl: 'https://api.example.com',
  defaultHeaders: { 'X-Tenant-Id': 'tenant-123' },
  timeout: 30000,
});

// Get client anywhere
const client = getClient();
const data = await client.get('/api/users');
```

### /query - Query Key Factory

**Create Factory**:
```typescript
import { createQueryKeyFactory } from '@xala/sdk-core/query';

const userKeys = createQueryKeyFactory<{ role?: string }>('users');

userKeys.all();              // ['users']
userKeys.lists();            // ['users', 'list']
userKeys.list({ role: 'admin' });  // ['users', 'list', { role: 'admin' }]
userKeys.details();          // ['users', 'detail']
userKeys.detail('123');      // ['users', 'detail', '123']
userKeys.sub('permissions'); // ['users', 'permissions']
```

**Pattern Matching**:
```typescript
import { matchQueryKey } from '@xala/sdk-core/query';

matchQueryKey(['users', 'list', { page: 1 }], ['users']);        // true
matchQueryKey(['users', 'detail', '123'], ['users', 'detail']);  // true
matchQueryKey(['users'], ['bookings']);                          // false
```

### /retry - Retry Infrastructure

**Basic Retry**:
```typescript
import { withRetry, DEFAULT_RETRY_POLICY } from '@xala/sdk-core/retry';

const result = await withRetry(
  async (context) => {
    return await fetchData();
  },
  {
    operationType: 'payment',
    operationId: 'order-123',
    tenantId: 'tenant-1',
    payload: { amount: 100 },
    onRetry: (context, error) => {
      console.log(`Retry attempt ${context.attempt}`);
    },
    onDLQ: async (entry) => {
      // Send to dead letter queue
      await sendToQueue(entry);
    },
  }
);

if (result.success) {
  console.log('Success:', result.data);
} else {
  console.log('Failed after', result.attempts, 'attempts');
  if (result.dlq) {
    console.log('Sent to DLQ');
  }
}
```

**Retry Policies**:
```typescript
// Default: 3 attempts, 500ms initial delay
DEFAULT_RETRY_POLICY

// Critical: 5 attempts, 1000ms initial delay
CRITICAL_RETRY_POLICY

// Light: 2 attempts, 200ms initial delay
LIGHT_RETRY_POLICY

// Custom
const customPolicy = {
  ...DEFAULT_RETRY_POLICY,
  maxAttempts: 10,
  initialDelayMs: 100,
};
```

**DLQ Management**:
```typescript
import { getDLQEntries, getDLQStats, clearDLQ } from '@xala/sdk-core/retry';

const entries = getDLQEntries({ operationType: 'payment' });
const stats = getDLQStats();
// { total, byOperationType, byTenant }
```

---

## Testing

```bash
# Run all tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage
pnpm test:coverage
```

Tests are in `src/__tests__/`:
- `api-error.test.ts` - Error class tests
- `retry.test.ts` - Retry infrastructure tests  
- `query-key-factory.test.ts` - Query key tests

---

## Non-Negotiable Rules

1. **NO DOMAIN CONCEPTS** - This package is schema-agnostic
2. **RFC 7807 COMPLIANCE** - All errors use ProblemDetails
3. **FULL TEST COVERAGE** - All exports have tests
4. **BACKWARD COMPATIBLE** - Don't break @digilist/client-sdk

---

## Dependencies

- No runtime dependencies (pure TypeScript)
- Peer dependency on `@tanstack/react-query` (optional, for query keys)
- Dev dependencies: tsup, typescript, vitest
