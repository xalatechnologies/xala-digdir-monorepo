# @xala/ds-registry

📚 **DOCUMENTATION PACKAGE** - Component metadata and examples.

## Purpose

Provides structured documentation for `@xala/ds` components:
- Component metadata (props, types, guidelines)
- Code examples (copy-paste ready TSX)
- Usage patterns (best practices)
- Design guidelines

## Architecture

```
@xala/ds-registry (Documentation metadata)
    ├── Component registry (JSON + TypeScript)
    ├── Code examples (TSX files)
    ├── Usage patterns (asChild, providers, etc.)
    └── Guidelines (accessibility, i18n, etc.)
         └── Used by documentation site
```

## Contents

### Component Registry
```typescript
import { components } from '@xala/ds-registry/registry';

// Get component metadata
const buttonInfo = components.button;
console.log(buttonInfo.description);
console.log(buttonInfo.props);
```

### Code Examples
```typescript
import { examples } from '@xala/ds-registry/examples';

// Get all examples for a component
const buttonExamples = Object.values(examples)
  .filter(e => e.component === 'button');
```

### Usage Patterns
```typescript
import { patterns } from '@xala/ds-registry/patterns';

// Learn about asChild pattern, provider usage, etc.
console.log(patterns.asChild);
```

## Consumers

### ✅ Intended Users

1. **Documentation Site** (`apps/docs-learning`)
   - Generates component documentation pages
   - Shows interactive examples
   - Displays props tables

2. **Development Tools**
   - IDE plugins (autocomplete, hints)
   - Linters (enforce best practices)
   - Code generators (scaffolding)

3. **Storybook** (future)
   - Component playground
   - Visual testing
   - Design QA

### ❌ Not For

**Production Apps** - They import components directly from `@xala/ds`:
```typescript
// ❌ DON'T import registry in production apps
import { registry } from '@xala/ds-registry';

// ✅ DO import components from @xala/ds
import { Button, Card } from '@xala/ds';
```

## For App Developers

You don't need this package! Just use `@xala/ds`:
```typescript
import { Button, Card, Heading } from '@xala/ds';
import { AppShell, ContentLayout } from '@xala/ds';
import { RentalObjectCard } from '@xala/ds';
```

## For Documentation Developers

If you're building the docs site, use the JSON registry:
```typescript
// Simple, lightweight access
import registry from '@xala/ds-registry/registry.json';

// TypeScript access with types
import { components, patterns, examples } from '@xala/ds-registry';
```

## Registry Structure

### registry.json
```json
{
  "metadata": {
    "version": "1.0.0",
    "generatedAt": "2026-01-18T10:00:00Z"
  },
  "components": {
    "button": {
      "name": "Button",
      "description": "Interactive button component",
      "category": "primitives",
      "props": { ... },
      "examples": ["button-variants", "button-sizes"]
    }
  }
}
```

## Build Process

```bash
# Compile TypeScript registry to dist/
npm run build

# Watch for changes during development
npm run dev

# Validate registry structure
npm run validate
```

## Examples

Located in `examples/` directory:
- `blocks/` - Business logic components
- `composed/` - Mid-level components  
- `shells/` - Application layouts
- `patterns/` - Usage patterns

Each example is a standalone TSX file that can be:
- Rendered in docs
- Copied to clipboard
- Run in CodeSandbox

## Guidelines

Located in `src/guidelines.ts`:
- Accessibility best practices
- i18n requirements
- Performance tips
- Common patterns

## Related Documentation

- [Design System Architecture](../../docs/architecture/design-system.md)
- [Design System Package Analysis](../../docs/DESIGN_SYSTEM_PACKAGES_ANALYSIS.md)
- [@xala/ds README](../ds/README.md)
