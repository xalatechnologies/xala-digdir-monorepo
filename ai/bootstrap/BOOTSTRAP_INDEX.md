# LLM Bootstrap Index

> **Load Order: THIS FILE FIRST**
> **Version:** 1.0.0
> **Last Updated:** 2026-01-21

---

## Purpose

This bootstrap bundle provides the **minimum context** an LLM needs to operate safely within the Xala Platform monorepo. Files are organized by priority - load in order, stop when context window is constrained.

---

## Load Order

### Tier 1: Non-Negotiables (ALWAYS load)

| Priority | File | Purpose | Est. Tokens |
|----------|------|---------|-------------|
| 1 | `SYSTEM_INTENT.md` | What this system IS | ~200 |
| 2 | `NON_NEGOTIABLES.md` | Hard rules that cannot be violated | ~500 |
| 3 | `OUTPUT_CONTRACT.md` | Expected response format | ~300 |
| 4 | `SAFETY_RAILS.md` | When to STOP and ask | ~300 |

**Total Tier 1:** ~1,300 tokens

### Tier 2: Boundaries (Load for code tasks)

| Priority | File | Purpose | Est. Tokens |
|----------|------|---------|-------------|
| 5 | `../doctrine/boundaries/LAYER_MAP.md` | Platform vs Domain vs App | ~600 |
| 6 | `../doctrine/boundaries/PACKAGE_OWNERSHIP.md` | Who owns what | ~400 |
| 7 | `../doctrine/boundaries/IMPORT_RULES.md` | Allowed imports | ~500 |

**Total Tier 2:** ~1,500 tokens

### Tier 3: Patterns (Load for implementation)

| Priority | File | Purpose | Est. Tokens |
|----------|------|---------|-------------|
| 8 | `../doctrine/patterns/SDK_FIRST.md` | How to access data | ~400 |
| 9 | `../doctrine/patterns/UI_PLATFORM_ONLY.md` | How to build UI | ~400 |
| 10 | `../doctrine/patterns/THIN_APP.md` | App structure | ~300 |

**Total Tier 3:** ~1,100 tokens

### Tier 4: Anti-Patterns (Load before writing code)

| Priority | File | Purpose | Est. Tokens |
|----------|------|---------|-------------|
| 11 | `../doctrine/anti-patterns/BANNED_IMPORTS.md` | What NOT to import | ~300 |
| 12 | `../doctrine/anti-patterns/DOMAIN_LEAK.md` | Keep domain out of platform | ~300 |
| 13 | `../doctrine/anti-patterns/UI_LOGIC.md` | Keep logic out of UI | ~300 |

**Total Tier 4:** ~900 tokens

### Tier 5: Runbooks (Load for specific tasks)

| Task | File | Est. Tokens |
|------|------|-------------|
| Add new API endpoint | `../doctrine/runbooks/NEW_API_ENDPOINT.md` | ~500 |
| Add new UI component | `../doctrine/runbooks/NEW_UI_COMPONENT.md` | ~500 |
| Add new SDK service | `../doctrine/runbooks/NEW_SDK_SERVICE.md` | ~500 |
| Fix boundary violation | `../doctrine/runbooks/FIX_BOUNDARY.md` | ~400 |
| Migration task | `../doctrine/runbooks/MIGRATION.md` | ~600 |

---

## Quick Context Check

Before any code generation, verify:

```
[ ] I know if this is PLATFORM or DOMAIN code
[ ] I know which package owns this functionality
[ ] I know the import rules for this context
[ ] I have loaded relevant anti-patterns
[ ] I understand the expected output format
```

---

## Emergency Stop Conditions

**STOP IMMEDIATELY and ask the user if:**

1. Task requires importing `@xalatechnologies/platform-schema` in a frontend app
2. Task requires adding business logic to a UI component
3. Task requires creating a new package without clear ownership
4. Task touches authentication/authorization without explicit approval
5. Task modifies database schema

---

## File Locations

```
ai/
├── bootstrap/                 # THIS DIRECTORY
│   ├── BOOTSTRAP_INDEX.md    # This file (load first)
│   ├── SYSTEM_INTENT.md      # System purpose
│   ├── NON_NEGOTIABLES.md    # Hard rules
│   ├── OUTPUT_CONTRACT.md    # Response format
│   └── SAFETY_RAILS.md       # Stop conditions
├── doctrine/
│   ├── laws/                 # Immutable principles
│   ├── boundaries/           # Package/layer boundaries
│   ├── patterns/             # How to do things right
│   ├── anti-patterns/        # What NOT to do
│   └── runbooks/             # Step-by-step guides
└── (existing files)
```
