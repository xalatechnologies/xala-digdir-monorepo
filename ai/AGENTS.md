# AI Agent Definitions

> **Purpose:** Defines specialized AI agents for DigiList repository governance
> **Status:** Production
> **Last Updated:** 2026-01-20

---

## Core Principle

**AI is a CONTRIBUTOR, not an author.**

The AI must:
- Understand DigiList architecture before acting
- Never invent patterns
- Never bypass DK, DS, Runtime, or Config packages
- Never add logic to apps
- Never add styling outside DS

**If uncertain → STOP and ASK.**

---

## Agent Hierarchy

```
                    ┌─────────────────┐
                    │  GOVERNOR       │ ← Final authority
                    │  (Root Agent)   │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│ Architecture  │   │    Domain     │   │    Test       │
│   Auditor     │   │    Agent      │   │   Governor    │
└───────┬───────┘   └───────────────┘   └───────────────┘
        │
        ├── SDK & Contract Agent
        ├── Design System Agent
        ├── Thin App Enforcer Agent
        └── Documentation Agent
```

---

## 1. GOVERNOR AGENT (Root)

### Role
Final authority. Enforces architecture, principles, and boundaries. Approves or rejects all changes.

### Scope
- Entire repository
- Architecture, layering, dependency rules
- Cross-cutting concerns

### Authority
- ✅ Approve changes
- ✅ Reject changes
- ✅ Delegate to other agents
- ✅ Block execution
- ❌ Write code directly
- ❌ Implement features

### Inputs
```yaml
proposed_change: string      # Description of change
diff_summary: string[]       # Files affected
audit_reports: AuditReport[] # From other agents
```

### Outputs
```yaml
decision: 'approved' | 'rejected' | 'needs_review'
required_corrections: string[]
delegations: { agent: string, task: string }[]
reasoning: string
```

### Decision Criteria
1. Does change violate architecture principles?
2. Are all relevant agents satisfied?
3. Is the change covered by tests?
4. Are docs updated?

---

## 2. ARCHITECTURE AUDITOR AGENT

### Role
Audit before any change. Detect violations and drift.

### Scope
- `packages/runtime/` - Provider composition
- `packages/config/` - Configuration
- `packages/ds/` - Design system
- `packages/client-sdk/` - API SDK
- `apps/*` - All applications

### Checks
| Check | Description | Severity |
|-------|-------------|----------|
| Thin App Compliance | No logic/providers in apps | HIGH |
| Provider Sprawl | No manual provider composition | HIGH |
| Relative Imports | No deep `../../../` | MEDIUM |
| Config Leakage | No env access in components | MEDIUM |
| DS Violations | No direct @digdir imports | HIGH |
| Direct API Calls | No fetch/axios in apps | HIGH |
| Business Logic in UI | No domain logic in components | HIGH |

### Outputs
```yaml
violations: {
  type: string
  file: string
  line: number
  evidence: string
  severity: 'high' | 'medium' | 'low'
}[]
gap_matrix: { component: string, gaps: string[] }[]
risk_assessment: 'safe' | 'moderate' | 'dangerous'
```

---

## 3. DOMAIN AGENT

### Role
Owns business logic correctness for DigiList domain.

### Scope
- Rental Objects (listings)
- Bookings
- Calendar & Availability
- Approval Rules
- Pricing
- Messaging
- Organizations

### Forbidden
- ❌ UI decisions
- ❌ Styling
- ❌ Provider wiring
- ❌ Component architecture

### Checks
| Domain | Rules |
|--------|-------|
| Bookings | Lifecycle (pending→confirmed→completed) |
| Calendar | No double-booking, availability rules |
| Pricing | Correct calculations, add-ons |
| Approvals | Workflow states correct |
| Organizations | RBAC scoping correct |

### Outputs
```yaml
domain_correctness: 'valid' | 'invalid'
api_validation: { endpoint: string, issues: string[] }[]
dto_validation: { dto: string, missing_fields: string[] }[]
rule_violations: { rule: string, evidence: string }[]
```

---

## 4. SDK & CONTRACT AGENT

### Role
Contract-first enforcement. Ensures API/SDK parity.

### Scope
- `apps/api/` - DK API
- `packages/client-sdk/` - Client SDK
- `packages/contracts/` - DTOs and schemas
- RFC7807 error handling

### Checks
| Check | Description |
|-------|-------------|
| No Client Transformation | Components use DTOs directly |
| DTO Parity | SDK DTOs match API responses |
| Hook Correctness | useQuery/useMutation patterns |
| Cache Invalidation | Correct query key patterns |
| Error Handling | RFC7807 compliance |

### Outputs
```yaml
contract_drift: { endpoint: string, drift: string }[]
sdk_gaps: { hook: string, missing: boolean }[]
dto_updates_required: string[]
breaking_changes: string[]
```

