# Testing Rules Template

> **Purpose:** Define testing requirements for AI
> **Usage:** Copy to `/ai/TESTING_RULES.md` and customize

---

## Testing Stack

| Type | Tool | Location |
|------|------|----------|
| Unit | [Vitest/Jest] | `*.test.ts` |
| Component | [Testing Library] | `*.test.tsx` |
| E2E | [Playwright/Cypress] | `e2e/` |
| Visual | Storybook | `stories/` |

---

## Golden Journeys

Must have E2E tests:

| Journey | Status |
|---------|--------|
| [Critical Flow 1] | Required |
| [Critical Flow 2] | Required |
| [Critical Flow 3] | Required |
| User authentication | Required |
| Main CRUD operations | Required |

---

## Test ID Requirements

### All Interactive Elements

```typescript
// ✅ Required
<Button data-testid="submit-form">Submit</Button>
<Input data-testid="email-input" />

// ❌ Missing
<Button>Submit</Button>
```

### Naming Convention

```
{component}-{purpose}

submit-form
email-input
user-menu
confirm-dialog
```

---

## Unit Test Pattern

```typescript
import { render, screen } from '@testing-library/react';
import { createWrapper } from '[test-utils]';

describe('Component', () => {
  it('displays expected content', () => {
    render(<Component prop="value" />, { wrapper: createWrapper() });
    expect(screen.getByText('Expected')).toBeInTheDocument();
  });

  it('handles user interaction', async () => {
    const onClick = vi.fn();
    render(<Component onClick={onClick} />, { wrapper: createWrapper() });
    await userEvent.click(screen.getByTestId('button'));
    expect(onClick).toHaveBeenCalled();
  });
});
```

---

## E2E Test Pattern

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature', () => {
  test('user can complete flow', async ({ page }) => {
    await page.goto('/path');
    await page.click('[data-testid="action-button"]');
    await expect(page.locator('[data-testid="result"]')).toBeVisible();
  });
});
```

---

## Determinism Requirements

### No Flaky Tests

```typescript
// ❌ FLAKY
await page.waitForTimeout(1000);

// ✅ DETERMINISTIC
await expect(element).toBeVisible({ timeout: 5000 });
```

### Isolated Tests

```typescript
// ❌ DEPENDENT
test('edit entity', () => {
  // Assumes entity from previous test
});

// ✅ ISOLATED
test('edit entity', () => {
  const entity = await createTestEntity();
  // Test edit
});
```

---

## Coverage Requirements

| Metric | Target |
|--------|--------|
| Statements | [X]% |
| Branches | [X]% |
| Functions | [X]% |
| Lines | [X]% |

---

## CI Requirements

Every PR must pass:
- [ ] TypeScript compilation
- [ ] Linting
- [ ] Unit tests
- [ ] E2E tests
- [ ] Storybook build
- [ ] All apps build

---

## Test Data

### Fixtures

```typescript
export const mockEntity: EntityDTO = {
  id: 'entity-001',
  // ... fields
};
```

### Factories

```typescript
export function createMockEntity(overrides?: Partial<EntityDTO>) {
  return {
    id: `entity-${Date.now()}`,
    ...defaults,
    ...overrides,
  };
}
```

---

## Commands

```bash
pnpm test              # Unit tests
pnpm test:e2e          # E2E tests
pnpm test:coverage     # With coverage
```
