# @digilist/testing - Agent Commands

> **Extends:** [Root AGENTS.md](../../AGENTS.md)

## Quick Reference

```bash
pnpm --filter @digilist/testing build
pnpm --filter @digilist/testing test
```

## Key Exports

```tsx
import {
  createMockUser,
  createMockBooking,
  createMockRentalObject,
  renderWithProviders,
  mockSdkHooks,
} from '@digilist/testing';
```

## Thin App Testing Pattern

```tsx
// Test components, not business logic
import { renderWithProviders } from '@digilist/testing';
import { MyComponent } from '@xala/ds';

test('renders correctly', () => {
  renderWithProviders(<MyComponent />);
  // assertions...
});
```

---

**Status:** Active
