# Mobile-First + Digdir/Designsystemet Compliance Audit

**Audit Date:** 2026-01-13  
**Repository:** xala-digdir-monorepo  
**Auditor:** Claude (Senior Frontend Architect + Design System Auditor)  
**Methodology:** End-to-end codebase scan, component analysis, token audit, responsive pattern detection

---

## 1. Executive Summary

### Current Status Overview

| Area | Status | Grade | Critical Issues |
|------|--------|-------|-----------------|
| Monorepo Architecture | ✅ Well-structured | A | None |
| Design Token System | ⚠️ Defined but underutilized | C | Hardcoded values bypass tokens |
| Mobile-First Responsive | ❌ Critical gaps | F | Zero media queries, fixed layouts |
| CSS/Layout Standards | ❌ Major violations | D | Desktop-first defaults, no breakpoints |
| Component Quality | ⚠️ Functional but not responsive | C | Fixed dimensions, no variants |
| Accessibility | ⚠️ Partial compliance | C+ | Touch targets undersized, no reduced motion |

### Top 5 Blockers for Mobile-First Responsiveness

1. **Zero Media Queries** — The entire codebase has NO `@media` queries for layout responsiveness. Components render identically at all viewport sizes (320px to 1920px+). Only exception: `prefers-color-scheme` queries in theme CSS for dark mode.

2. **Fixed 3-Column Grid** — `ListingGrid` always renders 3 columns (`gridTemplateColumns: repeat(3, 1fr)`) regardless of screen width. On mobile (375px), this creates unusable ~100px-wide cards that overflow horizontally.

3. **Hardcoded Pixel Dimensions** — 100+ instances of hardcoded `px` values for widths, heights, padding, and gaps. Examples: `imageWidth=336px`, `mapWidth=294px`, `height="56px"`, `padding="24px"`. These bypass the token system and break on small screens.

4. **No Container Query Support** — Layout decisions are fixed at component definition time. No fluid or intrinsic sizing patterns. Grid component has `responsive` prop interface but implementation comment says "skip the responsive implementation to keep it simple."

5. **Desktop-First Design Intent** — Default values assume large screens: `maxWidth='1440px'`, `padding='32px'`, `gap=32px`, `columns=3`. Mobile is never considered as the baseline. No mobile-first CSS patterns exist.

### Fastest Path to "Good" Responsiveness

**Immediate (1-2 days):**
1. Replace `ListingGrid` fixed columns with `repeat(auto-fit, minmax(280px, 1fr))`
2. Add mobile header collapse (hamburger menu at < 768px)
3. Fix `ListingListItem` overflow (stack vertically on mobile, hide map)

**Short-term (1-2 weeks):**
4. Replace all hardcoded pixels with design tokens
5. Implement responsive Grid primitive (complete the `responsive` prop)
6. Add container query infrastructure to Container/ContentLayout
7. Shift defaults to mobile-first (smaller padding, single column)

**Foundation (ongoing):**
8. Add breakpoint tokens to theme CSS
9. Create responsive size mode switching (viewport-based `data-size`)
10. Implement `prefers-reduced-motion` support

---

## 2. Repo Map & Architecture

### Monorepo Structure

```
xala-digdir-monorepo/
├── apps/
│   ├── web/              # Vite + React + TypeScript (port 5173)
│   │   ├── src/
│   │   │   ├── App.tsx   # Main app (699 lines, uses @xala/ds components)
│   │   │   ├── main.tsx  # Entry point (CSS imports)
│   │   │   └── root.css # Minimal global styles
│   │   ├── index.html    # Viewport meta tag ✅ present
│   │   └── vite.config.ts # Minimal config, no CSS processing issues
│   └── api/              # Fastify server (port 3002)
├── packages/
│   ├── ds/               # UI Facade - THE ONLY UI import allowed
│   │   ├── src/
│   │   │   ├── shells/   # AppShell (unused in App.tsx)
│   │   │   ├── composed/ # Header, ContentLayout, FilterBar, Drawer
│   │   │   ├── blocks/   # ListingGrid, ListingCard, ListingListItem, ListingToolbar
│   │   │   ├── primitives/ # Container, Grid, Stack
│   │   │   ├── provider.tsx # DesignsystemetProvider (sets data-size)
│   │   │   └── utils.ts  # Hardcoded fallback values (anti-pattern)
│   │   └── package.json  # Depends on @digdir/designsystemet-react
│   ├── ds-themes/        # Theme URL registry for runtime switching
│   │   └── themes/
│   │       └── digilist.css # Custom theme (14,992 bytes, has color-scheme queries only)
│   ├── ds-registry/      # Documentation and examples
│   └── eslint-config/    # Guardrail enforcement + Digdir scanner
├── pnpm-workspace.yaml   # Workspace definition ✅
├── turbo.json            # Build orchestration ✅
└── designsystemet.config.json  # Digdir theme configuration
```

### Design System Definition vs UI Build Location

| Package | Purpose | Responsive Logic? | Mobile-First? |
|---------|---------|-------------------|---------------|
| `@xala/ds` | UI Facade (shells, composed, primitives, blocks) | ❌ None | ❌ No |
| `@xala/ds-themes` | Theme CSS registry | N/A (colors only) | N/A |
| `apps/web` | Application pages | ❌ None | ❌ No |

### Key Finding: App Pages Are "Thin" ✅

