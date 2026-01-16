# Xala Diglist Platform Documentation

## Overview

Welcome to the comprehensive documentation for the Xala Diglist Platform, a unified municipal booking system designed for Norwegian municipalities.

## Quick Navigation

### 📋 Core Documentation
- [Introduction](./01-introduction.md) - Platform overview and vision
- [Quick Start](./02-quick-start.md) - Setup and getting started
- [Development Workflow](./03-development-workflow.md) - Daily development practices

### 🏗️ Architecture
- [Architecture Overview](./architecture/01-overview.md) - System architecture and principles
- [Monorepo Structure](./architecture/02-monorepo.md) - Repository organization
- [Applications](./architecture/03-applications.md) - Application architecture patterns
- [Design System](./architecture/04-design-system.md) - UI/UX architecture
- [Security](./architecture/05-security.md) - Security and compliance

### 📦 Packages
- [Client SDK](./packages/01-client-sdk.md) - API client and hooks
- [Design System](./packages/02-design-system.md) - Component library
- [Design Themes](./packages/03-design-themes.md) - Theme management
- [Design Registry](./packages/04-design-registry.md) - Component documentation
- [ESLint Config](./packages/05-eslint-config.md) - Code quality rules
- [i18n](./packages/06-i18n.md) - Internationalization

### 🔧 Technical
- [System Requirements Specification (SRSD)](./technical/SRSD.md) - Technical specifications
- [Entity Relationship Diagram (ERD)](./technical/ERD.md) - Database schema and relationships
- [Codebase Tree](./technical/CODEBASE_TREE.md) - Complete file structure and organization

### 🚀 Applications
- [Web Application](./apps/01-web.md) - Public booking interface
- [Backoffice](./apps/02-backoffice.md) - Administrative interface
- [Min Side](./apps/03-minside.md) - User dashboard
- [API](./apps/04-api.md) - Backend services

### 📚 Guides
- [Contract-First Development](./guides/01-contract-first.md) - Core development philosophy
- [Testing Strategy](./guides/02-testing.md) - Testing approach and tools
- [Deployment](./guides/03-deployment.md) - Deployment procedures
- [Performance](./guides/04-performance.md) - Performance optimization
- [Accessibility](./guides/05-accessibility.md) - A11y compliance

### 📖 Reference
- [Glossary](./reference/01-glossary.md) - Terminology and concepts
- [Troubleshooting](./reference/02-troubleshooting.md) - Common issues and solutions
- [FAQ](./reference/03-faq.md) - Frequently asked questions

## 🚀 Key Concepts

### Contract-First Architecture
We follow a strict contract-first approach where the API defines the data contracts (Projection DTOs) that are consumed directly by frontend applications without transformation.

### Design System Integration
All UI components must be imported through `@xala/ds` - never directly from `@digdir/*`. This ensures consistency and enables runtime theme switching.

### Multi-Tenancy & RBAC
The platform is built with multi-tenancy at its core, featuring role-based access control (RBAC) with audit trails for all operations.

## 🛠️ Technologies & Tools

### Core Stack
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Monorepo**: Turborepo + pnpm workspaces
- **State Management**: TanStack Query
- **Design System**: Norwegian Designsystemet (@digdir/designsystemet-react)
- **Backend**: Fastify (Node.js)
- **Database**: PostgreSQL

### Development Tools
- **Linting**: ESLint with custom guardrails
- **Testing**: Vitest (unit) + Playwright (e2e)
- **Internationalization**: Custom i18n solution
- **Deployment**: Custom deployment scripts

## 📖 Navigation

Use the sidebar navigation to browse through different sections. Each section builds upon previous knowledge, starting with basic concepts and gradually moving to advanced topics.

## 🤝 Contributing

All documentation follows the same principles as the codebase:
- Clear, concise language
- No hardcoded values (use design tokens)
- Proper internationalization
- Contract-first approach

For questions or contributions, refer to the [Development Workflow](./03-development-workflow.md) guide.
