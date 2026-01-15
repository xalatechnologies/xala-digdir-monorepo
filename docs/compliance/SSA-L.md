# SSA-L Compliance Matrix

## Overview

This document provides a tender-ready compliance matrix mapping **SSA-L** (Statens Standardavtale for Leveranser)
requirements to the Digilist/Xala SaaS Platform implementation. Each clause references specific roadmap items
for traceability.

**Document Version:** 1.0.0
**Last Updated:** 2026-01-15
**Platform:** Digilist/Xala Municipal Booking System

---

## Status Legend

| Status | Description |
|--------|-------------|
| DONE | Fully implemented and verified |
| PARTIAL | Partially implemented, gaps remain |
| MISSING | Not implemented, required |
| PLANNED | Scheduled for future implementation |

---

## Compliance Matrix

| SSA-L Clause | Requirement | Implementation | Roadmap Ref | Status |
|-------------|-------------|----------------|-------------|--------|
| 1.3 | Role separation | RBAC enforced at API layer with capability-based guards in UI | P0-02 | PARTIAL |
| 2.1 | Audit logging | Audit service with structured events for all mutations | P5-01 | PARTIAL |
| 2.2 | Traceability | Full mutation logging with who, what, when, tenantId, ip/ua context | P5-01 | PARTIAL |
| 3.1 | Access control | Capability-based guards derived from role matrix | P0-02 | PARTIAL |
| 3.2 | Authentication | Session management with token refresh and continuity | P1-01 | PARTIAL |
| 4.1 | Availability | Monitoring, alerting, and health check endpoints | P5-01 | PLANNED |
| 5.1 | GDPR compliance | Data access controls and comprehensive audit logging | P0-02, P5-01 | PARTIAL |
| 6.1 | Change management | Tenant configuration management with version control | P4-01 | PLANNED |
| 7.1 | Documentation | Comprehensive CLAUDE.md, roadmap.yml, and compliance docs | ALL | DONE |

---

## Detailed Clause Analysis

### 1.3 Role Separation

**Requirement:** Clear separation of roles with defined responsibilities and access levels.

**Current Implementation:**
- RBAC defined at API layer via middleware
- Role matrix includes: admin, case-handler, viewer, auditor, public-user
- UI uses capability-based guards (not hardcoded role checks)

**Gaps:**
- Role matrix documentation incomplete
- Some frontend components have hardcoded role checks

**Roadmap Reference:** [P0-02](../roadmap.yml#L44-L67)

---

### 2.1 Audit Logging

**Requirement:** All significant actions must be logged with sufficient detail for audit purposes.

**Current Implementation:**
- Audit service in `@digilist/client-sdk` for structured events
- Booking creation, approval decisions logged
- WebSocket realtime audit stream available

**Gaps:**
- Not all mutation endpoints have audit events
- Some edge cases missing context fields

**Roadmap Reference:** [P5-01](../roadmap.yml#L196-L223)

---

### 2.2 Traceability

**Requirement:** Actions must be traceable to specific users, times, and tenants.

**Current Implementation:**
- Audit events include: who, what, when, tenantId
- IP address and user agent captured where applicable
- Tenant isolation at query level

**Gaps:**
- Diff tracking for listing changes incomplete
- Some events missing correlation IDs

**Roadmap Reference:** [P5-01](../roadmap.yml#L196-L223)

---

### 3.1 Access Control

**Requirement:** Appropriate access controls for all system functions.

**Current Implementation:**
- API endpoints validate roles via middleware
- SDK provides capability-aware hooks
- Multi-tenant data isolation enforced

**Gaps:**
- Some UI components bypass capability guards
- Permission caching strategy needs review

**Roadmap Reference:** [P0-02](../roadmap.yml#L44-L67)

---

### 3.2 Authentication

**Requirement:** Secure authentication with session management.

**Current Implementation:**
- Token-based authentication with refresh mechanism
- Session state management across apps
- Secure cookie handling

**Gaps:**
- Session continuity during auth redirects needs improvement
- Multi-tab synchronization incomplete

**Roadmap Reference:** [P1-01](../roadmap.yml#L68-L94)

---

### 4.1 Availability

**Requirement:** System availability with appropriate monitoring and alerting.

**Current Implementation:**
- Health check endpoints at `/api/health`
- Basic Sentry error tracking

**Gaps:**
- Comprehensive monitoring dashboard not implemented
- Alerting thresholds not configured
- SLA tracking not in place

**Roadmap Reference:** [P5-01](../roadmap.yml#L196-L223)

---

### 5.1 GDPR Compliance

**Requirement:** Compliance with GDPR data protection requirements.

**Current Implementation:**
- Data access controlled via RBAC
- Audit logging for data access patterns
- Tenant isolation prevents cross-tenant data leakage

**Gaps:**
- Data export functionality incomplete
- Right to deletion workflow not fully automated

**Roadmap Reference:** [P0-02](../roadmap.yml#L44-L67), [P5-01](../roadmap.yml#L196-L223)

---

### 6.1 Change Management

**Requirement:** Controlled change management processes.

**Current Implementation:**
- Git-based version control
- Turborepo build pipeline
- ESLint guardrails for architecture compliance

**Gaps:**
- Runtime tenant configuration changes not tracked
- Theme switching audit trail missing

**Roadmap Reference:** [P4-01](../roadmap.yml#L169-L195)

---

### 7.1 Documentation

**Requirement:** Comprehensive system documentation.

**Current Implementation:**
- CLAUDE.md provides architecture rules and patterns
- roadmap.yml tracks implementation progress
- SSA-L.md (this document) maps compliance requirements

**Status:** COMPLETE

**Roadmap Reference:** ALL phases contribute to documentation

---

## Verification Commands

```bash
# Verify all clauses documented
grep -c '^|' compliance/SSA-L.md

# Validate roadmap references exist
grep -oE 'P[0-6]-[0-9]{2}' compliance/SSA-L.md | sort -u

# Cross-reference with roadmap
for ref in $(grep -oE 'P[0-6]-[0-9]{2}' compliance/SSA-L.md | sort -u); do
  grep -q "id: $ref" roadmap.yml && echo "$ref: FOUND" || echo "$ref: MISSING"
done
```

---

## Auditor Notes

1. **Multi-Tenant Architecture:** This platform serves multiple Norwegian municipalities (kommuner) with strict data isolation.

2. **SDK-First Mandate:** All frontend apps must use `@digilist/client-sdk` exclusively - no direct API calls allowed.

3. **Audit Trail:** All mutations are logged for compliance. The audit service provides both synchronous logging and WebSocket streaming.

4. **Role Matrix:** The system enforces RBAC with roles: admin, case-handler, viewer, auditor, public-user.

5. **Gap Remediation:** Items marked PARTIAL or PLANNED have associated roadmap items with defined next actions.

---

## Contact

For compliance inquiries, refer to the project roadmap at `roadmap.yml` or contact the platform team.
