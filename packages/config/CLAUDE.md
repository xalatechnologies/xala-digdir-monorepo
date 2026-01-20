# @xala/config Package

## Purpose

Centralized configuration package for Xala/Digilist applications. Eliminates configuration duplication across apps by providing:

1. **AppProfile definitions** - Static configuration for each app type
2. **Environment validation** - Zod schemas for env var validation
3. **Config factories** - Functions to create SDK and RuntimeProvider configs

## Usage

```tsx
// apps/backoffice/src/main.tsx
import { validateEnv, createAppConfig } from '@xala/config';
import { RuntimeProvider } from '@xala/runtime';
import { initializeClient } from '@digilist/client-sdk';

// 1. Validate environment at startup
const env = validateEnv(import.meta.env);

// 2. Get all configuration for this app
const { sdkConfig, runtimeConfig } = createAppConfig('backoffice', env);

// 3. Initialize SDK
initializeClient(sdkConfig);

// 4. Mount app with RuntimeProvider
ReactDOM.createRoot(document.getElementById('root')!).render(
  <RuntimeProvider config={runtimeConfig}>
    <App />
  </RuntimeProvider>
);
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

### App Profiles

```typescript
import { getAppProfile, getAppTypes, getAllAppProfiles } from '@xala/config';

// Get single profile
const profile = getAppProfile('backoffice');
console.log(profile.defaultPort); // 5175

// Get all app types
const types = getAppTypes();
// ['web', 'minside', 'backoffice', 'saas-admin', 'monitoring', 'docs-learning']

// Get all profiles
const profiles = getAllAppProfiles();
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
│   ├── types.ts           # Type definitions
│   ├── env-schema.ts      # Zod validation
│   └── app-profiles.ts    # App profile definitions
├── package.json
├── tsconfig.json
└── CLAUDE.md
```

## App Profiles

| App | Port | Requires Auth | Color Scheme |
|-----|------|---------------|--------------|
| web | 5173 | No | auto |
| minside | 5174 | Yes | auto |
| backoffice | 5175 | Yes | auto |
| saas-admin | 5177 | Yes | auto |
| monitoring | 5178 | Yes | dark |
| docs-learning | 5179 | No | auto |

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

// ✅ ALWAYS use @xala/config
import { validateEnv, createAppConfig } from '@xala/config';
const env = validateEnv(import.meta.env);
const { sdkConfig, runtimeConfig } = createAppConfig('backoffice', env);
```

## Migration Guide

Before (6 apps with duplicate config):
```typescript
// Each app had ~20 lines of duplicate config
initializeClient({
  baseUrl: import.meta.env.VITE_API_URL || 'https://api.digilist.no',
  tenantId: import.meta.env.VITE_TENANT_ID || 'default',
  licenseKey: import.meta.env.VITE_LICENSE_KEY || 'dev-key',
});

<RuntimeProvider config={{
  appType: 'backoffice',
  apiUrl: import.meta.env.VITE_API_URL || 'https://api.digilist.no',
  // ... duplicate config
}}>
```

After (centralized):
```typescript
import { validateEnv, createAppConfig } from '@xala/config';

const env = validateEnv(import.meta.env);
const { sdkConfig, runtimeConfig } = createAppConfig('backoffice', env);

initializeClient(sdkConfig);

<RuntimeProvider config={runtimeConfig}>
```

## When in Doubt

1. Need app-specific settings? → Check AppProfile
2. Need env validation? → Use validateEnv()
3. Need SDK config? → Use createSDKConfig()
4. Need RuntimeProvider config? → Use createRuntimeConfig()
5. Need both? → Use createAppConfig()

---

**Last Updated:** 2026-01-20
**Status:** New Package
