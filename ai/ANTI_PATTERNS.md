# DigiList Anti-Patterns

> **LLM Training Document**
> **Purpose:** What NEVER to do - examples of forbidden patterns
> **Last Updated:** 2026-01-20

---

## Critical Anti-Patterns

These patterns are STRICTLY FORBIDDEN. If you see yourself writing this code, STOP immediately.

---

## 1. Direct API Calls

### ❌ FORBIDDEN
```tsx
// Direct fetch
const response = await fetch('/api/bookings');
const data = await response.json();

// Axios
const { data } = await axios.get('/api/users');
const result = await axios.post('/api/bookings', formData);

// Native HTTP
const xhr = new XMLHttpRequest();
xhr.open('GET', '/api/listings');
```

### ✅ CORRECT
```tsx
import { useBookings, useCreateBooking } from '@digilist/client-sdk';

// Read
const { data: bookings, isLoading, error } = useBookings();

// Write
const createBooking = useCreateBooking();
await createBooking.mutateAsync(formData);
```

### Why Forbidden
- No type safety
- No caching
- No error handling
- No realtime integration
- Bypasses SDK invariants

---

## 2. Direct Digdir Imports

### ❌ FORBIDDEN
```tsx
import { Button } from '@digdir/designsystemet-react';
import { CheckIcon } from '@digdir/designsystemet-icons';
import '@digdir/designsystemet-css';
```

### ✅ CORRECT
```tsx
import { Button, CheckIcon } from '@xala/ds';
import '@xala/ds/styles';
```

### Why Forbidden
- Bypasses theme integration
- Loses custom extensions
- Breaks consistency
- No controlled updates

---

## 3. Manual Provider Composition

### ❌ FORBIDDEN
```tsx
// In App.tsx or main.tsx
<QueryClientProvider client={queryClient}>
  <ThemeProvider>
    <I18nProvider>
      <DesignsystemetProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </DesignsystemetProvider>
    </I18nProvider>
  </ThemeProvider>
</QueryClientProvider>
```

### ✅ CORRECT
```tsx
// In main.tsx ONLY
import { RuntimeProvider } from '@xala/runtime';

<RuntimeProvider config={{
  appType: 'web',
  locale: 'nb',
  theme: 'digilist',
}}>
  <App />
</RuntimeProvider>

// App.tsx - routes only
<BrowserRouter>
  <Routes>
    <Route path="/" element={<DashboardPage />} />
  </Routes>
</BrowserRouter>
```

### Why Forbidden
- Wrong provider order causes bugs
- t() errors when I18nProvider not first
- Duplicated setup across apps
- Hard to maintain

---

## 4. Hardcoded Strings

### ❌ FORBIDDEN
```tsx
<Heading>Welcome</Heading>
<Button>Submit</Button>
<Alert>An error occurred</Alert>
<p>Ingen resultater funnet</p>
```

### ✅ CORRECT
```tsx
import { useT } from '@xala/i18n';

const t = useT();

<Heading>{t('dashboard.welcome')}</Heading>
<Button>{t('common.submit')}</Button>
<Alert>{t('errors.generic')}</Alert>
<p>{t('search.noResults')}</p>
```

### Why Forbidden
- Can't translate
- Inconsistent terminology
- No centralized management
- Breaks i18n compliance

---

## 5. Client-Side Permission Checks

### ❌ FORBIDDEN
```tsx
// Role-based in component
{user.role === 'admin' && <DeleteButton />}
{user.role === 'case_handler' && <ApproveButton />}

// Status-based in component
{booking.status === 'pending' && user.id === booking.userId && <CancelButton />}

// Computed permissions
const canEdit = user.role === 'admin' || user.id === booking.createdBy;
```

### ✅ CORRECT
```tsx
// Permissions from server projection
{booking.permissions.canDelete && <DeleteButton />}
{booking.permissions.canApprove && <ApproveButton />}
{booking.permissions.canCancel && <CancelButton />}
{booking.permissions.canEdit && <EditButton />}
```

### Why Forbidden
- Security: client can be manipulated
- Business rules duplicated
- Rules can drift
- Server is authoritative

---

## 6. Client-Side Data Transformation

### ❌ FORBIDDEN
```tsx
// Mapping/transforming
const displayBookings = bookings.map(b => ({
  ...b,
  displayDate: formatDate(b.startDate),
  displayTitle: `${b.title} - ${b.location}`,
}));

// Computed values
const totalPrice = booking.basePrice + booking.addons.reduce((sum, a) => sum + a.price, 0);

// Select transformers
const { data } = useQuery({
  queryKey: ['bookings'],
  select: (data) => data.map(transformBooking),
});
```

