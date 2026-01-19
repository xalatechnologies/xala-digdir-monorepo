# Design System Component Inventory

> Last Updated: 2026-01-19
> Package: `@xala/ds` (`packages/ds`)

This document provides a comprehensive inventory of all reusable UI components in the design system.

---

## Overview

The design system is organized into four layers:

| Layer | Purpose | Component Count |
|-------|---------|-----------------|
| **Primitives** | Low-level building blocks | ~14 |
| **Composed** | Mid-level components | ~38 |
| **Blocks** | Business-logic components | ~68+ |
| **Shells** | Application-level layouts | 4 |

Import from: `@xala/ds`

---

## Primitives

Low-level building blocks that form the foundation of the design system.

| Component | Import Path | Category | Props | Status | Notes |
|-----------|-------------|----------|-------|--------|-------|
| `Container` | `@xala/ds` | Layout | maxWidth, padding, centered | ✅ Ready | Responsive container |
| `Grid` | `@xala/ds` | Layout | columns, gap, areas | ✅ Ready | CSS Grid wrapper |
| `Stack` | `@xala/ds` | Layout | direction, spacing, align | ✅ Ready | Flexbox stack |
| `Card` | `@xala/ds` | Layout | header, footer, variant | ✅ Ready | Container card |
| `Badge` | `@xala/ds` | Data Display | color, size, variant | ✅ Ready | Status indicator |
| `Text` | `@xala/ds` | Data Display | size, weight, color, as | ✅ Ready | Typography primitive |
| `Icon` | `@xala/ds` | Data Display | name, size, color | ✅ Ready | Icon wrapper |
| `CodeBlock` | `@xala/ds` | Data Display | language, code, showLineNumbers | ✅ Ready | Syntax highlighting |
| `Progress` | `@xala/ds` | Feedback | value, max, variant | ✅ Ready | Progress indicator |
| `FormField` | `@xala/ds` | Forms | label, error, required | ✅ Ready | Form field wrapper |
| `NativeSelect` | `@xala/ds` | Forms | options, value, onChange | ✅ Ready | Native select dropdown |
| **60+ Icons** | `@xala/ds` | Icons | size, color, className | ✅ Ready | Full icon library |

---

## Composed Components

Mid-level components built from primitives.

### Layout & Page Structure

| Component | Import Path | Category | Props | Status | Notes |
|-----------|-------------|----------|-------|--------|-------|
| `ContentLayout` | `@xala/ds` | Layout | children, maxWidth | ✅ Ready | Main content wrapper |
| `ContentSection` | `@xala/ds` | Layout | title, subtitle, actions | ✅ Ready | Section container |
| `PageHeader` | `@xala/ds` | Layout | title, subtitle, breadcrumbs, actions | ✅ Ready | Page header with actions |
| `AppHeader` | `@xala/ds` | Navigation | logo, search, actions, user | ✅ Ready | Application header |
| `Breadcrumb` | `@xala/ds` | Navigation | items, separator | ✅ Ready | Breadcrumb navigation |

### Navigation

| Component | Import Path | Category | Props | Status | Notes |
|-----------|-------------|----------|-------|--------|-------|
| `Navigation` | `@xala/ds` | Navigation | items, activeItem | ✅ Ready | Main navigation |
| `NavigationLink` | `@xala/ds` | Navigation | to, icon, label | ✅ Ready | Nav link item |
| `MobileNav` | `@xala/ds` | Navigation | items, isOpen, onClose | ✅ Ready | Mobile navigation drawer |
| `BottomNavigation` | `@xala/ds` | Navigation | items, activeItem | ✅ Ready | Mobile bottom nav |
| `LanguageSwitcher` | `@xala/ds` | Navigation | locales, currentLocale | ✅ Ready | Language selector |

### Data Display & Tables

| Component | Import Path | Category | Props | Status | Notes |
|-----------|-------------|----------|-------|--------|-------|
| `DataTable` | `@xala/ds` | Table | data, columns, getRowKey, onSort | ✅ Ready | Generic sortable table |
| `TableFilter` | `@xala/ds` | Table | filters, values, onChange | ✅ Ready | Table filter bar |
| `FilterBar` | `@xala/ds` | Table | filters, onFilterChange | ✅ Ready | Advanced filter bar |
| `FilterChips` | `@xala/ds` | Table | chips, onRemove | ✅ Ready | Active filter display |
| `StatusTabs` | `@xala/ds` | Table | tabs, activeTab, onTabChange | ✅ Ready | Status filter tabs |
| `BulkActionsBar` | `@xala/ds` | Table | selectedCount, actions | ✅ Ready | Bulk action bar |
| `DataPageHeader` | `@xala/ds` | Table | title, count, actions | ✅ Ready | Data page header |
| `DataPageToolbar` | `@xala/ds` | Table | filters, viewMode, search | ✅ Ready | Data page toolbar |

