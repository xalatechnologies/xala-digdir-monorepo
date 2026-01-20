# @xala/auth - Authentication Layer

> **Extends:** [Root CLAUDE.md](../../CLAUDE.md)

## Purpose

`@xala/auth` provides the authentication layer for the Xala/Digilist Platform, handling session management, token handling, and BankID/ID-porten integration support.

**Package Name:** `@xala/auth`
**Status:** Production Stable (LOCKED - 2026-01-17)

---

## CRITICAL: Authentication is LOCKED

**DO NOT MODIFY WITHOUT EXPLICIT APPROVAL**

The authentication system was debugged and fixed over 4+ hours on 2026-01-17. It is now **STABLE AND WORKING**. Any changes require approval.

See:
- `docs/architecture/AUTHENTICATION_SYSTEM.md`
- `docs/guides/SIGNICAT_BANKID_AUTHENTICATION.md`
- Root `CLAUDE.md` → Critical Lessons Learned

---

## Key Features

- **Session management** - Token handling, refresh logic
- **BankID integration** - Norwegian national ID verification
- **ID-porten support** - Government authentication
- **Cookie management** - Secure HTTP-only cookies
- **Multi-app SSO** - Cross-subdomain authentication

---

## Integration with Thin App Strategy

Apps should:
1. Use `@digilist/client-sdk/hooks` for authentication hooks
2. Import auth UI components from `@xala/ds` (e.g., `DemoLoginDialog`, `ProtectedRoute`)
3. Never implement auth logic directly in app code

```tsx
// ✅ CORRECT - Use SDK hooks
import { useAuth } from '@digilist/client-sdk/hooks';
import { ProtectedRoute, DemoLoginDialog } from '@xala/ds';

// ❌ WRONG - Direct auth implementation
// Never implement auth logic in apps
```

---

## Development Commands

```bash
# From repository root
pnpm --filter @xala/auth build
pnpm --filter @xala/auth test

# From this directory
pnpm build
pnpm test
```

---

## When in Doubt

1. Check root CLAUDE.md → BankID / Signicat Authentication section
2. Read `docs/guides/SIGNICAT_BANKID_AUTHENTICATION.md`
3. **DO NOT CHANGE** without approval

---

**Last Updated:** 2026-01-17
**Status:** LOCKED - Production Stable
