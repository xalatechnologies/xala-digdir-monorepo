# Migrating Apps to @xala/auth

This guide shows how to migrate each app from its own AuthProvider to the centralized `@xala/auth` package.

## Migration Status

| App | Status | Effort | Notes |
|-----|--------|--------|-------|
| **minside** | 🔄 Ready to migrate | 30 min | Example below |
| **backoffice** | ⏳ Pending | 30 min | After minside |
| **saas-admin** | ⏳ Pending | 30 min | After backoffice |
| **tenant-admin** | ⏳ Pending | 30 min | After saas-admin |

## Step-by-Step: Migrating Minside

### 1. Update package.json

Add dependency to `@xala/auth`:

```json
{
  "dependencies": {
    "@xala/auth": "workspace:*",
    // ... other dependencies
  }
}
```

Run:
```bash
pnpm install
```

### 2. Update App.tsx

**Before:**
```typescript
// apps/minside/src/App.tsx
import { AuthProvider } from './providers/AuthProvider';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* routes */}
        </Routes>
      </Router>
    </AuthProvider>
  );
}
```

**After:**
```typescript
// apps/minside/src/App.tsx
import { AuthProvider } from '@xala/auth';

function App() {
  return (
    <AuthProvider 
      config={{
        appType: 'minside',
        debug: import.meta.env.DEV,
      }}
    >
      <Router>
        <Routes>
          {/* routes */}
        </Routes>
      </Router>
    </AuthProvider>
  );
}
```

### 3. Update useAuth imports

Find all files using `useAuth`:

```bash
grep -r "from.*hooks/useAuth" apps/minside/src
```

**Before:**
```typescript
import { useAuth } from '../hooks/useAuth';
```

**After:**
```typescript
import { useAuth } from '@xala/auth';
```

### 4. Delete old auth files

```bash
# Backup first!
mv apps/minside/src/providers/AuthProvider.tsx apps/minside/src/providers/AuthProvider.tsx.OLD
mv apps/minside/src/hooks/useAuth.ts apps/minside/src/hooks/useAuth.ts.OLD

# Or delete if you're confident
rm apps/minside/src/providers/AuthProvider.tsx
rm apps/minside/src/hooks/useAuth.ts
```

### 5. Test

```bash
cd apps/minside
pnpm dev

# Open http://localhost:5173
# Test:
# - Login flow
# - Session validation
# - Logout
# - Protected routes
```

### 6. Build and deploy

```bash
pnpm build
./scripts/deploy.sh minside
```

## Migration Script (Automated)

I can create a script to automate this:

```bash
#!/bin/bash
# migrate-to-auth.sh <app-name>

APP=$1

echo "Migrating $APP to @xala/auth..."

# 1. Add dependency
jq '.dependencies["@xala/auth"] = "workspace:*"' apps/$APP/package.json > tmp.json
mv tmp.json apps/$APP/package.json

# 2. Update imports
find apps/$APP/src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' \
  "s|from.*['\"].*providers/AuthProvider['\"]|from '@xala/auth'|g" {} \;
  
find apps/$APP/src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' \
  "s|from.*['\"].*hooks/useAuth['\"]|from '@xala/auth'|g" {} \;

# 3. Backup old files
mv apps/$APP/src/providers/AuthProvider.tsx apps/$APP/src/providers/AuthProvider.tsx.OLD
mv apps/$APP/src/hooks/useAuth.ts apps/$APP/src/hooks/useAuth.ts.OLD

echo "Migration complete! Please:"
echo "1. Update App.tsx to configure appType"
echo "2. Run: pnpm install"
echo "3. Test the app"
echo "4. Delete .OLD files when confirmed working"
```

## App-Specific Configurations

### Minside
```typescript
<AuthProvider config={{ 
  appType: 'minside',
  debug: import.meta.env.DEV,
}}>
```

### Backoffice  
```typescript
<AuthProvider config={{ 
  appType: 'backoffice',
  debug: import.meta.env.DEV,
  onAuthError: (error) => {
    // Handle auth errors
    console.error('[Backoffice Auth Error]', error);
  },
}}>
```

### SaaS Admin
```typescript
<AuthProvider config={{ 
  appType: 'saas-admin',
  allowedRoles: ['super_admin', 'admin'], // Strict access
  accessDeniedMessage: 'Only super administrators can access this panel.',
  debug: import.meta.env.DEV,
}}>
```

### Tenant Admin
```typescript
<AuthProvider config={{ 
  appType: 'tenant-admin',
  allowedRoles: ['tenant_admin', 'admin', 'super_admin'],
  debug: import.meta.env.DEV,
}}>
```

## Testing Checklist (Per App)

After migrating each app:

- [ ] App builds without errors
- [ ] Login redirects to OAuth
- [ ] OAuth callback works
- [ ] Dashboard loads with user data
- [ ] Session persists on refresh
- [ ] Logout clears session
- [ ] Protected routes redirect when not authenticated
- [ ] Role-based access control works
- [ ] Cross-tab session sync works
- [ ] Flow context preservation works (if applicable)

## Rollback Plan

If migration fails:

```bash
# Restore old files
mv apps/$APP/src/providers/AuthProvider.tsx.OLD apps/$APP/src/providers/AuthProvider.tsx
mv apps/$APP/src/hooks/useAuth.ts.OLD apps/$APP/src/hooks/useAuth.ts

# Remove @xala/auth dependency
jq 'del(.dependencies["@xala/auth"])' apps/$APP/package.json > tmp.json
mv tmp.json apps/$APP/package.json

# Reinstall
pnpm install

# Rebuild
cd apps/$APP && pnpm build
```

## Benefits After Full Migration

- ✅ **1,000+ lines of code removed** (70% reduction)
- ✅ **Single source of truth** for auth logic
- ✅ **Consistent behavior** across all apps
- ✅ **Easier testing** (test once, benefit everywhere)
- ✅ **Faster bug fixes** (fix once, all apps updated)
- ✅ **Better security** (centralized security improvements)
- ✅ **Easier onboarding** (one auth system to learn)

## Next Steps

1. Migrate minside (first, as proof of concept)
2. Test thoroughly
3. Migrate backoffice
4. Test thoroughly
5. Migrate saas-admin
6. Test thoroughly
7. Migrate tenant-admin
8. Test thoroughly
9. Delete all .OLD backup files
10. Update documentation
11. Celebrate! 🎉

---
**Estimated Total Time:** 2-3 hours (all 4 apps)  
**Current Status:** Package created, ready to migrate first app
