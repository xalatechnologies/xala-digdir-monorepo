# DigiList Principles

> **LLM Training Document**
> **Purpose:** Non-negotiable design principles for AI agents
> **Last Updated:** 2026-01-20

---

## Core Philosophy

**AI is a CONTRIBUTOR, not an author.**

The AI must:
- Understand DigiList architecture before acting
- Never invent patterns
- Never bypass established packages
- Never add logic to apps
- Never add styling outside DS

**If uncertain → STOP and ASK.**

---

## Non-Negotiables

### 1. SDK-First Data Access

All data access MUST go through `@digilist/client-sdk`.

```tsx
// ✅ CORRECT
import { useBookings, useCreateBooking } from '@digilist/client-sdk';
const { data } = useBookings();
await createBooking.mutateAsync(formData);

// ❌ FORBIDDEN
const data = await fetch('/api/bookings');
const response = await axios.get('/api/users');
```

**Why:** SDK provides type safety, caching, error handling, and realtime integration.

---

### 2. DS-First UI

All UI MUST use `@xala/ds` components.

```tsx
// ✅ CORRECT
import { Button, Card, DataTable } from '@xala/ds';

// ❌ FORBIDDEN
import { Button } from '@digdir/designsystemet-react';
<button className="my-button">Click</button>
<div style={{ color: 'red' }}>Error</div>
```

**Why:** DS provides theming, accessibility, and Norwegian government compliance.

---

### 3. Runtime-First Providers

All apps MUST use `RuntimeProvider` from `@xala/runtime`.

```tsx
// ✅ CORRECT (main.tsx only)
import { RuntimeProvider } from '@xala/runtime';
<RuntimeProvider config={...}><App /></RuntimeProvider>

// ❌ FORBIDDEN
<QueryClientProvider>
  <ThemeProvider>
    <I18nProvider>
      ...
```

**Why:** Guarantees provider order, prevents t() errors, ensures consistency.

---

### 4. Contract-First API

All API contracts are defined in `@xala/contracts`.

```tsx
// ✅ CORRECT
import type { BookingDTO, CreateBookingInput } from '@xala/contracts';

// ❌ FORBIDDEN
interface Booking { ... } // Local type definition
type BookingData = { ... }; // Duplicated type
```

**Why:** Single source of truth, prevents drift between API and SDK.

---

### 5. i18n-First Strings

All user-visible strings MUST use `t()`.

```tsx
// ✅ CORRECT
import { useT } from '@xala/i18n';
const t = useT();
<Heading>{t('dashboard.title')}</Heading>

// ❌ FORBIDDEN
<Heading>Dashboard</Heading>
<Heading>Instrumentpanel</Heading>
```

**Why:** Supports Norwegian (nb) and English (en), enables translation management.

---

### 6. Server-Authoritative Rules

Business logic lives on the server, not the client.

```tsx
// ✅ CORRECT - Permissions from projection
{booking.permissions.canEdit && <EditButton />}
{booking.permissions.canCancel && <CancelButton />}

// ❌ FORBIDDEN - Client-side permission check
{user.role === 'admin' && <EditButton />}
{booking.status === 'pending' && user.id === booking.userId && ...}
```

**Why:** Security, consistency, single source of truth for business rules.

---

### 7. Zero Transformers

Components receive DTOs directly. No transformation in apps.

```tsx
// ✅ CORRECT - Use projection as-is
function BookingCard({ booking }: { booking: BookingCardProjection }) {
  return <Card>{booking.displayTitle}</Card>;
}

// ❌ FORBIDDEN - Client-side transformation
function BookingCard({ booking }: { booking: RawBooking }) {
  const displayTitle = `${booking.title} - ${booking.location}`;
  return <Card>{displayTitle}</Card>;
}
```

**Why:** Server computes display values, client just renders.

---

### 8. Thin Apps

Apps contain routes and wrappers only.

```
✅ App.tsx should contain:
- BrowserRouter
- Routes
- App-specific providers only (AccountContext)

❌ App.tsx should NOT contain:
- Core providers (Theme, i18n, Query)
- Business logic
- Data fetching setup
- Styling
```

**Why:** Centralized concerns in packages, apps are presentation-only.

---

## Design Philosophy

### Composition Over Configuration

Prefer composable units over configurable monoliths.

```tsx
// ✅ Composed
<ContentLayout>
  <PageHeader title={t('bookings.title')} />
  <ContentSection>
    <BookingsList />
  </ContentSection>
</ContentLayout>

// ❌ Configured
<PageTemplate
  title="Bookings"
  headerType="standard"
  sectionLayout="single"
  contentComponent={BookingsList}
/>
```

### Projection DTOs

Server computes what client displays.

```typescript
// API returns projection, not raw entity
BookingCardProjection {
  id: string;
  displayTitle: string;      // Computed
  displayDate: string;       // Formatted
  displayTime: string;       // Formatted
  statusLabel: string;       // Localized
  permissions: {
    canEdit: boolean;        // Computed from rules
    canCancel: boolean;
  };
}
```

### Audit Everything

All state changes are logged.

```typescript
// Every mutation creates audit entry
await bookingService.cancel(id, reason);
await audit.log({
  action: 'booking.cancelled',
  actorId: user.id,
  tenantId: user.tenantId,
  resourceId: id,
});
```

---

## Accessibility & Compliance

### WCAG 2.1 AA

All UI must meet WCAG 2.1 AA requirements:
- Color contrast ratios
- Keyboard navigation
- Screen reader support
- Focus indicators

### Norwegian Designsystemet

All government-facing UI follows Digdir standards:
- Token usage
- Component patterns
- Layout guidelines

---

## Change Management

### Audit Before Change

```
1. Run /audit on affected areas
2. Review violations
3. Plan corrections
4. Implement one step at a time
5. Verify after each step
```

### Non-Breaking Changes

Every change must:
- Not break existing functionality
- Include migration path if breaking
- Update documentation
- Pass all tests

### Rollback Expectation

Every change must be reversible:
- Git-based rollback
- Database migration rollback
- Feature flag disable
