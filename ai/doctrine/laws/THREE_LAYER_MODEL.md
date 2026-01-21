# Three-Layer Workspace Model

> **Package Classification by Runtime Environment**
> **Layer:** Laws

---

## The Three Layers

Every package in the Xala Platform belongs to exactly ONE layer:

```
┌────────────────────────────────────────────────────────────────────┐
│                    LAYER 1: UNIVERSAL (Isomorphic)                  │
│                    Runs in: Browser + Server                        │
│                    Safe for: ALL consumers                          │
├────────────────────────────────────────────────────────────────────┤
│  @xalatechnologies/platform/ui          Design system components    │
│  @xalatechnologies/platform/runtime     React providers, hooks      │
│  @xalatechnologies/platform/config      Configuration utilities     │
│  @xalatechnologies/platform/contracts   Zod schemas, types          │
│  @xalatechnologies/platform/sdk         HTTP client, error handling │
│  @xalatechnologies/platform/i18n        Translations                │
│  @digilist/domain                       Domain contracts            │
│  @digilist/sdk                          Domain services, hooks      │
│  @digilist/ui                           Domain UI components        │
└────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────┐
│                    LAYER 2: SERVER-ONLY                             │
│                    Runs in: Node.js ONLY                            │
│                    Safe for: API, backend services                  │
├────────────────────────────────────────────────────────────────────┤
│  @xalatechnologies/platform-schema      Database schema (Drizzle)   │
│  @xalatechnologies/enterprise/server    Server-only enterprise      │
│  @digilist/database-schema              Domain database tables      │
│  apps/api                               API server                  │
│  apps/platform-api                      Platform API server         │
└────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────┐
│                    LAYER 3: TOOLING-ONLY                            │
│                    Runs in: Build time, CI/CD                       │
│                    Safe for: Dev tools, testing                     │
├────────────────────────────────────────────────────────────────────┤
│  @xalatechnologies/governance           ESLint rules, testing       │
│  @digilist/testing                      Test utilities              │
│  @digilist/testing-e2e                  E2E test helpers            │
│  eslint-config                          ESLint configurations       │
└────────────────────────────────────────────────────────────────────┘
```

---

## Import Rules by Layer

### Universal Packages CAN Import:

```typescript
// ✅ Other universal packages
import { Button } from '@xalatechnologies/platform/ui';
import { useAuth } from '@xalatechnologies/platform/runtime';

// ❌ Server-only packages (FORBIDDEN)
import { tenants } from '@xalatechnologies/platform-schema';

// ❌ Tooling packages (FORBIDDEN)
import { testUtils } from '@xalatechnologies/governance';
```

### Server-Only Packages CAN Import:

```typescript
// ✅ Universal packages
import { BookingDTO } from '@digilist/domain';

// ✅ Other server-only packages
import { tenants } from '@xalatechnologies/platform-schema';

// ✅ Node.js built-ins
import { readFile } from 'fs/promises';

// ❌ Browser APIs (FORBIDDEN)
document.querySelector('...');
```

### Tooling Packages CAN Import:

```typescript
// ✅ Anything (for testing purposes)
import { tenants } from '@xalatechnologies/platform-schema';
import { Button } from '@xalatechnologies/platform/ui';

// These packages are NEVER shipped to runtime
```

---

## Package.json Exports Pattern

Server-only packages use subpath exports:

```json
{
  "name": "@xalatechnologies/enterprise",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "types": "./dist/index.d.ts"
    },
    "./server": {
      "import": "./dist/server.mjs",
      "types": "./dist/server.d.ts"
    }
  }
}
```

Usage:
```typescript
// Universal code (safe everywhere)
import { FeatureFlags } from '@xalatechnologies/enterprise';

// Server-only code (API only)
import { evaluateFlag } from '@xalatechnologies/enterprise/server';
```

---

## Enforcement

ESLint rule `@xalatechnologies/governance/no-server-imports` enforces:

```typescript
// In apps/web, apps/minside, apps/backoffice, etc.
import { tenants } from '@xalatechnologies/platform-schema'; // ❌ ERROR
import { server } from '@xalatechnologies/enterprise/server'; // ❌ ERROR
```

Run verification:
```bash
pnpm verify:boundaries
```

---

## Decision Tree

```
Is this package used at runtime?
├── NO → Layer 3 (Tooling)
└── YES
    └── Does it need Node.js APIs (fs, crypto, etc.)?
        ├── YES → Layer 2 (Server-only)
        └── NO → Layer 1 (Universal)
```
