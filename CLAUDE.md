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
