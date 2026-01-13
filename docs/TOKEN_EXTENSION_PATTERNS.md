# Token Extension Patterns

Practical patterns for extending the Digdir Designsystemet with custom tokens.

## Table of Contents

1. [When to Extend](#when-to-extend)
2. [Extension Patterns](#extension-patterns)
3. [Real-World Examples](#real-world-examples)
4. [Anti-Patterns to Avoid](#anti-patterns-to-avoid)

---

## When to Extend

### Decision Tree

```
Need a style value?
    │
    ├── Does --ds-* token exist?
    │       │
    │       ├── YES → Use it directly
    │       │
    │       └── NO → Is it a standard CSS concept?
    │               │
    │               ├── YES → Create --ds-* extension
    │               │         (e.g., --ds-line-height-condensed)
    │               │
    │               └── NO → Create --digilist-* token
    │                        (e.g., --digilist-chart-1)
```

### Extension Triggers

| Situation | Action | Example |
|-----------|--------|---------|
| Digdir token exists | Use directly | `--ds-spacing-4` |
| Missing line-height value | Add `--ds-line-height-*` | `--ds-line-height-condensed: 1.1` |
| Missing shadow variant | Add `--ds-shadow-*` | `--ds-shadow-card-hover` |
| App-specific color | Add `--digilist-*` | `--digilist-chart-1` |
| Component token | Add `--digilist-{component}-*` | `--digilist-sidebar-background` |
| Micro adjustment | Add `--digilist-spacing-micro-*` | `--digilist-spacing-micro: 2px` |

---

## Extension Patterns

### Pattern 1: Missing Standard Token

When Digdir doesn't provide a standard CSS value you need.

```css
/* Problem: Need line-height 1.1, but Digdir only has sm/md/lg */

/* Solution: Add standard-named extension */
:root {
  /* Condensed line-height for logo text and tight headings */
  --ds-line-height-condensed: 1.1;
}

/* Usage */
.logo-text {
  line-height: var(--ds-line-height-condensed);
}
```

### Pattern 2: Semantic Shadow Extensions

When you need semantic shadows not in the base scale.

```css
/* Problem: Need card hover shadow, dropdown shadow, etc. */

/* Solution: Add semantic shadow tokens */
:root, [data-color-scheme="light"] {
  --ds-shadow-card: 0 1px 3px rgba(0, 0, 0, 0.06);
  --ds-shadow-card-hover: 0 8px 24px rgba(0, 0, 0, 0.12);
  --ds-shadow-dropdown: 0 4px 12px rgba(0, 0, 0, 0.08);
  --ds-shadow-header: 0 1px 3px rgba(0, 0, 0, 0.06);
}

[data-color-scheme="dark"] {
  --ds-shadow-card: 0 1px 3px rgba(0, 0, 0, 0.2);
  --ds-shadow-card-hover: 0 8px 24px rgba(0, 0, 0, 0.4);
  --ds-shadow-dropdown: 0 4px 12px rgba(0, 0, 0, 0.3);
  --ds-shadow-header: 0 1px 3px rgba(0, 0, 0, 0.2);
}
```

### Pattern 3: Micro-Spacing Tokens

When you need sub-pixel adjustments smaller than `--ds-spacing-1`.

```css
/* Problem: Need 1-2px adjustments for optical alignment */

/* Solution: Create micro-spacing scale */
:root {
  /* Micro spacing for fine-tuning optical alignment */
  --digilist-spacing-micro: 2px;
  --digilist-spacing-micro-sm: 1px;
}

/* Usage: Logo text vertical alignment */
.header-logo-text {
  margin-top: var(--digilist-spacing-micro);
}

.header-logo-subtitle {
  margin-top: var(--digilist-spacing-micro-sm);
}
```

### Pattern 4: Component-Specific Tokens

When a component has multiple related tokens.

```css
/* Problem: Sidebar needs its own color scheme */

/* Solution: Create component namespace */
:root, [data-color-scheme="light"] {
  --digilist-sidebar-background: oklch(0.99 0 0);
  --digilist-sidebar-foreground: oklch(0.20 0.02 264);
  --digilist-sidebar-primary: var(--ds-color-accent-base-default);
  --digilist-sidebar-primary-foreground: var(--ds-color-accent-contrast-default);
  --digilist-sidebar-border: var(--ds-color-neutral-border-subtle);
  --digilist-sidebar-accent: oklch(0.96 0 0);
  --digilist-sidebar-accent-foreground: var(--ds-color-accent-text-default);
}

[data-color-scheme="dark"] {
  --digilist-sidebar-background: oklch(0.28 0.09 264);
  --digilist-sidebar-foreground: oklch(0.98 0 0);
  --digilist-sidebar-primary: #9EDBE5;
  --digilist-sidebar-primary-foreground: #1F2F6E;
  --digilist-sidebar-border: oklch(0.32 0.02 260);
  --digilist-sidebar-accent: oklch(0.30 0.05 264);
  --digilist-sidebar-accent-foreground: oklch(0.98 0 0);
}
```

### Pattern 5: Data Visualization Tokens

When you need a consistent color palette for charts.

```css
/* Problem: Need 5 chart colors that work in light/dark */

/* Solution: Create indexed chart color tokens */
:root, [data-color-scheme="light"] {
  --digilist-chart-1: #2F55A4;  /* Primary Blue */
  --digilist-chart-2: #8BC34A;  /* Success Green */
  --digilist-chart-3: #9EDBE5;  /* Aqua */
  --digilist-chart-4: #E5AA20;  /* Warning Orange */
  --digilist-chart-5: #1F2F6E;  /* Navy */
}

[data-color-scheme="dark"] {
  --digilist-chart-1: #9EDBE5;  /* Aqua (more visible) */
  --digilist-chart-2: #8BC34A;  /* Success Green */
  --digilist-chart-3: #2F55A4;  /* Blue */
  --digilist-chart-4: #E5AA20;  /* Warning Orange */
  --digilist-chart-5: #B5E5EC;  /* Light Aqua */
}
```

### Pattern 6: Spacing Aliases

When generated tokens use different naming convention.

```css
/* Problem: CLI generates --ds-size-*, but code uses --ds-spacing-* */

/* Solution: Create aliases */
:root, [data-size] {
  --ds-spacing-0: var(--ds-size-0);
  --ds-spacing-1: var(--ds-size-1);
  --ds-spacing-2: var(--ds-size-2);
  --ds-spacing-3: var(--ds-size-3);
  --ds-spacing-4: var(--ds-size-4);
  /* ... */
}
```

### Pattern 7: Dark Mode Color Override

When primary color should change between modes.

```css
/* Problem: Primary is Blue in light, but Aqua in dark */

/* Solution: Override accent tokens in dark mode */
[data-color-scheme="dark"] {
  --ds-color-accent-base-default: #9EDBE5;
  --ds-color-accent-base-hover: #B5E5EC;
  --ds-color-accent-base-active: #CCEEF3;
  --ds-color-accent-text-default: #D0F0F5;
  --ds-color-accent-contrast-default: #1F2F6E;
}

@media (prefers-color-scheme: dark) {
  [data-color-scheme="auto"] {
    --ds-color-accent-base-default: #9EDBE5;
    --ds-color-accent-base-hover: #B5E5EC;
    --ds-color-accent-base-active: #CCEEF3;
    --ds-color-accent-text-default: #D0F0F5;
    --ds-color-accent-contrast-default: #1F2F6E;
  }
}
```

### Pattern 8: Control Height Tokens

When you need consistent form control heights.

```css
/* Problem: Need standardized control heights */

/* Solution: Create height scale */
:root {
  --digilist-control-height-sm: 2.5rem;    /* 40px */
  --digilist-control-height-md: 2.875rem;  /* 46px */
  --digilist-control-height-lg: 3.25rem;   /* 52px */
}
```

### Pattern 9: Animation Timing Tokens

When you need consistent animation durations.

```css
/* Problem: Animations have inconsistent timing */

/* Solution: Create timing scale */
:root {
  --digilist-animation-duration-fast: 150ms;
  --digilist-animation-duration-normal: 300ms;
  --digilist-animation-duration-slow: 500ms;
  --digilist-animation-duration-slower: 700ms;

  --digilist-animation-delay-fast: 100ms;
  --digilist-animation-delay-normal: 200ms;
  --digilist-animation-delay-slow: 400ms;
}
```

---

## Real-World Examples

### Example 1: Logo Text Component

**Problem:** Logo needs tight line-height and micro spacing adjustments.

**Before (hardcoded):**
```tsx
<span style={{ lineHeight: '1.1', marginTop: '2px' }}>
  DIGILIST
</span>
<span style={{ lineHeight: '1.1', marginTop: '1px' }}>
  ENKEL BOOKING
</span>
```

**After (tokenized):**

```css
/* digilist-extensions.css */
:root {
  --ds-line-height-condensed: 1.1;
  --digilist-spacing-micro: 2px;
  --digilist-spacing-micro-sm: 1px;
}
```

```tsx
<span style={{
  lineHeight: 'var(--ds-line-height-condensed)',
  marginTop: 'var(--digilist-spacing-micro)'
}}>
  DIGILIST
</span>
<span style={{
  lineHeight: 'var(--ds-line-height-condensed)',
  marginTop: 'var(--digilist-spacing-micro-sm)'
}}>
  ENKEL BOOKING
</span>
```

### Example 2: Card Footer Background

**Problem:** Card footer needs lighter background than default surface-hover.

**Before (hardcoded):**
```tsx
<div style={{ backgroundColor: '#f5f6f8' }}>
```

**After (tokenized):**

```css
/* digilist-extensions.css */
:root, [data-color-scheme="light"] {
  --ds-color-neutral-surface-subtle: #f5f6f8;
}
[data-color-scheme="dark"] {
  --ds-color-neutral-surface-subtle: rgba(255, 255, 255, 0.04);
}
```

```tsx
<div style={{ backgroundColor: 'var(--ds-color-neutral-surface-subtle)' }}>
```

### Example 3: Button Border Radius Override

**Problem:** Buttons need +5px more radius than default.

**Solution (CSS rule, not inline):**

```css
/* digilist-extensions.css */

/* Add rounded corners to standalone buttons */
.ds-button {
  border-radius: calc(var(--ds-border-radius-md) + 5px);
}

/* Preserve toggle group button corners */
.ds-toggle-group .ds-button {
  border-radius: var(--ds-border-radius-md) !important;
}
```

---

## Anti-Patterns to Avoid

### Don't: Hardcode in Components

```tsx
// WRONG
<div style={{ marginTop: '2px' }}>

// RIGHT
<div style={{ marginTop: 'var(--digilist-spacing-micro)' }}>
```

### Don't: Duplicate Generated Tokens

```css
/* WRONG - token already in generated file */
:root {
  --ds-spacing-4: 16px;
}

/* RIGHT - use the generated one, or create alias */
:root {
  --ds-spacing-4: var(--ds-size-4);
}
```

### Don't: Use Hardcoded Colors in Extensions

```css
/* WRONG - hardcoded even in extension */
:root {
  --digilist-card-border: #e0e0e0;
}

/* RIGHT - reference existing token */
:root {
  --digilist-card-border: var(--ds-color-neutral-border-subtle);
}
```

### Don't: Forget Dark Mode

```css
/* WRONG - only light mode */
:root {
  --digilist-header-bg: white;
}

/* RIGHT - both modes + auto */
:root, [data-color-scheme="light"] {
  --digilist-header-bg: white;
}
[data-color-scheme="dark"] {
  --digilist-header-bg: #1a1a2e;
}
@media (prefers-color-scheme: dark) {
  [data-color-scheme="auto"] {
    --digilist-header-bg: #1a1a2e;
  }
}
```

### Don't: Create One-Off Tokens Without Documentation

```css
/* WRONG - no explanation */
:root {
  --digilist-x: 2px;
}

/* RIGHT - documented purpose */
:root {
  /* Micro spacing for logo text vertical alignment */
  --digilist-spacing-micro: 2px;
}
```

### Don't: Use Inline Styles for Reusable Patterns

```tsx
// WRONG - repeated inline
<div style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}>
<div style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}>

// RIGHT - token
<div style={{ boxShadow: 'var(--ds-shadow-card-hover)' }}>
<div style={{ boxShadow: 'var(--ds-shadow-card-hover)' }}>
```

---

## Checklist Before Creating Extension

- [ ] Searched `packages/ds-themes/generated/` for existing token
- [ ] Searched `packages/ds-themes/themes/digilist-extensions.css` for existing extension
- [ ] Chose correct namespace (`--ds-*` vs `--digilist-*`)
- [ ] Added to `@layer ds.app` block
- [ ] Provided light mode value
- [ ] Provided dark mode value (if applicable)
- [ ] Added auto mode media query (if dark mode differs)
- [ ] Added documentation comment
- [ ] Ran `pnpm scan:tokens` to verify
