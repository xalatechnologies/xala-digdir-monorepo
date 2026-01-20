# UI Rules Template

> **Purpose:** Define design system rules for AI
> **Usage:** Copy to `/ai/UI_RULES.md` and customize

---

## Core Rule

**All UI MUST use `[your-ds-package]`.** Direct underlying library imports are FORBIDDEN.

---

## Package Structure

```
packages/[ds]/
├── src/
│   ├── primitives/     # Re-exports from underlying lib
│   ├── composed/       # Custom mid-level components
│   ├── blocks/         # Business domain components
│   ├── shells/         # App layouts
│   ├── tokens/         # Design tokens
│   └── index.ts        # Main exports
└── stories/            # Storybook
```

---

## Design Tokens

### Required Usage

```css
/* Colors */
var(--color-primary)
var(--color-background)
var(--color-text)

/* Spacing */
var(--spacing-1)   /* smallest */
var(--spacing-2)
var(--spacing-4)   /* default */
var(--spacing-8)   /* largest */

/* Typography */
var(--font-size-sm)
var(--font-size-md)
var(--font-weight-bold)

/* Borders */
var(--border-radius-sm)
var(--border-radius-md)
```

### ❌ Never Hardcode

```css
margin: 20px;           /* Use token */
color: #333;            /* Use token */
font-size: 14px;        /* Use token */
```

---

## Component Hierarchy

### Layer 1: Primitives
```typescript
Button, Input, Select, Checkbox
Card, Badge, Avatar
Heading, Paragraph
Alert, Dialog, Tooltip
```

### Layer 2: Composed
```typescript
ContentLayout, PageHeader
Navigation, Sidebar
DataTable, FilterBar
FormField, SearchInput
```

### Layer 3: Blocks
```typescript
[DomainEntity]Card
[DomainEntity]List
[DomainEntity]Form
StatusBadge
```

### Layer 4: Shells
```typescript
AppShell
DashboardLayout
PublicLayout
```

---

## Icons

### Registry Only

```typescript
// ✅ CORRECT
import { SearchIcon } from '[ds]';

// ❌ FORBIDDEN
import SearchIcon from './icons/search.svg';
```

---

## Styles Import

### Once Per App

```typescript
// main.tsx only
import '[ds]/styles';
```

---

## Theme Configuration

### Entry Point Only

```typescript
<ThemeProvider
  theme="[theme-name]"
  colorScheme="auto"
>
```

---

## Component Patterns

### Page
```typescript
<PageLayout title={t('page.title')}>
  <Section>
    <DataList data={data} />
  </Section>
</PageLayout>
```

### Form
```typescript
<Card>
  <Form onSubmit={handleSubmit}>
    <FormField label={t('field.label')}>
      <Input {...register('field')} />
    </FormField>
    <Button type="submit">{t('submit')}</Button>
  </Form>
</Card>
```

---

## Storybook Requirements

- All blocks need stories
- Stories document props
- Include edge cases

---

## Accessibility

Required:
- Focus indicators
- Keyboard navigation
- Screen reader support
- Color contrast (AA minimum)
- ARIA labels
- Test IDs on interactive elements
