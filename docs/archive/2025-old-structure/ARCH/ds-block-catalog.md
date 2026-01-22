# DS Block Catalog

**Version:** 1.0  
**Generated:** 2026-01-19  
**Status:** CANONICAL REFERENCE

---

## Overview

This catalog defines all canonical blocks for the Digilist platform. All pages must be composed exclusively from these blocks. No custom page structures allowed.

---

## Block Categories

### A) Navigation & Shell Blocks

#### 1. `AppShellBlock`
**Status:** EXISTS (as AppShell)  
**Location:** `packages/ds/src/shells/app-shell.tsx`

Complete application layout with sidebar, header, and content area.

```typescript
interface AppShellBlockProps {
  /** Application name for branding */
  appName: string;
  /** Sidebar navigation sections */
  sidebarSections: SidebarSection[];
  /** Current active nav item */
  activeNavItem?: string;
  /** Header user info */
  user?: AppShellUser;
  /** Header actions (buttons, menus) */
  headerActions?: React.ReactNode;
  /** Show mobile bottom navigation */
  showBottomNav?: boolean;
  /** Mobile navigation items */
  bottomNavItems?: BottomNavigationItem[];
  children: React.ReactNode;
  'data-testid'?: string;
}
```

#### 2. `SidebarNavBlock`
**Status:** EXISTS (as DashboardSidebar)  
**Location:** `packages/ds/src/shells/DashboardSidebar.tsx`

Category-based navigation menu rendered from DTO.

```typescript
interface SidebarNavBlockProps {
  /** Navigation sections with categories */
  sections: SidebarSection[];
  /** Currently active item ID */
  activeItemId?: string;
  /** Callback when item clicked */
  onItemClick?: (item: SidebarNavItem) => void;
  /** Collapse state */
  collapsed?: boolean;
  /** Toggle collapse callback */
  onToggleCollapse?: () => void;
  'data-testid'?: string;
}

interface SidebarSection {
  id: string;
  title: string;
  titleKey?: string;  // i18n
  items: SidebarNavItem[];
}

interface SidebarNavItem {
  id: string;
  label: string;
  labelKey?: string;  // i18n
  icon?: React.ReactNode;
  href?: string;
  onClick?: () => void;
  badge?: string | number;
  disabled?: boolean;
}
```

#### 3. `TopBarBlock`
**Status:** EXISTS (as DashboardHeader)  
**Location:** `packages/ds/src/composed/DashboardHeader.tsx`

Header with context switch, profile, and notifications.

```typescript
interface TopBarBlockProps {
  /** Current page title */
  title?: string;
  titleKey?: string;
  /** User information */
  user?: DashboardHeaderUser;
  /** Search component */
  searchComponent?: React.ReactNode;
  /** Action buttons */
  actions?: React.ReactNode;
  /** Show mobile menu toggle */
  showMobileToggle?: boolean;
  /** Mobile menu callback */
  onMobileMenuToggle?: () => void;
  'data-testid'?: string;
}
```

---

### B) Page Structure Blocks

#### 4. `PageHeaderBlock`
**Status:** EXISTS (as PageHeader + DashboardPageHeader)  
**Location:** `packages/ds/src/composed/page-header.tsx`, `DashboardPageHeader.tsx`

Page header with title, breadcrumbs, and actions.

```typescript
interface PageHeaderBlockProps {
  /** Page title */
  title: string;
  titleKey?: string;
  /** Optional subtitle */
  subtitle?: string;
  subtitleKey?: string;
  /** Breadcrumb navigation */
  breadcrumbs?: BreadcrumbItem[];
  /** Action buttons */
  actions?: React.ReactNode;
  /** Metadata items (icon + text) */
  meta?: PageHeaderMetaItem[];
  /** Tab navigation */
  tabs?: PageHeaderTab[];
  /** Active tab */
  activeTab?: string;
  /** Tab change callback */
  onTabChange?: (tabId: string) => void;
  /** Back button */
  showBack?: boolean;
  onBack?: () => void;
  'data-testid'?: string;
}
```

#### 5. `SectionBlock`
**Status:** EXISTS (as ContentSection + SectionCard)  
**Location:** `packages/ds/src/composed/content-section.tsx`, `SectionCard.tsx`

Content section with header and body.

