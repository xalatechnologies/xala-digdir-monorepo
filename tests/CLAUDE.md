# CLAUDE.md - Tests Directory

This file provides guidance to Claude Code (claude.ai/code) when working with tests in this repository.

---

## Overview

This directory contains the complete test suite for the Xala Diglist Platform. All tests - unit, E2E, integration, performance, and security - are organized here.

---

## Directory Structure

```
tests/
├── unit/              # Vitest unit tests
│   ├── sdk/          # SDK service tests
│   ├── components/   # React component tests
│   ├── hooks/        # React hooks tests
│   └── utils/        # Utility function tests
│
├── e2e/              # Playwright E2E tests
│   ├── auth/        # Authentication flows
│   ├── booking/     # Booking journeys
│   ├── rental-objects/ # Rental object management
│   └── *.spec.ts    # E2E test files
│
├── integration/      # Integration tests
│   ├── api/         # API integration
│   └── services/    # Service integration
│
├── performance/      # Performance tests
├── security/        # Security/penetration tests
├── journeys/        # User journey tests
├── scenarios/       # Test scenarios
│
├── fixtures/        # Test data & fixtures
├── helpers/         # Shared test utilities
│
├── reports/         # Test output (gitignored)
│   ├── unit/       # Vitest HTML reports
│   ├── e2e/        # Playwright HTML reports
│   ├── coverage/   # Coverage reports
│   └── compliance/ # Design system scans
│
├── screenshots/     # E2E failure screenshots (gitignored)
└── artifacts/       # Other test artifacts (gitignored)
```

---

## Critical Rules

### ⚠️ ABSOLUTE REQUIREMENTS

1. **ALL tests MUST be in this `tests/` directory**
   - Never create test folders at repository root
   - Never create `e2e/`, `test-results/`, `playwright-report/` at root
   - All test output goes to `tests/reports/`, `tests/screenshots/`, `tests/artifacts/`

2. **Test file naming**
   - Unit tests: `*.test.ts`, `*.spec.ts`, `*.test.tsx`, `*.spec.tsx`
   - E2E tests: `*.spec.ts` (must be in `tests/e2e/`)
   - Integration tests: `*.test.ts` (must be in `tests/integration/`)

3. **Configuration files are at repository root**
   - `vitest.config.ts` - Vitest configuration
   - `playwright.config.ts` - Playwright configuration
   - All configs reference `./tests/e2e` for E2E tests

---

## Test Types & Commands

### Unit Tests (Vitest)

**Purpose:** Test individual functions, components, hooks in isolation

**Location:** `tests/unit/` or co-located with source code

**Commands:**
```bash
pnpm test              # Run all unit tests (watch mode)
pnpm test:run          # Run once
pnpm test:ui           # With Vitest UI
pnpm test:coverage     # With coverage report → tests/reports/coverage/
```

**Example:**
```typescript
// tests/unit/components/ListingCard.test.tsx
import { render, screen } from '@testing-library/react';
import { ListingCard } from '@xala/ds';

describe('ListingCard', () => {
  it('should render listing title', () => {
    const listing = { id: '1', title: 'Test Listing' };
    render(<ListingCard listing={listing} />);
    expect(screen.getByText('Test Listing')).toBeInTheDocument();
  });
});
```

### E2E Tests (Playwright)

**Purpose:** Test complete user flows across the application

**Location:** `tests/e2e/`

**Commands:**
```bash
pnpm test:e2e                              # Run all E2E tests
pnpm test:e2e tests/e2e/auth/              # Specific folder
pnpm test:e2e tests/e2e/login.spec.ts      # Specific test
pnpm test:e2e --headed                     # With visible browser
pnpm test:e2e --debug                      # Debug mode
```

**Output:**
- Reports: `tests/reports/e2e/`
- Screenshots: `tests/screenshots/`
- Videos: `tests/artifacts/videos/`

**Example:**
```typescript
// tests/e2e/booking-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Booking Flow', () => {
  test('should complete booking successfully', async ({ page }) => {
    await page.goto('/');
    
    // Search for listing
    await page.fill('[data-testid="search-input"]', 'Conference Room');
    await page.click('[data-testid="search-button"]');
    
    // Select listing
    await page.click('[data-testid="listing-card"]:first-child');
    
    // Book
    await page.fill('[name="date"]', '2024-12-25');
    await page.click('button:has-text("Book")');
    
    // Verify
    await expect(page).toHaveURL(/\/bookings\/\d+/);
    await expect(page.locator('.success-message')).toBeVisible();
  });
});
```

### Integration Tests

**Purpose:** Test interactions between multiple modules/services

**Location:** `tests/integration/`

