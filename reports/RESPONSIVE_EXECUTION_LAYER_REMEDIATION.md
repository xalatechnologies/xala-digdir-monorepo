# Responsive Execution Layer — Remediation Plan

**Date:** 2026-01-13  
**Repository:** xala-digdir-monorepo  
**Author:** Claude (Senior Design System Architect + Frontend Platform Engineer)

---

## A) Root Cause Diagnosis

### The Single Most Critical Structural Flaw

> **`data-size` is decorative infrastructure — set on DOM but never consumed by CSS.**

The provider correctly sets `data-size="sm|md|lg"` on `document.documentElement`, but:

1. **Zero CSS selectors** in `digilist.css` (or any theme file) use `[data-size="*"]`
2. **Zero `@media` queries** exist anywhere in the codebase
3. **Zero `@container` queries** exist anywhere in the codebase
4. **The Grid primitive** has a `responsive` prop interface that is **explicitly not implemented** (see `grid.tsx:72-73`)

This means the app has **responsive plumbing with no water flowing through it**.

### Why Superficial Fixes Will Not Scale

| Approach | Why It Fails |
|----------|--------------|
| "Add media queries to ListingGrid" | Creates one-off fix; next component breaks the same way |
| "Replace hardcoded px with tokens" | Tokens exist but don't respond to viewport/container size |
| "Set columns=1 on mobile via JS" | Requires manual intervention per component; no cascade |
| "Use CSS-in-JS media queries" | Scatters breakpoint logic; violates "breakpoints only in shell/primitives" principle |

**The root cause is systemic:** There is no **Responsive Execution Layer** — a mechanism that:
1. Connects `data-size` to actual CSS variable values
2. Provides container-query-aware primitives
3. Makes components responsive by default without per-component media queries

---

## B) Responsive Execution Layer Specification

### B.1 Size Modes (`sm` / `md` / `lg`)

#### Where `data-size` Lives
- **Provider sets it:** `packages/ds/src/provider.tsx:96-123` → `document.documentElement.setAttribute('data-size', size)`
- **Current default:** `md`

#### What Variables It Must Control

| Variable Category | `sm` (Mobile) | `md` (Tablet/Default) | `lg` (Desktop) |
|-------------------|---------------|----------------------|----------------|
| `--ds-size-spacing-unit` | `4px` | `4px` | `4px` |
| `--ds-size-spacing-scale` | `0.875` | `1` | `1.125` |
| `--ds-size-touch-target` | `44px` | `44px` | `40px` |
| `--ds-size-container-padding` | `var(--ds-spacing-4)` | `var(--ds-spacing-6)` | `var(--ds-spacing-8)` |
| `--ds-size-gap-default` | `var(--ds-spacing-4)` | `var(--ds-spacing-6)` | `var(--ds-spacing-8)` |
| `--ds-size-header-height` | `56px` | `72px` | `80px` |
| `--ds-size-font-scale` | `0.9375` | `1` | `1.0625` |

#### CSS Implementation Pattern

```css
/* In digilist.css — Size Mode Tokens */
:root,
[data-size="md"] {
  --ds-size-spacing-scale: 1;
  --ds-size-touch-target: 44px;
  --ds-size-container-padding: var(--ds-spacing-6);
  --ds-size-gap-default: var(--ds-spacing-6);
  --ds-size-header-height: 72px;
  --ds-size-font-scale: 1;
}

[data-size="sm"] {
  --ds-size-spacing-scale: 0.875;
  --ds-size-touch-target: 44px; /* Never reduce below WCAG minimum */
  --ds-size-container-padding: var(--ds-spacing-4);
  --ds-size-gap-default: var(--ds-spacing-4);
  --ds-size-header-height: 56px;
  --ds-size-font-scale: 0.9375;
}

[data-size="lg"] {
  --ds-size-spacing-scale: 1.125;
  --ds-size-touch-target: 40px;
  --ds-size-container-padding: var(--ds-spacing-8);
  --ds-size-gap-default: var(--ds-spacing-8);
  --ds-size-header-height: 80px;
  --ds-size-font-scale: 1.0625;
}
```

