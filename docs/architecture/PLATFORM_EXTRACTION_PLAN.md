# Platform Monorepo Extraction Plan

## Overview

This document defines the extraction plan for creating a new **platform monorepo** (`xala-platform`) from the current Digilist monorepo. After extraction, there will be two separate repositories:

1. **xala-platform** - Domain-agnostic platform for building SaaS applications
2. **xala-digilist** - Domain-specific Digilist rental booking application

---

## Target Repository Structure

### Platform Monorepo (`xala-platform`)

```
xala-platform/
├── apps/
│   ├── saas-admin/              # @xalatechnologies/saas-admin (port 5177)
│   ├── monitoring-global/       # @xalatechnologies/monitoring-global (port 5178)
│   ├── docs-global/             # @xalatechnologies/docs-global (port 5180)
│   └── platform-api/            # @xalatechnologies/platform-api (port 4001)
│
├── packages/
│   ├── platform/                # @xalatechnologies/platform
│   │   ├── ui/                  # Design system patterns
│   │   ├── auth/                # Authentication
│   │   ├── config/              # Configuration
│   │   ├── runtime/             # Runtime providers
│   │   ├── contracts/           # Platform contracts
│   │   ├── sdk/                 # SDK core (HTTP, errors)
│   │   ├── i18n/                # Internationalization
│   │   └── observability/       # Metrics, logging
│   ├── database-schema/         # @xalatechnologies/database-schema
│   │   ├── core/                # tenants, users, organizations
│   │   ├── platform/            # sessions, memberships
│   │   ├── saas/                # plans, entitlements
│   │   └── compliance/          # audit, gdpr
│   ├── enterprise/              # @xalatechnologies/enterprise
│   └── governance/              # @xalatechnologies/governance
│
├── infra/                       # Infrastructure templates
├── docs/                        # Platform documentation
└── package.json
```

### Domain Monorepo (`xala-digilist`)

```
xala-digilist/
├── apps/
│   ├── web/                     # @digilist/web (port 5173)
│   ├── minside/                 # @digilist/minside (port 5174)
│   ├── backoffice/              # @digilist/backoffice (port 5175)
│   ├── monitoring/              # @digilist/monitoring (port 5178)
│   ├── docs-learning/           # @digilist/docs-learning (port 5179)
│   └── api/                     # @digilist/api (port 4000)
│
├── packages/
│   ├── domain/                  # @digilist/domain
│   ├── sdk/                     # @digilist/sdk (client-sdk)
│   ├── ui/                      # @digilist/ui (feature kits)
│   ├── runtime/                 # @digilist/runtime
│   ├── database-schema/         # @digilist/database-schema
│   │   └── domain/              # rental-objects, bookings, etc.
│   ├── testing/                 # @digilist/testing
│   └── testing-e2e/             # @digilist/testing-e2e
│
├── infra/                       # Digilist-specific infra
├── docs/                        # Domain documentation
└── package.json
```

---

## Package Migration Map

### Platform Packages (Extract to xala-platform)

| Current Package | Target Package | Description |
|----------------|----------------|-------------|
| `packages/platform` | `@xalatechnologies/platform` | Core platform package |
| `packages/platform-database-schema` | `@xalatechnologies/database-schema` | Platform database tables |
| `packages/enterprise` | `@xalatechnologies/enterprise` | Enterprise features |
| `packages/governance` | `@xalatechnologies/governance` | Testing, linting |

### Domain Packages (Stay in xala-digilist)

| Current Package | Target Package | Description |
|----------------|----------------|-------------|
| `packages/client-sdk` | `@digilist/sdk` | Domain SDK |
| `packages/digilist-ui` | `@digilist/ui` | Feature kits |
| `packages/digilist-runtime` | `@digilist/runtime` | Runtime providers |
| `packages/digilist-contracts` | `@digilist/contracts` | Domain contracts |
| `packages/digilist-domain` | `@digilist/domain` | Domain types |
| `packages/database-schema` | `@digilist/database-schema` | Domain database tables |
| `packages/testing` | `@digilist/testing` | Test utilities |
| `packages/testing-e2e` | `@digilist/testing-e2e` | E2E helpers |

---

## App Migration Map

### Platform Apps (Extract to xala-platform)

| Current App | Target App | Port | Description |
|-------------|------------|------|-------------|
| `apps/saas-admin` | `@xalatechnologies/saas-admin` | 5177 | SaaS management |
| `apps/monitoring-global` | `@xalatechnologies/monitoring-global` | 5178 | Platform monitoring |
| `apps/docs-global` | `@xalatechnologies/docs-global` | 5180 | Platform docs |

### Domain Apps (Stay in xala-digilist)

| Current App | Target App | Port | Description |
|-------------|------------|------|-------------|
| `apps/web` | `@digilist/web` | 5173 | Public booking |
| `apps/minside` | `@digilist/minside` | 5174 | User portal |
| `apps/backoffice` | `@digilist/backoffice` | 5175 | Admin portal |
| `apps/monitoring` | `@digilist/monitoring` | 5178 | Tenant monitoring |
| `apps/docs-learning` | `@digilist/docs-learning` | 5179 | Training portal |
| `apps/api` | `@digilist/api` | 4000 | Domain API |

---

## API Module Split

### Platform API Modules (Extract)

