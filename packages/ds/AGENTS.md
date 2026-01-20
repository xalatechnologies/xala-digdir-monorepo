# @xala/ds - Agent Commands

> **Extends:** [Root AGENTS.md](../../AGENTS.md)

## Quick Reference

```bash
# Development
pnpm dev                    # Watch mode
pnpm build                  # Build package
pnpm storybook              # Start Storybook (port 6006)

# Testing
pnpm test                   # Run tests
pnpm test:coverage          # Coverage report

# Analysis
pnpm build --analyze        # Bundle analysis
```

## Package Filter Commands

```bash
# From repository root
pnpm --filter @xala/ds dev
pnpm --filter @xala/ds build
pnpm --filter @xala/ds storybook
pnpm --filter @xala/ds test
```

## Key Files

- `src/index.ts` - Main exports (200+ components)
- `src/primitives/` - Digdir re-exports
- `src/composed/` - Custom mid-level components
- `src/blocks/` - Business domain components
- `src/shells/` - Application layouts
- `src/provider.tsx` - DesignsystemetProvider
- `src/styles.ts` - CSS import point
- `.storybook/` - Storybook configuration

## Component Layers

### Layer 1: Primitives
```tsx
// Re-exports from @digdir/designsystemet-react
import { Button, Input, Card, Grid } from '@xala/ds';
```

### Layer 2: Composed
```tsx
// Custom mid-level components
import { DataTable, FilterBar, Drawer, EmptyState } from '@xala/ds';
```

### Layer 3: Blocks
```tsx
// Business domain components
import { RentalObjectCard, BookingFormModal, NotificationBell } from '@xala/ds';
```

### Layer 4: Shells
```tsx
// Application layouts
import { AppShell, DashboardSidebar, AppLayout } from '@xala/ds';
```

## Common Tasks

### Add New Component

1. **Determine layer:**
   - Primitive → `src/primitives/`
   - Composed → `src/composed/`
   - Block → `src/blocks/`
   - Shell → `src/shells/`

2. **Create component:**
```tsx
// src/blocks/MyBlock/MyBlock.tsx
export function MyBlock(props: MyBlockProps) {
  return <Card>...</Card>;
}
```

3. **Export from index:**
```tsx
// src/index.ts
export { MyBlock } from './blocks/MyBlock/MyBlock';
```

4. **Add Storybook story:**
```tsx
// stories/Blocks/MyBlock.stories.tsx
export default {
  title: 'Blocks/MyBlock',
  component: MyBlock,
};
```

### Migrate Component from App

1. Copy component from `apps/*/src/components/`
2. Move to appropriate layer in `packages/ds/src/`
3. Update imports to use @xala/ds primitives
4. Export from index.ts
5. Update app imports to use @xala/ds
6. Delete from app
7. Add Storybook story

### Add Icon

Icons are already re-exported from @digdir/designsystemet-icons:
```tsx
import { SearchIcon, UserIcon, BellIcon } from '@xala/ds';
```

## Storybook

```bash
# Start Storybook
pnpm storybook              # Opens at http://localhost:6006

# Build static Storybook
pnpm build-storybook
```

### Story Template
```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { MyComponent } from '../../src';

const meta: Meta<typeof MyComponent> = {
  title: 'Category/MyComponent',
  component: MyComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof MyComponent>;

export const Default: Story = {
  args: {
    // default props
  },
};

export const Variant: Story = {
  args: {
    // variant props
  },
};
```

## Design Tokens

```css
/* Use these CSS variables */
var(--ds-color-accent-base-default)
var(--ds-spacing-4)
var(--ds-font-size-md)
var(--ds-border-radius-md)
```

## Testing Commands

```bash
# All tests
pnpm test

# Watch mode
pnpm test -- --watch

# Specific file
pnpm test -- --run src/__tests__/Button.test.tsx

# Coverage
pnpm test:coverage
```

## Build & Deploy

```bash
# Build for production
pnpm build

# Build with analysis
pnpm build --analyze

# The build outputs to dist/
```

## Thin App Migration

```bash
# Find components still in apps
find apps/*/src/components -name "*.tsx" | wc -l

# Current count: 163 (target: 0)
# Priority order:
# 1. backoffice/seasons (29 files)
# 2. web/rental-objects (15 files)
# 3. backoffice/rental-objects (19 files)
```

## Important Notes

- **Single import point** - Apps import ONLY from @xala/ds
- **No direct Digdir imports** - Forbidden in apps
- **Design tokens required** - No hardcoded values
- **Stories required** - All components need Storybook stories
- **TypeScript strict** - Full type safety
- **Accessibility** - WCAG 2.1 AA compliance

## Debugging

```bash
# Check exports
cat src/index.ts | grep "export"

# Test specific component
pnpm test -- --run Button

# Check bundle size
pnpm build && du -sh dist/
```

## Designsystemet References

### Key Resources

| Resource | URL |
|----------|-----|
| Documentation | https://designsystemet.no/no |
| Theme Builder | https://theme.designsystemet.no/ |
| GitHub | https://github.com/digdir/designsystemet |
| Slack | https://designsystemet.no/slack |

### Essential Reading

- [Getting Started](https://designsystemet.no/no/fundamentals/introduction/get-started)
- [Accessibility](https://designsystemet.no/no/fundamentals/introduction/accessibility)
- [Design Tokens](https://designsystemet.no/no/fundamentals/design-elements/variables)
- [Best Practices](https://designsystemet.no/no/best-practices)
- [Patterns](https://designsystemet.no/no/patterns)

### Norwegian Patterns (Mønstre)

- Required/Optional fields: Mark optional, not required
- Error messages: Show on blur, not on load
- System notifications: Use Alert component with proper variant

### Writing Guidelines

- Button labels: No period (`Lagre`, not `Lagre.`)
- Error messages: With period (`E-postadressen er ugyldig.`)
- Use Norwegian terms: `Lagre`, `Avbryt`, `Slett`, `Rediger`

---

**Status:** Active
**Storybook:** http://localhost:6006