```typescript
interface SectionBlockProps {
  /** Section title */
  title: string;
  titleKey?: string;
  /** Section description */
  description?: string;
  /** Header actions */
  actions?: React.ReactNode;
  /** Collapsible */
  collapsible?: boolean;
  /** Default collapsed state */
  defaultCollapsed?: boolean;
  /** Surface variant */
  variant?: 'default' | 'subtle' | 'elevated';
  children: React.ReactNode;
  'data-testid'?: string;
}
```

#### 6. `EmptyStateBlock`
**Status:** EXISTS (as EmptyState)  
**Location:** `packages/ds/src/composed/data-page/EmptyState.tsx`

Empty state display with icon, title, description, and action.

```typescript
interface EmptyStateBlockProps {
  /** Title text */
  title: string;
  titleKey?: string;
  /** Description text */
  description?: string;
  descriptionKey?: string;
  /** Icon to display */
  icon?: React.ReactNode;
  /** Variant styling */
  variant?: 'default' | 'search' | 'error' | 'filter';
  /** Primary action button */
  action?: {
    label: string;
    labelKey?: string;
    onClick: () => void;
  };
  /** Secondary action */
  secondaryAction?: {
    label: string;
    labelKey?: string;
    onClick: () => void;
  };
  'data-testid'?: string;
}
```

#### 7. `ErrorStateBlock`
**Status:** EXISTS (as ErrorState)  
**Location:** `packages/ds/src/composed/PageStates.tsx`

Error display with message and retry option.

```typescript
interface ErrorStateBlockProps {
  /** Error object or message */
  error: Error | string;
  /** Title override */
  title?: string;
  titleKey?: string;
  /** Show retry button */
  showRetry?: boolean;
  /** Retry callback */
  onRetry?: () => void;
  /** Full page or inline */
  variant?: 'page' | 'inline';
  'data-testid'?: string;
}
```

#### 8. `LoadingStateBlock`
**Status:** EXISTS (as LoadingState)  
**Location:** `packages/ds/src/composed/PageStates.tsx`

Loading indicator.

```typescript
interface LoadingStateBlockProps {
  /** Loading message */
  message?: string;
  messageKey?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Full page or inline */
  variant?: 'page' | 'inline' | 'overlay';
  'data-testid'?: string;
}
```

---

### C) List Page Blocks

#### 9. `ListToolbarBlock`
**Status:** EXISTS (as ListToolbar + DataPageToolbar)  
**Location:** `packages/ds/src/composed/ListToolbar.tsx`, `data-page/DataPageToolbar.tsx`

Search, filters, sort, and view toggle toolbar.

```typescript
interface ListToolbarBlockProps {
  /** Search configuration */
  search?: {
    placeholder?: string;
    placeholderKey?: string;
    value: string;
    onChange: (value: string) => void;
  };
  /** Filter definitions */
  filters?: ListToolbarFilter[];
  /** Current filter values */
  filterValues?: Record<string, unknown>;
  /** Filter change callback */
  onFilterChange?: (key: string, value: unknown) => void;
  /** Sort options */
  sortOptions?: ListToolbarSortOption[];
  /** Current sort */
  currentSort?: string;
  /** Sort change callback */
  onSortChange?: (sortKey: string) => void;
  /** View mode toggle */
  viewModes?: ViewMode[];
  /** Current view mode */
  currentViewMode?: ViewMode;
  /** View mode change */
  onViewModeChange?: (mode: ViewMode) => void;
  /** Primary action button */
  primaryAction?: {
    label: string;
    labelKey?: string;
    icon?: React.ReactNode;
    onClick: () => void;
  };
  'data-testid'?: string;
}

type ViewMode = 'grid' | 'list' | 'table' | 'map';
```

#### 10. `DataTableBlock`
**Status:** EXISTS (as DataTable)  
**Location:** `packages/ds/src/composed/DataTable.tsx`

Data table with sorting, pagination, and row actions.

```typescript
interface DataTableBlockProps<T> {
  /** Table data */
  data: T[];
  /** Column definitions */
  columns: ColumnDef<T>[];
  /** Row key accessor */
  getRowKey: (row: T) => string;
  /** Sortable columns */
  sortable?: boolean;
  /** Current sort state */
  sort?: { key: string; direction: 'asc' | 'desc' };
  /** Sort callback */
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  /** Pagination */
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
    onPageSizeChange?: (size: number) => void;
  };
  /** Row click handler */
  onRowClick?: (row: T) => void;
  /** Row selection */
  selectable?: boolean;
  selectedRows?: string[];
  onSelectionChange?: (ids: string[]) => void;
  /** Loading state */
  isLoading?: boolean;
  /** Empty state */
  emptyState?: React.ReactNode;
  /** Row actions */
  rowActions?: (row: T) => RowAction[];
  'data-testid'?: string;
}
```

