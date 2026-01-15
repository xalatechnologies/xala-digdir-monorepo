# Testing Strategy

This document outlines the comprehensive testing strategy for the Xala Diglist Platform, covering unit tests, integration tests, E2E tests, and quality assurance practices.

## Testing Philosophy

Our testing approach follows these principles:
- **Test Pyramid** - More unit tests, fewer E2E tests
- **Shift Left** - Test early and often
- **Automated** - All tests run in CI/CD
- **Comprehensive** - Cover functionality, accessibility, and performance
- **Maintainable** - Tests should be easy to understand and modify

## Test Types

### 1. Unit Tests
- **Purpose**: Test individual functions and components in isolation
- **Tools**: Vitest, React Testing Library
- **Coverage**: > 90% for critical paths
- **Speed**: < 5 seconds for entire suite

### 2. Integration Tests
- **Purpose**: Test interaction between multiple units
- **Tools**: Vitest, Test Containers
- **Coverage**: API endpoints, data flows
- **Speed**: < 30 seconds for entire suite

### 3. E2E Tests
- **Purpose**: Test complete user journeys
- **Tools**: Playwright
- **Coverage**: Critical user flows
- **Speed**: < 10 minutes for entire suite

### 4. Contract Tests
- **Purpose**: Verify API contracts match SDK
- **Tools**: Custom contract testing
- **Coverage**: All API endpoints
- **Speed**: < 1 minute for entire suite

## Test Organization

```
tests/
├── unit/                   # Unit tests
│   ├── components/         # Component tests
│   ├── hooks/             # Hook tests
│   ├── services/          # Service tests
│   └── utils/             # Utility tests
├── integration/           # Integration tests
│   ├── api/               # API integration
│   ├── database/          # Database tests
│   └── external/          # External service tests
├── e2e/                   # E2E tests
│   ├── auth/              # Authentication flows
│   ├── booking/           # Booking flows
│   ├── listing/           # Listing management
│   └── admin/             # Admin functions
├── performance/           # Performance tests
├── security/              # Security tests
├── accessibility/         # A11y tests
├── fixtures/              # Test data
├── helpers/               # Test utilities
├── mocks/                 # Mock implementations
└── reports/               # Test reports
```

## Unit Testing

### Component Testing
```typescript
// tests/unit/components/ListingCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ListingCard } from '@/features/listings/components/ListingCard';
import { mockListingCard } from '@/tests/mocks/listing.mock';

describe('ListingCard', () => {
  const defaultProps = {
    listing: mockListingCard,
    onView: jest.fn(),
    onEdit: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders listing information correctly', () => {
    render(<ListingCard {...defaultProps} />);
    
    expect(screen.getByText(mockListingCard.title)).toBeInTheDocument();
    expect(screen.getByText(mockListingCard.description)).toBeInTheDocument();
    expect(screen.getByAltText(mockListingCard.title)).toBeInTheDocument();
  });

  it('shows edit button when user has permission', () => {
    render(<ListingCard {...defaultProps} />);
    
    const editButton = screen.queryByRole('button', { name: /edit/i });
    expect(editButton).toBeInTheDocument();
  });

  it('hides edit button when user lacks permission', () => {
    const listingWithoutPermission = {
      ...mockListingCard,
      permissions: { ...mockListingCard.permissions, canEdit: false },
    };
    
    render(
      <ListingCard 
        {...defaultProps} 
        listing={listingWithoutPermission} 
      />
    );
    
    const editButton = screen.queryByRole('button', { name: /edit/i });
    expect(editButton).not.toBeInTheDocument();
  });

  it('calls onView when view button is clicked', () => {
    render(<ListingCard {...defaultProps} />);
    
    fireEvent.click(screen.getByRole('button', { name: /view/i }));
    expect(defaultProps.onView).toHaveBeenCalledWith(mockListingCard.id);
  });

  it('matches snapshot', () => {
    const { container } = render(<ListingCard {...defaultProps} />);
    expect(container).toMatchSnapshot();
  });
});
```

### Hook Testing
```typescript
// tests/unit/hooks/useListings.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useListings } from '@/features/listings/hooks/useListings';
import { mockListings } from '@/tests/mocks/listing.mock';

describe('useListings', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  it('fetches listings successfully', async () => {
    const { result } = renderHook(() => useListings(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockListings);
  });

  it('handles loading state', () => {
    const { result } = renderHook(() => useListings(), { wrapper });

    expect(result.current.isLoading).toBe(true);
  });

  it('handles error state', async () => {
    // Mock error response
    jest.spyOn(sdk.listing, 'findMany').mockRejectedValue(
      new Error('Failed to fetch')
    );

    const { result } = renderHook(() => useListings(), { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeInstanceOf(Error);
  });

  it('refetches when filters change', async () => {
    const { rerender, result } = renderHook(
      ({ filters }) => useListings(filters),
      {
        wrapper,
        initialProps: { filters: {} },
      }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    const spy = jest.spyOn(sdk.listing, 'findMany');

    rerender({ filters: { status: 'available' } });

    await waitFor(() => {
      expect(spy).toHaveBeenCalledWith({ status: 'available' });
    });
  });
});
```

