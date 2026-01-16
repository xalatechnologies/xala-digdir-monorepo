# @xala/auth

Centralized authentication package for all Xala/Digilist applications.

## Features

- ✅ **HTTP-only cookie-based sessions** (secure, XSS-proof)
- ✅ **Cross-subdomain SSO** (.digilist.no domain)
- ✅ **OAuth 2.0 integration** (ID-porten, Microsoft, Vipps)
- ✅ **Role-based access control** per app type
- ✅ **Flow context preservation** (booking flows, etc.)
- ✅ **Cross-tab session sync**
- ✅ **No mock authentication** (security-first)

## Installation

This package is part of the monorepo. It's automatically available to all apps.

```bash
# Already installed! Just import it:
import { AuthProvider, useAuth } from '@xala/auth';
```

## Usage

### 1. Wrap your app with AuthProvider

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
      <YourApp />
    </AuthProvider>
  );
}
```

### 2. Use authentication in components

```typescript
import { useAuth } from '@xala/auth';

function Dashboard() {
  const { user, logout, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }

  return (
    <div>
      <h1>Welcome, {user.name}!</h1>
      <button onClick={logout}>Log out</button>
    </div>
  );
}
```

### 3. Protect routes

```typescript
import { ProtectedRoute } from '@xala/auth';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}
```

## Configuration

### AppType and Role-Based Access

Each app type has default allowed roles:

| App Type | Allowed Roles |
|----------|---------------|
| `minside` | citizen, admin, super_admin |
| `backoffice` | admin, saksbehandler, super_admin |
| `saas-admin` | super_admin, admin |
| `tenant-admin` | tenant_admin, admin, super_admin |
| `web` | all authenticated users |

### Custom Configuration

```typescript
<AuthProvider 
  config={{
    appType: 'backoffice',
    allowedRoles: ['admin', 'saksbehandler'], // Override defaults
    loginRedirect: '/dashboard',
    unauthorizedRedirect: '/no-access',
    accessDeniedMessage: 'Custom access denied message',
    onAuthError: (error) => console.error(error),
    debug: true, // Enable debug logging
  }}
>
  {children}
</AuthProvider>
```

## API Reference

### AuthProvider Props

```typescript
interface AuthConfig {
  appType: 'minside' | 'backoffice' | 'saas-admin' | 'tenant-admin' | 'web';
  allowedRoles?: UserRole[];
  loginRedirect?: string;
  unauthorizedRedirect?: string;  
  accessDeniedMessage?: string;
  onAuthError?: (error: Error) => void;
  debug?: boolean;
}
```

### useAuth Hook

```typescript
const {
  user,                  // Current user or null
  isAuthenticated,       // Boolean
  isLoading,            // Boolean
  isAdmin,              // Boolean
  isSaksbehandler,      // Boolean
  accessDeniedError,    // String or null
  hasStoredContext,     // Boolean (flow context)
  login,                // (provider) => Promise<void>
  logout,               // () => Promise<void>
  checkRole,            // (role) => boolean
  restoreFlowContext,   // (clearAfterLoad?) => Result
  clearFlowContext,     // () => void
} = useAuth();
```

## Security

### What This Package Prevents

- ✅ **XSS token theft** - Tokens never accessible to JavaScript
- ✅ **Token exposure in URLs** - Only OAuth codes (single-use)
- ✅ **Log contamination** - Tokens never in server logs
- ✅ **CSRF attacks** - SameSite cookie attribute
- ✅ **Mock auth bypass** - Completely removed
- ✅ **Session replay** - Short-lived authorization codes

### How It Works

1. User clicks "Login" → Redirect to OAuth provider
2. OAuth provider authenticates → Returns authorization code in URL
3. Frontend exchanges code for session (set as HTTP-only cookie)
4. All requests automatically include session cookie
5. Backend validates cookie on each request
6. Logout clears cookie on both client and server

## Migration from Old AuthProvider

### Before (in each app)

```typescript
// apps/minside/src/providers/AuthProvider.tsx (446 lines)
// apps/backoffice/src/providers/AuthProvider.tsx (382 lines)
// apps/saas-admin/src/providers/AuthProvider.tsx (~300 lines)
// apps/tenant-admin/src/providers/AuthProvider.tsx (~300 lines)
// Total: ~1,400 lines of duplicated code
```

### After (using @xala/auth)

```typescript
// All apps use the same provider:
import { AuthProvider } from '@xala/auth';

<AuthProvider config={{ appType: 'minside' }}>
  {children}
</AuthProvider>
```

**Result:** 1,400 lines → ~50 lines (96% reduction!)

## Testing

```bash
# Run tests
pnpm --filter=@xala/auth test

# Coverage
pnpm --filter=@xala/auth test:coverage
```

## License

MIT - Part of the Xala/Digilist monorepo
