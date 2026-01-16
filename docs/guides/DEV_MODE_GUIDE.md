# 🔧 Development Mode Guide

## Overview

Development Mode allows you to **bypass authentication** during local development for faster iteration. This eliminates the need to repeatedly log in while working on UI/UX fixes.

## Security Guarantees

**Dev mode is STRICTLY development-only** with triple safeguards:

1. ✅ Must be running Vite dev server (`npm run dev`)
2. ✅ Must NOT be a production build (`vite build`)  
3. ✅ Must be in `development` MODE
4. ✅ Requires explicit opt-in via `VITE_ENABLE_DEV_MODE=true`

**In production builds, dev mode is IMPOSSIBLE to activate.**

---

## How It Works

When dev mode is enabled:
- **Auto-Login**: Automatically logs you in as "Developer User" with`super_admin` role
- **Full Access**: Grants access to all features in all apps
- **No API Calls**: Skips session validation API calls
- **Instant Access**: No login screen, directly to dashboard

---

## Setup Instructions

### 1. Enable Dev Mode

Create or edit `.env.development.local` in each app:

```bash
# apps/backoffice/.env.development.local
VITE_ENABLE_DEV_MODE=true
VITE_API_URL=http://localhost:4000
VITE_TENANT_ID=f47ac10b-58cc-4372-a567-0e02b2c3d479
```

### 2. Start Development Server

```bash
cd apps/backoffice
npm run dev
```

### 3. Verify Dev Mode

You should see console logs:
```
[XALA/AUTH:BACKOFFICE] 🔧 DEV MODE ACTIVE - Auto-logging in with developer user
[XALA/AUTH:BACKOFFICE] ⚠️  This would NEVER run in production builds
[XALA/AUTH:BACKOFFICE] ✅ DEV MODE - Logged in as: Developer User (role: super_admin)
```

---

## Mock Developer User

When dev mode is active, you're logged in as:

```typescript
{
  id: 'dev-user-00000000-0000-0000-0000-000000000000',
  name: 'Developer User',
  email: 'dev@localhost',
  role: 'super_admin',
  grantedRoles: ['super_admin', 'admin', 'case_handler'],
  tenantId: '<configured in .env>'
}
```

---

## Per-App Configuration

### Backoffice
```bash
# apps/backoffice/.env.development.local
VITE_ENABLE_DEV_MODE=true
VITE_API_URL=http://localhost:4000
VITE_TENANT_ID=f47ac10b-58cc-4372-a567-0e02b2c3d479
```

### Web
```bash
# apps/web/.env.development.local
VITE_ENABLE_DEV_MODE=true
VITE_API_URL=http://localhost:4000
```

### Minside
```bash
# apps/minside/.env.development.local
VITE_ENABLE_DEV_MODE=true
VITE_API_URL=http://localhost:4000
VITE_TENANT_ID=f47ac10b-58cc-4372-a567-0e02b2c3d479
```

### SaaS Admin
```bash
# apps/saas-admin/.env.development.local
VITE_ENABLE_DEV_MODE=true
VITE_API_URL=http://localhost:4000
```

### Tenant Admin
```bash
# apps/tenant-admin/.env.development.local
VITE_ENABLE_DEV_MODE=true
VITE_API_URL=http://localhost:4000
VITE_TENANT_ID=f47ac10b-58cc-4372-a567-0e02b2c3d479
```

---

## Production Safety

### What Prevents Dev Mode in Production?

**Code-Level Checks:**
```typescript
const isDevMode = 
  env?.DEV === true &&              // Only true with Vite dev server
  env?.PROD !== true &&             // Never true in production builds
  env?.MODE === 'development' &&    // Explicit development mode
  env?.VITE_ENABLE_DEV_MODE === 'true'; // Explicit opt-in
```

**Build-Time Replacement:**
- When you run `vite build`, all `import.meta.env.DEV` become `false`
- `import.meta.env.PROD` becomes `true`
- `import.meta.env.MODE` becomes `'production'`
- The entire if block is dead code and removed by tree-shaking

