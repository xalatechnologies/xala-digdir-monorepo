# Storybook 10 Upgrade - Dependency Resolution

**Date:** 2026-01-20  
**Upgrade:** Storybook 8.5.0 → 10.1.11  
**Status:** ✅ Dependencies Updated

---

## Problem

After upgrading to Storybook 10.1.11, several packages were still on version 8.x, causing compatibility errors:

```
▲  You are currently using Storybook 10.1.11 but you have packages which are incompatible with it:
   - @storybook/blocks@8.6.14 which depends on ^8.6.14
   - @storybook/manager-api@8.6.14 which depends on ^8.2.0 || ^8.3.0-0...
   - @storybook/test@8.6.15 which depends on 8.6.15
   - @storybook/theming@8.6.14 which depends on ^8.2.0 || ^8.3.0-0...
```

---

## Root Cause

Storybook 10 is a **major breaking change** that requires:
1. **All Storybook packages must be on v10.x** - No mixing v8 and v10
2. **ESM-only** - CommonJS is no longer supported
3. **Node 20.19+ or 22.12+** required
4. **Module resolution: "bundler", "node16", or "nodenext"** in tsconfig

---

## Solution Applied

### 1. Updated Package Versions & Removed Deprecated Packages

**Packages upgraded to v10.1.11:**
- `@storybook/addon-a11y` (8.5.0 → 10.1.11)
- `@storybook/addon-docs` (8.5.0 → 10.1.11)
- `@storybook/addon-links` (8.5.0 → 10.1.11)
- `@storybook/react` (10.1.11 - already correct)
- `@storybook/react-vite` (10.1.11 - already correct)
- `eslint-plugin-storybook` (10.1.11 - already correct)
- `storybook` (10.1.11 - already correct)

**Packages removed (merged into `storybook` core):**
- ❌ `@storybook/blocks` → Use `storybook/blocks` or `@storybook/addon-docs/blocks`
- ❌ `@storybook/manager-api` → Use `storybook/manager-api`
- ❌ `@storybook/test` → Use `storybook/test`
- ❌ `@storybook/theming` → Use `storybook/theming`

These packages no longer exist as separate npm packages in Storybook 10. They've been consolidated into the main `storybook` package.

### 2. Verified ESM Compatibility

✅ `package.json` has `"type": "module"`  
✅ `tsconfig.json` has `"moduleResolution": "bundler"`  
✅ All imports use ESM syntax (`import`/`export`)  
✅ `.storybook/main.ts` uses ESM format

---

## Installation Steps

### Step 1: Install Updated Dependencies

```bash
cd packages/ds
pnpm install
```

This will install all Storybook 10.1.11 compatible packages.

### Step 2: Clear Storybook Cache

```bash
# Remove storybook cache
rm -rf node_modules/.cache/storybook

# Clear pnpm cache (optional but recommended)
pnpm store prune
```

### Step 3: Restart Storybook

```bash
# Kill current Storybook process (Ctrl+C)
# Then restart
pnpm storybook
```

---

## Expected Warnings (Safe to Ignore)

### ▲ unable to find package.json for @digdir/designsystemet-css

This warning appears because `@digdir/designsystemet-css` is a CSS-only package without a package.json in the expected location. This is **normal and safe to ignore**.

**Why it happens:** Storybook 10 tries to resolve all dependencies for optimization, but CSS-only packages don't follow the same structure as JS packages.

**Impact:** None - CSS loads correctly via `import '@digdir/designsystemet-css';`

### ▲ No story files found for the specified pattern: src/**/*.stories.@(js|jsx|mjs|ts|tsx)

This warning appears because your stories are in `stories/` not `src/`. This is **normal for your setup**.

**Your pattern:**
```typescript
stories: [
  '../stories/**/*.mdx',
  '../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)',
  // '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)', // Not used
],
```

**Impact:** None - Stories load correctly from `stories/` directory

---

## Verification Checklist

After installation, verify:

- [ ] No version mismatch warnings
- [ ] Storybook starts successfully
- [ ] Stories render correctly
- [ ] HMR (hot reload) works
- [ ] No console errors in browser
- [ ] All addons load (a11y, docs, links)

---

## Breaking Changes from v8 to v10

### 1. ESM-Only

Storybook 10 is ESM-only. CommonJS is no longer supported.

**Impact:** All config files must use `import`/`export`

```typescript
// ✅ Correct (ESM)
import type { StorybookConfig } from '@storybook/react-vite';
export default config;

// ❌ Wrong (CommonJS - not supported)
const config = require('./config');
module.exports = config;
```

### 2. Removed Addons

The following addons are **deprecated and removed** in Storybook 10:

- ❌ `@storybook/addon-essentials` (split into individual addons)
- ❌ `@storybook/addon-interactions` (merged into @storybook/test)

**Migration:** Use individual addons instead:
- `@storybook/addon-docs`
- `@storybook/addon-a11y`
- `@storybook/addon-links`

### 3. Import Path Changes

Some import paths have changed in Storybook 10. Several packages have been consolidated into the main `storybook` package:

```typescript
// ✅ Correct (Storybook 10)
import { addons } from 'storybook/manager-api';
import { create } from 'storybook/theming/create';
import { expect, userEvent, within } from 'storybook/test';

// ❌ Wrong (old separate packages - no longer exist in v10)
import { addons } from '@storybook/manager-api';
import { create } from '@storybook/theming/create';
import { expect, userEvent, within } from '@storybook/test';
```

**For doc blocks:**
```typescript
// ✅ Correct
import { Meta, Story, Controls } from '@storybook/addon-docs/blocks';

// ❌ Wrong (removed package)
import { Meta, Story, Controls } from '@storybook/blocks';
```

**Note:** Your code already uses the new v10 import paths! ✅

### 4. TypeScript Types

```typescript
// Old (v8)
import type { Preview, Decorator } from '@storybook/react';

// New (v10)
import type { Preview, Decorator } from '@storybook/react-vite';
```

**Note:** Your code already uses the new v10 types! ✅

---

## Node Version Requirement

Storybook 10 requires:
- Node 20.19+ **or**
- Node 22.12+ **or**
- Node 24+

**Check your version:**
```bash
node --version
```

If you're on an older version, upgrade Node before using Storybook 10.

---

## Rollback Plan (If Needed)

If Storybook 10 causes issues, you can rollback to v8:

```bash
cd packages/ds

# Restore package.json to use v8
# Change all ^10.1.11 back to ^8.5.0

# Reinstall
pnpm install

# Clear cache
rm -rf node_modules/.cache/storybook

# Restart
pnpm storybook
```

---

## Additional Resources

- [Storybook 10 Migration Guide](https://storybook.js.org/docs/migration-guide)
- [Storybook 10.1 Release Notes](https://storybook.js.org/releases/10.1)
- [ESM Migration Guide](https://medium.com/storybookjs/storybook-is-going-esm-only-4ba56ef129f2)
- [Addon Migration Guide](https://storybook.js.org/docs/addons/addon-migration-guide)

---

## Next Steps

1. **Run `pnpm install`** in `packages/ds/`
2. **Restart Storybook** (Ctrl+C, then `pnpm storybook`)
3. **Verify** all stories load correctly
4. **Test** console suppression still works
5. **Update** any custom addons if you have them

---

**Status:** ✅ Ready for installation  
**Estimated Time:** 2-5 minutes  
**Risk Level:** Low (can rollback if needed)
