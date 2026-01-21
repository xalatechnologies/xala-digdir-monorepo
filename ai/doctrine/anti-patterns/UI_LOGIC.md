# UI Logic Anti-Pattern

> **Keep Logic Out of UI**
> **Layer:** Anti-Patterns

---

## The Anti-Pattern

Business logic, calculations, or decisions embedded in UI components.

```tsx
// ❌ UI LOGIC ANTI-PATTERN
function BookingCard({ booking }) {
  // Business logic in component
  const canCancel = booking.status === 'confirmed' &&
    new Date(booking.startTime) > new Date(Date.now() + 24 * 60 * 60 * 1000) &&
    booking.paymentStatus === 'completed';

  const refundAmount = canCancel
    ? booking.totalPrice
    : booking.totalPrice * 0.5;

  const displayStatus = booking.status === 'pending'
    ? 'Awaiting confirmation'
    : booking.status === 'confirmed'
    ? 'Confirmed'
    : 'Cancelled';

  return (
    <Card>
      <Badge>{displayStatus}</Badge>
      <Button disabled={!canCancel}>Cancel Booking</Button>
      {canCancel && <Text>Refund: {refundAmount} kr</Text>}
    </Card>
  );
}
```

---

## Why It's Harmful

1. **Logic duplication** - Same rules in multiple components
2. **Testing difficulty** - Can't unit test logic separately
3. **Inconsistency** - Different components may implement rules differently
4. **Security risk** - Frontend can't be trusted for business rules
5. **Maintenance burden** - Changing rules requires finding all UI instances

---

## Types of UI Logic

### 1. Permission Checks

```tsx
// ❌ ANTI-PATTERN - Permission logic in UI
function ActionButtons({ user, booking }) {
  const canEdit = user.role === 'admin' ||
    (user.id === booking.createdBy && booking.status === 'draft');

  const canDelete = user.role === 'super_admin' ||
    (user.role === 'admin' && booking.organizationId === user.organizationId);

  return (
    <>
      {canEdit && <Button>Edit</Button>}
      {canDelete && <Button>Delete</Button>}
    </>
  );
}
```

**Correct:**

```tsx
// ✅ CORRECT - Permissions from API/DTO
function ActionButtons({ booking }) {
  // API returns what actions are allowed
  const { permissions } = booking;

  return (
    <>
      {permissions.canEdit && <Button>Edit</Button>}
      {permissions.canDelete && <Button>Delete</Button>}
    </>
  );
}
```

### 2. Price Calculations

```tsx
// ❌ ANTI-PATTERN - Price calculation in UI
function PriceSummary({ items, discount, taxRate }) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = discount ? subtotal * (discount / 100) : 0;
  const afterDiscount = subtotal - discountAmount;
  const tax = afterDiscount * taxRate;
  const total = afterDiscount + tax;

  return (
    <div>
      <Row label="Subtotal" value={subtotal} />
      <Row label="Discount" value={-discountAmount} />
      <Row label="Tax" value={tax} />
      <Row label="Total" value={total} />
    </div>
  );
}
```

**Correct:**

```tsx
// ✅ CORRECT - Price breakdown from API
function PriceSummary({ quote }) {
  // API calculates all prices server-side
  const { breakdown } = quote;

  return (
    <div>
      {breakdown.lineItems.map(item => (
        <Row key={item.id} label={item.label} value={item.amount} />
      ))}
      <Row label="Total" value={breakdown.total} bold />
    </div>
  );
}

// Usage
const { data: quote } = useBookingQuote(params);
<PriceSummary quote={quote} />
```

### 3. Status Derivation

```tsx
// ❌ ANTI-PATTERN - Status derivation in UI
function StatusBadge({ booking }) {
  let status, color;

  if (booking.cancelledAt) {
    status = 'Cancelled';
    color = 'red';
  } else if (booking.completedAt) {
    status = 'Completed';
    color = 'green';
  } else if (booking.confirmedAt) {
    status = 'Confirmed';
    color = 'blue';
  } else {
    status = 'Pending';
    color = 'yellow';
  }

  return <Badge color={color}>{status}</Badge>;
}
```

**Correct:**