#### Integration with Existing Digdir Tokens

Size mode tokens **compose with** (not replace) Digdir spacing tokens:

```css
/* Components use computed values */
.ds-container {
  padding: var(--ds-size-container-padding); /* Reads from size mode */
}

.ds-grid {
  gap: var(--ds-size-gap-default); /* Reads from size mode */
}
```

---

### B.2 Breakpoint Tokens

#### Standard Breakpoint Custom Properties

```css
:root {
  /* Breakpoint values (for JS/documentation reference) */
  --ds-breakpoint-sm: 640px;
  --ds-breakpoint-md: 768px;
  --ds-breakpoint-lg: 1024px;
  --ds-breakpoint-xl: 1280px;
  --ds-breakpoint-2xl: 1536px;
}
```

#### Usage Rule: Breakpoints Only in Shell/Primitives

| Allowed | Forbidden |
|---------|-----------|
| `packages/ds/src/shells/*` | `packages/ds/src/blocks/*` |
| `packages/ds/src/primitives/*` | `apps/web/src/*` |
| `packages/ds/src/composed/content-layout.tsx` | Any component-level media query |

#### Auto Size Mode Switching (Optional Enhancement)

```css
/* Auto-switch data-size based on viewport */
@media (max-width: 640px) {
  :root:not([data-size-locked]) {
    --ds-size-spacing-scale: 0.875;
    --ds-size-container-padding: var(--ds-spacing-4);
    /* ... sm values ... */
  }
}

@media (min-width: 1280px) {
  :root:not([data-size-locked]) {
    --ds-size-spacing-scale: 1.125;
    --ds-size-container-padding: var(--ds-spacing-8);
    /* ... lg values ... */
  }
}
```

---

### B.3 Container Query Infrastructure

#### Which Primitives Become Containers

| Component | Container Name | Rationale |
|-----------|----------------|-----------|
| `Container` | `ds-container` | Main content wrapper |
| `ContentLayout` | `ds-content` | Page content area |
| `AppShell` | `ds-shell` | Root application shell |
| `Drawer` | `ds-drawer` | Side panel (sidebar use case) |

#### Implementation

```tsx
// In container.tsx
const containerStyle: React.CSSProperties = {
  containerType: 'inline-size',
  containerName: 'ds-container',
  // ... existing styles
};
```

```css
/* In digilist.css — Container Query Tiers */
@container ds-container (max-width: 600px) {
  .ds-grid-responsive {
    --_grid-columns: 1;
  }
}

@container ds-container (min-width: 601px) and (max-width: 900px) {
  .ds-grid-responsive {
    --_grid-columns: 2;
  }
}

@container ds-container (min-width: 901px) {
  .ds-grid-responsive {
    --_grid-columns: 3;
  }
}
```

#### Container Query Tiers → Size Mode Mapping

| Container Width | Equivalent Size | Grid Columns |
|-----------------|-----------------|--------------|
| `< 600px` | `sm` | 1 |
| `600px – 900px` | `md` | 2 |
| `> 900px` | `lg` | 3+ |

---

### B.4 Layout Tokens

```css
:root {
  /* Max widths */
  --ds-layout-max-content: 1440px;
  --ds-layout-max-prose: 65ch;
  --ds-layout-max-search: 520px;
  --ds-layout-sidebar-width: 280px;
  
  /* Padding modes (consumed by size mode) */
  --ds-layout-padding-inline: var(--ds-size-container-padding);
  --ds-layout-padding-block: var(--ds-spacing-6);
  
  /* Grid defaults */
  --ds-layout-grid-min-column: 280px;
  --ds-layout-grid-gap: var(--ds-size-gap-default);
}
```

---

### B.5 Touch Target Baseline

