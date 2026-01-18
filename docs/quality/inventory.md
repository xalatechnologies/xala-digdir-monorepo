# Platform Quality Inventory

> **Last Updated**: 2026-01-18  
> **Status**: In Progress

## Overview

Comprehensive inventory of all apps, packages, API endpoints, database artifacts, and routes for the Xala/Digilist platform.

---

## 1. Applications

| App | Port | Purpose | Status |
|-----|------|---------|--------|
| **api** | 3001 | Backend API (Fastify) | ✅ Active |
| **web** | 5173 | Public discovery portal | ✅ Active |
| **backoffice** | 5175 | Admin/Saksbehandler dashboard | ✅ Active |
| **minside** | 5174 | End-user "My Page" portal | ✅ Active |
| **saas-admin** | 5176 | SaaS control plane | ✅ Active |
| **tenant-admin** | 5177 | Tenant configuration | ✅ Active |
| **docs-learning** | 5178 | Documentation portal | ✅ Active |

---

## 2. Packages

| Package | Purpose |
|---------|---------|
| `@digilist/client-sdk` | TypeScript SDK with hooks + services |
| `@xala/ds` | Design system components |
| `@xala/ds-themes` | Theme tokens (OKLCH-based) |
| `@xala/ds-registry` | Component registry |
| `@xala/i18n` | Internationalization (nb/en) |
| `@xala/auth` | Authentication utilities |
| `@xala/contracts` | Shared DTOs + Zod schemas |
| `@xala/sdk-core` | Core SDK utilities |
| `@xala/eslint-config` | ESLint rules + scanner |
| `@xala/docs-content` | MDX documentation content |
| `@xala/ai` | AI utilities |
| `@xala/platform` | Platform adapters |

---

## 3. API Controllers (71 Total)

### Auth & Authorization
- `auth.controller.ts` - Login, logout, session
- `authz.controller.ts` - RBAC enforcement
- `idporten.controller.ts` - Norwegian eID
- `idporten-oidc.controller.ts` - OIDC flow

### Core Domain
- `rental-object.controller.ts` - Listings CRUD
- `booking.controller.ts` - Bookings CRUD
- `booking-contracts.controller.ts` - Booking pricing/preview
- `calendar.controller.ts` - Calendar operations
- `calendar-contracts.controller.ts` - Calendar availability
- `availability.controller.ts` - Slot availability

### Organizations & Users
- `organizations.controller.ts` - Org management
- `brreg.controller.ts` - Brønnøysund registry
- `profile.controller.ts` - User profiles
- `settings.controller.ts` - User settings

### Access Control
- `access-grant.controller.ts` - Org ↔ RO grants
- `permission-assignment.controller.ts` - Subdelegation
- `case-handler-scope.controller.ts` - Saksbehandler scopes
- `custody.controller.ts` - Custody management

### SaaS & Billing
- `billing.controller.ts` - Stripe webhooks
- `subscriptions.controller.ts` - Subscription lifecycle
- `tenant.controller.ts` - Tenant management
- `integrations.controller.ts` - External integrations

### Features & Messaging
- `messages.controller.ts` - User messages
- `conversations.controller.ts` - Conversation threads
- `templates.controller.ts` - Message templates
- `notifications.controller.ts` - System notifications

### Miscellaneous
- `metadata.controller.ts` - Categories, enums
- `public.controller.ts` - Public endpoints
- `gdpr.controller.ts` - GDPR requests
- `help.controller.ts` - Help system
- `health.controller.ts` - Health checks
- `monitoring.controller.ts` - System monitoring
- `audit.controller.ts` - Audit logs

---

## 4. Database Schema (5 Schemas, 50+ Tables)

### Schema: `platform.*`
| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `tenants` | Multi-tenant core | id, name, slug, subscriptionPlanId, featureFlags |
| `organizations` | Tenant orgs | id, tenantId, name, externalOrgId |
| `users` | User accounts | id, tenantId, email, role, nationalId |
| `sessions` | Auth sessions | id, userId, refreshTokenHash, expiresAt |
| `org_memberships` | Org membership | userId, orgId, orgRole |
| `permission_assignments` | Subdelegation | orgId, userId, rentalObjectId, permissions |
| `case_handler_scopes` | Saksbehandler scopes | userId, scopeType, rentalObjectId |
| `branding_tokens` | White-label tokens | tenantId, primaryColor, tokens |
| `branding_versions` | Version history | tenantId, version, snapshot |

### Schema: `domain.*`
| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `rental_objects` | Listings | id, tenantId, categoryKey, timeMode, status |
| `bookings` | Reservations | id, rentalObjectId, userId, startTime, endTime |
| `allocations` | Calendar events | id, rentalObjectId, startTime, endTime |
| `blocks` | Calendar blocks | id, rentalObjectId, startDate, endDate |
| `seasonal_leases` | Season allocations | id, organizationId, weekdays |
| `conversations` | Message threads | id, userId, bookingId |
| `messages` | Individual messages | conversationId, content |
| `favorites` | User favorites | userId, rentalObjectId |
| `rental_object_categories` | Category tree | code, key, parentId |
| `amenity_groups` | Amenity grouping | code, name |
| `amenities` | Individual amenities | code, name, iconKey |
| `rental_object_amenities` | Junction table | rentalObjectId, amenityId |
| `addons` | Booking add-ons | code, pricingModel, basePriceCents |
| `access_grants` | Org ↔ RO grants | orgId, rentalObjectId, status |
| `alerts` | System alerts | name, condition, severity |

### Schema: `saas.*`
| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `plans` | Subscription plans | slug, basePrice, entitlements |
| `subscriptions` | Tenant subscriptions | tenantId, planId, status |
| `feature_flags_catalog` | Flag definitions | key, type, defaultValue |
| `tenant_feature_flags` | Tenant overrides | tenantId, featureFlagId, value |
| `org_feature_flags` | Org overrides | organizationId, featureFlagId |
| `category_entitlements` | Category access | tenantId, category, enabled |
| `usage` | Usage metrics | tenantId, metric, value |

### Schema: `compliance.*`
| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `audit_logs` | Audit trail | action, resource, resourceId, severity |
| `gdpr_requests` | GDPR DSARs | requestType, status |

### Schema: `monitoring.*`
| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `incidents` | Incident tracking | title, status, severity |

---

## 5. Role Matrix

| Role | App Access | Scope |
|------|------------|-------|
| `super_admin` | All | Full platform access |
| `admin` | Backoffice | Tenant-wide admin |
| `saksbehandler` | Backoffice | Case handling, approvals |
| `org_admin` | Backoffice, MinSide | Org management, subdelegation |
| `org_member` | Backoffice, MinSide | Limited org scope |
| `user` | MinSide, Web | End-user booking |
| `citizen` | Web | Unauthenticated browsing |

---

## 6. Entitlement Categories

### Modules
`rating`, `recommendations`, `feedback`, `favorites`, `share`, `recurringBookings`

### Integrations
`visma`, `rco`, `acos`, `outlook`, `vipps`

### Features
`customBranding`, `advancedReporting`, `apiAccess`, `prioritySupport`

---

## 7. Test Infrastructure Summary

| Type | Location | Count |
|------|----------|-------|
| Unit | `tests/unit/` | 22+ files |
| Integration | `tests/integration/` | 12 files |
| E2E | `tests/e2e/` | 86+ specs |
| Security | `tests/security/` | 6 files |
| Performance | `tests/performance/` | 4 files |
| RBAC | `tests/rbac/` | 7 files |

---

## Next: Coverage Matrix

See [coverage-matrix.md](./coverage-matrix.md) for requirements → test mapping.
