# Troubleshooting Reference

> Last Updated: January 16, 2026

This reference guide provides solutions to common issues encountered during development, deployment, and testing of the Digilist/Xala platform. Issues are organized by category with a consistent pattern: **Symptom → Root Cause → Fix → Prevention**.

## Table of Contents

1. [Development Environment](#development-environment)
2. [Design System & Tokens](#design-system--tokens)
3. [Build & Deployment](#build--deployment)
4. [SDK & API Integration](#sdk--api-integration)
5. [Testing Issues](#testing-issues)
6. [Component Development](#component-development)
7. [Theme & Dark Mode](#theme--dark-mode)
8. [TypeScript Errors](#typescript-errors)
9. [Performance Issues](#performance-issues)

---

## Development Environment

### Issue 1: pnpm install fails with "no such file or directory"

**Symptom**: Running `pnpm install` fails with error:
```
ENOENT: no such file or directory
```

**Root Cause**: Stale lock file or corrupted node_modules cache.

**Fix**:
```bash
# Remove lock file and caches
rm -rf pnpm-lock.yaml node_modules .turbo apps/*/node_modules

# Reinstall
pnpm install
```

**Prevention**: Run `pnpm install` after pulling major changes. Keep pnpm updated: `pnpm add -g pnpm@latest`.

---

### Issue 2: dev server starts but app shows blank page

**Symptom**: `pnpm dev` runs without errors but browser shows blank white page.

**Root Cause**: Multiple causes possible:
1. Theme CSS not loaded
2. JavaScript bundle error
3. Circular dependencies

**Fix**:

1. **Check browser console** for errors:
   ```
   Press F12 → Console tab
   ```

2. **If "Cannot access before initialization" error**:
   - See [Build Issue 2: Circular Chunk Dependency](#issue-2-circular-chunk-dependency-blank-page)

3. **If CSS/styling missing**:
   - See [Design System Issue 1: Missing CSS Styles](#issue-1-missing-css-styles-in-production)

4. **Hard refresh browser**:
   ```
   Mac: Cmd+Shift+R
   Windows/Linux: Ctrl+Shift+R
   ```

**Prevention**: Always check browser console first. Run `pnpm build` to catch build errors early.

---

### Issue 3: "Cannot find module '@digilist/client-sdk'"

**Symptom**: Import error in TypeScript/React:
```typescript
Cannot find module '@digilist/client-sdk' or its corresponding type declarations
```

**Root Cause**: SDK package not built or Vite alias misconfigured.

**Fix**:

1. **Build the SDK**:
   ```bash
   cd packages/client-sdk
   pnpm build
   ```

2. **Verify Vite config** (in `apps/*/vite.config.ts`):
   ```typescript
   resolve: {
     alias: {
       '@digilist/client-sdk': path.resolve(__dirname, '../../packages/client-sdk/src'),
       '@digilist/client-sdk/hooks': path.resolve(__dirname, '../../packages/client-sdk/src/hooks'),
       '@digilist/client-sdk/types': path.resolve(__dirname, '../../packages/client-sdk/src/types'),
     },
   }
   ```

3. **Restart dev server**:
   ```bash
   pnpm dev
   ```

**Prevention**: Run `pnpm build` from monorepo root before starting development.

---

## Design System & Tokens

### Issue 1: Missing CSS Styles in Production

**Symptom**: App looks unstyled in production with broken layout, missing colors, and raw HTML appearance.

**Root Cause**: Theme CSS files loaded from `/node_modules/` paths which don't exist after build.

**Fix**:

1. **Update theme paths** in `packages/ds-themes/src/index.ts`:
   ```typescript
   // ❌ WRONG - node_modules paths don't exist in production
   const DIGILIST_THEME = [
     "/node_modules/@xala/ds-themes/generated/digilist.css",
     "/node_modules/@xala/ds-themes/themes/digilist-extensions.css",
   ];

   // ✅ CORRECT - public folder paths
   const DIGILIST_THEME = [
     "/themes/digilist.css",
     "/themes/digilist-extensions.css",
   ];
   ```

2. **Copy theme files** to each app's public folder:
   ```bash
   for app in web backoffice minside; do
     mkdir -p apps/$app/public/themes
     cp packages/ds-themes/generated/digilist.css apps/$app/public/themes/
     cp packages/ds-themes/themes/digilist-extensions.css apps/$app/public/themes/
   done
   ```

3. **Rebuild and deploy**:
   ```bash
   pnpm build
   ./scripts/deploy.sh all
   ```

**Prevention**: The deploy script now automatically copies theme files. Always test production build locally before deploying.

---

### Issue 2: ESLint error "Hardcoded color value detected"

**Symptom**: Linter shows error:
```
error  Hardcoded color value detected. Use design token instead  digdir/no-hardcoded-colors
```

**Root Cause**: Using literal color values instead of design tokens.

**Fix**:

1. **Search for existing token**:
   ```bash
   # Search generated theme
   grep "text-default" packages/ds-themes/generated/digilist.css

   # Search extensions
   grep "color" packages/ds-themes/themes/digilist-extensions.css
   ```

2. **Replace hardcoded value**:
   ```tsx
   // ❌ WRONG
   <div style={{ color: '#333333' }}>

   // ✅ CORRECT
   <div style={{ color: 'var(--ds-color-neutral-text-default)' }}>
   ```

3. **If token doesn't exist**, create extension:
   ```css
   /* In digilist-extensions.css */
   :root {
     --digilist-custom-color: #333333;
   }
   ```

**Prevention**: Always run `pnpm scan:tokens` before committing. See [Design Tokens Guide](../DESIGN_TOKENS_GUIDE.md) for complete token reference.

---

### Issue 3: Dark mode colors not updating

**Symptom**: Changed theme config but colors stay the same in dark mode.

**Root Cause**: Browser cached old CSS or tokens not regenerated.

**Fix**:

1. **Regenerate tokens**:
   ```bash
   pnpm tokens:create && pnpm tokens:build
   ```

2. **Copy to public folders**:
   ```bash
   for app in web backoffice minside; do
     cp packages/ds-themes/generated/digilist.css apps/$app/public/themes/
   done
   ```

3. **Restart dev server**:
   ```bash
   pnpm dev
   ```

4. **Hard refresh browser** (Cmd+Shift+R / Ctrl+Shift+R)

**Prevention**: After changing `designsystemet.config.json`, always regenerate tokens and restart dev server.

---

### Issue 4: Toggle group buttons have gaps

**Symptom**: Buttons in toggle groups show gaps between them instead of seamless connection.

**Root Cause**: Global `.ds-button` CSS with border-radius affects toggle group children.

**Fix**:

Add exclusion rule in `digilist-extensions.css`:
```css
/* Global button radius */
.ds-button {
  border-radius: calc(var(--ds-border-radius-md) + 5px);
}

/* Reset for toggle groups */
.ds-toggle-group .ds-button {
  border-radius: var(--ds-border-radius-md) !important;
}
```

**Prevention**: Test components in all contexts. Run `pnpm scan` to catch style conflicts.

---

### Issue 5: Import from @digdir/* blocked

**Symptom**: ESLint error:
```
error  Do not import @digdir/* directly. Use @xala/ds  digdir/prefer-ds-components
```

**Root Cause**: Direct imports from Designsystemet packages are forbidden. Must use facade.

**Fix**:

```tsx
// ❌ WRONG
import { Button } from '@digdir/designsystemet-react';
import '@digdir/designsystemet-css';

// ✅ CORRECT
import { Button } from '@xala/ds';
```

**Prevention**: Only `packages/ds/src/styles.ts` can import from `@digdir/*`. All app code imports from `@xala/ds`.

---

## Build & Deployment

### Issue 1: Vite build fails with "Circular dependency"

**Symptom**: Build fails with error:
```
(!) Circular dependency detected
vendor-misc-CvGwCr6A.js → vendor-react.js → vendor-misc-CvGwCr6A.js
```

**Root Cause**: Vite `manualChunks` configuration creates circular dependencies between chunks.

**Fix**:

Update `apps/*/vite.config.ts`:
```typescript
build: {
  rollupOptions: {
    output: {
      manualChunks: (id) => {
        // Large libraries get their own chunks
        if (id.includes('node_modules/mapbox-gl')) return 'vendor-mapbox';
        if (id.includes('node_modules/@tanstack/react-query')) {
          return 'vendor-query';
        }

        // Local packages get own chunks
        if (id.includes('packages/client-sdk/src')) return 'vendor-sdk';
        if (id.includes('packages/ds/src') || id.includes('@xala/ds')) {
          return 'vendor-ds';
        }

        // ✅ Everything else in ONE chunk - prevents circular deps
        if (id.includes('node_modules')) return 'vendor';
      },
    },
  },
}
```

**Prevention**: Keep vendor chunk splitting simple. Test production build locally: `pnpm build && pnpm preview`.

---

### Issue 2: Duplicate vite.config files

**Symptom**: Changes to `vite.config.ts` don't take effect. Build produces old chunk names.

**Root Cause**: Both `vite.config.js` and `vite.config.ts` exist. Vite prefers `.js`.

**Fix**:

```bash
# Find duplicate configs
find apps -name "vite.config.*" -type f | sort

# Remove .js files
rm apps/web/vite.config.js
rm apps/backoffice/vite.config.js
rm apps/minside/vite.config.js

# Restart dev server
pnpm dev
```

**Prevention**: Only use `.ts` config files. Add check to pre-commit hook.

---

### Issue 3: Deployment succeeds but shows old version

**Symptom**: Deployed successfully but browser shows old version of app.

**Root Cause**: Browser cache serving old JavaScript bundles.

**Fix**:

1. **Verify files on server**:
   ```bash
   ssh user@server "ls -la /var/www/html/web-test.digilist.no/assets/"
   ```

2. **Check file timestamps** - should match deployment time

3. **Hard refresh browser**:
   ```
   Mac: Cmd+Shift+R
   Windows/Linux: Ctrl+Shift+R
   ```

4. **If still showing old version**, clear browser cache:
   ```
   Chrome: Settings → Privacy → Clear browsing data
   ```

**Prevention**: Vite automatically adds content hashes to filenames. Consider adding cache-control headers on server.

---

### Issue 4: Build succeeds but production app crashes

**Symptom**: `pnpm build` completes successfully but deployed app crashes or shows errors.

**Root Cause**: Environment variables missing or different behavior in production mode.

**Fix**:

1. **Test production build locally**:
   ```bash
   pnpm build
   pnpm preview
   ```

2. **Check browser console** for errors

3. **Verify environment variables**:
   ```bash
   # Check .env.production
   cat apps/web/.env.production
   ```

4. **Common issues**:
   - API URLs pointing to localhost
   - Missing environment variables
   - Hardcoded development paths

**Prevention**: Always run `pnpm build && pnpm preview` before deploying. Test production build with real API.

---

## SDK & API Integration

### Issue 1: Direct API calls instead of SDK

**Symptom**: Code review catches `fetch()` or `axios` calls to API.

**Root Cause**: Developer bypassed SDK layer (forbidden by architecture rules).

**Fix**:

```tsx
// ❌ WRONG - Direct API call
const response = await fetch('/api/rental-objects');
const data = await response.json();

// ✅ CORRECT - Use SDK hook
import { useRentalObjects } from '@digilist/client-sdk/hooks';

function MyComponent() {
  const { data, isLoading } = useRentalObjects();
  // ...
}
```

**Prevention**: All API calls MUST go through SDK. If SDK lacks method, report gap instead of bypassing. See [CLAUDE.md](../../CLAUDE.md#sdk-first-rule).

---

### Issue 2: "TypeError: Cannot read property of undefined" in SDK hook

**Symptom**: Runtime error when using SDK hook:
```
TypeError: Cannot read properties of undefined (reading 'data')
```

**Root Cause**: SDK not initialized or tenant context missing.

**Fix**:

1. **Verify SDK initialization** in app entry point:
   ```tsx
   // apps/web/src/main.tsx
   import { initializeClient } from '@digilist/client-sdk';

   initializeClient({
     baseUrl: import.meta.env.VITE_API_URL,
     tenantId: import.meta.env.VITE_TENANT_ID,
   });
   ```

2. **Check environment variables**:
   ```bash
   # Should exist in .env
   VITE_API_URL=https://api.digilist.no
   VITE_TENANT_ID=your-tenant-id
   ```

3. **Restart dev server** after changing .env

**Prevention**: Always initialize SDK before rendering app. Check tenant context is set.

---

### Issue 3: React Query hook returns stale data

**Symptom**: Data updates on server but UI shows old data.

**Root Cause**: React Query cache not invalidated after mutation.

**Fix**:

```tsx
import { useQueryClient } from '@tanstack/react-query';

function MyComponent() {
  const queryClient = useQueryClient();

  const handleUpdate = async () => {
    await updateRentalObjectService.update(id, data);

    // ✅ Invalidate cache
    queryClient.invalidateQueries({ queryKey: ['rentalObjects'] });
  };
}
```

**Prevention**: Always invalidate relevant queries after mutations. See SDK service documentation.

---

### Issue 4: WebSocket connection fails

**Symptom**: Realtime updates not working. Console shows:
```
WebSocket connection failed: Error during WebSocket handshake
```

**Root Cause**: WebSocket URL incorrect or server not running.

**Fix**:

1. **Check WebSocket URL**:
   ```tsx
   import { realtimeClient } from '@digilist/client-sdk';

   realtimeClient.connect({
     url: 'wss://api.digilist.no/ws/audit', // Use wss:// not ws://
     tenantId: 'your-tenant',
     autoReconnect: true,
   });
   ```

2. **Verify server is running**:
   ```bash
   curl https://api.digilist.no/health
   ```

3. **Check firewall/proxy settings**

**Prevention**: Use `wss://` in production, `ws://` only in local development.

---

## Testing Issues

### Issue 1: Vitest fails with "Cannot find module"

**Symptom**: Running `pnpm test` fails with:
```
Error: Cannot find module '@xala/ds'
```

**Root Cause**: Vitest config missing path aliases.

**Fix**:

Update `vitest.config.ts`:
```typescript
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    // ...
  },
  resolve: {
    alias: {
      '@xala/ds': path.resolve(__dirname, './packages/ds/src'),
      '@digilist/client-sdk': path.resolve(__dirname, './packages/client-sdk/src'),
    },
  },
});
```

**Prevention**: Keep Vitest aliases in sync with Vite config.

---

### Issue 2: Tests pass locally but fail in CI

**Symptom**: Tests pass on developer machine but fail in GitHub Actions/CI.

**Root Cause**: Environment differences (timezone, dependencies, file paths).

**Fix**:

1. **Check test output** in CI logs

2. **Common issues**:
   - Timezone differences (use UTC in tests)
   - Missing environment variables
   - Snapshot differences (line endings)

3. **Run tests in CI mode locally**:
   ```bash
   CI=true pnpm test:run
   ```

**Prevention**: Always run `pnpm test:run` (non-watch mode) before pushing. Use deterministic test data.

---

### Issue 3: Playwright E2E tests timeout

**Symptom**: E2E tests fail with timeout:
```
Error: page.waitForSelector: Timeout 30000ms exceeded
```

**Root Cause**: Element not appearing, selector wrong, or page not loaded.

**Fix**:

1. **Run with headed mode** to see what's happening:
   ```bash
   pnpm test:e2e --headed
   ```

2. **Increase timeout** if legitimately slow:
   ```typescript
   await page.waitForSelector('.rental-object-card', { timeout: 60000 });
   ```

3. **Verify selector** in browser DevTools:
   ```
   F12 → Console → document.querySelector('.rental-object-card')
   ```

**Prevention**: Use data-testid attributes for stable selectors. Test against realistic data volumes.

---

## Component Development

### Issue 1: Component not showing in Storybook/dev

**Symptom**: Created new component but it doesn't appear or throws error.

**Root Cause**: Component not exported from package index or syntax error.

**Fix**:

1. **Check export** in `packages/ds/src/index.ts`:
   ```typescript
   export { MyComponent } from './composed/MyComponent';
   ```

2. **Verify component syntax**:
   ```typescript
   export const MyComponent = ({ children }: { children: React.ReactNode }) => {
     return <div>{children}</div>;
   };
   ```

3. **Rebuild package**:
   ```bash
   cd packages/ds
   pnpm build
   ```

**Prevention**: Follow [Component Creation Checklist](../COMPONENT_CREATION_CHECKLIST.md).

---

### Issue 2: asChild causes "Expected single child" error

**Symptom**: React error:
```
Error: asChild expects to receive a single React element child
```

**Root Cause**: Component with `asChild` prop has multiple children or fragment.

**Fix**:

```tsx
// ❌ WRONG - Multiple children
<Button asChild>
  <a href="/link">Link</a>
  <span>Extra</span>
</Button>

// ❌ WRONG - Fragment
<Button asChild>
  <>
    <a href="/link">Link</a>
  </>
</Button>

// ✅ CORRECT - Single child
<Button asChild>
  <a href="/link">Link</a>
</Button>
```

**Prevention**: ESLint rule `digdir/as-child-single-child` catches this. Run `pnpm lint`.

---

### Issue 3: Button missing type attribute warning

**Symptom**: Console warning:
```
Warning: Button is missing type attribute
```

**Root Cause**: HTML buttons without explicit type default to "submit", causing form issues.

**Fix**:

```tsx
// ❌ WRONG - No type
<button onClick={handleClick}>Click</button>

// ✅ CORRECT - Explicit type
<button type="button" onClick={handleClick}>Click</button>

// For form submissions
<button type="submit">Submit Form</button>
```

**Prevention**: ESLint rule `digdir/require-button-type` catches this. Always specify type.

---

### Issue 4: Responsive grid showing 4+ columns

**Symptom**: Grid displays 4 or more columns on wide screens despite wanting max 3.

**Root Cause**: CSS `auto-fit` doesn't cap column count.

**Fix**:

```css
/* ❌ WRONG - auto-fit doesn't limit columns */
.rental-object-grid {
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}

/* ✅ CORRECT - Strict media query breakpoints */
.rental-object-grid {
  grid-template-columns: 1fr;
}

@media (min-width: 640px) {
  .rental-object-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .rental-object-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

**Prevention**: Use explicit media queries for precise column control.

---

## Theme & Dark Mode

### Issue 1: Dark mode accent color hard to read

**Symptom**: Primary blue button is hard to read in dark mode.

**Root Cause**: Blue on dark background lacks contrast.

**Fix**:

Override accent tokens for dark mode in `digilist-extensions.css`:
```css
/* Light mode - blue */
:root, [data-color-scheme="light"] {
  --ds-color-accent-base-default: #1F4080;
}

/* Dark mode - aqua for better contrast */
[data-color-scheme="dark"] {
  --ds-color-accent-base-default: #9EDBE5;
}

/* Auto mode */
@media (prefers-color-scheme: dark) {
  [data-color-scheme="auto"] {
    --ds-color-accent-base-default: #9EDBE5;
  }
}
```

**Prevention**: Test all interactive elements in both light and dark modes. Verify contrast ratios.

---

### Issue 2: Auto mode not respecting system preference

**Symptom**: App stays in light mode even when system is set to dark.

**Root Cause**: Missing `@media (prefers-color-scheme: dark)` wrapper for auto mode tokens.

**Fix**:

```css
/* Must wrap auto mode in media query */
@media (prefers-color-scheme: dark) {
  [data-color-scheme="auto"] {
    --ds-color-neutral-background-default: #1a1a1a;
    /* ... other dark mode tokens ... */
  }
}
```

**Prevention**: Always define three selectors for theme tokens:
1. `:root, [data-color-scheme="light"]`
2. `[data-color-scheme="dark"]`
3. `@media (prefers-color-scheme: dark) { [data-color-scheme="auto"] }`

---

### Issue 3: Theme switcher doesn't persist

**Symptom**: Theme resets to default on page refresh.

**Root Cause**: Theme preference not saved to localStorage.

**Fix**:

```tsx
import { DesignsystemetProvider } from '@xala/ds';
import { useState, useEffect } from 'react';

function App() {
  const [colorScheme, setColorScheme] = useState<'light' | 'dark' | 'auto'>('auto');

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('color-scheme');
    if (saved) setColorScheme(saved as any);
  }, []);

  // Save to localStorage on change
  const handleColorSchemeChange = (scheme: 'light' | 'dark' | 'auto') => {
    setColorScheme(scheme);
    localStorage.setItem('color-scheme', scheme);
  };

  return (
    <DesignsystemetProvider colorScheme={colorScheme}>
      {/* App content */}
    </DesignsystemetProvider>
  );
}
```

**Prevention**: Always persist user preferences to localStorage.

---

## TypeScript Errors

### Issue 1: "Type is not assignable" for SDK types

**Symptom**: TypeScript error:
```
Type 'RentalObjectDTO' is not assignable to type 'RentalObjectCardProjectionDTO'
```

**Root Cause**: Using wrong DTO type. SDK provides specialized projection DTOs.

**Fix**:

```tsx
// ❌ WRONG - Generic DTO
function RentalObjectCard({ rentalObject }: { rentalObject: RentalObjectDTO }) {
  return <Card>{rentalObject.title}</Card>;
}

// ✅ CORRECT - Projection DTO
import { RentalObjectCardProjectionDTO } from '@digilist/client-sdk/types';

function RentalObjectCard({ rentalObject }: { rentalObject: RentalObjectCardProjectionDTO }) {
  return <Card>{rentalObject.title}</Card>;
}
```

**Prevention**: Use projection DTOs from SDK. Never transform data in components.

---

### Issue 2: "Cannot find type declaration"

**Symptom**: TypeScript error:
```
Cannot find type declaration file for package 'xyz'
```

**Root Cause**: Package types not installed or missing.

**Fix**:

```bash
# Install type definitions
pnpm add -D @types/xyz

# If no @types package exists, add to tsconfig.json
{
  "compilerOptions": {
    "skipLibCheck": true  // Skip type checking for node_modules
  }
}
```

**Prevention**: Always install types when adding new packages. Check if `@types/*` package exists.

---

## Performance Issues

### Issue 1: Slow initial page load

**Symptom**: App takes 5+ seconds to load initial page.

**Root Cause**: Large JavaScript bundles or unoptimized images.

**Fix**:

1. **Analyze bundle size**:
   ```bash
   pnpm build
   # Check dist/assets/*.js file sizes
   ```

2. **Code split large libraries**:
   ```typescript
   // Use dynamic imports for heavy components
   const MapView = lazy(() => import('./components/MapView'));
   ```

3. **Optimize images**:
   - Use WebP format
   - Add width/height attributes
   - Lazy load below-fold images

**Prevention**: Monitor bundle size. Run `pnpm build` regularly and check for size increases.

---

### Issue 2: React re-renders excessively

**Symptom**: UI feels sluggish. React DevTools shows many re-renders.

**Root Cause**: Missing memoization or unstable dependencies.

**Fix**:

```tsx
// ✅ Memoize expensive computations
const sortedRentalObjects = useMemo(
  () => rentalObjects.sort((a, b) => a.price - b.price),
  [rentalObjects]
);

// ✅ Memoize callbacks passed to children
const handleClick = useCallback(() => {
  console.log('clicked');
}, []);

// ✅ Memoize child components
const RentalObjectCard = memo(({ rentalObject }) => {
  return <Card>{rentalObject.title}</Card>;
});
```

**Prevention**: Use React DevTools Profiler to identify performance bottlenecks.

---

### Issue 3: Map rendering slow with many markers

**Symptom**: Mapbox map with 100+ markers is slow and janky.

**Root Cause**: Too many DOM elements rendered at once.

**Fix**:

1. **Use clustering** for many markers:
   ```tsx
   import { Cluster } from 'mapbox-gl';
   // Enable clustering in map config
   ```

2. **Virtualize markers** - only render visible markers

3. **Use canvas layers** instead of DOM markers

**Prevention**: Test with realistic data volumes. Consider clustering or pagination for large datasets.

---

## Quick Command Reference

### Debugging Commands

```bash
# Check which packages need building
pnpm build

# Clear all caches
rm -rf .turbo apps/*/dist apps/*/.turbo node_modules/.cache apps/*/node_modules/.vite

# Test production build locally
pnpm build && pnpm preview

# Run compliance scanners
pnpm scan              # Full scan
pnpm scan:tokens       # Token usage only
pnpm scan:strict       # All warnings as errors

# Check for duplicate configs
find apps -name "vite.config.*" -type f | sort

# Search for tokens
grep -r "ds-color" packages/ds-themes/
```

### Recovery Commands

```bash
# Nuclear option - full reset
rm -rf node_modules pnpm-lock.yaml .turbo apps/*/dist apps/*/node_modules
pnpm install
pnpm build

# Regenerate theme tokens
pnpm tokens:create && pnpm tokens:build

# Copy theme files to apps
for app in web backoffice minside; do
  mkdir -p apps/$app/public/themes
  cp packages/ds-themes/generated/digilist.css apps/$app/public/themes/
  cp packages/ds-themes/themes/digilist-extensions.css apps/$app/public/themes/
done
```

---

## Getting Help

If you've tried the solutions above and still have issues:

1. **Check the guides**:
   - [Deployment Guide](../DEPLOYMENT_GUIDE.md)
   - [Design Tokens Guide](../DESIGN_TOKENS_GUIDE.md)
   - [Component Creation Checklist](../COMPONENT_CREATION_CHECKLIST.md)
   - [Session Learnings](../SESSION_LEARNINGS.md)

2. **Search existing issues** in the repository

3. **Check browser console** - most errors are reported there

4. **Enable verbose logging**:
   ```bash
   DEBUG=* pnpm dev  # Enable debug logs
   ```

5. **Create a minimal reproduction** to isolate the issue

6. **Document the issue** in build-progress.txt if blocking development

---

## Contributing

Found a new issue and solution? Please add it to this guide:

1. Follow the pattern: **Issue → Symptom → Root Cause → Fix → Prevention**
2. Include code examples (both wrong and correct)
3. Add relevant commands
4. Link to related documentation
5. Test your solution before documenting

Keep this guide up-to-date as the platform evolves.
