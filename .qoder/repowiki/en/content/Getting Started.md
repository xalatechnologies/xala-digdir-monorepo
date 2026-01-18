# Getting Started

<cite>
**Referenced Files in This Document**
- [README.md](file://README.md)
- [package.json](file://package.json)
- [turbo.json](file://turbo.json)
- [pnpm-workspace.yaml](file://pnpm-workspace.yaml)
- [.env.development.example](file://.env.development.example)
- [apps/api/.env.example](file://apps/api/.env.example)
- [apps/web/.env.example](file://apps/web/.env.example)
- [docker-compose.staging.yml](file://docker-compose.staging.yml)
- [QUICK_START.md](file://QUICK_START.md)
- [DOCS/ENVIRONMENTS.md](file://DOCS/ENVIRONMENTS.md)
- [designsystemet.config.json](file://designsystemet.config.json)
</cite>

## Table of Contents
1. [Introduction](#introduction)
2. [Prerequisites](#prerequisites)
3. [Installation](#installation)
4. [Local Development Setup](#local-development-setup)
5. [Database Initialization](#database-initialization)
6. [Running Development Servers](#running-development-servers)
7. [Development URLs](#development-urls)
8. [Theme Switching Setup](#theme-switching-setup)
9. [Project Structure Navigation](#project-structure-navigation)
10. [Troubleshooting Guide](#troubleshooting-guide)
11. [Critical Rules for Design System Usage](#critical-rules-for-design-system-usage)
12. [Practical Examples](#practical-examples)
13. [Conclusion](#conclusion)

## Introduction
This guide helps you set up and run the Xala Digdir Monorepo locally. It covers prerequisites, installation, environment configuration, database initialization, and running development servers. You will also learn how to switch themes, navigate the project structure, troubleshoot common issues, and follow the critical design system usage rules.

## Prerequisites
Ensure you have the following installed on your machine:
- Node.js: Required for running the API and frontend apps.
- pnpm: Package manager configured for this monorepo.
- Docker: Used to provision databases and static frontends during local development.

These tools are required to follow the local setup and development workflows described below.

**Section sources**
- [README.md](file://README.md#L1-L113)
- [package.json](file://package.json#L1-L115)

## Installation
Install dependencies for the entire monorepo using pnpm:
- Run: pnpm install

This installs all workspace dependencies defined under apps and packages.

**Section sources**
- [package.json](file://package.json#L5-L53)
- [pnpm-workspace.yaml](file://pnpm-workspace.yaml#L1-L6)

## Local Development Setup
The monorepo supports two primary development modes:
- Full Docker stack (recommended for most local development)
- Pure local mode (API only, with Dockerized DB/Redis)

### Option A: Full Docker Stack (Recommended)
Start the Docker services for databases and static frontends:
- Run: docker-compose up -d postgres redis web backoffice minside saas-admin tenant-admin

After starting the services, wait for PostgreSQL to be ready, then initialize the database.

### Option B: Pure Local Mode
Start only the database services in Docker:
- Run: docker-compose up -d postgres redis

Then run the API locally:
- From apps/api, run: pnpm dev

This mode lets you debug the API locally while reusing Dockerized databases.

**Section sources**
- [docker-compose.staging.yml](file://docker-compose.staging.yml#L1-L140)
- [QUICK_START.md](file://QUICK_START.md#L9-L14)
- [QUICK_START.md](file://QUICK_START.md#L34-L38)

## Database Initialization
Initialize the database with schema and seed data. This is a one-time setup after starting Docker services.

Steps:
1. Export the database connection string matching the Docker compose configuration:
   - Example export: DATABASE_URL=postgresql://digilist:digilist_secure_2026@localhost:5432/digilist_prod
2. Verify connectivity:
   - Use psql with the exported DATABASE_URL to run a simple query.
3. Run the fresh setup script:
   - Execute: ./scripts/setup-fresh-db.sh

This creates tables and seeds initial data for local development.

**Section sources**
- [QUICK_START.md](file://QUICK_START.md#L20-L30)

## Running Development Servers
Choose your preferred development mode and start the appropriate servers.

### Full Docker Stack
- Start services: docker-compose up -d postgres redis web backoffice minside saas-admin tenant-admin
- Access the frontend apps via the URLs listed in the Development URLs section.

### Pure Local Mode
- Start databases in Docker: docker-compose up -d postgres redis
- Start the API locally: cd apps/api && pnpm dev

Note: The API runs on localhost, while the frontends are served by Nginx containers managed by Docker.

**Section sources**
- [docker-compose.staging.yml](file://docker-compose.staging.yml#L3-L139)
- [QUICK_START.md](file://QUICK_START.md#L34-L38)

## Development URLs
- Web app (public): http://localhost:8080
- Backoffice (admin): http://localhost:8081
- Min Side (user): http://localhost:8082
- SaaS Admin (super admin): http://localhost:8083
- Tenant Admin: http://localhost:8084
- API health: http://localhost:3001/health

These URLs are used to access the running applications and verify the setup.

**Section sources**
- [docker-compose.staging.yml](file://docker-compose.staging.yml#L45-L129)
- [README.md](file://README.md#L45-L48)

## Theme Switching Setup
The project integrates the Norwegian Designsystemet with runtime theme switching. Configure themes using the DesignsystemetProvider and theme URLs.

Key configuration:
- Theme configuration file: designsystemet.config.json
- Theme URL registry: packages/ds-themes
- Provider usage: Wrap your app with DesignsystemetProvider and pass the desired theme.

Available themes:
- digdir (default)
- altinn
- uutilsynet
- portal

For generating real themes using the Designsystemet CLI:
- Run: pnpm tokens:create
- Run: pnpm tokens:build

These commands read designsystemet.config.json and write outputs into packages/ds-themes/.

**Section sources**
- [README.md](file://README.md#L50-L87)
- [README.md](file://README.md#L103-L113)
- [designsystemet.config.json](file://designsystemet.config.json#L1-L21)

## Project Structure Navigation
The repository is organized as a Turborepo with pnpm workspaces. Key areas:
- apps/: Application code (web, api, backoffice, minside, saas-admin, tenant-admin)
- packages/: Shared packages (ds, ds-themes, ds-registry, eslint-config, and others)
- docs/: Architectural and operational documentation
- docker/: Nginx configurations for serving frontend apps in Docker
- scripts/: Deployment and setup automation

Navigation tips:
- Use pnpm scripts to run tasks across workspaces (dev, build, lint).
- Turbo manages task dependencies and caching for efficient builds.

**Section sources**
- [README.md](file://README.md#L89-L101)
- [pnpm-workspace.yaml](file://pnpm-workspace.yaml#L1-L6)
- [turbo.json](file://turbo.json#L1-L19)

## Troubleshooting Guide
Common issues and resolutions:

- PostgreSQL connection refused:
  - Cause: Database not ready yet.
  - Resolution: Wait longer, then retry connectivity check.

- Port already in use:
  - Cause: Another service occupies the port.
  - Resolution: Identify the process using the port and stop it, or free the port.

- Frontend shows blank page:
  - Cause: Static assets not rebuilt or container not restarted.
  - Resolution: Rebuild the project and restart the affected Nginx container.

Additional Docker commands:
- View logs for a service: docker-compose logs -f <service>
- Stop all services: docker-compose down
- Restart after code changes: pnpm build && docker-compose restart <apps>

**Section sources**
- [QUICK_START.md](file://QUICK_START.md#L95-L120)

## Critical Rules for Design System Usage
Follow these rules to maintain design consistency and guardrails:
1. Never import @digdir/* directly in applications.
2. Import @xala/ds/styles exactly once in main.tsx.
3. Use DesignsystemetProvider for theme controls.
4. Do not create custom UI components in applications.
5. Follow the asChild single-child rule.

Violations can break theme consistency and automated lint checks.

**Section sources**
- [README.md](file://README.md#L81-L87)

## Practical Examples
Below are step-by-step examples to verify your setup.

### Example 1: Full Docker Stack
1. Start services:
   - docker-compose up -d postgres redis web backoffice minside saas-admin tenant-admin
2. Initialize database:
   - Export DATABASE_URL and run the setup script.
3. Verify apps:
   - Open http://localhost:8080 in your browser to confirm the web app loads.

### Example 2: Pure Local Mode
1. Start databases:
   - docker-compose up -d postgres redis
2. Start API:
   - cd apps/api && pnpm dev
3. Verify API:
   - Visit http://localhost:3001/health to confirm the API is healthy.

### Example 3: Environment Configuration
- For development, enable dev mode and configure API/WebSocket URLs in your environment file.
- For staging, load .env.staging and start the API locally.

**Section sources**
- [QUICK_START.md](file://QUICK_START.md#L9-L14)
- [QUICK_START.md](file://QUICK_START.md#L20-L30)
- [.env.development.example](file://.env.development.example#L1-L22)
- [DOCS/ENVIRONMENTS.md](file://DOCS/ENVIRONMENTS.md#L44-L60)

## Conclusion
You now have the essentials to run the Xala Digdir Monorepo locally. Use the Docker stack for a complete local environment or the pure local mode for focused API development. Follow the design system rules, configure environments appropriately, and leverage the troubleshooting tips for smooth development.