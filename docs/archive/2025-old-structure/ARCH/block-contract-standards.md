# Block Contract Standards

**Version:** 1.0  
**Effective Date:** 2026-01-19  
**Status:** MANDATORY

---

## Overview

All DS blocks must follow these contract standards to ensure:
- Consistent API across blocks
- Easy composition in wrappers
- Type safety
- i18n support
- Accessibility compliance
- Testability

---

## Block Categories

### A) Navigation & Shell Blocks
| Block | Purpose |
|-------|---------|
| `AppShellBlock` | Complete application layout |
| `SidebarNavBlock` | Category-based navigation menu |
| `TopBarBlock` | Header with context, profile, notifications |

### B) Page Structure Blocks
| Block | Purpose |
|-------|---------|
| `PageHeaderBlock` | Title, breadcrumbs, actions |
| `SectionBlock` | Content section with header |
| `EmptyStateBlock` | No data state |
| `ErrorStateBlock` | Error display |
| `LoadingStateBlock` | Loading indicator |

### C) List Page Blocks
| Block | Purpose |
|-------|---------|
| `ListPageBlock` | Complete list page composition |
| `ListToolbarBlock` | Search + filters + sort |
| `DataTableBlock` | Table with pagination |

### D) Detail Page Blocks
| Block | Purpose |
|-------|---------|
| `DetailPageBlock` | Complete detail page composition |
| `DetailHeaderBlock` | Entity header + status + actions |
| `DetailSectionsBlock` | Key-value, timeline, attachments |

### E) Dashboard Blocks
| Block | Purpose |
|-------|---------|
| `DashboardSummaryBlock` | Stats overview |
| `SummaryItem` | Individual stat card |

---

## Contract Requirements

### 1. Props Interface (MANDATORY)

Every block must export a typed props interface:

```typescript
// Naming: {BlockName}Props
export interface PageHeaderBlockProps {
  /** Page title - either i18n key or direct text */
  title: string;
  
  /** Optional i18n key for title (overrides title) */
  titleKey?: string;
  
  /** Breadcrumb navigation path */
  breadcrumbs?: BreadcrumbItem[];
  
  /** Action buttons to display */
  actions?: React.ReactNode;
  
  /** Additional metadata items */
  meta?: PageHeaderMetaItem[];
  
  /** Test ID for automation */
  'data-testid'?: string;
}

export interface BreadcrumbItem {
  label: string;
  labelKey?: string;  // i18n key alternative
  href?: string;
  onClick?: () => void;
}

export interface PageHeaderMetaItem {
  icon?: React.ReactNode;
  label: string;
  labelKey?: string;
}
```

### 2. Localization Support (MANDATORY)

All text props must support both direct text and i18n keys:

```typescript
// Pattern: text prop + textKey prop
interface Props {
  title: string;      // Direct text
  titleKey?: string;  // i18n key (takes precedence)
  
  description?: string;
  descriptionKey?: string;
  
  emptyMessage?: string;
  emptyMessageKey?: string;
}

// Implementation
function Block({ title, titleKey }: Props) {
  const t = useT();
  const displayTitle = titleKey ? t(titleKey) : title;
  return <h1>{displayTitle}</h1>;
}
```

### 3. Icon Support (MANDATORY)

Use icon registry keys, not inline SVG:

```typescript
// Icon prop accepts React node (icon component from DS)
interface Props {
  icon?: React.ReactNode;
  iconKey?: IconKey;  // Alternative: icon registry key
}

// Usage
import { HomeIcon } from '@xala/ds';
<Block icon={<HomeIcon />} />

// Or with registry key
<Block iconKey="home" />
```

### 4. Accessibility (MANDATORY)

All blocks must include accessibility defaults:

```typescript
function PageHeaderBlock({ title, 'data-testid': testId }: Props) {
  return (
    <header
      role="banner"
      aria-label={title}
      data-testid={testId ?? 'page-header'}
    >
      <h1 tabIndex={-1} id="page-title">{title}</h1>
    </header>
  );
}
```

Required accessibility features:
- Semantic HTML elements (`<header>`, `<nav>`, `<main>`, etc.)
- ARIA roles where semantic HTML insufficient
- ARIA labels for non-text content
- Keyboard navigation support
- Focus management

### 5. Test ID Support (MANDATORY)

All interactive elements must have `data-testid`:

```typescript
interface Props {
  'data-testid'?: string;
}

function Block({ 'data-testid': testId }: Props) {
  return (
    <div data-testid={testId ?? 'block-default'}>
      <button data-testid={`${testId}-submit`}>Submit</button>
      <button data-testid={`${testId}-cancel`}>Cancel</button>
    </div>
  );
}
```

### 6. No App Dependencies (MANDATORY)

Blocks must NOT import from:
- `@digilist/client-sdk` (no data fetching)
- `apps/*` (no app-specific code)
- Environment variables directly

```typescript
// ❌ FORBIDDEN in blocks
import { useBookings } from '@digilist/client-sdk';
import { API_URL } from '../../../apps/backoffice/src/config';

// ✅ ALLOWED - receive data as props
interface Props {
  bookings: Booking[];
  isLoading: boolean;
  onRefresh: () => void;
}
```

