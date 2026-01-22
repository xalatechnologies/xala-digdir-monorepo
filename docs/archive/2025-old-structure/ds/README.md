# Xala Design System (DS)

The Xala Design System is a production-ready component library built on [Digdir Designsystemet](https://designsystemet.no).

## Quick Start

```tsx
// 1. Import styles in your app entry
import '@xala/ds/styles';

// 2. Wrap with providers
import { ThemeProvider } from '@xala/ds';

function App() {
  return (
    <ThemeProvider>
      <YourApp />
    </ThemeProvider>
  );
}

// 3. Use components
import { Button, Card, PageHeader } from '@xala/ds';
```

## Package Structure

```
@xala/ds/
  src/
    primitives/     # Low-level: Container, Grid, Stack, Icon, etc.
    components/     # Reusable UI: Card, Badge, Input, etc.
    composed/       # Mid-level: PageHeader, DataTable, ListToolbar
    blocks/         # Business: RentalObjectCard, BookingSection, etc.
    shells/         # App layouts: AppShell, DashboardSidebar
    tokens/         # Design tokens (extended from Digdir)
    hooks/          # Utility hooks
    types/          # TypeScript types
    utils/          # Utility functions
```

## Component Hierarchy

| Layer | Description | Examples |
|-------|-------------|----------|
| **Primitives** | Low-level building blocks | Container, Grid, Stack, Icon |
| **Components** | Reusable UI components | Card, Badge, Input, Select |
| **Composed** | Mid-level compositions | PageHeader, DataTable, ListToolbar |
| **Blocks** | Business logic components | RentalObjectCard, BookingSection |
| **Shells** | Application-level layouts | AppShell, DashboardSidebar |

## Documentation

- [Tokens](./TOKENS.md) - Design token reference
- [Theming](./THEMING.md) - Theme configuration and switching
- [Accessibility](./ACCESSIBILITY.md) - A11y guidelines and checklists
- [Patterns](./PATTERNS.md) - Implementation patterns
- [Contributing](./CONTRIBUTING.md) - How to contribute
- [Releases](./RELEASES.md) - Versioning and changelog

## Storybook

```bash
# Development
pnpm -F @xala/ds storybook

# Build
pnpm -F @xala/ds storybook:build
```

## Core Principles

### Token-First Styling

All styling must use DS tokens. No raw CSS values.

```tsx
// Correct
<div style={{ padding: 'var(--ds-spacing-4)' }}>

// Incorrect
<div style={{ padding: '16px' }}>
```

### Thin Apps, Rich DS

Applications are thin wrappers around DS blocks. UI logic lives in DS.

### No Emojis

Use DS icon registry only. Emojis are not permitted.

### Accessibility First

All components meet WCAG 2.1 AA standards.

## Links

- [Designsystemet](https://designsystemet.no)
- [Storybook](http://localhost:6006) (local)
- [Best Practices](https://designsystemet.no/en/best-practices/)