### Service Testing
```typescript
// tests/unit/services/listing.service.test.ts
import { ListingService } from '@/services/listing.service';
import { mockListing } from '@/tests/mocks/listing.mock';

describe('ListingService', () => {
  let service: ListingService;
  let mockRepository: jest.Mocked<ListingRepository>;

  beforeEach(() => {
    mockRepository = {
      findById: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    
    service = new ListingService(mockRepository);
  });

  describe('findById', () => {
    it('returns listing when found', async () => {
      mockRepository.findById.mockResolvedValue(mockListing);

      const result = await service.findById('123');

      expect(result).toEqual(mockListing);
      expect(mockRepository.findById).toHaveBeenCalledWith('123');
    });

    it('throws error when not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.findById('123')).rejects.toThrow(
        'Listing not found'
      );
    });
  });

  describe('create', () => {
    it('creates listing with valid data', async () => {
      const createData = {
        title: 'Test Listing',
        description: 'Test Description',
      };

      mockRepository.create.mockResolvedValue(mockListing);

      const result = await service.create(createData);

      expect(result).toEqual(mockListing);
      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          ...createData,
          id: expect.any(String),
          createdAt: expect.any(Date),
        })
      );
    });

    it('validates required fields', async () => {
      const invalidData = { title: '' };

      await expect(service.create(invalidData)).rejects.toThrow(
        'Title is required'
      );
    });
  });
});
```

## Integration Testing

### API Integration
```typescript
// tests/integration/api/listing.test.ts
import request from 'supertest';
import { app } from '@/app';
import { setupTestDB, teardownTestDB } from '@/tests/helpers/database';

describe('Listing API', () => {
  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  describe('GET /api/listings', () => {
    it('returns paginated listings', async () => {
      const response = await request(app)
        .get('/api/listings')
        .expect(200);

      expect(response.body).toMatchObject({
        data: expect.any(Array),
        pagination: {
          page: 1,
          pageSize: 20,
          total: expect.any(Number),
        },
      });
    });

    it('filters by status', async () => {
      const response = await request(app)
        .get('/api/listings?status=available')
        .expect(200);

      response.body.data.forEach((listing: any) => {
        expect(listing.status).toBe('available');
      });
    });
  });

  describe('POST /api/listings', () => {
    it('creates new listing', async () => {
      const listingData = {
        title: 'Test Listing',
        description: 'Test Description',
        organizationId: 'org-123',
      };

      const response = await request(app)
        .post('/api/listings')
        .set('Authorization', 'Bearer valid-token')
        .send(listingData)
        .expect(201);

      expect(response.body).toMatchObject({
        id: expect.any(String),
        ...listingData,
        createdAt: expect.any(String),
      });
    });

    it('validates required fields', async () => {
      const response = await request(app)
        .post('/api/listings')
        .set('Authorization', 'Bearer valid-token')
        .send({})
        .expect(400);

      expect(response.body).toMatchObject({
        error: 'Validation failed',
        details: {
          title: 'Title is required',
        },
      });
    });
  });
});
```

### Database Integration
```typescript
// tests/integration/database/booking.test.ts
import { BookingRepository } from '@/repositories/booking.repository';
import { setupTestDB, teardownTestDB } from '@/tests/helpers/database';
import { createTestBooking } from '@/tests/factories/booking.factory';

describe('BookingRepository Integration', () => {
  let repository: BookingRepository;

  beforeAll(async () => {
    await setupTestDB();
    repository = new BookingRepository();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  describe('findByDateRange', () => {
    it('returns bookings within date range', async () => {
      const booking1 = await createTestBooking({
        startTime: new Date('2024-01-15T10:00:00Z'),
        endTime: new Date('2024-01-15T12:00:00Z'),
      });

      const booking2 = await createTestBooking({
        startTime: new Date('2024-01-16T14:00:00Z'),
        endTime: new Date('2024-01-16T16:00:00Z'),
      });

      const bookings = await repository.findByDateRange(
        new Date('2024-01-15T00:00:00Z'),
        new Date('2024-01-16T23:59:59Z')
      );

      expect(bookings).toHaveLength(2);
      expect(bookings.map(b => b.id)).toContain(booking1.id);
      expect(bookings.map(b => b.id)).toContain(booking2.id);
    });

    it('excludes bookings outside date range', async () => {
      await createTestBooking({
        startTime: new Date('2024-01-10T10:00:00Z'),
        endTime: new Date('2024-01-10T12:00:00Z'),
      });

      const bookings = await repository.findByDateRange(
        new Date('2024-01-15T00:00:00Z'),
        new Date('2024-01-16T23:59:59Z')
      );

      expect(bookings).toHaveLength(0);
    });
  });
});
```