```
platform-api/src/modules/
├── auth/                    # Authentication
├── authz/                   # Authorization
├── tenant/                  # Tenant management
├── user/                    # User management
├── organizations/           # Organization management
├── audit/                   # Audit logging
├── gdpr/                    # GDPR compliance
├── health/                  # Health checks
├── monitoring/              # System monitoring
├── notifications/           # Notification system
├── notification-system/     # Multi-channel notifications
├── push-notifications/      # Push notifications
├── policy/                  # Route/nav policies
├── menu/                    # Menu system
├── entitlements/            # Plan entitlements
├── saas/                    # SaaS management
├── billing/                 # Billing/invoices
├── license/                 # License management
├── seat-limits/             # Seat limits
├── feature-flags/           # Feature flags
├── capabilities/            # Capabilities
├── permission-assignment/   # Permission assignments
├── case-handler-scope/      # Case handler scopes
├── access-grant/            # Access grants
├── storage/                 # File storage
├── translations/            # i18n
├── websocket/               # WebSocket server
├── settings/                # System settings
├── configuration/           # Configuration
├── integrations/            # Third-party integrations
├── webhooks/                # Webhooks
└── security/                # Security
```

### Domain API Modules (Stay)

```
api/src/modules/
├── rental-objects/          # Rental object CRUD
├── rental-object-details/   # Rental object details
├── bookings/                # Booking management
├── booking/                 # Booking flow
├── calendar/                # Calendar/availability
├── availability/            # Availability checking
├── blocks/                  # Calendar blocks
├── allocations/             # Resource allocations
├── seasonal-lease/          # Seasonal leases
├── seasons/                 # Season management
├── season-applications/     # Season applications
├── custody/                 # Custody management
├── pricing/                 # Pricing rules
├── discount-codes/          # Discount codes
├── favorites/               # User favorites
├── amenities/               # Amenities
├── addons/                  # Add-on services
├── search/                  # Search functionality
├── reviews/                 # Reviews
├── domain/                  # Domain-specific
└── widgets/                 # Widgets
```

---

## Database Schema Split

### Platform Schemas (Extract)

| Schema | Tables |
|--------|--------|
| `platform.*` | tenants, users, organizations, sessions, org_memberships, permission_assignments, case_handler_scopes, branding_tokens, branding_versions, auth_demo_tokens, translations |
| `saas.*` | plans, plan_entitlements, route_policies, nav_policies, roles, feature_flags, permissions, kill_switches, feature_limits |
| `compliance.*` | audit_logs, gdpr_requests |

### Domain Schemas (Stay)

| Schema | Tables |
|--------|--------|
| `domain.*` | rental_objects, bookings, allocations, seasonal_leases, conversations, messages, seasons, season_applications, priority_rules, access_grants, reviews, favorites, custody_states, custody_transitions |

---

## Dependency Direction

```
┌─────────────────────────────────────────────────────────────┐
│                     xala-platform                            │
│  @xalatechnologies/platform                                 │
│  @xalatechnologies/database-schema                          │
│  @xalatechnologies/enterprise                               │
│  @xalatechnologies/governance                               │
└─────────────────────────────────────────────────────────────┘
                              ▲
                              │ depends on (NPM package)
                              │
┌─────────────────────────────────────────────────────────────┐
│                     xala-digilist                            │
│  @digilist/sdk (depends on @xalatechnologies/platform)      │
│  @digilist/ui (depends on @xalatechnologies/platform/ui)    │
│  @digilist/runtime (depends on @xalatechnologies/platform)  │
│  @digilist/database-schema (depends on @xalatechnologies)   │
└─────────────────────────────────────────────────────────────┘
```

---

## Extraction Steps

### Phase 1: Prepare Platform Repository

1. Create new `xala-platform` repository
2. Copy platform packages with git history
3. Set up CI/CD for platform
4. Configure NPM publishing

### Phase 2: Update Domain Repository

1. Remove extracted platform packages
2. Add `@xalatechnologies/platform` as NPM dependency
3. Update imports across all apps
4. Verify builds and tests pass

### Phase 3: API Split (Optional)

1. Create `platform-api` in xala-platform
2. Extract platform modules from current API
3. Configure API gateway/proxy for routing
4. Update SDKs to call correct API

### Phase 4: Verification

1. Run full test suite on both repos
2. Deploy to staging environments
3. Verify cross-repo communication
4. Update documentation

---

## Success Criteria

- [ ] Platform packages build independently in new repo
- [ ] Platform packages publish to NPM
- [ ] Domain repo installs platform as NPM dependency
- [ ] All apps build successfully
- [ ] All tests pass
- [ ] No circular dependencies
- [ ] Documentation updated

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Breaking changes during extraction | Use semantic versioning, deprecation notices |
| Git history loss | Use `git filter-branch` or `git subtree split` |
| CI/CD disruption | Parallel CI/CD until stable |
| API compatibility | Version platform API, maintain backward compat |
| Team confusion | Clear documentation, migration guides |

---

## Timeline Estimate

| Phase | Duration | Dependencies |
|-------|----------|--------------|
| Phase 1: Prepare Platform | 1 week | None |
| Phase 2: Update Domain | 1 week | Phase 1 complete |
| Phase 3: API Split | 2 weeks | Phase 2 complete |
| Phase 4: Verification | 1 week | Phase 3 complete |

**Total: ~5 weeks**

---

**Status:** PLAN READY FOR REVIEW
**Created:** 2026-01-21
**Last Updated:** 2026-01-21
