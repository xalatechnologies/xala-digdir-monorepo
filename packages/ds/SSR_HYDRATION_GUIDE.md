# SSR & Hydration Guide for @xala/ds

## Overview

This guide documents SSR (Server-Side Rendering) and hydration considerations for components in the `@xala/ds` design system package.

## Component Categories

### 1. Pure Presentational Components (SSR-Safe)

These components have no client-side dependencies and render identically on server and client.

```tsx
// SSR-safe components - no 'use client' needed for basic rendering
import { 
  StatusBanner,
  DetailField,
  DetailCard,
  PageEmptyState,
  NotFoundState,
} from '@xala/ds';
```

**Characteristics:**
- No `useState`, `useEffect`, or browser APIs
- No event handlers that require hydration
- Pure props → JSX transformation

### 2. Interactive Components (Require 'use client')

These components use React hooks or browser APIs and need the `'use client'` directive.

```tsx
'use client';

import { 
  TableRowActions,     // Uses useState for dropdown
  FilterPanel,         // Uses portal and state
  FilterChipsBar,      // Interactive chips
} from '@xala/ds';
```

**Characteristics:**
- Use `useState`, `useEffect`, `useRef`
- Attach event handlers
- Access `window` or `document`

### 3. Hybrid Components

Components that render static content on server but hydrate with interactivity.

```tsx
'use client';

import { ListPageShell } from '@xala/ds';

// Shell renders on server, actions hydrate on client
function MyListPage() {
  return (
    <ListPageShell
      title="Items"                           // SSR
      subtitle="Manage your items"            // SSR
      actions={<Button>Add New</Button>}      // Hydrates
      filters={<SearchInput />}               // Hydrates
    >
      <DataTable />                           // Hydrates
    </ListPageShell>
  );
}
```

## Best Practices

### 1. Separate Server and Client Logic

```tsx
// page.tsx (Server Component in Next.js App Router)
import { ListPageShell } from '@xala/ds';
import { ItemsTable } from './ItemsTable'; // Client component

export default async function ItemsPage() {
  const items = await fetchItems(); // Server-side data fetching
  
  return (
    <ListPageShell title="Items" subtitle="Manage items">
      <ItemsTable items={items} />
    </ListPageShell>
  );
}

// ItemsTable.tsx (Client Component)
'use client';

import { TableRowActions, createEditAction } from '@xala/ds';

export function ItemsTable({ items }) {
  // Client-side interactivity
  return (
    <Table>
      {items.map(item => (
        <TableRow key={item.id}>
          <TableRowActions actions={[createEditAction(() => edit(item.id))]} />
        </TableRow>
      ))}
    </Table>
  );
}
```

### 2. Avoid Hydration Mismatches

```tsx
// ❌ BAD - Different output on server vs client
function BadComponent() {
  return <p>Current time: {new Date().toISOString()}</p>;
}

// ✅ GOOD - Use useEffect for dynamic content
'use client';

function GoodComponent() {
  const [time, setTime] = useState<string | null>(null);
  
  useEffect(() => {
    setTime(new Date().toISOString());
  }, []);
  
  return <p>Current time: {time ?? 'Loading...'}</p>;
}
```

### 3. Lazy Load Heavy Components

```tsx
'use client';

import dynamic from 'next/dynamic';

// Lazy load components that don't need SSR
const FilterPanel = dynamic(
  () => import('@xala/ds').then(mod => mod.FilterPanel),
  { ssr: false }
);

const MapView = dynamic(
  () => import('@xala/ds').then(mod => mod.MapView),
  { ssr: false, loading: () => <LoadingState /> }
);
```

### 4. Use Suspense for Data Loading

```tsx
import { Suspense } from 'react';
import { LoadingState } from '@xala/ds';

export default function Page() {
  return (
    <DetailPageShell title="Details">
      <Suspense fallback={<LoadingState />}>
        <AsyncDataSection />
      </Suspense>
    </DetailPageShell>
  );
}
```

## Component SSR Compatibility Matrix

| Component | SSR-Safe | Needs 'use client' | Notes |
|-----------|----------|-------------------|-------|
| `ListPageShell` | ✅ | For actions | Shell renders, actions hydrate |
| `DetailPageShell` | ✅ | For actions | Shell renders, actions hydrate |
| `FormPageShell` | ✅ | For form | Shell renders, form hydrates |
| `StatusBanner` | ✅ | ❌ | Pure presentational |
| `DetailField` | ✅ | For copyable | Needs client for copy button |
| `DetailCard` | ✅ | ❌ | Pure presentational |
| `LoadingState` | ✅ | ❌ | Pure presentational |
| `PageEmptyState` | ✅ | For action | Action button needs client |
| `NotFoundState` | ✅ | For onClick | Back button click needs client |
| `ErrorState` | ✅ | For onRetry | Retry button needs client |
| `TableRowActions` | ❌ | ✅ | Uses useState for dropdown |
| `FilterPanel` | ❌ | ✅ | Uses portal and state |
| `FilterChipsBar` | ❌ | ✅ | Interactive chips |
| `Avatar` | ✅ | For onError | Image error handling needs client |
| `StatCard` | ✅ | For onClick | Click handler needs client |
| `SectionCard` | ✅ | For collapsible | Collapse state needs client |

## Design System Import Patterns

### For Vite/SPA Apps (Current Architecture)

```tsx
// All components work normally
import { 
  ListPageShell, 
  TableRowActions,
  StatusBanner 
} from '@xala/ds';
```

### For Next.js App Router (Future)

```tsx
// layout.tsx or page.tsx (Server Component)
import { ListPageShell, StatusBanner } from '@xala/ds';

// Interactive sections need 'use client'
// components/InteractiveSection.tsx
'use client';
import { TableRowActions, FilterPanel } from '@xala/ds';
```

## Extending for SSR

When creating new components, follow these patterns:

### SSR-Safe Component Template

```tsx
/**
 * MyComponent
 * SSR-safe: No browser APIs used.
 * Hydration-safe: Pure presentational component.
 */
import React from 'react';

export interface MyComponentProps {
  title: string;
  children: React.ReactNode;
}

export function MyComponent({ title, children }: MyComponentProps) {
  return (
    <div style={{ /* design tokens only */ }}>
      <h2>{title}</h2>
      {children}
    </div>
  );
}
```

### Interactive Component Template

```tsx
/**
 * MyInteractiveComponent
 * Requires 'use client' directive.
 */
'use client';

import React, { useState, useEffect } from 'react';

export interface MyInteractiveComponentProps {
  onAction: () => void;
}

export function MyInteractiveComponent({ onAction }: MyInteractiveComponentProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Safe browser API access
  useEffect(() => {
    // Client-side only code
  }, []);
  
  return (
    <button onClick={() => setIsOpen(!isOpen)}>
      Toggle
    </button>
  );
}
```

## Summary

1. **Default to SSR-safe** - Design components as pure functions when possible
2. **Add 'use client' only when needed** - For state, effects, or browser APIs
3. **Use design tokens** - Avoids CSS-in-JS hydration issues
4. **Separate concerns** - Keep server data fetching separate from client interactivity
5. **Lazy load** - Heavy interactive components that don't need SEO

---

**Last Updated:** 2026-01-19  
**Maintained By:** Xala Technologies
