# @xala/config Package

## Purpose

Platform-agnostic configuration package for Xala applications. Provides:

1. **Generic AppProfile Registry** - Runtime registration pattern for app profiles
2. **Environment Validation** - Zod schemas for env var validation
3. **Config Factories** - Functions to create SDK and RuntimeProvider configs

**This package is domain-agnostic.** Domain-specific profiles (like Digilist apps) should be defined in domain packages and registered at runtime.

## Usage

```tsx
// apps/backoffice/src/main.tsx

// Step 1: Import domain runtime to register profiles (side-effect import)
import '@digilist/runtime';

// Step 2: Use generic config API
import { validateEnv, createAppConfig } from '@xala/config';
import { RuntimeProvider } from '@xala/runtime';
import { initializeClient } from '@digilist/client-sdk';

// Validate environment at startup
const env = validateEnv(import.meta.env);

// Get all configuration for this app
const { sdkConfig, runtimeConfig } = createAppConfig('backoffice', env);

// Initialize SDK
initializeClient(sdkConfig);

// Mount app with RuntimeProvider
ReactDOM.createRoot(document.getElementById('root')!).render(
  <RuntimeProvider config={runtimeConfig}>
    <App />
  </RuntimeProvider>
);
```

## Architecture: Domain vs Platform

This package follows a clean separation:

| Layer | Package | Responsibility |
|-------|---------|----------------|
| Platform | `@xala/config` | Generic registry, factories, validation |
| Domain | `@digilist/runtime` | Digilist-specific profiles and types |

```
@xala/config (Platform Layer)
├── Generic Types (AppType, AppProfile, etc.)
├── Registry API (registerAppProfile, getAppProfile)
├── Config Factories (createRuntimeConfig, createSDKConfig)
└── Environment Validation (validateEnv, envSchema)

@digilist/runtime (Domain Layer)
├── DigilistAppType, DigilistThemeId types
├── App Profiles (web, minside, backoffice, etc.)
└── Auto-registration on module load
```

## Key Exports

### Environment Validation

```typescript
import { validateEnv, assertEnv, safeValidateEnv } from '@xala/config';

// Throws on invalid env
const env = validateEnv(import.meta.env);

// Returns errors instead of throwing
const result = safeValidateEnv(import.meta.env);
if (!result.success) {
  console.error(result.errors);
}

// Throws with formatted error message
const env = assertEnv(import.meta.env);
```

### App Profile Registry

```typescript
import {
  registerAppProfile,
  registerAppProfiles,
  getAppProfile,
  getAppTypes,
  getAllAppProfiles,
  hasAppProfile,
  clearAppProfiles,
} from '@xala/config';

// Domain packages register profiles
registerAppProfiles(myDomainProfiles);

// Apps query profiles
const profile = getAppProfile('backoffice');
const types = getAppTypes();
const all = getAllAppProfiles();
```

### Config Factories

```typescript
import { createRuntimeConfig, createSDKConfig, createAppConfig } from '@xala/config';

// Create RuntimeProvider config
const runtimeConfig = createRuntimeConfig('backoffice', env);

// Create SDK config
const sdkConfig = createSDKConfig(env);

// Create both at once
const { sdkConfig, runtimeConfig, profile } = createAppConfig('backoffice', env);
```

## File Structure

```
packages/config/
├── src/
│   ├── index.ts           # Public exports
│   ├── types.ts           # Generic type definitions
│   ├── env-schema.ts      # Zod validation
│   └── app-profiles.ts    # Registry API and factories
├── package.json
├── tsconfig.json
└── CLAUDE.md
```

## Environment Variables

All apps use the same environment variables:

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| VITE_API_URL | Yes | https://api.digilist.no | API base URL |
| VITE_WS_URL | No | - | WebSocket URL |
| VITE_TENANT_ID | Yes | default | Tenant identifier |
| VITE_LICENSE_KEY | Yes | dev-key | SDK license key |
| VITE_SENTRY_DSN | No | - | Sentry error tracking |

## FORBIDDEN Patterns

```typescript
// ❌ NEVER read env vars directly in apps
const apiUrl = import.meta.env.VITE_API_URL;

// ❌ NEVER duplicate config objects in main.tsx
const config = {
  apiUrl: import.meta.env.VITE_API_URL || 'https://api.digilist.no',
  tenantId: import.meta.env.VITE_TENANT_ID || 'default',
  // ... repeated in every app
};

// ❌ NEVER import @digilist/* from @xala/config
import { initializeClient } from '@digilist/client-sdk'; // ❌ Domain coupling!

// ✅ ALWAYS use @xala/config for validation and factories
import { validateEnv, createAppConfig } from '@xala/config';
const env = validateEnv(import.meta.env);
const { sdkConfig, runtimeConfig } = createAppConfig('backoffice', env);
```

## Creating a New Domain Runtime

If you're creating a new domain (not Digilist), follow this pattern:

```typescript
// packages/my-domain-runtime/src/config/profiles.ts
import type { AppProfile } from '@xala/config';

export const myAppProfile: AppProfile = {
  appType: 'my-app',
  displayName: 'My App',
  description: 'My domain application',
  defaultPort: 3000,
  locale: 'nb',
  theme: 'default',
  colorScheme: 'auto',
  authConfig: {
    loginPath: '/login',
    debug: false,
    sessionCheckInterval: 60000,
    requireAuth: true,
  },
  featureFlags: {},
};

export const myDomainProfiles = [myAppProfile];

// packages/my-domain-runtime/src/config/index.ts
import { registerAppProfiles } from '@xala/config';
import { myDomainProfiles } from './profiles';

// Auto-register on import
registerAppProfiles(myDomainProfiles);

export { myDomainProfiles };

// packages/my-domain-runtime/src/index.ts
import './config'; // Side-effect: registers profiles
export * from './config';
```

## When in Doubt

1. Need app-specific settings? -> Domain package defines profiles, use getAppProfile()
2. Need env validation? -> Use validateEnv()
3. Need SDK config? -> Use createSDKConfig()
4. Need RuntimeProvider config? -> Use createRuntimeConfig()
5. Need both? -> Use createAppConfig()
6. Profile not found? -> Import domain runtime package first (e.g., `import '@digilist/runtime'`)

---

**Last Updated:** 2026-01-21
**Status:** Refactored - Domain-agnostic
