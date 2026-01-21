# Layer Map

> **Platform vs Domain vs App Boundaries**
> **Layer:** Boundaries

---

## Visual Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              APPLICATIONS                                    │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────┐│
│  │   web       │ │   minside   │ │  backoffice │ │ Platform-only apps      ││
│  │   :5173     │ │   :5174     │ │    :5175    │ │ saas-admin, monitoring, ││
│  │   Domain    │ │   Domain    │ │   Domain    │ │ docs-global             ││
│  └──────┬──────┘ └──────┬──────┘ └──────┬──────┘ └───────────┬─────────────┘│
│         │               │               │                    │              │
│         └───────────────┴───────────────┼────────────────────┘              │
│                                         │                                    │
│                    Uses @digilist/*     │       Uses @xalatechnologies/*    │
│                    (has booking logic)  │       (NO domain logic)           │
└─────────────────────────────────────────┼────────────────────────────────────┘
                                          │
                                          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DOMAIN LAYER (@digilist/*)                         │
│  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────────────────┐ │
│  │ @digilist/domain │ │ @digilist/sdk    │ │ @digilist/ui                 │ │
│  │ Contracts, types │ │ Services, hooks  │ │ Feature kits (thin wrappers) │ │
│  └────────┬─────────┘ └────────┬─────────┘ └───────────────┬──────────────┘ │
│           │                    │                           │                 │
│           └────────────────────┴───────────────────────────┘                 │
│                                │                                             │
│                    EXTENDS Platform                                          │
└────────────────────────────────┼─────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        PLATFORM LAYER (@xalatechnologies/*)                  │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │ @xalatechnologies/platform                                               ││
│  │ ├── /ui        Design system patterns (ResourceCard, SlotCalendar)      ││
│  │ ├── /runtime   Providers (Auth, Config, Theme)                          ││
│  │ ├── /config    Configuration utilities                                   ││
│  │ ├── /contracts Platform-level Zod schemas                               ││
│  │ ├── /sdk       HTTP client, error handling, base services               ││
│  │ ├── /i18n      Translation infrastructure                               ││
│  │ └── /observability  Metrics, logging, tracing                           ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │ @xalatechnologies/enterprise                                             ││
│  │ ├── /         Universal enterprise features (feature flags client)      ││
│  │ └── /server   Server-only (flag evaluation, billing integration)        ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │ @xalatechnologies/governance                                             ││
│  │ ├── /eslint   Custom ESLint rules                                       ││
│  │ ├── /testing  Test utilities                                            ││
│  │ └── /verification  Boundary check scripts                               ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │ @xalatechnologies/platform-schema (SERVER-ONLY)                          ││
│  │ Database tables: tenants, users, organizations, sessions, permissions   ││
│  └─────────────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Allowed Dependencies

| Consumer | Can Import |
|----------|------------|
| Platform packages | Platform packages only |
| Domain packages | Platform + Domain packages |
| Domain apps | Platform + Domain packages |
| Platform-only apps | Platform packages only |
| Server packages | Platform + Node.js APIs |
| Tooling | Anything (not shipped) |

---

## Forbidden Dependencies

| Consumer | CANNOT Import |
|----------|---------------|
| Platform packages | `@digilist/*` |
| Frontend apps | `*-schema` packages |
| UI components | Database/server code |
| Domain schema | Platform schema (no re-export) |

---

## App Classification

### Domain Apps (Use @digilist/*)

| App | Port | Purpose |
|-----|------|---------|
| `apps/web` | 5173 | Public booking portal |
| `apps/minside` | 5174 | User dashboard |
| `apps/backoffice` | 5175 | Admin portal |
| `apps/api` | 4000 | Domain API |

### Platform-Only Apps (NO @digilist/*)

| App | Port | Purpose |
|-----|------|---------|
| `apps/saas-admin` | 5177 | SaaS management |
| `apps/monitoring-global` | 5178 | System health |
| `apps/docs-global` | 5179 | Platform documentation |
| `apps/platform-api` | 4001 | Platform API |

---

## Verification

```bash
# Check platform apps have no domain imports
grep -r "@digilist" apps/saas-admin/src && exit 1 || echo "OK"
grep -r "@digilist" apps/monitoring-global/src && exit 1 || echo "OK"
grep -r "@digilist" apps/docs-global/src && exit 1 || echo "OK"

# Full boundary verification
pnpm verify:boundaries
```
