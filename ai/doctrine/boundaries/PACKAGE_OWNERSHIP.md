# Package Ownership

> **Who Owns What**
> **Layer:** Boundaries

---

## Package Registry

### Platform Packages (@xalatechnologies/*)

| Package | Owner | Purpose | Layer |
|---------|-------|---------|-------|
| `@xalatechnologies/platform` | Platform Team | Core platform utilities | Universal |
| `@xalatechnologies/platform/ui` | Platform Team | Design system patterns | Universal |
| `@xalatechnologies/platform/runtime` | Platform Team | React providers | Universal |
| `@xalatechnologies/platform/config` | Platform Team | Configuration | Universal |
| `@xalatechnologies/platform/contracts` | Platform Team | Platform contracts | Universal |
| `@xalatechnologies/platform/sdk` | Platform Team | HTTP client, errors | Universal |
| `@xalatechnologies/platform/i18n` | Platform Team | Translations | Universal |
| `@xalatechnologies/platform/observability` | Platform Team | Metrics, logging | Universal |
| `@xalatechnologies/platform-schema` | Platform Team | Database schema | Server-only |
| `@xalatechnologies/enterprise` | Platform Team | Enterprise features | Universal |
| `@xalatechnologies/enterprise/server` | Platform Team | Server enterprise | Server-only |
| `@xalatechnologies/governance` | Platform Team | Testing, ESLint | Tooling |

### Domain Packages (@digilist/*)

| Package | Owner | Purpose | Layer |
|---------|-------|---------|-------|
| `@digilist/domain` | Domain Team | Business contracts | Universal |
| `@digilist/sdk` | Domain Team | Services, hooks | Universal |
| `@digilist/ui` | Domain Team | Feature kits | Universal |
| `@digilist/runtime` | Domain Team | Domain providers | Universal |
| `@digilist/database-schema` | Domain Team | Domain tables | Server-only |
| `@digilist/testing` | Domain Team | Test utilities | Tooling |
| `@digilist/testing-e2e` | Domain Team | E2E helpers | Tooling |

---

## Feature Ownership

### Platform Features

These features are PLATFORM-owned (domain-agnostic):

| Feature | Package | Notes |
|---------|---------|-------|
| Authentication | `@xalatechnologies/platform/auth` | BankID, OAuth |
| Authorization (RBAC) | `@xalatechnologies/platform/authz` | Roles, permissions |
| Multi-tenancy | `@xalatechnologies/platform-schema` | Tenant isolation |
| Audit logging | `@xalatechnologies/platform-schema` | Compliance |
| Feature flags | `@xalatechnologies/enterprise` | A/B testing |
| Billing | `@xalatechnologies/enterprise` | Plans, subscriptions |
| Notifications | `@xalatechnologies/platform` | Channels, templates |
| Configuration | `@xalatechnologies/platform/config` | Environment, settings |

### Domain Features

These features are DOMAIN-owned (Digilist-specific):

| Feature | Package | Notes |
|---------|---------|-------|
| Rental objects | `@digilist/sdk` | Properties, venues |
| Bookings | `@digilist/sdk` | Reservations |
| Availability | `@digilist/sdk` | Calendars, slots |
| Pricing | `@digilist/sdk` | Rates, discounts |
| Seasons | `@digilist/sdk` | Seasonal leases |
| Reviews | `@digilist/sdk` | Ratings, comments |
| Search | `@digilist/sdk` | Discovery, filters |

---

## UI Component Ownership

### Platform UI Patterns

Generic, domain-agnostic patterns:

| Component | Location | Props Interface |
|-----------|----------|-----------------|
| `ResourceCard` | `@xalatechnologies/platform/ui/patterns` | `ResourceCardProps` |
| `ResourceGrid` | `@xalatechnologies/platform/ui/patterns` | `ResourceGridProps` |
| `SlotCalendar` | `@xalatechnologies/platform/ui/patterns` | `SlotCalendarProps` |
| `PricingSummary` | `@xalatechnologies/platform/ui/patterns` | `PricingSummaryProps` |
| `FeatureChips` | `@xalatechnologies/platform/ui/patterns` | `FeatureChipsProps` |
| `FormWizardModal` | `@xalatechnologies/platform/ui/patterns` | `FormWizardModalProps` |

### Domain UI Feature Kits

Thin wrappers that map domain DTOs to platform patterns:

| Feature Kit | Location | Wraps |
|-------------|----------|-------|
| `RentalObjectCard` | `@digilist/ui/features/rental-objects` | `ResourceCard` |
| `RentalObjectGrid` | `@digilist/ui/features/rental-objects` | `ResourceGrid` |
| `BookingCalendar` | `@digilist/ui/features/booking` | `SlotCalendar` |
| `PriceSummaryCard` | `@digilist/ui/features/booking` | `PricingSummary` |
| `AmenityChips` | `@digilist/ui/features/rental-objects` | `FeatureChips` |

---

## Modification Rights

### Who Can Modify What

| Package Type | Can Be Modified By |
|--------------|-------------------|
| Platform packages | Platform team only |
| Domain packages | Domain team + Platform team |
| Apps | App team + Domain team |
| Tooling | Anyone (dev tooling) |

### Change Process

```
Platform change → Platform team review → Merge
Domain change → Domain team review → Platform approval if boundary touched
App change → App team review → Domain approval if shared component touched
```

---

## New Package Checklist

Before creating a new package:

1. [ ] Determine ownership (Platform vs Domain)
2. [ ] Determine layer (Universal vs Server vs Tooling)
3. [ ] Choose namespace (`@xalatechnologies/*` vs `@digilist/*`)
4. [ ] Define allowed imports
5. [ ] Add to package registry above
6. [ ] Add ESLint boundary rules
7. [ ] Get approval from owning team
