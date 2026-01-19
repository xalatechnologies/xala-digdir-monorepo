# Design System Component Usage Guidelines

> Last Updated: 2026-01-19

This document provides guidelines for using the `@xala/ds` design system consistently across all applications.

---

## Core Principles

### 1. Reuse First

**Before creating any new UI component:**

1. ✅ Search the [component inventory](./component-inventory.md)
2. ✅ Check if the pattern exists in `@xala/ds`
3. ✅ Reuse the existing component
4. ❌ Only if missing: add to design system, document it, then use everywhere

### 2. No Raw HTML for Common Patterns

**Use design system components instead of raw HTML for:**

| Pattern | ❌ Don't Use | ✅ Use Instead |
|---------|-------------|----------------|
| Page headers | `<div><h1>Title</h1></div>` | `<PageHeader title="Title" />` |
| Cards | `<div className="card">` | `<Card>` |
| Tables | `<table>` | `<DataTable>` |
| Empty states | `<div>No items</div>` | `<EmptyState />` |
| Buttons | `<button>` | `<Button>` |
| Forms | `<form>` + `<input>` | `<Textfield>`, `<Select>`, etc. |
| Modals | `<div className="modal">` | `<Dialog>`, `<ConfirmDialog>` |
| Drawers | Custom slide-out | `<Drawer>` |
| Loading | Custom spinner | `<Spinner>`, `<Skeleton>` |
| Errors | `<div className="error">` | `<ErrorScreen>`, `<Alert>` |

### 3. Consistent Imports

**Always import from `@xala/ds`:**

```tsx
// ✅ Correct - import from design system
import { 
  Button, 
  DataTable, 
  PageHeader, 
  EmptyState,
  Dialog,
  Textfield 
} from '@xala/ds';

// ❌ Wrong - importing from app-local components
import { ProtectedRoute } from '../components/ProtectedRoute';

// ❌ Wrong - importing directly from Digdir
import { Button } from '@digdir/designsystemet-react';
```

### 4. i18n Compliance

**All visible text must use translation keys:**

```tsx
// ✅ Correct
<PageHeader title={t('bookings.title')} />
<EmptyState title={t('bookings.empty.title')} />

// ❌ Wrong - hardcoded strings
<PageHeader title="Bookings" />
<EmptyState title="No bookings found" />
```

### 5. Test ID Support

**All interactive elements must have `data-testid`:**

```tsx
// ✅ Correct
<Button data-testid="submit-booking-btn">Submit</Button>
<DataTable data-testid="bookings-table" ... />

// ❌ Wrong - missing testid
<Button>Submit</Button>
```

---

## Component Usage Patterns

### Page Layout

Every page should follow this structure:

```tsx
import { AppShell, PageHeader, ContentLayout, ContentSection } from '@xala/ds';

function MyPage() {
  const t = useT();
  
  return (
    <AppShell>
      <PageHeader 
        title={t('page.title')}
        subtitle={t('page.subtitle')}
        breadcrumbs={[
          { label: t('nav.home'), href: '/' },
          { label: t('nav.myPage'), href: '/my-page' }
        ]}
        actions={<Button>{t('action.create')}</Button>}
      />
      <ContentLayout>
        <ContentSection>
          {/* Page content */}
        </ContentSection>
      </ContentLayout>
    </AppShell>
  );
}
```

### Data Tables

All tabular data must use `DataTable`:

```tsx
import { DataTable, TableFilter, StatusTabs, EmptyState } from '@xala/ds';

function BookingsTable() {
  const t = useT();
  const [filters, setFilters] = useState({});
  const [sortColumn, setSortColumn] = useState<string>();
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  
  const columns: ColumnDef<Booking>[] = [
    {
      id: 'name',
      header: t('bookings.table.name'),
      accessorKey: 'name',
      sortable: true,
    },
    {
      id: 'status',
      header: t('bookings.table.status'),
      cell: (_, row) => <BookingStatusBadge status={row.status} />,
    },
    {
      id: 'actions',
      header: t('common.actions'),
      align: 'right',
      cell: (_, row) => (
        <Button variant="tertiary" onClick={() => handleView(row)}>
          {t('action.view')}
        </Button>
      ),
    },
  ];

  return (
    <>
      <StatusTabs 
        tabs={statusTabs} 
        activeTab={activeStatus}
        onTabChange={setActiveStatus}
        data-testid="status-tabs"
      />
      <TableFilter 
        filters={filterConfig}
        values={filters}
        onChange={setFilters}
        data-testid="table-filters"
      />
      <DataTable 
        data={bookings}
        columns={columns}
        getRowKey={(b) => b.id}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        onSort={(col, dir) => {
          setSortColumn(col);
          setSortDirection(dir);
        }}
        isLoading={isLoading}
        emptyMessage={
          <EmptyState 
            icon={<CalendarIcon />}
            title={t('bookings.empty.title')}
            description={t('bookings.empty.description')}
          />
        }
        data-testid="bookings-table"
      />
    </>
  );
}
```

