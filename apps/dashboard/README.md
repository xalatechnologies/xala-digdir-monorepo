# Minside App

User-facing portal for the Xala / Digilist Platform - A Norwegian municipal booking and resource management system.

## Overview

Minside is the primary user-facing application where citizens can:
- Browse available resources (sports facilities, meeting rooms, equipment)
- Create and manage bookings
- View their booking history
- Manage their profile and preferences
- Communicate with administrators

**Technology Stack:**
- **Frontend:** Vite + React 18 + TypeScript
- **UI:** Designsystemet (via `@xala/ds` facade)
- **Data Fetching:** React Query (via `@digilist/client-sdk` hooks)
- **Routing:** React Router
- **Authentication:** OAuth 2.0 Authorization Code Flow with HTTP-only cookies

---

## Installation

```bash
# From monorepo root
pnpm install

# Run minside app
cd apps/minside && pnpm dev
```

The app will be available at: **http://localhost:5173**

---

## 🔐 OAuth Authentication

Minside uses **OAuth 2.0 Authorization Code Flow** with **HTTP-only cookies** for secure authentication.

### Supported OAuth Providers

- **IDPorten** - Norwegian government identity provider
- **Microsoft** - Azure AD / Entra ID
- **Vipps** - Norwegian payment and identity service

### Security Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  OAuth 2.0 Authorization Code Flow (BCP Compliant)         │
└─────────────────────────────────────────────────────────────┘

1. User clicks "Logg inn" → Redirects to OAuth provider
   ↓
2. User authenticates with IDPorten/Microsoft/Vipps
   ↓
3. OAuth provider redirects back with authorization code:
   https://minside.digilist.no/?code=abc123&state=xyz789
   ↓
4. Frontend sends code to backend via POST /api/auth/callback
   ↓
5. Backend exchanges code for access token (server-to-server)
   ↓
6. Backend creates session and sets HTTP-only cookie:
   Set-Cookie: session_token=<secure-session-id>; HttpOnly; Secure; SameSite=Strict
   ↓
7. All subsequent requests authenticated via cookie (automatic)
```

### Security Benefits

✅ **OAuth 2.0 BCP Compliant** - Follows OAuth 2.0 Security Best Current Practice (RFC 8252)

✅ **Tokens Never Exposed to Frontend** - Authorization codes are single-use and short-lived (10 min)

✅ **HTTP-only Cookies Prevent XSS** - JavaScript cannot access session tokens

✅ **SameSite Cookies Prevent CSRF** - Cookies only sent to same-site requests

✅ **No Token Leakage** - Tokens never appear in:
  - URL query parameters
  - Browser history
  - Server access logs
  - HTTP Referrer headers (e.g., to Mapbox, analytics)
  - Browser extensions
  - Developer console

✅ **Secure Session Management** - Backend-controlled session lifecycle with sliding window renewal

### Authentication Implementation

The authentication flow is handled by the `AuthProvider` component (`src/providers/AuthProvider.tsx`):

```tsx
import { AuthProvider } from './providers/AuthProvider';
import { BrowserRouter } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        {/* Your app routes */}
      </AuthProvider>
    </BrowserRouter>
  );
}
```

### Using Authentication in Components

```tsx
import { useAuth } from '../hooks/useAuth';

function MyComponent() {
  const { user, isLoading, login, logout } = useAuth();

  if (isLoading) return <div>Loading...</div>;

  if (!user) {
    return (
      <div>
        <button onClick={() => login('idporten')}>
          Logg inn med ID-porten
        </button>
        <button onClick={() => login('microsoft')}>
          Logg inn med Microsoft
        </button>
        <button onClick={() => login('vipps')}>
          Logg inn med Vipps
        </button>
      </div>
    );
  }

  return (
    <div>
      <p>Velkommen, {user.name}!</p>
      <p>Email: {user.email}</p>
      <p>Rolle: {user.role}</p>
      <button onClick={logout}>Logg ut</button>
    </div>
  );
}
```

### Authentication Flow Details

#### 1. OAuth Callback Handler

When the OAuth provider redirects back with an authorization code:

```tsx
// AuthProvider.tsx (lines 38-74)
const code = urlParams.get('code');

if (code) {
  // Exchange authorization code for session (backend sets HTTP-only cookie)
  const response = await authService.handleOAuthCallback(code);
  const session: AuthSession = response.data;

  // Store user data in localStorage for quick access (NOT for authentication)
  localStorage.setItem('minside_user', JSON.stringify(userData));
  setUser(userData);

  // Clean URL to remove authorization code (prevent replay attacks)
  window.history.replaceState({}, document.title, window.location.pathname);
}
```

**Important:** The authorization code is immediately removed from the URL to prevent replay attacks. The session is managed entirely by the HTTP-only cookie set by the backend.

#### 2. Session Validation

On app load, the `AuthProvider` checks for an existing session:

```tsx
// AuthProvider.tsx (lines 76-110)
// authService.getSession() automatically sends the session cookie
const response = await authService.getSession();
const session: AuthSession = response.data;