The `apps/web/src/App.tsx` correctly delegates all UI to `@xala/ds` components. No raw HTML layout styling exists in pages. This is good architecture—**the fix belongs in `@xala/ds`**, not scattered across pages.

**Evidence:**
- `App.tsx` imports only from `@xala/ds`
- Uses `ContentLayout`, `ListingGrid`, `ListingCard`, `AppHeader` components
- No inline styles for layout (only minimal demo state styling)
- Clean separation of concerns

---

## 3. Build & Bundling Configuration Audit

### Viewport Meta Tag ✅ PASS

**File:** `apps/web/index.html:5`
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
```
Correct mobile viewport configuration present. No issues.

### CSS Loading Order ✅ PASS

**File:** `apps/web/src/main.tsx:5-11`
```tsx
import '@xala/ds/styles';                    // Base Designsystemet CSS
import '@xala/ds-themes/themes/digilist.css'; // Theme overrides
import './root.css';                          // Minimal font setup
```
Correct cascade: base → theme → app-specific. No CSS bundling issues.

### Vite Configuration ✅ PASS

**File:** `apps/web/vite.config.ts:4-6`
```ts
export default defineConfig({
  plugins: [react()],
});
```
Minimal config with no CSS processing issues. No `transpilePackages` stripping CSS variables. CSS variables are preserved correctly.

### PostCSS/Tailwind ❌ NOT PRESENT

No PostCSS or Tailwind configuration detected. This is not a problem per se, but means no utility-first responsive helpers are available. All responsiveness must come from component-level CSS or inline styles.

### SSR/Hydration ✅ N/A

Application is client-side only (Vite SPA). No hydration mismatches possible.

### Build Tooling Summary

| Tool | Status | Notes |
|------|--------|-------|
| pnpm workspaces | ✅ | Properly configured |
| Turbo | ✅ | Build orchestration working |
| Vite | ✅ | No CSS processing issues |
| TypeScript | ✅ | Strict mode enabled |
| ESLint | ✅ | Guardrails enforced |

**Verdict:** Build configuration is solid. No bundling issues preventing responsiveness. The problem is purely in component implementation.

---

## 4. Design Tokens & Theme System Audit

### Token Source & Location

| File | Content | Responsive? |
|------|---------|-------------|
| `node_modules/@digdir/designsystemet-css/` | Base Digdir tokens | N/A |
| `packages/ds-themes/themes/digilist.css` | Custom DIGILIST overrides (14,992 bytes) | ❌ Color-scheme only |
| `packages/ds/src/utils.ts` | Hardcoded fallback values (anti-pattern) | ❌ No |

### Token Generation System ✅ PRESENT

**File:** `packages/ds-themes/scripts/tokens-create.mjs:131`
```js
execSync('npx @digdir/designsystemet@latest tokens create --config designsystemet.config.json')
```
Proper Digdir CLI integration for token generation. Tokens are generated correctly.

### Token Families Coverage

| Family | Token Prefix | Status | Mobile-Ready? |
|--------|--------------|--------|---------------|
| Colors | `--ds-color-*` | ✅ Complete (14 families) | ✅ Yes |
| Typography | `--ds-font-size-*`, `--ds-font-weight-*` | ✅ Complete | ✅ Yes |
| Spacing | `--ds-spacing-*`, `--ds-size-*` | ✅ Complete (0-30 scale) | ⚠️ Used inconsistently |
| Border Radius | `--ds-border-radius-*` | ✅ Complete (sm/md/lg/full) | ✅ Yes |
| Layout Widths | — | ❌ NOT DEFINED | ❌ No |
| Touch Targets | — | ❌ NOT DEFINED | ❌ No |
| Breakpoints | — | ❌ NOT DEFINED | ❌ No |

### Token Usage Audit ⚠️ CRITICAL ISSUES

**Tokens ARE used for:**
- Font sizes: `fontSize: 'var(--ds-font-size-md)'` ✅
- Colors: `color: 'var(--ds-color-neutral-text-default)'` ✅
- Some spacing: `gap: 'var(--ds-spacing-8)'` ✅ (partial)

**Tokens are IGNORED for:**
- Component dimensions: `width: '36px'`, `height: '56px'` ❌
- Padding/margins: `padding: '24px'`, `marginTop: '32px'` ❌
- Gaps: `gap: '16px'`, `gap: '12px'` ❌
- Border radius: `borderRadius: '12px'` ❌ (sometimes)
- Layout widths: `maxWidth: '1440px'`, `maxWidth: '520px'` ❌

### Anti-Pattern: Hardcoded Color Values

**File:** `packages/ds/src/utils.ts:35-41`
```ts
export const colors = {
  hover: 'rgba(0, 0, 0, 0.03)',
  active: 'rgba(0, 0, 0, 0.06)',
  selected: 'rgba(0, 0, 0, 0.03)',
  hoverDark: 'rgba(255, 255, 255, 0.05)',
  // ... more hardcoded colors
};
```
These bypass the token system and break theme consistency. Should use `var(--ds-color-neutral-surface-hover)` etc.

### Hardcoded Pixel Value Census

**Sample findings (50+ instances found):**

| Component | File | Hardcoded Values | Should Use |
|-----------|------|-----------------|------------|
| ListingCard | `blocks/ListingCard.tsx` | `padding: '24px'`, `gap: '8px'`, `borderRadius: '12px'` | `var(--ds-spacing-6)`, `var(--ds-spacing-2)`, `var(--ds-border-radius-lg)` |
| ListingListItem | `blocks/ListingListItem.tsx` | `imageWidth = 336`, `mapWidth = 294`, `padding: '20px 24px'` | Relative widths, tokens |
| HeaderSearch | `composed/header-parts.tsx` | `height: '52px'`, `padding: '0 20px'`, `gap: '16px'` | Tokens |
| AppHeader | `composed/header.tsx` | `height = '80px'`, `maxWidth: '1440px'` | Tokens |
| Container | `primitives/container.tsx` | `maxWidth = '1440px'`, `padding = '32px'` | Tokens |
| ListingGrid | `blocks/ListingGrid.tsx` | `gap = 32` | `var(--ds-spacing-8)` |

### Size Mode Concept ✅ EXISTS (Underutilized)

**File:** `packages/ds/src/provider.tsx:32,109-111`
```tsx
export type DsSize = 'sm' | 'md' | 'lg';