```css
:root {
  --ds-touch-target-min: 44px;
  --ds-touch-target-comfortable: 48px;
}

/* Applied to interactive elements */
.ds-button,
.ds-icon-button,
.ds-checkbox,
.ds-radio {
  min-width: var(--ds-touch-target-min);
  min-height: var(--ds-touch-target-min);
}
```

---

## C) Minimal Change Strategy

### What Stays Exactly the Same

| Item | Reason |
|------|--------|
| Component visual design | No UI redesign mandate |
| Theme colors (digilist.css color tokens) | Already working correctly |
| Provider API surface | `theme`, `colorScheme`, `size` props unchanged |
| Import structure | `@xala/ds` facade pattern remains |
| App code (`apps/web/src/App.tsx`) | Thin app principle preserved |
| ESLint guardrails | Existing rules continue working |

### What Changes (Invisibly)

| Change | Location | User Impact |
|--------|----------|-------------|
| Add `[data-size]` CSS selectors | `digilist.css` | None visible |
| Add `container-type` to primitives | `container.tsx`, `content-layout.tsx` | None visible |
| Add layout/breakpoint tokens | `digilist.css` | None visible |
| Implement Grid responsive prop | `grid.tsx` | None visible (API already exists) |

### What Changes (Slightly Visible on Mobile Only)

| Change | Current | After | Acceptable? |
|--------|---------|-------|-------------|
| ListingGrid columns | Always 3 | 1 on mobile, 2 on tablet, 3 on desktop | ✅ Yes |
| ListingListItem layout | Horizontal overflow | Stacked on mobile | ✅ Yes |
| Header height | 80px always | 56px on mobile | ✅ Yes |
| Container padding | 32px always | 16px on mobile | ✅ Yes |
| Card gaps | 32px always | 16px on mobile | ✅ Yes |

---

## D) Implementation Plan — Step-by-Step

### Step 1: Tokens + Size Mode Wiring

**Files to change:**
- `packages/ds-themes/themes/digilist.css`

**What to change:**
Add size mode CSS selectors and layout tokens.

**Minimal diff:**
```css
/* Add to digilist.css */

/* === RESPONSIVE EXECUTION LAYER === */

/* Breakpoint reference tokens */
:root {
  --ds-breakpoint-sm: 640px;
  --ds-breakpoint-md: 768px;
  --ds-breakpoint-lg: 1024px;
  --ds-breakpoint-xl: 1280px;
}

/* Layout tokens */
:root {
  --ds-layout-max-content: 1440px;
  --ds-layout-max-prose: 65ch;
  --ds-layout-grid-min-column: 280px;
  --ds-touch-target-min: 44px;
}

/* Size mode: md (default) */
:root,
[data-size="md"] {
  --ds-size-container-padding: var(--ds-spacing-6);
  --ds-size-gap-default: var(--ds-spacing-6);
  --ds-size-header-height: 72px;
}

/* Size mode: sm (mobile) */
[data-size="sm"] {
  --ds-size-container-padding: var(--ds-spacing-4);
  --ds-size-gap-default: var(--ds-spacing-4);
  --ds-size-header-height: 56px;
}

/* Size mode: lg (desktop) */
[data-size="lg"] {
  --ds-size-container-padding: var(--ds-spacing-8);
  --ds-size-gap-default: var(--ds-spacing-8);
  --ds-size-header-height: 80px;
}

/* Auto size switching based on viewport */
@media (max-width: 640px) {
  :root {
    --ds-size-container-padding: var(--ds-spacing-4);
    --ds-size-gap-default: var(--ds-spacing-4);
    --ds-size-header-height: 56px;
  }
}

@media (min-width: 1280px) {
  :root {
    --ds-size-container-padding: var(--ds-spacing-8);
    --ds-size-gap-default: var(--ds-spacing-8);
    --ds-size-header-height: 80px;
  }
}
```