### Forms & Wizards

| Component | Import Path | Category | Props | Status | Notes |
|-----------|-------------|----------|-------|--------|-------|
| `Wizard` | `@xala/ds` | Forms | steps, currentStep, onStepChange | ✅ Ready | Multi-step wizard |
| `WizardStepper` | `@xala/ds` | Forms | steps, activeStep | ✅ Ready | Step indicator |
| `WizardNavigation` | `@xala/ds` | Forms | onNext, onPrev, onCancel | ✅ Ready | Wizard navigation |
| `BookingStepper` | `@xala/ds` | Forms | steps, currentStep | ✅ Ready | Booking flow stepper |

### Overlays & Dialogs

| Component | Import Path | Category | Props | Status | Notes |
|-----------|-------------|----------|-------|--------|-------|
| `Drawer` | `@xala/ds` | Overlay | isOpen, onClose, position, size | ✅ Ready | Slide-out drawer |
| `DrawerSection` | `@xala/ds` | Overlay | title, children | ✅ Ready | Drawer section |
| `DrawerItem` | `@xala/ds` | Overlay | label, value, icon | ✅ Ready | Drawer list item |
| `DrawerEmptyState` | `@xala/ds` | Overlay | icon, title, description | ✅ Ready | Empty drawer state |
| `ConfirmDialog` | `@xala/ds` | Overlay | isOpen, title, onConfirm, onCancel | ✅ Ready | Confirmation modal |
| `AlertDialog` | `@xala/ds` | Overlay | isOpen, type, message | ✅ Ready | Alert modal |
| `DialogProvider` | `@xala/ds` | Overlay | children | ✅ Ready | Dialog context |
| `DemoLoginDialog` | `@xala/ds` | Overlay | isOpen, onClose, personas | ✅ Ready | Demo login selector |

### States & Feedback

| Component | Import Path | Category | Props | Status | Notes |
|-----------|-------------|----------|-------|--------|-------|
| `EmptyState` | `@xala/ds` | Feedback | icon, title, description, action | ✅ Ready | Empty state display |
| `GlobalSearch` | `@xala/ds` | Feedback | onSearch, results | ✅ Ready | Global search |
| `ProtectedRoute` | `@xala/ds` | Feedback | requiredPermissions, children | ✅ Ready | Route protection |

### Calendar

| Component | Import Path | Category | Props | Status | Notes |
|-----------|-------------|----------|-------|--------|-------|
| `RentalObjectCalendar` | `@xala/ds` | Calendar | slots, onSlotClick, config | ✅ Ready | Shared calendar |

---

## Blocks (Business Components)

Business-logic components for domain-specific functionality.

### Rental Object Display

| Component | Import Path | Category | Props | Status | Notes |
|-----------|-------------|----------|-------|--------|-------|
| `RentalObjectCard` | `@xala/ds` | Data Display | rentalObject, variant, onClick | ✅ Ready | Rental object card |
| `RentalObjectListItem` | `@xala/ds` | Data Display | rentalObject, onClick | ✅ Ready | List item view |
| `RentalObjectGrid` | `@xala/ds` | Data Display | items, columns | ✅ Ready | Grid layout |
| `RentalObjectTableView` | `@xala/ds` | Table | rentalObjects, onSort | ✅ Ready | Table view |
| `RentalObjectToolbar` | `@xala/ds` | Toolbar | viewMode, onViewChange | ✅ Ready | View toggle |
| `RentalObjectMap` | `@xala/ds` | Data Display | rentalObjects, center, zoom | ✅ Ready | Map view |
| `RentalObjectDetailHeader` | `@xala/ds` | Layout | rentalObject, actions | ✅ Ready | Detail page header |
| `RentalObjectTabs` | `@xala/ds` | Navigation | tabs, activeTab | ✅ Ready | Detail tabs |

### Rental Object Detail Components

| Component | Import Path | Category | Props | Status | Notes |
|-----------|-------------|----------|-------|--------|-------|
| `ImageGallery` | `@xala/ds` | Data Display | images, onImageClick | ✅ Ready | Image gallery |
| `ImageSlider` | `@xala/ds` | Data Display | images, autoPlay | ✅ Ready | Image carousel |
| `CapacityCard` | `@xala/ds` | Data Display | capacity, type | ✅ Ready | Capacity info |
| `FacilityChips` | `@xala/ds` | Data Display | facilities, variant | ✅ Ready | Facility badges |
| `AdditionalServicesList` | `@xala/ds` | Data Display | services, onServiceSelect | ✅ Ready | Add-on services |
| `ContactInfoCard` | `@xala/ds` | Data Display | contact, variant | ✅ Ready | Contact info |
| `LocationCard` | `@xala/ds` | Data Display | address, coordinates | ✅ Ready | Location display |
| `OpeningHoursCard` | `@xala/ds` | Data Display | hours, variant | ✅ Ready | Opening hours |
| `KeyFactsRow` | `@xala/ds` | Data Display | facts | ✅ Ready | Key facts display |
| `GuidelinesTab` | `@xala/ds` | Data Display | guidelines | ✅ Ready | Rules/guidelines |
| `FAQTab` | `@xala/ds` | Data Display | faqs | ✅ Ready | FAQ section |