```tsx
// ✅ CORRECT - Status from API with display hints
function StatusBadge({ booking }) {
  // API provides display-ready status
  const { displayStatus } = booking;

  return (
    <Badge color={displayStatus.color}>
      {displayStatus.label}
    </Badge>
  );
}
```

### 4. Date/Time Logic

```tsx
// ❌ ANTI-PATTERN - Date logic in UI
function BookingTime({ startTime, endTime }) {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const durationMs = end - start;
  const hours = Math.floor(durationMs / (1000 * 60 * 60));
  const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

  const isToday = start.toDateString() === new Date().toDateString();
  const isPast = end < new Date();

  return (
    <span className={isPast ? 'text-gray' : ''}>
      {isToday ? 'Today' : formatDate(start)}, {hours}h {minutes}m
    </span>
  );
}
```

**Correct:**

```tsx
// ✅ CORRECT - Formatted values from API
function BookingTime({ booking }) {
  // API provides formatted, locale-aware values
  const { formattedDate, formattedDuration, isPast } = booking.displayInfo;

  return (
    <span className={isPast ? 'text-gray' : ''}>
      {formattedDate}, {formattedDuration}
    </span>
  );
}
```

### 5. Validation Logic

```tsx
// ❌ ANTI-PATTERN - Validation in UI
function BookingForm({ onSubmit }) {
  const [errors, setErrors] = useState({});

  const validate = (data) => {
    const errors = {};
    if (data.duration < 1) errors.duration = 'Min 1 hour';
    if (data.duration > 8) errors.duration = 'Max 8 hours';
    if (!data.date) errors.date = 'Required';
    if (new Date(data.date) < new Date()) errors.date = 'Must be future';
    return errors;
  };

  const handleSubmit = (data) => {
    const errors = validate(data);
    if (Object.keys(errors).length > 0) {
      setErrors(errors);
      return;
    }
    onSubmit(data);
  };
}
```

**Correct:**

```tsx
// ✅ CORRECT - Validation through SDK/API
function BookingForm({ onSubmit }) {
  const { mutate, error } = useCreateBooking();

  const handleSubmit = async (data) => {
    try {
      await mutate(data);
    } catch (e) {
      // API returns structured validation errors
      if (isProblemDetails(e) && e.type === 'validation-error') {
        // e.errors = { duration: 'Min 1 hour', ... }
        setErrors(e.errors);
      }
    }
  };
}
```

---

## Where Logic Should Live

| Logic Type | Location | Why |
|------------|----------|-----|
| Permissions | API response `dto.permissions` | Security enforcement |
| Prices | API response `dto.pricing` | Business rules |
| Status | API response `dto.displayStatus` | State machine |
| Formatting | API or SDK formatters | Consistency |
| Validation | API validators | Single source of truth |
| Dates | API with locale | Server knows timezone |

---

## DTO Shape for Logic-Free UI

```typescript
// API returns display-ready DTO
interface BookingDetailDTO {
  id: string;
  // Raw data
  startTime: string;
  endTime: string;
  totalPrice: number;

  // Display info (computed by API)
  displayInfo: {
    formattedDate: string;        // "Today, January 21"
    formattedTime: string;        // "14:00 - 16:00"
    formattedDuration: string;    // "2 hours"
    formattedPrice: string;       // "450 kr"
    isPast: boolean;
    isUpcoming: boolean;
  };

  // Status (computed by API)
  displayStatus: {
    key: 'pending' | 'confirmed' | 'cancelled' | 'completed';
    label: string;                // Localized label
    color: 'blue' | 'green' | 'red' | 'gray';
    description?: string;
  };

  // Permissions (computed by API based on user)
  permissions: {
    canView: boolean;
    canEdit: boolean;
    canCancel: boolean;
    canDelete: boolean;
  };

  // Available actions (computed by API)
  availableActions: Array<{
    action: string;
    label: string;
    enabled: boolean;
    disabledReason?: string;
  }>;
}
```

---

## Verification

```bash
# Check for logic patterns in UI
grep -rE "(if.*role.*===|permission.*includes|\.reduce\(|Math\.|new Date\()" apps/*/src --include="*.tsx"

# Check for status derivation
grep -rE "(status.*===|\.status\))" apps/*/src/components --include="*.tsx"

# Check for price calculations
grep -rE "(\*.*price|\+.*total|reduce.*sum)" apps/*/src --include="*.tsx"
```
