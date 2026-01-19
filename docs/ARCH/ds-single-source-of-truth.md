# DS Package: Single Source of Truth Policy

**Version:** 1.0  
**Effective Date:** 2026-01-19  
**Status:** MANDATORY

---

## Overview

The `@xala/ds` package is the **single source of truth** for all UI concerns in the Digilist platform:

1. **Design Tokens** - Colors, spacing, typography, shadows, radii
2. **UI Components** - Buttons, inputs, tables, modals, etc.
3. **UI Blocks** - Page sections, compositions, domain-specific displays
4. **Icons** - SVG icon registry

Apps consume the DS package and **never define their own reusable UI**.

---

## Package Structure

```
packages/ds/src/
├── tokens/              # Design tokens
│   └── extended.ts      # Token definitions
│
├── primitives/          # Low-level building blocks
│   ├── Container.tsx    # Layout container
│   ├── Grid.tsx         # CSS Grid wrapper
│   ├── Stack.tsx        # Flexbox stack
│   ├── Badge.tsx        # Badge component
│   ├── Card.tsx         # Card container
│   ├── Text.tsx         # Typography component
│   ├── FormField.tsx    # Form field wrapper
│   └── icons.tsx        # Icon registry
│
├── composed/            # Mid-level compositions
│   ├── PageHeader.tsx           # Page header with breadcrumbs
│   ├── ContentLayout.tsx        # Page content wrapper
│   ├── ContentSection.tsx       # Content section
│   ├── DataTable.tsx            # Data table with sorting/paging
│   ├── ListToolbar.tsx          # Search + filters + sort
│   ├── Drawer.tsx               # Side panel
│   ├── Modal.tsx                # Modal dialog
│   ├── FilterPanel.tsx          # Filter builder
│   ├── FormLayout.tsx           # Form sections
│   ├── data-page/               # Data page components
│   │   ├── EmptyState.tsx
│   │   ├── StatusTabs.tsx
│   │   └── DataPageToolbar.tsx
│   └── PageShell.tsx            # List/Detail/Form shells
│
├── blocks/              # Business-logic compositions
│   ├── RentalObjectCard.tsx     # Rental object display
│   ├── StatusBadges.tsx         # All status badges
│   ├── DashboardComponents.tsx  # Dashboard items
│   ├── BookingFormModal.tsx     # Booking form
│   ├── AuthComponents.tsx       # Loading/Error screens
│   └── messaging/               # Chat components
│
├── shells/              # Application-level layouts
│   ├── AppShell.tsx             # Full app shell
│   ├── AppLayout.tsx            # Alternative layout
│   ├── DashboardSidebar.tsx     # Sidebar navigation
│   └── DashboardContent.tsx     # Main content area
│
├── types/               # Shared type definitions
├── hooks/               # UI hooks (no business logic)
└── utils/               # Utilities
```

---

## Import Rules

### ALLOWED
```typescript
// Import everything from @xala/ds
import { 
  Button, 
  DataTable, 
  PageHeader, 
  AppShell,
  Stack,
  Grid,
  HomeIcon,
  StatusBadge,
} from '@xala/ds';

// Import tokens for edge cases
import { spacing, brandColors } from '@xala/ds';
```

### FORBIDDEN
```typescript
// Direct Digdir imports - ALWAYS use @xala/ds wrapper
import { Button } from '@digdir/designsystemet-react'; // ❌ FORBIDDEN

// App-local components
import { Header } from '../components/layout/Header'; // ❌ FORBIDDEN

// App-local CSS
import styles from './MyPage.module.css'; // ❌ FORBIDDEN
```

---

## Component Categories

### 1. Primitives (Low-Level)
**Purpose:** Basic building blocks without business logic.

| Component | Props | Usage |
|-----------|-------|-------|
| `Container` | `maxWidth`, `padding` | Centered content container |
| `Grid` | `columns`, `gap`, `rows` | CSS Grid layout |
| `Stack` | `direction`, `gap`, `align` | Flexbox stack |
| `Badge` | `color`, `size` | Status/info badge |
| `Card` | `variant`, `padding` | Card container |
| `Text` | `as`, `size`, `weight` | Typography |
| `FormField` | `label`, `error`, `required` | Form field wrapper |

