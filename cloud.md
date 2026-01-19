# Cloud & Deployment Guide

> Last Updated: 2026-01-19

This document provides deployment and cloud infrastructure guidelines for the Digilist platform.

---

## Design System Package (`@xala/ds`)

### Package Structure

```
packages/ds/
├── src/
│   ├── primitives/      # Low-level building blocks
│   ├── composed/        # Mid-level components
│   ├── blocks/          # Business components
│   ├── shells/          # App layouts
│   └── index.ts         # Main exports
├── package.json
└── tsconfig.json
```

### Building the Design System

```bash
# Build the DS package
pnpm -F @xala/ds build

# Build all packages (recommended)
pnpm -r build
```

### Versioning Strategy

The design system uses **workspace versioning**:

```json
// packages/ds/package.json
{
  "name": "@xala/ds",
  "version": "1.0.0",
  "main": "./src/index.ts",
  "types": "./src/index.ts"
}
```

When making changes:
1. Update the version in `package.json`
2. Run `pnpm -r build` to rebuild all packages
3. Commit and deploy

### How Apps Consume the Package

All apps reference the DS package via workspace protocol:

```json
// apps/backoffice/package.json
{
  "dependencies": {
    "@xala/ds": "workspace:*"
  }
}
```

---

## Deployment Architecture

### Infrastructure Stack

```
├── VPS Server (Hetzner/DigitalOcean)
│   ├── Nginx (reverse proxy)
│   ├── PM2 (process manager)
│   ├── PostgreSQL 16
│   └── Node.js 22
```

### Deployment Workflow

```bash
# 1. Build all packages and apps
pnpm -r build

# 2. Deploy API
rsync -avz --delete apps/api/dist/ server:/var/www/digilist-api/

# 3. Deploy frontends
rsync -avz --delete apps/web/dist/ server:/var/www/digilist/web/
rsync -avz --delete apps/backoffice/dist/ server:/var/www/digilist/backoffice/
rsync -avz --delete apps/minside/dist/ server:/var/www/digilist/minside/

# 4. Restart services
ssh server "pm2 restart xala-api"
```

### CI/CD Caching

Design system builds are cached:

```yaml
# .github/workflows/build.yml
- name: Cache pnpm store
  uses: actions/cache@v4
  with:
    path: ~/.pnpm-store
    key: ${{ runner.os }}-pnpm-${{ hashFiles('**/pnpm-lock.yaml') }}

- name: Cache turbo
  uses: actions/cache@v4
  with:
    path: node_modules/.cache/turbo
    key: ${{ runner.os }}-turbo-${{ github.sha }}
```

---

## UI Component Reuse-First Rules

> **⚠️ CRITICAL for Cloud Deployments**

### Rule 1: Always Import from `@xala/ds`

```typescript
// ✅ CORRECT
import { DataTable, PageHeader, EmptyState } from '@xala/ds';

// ❌ WRONG - Creates bundle duplication
import { ProtectedRoute } from '../components/ProtectedRoute';
```

### Rule 2: No App-Local Duplicates

App-local duplicates increase bundle size and cause inconsistencies.

**Before deployment, verify:**
```bash
# Check for duplicated components
find apps/*/src/components -name "ProtectedRoute*" -o -name "LoadingFallback*"
# Should return empty - use DS versions instead
```

### Rule 3: Design System Changes Require Full Rebuild

```bash
# After ANY DS change:
pnpm -F @xala/ds build
pnpm -F @xala/backoffice build
pnpm -F @xala/minside build
pnpm -F @xala/web build
pnpm -F @xala/saas-admin build

# Then deploy all apps
```

### Rule 4: Use Design Tokens in Production

Hardcoded styles break theming and dark mode:

```css
/* ✅ CORRECT - Tokens work across themes */
.component {
  background: var(--ds-color-neutral-surface-default);
  padding: var(--ds-spacing-4);
}

/* ❌ WRONG - Breaks dark mode */
.component {
  background: #ffffff;
  padding: 16px;
}
```

---

## Quick Reference

### Component Documentation

| Document | Purpose |
|----------|---------|
| [Component Inventory](docs/design-system/component-inventory.md) | Full list of available components |
| [Usage Guidelines](docs/design-system/component-usage-guidelines.md) | How to use components correctly |
| [Gaps & Plan](docs/design-system/component-gaps-and-plan.md) | Missing components and roadmap |
| [App Audit](docs/design-system/app-shared-components-audit.md) | Duplicate analysis |

### Key Commands

```bash
# Build DS package only
pnpm -F @xala/ds build

# Build all packages
pnpm -r build

# Type check DS package
pnpm -F @xala/ds typecheck

# Watch mode for development
pnpm -F @xala/ds dev
```

### Environment Variables

```bash
# Production
NODE_ENV=production
VITE_API_URL=https://api.digilist.no

# Staging
NODE_ENV=staging
VITE_API_URL=https://api.staging.digilist.no
```

---

## Troubleshooting

### Issue: Component not found after DS update

```bash
# Solution: Rebuild all apps
pnpm -r build
```

### Issue: Old component styles appearing

```bash
# Solution: Clear browser cache and turbo cache
rm -rf node_modules/.cache/turbo
pnpm -r build
```

### Issue: Type errors after DS change

```bash
# Solution: Check DS exports
pnpm -F @xala/ds typecheck
# Then rebuild dependents
pnpm -F @xala/backoffice build
```