### Calendar & Availability

| Component | Import Path | Category | Props | Status | Notes |
|-----------|-------------|----------|-------|--------|-------|
| `AvailabilityCalendar` | `@xala/ds` | Calendar | availability, onDateSelect | ✅ Ready | Availability view |
| `RentalObjectAvailabilityCalendar` | `@xala/ds` | Calendar | config, onSlotSelect | ✅ Ready | Full calendar |

### Booking Flow

| Component | Import Path | Category | Props | Status | Notes |
|-----------|-------------|----------|-------|--------|-------|
| `BookingFormModal` | `@xala/ds` | Forms | isOpen, rentalObject, onSubmit | ✅ Ready | Booking form |
| `BookingConfirmation` | `@xala/ds` | Feedback | booking, onConfirm | ✅ Ready | Booking confirm |
| `BookingSuccess` | `@xala/ds` | Feedback | booking, onClose | ✅ Ready | Success screen |
| `BookingSection` | `@xala/ds` | Layout | rentalObject, config | ✅ Ready | Booking section |
| `PriceSummaryCard` | `@xala/ds` | Data Display | lineItems, total | ✅ Ready | Price breakdown |

### Status Badges

| Component | Import Path | Category | Props | Status | Notes |
|-----------|-------------|----------|-------|--------|-------|
| `StatusTag` | `@xala/ds` | Data Display | status, color | ✅ Ready | Generic status |
| `BookingStatusBadge` | `@xala/ds` | Data Display | status | ✅ Ready | Booking status |
| `PaymentStatusBadge` | `@xala/ds` | Data Display | status | ✅ Ready | Payment status |
| `RentalObjectStatusBadge` | `@xala/ds` | Data Display | status | ✅ Ready | Rental status |
| `RequestStatusBadge` | `@xala/ds` | Data Display | status | ✅ Ready | Request status |
| `SeasonalLeaseStatusBadge` | `@xala/ds` | Data Display | status | ✅ Ready | Lease status |
| `OrganizationStatusBadge` | `@xala/ds` | Data Display | status | ✅ Ready | Org status |
| `UserStatusBadge` | `@xala/ds` | Data Display | status | ✅ Ready | User status |
| `GenericStatusBadge` | `@xala/ds` | Data Display | status, config | ✅ Ready | Custom status |

### Dashboard Components

| Component | Import Path | Category | Props | Status | Notes |
|-----------|-------------|----------|-------|--------|-------|
| `StatCard` | `@xala/ds` | Data Display | title, value, trend | ✅ Ready | Statistics card |
| `ActivityFeed` | `@xala/ds` | Data Display | activities, onLoadMore | ✅ Ready | Activity list |
| `ActivityItem` | `@xala/ds` | Data Display | activity, onClick | ✅ Ready | Activity entry |
| `QuickActionCard` | `@xala/ds` | Data Display | title, actions | ✅ Ready | Quick actions |
| `BarChart` | `@xala/ds` | Charts | data, labels | ✅ Ready | Bar chart |
| `VerticalBarChart` | `@xala/ds` | Charts | data, labels | ✅ Ready | Vertical bars |

### Auth & Access

| Component | Import Path | Category | Props | Status | Notes |
|-----------|-------------|----------|-------|--------|-------|
| `LoadingScreen` | `@xala/ds` | Feedback | message | ✅ Ready | Loading state |
| `AccessDeniedScreen` | `@xala/ds` | Feedback | message, onBack | ✅ Ready | 403 screen |
| `NotFoundScreen` | `@xala/ds` | Feedback | message, onBack | ✅ Ready | 404 screen |
| `ErrorScreen` | `@xala/ds` | Feedback | error, onRetry | ✅ Ready | Error display |
| `PermissionGate` | `@xala/ds` | Auth | permissions, children | ✅ Ready | Permission check |
| `RequireAuthModal` | `@xala/ds` | Auth | isOpen, onLogin | ✅ Ready | Auth required |
| `LoginLayout` | `@xala/ds` | Layout | children, bgImage | ✅ Ready | Login page |
| `LoginOption` | `@xala/ds` | Auth | provider, onClick | ✅ Ready | Login method |

