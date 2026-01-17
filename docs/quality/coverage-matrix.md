# Requirements → Tests Coverage Matrix

## Overview

This document maps SSA-L tender requirements to specific test files and validates coverage.

---

## Tender Requirements Mapping

### K-1: Minimum 40 Rental Objects

| Requirement | Test | Status |
|-------------|------|--------|
| Support 40+ rental objects | `tests/integration/schema/schema-coverage.test.ts` | ✅ |
| Seed 40+ objects for demo | `apps/api/src/database/seeds/rental-objects.seed.ts` | ✅ |
| Browse/filter all objects | `tests/e2e/web/listing-browse.spec.ts` | ⚠️ |

### K-2: Demo Solution (Citizen + Admin + Case Handler)

| Requirement | Test | Status |
|-------------|------|--------|
| Citizen journey | `tests/e2e/web/` | ⚠️ |
| Admin journey | `tests/e2e/backoffice/` | ✅ |
| Case handler journey | `tests/journeys/auth-rbac.spec.ts` | ✅ |

### K-3: Secure Authentication (ID-porten)

| Requirement | Test | Status |
|-------------|------|--------|
| ID-porten integration | `tests/e2e/auth-flow-all-apps.spec.ts` | ✅ |
| Session management | `tests/journeys/auth-rbac-comprehensive.spec.ts` | ✅ |
| RBAC enforcement | `tests/integration/rbac-flow.test.ts` | ✅ |

### K-4: Recurring Bookings / Seasonal Leasing

| Requirement | Test | Status |
|-------------|------|--------|
| Single event booking | `tests/e2e/booking/single-slot.spec.ts` | ❌ |
| Recurring booking | `tests/e2e/booking/recurring.spec.ts` | ❌ |
| Seasonal leasing | `tests/e2e/seasonal-application-workflow.test.ts` | ✅ |

### K-5: Payment at Booking

| Requirement | Test | Status |
|-------------|------|--------|
| Payment integration | `tests/e2e/booking/payment.spec.ts` | ❌ |
| Vipps integration | `tests/integration/payments/vipps.test.ts` | ❌ |

### K-6: WCAG 2.1 Compliance

| Requirement | Test | Status |
|-------------|------|--------|
| Automated Axe checks | `tests/e2e/accessibility/axe-audit.spec.ts` | ❌ |
| Keyboard navigation | `tests/e2e/accessibility/keyboard.spec.ts` | ❌ |
| Screen reader | Manual | ⚠️ |

### K-7: Rule Conditions per Locale

| Requirement | Test | Status |
|-------------|------|--------|
| Approval rules | `tests/e2e/booking/approval.spec.ts` | ❌ |
| Age limits | `tests/unit/booking/validation.test.ts` | ❌ |
| Terms acceptance | `tests/e2e/booking/terms.spec.ts` | ❌ |

### K-8: Integrations (RCO, Archive, Visma)

| Requirement | Test | Status |
|-------------|------|--------|
| RCO locks | `tests/integration/rco/locks.test.ts` | ❌ |
| Archive (Acos) | `tests/integration/archive/acos.test.ts` | ❌ |
| Visma Enterprise | `tests/integration/payments/visma.test.ts` | ❌ |

### K-9: GDPR / Privacy by Design

| Requirement | Test | Status |
|-------------|------|--------|
| Data subject rights | `tests/integration/gdpr/dsar.test.ts` | ❌ |
| Data export | `tests/e2e/gdpr/export.spec.ts` | ❌ |
| Consent management | `tests/integration/gdpr/consent.test.ts` | ❌ |

### K-10: Cloud Security

| Requirement | Test | Status |
|-------------|------|--------|
| EU/EØS data locality | Infrastructure | ✅ |
| TLS encryption | `tests/security/headers.test.ts` | ❌ |
| Security headers | `tests/security/headers.test.ts` | ❌ |
| Vulnerability scanning | CI/CD | ⚠️ |

---

## API Endpoint Coverage

### Authentication (`/api/auth`)

| Endpoint | Auth | Contract | Negative | E2E |
|----------|------|----------|----------|-----|
| `POST /login` | N/A | ✅ | ✅ | ✅ |
| `POST /logout` | ✅ | ✅ | ✅ | ✅ |
| `GET /session` | ✅ | ✅ | ✅ | ✅ |
| `POST /refresh` | ✅ | ⚠️ | ⚠️ | ⚠️ |

### Rental Objects (`/api/rental-objects`)

| Endpoint | Auth | Contract | Negative | E2E |
|----------|------|----------|----------|-----|
| `GET /` | ✅ | ⚠️ | ⚠️ | ✅ |
| `GET /:id` | ✅ | ⚠️ | ⚠️ | ✅ |
| `POST /` | ✅ | ❌ | ❌ | ⚠️ |
| `PUT /:id` | ✅ | ❌ | ❌ | ⚠️ |
| `DELETE /:id` | ✅ | ❌ | ❌ | ❌ |

### Bookings (`/api/bookings`)

| Endpoint | Auth | Contract | Negative | E2E |
|----------|------|----------|----------|-----|
| `GET /` | ✅ | ❌ | ❌ | ⚠️ |
| `POST /` | ✅ | ❌ | ❌ | ❌ |
| `PUT /:id` | ✅ | ❌ | ❌ | ❌ |
| `DELETE /:id` | ✅ | ❌ | ❌ | ❌ |

### Pricing (`/api/pricing`)

| Endpoint | Auth | Contract | Negative | E2E |
|----------|------|----------|----------|-----|
| `POST /preview` | ⚠️ | ❌ | ❌ | ❌ |
| `GET /rules/:id` | ✅ | ❌ | ❌ | ❌ |

---

## Database Table Coverage

### Platform Schema

| Table | Constraints | CRUD | Isolation | Audit |
|-------|-------------|------|-----------|-------|
| tenants | ✅ | ⚠️ | N/A | ⚠️ |
| users | ✅ | ⚠️ | ✅ | ⚠️ |
| sessions | ✅ | ✅ | ✅ | ✅ |
| organizations | ✅ | ⚠️ | ✅ | ⚠️ |

### Domain Schema

| Table | Constraints | CRUD | Isolation | Audit |
|-------|-------------|------|-----------|-------|
| rental_objects | ✅ | ⚠️ | ⚠️ | ⚠️ |
| bookings | ✅ | ❌ | ⚠️ | ⚠️ |
| calendar_blocks | ⚠️ | ❌ | ⚠️ | ❌ |
| pricing_rules | ⚠️ | ❌ | ⚠️ | ❌ |

---

## Role-Based Coverage (RBAC Matrix)

| Role | Read | Create | Update | Delete | Admin |
|------|------|--------|--------|--------|-------|
| Public | ✅ | ❌ | ❌ | ❌ | ❌ |
| User | ✅ | ⚠️ | ⚠️ | ❌ | ❌ |
| OrgMember | ✅ | ⚠️ | ⚠️ | ❌ | ❌ |
| Saksbehandler | ✅ | ✅ | ✅ | ⚠️ | ❌ |
| Admin | ✅ | ✅ | ✅ | ✅ | ✅ |
| TenantAdmin | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## Legend

- ✅ Covered
- ⚠️ Partial
- ❌ Missing

---

## Next Actions

1. Create missing booking E2E tests
2. Add WCAG/Axe automation
3. Implement GDPR DSAR tests
4. Add integration mock tests
5. Complete API contract snapshots

---

*Generated: 2026-01-17*