## E2E Testing

### User Journey Tests
```typescript
// tests/e2e/booking-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Booking Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="password"]', 'password');
    await page.click('[data-testid="login-button"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('user can search and book a listing', async ({ page }) => {
    // Search for listings
    await page.goto('/listings');
    await page.fill('[data-testid="search-input"]', 'meeting room');
    await page.press('[data-testid="search-input"]', 'Enter');
    
    // Verify search results
    await expect(page.locator('[data-testid="listing-card"]')).toHaveCount(5);
    
    // Click first listing
    await page.click('[data-testid="listing-card"]:first-child');
    await expect(page).toHaveURL(/\/listings\/[a-zA-Z0-9-]+/);
    
    // Check availability
    await page.click('[data-testid="check-availability"]');
    await expect(page.locator('[data-testid="time-slot"]')).toBeVisible();
    
    // Select time slot
    await page.click('[data-testid="time-slot"]:first-child');
    
    // Fill booking form
    await page.fill('[data-testid="purpose"]', 'Team meeting');
    await page.fill('[data-testid="attendees"]', '10');
    
    // Submit booking
    await page.click('[data-testid="book-button"]');
    
    // Verify booking confirmation
    await expect(page.locator('[data-testid="booking-success"]')).toBeVisible();
    await expect(page.locator('text=Booking confirmed')).toBeVisible();
    
    // Check booking appears in dashboard
    await page.goto('/dashboard/bookings');
    await expect(page.locator('[data-testid="booking-item"]')).toContainText(
      'Team meeting'
    );
  });

  test('prevents double booking', async ({ page }) => {
    // Book a time slot
    await page.goto('/listings/test-listing-id');
    await page.click('[data-testid="time-slot"]:first-child');
    await page.fill('[data-testid="purpose"]', 'First booking');
    await page.click('[data-testid="book-button"]');
    
    // Try to book same slot again
    await page.goto('/listings/test-listing-id');
    await page.click('[data-testid="time-slot"]:first-child');
    
    // Should show error
    await expect(page.locator('[data-testid="booking-error"]')).toBeVisible();
    await expect(page.locator('text=Time slot already booked')).toBeVisible();
  });
});
```

### Accessibility Testing
```typescript
// tests/e2e/accessibility.spec.ts
import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y } from 'axe-playwright';

test.describe('Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await injectAxe(page);
  });

  test('homepage meets WCAG 2.1 AA', async ({ page }) => {
    await page.goto('/');
    
    await checkA11y(page, undefined, {
      detailedReport: true,
      detailedReportOptions: { html: true },
      rules: {
        // Enable WCAG 2.1 AA rules
        'color-contrast': { enabled: true },
        'keyboard-navigation': { enabled: true },
        'focus-order-semantics': { enabled: true },
      },
    });
  });

  test('booking form is accessible', async ({ page }) => {
    await page.goto('/listings/test-id/book');
    
    // Check form accessibility
    await checkA11y(page, '[data-testid="booking-form"]', {
      rules: {
        'label-title-only': { enabled: true },
        'input-button-name': { enabled: true },
      },
    });
    
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toBeVisible();
    
    // Test form validation with screen reader
    await page.click('[data-testid="submit-button"]');
    await expect(page.locator('[aria-live="polite"]')).toBeVisible();
  });
});
```

## Performance Testing