### Forms

Use structured form patterns:

```tsx
import { 
  Dialog,
  Textfield,
  Select,
  Button,
  FormField 
} from '@xala/ds';

function CreateBookingForm({ onSubmit, onCancel }) {
  const t = useT();
  
  return (
    <Dialog open onClose={onCancel}>
      <Dialog.Content>
        <Dialog.Header>
          {t('bookings.create.title')}
        </Dialog.Header>
        
        <form onSubmit={handleSubmit}>
          <Stack spacing={4}>
            <Textfield
              label={t('bookings.form.name')}
              value={name}
              onChange={setName}
              error={errors.name}
              required
              data-testid="booking-name-input"
            />
            
            <Select
              label={t('bookings.form.rentalObject')}
              value={rentalObjectId}
              onChange={setRentalObjectId}
              data-testid="rental-object-select"
            >
              {rentalObjects.map(ro => (
                <Select.Option key={ro.id} value={ro.id}>
                  {ro.name}
                </Select.Option>
              ))}
            </Select>
            
            <div style={{ display: 'flex', gap: 'var(--ds-spacing-3)', justifyContent: 'flex-end' }}>
              <Button 
                type="button" 
                variant="secondary" 
                onClick={onCancel}
                data-testid="cancel-btn"
              >
                {t('action.cancel')}
              </Button>
              <Button 
                type="submit"
                data-testid="submit-btn"
              >
                {t('action.create')}
              </Button>
            </div>
          </Stack>
        </form>
      </Dialog.Content>
    </Dialog>
  );
}
```

### Empty States

Always use the EmptyState component:

```tsx
import { EmptyState, Button, CalendarIcon } from '@xala/ds';

// Basic empty state
<EmptyState
  icon={<CalendarIcon />}
  title={t('bookings.empty.title')}
  description={t('bookings.empty.description')}
  data-testid="empty-state"
/>

// With action
<EmptyState
  icon={<CalendarIcon />}
  title={t('bookings.empty.title')}
  description={t('bookings.empty.description')}
  action={
    <Button onClick={handleCreate} data-testid="create-first-btn">
      {t('bookings.empty.createFirst')}
    </Button>
  }
  data-testid="empty-state"
/>

// Search results empty
<EmptyState
  variant="search"
  title={t('search.noResults.title')}
  description={t('search.noResults.description')}
  action={
    <Button variant="secondary" onClick={clearFilters}>
      {t('action.clearFilters')}
    </Button>
  }
/>
```

### Loading States

Use appropriate loading components:

```tsx
import { Spinner, Skeleton, LoadingScreen } from '@xala/ds';

// Inline loading
<Button disabled>
  <Spinner aria-hidden="true" data-size="sm" />
  {t('action.saving')}
</Button>

// Content loading
<Skeleton width="100%" height={200} />

// Full page loading
<LoadingScreen message={t('state.loading')} />
```

### Confirmation Dialogs

Use ConfirmDialog for destructive actions:

```tsx
import { ConfirmDialog, useDialog } from '@xala/ds';

function DeleteBookingButton({ booking, onDelete }) {
  const t = useT();
  const { confirm } = useDialog();
  
  const handleDelete = async () => {
    const confirmed = await confirm({
      title: t('bookings.delete.title'),
      message: t('bookings.delete.message', { name: booking.name }),
      confirmLabel: t('action.delete'),
      cancelLabel: t('action.cancel'),
      variant: 'danger',
    });
    
    if (confirmed) {
      await onDelete(booking.id);
    }
  };
  
  return (
    <Button 
      variant="secondary" 
      data-color="danger" 
      onClick={handleDelete}
      data-testid="delete-booking-btn"
    >
      {t('action.delete')}
    </Button>
  );
}
```

