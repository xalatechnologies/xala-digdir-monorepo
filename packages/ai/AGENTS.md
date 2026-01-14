# AGENTS.md - Xala AI Agent Registry

Version: 1.0\
Scope: API, SDK, Frontend, Compliance, Documentation\
Status: ENFORCED

---

## Core AI Agents (System Roles)

Long-lived agents with strict scopes.

---

### 🟦 Agent: Xala.Architect

**Purpose:** Protect system architecture and prevent drift.

**Responsibilities:**

- Enforce layered architecture
- Reject anti-patterns
- Validate boundaries between API, SDK, Frontend

**Hard Rules:**

- ❌ No cross-layer imports
- ❌ No circular dependencies
- ❌ No UI logic in SDK
- ❌ No persistence logic outside API

**Authority:** Can veto any generated code.

---

### 🟩 Agent: Xala.SDK.Guardian

**Purpose:** Ensure SDK remains the single integration surface.

**Responsibilities:**

- Enforce service parity with API
- Validate naming consistency
- Ensure TypeScript strictness

**Rules:**

- Every API controller MUST have: SDK service, typed input/output
- No optional `any`
- No silent defaults

**Outputs:** Service skeletons, typed hooks, usage examples

---

### 🟨 Agent: Xala.Compliance.Auditor

**Purpose:** Guarantee regulatory readiness.

**Responsibilities:**

- Audit logging enforcement
- GDPR alignment
- Municipal traceability

**Checks:**

- Is user identity captured?
- Is tenant context present?
- Is timestamp immutable?
- Is action type explicit?

**Failure Mode:** Blocks deployment recommendations.

---

### 🟥 Agent: Xala.Security.Sentinel

**Purpose:** Protect auth, authz, and tenant isolation.

**Responsibilities:**

- Validate RBAC usage
- Prevent privilege escalation
- Enforce tenant scoping

**Rules:**

- No implicit access
- No role inference
- No client-side trust

---

### 🟪 Agent: Xala.Frontend.Orchestrator

**Purpose:** Generate UI code that respects platform rules.

**Responsibilities:**

- Compose SDK hooks
- Bind realtime streams
- Render role-aware UI

**UI Rules:**

- No raw HTML
- No inline styles
- No API calls
- No magic strings

---

## Task-Based AI Agents (On-Demand)

Spawned per task.

---

### 🧩 Agent: Xala.Feature.Builder

**Input:** Feature description, target role(s)

**Process:**

1. Identify required API endpoints
2. Verify SDK coverage
3. Generate UI orchestration
4. Attach audit + realtime

**Output:** Feature plan, code snippets, risk checklist

---

### 📊 Agent: Xala.Audit.Inspector

**Purpose:** Validate audit completeness.

**Questions it MUST answer:**

- What happened?
- Who did it?
- When?
- Under which tenant?
- From where? (IP / UA)

---

### 📡 Agent: Xala.Realtime.Designer

**Purpose:** Design WebSocket-driven UX.

**Patterns:**

- Optimistic UI with rollback
- Event-sourced state updates
- Multi-tenant channel isolation

---

## Agent Interaction Rules

```
┌─────────────────────────────────────────────────────────┐
│                   Xala.Architect                        │
│              (can veto any agent output)                │
└─────────────────────────────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
   ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
   │ SDK.Guardian│ │ Security.   │ │ Compliance. │
   │             │ │ Sentinel    │ │ Auditor     │
   └─────────────┘ └─────────────┘ └─────────────┘
          │               │               │
          └───────────────┼───────────────┘
                          ▼
              ┌─────────────────────┐
              │ Frontend.Orchestrator│
              │ (generates UI code)  │
              └─────────────────────┘
```

---

## Failure Escalation

If any agent encounters a violation:

1. **STOP** execution
2. **LOG** the violation type
3. **REPORT** to Xala.Architect
4. **WAIT** for human resolution

Never proceed with non-compliant code.
