# Design Tokens

Design tokens are the foundational values of the design system. They define colors, spacing, typography, and other visual properties.

## Source of Truth

Tokens are generated from Digdir Designsystemet and extended in `packages/ds/src/tokens/extended.ts`.

## Token Categories

### Spacing

| Token | Value | Usage |
|-------|-------|-------|
| `--ds-spacing-0` | 0 | Reset |
| `--ds-spacing-1` | 0.25rem (4px) | Tight spacing |
| `--ds-spacing-2` | 0.5rem (8px) | Small gaps |
| `--ds-spacing-3` | 0.75rem (12px) | Medium-small |
| `--ds-spacing-4` | 1rem (16px) | Default spacing |
| `--ds-spacing-6` | 1.5rem (24px) | Section spacing |
| `--ds-spacing-8` | 2rem (32px) | Large spacing |
| `--ds-spacing-10` | 2.5rem (40px) | Extra large |

### Colors

#### Neutral
```css
--ds-color-neutral-text-default      /* Primary text */
--ds-color-neutral-text-subtle       /* Secondary text */
--ds-color-neutral-background-default /* Page background */
--ds-color-neutral-surface-default   /* Card/panel background */
--ds-color-neutral-border-default    /* Borders */
```

#### Semantic
```css
/* Success */
--ds-color-success-base-default
--ds-color-success-text-default
--ds-color-success-surface-default

/* Warning */
--ds-color-warning-base-default
--ds-color-warning-text-default
--ds-color-warning-surface-default

/* Danger */
--ds-color-danger-base-default
--ds-color-danger-text-default
--ds-color-danger-surface-default

/* Info */
--ds-color-info-base-default
--ds-color-info-text-default
--ds-color-info-surface-default
```

#### Accent
```css
--ds-color-accent-base-default
--ds-color-accent-text-default
--ds-color-accent-surface-default
--ds-color-accent-border-default
```

### Typography

```css
/* Font Sizes */
--ds-font-size-xs: 0.75rem   /* 12px - Captions */
--ds-font-size-sm: 0.875rem  /* 14px - Small text */
--ds-font-size-md: 1rem      /* 16px - Body */
--ds-font-size-lg: 1.125rem  /* 18px - Large body */
--ds-font-size-xl: 1.25rem   /* 20px - Headings */
--ds-font-size-2xl: 1.5rem   /* 24px - Section titles */

/* Font Weights */
--ds-font-weight-normal: 400
--ds-font-weight-medium: 500
--ds-font-weight-semibold: 600
--ds-font-weight-bold: 700
```

### Border Radius

```css
--ds-border-radius-sm: 0.25rem   /* 4px - Small elements */
--ds-border-radius-md: 0.5rem    /* 8px - Default */
--ds-border-radius-lg: 0.75rem   /* 12px - Cards */
--ds-border-radius-xl: 1rem      /* 16px - Large cards */
--ds-border-radius-full: 9999px  /* Pills, circles */
```

### Shadows

```css
--ds-shadow-sm   /* Subtle elevation */
--ds-shadow-md   /* Cards, dropdowns */
--ds-shadow-lg   /* Modals, popovers */
--ds-shadow-xl   /* Dialogs */
```

## Extending Tokens

To extend tokens safely:

1. Edit `packages/ds/src/tokens/extended.ts`
2. Export new tokens
3. Document in this file
4. Update Storybook token docs

```typescript
// packages/ds/src/tokens/extended.ts
export const extendedTokens = {
  // Custom app-specific tokens
  customSpacing: 'var(--ds-spacing-4)',
  customColor: 'var(--ds-color-accent-base-default)',
};
```

## Usage

### Inline Styles

```tsx
<div style={{
  padding: 'var(--ds-spacing-4)',
  backgroundColor: 'var(--ds-color-neutral-surface-default)',
  borderRadius: 'var(--ds-border-radius-md)',
}}>
  Content
</div>
```

### CSS Classes

```css
.my-component {
  padding: var(--ds-spacing-4);
  color: var(--ds-color-neutral-text-default);
}
```

## Rebuilding Tokens

When Digdir Designsystemet updates tokens:

```bash
# From packages/ds-themes
pnpm tokens:build
```

See [Digdir token documentation](https://designsystemet.no/en/fundamentals/themebuilder/own-theme/) for details.
