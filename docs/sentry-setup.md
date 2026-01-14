# Sentry Error Tracking Setup

This document describes how to configure Sentry error tracking for the Xala/Digilist platform applications.

## Overview

Sentry is integrated across all three frontend applications:
- **web** (port 5173) - Public-facing application
- **backoffice** (port 5174) - Admin portal
- **minside** (port 5175) - User dashboard

Each application independently reports errors to Sentry with tenant and user context for multi-tenant debugging.

## Architecture

### Error Capturing

The platform uses two complementary error capture mechanisms:

1. **ErrorBoundary** (`@xala/ds`) - Catches React component errors during rendering, lifecycle methods, and constructors
2. **GlobalErrorHandler** (`@xala/ds`) - Catches unhandled window errors and promise rejections

### Source Maps

Production builds automatically upload source maps to Sentry via `@sentry/vite-plugin`, enabling readable stack traces from minified production code.

## Environment Variables

### Runtime Configuration (Frontend Apps)

These variables are embedded into the frontend bundles at build time via Vite's `import.meta.env`:

#### `VITE_SENTRY_DSN`

**Required for error tracking**

The Data Source Name that identifies your Sentry project. Errors will only be reported if this is configured.

**How to get:**
1. Log in to [Sentry.io](https://sentry.io)
2. Navigate to **Settings → Projects → [Your Project] → Client Keys (DSN)**
3. Copy the DSN URL

**Format:** `https://<key>@<org>.ingest.sentry.io/<project-id>`

**Example:**
```bash
VITE_SENTRY_DSN=https://abc123def456@o123456.ingest.sentry.io/7890123
```

#### `VITE_SENTRY_ENVIRONMENT`

**Optional** (defaults to `development`)

Identifies the environment where the application is running. Used for filtering errors in Sentry dashboard.

**Common values:**
- `development` - Local development
- `staging` - Staging/testing environment
- `production` - Production environment

**Example:**
```bash
VITE_SENTRY_ENVIRONMENT=production
```

#### `VITE_SENTRY_RELEASE`

**Optional** (recommended for production)

Identifies the specific version/commit of your code. Enables release tracking and helps correlate errors with deployments.

**Recommended format:** `<app-name>@<version>` or `<app-name>@<commit-sha>`

**Examples:**
```bash
# Version-based
VITE_SENTRY_RELEASE=web@1.2.3

# Git commit-based
VITE_SENTRY_RELEASE=web@a1b2c3d4

# Automated in CI/CD
VITE_SENTRY_RELEASE=web@${CI_COMMIT_SHA}
```

#### `VITE_SENTRY_SEND_IN_DEV`

**Optional** (defaults to `false`)

By default, Sentry is initialized in development but errors are only logged to console, not sent to Sentry. Set this to `true` to actually send errors during development.

**Example:**
```bash
VITE_SENTRY_SEND_IN_DEV=true
```

### Build-Time Configuration (Source Maps Upload)

These variables are used by `@sentry/vite-plugin` during production builds to upload source maps. They should **never** be committed to version control.

#### `SENTRY_ORG`

**Required for source map upload**

Your Sentry organization slug (the identifier in your Sentry URL).

**How to get:** Check your Sentry URL - `https://sentry.io/organizations/<YOUR-ORG>/`

**Example:**
```bash
SENTRY_ORG=digilist-platform
```

#### `SENTRY_PROJECT`

**Required for source map upload**

The Sentry project name for the specific application.

**How to get:** Navigate to **Settings → Projects** in Sentry and copy the project slug

**Example:**
```bash
# For web app
SENTRY_PROJECT=xala-web

# For backoffice app
SENTRY_PROJECT=xala-backoffice

# For minside app
SENTRY_PROJECT=xala-minside
```

#### `SENTRY_AUTH_TOKEN`

**Required for source map upload**

Authentication token with permissions to upload source maps to your Sentry organization.

**How to get:**
1. Go to **Settings → Account → API → Auth Tokens**
2. Click **Create New Token**
3. Name it (e.g., "CI/CD Source Maps Upload")
4. Grant scope: `project:releases` (required for source map upload)
5. Copy the token immediately (shown only once)

**Security:** This token grants write access - keep it secret!

**Example:**
```bash
SENTRY_AUTH_TOKEN=sntrys_abc123def456xyz789
```

## Configuration Files

### Per-Application .env Files

Each app should have its own `.env` file (gitignored) with runtime configuration:

**apps/web/.env**
```bash
# Mapbox Configuration
VITE_MAPBOX_TOKEN=pk.your_mapbox_token_here

# API Configuration
VITE_TENANT_ID=f47ac10b-58cc-4372-a567-0e02b2c3d479

# Sentry Configuration
VITE_SENTRY_DSN=https://abc123@o123456.ingest.sentry.io/7890123
VITE_SENTRY_ENVIRONMENT=development
VITE_SENTRY_RELEASE=web@1.0.0
```

**apps/backoffice/.env**
```bash
# Mapbox Configuration
VITE_MAPBOX_TOKEN=pk.your_mapbox_token_here

# API Configuration
VITE_TENANT_ID=f47ac10b-58cc-4372-a567-0e02b2c3d479

# Sentry Configuration
VITE_SENTRY_DSN=https://abc123@o123456.ingest.sentry.io/7890124
VITE_SENTRY_ENVIRONMENT=development
VITE_SENTRY_RELEASE=backoffice@1.0.0
```

**apps/minside/.env**
```bash
# Mapbox Configuration
VITE_MAPBOX_TOKEN=pk.your_mapbox_token_here

# API Configuration
VITE_TENANT_ID=f47ac10b-58cc-4372-a567-0e02b2c3d479

# Sentry Configuration
VITE_SENTRY_DSN=https://abc123@o123456.ingest.sentry.io/7890125
VITE_SENTRY_ENVIRONMENT=development
VITE_SENTRY_RELEASE=minside@1.0.0
```

### Root .env for Build Tools

For CI/CD or local production builds, create a `.env` file at the monorepo root with build-time variables:

**/.env** (or CI/CD environment variables)
```bash
# Sentry Organization & Auth
SENTRY_ORG=digilist-platform
SENTRY_AUTH_TOKEN=sntrys_abc123def456xyz789

# Project-specific (set per build)
SENTRY_PROJECT=xala-web
```

## Local Development Setup

### Quick Start (Development Mode)

1. Copy `.env.example` to `.env` in each app directory:
```bash
cp apps/web/.env.example apps/web/.env
cp apps/backoffice/.env.example apps/backoffice/.env
cp apps/minside/.env.example apps/minside/.env
```

2. **Optional:** Add your Sentry DSN to each `.env` file
   - If omitted, Sentry initialization is skipped (logged to console)
   - Errors are still caught by ErrorBoundary and GlobalErrorHandler

3. Start development servers:
```bash
pnpm dev
```

### Testing Error Tracking Locally

To verify Sentry integration without sending real errors:

1. Keep `VITE_SENTRY_DSN` empty or remove it
2. Check browser console for Sentry initialization messages
3. Trigger test errors (using browser DevTools console):
```javascript
// Test ErrorBoundary
throw new Error('Test ErrorBoundary');

// Test GlobalErrorHandler - window error
setTimeout(() => { throw new Error('Test global error'); }, 1000);

// Test GlobalErrorHandler - promise rejection
Promise.reject(new Error('Test promise rejection'));
```

4. Verify console shows:
   - `[Sentry] Skipping initialization - no DSN configured` (if DSN empty)
   - `[Sentry] Would send error:` (if DSN configured but not sending in dev)
   - Error caught by ErrorBoundary/GlobalErrorHandler

## Production Deployment

### Environment Variables Setup

#### Frontend Apps (Vercel, Netlify, etc.)

Configure runtime variables in your hosting platform:

```bash
VITE_SENTRY_DSN=https://abc123@o123456.ingest.sentry.io/7890123
VITE_SENTRY_ENVIRONMENT=production
VITE_SENTRY_RELEASE=${VERCEL_GIT_COMMIT_SHA}  # Auto-populated by Vercel
```

#### Build Environment (CI/CD)

Add to GitHub Actions secrets, GitLab CI/CD variables, or similar:

```bash
SENTRY_ORG=digilist-platform
SENTRY_AUTH_TOKEN=sntrys_abc123def456xyz789
```

Set `SENTRY_PROJECT` dynamically per app in your build script:

```bash
# Example: GitHub Actions
- name: Build and upload source maps - Web
  env:
    SENTRY_PROJECT: xala-web
  run: pnpm --filter @xala/web build

- name: Build and upload source maps - Backoffice
  env:
    SENTRY_PROJECT: xala-backoffice
  run: pnpm --filter @xala/backoffice build
```

### Verification

After deployment:

1. Open production app in browser
2. Open DevTools console
3. Verify: `[Sentry] Initialized successfully`
4. Trigger a test error (in staging first!)
5. Check Sentry dashboard for the error report

## Multi-Tenant Context

The platform automatically enriches Sentry error reports with tenant context when available:

### Setting Tenant Context

In your app's authentication/tenant initialization code:

```typescript
import { setTenantContext } from './lib/sentry';

// After tenant is loaded
setTenantContext(tenantId, tenantName);
```

This adds to all subsequent error reports:
- **Context:** `{ tenant: { id: 'uuid', name: 'Kommune Name' } }`
- **Tag:** `tenant_id: 'uuid'` (filterable in Sentry)

### Setting User Context

On user login:

```typescript
import { setUserContext } from './lib/sentry';

// After authentication
setUserContext(user.id, user.email, user.role);
```

On logout:

```typescript
import { clearUserContext } from './lib/sentry';

clearUserContext();
```

## Troubleshooting

### Errors not appearing in Sentry

**Checklist:**
- [ ] `VITE_SENTRY_DSN` is set and valid
- [ ] In production or `VITE_SENTRY_SEND_IN_DEV=true` is set
- [ ] Network allows requests to `*.ingest.sentry.io`
- [ ] Check browser console for Sentry initialization message
- [ ] Verify Sentry project is active (not rate-limited)

### Source maps not uploading

**Checklist:**
- [ ] `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_AUTH_TOKEN` are all set
- [ ] Auth token has `project:releases` scope
- [ ] Build is running with `NODE_ENV=production`
- [ ] Check build logs for `@sentry/vite-plugin` output
- [ ] Verify auth token is not expired

### Stack traces are minified

**Causes:**
- Source maps didn't upload (see above)
- `VITE_SENTRY_RELEASE` doesn't match between runtime and build
- Source maps were uploaded to wrong Sentry project

**Fix:** Ensure release version matches:
```bash
# Runtime (embedded in app)
VITE_SENTRY_RELEASE=web@a1b2c3d4

# Build time (uploading source maps)
VITE_SENTRY_RELEASE=web@a1b2c3d4  # Must match exactly
```

### Too many errors captured

Adjust sample rates in `apps/*/src/lib/sentry.ts`:

```typescript
Sentry.init({
  // ...
  tracesSampleRate: 0.1,  // 10% of transactions
  profilesSampleRate: 0.1, // 10% of profiles
});
```

Or add ignored errors:

```typescript
Sentry.init({
  // ...
  ignoreErrors: [
    'NetworkError',
    'Custom error to ignore',
  ],
});
```

## Best Practices

### Security

- ✅ **DO:** Use environment variables for all Sentry configuration
- ✅ **DO:** Add `.env` files to `.gitignore`
- ✅ **DO:** Rotate `SENTRY_AUTH_TOKEN` periodically
- ✅ **DO:** Use separate Sentry projects per app (web, backoffice, minside)
- ❌ **DON'T:** Commit DSN or auth tokens to version control
- ❌ **DON'T:** Share auth tokens between environments

### Error Reporting

- ✅ **DO:** Set tenant context immediately after tenant is loaded
- ✅ **DO:** Clear user context on logout
- ✅ **DO:** Use semantic release versions (`app@version` or `app@commit`)
- ✅ **DO:** Add breadcrumbs for important user actions
- ❌ **DON'T:** Log sensitive data (passwords, tokens, PII) in error context
- ❌ **DON'T:** Send errors in development (unless debugging Sentry itself)

### Performance

- ✅ **DO:** Use sample rates to reduce data volume in production
- ✅ **DO:** Filter out expected errors (network failures, browser extensions)
- ✅ **DO:** Set appropriate session replay sample rates
- ❌ **DON'T:** Capture 100% of transactions in production (expensive)
- ❌ **DON'T:** Enable session replay without privacy settings (maskAllText, blockAllMedia)

## Reference Links

- [Sentry Documentation](https://docs.sentry.io/)
- [Sentry React SDK](https://docs.sentry.io/platforms/javascript/guides/react/)
- [Sentry Vite Plugin](https://docs.sentry.io/platforms/javascript/sourcemaps/uploading/vite/)
- [Release Health Tracking](https://docs.sentry.io/product/releases/)
- [Source Maps Guide](https://docs.sentry.io/platforms/javascript/sourcemaps/)

## Related Files

- `apps/minside/src/lib/sentry.ts` - Sentry initialization utilities
- `apps/web/src/lib/sentry.ts` - Sentry initialization utilities
- `apps/backoffice/src/lib/sentry.ts` - Sentry initialization utilities
- `packages/ds/src/blocks/ErrorBoundary.tsx` - React error boundary
- `packages/ds/src/blocks/GlobalErrorHandler.tsx` - Global error handler
- `apps/*/vite.config.ts` - Vite plugin configuration
- `apps/*/.env.example` - Environment variable templates