// Store user data in localStorage (not for authentication)
localStorage.setItem('minside_user', JSON.stringify(userData));
setUser(userData);
```

**Important:** `authService.getSession()` automatically sends the HTTP-only session cookie with the request. No manual token handling is required.

#### 3. Login Flow

```tsx
// AuthProvider.tsx (lines 118-138)
const login = async (provider: 'idporten' | 'microsoft' | 'vipps') => {
  const callbackUrl = window.location.origin + '/';
  const response = await authService.initiateOAuth(provider, callbackUrl);
  // Redirect to OAuth provider's authorization page
  window.location.href = response.data.redirectUrl;
};
```

#### 4. Logout Flow

```tsx
// AuthProvider.tsx (lines 140-153)
const logout = async () => {
  // Call SDK logout to clear HTTP-only session cookie (backend)
  await authService.logout();

  // Clear user data from local storage
  // Note: Authentication tokens are managed by HTTP-only cookies
  localStorage.removeItem('minside_user');
  setUser(null);
  navigate('/login');
};
```

**Important:** `authService.logout()` makes a POST request to the backend, which invalidates the session and clears the HTTP-only cookie. Only non-sensitive user data (name, email, role) is stored in localStorage for UI convenience.

---

## 🛡️ Security Features

### What's Stored Where

| Data Type | Storage Location | Purpose | Accessible to JS? |
|-----------|-----------------|---------|-------------------|
| **Session Token** | HTTP-only Cookie | Authentication | ❌ No (XSS protection) |
| **User ID** | localStorage | UI display | ✅ Yes (non-sensitive) |
| **User Name** | localStorage | UI display | ✅ Yes (non-sensitive) |
| **User Email** | localStorage | UI display | ✅ Yes (non-sensitive) |
| **User Role** | localStorage | UI display | ✅ Yes (non-sensitive) |

### Cookie Configuration

The backend sets the following cookie attributes for maximum security:

```http
Set-Cookie: session_token=<secure-session-id>;
  HttpOnly;           // Prevents JavaScript access (XSS protection)
  Secure;             // Only sent over HTTPS
  SameSite=Strict;    // Only sent to same-site requests (CSRF protection)
  Path=/;             // Available to entire app
  Max-Age=86400       // 24 hours (configurable)
```

### Session Lifecycle

- **Default Session Duration:** 24 hours
- **Sliding Window Renewal:** Session extends on activity
- **Maximum Session Duration:** 7 days (configurable)
- **Idle Timeout:** Configurable per tenant
- **Automatic Expiration:** Backend invalidates expired sessions

---

## 🚀 Development

### Environment Variables

Create a `.env` file in `apps/minside/`:

```bash
# API Configuration
VITE_API_BASE_URL=https://api.digilist.no
VITE_TENANT_ID=your-tenant-id

# Authentication Mode
VITE_USE_MOCK_AUTH=false  # Set to 'true' for mock auth (dev only)

# OAuth Configuration (managed by backend)
# These are configured in the backend API
```

### Mock Authentication (Development Only)

For local development without backend OAuth setup, you can use mock authentication:

```bash
# .env
VITE_USE_MOCK_AUTH=true
```

This bypasses OAuth and uses predefined mock users:

- **Admin User:** `admin@skien.kommune.no` (Role: admin)
- **Regular User:** `ola.hansen@kommune.no` (Role: saksbehandler)

**⚠️ Warning:** Never use mock auth in production!

### Available Scripts

```bash
# Development server (port 5173)
pnpm dev

# Production build
pnpm build

# Preview production build
pnpm preview

# Linting (includes design system guardrails)
pnpm lint

# Type checking
pnpm type-check

# Run tests
pnpm test

# Run tests with UI
pnpm test:ui

# E2E tests (Playwright)
pnpm test:e2e
```

---

## 📂 Project Structure

```
apps/minside/
├── src/
│   ├── features/           # Feature-based organization
│   │   ├── listing-details/
│   │   ├── bookings/
│   │   └── profile/
│   ├── providers/          # React context providers
│   │   ├── AuthProvider.tsx      # OAuth authentication
│   │   └── RealtimeProvider.tsx  # WebSocket events
│   ├── routes/             # Route definitions
│   ├── hooks/              # Custom React hooks
│   │   └── useAuth.ts            # Auth hook
│   ├── components/         # Shared components (use @xala/ds)
│   ├── utils/              # Utility functions
│   └── main.tsx            # App entry point
├── public/                 # Static assets
├── .env                    # Environment variables
├── vite.config.ts          # Vite configuration
├── tsconfig.json           # TypeScript configuration
└── README.md               # This file
```

---

## 🎨 Design System Integration

Minside uses the `@xala/ds` package for all UI components.

### Critical Rules

❌ **NEVER** import from `@digdir/designsystemet-react` directly

✅ **ALWAYS** import from `@xala/ds`

```tsx
// ❌ WRONG
import { Button } from '@digdir/designsystemet-react';

