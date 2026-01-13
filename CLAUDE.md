# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build Commands

```bash
pnpm install          # Install dependencies
pnpm dev              # Run all apps in parallel (web: 5173, api: 3002)
pnpm build            # Build all packages
pnpm lint             # Check ESLint guardrails
pnpm format           # Format with Prettier
pnpm tokens:create    # Generate themes via Designsystemet CLI
pnpm tokens:build     # Build theme tokens
```

**Scanner commands:**
```bash
pnpm scan             # Full Digdir standards scan
pnpm scan:strict      # All rules as errors
pnpm scan:tokens      # Design token violations only
pnpm scan:components  # Component pattern issues only
pnpm scan:a11y        # Accessibility rules only
pnpm scan:fix         # Auto-fix where possible
```

Individual app commands:
```bash
pnpm --filter @xala/web dev      # Web only
pnpm --filter @xala/api dev      # API only
pnpm --filter @xala/web lint     # Lint web app
```

## Architecture

**Monorepo stack:** pnpm workspaces + Turborepo

```
apps/
  web/          # Vite + React + TypeScript (port 5173)
  api/          # Fastify server (port 3002)
packages/
  ds/           # UI facade - the ONLY UI import allowed in apps
  ds-themes/    # Theme URL registry for runtime switching
  ds-registry/  # Documentation and examples
  eslint-config/# Guardrail enforcement + Digdir scanner
```

**Component hierarchy in @xala/ds:**
- **Shells** (AppShell) - Application-level layout
- **Composed** (ContentLayout, PageHeader, Navigation, FilterBar) - Mid-level components
- **Primitives** (Container, Grid, Stack, Icon, Card) - Low-level building blocks
- All Digdir components re-exported via `@digdir/designsystemet-react`

## Critical Rules (Enforced by ESLint Scanner)

### Import Rules
1. **Apps must NOT import @digdir/* packages directly** - Use only `@xala/ds`
2. **Import `@xala/ds/styles` exactly once** - Only in `main.tsx`
3. **No custom UI components in apps** - Use DS components from `@xala/ds`
4. **Use DesignsystemetProvider for theme switching** - Never import theme CSS directly

### Design Token Rules
5. **No hardcoded colors** - Use `var(--ds-color-*)` tokens
6. **No hardcoded spacing** - Use `var(--ds-spacing-*)` tokens
7. **No hardcoded typography** - Use `var(--ds-font-*)` tokens
8. **No hardcoded border-radius** - Use `var(--ds-border-radius-*)` tokens

### Component Pattern Rules
9. **Follow asChild pattern** - Only ONE child allowed under `asChild`
10. **Require button type** - Always specify `type="button|submit|reset"`
11. **Require accessible labels** - Icon-only buttons need `aria-label`
12. **Prefer DS components** - Use `<Button>` not `<button>`, etc.
13. **Require provider** - Entry files must import `DesignsystemetProvider`

## Digdir Design Tokens

**Always use CSS variables instead of hardcoded values:**

```tsx
// WRONG - hardcoded values
<div style={{ color: '#333', padding: '16px', borderRadius: '4px' }}>

// CORRECT - design tokens
<div style={{
  color: 'var(--ds-color-neutral-text-default)',
  padding: 'var(--ds-spacing-4)',
  borderRadius: 'var(--ds-border-radius-md)'
}}>
```

**Available token families:**
- `--ds-color-neutral-*` - Neutral colors (text, backgrounds, borders)
- `--ds-color-accent-*` - Accent/brand colors
- `--ds-color-brand1-*` through `--ds-color-brand3-*` - Brand palette
- `--ds-color-success-*`, `--ds-color-danger-*`, `--ds-color-warning-*`, `--ds-color-info-*`
- `--ds-spacing-0` through `--ds-spacing-30` - Spacing scale
- `--ds-font-size-*`, `--ds-font-weight-*`, `--ds-font-line-height-*`
- `--ds-border-radius-sm`, `--ds-border-radius-md`, `--ds-border-radius-lg`, `--ds-border-radius-full`

## Theme System

Available themes: `digdir`, `altinn`, `uutilsynet`, `portal`

```tsx
import { DesignsystemetProvider } from '@xala/ds';

<DesignsystemetProvider theme="digdir" colorScheme="auto" size="md">
  {/* App */}
</DesignsystemetProvider>
```

Data attributes for styling:
- `data-color-scheme`: `"auto" | "light" | "dark"`
- `data-size`: `"sm" | "md" | "lg"`
- `data-typography`: `"primary" | "secondary"`

## Entry Point Pattern

```tsx
// main.tsx - correct pattern
import '@xala/ds/styles';  // CSS import (exactly once)
import { DesignsystemetProvider, Button } from '@xala/ds';  // Components
```

## ESLint Scanner Rules

Located in `packages/eslint-config/`:

**Design Token Rules:**
- `digdir/no-hardcoded-colors` - Blocks hex, rgb(), hsl(), named colors
- `digdir/no-hardcoded-spacing` - Blocks px/rem/em in padding/margin/gap
- `digdir/no-hardcoded-typography` - Blocks hardcoded font sizes/weights
- `digdir/no-hardcoded-border-radius` - Blocks hardcoded border-radius values

**Component Pattern Rules:**
- `digdir/as-child-single-child` - Validates asChild has exactly one child
- `digdir/require-button-type` - Requires explicit button type attribute
- `digdir/require-interactive-labels` - Ensures icon buttons have aria-label
- `digdir/prefer-ds-components` - Suggests DS components over native HTML
- `digdir/require-provider` - Warns if DesignsystemetProvider not imported

**Configuration presets:**
```js
import {
  designTokens,      // Token rules only
  componentPatterns, // Pattern rules only
  digdirScanner,     // All rules (default)
  strict,            // All rules as errors
  apps               // Full config for apps/
} from '@xala/eslint-config';
```

---

## Token-First Development Workflow

**CRITICAL: Always follow this workflow when creating or modifying components.**

### Step 1: Check Available Tokens First

Before writing any style, check if a token exists:

```bash
# Search for available tokens in generated theme
grep -r "ds-color\|ds-spacing\|ds-font\|ds-border" packages/ds-themes/generated/