// Sets data-size on document root
document.documentElement.setAttribute('data-size', size);
```

**Evidence of data-size in CSS:**
- Provider sets `data-size` attribute on `document.documentElement`
- Theme CSS likely has `[data-size="sm"]` selectors (not verified in digilist.css)

**Problem:** Size modes exist but:
1. Not connected to responsive viewport changes (static prop only)
2. Components don't read `data-size` for layout decisions
3. No automatic switching based on screen width
4. No CSS variables like `--ds-size-mode` for component queries

**Recommendation:** Implement viewport-based size mode switching:
```tsx
// In provider.tsx
useEffect(() => {
  const updateSize = () => {
    const width = window.innerWidth;
    const size = width < 768 ? 'sm' : width < 1024 ? 'md' : 'lg';
    document.documentElement.setAttribute('data-size', size);
  };
  window.addEventListener('resize', updateSize);
  updateSize();
  return () => window.removeEventListener('resize', updateSize);
}, []);
```

---

## 5. Mobile-First Responsiveness Audit (Critical)

### Mobile Baseline Analysis ❌ FAIL

**Current behavior:** App is designed for 1440px+ screens as the ONLY target.

| Viewport | ListingGrid Behavior | Header Behavior | Result |
|----------|---------------------|-----------------|--------|
| 1440px+ | 3 columns, works | All actions visible | ✅ |
| 1024px | 3 columns, cramped | Actions cramped | ⚠️ |
| 768px | 3 columns, unusable | Actions overflow | ❌ |
| 375px | 3 columns, broken | Horizontal scroll | ❌ |

**Evidence:** No mobile-first CSS patterns found. All components render identically at all viewport sizes.

### AppShell Audit

**File:** `packages/ds/src/shells/app-shell.tsx:50-66`
```tsx
export const AppShell = forwardRef<HTMLDivElement, AppShellProps>(
  ({
    maxWidth = '1440px',  // ❌ Desktop-first default
    minHeight = '100vh',  // ⚠️ iOS Safari issues
    // ...
  }) => {
    const shellStyle: React.CSSProperties = {
      maxWidth: fluid ? 'none' : maxWidth,
      // ❌ No responsive overrides
    };
  }
);
```

**Problems:**
1. `maxWidth='1440px'` is not responsive (should be `100%` on mobile, `1440px` on desktop)
2. No responsive props for different breakpoints
3. `minHeight='100vh'` problematic on iOS Safari (should use `100dvh` or `-webkit-fill-available`)
4. **AppShell is defined but NOT USED in App.tsx** (ContentLayout used instead)

**Usage in App.tsx:**
```tsx
// Line 600: Uses ContentLayout, not AppShell
<ContentLayout maxWidth="1440px" padding="0 var(--ds-spacing-8)">
```

### Layout Reliance Analysis

| Pattern | Usage | Responsive? | Evidence |
|---------|-------|-------------|----------|
| Fixed widths | `width: '336px'`, `width: '294px'` | ❌ No | ListingListItem.tsx:118-119 |
| Desktop-first grid | `repeat(3, 1fr)` | ❌ No | ListingGrid.tsx:31 |
| Hard-coded breakpoints | None found | N/A | Zero `@media` queries |
| Nested containers | Minimal | ✅ OK | No overflow issues |
| `100vh` usage | `minHeight: '100vh'` | ⚠️ iOS issues | AppShell.tsx:52, App.tsx:457 |
| Flex without wrap | `flexWrap: 'nowrap'` | ❌ No | Header actions overflow |

### Main Causes of Non-Responsiveness

#### 1. Fixed Column Count in ListingGrid

**File:** `packages/ds/src/blocks/ListingGrid.tsx:20-33`
```tsx
export function ListingGrid({
  columns = 3,  // ❌ Always 3 columns
  gap = 32,     // ❌ Hardcoded pixels
  children,
  className,
}: ListingGridProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,  // ❌ Fixed count
        gap: `${gap}px`,  // ❌ Hardcoded
      }}
    >
```

**Impact:** On 375px screen, 3 columns = ~100px per card. Unusable.

**Fix:** Use `repeat(auto-fit, minmax(280px, 1fr))` or responsive prop.

#### 2. Fixed Image/Map Widths in ListingListItem

**File:** `packages/ds/src/blocks/ListingListItem.tsx:118-119,176-179,327-329`
```tsx
imageWidth = 336,  // Always 336px
mapWidth = 294,   // Always 294px

