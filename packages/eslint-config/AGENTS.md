# @xala/eslint-config - Agent Commands

> **Extends:** [Root AGENTS.md](../../AGENTS.md)

## Quick Reference

```bash
# Lint entire codebase
pnpm lint

# Compliance scans
pnpm scan:compliance     # Design tokens
pnpm scan:tokens         # Token usage
pnpm scan:components     # Component patterns
pnpm scan:a11y           # Accessibility
pnpm scan:fix            # Auto-fix

# Build/test rules
pnpm --filter @xala/eslint-config build
pnpm --filter @xala/eslint-config test
```

## Custom Rules (11)

### Design Tokens
- `no-hardcoded-colors` - Use `var(--ds-color-*)`
- `no-hardcoded-spacing` - Use `var(--ds-spacing-*)`
- `no-hardcoded-typography` - Use `var(--ds-font-*)`
- `no-hardcoded-border-radius` - Use `var(--ds-radius-*)`

### Components
- `as-child-single-child` - asChild needs one child
- `require-button-type` - Button needs type attr
- `require-interactive-labels` - Labels need htmlFor
- `prefer-ds-components` - Use @xala/ds
- `require-provider` - Need DesignsystemetProvider

### Imports
- `i18n-no-hardcoded-strings` - Use t()
- `no-direct-schema-import` - Use SDK

## Thin App Enforcement

These rules enforce:
1. Design tokens only (no hardcoded styles)
2. @xala/ds components (no raw HTML)
3. i18n required (no hardcoded strings)
4. SDK-first (no direct schema imports)

## Adding New Rule

1. Create `rules/my-rule.js`
2. Export from `index.js`
3. Add tests
4. Update CLAUDE.md

---

**Status:** Active | **Rules:** 11
