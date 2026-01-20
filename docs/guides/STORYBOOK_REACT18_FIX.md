# Storybook React 18 Warning Suppression

**Date:** 2026-01-20  
**Status:** ✅ Active (Option 2: Keep suppression for clean development)  
**Component:** `@xala/ds` Storybook Configuration  
**Decision:** Suppress warnings for better developer experience

---

## Problem

When running Storybook with React 18.3.1, the console was flooded with warnings:

### 1. React `act(...)` Warnings

```
Warning: The current testing environment is not configured to support act(...)
```

**Root Cause:** React 18 introduced automatic batching and improved the testing environment detection. Storybook's rendering environment is not configured as a "testing environment", which triggers these warnings when React components update state during rendering.

### 2. WebSocket Warnings

```
WebSocket is already in CLOSING or CLOSED state.
```

**Root Cause:** Storybook's Hot Module Replacement (HMR) system maintains WebSocket connections for live reloading. When navigating between stories quickly, the WebSocket connections may be closed before all messages are sent, causing these warnings.

---

## Solution

### 1. Console Warning Suppression

Updated `.storybook/preview.tsx` to filter out these expected warnings:

```typescript
// Suppress React 18 act() warnings in Storybook
// These are expected in Storybook's non-testing environment
const originalError = console.error;
const originalWarn = console.warn;

console.error = (...args) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Warning: The current testing environment is not configured to support act') ||
     args[0].includes('WebSocket is already in CLOSING or CLOSED state'))
  ) {
    return;
  }
  originalError.call(console, ...args);
};

console.warn = (...args) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Warning: The current testing environment is not configured to support act') ||
     args[0].includes('WebSocket is already in CLOSING or CLOSED state'))
  ) {
    return;
  }
  originalWarn.call(console, ...args);
};
```

### 2. Disable React Strict Mode

Updated `.storybook/main.ts` to disable React Strict Mode:

```typescript
framework: {
  name: '@storybook/react-vite',
  options: {
    strictMode: false, // Disable strict mode to reduce act() warnings
  },
},
```

**Why this works:** React Strict Mode intentionally causes components to render twice in development to help identify side effects. In Storybook, this can trigger additional `act()` warnings. Since Storybook is a development tool (not production), disabling strict mode is safe.

---

## Why These Are Safe to Suppress

### 1. `act()` Warnings

- **In Production:** These warnings don't appear in production builds
- **In Storybook:** Storybook is not a testing environment, it's a development tool for component visualization
- **Not Real Issues:** The warnings indicate React is detecting state updates outside of a test environment, which is expected and correct behavior in Storybook

### 2. WebSocket Warnings

- **Expected Behavior:** Storybook's HMR system manages WebSocket connections automatically
- **Non-Breaking:** These warnings don't affect functionality, just clutter the console
- **Development Only:** Only appear during development with Storybook's dev server

---

## Important Notes

### DO NOT Apply This to Test Files

This suppression is ONLY for Storybook's preview configuration. **DO NOT** suppress `act()` warnings in actual test files:

- ✅ Suppress in `.storybook/preview.tsx`
- ❌ DO NOT suppress in `*.test.tsx` files
- ❌ DO NOT suppress in `vitest.setup.ts`
- ❌ DO NOT suppress in Playwright test files

### When You Should Care About `act()` Warnings

If you see `act()` warnings in:
- Unit tests (Vitest)
- Integration tests
- E2E tests (Playwright)

Then these are **REAL ISSUES** that need to be fixed by wrapping state updates in `act()` or using proper async utilities like `waitFor()`.

---

## Alternative Solutions Considered

### 1. Use `@storybook/test` Package (Not Recommended)

```typescript
import { within, userEvent, waitFor } from '@storybook/test';
```

**Why not:** This adds test utilities to every story, which is overkill for simple component documentation.

### 2. Mock `globalThis.IS_REACT_ACT_ENVIRONMENT` (Not Recommended)

```typescript
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
```

**Why not:** This tricks React into thinking it's in a test environment, which can cause unexpected behavior and hide legitimate issues.

### 3. Upgrade to React 19 (Future)

React 19 improves the `act()` warning system to be smarter about detecting non-test environments. When React 19 is stable, these warnings should reduce naturally.

---

## Verification

After applying this fix:

1. ✅ No more `act()` warnings in Storybook console
2. ✅ No more WebSocket warnings
3. ✅ Components still render correctly
4. ✅ Hot module replacement still works
5. ✅ Theme switching still works
6. ✅ Story interactions still work

---

## References

- [React 18 act() Documentation](https://react.dev/reference/react/act)
- [Storybook React 18 Support](https://storybook.js.org/blog/storybook-for-react-18/)
- [Storybook Issue #20417](https://github.com/storybookjs/storybook/issues/20417)

---

## Related Files

- `packages/ds/.storybook/preview.tsx` - Warning suppression
- `packages/ds/.storybook/main.ts` - Strict mode disabled
- `packages/ds/package.json` - React 18.3.1 + Storybook 8.5.0

---

**Maintained by:** Xala Platform Team  
**Last Updated:** 2026-01-20
