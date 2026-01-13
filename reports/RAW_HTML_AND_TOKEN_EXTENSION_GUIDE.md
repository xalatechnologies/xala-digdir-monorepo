# Raw HTML Patterns & Token Extension Guide

**Based on Deep Research of Digdir Designsystemet**

**Date:** 2026-01-13
**Repository:** xala-digdir-monorepo
**Source:** [Designsystemet GitHub](https://github.com/digdir/designsystemet), [designsystemet.no](https://designsystemet.no/en)

---

## Executive Summary

This guide documents the official Digdir Designsystemet patterns for:
1. **Raw HTML handling** - When to use native elements vs. design system components
2. **Composition patterns** - How to use `asChild` for component replacement
3. **Token extension** - How to properly extend and customize design tokens
4. **Custom styling** - Approved patterns for application-specific styling

---

## 1. Raw HTML Handling

### 1.1 Official Digdir Position

The Digdir Designsystemet has **different rules for different element types**:

#### ✅ ALLOWED Raw Elements (No Warning)

These elements are considered acceptable as raw HTML because they are structural or don't have a direct design system equivalent:

```javascript
// From our ESLint rule prefer-ds-components.js
const IGNORED_ELEMENTS = [
  'div', 'span', 'p', 
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 
  'nav', 'header', 'footer', 'main', 
  'section', 'article', 'aside', 
  'form', 'img', 'br', 'hr'
];
```

**Rationale:** Semantic HTML elements provide accessibility and SEO benefits.

#### ⚠️ SHOULD USE DS Component

These elements SHOULD use the design system component for consistent styling:

| Native Element | Design System Component | Package |
|---------------|------------------------|---------|
| `<button>` | `<Button>` | `@digdir/designsystemet-react` |
| `<input>` | `<Textfield>` | `@digdir/designsystemet-react` |
| `<select>` | `<Select>`, `<NativeSelect>` | `@digdir/designsystemet-react` |
| `<textarea>` | `<Textarea>` | `@digdir/designsystemet-react` |
| `<a>` | `<Link>` | `@digdir/designsystemet-react` |
| `<table>` | `<Table>` | `@digdir/designsystemet-react` |
| `<dialog>` | `<Modal>` | `@digdir/designsystemet-react` |
| `<details>` | `<Accordion>` | `@digdir/designsystemet-react` |
| `<fieldset>` | `<Fieldset>` | `@digdir/designsystemet-react` |
| `<label>` | `<Label>` | `@digdir/designsystemet-react` |
| `<ul>`, `<ol>` | `<List>` | `@digdir/designsystemet-react` |

---

### 1.2 Current Violations in Our Codebase

#### Apps Directory (`apps/web/src/App.tsx`)

**Found 14 raw HTML instances**, mostly `<div style={{...}}>`:

| Line | Pattern | Recommended Replacement |
|------|---------|------------------------|
| 453 | `<div style={{ minHeight: '100vh' }}>` | `<AppShell>` (already available) |
| 506 | `<div className="header-search-desktop">` | Keep - wrapper OK |
| 552 | `<div style={{ display: 'flex', flexDirection: 'column' }}>` | `<Stack direction="vertical">` |
| 572, 599, 609, 619 | `<div style={{ display: 'flex', flexDirection: 'column' }}>` | `<Stack>` |
| 632 | `<div className="mobile-search-wrapper">` | Keep - conditional wrapper |
| 683 | `<div style={{ display: 'flex', flexDirection: 'column', gap }}>` | `<Stack spacing="">` |
| 735 | `<div style={{ display: 'flex', justifyContent: 'center' }}>` | `<Stack align="center">` |

#### Packages Directory (`packages/ds/src`)

**Found 105 raw HTML instances** across 12 files. This is **acceptable** because:
- Design system components are allowed to use raw HTML internally
- They encapsulate the styling and behavior

---

### 1.3 Correct Patterns

#### ❌ WRONG: Raw `<div>` with inline flex styles in apps

```tsx
// ❌ Avoid in apps
<div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-3)' }}>
  {children}
</div>
```

#### ✅ CORRECT: Use Stack primitive

```tsx
// ✅ Preferred
import { Stack } from '@xala/ds';

<Stack direction="vertical" spacing="var(--ds-spacing-3)">
  {children}
</Stack>
```

#### ❌ WRONG: Raw `<button>` in apps

```tsx
// ❌ Avoid
<button onClick={handleClick} className="my-button">
  Click me
</button>
```

#### ✅ CORRECT: Use Button component

```tsx
// ✅ Preferred
import { Button } from '@xala/ds';

<Button onClick={handleClick}>
  Click me
</Button>
```

---

## 2. Composition Patterns (`asChild`)

### 2.1 Official Digdir Pattern

The `asChild` prop uses [Radix UI's Slot component](https://www.radix-ui.com/primitives/docs/utilities/slot) to merge props and render a different element.

**Source:** [designsystemet.no/en/fundamentals/code/composition](https://designsystemet.no/en/fundamentals/code/composition)

#### How It Works

```tsx
import { Button, Link } from '@digdir/designsystemet-react';

// This renders a single <a> tag with Button styling
<Button asChild>
  <Link href='https://www.digdir.no'>Link to digdir.no</Link>
</Button>
```

**DOM Result:**
```html
<!-- Only ONE element in DOM, not nested -->
<a href="https://www.digdir.no" class="ds-button ds-link">Link to digdir.no</a>
```

### 2.2 Critical Rule: Single Child Only

**When using `asChild`, the component MUST have exactly ONE direct child element.**

```tsx
// ❌ WRONG - Multiple children
<Button asChild>
  <span>Icon</span>
  <Link href="/home">Home</Link>
</Button>

// ✅ CORRECT - Single child (which can contain multiple elements)
<Button asChild>
  <Link href="/home">
    <span>Icon</span>
    Home
  </Link>
</Button>
```

### 2.3 Using Custom Components with `asChild`

Custom components must:
1. Spread all received props
2. Support `ref` forwarding
3. Preserve accessibility attributes

```tsx
import { forwardRef } from 'react';

// Custom component that works with asChild
const CustomLink = forwardRef<HTMLAnchorElement, React.AnchorHTMLAttributes<HTMLAnchorElement>>(
  ({ children, ...props }, ref) => (
    <a ref={ref} {...props}>
      {children}
    </a>
  )
);

// Usage
<Button asChild>
  <CustomLink href="/dashboard">Dashboard</CustomLink>
</Button>
```

---

## 3. Token Extension Patterns

### 3.1 Official Digdir Token Structure

Digdir uses a hierarchical token system:

```
--ds-color-{semantic}-{element}-{state}

Examples:
--ds-color-accent-base-default      # Primary button background
--ds-color-accent-base-hover        # Primary button hover
--ds-color-accent-text-default      # Accent text color
--ds-color-neutral-background-default  # Page background
```

### 3.2 Extending Tokens - Approved Patterns

#### Pattern 1: Override Existing Tokens

Override `--ds-*` tokens in your theme CSS:

```css
/* themes/digilist.css */
:root,
[data-color-scheme="light"] {
  /* Override Digdir accent color with brand color */
  --ds-color-accent-base-default: #2F55A4;
  --ds-color-accent-base-hover: #264785;
  --ds-color-accent-base-active: #1E3A6E;
}
```

#### Pattern 2: Add Custom Token Namespace

For application-specific tokens, use a custom prefix:

```css
/* ✅ CORRECT: Custom namespace for app tokens */
:root {
  /* Sidebar tokens - not in Digdir */
  --digilist-sidebar-background: oklch(0.99 0 0);
  --digilist-sidebar-foreground: oklch(0.20 0.02 264);
  
  /* Chart colors - not in Digdir */
  --digilist-chart-1: oklch(0.45 0.12 262);
  --digilist-chart-2: oklch(0.72 0.14 130);
}
```

#### Pattern 3: Derive from Existing Tokens

Reference existing tokens to maintain consistency:

```css
:root {
  /* ✅ Derive from existing tokens */
  --digilist-card-shadow: 0 2px var(--ds-spacing-2) var(--ds-color-neutral-border-subtle);
  
  /* ✅ Use calc() with tokens */
  --digilist-header-offset-sm: calc(var(--ds-spacing-4) * 12);
}
```

### 3.3 CLI-Based Token Generation

Use the Designsystemet CLI for theme generation:

```bash
# Step 1: Configure designsystemet.config.json
{
  "$schema": "node_modules/@digdir/designsystemet/dist/config.schema.json",
  "outDir": "./design-tokens",
  "themes": {
    "my-theme": {
      "colors": {
        "main": { "primary": "#0062BA", "accent": "#1E98F5" },
        "neutral": "#1E2B3C"
      },
      "borderRadius": 4,
      "typography": { "fontFamily": "Inter" }
    }
  }
}

# Step 2: Generate tokens
npx @digdir/designsystemet tokens create --config designsystemet.config.json

# Step 3: Build CSS
npx @digdir/designsystemet tokens build
```

---

## 4. Custom Styling Guidelines

### 4.1 Approved Styling Patterns

#### ✅ Pattern 1: Token-Based Inline Styles (In DS Components)

Acceptable inside design system components:

```tsx
// packages/ds/src/composed/filter-bar.tsx
<div style={{ 
  padding: 'var(--ds-spacing-6) 0',
  fontSize: 'var(--ds-font-size-sm)',
  fontWeight: 'var(--ds-font-weight-semibold)' as unknown as number
}}>
```

#### ✅ Pattern 2: Use Layout Primitives in Apps

```tsx
// apps/web/src/App.tsx
import { Stack, Container, Grid } from '@xala/ds';

<Container maxWidth="1440px">
  <Stack spacing="var(--ds-spacing-4)">
    <Grid columns="repeat(3, 1fr)" gap="var(--ds-spacing-4)">
      {items.map(item => <Card key={item.id} />)}
    </Grid>
  </Stack>
</Container>
```

#### ✅ Pattern 3: CSS Custom Properties in External CSS

```css
/* Acceptable in theme CSS */
.my-custom-component {
  background-color: var(--ds-color-accent-background-default);
  color: var(--ds-color-accent-text-default);
  padding: var(--ds-spacing-2);
  border-radius: var(--ds-border-radius-md);
}
```

### 4.2 Forbidden Patterns

#### ❌ Hardcoded Values

```tsx
// ❌ FORBIDDEN
<div style={{ padding: '16px', color: '#333' }}>

// ✅ CORRECT
<div style={{ 
  padding: 'var(--ds-spacing-4)', 
  color: 'var(--ds-color-neutral-text-default)' 
}}>
```

#### ❌ Custom CSS Files in Apps

```
apps/
  web/
    src/
      custom-styles.css  ❌ FORBIDDEN
```

#### ❌ Arbitrary Tailwind Values

```tsx
// ❌ FORBIDDEN
<div className="p-[20px] bg-[#custom]">

// ✅ Use design tokens instead
```

---

## 5. Recommended Primitives to Add

Based on our current violations, we should add these primitives to `@xala/ds`:

### 5.1 `Box` Component

A semantic container that replaces styled `<div>`:

```tsx
// Proposed: packages/ds/src/primitives/box.tsx
export interface BoxProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: 'div' | 'section' | 'article' | 'aside' | 'main';
  padding?: string;
  paddingX?: string;
  paddingY?: string;
  margin?: string;
  background?: string;
  borderRadius?: string;
}

// Usage in apps
<Box 
  padding="var(--ds-spacing-4)" 
  background="var(--ds-color-neutral-surface-default)"
>
  {children}
</Box>
```

### 5.2 `Flex` Component

A specialized flex container:

```tsx
// Proposed: packages/ds/src/primitives/flex.tsx
export interface FlexProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: 'row' | 'column';
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  gap?: string;
  wrap?: boolean;
}

// Usage
<Flex justify="center" gap="var(--ds-spacing-4)">
  {buttons}
</Flex>
```

### 5.3 `Center` Component

Centers content horizontally and/or vertically:

```tsx
// Proposed: packages/ds/src/primitives/center.tsx
export interface CenterProps extends React.HTMLAttributes<HTMLDivElement> {
  inline?: boolean;
}

// Usage
<Center>
  <Button>Centered Button</Button>
</Center>
```

---

## 6. Migration Checklist

### For `apps/web/src/App.tsx`

| Line | Current Pattern | Replace With |
|------|-----------------|--------------|
| 453-458 | Root `<div>` with minHeight | Keep (AppShell wrapper) |
| 552-558 | `<div style={{ display: 'flex', flexDirection: 'column' }}>` | `<Stack direction="vertical" spacing="var(--ds-spacing-3)">` |
| 553-557 | Nested `<div style>` for text | `<Text size="sm" color="subtle">` |
| 572 | `<div style={{ display: 'flex', flexDirection: 'column' }}>` | `<Stack spacing="var(--ds-spacing-1)">` |
| 599, 609, 619 | Empty section divs | Keep semantic (placeholder content) |
| 683 | `<div style={{ display: 'flex', flexDirection: 'column' }}>` | `<Stack spacing="var(--ds-spacing-4)">` |
| 735-739 | Centered button wrapper | `<Flex justify="center">` or `<Center>` |

---

## 7. ESLint Rule Recommendations

### Update `prefer-ds-components.js`

Add suggestions for layout patterns:

```javascript
const DS_COMPONENT_SUGGESTIONS = {
  // Existing...
  
  // ADD: Layout pattern detection
  'div[style*="display: flex"]': {
    component: 'Stack or Flex',
    message: "Consider using <Stack> or <Flex> from '@xala/ds' for flex layouts.",
  },
  'div[style*="display: grid"]': {
    component: 'Grid',
    message: "Consider using <Grid> from '@xala/ds' for grid layouts.",
  },
};
```

### Add New Rule: `no-inline-flex-in-apps`

```javascript
// Proposed: rules/no-inline-flex-in-apps.js
// Warns when apps use <div style={{ display: 'flex' }}> instead of Stack/Flex
```

---

## 8. Summary of Key Principles

### From Digdir Documentation

1. **Use semantic HTML** for structure (`section`, `article`, `main`, etc.)
2. **Use DS components** for interactive elements (`Button`, `Input`, etc.)
3. **Use `asChild`** for component composition (never nest clickable elements)
4. **Single child only** when using `asChild`
5. **Override `--ds-*` tokens** for theming
6. **Use custom namespace** for app-specific tokens (`--myapp-*`)
7. **Never hardcode** colors, spacing, or typography values
8. **CSS custom properties only** for dynamic styling

### Our Additional Guidelines

1. **Layout primitives in apps** - Use `Stack`, `Grid`, `Container`
2. **Design system encapsulates raw HTML** - Components can use `<div>` internally
3. **Apps are thin composition layers** - No raw HTML styling in apps
4. **Token extension follows namespace rules** - `--digilist-*` for our custom tokens

---

## References

- [Designsystemet - Composition](https://designsystemet.no/en/fundamentals/code/composition)
- [Designsystemet - Design Tokens](https://designsystemet.no/en/fundamentals/design-elements/design-tokens)
- [Designsystemet - Get Started in Code](https://designsystemet.no/en/fundamentals/code/get-started)
- [Designsystemet CLI Config](https://designsystemet.no/en/fundamentals/code/cli-config)
- [GitHub - digdir/designsystemet](https://github.com/digdir/designsystemet)

---

*Report generated: 2026-01-13*
