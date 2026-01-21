# Xala Platform AI Governance System

> **Machine-Operable Doctrine for LLM Assistants**
> **Repository Intelligence for Cursor / Claude / Windsurf / Copilot**
> **Prevents architectural drift permanently**
> **Last Updated:** 2026-01-21

---

## Quick Start

### For LLMs

**Load in this order:**

1. `bootstrap/BOOTSTRAP_INDEX.md` - Load order and context check
2. `bootstrap/SYSTEM_INTENT.md` - What this system IS
3. `bootstrap/NON_NEGOTIABLES.md` - Rules that CANNOT be violated
4. `bootstrap/OUTPUT_CONTRACT.md` - Expected response format
5. `bootstrap/SAFETY_RAILS.md` - When to STOP and ask

**Then load as needed:**
- `doctrine/boundaries/` - Package and layer boundaries
- `doctrine/patterns/` - How to do things right
- `doctrine/anti-patterns/` - What NOT to do
- `doctrine/runbooks/` - Step-by-step guides

### For Humans

```bash
# Run full audit
pnpm verify:boundaries

# Check terminology
pnpm verify:terms

# Build everything
pnpm build

# Run tests
pnpm test:run
```

---

## Directory Structure

```
ai/
├── README.md                           # This file
│
├── bootstrap/                          # 🚀 LLM BOOTSTRAP BUNDLE
│   ├── BOOTSTRAP_INDEX.md             # Load order (start here)
│   ├── SYSTEM_INTENT.md               # What this system IS
│   ├── NON_NEGOTIABLES.md             # Hard rules
│   ├── OUTPUT_CONTRACT.md             # Response format
│   └── SAFETY_RAILS.md                # Stop conditions
│
├── doctrine/                           # 📚 5-LAYER DOCTRINE
│   ├── laws/                          # Layer 1: Immutable principles
│   │   ├── IMMUTABLE_LAWS.md          # Core laws
│   │   └── THREE_LAYER_MODEL.md       # Universal/Server/Tooling
│   │
│   ├── boundaries/                    # Layer 2: Package boundaries
│   │   ├── LAYER_MAP.md               # Platform vs Domain vs App
│   │   ├── PACKAGE_OWNERSHIP.md       # Who owns what
│   │   └── IMPORT_RULES.md            # What can import what
│   │
│   ├── patterns/                      # Layer 3: Correct patterns
│   │   ├── SDK_FIRST.md               # How to access data
│   │   ├── UI_PLATFORM_ONLY.md        # How to build UI
│   │   └── THIN_APP.md                # App structure
│   │
│   ├── anti-patterns/                 # Layer 4: What NOT to do
│   │   ├── BANNED_IMPORTS.md          # Forbidden imports
│   │   ├── DOMAIN_LEAK.md             # Domain in platform
│   │   └── UI_LOGIC.md                # Logic in UI
│   │
│   └── runbooks/                      # Layer 5: Step-by-step guides
│       ├── NEW_SDK_SERVICE.md         # Add SDK service
│       ├── NEW_UI_COMPONENT.md        # Add UI component
│       └── FIX_BOUNDARY.md            # Fix violations
│
├── AGENTS.md                          # Agent definitions
├── SKILLS.md                          # Skill catalog
├── COMMANDS.md                        # Command reference
├── ARCHITECTURE.md                    # System overview
├── PRINCIPLES.md                      # Non-negotiables (legacy)
├── ANTI_PATTERNS.md                   # Forbidden patterns (legacy)
├── DS_RULES.md                        # Design System rules
├── SDK_RULES.md                       # SDK usage rules
├── TESTING_RULES.md                   # Testing requirements
├── CHANGE_MANAGEMENT.md               # Change process
├── UNIVERSAL_SAAS_GOVERNANCE.md       # Universal SaaS model
│
└── templates/                         # Starter templates
    ├── PLATFORM_OVERVIEW.template.md
    ├── ARCHITECTURE.template.md
    ├── PRINCIPLES.template.md
    ├── ANTI_PATTERNS.template.md
    ├── UI_RULES.template.md
    ├── API_RULES.template.md
    ├── TESTING_RULES.template.md
    └── CHANGE_PROCESS.template.md
```

