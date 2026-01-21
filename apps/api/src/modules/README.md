# API Modules

This directory contains all API modules for the Xala/Digilist platform.

## Module Registry

All modules are classified in `/apps/api/src/module-registry.ts`. Consult this file for:

- Module ownership (platform vs domain)
- Module dependencies
- Database schema access
- Registration patterns

## Module Ownership

### Platform Modules (Extractable)

These modules are domain-agnostic and can be extracted into `@xalatechnologies/platform`:

| Category | Modules |
|----------|---------|
| **Auth & RBAC** | auth, authz, permission-assignment, capability, case-handler-scope, access-grant, custody |
| **Tenant & User** | tenant, user, organizations |
| **Audit & Compliance** | audit, gdpr, monitoring |
| **SaaS Admin** | tenant-admin, saas, entitlements, policy, feature-flags, license, seat-limits |
| **Configuration** | configuration, settings, menu, translations |
| **Messaging** | notifications, notification-system, push-notifications |
| **Integrations** | integrations, storage, webhooks, metadata |
| **Infrastructure** | health, websocket, security, public |

### Domain Modules (Digilist-Specific)

These modules contain Digilist business logic:

| Category | Modules |
|----------|---------|
| **Booking** | booking, bookings, availability, calendar, blocks, allocations |
| **Rental Objects** | rental-objects, rental-object-details, amenities, addons, reviews, favorites |
| **Seasonal** | seasons, seasonal-lease, season-applications |
| **Pricing** | pricing, billing, discount-codes |
| **Discovery** | search |
| **Portals** | backoffice, minside, dashboard, reports, widgets |

### Shared Modules

These modules are used by both platform and domain:

| Module | Purpose |
|--------|---------|
| conversations | Messaging (could be either) |
| messages | Messaging (could be either) |
| profile | User profile |
| user-management | Admin user management |
| user-groups | Admin user groups |
| bulk | Bulk operations |
| help | Help/support |

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

## API Route Structure

### Current Structure

```
/api/
├── auth/           # Authentication
├── bookings/       # Booking CRUD
├── rental-objects/ # Rental object CRUD
├── organizations/  # Organization management
├── ...
```

### Target Structure (PR A.2)

```
/api/
├── platform/
│   ├── auth/
│   ├── tenants/
│   ├── organizations/
│   ├── users/
│   ├── notifications/
│   └── ...
├── domain/
│   ├── rental-objects/
│   ├── bookings/
│   ├── seasons/
│   └── ...
└── shared/
    ├── search/
    ├── storage/
    └── ...
```

## Adding New Modules

1. Create module folder in `src/modules/`
2. Add entry to `src/module-registry.ts`
3. Register in `src/main.ts` using appropriate pattern
4. Classify ownership (platform/domain/shared)
5. Document database schema access

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