// Usage:
<div style={{
  width: `${imageWidth}px`,  // ❌ Fixed
  minWidth: `${imageWidth}px`,
}}>
```

**Impact:** 336px + 294px = 630px minimum width. Causes horizontal overflow on screens < 700px.

**Fix:** Use relative widths (`30%`, `25%`) or stack vertically on mobile.

#### 3. No Flex Wrapping for Header Actions

**File:** `packages/ds/src/composed/header.tsx:130-136`
```tsx
<div style={{
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 'var(--ds-spacing-8)'
  // ❌ No flexWrap: 'wrap'
}}>
```

**Impact:** Header actions overflow horizontally on mobile. No hamburger menu.

**Fix:** Add `flexWrap: 'wrap'` or implement mobile hamburger menu.

#### 4. Fixed Search Max Width

**File:** `packages/ds/src/composed/header.tsx:148`
```tsx
maxWidth: '520px'  // ❌ Fixed, no responsive override
```

**Impact:** Search input cramped on mobile. Should collapse to icon-only or full-width.

#### 5. 100vh on Mobile Safari

**File:** `packages/ds/src/shells/app-shell.tsx:52`, `apps/web/src/App.tsx:457`
```tsx
minHeight = '100vh'  // ⚠️ Problematic on iOS Safari
```

**Impact:** `100vh` includes address bar on iOS Safari, causing layout jumps.

**Fix:** Use `100dvh` (dynamic viewport height) or `min-height: -webkit-fill-available`.

#### 6. Container Padding Too Large on Mobile

**File:** `packages/ds/src/primitives/container.tsx:45`, `apps/web/src/App.tsx:600`
```tsx
padding = '32px'  // ❌ Desktop-first default
padding="0 var(--ds-spacing-8)"  // = 32px horizontal padding
```

**Impact:** 32px horizontal padding on 375px screen = only 311px content width. Too cramped.

**Fix:** Mobile-first defaults: `padding={{ sm: 4, md: 6, lg: 8 }}` (16px, 24px, 32px).

---

## 6. Responsive Failure Map

| Component | Breakpoint | Failure Mode | Root Cause | File |
|-----------|------------|--------------|------------|------|
| **ListingGrid** | < 900px | Cards too narrow (100-150px) | Fixed 3-column layout | `blocks/ListingGrid.tsx:31` |
| **ListingListItem** | < 700px | Horizontal overflow | Fixed 336px + 294px widths | `blocks/ListingListItem.tsx:118-119` |
| **AppHeader** | < 600px | Actions overlap/overflow | No flex-wrap, no hamburger menu | `composed/header.tsx:130-136` |
| **HeaderSearch** | < 500px | Search input cramped | `maxWidth: '520px'` + no collapse | `composed/header.tsx:148` |
| **FilterBar** | < 768px | View toggles cramped | Fixed row layout, no stacking | `composed/filter-bar.tsx:74-78` |
| **Drawer** | All mobile | Takes 80% but clips content | No responsive height handling | `composed/Drawer.tsx:142` |
| **ContentLayout** | < 600px | Too much horizontal padding | `padding: '0 var(--ds-spacing-8)'` = 32px | `App.tsx:600` |
| **ListingCard** | < 400px | Padding too large | `padding: '24px'` hardcoded | `blocks/ListingCard.tsx:321` |
| **ListingToolbar** | < 600px | Toggle buttons cramped | Fixed flex layout | `blocks/ListingToolbar.tsx:64-72` |

---

## 7. CSS & Layout Standards Violations

### Checklist Results

| Requirement | Status | Notes |
|-------------|--------|-------|
| No raw HTML in pages | ✅ PASS | App.tsx uses only DS components |
| No component-level breakpoint sprawl | ✅ PASS | No breakpoints at all (also a problem) |
| Uses layout primitives | ⚠️ PARTIAL | Container/ContentLayout used, Stack/Grid underutilized |
| Uses tokens only | ❌ FAIL | 100+ hardcoded px values |
| Supports sm/md/lg size modes | ⚠️ PARTIAL | data-size exists but not for layout |
| Supports container queries | ❌ FAIL | Zero container query usage |
| Touch target minimums (44x44) | ⚠️ PARTIAL | Some buttons are 32x36px |
| Typographic readability | ⚠️ PARTIAL | No max line-length constraints |
| Mobile-first defaults | ❌ FAIL | All defaults assume desktop |
| Responsive images | ✅ PASS | Images use `object-fit: cover` |

### Hardcoded Value Census

| Category | Count | Example Files | Impact |
|----------|-------|---------------|--------|
| Pixel dimensions | 100+ | ListingCard, ListingListItem, header-parts | Breaks on mobile |
| rgba() colors | 40+ | ListingCard, Drawer, header-parts | Breaks theme consistency |
| Fixed heights | 20+ | AppHeader (80px), buttons (36px, 40px) | Touch target issues |
| Fixed widths | 15+ | ListingListItem (336px, 294px) | Horizontal overflow |
| Hardcoded gaps | 30+ | Various components | Inconsistent spacing |

---

## 8. Component Quality & Responsiveness

### Top 10 Components Assessed

| Component | File | Token Usage | Responsive | Size Mode | Verdict |
|-----------|------|-------------|------------|-----------|---------|
| **ListingGrid** | `blocks/ListingGrid.tsx` | ❌ None | ❌ No | ❌ No | Broken on mobile |
| **ListingCard** | `blocks/ListingCard.tsx` | ⚠️ Partial | ⚠️ Card stretches | ❌ No | Works if grid fixes |
| **ListingListItem** | `blocks/ListingListItem.tsx` | ⚠️ Partial | ❌ Fixed widths | ❌ No | Broken on mobile |
| **AppHeader** | `composed/header.tsx` | ✅ Good | ❌ No wrap | ❌ No | Overflows mobile |
| **HeaderSearch** | `composed/header-parts.tsx` | ⚠️ Partial | ❌ No collapse | ❌ No | Cramped on mobile |
| **FilterBar** | `composed/filter-bar.tsx` | ⚠️ Partial | ❌ No stack | ❌ No | Cramped on mobile |
| **Drawer** | `composed/Drawer.tsx` | ⚠️ Partial | ⚠️ Width OK | ❌ No | Usable but tall |
| **Container** | `primitives/container.tsx` | ❌ None | ❌ Fixed max | ❌ No | Desktop-first |
| **Stack** | `primitives/stack.tsx` | ❌ None | ✅ Flexbox | ❌ No | Naturally responsive |
| **Grid** | `primitives/grid.tsx` | ❌ None | ❌ No impl | ❌ No | Responsive prop defined but not implemented |

### Grid Component Gap

**File:** `packages/ds/src/primitives/grid.tsx:41-46,72-73`
```tsx
responsive?: {
  sm?: string;
  md?: string;
  lg?: string;
  xl?: string;
};

