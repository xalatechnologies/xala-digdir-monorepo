# @xala/ds - Design System Facade

> **Extends:** [Root CLAUDE.md](../../CLAUDE.md)

## Purpose

`@xala/ds` is the **ONLY allowed import point** for UI components in all apps. It serves as a facade over `@digdir/designsystemet-react` and provides custom composed components, business blocks, and application shells.

**Package Name:** `@xala/ds`
**Storybook Port:** 6006 (when running storybook)
**Key Export:** 200+ components, 80+ icons

---

## Critical Rule

```
❌ NEVER import @digdir/* directly in apps
❌ NEVER import @digdir/designsystemet-react
❌ NEVER import @digdir/designsystemet-css
✅ ONLY import from @xala/ds
```

---

## Component Hierarchy (4 Layers)

### Layer 1: Primitives
Re-exported from `@digdir/designsystemet-react`:
- **Layout:** Container, Grid, Stack, LayoutGrid
- **Forms:** Button, Input, Select, Checkbox, Radio, Textarea, Switch
- **Display:** Card, Badge, Avatar, Progress, Spinner
- **Typography:** Heading, Paragraph, Label, Text
- **Feedback:** Alert, Toast, Dialog, Tooltip
- **Navigation:** Tabs, Breadcrumb, Link, Pagination

### Layer 2: Composed
Custom components built from primitives:
- **Layout:** ContentLayout, ContentSection, PageHeader, AppHeader
- **Navigation:** Navigation, NavigationLink, Sidebar, Drawer
- **Forms:** FilterBar, DataPageToolbar, FilterChips, Wizard, Stepper
- **Display:** DataTable, TableFilter, ListToolbar, EmptyState, StatusTabs
- **Dialogs:** ConfirmDialog, AlertDialog, DemoLoginDialog, GlobalSearch

### Layer 3: Blocks
Business-domain components:
- **Rental Objects:** RentalObjectCard, RentalObjectGrid, RentalObjectMap, RentalObjectDetailHeader
- **Booking:** BookingFormModal, BookingConfirmation, BookingStepper, AvailabilityCalendar, PriceSummaryCard
- **Admin:** PermissionMatrix, ScopeSelector, UserInviteForm
- **GDPR:** ConsentPopup, ConsentSettings, DataSubjectRequestForm
- **Notifications:** NotificationBell, NotificationList, ConversationList, ChatThread
- **Status:** BookingStatusBadge, PaymentStatusBadge, RentalObjectStatusBadge

### Layer 4: Shells
Application-level layouts:
- **AppShell** - Complete application container with header, sidebar, content
- **AppLayout** - Thin wrapper for layout composition
- **DashboardSidebar** - Navigation sidebar with sections
- **DashboardContent** - Main content area

---

## Directory Structure

```
packages/ds/
├── src/
│   ├── primitives/         # Layer 1 - Digdir re-exports
│   ├── composed/           # Layer 2 - Custom mid-level
│   ├── blocks/             # Layer 3 - Business components
│   │   ├── admin/          # Admin-specific blocks
│   │   ├── booking-engine/ # Booking flow components
│   │   ├── rental-objects/ # Rental object components
│   │   └── ...
│   ├── shells/             # Layer 4 - App layouts
│   ├── pages/              # Full page templates
│   ├── tokens/             # Design tokens
│   ├── hooks/              # DS-specific hooks
│   ├── utils/              # Utilities
│   ├── types/              # TypeScript types
│   ├── index.ts            # Main exports (200+)
│   ├── provider.tsx        # DesignsystemetProvider
│   ├── styles.ts           # CSS imports
│   └── ThemeProvider.tsx   # Theme management
├── stories/                # Storybook stories
│   ├── Components/         # Primitive stories
│   ├── Composed/           # Composed stories
│   ├── Blocks/             # Block stories
│   └── Fundamentals/       # Token stories
├── .storybook/             # Storybook config
└── package.json
```

---

## Development Commands

```bash
# From repository root
pnpm --filter @xala/ds dev           # Start dev (watch mode)
pnpm --filter @xala/ds build         # Production build
pnpm --filter @xala/ds storybook     # Start Storybook

# From this directory
pnpm dev                             # Watch mode
pnpm build                           # Build
pnpm storybook                       # Storybook (port 6006)
```

---

## Usage in Apps

### Basic Import
```tsx
// ✅ CORRECT
import {
  Button,
  Card,
  Grid,
  Heading,
  Input,
  DataTable,
  AppShell,
  RentalObjectCard,
} from '@xala/ds';

// ❌ WRONG
import { Button } from '@digdir/designsystemet-react';
```

