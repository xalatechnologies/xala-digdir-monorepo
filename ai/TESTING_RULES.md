# DigiList Testing Rules

> **LLM Training Document**
> **Purpose:** Testing requirements for AI agents
> **Last Updated:** 2026-01-20

---

## Testing Stack

| Type | Tool | Location |
|------|------|----------|
| Unit | Vitest | `*.test.ts` files |
| Component | Testing Library | `*.test.tsx` files |
| E2E | Playwright | `packages/testing-e2e/` |
| Visual | Storybook | `packages/ds/stories/` |

---

## Golden Journeys

### Required Coverage

These user journeys MUST have E2E tests:

| Journey | Description | Status |
|---------|-------------|--------|
| Booking Lifecycle | Create → Confirm → Complete | Required |
| User Auth | Login → Session → Logout | Required |
| Rental Object CRUD | Create → List → Edit → Delete | Required |
| Organization RBAC | Admin → Member permissions | Required |
| Payment Flow | Initiate → Callback → Confirmation | Required |
| Calendar View | Navigate → Filter → Select slot | Required |

### E2E Structure

```
packages/testing-e2e/
├── tests/
│   ├── booking-lifecycle.spec.ts
│   ├── auth-flows.spec.ts
│   ├── rental-objects.spec.ts
│   ├── organization-rbac.spec.ts
│   └── ...
├── fixtures/
│   └── test-data.ts
└── playwright.config.ts
```

---

## Test ID Requirements

### All Interactive Elements

```tsx
// ✅ REQUIRED
<Button data-testid="submit-booking">Submit</Button>
<Input data-testid="booking-title" />
<Select data-testid="rental-object-select" />
<Dialog data-testid="confirm-dialog" />

// ❌ MISSING TEST ID
<Button>Submit</Button>
<Input />
```

### Naming Convention

```
{component}-{action/purpose}

submit-booking
booking-title
rental-object-select
confirm-dialog
cancel-button
booking-list
booking-card-{id}
```

---

## Unit Test Patterns

### Component Test

```tsx
import { render, screen } from '@testing-library/react';
import { createTestWrapper } from '@xala/runtime';
import { BookingCard } from './BookingCard';

const wrapper = createTestWrapper({
  locale: 'nb',
  mockAuth: { user: mockUser },
});

describe('BookingCard', () => {
  it('displays booking title', () => {
    render(<BookingCard booking={mockBooking} />, { wrapper });
    expect(screen.getByText(mockBooking.displayTitle)).toBeInTheDocument();
  });

  it('shows edit button when user has permission', () => {
    render(
      <BookingCard booking={{ ...mockBooking, permissions: { canEdit: true } }} />,
      { wrapper }
    );
    expect(screen.getByTestId('edit-button')).toBeInTheDocument();
  });

  it('hides edit button when user lacks permission', () => {
    render(
      <BookingCard booking={{ ...mockBooking, permissions: { canEdit: false } }} />,
      { wrapper }
    );
    expect(screen.queryByTestId('edit-button')).not.toBeInTheDocument();
  });
});
```

### Hook Test

```tsx
import { renderHook, waitFor } from '@testing-library/react';
import { createTestWrapper } from '@xala/runtime';
import { useBookings } from '@digilist/client-sdk';

const wrapper = createTestWrapper();

describe('useBookings', () => {
  it('fetches bookings', async () => {
    const { result } = renderHook(() => useBookings(), { wrapper });
    
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    
    expect(result.current.data).toHaveLength(3);
  });
});
```

---

## E2E Test Patterns

### Page Object

```typescript
// pages/BookingsPage.ts
import { Page } from '@playwright/test';

export class BookingsPage {
  constructor(private page: Page) {}

  async navigate() {
    await this.page.goto('/bookings');
  }

  async createBooking(data: { title: string; date: string }) {
    await this.page.click('[data-testid="create-booking-button"]');
    await this.page.fill('[data-testid="booking-title"]', data.title);
    await this.page.fill('[data-testid="booking-date"]', data.date);
    await this.page.click('[data-testid="submit-booking"]');
  }

  async getBookingCards() {
    return this.page.locator('[data-testid^="booking-card-"]');
  }
}
```

### Spec File