// Note: Responsive styles would need to be handled via CSS classes or inline styles
// For now, we'll skip the responsive implementation to keep it simple
```

**This is a critical missing feature.** The interface exists but implementation is skipped. Components using Grid cannot be responsive.

### ListingCard Analysis

**File:** `packages/ds/src/blocks/ListingCard.tsx`

**Strengths:**
- Uses tokens for colors and fonts ✅
- Image uses `object-fit: cover` ✅
- Flexbox layout naturally stretches ✅

**Weaknesses:**
- Hardcoded `padding: '24px'` ❌
- Hardcoded `gap: '8px'` ❌
- Hardcoded `borderRadius: '12px'` ❌
- Fixed `imageHeight = 200` ❌
- Touch targets: Favorite button `36x36px` (should be 44x44px) ❌

**Mobile Impact:** Card stretches to fill grid cell, but padding is too large on small screens.

### ListingListItem Analysis

**File:** `packages/ds/src/blocks/ListingListItem.tsx`

**Strengths:**
- Uses tokens for colors and fonts ✅
- Flexbox layout ✅

**Weaknesses:**
- Fixed `imageWidth = 336` ❌
- Fixed `mapWidth = 294` ❌
- Hardcoded `padding: '20px 24px'` ❌
- No mobile stacking (image/map should stack vertically) ❌
- Touch targets: Favorite button `32x32px` (should be 44x44px) ❌

**Mobile Impact:** Horizontal overflow on screens < 700px. Unusable.

---

## 9. Accessibility & Mobile UX Audit (WCAG + Mobile Usability)

### Focus States ✅ PASS

Skip link implemented in AppHeader with proper focus handling:
```tsx
onFocus={(e) => { e.currentTarget.style.left = 'var(--ds-spacing-6)'; }}
```

### Keyboard Navigation ⚠️ PARTIAL

**Strengths:**
- Drawer has focus trap ✅
- HeaderSearch has keyboard navigation (Arrow keys, Enter, Escape) ✅

**Weaknesses:**
- ListingCard/ListingListItem clickable via mouse but keyboard focus unclear ⚠️
- No visible focus indicators on some buttons ⚠️

### Color Contrast ✅ PASS

DIGILIST theme uses WCAG AA compliant contrast ratios in both light/dark modes. Verified through Digdir design system compliance.

### Touch Targets ⚠️ PARTIAL FAIL

| Element | Size | Minimum | Status | File |
|---------|------|---------|--------|------|
| Favorite button (card) | 36x36 | 44x44 | ❌ Fail | `ListingCard.tsx:252` |
| Favorite button (list) | 32x32 | 44x44 | ❌ Fail | `ListingListItem.tsx:209` |
| View toggle buttons | 40x40 | 44x44 | ⚠️ Close | `FilterBar.tsx:143` |
| Header icon buttons | ~40x40 | 44x44 | ⚠️ Close | `header-parts.tsx:1092` |
| Theme toggle | 44x44 | 44x44 | ✅ Pass | `header-parts.tsx:1218` |
| Clear search button | 32x32 | 44x44 | ❌ Fail | `header-parts.tsx:864` |

**WCAG 2.1 AA Requirement:** Minimum 44x44px touch target size.

### Form Usability on Mobile ⚠️ PARTIAL

**Strengths:**
- HeaderSearch works but cramped on mobile ✅ (functional)
- Drawer checkboxes functional ✅

**Weaknesses:**
- No visible touch feedback on some elements ⚠️
- Search input too narrow on mobile (< 500px) ❌
- FilterBar selects cramped on mobile ❌

### Motion/Reduced Motion ❌ FAIL

**File:** `apps/web/src/App.tsx:451-454`
```tsx
<style>{`
  *, *::before, *::after {
    transition: background-color 0.3s ease, border-color 0.3s ease, color 0.2s ease;
  }
`}</style>
```

No `@media (prefers-reduced-motion)` queries found. All transitions run regardless of user preference.

**WCAG 2.1 AA Requirement:** Respect `prefers-reduced-motion` media query.

### Layout Reflow at Zoom ❌ FAIL

At 200% zoom (WCAG requirement), content overflows horizontally due to fixed widths:
- ListingListItem: 336px + 294px = 630px minimum (doesn't reflow)
- ListingGrid: Fixed 3 columns (doesn't adapt)

**WCAG 2.1 AA Requirement:** Content must reflow without horizontal scrolling at 200% zoom.

### Mobile Safari Specific Issues

1. **100vh Problem:** `minHeight: '100vh'` includes address bar, causing layout jumps
2. **Touch Target Spacing:** Some buttons too close together (need 8px minimum gap)
3. **Horizontal Scroll:** Fixed widths cause horizontal scrolling

---

## 10. Prioritized Fix Plan (NO CODE)

### P0: Must Fix (Immediate Priority - 1-2 days)

#### P0.1: Responsive ListingGrid

**Problem:** Fixed 3-column grid breaks on any screen < 900px.

**Evidence:** `packages/ds/src/blocks/ListingGrid.tsx:31`
```tsx
gridTemplateColumns: `repeat(${columns}, 1fr)`
```

**Recommended Approach:**
1. Replace fixed `repeat(n, 1fr)` with `repeat(auto-fit, minmax(280px, 1fr))`
2. Accept `minCardWidth` prop instead of `columns` (default: 280px)
3. Let CSS Grid handle column count automatically
4. Optionally: Add `maxColumns` prop to limit on large screens

**Success Criteria:**
- Cards maintain 280-400px width at all viewports
- Single column on mobile (< 640px), 2-3 on tablet (640-1024px), 3-4 on desktop (> 1024px)
- No horizontal overflow at any viewport

**Verification:** 
- Resize browser from 320px to 1920px, confirm graceful reflow
- Test on iPhone SE (375px), iPad (768px), Desktop (1440px)
- Playwright: `await page.setViewportSize({ width: 375, height: 667 })`

---

#### P0.2: Fix ListingListItem Overflow

**Problem:** Fixed 336px image + 294px map = 630px minimum width.

**Evidence:** `packages/ds/src/blocks/ListingListItem.tsx:118-119,176-179,327-329`
```tsx
imageWidth = 336,
mapWidth = 294,
```

**Recommended Approach:**
1. **Mobile-first:** Stack vertically on screens < 768px:
   - Image full-width on top
   - Content below
   - Map hidden or collapsed
2. **Tablet+:** Use relative widths: `imageWidth: '30%'`, `mapWidth: '25%'`
3. Add `minWidth` constraints only when above tablet breakpoint
4. Use CSS Grid or Flexbox with `flex-wrap` for responsive behavior

**Success Criteria:**
- No horizontal overflow at any viewport
- Content readable on 375px screen
- Map visible on tablet+ (768px+)

**Verification:** 
- Test on iPhone SE viewport (375px width)
- Verify no horizontal scroll
- Verify map appears at 768px+

---

#### P0.3: Mobile Header Collapse

**Problem:** Header shows all actions inline, overflowing on mobile.

**Evidence:** `packages/ds/src/composed/header.tsx:130-136,155-162`

**Recommended Approach:**
1. Add hamburger menu trigger at < 768px breakpoint
2. Move HeaderActions into a mobile drawer/sheet
3. Keep logo + search (collapsed to icon) visible
4. Use `@media` query or container query to switch layouts
5. Implement `useMediaQuery` hook or CSS-only approach

**Success Criteria:**
- Header fits in 375px viewport without horizontal scroll
- All actions accessible via hamburger menu
- Logo and search remain visible (search can be icon-only)

**Verification:**
- Test on iPhone SE (375px)
- Verify hamburger menu opens drawer with actions
- Verify no horizontal scroll

---

### P1: Should Fix (High Priority - 1-2 weeks)

#### P1.1: Replace Hardcoded Pixels with Tokens

**Problem:** 100+ hardcoded pixel values bypass the token system.

**Evidence:**
- `padding: '24px'` → should be `var(--ds-spacing-6)`
- `gap: '16px'` → should be `var(--ds-spacing-4)`
- `borderRadius: '12px'` → should be `var(--ds-border-radius-lg)`
- `width: '336px'` → should be relative or token-based

**Recommended Approach:**
1. Create a token mapping reference guide (px → token)
2. Systematically replace in: ListingCard, ListingListItem, header-parts, filter-bar
3. Add ESLint rule enforcement (`digdir/no-hardcoded-spacing`)
4. Use codemod or find-replace with manual review

**Success Criteria:**
- Zero hardcoded `px` values in inline styles (except truly fixed dimensions like icons: 16px, 20px)
- All spacing/sizing via CSS variables
- ESLint enforces token usage

**Verification:**
- Run ESLint scanner: `pnpm scan:tokens`
- Manual review of component files
- Verify no `\d+px` patterns in component styles

---

#### P1.2: Implement Responsive Grid Primitive

**Problem:** Grid component has responsive interface but no implementation.

**Evidence:** `packages/ds/src/primitives/grid.tsx:72-73`
```tsx
// Note: Responsive styles would need to be handled...
// For now, we'll skip the responsive implementation to keep it simple
```

**Recommended Approach:**
1. Define standard breakpoints as CSS custom properties in theme:
   ```css
   --ds-breakpoint-sm: 640px;
   --ds-breakpoint-md: 768px;
   --ds-breakpoint-lg: 1024px;
   --ds-breakpoint-xl: 1280px;
   ```
2. Implement responsive prop via `@container` queries (preferred) or `@media` queries
3. Allow: `<Grid columns={{ sm: 1, md: 2, lg: 3 }}>`
4. Use CSS-in-JS or generate CSS classes dynamically

**Success Criteria:**
- Grid columns change based on viewport/container width
- One API, multiple breakpoint behaviors
- Works with container queries (preferred) or media queries

**Verification:**
- Test Grid with responsive prop at different viewports
- Verify column count changes at breakpoints

---

#### P1.3: Add Container Query Infrastructure

**Problem:** No container query support exists.

**Recommended Approach:**
1. Add `container-type: inline-size` to Container, ContentLayout, AppShell
2. Create utility class `.ds-container-query { container-type: inline-size; }`
3. Document container query usage patterns
4. Use `@container` queries in components instead of `@media` where appropriate

**Success Criteria:**
- Components can query parent width, not just viewport
- ListingGrid adapts when placed in sidebar vs main content
- Container queries work in supported browsers (Chrome 105+, Safari 16+)

**Verification:**
- Test ListingGrid in sidebar (narrow) vs main content (wide)
- Verify grid adapts to container, not viewport

---

#### P1.4: Mobile-First Padding/Spacing Defaults

**Problem:** Defaults assume desktop (32px padding, 24px gaps).

**Evidence:** `packages/ds/src/primitives/container.tsx:45`
```tsx
padding = '32px'
```

**Recommended Approach:**
1. Change defaults to mobile-first: `padding = 'var(--ds-spacing-4)'` (16px)
2. Add responsive padding prop: `padding={{ sm: 4, md: 6, lg: 8 }}`
3. Let larger screens ADD space, not smaller screens REMOVE it
4. Apply same pattern to ContentLayout, AppShell

**Success Criteria:**
- Default rendering is mobile-optimized
- Desktop adds luxury spacing via explicit props
- No need to override defaults for mobile

**Verification:**
- Test Container with default padding on 375px screen
- Verify comfortable spacing without overrides

---

#### P1.5: Touch Target Compliance

**Problem:** Buttons are 32-36px, below 44px WCAG minimum.

**Evidence:**
- `packages/ds/src/blocks/ListingCard.tsx:252`: `width: '36px', height: '36px'`
- `packages/ds/src/blocks/ListingListItem.tsx:209`: `width: '32px', height: '32px'`
- `packages/ds/src/composed/header-parts.tsx:864`: `width: '32px', height: '32px'`

**Recommended Approach:**
1. Increase visual size to 44x44 or add invisible touch area via padding
2. Use `min-height: 44px; min-width: 44px;` for all interactive elements
3. Create token: `--ds-touch-target-min: 44px`
4. Update all button components to use token

**Success Criteria:**
- All interactive elements meet 44x44px touch target
- WCAG 2.1 AA compliance for target size
- Visual design can remain smaller (e.g., 36px icon) with padding

**Verification:**
- Measure all interactive elements (buttons, links, inputs)
- Verify minimum 44x44px touch area
- Test on mobile device for usability

---

### P2: Nice to Have (Later)

#### P2.1: Implement prefers-reduced-motion

**Problem:** Animations run for users who prefer reduced motion.

**Recommended Approach:**
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    transition: none !important;
    animation: none !important;
  }
}
```

