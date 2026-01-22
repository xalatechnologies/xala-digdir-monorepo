# SaaS Admin Coverage Matrix

> Test coverage mapping for all SaaS Admin modules.
> Generated: 2026-01-18

## Test Organization

| Suite Type | Location | Purpose |
|------------|----------|---------|
| Unit | `tests/unit/saas/` | Core logic validation |
| Integration | `tests/integration/saas/` | API + DB tests |
| Security | `tests/security/saas/` | IDOR, privilege, secrets |
| E2E | `tests/e2e/saas-admin/` | Full UI journeys |
| RBAC | `tests/rbac/` | Role-based access |
| Contracts | `tests/contracts/` | DTO snapshots |

---

## Module Coverage Matrix

### ✅ = Complete | 🔶 = Partial | ❌ = Missing

| Module | Unit | Integration | E2E | Security | RBAC | Audit |
|--------|------|-------------|-----|----------|------|-------|
| Tenants | ❌ | ❌ | 🔶 | ❌ | ❌ | ❌ |
| Plans | ❌ | ❌ | 🔶 | ❌ | ❌ | ❌ |
| Subscriptions | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| License Keys | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Feature Flags | ❌ | ❌ | 🔶 | ❌ | ❌ | ❌ |
| Billing | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Secrets | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Branding | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Seeds | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Categories | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## Requirements → Tests Mapping

### Tenant Management

| Requirement | Test ID | Test Type | Status |
|-------------|---------|-----------|--------|
| Create tenant with valid data | SAAS-T-001 | Integration | ❌ |
| Reject duplicate slug | SAAS-T-002 | Integration | ❌ |
| Suspend tenant with reason | SAAS-T-003 | Integration | ❌ |
| Reactivate suspended tenant | SAAS-T-004 | Integration | ❌ |
| Update seat limits | SAAS-T-005 | Integration | ❌ |
| List tenants with pagination | SAAS-T-006 | E2E | 🔶 |
| Filter tenants by status | SAAS-T-007 | E2E | 🔶 |
| **IDOR**: Cannot access other tenant | SAAS-T-SEC-001 | Security | ❌ |

### License Keys

| Requirement | Test ID | Test Type | Status |
|-------------|---------|-----------|--------|
| Key format: XALA-XXXX-XXXX-XXXX-XXXX | SAAS-LK-001 | Unit | ❌ |
| Key uniqueness (no collisions) | SAAS-LK-002 | Unit | ❌ |
| Key entropy (crypto secure) | SAAS-LK-003 | Unit | ❌ |
| Hash correctness (SHA-256) | SAAS-LK-004 | Unit | ❌ |
| Mask shows last 8 chars only | SAAS-LK-005 | Unit | ❌ |
| Rotate invalidates old key | SAAS-LK-006 | Integration | ❌ |
| Key scoped to tenant | SAAS-LK-007 | Integration | ❌ |
| **Security**: Key never in logs | SAAS-LK-SEC-001 | Security | ❌ |
| **Security**: Key never in response | SAAS-LK-SEC-002 | Security | ❌ |

### Feature Flags

| Requirement | Test ID | Test Type | Status |
|-------------|---------|-----------|--------|
| Precedence: tenant > plan > global | SAAS-FF-001 | Unit | ❌ |
| Module entitlements eval | SAAS-FF-002 | Unit | ❌ |
| Integration entitlements eval | SAAS-FF-003 | Unit | ❌ |
| Toggle flag persists to DB | SAAS-FF-004 | Integration | ❌ |
| UI toggle reflects change | SAAS-FF-005 | E2E | ❌ |
| Flag change emits audit event | SAAS-FF-006 | Integration | ❌ |

### Plans & Subscriptions

| Requirement | Test ID | Test Type | Status |
|-------------|---------|-----------|--------|
| Create plan with entitlements | SAAS-P-001 | Integration | ❌ |
| Assign plan to tenant | SAAS-P-002 | Integration | ❌ |
| Plan entitlements propagate | SAAS-P-003 | Integration | ❌ |
| List plans with status filter | SAAS-P-004 | E2E | 🔶 |

### Billing (Mock)

| Requirement | Test ID | Test Type | Status |
|-------------|---------|-----------|--------|
| Returns mock billing data | SAAS-B-001 | Integration | ❌ |
| Billing overview stats | SAAS-B-002 | Integration | ❌ |

### RBAC

| Requirement | Test ID | Test Type | Status |
|-------------|---------|-----------|--------|
| SAAS_SUPER_ADMIN: full access | SAAS-RBAC-001 | RBAC | ❌ |
| SAAS_BILLING_ADMIN: billing only | SAAS-RBAC-002 | RBAC | ❌ |
| SAAS_SUPPORT_AGENT: read only | SAAS-RBAC-003 | RBAC | ❌ |
| Unauthenticated → 401 | SAAS-RBAC-004 | RBAC | 🔶 |
| Wrong role → 403 | SAAS-RBAC-005 | RBAC | ❌ |

### Compliance

| Requirement | Test ID | Test Type | Status |
|-------------|---------|-----------|--------|
| WCAG 2.1 AA baseline | SAAS-A11Y-001 | E2E | 🔶 |
| Keyboard navigation | SAAS-A11Y-002 | E2E | ❌ |
| nb/en localization | SAAS-I18N-001 | E2E | ❌ |
| No hardcoded strings | SAAS-I18N-002 | E2E | ❌ |
| No console errors | SAAS-QUAL-001 | E2E | 🔶 |

---

## Quality Gates

All tests enforce:
- ❌ No console errors (non-allowlisted)
- ❌ No pageerror/unhandledrejection
- ❌ No 5xx API responses
- ❌ No missing i18n keys
- ❌ Cross-tenant access impossible

---

## Run Commands

```bash
# Unit tests
pnpm test --filter=@digilist/api -- --testPathPattern=tests/unit/saas

# Integration tests
pnpm test --filter=@digilist/api -- --testPathPattern=tests/integration/saas

# E2E tests
pnpm exec playwright test tests/e2e/saas-admin/ --config=playwright.saas-admin.config.ts

# RBAC tests
pnpm test --filter=@digilist/api -- --testPathPattern=tests/integration/rbac

# Security tests
pnpm test --filter=@digilist/api -- --testPathPattern=tests/security/saas
```

---

_Last Updated: 2026-01-18_
