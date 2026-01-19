# Accessibility

All DS components must meet WCAG 2.1 AA standards. This document outlines requirements and checklists.

## Core Principles

### Perceivable

- All non-text content has text alternatives
- Color is not the only means of conveying information
- Sufficient color contrast (4.5:1 for text, 3:1 for UI)

### Operable

- All functionality is keyboard accessible
- Focus order is logical and predictable
- Focus indicators are visible

### Understandable

- Text is readable
- Pages behave predictably
- Help users avoid and correct mistakes

### Robust

- Compatible with assistive technologies
- Uses semantic HTML
- ARIA is used correctly

## Keyboard Navigation

### Required Keys

| Key | Standard Behavior |
|-----|-------------------|
| `Tab` | Move to next focusable element |
| `Shift + Tab` | Move to previous focusable element |
| `Enter` | Activate button/link |
| `Space` | Activate button, toggle checkbox |
| `Escape` | Close modal/dropdown/popover |
| `Arrow keys` | Navigate within component |

### Focus Management

```tsx
// Focus must be visible
// DS components include focus styles

// Custom focus management
import { useFocus } from '@xala/ds';

function Component() {
  const { ref, focus } = useFocus();
  return <input ref={ref} />;
}
```

## Color Contrast

| Element | Minimum Ratio |
|---------|---------------|
| Normal text | 4.5:1 |
| Large text (18pt+) | 3:1 |
| UI components | 3:1 |
| Graphics | 3:1 |

Test with Storybook a11y addon or browser dev tools.

## ARIA Usage

### Semantic HTML First

```tsx
// Preferred
<button onClick={handleClick}>Submit</button>

// Avoid
<div role="button" onClick={handleClick}>Submit</div>
```

### Common ARIA Patterns

```tsx
// Modal
<div role="dialog" aria-modal="true" aria-labelledby="title">
  <h2 id="title">Dialog Title</h2>
</div>

// Tabs
<div role="tablist">
  <button role="tab" aria-selected="true">Tab 1</button>
</div>

// Live regions
<div role="status" aria-live="polite">{message}</div>
```

## Screen Reader Support

### Announcements

```tsx
// Polite - waits for user
<div role="status" aria-live="polite">{notification}</div>

// Assertive - interrupts
<div role="alert" aria-live="assertive">{error}</div>
```

### Hidden Content

```tsx
// Visually hidden, accessible
<span className="sr-only">Description for screen readers</span>

// Hidden from screen readers
<Icon aria-hidden="true" />
```

## Form Accessibility

### Labels

```tsx
// Using FormField (preferred)
<FormField label="Email" error={error}>
  <Input type="email" />
</FormField>

// Manual
<label htmlFor="email">Email</label>
<input id="email" type="email" />
```

### Error Messages

```tsx
<input 
  id="email"
  aria-invalid={hasError}
  aria-describedby="email-error"
/>
<span id="email-error" role="alert">
  Please enter a valid email
</span>
```

## Component Checklist

For every DS component:

- [ ] Keyboard navigation works
- [ ] Focus order is logical
- [ ] Focus indicators visible
- [ ] Color contrast meets minimums
- [ ] Screen reader announces correctly
- [ ] ARIA roles/properties correct
- [ ] Works with zoom (200%)
- [ ] Works with reduced motion

## Testing

### Storybook A11y Addon

Automatically runs axe-core on stories:

```tsx
export const Default: Story = {
  args: { /* ... */ },
};

// Disable specific rule (with justification)
Default.parameters = {
  a11y: {
    config: {
      rules: [{ id: 'color-contrast', enabled: false }],
    },
  },
};
```

### Manual Testing

1. Keyboard only navigation
2. Screen reader testing (VoiceOver, NVDA)
3. High contrast mode
4. Zoom to 200%
5. Reduced motion preference

### Automated Testing

```tsx
// Playwright
import AxeBuilder from '@axe-core/playwright';

test('no a11y violations', async ({ page }) => {
  await page.goto('/dashboard');
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
```

## Resources

- [Designsystemet Accessibility](https://designsystemet.no/en/fundamentals/introduction/accessibility/)
- [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [axe-core Rules](https://dequeuniversity.com/rules/axe/)
