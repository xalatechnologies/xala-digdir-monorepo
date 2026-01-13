# Design Tokens Guide

This guide explains how to use design tokens in the Digilist application, following Digdir Designsystemet standards.

## Table of Contents

1. [Overview](#overview)
2. [Token Architecture](#token-architecture)
3. [Available Tokens](#available-tokens)
4. [Typography Components](#typography-components)
5. [Token-First Workflow](#token-first-workflow)
6. [Creating Extension Tokens](#creating-extension-tokens)
7. [Dark Mode Support](#dark-mode-support)
8. [Examples](#examples)

---

## Overview

Design tokens are the single source of truth for visual design decisions. They ensure:

- **Consistency** - Same colors, spacing, and typography across all components
- **Maintainability** - Change one token, update everywhere
- **Theme support** - Light/dark mode works automatically
- **Scanner compliance** - ESLint enforces token usage

### Two Token Sources

| Source | File | Purpose |
|--------|------|---------|
| **Generated** | `packages/ds-themes/generated/digilist.css` | CLI-generated from `designsystemet.config.json` - **DO NOT EDIT** |
| **Extensions** | `packages/ds-themes/themes/digilist-extensions.css` | Custom tokens not in Digdir - **EDIT HERE** |

---

## Token Architecture

### Layer System

```
┌─────────────────────────────────────┐
│  digilist-extensions.css            │  ← App extensions (highest priority)
│  @layer ds.app                      │
├─────────────────────────────────────┤
│  digilist.css (generated)           │  ← CLI-generated theme
│  @layer ds.theme.*                  │
├─────────────────────────────────────┤
│  @digdir/designsystemet-css         │  ← Base component styles
│  @layer ds.base                     │
└─────────────────────────────────────┘
```

### Namespace Conventions

| Prefix | Usage | Example |
|--------|-------|---------|
| `--ds-color-*` | Digdir standard colors | `--ds-color-neutral-text-default` |
| `--ds-spacing-*` | Digdir spacing scale | `--ds-spacing-4` |
| `--ds-font-*` | Digdir typography | `--ds-font-size-md` |
| `--ds-border-radius-*` | Digdir border radius | `--ds-border-radius-md` |
| `--ds-shadow-*` | Digdir shadows | `--ds-shadow-md` |
| `--digilist-*` | App-specific tokens | `--digilist-sidebar-background` |

---

## Available Tokens

### Color Tokens

```css
/* Neutral (text, backgrounds, borders) */
--ds-color-neutral-text-default        /* Primary text */
--ds-color-neutral-text-subtle         /* Secondary/muted text */
--ds-color-neutral-background-default  /* Page background */
--ds-color-neutral-surface-default     /* Card/panel surface */
--ds-color-neutral-surface-hover       /* Hover state surface */
--ds-color-neutral-surface-active      /* Active/pressed state */
--ds-color-neutral-border-default      /* Standard borders */
--ds-color-neutral-border-subtle       /* Subtle/divider borders */

/* Accent (primary brand color) */
--ds-color-accent-base-default         /* Primary button background */
--ds-color-accent-base-hover           /* Primary button hover */
--ds-color-accent-text-default         /* Accent text color */
--ds-color-accent-contrast-default     /* Text on accent background */

/* Semantic colors */
--ds-color-success-base-default        /* Success state */
--ds-color-warning-base-default        /* Warning state */
--ds-color-danger-base-default         /* Error/danger state */
--ds-color-info-base-default           /* Info state */

/* Focus */
--ds-color-focus-outer                 /* Focus ring color */
```

### Spacing Tokens

```css
/* Scale: 0-30 (maps to pixel values based on size mode) */
--ds-spacing-0   /* 0px */
--ds-spacing-1   /* ~4px */
--ds-spacing-2   /* ~8px */
--ds-spacing-3   /* ~12px */
--ds-spacing-4   /* ~16px */
--ds-spacing-5   /* ~20px */
--ds-spacing-6   /* ~24px */
--ds-spacing-8   /* ~32px */
--ds-spacing-10  /* ~40px */
--ds-spacing-12  /* ~48px */
/* ... up to --ds-spacing-30 */
```

### Typography Tokens

```css
/* Font sizes (semantic names) */
--ds-font-size-xs   /* Extra small (~12px) */
--ds-font-size-sm   /* Small (~14px) */
--ds-font-size-md   /* Medium (~16px) - body text */
--ds-font-size-lg   /* Large (~18px) */
--ds-font-size-xl   /* Extra large (~21px) */
--ds-font-size-2xl  /* 2x large (~24px) */
--ds-font-size-3xl  /* 3x large (~30px) */
--ds-font-size-4xl  /* 4x large (~36px) */

/* Font weights */
--ds-font-weight-regular   /* 400 */
--ds-font-weight-medium    /* 500 */
--ds-font-weight-semibold  /* 600 */
--ds-font-weight-bold      /* 700 */

/* Line heights */
--ds-line-height-sm        /* Tight */
--ds-line-height-md        /* Normal */
--ds-line-height-lg        /* Loose */
--ds-line-height-condensed /* 1.1 - custom extension */
```

### Border Radius Tokens

```css
--ds-border-radius-sm    /* Small (~2px) */
--ds-border-radius-md    /* Medium (~4px) */
--ds-border-radius-lg    /* Large (~8px) */
--ds-border-radius-xl    /* Extra large (~12px) */
--ds-border-radius-full  /* Pill/circle (9999px) */
```

### Shadow Tokens

```css
--ds-shadow-xs          /* Minimal shadow */
--ds-shadow-sm          /* Small shadow */
--ds-shadow-md          /* Medium shadow */
--ds-shadow-lg          /* Large shadow */
--ds-shadow-xl          /* Extra large shadow */

/* Semantic shadows (from extensions) */
--ds-shadow-card        /* Card resting state */
--ds-shadow-card-hover  /* Card hover state */
--ds-shadow-dropdown    /* Dropdown/popover */
--ds-shadow-header      /* Header shadow */
--ds-shadow-focus-ring  /* Focus indicator */
```

---

## Typography Components

**Important:** For text content, prefer Digdir's typography components over inline-styled HTML elements.

### Why Use Typography Components?

| Approach | Pros | Cons |
|----------|------|------|
| **Digdir Components** | Auto-responsive, built-in styles, semantic | Less control |
| **Inline Styles + Tokens** | Full control | More code, manual responsive |

**Recommendation:** Use `<Heading>` and `<Paragraph>` components for most text. Use inline styles only for special cases.

### Heading Component

```tsx
import { Heading } from '@digdir/designsystemet-react';

// Semantic level + visual size
<Heading level={1} data-size="xl">Page Title</Heading>
<Heading level={2} data-size="md">Section Title</Heading>
<Heading level={3} data-size="xs">Card Title</Heading>
```

**Size Options:** `'2xs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'`

| data-size | Use Case |
|-----------|----------|
| `2xs` | Fine print |
| `xs` | Card titles, compact UI |
| `sm` | Subsections |
| `md` | Section titles (default) |
| `lg` | Important headings |
| `xl` | Page titles |
| `2xl` | Hero titles |

### Paragraph Component

```tsx
import { Paragraph } from '@digdir/designsystemet-react';

// Basic
<Paragraph>Body text</Paragraph>

// With size
<Paragraph data-size="sm">Small text</Paragraph>

// With line-height variant
<Paragraph variant="long">Long-form content with more line spacing</Paragraph>
<Paragraph variant="short">Compact text</Paragraph>
```

**Size Options:** `'xs' | 'sm' | 'md' | 'lg' | 'xl'`
**Variants:** `'short' | 'default' | 'long'`

### Real-World Example: Card Component

```tsx
// ❌ Before: Inline styles
<div>
  <h3 style={{
    fontSize: 'var(--ds-font-size-md)',
    fontWeight: 'var(--ds-font-weight-semibold)',
    color: 'var(--ds-color-neutral-text-default)',
  }}>
    {title}
  </h3>
  <p style={{
    fontSize: 'var(--ds-font-size-sm)',
    color: 'var(--ds-color-neutral-text-subtle)',
  }}>
    {description}
  </p>
</div>

// ✅ After: Digdir components
<div>
  <Heading level={3} data-size="sm">
    {title}
  </Heading>
  <Paragraph
    data-size="sm"
    style={{ color: 'var(--ds-color-neutral-text-subtle)' }}
  >
    {description}
  </Paragraph>
</div>
```

### Customizing Components

Add styles for colors or spacing while keeping component benefits:

```tsx
// Muted text color
<Paragraph
  data-size="sm"
  style={{ color: 'var(--ds-color-neutral-text-subtle)' }}
>
  Secondary text
</Paragraph>

// Custom spacing
<Heading
  level={3}
  data-size="xs"
  style={{ marginBottom: 'var(--ds-spacing-2)' }}
>
  Card Title
</Heading>

// With icon in flex container
<Paragraph
  data-size="sm"
  style={{
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--ds-spacing-1)',
  }}
>
  <MapPinIcon /> {location}
</Paragraph>
```

### When NOT to Use Typography Components

Use inline styles with tokens only for:

- **Status indicators** with semantic colors (success/danger text)
- **Highly custom layouts** where component resets interfere
- **Animation/transition** text that needs precise control
- **Badge/tag content** inside other components

Even then, use tokens for values:
```tsx
<span style={{
  fontSize: 'var(--ds-font-size-xs)',
  color: 'var(--ds-color-success-text-default)',
}}>
  Available
</span>
```

---

## Token-First Workflow

### Step 1: Search for Existing Token

```bash
# Search generated theme
grep "text-default" packages/ds-themes/generated/digilist.css

# Search extensions
grep "sidebar" packages/ds-themes/themes/digilist-extensions.css
```

### Step 2: Use Token in Component

```tsx
// Always use var() syntax
<div style={{
  color: 'var(--ds-color-neutral-text-default)',
  padding: 'var(--ds-spacing-4)',
  borderRadius: 'var(--ds-border-radius-md)',
  boxShadow: 'var(--ds-shadow-card)'
}}>
```

### Step 3: If Token Missing, Create Extension

```css
/* In digilist-extensions.css */
:root {
  /* Document the purpose */
  --digilist-card-image-ratio: 16 / 9;
}
```

### Step 4: Verify with Scanner

```bash
pnpm scan:tokens
```

---

## Creating Extension Tokens

### When to Create Extensions

| Situation | Solution |
|-----------|----------|
| Standard Digdir token exists | Use it directly |
| Standard token missing (e.g., line-height) | Add `--ds-*` extension |
| App-specific semantic value | Add `--digilist-*` token |
| Component-specific value | Add `--digilist-{component}-*` token |
| Micro pixel adjustment | Add `--digilist-spacing-micro-*` token |

### Extension File Structure

```css
@layer ds.app {
  /* ====== SECTION HEADER ====== */

  :root {
    /* Token documentation */
    --token-name: value;
  }

  /* Light mode specific */
  :root, [data-color-scheme="light"] {
    --token-name: light-value;
  }

  /* Dark mode specific */
  [data-color-scheme="dark"] {
    --token-name: dark-value;
  }

  /* Auto mode (respects system preference) */
  @media (prefers-color-scheme: dark) {
    [data-color-scheme="auto"] {
      --token-name: dark-value;
    }
  }
}
```

### Real Examples from Digilist

```css
/* Micro spacing for optical alignment */
:root {
  --digilist-spacing-micro: 2px;
  --digilist-spacing-micro-sm: 1px;
}

/* Condensed line height for logos */
:root {
  --ds-line-height-condensed: 1.1;
}

/* Chart colors */
:root, [data-color-scheme="light"] {
  --digilist-chart-1: #2F55A4;
  --digilist-chart-2: #8BC34A;
}

[data-color-scheme="dark"] {
  --digilist-chart-1: #9EDBE5;
  --digilist-chart-2: #8BC34A;
}

/* Sidebar tokens */
:root {
  --digilist-sidebar-background: oklch(0.99 0 0);
  --digilist-sidebar-primary: var(--ds-color-accent-base-default);
}
```

---

## Dark Mode Support

### Automatic Dark Mode

Most `--ds-color-*` tokens automatically adjust for dark mode. Use them directly:

```tsx
<div style={{ color: 'var(--ds-color-neutral-text-default)' }}>
  {/* Automatically light in light mode, light in dark mode */}
</div>
```

### Custom Dark Mode Values

For extensions that need different light/dark values:

```css
/* Define both modes */
:root, [data-color-scheme="light"] {
  --digilist-card-background: #ffffff;
}

[data-color-scheme="dark"] {
  --digilist-card-background: #1F2F6E;
}

/* Support auto mode */
@media (prefers-color-scheme: dark) {
  [data-color-scheme="auto"] {
    --digilist-card-background: #1F2F6E;
  }
}
```

### Testing Dark Mode

1. Toggle theme in app UI
2. Check both `data-color-scheme="light"` and `data-color-scheme="dark"`
3. Test `data-color-scheme="auto"` with system preference changes

---

## Examples

### Card Component

```tsx
<div style={{
  backgroundColor: 'var(--ds-color-neutral-surface-default)',
  borderRadius: 'var(--ds-border-radius-lg)',
  padding: 'var(--ds-spacing-4)',
  boxShadow: 'var(--ds-shadow-card)',
  border: '1px solid var(--ds-color-neutral-border-subtle)',
  transition: 'box-shadow 0.2s ease',
}}>
  <h3 style={{
    color: 'var(--ds-color-neutral-text-default)',
    fontSize: 'var(--ds-font-size-lg)',
    fontWeight: 'var(--ds-font-weight-semibold)',
    marginBottom: 'var(--ds-spacing-2)',
  }}>
    Card Title
  </h3>
  <p style={{
    color: 'var(--ds-color-neutral-text-subtle)',
    fontSize: 'var(--ds-font-size-sm)',
  }}>
    Card description text
  </p>
</div>
```

### Button with Badge

```tsx
<button style={{
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--ds-spacing-2)',
  padding: 'var(--ds-spacing-2) var(--ds-spacing-4)',
  backgroundColor: 'var(--ds-color-accent-base-default)',
  color: 'var(--ds-color-accent-contrast-default)',
  borderRadius: 'var(--ds-border-radius-md)',
  fontSize: 'var(--ds-font-size-sm)',
  fontWeight: 'var(--ds-font-weight-medium)',
}}>
  <span>Notifications</span>
  <span style={{
    backgroundColor: 'var(--ds-color-danger-base-default)',
    color: 'var(--ds-color-danger-contrast-default)',
    borderRadius: 'var(--ds-border-radius-full)',
    padding: 'var(--ds-spacing-1) var(--ds-spacing-2)',
    fontSize: 'var(--ds-font-size-xs)',
  }}>
    5
  </span>
</button>
```

### Input Field

```tsx
<input style={{
  width: '100%',
  padding: 'var(--ds-spacing-3) var(--ds-spacing-4)',
  backgroundColor: 'var(--ds-color-neutral-surface-default)',
  border: '1px solid var(--ds-color-neutral-border-default)',
  borderRadius: 'var(--ds-border-radius-md)',
  fontSize: 'var(--ds-font-size-md)',
  color: 'var(--ds-color-neutral-text-default)',
  outline: 'none',
}}
placeholder="Search..."
/>
```

---

## Quick Reference

### Most Common Tokens

| Purpose | Token |
|---------|-------|
| Body text | `--ds-color-neutral-text-default` |
| Muted text | `--ds-color-neutral-text-subtle` |
| Page background | `--ds-color-neutral-background-default` |
| Card background | `--ds-color-neutral-surface-default` |
| Hover background | `--ds-color-neutral-surface-hover` |
| Border | `--ds-color-neutral-border-default` |
| Primary button | `--ds-color-accent-base-default` |
| Success | `--ds-color-success-base-default` |
| Error | `--ds-color-danger-base-default` |
| Warning | `--ds-color-warning-base-default` |
| Small gap | `--ds-spacing-2` |
| Medium gap | `--ds-spacing-4` |
| Large gap | `--ds-spacing-6` |
| Card radius | `--ds-border-radius-lg` |
| Button radius | `--ds-border-radius-md` |
| Pill radius | `--ds-border-radius-full` |

### Scanner Commands

```bash
pnpm scan:tokens     # Check token usage only
pnpm scan            # Full compliance scan
pnpm scan:strict     # All warnings as errors
```
