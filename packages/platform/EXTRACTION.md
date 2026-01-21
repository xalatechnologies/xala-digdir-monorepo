# @xalatechnologies/platform - Extraction Guide

> **Purpose:** This document describes how to extract and publish the platform package independently from the monorepo.

## Overview

`@xalatechnologies/platform` is designed to be **fully extractable** and publishable to npm as a standalone package. It contains all platform-agnostic functionality that can be reused across different domain implementations.

---

## Pre-Extraction Verification

Before extracting or publishing, run these verification commands:

### 1. Verify No Domain Imports

```bash
# Must return no matches (excluding comments/docs)
grep -r "from '@digilist" src/ --include="*.ts" --include="*.tsx" | grep -v "// " | grep -v "* "

# Expected output: (empty)
```

### 2. Verify No Workspace Dependencies

```bash
# Must return no matches
grep "workspace:" package.json

# Expected output: (empty)
```

### 3. Build Independence Test

```bash
# Build without workspace resolution
cd packages/platform
pnpm install --ignore-workspace
pnpm build

# Expected: Build succeeds
```

### 4. Type Check

```bash
pnpm typecheck

# Expected: No type errors
```

---

## Package Structure

```
@xalatechnologies/platform/
├── src/
│   ├── index.ts                    # Main entry
│   ├── ui/                         # Design system
│   │   ├── index.ts               # UI exports
│   │   ├── primitives/            # Base components
│   │   ├── composed/              # Composed components
│   │   ├── blocks/                # Business blocks
│   │   ├── patterns/              # Reusable patterns
│   │   └── shells/                # App shells
│   ├── auth/                       # Authentication
│   │   ├── index.ts
│   │   ├── context.tsx
│   │   ├── hooks.ts
│   │   └── types.ts
│   ├── config/                     # Configuration
│   │   ├── index.ts
│   │   ├── registry.ts
│   │   └── types.ts
│   ├── runtime/                    # Runtime providers
│   │   ├── index.ts
│   │   └── providers/
│   ├── contracts/                  # API contracts
│   │   ├── index.ts
│   │   ├── schemas/
│   │   └── projections/
│   ├── sdk/                        # SDK core
│   │   ├── index.ts
│   │   ├── http-client.ts
│   │   ├── errors.ts
│   │   └── query-keys.ts
│   ├── i18n/                       # Internationalization
│   │   ├── index.ts
│   │   ├── hooks.ts
│   │   └── locales/
│   └── observability/              # Metrics & logging
│       ├── index.ts
│       ├── metrics.ts
│       └── logging.ts
├── package.json
├── tsconfig.json
├── tsup.config.ts
└── EXTRACTION.md (this file)
```

---

## Subpath Exports

The package exposes the following subpath exports:

| Export Path | Description |
|-------------|-------------|
| `@xalatechnologies/platform` | Main entry (all exports) |
| `@xalatechnologies/platform/ui` | Design system components |
| `@xalatechnologies/platform/ui/primitives` | Base UI primitives |
| `@xalatechnologies/platform/ui/composed` | Composed components |
| `@xalatechnologies/platform/ui/blocks` | Business blocks |
| `@xalatechnologies/platform/ui/patterns` | Reusable patterns |
| `@xalatechnologies/platform/ui/shells` | App shells |
| `@xalatechnologies/platform/ui/styles` | CSS styles |
| `@xalatechnologies/platform/auth` | Authentication layer |
| `@xalatechnologies/platform/config` | Configuration utilities |
| `@xalatechnologies/platform/runtime` | Runtime providers |
| `@xalatechnologies/platform/contracts` | API contracts (Zod) |
| `@xalatechnologies/platform/sdk` | SDK core utilities |
| `@xalatechnologies/platform/i18n` | Internationalization |
| `@xalatechnologies/platform/observability` | Metrics & logging |

---

## Publishing to npm

### 1. Prepare for Publishing

```bash
# Ensure clean state
cd packages/platform
rm -rf dist node_modules

# Install dependencies (production only)
pnpm install --prod

# Build
pnpm build

# Verify dist structure
ls -la dist/
```

### 2. Version Bump

```bash
# Patch release (bug fixes)
pnpm version patch

# Minor release (new features)
pnpm version minor

# Major release (breaking changes)
pnpm version major
```

### 3. Publish

```bash
# Dry run first
pnpm publish --dry-run

# Publish to npm
pnpm publish --access public
```

---

## Usage in New Domains

### Installation

```bash
pnpm add @xalatechnologies/platform
```

### Basic Setup