**Example:**
```typescript
// tests/integration/api/booking-service.test.ts
import { bookingService } from '@digilist/client-sdk';

describe('Booking Service Integration', () => {
  it('should create and retrieve booking', async () => {
    const bookingData = {
      listingId: 'test-listing-1',
      date: '2024-12-25',
      userId: 'test-user-1',
    };
    
    const created = await bookingService.create(bookingData);
    expect(created.id).toBeDefined();
    
    const retrieved = await bookingService.getById(created.id);
    expect(retrieved).toMatchObject(bookingData);
  });
});
```

### Performance Tests

**Purpose:** Test application performance, load times, memory usage

**Location:** `tests/performance/`

### Security Tests

**Purpose:** Test security vulnerabilities, authentication, authorization

**Location:** `tests/security/`

---

## Test Helpers & Fixtures

### Fixtures (`tests/fixtures/`)

Reusable test data for consistent testing:

```typescript
// tests/fixtures/listings.ts
export const mockListing = {
  id: 'test-listing-1',
  title: 'Conference Room A',
  description: 'Modern conference room with AV equipment',
  capacity: 20,
  price: 500,
  organizationId: 'org-1',
};

export const mockListingCard = {
  id: 'test-listing-1',
  title: 'Conference Room A',
  imageUrl: '/images/conference-room.jpg',
  price: 500,
  permissions: {
    canEdit: true,
    canDelete: false,
    canBook: true,
  },
};
```

### Helpers (`tests/helpers/`)

Reusable test utilities:

```typescript
// tests/helpers/auth.ts
import { Page } from '@playwright/test';

export async function loginAsUser(page: Page, email = 'test@example.com') {
  await page.goto('/login');
  await page.fill('[name="email"]', email);
  await page.fill('[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  await page.waitForURL('/dashboard');
}

export async function loginAsAdmin(page: Page) {
  await loginAsUser(page, 'admin@example.com');
}
```

---

## Testing Best Practices

### 1. Test Isolation

Each test should be completely independent:

```typescript
describe('ListingService', () => {
  beforeEach(() => {
    // Setup fresh state for each test
    vi.clearAllMocks();
  });
  
  afterEach(() => {
    // Clean up after each test
    vi.restoreAllMocks();
  });
  
  it('should fetch listings', async () => {
    // Test is isolated and independent
  });
});
```

### 2. Descriptive Test Names

```typescript
// ❌ Bad - vague and unclear
test('test 1', () => { ... });
test('works', () => { ... });

// ✅ Good - clear and descriptive
test('should display error message when email is invalid', () => { ... });
test('should disable submit button while form is submitting', () => { ... });
```

### 3. Arrange-Act-Assert Pattern

```typescript
test('should calculate total price with discount', () => {
  // Arrange - Set up test data
  const items = [
    { price: 100, quantity: 2 },
    { price: 50, quantity: 1 },
  ];
  const discount = 0.1; // 10% discount
  
  // Act - Execute the function
  const total = calculateTotal(items, discount);
  
  // Assert - Verify the result
  expect(total).toBe(225); // (200 + 50) * 0.9
});
```

### 4. Use Test Data Builders

```typescript
// tests/fixtures/builders/listing.builder.ts
export class ListingBuilder {
  private listing = {
    id: 'default-id',
    title: 'Default Title',
    price: 100,
    capacity: 10,
  };
  
  withTitle(title: string) {
    this.listing.title = title;
    return this;
  }
  
  withPrice(price: number) {
    this.listing.price = price;
    return this;
  }
  
  build() {
    return this.listing;
  }
}

// Usage in tests
const listing = new ListingBuilder()
  .withTitle('Custom Room')
  .withPrice(500)
  .build();
```

### 5. Mock External Dependencies

```typescript
// Mock SDK calls
vi.mock('@digilist/client-sdk', () => ({
  listingService: {
    getAll: vi.fn().mockResolvedValue([mockListing]),
    getById: vi.fn().mockResolvedValue(mockListing),
  },
}));

// Mock API calls in E2E tests
await page.route('**/api/listings', (route) => {
  route.fulfill({
    status: 200,
    body: JSON.stringify([mockListing]),
  });
});
```

---

## Common Testing Scenarios

### Testing React Components

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@xala/ds';

test('button click handler is called', () => {
  const handleClick = vi.fn();
  render(<Button onClick={handleClick}>Click me</Button>);
  
  const button = screen.getByText('Click me');
  fireEvent.click(button);
  
  expect(handleClick).toHaveBeenCalledTimes(1);
});
```

### Testing React Hooks

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { useListings } from '@digilist/client-sdk/hooks';

test('useListings hook fetches data', async () => {
  const { result } = renderHook(() => useListings());
  
  // Initially loading
  expect(result.current.isLoading).toBe(true);
  
  // Wait for data
  await waitFor(() => {
    expect(result.current.isSuccess).toBe(true);
  });
  
  // Verify data
  expect(result.current.data).toHaveLength(5);
});
```

