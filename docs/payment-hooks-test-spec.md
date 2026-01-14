# Payment Hooks - Unit Test Specification

## Overview

This document specifies unit tests for payment integration hooks in `packages/client-sdk/src/hooks/use-integrations.ts`.

**Status:** Specification complete, implementation pending
**Framework:** Vitest + @testing-library/react
**Test Count:** 25 test cases

## Setup Requirements

### Dependencies

```json
{
  "devDependencies": {
    "@testing-library/react": "^14.0.0",
    "@testing-library/react-hooks": "^8.0.1",
    "vitest": "^3.0.4",
    "react": "^18.0.0",
    "@tanstack/react-query": "^5.0.0"
  }
}
```

### Test Setup

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Create wrapper with QueryClient
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

## Test Suites

### 1. useInitiatePayment() - Error Scenarios (7 tests)

#### Test 1.1: Network timeout during payment initiation
**Description:** Verify hook handles network timeout gracefully

**Setup:**
```typescript
vi.spyOn(vippsService, 'initiatePayment')
  .mockRejectedValueOnce(new Error('Request timeout'));
```

**Test:**
```typescript
const { result } = renderHook(() => useInitiatePayment(), { wrapper });

result.current.mutate({
  bookingId: 'booking-123',
  amount: 500,
  currency: 'NOK',
  description: 'Test',
  returnUrl: 'http://localhost/callback',
});

await waitFor(() => {
  expect(result.current.isError).toBe(true);
  expect(result.current.error.message).toContain('timeout');
});
```

**Expected:** Error state with timeout error

#### Test 1.2: Invalid payment amount (negative)
**Description:** Verify validation error for negative amount

**Setup:**
```typescript
vi.spyOn(vippsService, 'initiatePayment')
  .mockRejectedValueOnce({
    type: 'validation_error',
    title: 'Invalid payment amount',
    status: 400,
    detail: 'Payment amount must be positive',
  });
```

**Test:** Same pattern as 1.1 with `amount: -100`

**Expected:** Error with status 400 and validation message

#### Test 1.3: Invalid payment amount (zero)
**Description:** Verify validation error for zero amount

**Expected:** Error with status 400

#### Test 1.4: Missing required fields (bookingId)
**Description:** Verify validation error for missing bookingId

**Test:** Mutate with `bookingId: ''`

**Expected:** Error with status 400

#### Test 1.5: Vipps API rate limiting (429)
**Description:** Verify handling of rate limit errors

**Setup:**
```typescript
mockRejectedValueOnce({
  type: 'rate_limit_error',
  title: 'Too many requests',
  status: 429,
  detail: 'Rate limit exceeded',
});
```

**Expected:** Error with status 429

#### Test 1.6: Duplicate payment initiation (409)
**Description:** Verify handling of duplicate payment attempts

**Setup:**
```typescript
mockRejectedValueOnce({
  type: 'duplicate_error',
  title: 'Payment already initiated',
  status: 409,
  detail: 'A payment for this booking already exists',
});
```

**Expected:** Error with status 409 and duplicate message

#### Test 1.7: Vipps service unavailable (503)
**Description:** Verify handling of service downtime

**Setup:**
```typescript
mockRejectedValueOnce({
  type: 'service_unavailable',
  title: 'Service temporarily unavailable',
  status: 503,
});
```

**Expected:** Error with status 503

### 2. useVippsPayment() - Callback Error Scenarios (5 tests)

#### Test 2.1: Payment timeout (EXPIRED status)
**Description:** Verify handling of expired payment sessions

**Setup:**
```typescript
vi.spyOn(vippsService, 'getPaymentStatus').mockResolvedValueOnce({
  success: true,
  data: {
    orderId: 'order-timeout',
    status: 'EXPIRED',
    errorMessage: 'Payment session expired after 10 minutes',
  },
});
```

**Test:**
```typescript
const { result } = renderHook(() => useVippsPayment('order-timeout'), { wrapper });

await waitFor(() => {
  expect(result.current.isSuccess).toBe(true);
  expect(result.current.data?.data?.status).toBe('EXPIRED');
});
```

**Expected:** Success with EXPIRED status and error message

#### Test 2.2: User cancelled payment (CANCELLED status)
**Description:** Verify handling of user cancellation

**Setup:** Mock with `status: 'CANCELLED'`

**Expected:** Success with CANCELLED status

#### Test 2.3: Payment declined by bank (FAILED status)
**Description:** Verify handling of payment decline

**Setup:** Mock with `status: 'FAILED'` and decline reason

**Expected:** Success with FAILED status and reason

#### Test 2.4: Invalid order ID (404)
**Description:** Verify handling of non-existent order