### Provider Setup
```tsx
// In app main.tsx
import { DesignsystemetProvider } from '@xala/ds';
import '@xala/ds/styles';

function App() {
  return (
    <DesignsystemetProvider
      theme="digdir"
      colorScheme="auto"
      size="md"
      typography="primary"
    >
      <YourApp />
    </DesignsystemetProvider>
  );
}
```

### Styles Import
```tsx
// Import exactly ONCE in main.tsx
import '@xala/ds/styles';
```

---

## Icons (80+)

All icons from `@digdir/designsystemet-icons` are re-exported:

```tsx
import {
  SunIcon,
  MoonIcon,
  SearchIcon,
  UserIcon,
  BellIcon,
  CalendarIcon,
  StarIcon,
  CheckIcon,
  XMarkIcon,
  ChevronDownIcon,
  // ... 80+ icons
} from '@xala/ds';
```

---

## Storybook

**URL:** http://localhost:6006 (when running)

### Story Organization
- `Components/` - Primitive component stories
- `Composed/` - Mid-level component stories
- `Blocks/` - Business component stories
- `Fundamentals/` - Typography, colors, spacing

### Running Storybook
```bash
cd packages/ds
pnpm storybook
```

### Story Example
```tsx
// stories/Components/Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../../src';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    children: 'Click me',
    variant: 'primary',
  },
};
```

---

## Design Tokens

Use CSS variables from Designsystemet:

```css
/* Colors */
var(--ds-color-accent-base-default)
var(--ds-color-neutral-background-subtle)
var(--ds-color-danger-base-default)

/* Spacing */
var(--ds-spacing-1)  /* 4px */
var(--ds-spacing-2)  /* 8px */
var(--ds-spacing-4)  /* 16px */
var(--ds-spacing-6)  /* 24px */

/* Typography */
var(--ds-font-size-sm)
var(--ds-font-size-md)
var(--ds-font-weight-medium)

/* Border radius */
var(--ds-border-radius-sm)
var(--ds-border-radius-md)
```

---

## Theme System

### Available Themes
- `digdir` - Default Digdir theme
- `altinn` - Altinn theme
- `uutilsynet` - Utsynet theme
- `portal` - Portal theme

### Theme Switching
```tsx
import { useTheme } from '@xala/ds';

function ThemeToggle() {
  const { theme, setTheme, colorScheme, setColorScheme } = useTheme();

  return (
    <>
      <Select value={theme} onChange={setTheme}>
        <option value="digdir">Digdir</option>
        <option value="altinn">Altinn</option>
      </Select>
      <Button onClick={() => setColorScheme(colorScheme === 'light' ? 'dark' : 'light')}>
        Toggle Dark Mode
      </Button>
    </>
  );
}
```

---

## Adding New Components

### 1. Choose the Right Layer
- **Primitive:** Simple, no business logic (usually re-export)
- **Composed:** Combination of primitives, reusable patterns
- **Block:** Business-specific, domain logic
- **Shell:** Application-level layout

### 2. Create Component
```tsx
// src/blocks/MyNewBlock/MyNewBlock.tsx
import { Card, Heading, Button } from '../../primitives';

export interface MyNewBlockProps {
  title: string;
  onAction: () => void;
}

export function MyNewBlock({ title, onAction }: MyNewBlockProps) {
  return (
    <Card>
      <Heading>{title}</Heading>
      <Button onClick={onAction}>Action</Button>
    </Card>
  );
}
```

### 3. Export from Index
```tsx
// src/index.ts
export { MyNewBlock } from './blocks/MyNewBlock/MyNewBlock';
export type { MyNewBlockProps } from './blocks/MyNewBlock/MyNewBlock';
```

### 4. Add Storybook Story
```tsx
// stories/Blocks/MyNewBlock.stories.tsx
import { MyNewBlock } from '../../src';

export default {
  title: 'Blocks/MyNewBlock',
  component: MyNewBlock,
};

export const Default = {
  args: {
    title: 'Example',
    onAction: () => console.log('clicked'),
  },
};
```

---

## Thin App Strategy Integration

This package is central to the **Thin App Strategy**:

### Goal
- Move ALL components from apps to @xala/ds
- Apps should only orchestrate and render
- Current: 163 component files still in apps (target: 0)

### Migration Pattern
```bash
# Identify components in apps
find apps/*/src/components -name "*.tsx" | wc -l

# For each component:
# 1. Move to packages/ds/src/blocks/ or composed/
# 2. Export from index.ts
# 3. Update imports in apps
# 4. Delete from apps
```

