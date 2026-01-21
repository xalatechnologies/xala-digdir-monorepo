# Runbook: Add New SDK Service

> **Step-by-step guide for adding a new service to the SDK**
> **Layer:** Runbooks

---

## Prerequisites

- [ ] API endpoint exists and is documented
- [ ] Contract types exist in `@digilist/domain`
- [ ] Understand which layer owns this service (Platform vs Domain)

---

## Decision: Platform or Domain?

| If the service... | It belongs in... |
|-------------------|------------------|
| Manages auth, tenants, config | `@xalatechnologies/platform/sdk` |
| Manages domain entities (bookings, rentals) | `@digilist/sdk` |
| Is generic infrastructure | Platform |
| Is business-specific | Domain |

---

## Step 1: Define Contract Types

**Location:** `packages/digilist-domain/src/contracts/` or `packages/contracts/src/`

```typescript
// packages/digilist-domain/src/contracts/review.ts
import { z } from 'zod';

export const ReviewSchema = z.object({
  id: z.string().uuid(),
  rentalObjectId: z.string().uuid(),
  userId: z.string().uuid(),
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
  createdAt: z.string().datetime(),
});

export type ReviewDTO = z.infer<typeof ReviewSchema>;

export const CreateReviewSchema = z.object({
  rentalObjectId: z.string().uuid(),
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
});

export type CreateReviewInput = z.infer<typeof CreateReviewSchema>;
```

---

## Step 2: Create Service Class

**Location:** `packages/client-sdk/src/services/`

```typescript
// packages/client-sdk/src/services/review.service.ts
import { BaseService } from '@xalatechnologies/platform/sdk';
import type { ReviewDTO, CreateReviewInput } from '@digilist/domain';

export interface ReviewListParams {
  rentalObjectId?: string;
  userId?: string;
  minRating?: number;
  limit?: number;
  offset?: number;
}

class ReviewService extends BaseService {
  /**
   * List reviews with optional filters
   */
  async list(params?: ReviewListParams): Promise<ReviewDTO[]> {
    return this.get('/api/domain/reviews', { params });
  }

  /**
   * Get a single review by ID
   */
  async get(id: string): Promise<ReviewDTO> {
    return this.get(`/api/domain/reviews/${id}`);
  }

  /**
   * Create a new review
   */
  async create(data: CreateReviewInput): Promise<ReviewDTO> {
    return this.post('/api/domain/reviews', data);
  }

  /**
   * Update an existing review
   */
  async update(id: string, data: Partial<CreateReviewInput>): Promise<ReviewDTO> {
    return this.patch(`/api/domain/reviews/${id}`, data);
  }

  /**
   * Delete a review
   */
  async delete(id: string): Promise<void> {
    return this.delete(`/api/domain/reviews/${id}`);
  }
}

export const reviewService = new ReviewService();
```

---

## Step 3: Create React Query Hooks

**Location:** `packages/client-sdk/src/hooks/`

```typescript
// packages/client-sdk/src/hooks/useReviews.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewService, type ReviewListParams } from '../services/review.service';
import type { CreateReviewInput } from '@digilist/domain';

// Query keys factory
const reviewKeys = {
  all: ['reviews'] as const,
  lists: () => [...reviewKeys.all, 'list'] as const,
  list: (params?: ReviewListParams) => [...reviewKeys.lists(), params] as const,
  details: () => [...reviewKeys.all, 'detail'] as const,
  detail: (id: string) => [...reviewKeys.details(), id] as const,
};

/**
 * Hook to fetch reviews list
 */
export function useReviews(params?: ReviewListParams) {
  return useQuery({
    queryKey: reviewKeys.list(params),
    queryFn: () => reviewService.list(params),
  });
}

/**
 * Hook to fetch a single review
 */
export function useReview(id: string) {
  return useQuery({
    queryKey: reviewKeys.detail(id),
    queryFn: () => reviewService.get(id),
    enabled: !!id,
  });
}

/**
 * Hook to create a review
 */
export function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateReviewInput) => reviewService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.lists() });
    },
  });
}

/**
 * Hook to update a review
 */
export function useUpdateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateReviewInput> }) =>
      reviewService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: reviewKeys.lists() });
    },
  });
}

/**
 * Hook to delete a review
 */
export function useDeleteReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => reviewService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.lists() });
    },
  });
}
```

---

## Step 4: Export from Index Files

```typescript
// packages/client-sdk/src/services/index.ts
export { reviewService } from './review.service';
export type { ReviewListParams } from './review.service';

// packages/client-sdk/src/hooks/index.ts
export {
  useReviews,
  useReview,
  useCreateReview,
  useUpdateReview,
  useDeleteReview,
} from './useReviews';
```

---

## Step 5: Add Tests

```typescript
// packages/client-sdk/src/services/__tests__/review.service.test.ts
import { describe, it, expect, vi } from 'vitest';
import { reviewService } from '../review.service';

describe('ReviewService', () => {
  it('lists reviews', async () => {
    const reviews = await reviewService.list({ limit: 10 });
    expect(Array.isArray(reviews)).toBe(true);
  });

  it('creates a review', async () => {
    const review = await reviewService.create({
      rentalObjectId: 'test-id',
      rating: 5,
      comment: 'Great!',
    });
    expect(review.id).toBeDefined();
  });
});
```

---

## Step 6: Build and Verify

```bash
# Build the SDK
pnpm -F @digilist/client-sdk build

# Run type check
pnpm -F @digilist/client-sdk typecheck

# Run tests
pnpm -F @digilist/client-sdk test

# Verify no boundary violations
pnpm verify:boundaries
```

---

## Step 7: Document

Update SDK documentation:

```markdown
// packages/client-sdk/README.md

## Review Service

### Service Methods
- `reviewService.list(params)` - List reviews
- `reviewService.get(id)` - Get single review
- `reviewService.create(data)` - Create review
- `reviewService.update(id, data)` - Update review
- `reviewService.delete(id)` - Delete review

### React Hooks
- `useReviews(params)` - Query reviews list
- `useReview(id)` - Query single review
- `useCreateReview()` - Mutation to create
- `useUpdateReview()` - Mutation to update
- `useDeleteReview()` - Mutation to delete
```

---

## Checklist

- [ ] Contract types defined in `@digilist/domain`
- [ ] Service class extends `BaseService`
- [ ] All methods use correct HTTP verbs
- [ ] React Query hooks with proper cache invalidation
- [ ] Query keys follow factory pattern
- [ ] Exports added to index files
- [ ] Unit tests added
- [ ] Documentation updated
- [ ] Build passes
- [ ] No boundary violations
