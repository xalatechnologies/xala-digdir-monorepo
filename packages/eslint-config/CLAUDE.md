# @xala/eslint-config - ESLint Guardrails

> **Extends:** [Root CLAUDE.md](../../CLAUDE.md)

## Purpose

`@xala/eslint-config` provides custom ESLint rules that enforce the Thin App Strategy, design system compliance, and code quality standards across the monorepo.

**Package Name:** `@xala/eslint-config`
**Custom Rules:** 11 rules

---

## Custom Rules (11)

### Design Token Rules
| Rule | Purpose |
|------|---------|
| `digdir/no-hardcoded-colors` | Enforce `var(--ds-color-*)` tokens |
| `digdir/no-hardcoded-spacing` | Enforce `var(--ds-spacing-*)` tokens |
| `digdir/no-hardcoded-typography` | Enforce `var(--ds-font-*)` tokens |
| `digdir/no-hardcoded-border-radius` | Enforce `var(--ds-radius-*)` tokens |

### Component Pattern Rules
| Rule | Purpose |
|------|---------|
| `digdir/as-child-single-child` | Enforce single child with asChild prop |
| `digdir/require-button-type` | Require explicit button type attribute |
| `digdir/require-interactive-labels` | Require htmlFor on labels |
| `digdir/prefer-ds-components` | Suggest @xala/ds over raw HTML |
| `digdir/require-provider` | Enforce DesignsystemetProvider |

### Import Rules
| Rule | Purpose |
|------|---------|
| `digdir/i18n-no-hardcoded-strings` | Enforce t() for user-facing text |
| `digdir/no-direct-schema-import` | Block direct @xala/contracts imports |

---

## Thin App Strategy Enforcement

These rules directly enforce the Thin App Strategy:

1. **No hardcoded styles** → Design tokens only
2. **No raw HTML** → @xala/ds components
3. **No hardcoded strings** → i18n required
4. **No direct schema imports** → SDK-first

---

## Directory Structure

```
packages/eslint-config/
├── rules/
│   ├── no-hardcoded-colors.js
│   ├── no-hardcoded-spacing.js
│   ├── no-hardcoded-typography.js
│   ├── no-hardcoded-border-radius.js
│   ├── as-child-single-child.js
│   ├── require-button-type.js
│   ├── require-interactive-labels.js
│   ├── prefer-ds-components.js
│   ├── require-provider.js
│   ├── i18n-no-hardcoded-strings.js
│   └── no-direct-schema-import.js
├── index.js
└── package.json
```

---

## Usage

Apps automatically use these rules via workspace config:

```js
// .eslintrc.js in app
module.exports = {
  extends: ['@xala/eslint-config'],
};
```

---

## Commands

```bash
# Run linting (includes guardrails)
pnpm lint

# Run compliance scans
pnpm scan:compliance
pnpm scan:tokens
pnpm scan:components
pnpm scan:a11y

# Auto-fix violations
pnpm scan:fix

# JSON output for CI
pnpm scan:compliance:json
```

---

## Development Commands

```bash
# Build rules
pnpm --filter @xala/eslint-config build

# Test rules
pnpm --filter @xala/eslint-config test
```

---

## Adding New Rules

1. Create rule in `rules/rule-name.js`
2. Export from `index.js`
3. Add tests
4. Document in this file

---

**Last Updated:** 2026-01-20
**Status:** Active
**Rules Count:** 11
