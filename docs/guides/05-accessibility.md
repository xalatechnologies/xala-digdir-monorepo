# Accessibility Guide

**Last Updated:** 2026-01-16
**Standard:** WCAG 2.1 Level AA
**Framework:** Digdir Designsystemet + @xala/ds
**Audience:** Developers, Designers, QA Engineers

---

## Table of Contents

1. [Introduction](#introduction)
2. [WCAG 2.1 Standards Overview](#wcag-21-standards-overview)
3. [Touch Target Accessibility](#touch-target-accessibility)
4. [Keyboard Navigation](#keyboard-navigation)
5. [ARIA Attributes](#aria-attributes)
6. [Color Contrast](#color-contrast)
7. [Focus Management](#focus-management)
8. [Screen Reader Support](#screen-reader-support)
9. [Responsive Accessibility](#responsive-accessibility)
10. [Testing Accessibility](#testing-accessibility)
11. [Common Patterns](#common-patterns)
12. [Accessibility Checklist](#accessibility-checklist)

---

## Introduction

Accessibility is not optional in the Xala/Digilist platform. As a Norwegian municipal booking and resource management system, we serve all citizens including those with disabilities. This guide provides practical implementation guidance for meeting WCAG 2.1 Level AA standards.

### Why Accessibility Matters

- **Legal Requirement:** Norwegian municipalities must comply with accessibility regulations
- **Inclusive Design:** Ensures all citizens can access public services
- **Better UX:** Accessibility improvements benefit all users
- **Production System:** Our platform is live and serves multiple municipalities

### Core Principles (POUR)

1. **Perceivable:** Information must be presentable to users in ways they can perceive
2. **Operable:** UI components must be operable by all users
3. **Understandable:** Information and UI operation must be understandable
4. **Robust:** Content must work with current and future assistive technologies

---

## WCAG 2.1 Standards Overview

### Level AA Requirements (Our Baseline)

| Success Criterion | Level | Description |
|-------------------|-------|-------------|
| 1.4.3 Contrast (Minimum) | AA | 4.5:1 for normal text, 3:1 for large text |
| 1.4.5 Images of Text | AA | Use real text instead of images |
| 2.4.7 Focus Visible | AA | Keyboard focus indicator is visible |
| 2.5.5 Target Size | AA | Touch targets minimum 44x44 pixels |
| 3.2.3 Consistent Navigation | AA | Navigation mechanisms are consistent |
| 3.3.3 Error Suggestion | AA | Provide suggestions when errors occur |

### Additional Level A Requirements

| Success Criterion | Level | Description |
|-------------------|-------|-------------|
| 1.1.1 Non-text Content | A | Provide text alternatives |
| 2.1.1 Keyboard | A | All functionality available via keyboard |
| 2.4.1 Bypass Blocks | A | Skip navigation links |
| 3.3.1 Error Identification | A | Errors are identified in text |
| 4.1.2 Name, Role, Value | A | Proper ARIA attributes |

---

## Touch Target Accessibility

### WCAG 2.5.5 - Target Size (Level AA)

**Requirement:** All interactive elements must be at least **44x44 CSS pixels**.

### Implementation Standards

#### Buttons

```tsx
import { Button } from '@xala/ds';

// ✅ CORRECT - Meets 44px minimum
<Button
  style={{
    minHeight: '44px',
    minWidth: '44px',
  }}
>
  Click Me
</Button>

// ✅ BETTER - Exceeds minimum with 48px
<Button
  style={{
    minHeight: '48px',
    padding: '0 var(--ds-spacing-4)',
  }}
>
  Primary Action
</Button>

// ❌ WRONG - Below 44px minimum
<Button
  style={{
    height: '32px',
    padding: '4px 8px',
  }}
>
  Too Small
</Button>
```

#### Icon Buttons

```tsx
import { Button } from '@xala/ds';
import { MenuIcon } from '@navikt/aksel-icons';

// ✅ CORRECT - 44x44 minimum for icon-only buttons
<Button
  variant="tertiary"
  aria-label="Open menu"
  style={{
    minWidth: '44px',
    minHeight: '44px',
    padding: '0',
  }}
>
  <MenuIcon fontSize="24px" />
</Button>
```

#### Navigation Items

```tsx
// ✅ CORRECT - Bottom navigation with 48px touch targets
<BottomNavigation>
  <BottomNavigation.Item
    icon={<HomeIcon />}
    label="Dashboard"
    style={{ minHeight: '48px' }}
  />
</BottomNavigation>

// ✅ CORRECT - Mobile navigation with adequate touch targets
<MobileNav.Item
  href="/bookings"
  icon={<CalendarIcon />}
  style={{ minHeight: '48px' }}
>
  Bookings
</MobileNav.Item>
```

#### Form Inputs

```tsx
import { Textfield, Checkbox, Radio } from '@xala/ds';

// ✅ CORRECT - Form inputs with 44px minimum height
<Textfield
  label="Email"
  style={{
    minHeight: '44px',
  }}
/>

// ✅ CORRECT - Checkbox/Radio with adequate touch area
<Checkbox
  value="option1"
  style={{
    minHeight: '44px',
    minWidth: '44px',
  }}
>
  Option label
</Checkbox>
```

### Touch Target Verification

Use this command to verify touch targets in your components:

```bash
# Search for minHeight/minWidth declarations
grep -r "minHeight.*44px\|minHeight.*48px" apps/ packages/

# Check for potential violations
grep -r "height.*[0-3][0-9]px" apps/ packages/ | grep -v "icon\|svg\|line-height"
```

---

## Keyboard Navigation

### WCAG 2.1.1 - Keyboard (Level A)

**Requirement:** All functionality must be operable through a keyboard interface.

### Tab Order

Ensure logical tab order follows visual flow:

```tsx
// ✅ CORRECT - Logical tab order
<form>
  <Textfield label="Name" />          {/* tabIndex 1 */}
  <Textfield label="Email" />         {/* tabIndex 2 */}
  <Button type="submit">Submit</Button> {/* tabIndex 3 */}
</form>

// ❌ WRONG - Disrupted tab order
<div>
  <Button tabIndex={3}>Third</Button>
  <Button tabIndex={1}>First</Button>
  <Button tabIndex={2}>Second</Button>
</div>
```

### Keyboard Shortcuts

Common keyboard patterns to implement:

| Key | Action | Context |
|-----|--------|---------|
| `Enter` | Activate button/link | Buttons, links |
| `Space` | Activate button | Buttons |
| `Escape` | Close modal/dialog | Modals, dropdowns |
| `Arrow keys` | Navigate list/menu | Menus, lists |
| `Tab` | Move to next element | Global |
| `Shift+Tab` | Move to previous element | Global |

### Implementation Example

```tsx
import { useEffect, useRef } from 'react';
import { Modal, Button } from '@xala/ds';

function AccessibleModal({ isOpen, onClose, children }) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Focus close button when modal opens
  useEffect(() => {
    if (isOpen && closeButtonRef.current) {
      closeButtonRef.current.focus();
    }
  }, [isOpen]);

  // Handle Escape key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <Modal open={isOpen} onClose={onClose} onKeyDown={handleKeyDown}>
      <Modal.Header>
        <Button
          ref={closeButtonRef}
          onClick={onClose}
          aria-label="Close dialog"
          style={{ minHeight: '44px', minWidth: '44px' }}
        >
          ✕
        </Button>
      </Modal.Header>
      <Modal.Content>
        {children}
      </Modal.Content>
    </Modal>
  );
}
```

### Skip Links

Provide skip navigation for keyboard users:

```tsx
// apps/web/src/App.tsx
function App() {
  return (
    <>
      {/* Skip to main content link */}
      <a
        href="#main-content"
        style={{
          position: 'absolute',
          left: '-9999px',
          zIndex: 999,
          padding: 'var(--ds-spacing-2) var(--ds-spacing-4)',
          background: 'var(--ds-color-accent-surface-default)',
          color: 'var(--ds-color-accent-text-default)',
          ':focus': {
            left: 'var(--ds-spacing-4)',
            top: 'var(--ds-spacing-4)',
          },
        }}
      >
        Skip to main content
      </a>

      <AppShell>
        <main id="main-content">
          {/* Main content */}
        </main>
      </AppShell>
    </>
  );
}
```

---

## ARIA Attributes

### WCAG 4.1.2 - Name, Role, Value (Level A)

**Requirement:** UI components must have proper name, role, and value accessible to assistive technologies.

### Essential ARIA Attributes

#### aria-label

Use when visible text is not sufficient:

```tsx
// ✅ CORRECT - Icon-only button with aria-label
<Button
  variant="tertiary"
  aria-label="Delete booking"
  style={{ minHeight: '44px', minWidth: '44px' }}
>
  <TrashIcon />
</Button>

// ❌ WRONG - Icon button without label
<Button variant="tertiary">
  <TrashIcon />
</Button>
```

#### aria-labelledby

Use to reference existing text as label:

```tsx
// ✅ CORRECT - Dialog with aria-labelledby
<Modal open={isOpen}>
  <Modal.Header>
    <Heading id="dialog-title" level={2}>
      Confirm Deletion
    </Heading>
  </Modal.Header>
  <div role="dialog" aria-labelledby="dialog-title">
    <Paragraph>Are you sure you want to delete this booking?</Paragraph>
  </div>
</Modal>
```

#### aria-describedby

Use to provide additional description:

```tsx
// ✅ CORRECT - Input with error description
<Textfield
  label="Email"
  error
  aria-describedby="email-error"
/>
<span id="email-error" style={{ color: 'var(--ds-color-danger-text-default)' }}>
  Please enter a valid email address
</span>
```

#### aria-expanded

Use for expandable/collapsible elements:

```tsx
import { useState } from 'react';
import { Button } from '@xala/ds';

function AccordionItem({ title, children }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div>
      <Button
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
        style={{ minHeight: '44px' }}
      >
        {title}
      </Button>
      {isExpanded && (
        <div role="region">
          {children}
        </div>
      )}
    </div>
  );
}
```

#### aria-live

Use for dynamic content updates:

```tsx
// ✅ CORRECT - Live region for status updates
<div
  role="status"
  aria-live="polite"
  aria-atomic="true"
  style={{
    position: 'absolute',
    left: '-9999px',
    width: '1px',
    height: '1px',
    overflow: 'hidden',
  }}
>
  {statusMessage}
</div>

// Example usage with booking updates
function BookingStatus({ status }) {
  return (
    <>
      <Badge color={status === 'confirmed' ? 'success' : 'warning'}>
        {status}
      </Badge>
      <div role="status" aria-live="polite" className="sr-only">
        Booking status updated to {status}
      </div>
    </>
  );
}
```

### ARIA Roles

Common roles for custom components:

| Role | Use Case | Example |
|------|----------|---------|
| `button` | Custom button elements | `<div role="button" tabIndex={0}>` |
| `navigation` | Navigation landmarks | `<nav role="navigation">` |
| `dialog` | Modal dialogs | `<div role="dialog">` |
| `alert` | Important messages | `<div role="alert">` |
| `status` | Status updates | `<div role="status">` |
| `region` | Significant content area | `<section role="region">` |
| `menu` | Menu widgets | `<ul role="menu">` |

---

## Color Contrast

### WCAG 1.4.3 - Contrast Minimum (Level AA)

**Requirements:**
- Normal text (< 18pt): **4.5:1** contrast ratio
- Large text (≥ 18pt or 14pt bold): **3:1** contrast ratio
- UI components and graphics: **3:1** contrast ratio

### Using Design Tokens for Contrast

The Digdir Designsystemet tokens are pre-tested for contrast:

```tsx
// ✅ CORRECT - Using semantic tokens (guaranteed contrast)
<Paragraph
  style={{
    color: 'var(--ds-color-neutral-text-default)',
    background: 'var(--ds-color-neutral-surface-default)',
  }}
>
  This text has proper contrast
</Paragraph>

// ✅ CORRECT - Subtle text with tested contrast
<Paragraph
  data-size="sm"
  style={{
    color: 'var(--ds-color-neutral-text-subtle)',
  }}
>
  Secondary information
</Paragraph>

// ❌ WRONG - Custom colors without contrast verification
<Paragraph
  style={{
    color: '#888888',
    background: '#f0f0f0',
  }}
>
  Unknown contrast ratio
</Paragraph>
```

### Dark Mode Considerations

Ensure contrast in both light and dark modes:

```tsx
// ✅ CORRECT - Tokens automatically adjust for dark mode
<Card
  style={{
    background: 'var(--ds-color-neutral-surface-default)',
    color: 'var(--ds-color-neutral-text-default)',
    border: '1px solid var(--ds-color-neutral-border-subtle)',
  }}
>
  Works in light and dark mode
</Card>
```

### Testing Contrast

Use browser DevTools or online tools:

```bash
# Chrome DevTools
# 1. Inspect element
# 2. Open "Accessibility" pane
# 3. Check "Contrast" section

# Online tools
# - WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/
# - Coolors Contrast Checker: https://coolors.co/contrast-checker
```

---

## Focus Management

### WCAG 2.4.7 - Focus Visible (Level AA)

**Requirement:** Keyboard focus indicator must be visible.

### Focus Indicators

```tsx
// ✅ CORRECT - Visible focus indicator with design token
<Button
  style={{
    outline: 'none',
    boxShadow: 'none',
    ':focus-visible': {
      outline: '2px solid var(--ds-color-focus-outer)',
      outlineOffset: '2px',
    },
  }}
>
  Accessible Button
</Button>

// ❌ WRONG - Removing focus outline without replacement
<Button
  style={{
    outline: 'none',
    ':focus': {
      outline: 'none',
    },
  }}
>
  No Focus Indicator
</Button>
```

### Focus Trapping in Modals

Trap focus within modal dialogs:

```tsx
import { useEffect, useRef } from 'react';
import { Modal, Button } from '@xala/ds';

function FocusTrapModal({ isOpen, onClose, children }) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Store previously focused element
      previousFocusRef.current = document.activeElement as HTMLElement;

      // Focus first focusable element in modal
      const focusableElements = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusableElements && focusableElements.length > 0) {
        (focusableElements[0] as HTMLElement).focus();
      }
    } else {
      // Restore focus when modal closes
      previousFocusRef.current?.focus();
    }
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      const focusableElements = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusableElements || focusableElements.length === 0) return;

      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (e.shiftKey) {
        // Shift+Tab: wrap to last element
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        // Tab: wrap to first element
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    }
  };

  return (
    <Modal
      ref={modalRef}
      open={isOpen}
      onClose={onClose}
      onKeyDown={handleKeyDown}
    >
      {children}
    </Modal>
  );
}
```

---

## Screen Reader Support

### Semantic HTML

Use semantic elements for better screen reader experience:

```tsx
// ✅ CORRECT - Semantic HTML
<nav>
  <ul>
    <li><a href="/dashboard">Dashboard</a></li>
    <li><a href="/bookings">Bookings</a></li>
  </ul>
</nav>

<main>
  <article>
    <h1>Page Title</h1>
    <section>
      <h2>Section Title</h2>
      <p>Content</p>
    </section>
  </article>
</main>

// ❌ WRONG - Div soup
<div>
  <div>
    <div><a href="/dashboard">Dashboard</a></div>
    <div><a href="/bookings">Bookings</a></div>
  </div>
</div>
```

### Screen Reader Only Text

Provide additional context for screen readers:

```tsx
// ✅ CORRECT - Screen reader only text
<span
  style={{
    position: 'absolute',
    left: '-9999px',
    width: '1px',
    height: '1px',
    overflow: 'hidden',
  }}
>
  Navigate to dashboard
</span>

// Or use a utility class
<span className="sr-only">
  Navigate to dashboard
</span>
```

### Alt Text for Images

```tsx
// ✅ CORRECT - Descriptive alt text
<img
  src="/booking-confirmation.png"
  alt="Booking confirmation for Meeting Room A on January 16, 2026"
/>

// ✅ CORRECT - Decorative image
<img
  src="/decorative-pattern.svg"
  alt=""
  role="presentation"
/>

// ❌ WRONG - Missing or generic alt text
<img src="/image.png" />
<img src="/image.png" alt="image" />
```

---

## Responsive Accessibility

### Mobile-First Accessibility

Touch targets must be larger on mobile:

```tsx
// ✅ CORRECT - Responsive touch targets
<Button
  style={{
    minHeight: '44px',
    '@media (min-width: 768px)': {
      minHeight: '48px',
    },
  }}
>
  Responsive Button
</Button>
```

### Viewport and Zoom

Ensure users can zoom up to 200%:

```html
<!-- ✅ CORRECT - Allow zooming -->
<meta name="viewport" content="width=device-width, initial-scale=1">

<!-- ❌ WRONG - Prevents zooming -->
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
```

### Orientation Support

Support both portrait and landscape:

```tsx
// ✅ CORRECT - Works in both orientations
<div
  style={{
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: 'var(--ds-spacing-4)',
  }}
>
  <Card>Item 1</Card>
  <Card>Item 2</Card>
</div>
```

---

## Testing Accessibility

### Automated Testing

Use ESLint rules and automated scanners:

```bash
# Run accessibility linting
pnpm scan:a11y

# Run full compliance scan
pnpm scan:compliance

# Check specific issues
pnpm scan:tokens
pnpm scan:components
```

### Manual Testing

#### Keyboard Testing Checklist

- [ ] Tab through all interactive elements
- [ ] Verify tab order is logical
- [ ] Test all keyboard shortcuts
- [ ] Verify focus indicators are visible
- [ ] Test Escape key closes modals
- [ ] Test Enter/Space activates buttons

#### Screen Reader Testing

- [ ] Test with VoiceOver (macOS/iOS)
- [ ] Test with NVDA (Windows)
- [ ] Verify all images have alt text
- [ ] Check heading hierarchy
- [ ] Verify form labels are announced
- [ ] Test live region updates

#### Touch Target Testing

```bash
# Verify touch targets
test -f docs/guides/05-accessibility.md && wc -l docs/guides/05-accessibility.md | awk '{print $1}'

# Search for potential violations
grep -r "height.*[0-3][0-9]px" apps/ packages/ | grep -v "icon\|svg\|line-height"
```

### Browser DevTools

Use accessibility panes in browser DevTools:

```
Chrome DevTools:
1. Inspect element
2. Open "Accessibility" pane
3. Check:
   - ARIA attributes
   - Computed properties
   - Contrast ratio
   - Accessible name

Firefox DevTools:
1. Open Accessibility Inspector
2. Check accessibility tree
3. Verify properties
4. Test keyboard navigation
```

---

## Common Patterns

### Accessible Forms

```tsx
import { Textfield, Button, Checkbox } from '@xala/ds';

function AccessibleForm() {
  const [errors, setErrors] = useState<Record<string, string>>({});

  return (
    <form onSubmit={handleSubmit} aria-label="Booking form">
      {/* Text input with error */}
      <Textfield
        label="Email"
        type="email"
        required
        error={!!errors.email}
        aria-describedby={errors.email ? 'email-error' : undefined}
        style={{ minHeight: '44px' }}
      />
      {errors.email && (
        <span
          id="email-error"
          role="alert"
          style={{ color: 'var(--ds-color-danger-text-default)' }}
        >
          {errors.email}
        </span>
      )}

      {/* Checkbox with label */}
      <Checkbox
        value="terms"
        required
        style={{ minHeight: '44px', minWidth: '44px' }}
      >
        I agree to the terms and conditions
      </Checkbox>

      {/* Submit button */}
      <Button
        type="submit"
        style={{ minHeight: '44px' }}
      >
        Submit Booking
      </Button>
    </form>
  );
}
```

### Accessible Navigation

```tsx
import { MobileNav, BottomNavigation } from '@xala/ds';
import { HomeIcon, CalendarIcon, MessageIcon } from '@navikt/aksel-icons';

function AccessibleNavigation() {
  return (
    <>
      {/* Skip link */}
      <a href="#main-content" className="sr-only-focusable">
        Skip to main content
      </a>

      {/* Main navigation */}
      <nav aria-label="Main navigation">
        <MobileNav>
          <MobileNav.Item
            href="/"
            icon={<HomeIcon />}
            style={{ minHeight: '48px' }}
          >
            Dashboard
          </MobileNav.Item>
          <MobileNav.Item
            href="/bookings"
            icon={<CalendarIcon />}
            style={{ minHeight: '48px' }}
          >
            Bookings
          </MobileNav.Item>
        </MobileNav>
      </nav>

      {/* Main content */}
      <main id="main-content" role="main">
        {/* Page content */}
      </main>

      {/* Bottom navigation for mobile */}
      <BottomNavigation aria-label="Bottom navigation">
        <BottomNavigation.Item
          icon={<HomeIcon />}
          label="Dashboard"
          style={{ minHeight: '48px' }}
        />
      </BottomNavigation>
    </>
  );
}
```

### Accessible Dialogs

```tsx
import { Modal, Button, Heading, Paragraph } from '@xala/ds';

function AccessibleDialog({ isOpen, onClose, onConfirm }) {
  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      role="alertdialog"
      aria-labelledby="dialog-title"
      aria-describedby="dialog-description"
    >
      <Modal.Header>
        <Heading id="dialog-title" level={2}>
          Confirm Deletion
        </Heading>
      </Modal.Header>
      <Modal.Content>
        <Paragraph id="dialog-description">
          Are you sure you want to delete this booking? This action cannot be undone.
        </Paragraph>
      </Modal.Content>
      <Modal.Footer>
        <Button
          variant="secondary"
          onClick={onClose}
          style={{ minHeight: '44px' }}
        >
          Cancel
        </Button>
        <Button
          variant="danger"
          onClick={onConfirm}
          style={{ minHeight: '44px' }}
        >
          Delete
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
```

---

## Accessibility Checklist

Use this checklist before marking features complete:

### Visual Design

- [ ] All text has minimum 4.5:1 contrast ratio (3:1 for large text)
- [ ] All UI components have minimum 3:1 contrast ratio
- [ ] Design works in both light and dark modes
- [ ] No information conveyed by color alone
- [ ] Focus indicators are visible on all interactive elements

### Touch/Mouse Interaction

- [ ] All interactive elements are minimum 44x44 pixels
- [ ] Touch targets have adequate spacing (8px minimum)
- [ ] Hover states are clearly visible
- [ ] Click/tap areas match visual boundaries

### Keyboard Navigation

- [ ] All functionality available via keyboard
- [ ] Tab order is logical and follows visual flow
- [ ] Focus indicators are always visible
- [ ] Escape key closes modals/dialogs
- [ ] Enter/Space activates buttons and links
- [ ] Arrow keys navigate menus and lists

### Screen Reader Support

- [ ] All images have descriptive alt text (or alt="" for decorative)
- [ ] Form inputs have associated labels
- [ ] Heading hierarchy is logical (h1 → h2 → h3)
- [ ] ARIA attributes are used correctly
- [ ] Semantic HTML elements are used
- [ ] Error messages are announced
- [ ] Dynamic content changes are announced

### Forms

- [ ] All inputs have visible labels
- [ ] Required fields are clearly marked
- [ ] Error messages are specific and helpful
- [ ] Errors are associated with fields (aria-describedby)
- [ ] Success confirmation is provided

### Mobile/Responsive

- [ ] Works at 200% zoom
- [ ] Supports both orientations
- [ ] Touch targets are 44px minimum on mobile
- [ ] No horizontal scrolling required
- [ ] Viewport meta tag allows zooming

### Testing

- [ ] Tested with keyboard only
- [ ] Tested with screen reader
- [ ] Automated accessibility scan passes
- [ ] Manual WCAG checklist completed
- [ ] Tested on mobile devices

---

## Resources

### Official Documentation

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Digdir Designsystemet Accessibility](https://designsystemet.no/)
- [Norwegian Accessibility Regulations](https://www.uutilsynet.no/)

### Testing Tools

- **Automated:** axe DevTools, Lighthouse, WAVE
- **Screen Readers:** VoiceOver (macOS/iOS), NVDA (Windows), JAWS (Windows)
- **Contrast:** WebAIM Contrast Checker, Coolors
- **Keyboard:** Browser DevTools, manual testing

### Internal Documentation

- [Touch Target Verification Report](../touch-target-accessibility-verification.md)
- [Component Creation Checklist](../COMPONENT_CREATION_CHECKLIST.md)
- [Design System Guide](./01-getting-started.md)

---

## Questions?

For accessibility questions or issues:

1. Check this guide and reference documentation
2. Review existing accessible components in `packages/ds/`
3. Run automated accessibility scans: `pnpm scan:a11y`
4. Consult the team or accessibility specialist

**Remember:** Accessibility is not optional. It's a requirement for serving all Norwegian citizens.