### Messaging

| Component | Import Path | Category | Props | Status | Notes |
|-----------|-------------|----------|-------|--------|-------|
| `NotificationBell` | `@xala/ds` | Navigation | count, onClick | ✅ Ready | Notification icon |
| `ConversationList` | `@xala/ds` | Data Display | conversations, onClick | ✅ Ready | Message list |
| `ConversationListItem` | `@xala/ds` | Data Display | conversation, onClick | ✅ Ready | Conversation |
| `MessageBubble` | `@xala/ds` | Data Display | message, isOwn | ✅ Ready | Chat bubble |
| `ChatThread` | `@xala/ds` | Data Display | messages, onSend | ✅ Ready | Chat thread |

### GDPR

| Component | Import Path | Category | Props | Status | Notes |
|-----------|-------------|----------|-------|--------|-------|
| `ConsentPopup` | `@xala/ds` | Overlay | isOpen, onAccept | ✅ Ready | Cookie consent |
| `ConsentSettings` | `@xala/ds` | Forms | settings, onChange | ✅ Ready | Consent config |
| `DataSubjectRequestForm` | `@xala/ds` | Forms | onSubmit, requestTypes | ✅ Ready | GDPR requests |

### Admin Components

| Component | Import Path | Category | Props | Status | Notes |
|-----------|-------------|----------|-------|--------|-------|
| `ScopeSelector` | `@xala/ds` | Forms | scopes, selected, onChange | ✅ Ready | Scope selection |
| `PermissionMatrix` | `@xala/ds` | Data Display | permissions, roles | ✅ Ready | Permission grid |
| `EffectivePermissionsView` | `@xala/ds` | Data Display | permissions, user | ✅ Ready | Effective perms |
| `UserInviteForm` | `@xala/ds` | Forms | onSubmit, roles | ✅ Ready | User invitation |

### Error Handling

| Component | Import Path | Category | Props | Status | Notes |
|-----------|-------------|----------|-------|--------|-------|
| `ErrorBoundary` | `@xala/ds` | Feedback | fallback, onError | ✅ Ready | Error boundary |
| `GlobalErrorHandler` | `@xala/ds` | Feedback | errors, onDismiss | ✅ Ready | Global errors |

---

## Shells

Application-level layout components.

| Component | Import Path | Category | Props | Status | Notes |
|-----------|-------------|----------|-------|--------|-------|
| `AppShell` | `@xala/ds` | Layout | sidebar, header, children | ✅ Ready | Full app layout |
| `AppLayout` | `@xala/ds` | Layout | navigation, children | ✅ Ready | App wrapper |

---

## Re-exported from Digdir Designsystemet

The package also re-exports all components from `@digdir/designsystemet-react`:

- Button, Link
- Dialog, Modal, Popover
- Textfield, Textarea, Checkbox, Radio, Switch, Select, Combobox
- Heading, Paragraph, Label
- Alert, Spinner, Skeleton
- Tabs, Accordion
- Table (basic)
- Tooltip
- And more...

Import these directly from `@xala/ds` for consistent theming.

---

## Usage Examples

### Basic Page Layout

```tsx
import { 
  AppShell, 
  PageHeader, 
  ContentLayout, 
  ContentSection,
  DataTable,
  EmptyState
} from '@xala/ds';

function MyPage() {
  return (
    <AppShell>
      <PageHeader 
        title="Bookings"
        subtitle="Manage your bookings"
        actions={<Button>New Booking</Button>}
      />
      <ContentLayout>
        <ContentSection>
          {data.length > 0 ? (
            <DataTable 
              data={data} 
              columns={columns}
              getRowKey={(row) => row.id}
            />
          ) : (
            <EmptyState
              icon={<CalendarIcon />}
              title="No bookings yet"
              description="Create your first booking to get started"
              action={<Button>Create Booking</Button>}
            />
          )}
        </ContentSection>
      </ContentLayout>
    </AppShell>
  );
}
```

### Data Table with Filters

```tsx
import { 
  DataTable, 
  TableFilter, 
  DataPageHeader,
  StatusTabs 
} from '@xala/ds';

function BookingsPage() {
  const [filters, setFilters] = useState({});
  
  return (
    <>
      <DataPageHeader title="Bookings" count={bookings.length} />
      <StatusTabs 
        tabs={statusTabs} 
        activeTab={activeStatus}
        onTabChange={setActiveStatus}
      />
      <TableFilter 
        filters={filterConfig}
        values={filters}
        onChange={setFilters}
      />
      <DataTable 
        data={filteredBookings}
        columns={columns}
        getRowKey={(b) => b.id}
        onSort={handleSort}
        isLoading={isLoading}
        emptyMessage={<EmptyState title="No bookings found" />}
      />
    </>
  );
}
```
