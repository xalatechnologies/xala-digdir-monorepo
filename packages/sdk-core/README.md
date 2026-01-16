# @xala/sdk-core

Schema-agnostic SDK core library providing reusable primitives for API clients.

## Features

- **HTTP Client** - Fetch-based client with timeout, auth, and tenant support
- **RFC 7807 Errors** - Full Problem Details compliance
- **Query Key Factory** - Type-safe React Query cache keys
- **Retry Infrastructure** - Exponential backoff with DLQ support

## Installation

```bash
pnpm add @xala/sdk-core
```

## Usage

### HTTP Client

```typescript
import { initializeClient, getClient } from '@xala/sdk-core';

// Initialize once
initializeClient({
  baseUrl: 'https://api.example.com',
  tenantId: 'tenant-123',
  token: 'jwt-token',
});

// Use anywhere
const users = await getClient().get<User[]>('/api/users');
const created = await getClient().post<User>('/api/users', { name: 'John' });
```

### Error Handling

```typescript
import { ApiError, ProblemDetailsFactory } from '@xala/sdk-core';

try {
  await getClient().get('/api/resource');
} catch (error) {
  if (error instanceof ApiError) {
    if (error.isNotFoundError()) {
      console.log('Resource not found');
    }
    if (error.isValidationError()) {
      const fieldErrors = error.getAllFieldErrors();
      console.log('Validation errors:', fieldErrors);
    }
  }
}
```

### Query Keys

```typescript
import { createQueryKeyFactory } from '@xala/sdk-core';

const userKeys = createQueryKeyFactory<{ page?: number }>('users');

// Usage with React Query
useQuery({
  queryKey: userKeys.list({ page: 1 }),
  queryFn: () => getClient().get('/api/users'),
});

useQuery({
  queryKey: userKeys.detail(userId),
  queryFn: () => getClient().get(`/api/users/${userId}`),
});
```

### Retry with DLQ

```typescript
import { withRetry, CRITICAL_RETRY_POLICY } from '@xala/sdk-core';

const result = await withRetry(
  async (context) => {
    return await getClient().post('/api/payments', { amount: 100 });
  },
  {
    operationType: 'payment',
    operationId: 'order-123',
    policy: CRITICAL_RETRY_POLICY,
    onRetry: (ctx, error) => {
      console.log(`Retry ${ctx.attempt}/${ctx.maxAttempts}: ${error.message}`);
    },
    onDLQ: async (entry) => {
      console.log('Sent to DLQ:', entry.id);
    },
  }
);

if (result.success) {
  console.log('Payment successful:', result.data);
} else {
  console.log('Payment failed:', result.error);
}
```

## API Reference

### HTTP Module

| Export | Description |
|--------|-------------|
| `initializeClient(config)` | Initialize the global client |
| `getClient()` | Get the initialized client |
| `FetchHttpClient` | HTTP client class |
| `ApiClientConfig` | Configuration type |

### Errors Module

| Export | Description |
|--------|-------------|
| `ApiError` | Error class with RFC 7807 support |
| `ProblemDetails` | RFC 7807 interface |
| `ProblemDetailsFactory` | Factory for common errors |

### Query Module

| Export | Description |
|--------|-------------|
| `createQueryKeyFactory(domain)` | Create a key factory |
| `matchQueryKey(key, pattern)` | Check if key matches pattern |

### Retry Module

| Export | Description |
|--------|-------------|
| `withRetry(fn, options)` | Execute with retry logic |
| `DEFAULT_RETRY_POLICY` | Standard retry policy |
| `CRITICAL_RETRY_POLICY` | More retries, longer delays |
| `LIGHT_RETRY_POLICY` | Fewer retries, shorter delays |
| `getDLQEntries()` | Get all DLQ entries |

## License

MIT
