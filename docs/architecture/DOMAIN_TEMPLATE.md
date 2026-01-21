# Domain Template Guide

> **Purpose:** This guide describes how to create a new domain implementation based on the `@xalatechnologies/platform` package.

## Overview

The platform architecture separates **platform-agnostic** code from **domain-specific** code. This enables:

1. **Reusability** - Platform code works across any domain
2. **Consistency** - All domains share the same foundation
3. **Maintainability** - Domain changes don't affect platform
4. **Extractability** - Platform can be published and versioned independently

---

## Domain Package Structure

A new domain should create the following package structure:

```
@my-domain/
├── packages/
│   ├── domain/                    # Types, schemas, validators
│   │   ├── package.json          # @my-domain/domain
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── schemas/          # Zod schemas
│   │   │   ├── projections/      # DTO types
│   │   │   └── validators/       # Business validators
│   │   └── CLAUDE.md
│   │
│   ├── sdk/                       # Services and hooks
│   │   ├── package.json          # @my-domain/sdk
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── services/         # API services
│   │   │   ├── hooks/            # React Query hooks
│   │   │   └── realtime/         # WebSocket client
│   │   └── CLAUDE.md
│   │
│   ├── ui/                        # Feature kits
│   │   ├── package.json          # @my-domain/ui
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── features/         # Feature kits with mappers
│   │   │   ├── blocks/           # Domain-specific components
│   │   │   └── booking-engine/   # (if applicable)
│   │   └── CLAUDE.md
│   │
│   ├── runtime/                   # App providers
│   │   ├── package.json          # @my-domain/runtime
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── config/           # App profiles
│   │   │   └── providers/        # Context providers
│   │   └── CLAUDE.md
│   │
│   └── database-schema/           # Drizzle ORM
│       ├── package.json          # @my-domain/database-schema
│       ├── src/
│       │   ├── index.ts
│       │   ├── core/             # Core tables
│       │   ├── domain/           # Domain tables
│       │   └── schemas.ts        # PostgreSQL schemas
│       └── CLAUDE.md
│
└── apps/
    ├── web/                       # Public web app
    ├── backoffice/               # Admin portal
    ├── api/                      # Fastify API
    └── ...
```

---

## Step 1: Create Domain Contracts

Domain contracts define your API types and validation:

```typescript
// packages/domain/src/schemas/resource.schema.ts
import { z } from 'zod';
import { BaseEntitySchema } from '@xalatechnologies/platform/contracts';

export const MyResourceSchema = BaseEntitySchema.extend({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  status: z.enum(['draft', 'active', 'archived']),
  category: z.string(),
  price: z.number().positive().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export type MyResource = z.infer<typeof MyResourceSchema>;

// packages/domain/src/projections/resource.projection.ts
export interface MyResourceCardProjection {
  id: string;
  name: string;
  description?: string;
  status: 'draft' | 'active' | 'archived';
  category: string;
  thumbnailUrl?: string;
  price?: number;
  permissions: {
    canEdit: boolean;
    canDelete: boolean;
    canPublish: boolean;
  };
}
```

---

## Step 2: Create Domain SDK

The SDK provides services and React hooks:

```typescript
// packages/sdk/src/services/resource.service.ts
import { BaseService } from '@xalatechnologies/platform/sdk';
import type { MyResource, MyResourceCardProjection } from '@my-domain/domain';

export class ResourceService extends BaseService {
  async getResources(params?: { status?: string; page?: number }): Promise<{
    data: MyResourceCardProjection[];
    pagination: { page: number; totalPages: number };
  }> {
    return this.client.get('/api/resources', { params });
  }

  async getResource(id: string): Promise<MyResource> {
    return this.client.get(`/api/resources/${id}`);
  }

  async createResource(data: Omit<MyResource, 'id' | 'createdAt' | 'updatedAt'>): Promise<MyResource> {
    return this.client.post('/api/resources', data);
  }

  async updateResource(id: string, data: Partial<MyResource>): Promise<MyResource> {
    return this.client.patch(`/api/resources/${id}`, data);
  }

  async deleteResource(id: string): Promise<void> {
    return this.client.delete(`/api/resources/${id}`);
  }
}

// packages/sdk/src/hooks/useResources.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { resourceService } from '../services';
import type { MyResourceCardProjection } from '@my-domain/domain';

export function useResources(params?: { status?: string; page?: number }) {
  return useQuery({
    queryKey: ['resources', params],
    queryFn: () => resourceService.getResources(params),
  });
}

export function useResource(id: string) {
  return useQuery({
    queryKey: ['resources', id],
    queryFn: () => resourceService.getResource(id),
    enabled: !!id,
  });
}

export function useCreateResource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: resourceService.createResource,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
    },
  });
}
```

