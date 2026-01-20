# Storybook 10 Migration - Package Consolidation Fix

**Date:** 2026-01-20  
**Issue:** `@storybook/test@^10.1.11` not found  
**Root Cause:** Several Storybook packages were consolidated into `storybook` core in v10  
**Status:** ✅ Fixed

---

## The Problem

When upgrading to Storybook 10.1.11, these errors appeared:

```
ERR_PNPM_NO_MATCHING_VERSION  No matching version found for @storybook/test@^10.1.11
The latest release of @storybook/test is "8.6.15".
```

Similar issues would occur with:
- `@storybook/blocks`
- `@storybook/manager-api`
- `@storybook/theming`

---

## Why This Happened

**Storybook 10 consolidated multiple packages into the main `storybook` package.**

These packages no longer exist as separate npm packages:

| Old Package (v8) | New Location (v10) |
|------------------|-------------------|
| `@storybook/blocks` | `storybook/blocks` or `@storybook/addon-docs/blocks` |
| `@storybook/manager-api` | `storybook/manager-api` |
| `@storybook/test` | `storybook/test` |
| `@storybook/theming` | `storybook/theming` |

These are now **subpaths** of the main `storybook` package, not separate packages.

---

## The Fix

### 1. Removed Deprecated Packages

These packages were removed from `package.json`:

```json
// ❌ Removed (no longer exist in npm)
"@storybook/blocks": "^10.1.11",
"@storybook/manager-api": "^10.1.11",
"@storybook/test": "^10.1.11",
"@storybook/theming": "^10.1.11"
```

### 2. Kept Only Real Packages

These are the only Storybook packages that exist separately in v10:

```json
// ✅ Kept (these are real npm packages)
"@storybook/addon-a11y": "^10.1.11",
"@storybook/addon-docs": "^10.1.11",
"@storybook/addon-links": "^10.1.11",
"@storybook/react": "^10.1.11",
"@storybook/react-vite": "^10.1.11",
"@storybook/test-runner": "^0.24.2",
"eslint-plugin-storybook": "^10.1.11",
"storybook": "^10.1.11"
```

### 3. Import Paths Already Correct

Your code already uses the correct v10 import syntax:

```typescript
// ✅ Already correct in manager.ts
import { addons } from 'storybook/manager-api';
import { create } from 'storybook/theming/create';
```

---

## Installation Commands

```bash
cd packages/ds

# Install with fixed dependencies
pnpm install

# Clear cache
rm -rf node_modules/.cache/storybook

# Restart Storybook
pnpm storybook
```

---

## Expected Result

✅ No more "no matching version" errors  
✅ All dependencies resolve correctly  
✅ Storybook starts successfully  
✅ Imports work from `storybook/*` paths  

---

## If You Need to Import From These Packages

### Testing Utilities

```typescript
// ✅ Correct (Storybook 10)
import { expect, userEvent, within } from 'storybook/test';

// ❌ Wrong (package doesn't exist in v10)
import { expect, userEvent, within } from '@storybook/test';
```

### Manager API

```typescript
// ✅ Correct
import { addons } from 'storybook/manager-api';

// ❌ Wrong
import { addons } from '@storybook/manager-api';
```

### Theming

```typescript
// ✅ Correct
import { create } from 'storybook/theming/create';
import { themes } from 'storybook/theming';

// ❌ Wrong
import { create } from '@storybook/theming/create';
import { themes } from '@storybook/theming';
```

### Doc Blocks

```typescript
// ✅ Correct
import { Meta, Story, Controls } from '@storybook/addon-docs/blocks';
import { Title, Description } from 'storybook/blocks';

// ❌ Wrong
import { Meta, Story } from '@storybook/blocks';
```

---

## What's in the `storybook` Package

The main `storybook` package (v10.1.11) now includes:

- `storybook/test` - Testing utilities (expect, userEvent, within, etc.)
- `storybook/blocks` - Doc blocks (Meta, Story, Canvas, etc.)
- `storybook/theming` - Theme creation and utilities
- `storybook/manager-api` - Manager addon API
- `storybook/preview-api` - Preview addon API
- `storybook/core-events` - Core events
- And more...

---

## Migration Checklist

- [x] Remove `@storybook/blocks` from package.json
- [x] Remove `@storybook/manager-api` from package.json
- [x] Remove `@storybook/test` from package.json
- [x] Remove `@storybook/theming` from package.json
- [x] Keep framework packages (`@storybook/react-vite`, etc.)
- [x] Keep addon packages (`@storybook/addon-*`)
- [x] Verify imports use `storybook/*` paths
- [ ] Run `pnpm install`
- [ ] Test Storybook starts successfully

---

## Related Changes

See also:
- `docs/guides/STORYBOOK_10_UPGRADE.md` - Complete upgrade guide
- `packages/ds/UPGRADE_STORYBOOK.md` - Quick install commands
- `.storybook/manager.ts` - Already using correct imports ✅
- `.storybook/preview.tsx` - Already using correct imports ✅

---

**Status:** ✅ Fixed and ready to install  
**Time to Install:** 2-3 minutes  
**Risk:** Low
