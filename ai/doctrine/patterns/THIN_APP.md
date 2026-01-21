# Thin App Pattern

> **How to Structure Applications**
> **Layer:** Patterns

---

## Principle

**Apps are thin orchestration layers. They compose packages, never contain logic.**

```
┌─────────────────────────────────────────────────────────────────────┐
│                           APP (Thin Shell)                           │
│                                                                       │
│   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐               │
│   │   Routes    │   │  Layouts    │   │   Pages     │               │
│   │  (paths)    │   │  (shells)   │   │(composition)│               │
│   └──────┬──────┘   └──────┬──────┘   └──────┬──────┘               │
│          │                 │                 │                       │
│          └─────────────────┼─────────────────┘                       │
│                            │                                         │
│                      ORCHESTRATION ONLY                              │
│                            │                                         │
│         ┌──────────────────┼──────────────────┐                     │
│         │                  │                  │                     │
│         ▼                  ▼                  ▼                     │
│   ┌───────────┐      ┌───────────┐      ┌───────────┐              │
│   │   SDK     │      │  UI Pkg   │      │  Runtime  │              │
│   │ (data)    │      │ (display) │      │(providers)│              │
│   └───────────┘      └───────────┘      └───────────┘              │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Allowed in Apps

### 1. Route Definitions

```tsx
// ✅ ALLOWED - Route configuration
// apps/web/src/routes/index.tsx
export const routes = [
  { path: '/', element: <HomePage /> },
  { path: '/rental-objects', element: <RentalObjectsPage /> },
  { path: '/rental-objects/:id', element: <RentalObjectDetailPage /> },
  { path: '/bookings', element: <BookingsPage /> },
];
```

### 2. Layout Composition

```tsx
// ✅ ALLOWED - Layout using shells
// apps/web/src/layouts/MainLayout.tsx
import { AppShell, Header, Sidebar } from '@xalatechnologies/platform/ui';
import { useAuth } from '@xalatechnologies/platform/runtime';

export function MainLayout({ children }) {
  const { user } = useAuth();

  return (
    <AppShell>
      <Header user={user} />
      <Sidebar />
      <main>{children}</main>
    </AppShell>
  );
}
```

### 3. Page Composition

```tsx
// ✅ ALLOWED - Page composing SDK + UI
// apps/web/src/pages/RentalObjectsPage.tsx
import { useRentalObjects } from '@digilist/sdk/hooks';
import { RentalObjectGrid } from '@digilist/ui/features/rental-objects';
import { FilterBar, Pagination } from '@xalatechnologies/platform/ui';
import { useT } from '@xalatechnologies/platform/i18n';

export function RentalObjectsPage() {
  const t = useT();
  const { data, isLoading, error } = useRentalObjects();
  const [filters, setFilters] = useState({});

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;

  return (
    <PageLayout title={t('rentalObjects.title')}>
      <FilterBar filters={filters} onChange={setFilters} />
      <RentalObjectGrid items={data} t={t} />
      <Pagination />
    </PageLayout>
  );
}
```

### 4. Provider Setup (main.tsx only)

```tsx
// ✅ ALLOWED - Provider composition in entry
// apps/web/src/main.tsx
import { RuntimeProvider } from '@xalatechnologies/platform/runtime';
import { DigilistProvider } from '@digilist/runtime';

createRoot(document.getElementById('root')!).render(
  <RuntimeProvider config={platformConfig}>
    <DigilistProvider>
      <App />
    </DigilistProvider>
  </RuntimeProvider>
);
```

---

## Forbidden in Apps

### 1. Business Logic

```tsx
// ❌ FORBIDDEN - Business logic in app
function BookingPage() {
  // This logic belongs in API/SDK
  const canBook = user.role === 'admin' ||
    (user.permissions.includes('booking.create') &&
     !isWeekend(selectedDate));

  const price = calculatePrice(basePrice, duration, discounts, taxes);

  // ...
}
```

### 2. Data Transformation

```tsx
// ❌ FORBIDDEN - Transforming data in app
function RentalObjectsPage() {
  const { data } = useRentalObjects();

  // This transformation belongs in SDK
  const enhancedData = data.map(item => ({
    ...item,
    displayName: `${item.name} (${item.category})`,
    formattedPrice: formatCurrency(item.price),
    isNew: isWithinDays(item.createdAt, 30),
  }));
}
```

### 3. Type Definitions

```tsx
// ❌ FORBIDDEN - Local types in app
// apps/web/src/types/booking.ts
interface Booking {
  id: string;
  date: Date;
  // ...
}

// ✅ CORRECT - Import from contracts
import { BookingDTO } from '@digilist/domain';
```

### 4. Custom Hooks with Logic

```tsx
// ❌ FORBIDDEN - Custom hook with business logic in app
// apps/web/src/hooks/useBookingPrice.ts
function useBookingPrice(booking) {
  return useMemo(() => {
    let price = booking.basePrice;
    if (booking.duration > 4) price *= 0.9;
    if (isWeekend(booking.date)) price *= 1.2;
    return price;
  }, [booking]);
}

// ✅ CORRECT - Price comes from SDK/API
const { data } = useBookingQuote(bookingParams);
// data.calculatedPrice, data.breakdown, etc.
```

### 5. API Calls

```tsx
// ❌ FORBIDDEN - Direct API calls
function createBooking(data) {
  return fetch('/api/bookings', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ✅ CORRECT - Use SDK
import { bookingService } from '@digilist/sdk';
bookingService.create(data);
```

### 6. Custom Components

```tsx
// ❌ FORBIDDEN - Custom UI components in app
// apps/web/src/components/PriceTag.tsx
function PriceTag({ amount, currency }) {
  return (
    <span className="price-tag">
      {formatCurrency(amount, currency)}
    </span>
  );
}

// ✅ CORRECT - Use from UI package
import { PriceBadge } from '@xalatechnologies/platform/ui';
```

---

## App Directory Structure

```
apps/web/
├── src/
│   ├── main.tsx          # Entry point, providers
│   ├── App.tsx           # Router setup
│   ├── routes/           # Route definitions
│   │   └── index.tsx
│   ├── layouts/          # Layout compositions
│   │   └── MainLayout.tsx
│   ├── pages/            # Page compositions
│   │   ├── HomePage.tsx
│   │   └── BookingsPage.tsx
│   └── config/           # App-specific config
│       └── routes.ts
├── public/               # Static assets
├── index.html
└── vite.config.ts
```

**What's NOT here:**
- No `src/components/` (use packages)
- No `src/hooks/` (use SDK)
- No `src/types/` (use contracts)
- No `src/utils/` (use SDK)
- No `src/services/` (use SDK)

---

## Verification

```bash
# Check for forbidden directories
ls apps/web/src/ | grep -E "^(hooks|types|utils|services|components)$"

# Check for local type definitions
grep -r "^interface\|^type " apps/*/src --include="*.ts" --include="*.tsx"

# Check for business logic patterns
grep -rE "(if.*permission|role.*===|calculate|compute)" apps/*/src --include="*.tsx"
```

---

## Exception: Truly App-Specific UI

If something is genuinely app-specific (appears in ONLY this app):

1. First, consider if it should be in a package
2. If truly app-specific, create in `apps/*/src/app-specific/`
3. Add comment explaining why it's app-specific
4. Review in PR to validate it can't be generalized

```tsx
// apps/saas-admin/src/app-specific/TenantOverviewHeader.tsx
/**
 * @app-specific
 * @reason This header is unique to SaaS admin and shows
 * cross-tenant aggregations that no other app needs.
 */
export function TenantOverviewHeader() {
  // ...
}
```