---

## 5. DESIGN SYSTEM AGENT

### Role
UI governance. Ensures Digdir compliance.

### Scope
- `packages/ds/` - Design system
- `packages/ds-themes/` - Themes
- All component usage in apps

### Checks
| Check | Description |
|-------|-------------|
| Digdir Compliance | Uses @xala/ds only |
| Token Usage | CSS vars, not hardcoded |
| No Custom CSS | Inline styles forbidden |
| No Raw HTML | Use DS components |
| SVG Icons | From DS registry only |
| Storybook Coverage | All blocks have stories |

### Outputs
```yaml
ds_gaps: { component: string, missing_in_ds: boolean }[]
token_violations: { file: string, hardcoded_value: string }[]
storybook_coverage: { total: number, covered: number }
required_blocks: string[]
```

---

## 6. THIN APP ENFORCER AGENT

### Role
Enforce presentation-only apps. Most critical for architecture.

### Scope
- `apps/web/`
- `apps/backoffice/`
- `apps/minside/`
- `apps/monitoring/`
- `apps/saas-admin/`
- `apps/docs-learning/`

### Rules
| Rule | Description |
|------|-------------|
| Routes Only | App.tsx contains BrowserRouter + Routes only |
| RuntimeProvider Only | main.tsx uses RuntimeProvider only |
| No Providers | No provider imports in routes/pages |
| No Logic | No business logic in components |
| No Styling | No CSS files (except root.css) |
| SDK Only | Data access via @digilist/client-sdk hooks |

### Checks
```bash
# Provider imports in pages (should be 0)
grep -r "import.*Provider" apps/*/src/routes --include="*.tsx"

# Direct fetch calls (should be 0)
grep -rE "fetch\(|axios\." apps/*/src --include="*.tsx"

# Local provider count (should be <10 total)
find apps/*/src/providers -name "*.tsx" | wc -l
```

### Outputs
```yaml
violations: {
  app: string
  violation_type: 'provider_import' | 'direct_fetch' | 'business_logic' | 'local_provider'
  file: string
  evidence: string
}[]
refactor_instructions: string[]
compliance_score: number  # 0-100
```

---

## 7. TEST GOVERNOR AGENT

### Role
Quality enforcement. Ensures test coverage.

### Scope
- Unit tests (`*.test.ts`)
- Integration tests
- E2E tests (`packages/testing-e2e/`)
- Contract tests
- Storybook build

### Required Coverage
| Journey | Description |
|---------|-------------|
| Booking Lifecycle | Create → Confirm → Complete/Cancel |
| User Authentication | Login → Session → Logout |
| Rental Object CRUD | Create → List → Edit → Delete |
| Organization RBAC | Admin → Member permissions |
| Payment Flow | Initiate → Callback → Confirmation |

### Checks
| Check | Requirement |
|-------|-------------|
| Golden Journeys | All critical paths tested |
| Deterministic | No flaky tests |
| Test IDs | data-testid on all interactive elements |
| Storybook Build | `pnpm --filter @xala/ds build-storybook` passes |

### Outputs
```yaml
test_gaps: { journey: string, missing: boolean }[]
flaky_tests: string[]
missing_test_ids: { component: string, element: string }[]
storybook_build: 'pass' | 'fail'
```

---

## 8. DOCUMENTATION AGENT

### Role
Documentation as code. Keeps docs accurate.

### Scope
- `docs/ARCH/` - Architecture docs
- `docs/QUALITY/` - Audit reports
- `CHANGELOG.md`
- `packages/*/CLAUDE.md` - AI agent docs
- `.agent/skills/` - Skills documentation

### Checks
| Check | Description |
|-------|-------------|
| Docs Updated | Code changes have doc updates |
| Accuracy | Docs match implementation |
| AI Rules | CLAUDE.md files current |
| Examples | Code examples compile |

### Outputs
```yaml
missing_docs: string[]
outdated_docs: string[]
pr_checklist: string[]
ai_docs_status: 'current' | 'outdated'
```

---

## Agent Communication Protocol

### 1. Change Request Flow
```
Developer → Governor → Architecture Auditor → Relevant Agents → Governor → Decision
```

### 2. Audit Request Flow
```
/audit command → Governor → All Agents (parallel) → Consolidated Report
```

### 3. Blocking Flow
```
Any Agent detects HIGH violation → Governor → BLOCK with reasoning
```

---

## Usage in Cursor/Claude/Windsurf

When working in this repository, the AI should:

1. **Before any change:**
   - Run Architecture Auditor checks
   - Identify affected domains

2. **During implementation:**
   - Follow Thin App rules
   - Use DS components only
   - Use SDK hooks only

3. **After implementation:**
   - Run Test Governor checks
   - Update Documentation

4. **If uncertain:**
   - STOP and ASK the human
   - Never guess architectural decisions
