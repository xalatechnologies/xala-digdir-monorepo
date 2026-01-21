# Domain API Modules

This directory contains **domain-only** API modules for the Digilist rental booking platform.

> **IMPORTANT:** Platform modules (auth, tenant, user, organizations, etc.) have been extracted to `apps/platform-api` (port 4001).

## Current Module Structure

After the platform/domain split, this API contains only domain-specific modules:

### Domain Modules (Digilist-Specific)

| Category | Modules | Description |
|----------|---------|-------------|
| **Rental Objects** | `rental-objects`, `rental-object-details`, `amenities`, `addons` | Rental object management |
| **Booking** | `bookings`, `booking`, `calendar`, `availability`, `blocks` | Booking and scheduling |
| **Seasons** | `seasons`, `season-applications`, `seasonal-lease`, `allocations` | Seasonal allocation |
| **Discovery** | `search`, `favorites`, `reviews` | Search and user engagement |
| **Custody** | `custody` | Domain-specific custody |
| **Pricing** | `pricing`, `discount-codes` | Pricing rules |
| **Widgets** | `widgets` | Embeddable components |
| **Portal** | `backoffice`, `minside`, `dashboard`, `reports` | App-specific endpoints |
| **Messaging** | `conversations`, `messages` | Domain messaging |
| **Utilities** | `public`, `help`, `share`, `profile`, `bulk`, `metadata` | Shared utilities |

### Modules Removed (Now in Platform API)

The following modules have been moved to `apps/platform-api`:

- `auth`, `authz` - Authentication & authorization
- `tenant`, `user`, `organizations` - Core identity
- `audit`, `gdpr`, `security` - Compliance
- `notifications`, `push-notifications`, `notification-system` - Notifications
- `saas`, `billing`, `entitlements`, `license` - SaaS management
- `policy`, `menu`, `feature-flags` - Configuration
- `storage`, `webhooks`, `integrations` - Infrastructure
- `translations`, `monitoring`, `health`, `websocket` - System services
- `permission-assignment`, `case-handler-scope`, `access-grant`, `capabilities` - RBAC

## Module Tiers

```
Tier 1: Domain Core (Business Entities)
├── rental-objects, booking, seasons, allocations, custody

Tier 2: Domain Features (Built on Core)
├── amenities, addons, reviews, favorites, blocks, search

Tier 3: Domain Portal (App-Specific)
├── backoffice, minside, dashboard, reports, widgets

Tier 4: Domain Utilities
├── conversations, messages, public, help, share, profile
```

## API Split Architecture

```
                    ┌─────────────────────────────────────┐
                    │        Frontend Apps                │
                    │  web, minside, backoffice           │
                    └───────────────┬─────────────────────┘
                                    │
              ┌─────────────────────┴─────────────────────┐
              │                                           │
    ┌─────────▼─────────┐                   ┌─────────────▼─────────────┐
    │   Domain API      │                   │      Platform API         │
    │   Port 4000       │                   │      Port 4001            │
    │                   │                   │                           │
    │  /api/            │                   │  /api/                    │
    │  ├── rental-objects│                   │  ├── auth                 │
    │  ├── bookings      │                   │  ├── users                │
    │  ├── calendar      │                   │  ├── tenants              │
    │  ├── seasons       │                   │  ├── organizations        │
    │  ├── search        │                   │  ├── notifications        │
    │  └── ...           │                   │  └── ...                  │
    └───────────────────┘                   └───────────────────────────┘
              │                                           │
              └─────────────────────┬─────────────────────┘
                                    │
                    ┌───────────────▼───────────────┐
                    │        PostgreSQL             │
                    │  platform.*, domain.*,       │
                    │  saas.*, compliance.*        │
                    └───────────────────────────────┘
```

## Cross-API Communication

When domain modules need platform data (e.g., user details):

```typescript
// Option 1: JWT token validation (shared secret)
const jwtService = container.resolve('JwtService');
const payload = jwtService.verify(token);

// Option 2: Call Platform API
const response = await fetch('http://localhost:4001/api/users/me', {
  headers: { Authorization: `Bearer ${token}` }
});
```

## Module Registry

For historical reference and classification, see `/apps/api/src/module-registry.ts`.

## Registration Pattern

Most domain modules use direct controller registration:

```typescript
// main.ts
const controllers = [
  RentalObjectController,
  BookingController,
  CalendarController,
  // ...
];
```

Some use Fastify plugins:

```typescript
await app.register(amenitiesRoutes, { prefix: '/api' });
await app.register(addonsRoutes, { prefix: '/api' });
await app.register(favoritesRoutes, { prefix: '/api' });
```

## Adding New Modules

1. Determine if module is domain-specific or platform
2. If domain-specific, create in `apps/api/src/modules/`
3. If platform, create in `apps/platform-api/src/modules/`
4. Register in appropriate `main.ts`
5. Update documentation

## Environment Variables

```bash
# Database (shared with Platform API)
DATABASE_URL=postgresql://user:password@localhost:5432/xala

# JWT (shared with Platform API for token validation)
JWT_SECRET=your-secret-key

# Platform API URL (for cross-API calls)
PLATFORM_API_URL=http://localhost:4001
```

---

**Last Updated:** 2026-01-21
**Status:** Domain-Only (Platform modules in apps/platform-api)
