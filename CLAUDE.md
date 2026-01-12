# Claude Instructions for Xala Digdir Monorepo

Follow `AI_RULES.md` and `.cursorrules` strictly.

## Architecture
- pnpm workspaces + Turborepo
- Vite + React + TypeScript web app
- Fastify API server
- @xala/ds is the ONLY UI facade

## Critical Rules
1. Apps must NOT import @digdir/* packages
2. Import @xala/ds/styles exactly once in main.tsx
3. No custom UI components in apps
4. Use DesignsystemetProvider for theme switching
5. Follow asChild pattern (single child rule)
6. Use data attributes for modes

## Package Structure
- apps/web: Vite app with DS components
- apps/api: Fastify server
- packages/ds: UI facade with single CSS import
- packages/ds-registry: Examples and docs
- packages/eslint-config: Guardrails

## Theme Support
- digdir, altinn, uutilsynet, portal themes
- Runtime switching via provider
- Single <link> management

## Development
- pnpm dev: Run all apps
- pnpm lint: Check guardrails
- pnpm build: Build all packages
