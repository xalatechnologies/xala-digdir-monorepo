# DigiList Design System Rules

> **LLM Training Document**
> **Purpose:** Design System usage rules for AI agents
> **Last Updated:** 2026-01-20

---

## Core Rule

**All UI MUST use `@xala/ds`.** Direct `@digdir/*` imports are FORBIDDEN.

```tsx
// ✅ ONLY THIS
import { Button, Card, DataTable } from '@xala/ds';

// ❌ NEVER THIS
import { Button } from '@digdir/designsystemet-react';
```

---

## Package Structure

```
packages/ds/
├── src/
│   ├── primitives/     # Layer 1: Digdir re-exports
│   ├── composed/       # Layer 2: Custom mid-level
│   ├── blocks/         # Layer 3: Business components
│   ├── shells/         # Layer 4: App layouts
│   ├── tokens/         # Design tokens
│   └── index.ts        # Main exports
└── stories/            # Storybook
```

---

## Component Layers

### Layer 1: Primitives
Re-exported from Digdir:
```tsx
Button, Input, Select, Checkbox, Radio, Textarea, Switch
Card, Badge, Avatar, Progress, Spinner
Heading, Paragraph, Label, Text
Alert, Toast, Dialog, Tooltip
Tabs, Breadcrumb, Link, Pagination
```

### Layer 2: Composed
Custom mid-level:
```tsx
ContentLayout, ContentSection, PageHeader
Navigation, Sidebar, Drawer
FilterBar, DataPageToolbar, FilterChips
DataTable, TableFilter, EmptyState
ConfirmDialog, AlertDialog
```

### Layer 3: Blocks
Business domain:
```tsx
RentalObjectCard, RentalObjectGrid, RentalObjectMap
BookingFormModal, BookingConfirmation, AvailabilityCalendar
PermissionMatrix, ScopeSelector
NotificationBell, NotificationList
BookingStatusBadge, PaymentStatusBadge
```

### Layer 4: Shells
Application layouts:
```tsx
AppShell, AppLayout
DashboardSidebar, DashboardContent, DashboardHeader
```

---

## Token Usage

### CSS Variables (REQUIRED)

```css
/* Colors */
var(--ds-color-accent-base-default)
var(--ds-color-neutral-background-subtle)
var(--ds-color-danger-base-default)

/* Spacing */
var(--ds-spacing-1)   /* 4px */
var(--ds-spacing-2)   /* 8px */
var(--ds-spacing-4)   /* 16px */
var(--ds-spacing-6)   /* 24px */

/* Typography */
var(--ds-font-size-sm)
var(--ds-font-size-md)
var(--ds-font-weight-medium)

/* Border */
var(--ds-border-radius-sm)
var(--ds-border-radius-md)
```

### ❌ Never Hardcode

```css
/* FORBIDDEN */
margin: 20px;           /* Use var(--ds-spacing-5) */
color: #333;            /* Use var(--ds-color-neutral-text-default) */
font-size: 14px;        /* Use var(--ds-font-size-sm) */
border-radius: 4px;     /* Use var(--ds-border-radius-sm) */
```

---

## Icons

### SVG Registry Only

```tsx
// ✅ CORRECT
import { SearchIcon, UserIcon, BellIcon } from '@xala/ds';

// ❌ FORBIDDEN
import SearchIcon from './icons/search.svg';
<img src="/icons/user.png" />
```

### Available Icons (80+)
```tsx
SunIcon, MoonIcon, SearchIcon, UserIcon, BellIcon
CalendarIcon, StarIcon, CheckIcon, XMarkIcon
ChevronDownIcon, ChevronUpIcon, ChevronLeftIcon
PlusIcon, MinusIcon, EditIcon, TrashIcon
// ... see @xala/ds exports
```

---

## Styles Import

### Once Per App (main.tsx)

```tsx
// ✅ CORRECT - import once
import '@xala/ds/styles';

// ❌ FORBIDDEN - multiple imports
import '@xala/ds/styles'; // main.tsx
import '@xala/ds/styles'; // App.tsx (DUPLICATE)
```

---

## Theme Configuration

