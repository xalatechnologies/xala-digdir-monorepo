# Relative Imports to Path Aliases Migration Plan

**Date:** 2026-01-20  
**Status:** In Progress (vite-tsconfig-paths adopted)

---

## Executive Summary

Migrate ~2,100+ relative imports across 700+ files to use TypeScript path aliases, eliminating deep `../../../` chains and enabling consistent import patterns.

---

## Current State

### Import Pattern Distribution

| Pattern | Count | Priority |
|---------|-------|----------|
| Deep relatives (`../../../+`) | 145 | HIGH |
| Cross-package relatives | ~50 | HIGH |
| Medium relatives (`../../`) | 719 | MEDIUM |
| Same-directory (`./`) | 1,806 | LOW - Keep |
| Package aliases (`@xala/*`, `@digilist/*`) | 2,095 | ✅ Correct |

### Already Configured (vite-tsconfig-paths)

All 6 app vite configs now use `vite-tsconfig-paths`:

```typescript
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths({ root: path.resolve(__dirname, '../..') }),
  ],
  resolve: {
    alias: {
      // Only CSS imports (can't be resolved by tsconfig)
      '@digdir/designsystemet-css': '...',
    }
  }
});
```

**Files Updated:**
- `apps/web/vite.config.ts`
- `apps/backoffice/vite.config.ts`
- `apps/minside/vite.config.ts`
- `apps/monitoring/vite.config.ts`
- `apps/saas-admin/vite.config.ts`
- `apps/docs-learning/vite.config.ts`

---

## Canonical Alias Scheme

### Package Aliases (Root tsconfig.json)

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@xala/ds": ["./packages/ds/src/index.ts"],
      "@xala/ds/*": ["./packages/ds/src/*"],
      "@xala/i18n": ["./packages/i18n/src/index.ts"],
      "@xala/i18n/*": ["./packages/i18n/src/*"],
      "@xala/runtime": ["./packages/runtime/src/index.ts"],
      "@xala/runtime/*": ["./packages/runtime/src/*"],
      "@xala/auth": ["./packages/auth/src/index.ts"],
      "@xala/auth/*": ["./packages/auth/src/*"],
      "@digilist/client-sdk": ["./packages/client-sdk/src/index.ts"],
      "@digilist/client-sdk/*": ["./packages/client-sdk/src/*"],
      "@digilist/contracts": ["./packages/contracts/src/index.ts"],
      "@digilist/contracts/*": ["./packages/contracts/src/*"],
      "@digilist/database-schema": ["./packages/database-schema/src/index.ts"],
      "@digilist/database-schema/*": ["./packages/database-schema/src/*"],
      "@digilist/testing": ["./packages/testing/src/index.ts"],
      "@digilist/testing/*": ["./packages/testing/src/*"]
    }
  }
}
```

### App tsconfig Pattern (Inherits Root)

Each app extends root WITHOUT overriding baseUrl/paths:

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "composite": true,
    "jsx": "react-jsx",
    "noEmit": true
  },
  "include": ["src"]
}
```

**Already Fixed:**
- ✅ `apps/saas-admin/tsconfig.json`
- ✅ `apps/docs-learning/tsconfig.json`
- ✅ `apps/monitoring/tsconfig.json`
- ✅ `apps/minside/tsconfig.json`

**Pending:**
- ⚠️ `apps/web/tsconfig.json`
- ⚠️ `apps/backoffice/tsconfig.json`

---

## Migration Steps

### Step 1: Fix Remaining App tsconfigs ✅
Remove `baseUrl` and `paths` overrides from remaining apps.

### Step 2: Verify All Apps Build ✅
All 4 migrated apps verified building.

### Step 3: Run Codemod (Phase 1 - Cross-Package)
Target 145 deep relative imports in packages:

```bash
# Find files with 3+ parent traversals
grep -rE "from ['\"]\.\.\/\.\.\/\.\.\/" --include="*.ts" --include="*.tsx" packages apps
```

### Step 4: Add ESLint Rule
Create `packages/eslint-config/rules/no-deep-relatives.js`:

```javascript
module.exports = {
  create(context) {
    return {
      ImportDeclaration(node) {
        if (/^(\.\.\/){3,}/.test(node.source.value)) {
          context.report({
            node,
            message: 'Deep relative imports (3+) forbidden. Use path aliases.',
          });
        }
      }
    };
  }
};
```

### Step 5: Verify IDE Resolution
Ensure Cursor/VSCode uses tsconfig paths for autocomplete.

---

## Dependency Rules

| From | May Import | Must NOT Import |
|------|------------|-----------------|
| Apps | `@xala/*`, `@digilist/*`, react-router | Other apps, providers directly |
| Packages | Other packages (respecting order) | Apps |
| DS | Allowed packages | Apps, RuntimeProvider |

---

## Build Verification Commands

```bash
# TypeScript check
pnpm tsc --noEmit

# All app builds
for app in web backoffice minside monitoring saas-admin docs-learning; do
  cd apps/$app && npm run build
done

# Find remaining deep relatives (target: 0)
grep -rE "from ['\"]\.\.\/\.\.\/\.\.\/" --include="*.ts" --include="*.tsx" apps
```

---

## Status

| Step | Status |
|------|--------|
| vite-tsconfig-paths installed | ✅ Done (user) |
| Vite configs updated | ✅ Done (user) |
| App tsconfigs fixed | ✅ 4/6 Done |
| Apps building | ✅ 4/6 Done |
| ESLint rule created | ⚠️ Pending |
| Codemod run | ⚠️ Pending |
| Deep relatives eliminated | ⚠️ Pending |
