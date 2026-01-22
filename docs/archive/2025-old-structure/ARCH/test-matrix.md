# DS-First Test Matrix

**Version:** 1.0  
**Generated:** 2026-01-19  
**Status:** IMPLEMENTATION GUIDE

---

## Overview

This document defines the testing strategy for the DS-first architecture, ensuring that DS blocks, app wrappers, and the overall system work correctly together.

---

## A) Unit Tests - DS Blocks

### Test Location
```
packages/ds/src/__tests__/
├── primitives/
├── composed/
├── blocks/
└── shells/
```

### Test Requirements per Block

| Test Case | Required | Example |
|-----------|----------|---------|
| Renders correctly | YES | `expect(screen.getByTestId('block')).toBeInTheDocument()` |
| Handles i18n keys | YES | `<Block titleKey="key" />` renders translated text |
| Has data-testid | YES | `expect(screen.getByTestId('custom-id')).toExist()` |
| Accessibility audit | YES | `expect(await axe(container)).toHaveNoViolations()` |
| Loading state | If applicable | `<Block isLoading />` shows skeleton |
| Error state | If applicable | `<Block error={err} />` shows error |
| Empty state | If applicable | `<Block data={[]} />` shows empty message |
| Click handlers | If interactive | `fireEvent.click()` calls handler |
| Keyboard navigation | If interactive | Tab, Enter, Escape work |

### Example Test Suite

```typescript
// packages/ds/src/__tests__/composed/DataTable.test.tsx

import { render, screen, fireEvent } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { DataTable } from '../composed/DataTable';

expect.extend(toHaveNoViolations);

const mockData = [
  { id: '1', name: 'Item 1' },
  { id: '2', name: 'Item 2' },
];

const columns = [
  { key: 'id', header: 'ID' },
  { key: 'name', header: 'Name' },
];

describe('DataTable', () => {
  it('renders table with data', () => {
    render(
      <DataTable 
        data={mockData} 
        columns={columns} 
        getRowKey={(r) => r.id}
        data-testid="test-table"
      />
    );
    
    expect(screen.getByTestId('test-table')).toBeInTheDocument();
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    render(
      <DataTable 
        data={[]} 
        columns={columns} 
        getRowKey={(r) => r.id}
        isLoading
        data-testid="test-table"
      />
    );
    
    expect(screen.getByTestId('test-table-loading')).toBeInTheDocument();
  });

  it('shows empty state', () => {
    render(
      <DataTable 
        data={[]} 
        columns={columns} 
        getRowKey={(r) => r.id}
        emptyState={<div data-testid="empty">No data</div>}
        data-testid="test-table"
      />
    );
    
    expect(screen.getByTestId('empty')).toBeInTheDocument();
  });

  it('handles row click', () => {
    const handleClick = jest.fn();
    
    render(
      <DataTable 
        data={mockData} 
        columns={columns} 
        getRowKey={(r) => r.id}
        onRowClick={handleClick}
        data-testid="test-table"
      />
    );
    
    fireEvent.click(screen.getByText('Item 1'));
    expect(handleClick).toHaveBeenCalledWith(mockData[0]);
  });

  it('handles sort', () => {
    const handleSort = jest.fn();
    
    render(
      <DataTable 
        data={mockData} 
        columns={columns} 
        getRowKey={(r) => r.id}
        sortable
        onSort={handleSort}
        data-testid="test-table"
      />
    );
    
    fireEvent.click(screen.getByText('Name'));
    expect(handleSort).toHaveBeenCalledWith('name', 'asc');
  });

  it('passes accessibility audit', async () => {
    const { container } = render(
      <DataTable 
        data={mockData} 
        columns={columns} 
        getRowKey={(r) => r.id}
        data-testid="test-table"
      />
    );
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('supports keyboard navigation', () => {
    const handleClick = jest.fn();
    
    render(
      <DataTable 
        data={mockData} 
        columns={columns} 
        getRowKey={(r) => r.id}
        onRowClick={handleClick}
        data-testid="test-table"
      />
    );
    
    const row = screen.getByTestId('test-table-row-0');
    row.focus();
    fireEvent.keyDown(row, { key: 'Enter' });
    expect(handleClick).toHaveBeenCalled();
  });
});
```

---

## B) Integration Tests - Wrappers

### Test Location
```
apps/*/src/__tests__/
├── routes/
└── wrappers/
```

### Test Requirements per Wrapper