---

## The 5-Layer Doctrine Model

```
┌─────────────────────────────────────────────────────────────────────┐
│                        LAYER 1: LAWS                                 │
│  Immutable principles that NEVER change                             │
│  • Dependency direction (Platform → Domain → App)                   │
│  • Single source of truth                                           │
│  • Audit trail requirement                                          │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     LAYER 2: BOUNDARIES                              │
│  Package and layer separation rules                                  │
│  • Platform vs Domain vs App                                        │
│  • Import rules                                                      │
│  • Package ownership                                                 │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      LAYER 3: PATTERNS                               │
│  How to do things correctly                                          │
│  • SDK-First data access                                            │
│  • UI Platform patterns                                              │
│  • Thin app architecture                                            │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    LAYER 4: ANTI-PATTERNS                            │
│  What NOT to do (with examples)                                      │
│  • Banned imports                                                    │
│  • Domain leaks                                                      │
│  • UI logic                                                          │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      LAYER 5: RUNBOOKS                               │
│  Step-by-step guides for common tasks                                │
│  • Add new SDK service                                              │
│  • Add new UI component                                              │
│  • Fix boundary violation                                            │
└─────────────────────────────────────────────────────────────────────┘
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
| Platform never imports domain | ESLint + CI |
| Frontend never imports server-only | ESLint + CI |
| SDK-First | No fetch/axios in apps |
| DS-First | No @digdir/* imports |
| i18n-First | No hardcoded strings |
| Thin Apps | No business logic in apps |

---

## Commands

### Verification

```bash
# Full boundary check
pnpm verify:boundaries

# Check for banned terms
pnpm verify:terms

# Run all governance checks
pnpm -F @xalatechnologies/governance verify
```

### Build & Test

```bash
pnpm build           # Build all packages
pnpm typecheck       # Type check
pnpm test:run        # Run tests
pnpm lint            # ESLint check
```

---

## Integration

### Claude Projects

Add to project knowledge:
- `ai/bootstrap/` (all files)
- `ai/doctrine/` (as needed)

### Cursor Rules

```
# .cursorrules
Read /ai/bootstrap/BOOTSTRAP_INDEX.md first.
Follow /ai/doctrine/patterns/ strictly.
Check /ai/doctrine/anti-patterns/ before writing code.
```

### CI/CD

```yaml
# .github/workflows/ci.yml
- name: Boundary Check
  run: pnpm verify:boundaries

- name: Term Check
  run: pnpm verify:terms
```

---

## Success Criteria

This system succeeds when:
- ✅ Platform packages have ZERO @digilist/* imports
- ✅ Frontend apps have ZERO server-only imports
- ✅ All data access goes through SDK
- ✅ All UI goes through platform design system
- ✅ Apps contain only orchestration, no logic
- ✅ New developers can't accidentally break architecture
- ✅ AI outputs are predictable and consistent

---

## Quick Violations Check

```bash
# Platform imports domain (FORBIDDEN)
grep -r "@digilist" packages/platform/src && echo "VIOLATION"

# Frontend imports server (FORBIDDEN)
grep -r "@xalatechnologies/platform-schema" apps/web/src && echo "VIOLATION"

# Direct @digdir in apps (FORBIDDEN)
grep -r "@digdir/designsystemet" apps/*/src && echo "VIOLATION"

# Direct fetch in apps (FORBIDDEN)
grep -rE "fetch\(" apps/*/src --include="*.tsx" && echo "VIOLATION"
```

---

## File References

| Document | Purpose | Priority |
|----------|---------|----------|
| `bootstrap/BOOTSTRAP_INDEX.md` | Load order | 1 |
| `bootstrap/SYSTEM_INTENT.md` | System identity | 2 |
| `bootstrap/NON_NEGOTIABLES.md` | Hard rules | 3 |
| `doctrine/boundaries/LAYER_MAP.md` | Architecture | 4 |
| `doctrine/patterns/SDK_FIRST.md` | Data access | 5 |
| `doctrine/anti-patterns/BANNED_IMPORTS.md` | What to avoid | 6 |
