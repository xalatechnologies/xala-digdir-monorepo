# Contributing to DS

This guide covers how to add new components and blocks to the Design System.

## Definition of Done

Every DS component/block must have:

- [ ] **Component implementation** in appropriate layer
- [ ] **TypeScript types** exported from index.ts
- [ ] **Stories file** with all variants and states
- [ ] **MDX documentation** with usage, accessibility, do/don't
- [ ] **data-testid** guidance documented
- [ ] **Accessibility** tested (keyboard, screen reader)
- [ ] **Token-only styling** (no raw CSS values)
- [ ] **No emojis** - DS icons only

## Adding a Component

### 1. Choose the Layer

| Layer | When to Use |
|-------|-------------|
| `primitives/` | Low-level building blocks |
| `components/` | Reusable UI elements |
| `composed/` | Mid-level compositions |
| `blocks/` | Business logic components |
| `shells/` | Application layouts |

### 2. Create the Component

```tsx
// src/blocks/MyBlock.tsx
'use client';

import React from 'react';

export interface MyBlockProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function MyBlock({
  title,
  children,
  className,
  style,
}: MyBlockProps): React.ReactElement {
  return (
    <div
      className={className}
      style={{
        padding: 'var(--ds-spacing-4)',
        backgroundColor: 'var(--ds-color-neutral-surface-default)',
        borderRadius: 'var(--ds-border-radius-md)',
        ...style,
      }}
    >
      <h2 style={{
        fontSize: 'var(--ds-font-size-lg)',
        fontWeight: 'var(--ds-font-weight-semibold)',
        color: 'var(--ds-color-neutral-text-default)',
      }}>
        {title}
      </h2>
      {children}
    </div>
  );
}
```

### 3. Export from Index

```tsx
// src/blocks/index.ts
export { MyBlock } from './MyBlock';
export type { MyBlockProps } from './MyBlock';

// src/index.ts
export { MyBlock } from './blocks';
export type { MyBlockProps } from './blocks';
```

### 4. Create Stories

```tsx
// stories/Blocks/MyBlock.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { MyBlock } from '../../src/blocks';

const meta: Meta<typeof MyBlock> = {
  title: 'Blocks/MyBlock',
  component: MyBlock,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'My Block',
    children: 'Content goes here',
  },
};

export const Loading: Story = {
  args: {
    title: 'Loading...',
    children: <Skeleton />,
  },
};
```

### 5. Create MDX Documentation

```mdx
// stories/Blocks/MyBlock.mdx
import { Meta, Canvas, Controls } from '@storybook/blocks';
import * as MyBlockStories from './MyBlock.stories';

<Meta of={MyBlockStories} />

# MyBlock

Description of what the block does.

<Canvas of={MyBlockStories.Default} />

## Props

<Controls of={MyBlockStories.Default} />

## Accessibility

- Keyboard: Tab navigates, Enter activates
- Screen reader: Heading announced

## Do and Don't

### Do
- Use for X scenario
- Combine with Y component

### Don't
- Use for Z scenario
- Override token styles

## data-testid

\`\`\`tsx
<MyBlock data-testid="my-block" />
\`\`\`
```

## Naming Conventions

- **Components**: PascalCase (e.g., `DataTable`, `PageHeader`)
- **Props types**: ComponentNameProps (e.g., `DataTableProps`)
- **Files**: Same as component (e.g., `DataTable.tsx`)
- **Stories**: ComponentName.stories.tsx
- **Docs**: ComponentName.mdx

## Styling Rules

### Required

```tsx
// Use tokens
style={{ padding: 'var(--ds-spacing-4)' }}
```

### Forbidden

```tsx
// No raw values
style={{ padding: '16px' }}

// No inline hex colors
style={{ color: '#333333' }}

// No custom CSS classes with raw values
```

## Testing

### Run Storybook

```bash
pnpm -F @xala/ds storybook
```

### Check Accessibility

1. Open story
2. Check "Accessibility" panel
3. Fix any violations

### Verify Docs Coverage

```bash
pnpm -F @xala/ds docs:coverage
```

## Pull Request Checklist

- [ ] Component follows layer architecture
- [ ] Types exported from index.ts
- [ ] Stories cover all variants/states
- [ ] MDX docs complete
- [ ] Accessibility tested
- [ ] No lint errors
- [ ] No raw CSS values
- [ ] No emojis

## Questions?

Check existing components for patterns or ask in team chat.
