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
- `apps/tenant-admin` - Tenant configuration and white-label branding
- `apps/saas-admin` - Platform administration and subscription management
- `apps/monitoring` - System health monitoring and metrics dashboard
- `apps/docs-learning` - Documentation portal and learning resources

**Shared Packages:**
- `packages/auth` - Authentication utilities and session management
- `packages/client-sdk` - Type-safe API client with React Query integration
- `packages/contracts` - Zod-based API contracts and projection DTOs
- `packages/database-schema` - Drizzle ORM schema definitions
- `packages/docs-content` - Markdown documentation content and metadata
- `packages/ds` - Design system facade enforcing Norwegian Designsystemet compliance
- `packages/ds-registry` - Component documentation and usage examples
- `packages/ds-themes` - Theme token registry and runtime theme switching
- `packages/eslint-config` - Custom ESLint rules enforcing architectural patterns
- `packages/i18n` - Internationalization supporting Norwegian Bokmål and English
- `packages/observability` - Logging, monitoring, and error tracking utilities
- `packages/platform` - Platform-level utilities and shared constants
- `packages/sdk-core` - Core SDK functionality and base client
- `packages/testing` - Shared test utilities and testing infrastructure

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

The platform includes production-ready infrastructure automation and deployment tooling:

**Docker Environments:**
- `infra/docker/compose/` - Multi-environment Docker Compose configurations
  - Development: 12 containers with hot reload and dev tools
  - Staging: 10 containers with production builds
  - Production: 10 containers with optimized builds and security hardening
- `infra/docker/dockerfiles/` - Multi-stage Dockerfiles for API and frontend apps
- `infra/docker/nginx/` - Nginx reverse proxy configurations
- `infra/docker/postgres/` - PostgreSQL initialization scripts

**Process Management:**
- `infra/pm2/` - PM2 ecosystem configurations for zero-downtime deployments
  - Staging configuration with debug logging
  - Production configuration with clustering and graceful shutdown

**Secrets Management:**
- `infra/secrets/` - Age-encrypted secrets for staging and production
  - Deploy-time injection (not runtime fetching)
  - Separate encrypted files per app and environment
  - Public key committed, private key in password manager

**Environment Configuration:**
- `infra/env/` - Environment variable templates
  - Development, Docker, staging, and production templates
  - Clear documentation of required variables

**Deployment Automation:**
- `infra/scripts/` - Automated deployment and utility scripts
  - `setup-vps.sh` - Automated VPS provisioning
  - `deploy-staging.sh` - Staging deployment automation
  - `deploy-production.sh` - Production deployment automation
  - `encrypt-secrets.sh` - Interactive secret encryption helper
  - `generate-secrets.sh` - Strong secret generation utility

**Documentation:**
- `infra/AGENTS.md` - Quick reference commands for infrastructure tasks
- `infra/CLAUDE.md` - Infrastructure context for AI assistants
- `infra/SETUP_GUIDE.md` - Complete 60+ page setup guide
- `infra/docs/SECRETS_MANAGEMENT.md` - Comprehensive secrets management guide
- `VPS_SETUP_GUIDE.md` - VPS provisioning and configuration guide

**Key Features:**
- Automated VPS setup with single command
- Encrypted secrets with age (never commit plaintext)
- Zero-downtime deployments with PM2 reload
- Multi-environment support (dev, staging, production)
- GitHub Actions CI/CD integration
- Database schema validation and migrations
- Health checks and monitoring integration

## Development Guidelines

**Contract-First Architecture:**
- All API endpoints defined in `packages/contracts` using Zod schemas
- Projection DTOs prevent data transformation in frontend
- Type safety enforced end-to-end from database to UI
- Never create transformers, mappers, or view models in applications

**Design System Compliance:**
- Import only from `@xala/ds`, never from `@digdir/*` packages
- Single CSS import in application entry point
- Use semantic components, not raw HTML elements
- Extend components via `asChild` pattern for semantic correctness

**Code Quality Standards:**
- TypeScript strict mode enabled across all packages
- Explicit return types required for all functions
- No `any` type usage - create specific interfaces
- Maximum file length: 200 lines
- Maximum function length: 20 lines
- Cyclomatic complexity under 10

**Internationalization:**
- All user-facing text must use `useT()` hook
- Support for Norwegian Bokmål (primary) and English (fallback)
- Never hardcode user-facing strings
- Run i18n scanner before commits

**Security Requirements:**
- All secrets encrypted with age before committing
- Environment variables for configuration, never hardcoded values
- RBAC enforced at API level, not in frontend
- Audit logging for all mutations
- GDPR compliance with consent management

**Testing Standards:**
- Unit tests for business logic
- Integration tests for API endpoints
- Component tests for UI elements
- E2E tests for critical user flows
- Minimum 80% code coverage

## Documentation

**Platform Documentation:**
- `AGENTS.md` - AI agent guidelines and platform overview
- `CLAUDE.md` - Development context and critical requirements
- `README.md` - This file - platform overview and quick start

**Infrastructure Documentation:**
- `infra/AGENTS.md` - Infrastructure commands reference
- `infra/CLAUDE.md` - Infrastructure context for AI assistants
- `infra/SETUP_GUIDE.md` - Complete infrastructure setup (60+ pages)
- `infra/docs/SECRETS_MANAGEMENT.md` - Secrets management guide
- `VPS_SETUP_GUIDE.md` - VPS provisioning guide
- `INFRASTRUCTURE_SETUP_COMPLETE.md` - Setup completion status

**Architecture Documentation:**
- `docs/architecture/` - System design and architecture decisions
- `docs/operations/` - Operational procedures and runbooks
- `docs/guides/` - Development and deployment guides

**Package-Specific Documentation:**
- Each package contains its own README with usage examples
- API documentation generated from Zod schemas
- Component documentation in `packages/ds-registry`

## License

Proprietary. Copyright 2026 Xala Technologies AS.
