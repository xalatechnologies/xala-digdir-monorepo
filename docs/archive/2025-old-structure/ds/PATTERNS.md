# Patterns

This document describes how Designsystemet patterns are implemented in our DS blocks.

## Reference

See [Designsystemet Patterns](https://designsystemet.no/en/patterns/) for official guidance.

## Implemented Patterns

### Data Display

#### Tables

Use `DataTable` for data collections:

```tsx
import { DataTable } from '@xala/ds';

<DataTable
  columns={columns}
  data={users}
  selectable
  pagination={{ pageSize: 10 }}
/>
```

**Pattern reference**: Lists and tables

#### Cards

Use `RentalObjectCard` or generic `Card` for items:

```tsx
import { RentalObjectCard, Card } from '@xala/ds';

// Business card
<RentalObjectCard listing={listing} />

// Generic card
<Card>
  <Card.Header>Title</Card.Header>
  <Card.Content>Content</Card.Content>
</Card>
```

### Navigation

#### Breadcrumbs

Use `Breadcrumb` for hierarchical navigation:

```tsx
import { Breadcrumb } from '@xala/ds';

<Breadcrumb items={[
  { label: 'Home', href: '/' },
  { label: 'Users', href: '/users' },
  { label: 'John Doe' },
]} />
```

#### Tabs

Use `StatusTabs` or native Tabs:

```tsx
import { StatusTabs } from '@xala/ds';

<StatusTabs
  tabs={[
    { id: 'all', label: 'All', count: 42 },
    { id: 'active', label: 'Active', count: 30 },
  ]}
  activeTab={activeTab}
  onTabChange={setActiveTab}
/>
```

### Forms

#### Form Layout

Use `FormField` wrapper:

```tsx
import { FormField } from '@xala/ds';

<FormField label="Email" error={errors.email} required>
  <Input type="email" {...register('email')} />
</FormField>
```

#### Multi-Step Forms

Use `Wizard`:

```tsx
import { Wizard } from '@xala/ds';

<Wizard
  steps={[
    { id: 'info', title: 'Information' },
    { id: 'review', title: 'Review' },
  ]}
  currentStep={step}
  onStepChange={setStep}
/>
```

### Feedback

#### Loading States

Use Skeleton components:

```tsx
import { Skeleton } from '@xala/ds';

{isLoading ? (
  <Skeleton height="200px" />
) : (
  <Content />
)}
```

#### Empty States

Use `EmptyState`:

```tsx
import { EmptyState } from '@xala/ds';

<EmptyState
  variant="no-results"
  title="No results found"
  description="Try adjusting your filters"
  action={<Button>Clear Filters</Button>}
/>
```

#### Errors

Use `ErrorScreen` or inline errors:

```tsx
import { ErrorScreen, FormField } from '@xala/ds';

// Full page error
<ErrorScreen error={error} onRetry={retry} />

// Form field error
<FormField error="Invalid email format">
  <Input />
</FormField>
```

### Dialogs

#### Confirmation

Use `ConfirmDialog`:

```tsx
import { useDialog, ConfirmDialog } from '@xala/ds';

const { confirm } = useDialog();

const handleDelete = async () => {
  const confirmed = await confirm({
    title: 'Delete Item?',
    description: 'This cannot be undone.',
    confirmLabel: 'Delete',
    variant: 'danger',
  });
  
  if (confirmed) {
    await deleteItem();
  }
};
```

### Search and Filter

#### List Toolbar

Use `ListToolbar`:

```tsx
import { ListToolbar } from '@xala/ds';

<ListToolbar
  search={{ value, onChange: setValue }}
  filters={filters}
  onFilterChange={setFilters}
  viewModes={['grid', 'list']}
  currentViewMode={viewMode}
  onViewModeChange={setViewMode}
/>
```

### Status Display

#### Badges

Use semantic status badges:

```tsx
import { BookingStatusBadge, PaymentStatusBadge } from '@xala/ds';

<BookingStatusBadge status="confirmed" />
<PaymentStatusBadge status="paid" />
```

## Pattern Principles

### Consistency

All blocks implementing the same pattern should behave identically.

### Composability

Patterns can be combined:

```tsx
<PageHeader title="Users" />
<ListToolbar search={search} filters={filters} />
<DataTable columns={columns} data={users} />
```

### Thin Apps

Apps consume patterns through blocks, not raw primitives:

```tsx
// App code - thin wrapper
function UsersPage() {
  const { data } = useUsers();
  return (
    <AppShell>
      <PageHeader title="Users" />
      <DataTable columns={userColumns} data={data} />
    </AppShell>
  );
}
```

## Adding New Patterns

1. Review Designsystemet pattern guidance
2. Design as DS block
3. Implement with token-only styling
4. Document in Storybook
5. Add to this document