---

## Step 3: Create Feature Kits

Feature kits map domain DTOs to platform patterns:

```typescript
// packages/ui/src/features/resources/mappers.ts
import type { ResourceCardProps } from '@xalatechnologies/platform/ui/patterns';
import type { MyResourceCardProjection } from '@my-domain/domain';

export function mapResourceToCard(
  resource: MyResourceCardProjection,
  t: (key: string) => string
): ResourceCardProps {
  return {
    id: resource.id,
    title: resource.name,
    description: resource.description,
    image: resource.thumbnailUrl,
    status: {
      label: t(`status.${resource.status}`),
      variant: resource.status === 'active' ? 'success' : 'neutral',
    },
    badges: [
      { label: resource.category, variant: 'info' },
    ],
    metadata: resource.price ? [
      { label: t('fields.price'), value: `${resource.price} kr` },
    ] : [],
    actions: resource.permissions.canEdit ? [
      { label: t('actions.edit'), action: 'edit' },
    ] : [],
  };
}

// packages/ui/src/features/resources/ResourceCardWrapper.tsx
import { ResourceCard } from '@xalatechnologies/platform/ui/patterns';
import { mapResourceToCard } from './mappers';
import type { MyResourceCardProjection } from '@my-domain/domain';

interface ResourceCardWrapperProps {
  resource: MyResourceCardProjection;
  onClick?: (id: string) => void;
  onAction?: (id: string, action: string) => void;
  t: (key: string) => string;
}

export function ResourceCardWrapper({
  resource,
  onClick,
  onAction,
  t,
}: ResourceCardWrapperProps) {
  const props = mapResourceToCard(resource, t);
  return (
    <ResourceCard
      {...props}
      onClick={() => onClick?.(resource.id)}
      onAction={(action) => onAction?.(resource.id, action)}
    />
  );
}
```

---

## Step 4: Create Domain Runtime

Runtime configures app profiles and providers:

```typescript
// packages/runtime/src/config/profiles.ts
import { registerAppProfile } from '@xalatechnologies/platform/config';

export type MyDomainAppType = 'web' | 'backoffice' | 'api';

export const webProfile = {
  appType: 'web' as const,
  displayName: 'Public Portal',
  port: 5173,
  requiresAuth: false,
  colorScheme: 'auto' as const,
  themeId: 'my-domain' as const,
};

export const backofficeProfile = {
  appType: 'backoffice' as const,
  displayName: 'Admin Portal',
  port: 5175,
  requiresAuth: true,
  colorScheme: 'auto' as const,
  themeId: 'my-domain' as const,
};

// Register profiles (side-effect import)
registerAppProfile('web', webProfile);
registerAppProfile('backoffice', backofficeProfile);

// packages/runtime/src/index.ts
// Auto-register profiles on import
import './config/profiles';

export * from './config/profiles';
export * from './providers';
```

---

## Step 5: App Integration

Apps import domain packages and use platform components:

