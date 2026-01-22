# Coverage Matrix

> **Last Updated**: 2026-01-18  
> **Status**: In Progress

## Requirements → Tests Mapping

### Authentication & Authorization

| Requirement | Test IDs | Status |
|-------------|----------|--------|
| Session creation/validation | `tests/unit/saas/*`, `tests/integration/rbac-flow.test.ts` | ✅ |
| Role-based access control | `tests/rbac/*`, `tests/e2e/backoffice/rbac/*` | ✅ |
| Tenant isolation | `tests/integration/rbac/*` | ✅ |
| Norwegian eID (BankID) | `tests/authentication/*` | ⚠️ Partial |

### Rental Objects

| Requirement | Test IDs | Status |
|-------------|----------|--------|
| CRUD operations | `tests/unit/rental-objects/*` | ✅ |
| Category filtering | `tests/unit/metadata/*` | ✅ |
| Public listing display | `tests/e2e/web/*` | ⚠️ Partial |
| Calendar availability | `tests/e2e/backoffice/crud/calendar.spec.ts` | ✅ |

### Bookings

| Requirement | Test IDs | Status |
|-------------|----------|--------|
| Single slot booking | `tests/e2e/booking/*` | ✅ |
| Recurring booking | `tests/e2e/booking/*` | ⚠️ Partial |
| Approval workflow | `tests/e2e/backoffice/workflows/*` | ✅ |
| Pricing calculation | `tests/unit/sdk-parity.test.ts` | ✅ |

### Organizations & Custody

| Requirement | Test IDs | Status |
|-------------|----------|--------|
| Org creation | `tests/e2e/backoffice/crud/organizations.spec.ts` | ✅ |
| Access grants | `tests/unit/custody-evaluator.test.ts` | ✅ |
| Subdelegation | `tests/unit/custody-evaluator.test.ts` | ⚠️ Partial |
| Org-scoped views | `tests/e2e/backoffice/org-*-flow.spec.ts` | ✅ |

### Entitlements & Feature Flags

| Requirement | Test IDs | Status |
|-------------|----------|--------|
| Module evaluation | `tests/unit/saas/feature-flag-evaluation.test.ts` | ✅ |
| Kill switch precedence | `tests/unit/saas/feature-flag-evaluation.test.ts` | ✅ |
| Sidebar filtering | `tests/e2e/backoffice/blur-eye/*` | ✅ |
| Server enforcement | `tests/integration/rbac/*` | ⚠️ Partial |

### SaaS Admin

| Requirement | Test IDs | Status |
|-------------|----------|--------|
| Plans management | `tests/e2e/saas-admin-flow.spec.ts` | ✅ |
| License keys | `tests/unit/saas/license-key.test.ts` | ✅ |
| Tenant management | `tests/e2e/tenant-admin-flow.spec.ts` | ✅ |
| Billing webhooks | - | ❌ Missing |

### Compliance

| Requirement | Test IDs | Status |
|-------------|----------|--------|
| WCAG 2.1 AA | `tests/e2e/accessibility/axe-audit.spec.ts` | ✅ |
| i18n nb/en | `tests/e2e/backoffice/compliance/localization.spec.ts` | ✅ |
| GDPR consent | `tests/integration/gdpr/*` | ⚠️ Partial |
| Audit logging | `tests/e2e/backoffice/blur-eye/audit-timeline.spec.ts` | ✅ |

---

## Role × Capability Matrix

| Capability | super_admin | admin | saksbehandler | org_admin | org_member | user |
|------------|:-----------:|:-----:|:-------------:|:---------:|:----------:|:----:|
| View all tenants | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Manage plans | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Manage tenant settings | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Manage rental objects | ✅ | ✅ | ❌ | ✅* | ❌ | ❌ |
| Approve bookings | ✅ | ✅ | ✅ | ✅* | ❌ | ❌ |
| View work queue | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Manage org members | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| Subdelegate custody | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| View assigned ROs | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Create bookings | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| View own bookings | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

*Limited to granted rental objects

---

## Gap Analysis

### ❌ Missing Tests (Priority High)
1. Billing webhook signature verification
2. Custody subdelegation E2E flow
3. Web booking modes (IN_GAME, RECURRING)
4. Calendar DST handling
5. Incident pipeline ingestion

### ⚠️ Partial Coverage
1. Norwegian eID integration (unit only, no E2E)
2. GDPR DSAR workflow
3. Load testing for hot paths
4. Mutation testing for booking rules

---

## Next Steps

1. Create `schema-coverage.json`
2. Create `rbac-entitlements-matrix.md`
3. Implement missing custody E2E tests
4. Wire CI pipelines (PR + Nightly)
