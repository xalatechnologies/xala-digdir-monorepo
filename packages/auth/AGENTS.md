# @xala/auth - Agent Commands

> **Extends:** [Root AGENTS.md](../../AGENTS.md)

## CRITICAL WARNING

**Authentication is LOCKED - DO NOT MODIFY WITHOUT APPROVAL**

This package was stabilized after a 4-hour debugging session. See root CLAUDE.md for details.

## Quick Reference

```bash
# Build (read-only operations recommended)
pnpm --filter @xala/auth build
pnpm --filter @xala/auth test
```

## Thin App Integration

```tsx
// Apps should use SDK hooks, not this package directly
import { useAuth } from '@digilist/client-sdk/hooks';
import { ProtectedRoute, DemoLoginDialog } from '@xala/ds';
```

## Key Files (DO NOT CHANGE)

- Session management
- Token handling
- Cookie configuration

## Before Making Changes

1. Read root CLAUDE.md → BankID section
2. Read `docs/guides/SIGNICAT_BANKID_AUTHENTICATION.md`
3. Get explicit approval
4. Test thoroughly after any change

---

**Status:** LOCKED - Production Stable