```typescript
// apps/web/src/main.tsx

// Step 1: Import domain runtime (registers profiles)
import '@my-domain/runtime';

// Step 2: Import platform styles and utilities
import '@xalatechnologies/platform/ui/styles';
import { validateEnv, createAppConfig } from '@xalatechnologies/platform/config';
import { RuntimeProvider } from '@xalatechnologies/platform/runtime';

// Step 3: Import domain SDK
import { initializeClient } from '@my-domain/sdk';

// Step 4: Initialize
const env = validateEnv(import.meta.env);
const { sdkConfig, runtimeConfig } = createAppConfig('web', env);
initializeClient(sdkConfig);

// Step 5: Render
createRoot(document.getElementById('root')!).render(
  <RuntimeProvider config={runtimeConfig}>
    <App />
  </RuntimeProvider>
);

// apps/web/src/pages/ResourcesPage.tsx
import { useResources } from '@my-domain/sdk';
import { ResourceCardWrapper } from '@my-domain/ui/features/resources';
import { Grid, Spinner } from '@xalatechnologies/platform/ui';
import { useT } from '@xalatechnologies/platform/i18n';

export function ResourcesPage() {
  const t = useT();
  const { data, isLoading } = useResources();

  if (isLoading) return <Spinner />;

  return (
    <Grid columns={3} gap="md">
      {data?.data.map(resource => (
        <ResourceCardWrapper
          key={resource.id}
          resource={resource}
          onClick={(id) => navigate(`/resources/${id}`)}
          t={t}
        />
      ))}
    </Grid>
  );
}
```

---

## Package Dependencies

### Domain Package Dependencies

| Package | Dependencies |
|---------|-------------|
| `@my-domain/domain` | `@xalatechnologies/platform/contracts`, `zod` |
| `@my-domain/sdk` | `@xalatechnologies/platform/sdk`, `@my-domain/domain`, `@tanstack/react-query` |
| `@my-domain/ui` | `@xalatechnologies/platform/ui`, `@my-domain/domain` |
| `@my-domain/runtime` | `@xalatechnologies/platform/runtime`, `@xalatechnologies/platform/config` |

### Dependency Direction

```
@xalatechnologies/platform (NEVER imports domain)
        ↑
        |
@my-domain/domain (types only)
        ↑
        |
@my-domain/sdk (services + hooks)
        ↑
        |
@my-domain/ui (feature kits)
        ↑
        |
@my-domain/runtime (app config)
        ↑
        |
apps/* (web, backoffice, etc.)
```

---

## Checklist for New Domain

- [ ] Create `@my-domain/domain` with schemas and projections
- [ ] Create `@my-domain/sdk` with services and hooks
- [ ] Create `@my-domain/ui` with feature kits (mappers + thin wrappers)
- [ ] Create `@my-domain/runtime` with app profiles
- [ ] Create `@my-domain/database-schema` if using PostgreSQL
- [ ] Update apps to import domain runtime first
- [ ] Verify no platform packages import domain packages
- [ ] Add i18n translations for domain terms
- [ ] Create CLAUDE.md for each package

---

## Anti-Patterns to Avoid

### ❌ Wrong: Domain imports in platform

```typescript
// packages/platform/src/ui/patterns/ResourceCard.tsx
import type { MyResourceCardProjection } from '@my-domain/domain'; // WRONG!
```

### ✅ Correct: Platform uses generic props

```typescript
// packages/platform/src/ui/patterns/ResourceCard.tsx
interface ResourceCardProps {
  id: string;
  title: string;
  description?: string;
  image?: string;
  // Generic props, no domain types
}
```

### ❌ Wrong: Business logic in UI

```typescript
// packages/ui/src/features/resources/ResourceCard.tsx
function ResourceCard({ resource }) {
  // WRONG: Business logic in component
  const canEdit = resource.createdBy === currentUser.id && resource.status !== 'archived';
}
```

### ✅ Correct: Logic in projection

```typescript
// API returns permissions pre-computed
interface MyResourceCardProjection {
  // ...
  permissions: {
    canEdit: boolean;  // Computed on backend
    canDelete: boolean;
  };
}
```

---

## Reference Implementation

See the Digilist domain implementation as a reference:

- `@digilist/domain` - Domain contracts
- `@digilist/sdk` - SDK with 30+ services
- `@digilist/ui` - Feature kits for rental objects, booking, seasons
- `@digilist/runtime` - App profiles for web, minside, backoffice

---

**Last Updated:** 2026-01-21
**Status:** Template Ready
