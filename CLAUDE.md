# CLAUDE.md - Xala AI Governance System

## System Context

You are operating inside the **Xala / Digilist Platform** - a Norwegian
municipal booking and resource management system.

**System Characteristics:**

- Multi-tenant (kommune-level isolation)
- Audit-first (all mutations logged for compliance)
- SDK-driven (@digilist/client-sdk is THE integration layer)
- RFC 7807 compliant (Problem Details for errors)
- RBAC enforced (role-based access control)
- Production live

---

## Non-Negotiable Rules

### 1. SDK-FIRST RULE

```
❌ NEVER generate direct API calls (fetch, axios, graphql)
✅ ONLY use @digilist/client-sdk
```

If SDK lacks a method → **report gap, do NOT bypass**.

### 2. NO BUSINESS LOGIC IN UI

- React components = orchestration + rendering only
- All logic lives in: API, SDK services, typed hooks

### 3. RFC 7807 COMPLIANCE

All errors MUST conform to Problem Details:

```typescript
interface ProblemDetails {
  type: string; // URI identifying error type
  title: string; // Human-readable summary
  status: number; // HTTP status code
  detail?: string; // Human-readable explanation
}
```

### 4. AUDIT-FIRST PRINCIPLE

- Any state mutation MUST be auditable
- If action is not logged → **block implementation**
- Required audit fields: `who`, `what`, `when`, `tenantId`, `ip/ua`

### 5. RBAC IS SOURCE OF TRUTH

- Feature access derives from role matrix
- No role checks hardcoded in UI
- Use capability-based guards

---

## Architecture Layers

```
┌─────────────────────────────────────────────┐
│  FRONTEND (React)                           │
│  - Orchestration only                       │
│  - Uses SDK hooks                           │
│  - No API calls, no business logic          │
├─────────────────────────────────────────────┤
│  SDK (@digilist/client-sdk)                 │
│  - Typed services                           │
│  - React Query hooks                        │
│  - Realtime WebSocket client                │
├─────────────────────────────────────────────┤
│  API (Fastify)                              │
│  - Business logic                           │
│  - Persistence (Drizzle/Postgres)           │
│  - Audit logging                            │
└─────────────────────────────────────────────┘
```

**Cross-layer imports are FORBIDDEN.**

---

## UI Rules

| Rule       | Correct       | Incorrect     |
| :--------- | :------------ | :------------ |
| Components | `@xala/ds`    | Raw HTML      |
| Styling    | Design tokens | Inline styles |
| Data       | SDK hooks     | `fetch()`     |
| Constants  | i18n keys     | Magic strings |

---

## Failure Modes

**STOP and ask for clarification if:**

- SDK method does not exist
- Role matrix is ambiguous
- Audit event type is undefined
- Tenant context is missing
- Error contract is unclear

---

## Custom Skills

### `sdk_only_execution`

Refuse to generate code that bypasses the SDK.

Trigger Phrases: "just fetch", "quick axios", "temporary call"

Response: `❌ Direct API calls are not allowed. Use @digilist/client-sdk.`

### `audit_enforcement`

Verify audit logging for every state mutation. If missing: stop, explain,
propose audit-safe alternative.

### `rbac_reasoning`

Reason in terms of roles and capabilities, not UI permissions. Output: Role →
Capability → Feature mapping.

### `production_realism`

Assume system is live, multi-tenant, and regulated.

**Forbidden phrases:**

- "In a real system you would…"
- "For simplicity…"

---

## Canonical Prompt Header

Use this at the start of complex tasks:

```
You are operating inside the Xala / Digilist Platform.

System is:
- Multi-tenant
- Audit-first
- SDK-driven
- RFC 7807 compliant
- RBAC enforced
- Production live

Rules:
- No direct API calls
- No business logic in UI
- All mutations must be audited
- Realtime events must be considered
- SDK is the only integration layer

If any rule cannot be satisfied, STOP and report.
```
