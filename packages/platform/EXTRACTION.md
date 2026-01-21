# Platform Package Extraction Guide

> **PR F.1: Platform Extraction Configuration**
> **Package:** `@xalatechnologies/platform`
> **Status:** Active Development

---

## Overview

The `@xalatechnologies/platform` package consolidates all platform-level functionality into a single, domain-agnostic package with multi-entry exports. This guide documents how to extract, configure, and migrate to the unified platform package.

---

## Package Architecture

### Multi-Entry Exports

The package provides 8 main entry points:

| Entry Point | Import Path | Source Package |
|-------------|-------------|----------------|
| UI | `@xalatechnologies/platform/ui` | `@xala/ds` |
| Auth | `@xalatechnologies/platform/auth` | `@xala/auth` |
| Config | `@xalatechnologies/platform/config` | `@xala/config` |
| Runtime | `@xalatechnologies/platform/runtime` | `@xala/runtime` |
| Contracts | `@xalatechnologies/platform/contracts` | `@xala/contracts` |
| SDK | `@xalatechnologies/platform/sdk` | `@xala/sdk-core` |
| i18n | `@xalatechnologies/platform/i18n` | `@xala/i18n` |
| Observability | `@xalatechnologies/platform/observability` | `@xala/observability` |

### UI Sub-Modules

The UI module has additional sub-entries:

| Entry Point | Import Path | Purpose |
|-------------|-------------|---------|
| Primitives | `@xalatechnologies/platform/ui/primitives` | Low-level Designsystemet components |
| Composed | `@xalatechnologies/platform/ui/composed` | Mid-level composed components |
| Shells | `@xalatechnologies/platform/ui/shells` | Application layout shells |
| Blocks | `@xalatechnologies/platform/ui/blocks` | Business domain blocks |
| Themes | `@xalatechnologies/platform/ui/themes` | Theme configuration |
| Patterns | `@xalatechnologies/platform/ui/patterns` | Domain-neutral UI patterns |

---

## Directory Structure

```
packages/platform/
├── src/
│   ├── index.ts              # Main barrel export
│   ├── ui/
│   │   ├── index.ts          # UI barrel export
│   │   ├── primitives/       # Re-exports from @xala/ds primitives
│   │   ├── composed/         # Re-exports from @xala/ds composed
│   │   ├── shells/           # Re-exports from @xala/ds shells
│   │   ├── blocks/           # Re-exports from @xala/ds blocks
│   │   ├── themes/           # Theme utilities
│   │   └── patterns/         # Domain-neutral patterns (ResourceCard, etc.)
│   ├── auth/
│   │   └── index.ts          # Re-exports from @xala/auth
│   ├── config/
│   │   ├── index.ts          # Re-exports from @xala/config
│   │   └── domain-registry.ts # Domain registration utilities
│   ├── runtime/
│   │   └── index.ts          # Re-exports from @xala/runtime
│   ├── contracts/
│   │   └── index.ts          # Re-exports from @xala/contracts
│   ├── sdk/
│   │   ├── index.ts          # Re-exports from @xala/sdk-core
│   │   ├── http/             # HTTP client utilities
│   │   ├── errors/           # RFC 7807 error handling
│   │   ├── query/            # Query key factory
│   │   └── retry/            # Retry with DLQ
│   ├── i18n/
│   │   ├── index.ts          # Re-exports from @xala/i18n
│   │   ├── locales/          # Translation files (nb, en)
│   │   └── hooks.ts          # i18n hooks
│   └── observability/
│       ├── index.ts          # Re-exports from @xala/observability
│       ├── metrics/          # Metric definitions
│       └── exporters/        # Prometheus, etc.
├── package.json              # Multi-entry configuration
├── tsconfig.json             # TypeScript paths
├── tsup.config.ts            # Multi-entry build
├── EXTRACTION.md             # This file
└── CLAUDE.md                 # AI assistant guidance
```

---

## Dependencies Resolution

### Current Dependencies (to be consolidated)

The platform package has the following workspace dependencies:

```json
{
  "dependencies": {
    "@digdir/designsystemet-react": "^1.9.0",
    "@tanstack/react-query": "^5.62.16",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.22.0",
    "zod": "^3.22.4"
  }
}
```

### Future Dependencies (after full extraction)

After completing the extraction, the package should also include:

```json
{
  "dependencies": {
    "@xala/ds": "workspace:*",
    "@xala/auth": "workspace:*",
    "@xala/config": "workspace:*",
    "@xala/runtime": "workspace:*",
    "@xala/contracts": "workspace:*",
    "@xala/sdk-core": "workspace:*",
    "@xala/i18n": "workspace:*",
    "@xala/observability": "workspace:*"
  }
}
```

### Peer Dependencies

```json
{
  "peerDependencies": {
    "react": ">=18.0.0",
    "react-dom": ">=18.0.0"
  }
}
```

---

## Migration Guide

### Phase 1: Compatibility Layer (Current)

During the migration period, both old and new imports work:

