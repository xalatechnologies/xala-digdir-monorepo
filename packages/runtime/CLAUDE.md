# @digilist/runtime - Domain Runtime

> **Extends:** [Root CLAUDE.md](../../CLAUDE.md)

## Purpose

`@digilist/runtime` provides **domain-specific** runtime providers and configuration for the Digilist rental booking platform. This package extends `@xala/runtime` (platform-agnostic runtime) with Digilist-specific features.

**Package Name:** `@digilist/runtime`
**Status:** Production Active

---

## Key Features

1. **Automatic Profile Registration** - Importing this package registers Digilist app profiles with @xala/config
2. **AccountContextProvider** - Domain-specific provider for personal/organization account switching
3. **Domain Types** - DigilistAppType, DigilistThemeId with type guards

---

## Usage

### Automatic Profile Registration

Simply importing this package registers all Digilist app profiles:

```typescript
// apps/backoffice/src/main.tsx

// Step 1: Import to register profiles (side-effect)
import '@digilist/runtime';

// Step 2: Use generic config API
import { validateEnv, createAppConfig } from '@xala/config';
import { RuntimeProvider } from '@xala/runtime';
import { initializeClient } from '@digilist/client-sdk';

const env = validateEnv(import.meta.env);
const { sdkConfig, runtimeConfig } = createAppConfig('backoffice', env);

initializeClient(sdkConfig);

<RuntimeProvider config={runtimeConfig}>
  <App />
</RuntimeProvider>
```

### AccountContextProvider

Domain-specific provider for managing user account context:

```tsx
import { AccountContextProvider, useAccountContext } from '@digilist/runtime';

function App() {
  return (
    <AccountContextProvider storageKeyPrefix="minside">
      <DashboardContent />
    </AccountContextProvider>
  );
}

function DashboardContent() {
  const { accountType, selectedOrganization, switchToOrganization } = useAccountContext();
  // accountType: 'personal' | 'organization'
  // selectedOrganization: Organization | null
}
```

### Direct Profile Access

If you need direct access to profile definitions:

```typescript
import {
  DigilistAppType,
  DigilistThemeId,
  isDigilistAppType,
  isDigilistThemeId,
  webProfile,
  minsideProfile,
  backofficeProfile,
  saasAdminProfile,
  monitoringProfile,
  docsLearningProfile,
  digilistProfiles,
  digilistProfilesRecord,
} from '@digilist/runtime';

// Type guard usage
const appType = 'backoffice';
if (isDigilistAppType(appType)) {
  // appType is narrowed to DigilistAppType
  const profile = digilistProfilesRecord[appType];
}
```

---

## Architecture: Domain vs Platform Separation

| Domain Provider (This Package) | Platform Provider (@xala/runtime) |
|-------------------------------|-----------------------------------|
| AccountContextProvider | MultiAccountProvider |
| DigilistAppType | AppType (string) |
| DigilistThemeId | ThemeId (string) |
| digilistProfiles | (none - generic registry) |

---

## File Structure

```
packages/digilist-runtime/
├── src/
│   ├── index.ts              # Main exports + profile registration
│   ├── config/               # Configuration module
│   │   ├── index.ts          # Auto-registers profiles on import
│   │   ├── types.ts          # DigilistAppType, DigilistThemeId
│   │   └── digilist-profiles.ts  # Profile definitions
│   ├── providers/            # Domain providers
│   │   ├── index.ts
│   │   └── AccountContextProvider.tsx
│   └── hooks/                # Domain hooks
│       └── index.ts
├── package.json
├── tsconfig.json
└── CLAUDE.md
```

---

## App Profiles

| App | Port | Requires Auth | Color Scheme |
|-----|------|---------------|--------------|
| web | 5173 | No | auto |
| minside | 5174 | Yes | auto |
| backoffice | 5175 | Yes | auto |
| saas-admin | 5177 | Yes | auto |
| monitoring | 5178 | Yes | dark |
| docs-learning | 5179 | No | auto |

---

## Dependencies

- **@xala/config** - Generic config registry (registers profiles with this)
- **@xala/runtime** - Platform-agnostic runtime (extends MultiAccountProvider)
- **@digilist/client-sdk** - Domain SDK (for useOrganizations hook)

---

## Why This Package Exists

The separation between `@xala/config`/`@xala/runtime` (platform) and `@digilist/runtime` (domain) ensures:

1. **Platform packages remain domain-agnostic** - No @digilist imports in @xala packages
2. **Domain coupling is explicit** - Apps import @digilist/runtime to get Digilist features
3. **Registry pattern** - Profiles registered at runtime, not hardcoded in platform
4. **Reusability** - Platform packages can be used for other domains

---

## IMPORTANT: Import Order

Apps must import `@digilist/runtime` **before** using `@xala/config` functions that require profiles:

```typescript
// ✅ CORRECT - domain import first
import '@digilist/runtime';
import { getAppProfile } from '@xala/config';
const profile = getAppProfile('backoffice'); // Works!

// ❌ WRONG - no domain import
import { getAppProfile } from '@xala/config';
const profile = getAppProfile('backoffice'); // Error: Unknown app type
```

---

**Last Updated:** 2026-01-21
**Status:** Refactored - Platform Decoupling Complete