### 2. Composed (Mid-Level)
**Purpose:** Reusable patterns built from primitives.

| Component | Props | Usage |
|-----------|-------|-------|
| `PageHeader` | `title`, `breadcrumbs`, `actions` | Page header |
| `DataTable` | `columns`, `data`, `onSort` | Data table |
| `ListToolbar` | `filters`, `search`, `sort` | List toolbar |
| `Drawer` | `open`, `position`, `size` | Side panel |
| `Modal` | `open`, `size`, `title` | Modal dialog |
| `EmptyState` | `title`, `description`, `action` | Empty state |
| `FilterPanel` | `fields`, `onChange` | Filter builder |

### 3. Blocks (Business-Logic)
**Purpose:** Domain-specific compositions.

| Block | Props | Usage |
|-------|-------|-------|
| `RentalObjectCard` | `rentalObject`, `onClick` | Object display |
| `BookingStatusBadge` | `status` | Booking status |
| `StatCard` | `title`, `value`, `trend` | Dashboard stat |
| `BookingFormModal` | `rentalObject`, `onSubmit` | Booking form |
| `LoadingScreen` | `message` | Full-page loading |
| `ErrorScreen` | `error`, `onRetry` | Error display |

### 4. Shells (Application-Level)
**Purpose:** Complete application layouts.

| Shell | Props | Usage |
|-------|-------|-------|
| `AppShell` | `sidebar`, `header`, `children` | App wrapper |
| `DashboardSidebar` | `sections`, `activeItem` | Sidebar nav |
| `DashboardContent` | `hasBottomNav` | Content area |

---

## Token Usage

### Spacing
```tsx
// Use token values, not raw numbers
<Stack gap={4} padding={6}>  // 4 = 16px, 6 = 24px
```

### Colors
```tsx
// Use semantic tokens
background: 'var(--ds-color-neutral-surface-default)'
border: 'var(--ds-color-neutral-border-subtle)'
```

### Typography
```tsx
// Use Text component with semantic sizes
<Text size="lg" weight="semibold">
```

---

## Adding New Components

### Decision Tree

```
Is it used in ONE app?
  YES → Keep in app as page-local component (not exported)
  NO →
    Is it pure UI (no SDK/business logic)?
      YES → Add to @xala/ds
        Is it a basic element?
          YES → Add to primitives/
        Is it a composition of primitives?
          YES → Add to composed/
        Does it have domain semantics?
          YES → Add to blocks/
      NO → Add business logic to SDK, UI to DS
```

### Component Requirements

Every DS component must have:

1. **TypeScript Props Interface**
```typescript
export interface MyComponentProps {
  /** Description of prop */
  title: string;
  /** Optional description */
  variant?: 'default' | 'compact';
}
```

2. **Export from index.ts**
```typescript
// In primitives/index.ts, composed/index.ts, or blocks/index.ts
export { MyComponent } from './MyComponent';
export type { MyComponentProps } from './MyComponent';
```

3. **data-testid support**
```typescript
<div data-testid={props['data-testid'] ?? 'my-component'}>
```

4. **Accessibility defaults**
```typescript
<div role="region" aria-label={props.title}>
```

5. **i18n key support** (for blocks)
```typescript
interface Props {
  titleKey?: string;  // i18n key
  title?: string;     // Direct text
}
```

---

## Migration Checklist

When migrating a component to DS:

1. [ ] Extract component from app to `packages/ds/src/`
2. [ ] Remove app-specific dependencies (SDK calls, etc.)
3. [ ] Add TypeScript props interface
4. [ ] Export from appropriate index.ts
5. [ ] Add `data-testid` support
6. [ ] Add accessibility attributes
7. [ ] Update app imports to use `@xala/ds`
8. [ ] Delete original app component
9. [ ] Run `pnpm -F @xala/ds build`
10. [ ] Verify all apps still compile

---

## Enforcement

### ESLint Rules
```javascript
{
  'no-restricted-imports': ['error', {
    patterns: ['@digdir/designsystemet-react']
  }]
}
```

### CI Checks
- Fail if `apps/**/components/**` contains reusable components
- Fail if `apps/**/*.module.css` exists
- Fail if imports from `@digdir/designsystemet-react`

---

*This policy is enforced by the DS Governor. All violations must be resolved before merge.*