```typescript
// tests/booking-lifecycle.spec.ts
import { test, expect } from '@playwright/test';
import { BookingsPage } from '../pages/BookingsPage';

test.describe('Booking Lifecycle', () => {
  test('user can create booking', async ({ page }) => {
    const bookingsPage = new BookingsPage(page);
    await bookingsPage.navigate();
    
    await bookingsPage.createBooking({
      title: 'Team Meeting',
      date: '2026-01-25',
    });
    
    // Verify booking appears
    const cards = await bookingsPage.getBookingCards();
    await expect(cards).toHaveCount(1);
    await expect(cards.first()).toContainText('Team Meeting');
  });

  test('user can confirm booking', async ({ page }) => {
    // ... test confirmation flow
  });

  test('user can cancel booking', async ({ page }) => {
    // ... test cancellation flow
  });
});
```

---

## Determinism Requirements

### No Flaky Tests

```typescript
// ❌ FLAKY - timing dependent
await page.waitForTimeout(1000);
expect(element).toBeVisible();

// ✅ DETERMINISTIC - wait for condition
await expect(element).toBeVisible({ timeout: 5000 });

// ❌ FLAKY - random IDs
const id = Math.random().toString();

// ✅ DETERMINISTIC - fixed test data
const id = 'test-booking-001';
```

### Isolated Tests

```typescript
// ❌ DEPENDENT - relies on previous test
test('edit existing booking', async () => {
  // Assumes booking exists from previous test
});

// ✅ ISOLATED - creates own data
test('edit existing booking', async () => {
  // Create booking first
  const booking = await createTestBooking();
  // Then test edit
  await editBooking(booking.id, { title: 'Updated' });
});
```

---

## Storybook Requirements

### All Blocks Have Stories

```bash
# Check coverage
find packages/ds/src/blocks -name "*.tsx" | wc -l
find packages/ds/stories/Blocks -name "*.stories.tsx" | wc -l
```

### Story Structure

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { BookingCard } from '../../src';

const meta: Meta<typeof BookingCard> = {
  title: 'Blocks/BookingCard',
  component: BookingCard,
  parameters: {
    docs: {
      description: {
        component: 'Displays a single booking card',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof BookingCard>;

export const Default: Story = {
  args: {
    booking: mockBooking,
  },
};

export const Pending: Story = {
  args: {
    booking: { ...mockBooking, status: 'pending' },
  },
};

export const Cancelled: Story = {
  args: {
    booking: { ...mockBooking, status: 'cancelled' },
  },
};
```

### Build Must Pass

```bash
pnpm --filter @xala/ds build-storybook
```

---

## Test Commands

```bash
# Unit tests
pnpm test

# Watch mode
pnpm test -- --watch

# Coverage
pnpm test -- --coverage

# E2E tests
pnpm test:e2e

# E2E specific test
pnpm test:e2e -- booking-lifecycle.spec.ts

# Storybook build
pnpm --filter @xala/ds build-storybook
```

---

## CI Requirements

All PRs must pass:

1. ✅ TypeScript compiles: `pnpm tsc --noEmit`
2. ✅ Lint passes: `pnpm lint`
3. ✅ Unit tests: `pnpm test`
4. ✅ E2E tests: `pnpm test:e2e`
5. ✅ Storybook builds: `pnpm --filter @xala/ds build-storybook`
6. ✅ All apps build: `(each app) npm run build`

---

## Test Data

### Fixtures

```typescript
// fixtures/bookings.ts
export const mockBooking: BookingCardProjection = {
  id: 'booking-001',
  displayTitle: 'Team Meeting',
  displayDate: '25. januar 2026',
  displayTime: '10:00 - 12:00',
  status: 'confirmed',
  permissions: {
    canEdit: true,
    canCancel: true,
  },
};

export const mockBookings = [
  mockBooking,
  { ...mockBooking, id: 'booking-002', displayTitle: 'Project Review' },
];
```

### Factory Functions

```typescript
// fixtures/factories.ts
export function createMockBooking(overrides?: Partial<BookingCardProjection>) {
  return {
    id: `booking-${Date.now()}`,
    displayTitle: 'Test Booking',
    displayDate: '25. januar 2026',
    displayTime: '10:00 - 12:00',
    status: 'pending',
    permissions: { canEdit: true, canCancel: true },
    ...overrides,
  };
}
```
