# Xala Digdir Monorepo

A Turborepo with Vite + React app embedding Norwegian Designsystemet with strict guardrails.

## Architecture

- **pnpm workspaces** + **Turborepo** for monorepo management
- **apps/web** - Vite + React + TypeScript app
- **apps/api** - Fastify API server  
- **packages/ds** - UI facade (ONLY allowed import for Designsystemet)
- **packages/ds-themes** - Theme URL registry for runtime switching
- **packages/ds-registry** - Documentation and examples
- **packages/eslint-config** - Shared ESLint with guardrails

## Key Features

### 🎨 Designsystemet Integration
- Single CSS import point via `@xala/ds/styles`
- Runtime theme switching (digdir, altinn, uutilsynet, portal)
- Data attributes for color scheme, size, and typography
- `asChild` pattern support for semantic overrides

### 🛡️ Guardrails
- **ESLint rules** block direct `@digdir/*` imports in apps
- Only `@xala/ds` facade allowed in applications
- CSS imports restricted to `packages/ds/src/styles.ts`
- Automated enforcement via lint pipeline

## Quick Start

```bash
# Install dependencies
pnpm install

# Run development servers
pnpm dev

# Build all packages
pnpm build

# Run linting (checks guardrails)
pnpm lint
```

## Development URLs

- Web app: http://localhost:5173
- API health: http://localhost:3002/health

## Theme Switching

```tsx
import { DesignsystemetProvider } from '@xala/ds';

function App() {
  return (
    <DesignsystemetProvider 
      theme="digdir" 
      colorScheme="auto" 
      size="md"
    >
      {/* Your app */}
    </DesignsystemetProvider>
  );
}
```

## Available Themes

- `digdir` - Default Digdir theme
- `altinn` - Altinn theme
- `uutilsynet` - Utsynet theme
- `portal` - Portal theme

## Data Attributes

- `data-color-scheme`: `"auto" | "light" | "dark"`
- `data-size`: `"sm" | "md" | "lg"`
- `data-typography`: `"primary" | "secondary"`

## Critical Rules

1. **Never** import `@digdir/*` directly in apps
2. **Always** import `@xala/ds/styles` exactly once in main.tsx
3. **Use** `DesignsystemetProvider` for theme controls
4. **No** custom UI components in apps
5. **Follow** `asChild` single-child rule

## Project Structure

```
├── apps/
│   ├── web/          # Vite React app
│   └── api/          # Fastify server
├── packages/
│   ├── ds/           # UI facade
│   ├── ds-themes/    # Theme URLs
│   ├── ds-registry/  # Examples
│   └── eslint-config/ # Guardrails
└── docs/
```

## Theme Generation

To generate real themes using Designsystemet CLI:

```bash
pnpm tokens:create
pnpm tokens:build
```

The CLI reads `designsystemet.config.json` and writes outputs into `packages/ds-themes/`.