### Testing Forms

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginForm } from './LoginForm';

test('form validation and submission', async () => {
  const onSubmit = vi.fn();
  render(<LoginForm onSubmit={onSubmit} />);
  
  // Fill form
  fireEvent.change(screen.getByLabelText('Email'), {
    target: { value: 'test@example.com' },
  });
  fireEvent.change(screen.getByLabelText('Password'), {
    target: { value: 'password123' },
  });
  
  // Submit
  fireEvent.click(screen.getByText('Login'));
  
  // Verify
  await waitFor(() => {
    expect(onSubmit).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
  });
});
```

### Testing API Integration (E2E)

```typescript
import { test, expect } from '@playwright/test';

test('API authentication flow', async ({ request }) => {
  // Login
  const loginResponse = await request.post('/api/auth/login', {
    data: {
      email: 'test@example.com',
      password: 'password123',
    },
  });
  
  expect(loginResponse.ok()).toBeTruthy();
  
  // Verify session cookie
  const cookies = loginResponse.headers()['set-cookie'];
  expect(cookies).toContain('session=');
  
  // Use session for authenticated request
  const profileResponse = await request.get('/api/user/profile');
  expect(profileResponse.ok()).toBeTruthy();
  
  const profile = await profileResponse.json();
  expect(profile.email).toBe('test@example.com');
});
```

---

## Debugging Tests

### Vitest Debugging

```bash
# Run specific test file
pnpm test tests/unit/components/Button.test.tsx

# Run with UI for interactive debugging
pnpm test:ui

# Run with coverage
pnpm test:coverage
```

**VS Code Debugging:**
1. Add breakpoint in test file
2. Click "Debug Test" in test file
3. Step through code

### Playwright Debugging

```bash
# Run with headed browser (see what's happening)
pnpm test:e2e --headed

# Run with debug mode (step through test)
pnpm test:e2e --debug

# Run specific test with headed browser
pnpm test:e2e tests/e2e/login.spec.ts --headed

# Generate trace for debugging
pnpm test:e2e --trace on
```

**Playwright Inspector:**
- Opens automatically with `--debug` flag
- Step through test actions
- Inspect page state
- View console logs

---

## CI/CD Integration

Tests run automatically on:
- **Pull Requests** - All tests must pass
- **Pushes to main** - Full test suite
- **Pre-commit hooks** - i18n scan, linting

**Pre-commit hooks (Husky):**
- i18n localization scan (`scripts/scan-i18n.js`)
- Linting
- Type checking

---

## Test Coverage

**Current Coverage Goals:**
- Unit tests: 80% coverage minimum
- Critical paths: 100% coverage
- E2E tests: All user journeys covered

**View Coverage:**
```bash
pnpm test:coverage
# Open: tests/reports/coverage/index.html
```

---

## Platform-Specific Testing

### Multi-Tenant Testing

Always test with tenant isolation:

```typescript
test('should only show listings for current tenant', async () => {
  const tenant1Listings = await listingService.getAll({ tenantId: 'tenant-1' });
  const tenant2Listings = await listingService.getAll({ tenantId: 'tenant-2' });
  
  expect(tenant1Listings).not.toEqual(tenant2Listings);
});
```

### RBAC Testing

Test role-based access control:

```typescript
test('admin can delete listing', async ({ page }) => {
  await loginAsAdmin(page);
  await page.goto('/listings/123');
  await expect(page.locator('[data-testid="delete-button"]')).toBeVisible();
});

test('regular user cannot delete listing', async ({ page }) => {
  await loginAsUser(page);
  await page.goto('/listings/123');
  await expect(page.locator('[data-testid="delete-button"]')).not.toBeVisible();
});
```

### i18n Testing

Test internationalization:

```typescript
test('displays Norwegian text when locale is nb', () => {
  render(<ListingCard listing={mockListing} locale="nb" />);
  expect(screen.getByText('Bestill')).toBeInTheDocument();
});

test('displays English text when locale is en', () => {
  render(<ListingCard listing={mockListing} locale="en" />);
  expect(screen.getByText('Book')).toBeInTheDocument();
});
```

---

## When in Doubt

1. **Check existing tests** for patterns and examples
2. **Follow the test organization structure** strictly
3. **Use appropriate test type** (unit vs integration vs e2e)
4. **Keep tests focused and isolated**
5. **Write descriptive test names**
6. **Mock external dependencies**
7. **Clean up after tests**

For more information:
- [Testing Strategy Guide](../docs/guides/02-testing.md)
- [Development Workflow](../docs/03-development-workflow.md)
- Main [CLAUDE.md](../CLAUDE.md)
- Main [AGENTS.md](../AGENTS.md)
