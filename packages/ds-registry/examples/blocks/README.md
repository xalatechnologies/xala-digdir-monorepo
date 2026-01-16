# Blocks Component Examples

This directory contains practical examples demonstrating how to use blocks components from the Xala Design System.

## What are Blocks Components?

Blocks components are business-logic components that combine primitives and composed components into domain-specific UI patterns. They implement features specific to the Digilist/Xala platform, such as rental object cards, booking forms, and dashboard widgets.

**Key characteristics:**
- Built from primitive and composed components
- Implement domain-specific business logic
- Designed for platform features (rental objects, bookings, etc.)
- Follow design system tokens and guidelines
- Include platform-specific state and behavior
- Provide complete, ready-to-use UI blocks

## Available Blocks Components

The Xala Design System includes 43+ blocks components across various categories:

### Rental Object Display Components
NOTE: Components prefixed with "Listing" are legacy names - they display rental objects (spaces, resources, vehicles, events).

- **ListingCard** - Card component for displaying rental objects with images, ratings, pricing, and actions
- **ListingGrid** - Responsive grid layout for displaying rental object cards (3/2/1 column pattern)
- **ListingTableView** - Table-based view for rental objects with sortable columns
- **ListingDetailHeader** - Header component for rental object detail pages with breadcrumbs and actions
- **ListingListItem** - List item component for compact rental object displays

### Booking Components
- **BookingFormModal** - Modal component for booking forms with validation
- **BookingSection** - Section component for booking details
- **PriceSummaryCard** - Card displaying booking price breakdown
- **AvailabilityCalendar** - Calendar component showing availability status

### Dashboard Components
- **StatCard** - Card component for displaying statistics and KPIs
- **KPICard** - Key performance indicator display card
- **StatsGrid** - Grid layout for dashboard statistics
- **ActivityFeed** - Feed component for recent activity
- **QuickActions** - Quick action button group

### Interactive Components
- **ImageGallery** - Image gallery with lightbox and navigation
- **MediaViewer** - Media viewer for images and videos
- **DocumentViewer** - Document preview component
- **MapView** - Interactive map component for locations

### Status & Display Components
- **StatusBadge** - Badge component for status indicators
- **CapacityIndicator** - Visual indicator for capacity/occupancy
- **OpeningHoursCard** - Card displaying opening hours
- **ContactInfoCard** - Card for contact information display
- **FacilityChips** - Chips for displaying facility amenities

### Messaging & Notifications
- **NotificationBell** - Notification bell with badge counter
- **MessageThread** - Message thread component
- **InboxList** - List component for inbox messages
- **ConversationView** - Full conversation view component

### Error Handling
- **ErrorBoundary** - Error boundary component with fallback UI
- **ErrorMessage** - Formatted error message display
- **ValidationErrors** - Form validation error display

### Authentication
- **LoginForm** - Login form with validation
- **SignupForm** - User registration form
- **ForgotPasswordForm** - Password reset form

### Admin & Management
- **AdminListingCard** - Admin view of rental object cards with management actions
- **AdminToolbar** - Toolbar for admin actions
- **BulkActionsBar** - Bulk action controls for tables

## Usage Examples

Examples will be added in the following subtasks:

### 1. ListingCard (`listing-card.tsx`)
Demonstrates rental object card display with various props, variants, and interactions.
NOTE: "ListingCard" is a legacy component name - it displays rental objects.

### 2. BookingFormModal (`booking-form-modal.tsx`)
Shows booking form implementation for rental objects with validation, date selection, and submission.

## Best Practices

### 1. Import from @xala/ds
Always import blocks components through the design system facade:

```typescript
// ✅ CORRECT
import { ListingCard, BookingFormModal, StatCard } from '@xala/ds';

// ❌ WRONG - Never import directly from @digdir/*
import { ListingCard } from '@digdir/designsystemet-react';
```

### 2. Use with SDK Data Types
Blocks components are designed to work with SDK data types (rental objects):