```typescript
// Old imports (deprecated, will show console warning)
import { Button } from '@xala/ds';
import { useAuth } from '@xala/auth';
import { validateEnv } from '@xala/config';

// New imports (recommended)
import { Button } from '@xalatechnologies/platform/ui';
import { useAuth } from '@xalatechnologies/platform/auth';
import { validateEnv } from '@xalatechnologies/platform/config';
```

### Phase 2: Update Import Paths

Replace all imports in your application:

```typescript
// Before
import { Button, Card, Grid } from '@xala/ds';
import { AppShell, ContentLayout } from '@xala/ds';
import { RuntimeProvider } from '@xala/runtime';
import { AuthProvider, useAuth } from '@xala/auth';
import { useT, I18nProvider } from '@xala/i18n';
import { initializeClient, ApiError } from '@xala/sdk-core';
import { ProblemDetailsSchema } from '@xala/contracts';
import { createLogger } from '@xala/observability';
import { validateEnv, getAppProfile } from '@xala/config';

// After
import { Button, Card, Grid } from '@xalatechnologies/platform/ui';
import { AppShell, ContentLayout } from '@xalatechnologies/platform/ui/shells';
import { RuntimeProvider } from '@xalatechnologies/platform/runtime';
import { AuthProvider, useAuth } from '@xalatechnologies/platform/auth';
import { useT, I18nProvider } from '@xalatechnologies/platform/i18n';
import { initializeClient, ApiError } from '@xalatechnologies/platform/sdk';
import { ProblemDetailsSchema } from '@xalatechnologies/platform/contracts';
import { createLogger } from '@xalatechnologies/platform/observability';
import { validateEnv, getAppProfile } from '@xalatechnologies/platform/config';
```

### Phase 3: Update tsconfig.json Paths (Optional)

For monorepo setups, add path mappings:

```json
{
  "compilerOptions": {
    "paths": {
      "@xalatechnologies/platform": ["./packages/platform/src/index.ts"],
      "@xalatechnologies/platform/*": ["./packages/platform/src/*"]
    }
  }
}
```

---

## Verification Steps

### 1. Build Verification

```bash
cd packages/platform
pnpm clean
pnpm build
```

Expected output:
- `dist/index.js` and `dist/index.d.ts`
- `dist/ui/index.js` and `dist/ui/index.d.ts`
- `dist/auth/index.js` and `dist/auth/index.d.ts`
- `dist/config/index.js` and `dist/config/index.d.ts`
- `dist/runtime/index.js` and `dist/runtime/index.d.ts`
- `dist/contracts/index.js` and `dist/contracts/index.d.ts`
- `dist/sdk/index.js` and `dist/sdk/index.d.ts`
- `dist/i18n/index.js` and `dist/i18n/index.d.ts`
- `dist/observability/index.js` and `dist/observability/index.d.ts`

### 2. Type Checking

```bash
cd packages/platform
pnpm typecheck
```

### 3. Import Verification

Create a test file to verify imports:

```typescript
// test-imports.ts
import { Button } from '@xalatechnologies/platform/ui';
import { useAuth } from '@xalatechnologies/platform/auth';
import { validateEnv } from '@xalatechnologies/platform/config';
import { RuntimeProvider } from '@xalatechnologies/platform/runtime';
import { ProblemDetailsSchema } from '@xalatechnologies/platform/contracts';
import { ApiError, initializeClient } from '@xalatechnologies/platform/sdk';
import { useT, I18nProvider } from '@xalatechnologies/platform/i18n';
import { createLogger } from '@xalatechnologies/platform/observability';

console.log('All imports successful!');
```

### 4. Boundary Verification

Verify platform does not import domain packages:

```bash
pnpm verify:boundaries
```

### 5. Banned Terms Verification

Verify no banned terms in platform code:

```bash
pnpm verify:terms
```

Banned terms in platform packages:
- "listing" (use "rentalObject")
- "facility" (use "amenity")

---

## Platform Patterns

### Domain-Neutral UI Patterns

The `@xalatechnologies/platform/ui/patterns` module provides domain-neutral UI patterns:

| Pattern | Purpose |
|---------|---------|
| `ResourceCard` | Generic card for any resource type |
| `ResourceGrid` | Responsive grid layout for cards |
| `ResourceDetailHeader` | Header for detail pages |
| `SlotCalendar` | Calendar with time slots |
| `PricingSummary` | Price breakdown display |
| `FeatureChips` | Feature/amenity chips |
| `MetadataRow` | Key-value metadata display |
| `ScheduleCard` | Schedule/hours display |
| `FormWizardModal` | Multi-step form modal |
| `ConfirmationView` | Confirmation screen |
| `SuccessView` | Success screen |

### Usage with Domain Feature Kits

Platform patterns are designed to be composed by domain feature kits:

```typescript
// Domain feature kit (e.g., @digilist/ui/features/rental-objects)
import { ResourceCard } from '@xalatechnologies/platform/ui/patterns';
import { mapRentalObjectToResourceCard } from './mappers';

export function RentalObjectCardWrapper({ rentalObject, t }) {
  const props = mapRentalObjectToResourceCard(rentalObject, t);
  return <ResourceCard {...props} />;
}
```

---

