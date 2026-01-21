# Domain Template Repository Guide

This guide describes how to create a new SaaS domain using the Xala Platform.

## Overview

The Xala Platform is designed to be domain-agnostic at the platform layer, allowing new SaaS domains to be built on top of the shared infrastructure.

**Platform (extractable):**
- `@xalatechnologies/platform` - Core platform packages
- Authentication, RBAC, multi-tenancy, audit, notifications
- Design system, i18n, configuration

**Domain (custom per SaaS):**
- `@{domain}/sdk` - Domain SDK with services and hooks
- `@{domain}/ui` - Domain UI components
- `@{domain}/domain` - Domain contracts and types
- `apps/*` - Domain-specific applications

## Creating a New Domain

### Step 1: Fork or Clone Template

```bash
# Clone the domain template
git clone https://github.com/xalatechnologies/xala-domain-template.git my-saas-domain
cd my-saas-domain

# Remove git history and start fresh
rm -rf .git
git init
```

### Step 2: Configure Domain Name

Update all package names from `@template` to your domain namespace:

```bash
# Replace @template with your domain (e.g., @myapp)
find . -type f -name "*.json" -exec sed -i '' 's/@template/@myapp/g' {} \;
find . -type f -name "*.ts" -exec sed -i '' 's/@template/@myapp/g' {} \;
find . -type f -name "*.tsx" -exec sed -i '' 's/@template/@myapp/g' {} \;
```

### Step 3: Install Platform Package

```bash
# Add platform dependency
pnpm add @xalatechnologies/platform

# Or for specific subpackages
pnpm add @xalatechnologies/platform/ui
pnpm add @xalatechnologies/platform/auth
pnpm add @xalatechnologies/platform/config
```

### Step 4: Define Domain Schema

Create your domain database schema:

```typescript
// packages/domain/src/schema/index.ts
import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';

export const myEntities = pgTable('domain.my_entities', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  name: varchar('name', { length: 200 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
```

### Step 5: Create Domain SDK

Create services and hooks for your domain:

```typescript
// packages/sdk/src/services/my-entity.service.ts
import { getClient } from '@xalatechnologies/platform/sdk';

export const myEntityService = {
  async list() {
    return getClient().get('/api/domain/my-entities');
  },
  async create(data: CreateMyEntity) {
    return getClient().post('/api/domain/my-entities', data);
  },
};

// packages/sdk/src/hooks/use-my-entities.ts
import { useQuery, useMutation } from '@tanstack/react-query';
import { myEntityService } from '../services/my-entity.service';

export function useMyEntities() {
  return useQuery({
    queryKey: ['my-entities'],
    queryFn: () => myEntityService.list(),
  });
}
```

### Step 6: Create Domain UI Components

Build feature kits using platform patterns:

```typescript
// packages/ui/src/features/my-entity/MyEntityCard.tsx
import { ResourceCard } from '@xalatechnologies/platform/ui/patterns';
import { mapMyEntityToResourceCard } from './mappers';

export function MyEntityCard({ entity, t }) {
  const props = mapMyEntityToResourceCard(entity, t);
  return <ResourceCard {...props} />;
}
```

### Step 7: Configure Applications

Each app imports from platform and domain packages:

```typescript
// apps/web/src/main.tsx
import { RuntimeProvider } from '@xalatechnologies/platform/runtime';
import { initializeClient } from '@myapp/sdk';

initializeClient({ baseUrl: 'https://api.myapp.com' });

ReactDOM.render(
  <RuntimeProvider config={config}>
    <App />
  </RuntimeProvider>,
  document.getElementById('root')
);
```

## Template Structure