**Setup:**
```typescript
mockRejectedValueOnce({
  type: 'not_found',
  title: 'Payment not found',
  status: 404,
});
```

**Expected:** Error with status 404

#### Test 2.5: Network error during status check
**Description:** Verify handling of network failures

**Setup:** Mock with network error

**Expected:** Error state with network error

### 3. useRefundPayment() - Error Scenarios (6 tests)

#### Test 3.1: Refund amount exceeding payment amount
**Description:** Verify validation of refund amount

**Setup:**
```typescript
mockRejectedValueOnce({
  type: 'validation_error',
  title: 'Invalid refund amount',
  status: 400,
  detail: 'Refund amount exceeds original payment amount',
});
```

**Test:**
```typescript
const { result } = renderHook(() => useRefundPayment(), { wrapper });

result.current.mutate({
  orderId: 'order-123',
  amount: 1000, // Original was 500
  reason: 'Customer request',
});
```

**Expected:** Error with status 400 and exceeds message

#### Test 3.2: Refund of already refunded payment (409)
**Description:** Verify handling of duplicate refund

**Expected:** Error with status 409

#### Test 3.3: Refund timeout from Vipps
**Description:** Verify handling of timeout during refund

**Expected:** Timeout error

#### Test 3.4: Refund of uncaptured payment
**Description:** Verify validation that payment must be captured first

**Expected:** Error with status 400 and captured message

#### Test 3.5: Insufficient funds for refund (402)
**Description:** Verify handling of insufficient merchant balance

**Expected:** Error with status 402

#### Test 3.6: Missing refund reason
**Description:** Verify validation of required reason field

**Test:** Mutate with `reason: ''`

**Expected:** Validation error

### 4. useCapturePayment() - Error Scenarios (5 tests)

#### Test 4.1: Capture amount exceeding authorized amount
**Description:** Verify validation of capture amount

**Expected:** Error with status 400 and exceeds message

#### Test 4.2: Capture of already captured payment (409)
**Description:** Verify handling of duplicate capture

**Expected:** Error with status 409

#### Test 4.3: Capture of expired authorization
**Description:** Verify handling of expired auth (typically 7 days)

**Expected:** Error with status 400 and expired message

#### Test 4.4: Capture of cancelled payment
**Description:** Verify handling of invalid state

**Expected:** Error with status 400 and cancelled message

#### Test 4.5: Network error during capture
**Description:** Verify handling of network failures

**Expected:** Network error

### 5. useVippsPaymentHistory() - Error Scenarios (2 tests)

#### Test 5.1: Payment history for non-existent booking (404)
**Description:** Verify handling of invalid booking ID

**Test:**
```typescript
const { result } = renderHook(
  () => useVippsPaymentHistory('non-existent'),
  { wrapper }
);

await waitFor(() => {
  expect(result.current.isError).toBe(true);
  expect(result.current.error).toMatchObject({ status: 404 });
});
```

**Expected:** Error with status 404

#### Test 5.2: Unauthorized access to payment history (401)
**Description:** Verify handling of unauthorized access

**Expected:** Error with status 401

## Test Implementation Checklist

- [ ] Install @testing-library/react dependency
- [ ] Create test file: `packages/client-sdk/src/hooks/use-integrations.test.ts`
- [ ] Implement test setup with QueryClient wrapper
- [ ] Implement all 25 test cases
- [ ] Run tests: `pnpm test use-integrations.test.ts`
- [ ] Verify 100% passing
- [ ] Add to CI/CD pipeline

## Running Tests

```bash
# From project root
cd packages/client-sdk

# Install dependencies (if needed)
pnpm add -D @testing-library/react @testing-library/react-hooks

# Run all tests
pnpm test

# Run only payment hook tests
pnpm test use-integrations.test.ts

# Run with coverage
pnpm test:coverage

# Run in watch mode
pnpm test:watch
```

## Expected Results

All 25 tests should pass:

```
✅ PASS  packages/client-sdk/src/hooks/use-integrations.test.ts
  useInitiatePayment - Error Scenarios (7)
  useVippsPayment - Callback Error Scenarios (5)
  useRefundPayment - Error Scenarios (6)
  useCapturePayment - Error Scenarios (5)
  useVippsPaymentHistory - Error Scenarios (2)

Test Suites: 1 passed, 1 total
Tests:       25 passed, 25 total
Time:        2.5s
```

## Notes

- These tests use mocked service responses to avoid real API calls
- All errors follow RFC 7807 Problem Details format
- Tests verify both error state and error details
- Network errors are tested separately from API errors
- Each hook is tested in isolation

## Related Documentation

- [Payment Error Handling](./payment-error-handling.md)
- [E2E Test Specification](./payment-error-testing-summary.md)
- [SDK Documentation](../packages/client-sdk/README.md)