**Risk:** Low — additive CSS, no existing selectors affected  
**Verify:** Inspect computed styles for `--ds-size-*` tokens at different viewports

---

### Step 2: Container Query Enablement

**Files to change:**
- `packages/ds/src/primitives/container.tsx`
- `packages/ds/src/composed/content-layout.tsx`

**What to change:**
Add `containerType: 'inline-size'` to style objects.

**Minimal diff (container.tsx):**
```tsx
// Line 52-60: Add container query support
const containerStyle: React.CSSProperties = {
  containerType: 'inline-size',  // ADD THIS
  containerName: 'ds-container', // ADD THIS
  maxWidth: fluid ? 'none' : maxWidth,
  margin: '0 auto',
  padding: typeof padding === 'number' ? `${padding}px` : padding,
  // ...
};
```

**Minimal diff (content-layout.tsx):**
```tsx
// Add to wrapper div style
const layoutStyle: React.CSSProperties = {
  containerType: 'inline-size',  // ADD THIS
  containerName: 'ds-content',   // ADD THIS
  maxWidth: maxWidth,
  // ...
};
```

**Risk:** Low — `container-type` is additive, doesn't change layout  
**Verify:** DevTools → Elements → check `container-type` property exists

---

### Step 3: Grid Primitive Responsive Implementation

**Files to change:**
- `packages/ds/src/primitives/grid.tsx`
- `packages/ds-themes/themes/digilist.css`

**What to change:**
Implement the existing `responsive` prop interface.

**Minimal diff (grid.tsx):**
```tsx
// Replace lines 62-74 with:
const getResponsiveClass = () => {
  if (!responsive) return '';
  return 'ds-grid-responsive';
};

// Add CSS custom properties for responsive columns
const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: responsive 
    ? 'repeat(var(--_grid-columns, 1), 1fr)'
    : columns,
  gridTemplateRows: rows,
  gap: typeof gap === 'number' ? `${gap}px` : gap,
  // Set responsive column hints via CSS vars
  '--_grid-sm': responsive?.sm || '1',
  '--_grid-md': responsive?.md || '2', 
  '--_grid-lg': responsive?.lg || '3',
  ...style
} as React.CSSProperties;

return (
  <div 
    className={cn(getResponsiveClass(), className)} 
    style={gridStyle}
  >
    {children}
  </div>
);
```

**Minimal diff (digilist.css):**
```css
/* Container query responsive grid */
.ds-grid-responsive {
  --_grid-columns: var(--_grid-sm, 1);
}

@container ds-container (min-width: 600px) {
  .ds-grid-responsive {
    --_grid-columns: var(--_grid-md, 2);
  }
}

@container ds-container (min-width: 900px) {
  .ds-grid-responsive {
    --_grid-columns: var(--_grid-lg, 3);
  }
}

/* Fallback media queries for non-container contexts */
@media (min-width: 640px) {
  .ds-grid-responsive {
    --_grid-columns: var(--_grid-md, 2);
  }
}

@media (min-width: 1024px) {
  .ds-grid-responsive {
    --_grid-columns: var(--_grid-lg, 3);
  }
}
```

**Risk:** Medium — changes Grid behavior when `responsive` prop is used  
**Verify:** Render Grid with `responsive={{ sm: '1', md: '2', lg: '3' }}`, resize viewport

---

### Step 4: Fix P0 Breakers

#### 4a. ListingGrid.tsx

**File:** `packages/ds/src/blocks/ListingGrid.tsx`

**Current problem (line 29-33):**
```tsx
gridTemplateColumns: `repeat(${columns}, 1fr)`,
gap: `${gap}px`,
```

