# AGENTS.md - Tests Directory

Guidance for agentic coding assistants working with tests in this repository.

## Test Directory Structure

This directory contains ALL tests for the Xala Diglist Platform monorepo.

```
tests/
├── unit/              # Unit tests (Vitest)
├── e2e/               # E2E tests (Playwright)
├── integration/       # Integration tests
├── performance/       # Performance tests
├── security/          # Security tests
├── journeys/          # User journey tests
├── scenarios/         # Test scenarios
├── fixtures/          # Test data and fixtures
├── helpers/           # Test utilities and helpers
├── reports/           # Test output (gitignored)
├── screenshots/       # E2E screenshots (gitignored)
└── artifacts/         # Test artifacts (gitignored)
```

## Critical Rules

### Test Organization (ABSOLUTE REQUIREMENTS)

1. **ALL tests MUST be in this `tests/` directory**
   - Unit tests → `tests/unit/`
   - E2E tests → `tests/e2e/`
   - Integration tests → `tests/integration/`
   - Performance tests → `tests/performance/`
   - Security tests → `tests/security/`

2. **NEVER create test folders at root level**
   - ❌ `test-results/` at root
   - ❌ `playwright-report/` at root
   - ❌ `e2e/` at root
   - ❌ `reports/` at root (reserved for technical reports)
   - ✅ All output goes to `tests/reports/`, `tests/screenshots/`, `tests/artifacts/`

3. **Test file naming conventions**
   - Unit tests: `*.test.ts`, `*.spec.ts`, `*.test.tsx`, `*.spec.tsx`
   - E2E tests: `*.spec.ts` (in `tests/e2e/`)
   - Integration tests: `*.test.ts` (in `tests/integration/`)

## Test Types

### Unit Tests (Vitest)

**Location:** `tests/unit/` or co-located with source code

**Purpose:** Test individual functions, components, hooks in isolation

**Commands:**
```bash
pnpm test                    # Watch mode
pnpm test:run                # Run once
pnpm test:ui                 # With UI
pnpm test:coverage           # With coverage
```

**Example:**
```typescript
// tests/unit/components/ListingCard.test.tsx
import { render, screen } from '@testing-library/react';
import { ListingCard } from '@xala/ds';

describe('ListingCard', () => {
  it('should render listing title', () => {
    render(<ListingCard listing={mockListing} />);
    expect(screen.getByText('Test Listing')).toBeInTheDocument();
  });
});
```

### E2E Tests (Playwright)

**Location:** `tests/e2e/`

**Purpose:** Test complete user flows across the application

**Commands:**
```bash
pnpm test:e2e                              # All E2E tests
pnpm test:e2e tests/e2e/auth/              # Specific folder
pnpm test:e2e tests/e2e/login.spec.ts      # Specific test
```

**Example:**
```typescript
// tests/e2e/booking-flow.spec.ts
import { test, expect } from '@playwright/test';

test('complete booking flow', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-testid="listing-card"]');
  await page.fill('[name="date"]', '2024-12-25');
  await page.click('button:has-text("Book")');
  await expect(page).toHaveURL(/\/bookings\/\d+/);
});
```

### Integration Tests

**Location:** `tests/integration/`

**Purpose:** Test interactions between multiple modules/services

**Example:**
```typescript
// tests/integration/api/booking-service.test.ts
import { bookingService } from '@digilist/client-sdk';

describe('Booking Service Integration', () => {
  it('should create and retrieve booking', async () => {
    const booking = await bookingService.create(mockBookingData);
    const retrieved = await bookingService.getById(booking.id);
    expect(retrieved).toEqual(booking);
  });
});
```

### Performance Tests

**Location:** `tests/performance/`

**Purpose:** Test application performance, load times, memory usage

### Security Tests

**Location:** `tests/security/`

**Purpose:** Test security vulnerabilities, authentication, authorization

## Test Configuration Files

All test configuration files are at the repository root:

- `vitest.config.ts` - Vitest configuration
- `vitest.setup.ts` - Vitest setup
- `playwright.config.ts` - Main Playwright config
- `playwright.auth.config.ts` - Auth-specific Playwright config
- `playwright.minside.config.ts` - Minside-specific Playwright config

