# Universal SaaS AI Governance System

> **Domain-Agnostic AI Operating Model for Multi-Product SaaS Platforms**
> **Works with Cursor / Claude / Windsurf / Copilot / Custom LLMs**
> **Last Updated:** 2026-01-20

---

## Core Philosophy

**AI is a SYSTEM ENGINEER, not a feature generator.**

```
✅ AI understands architecture before acting
✅ AI treats applications as shells, not logic containers
✅ AI treats UI as presentation, not decision makers
✅ AI treats APIs as the single source of truth
✅ AI treats configuration as data, not code
❌ AI does NOT guess or invent domain rules
```

**If context is insufficient → STOP and ASK.**

---

## Universal SaaS Architecture Model

All SaaS systems decompose into these layers:

```
┌─────────────────────────────────────────────────────────────┐
│                    APPLICATIONS                              │
│  Routes · Wrappers · Composition only · ZERO business logic │
├─────────────────────────────────────────────────────────────┤
│                    UI PLATFORM                               │
│  Design System · Tokens · Components · Blocks · Pages        │
├─────────────────────────────────────────────────────────────┤
│                    SDK / CLIENT INTERFACE                    │
│  Typed Client · Hooks · Caching · NO transformations         │
├─────────────────────────────────────────────────────────────┤
│                    API LAYER (Contract-First)                │
│  Typed DTOs · Versioned Endpoints · RFC7807 Errors           │
├─────────────────────────────────────────────────────────────┤
│                    DOMAIN LAYER (Product-Specific)           │
│  Business Rules · Workflows · State Machines · Validation    │
├─────────────────────────────────────────────────────────────┤
│                    CORE PLATFORM (Shared)                    │
│  Auth · RBAC · Tenants · Feature Flags · Config · Audit     │
└─────────────────────────────────────────────────────────────┘
```

---

## Quick Start

### Mode A: New SaaS Creation
```bash
# 1. Initialize AI governance
mkdir -p ai
cp templates/ai/*.md ai/

# 2. Customize PLATFORM_OVERVIEW.md
# 3. Run initial audit
/audit architecture

# 4. Implement step-by-step
/implement step 1
```

### Mode B: Existing SaaS Audit
```bash
# 1. Run full audit
/audit

# 2. Review gap matrix
/plan migration

# 3. Execute approved steps
/implement step 1
/verify
```

### Mode C: Multi-Product Platform
```bash
# Apply same rules across all repos
for repo in product-a product-b product-c; do
  cd $repo && /audit && cd ..
done
```

---

## Agent System

### Hierarchy

```
                    ┌─────────────────┐
                    │    GOVERNOR     │ ← Final authority
                    │   (Root Agent)  │
                    └────────┬────────┘
                             │
    ┌────────────────────────┼────────────────────────┐
    │                        │                        │
    ▼                        ▼                        ▼
┌──────────────┐   ┌─────────────────┐   ┌──────────────┐
│   Platform   │   │     Domain      │   │    Test &    │
│   Architect  │   │    Modeling     │   │   Quality    │
└──────┬───────┘   └─────────────────┘   └──────────────┘
       │
       ├── API & Contract Agent
       ├── UI / Design System Agent
       ├── App Thinness Agent
       └── Documentation Agent
```

### Agent Responsibilities

| Agent | Scope | Forbidden |
|-------|-------|-----------|
| Governor | All decisions | Writing code |
| Platform Architect | Layers, boundaries | Domain logic |
| Domain Modeling | Entities, workflows | UI, infra |
| API & Contract | DTOs, errors, versioning | UI, storage |
| UI / Design System | Tokens, components | Business logic |
| App Thinness | Presentation purity | Making exceptions |
| Test & Quality | Coverage, journeys | Shortcuts |
| Documentation | Accuracy, onboarding | Assumptions |

---

## Commands

### Audit Commands
```
/audit                  Full system audit
/audit architecture     Layering and dependencies
/audit apps             Thin app compliance
/audit api              Contracts and DTOs
/audit ui               Design system compliance
/audit security         Security posture
/audit tests            Coverage analysis
```

### Plan Commands
```
/plan                   Phased improvement plan
/plan migration         Non-breaking refactor plan
/plan domain <entity>   Domain model clarification
```

### Execute Commands
```
/implement step <n>     Execute one step only
/verify                 Validate changes
/block                  Hard stop
/explain <decision>     Reasoning explanation
```

---

## Required Training Corpus

Every SaaS repo must have these files in `/ai/`:

| File | Purpose | Template |
|------|---------|----------|
| `PLATFORM_OVERVIEW.md` | What this SaaS is | Required |
| `ARCHITECTURE.md` | Layers and boundaries | Required |
| `PRINCIPLES.md` | Non-negotiables | Required |
| `ANTI_PATTERNS.md` | What never to do | Required |
| `UI_RULES.md` | Design system rules | Required |
| `API_RULES.md` | Contract rules | Required |
| `TESTING_RULES.md` | Test requirements | Required |
| `CHANGE_PROCESS.md` | Lifecycle | Required |

---

## Safety Rules

AI MUST refuse to:

| Action | Why |
|--------|-----|
| Write code without architecture clarity | May violate boundaries |
| Add logic to UI | Leaks domain into presentation |
| Bypass APIs | Breaks contract-first |
| Add config in apps | Leaks environment into code |
| Guess domain rules | May be legally/business wrong |
| Modify multiple layers at once | Too risky for review |

**Violations → Governor Agent BLOCKS execution.**

---

## Success Criteria

| Metric | Target |
|--------|--------|
| New SaaS bootstraps safely | ✅ |
| Architecture stable as team grows | ✅ |
| AI outputs predictable | ✅ |
| UI remains consistent | ✅ |
| Build errors decrease | ✅ |
| Tech debt controlled | ✅ |

---

## Templates

See `/ai/templates/` for starting templates:
- `PLATFORM_OVERVIEW.template.md`
- `ARCHITECTURE.template.md`
- `PRINCIPLES.template.md`
- `ANTI_PATTERNS.template.md`
- `UI_RULES.template.md`
- `API_RULES.template.md`
- `TESTING_RULES.template.md`
- `CHANGE_PROCESS.template.md`

---

## Integration

### Cursor Rules
```
# .cursorrules
Read /ai/PRINCIPLES.md before any code change.
Run /audit before implementing.
Follow /ai/ANTI_PATTERNS.md strictly.
```

### Claude Projects
Add to knowledge base:
- `/ai/ARCHITECTURE.md`
- `/ai/PRINCIPLES.md`
- `/ai/ANTI_PATTERNS.md`

### CI/CD
```yaml
# .github/workflows/ai-compliance.yml
- name: Architecture Compliance
  run: pnpm run ai:audit --ci
```
