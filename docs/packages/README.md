# Packages Documentation

This section documents all shared packages in the Xala Diglist monorepo. Packages are reusable modules that provide functionality across multiple applications.

## Available Packages

### [@digilist/client-sdk](./01-client-sdk.md)
The official TypeScript client for the Xala Diglist API.
- **Purpose**: Type-safe API communication
- **Features**: Auto-generated from OpenAPI, React hooks, error handling
- **Used by**: All frontend applications
- **Version**: 1.x.x

### [@xala/ds](./02-design-system.md)
UI component library providing a facade over Norwegian Designsystemet.
- **Purpose**: Consistent UI components
- **Features**: Designsystemet integration, theme support, accessibility
- **Used by**: All frontend applications
- **Version**: 1.x.x

### [@xala/ds-themes](./03-design-themes.md)
Theme management system for runtime theme switching.
- **Purpose**: Dynamic theme loading
- **Features**: Multiple themes, CSS variables, theme URLs
- **Used by**: @xala/ds
- **Version**: 1.x.x

### [@xala/ds-registry](./04-design-registry.md)
Documentation and examples for design system components.
- **Purpose**: Component documentation
- **Features**: Storybook stories, usage examples, design guidelines
- **Used by**: Developers and designers
- **Version**: 1.x.x

### [@xala/eslint-config](./05-eslint-config.md)
Shared ESLint configuration with custom guardrails.
- **Purpose**: Code quality and compliance
- **Features**: Contract-first rules, design system rules, TypeScript rules
- **Used by**: All packages and applications
- **Version**: 1.x.x

### [@xala/i18n](./06-i18n.md)
Internationalization library for Norwegian and English support.
- **Purpose**: Multi-language support
- **Features**: Translation keys, pluralization, date formatting
- **Used by**: All frontend applications
- **Version**: 1.x.x

## Package Management

### Workspace Configuration
```yaml
# pnpm-workspace.yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

### Dependencies Strategy
- **Exact versions** for production dependencies
- **Range versions** for dev dependencies
- **Shared dependencies** in root package.json
- **Peer dependencies** for React ecosystem

### Version Management
- **Semantic versioning** (SemVer)
- **Independent versioning** per package
- **Automated releases** on main branch
- **Changelog generation**

## Development Workflow

### Creating a New Package
```bash
# Create package directory
mkdir packages/new-package
cd packages/new-package

# Initialize package
pnpm init

# Add to workspace
# Update pnpm-workspace.yaml

# Configure TypeScript
# Add tsconfig.json

# Add to turbo.json
# Configure build tasks
```

### Package Structure
```
packages/package-name/
├── src/
│   ├── index.ts          # Main export
│   ├── components/       # Components (if applicable)
│   ├── hooks/           # Hooks (if applicable)
│   ├── utils/           # Utilities
│   └── types/           # Type definitions
├── tests/               # Test files
├── docs/                # Package documentation
├── package.json
├── tsconfig.json
└── README.md
```

### Publishing
```bash
# Build package
pnpm -F @xala/package-name build

# Run tests
pnpm -F @xala/package-name test

# Publish (automated on CI)
pnpm -F @xala/package-name publish
```

## Best Practices

### 1. Package Dependencies
- Keep dependencies minimal
- Use peer dependencies for React
- Avoid circular dependencies
- Document all public APIs

### 2. TypeScript Support
- Export all types
- Use generic types when appropriate
- Provide JSDoc comments
- Enable strict mode

### 3. Testing
- Unit tests for all utilities
- Component tests for UI
- Integration tests for complex flows
- Type checking with tsc

### 4. Documentation
- Comprehensive README
- API documentation
- Usage examples
- Migration guides

## Inter-Package Communication

### Allowed Dependencies
```
@digilist/client-sdk ← → @xala/i18n
@xala/ds ← → @xala/ds-themes
@xala/ds ← → @xala/i18n
apps/* ← → All packages
```

### Forbidden Dependencies
```
packages/* ← → apps/* (no reverse dependencies)
@xala/ds ← → @digdir/* (use facade pattern)
```

## Version Compatibility

### Compatibility Matrix
| Package | Web | Backoffice | Min Side | API |
|---------|-----|------------|----------|-----|
| client-sdk | ✓ | ✓ | ✓ | ✗ |
| ds | ✓ | ✓ | ✓ | ✗ |
| i18n | ✓ | ✓ | ✓ | ✗ |
| eslint-config | ✓ | ✓ | ✓ | ✓ |

### Upgrade Strategy
1. Check compatibility matrix
2. Update in development branch
3. Run all tests
4. Update documentation
5. Release with changelog

## Tooling

### Build Tools
- **TypeScript** for compilation
- **Vite** for bundling
- **Rollup** for library packaging
- **Turbo** for task orchestration

### Quality Tools
- **ESLint** for linting
- **Prettier** for formatting
- **Vitest** for testing
- **TypeDoc** for API docs

### Release Tools
- **Changesets** for versioning
- **Semantic Release** for automation
- **GitHub Actions** for CI/CD

## Related Documentation

- [Monorepo Structure](../architecture/02-monorepo.md)
- [Development Workflow](../03-development-workflow.md)
- [Design System Architecture](../architecture/04-design-system.md)
- [Contract-First Guide](../guides/01-contract-first.md)
