# Monorepo Structure

This document explains the monorepo organization, workspace management, and development patterns used in the Xala Diglist Platform.

## Overview

We use a monorepo approach to manage all applications and packages in a single repository. This enables:
- **Shared code** across applications
- **Atomic commits** across related changes
- **Unified tooling** and configuration
- **Simplified dependencies** management

## Technology Stack

### Core Tools
- **pnpm workspaces** - Package management
- **Turborepo** - Build orchestration
- **TypeScript** - Type checking
- **ESLint** - Linting with custom rules
- **Vitest** - Unit testing
- **Playwright** - E2E testing

### Workspace Configuration
```yaml
# pnpm-workspace.yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

## Repository Structure

```
xala-digdir-monorepo/
├── .github/                    # GitHub workflows
│   └── workflows/              # CI/CD pipelines
├── apps/                       # Frontend and backend applications
│   ├── web/                    # Public web app
│   ├── backoffice/             # Admin interface
│   ├── minside/                # User dashboard
│   └── api/                    # Backend API
├── packages/                   # Shared packages
│   ├── client-sdk/             # API client
│   ├── ds/                     # Design system facade
│   ├── ds-themes/              # Theme management
│   ├── ds-registry/            # Component docs
│   ├── eslint-config/          # Linting rules
│   └── i18n/                   # Internationalization
├── docs/                       # Documentation
├── scripts/                    # Build and utility scripts
├── tests/                      # All tests (unit, e2e, integration, etc.)
│   ├── e2e/                    # E2E tests
│   ├── unit/                   # Unit tests
│   ├── integration/            # Integration tests
│   └── fixtures/               # Test utilities and fixtures
└── tools/                      # Development tools
```

## Package Management

### Dependencies Strategy

#### Root Dependencies
Shared dependencies are defined in the root `package.json`:
```json
{
  "devDependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "typescript": "^5.6.3",
    "vitest": "^4.0.17",
    "@playwright/test": "^1.57.0"
  }
}
```

#### Package Dependencies
Each package defines its specific dependencies:
```json
// packages/client-sdk/package.json
{
  "dependencies": {
    "@tanstack/react-query": "^5.62.16",
    "zod": "^3.23.0"
  },
  "peerDependencies": {
    "react": "^18.3.1"
  }
}
```

#### Application Dependencies
Applications depend on shared packages:
```json
// apps/web/package.json
{
  "dependencies": {
    "@digilist/client-sdk": "workspace:*",
    "@xala/ds": "workspace:*",
    "@xala/i18n": "workspace:*"
  }
}
```

### Version Management
- **Exact versions** for production dependencies
- **Workspace protocol** for internal packages
- **Semantic versioning** for published packages
- **Lock file** for reproducible builds

## Build System

### Turborepo Configuration
```json
// turbo.json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": []
    },
    "lint": {
      "outputs": []
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

### Build Tasks
```bash
# Build all packages and apps
pnpm build

# Build specific package
pnpm -F @xala/ds build

# Build with dependencies
pnpm -F @digilist/web build --filter=@digilist/client-sdk
```

## Development Workflow

### Local Development
```bash
# Install all dependencies
pnpm install

# Start all apps in parallel
pnpm dev

# Start specific app
pnpm -F @digilist/web dev

# Run tests for all
pnpm test

# Run tests for package
pnpm -F @digilist/client-sdk test
```

### Package Scripts
Common scripts across all packages:
```json
{
  "scripts": {
    "build": "tsc && vite build",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "lint": "eslint src --ext .ts,.tsx",
    "type-check": "tsc --noEmit"
  }
}
```

## Code Sharing Patterns

### 1. Shared Components
```typescript
// packages/ds/src/components/Button/Button.tsx
export interface ButtonProps {
  variant: 'primary' | 'secondary';
  size: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

export function Button(props: ButtonProps) {
  // Implementation
}
```

### 2. Shared Types
```typescript
// packages/client-sdk/src/types/listing.ts
export interface ListingProjectionDTO {
  id: string;
  title: string;
  description: string;
  permissions: PermissionDTO;
}
```

### 3. Shared Utilities
```typescript
// packages/client-sdk/src/utils/format.ts
export function formatDate(date: string): string {
  return new Intl.DateTimeFormat('nb-NO').format(new Date(date));
}
```

### 4. Shared Configuration
```typescript
// packages/eslint-config/index.js
module.exports = {
  extends: [
    '@typescript-eslint/recommended',
    'plugin:react-hooks/recommended'
  ],
  rules: {
    // Custom rules
  }
};
```

## Dependency Graph

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│     Web     │    │ Backoffice  │    │   Min Side  │
└─────────────┘    └─────────────┘    └─────────────┘
         │                   │                   │
         └───────────────────┼───────────────────┘
                             │
    ┌─────────────────────────────────────────────────┐
    │              Shared Packages                    │
    │  ┌─────────────┐  ┌─────────────┐  ┌─────────┐ │
    │  │ Client SDK  │  │   Design    │  │  i18n   │ │
    │  │             │  │   System    │  │         │ │
    │  └─────────────┘  └─────────────┘  └─────────┘ │
    └─────────────────────────────────────────────────┘
```

## Publishing Strategy

### Internal Packages
Packages with `workspace:*` are not published:
- `@xala/ds`
- `@xala/ds-themes`
- `@xala/eslint-config`
- `@xala/i18n`

### Published Packages
Packages with semantic versioning:
- `@digilist/client-sdk` - Published to npm

### Publishing Process
```bash
# 1. Update version
pnpm version patch

# 2. Build package
pnpm -F @digilist/client-sdk build

# 3. Run tests
pnpm -F @digilist/client-sdk test

# 4. Publish (automated)
pnpm -F @digilist/client-sdk publish
```

## Testing Strategy

### Unit Tests
- Located in each package/app
- Run with `pnpm test`
- Use Vitest as test runner

### Integration Tests
- Cross-package tests in `tests/integration/`
- Test package interactions
- Run with `pnpm test:integration`

### E2E Tests
- Located in `tests/e2e/` directory
- Test full user flows
- Run with Playwright

### Test Configuration
```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
  },
});
```

## CI/CD Pipeline

### GitHub Actions Workflow
```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm lint
      - run: pnpm test
      - run: pnpm build

  e2e:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: pnpm install
      - run: pnpm dev &
      - run: pnpm test:e2e