| Test Case | Required | Description |
|-----------|----------|-------------|
| SDK data → Block props | YES | Verify mapping correctness |
| Loading state rendering | YES | SDK loading → Block loading prop |
| Error state rendering | YES | SDK error → Block error prop |
| Empty state rendering | YES | SDK empty data → Block empty state |
| Event handler wiring | YES | Block events → SDK mutations |

### Example Test Suite

```typescript
// apps/backoffice/src/__tests__/routes/bookings.test.tsx

import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { BookingsPage } from '../../routes/bookings';

// Mock SDK hooks
jest.mock('@digilist/client-sdk', () => ({
  useBookings: jest.fn(),
  useBookingFilters: jest.fn(() => ({ filters: {}, setFilter: jest.fn() })),
}));

import { useBookings } from '@digilist/client-sdk';

const mockUseBookings = useBookings as jest.Mock;

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={new QueryClient()}>
    <MemoryRouter>
      {children}
    </MemoryRouter>
  </QueryClientProvider>
);

describe('BookingsPage wrapper', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading state while fetching', () => {
    mockUseBookings.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });

    render(<BookingsPage />, { wrapper });
    
    expect(screen.getByTestId('bookings-page-loading')).toBeInTheDocument();
  });

  it('shows error state on fetch failure', async () => {
    mockUseBookings.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Failed to fetch'),
    });

    render(<BookingsPage />, { wrapper });
    
    expect(screen.getByTestId('bookings-page-error')).toBeInTheDocument();
    expect(screen.getByText(/failed to fetch/i)).toBeInTheDocument();
  });

  it('shows empty state when no bookings', () => {
    mockUseBookings.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });

    render(<BookingsPage />, { wrapper });
    
    expect(screen.getByTestId('bookings-page-empty')).toBeInTheDocument();
  });

  it('renders bookings data correctly', () => {
    const mockBookings = [
      { id: '1', status: 'confirmed', rentalObjectName: 'Room A' },
      { id: '2', status: 'pending', rentalObjectName: 'Room B' },
    ];

    mockUseBookings.mockReturnValue({
      data: mockBookings,
      isLoading: false,
      error: null,
    });

    render(<BookingsPage />, { wrapper });
    
    expect(screen.getByTestId('bookings-page')).toBeInTheDocument();
    expect(screen.getByText('Room A')).toBeInTheDocument();
    expect(screen.getByText('Room B')).toBeInTheDocument();
  });

  it('maps SDK data to block props correctly', () => {
    const mockBookings = [
      { 
        id: '1', 
        status: 'confirmed', 
        rentalObjectName: 'Room A',
        startTime: '2026-01-20T10:00:00Z',
        endTime: '2026-01-20T12:00:00Z',
      },
    ];

    mockUseBookings.mockReturnValue({
      data: mockBookings,
      isLoading: false,
      error: null,
    });

    render(<BookingsPage />, { wrapper });
    
    // Verify the data table received correctly mapped props
    expect(screen.getByTestId('bookings-table')).toBeInTheDocument();
    // Verify formatted date is displayed (mapping logic)
    expect(screen.getByText(/jan 20, 2026/i)).toBeInTheDocument();
  });
});
```

---

## C) E2E Tests - Full Page Flows

### Test Location
```
tests/e2e/
├── backoffice/
├── minside/
├── web/
└── shared/
```

### Test Requirements

| Test Case | Required | Description |
|-----------|----------|-------------|
| Page renders without errors | YES | No console errors |
| Navigation works | YES | Sidebar/header navigation |
| Data loads correctly | YES | API → UI display |
| Actions complete | YES | CRUD operations work |
| Cross-app consistency | YES | Same blocks look same |

### Example E2E Suite (Playwright)