### Compliance Score
- Current: 75/100
- Target: 100/100
- Violations: 163 component files in apps

---

## Testing

```bash
# Run tests
pnpm test

# Run specific test
pnpm test -- --run src/__tests__/Button.test.tsx

# Coverage
pnpm test:coverage
```

---

## Non-Negotiable Rules

1. **Single Export Point** - Apps import ONLY from @xala/ds
2. **No Direct Digdir** - Never import @digdir/* in apps
3. **Design Tokens Only** - No hardcoded colors/spacing
4. **Storybook Required** - All components need stories
5. **TypeScript Strict** - Full type safety required
6. **Accessibility** - WCAG 2.1 AA compliance

---

## Common Issues

### 1. Missing Export
```tsx
// Error: Module not found
// Solution: Add to index.ts
export { MyComponent } from './path/to/MyComponent';
```

### 2. Theme Not Applied
```tsx
// Check DesignsystemetProvider is at app root
// Check @xala/ds/styles is imported
```

### 3. Icons Not Loading
```tsx
// Icons are separate export
import { SearchIcon } from '@xala/ds';
// NOT from @xala/ds/icons
```

---

## When in Doubt

1. Check if component exists in @xala/ds → use it
2. Component doesn't exist? → Create in appropriate layer
3. Check Storybook for usage examples
4. Use design tokens, never hardcoded values
5. Add story for new components
6. Export from index.ts

---

## Official References (Designsystemet.no)

### Key Resources

| Resource | URL | Description |
|----------|-----|-------------|
| **Main Documentation** | [designsystemet.no](https://designsystemet.no/no) | Official documentation |
| **Theme Builder** | [theme.designsystemet.no](https://theme.designsystemet.no/) | Create custom themes |
| **GitHub Repository** | [github.com/digdir/designsystemet](https://github.com/digdir/designsystemet) | Source code |
| **Slack Community** | [designsystemet.no/slack](https://designsystemet.no/slack) | Community support |

### Fundamentals

- [Getting Started](https://designsystemet.no/no/fundamentals/introduction/get-started) - How to use the design system
- [Accessibility](https://designsystemet.no/no/fundamentals/introduction/accessibility) - Universell utforming
- [Design Tokens](https://designsystemet.no/no/fundamentals/design-elements/variables) - CSS variables reference
- [Build Your Theme](https://designsystemet.no/no/fundamentals/themebuilder/own-theme) - Theme customization

### Best Practices

- [Best Practices](https://designsystemet.no/no/best-practices) - God praksis
- [Writing Advice](https://designsystemet.no/no/best-practices/content-work/writing-advice) - Skriveråd
- [Microtexts](https://designsystemet.no/no/best-practices/content-work/microtexts) - Tegnsetting i mikrotekster
- [Common Terms](https://designsystemet.no/no/best-practices/content-work/terms) - Vanlige begreper

### Patterns (Mønstre)

- [Patterns Overview](https://designsystemet.no/no/patterns) - Cross-agency interaction patterns
- [Required/Optional Fields](https://designsystemet.no/no/patterns/required-and-optional-fields) - Form field marking
- [Error Messages](https://designsystemet.no/no/patterns/errors) - Brukerutløste feilmeldinger
- [System Notifications](https://designsystemet.no/no/patterns/systemnotifications) - Systemvarsler

### Accessibility (Tilgjengelighet)

- [Understanding Vision Impairment](https://designsystemet.no/no/best-practices/accessibility/understanding-vision-impairment)
- [WCAG 3.0 Contrast](https://designsystemet.no/no/best-practices/accessibility/contrast)
- [UU-tilsynet Guidelines](https://www.uutilsynet.no/wcag-standarden/wcag-standarden/86)

---

## Storybook Documentation

The Storybook includes comprehensive documentation matching Designsystemet standards:

### Overview

- **Introduction** - Component hierarchy, design principles, critical rules
- **Getting Started** - Setup, providers, theme configuration

### Fundamentals

- **Tokens** - Complete CSS variable reference
- **Accessibility** - WCAG compliance, keyboard navigation, ARIA
- **Best Practices** - Norwegian writing guidelines, patterns
- **Patterns** - Form validation, notifications, CRUD operations
- **Theme Builder** - Custom theme creation guide

### Components

- **Primitives** - Re-exported Designsystemet components
- **Composed** - Custom mid-level components
- **Blocks** - Business domain components

---

**Last Updated:** 2026-01-20
**Status:** Active Development
**Total Exports:** 200+ components
**Storybook Stories:** 50+
**Designsystemet Version:** Latest