```
xala-domain-template/
├── apps/
│   ├── web/                    # Public web app
│   │   ├── src/
│   │   │   ├── routes/
│   │   │   ├── App.tsx
│   │   │   └── main.tsx
│   │   ├── package.json
│   │   └── vite.config.ts
│   ├── backoffice/             # Admin portal
│   │   └── ...
│   ├── minside/                # User portal
│   │   └── ...
│   └── api/                    # API server
│       ├── src/
│       │   ├── modules/
│       │   │   └── my-domain/
│       │   ├── database/
│       │   └── main.ts
│       └── package.json
│
├── packages/
│   ├── domain/                 # Domain contracts
│   │   ├── src/
│   │   │   ├── schemas/        # Zod schemas
│   │   │   ├── types/          # TypeScript types
│   │   │   └── index.ts
│   │   └── package.json
│   ├── sdk/                    # Domain SDK
│   │   ├── src/
│   │   │   ├── services/
│   │   │   ├── hooks/
│   │   │   └── index.ts
│   │   └── package.json
│   ├── ui/                     # Domain UI
│   │   ├── src/
│   │   │   ├── features/
│   │   │   └── index.ts
│   │   └── package.json
│   └── runtime/                # Domain runtime
│       ├── src/
│       │   └── providers/
│       └── package.json
│
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
└── CLAUDE.md
```

## Package Dependencies

```
┌─────────────────────────────────────────────────────────────┐
│                    DOMAIN APPLICATIONS                       │
│     apps/web, apps/backoffice, apps/minside, apps/api       │
├─────────────────────────────────────────────────────────────┤
│                       DOMAIN LAYER                           │
│  @{domain}/sdk    @{domain}/ui    @{domain}/runtime         │
│  (services,       (feature kits,  (providers)               │
│   hooks)          thin wrappers)                             │
├─────────────────────────────────────────────────────────────┤
│                     @{domain}/domain                         │
│           (contracts, types, Zod schemas)                    │
├─────────────────────────────────────────────────────────────┤
│                    PLATFORM LAYER                            │
│              @xalatechnologies/platform                      │
│  /ui  /auth  /config  /runtime  /contracts  /sdk  /i18n    │
└─────────────────────────────────────────────────────────────┘
```

## Import Rules

```typescript
// ✅ Apps import from domain packages
import { useMyEntities } from '@myapp/sdk';
import { MyEntityCard } from '@myapp/ui';

// ✅ Domain packages import from platform
import { Button } from '@xalatechnologies/platform/ui';
import { getClient } from '@xalatechnologies/platform/sdk';

// ❌ Domain packages NEVER modify platform
// ❌ Apps NEVER import directly from platform (go through domain layer)
// ❌ Platform NEVER imports from domain
```

## Database Schema Conventions

All domain tables should be in the `domain` schema:

```sql
CREATE SCHEMA IF NOT EXISTS domain;

-- Domain-specific tables
CREATE TABLE domain.my_entities (...);
CREATE TABLE domain.my_other_entities (...);
```

Platform tables use the `platform` schema (managed by platform):

```sql
-- Platform tables (read-only from domain perspective)
platform.users
platform.tenants
platform.organizations
```

## Configuration

### Environment Variables

```bash
# Platform configuration (required)
VITE_API_URL=https://api.myapp.com
VITE_TENANT_ID=my-tenant

# Domain-specific configuration
VITE_MY_DOMAIN_FEATURE=true
```

### Platform Configuration

```typescript
// config/platform.ts
export const platformConfig = {
  auth: {
    provider: 'bankid',
    cookieDomain: '.myapp.com',
  },
  i18n: {
    defaultLocale: 'nb',
    supportedLocales: ['nb', 'en'],
  },
  theme: {
    name: 'digdir',
    colorScheme: 'auto',
  },
};
```

## Deployment

### Build

```bash
# Build all packages and apps
pnpm build

# Build specific app
pnpm --filter @myapp/web build
```

### Deploy

Each app can be deployed independently:

```bash
# Deploy web app
./scripts/deploy.sh web

# Deploy API
./scripts/deploy.sh api
```

## Migration from Digilist

If migrating from an existing Digilist implementation:

1. Replace `@digilist/client-sdk` → `@myapp/sdk`
2. Replace `@digilist/ui` → `@myapp/ui`
3. Replace `@digilist/domain` → `@myapp/domain`
4. Keep `@xalatechnologies/platform` for platform features
5. Update API routes from `/api/domain/*` to your domain

## Support

For questions about the Xala Platform:
- Documentation: https://docs.xalatechnologies.com
- Issues: https://github.com/xalatechnologies/platform/issues

---

**Version:** 1.0.0
**Last Updated:** 2026-01-21