### Provider Setup (via RuntimeProvider)

```tsx
// RuntimeProvider handles this internally
<DesignsystemetProvider
  theme="digilist"      // digilist | digdir | altinn
  colorScheme="auto"    // auto | light | dark
  size="md"             // sm | md | lg
  typography="primary"
>
```

### Theme Switching

```tsx
import { useTheme } from '@xala/ds';

function ThemeToggle() {
  const { colorScheme, setColorScheme } = useTheme();
  
  return (
    <Button onClick={() => setColorScheme(
      colorScheme === 'light' ? 'dark' : 'light'
    )}>
      Toggle Dark Mode
    </Button>
  );
}
```

---

## Component Patterns

### Page Component

```tsx
import { ContentLayout, ContentSection } from '@xala/ds';
import { useT } from '@xala/i18n';

export function BookingsPage() {
  const t = useT();
  
  return (
    <ContentLayout title={t('bookings.title')}>
      <ContentSection>
        <BookingsList />
      </ContentSection>
    </ContentLayout>
  );
}
```

### Form Component

```tsx
import { FormField, Input, Button, Card } from '@xala/ds';
import { useT } from '@xala/i18n';

export function BookingForm({ onSubmit }) {
  const t = useT();
  
  return (
    <Card>
      <form onSubmit={onSubmit}>
        <FormField label={t('booking.title')}>
          <Input {...register('title')} />
        </FormField>
        <Button type="submit">{t('common.save')}</Button>
      </form>
    </Card>
  );
}
```

### Data Display

```tsx
import { DataTable, Badge, BookingStatusBadge } from '@xala/ds';
import { useT } from '@xala/i18n';

export function BookingsList({ bookings }) {
  const t = useT();
  
  const columns = [
    { key: 'displayTitle', header: t('booking.title') },
    { key: 'displayDate', header: t('common.date') },
    { key: 'status', header: t('common.status'), 
      render: (row) => <BookingStatusBadge status={row.status} /> },
  ];
  
  return <DataTable columns={columns} data={bookings} />;
}
```

---

## Storybook Requirements

### All Blocks Need Stories

```tsx
// stories/Blocks/BookingCard.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { BookingCard } from '../../src';

const meta: Meta<typeof BookingCard> = {
  title: 'Blocks/BookingCard',
  component: BookingCard,
};

export default meta;

export const Default: StoryObj = {
  args: {
    booking: mockBooking,
  },
};

export const Pending: StoryObj = {
  args: {
    booking: { ...mockBooking, status: 'pending' },
  },
};
```

### Run Storybook

```bash
pnpm --filter @xala/ds storybook     # Dev
pnpm --filter @xala/ds build-storybook # Build
```

---

## Adding Components

### 1. Choose Layer
- **Primitive:** Simple, no business logic
- **Composed:** Combination of primitives
- **Block:** Business-specific

### 2. Create Component
```tsx
// src/blocks/MyBlock/MyBlock.tsx
import { Card, Heading } from '../../primitives';

export interface MyBlockProps {
  title: string;
}

export function MyBlock({ title }: MyBlockProps) {
  return (
    <Card>
      <Heading>{title}</Heading>
    </Card>
  );
}
```

### 3. Export
```tsx
// src/index.ts
export { MyBlock } from './blocks/MyBlock/MyBlock';
export type { MyBlockProps } from './blocks/MyBlock/MyBlock';
```

### 4. Add Story
```tsx
// stories/Blocks/MyBlock.stories.tsx
```

---

## Accessibility

### Required
- Focus visible indicators
- Keyboard navigation
- Screen reader support
- Color contrast AA
- ARIA labels

### Testing
```tsx
// All interactive elements need data-testid
<Button data-testid="submit-booking">Submit</Button>
<Input data-testid="booking-title" />
```

---

## Digdir References

| Resource | URL |
|----------|-----|
| Docs | [designsystemet.no](https://designsystemet.no) |
| Theme Builder | [theme.designsystemet.no](https://theme.designsystemet.no) |
| GitHub | [github.com/digdir/designsystemet](https://github.com/digdir/designsystemet) |
