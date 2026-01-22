# UI Package Boundary

> **Critical Update:** 2026-01-22  
> **Status:** Enforced by ESLint

## Overview

UI components have been separated into `@xala-technologies/platform-ui` package.

## Package Boundary

```
@xala-technologies/platform-ui (separate repo)
  └── UI components, themes, patterns
       ↑
       │ (consumed by)
       │
@xala-technologies/platform ← Digilist apps depend on this
     │
     └── SDK, auth, i18n, runtime, observability
```

## Import Rules

### ✅ CORRECT - Import from UI Package

```typescript
// Primitives
import { Button, Card, Input } from '@xala-technologies/platform-ui';

// Composed components
import { DataTable, Modal } from '@xala-technologies/platform-ui/composed';

// Blocks
import { NotificationBell } from '@xala-technologies/platform-ui/blocks';

// Patterns
import { ResourceCard } from '@xala-technologies/platform-ui/patterns';

// Shells
import { AppLayout } from '@xala-technologies/platform-ui/shells';

// Icons
import { HomeIcon, UserIcon } from '@xala-technologies/platform-ui/primitives';
```

### ❌ FORBIDDEN - Direct UI Library Imports

```typescript
// ❌ ESLint will FAIL
import { Button } from '@digdir/designsystemet-react';
import { HomeIcon } from 'lucide-react';
import { UserIcon } from '@navikt/aksel-icons';

// ❌ Old import path (deprecated)
import { Button } from '@xala-technologies/platform/ui';
```

## Why This Matters

### 1. Governance
- UI package has simple, focused ESLint rules
- Platform has complex governance rules
- Clear separation of concerns

### 2. Versioning
- UI can be updated independently
- Easier to track UI-specific changes
- Better semantic versioning

### 3. Reusability
- Multiple projects can share the same UI package
- Consistent design across all Xala products
- Single source of truth for UI components

### 4. AI Agent Clarity
- Simpler rules in UI repository
- Clear boundaries enforced by ESLint
- Less confusion about what goes where

## ESLint Enforcement

Platform ESLint config automatically catches violations:

```javascript
// .eslintrc.json
{
  "rules": {
    "no-restricted-imports": ["error", {
      "patterns": [
        {
          "group": ["@digdir/designsystemet-react"],
          "message": "❌ BOUNDARY VIOLATION: Import from @xala-technologies/platform-ui"
        },
        {
          "group": ["lucide-react"],
          "message": "❌ BOUNDARY VIOLATION: Import icons from @xala-technologies/platform-ui/primitives"
        }
      ]
    }]
  }
}
```

## Component Layer Hierarchy

UI package enforces strict layer hierarchy:

```
Level 0: primitives/  → Can only import external packages
Level 1: composed/    → Can import primitives
Level 2: blocks/      → Can import primitives, composed
Level 3: patterns/    → Can import primitives, composed, blocks
Level 4: shells/      → Can import primitives, composed, blocks, patterns
Level 5: pages/       → Can import all layers
```

Lower layers cannot import from higher layers.

## Design Token Requirements

UI package enforces Designsystemet design tokens:

### ✅ CORRECT
```typescript
import { Card, Heading, Paragraph } from '@xala-technologies/platform-ui';

<Card data-color="neutral" data-size="medium">
  <Heading level={2} data-size="medium">Title</Heading>
  <Paragraph>Content</Paragraph>
</Card>

// Design token variables allowed
<Card style={{ padding: 'var(--ds-spacing-4)' }}>
```

### ❌ FORBIDDEN
```typescript
// Raw HTML elements
<div><h1>Title</h1><p>Content</p></div>

// Inline styles without design tokens
<Card style={{ padding: '20px' }}>

// Custom CSS classes
<div className="my-custom-class">
```

## Verification

UI package has automated verification scripts:

```bash
# In xala-platform-ui repository
pnpm verify:boundaries      # Check layer hierarchy
pnpm verify:design-tokens   # Check design token usage
pnpm verify:all             # Run all verifications
```

These run automatically in CI/CD.

## Migration

See [docs/UI_PACKAGE_SEPARATION.md](../../../docs/UI_PACKAGE_SEPARATION.md) for complete migration guide.

## Documentation

- **UI Package**: https://github.com/Xala-Technologies/xala-platform-ui/tree/main/docs
- **Platform Package**: https://github.com/Xala-Technologies/xala-platform/tree/main/docs
- **Migration Guide**: [docs/UI_PACKAGE_SEPARATION.md](../../../docs/UI_PACKAGE_SEPARATION.md)
