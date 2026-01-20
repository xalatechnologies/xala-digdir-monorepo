# Storybook Console Suppression - Quick Reference

## TL;DR

✅ **Suppression is ACTIVE** - Keeps your console clean during Storybook development  
✅ **Real errors still show** - Only suppresses known harmless warnings  
✅ **Can be toggled off** - For debugging Storybook itself

---

## What's Being Suppressed?

| Warning | Why? | Harmless? |
|---------|------|-----------|
| `act()` warnings | React 18 detects non-test environment | ✅ Yes - Expected |
| WebSocket errors | Storybook HMR closing connections | ✅ Yes - Expected |

---

## Quick Actions

### See Suppressed Warnings (Debugging)

**Option 1: Browser Console**
```javascript
// Use original console methods
window.__originalConsole.error('This bypasses suppression');
window.__originalConsole.warn('This shows everything');
```

**Option 2: Comment Out Suppression**
```typescript
// In .storybook/preview.tsx, comment out lines 36-49
// console.error = (...args) => { ... };
```

**Option 3: Remove Suppression Entirely**
```bash
# Edit these files:
packages/ds/.storybook/preview.tsx   # Remove lines 17-54
packages/ds/.storybook/manager.ts    # Remove lines 4-35
```

---

## How It Works

```typescript
// Only suppress specific patterns
const suppressPatterns = [
  'Warning: The current testing environment is not configured to support act',
  'WebSocket is already in CLOSING or CLOSED state',
  'WebSocket connection',
  'WebSocket error',
];

// Check before suppressing
const shouldSuppressMessage = (message: unknown): boolean => {
  if (typeof message !== 'string') return false;
  return suppressPatterns.some(pattern => message.includes(pattern));
};
```

**What this means:**
- ✅ Suppresses: "WebSocket is already in CLOSING or CLOSED state"
- ✅ Shows: "TypeError: Cannot read property 'foo' of undefined"
- ✅ Shows: "Failed to fetch"
- ✅ Shows: All your real application errors

---

## When to Care About These Warnings

### ❌ Don't Care (Storybook Development)
- Running `pnpm storybook` → Suppression active
- Viewing component stories → Suppression active
- Testing visual designs → Suppression active

### ✅ DO Care (Testing)
- Running `pnpm test` → Suppression NOT active
- Running `pnpm test:e2e` → Suppression NOT active
- In `*.test.tsx` files → These warnings indicate real issues!

---

## Examples

### Before Suppression (Noise)
```
Console (2,547 warnings):
⚠️ WebSocket is already in CLOSING or CLOSED state.
⚠️ Warning: The current testing environment is not configured to support act(...)
⚠️ WebSocket is already in CLOSING or CLOSED state.
⚠️ Warning: The current testing environment is not configured to support act(...)
⚠️ WebSocket is already in CLOSING or CLOSED state.
... (2,542 more identical warnings)
❌ TypeError: Cannot read 'name' of undefined  ← BURIED!
```

### After Suppression (Clean)
```
Console:
❌ TypeError: Cannot read 'name' of undefined  ← VISIBLE!
```

---

## FAQs

**Q: Is this safe?**  
A: Yes. Only suppresses known Storybook + React 18 architecture noise. Real errors still show.

**Q: Will this hide bugs?**  
A: No. Only suppresses specific patterns that are proven harmless. Everything else shows normally.

**Q: Why not fix the root cause?**  
A: The "root cause" is Storybook's HMR architecture and React 18's test detection. You'd need to fork Storybook to change this.

**Q: What if I want to see everything?**  
A: Use `window.__originalConsole` or comment out the suppression temporarily.

**Q: Does this affect production?**  
A: No. This only runs in Storybook development. Your production apps are unaffected.

---

## Related Files

- `.storybook/preview.tsx` - Preview iframe suppression
- `.storybook/manager.ts` - Manager UI suppression
- `docs/guides/STORYBOOK_REACT18_FIX.md` - Full documentation

---

## Need Help?

- Read: `docs/guides/STORYBOOK_REACT18_FIX.md`
- Check: Storybook console after refreshing
- Debug: Use `window.__originalConsole` methods
- Disable: Comment out suppression temporarily

---

**Last Updated:** 2026-01-20  
**Status:** Active (Option 2: Clean console for development)