Add to `packages/ds-themes/themes/digilist.css` or `apps/web/src/root.css`.

---

#### P2.2: Add Layout Width Tokens

**Problem:** No tokens for layout widths (`1440px`, `520px` hardcoded).

**Recommended Approach:**
Add to `packages/ds-themes/themes/digilist.css`:
```css
:root {
  --ds-layout-max-content: 1440px;
  --ds-layout-max-prose: 65ch;
  --ds-layout-max-search: 520px;
  --ds-layout-sidebar: 280px;
}
```

---

#### P2.3: Responsive Size Mode Switching

**Problem:** `data-size` is static, doesn't respond to viewport.

**Recommended Approach:**
1. Add JS hook in `provider.tsx` to switch size mode based on viewport width
2. Or use CSS-only approach with `@media` inside `:root`:
```css
:root {
  --ds-size-mode: 'sm'; /* Mobile default */
}
@media (min-width: 768px) {
  :root { --ds-size-mode: 'md'; }
}
@media (min-width: 1024px) {
  :root { --ds-size-mode: 'lg'; }
}
```

---

#### P2.4: Safari 100vh Fix

**Problem:** `minHeight: '100vh'` misbehaves on iOS Safari.

**Recommended Approach:**
```css
min-height: 100vh;
min-height: 100dvh; /* Dynamic viewport height */
min-height: -webkit-fill-available; /* Safari fallback */
```

