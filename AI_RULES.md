# AI Rules for Xala Digdir Monorepo

## Core Architecture Rules

1. **Apps must not import @digdir/* packages directly** - Use the @xala/ds facade package only
2. **Designsystemet CSS must be imported only once** - Import @xala/ds/styles exactly once in the app's main.tsx
3. **No custom UI components in apps** - Use only DS components exported from @xala/ds
4. **Theme switching via provider only** - Use DesignsystemetProvider or data attributes, never direct CSS imports
5. **Use data attributes for styling modes**:
   - data-color-scheme="auto|light|dark"
   - data-size="sm|md|lg"
   - data-typography="primary|secondary"

## Package Dependencies

- @xala/ds: The ONLY UI facade package
- @xala/ds-registry: Documentation and examples
- @xala/ds-themes: Theme URLs for runtime switching
- @xala/eslint-config: Shared ESLint configuration

## ESLint Guardrails

The repository enforces:
- Blocked @digdir/* imports in apps
- Blocked direct CSS imports except in packages/ds/src/styles.ts
- Only @xala/ds and @xala/ds-registry allowed in apps

## Component Usage Rules

### asChild Pattern
- Use asChild for semantic overrides (Button as Link)
- Only ONE child allowed under asChild
- Radix Slot merges props to child element
- Child inherits all component behaviors

### Theme Switching
- Use DesignsystemetProvider for runtime theme switching
- Themes: digdir, altinn, uutilsynet, portal
- Provider manages single <link> element for theme CSS
- Never import theme CSS directly

## File Structure Rules

### Application Structure
- apps/web: Vite React app
- apps/api: Fastify API server
- apps/backoffice: Admin portal
- apps/minside: User dashboard

### Package Structure
- packages/ds: UI facade with single CSS import point
- packages/ds-registry: Examples and documentation
- packages/eslint-config: Shared lint rules
- packages/client-sdk: Enterprise SDK
- packages/i18n: Internationalization

### Test Structure (REQUIRED)
All tests MUST be organized under `tests/`:
```
tests/
├── unit/           # Vitest unit tests
├── e2e/            # Playwright E2E tests
├── integration/    # Integration tests
├── performance/    # Performance tests
├── security/       # Security tests
├── fixtures/       # Test data
├── helpers/        # Test utilities
├── reports/        # Test output (gitignored)
├── screenshots/    # E2E screenshots (gitignored)
└── artifacts/      # Test artifacts (gitignored)
```

**NEVER create test folders at root level** (e.g., `test-results/`, `playwright-report/`, `reports/`)

## Development Commands

- pnpm dev: Run all apps in parallel
- pnpm build: Build all packages
- pnpm lint: Check ESLint rules
- pnpm format: Format with Prettier

## Critical Reminders

1. ALWAYS import @xala/ds/styles exactly once
2. NEVER import @digdir/* in apps
3. USE DesignsystemetProvider for theming
4. FOLLOW asChild single-child rule
5. CHECK ESLint passes before commits