### 7. No Data Fetching (MANDATORY)

Blocks are **pure display components**. Data comes via props:

```typescript
// ❌ FORBIDDEN
function BookingListBlock() {
  const { data } = useQuery(['bookings'], fetchBookings);
  return <Table data={data} />;
}

// ✅ CORRECT
interface BookingListBlockProps {
  bookings: Booking[];
  isLoading?: boolean;
  error?: Error;
  onRefresh?: () => void;
}

function BookingListBlock({ bookings, isLoading, error }: BookingListBlockProps) {
  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;
  return <Table data={bookings} />;
}
```

---

## Block Implementation Template

```typescript
/**
 * {BlockName}
 * 
 * {Description of what this block does}
 * 
 * @example
 * ```tsx
 * <{BlockName}
 *   title="Example"
 *   items={[...]}
 *   onAction={handleAction}
 * />
 * ```
 */

import { useT } from '@xala/i18n';

// 1. Props interface with JSDoc
export interface {BlockName}Props {
  /** Main title - direct text */
  title: string;
  /** i18n key for title (overrides title) */
  titleKey?: string;
  /** Data items to display */
  items: ItemType[];
  /** Loading state */
  isLoading?: boolean;
  /** Error state */
  error?: Error | null;
  /** Action callback */
  onAction?: (item: ItemType) => void;
  /** Test ID */
  'data-testid'?: string;
}

// 2. Component implementation
export function {BlockName}({
  title,
  titleKey,
  items,
  isLoading = false,
  error = null,
  onAction,
  'data-testid': testId = '{block-name}',
}: {BlockName}Props) {
  const t = useT();
  
  // 3. Localization resolution
  const displayTitle = titleKey ? t(titleKey) : title;
  
  // 4. State handling
  if (isLoading) {
    return <LoadingState data-testid={`${testId}-loading`} />;
  }
  
  if (error) {
    return <ErrorState error={error} data-testid={`${testId}-error`} />;
  }
  
  if (items.length === 0) {
    return <EmptyState title={displayTitle} data-testid={`${testId}-empty`} />;
  }
  
  // 5. Main render with accessibility
  return (
    <section
      role="region"
      aria-label={displayTitle}
      data-testid={testId}
    >
      <h2 id={`${testId}-title`}>{displayTitle}</h2>
      <ul role="list" aria-labelledby={`${testId}-title`}>
        {items.map((item, index) => (
          <li
            key={item.id}
            data-testid={`${testId}-item-${index}`}
            onClick={() => onAction?.(item)}
            onKeyDown={(e) => e.key === 'Enter' && onAction?.(item)}
            tabIndex={0}
            role="button"
          >
            {item.name}
          </li>
        ))}
      </ul>
    </section>
  );
}
```

---

## Existing Block Inventory

### Already Compliant
| Block | Location | Notes |
|-------|----------|-------|
| `EmptyState` | composed/data-page/ | Full compliance |
| `DataTable` | composed/DataTable.tsx | Full compliance |
| `PageHeader` | composed/page-header.tsx | Full compliance |
| `StatusBadges` | blocks/StatusBadges.tsx | Full compliance |
| `ListPageShell` | composed/PageShell.tsx | Full compliance |
| `DetailPageShell` | composed/PageShell.tsx | Full compliance |

### Needs Updates
| Block | Issue | Action |
|-------|-------|--------|
| `AppShell` | Missing i18n key support | Add titleKey props |
| `Drawer` | Missing accessibility | Add ARIA roles |
| `RentalObjectCard` | Hardcoded strings | Add i18n support |

### To Be Created
| Block | Priority | Template |
|-------|----------|----------|
| `SidebarNavBlock` | P0 | Navigation category from DTO |
| `TopBarBlock` | P0 | Header composition |
| `DashboardSummaryBlock` | P1 | Stats grid |
| `DetailSectionsBlock` | P1 | Key-value sections |

---

## Testing Requirements

### Unit Tests
```typescript
describe('PageHeaderBlock', () => {
  it('renders title', () => {
    render(<PageHeaderBlock title="Test" />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
  
  it('uses i18n key when provided', () => {
    render(<PageHeaderBlock title="fallback" titleKey="page.title" />);
    expect(screen.getByText('Translated Title')).toBeInTheDocument();
  });
  
  it('has correct accessibility attributes', () => {
    render(<PageHeaderBlock title="Test" />);
    expect(screen.getByRole('banner')).toHaveAttribute('aria-label', 'Test');
  });
  
  it('has data-testid', () => {
    render(<PageHeaderBlock title="Test" data-testid="custom-header" />);
    expect(screen.getByTestId('custom-header')).toBeInTheDocument();
  });
});
```

### Accessibility Tests
```typescript
it('passes accessibility audit', async () => {
  const { container } = render(<PageHeaderBlock title="Test" />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

---

## Changelog Requirements

When adding/modifying blocks, update:

1. **Block index.ts** - Export new component
2. **Main index.ts** - Re-export from @xala/ds
3. **CHANGELOG.md** - Document change
4. **This document** - Update inventory

---

*All blocks must comply before merge. Non-compliant blocks will be flagged in code review.*