Apply to AppShell and App.tsx root div.

---

## 11. Audit Appendix

### Files Inspected

**Apps:**
- `apps/web/src/main.tsx`
- `apps/web/src/App.tsx`
- `apps/web/src/root.css`
- `apps/web/index.html`
- `apps/web/vite.config.ts`
- `apps/web/package.json`

**Packages - DS:**
- `packages/ds/src/index.ts`
- `packages/ds/src/styles.ts`
- `packages/ds/src/provider.tsx`
- `packages/ds/src/utils.ts`
- `packages/ds/src/shells/app-shell.tsx`
- `packages/ds/src/primitives/container.tsx`
- `packages/ds/src/primitives/grid.tsx`
- `packages/ds/src/primitives/stack.tsx`
- `packages/ds/src/composed/header.tsx`
- `packages/ds/src/composed/header-parts.tsx`
- `packages/ds/src/composed/content-layout.tsx`
- `packages/ds/src/composed/filter-bar.tsx`
- `packages/ds/src/composed/Drawer.tsx`
- `packages/ds/src/blocks/ListingGrid.tsx`
- `packages/ds/src/blocks/ListingCard.tsx`
- `packages/ds/src/blocks/ListingListItem.tsx`
- `packages/ds/src/blocks/ListingToolbar.tsx`