#### 11. `ListPageBlock`
**Status:** TO BE CREATED (composition)  
**Priority:** P1

Composes header + toolbar + table + states for list pages.

```typescript
interface ListPageBlockProps<T> {
  /** Page title */
  title: string;
  titleKey?: string;
  /** Breadcrumbs */
  breadcrumbs?: BreadcrumbItem[];
  /** Header actions */
  headerActions?: React.ReactNode;
  /** Toolbar configuration */
  toolbar?: Omit<ListToolbarBlockProps, 'data-testid'>;
  /** Table data */
  data: T[];
  /** Table columns */
  columns: ColumnDef<T>[];
  /** Row key accessor */
  getRowKey: (row: T) => string;
  /** Loading state */
  isLoading?: boolean;
  /** Error state */
  error?: Error | null;
  /** Empty state override */
  emptyState?: React.ReactNode;
  /** Pagination */
  pagination?: PaginationProps;
  /** Row click */
  onRowClick?: (row: T) => void;
  /** Bulk actions */
  bulkActions?: BulkAction[];
  'data-testid'?: string;
}
```

---

### D) Detail Page Blocks

#### 12. `DetailHeaderBlock`
**Status:** EXISTS (as RentalObjectDetailHeader, can be generalized)  
**Location:** `packages/ds/src/blocks/RentalObjectDetailHeader.tsx`

Entity header with status, actions, and metadata.

```typescript
interface DetailHeaderBlockProps {
  /** Entity title/name */
  title: string;
  /** Subtitle */
  subtitle?: string;
  /** Status badge */
  status?: {
    label: string;
    color: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  };
  /** Header image or avatar */
  image?: string;
  /** Action buttons */
  actions?: React.ReactNode;
  /** Metadata items */
  meta?: Array<{
    icon?: React.ReactNode;
    label: string;
    value: string;
  }>;
  /** Back navigation */
  onBack?: () => void;
  'data-testid'?: string;
}
```

#### 13. `DetailSectionsBlock`
**Status:** EXISTS (as DetailCard + KeyValue)  
**Location:** `packages/ds/src/composed/DetailField.tsx`, `KeyValue.tsx`

Key-value sections, timeline, attachments.

```typescript
interface DetailSectionsBlockProps {
  /** Sections to render */
  sections: DetailSection[];
  /** Layout */
  layout?: 'single' | 'two-column';
  'data-testid'?: string;
}

interface DetailSection {
  id: string;
  title: string;
  titleKey?: string;
  type: 'key-value' | 'timeline' | 'attachments' | 'custom';
  /** For key-value sections */
  items?: KeyValuePair[];
  /** For timeline sections */
  timelineItems?: TimelineItem[];
  /** For custom sections */
  content?: React.ReactNode;
}
```

#### 14. `DetailPageBlock`
**Status:** EXISTS (as DetailPageShell)  
**Location:** `packages/ds/src/composed/PageShell.tsx`

Composes header + sections + related lists.

```typescript
interface DetailPageBlockProps {
  /** Entity title */
  title: string;
  titleKey?: string;
  /** Breadcrumbs */
  breadcrumbs?: BreadcrumbItem[];
  /** Status */
  status?: StatusBadgeProps;
  /** Header actions */
  actions?: React.ReactNode;
  /** Tabs */
  tabs?: PageTab[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  /** Loading state */
  isLoading?: boolean;
  /** Error state */
  error?: Error | null;
  /** Back navigation */
  onBack?: () => void;
  children: React.ReactNode;
  'data-testid'?: string;
}
```

---

### E) Dashboard Blocks

#### 15. `DashboardSummaryBlock`
**Status:** EXISTS (as StatsGrid)  
**Location:** `packages/ds/src/composed/StatsGrid.tsx`

Stats overview with cards/rows.

```typescript
interface DashboardSummaryBlockProps {
  /** Summary items */
  items: SummaryItem[];
  /** Layout variant */
  variant?: 'cards' | 'compact' | 'inline';
  /** Columns (for cards) */
  columns?: number;
  /** Loading state */
  isLoading?: boolean;
  'data-testid'?: string;
}

interface SummaryItem {
  id: string;
  label: string;
  labelKey?: string;
  value: string | number;
  /** Optional change indicator */
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    value: string;
  };
  /** Icon */
  icon?: React.ReactNode;
  /** Click action */
  onClick?: () => void;
  /** Color variant */
  color?: 'default' | 'success' | 'warning' | 'danger' | 'info';
}
```