**Minimal fix:**
```tsx
// Change props interface
export interface ListingGridProps {
  /** Minimum card width for auto-fit (default: 280px) */
  minCardWidth?: number;
  /** Gap between cards (default: uses size mode token) */
  gap?: number | string;
  // ... rest
}

// Change implementation
export function ListingGrid({
  minCardWidth = 280,
  gap,
  children,
  className,
}: ListingGridProps) {
  return (
    <div
      className={cn('listing-grid', className)}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fit, minmax(${minCardWidth}px, 1fr))`,
        gap: gap ? (typeof gap === 'number' ? `${gap}px` : gap) : 'var(--ds-size-gap-default)',
      }}
    >
      {children}
    </div>
  );
}
```

**Risk:** Low — `auto-fit` with `minmax` is backward-compatible  
**Verify:** Cards reflow from 3→2→1 columns as viewport shrinks

#### 4b. ListingListItem.tsx

**File:** `packages/ds/src/blocks/ListingListItem.tsx`

**Current problem (lines 176-177, 328-329):**
```tsx
width: `${imageWidth}px`,
minWidth: `${imageWidth}px`,
// ...
width: `${mapWidth}px`,
minWidth: `${mapWidth}px`,
```

**Minimal fix — add responsive class and CSS:**
```tsx
// Add responsive wrapper class
<div
  className={cn('listing-list-item', className)}
  style={{
    display: 'flex',
    flexDirection: 'row',  // Will override to column on mobile via CSS
    flexWrap: 'wrap',      // Allow wrapping
    // ... rest
  }}
>
```

**Add to digilist.css:**
```css
/* ListingListItem responsive */
@media (max-width: 700px) {
  .listing-list-item {
    flex-direction: column !important;
  }
  
  .listing-list-item > *:first-child {
    /* Image section */
    width: 100% !important;
    min-width: unset !important;
    max-height: 200px;
  }
  
  .listing-list-item > *:last-child {
    /* Map section - hide on mobile */
    display: none !important;
  }
}
```

**Risk:** Medium — changes mobile layout (acceptable per requirements)  
**Verify:** ListItem stacks vertically on mobile, no horizontal overflow

#### 4c. Header.tsx

**File:** `packages/ds/src/composed/header.tsx`

**Current problem (line 71, 128, 148):**
```tsx
height = '80px',
padding="0 var(--ds-spacing-8)"
maxWidth: '520px'
```

**Minimal fix:**
```tsx
// Line 71: Use size mode token
height = 'var(--ds-size-header-height, 72px)',

// Line 128: Use size mode token
<Container maxWidth="var(--ds-layout-max-content)" padding="0 var(--ds-size-container-padding)">