// ✅ CORRECT
import { Button } from '@xala/ds';
```

### Styles Import

Import `@xala/ds/styles` exactly **once** in `main.tsx`:

```tsx
// main.tsx
import '@xala/ds/styles';
import { DesignsystemetProvider } from '@xala/ds';

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <DesignsystemetProvider
    theme="digdir"
    colorScheme="auto"
    size="md"
  >
    <App />
  </DesignsystemetProvider>
);
```

---

## 🔌 SDK Integration

Minside uses `@digilist/client-sdk` for **all API communication**.

### SDK-FIRST RULE

```
❌ NEVER generate direct API calls (fetch, axios, graphql)
✅ ONLY use @digilist/client-sdk
```

### Example: Fetching Listings

```tsx
import { useListings } from '@digilist/client-sdk/hooks';

function ListingsPage() {
  const { data, isLoading, error } = useListings({ status: 'published' });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {data.data.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}
```

### Example: Creating a Booking

```tsx
import { useCreateBooking } from '@digilist/client-sdk/hooks';

function BookingForm({ listingId }: { listingId: string }) {
  const createBooking = useCreateBooking();

  const handleSubmit = async (data: BookingFormData) => {
    try {
      await createBooking.mutateAsync({
        listingId,
        startTime: data.startTime,
        endTime: data.endTime,
        notes: data.notes,
      });
      console.log('Booking created successfully!');
    } catch (error) {
      console.error('Failed to create booking:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
}
```

---

## 🔄 Real-time Updates

Minside uses WebSocket connections for real-time updates (booking changes, notifications, etc.).

```tsx
import { RealtimeProvider } from './providers/RealtimeProvider';

function App() {
  return (
    <RealtimeProvider>
      <AuthProvider>
        {/* Your app */}
      </AuthProvider>
    </RealtimeProvider>
  );
}
```

The `RealtimeProvider` automatically:
- Connects to the WebSocket server
- Handles reconnection on disconnect
- Subscribes to relevant event channels
- Updates React Query cache on events

---

## 🧪 Testing

### Unit Tests

```bash
# Run tests in watch mode
pnpm test

# Run tests once
pnpm test:run

# Generate coverage report
pnpm test:coverage
```

### E2E Tests

```bash
# Run E2E tests
pnpm test:e2e

# Run E2E tests in UI mode
pnpm test:e2e:ui

# Run E2E tests in debug mode
pnpm test:e2e:debug
```

---

## 🚢 Deployment

```bash
# Build for production
pnpm build

# Preview production build locally
pnpm preview

# Deploy to production
pnpm deploy
```

---

## 📚 Related Documentation

- **SDK Documentation:** `packages/client-sdk/README.md`
- **Design System:** `packages/ds/README.md`
- **OAuth Security Analysis:** `.auto-claude/specs/017-remove-oauth-tokens-from-url-query-parameters/SECURITY_ANALYSIS.md`
- **Backend API Requirements:** `.auto-claude/specs/017-remove-oauth-tokens-from-url-query-parameters/BACKEND_REQUIREMENTS.md`
- **Migration Guide:** `.auto-claude/specs/017-remove-oauth-tokens-from-url-query-parameters/MIGRATION_GUIDE.md`

---

## 🔒 Security Best Practices

### Do's ✅

- Use `@digilist/client-sdk` for all API calls
- Use `@xala/ds` for all UI components
- Store only non-sensitive user data in localStorage
- Let HTTP-only cookies handle authentication
- Use `useAuth()` hook for authentication state
- Follow OAuth 2.0 BCP guidelines
- Validate all user input
- Use React Query for data fetching

### Don'ts ❌

- Never bypass the SDK with direct fetch/axios calls
- Never store tokens in localStorage
- Never pass tokens in URL query parameters
- Never import `@digdir/*` packages directly
- Never hardcode colors, spacing, or typography
- Never use inline styles
- Never skip authentication checks
- Never trust client-side data

---

## 🐛 Troubleshooting

### OAuth Callback Error

**Problem:** OAuth redirect fails with error in URL

**Solution:**
1. Check that backend is running and accessible
2. Verify OAuth provider configuration in backend
3. Ensure callback URL matches registered URL
4. Check browser console for detailed error

### Session Not Persisting

**Problem:** User logged out on page refresh

**Solution:**
1. Check that cookies are enabled in browser
2. Verify backend sets HTTP-only cookie correctly
3. Ensure app is running on same domain as API (or CORS configured)
4. Check cookie SameSite attribute matches deployment

### Third-Party Cookie Blocking

**Problem:** Session not working in Safari or Firefox

**Solution:**
1. Ensure app and API are on same domain (use subdomain if needed)
2. Use `SameSite=Lax` instead of `Strict` if needed
3. Check browser privacy settings
4. Consider session storage fallback for dev environment

---

## 📄 License

MIT © Xala Technologies