#### 16. `QuickActionsBlock`
**Status:** EXISTS (as QuickActionCard)  
**Location:** `packages/ds/src/blocks/DashboardComponents.tsx`

Quick action grid for dashboard.

```typescript
interface QuickActionsBlockProps {
  /** Action items */
  actions: QuickAction[];
  /** Layout */
  columns?: number;
  'data-testid'?: string;
}

interface QuickAction {
  id: string;
  label: string;
  labelKey?: string;
  description?: string;
  icon: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  badge?: string | number;
}
```

#### 17. `ActivityFeedBlock`
**Status:** EXISTS (as ActivityFeed)  
**Location:** `packages/ds/src/blocks/DashboardComponents.tsx`

Activity feed with timeline.

```typescript
interface ActivityFeedBlockProps {
  /** Activity items */
  items: ActivityItem[];
  /** Max items to show */
  limit?: number;
  /** Show "view all" link */
  showViewAll?: boolean;
  onViewAll?: () => void;
  /** Loading state */
  isLoading?: boolean;
  /** Empty message */
  emptyMessage?: string;
  emptyMessageKey?: string;
  'data-testid'?: string;
}

interface ActivityItem {
  id: string;
  type: 'booking' | 'message' | 'update' | 'alert';
  title: string;
  description?: string;
  timestamp: Date;
  status?: 'pending' | 'success' | 'error';
  actor?: {
    name: string;
    avatar?: string;
  };
  onClick?: () => void;
}
```

---

### F) Form Blocks

#### 18. `FormSectionBlock`
**Status:** EXISTS (as FormSection)  
**Location:** `packages/ds/src/composed/FormLayout.tsx`

Form section with fields.

```typescript
interface FormSectionBlockProps {
  /** Section title */
  title: string;
  titleKey?: string;
  /** Section description */
  description?: string;
  descriptionKey?: string;
  /** Collapsible */
  collapsible?: boolean;
  children: React.ReactNode;
  'data-testid'?: string;
}
```

#### 19. `FormActionsBlock`
**Status:** EXISTS (as FormActions)  
**Location:** `packages/ds/src/composed/FormLayout.tsx`

Form action buttons (submit, cancel, etc.).

```typescript
interface FormActionsBlockProps {
  /** Primary action */
  primaryAction: {
    label: string;
    labelKey?: string;
    onClick: () => void;
    loading?: boolean;
    disabled?: boolean;
  };
  /** Secondary action */
  secondaryAction?: {
    label: string;
    labelKey?: string;
    onClick: () => void;
  };
  /** Tertiary action (e.g., delete) */
  tertiaryAction?: {
    label: string;
    labelKey?: string;
    onClick: () => void;
    variant: 'danger' | 'ghost';
  };
  /** Alignment */
  align?: 'left' | 'right' | 'space-between';
  /** Sticky to bottom */
  sticky?: boolean;
  'data-testid'?: string;
}
```

---

### G) Dialog/Drawer Blocks

#### 20. `ConfirmDialogBlock`
**Status:** EXISTS (as ConfirmDialog)  
**Location:** `packages/ds/src/composed/ConfirmDialog.tsx`

Confirmation dialog.

```typescript
interface ConfirmDialogBlockProps {
  /** Dialog open state */
  open: boolean;
  /** Title */
  title: string;
  titleKey?: string;
  /** Description/message */
  message: string;
  messageKey?: string;
  /** Variant affects styling */
  variant?: 'default' | 'danger' | 'warning';
  /** Confirm button text */
  confirmLabel?: string;
  confirmLabelKey?: string;
  /** Cancel button text */
  cancelLabel?: string;
  cancelLabelKey?: string;
  /** Confirm callback */
  onConfirm: () => void | Promise<void>;
  /** Cancel callback */
  onCancel: () => void;
  /** Loading state */
  isLoading?: boolean;
  'data-testid'?: string;
}
```

#### 21. `DrawerBlock`
**Status:** EXISTS (as Drawer)  
**Location:** `packages/ds/src/composed/Drawer.tsx`

Side panel/drawer.

