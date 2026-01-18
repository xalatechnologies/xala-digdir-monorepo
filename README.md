# Xala Digilist Platform

Enterprise-grade multi-tenant booking and resource management system for Norwegian municipalities and organizations.

## System Overview

The Digilist Platform is a production-ready monorepo implementing a contract-first architecture with strict separation of concerns. Built on Turborepo with pnpm workspaces, the system enforces architectural boundaries through automated guardrails and compile-time validation.

## Architecture

**Monorepo Management:**
- pnpm workspaces for dependency management and workspace isolation
- Turborepo for build orchestration and caching
- Strict package boundaries enforced via ESLint

**Applications:**
- `apps/api` - Fastify-based REST API with multi-tenant isolation
- `apps/web` - Public-facing listing discovery and booking interface
- `apps/minside` - Authenticated user portal for booking management
- `apps/backoffice` - Administrative interface for resource management
- `apps/tenant-admin` - Tenant-level configuration and branding
- `apps/saas-admin` - Platform-level administration and monitoring
- `apps/monitoring` - System health and metrics dashboard
- `apps/docs-learning` - Internal documentation and training materials

**Shared Packages:**
- `packages/ds` - Design system facade enforcing Norwegian Designsystemet compliance
- `packages/client-sdk` - Type-safe API client with React Query integration
- `packages/contracts` - Zod-based API contracts and projection DTOs
- `packages/i18n` - Internationalization supporting Norwegian Bokmål and English
- `packages/database-schema` - Drizzle ORM schema definitions
- `packages/eslint-config` - Custom ESLint rules enforcing architectural patterns

## Design System Integration

The platform implements Norwegian Designsystemet through a controlled facade pattern:

**Single Import Point:**
- All design system imports route through `@xala/ds`
- Direct imports from `@digdir/*` packages are prohibited in applications
- CSS imports restricted to `packages/ds/src/styles.ts`

**Theme Management:**
- Runtime theme switching supporting digdir, altinn, uutilsynet, and portal themes
- Data attribute-based configuration for color scheme, size, and typography
- Semantic override support via `asChild` pattern

**Enforcement:**
- Custom ESLint rules block architectural violations
- Automated validation in CI/CD pipeline
- Build-time type checking ensures contract compliance

## Development Environment

**Prerequisites:**
- Node.js 20.x or higher
- pnpm 8.x or higher
- PostgreSQL 16.x
- Redis 7.x

**Installation:**

```bash
pnpm install
```

**Development Servers:**

```bash
pnpm dev
```

This starts all applications in development mode with hot module replacement enabled.

**Build:**

```bash
pnpm build
```

Builds all packages and applications for production deployment.

**Validation:**

```bash
pnpm lint
pnpm typecheck
pnpm test
```

**Service Endpoints:**

- API: http://localhost:4000
- Web: http://localhost:5173
- MinSide: http://localhost:5174
- Backoffice: http://localhost:5175
- Tenant Admin: http://localhost:5176
- SaaS Admin: http://localhost:5177
- Monitoring: http://localhost:5178
- Docs & Learning: http://localhost:5179

## Design System Configuration

**Provider Setup:**

```tsx
import { DesignsystemetProvider } from '@xala/ds';

function App() {
  return (
    <DesignsystemetProvider 
      theme="digdir" 
      colorScheme="auto" 
      size="md"
    >
      {/* Application content */}
    </DesignsystemetProvider>
  );
}
```

**Supported Themes:**

| Theme | Description | Use Case |
|-------|-------------|----------|
| `digdir` | Digitaliseringsdirektoratet | Default platform theme |
| `altinn` | Altinn | Altinn integration contexts |
| `uutilsynet` | Utdanningsdirektoratet | Educational institution deployments |
| `portal` | Generic portal | White-label deployments |

**Configuration Attributes:**

| Attribute | Type | Values | Default |
|-----------|------|--------|---------|
| `data-color-scheme` | string | `auto`, `light`, `dark` | `auto` |
| `data-size` | string | `sm`, `md`, `lg` | `md` |
| `data-typography` | string | `primary`, `secondary` | `primary` |

## Architectural Constraints

The following constraints are enforced through automated tooling and must be observed:

1. Applications must not import `@digdir/*` packages directly. All design system access routes through `@xala/ds`.
2. CSS imports are restricted to a single import of `@xala/ds/styles` in application entry points.
3. Theme configuration must use `DesignsystemetProvider`. Direct manipulation of design tokens is prohibited.
4. Applications must not implement custom UI components. All interface elements derive from the design system.
5. The `asChild` pattern requires exactly one child element for semantic HTML correctness.

## Repository Structure

```
xala-digdir-monorepo/
├── apps/
│   ├── api/                    # Fastify REST API
│   ├── web/                    # Public listing discovery
│   ├── minside/                # User portal
│   ├── backoffice/             # Administrative interface
│   ├── tenant-admin/           # Tenant configuration
│   ├── saas-admin/             # Platform administration
│   ├── monitoring/             # System metrics
│   └── docs-learning/          # Documentation
├── packages/
│   ├── client-sdk/             # Type-safe API client
│   ├── contracts/              # API contracts and DTOs
│   ├── database-schema/        # Drizzle ORM schemas
│   ├── ds/                     # Design system facade
│   ├── ds-themes/              # Theme token registry
│   ├── ds-registry/            # Component documentation
│   ├── eslint-config/          # Custom lint rules
│   ├── i18n/                   # Internationalization
│   └── testing/                # Shared test utilities
├── infra/
│   ├── docker/                 # Container configurations
│   ├── pm2/                    # Process manager configs
│   ├── secrets/                # Encrypted secrets
│   └── scripts/                # Deployment automation
└── docs/
    ├── architecture/           # System design documentation
    ├── operations/             # Operational procedures
    └── guides/                 # Development guides
```

## Theme Token Generation

Theme tokens are generated using the Designsystemet CLI:

```bash
pnpm tokens:create
pnpm tokens:build
```

The CLI processes `designsystemet.config.json` and outputs compiled theme assets to `packages/ds-themes/`.

## Infrastructure

Complete infrastructure documentation is available in `infra/`:

- Docker configurations for development, staging, and production
- PM2 process manager configurations
- Encrypted secrets management with age
- Deployment automation scripts
- VPS setup and configuration guides

See `infra/AGENTS.md` for infrastructure commands and `infra/SETUP_GUIDE.md` for deployment procedures.

## Documentation

- `AGENTS.md` - AI agent guidelines and platform overview
- `CLAUDE.md` - Development context and critical requirements
- `infra/SETUP_GUIDE.md` - Infrastructure setup procedures
- `docs/architecture/` - System architecture documentation
- `docs/operations/` - Operational procedures and runbooks

## License

Proprietary. Copyright 2026 Xala Technologies AS.