```typescript
// tests/e2e/backoffice/bookings.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Bookings Page', () => {
  test.beforeEach(async ({ page }) => {
    // Login as caseworker
    await page.goto('/login');
    await page.click('[data-testid="demo-login-caseworker"]');
    await page.waitForURL('/dashboard');
  });

  test('navigates to bookings page', async ({ page }) => {
    await page.click('[data-testid="sidebar-nav-bookings"]');
    await page.waitForURL('/bookings');
    
    expect(await page.getByTestId('bookings-page')).toBeVisible();
  });

  test('displays page header correctly', async ({ page }) => {
    await page.goto('/bookings');
    
    const header = page.getByTestId('page-header');
    await expect(header).toBeVisible();
    await expect(header.getByRole('heading')).toContainText('Bookings');
  });

  test('displays data table with bookings', async ({ page }) => {
    await page.goto('/bookings');
    
    const table = page.getByTestId('bookings-table');
    await expect(table).toBeVisible();
    
    // Verify table has rows
    const rows = table.locator('[data-testid^="bookings-table-row-"]');
    await expect(rows.first()).toBeVisible();
  });

  test('filters bookings by status', async ({ page }) => {
    await page.goto('/bookings');
    
    // Click status filter
    await page.click('[data-testid="status-tabs-pending"]');
    
    // Verify only pending bookings shown
    const rows = page.locator('[data-testid^="bookings-table-row-"]');
    for (const row of await rows.all()) {
      const status = row.locator('[data-testid$="-status"]');
      await expect(status).toContainText('Pending');
    }
  });

  test('opens booking detail from row click', async ({ page }) => {
    await page.goto('/bookings');
    
    // Click first row
    await page.click('[data-testid="bookings-table-row-0"]');
    
    // Verify navigation to detail page
    await page.waitForURL(/\/bookings\/[a-z0-9-]+/);
    await expect(page.getByTestId('booking-detail-page')).toBeVisible();
  });

  test('shows empty state when no bookings', async ({ page }) => {
    // Use a filter that returns no results
    await page.goto('/bookings?status=expired');
    
    const emptyState = page.getByTestId('bookings-page-empty');
    await expect(emptyState).toBeVisible();
    await expect(emptyState).toContainText('No bookings');
  });
});
```

---

## D) Visual Regression Tests

### Purpose
Ensure DS blocks look identical across all apps.

### Tool
Playwright + Percy or Chromatic

### Test Cases

```typescript
// tests/visual/ds-blocks.spec.ts

import { test, expect } from '@playwright/test';

test.describe('DS Block Visual Regression', () => {
  const apps = ['backoffice', 'minside', 'monitoring'];
  
  for (const app of apps) {
    test(`PageHeader looks consistent in ${app}`, async ({ page }) => {
      await page.goto(`http://localhost:3000/${app}/dashboard`);
      
      const header = page.getByTestId('page-header');
      await expect(header).toHaveScreenshot(`page-header-${app}.png`);
    });

    test(`DataTable looks consistent in ${app}`, async ({ page }) => {
      await page.goto(`http://localhost:3000/${app}/bookings`);
      
      const table = page.getByTestId('bookings-table');
      await expect(table).toHaveScreenshot(`data-table-${app}.png`);
    });

    test(`EmptyState looks consistent in ${app}`, async ({ page }) => {
      await page.goto(`http://localhost:3000/${app}/bookings?status=none`);
      
      const empty = page.getByTestId('bookings-page-empty');
      await expect(empty).toHaveScreenshot(`empty-state-${app}.png`);
    });
  }
});
```

---

## E) Accessibility Tests

### Requirements
- All pages must pass axe-core audit
- No WCAG AA violations
- Keyboard navigable

### Example

```typescript
// tests/a11y/backoffice.spec.ts

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility', () => {
  test('bookings page has no accessibility violations', async ({ page }) => {
    await page.goto('/bookings');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('booking detail page has no accessibility violations', async ({ page }) => {
    await page.goto('/bookings/test-booking-id');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
```

---

## F) Test Coverage Goals

| Layer | Target Coverage | Current | Status |
|-------|-----------------|---------|--------|
| DS Primitives | 90% | TBD | - |
| DS Composed | 85% | TBD | - |
| DS Blocks | 80% | TBD | - |
| DS Shells | 80% | TBD | - |
| App Wrappers | 70% | TBD | - |
| E2E Critical Paths | 100% | TBD | - |

---

## G) CI Pipeline Integration

```yaml
# .github/workflows/test.yml

name: Test Suite

on: [push, pull_request]

jobs:
  unit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - run: pnpm install
      - run: pnpm -F @xala/ds test
      - run: pnpm -F @xala/ds test:coverage
      
  integration:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - run: pnpm install
      - run: pnpm -F @xala/backoffice test
      - run: pnpm -F @xala/minside test
      
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - run: pnpm install
      - run: pnpm -F @xala/ds build
      - run: pnpm dev &
      - run: npx playwright install
      - run: pnpm test:e2e
      
  a11y:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - run: pnpm install
      - run: pnpm dev &
      - run: pnpm test:a11y
```

---

*This test matrix ensures the DS-first architecture is properly validated at every layer.*
