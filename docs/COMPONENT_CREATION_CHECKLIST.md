# Component Creation Checklist

A step-by-step checklist for creating new UI components that comply with Digdir Designsystemet standards.

---

## Pre-Development Checklist

### 1. Research Phase

- [ ] **Check if Digdir component exists**
  ```bash
  # Search Digdir components
  grep -r "ComponentName" node_modules/@digdir/designsystemet-react/
  ```

- [ ] **Check if similar component exists in @xala/ds**
  ```bash
  ls packages/ds/src/
  grep -r "ComponentName" packages/ds/src/
  ```

- [ ] **Review Digdir documentation**
  - Visit: https://designsystemet.no/
  - Check component patterns and accessibility guidelines

### 2. Planning Phase

- [ ] **Define component API**
  - Props interface
  - Default values
  - Event handlers

- [ ] **Identify required tokens**
  - List all colors, spacing, typography, etc.
  - Search for existing tokens first

- [ ] **Plan dark mode support**
  - Does this component need different colors in dark mode?
  - Which tokens need light/dark variants?

---

## Development Checklist

### 3. File Setup

- [ ] **Create component file**
  ```
  packages/ds/src/{category}/{ComponentName}.tsx
  ```
  Categories: `primitives/`, `composed/`, `blocks/`, `shells/`

- [ ] **Export from index**
  ```typescript
  // packages/ds/src/index.ts
  export { ComponentName } from './{category}/{ComponentName}';
  ```

### 4. Token Usage

- [ ] **Search for existing tokens first**
  ```bash
  # Search generated theme
  grep "color-neutral" packages/ds-themes/generated/digilist.css

  # Search extensions
  grep "spacing" packages/ds-themes/themes/digilist-extensions.css
  ```

- [ ] **Use tokens for ALL visual properties**

  | Property | Token Pattern |
  |----------|--------------|
  | Color | `var(--ds-color-{semantic}-{variant})` |
  | Background | `var(--ds-color-{semantic}-surface-{variant})` |
  | Border color | `var(--ds-color-{semantic}-border-{variant})` |
  | Spacing/padding/margin | `var(--ds-spacing-{N})` |
  | Gap | `var(--ds-spacing-{N})` |
  | Font size | `var(--ds-font-size-{size})` |
  | Font weight | `var(--ds-font-weight-{weight})` |
  | Line height | `var(--ds-line-height-{size})` |
  | Border radius | `var(--ds-border-radius-{size})` |
  | Box shadow | `var(--ds-shadow-{size})` |

- [ ] **If token doesn't exist, create extension**
  ```css
  /* packages/ds-themes/themes/digilist-extensions.css */
  :root {
    /* Document the purpose */
    --digilist-{component}-{property}: value;
  }
  ```

### 5. Typography

- [ ] **Use Digdir typography components for text content**
  ```tsx
  import { Heading, Paragraph } from '@digdir/designsystemet-react';
  ```

- [ ] **Headings: Use `<Heading>` component**
  ```tsx
  // ❌ Wrong
  <h3 style={{ fontSize: 'var(--ds-font-size-md)' }}>Title</h3>

  // ✅ Correct
  <Heading level={3} data-size="sm">Title</Heading>
  ```

- [ ] **Body text: Use `<Paragraph>` component**
  ```tsx
  // ❌ Wrong
  <p style={{ fontSize: 'var(--ds-font-size-sm)' }}>Text</p>

  // ✅ Correct
  <Paragraph data-size="sm">Text</Paragraph>
  ```

- [ ] **Choose appropriate sizes**
  | Content | Heading size | Paragraph size |
  |---------|--------------|----------------|
  | Page title | `xl` - `2xl` | - |
  | Section title | `md` - `lg` | - |
  | Card title | `xs` - `sm` | - |
  | Body text | - | `md` |
  | Secondary text | - | `sm` |
  | Captions | - | `xs` |

- [ ] **Customize with style prop when needed**
  ```tsx
  <Paragraph
    data-size="sm"
    style={{ color: 'var(--ds-color-neutral-text-subtle)' }}
  >
    Muted description
  </Paragraph>
  ```

- [ ] **Use inline styles ONLY for special cases:**
  - Status indicators with semantic colors
  - Text inside flex containers with icons
  - Animated/transitioning text

### 6. Accessibility

- [ ] **Semantic HTML**
  - Use appropriate elements (`<button>`, `<nav>`, `<main>`, etc.)
  - Avoid `<div>` soup

- [ ] **ARIA attributes**
  - `aria-label` for icon-only buttons
  - `aria-expanded` for toggles
  - `role` when semantic HTML isn't possible

- [ ] **Keyboard navigation**
  - All interactive elements focusable
  - Logical tab order
  - Keyboard shortcuts where appropriate

- [ ] **Focus indicators**
  - Use `--ds-color-focus-outer` for focus rings
  - Never remove focus outlines without replacement

### 7. TypeScript

- [ ] **Define props interface**
  ```typescript
  export interface ComponentNameProps {
    /** Prop description */
    propName: PropType;
  }
  ```

- [ ] **Use forwardRef if needed**
  ```typescript
  export const ComponentName = forwardRef<HTMLDivElement, ComponentNameProps>(
    (props, ref) => { ... }
  );
  ```

- [ ] **Add displayName**
  ```typescript
  ComponentName.displayName = 'ComponentName';
  ```

---

## Code Quality Checklist

### 8. Pattern Compliance

