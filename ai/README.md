# DigiList AI Governance System

> **Repository Intelligence for Cursor / Claude / Windsurf / Copilot**
> **Prevents architectural drift permanently**
> **Last Updated:** 2026-01-20

---

## Quick Start

### For Humans

```bash
# Run full audit
/audit

# Check thin-app compliance
/audit thin-app

# Plan a migration
/plan migrate-runtime apps/web

# Verify changes
/verify
```

### For LLMs

Read these documents in order:
1. `PRINCIPLES.md` - Non-negotiable rules
2. `ARCHITECTURE.md` - System overview
3. `ANTI_PATTERNS.md` - What NOT to do

---

## Directory Structure

```
ai/
├── README.md              # This file
├── AGENTS.md              # Agent definitions (8 agents)
├── SKILLS.md              # Skill catalog
├── COMMANDS.md            # Command reference
├── ARCHITECTURE.md        # System overview
├── PRINCIPLES.md          # Non-negotiables
├── ANTI_PATTERNS.md       # Forbidden patterns
├── DS_RULES.md            # Design System rules
├── SDK_RULES.md           # SDK usage rules
├── TESTING_RULES.md       # Testing requirements
└── CHANGE_MANAGEMENT.md   # Change process
```

---

## Core Principles

### AI is a CONTRIBUTOR, not an author

```
✅ AI may: Fix violations, refactor to patterns, add tests
❌ AI must NOT: Invent patterns, bypass packages, add logic to apps
```

### Non-Negotiables

| Rule | Enforcement |
|------|-------------|
| SDK-First | No fetch/axios in apps |
| DS-First | No @digdir/* imports |
| Runtime-First | No manual providers |
| Contract-First | No local type definitions |
| i18n-First | No hardcoded strings |

---

## Agents

| Agent | Scope | Role |
|-------|-------|------|
| Governor | All | Final authority |
| Architecture Auditor | All | Detect violations |
| Domain | Business logic | Rule enforcement |
| SDK & Contract | API/SDK | Contract parity |
| Design System | UI | DS compliance |
| Thin App Enforcer | Apps | Presentation-only |
| Test Governor | Tests | Quality enforcement |
| Documentation | Docs | Accuracy |

---

## Commands

### Audit
```
/audit                    Full repo audit
/audit thin-app           Thin app only
/audit runtime            Provider analysis
/audit ds                 Design system
/audit sdk                SDK/API drift
```

### Plan
```
/plan migrate-runtime     Runtime centralization
/plan thin-app            App refactor
/plan alias-migration     Import aliases
```

### Execute
```
/implement step <n>       Execute one step
/verify                   Validation checklist
/block                    Hard stop
```

---

## Change Process

```
AUDIT → PLAN → IMPLEMENT → VERIFY
        ↓         ↓          ↓
     Approve   One step   Checklist
                at a time   pass
```

---

## Integration

### Cursor Rules

Add to `.cursorrules`:
```
Read /ai/PRINCIPLES.md before any code change.
Run /audit before implementing.
Follow /ai/ANTI_PATTERNS.md strictly.
```

### Claude Projects

Add to project knowledge:
- `/ai/ARCHITECTURE.md`
- `/ai/PRINCIPLES.md`
- `/ai/ANTI_PATTERNS.md`

### CI/CD

See `.github/workflows/ai-compliance.yml` for automated checks.

---

## File References

| Document | Purpose |
|----------|---------|
| `/ai/AGENTS.md` | Agent definitions |
| `/ai/SKILLS.md` | Skill catalog |
| `/ai/COMMANDS.md` | Command reference |
| `/ai/ARCHITECTURE.md` | System overview |
| `/ai/PRINCIPLES.md` | Non-negotiables |
| `/ai/ANTI_PATTERNS.md` | Forbidden patterns |
| `/ai/DS_RULES.md` | Design System |
| `/ai/SDK_RULES.md` | SDK usage |
| `/ai/TESTING_RULES.md` | Testing |
| `/ai/CHANGE_MANAGEMENT.md` | Change process |

---

## Quick Violations Check

```bash
# Thin app violations
grep -r "import.*Provider" apps/*/src/routes --include="*.tsx"

# Direct fetch
grep -rE "fetch\(" apps/*/src --include="*.tsx"

# Direct @digdir
grep -r "@digdir/designsystemet" apps/*/src --include="*.tsx"

# Deep relatives
grep -rE "from ['\"]\.\.\/\.\.\/\.\.\/" apps packages --include="*.tsx"
```

---

## Success Criteria

This system succeeds when:
- ✅ New devs can't accidentally break architecture
- ✅ AI outputs are predictable and consistent
- ✅ Runtime/build errors decrease
- ✅ Apps remain presentation-only
- ✅ DS is the only UI surface
- ✅ SDK is the only data surface