```typescript
import { ListingCard } from '@xala/ds';
import { useRentalObjects } from '@digilist/client-sdk/hooks';

function RentalObjectsPage() {
  const { data: rentalObjects } = useRentalObjects();

  return (
    <div>
      {rentalObjects?.map((rentalObject) => (
        <ListingCard
          key={rentalObject.id}
          id={rentalObject.id}
          name={rentalObject.name}
          type={rentalObject.type}
          location={rentalObject.location}
          image={rentalObject.image}
          price={rentalObject.price}
        />
      ))}
    </div>
  );
}
```

### 3. Leverage Composition
Blocks components work best when composed with layout components:

```typescript
import { ContentLayout, ContentSection, ListingGrid, ListingCard } from '@xala/ds';

function BrowseRentalObjects() {
  return (
    <ContentLayout maxWidth="1440px">
      <ContentSection title="Available Rental Objects">
        <ListingGrid>
          <ListingCard {...rentalObject1} />
          <ListingCard {...rentalObject2} />
          <ListingCard {...rentalObject3} />
        </ListingGrid>
      </ContentSection>
    </ContentLayout>
  );
}
```

### 4. Handle State and Events
Blocks components often require event handlers:

```typescript
import { ListingCard } from '@xala/ds';

function RentalObjectsList() {
  const handleViewRentalObject = (id: string) => {
    navigate(`/rental-objects/${id}`);
  };

  const handleFavorite = (id: string) => {
    // Toggle favorite via SDK
    favoriteService.toggle(id);
  };

  return (
    <ListingCard
      {...rentalObject}
      onClick={handleViewRentalObject}
      onFavorite={handleFavorite}
    />
  );
}
```

### 5. Use SDK Services for Data
Never implement business logic in components - use SDK services:

```typescript
// ✅ CORRECT - Use SDK hooks and services
import { useBookings } from '@digilist/client-sdk/hooks';
import { BookingFormModal } from '@xala/ds';

function BookingFlow() {
  const { data, isLoading } = useBookings();
  const handleSubmit = (bookingData) => {
    // SDK handles API call
    bookingService.create(bookingData);
  };

  return <BookingFormModal onSubmit={handleSubmit} />;
}

// ❌ WRONG - Don't make direct API calls
function BookingFlow() {
  const handleSubmit = async (bookingData) => {
    const response = await fetch('/api/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData)
    });
  };
}
```

## Common Patterns

### Rental Object Grid with Filters

```typescript
import {
  ContentLayout,
  FilterBar,
  ListingGrid,
  ListingCard
} from '@xala/ds';
import { useRentalObjects } from '@digilist/client-sdk/hooks';

function RentalObjectsPage() {
  const [filters, setFilters] = useState({});
  const { data: rentalObjects } = useRentalObjects(filters);

  return (
    <ContentLayout maxWidth="1440px">
      <FilterBar filters={filters} onFilterChange={setFilters} />

      <ListingGrid>
        {rentalObjects?.map((rentalObject) => (
          <ListingCard key={rentalObject.id} {...rentalObject} />
        ))}
      </ListingGrid>
    </ContentLayout>
  );
}
```

### Dashboard with Stats

```typescript
import {
  ContentLayout,
  ContentSection,
  StatsGrid,
  StatCard
} from '@xala/ds';
import { useDashboard } from '@digilist/client-sdk/hooks';

function Dashboard() {
  const { data: stats } = useDashboard();

  return (
    <ContentLayout maxWidth="1440px">
      <ContentSection title="Overview">
        <StatsGrid>
          <StatCard
            label="Total Bookings"
            value={stats.totalBookings}
            trend="+12%"
          />
          <StatCard
            label="Active Listings"
            value={stats.activeListings}
          />
          <StatCard
            label="Revenue"
            value={stats.revenue}
            format="currency"
          />
        </StatsGrid>
      </ContentSection>
    </ContentLayout>
  );
}
```