**Result:** Dev mode code doesn't even exist in production bundles.

---

## Testing Production Behavior

### Test 1: Production Build Locally

```bash
cd apps/backoffice
npm run build
npm run preview
```

**Expected:** Normal login screen, dev mode disabled

### Test 2: Check Production Environment

```bash
# Visit https://backoffice-test.digilist.no
# Open browser console
```

**Expected:** NO dev mode logs, normal auth flow

### Test 3: Try Force-Enabling (Should Fail)

```bash
# In production .env.production
VITE_ENABLE_DEV_MODE=true  # This has NO effect

npm run build
```

**Expected:** Dev mode still disabled (other conditions fail)

---

## When to Use Dev Mode

### ✅ Good Use Cases
- **UI/UX Development** - Fixing component styling
- **Feature Development** - Building new features quickly
- **Bug Reproduction** - Testing specific user states
- **Integration Testing** - Testing flows without auth overhead

### ❌ Don't Use For
- **Auth Testing** - Need real auth to test login flows
- **Role Testing** - Always uses super_admin, can't test other roles
- **OAuth Integration** - Bypasses OAuth entirely
- **Session Management** - Skips all session logic

---

## Disabling Dev Mode

### Option 1: Remove Environment Variable
```bash
# Comment out or delete in .env.development.local
# VITE_ENABLE_DEV_MODE=true
```

### Option 2: Set to False
```bash
# .env.development.local
VITE_ENABLE_DEV_MODE=false
```

### Option 3: Delete .env File
```bash
rm apps/backoffice/.env.development.local
```

**Restart dev server after changes.**

---

## Troubleshooting

### Dev Mode Not Working

**Check 1:** Verify environment variable
```bash
# In browser console
console.log(import.meta.env.VITE_ENABLE_DEV_MODE)
// Should output: "true"
```

**Check 2:** Verify development mode
```bash
console.log(import.meta.env.DEV)
// Should output: true

console.log(import.meta.env.MODE)
// Should output: "development"
```

**Check 3:** Check auth logs
```bash
# Should see in console:
[XALA/AUTH:BACKOFFICE] 🔧 DEV MODE ACTIVE
```

### Still Seeing Login Screen

**Possible causes:**
1. `.env.development.local` not loaded (wrong location)
2. Dev server not restarted after env change
3. Using production build (`npm run build`) instead of dev (`npm run dev`)
4. Variable name typo

**Solution:** Restart dev server, verify `.env` location

---

## FAQ

### Q: Will dev mode work in staging/test environments?
**A:** No. Those use production builds where `env.DEV` is false.

### Q: Can I use a different role in dev mode?
**A:** Currently fixed to `super_admin`. To test other roles, disable dev mode and use demo tokens.

### Q: Does dev mode skip API calls?
**A:** Only auth-related calls. Data fetching still works normally.

### Q: Is dev mode secure?
**A:** Yes - it's impossible to enable in production builds due to tree-shaking and environment checks.

---

## Best Practices

1. **Use `.env.development.local`** - Not committed to git, personal settings
2. **Keep `.env.development`** - Committed defaults, no sensitive data
3. **Document in README** - Team members know dev mode exists
4. **Disable for Auth Work** - When testing login/OAuth, turn it off
5. **Check Prod Regularly** - Verify production auth still works

---

## Implementation Details

**File:** `packages/auth/src/providers/AuthProvider.tsx`

**Logic:**
```typescript
if (isDevMode) {
  // Skip all auth checks
  // Set mock user
  // Return early
}

// Normal auth flow continues...
```

**Benefits:**
- Zero code changes needed in apps
- Centralized in `@xala/auth` package 
- Automatic across all apps
- Safe by design (multiple guards)

---

**Last Updated:** January 16, 2026  
**Version:** 1.0.0
