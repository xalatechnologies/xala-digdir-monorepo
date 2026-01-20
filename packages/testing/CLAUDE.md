# @digilist/testing - Shared Testing Utilities

> **Extends:** [Root CLAUDE.md](../../CLAUDE.md)

## Purpose

`@digilist/testing` provides shared testing utilities, fixtures, mock data, and helpers for unit and integration tests across the monorepo.

**Package Name:** `@digilist/testing`

---

## Key Features

- **Test fixtures** - Reusable mock data for tests
- **Custom matchers** - Jest/Vitest custom matchers
- **Test helpers** - Setup functions, render utilities
- **Mock factories** - Generate test data
- **API mocking** - MSW handlers for API mocking

---

## Directory Structure

```
packages/testing/
├── fixtures/           # Test data fixtures
├── helpers/            # Test helper functions
├── mocks/              # Mock implementations
├── matchers/           # Custom matchers
├── factories/          # Data factories
└── suites/             # Test suite configurations
```

---

## Usage

```tsx
import {
  createMockUser,
  createMockBooking,
  createMockRentalObject,
  renderWithProviders,
} from '@digilist/testing';

// Create mock data
const user = createMockUser({ role: 'admin' });
const booking = createMockBooking({ status: 'confirmed' });

// Render with all providers
const { getByText } = renderWithProviders(<MyComponent />);
```

---

## Thin App Testing

When testing apps following Thin App Strategy:
- Test component rendering only (no business logic)
- Mock SDK hooks
- Use fixtures from this package
- Import test components from @xala/ds

```tsx
import { renderWithProviders } from '@digilist/testing';
import { Button } from '@xala/ds';

test('renders button', () => {
  const { getByRole } = renderWithProviders(<Button>Click</Button>);
  expect(getByRole('button')).toBeInTheDocument();
});
```

---

## Commands

```bash
# From repository root
pnpm --filter @digilist/testing build
pnpm --filter @digilist/testing test
```

---

**Last Updated:** 2026-01-20
**Status:** Active