// Line 148: Make search flexible
{search && (
  <div style={{
    flex: '1 1 auto',
    maxWidth: '520px',
    minWidth: '120px',  // Collapse gracefully
  }}>
    {search}
  </div>
)}
```

**Risk:** Low — uses existing size mode tokens  
**Verify:** Header shrinks to 56px on mobile, padding reduces

---

### Step 5: Replace Hardcoded px with Tokens

**Files to change:**
- `packages/ds/src/blocks/ListingCard.tsx`
- `packages/ds/src/blocks/ListingListItem.tsx`
- `packages/ds/src/composed/header-parts.tsx`
- `packages/ds/src/composed/filter-bar.tsx`

**Token mapping reference:**

| Hardcoded | Token Replacement |
|-----------|-------------------|
| `'4px'` | `var(--ds-spacing-1)` |
| `'8px'` | `var(--ds-spacing-2)` |
| `'12px'` | `var(--ds-spacing-3)` |
| `'16px'` | `var(--ds-spacing-4)` |
| `'20px'` | `var(--ds-spacing-5)` |
| `'24px'` | `var(--ds-spacing-6)` |
| `'32px'` | `var(--ds-spacing-8)` |
| `'48px'` | `var(--ds-spacing-12)` |
| `borderRadius: '12px'` | `var(--ds-border-radius-lg)` |
| `fontWeight: 600` | `var(--ds-font-weight-semibold)` |

**Risk:** Low — visual parity maintained  
**Verify:** Run `pnpm scan:tokens` — expect zero warnings

---

### Step 6: Add Governance

**Files to change:**
- `packages/eslint-config/index.js`

**What to change:**
Promote spacing rule to error in `strict` config.

**Minimal diff:**
```js
// In strict config, change:
'digdir/no-hardcoded-spacing': 'error',  // Was 'warn'
'digdir/no-hardcoded-typography': 'error',  // Was 'warn'
'digdir/no-hardcoded-border-radius': 'error',  // Was 'warn'
```

**Risk:** Low — only affects CI/strict scans  
**Verify:** `pnpm scan:strict` fails if hardcoded values reintroduced

---

## E) Acceptance Criteria

### Viewport Tests (Pass/Fail)

| Viewport | Width | Expected Behavior | Pass Criteria |
|----------|-------|-------------------|---------------|
| iPhone SE | 375px | 1-column grid, stacked list items, compact header | No horizontal scroll |
| iPhone 12 | 390px | Same as SE | No horizontal scroll |
| iPhone 14 Pro Max | 430px | Same as SE | No horizontal scroll |
| iPad Mini | 768px | 2-column grid, horizontal list items | No horizontal scroll |
| iPad Pro | 1024px | 2-3 column grid | Cards ≥ 280px wide |
| Desktop | 1440px | 3-column grid | Centered, max-width applied |
| Large Desktop | 1920px | 3-column grid | Max-width 1440px, centered |

### Component-Specific Criteria

| Component | Criteria | Measurement |
|-----------|----------|-------------|
| **ListingGrid** | Cards reflow automatically | Column count matches container width |
| **ListingListItem** | No overflow | Fits within 375px viewport |
| **AppHeader** | Height adapts | 56px on mobile, 72px default, 80px desktop |
| **Touch targets** | All buttons tappable | Min 44×44px hit area |
| **200% zoom** | Content reflows | No horizontal scroll at 200% zoom |

### Token Compliance

| Check | Method | Expected |
|-------|--------|----------|
| No hardcoded spacing | `pnpm scan:strict` | 0 errors |
| No hardcoded colors | `pnpm scan:strict` | 0 errors |
| Size mode tokens used | Grep for `var(--ds-size-` | Found in primitives |
| Container queries active | DevTools container query overlay | Visible on Container/ContentLayout |

---

## F) Verification Matrix

### Manual Checklist

```
[ ] Mobile (375px): ListingGrid shows 1 column
[ ] Mobile (375px): ListingListItem stacks vertically
[ ] Mobile (375px): Header height is 56px
[ ] Mobile (375px): No horizontal scrollbar
[ ] Mobile (375px): All buttons are tappable (44×44 minimum)
[ ] Tablet (768px): ListingGrid shows 2 columns
[ ] Tablet (768px): ListingListItem shows horizontally
[ ] Desktop (1440px): ListingGrid shows 3 columns
[ ] Desktop (1440px): Content max-width is 1440px
[ ] Zoom 200%: Content reflows, no horizontal scroll
[ ] Theme switch: Light/dark works at all viewports
[ ] Size mode switch: `data-size="sm"` reduces spacing
```

### Playwright Test Cases

```typescript
// tests/responsive.spec.ts

test('ListingGrid: single column on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  const grid = page.locator('.listing-grid');
  const columns = await grid.evaluate(el => 
    getComputedStyle(el).gridTemplateColumns.split(' ').length
  );
  expect(columns).toBe(1);
});

test('ListingGrid: three columns on desktop', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  const grid = page.locator('.listing-grid');
  const columns = await grid.evaluate(el => 
    getComputedStyle(el).gridTemplateColumns.split(' ').length
  );
  expect(columns).toBeGreaterThanOrEqual(3);
});

test('No horizontal scroll on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
  expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
});