### Booking Form with Validation

```typescript
import { BookingFormModal, NotificationBell } from '@xala/ds';
import { bookingService } from '@digilist/client-sdk';

function BookingPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleBookingSubmit = async (bookingData) => {
    try {
      await bookingService.create(bookingData);
      setIsModalOpen(false);
      // Show success notification
    } catch (error) {
      // Handle error via Problem Details (RFC 7807)
    }
  };

  return (
    <>
      <Button onClick={() => setIsModalOpen(true)}>
        Book Now
      </Button>

      <BookingFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleBookingSubmit}
      />
    </>
  );
}
```

## Accessibility Features

Blocks components include comprehensive accessibility features:

- **Semantic HTML**: Proper use of ARIA attributes and roles
- **Keyboard Navigation**: Full keyboard support for interactive elements
- **Screen Reader Support**: Descriptive labels and announcements
- **Focus Management**: Proper focus handling for modals and interactions
- **Form Validation**: Accessible error messages and validation
- **Status Announcements**: Live regions for dynamic content updates

## Testing Your Implementation

When using blocks components, verify:

1. **Data Integration**: Components properly receive and display SDK data
2. **Event Handling**: Click handlers and interactions work correctly
3. **State Management**: Component state updates correctly
4. **Error Handling**: Errors are handled gracefully with Problem Details
5. **Loading States**: Loading indicators display during async operations
6. **Accessibility**: Test with screen readers and keyboard navigation
7. **Responsive Design**: Components adapt to different screen sizes
8. **TypeScript**: No type errors when using component props

## Related Documentation

- [Design System Primitives](../README.md#primitives) - Base components
- [Composed Components](../composed/README.md) - Mid-level components
- [Shells Components](../shells/README.md) - Application-level layouts
- [Provider Usage](../provider-usage.tsx) - Theme and provider setup
- [Component Registry](../../registry.json) - Full component catalog
- [Client SDK Documentation](../../../client-sdk/README.md) - Data fetching and services

## Contributing Examples

When adding new blocks component examples:

1. Follow the existing file naming convention: `component-name.tsx`
2. Include JSDoc comments explaining the example's purpose
3. Demonstrate key props and common use cases
4. Show both basic and advanced usage patterns
5. Include SDK integration examples
6. Demonstrate proper error handling
7. Show loading and empty states
8. Include accessibility considerations
9. Add the example to `index.ts` and update this README

## Important Notes

### SDK-First Architecture

Blocks components are designed to work with the SDK-first architecture:

- **NEVER** make direct API calls (`fetch`, `axios`)
- **ALWAYS** use `@digilist/client-sdk` hooks and services
- Components should be presentational - business logic lives in the SDK
- Use typed DTOs from the SDK, not custom types

### RFC 7807 Error Handling

All errors must follow Problem Details format:

```typescript
interface ProblemDetails {
  type: string;     // URI identifying error type
  title: string;    // Human-readable summary
  status: number;   // HTTP status code
  detail?: string;  // Detailed explanation
}
```

### Audit-First Principle

- Any state mutation MUST be auditable
- Mutations are handled by SDK services, not components
- Components only trigger actions via callbacks

### Multi-Tenancy

- All data is scoped to the current tenant (kommune)
- SDK handles tenant context automatically
- Never bypass tenant isolation

## Common Pitfalls

1. **Bypassing the SDK** - Always use `@digilist/client-sdk`, never direct fetch()
2. **Business logic in components** - Keep components presentational
3. **Direct Designsystemet imports** - Always use `@xala/ds` facade
4. **Hardcoded values** - Use design tokens, no magic numbers/colors
5. **Missing error handling** - Always handle errors with Problem Details
6. **Ignoring loading states** - Show loading indicators for async operations
7. **Non-compliant forms** - Use proper validation and accessibility
8. **Skipping layout components** - Always compose with ContentLayout/ContentSection