## Test Helpers & Fixtures

### Fixtures (`tests/fixtures/`)

Reusable test data:
```typescript
// tests/fixtures/listings.ts
export const mockListing = {
  id: 'test-listing-1',
  title: 'Test Listing',
  description: 'Test description',
  // ...
};
```

### Helpers (`tests/helpers/`)

Reusable test utilities:
```typescript
// tests/helpers/auth.ts
export async function loginAsUser(page: Page) {
  await page.goto('/login');
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'password');
  await page.click('button[type="submit"]');
}
```

## Test Output

All test output MUST go to designated directories:

- **Coverage reports:** `tests/reports/coverage/`
- **E2E reports:** `tests/reports/e2e/`
- **Screenshots:** `tests/screenshots/`
- **Videos:** `tests/artifacts/videos/`
- **Other artifacts:** `tests/artifacts/`

These directories are gitignored.

## Best Practices

### 1. Test Isolation
- Each test should be independent
- Clean up after tests (database, files, etc.)
- Use beforeEach/afterEach for setup/teardown

### 2. Descriptive Names
```typescript
// ❌ Bad
test('test 1', () => { ... });

// ✅ Good
test('should display error message when email is invalid', () => { ... });
```

### 3. Arrange-Act-Assert Pattern
```typescript
test('should calculate total price', () => {
  // Arrange
  const items = [{ price: 10 }, { price: 20 }];
  
  // Act
  const total = calculateTotal(items);
  
  // Assert
  expect(total).toBe(30);
});
```

### 4. Use Test Data Builders
```typescript
// tests/fixtures/builders/listing.builder.ts
export class ListingBuilder {
  private listing = { ...defaultListing };
  
  withTitle(title: string) {
    this.listing.title = title;
    return this;
  }
  
  build() {
    return this.listing;
  }
}
```

### 5. Mock External Dependencies
```typescript
// Mock SDK calls
vi.mock('@digilist/client-sdk', () => ({
  listingService: {
    getAll: vi.fn().mockResolvedValue([mockListing]),
  },
}));
```

## Common Test Scenarios

### Testing React Components
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@xala/ds';

test('button click handler', () => {
  const handleClick = vi.fn();
  render(<Button onClick={handleClick}>Click me</Button>);
  
  fireEvent.click(screen.getByText('Click me'));
  expect(handleClick).toHaveBeenCalledTimes(1);
});
```

### Testing React Hooks
```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { useListings } from '@digilist/client-sdk/hooks';

test('useListings hook', async () => {
  const { result } = renderHook(() => useListings());
  
  await waitFor(() => {
    expect(result.current.isSuccess).toBe(true);
  });
  
  expect(result.current.data).toHaveLength(5);
});
```

### Testing API Integration
```typescript
import { test, expect } from '@playwright/test';

test('API authentication flow', async ({ request }) => {
  const response = await request.post('/api/auth/login', {
    data: { email: 'test@example.com', password: 'password' },
  });
  
  expect(response.ok()).toBeTruthy();
  const cookies = await response.headers()['set-cookie'];
  expect(cookies).toContain('session=');
});
```

## Debugging Tests

### Vitest
```bash
# Run specific test file
pnpm test tests/unit/components/Button.test.tsx

# Run with UI
pnpm test:ui

# Debug in VS Code
# Add breakpoint and use "Debug Test" in test file
```

### Playwright
```bash
# Run with headed browser
pnpm test:e2e --headed

# Run with debug mode
pnpm test:e2e --debug

# Run specific test
pnpm test:e2e tests/e2e/login.spec.ts --headed
```

## CI/CD Integration

Tests run automatically on:
- Pull requests
- Pushes to main branch
- Pre-commit hooks (via Husky)

**Pre-commit hooks:**
- i18n localization scan
- Linting
- Type checking

## When in Doubt

1. Check existing tests for patterns
2. Follow the test organization structure
3. Use appropriate test type (unit vs integration vs e2e)
4. Keep tests focused and isolated
5. Write descriptive test names

For more information, see:
- [Testing Strategy Guide](../docs/guides/02-testing.md)
- [Development Workflow](../docs/03-development-workflow.md)
- Main [AGENTS.md](../AGENTS.md)
