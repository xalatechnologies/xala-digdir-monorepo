# System Intent

> **What This System IS**
> **Load Priority:** 1 (ALWAYS)

---

## Identity

**Name:** Xala Platform + Digilist Domain
**Type:** Multi-tenant SaaS platform for municipal booking/resource management
**Country:** Norway
**Compliance:** GDPR, Norwegian public sector requirements

---

## Architecture Model

```
┌────────────────────────────────────────────────────────────────────┐
│                      PLATFORM (Domain-Agnostic)                     │
│  @xalatechnologies/platform - Auth, Tenants, RBAC, Audit, Config   │
│  @xalatechnologies/enterprise - Feature flags, billing, plans      │
│  @xalatechnologies/governance - Testing, ESLint rules              │
└────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ EXTENDS
                                    ▼
┌────────────────────────────────────────────────────────────────────┐
│                        DOMAIN (Digilist-Specific)                   │
│  @digilist/domain - Business contracts, types                       │
│  @digilist/sdk - Services, hooks (extends platform SDK)             │
│  @digilist/ui - Feature kits (wraps platform UI patterns)           │
│  @digilist/database-schema - Domain tables only                     │
└────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ CONSUMED BY
                                    ▼
┌────────────────────────────────────────────────────────────────────┐
│                          APPLICATIONS                               │
│  apps/web - Public booking (5173)                                   │
│  apps/minside - User portal (5174)                                  │
│  apps/backoffice - Admin portal (5175)                              │
│  apps/api - Domain API (4000)                                       │
├────────────────────────────────────────────────────────────────────┤
│                     PLATFORM-ONLY APPS                              │
│  apps/saas-admin - SaaS management (5177) - NO @digilist imports   │
│  apps/monitoring-global - System health (5178) - NO @digilist      │
│  apps/docs-global - Platform docs (5179) - NO @digilist            │
│  apps/platform-api - Platform API (4001)                            │
└────────────────────────────────────────────────────────────────────┘
```

---

## Core Principle

**Platform NEVER imports Domain. Domain EXTENDS Platform.**

```typescript
// ✅ CORRECT: Domain imports platform
import { BaseService } from '@xalatechnologies/platform/sdk';

// ❌ FORBIDDEN: Platform imports domain
import { BookingService } from '@digilist/sdk'; // NEVER in platform
```

---

## Three-Layer Workspace Pattern

| Layer | Packages | Can Import | Runs In |
|-------|----------|------------|---------|
| Universal | `@xalatechnologies/platform/ui`, `/runtime`, `/config` | Platform universal only | Browser + Server |
| Server-only | `@xalatechnologies/platform-schema`, `/enterprise/server` | Platform + Node APIs | Server only |
| Tooling-only | `@xalatechnologies/governance` | Anything | Build time only |

---

## Success Metrics

1. Platform package builds independently (no workspace deps)
2. Domain packages depend only on platform + domain
3. Apps are thin (orchestration only, no business logic)
4. All UI goes through design system
5. All data access goes through SDK
