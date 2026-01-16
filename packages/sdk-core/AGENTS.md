# @xala/sdk-core - AGENTS.md

Guidance for agentic coding assistants working with the SDK Core package.

## Package Overview

`@xala/sdk-core` provides **schema-agnostic SDK primitives** that never mention domain concepts (listings, bookings, etc.). This package is the foundation layer for `@digilist/client-sdk`.

## Module Structure

```
packages/sdk-core/
├── src/
│   ├── errors/           # RFC 7807 error handling
│   │   ├── problem-details.ts  # ProblemDetails interface
│   │   ├── api-error.ts        # ApiError class
│   │   └── index.ts
│   ├── http/             # Generic HTTP client
│   │   ├── types.ts            # IHttpClient interface
│   │   ├── fetch-client.ts     # Browser fetch implementation
│   │   ├── client-factory.ts   # Singleton client management
│   │   └── index.ts
│   ├── query/            # React Query utilities
│   │   ├── query-key-factory.ts # Type-safe query keys
│   │   └── index.ts
│   ├── retry/            # Retry infrastructure
│   │   ├── retry.ts            # withRetry, policies, DLQ
│   │   └── index.ts
│   └── index.ts
├── __tests__/            # Unit tests
├── package.json
├── tsup.config.ts
└── vitest.config.ts
```

## Essential Commands

```bash
# Build package
pnpm build

# Run tests
pnpm test

# Type check
pnpm typecheck

# Watch mode
pnpm dev
```

## Key Exports

### /errors
- `ProblemDetails` - RFC 7807 interface
- `ApiError` - Error class with status checks and field error extraction

### /http
- `IHttpClient` - Generic HTTP client interface
- `FetchHttpClient` - Browser fetch implementation
- `initializeClient()`, `getClient()` - Client factory

### /query
- `createQueryKeyFactory()` - Type-safe query key factory
- `mergeQueryKeyFactories()` - Combine factories
- `matchQueryKey()` - Cache key pattern matching

### /retry
- `withRetry()` - Generic retry with exponential backoff
- `DEFAULT_RETRY_POLICY`, `CRITICAL_RETRY_POLICY` - Pre-defined policies
- `getDLQEntries()`, `getDLQStats()` - Dead Letter Queue management

## Code Style Guidelines

### No Domain Concepts
```typescript
// ❌ WRONG - Domain-specific
interface BookingRetryOptions { ... }

// ✅ CORRECT - Generic
interface RetryOptions<T> { ... }
```

### RFC 7807 Compliance
All errors MUST use the ApiError class with proper ProblemDetails:
```typescript
throw new ApiError({
  type: '/errors/validation',
  title: 'Validation Error',
  status: 422,
  detail: 'Invalid email format',
  errors: [{ field: 'email', message: 'Invalid format' }],
});
```

### Test Coverage
- All public APIs must have unit tests
- Tests located in `src/__tests__/`
- Use Vitest for testing

## Integration with @digilist/client-sdk

```typescript
// In @digilist/client-sdk
import { initializeClient, ApiError } from '@xala/sdk-core';
import { createQueryKeyFactory } from '@xala/sdk-core/query';
import { withRetry } from '@xala/sdk-core/retry';
```

## When Modifying This Package

1. **Never add domain-specific code** - Keep it generic
2. **Maintain backward compatibility** - SDK depends on this
3. **Update tests** - All changes need tests
4. **Rebuild SDK** - Run `pnpm --filter @digilist/client-sdk build` after changes
