# Testing Audit - Digilist Platform

## Repository Inventory

### Apps (7)

| App | Purpose | Test Coverage |
|-----|---------|---------------|
| `api` | Fastify backend API | Integration, Unit |
| `web` | Public-facing Next.js site | E2E (basic) |
| `backoffice` | Admin Vite app | E2E (extensive) |
| `minside` | User portal Vite app | E2E (basic) |
| `saas-admin` | Platform admin Vite app | E2E (extensive) |
| `tenant-admin` | Tenant admin Vite app | E2E (basic) |
| `docs-learning` | Documentation portal | E2E (basic) |

### Packages (11)

| Package | Purpose | Test Coverage |
|---------|---------|---------------|
| `@xala/contracts` | DTOs, types, constants | Unit |
| `@xala/client-sdk` | React Query hooks | Unit (sdk-parity) |
| `@xala/ds` | Design system components | Unit (components) |
| `@xala/ds-registry` | Component registry | None |
| `@xala/ds-themes` | Theme tokens | None |
| `@xala/eslint-config` | ESLint rules | Unit (eslint) |
| `@xala/i18n` | Localization | Scan reports |
| `@xala/auth` | Auth utilities | Integration |
| `@xala/sdk-core` | Core SDK utilities | None |
| `@xala/ai` | AI utilities | None |
| `@xala/docs-content` | MDX content | None |

### Database (37 Migrations, 94+ Tables)

#### Schema Files
- `index.ts` (45KB) - Main schema with 94+ table definitions
- `policy.ts` - Policy engine tables
- `modules.ts` - Module catalog tables
- `rental-objects.ts` - Rental object domain
- `rental-domain.ts` - Rental domain extensions
- `files.ts` - File storage tables
- `gdpr-requests.ts` - GDPR compliance
- `notification-preferences.ts` - Push preferences

#### Key Tables (Alphabetical)
| Table | Schema | Purpose |
|-------|--------|---------|
| `tenants` | platform | Multi-tenant core |
| `organizations` | platform | Org management |
| `users` | platform | User accounts |
| `sessions` | platform | Authentication |
| `access_grants` | domain | RBAC grants |
| `permission_assignments` | platform | Permissions |
| `case_handler_scopes` | platform | Scope delegation |
| `plans` | saas | Subscription plans |
| `subscriptions` | saas | Tenant subscriptions |
| `feature_flags_catalog` | saas | Feature flags |
| `rental_objects` | domain | Core listings |
| `bookings` | domain | Reservations |
| `calendar_blocks` | domain | Availability |
| `pricing_rules` | domain | Dynamic pricing |
| `invoices` | domain | Billing |
| `reviews` | domain | Ratings |
| `favorites` | domain | User favorites |
| `messages` | domain | Conversations |
| `notifications` | domain | Alerts |
| `audit_events` | domain | Audit trail |
| `policy_sets` | domain | Policy engine |

### API Routes (Estimated 150+)

#### Core Routes (from main.ts)
| Prefix | Domain | Auth |
|--------|--------|------|
| `/api/auth` | Authentication | Mixed |
| `/api/users` | User management | Authenticated |
| `/api/organizations` | Org management | Authenticated |
| `/api/tenants` | Tenant management | Admin |
| `/api/rental-objects` | Listings | Mixed |
| `/api/bookings` | Reservations | Authenticated |
| `/api/calendar` | Availability | Mixed |
| `/api/pricing` | Pricing | Mixed |
| `/api/payments` | Transactions | Authenticated |
| `/api/invoices` | Billing | Authenticated |
| `/api/reviews` | Feedback | Mixed |
| `/api/messages` | Conversations | Authenticated |
| `/api/notifications` | Alerts | Authenticated |
| `/api/audit` | Audit trail | Admin |
| `/api/gdpr` | GDPR requests | Authenticated |
| `/api/modules` | Module flags | Admin |
| `/api/features` | Feature flags | Admin |
| `/api/public/*` | Public endpoints | None |

### Integrations

| Integration | Status | Test Coverage |
|-------------|--------|---------------|
| RCO (Locks) | Implemented | None |
| Signicat (ID-porten) | Implemented | E2E (basic) |
| Vipps (Payments) | Implemented | None |
| Visma (Invoicing) | Implemented | None |
| Webhook System | Implemented | None |
| Email (SMTP) | Implemented | None |
| Storage (Files) | Implemented | None |
| Geocoding | Implemented | None |

### Auth Model

- **Session-based**: JWT in HttpOnly cookies
- **Multi-tenant**: Tenant context in session
- **RBAC**: Role-based with permissions
- **eID**: ID-porten via Signicat

---

## Current Test Coverage

### Existing Test Suites

| Type | Location | Tests | Status |
|------|----------|-------|--------|
| Unit | `tests/unit/` | 100+ | ✅ Active |
| Integration | `tests/integration/` | 40+ | ✅ Active |
| E2E | `tests/e2e/` | 150+ | ✅ Active |
| Performance | `tests/performance/` | 15+ | ✅ Active |
| Security | `tests/security/` | 50+ | ✅ Active |
| Journeys | `tests/journeys/` | 130+ | ✅ Active |

### Coverage by Area

| Area | Unit | Integration | E2E | Gap |
|------|------|-------------|-----|-----|
| Auth/Session | ✅ | ✅ | ✅ | None |
| RBAC | ✅ | ✅ | ✅ | None |
| Rental Objects | ⚠️ | ⚠️ | ✅ | DB tests |
| Bookings | ⚠️ | ⚠️ | ⚠️ | Full coverage |
| Pricing | ❌ | ❌ | ❌ | Complete |
| Payments | ❌ | ❌ | ❌ | Complete |
| GDPR | ⚠️ | ❌ | ⚠️ | Integration |
| i18n | ✅ | N/A | ⚠️ | E2E checks |
| WCAG | ⚠️ | N/A | ⚠️ | Axe tests |

---

## Gap Analysis

### Critical Gaps (P0)

1. **Booking Engine Tests** - Missing full workflow coverage
2. **Pricing Engine Tests** - No coverage
3. **Payment Integration Tests** - No coverage
4. **Contract Tests** - SDK drift detection missing
5. **WCAG Automation** - Axe integration incomplete
6. **Multi-tenant Isolation** - DB-level tests missing

### High Priority (P1)

1. **Schema Coverage** - No table/column constraint tests
2. **API Contract Tests** - No OpenAPI snapshot tests
3. **Integration Mocks** - RCO, Vipps stubs missing
4. **Rate Limiting Tests** - Missing
5. **GDPR Evidence** - DSAR workflow incomplete

### Medium Priority (P2)

1. **Performance Baselines** - SLO thresholds undefined
2. **Mutation Testing** - Not implemented
3. **CI Pipeline** - Nightly jobs incomplete
4. **Dashboard Module** - Observability not tested

---

## Confidence Score Baseline

| Metric | Current | Target |
|--------|---------|--------|
| Auth/Session | 95% | 95% |
| RBAC | 90% | 95% |
| Booking Engine | 30% | 95% |
| Pricing | 0% | 90% |
| Payments | 0% | 90% |
| GDPR | 40% | 90% |
| WCAG | 50% | 90% |
| i18n | 70% | 95% |
| Schema | 10% | 95% |
| Contracts | 20% | 95% |
| **Overall** | **40%** | **90%** |

---

*Generated: 2026-01-17*