```

### Deployment Pipeline
1. **Build** all packages and apps
2. **Test** unit and integration tests
3. **Deploy** to staging environment
4. **Run E2E tests** on staging
5. **Deploy** to production (manual approval)

## Best Practices

### 1. Package Boundaries
- Clear separation of concerns
- Minimal dependencies
- No circular dependencies
- Well-defined APIs

### 2. Version Management
- Use semantic versioning
- Update dependencies regularly
- Pin exact versions for production
- Use ranges for development

### 3. Code Organization
- Feature-based structure in apps
- Utility-first in packages
- Consistent naming conventions
- Clear export paths

### 4. Development Practices
- Run `pnpm install` after changes
- Use workspace filters for specific tasks
- Keep lock file committed
- Use Turborepo caching

## Troubleshooting

### Common Issues

#### Dependency Conflicts
```bash
# Clear all node_modules
pnpm -r exec rm -rf node_modules
rm -rf node_modules
pnpm install
```

#### Build Failures
```bash
# Clean build artifacts
pnpm -r exec rm -rf dist
pnpm build --force
```

#### Turborepo Cache Issues
```bash
# Clear Turborepo cache
pnpm turborepo clean
```

### Debug Commands
```bash
# Check dependency graph
pnpm list --graph

# Check why a package is installed
pnpm why react

# Check outdated packages
pnpm outdated
```

## Performance Optimization

### Build Performance
- **Turborepo caching** for incremental builds
- **Parallel execution** for independent tasks
- **Selective builds** for changed packages only

### Bundle Optimization
- **Code splitting** in applications
- **Tree shaking** for unused code
- **External dependencies** for vendor libs

### Development Performance
- **Hot Module Replacement** (HMR)
- **TypeScript project references**
- **ESLint cache** for faster linting

## Future Enhancements

### Planned Improvements
1. **Nx migration** for enhanced tooling
2. **Module federation** for micro-frontends
3. **Changeset versioning** for automated releases
4. **Dependabot** for dependency updates

### Tooling Evolution
- **Vite** as default bundler
- **SWC** for faster compilation
- **pnpm** for improved performance
- **GitHub Apps** for better integration

## Related Documentation

- [Architecture Overview](./01-overview.md)
- [Development Workflow](../03-development-workflow.md)
- [Package Documentation](../packages/README.md)
- [Application Documentation](../apps/README.md)