```typescript
interface DrawerBlockProps {
  /** Open state */
  open: boolean;
  /** Position */
  position?: 'left' | 'right';
  /** Size */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /** Title */
  title: string;
  titleKey?: string;
  /** Close callback */
  onClose: () => void;
  /** Footer actions */
  footer?: React.ReactNode;
  children: React.ReactNode;
  'data-testid'?: string;
}
```

---

## Domain-Specific Blocks

### H) Booking Blocks

| Block | Status | Location |
|-------|--------|----------|
| `BookingStatusBadge` | EXISTS | blocks/StatusBadges.tsx |
| `BookingFormModal` | EXISTS | blocks/BookingFormModal.tsx |
| `BookingConfirmation` | EXISTS | blocks/BookingConfirmation.tsx |
| `BookingSuccess` | EXISTS | blocks/BookingSuccess.tsx |
| `BookingSection` | EXISTS | blocks/BookingSection.tsx |

### I) Rental Object Blocks

| Block | Status | Location |
|-------|--------|----------|
| `RentalObjectCard` | EXISTS | blocks/RentalObjectCard.tsx |
| `RentalObjectListItem` | EXISTS | blocks/RentalObjectListItem.tsx |
| `RentalObjectGrid` | EXISTS | blocks/RentalObjectGrid.tsx |
| `RentalObjectDetailHeader` | EXISTS | blocks/RentalObjectDetailHeader.tsx |
| `RentalObjectToolbar` | EXISTS | blocks/RentalObjectToolbar.tsx |
| `RentalObjectMap` | EXISTS | blocks/RentalObjectMap.tsx |
| `RentalObjectAvailabilityCalendar` | EXISTS | blocks/RentalObjectAvailabilityCalendar.tsx |

### J) Status Badges (All Exist)

| Block | Status |
|-------|--------|
| `BookingStatusBadge` | EXISTS |
| `PaymentStatusBadge` | EXISTS |
| `RentalObjectStatusBadge` | EXISTS |
| `RequestStatusBadge` | EXISTS |
| `SeasonalLeaseStatusBadge` | EXISTS |
| `OrganizationStatusBadge` | EXISTS |
| `UserStatusBadge` | EXISTS |
| `GdprRequestStatusBadge` | EXISTS |
| `BlockStatusBadge` | EXISTS |
| `InvoiceStatusBadge` | EXISTS |
| `IntegrationStatusBadge` | EXISTS |

### K) To Be Created (Domain-Specific)

| Block | Priority | Source |
|-------|----------|--------|
| `SeasonApplicationCard` | P2 | apps/minside/features/seasons |
| `SeasonCard` | P2 | apps/minside/features/seasons |
| `VenueCard` | P2 | apps/minside/features/seasons |
| `GdprConsentBlock` | P2 | apps/minside/components/gdpr |
| `GdprExportBlock` | P2 | apps/minside/components/gdpr |
| `SettingsProfileBlock` | P2 | apps/*/features/settings |
| `SettingsNotificationsBlock` | P2 | apps/*/features/settings |
| `SettingsPreferencesBlock` | P2 | apps/*/features/settings |
| `SettingsAddressesBlock` | P2 | apps/*/features/settings |

---

## Block Usage Summary

| Category | Existing | To Create | Total |
|----------|----------|-----------|-------|
| Navigation & Shell | 3 | 0 | 3 |
| Page Structure | 5 | 0 | 5 |
| List Page | 3 | 1 | 4 |
| Detail Page | 3 | 0 | 3 |
| Dashboard | 3 | 0 | 3 |
| Form | 2 | 0 | 2 |
| Dialog/Drawer | 2 | 0 | 2 |
| Booking | 5 | 0 | 5 |
| Rental Object | 7 | 0 | 7 |
| Status Badges | 11 | 0 | 11 |
| Domain-Specific | 0 | 9 | 9 |
| **TOTAL** | **44** | **10** | **54** |

---

## Implementation Priority

### P0 - Immediate (Block Migration)
1. `ListPageBlock` - Compose existing blocks

### P1 - Week 1 (Consolidation)
1. Generalize `DetailHeaderBlock` from RentalObjectDetailHeader
2. Ensure all blocks have i18n key support
3. Add missing accessibility attributes

### P2 - Week 2+ (Domain Blocks)
1. Season blocks from minside
2. GDPR blocks from minside
3. Settings blocks from all apps

---

*This catalog is the authoritative reference for all UI blocks. Any new block must be added here before implementation.*