### ✅ CORRECT
```tsx
// Use projections directly
function BookingCard({ booking }: { booking: BookingCardProjection }) {
  return (
    <Card>
      <h3>{booking.displayTitle}</h3>
      <span>{booking.displayDate}</span>
      <span>{booking.displayPrice}</span>
    </Card>
  );
}
```

### Why Forbidden
- Server should compute display values
- Duplicated logic
- Type drift
- Localization issues

---

## 7. Inline Styles with Raw Values

### ❌ FORBIDDEN
```tsx
<div style={{ marginTop: '20px', color: '#333' }}>
<span style={{ fontSize: '14px', fontWeight: 'bold' }}>
<Box sx={{ padding: 16, backgroundColor: 'white' }}>
```

### ✅ CORRECT
```tsx
// Use DS components with tokens
<Stack gap="4">
  <Heading size="md">Title</Heading>
  <Paragraph>Content</Paragraph>
</Stack>

// If custom styling needed, use CSS vars
.custom-element {
  margin-top: var(--ds-spacing-4);
  color: var(--ds-color-neutral-text-default);
}
```

### Why Forbidden
- No theming support
- No dark mode
- Inconsistent values
- Accessibility issues

---

## 8. Business Logic in Components

### ❌ FORBIDDEN
```tsx
function BookingPage() {
  // 50 lines of business logic...
  const isWeekend = date.getDay() === 0 || date.getDay() === 6;
  const priceMultiplier = isWeekend ? 1.5 : 1;
  const discount = user.isMember ? 0.1 : 0;
  const finalPrice = basePrice * priceMultiplier * (1 - discount);
  
  // Validation logic
  if (startTime < 8 || endTime > 22) {
    return <Error>Invalid time</Error>;
  }
  
  // Approval logic
  const needsApproval = 
    duration > 4 ||
    isRecurring ||
    user.bookingsThisMonth > 5;
}
```

### ✅ CORRECT
```tsx
function BookingPage() {
  const { data: booking } = useBookingPreview(formData);
  
  // Server computed everything
  return (
    <BookingConfirmation
      price={booking.computedPrice}
      needsApproval={booking.requiresApproval}
      validationErrors={booking.errors}
    />
  );
}
```

### Why Forbidden
- Rules duplicated client/server
- Can drift
- Hard to test
- Security risk

---

## 9. Raw HTML Elements in Pages

### ❌ FORBIDDEN
```tsx
function DashboardPage() {
  return (
    <div className="dashboard">
      <div className="header">
        <h1>Dashboard</h1>
      </div>
      <div className="content">
        <div className="card">
          <p>Some content</p>
        </div>
      </div>
    </div>
  );
}
```

### ✅ CORRECT
```tsx
function DashboardPage() {
  const t = useT();
  
  return (
    <ContentLayout title={t('dashboard.title')}>
      <ContentSection>
        <Card>
          <Paragraph>{t('dashboard.welcome')}</Paragraph>
        </Card>
      </ContentSection>
    </ContentLayout>
  );
}
```

### Why Forbidden
- No accessibility
- No theming
- Inconsistent styling
- No responsive behavior

---

## 10. Cross-Layer Imports

### ❌ FORBIDDEN
```tsx
// App importing from API
import { BookingService } from '../../../apps/api/src/services/booking';

// Package importing from app
import { Header } from '../../../apps/web/src/components/Header';

// SDK importing app code
import { useCustomHook } from '../../../apps/backoffice/src/hooks';
```

### ✅ CORRECT
```tsx
// Apps import from packages
import { useBookings } from '@digilist/client-sdk';
import { Header } from '@xala/ds';

// Packages import from other packages (with correct dependency)
import type { BookingDTO } from '@xala/contracts';
```

### Why Forbidden
- Creates circular dependencies
- Breaks package boundaries
- Prevents tree-shaking
- Violates architecture

---

## Detection Commands

Use these to find violations:

```bash
# Direct fetch calls
grep -rE "fetch\(" apps/*/src --include="*.tsx"

# Direct @digdir imports
grep -r "@digdir/designsystemet" apps/*/src --include="*.tsx"

# Hardcoded strings (potential)
grep -rE "['\"][A-Z][a-zæøå]+" apps/*/src/routes --include="*.tsx" | grep -v "t\('"

# Inline styles
grep -c "style={{" apps/*/src/**/*.tsx

# Provider imports in routes
grep -r "import.*Provider" apps/*/src/routes --include="*.tsx"
```