- [ ] **No hardcoded values**
  ```tsx
  // WRONG
  <div style={{ color: '#333', padding: '16px' }}>

  // RIGHT
  <div style={{
    color: 'var(--ds-color-neutral-text-default)',
    padding: 'var(--ds-spacing-4)'
  }}>
  ```

- [ ] **Button type specified**
  ```tsx
  <button type="button">  {/* Always specify type */}
  ```

- [ ] **asChild has single child**
  ```tsx
  <Button asChild>
    <a href="/link">Only one child</a>
  </Button>
  ```

### 9. Run Scanners

- [ ] **Token scanner**
  ```bash
  pnpm scan:tokens
  ```

- [ ] **Full compliance scan**
  ```bash
  pnpm scan
  ```

- [ ] **Fix any violations before proceeding**

---

## Testing Checklist

### 10. Visual Testing

- [ ] **Light mode appearance**
  - Set `data-color-scheme="light"`
  - Verify all colors look correct

- [ ] **Dark mode appearance**
  - Set `data-color-scheme="dark"`
  - Verify contrast and readability

- [ ] **Auto mode**
  - Set `data-color-scheme="auto"`
  - Toggle system preference
  - Verify smooth transition

### 11. Responsive Testing

- [ ] **Desktop (1024px+)**
- [ ] **Tablet (640px - 1023px)**
- [ ] **Mobile (< 640px)**

### 12. Interactive Testing

- [ ] **Hover states**
- [ ] **Focus states**
- [ ] **Active/pressed states**
- [ ] **Disabled states (if applicable)**

---

## Documentation Checklist

### 13. Component Documentation

- [ ] **JSDoc comments on props**
  ```typescript
  interface Props {
    /**
     * Size variant of the component
     * @default 'md'
     */
    size?: 'sm' | 'md' | 'lg';
  }
  ```

- [ ] **Usage example in component file**
  ```typescript
  /**
   * Card component for displaying content in a contained box.
   *
   * @example
   * <Card>
   *   <CardHeader>Title</CardHeader>
   *   <CardContent>Content</CardContent>
   * </Card>
   */
  ```

### 13. Extension Documentation

- [ ] **If new tokens created, document them**
  ```css
  /* Micro spacing for optical alignment of logo text */
  --digilist-spacing-micro: 2px;
  ```

- [ ] **Update TOKEN_EXTENSION_PATTERNS.md if pattern is reusable**

---

## Final Checklist

### 14. Pre-Commit

- [ ] **Run full scan**
  ```bash
  pnpm scan
  ```

- [ ] **Run linter**
  ```bash
  pnpm lint
  ```

- [ ] **Run build**
  ```bash
  pnpm build
  ```

### 15. Commit

- [ ] **Commit message follows convention**
  ```
  feat(ds): add ComponentName component

  - Description of what it does
  - Any notable implementation details

  Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
  ```

---

## Quick Reference: Common Token Mappings

| Need | Token |
|------|-------|
| Primary text | `var(--ds-color-neutral-text-default)` |
| Secondary text | `var(--ds-color-neutral-text-subtle)` |
| Background | `var(--ds-color-neutral-background-default)` |
| Surface | `var(--ds-color-neutral-surface-default)` |
| Surface hover | `var(--ds-color-neutral-surface-hover)` |
| Border | `var(--ds-color-neutral-border-default)` |
| Subtle border | `var(--ds-color-neutral-border-subtle)` |
| Primary button | `var(--ds-color-accent-base-default)` |
| Focus ring | `var(--ds-color-focus-outer)` |
| XS spacing (4px) | `var(--ds-spacing-1)` |
| SM spacing (8px) | `var(--ds-spacing-2)` |
| MD spacing (16px) | `var(--ds-spacing-4)` |
| LG spacing (24px) | `var(--ds-spacing-6)` |
| XL spacing (32px) | `var(--ds-spacing-8)` |
| Small radius | `var(--ds-border-radius-sm)` |
| Medium radius | `var(--ds-border-radius-md)` |
| Large radius | `var(--ds-border-radius-lg)` |
| Pill radius | `var(--ds-border-radius-full)` |
| Body font | `var(--ds-font-size-md)` |
| Small font | `var(--ds-font-size-sm)` |
| Bold weight | `var(--ds-font-weight-bold)` |
| Medium weight | `var(--ds-font-weight-medium)` |

---

## Template: Basic Component

```tsx
import React, { forwardRef } from 'react';

export interface MyComponentProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Variant of the component
   * @default 'default'
   */
  variant?: 'default' | 'outlined';

  /**
   * Size of the component
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';
}

export const MyComponent = forwardRef<HTMLDivElement, MyComponentProps>(
  ({ variant = 'default', size = 'md', className, style, children, ...props }, ref) => {
    const sizes = {
      sm: 'var(--ds-spacing-2)',
      md: 'var(--ds-spacing-4)',
      lg: 'var(--ds-spacing-6)',
    };

    return (
      <div
        ref={ref}
        className={className}
        style={{
          padding: sizes[size],
          backgroundColor: variant === 'default'
            ? 'var(--ds-color-neutral-surface-default)'
            : 'transparent',
          border: variant === 'outlined'
            ? '1px solid var(--ds-color-neutral-border-default)'
            : 'none',
          borderRadius: 'var(--ds-border-radius-md)',
          color: 'var(--ds-color-neutral-text-default)',
          ...style,
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

MyComponent.displayName = 'MyComponent';
```
