# API Modules

This directory contains all API modules for the Xala/Digilist platform.

## Module Registry

All modules are classified in `/apps/api/src/module-registry.ts`. Consult this file for:

- Module ownership (platform vs domain vs shared)
- Module dependencies
- Database schema access
- Registration patterns
- Route prefixes

## Quick Classification Reference

### Platform Modules (Domain-Agnostic)

These modules are domain-agnostic and will be extracted to `@xalatechnologies/platform`:

| Category | Modules | Description |
|----------|---------|-------------|
| **Core** | `auth`, `authz`, `tenant`, `user`, `organizations` | User, tenant, and org management |
| **Infrastructure** | `health`, `websocket`, `storage`, `configuration`, `settings` | System infrastructure |
| **Compliance** | `audit`, `gdpr`, `security` | Audit logging, GDPR, security |
| **SaaS** | `billing`, `entitlements`, `license`, `seat-limits`, `feature-flags`, `saas`, `policy`, `menu` | SaaS billing and features |
| **Notifications** | `notifications`, `push-notifications`, `notification-system` | Multi-channel notifications |
| **RBAC** | `capabilities`, `permission-assignment`, `case-handler-scope`, `access-grant` | Role-based access control |
| **Integrations** | `integrations`, `webhooks` | Third-party integrations |
| **i18n** | `translations` | Internationalization |
| **Monitoring** | `monitoring` | System monitoring |

### Domain Modules (Digilist-Specific)

These modules contain Digilist business logic and stay in this repo:

| Category | Modules | Description |
|----------|---------|-------------|
| **Rental Objects** | `rental-objects`, `rental-object-details`, `amenities`, `addons` | Rental object management |
| **Booking** | `bookings`, `booking`, `calendar`, `availability`, `blocks` | Booking and scheduling |
| **Seasons** | `seasons`, `season-applications`, `seasonal-lease`, `allocations` | Seasonal allocation |
| **Discovery** | `search`, `favorites`, `reviews` | Search and user engagement |
| **Custody** | `custody` | Parental consent |
| **Pricing** | `pricing`, `discount-codes` | Pricing rules |
| **Widgets** | `widgets` | Embeddable components |
| **Domain** | `domain` | Domain utilities |

### Shared Modules

These modules are used by both platform and domain, need careful handling during split:

| Module | Purpose |
|--------|---------|
| `dashboard` | Dashboard aggregation |
| `reports` | Analytics and reporting |
| `conversations` | Messaging conversations |
| `messages` | Message CRUD |
| `public` | Public endpoints |
| `help` | Help/support |
| `share` | Sharing features |
| `backoffice` | Backoffice portal |
| `minside` | User portal |
| `user-groups` | User group management |
| `user-management` | Admin user management |
| `tenant-admin` | Tenant administration |
| `profile` | User profile |
| `metadata` | Metadata management |
| `bulk` | Bulk operations |

## Module Tiers

```
Tier 1: Infrastructure (Independent)
├── auth, health, security, websocket, public

Tier 2: Core (Repositories + Services)
├── tenant, user, organizations, monitoring, audit, gdpr

Tier 3: Domain (Business Logic)
├── rental-objects, booking, seasons, allocations

Tier 4: Features (Built on Domain)
├── amenities, addons, reviews, favorites, blocks

Tier 5: Admin (Configuration)
├── tenant-admin, saas, entitlements, policy, settings

Tier 6: Portal (App-Specific)
├── backoffice, minside, dashboard, reports
```

## Future Route Structure

After the platform/domain split, routes will be organized as:

```
/api/
├── platform/            # Platform modules
│   ├── auth/
│   ├── tenants/
│   ├── organizations/
│   ├── users/
│   ├── notifications/
│   └── ...
├── domain/              # Domain modules
│   ├── rental-objects/
│   ├── bookings/
│   ├── seasons/
│   └── ...
└── (shared)/            # Shared modules keep current paths
    ├── search/
    ├── storage/
    └── ...
```

## Registration Patterns

### Pattern A: Full Module (NestJS-style)

```typescript
@Module({
  controllers: [TenantController],
  providers: [TenantService, TenantRepository],
  exports: ['TenantService', 'TenantRepository'],
})
export class TenantModule {}
```

**Used by:** tenant, user, booking, rental-objects, monitoring, custody

### Pattern B: Direct Controller

```typescript
// main.ts
const controllers = [AuthController, DashboardController, ...];
```

**Used by:** Most modules (50+)

### Pattern C: Fastify Plugin

```typescript
await app.register(amenitiesRoutes, { prefix: '/api' });
```

**Used by:** amenities, addons, favorites, feature-flags, menu

### Pattern D: Shared Routes

```typescript
// src/routes/features.routes.ts
```

**Used by:** features, i18n, navigation, scanners

## Adding New Modules

1. Create module folder in `src/modules/`
2. Add entry to `src/module-registry.ts` in both:
   - `MODULE_CLASSIFICATION` (simplified lookup)
   - `MODULE_REGISTRY` (full metadata)
3. Register in `src/main.ts` using appropriate pattern
4. Classify ownership (platform/domain/shared)
5. Document database schema access

## Using the Registry

```typescript
import {
  isPlatformModule,
  isDomainModule,
  isSharedModule,
  getModuleCategory,
  getModuleSubcategory,
  MODULE_CLASSIFICATION,
  MODULE_REGISTRY,
  ROUTE_PREFIXES,
} from '../module-registry';

// Quick checks
if (isPlatformModule('auth')) {
  // Module is domain-agnostic
}

if (isDomainModule('rental-objects')) {
  // Module is Digilist-specific
}

// Get category
const category = getModuleCategory('booking'); // 'domain'

// Get subcategory
const subcategory = getModuleSubcategory('auth'); // 'core'

// Get all platform core modules
const coreModules = MODULE_CLASSIFICATION.platform.core;
// ['auth', 'authz', 'tenant', 'user', 'organizations']

// Get full metadata
const authMetadata = MODULE_REGISTRY['auth'];
// { name: 'auth', tier: 'infrastructure', category: 'auth', ... }
```

## Verification

Run module verification:

```bash
pnpm -F @digilist/api run verify:modules
```

This checks:
- All modules are classified in registry
- No orphaned modules
- Dependencies are valid
- No circular dependencies