## Compatibility Packages

During the migration period, compatibility packages provide deprecation warnings:

### @xala/ds -> @xalatechnologies/platform/ui

```typescript
// packages/xala-compat-ds/src/index.ts
export * from '@xalatechnologies/platform/ui';

if (process.env.NODE_ENV !== 'production') {
  console.warn(
    '[@xala/ds] This package is deprecated. ' +
    'Please use @xalatechnologies/platform/ui instead.'
  );
}
```

Similar compatibility layers exist for:
- `@xala/auth` -> `@xalatechnologies/platform/auth`
- `@xala/config` -> `@xalatechnologies/platform/config`
- `@xala/runtime` -> `@xalatechnologies/platform/runtime`
- `@xala/i18n` -> `@xalatechnologies/platform/i18n`

---

## Build Configuration

### tsup.config.ts

```typescript
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    // Main entry
    index: 'src/index.ts',

    // UI module and sub-modules
    'ui/index': 'src/ui/index.ts',
    'ui/primitives/index': 'src/ui/primitives/index.ts',
    'ui/composed/index': 'src/ui/composed/index.ts',
    'ui/shells/index': 'src/ui/shells/index.ts',
    'ui/blocks/index': 'src/ui/blocks/index.ts',
    'ui/themes/index': 'src/ui/themes/index.ts',
    'ui/patterns/index': 'src/ui/patterns/index.ts',

    // Other modules
    'runtime/index': 'src/runtime/index.ts',
    'auth/index': 'src/auth/index.ts',
    'config/index': 'src/config/index.ts',
    'contracts/index': 'src/contracts/index.ts',
    'sdk/index': 'src/sdk/index.ts',
    'i18n/index': 'src/i18n/index.ts',
    'observability/index': 'src/observability/index.ts',
  },
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
  minify: false,
  external: [
    'react',
    'react-dom',
    'react-router-dom',
    '@digdir/designsystemet-react',
    '@digdir/designsystemet-css',
    '@tanstack/react-query',
    'zod',
  ],
  esbuildOptions(options) {
    options.jsx = 'automatic';
  },
});
```

### tsconfig.json Paths

```json
{
  "compilerOptions": {
    "paths": {
      "@xalatechnologies/platform": ["./src/index.ts"],
      "@xalatechnologies/platform/ui": ["./src/ui/index.ts"],
      "@xalatechnologies/platform/ui/*": ["./src/ui/*"],
      "@xalatechnologies/platform/runtime": ["./src/runtime/index.ts"],
      "@xalatechnologies/platform/auth": ["./src/auth/index.ts"],
      "@xalatechnologies/platform/config": ["./src/config/index.ts"],
      "@xalatechnologies/platform/contracts": ["./src/contracts/index.ts"],
      "@xalatechnologies/platform/sdk": ["./src/sdk/index.ts"],
      "@xalatechnologies/platform/i18n": ["./src/i18n/index.ts"],
      "@xalatechnologies/platform/observability": ["./src/observability/index.ts"]
    }
  }
}
```

---

## Troubleshooting

### Module Not Found Errors

If you see "Cannot find module '@xalatechnologies/platform/ui'":

1. Ensure the package is built: `pnpm build`
2. Check `exports` in package.json matches your import
3. Verify `typesVersions` for TypeScript resolution
4. Clear node_modules and reinstall: `pnpm install`

### Type Resolution Issues

If TypeScript cannot find types:

1. Check `typesVersions` field in package.json
2. Verify `.d.ts` files exist in `dist/`
3. Restart TypeScript server in your IDE
4. Try adding explicit paths in consuming project's tsconfig.json

### Circular Dependency Warnings

If you see circular dependency warnings:

1. Check that platform does not import from domain packages (@digilist/*)
2. Use dynamic imports for optional features
3. Review the dependency graph with `pnpm why <package>`

---

## Next Steps

### Immediate (PR F.1)

- [x] Configure package.json with multi-entry exports
- [x] Configure tsconfig.json with path mappings
- [x] Configure tsup.config.ts for multi-entry build
- [x] Create stub index files for all entry points
- [x] Document extraction process (this file)

### Short-term (PR F.2-F.4)

- [ ] Complete UI patterns migration (ResourceCard, SlotCalendar, etc.)
- [ ] Add domain registry for multi-domain support
- [ ] Create compatibility layer deprecation warnings
- [ ] Update all apps to use new import paths

### Medium-term

- [ ] Remove old @xala/* packages (after migration complete)
- [ ] Update documentation with new import paths
- [ ] Add automated migration codemod
- [ ] Performance optimization (tree-shaking verification)

---

## References

- [Package Namespace Migration Guide](../../docs/architecture/PACKAGE_NAMESPACE_MIGRATION.md)
- [Platform UI + Feature Kits Architecture](../../docs/architecture/PLATFORM_UI_FEATURE_KITS.md)
- [Root CLAUDE.md](../../CLAUDE.md) - See "Package Namespace Migration" section

---

**Last Updated:** 2026-01-21
**Status:** PR F.1 - Configuration Complete
**Next PR:** F.2 - UI Patterns Extraction