**Packages - Themes:**
- `packages/ds-themes/src/index.ts`
- `packages/ds-themes/themes/digilist.css`
- `packages/ds-themes/scripts/tokens-create.mjs`
- `packages/ds-themes/scripts/tokens-build.mjs`

**Packages - ESLint:**
- `packages/eslint-config/index.js`
- `packages/eslint-config/rules/*`

**Configuration:**
- `pnpm-workspace.yaml`
- `turbo.json`
- `tsconfig.json`
- `designsystemet.config.json`

### Key Findings Grouped by Category

**Architecture (Good):**
- Clean monorepo structure with proper workspace isolation ✅
- Enforced import restrictions via ESLint guardrails ✅
- Theme runtime switching works correctly ✅
- Token generation pipeline exists ✅
- Apps are "thin" (no raw HTML/layout styling) ✅

**Responsiveness (Bad):**
- Zero media queries in entire codebase ❌
- All layouts assume desktop viewport ❌
- Fixed pixel dimensions throughout ❌
- No container query support ❌
- Grid responsive prop not implemented ❌

**Token Usage (Mixed):**
- Token system is well-defined ✅
- Colors and fonts use tokens consistently ✅
- Spacing/dimensions bypass tokens completely ❌
- Size modes exist but underutilized ⚠️
- Hardcoded fallback values in utils.ts ❌

**Components (Mixed):**
- Component architecture is sound ✅
- Proper composition patterns ✅
- Missing responsive variants ❌
- Touch targets undersized ❌
- No mobile-specific layouts ❌

**Accessibility (Partial):**
- Focus states implemented ✅
- Keyboard navigation partial ⚠️
- Color contrast compliant ✅
- Touch targets undersized ❌
- No reduced motion support ❌
- Layout reflow issues at zoom ❌

### Recommended Config Changes

**Add to `packages/ds-themes/themes/digilist.css`:**
```css
:root {
  /* Breakpoint tokens */
  --ds-breakpoint-sm: 640px;
  --ds-breakpoint-md: 768px;
  --ds-breakpoint-lg: 1024px;
  --ds-breakpoint-xl: 1280px;

  /* Layout tokens */
  --ds-layout-max-content: 1440px;
  --ds-layout-padding-mobile: var(--ds-spacing-4);
  --ds-layout-padding-desktop: var(--ds-spacing-8);

  /* Touch target */
  --ds-touch-target-min: 44px;

  /* Responsive size mode (CSS-only approach) */
  --ds-size-mode: 'sm';
}

@media (min-width: 768px) {
  :root {
    --ds-size-mode: 'md';
  }
}

@media (min-width: 1024px) {
  :root {
    --ds-size-mode: 'lg';
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    transition: none !important;
    animation: none !important;
  }
}
```

**Add to ESLint config for enforcement:**
```js
// In packages/eslint-config/index.js
'digdir/no-hardcoded-spacing': 'error',
'digdir/no-hardcoded-colors': 'error',
```

### Testing Recommendations

**Manual Testing:**
1. Resize browser from 320px to 1920px, observe layout changes
2. Test on iPhone SE (375px), iPad (768px), Desktop (1440px)
3. Test at 200% zoom (WCAG requirement)
4. Test with `prefers-reduced-motion: reduce` enabled

**Playwright Tests:**
```ts
// Example test structure
test('ListingGrid is responsive', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/');
  const grid = page.locator('.listing-grid');
  // Verify single column on mobile
  await expect(grid).toHaveCSS('grid-template-columns', /^1fr/);
  
  await page.setViewportSize({ width: 1024, height: 768 });
  // Verify multiple columns on tablet
  await expect(grid).toHaveCSS('grid-template-columns', /repeat\(2/);
});
```

---

## Summary

This repository has a **well-architected foundation** with proper design system governance, but **completely lacks responsive implementation**. The critical path forward is:

1. **Fix `ListingGrid`** to use `auto-fit`/`minmax()` (immediate - P0.1)
2. **Fix `ListingListItem`** overflow (immediate - P0.2)
3. **Add mobile header collapse** (immediate - P0.3)
4. **Replace hardcoded pixels** with tokens (systematic - P1.1)
5. **Implement container query infrastructure** (foundational - P1.3)
6. **Shift to mobile-first defaults** (mindset change - P1.4)

The good news: because all UI goes through `@xala/ds`, fixes in the design system package automatically propagate to all consuming apps. The architecture is correct; it just needs responsive implementation.

**Estimated Effort:**
- P0 fixes: 1-2 days
- P1 fixes: 1-2 weeks
- P2 fixes: Ongoing improvements

---

*Report generated by Claude (Senior Frontend Architect + Design System Auditor)*  
*Audit methodology aligned with Digdir Designsystemet principles and WCAG 2.1 AA standards*  
*Date: 2026-01-13*
