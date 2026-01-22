# Domain Module Developer Guide

## Overview

This guide explains how to create new domain modules for the Digilist SaaS backbone.

---

## Quick Start

### 1. Create Module Directory

```bash
mkdir -p apps/api/src/modules/domain/my-domain
```

### 2. Define Manifest

```typescript
// apps/api/src/modules/domain/my-domain/index.ts
import type { DomainModuleDefinition } from '../types';

const manifest: DomainModuleDefinition['manifest'] = {
  id: 'MY_DOMAIN',
  name: { en: 'My Domain', nb: 'Min Domene' },
  description: { en: 'Description', nb: 'Beskrivelse' },
  version: '1.0.0',
  category: 'domain',
  dependencies: [],
  capabilities: ['my-capability'],
  isCore: false,
  defaultEnabled: false,
};

export default { manifest } as DomainModuleDefinition;
```

### 3. Register Module

```typescript
// apps/api/src/modules/domain/registry.ts
export async function loadDomainModules(): Promise<void> {
  // Existing
  const bookingRentalsModule = await import('./booking-rentals');
  registerDomainModule(bookingRentalsModule.default);
  
  // Add new module
  const myDomainModule = await import('./my-domain');
  registerDomainModule(myDomainModule.default);
}
```

---

## Module Manifest Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | ✅ | Unique identifier (SCREAMING_SNAKE) |
| `name` | i18n | ✅ | Display name |
| `description` | i18n | ✅ | Description |
| `version` | string | ✅ | Semver version |
| `category` | enum | ✅ | `domain`, `extension`, `integration` |
| `dependencies` | string[] | ✅ | Other module IDs |
| `capabilities` | string[] | ✅ | Features provided |
| `isCore` | boolean | ✅ | Cannot be disabled |
| `defaultEnabled` | boolean | ✅ | Default tenant state |

---

## Adding Navigation

```typescript
const navigation: DomainModuleDefinition['navigation'] = {
  backoffice: [
    {
      id: 'my-feature',
      label: { en: 'My Feature', nb: 'Min Funksjon' },
      href: '/my-feature',
      icon: 'star',
      requiredCapability: 'my-capability',
      order: 10,
    },
  ],
  minside: [],
  web: [],
};
```

---

## Creating Adapter

```typescript
// apps/api/src/modules/domain/adapters/my-domain.adapter.ts
import { BaseDomainAdapter, DomainGroup } from './base.adapter';

export class MyDomainAdapter extends BaseDomainAdapter<LegacyService> {
  constructor(legacyService: LegacyService, config = {}) {
    super(legacyService, DomainGroup.MY_DOMAIN, config);
  }

  async myOperation(input, context) {
    return this.executeWithFallback(
      'myOperation',
      context,
      async () => {
        // Policy-driven logic
        const policy = await this.getPolicy(context.tenantId);
        return this.legacyService.myOperation(input);
      },
      async () => {
        // Legacy fallback
        return this.legacyService.myOperation(input);
      }
    );
  }
}
```

---

## Testing

Run domain E2E tests:

```bash
npx playwright test tests/e2e/domain/
```

---

## Checklist

- [ ] Module manifest defined
- [ ] Registered in `loadDomainModules()`
- [ ] Navigation items added (if UI)
- [ ] Adapter created (if service wrapping)
- [ ] E2E tests added
- [ ] Documentation updated