### Core Web Vitals
```typescript
// tests/performance/core-web-vitals.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Performance', () => {
  test('homepage meets Core Web Vitals thresholds', async ({ page }) => {
    // Start measuring
    const startTime = Date.now();
    
    await page.goto('/');
    
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    // Measure LCP (Largest Contentful Paint)
    const lcp = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          resolve(lastEntry.startTime);
        }).observe({ entryTypes: ['largest-contentful-paint'] });
      });
    });
    
    // Measure FID (First Input Delay)
    const fid = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const firstEntry = entries[0];
          resolve(firstEntry.processingStart - firstEntry.startTime);
        }).observe({ entryTypes: ['first-input'] });
      });
    });
    
    // Measure CLS (Cumulative Layout Shift)
    const cls = await page.evaluate(() => {
      return new Promise((resolve) => {
        let clsValue = 0;
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          }
          resolve(clsValue);
        }).observe({ entryTypes: ['layout-shift'] });
      });
    });
    
    // Assert thresholds
    expect(lcp).toBeLessThan(2500); // Good LCP threshold
    expect(fid).toBeLessThan(100);   // Good FID threshold
    expect(cls).toBeLessThan(0.1);   // Good CLS threshold
  });

  test('bundle size is within limits', async ({ page }) => {
    const responses: any[] = [];
    
    page.on('response', (response) => {
      if (response.url().includes('.js') || response.url().includes('.css')) {
        responses.push({
          url: response.url(),
          size: parseInt(response.headers()['content-length'] || '0'),
        });
      }
    });
    
    await page.goto('/');
    
    const totalJS = responses
      .filter(r => r.url.endsWith('.js'))
      .reduce((sum, r) => sum + r.size, 0);
    
    const totalCSS = responses
      .filter(r => r.url.endsWith('.css'))
      .reduce((sum, r) => sum + r.size, 0);
    
    // Assert bundle sizes
    expect(totalJS).toBeLessThan(250 * 1024); // 250KB JS
    expect(totalCSS).toBeLessThan(50 * 1024); // 50KB CSS
  });
});
```

## Security Testing

### Security Headers
```typescript
// tests/security/headers.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Security Headers', () => {
  test('sets correct security headers', async ({ page }) => {
    const response = await page.goto('/');
    
    const headers = response?.headers();
    
    expect(headers?.['x-frame-options']).toBe('DENY');
    expect(headers?.['x-content-type-options']).toBe('nosniff');
    expect(headers?.['strict-transport-security']).toContain(
      'max-age=31536000'
    );
    expect(headers?.['content-security-policy']).toContain(
      "default-src 'self'"
    );
  });

  test('prevents XSS attacks', async ({ page }) => {
    await page.goto('/');
    
    // Try to inject script
    await page.fill(
      '[data-testid="search-input"]',
      '<script>alert("XSS")</script>'
    );
    await page.press('[data-testid="search-input"]', 'Enter');
    
    // Verify script is not executed
    page.on('dialog', () => {
      throw new Error('XSS script was executed!');
    });
    
    // Verify script is escaped
    const content = await page.content();
    expect(content).toContain('&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;');
  });
});
```

## Test Configuration

### Vitest Configuration
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.*',
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### Playwright Configuration
```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: 'tests/reports/e2e' }],
    ['junit', { outputFile: 'tests/reports/e2e/results.xml' }],
  ],
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

## Test Utilities

### Mock Data Factory
```typescript
// tests/factories/listing.factory.ts
import { faker } from '@faker-js/faker';
import type { ListingDTO } from '@/types/listing';

export function createTestListing(overrides?: Partial<ListingDTO>): ListingDTO {
  return {
    id: faker.string.uuid(),
    title: faker.lorem.words(3),
    description: faker.lorem.paragraph(),
    organizationId: faker.string.uuid(),
    status: 'available',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export function createTestListings(count: number): ListingDTO[] {
  return Array.from({ length: count }, () => createTestListing());
}
```

### Test Helpers
```typescript
// tests/helpers/render.tsx
import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DesignsystemetProvider } from '@xala/ds';

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

function AllTheProviders({ children }: { children: React.ReactNode }) {
  const queryClient = createTestQueryClient();
  
  return (
    <QueryClientProvider client={queryClient}>
      <DesignsystemetProvider>
        {children}
      </DesignsystemetProvider>
    </QueryClientProvider>
  );
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
```

## CI/CD Integration

### GitHub Actions Workflow
```yaml
# .github/workflows/test.yml
name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  unit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm test:unit --coverage
      - uses: codecov/codecov-action@v3

  integration:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm test:integration

  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: ppm build
      - run: pnpm test:e2e
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: tests/reports/e2e/
```

## Best Practices

### 1. Test Structure
- **Arrange, Act, Assert** pattern
- Descriptive test names
- One assertion per test
- Test behavior, not implementation

### 2. Mocking
- Mock external dependencies
- Use factory functions for test data
- Keep mocks simple
- Don't mock everything

### 3. Maintenance
- Regular test reviews
- Update tests with features
- Remove obsolete tests
- Monitor test coverage

### 4. Performance
- Use test parallelization
- Optimize test data
- Cache test dependencies
- Run tests selectively

## Related Documentation

- [Development Workflow](../03-development-workflow.md)
- [Contract-First Guide](../guides/01-contract-first.md)
- [Performance Guide](../guides/04-performance.md)
- [Accessibility Guide](../guides/05-accessibility.md)