```tsx
// main.tsx
import '@xalatechnologies/platform/ui/styles';
import { RuntimeProvider } from '@xalatechnologies/platform/runtime';
import { AuthProvider } from '@xalatechnologies/platform/auth';

function App() {
  return (
    <RuntimeProvider config={runtimeConfig}>
      <AuthProvider>
        <YourApp />
      </AuthProvider>
    </RuntimeProvider>
  );
}
```

### Using UI Components

```tsx
import { Button, Card, Modal } from '@xalatechnologies/platform/ui';
import { ResourceCard } from '@xalatechnologies/platform/ui/patterns';

function MyComponent() {
  return (
    <Card>
      <ResourceCard
        title="My Resource"
        description="Description here"
        image="/image.jpg"
        onClick={() => {}}
      />
      <Button>Click Me</Button>
    </Card>
  );
}
```

### Using SDK Core

```tsx
import { createHttpClient, ProblemDetailsError } from '@xalatechnologies/platform/sdk';

const client = createHttpClient({
  baseUrl: 'https://api.example.com',
});

try {
  const data = await client.get('/resource');
} catch (error) {
  if (error instanceof ProblemDetailsError) {
    console.error(error.title, error.detail);
  }
}
```

### Using Contracts

```tsx
import { z } from 'zod';
import { BaseEntitySchema, PaginationSchema } from '@xalatechnologies/platform/contracts';

// Extend base schemas for your domain
const MyResourceSchema = BaseEntitySchema.extend({
  name: z.string(),
  status: z.enum(['active', 'inactive']),
});
```

---

## Dependencies

### Runtime Dependencies

| Package | Purpose |
|---------|---------|
| `@digdir/designsystemet-react` | UI component library |
| `@digdir/designsystemet-css` | UI styles |
| `@tanstack/react-query` | Data fetching |
| `zod` | Schema validation |
| `js-cookie` | Cookie management |
| `prom-client` | Prometheus metrics |

### Peer Dependencies

| Package | Version |
|---------|---------|
| `react` | >=18.0.0 |
| `react-dom` | >=18.0.0 |

---

## Domain Boundary Rules

### Platform Package MUST:

1. **Be domain-agnostic** - No business logic specific to any domain
2. **Use generic terminology** - "resource" not "listing", "item" not "booking"
3. **Accept pre-localized strings** - Components receive translated text as props
4. **Provide patterns, not implementations** - Reusable patterns that domains compose

### Platform Package MUST NOT:

1. **Import from @digilist/*** - No domain package imports
2. **Contain Norwegian domain terms** - No "kommune", "utleie", "booking"
3. **Make domain-specific API calls** - SDK core provides utilities only
4. **Include domain business logic** - Validation rules, pricing, etc.

---

## Creating Domain Adapters

When using platform in a new domain, create adapters:

```typescript
// my-domain/src/features/resources/mappers.ts
import type { ResourceCardProps } from '@xalatechnologies/platform/ui/patterns';
import type { MyDomainResourceDTO } from '../types';

export function mapMyResourceToCard(
  resource: MyDomainResourceDTO,
  t: (key: string) => string
): ResourceCardProps {
  return {
    id: resource.id,
    title: resource.name,
    description: resource.summary,
    image: resource.thumbnailUrl,
    badges: resource.tags.map(tag => ({
      label: t(`tags.${tag}`),
      variant: 'info',
    })),
    metadata: [
      { label: t('fields.status'), value: resource.status },
      { label: t('fields.created'), value: formatDate(resource.createdAt) },
    ],
  };
}
```

---

## Troubleshooting

### "Cannot find module '@xalatechnologies/platform/xyz'"

Ensure subpath is exported in package.json:

```json
{
  "exports": {
    "./xyz": {
      "import": "./dist/xyz/index.js",
      "require": "./dist/xyz/index.cjs",
      "types": "./dist/xyz/index.d.ts"
    }
  }
}
```

### "Type errors after installing"

Ensure TypeScript can resolve the types:

```json
// tsconfig.json
{
  "compilerOptions": {
    "moduleResolution": "bundler"
  }
}
```

### "Styles not loading"

Import the styles entry point:

```tsx
import '@xalatechnologies/platform/ui/styles';
```

---

## Changelog

### v1.0.0 (Initial Release)

- UI components (primitives, composed, blocks, patterns, shells)
- Authentication layer
- Configuration utilities
- Runtime providers
- API contracts (Zod schemas)
- SDK core (HTTP client, error handling)
- Internationalization
- Observability (metrics, logging)

---

**Last Updated:** 2026-01-21
**Status:** Ready for Extraction
