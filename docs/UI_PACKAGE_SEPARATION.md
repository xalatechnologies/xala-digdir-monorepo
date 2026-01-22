# UI Package Separation - Migration Guide

> **Date:** January 22, 2026  
> **Status:** Complete

## Overview

The UI components have been separated from the platform monorepo into a standalone package for better governance, versioning, and reusability.

## What Changed

### Before (Monorepo)
```
xala-platform/
└── packages/
    └── platform/
        └── src/
            └── ui/          # UI components were here
```

### After (Separated)
```
xala-platform/                          # Platform infrastructure
└── packages/
    └── platform/
        └── src/
            ├── runtime/
            ├── auth/
            ├── sdk/
            └── ...                     # No UI directory

xala-platform-ui/                       # UI components (separate repo)
└── src/
    ├── primitives/
    ├── composed/
    ├── blocks/
    ├── patterns/
    └── ...
```

## Package Names

| Old | New | Status |
|-----|-----|--------|
| `@xala-technologies/platform/ui` | `@xala-technologies/platform-ui` | ✅ Published |

## For Digilist Apps

### 1. Update Dependencies

**In your `package.json`:**

```diff
{
  "dependencies": {
    "@xala-technologies/platform": "^1.0.0",
+   "@xala-technologies/platform-ui": "^1.0.1"
  }
}
```

### 2. Update Imports

**Before:**
```typescript
import { Button, Card } from '@xala-technologies/platform/ui';
import { DataTable } from '@xala-technologies/platform/ui/composed';
import { AppLayout } from '@xala-technologies/platform/ui/shells';
```

**After:**
```typescript
import { Button, Card } from '@xala-technologies/platform-ui';
import { DataTable } from '@xala-technologies/platform-ui/composed';
import { AppLayout } from '@xala-technologies/platform-ui/shells';
```

### 3. Automated Migration

Run this in each app directory:

```bash
# Find and replace imports
find src -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -exec sed -i '' 's|@xala-technologies/platform/ui|@xala-technologies/platform-ui|g' {} \;

# Install new dependency
pnpm add @xala-technologies/platform-ui

# Verify
pnpm typecheck
pnpm build
```

## Governance Changes

### ESLint Enforcement

The platform now enforces UI package boundaries via ESLint:

**These will fail ESLint:**
```typescript
// ❌ Direct Designsystemet imports
import { Button } from '@digdir/designsystemet-react';

// ❌ Direct icon imports
import { HomeIcon } from 'lucide-react';
```

**Use these instead:**
```typescript
// ✅ Import from UI package
import { Button } from '@xala-technologies/platform-ui';
import { HomeIcon } from '@xala-technologies/platform-ui/primitives';
```

### Design Token Enforcement

The UI package enforces Designsystemet design tokens:

**Forbidden:**
- Raw HTML elements (`<div>`, `<span>`, `<p>`, `<h1>-<h6>`)
- Inline styles (except with design token variables)
- Custom CSS classes (prefer data attributes)

**Required:**
- Use Designsystemet components from `@xala-technologies/platform-ui`
- Use data attributes (`data-size`, `data-color`, `data-spacing`)
- Use design token variables (`var(--ds-*)`) for custom styling

## Component Layer Hierarchy

The UI package enforces a strict component hierarchy:

```
Level 0: primitives/  → Can only import external packages
Level 1: composed/    → Can import primitives
Level 2: blocks/      → Can import primitives, composed
Level 3: patterns/    → Can import primitives, composed, blocks
Level 4: shells/      → Can import primitives, composed, blocks, patterns
Level 5: pages/       → Can import all layers
```

Lower layers cannot import from higher layers.

## Verification Scripts

The UI package has automated verification:

```bash
# In xala-platform-ui repository
pnpm verify:boundaries      # Check layer hierarchy
pnpm verify:design-tokens   # Check design token usage
pnpm verify:all             # Run all verifications
```

These run automatically in CI/CD.

## Benefits

### 1. Better Governance
- UI package has simple, focused ESLint rules
- Platform has complex governance rules
- Clear separation of concerns

### 2. Independent Versioning
- UI can be updated without platform changes
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

## Documentation

### Platform Package
- [Platform AGENTS.md](https://github.com/Xala-Technologies/xala-platform/blob/main/AGENTS.md)
- [UI Package Migration](https://github.com/Xala-Technologies/xala-platform/blob/main/docs/UI_PACKAGE_MIGRATION.md)

### UI Package
- [UI AGENTS.md](https://github.com/Xala-Technologies/xala-platform-ui/blob/main/docs/governance/AGENTS.md)
- [Design Tokens Guide](https://github.com/Xala-Technologies/xala-platform-ui/blob/main/docs/guides/DESIGN_TOKENS.md)
- [Governance Rules](https://github.com/Xala-Technologies/xala-platform-ui/blob/main/docs/governance/GOVERNANCE.md)
- [Architecture](https://github.com/Xala-Technologies/xala-platform-ui/blob/main/docs/architecture/ARCHITECTURE.md)
- [Components](https://github.com/Xala-Technologies/xala-platform-ui/blob/main/docs/architecture/COMPONENTS.md)

## Troubleshooting

### Build Errors

**Error:** `Cannot find module '@xala-technologies/platform/ui'`

**Solution:** Update imports to use `@xala-technologies/platform-ui`

### ESLint Errors

**Error:** `Import from @xala-technologies/platform-ui instead of @digdir/designsystemet-react`

**Solution:** This is intentional! Update your imports to use the UI package.

### TypeScript Errors

**Error:** `Cannot find module '@xala-technologies/platform-ui'`

**Solution:**
1. Ensure the package is installed: `pnpm install`
2. Check your `.npmrc` has GitHub Packages configured
3. Verify your `GITHUB_TOKEN` has `read:packages` scope

## Timeline

- **2026-01-22**: UI package separated and published (v1.0.1)
- **2026-01-22**: Platform package updated to remove UI exports
- **Next**: Migrate Digilist apps to use new UI package

## Support

- **UI Issues**: [xala-platform-ui issues](https://github.com/Xala-Technologies/xala-platform-ui/issues)
- **Platform Issues**: [xala-platform issues](https://github.com/Xala-Technologies/xala-platform/issues)
- **Migration Help**: Check this guide or ask in team chat