test('Header height adapts to viewport', async ({ page }) => {
  // Mobile
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  const mobileHeight = await page.locator('header').evaluate(el => el.offsetHeight);
  expect(mobileHeight).toBeLessThanOrEqual(60);
  
  // Desktop
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.waitForTimeout(100);
  const desktopHeight = await page.locator('header').evaluate(el => el.offsetHeight);
  expect(desktopHeight).toBeGreaterThanOrEqual(72);
});

test('Touch targets meet 44px minimum', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  const buttons = page.locator('button');
  const count = await buttons.count();
  for (let i = 0; i < count; i++) {
    const box = await buttons.nth(i).boundingBox();
    if (box) {
      expect(box.width).toBeGreaterThanOrEqual(44);
      expect(box.height).toBeGreaterThanOrEqual(44);
    }
  }
});
```

### Grep Checks

```bash
# Verify size mode tokens are used
grep -r "var(--ds-size-" packages/ds/src/ --include="*.tsx" | wc -l
# Expected: > 5

# Verify container-type is set
grep -r "containerType" packages/ds/src/ --include="*.tsx" | wc -l
# Expected: >= 2 (Container, ContentLayout)

# Verify no raw px in ListingGrid
grep -E "gap:.*px" packages/ds/src/blocks/ListingGrid.tsx
# Expected: No output (replaced with token)

# Verify responsive grid class exists
grep -r "ds-grid-responsive" packages/ds-themes/themes/digilist.css
# Expected: Found
```

---

## G) Future-Proofing for Digdir Updates

### How This Approach Enables Easy Digdir Token Updates

1. **Composition over replacement**: Size mode tokens (`--ds-size-*`) consume Digdir spacing tokens (`--ds-spacing-*`) rather than defining new values. When Digdir updates spacing, size modes automatically inherit changes.

2. **Container queries are standard CSS**: No proprietary runtime. If Digdir adds native responsive tokens, container queries can be deprecated without code changes.

3. **Breakpoint tokens are reference only**: Actual breakpoints live in CSS media/container queries, not hardcoded in JS. Updating breakpoint values requires only CSS changes.

### Avoiding Forked Behavior

| Risk | Mitigation |
|------|------------|
| Custom tokens diverge from Digdir | Size mode tokens explicitly reference `var(--ds-spacing-*)` |
| Breakpoint values differ | Use Digdir's breakpoint scale when they publish one |
| Container query names conflict | Prefix with `ds-` namespace |

### Compliance Adoption Path

| Standard | Current | After Remediation |
|----------|---------|-------------------|
| WCAG 2.1 AA touch targets | ⚠️ Some 32-36px | ✅ All ≥44px |
| WCAG 2.1 AA reflow (400% zoom) | ❌ Fails | ✅ Passes |
| `prefers-reduced-motion` | ❌ Not implemented | ⚠️ Requires separate task |
| `prefers-color-scheme` | ✅ Works | ✅ Unchanged |

### Recommended Post-Remediation Tasks

1. Add `@media (prefers-reduced-motion: reduce)` to disable transitions
2. Add focus-visible styles for keyboard navigation
3. Add skip-link improvements for screen readers
4. Document responsive patterns in `packages/ds-registry`

---

## Summary

| Section | Key Takeaway |
|---------|--------------|
| **Root Cause** | `data-size` is set but never consumed; no responsive execution layer |
| **Execution Layer** | Size modes + breakpoint tokens + container queries = automatic responsiveness |
| **Minimal Changes** | ~200 lines of CSS, ~50 lines of TSX across 6 files |
| **No UI Redesign** | Visual changes only on mobile (acceptable column/layout reflow) |
| **Verification** | 12-point manual checklist + 5 Playwright tests + 4 grep checks |
| **Future-Proof** | Composition with Digdir tokens; standard CSS features only |

**Estimated effort:** 2-3 focused days for Steps 1-4; additional 1-2 days for Steps 5-6.

---

*Report generated by Claude (Senior Design System Architect + Frontend Platform Engineer)*  
*Aligned with Digdir Designsystemet principles and WCAG 2.1 AA standards*
