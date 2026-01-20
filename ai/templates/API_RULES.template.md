# API Rules Template

> **Purpose:** Define API/SDK rules for AI
> **Usage:** Copy to `/ai/API_RULES.md` and customize

---

## Core Rule

**All data access MUST go through `[your-sdk]`.** Direct HTTP is FORBIDDEN.

---

## Contract-First Design

### DTOs in Contracts Package

```typescript
// packages/contracts/src/[entity].ts
export interface EntityDTO {
  id: string;
  // ... fields
}

export interface CreateEntityInput {
  // ... fields
}

export const EntitySchema = z.object({
  // ... validation
});
```

### No Local Types

```typescript
// ❌ FORBIDDEN
interface Entity { ... }

// ✅ CORRECT
import type { EntityDTO } from '[contracts]';
```

---

## SDK Patterns

### Query Hooks

```typescript
import { useEntities, useEntityById } from '[sdk]';

// List
const { data, isLoading } = useEntities();

// With filters
const { data } = useEntities({ status: 'active' });

// Single
const { data: entity } = useEntityById(id);
```

### Mutation Hooks

```typescript
import { useCreateEntity, useUpdateEntity } from '[sdk]';

const create = useCreateEntity();
await create.mutateAsync(data);

const update = useUpdateEntity();
await update.mutateAsync({ id, data });
```

---

## Error Handling

### RFC 7807 Format

```typescript
interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail?: string;
  errors?: Record<string, string[]>;
}
```

### Categories

```typescript
type ErrorCategory =
  | 'validation'  // 400
  | 'auth'        // 401
  | 'forbidden'   // 403
  | 'not_found'   // 404
  | 'conflict'    // 409
  | 'server';     // 500
```

### Handling

```typescript
import { parseError } from '[sdk]';

const { error } = useEntities();
if (error) {
  const parsed = parseError(error);
  switch (parsed.category) {
    case 'auth': navigate('/login');
    case 'forbidden': return <AccessDenied />;
    default: return <ErrorScreen error={parsed} />;
  }
}
```

---

## Cache Management

### Query Keys

```typescript
['entities']                   // List
['entities', { status: 'x' }]  // Filtered
['entity', id]                 // Single
```

### Auto-Invalidation

Mutations auto-invalidate related queries.

---

## API Design Rules

### Naming

```
GET    /api/[entities]         List
GET    /api/[entities]/:id     Get one
POST   /api/[entities]         Create
PUT    /api/[entities]/:id     Update
DELETE /api/[entities]/:id     Delete
POST   /api/[entities]/:id/[action]  Custom action
```

### Versioning

```
/api/v1/[entities]
/api/v2/[entities]
```

### Responses

```typescript
// Success
{ data: EntityDTO }         // Single
{ data: EntityDTO[] }       // List
{ data: EntityDTO[], meta: { total, page } }  // Paginated

// Error
{ type, title, status, detail }  // RFC 7807
```

---

## Rules Summary

| Rule | Description |
|------|-------------|
| No fetch/axios | Use SDK |
| No local types | Import from contracts |
| No transformation | Use projections |
| Handle errors | Use parseError |
| Automatic cache | SDK handles it |