### Status Badges

Use domain-specific status badges:

```tsx
import { 
  BookingStatusBadge,
  PaymentStatusBadge,
  RentalObjectStatusBadge 
} from '@xala/ds';

// Booking status
<BookingStatusBadge status={booking.status} />

// Payment status
<PaymentStatusBadge status={payment.status} />

// Rental object status
<RentalObjectStatusBadge status={rentalObject.status} />
```

---

## Design Tokens

Always use design tokens instead of hardcoded values:

```tsx
// ✅ Correct - using tokens
<div style={{ 
  padding: 'var(--ds-spacing-4)',
  backgroundColor: 'var(--ds-color-neutral-surface-default)',
  borderRadius: 'var(--ds-border-radius-md)',
}}>

// ❌ Wrong - hardcoded values
<div style={{ 
  padding: '16px',
  backgroundColor: '#f5f5f5',
  borderRadius: '8px',
}}>
```

### Common Tokens

| Category | Token Pattern | Example |
|----------|--------------|---------|
| Spacing | `--ds-spacing-{1-10}` | `var(--ds-spacing-4)` |
| Colors | `--ds-color-{variant}-{type}-{state}` | `var(--ds-color-accent-text-default)` |
| Font Sizes | `--ds-font-size-{size}` | `var(--ds-font-size-sm)` |
| Font Weights | `--ds-font-weight-{weight}` | `var(--ds-font-weight-medium)` |
| Border Radius | `--ds-border-radius-{size}` | `var(--ds-border-radius-md)` |

---

## Anti-Patterns to Avoid

### ❌ Creating App-Local Components

```tsx
// DON'T create app-local versions of DS components
// apps/backoffice/src/components/MyTable.tsx
export function MyTable() { /* ... */ }

// DO use the design system
import { DataTable } from '@xala/ds';
```

### ❌ Importing Directly from Digdir

```tsx
// DON'T import directly from Digdir
import { Button } from '@digdir/designsystemet-react';

// DO import from @xala/ds (it re-exports with theming)
import { Button } from '@xala/ds';
```

### ❌ Hardcoded Strings

```tsx
// DON'T use hardcoded strings
<Button>Create Booking</Button>

// DO use translation keys
<Button>{t('action.createBooking')}</Button>
```

### ❌ Inline Styles with Raw Values

```tsx
// DON'T use raw values
<div style={{ padding: '16px', color: '#333' }}>

// DO use design tokens
<div style={{ 
  padding: 'var(--ds-spacing-4)', 
  color: 'var(--ds-color-neutral-text-default)' 
}}>
```

### ❌ Custom Styling DS Components

```tsx
// DON'T override DS component styles heavily
<Button style={{ backgroundColor: 'purple', borderRadius: '50px' }}>

// DO use the component's built-in variants
<Button variant="primary" data-color="accent">
```

---

## Accessibility Requirements

All components must meet WCAG 2.1 AA:

1. **Interactive elements** - Must be keyboard accessible
2. **Color contrast** - Use DS color tokens (they're pre-tested)
3. **Focus indicators** - DS provides these, don't override
4. **Screen readers** - Use appropriate ARIA labels
5. **Motion** - Respect `prefers-reduced-motion`

```tsx
// ✅ Accessible button
<Button 
  onClick={handleClick}
  aria-label={t('action.close')}
  data-testid="close-btn"
>
  <CloseIcon aria-hidden="true" />
</Button>

// ✅ Accessible loading state
<Spinner aria-label={t('state.loading')} />

// Or when decorative
<Spinner aria-hidden="true" />
```

---

## Code Review Checklist

When reviewing PRs, check for:

- [ ] All UI components imported from `@xala/ds`
- [ ] No app-local duplicates of DS components
- [ ] All text uses i18n translation keys
- [ ] All interactive elements have `data-testid`
- [ ] Design tokens used instead of hardcoded values
- [ ] Tables use `DataTable` component
- [ ] Page headers use `PageHeader` component
- [ ] Empty states use `EmptyState` component
- [ ] Dialogs use DS dialog components
- [ ] Forms use DS form components
- [ ] Proper accessibility attributes