# Or check the extensions file for custom tokens
cat packages/ds-themes/themes/digilist-extensions.css
```

**Available token families:**

| Category | Token Pattern | Example |
|----------|--------------|---------|
| Colors | `--ds-color-{semantic}-{variant}` | `--ds-color-neutral-text-default` |
| Spacing | `--ds-spacing-{0-30}` | `--ds-spacing-4` |
| Font Size | `--ds-font-size-{xs,sm,md,lg,xl,2xl...}` | `--ds-font-size-md` |
| Font Weight | `--ds-font-weight-{medium,semibold,bold}` | `--ds-font-weight-bold` |
| Border Radius | `--ds-border-radius-{sm,md,lg,full}` | `--ds-border-radius-md` |
| Shadows | `--ds-shadow-{xs,sm,md,lg,xl}` | `--ds-shadow-md` |
| Line Height | `--ds-line-height-{sm,md,lg}` | `--ds-line-height-md` |

### Step 2: If Token Doesn't Exist, Create Extension

If you need a value not covered by existing tokens:

1. **Add to `packages/ds-themes/themes/digilist-extensions.css`**
2. **Use proper namespace**: `--ds-*` for Digdir-style tokens, `--digilist-*` for app-specific
3. **Document the token** with a comment explaining its purpose

```css
/* In digilist-extensions.css */
:root {
  /* Condensed line-height for logo text and tight headings */
  --ds-line-height-condensed: 1.1;

  /* Micro spacing for optical alignment adjustments */
  --digilist-spacing-micro: 2px;
  --digilist-spacing-micro-sm: 1px;
}
```

### Step 3: Use Token in Component

```tsx
// WRONG - hardcoded value
<span style={{ lineHeight: '1.1', marginTop: '2px' }}>

// CORRECT - tokenized
<span style={{
  lineHeight: 'var(--ds-line-height-condensed)',
  marginTop: 'var(--digilist-spacing-micro)'
}}>
```

### Step 4: Run Scanner to Verify

```bash
pnpm scan:tokens  # Check for any hardcoded values
```

---

## Token Extension Guidelines

### When to Create New Tokens

| Scenario | Action |
|----------|--------|
| Standard color/spacing/size | Use existing `--ds-*` token |
| Missing standard value | Add to extensions with `--ds-*` prefix |
| App-specific semantic token | Add with `--digilist-*` prefix |
| One-off micro-adjustment | Create `--digilist-spacing-micro-*` token |
| Component-specific token | Create `--digilist-{component}-*` token |

### Token Naming Conventions

```css
/* Standard Digdir pattern (for missing standard tokens) */
--ds-line-height-condensed: 1.1;
--ds-shadow-card-hover: 0 8px 24px rgba(0,0,0,0.12);

/* App-specific semantic tokens */
--digilist-sidebar-background: oklch(0.99 0 0);
--digilist-chart-1: #2F55A4;

/* Micro-adjustment tokens */
--digilist-spacing-micro: 2px;
--digilist-spacing-micro-sm: 1px;

/* Component-specific tokens */
--digilist-control-height-md: 2.875rem;
```

### File Structure for Extensions

```
packages/ds-themes/
├── generated/
│   └── digilist.css       # CLI-generated (DO NOT EDIT)
└── themes/
    └── digilist-extensions.css  # Custom tokens (EDIT HERE)
```

---

## Component Creation Checklist

When creating new components in `@xala/ds`:

- [ ] **Check existing tokens** - Search generated theme first
- [ ] **No hardcoded values** - All colors, spacing, typography must use tokens
- [ ] **Create extension tokens** if needed - Add to `digilist-extensions.css`
- [ ] **Use semantic token names** - `--ds-color-neutral-text-default` not `--ds-color-gray-700`
- [ ] **Support color schemes** - Test light/dark mode
- [ ] **Run `pnpm scan:tokens`** - Verify no violations
- [ ] **Document custom tokens** - Comment explaining purpose

---

## Common Token Mappings

| Need | Token |
|------|-------|
| Primary text | `var(--ds-color-neutral-text-default)` |
| Secondary text | `var(--ds-color-neutral-text-subtle)` |
| Background | `var(--ds-color-neutral-background-default)` |
| Card surface | `var(--ds-color-neutral-surface-default)` |
| Hover surface | `var(--ds-color-neutral-surface-hover)` |
| Border | `var(--ds-color-neutral-border-default)` |
| Subtle border | `var(--ds-color-neutral-border-subtle)` |
| Primary action | `var(--ds-color-accent-base-default)` |
| Success | `var(--ds-color-success-base-default)` |
| Warning | `var(--ds-color-warning-base-default)` |
| Danger | `var(--ds-color-danger-base-default)` |
| Focus ring | `var(--ds-color-focus-outer)` |
| Small spacing | `var(--ds-spacing-2)` (8px) |
| Medium spacing | `var(--ds-spacing-4)` (16px) |
| Large spacing | `var(--ds-spacing-6)` (24px) |
| Small radius | `var(--ds-border-radius-sm)` |
| Medium radius | `var(--ds-border-radius-md)` |
| Pill/full radius | `var(--ds-border-radius-full)` |
