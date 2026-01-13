# Hardcoded Values, Custom CSS & Non-Token Variables Audit

**Audit Date:** 2026-01-13
**Last Updated:** 2026-01-13 (Automated Rescan)
**Repository:** xala-digdir-monorepo
**Scope:** `packages/ds/src` and `apps/web/src`
**Scanner:** `pnpm scan:compliance`

---

## Executive Summary

| Category | Count | Severity | Status |
|----------|-------|----------|--------|
| Hardcoded Colors | 0 | High | ✅ Fixed |
| Hardcoded Spacing (px) | 9 | High | ⚠️ 8 in CSS-in-JS, 1 edge case |
| Hardcoded Typography | 0 | Medium | ✅ Fixed |
| Hardcoded Border Radius | 0 | Medium | ✅ Fixed |
| Raw HTML Layouts | 3 | Medium | ⚠️ Should use primitives |
| Hardcoded Dimensions | 8 | Low | ⚠️ Mostly breakpoints |
| SVG Hardcoded Colors | 2 | Low | ⚠️ Known limitation |
| Inline Styles | 100+ | N/A | ✅ Acceptable (component-level) |
| Custom CSS Files | 0 | N/A | ✅ None found |

**Summary:** Major token compliance work completed. Core design system components now use design tokens. Remaining issues are mostly CSS-in-JS limitations and known edge cases.

---

## 1. Current High Severity Issues ❌

### Hardcoded Spacing in Mobile CSS (Apps)

These are CSS-in-JS strings embedded in React components for mobile-specific overrides:

#### `apps/web/src/App.tsx` (Lines 467-474)

```tsx
<style>{`
  @media (max-width: 599px) {
    /* Mobile padding for header - 24px on each side */
    header .ds-container {
      padding-left: 24px !important;      // ❌ Line 467
      padding-right: 24px !important;     // ❌ Line 468
    }
    
    /* Mobile padding for main content - 24px on each side */
    .main-content-layout {
      padding-left: 24px !important;      // ❌ Line 473
      padding-right: 24px !important;     // ❌ Line 474
    }
  }
`}</style>
```

**Recommended Fix:**

```tsx
<style>{`
  @media (max-width: 599px) {
    header .ds-container {
      padding-left: var(--ds-spacing-6) !important;
      padding-right: var(--ds-spacing-6) !important;
    }
    .main-content-layout {
      padding-left: var(--ds-spacing-6) !important;
      padding-right: var(--ds-spacing-6) !important;
    }
  }
`}</style>
```

#### `packages/ds/src/blocks/ListingMap.tsx` (Line 231)

```tsx
border-top: 1px solid var(--ds-color-neutral-border-default);
```

**Status:** ⚠️ Acceptable - 1px borders are standard, not a spacing token issue.

---

## 2. Current Medium Severity Issues ⚠️

### Raw HTML Layouts in Apps

These `<div style={{display: flex}}>` patterns should use layout primitives:

#### `apps/web/src/App.tsx`

| Line | Current Pattern | Recommended Replacement |
|------|-----------------|------------------------|
| 552 | `<div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-3)' }}>` | `<Stack spacing="var(--ds-spacing-3)">` |
| 572 | `<div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-1)' }}>` | `<Stack spacing="var(--ds-spacing-1)">` |
| 683 | `<div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>` | `<Stack spacing="var(--ds-spacing-4)">` |

**Note:** While these use tokens correctly, they violate the "apps should use primitives" principle.

---

## 3. Low Severity / Acceptable Issues ✅

### Hardcoded Dimensions (Mostly Breakpoints)

| File | Line | Issue | Status |
|------|------|-------|--------|
| `header-parts.tsx` | 60 | `@media (max-width: 599px)` | ⚠️ CSS limitation |
| `header.tsx` | 129 | `@media (max-width: 599px)` | ⚠️ CSS limitation |
| `header.tsx` | 159-160 | `maxWidth: '520px'`, `minWidth: '80px'` | ⚠️ Search field sizes |
| `App.tsx` | 461, 488 | Media queries | ⚠️ CSS limitation |

**Rationale:** CSS media queries cannot use CSS custom properties. These breakpoints align with Digdir's recommended values (600px).

### SVG Hardcoded Colors

#### `packages/ds/src/blocks/ListingListItem.tsx` (Lines 384, 386)

```tsx
<svg ... stroke="white" ...>
  <circle ... fill="white" ... />
</svg>
```

**Recommended Fix:**

```tsx
<svg ... stroke="currentColor" style={{ color: 'var(--ds-color-neutral-background-default)' }} ...>
  <circle ... fill="currentColor" ... />
</svg>
```

**Status:** ⚠️ Known limitation - SVG attributes don't support CSS variables directly.

---

## 4. Completed Fixes ✅

### `packages/ds/src/utils.ts` - FIXED

All preset objects now use design tokens:

```typescript
export const spacing = {
  xs: 'var(--ds-spacing-1)',     // ✅ Was '4px'
  sm: 'var(--ds-spacing-2)',     // ✅ Was '8px'
  md: 'var(--ds-spacing-4)',     // ✅ Was '16px'
  lg: 'var(--ds-spacing-6)',     // ✅ Was '24px'
  xl: 'var(--ds-spacing-8)',     // ✅ Was '32px'
} as const;

export const buttonTextColors = {
  success: 'var(--ds-color-success-contrast-default)',   // ✅ Was '#ffffff'
  danger: 'var(--ds-color-danger-contrast-default)',     // ✅ Was '#ffffff'
} as const;

export const emptyStateStyles = {
  padding: 'var(--ds-spacing-12) var(--ds-spacing-8)',  // ✅ Was '48px 32px'
  gap: 'var(--ds-spacing-4)',                            // ✅ Was '16px'
} as const;

export const logoStyles = {
  title: {
    fontSize: 'var(--ds-font-size-xl)',                  // ✅ Fixed
    fontWeight: 'var(--ds-font-weight-bold)',            // ✅ Fixed
  },
  subtitle: {
    fontSize: 'var(--ds-font-size-md)',                  // ✅ Fixed
    fontWeight: 'var(--ds-font-weight-medium)',          // ✅ Fixed
  },
  gap: 'var(--ds-spacing-4)',                            // ✅ Fixed
} as const;
```

### Other Fixed Files

| File | Status |
|------|--------|
| `packages/ds/src/composed/filter-bar.tsx` | ✅ All tokens fixed |
| `packages/ds/src/composed/navigation.tsx` | ✅ All tokens fixed |
| `packages/ds/src/composed/page-header.tsx` | ✅ All tokens fixed |
| `packages/ds/src/primitives/container.tsx` | ✅ Defaults use tokens |
| `packages/ds/src/shells/shell.tsx` | ✅ Defaults use tokens |
| `packages/ds/src/shells/app-shell.tsx` | ✅ Correct token reference |
| `packages/ds/src/composed/Drawer.tsx` | ✅ Spacing tokens fixed |
| `packages/ds/src/blocks/ListingGrid.tsx` | ✅ Formula simplified |

---

## 5. Action Items

### P0: High Priority (Should Fix)

- [ ] **Replace hardcoded 24px in App.tsx CSS**: Use `var(--ds-spacing-6)` instead
- [ ] **Replace raw div layouts in App.tsx**: Use `<Stack>` primitive

### P1: Medium Priority (Nice to Have)

- [ ] **Add search field size tokens**: `--ds-size-search-max-width`, `--ds-size-search-min-width`
- [ ] **Convert SVG colors to currentColor**: Use CSS inheritance pattern

### P2: Deferred (CSS Limitation)

- [ ] **Media query breakpoints**: Document breakpoint values (CSS limitation)
- [ ] **1px border in ListingMap**: Standard practice, not a spacing issue

---

## 6. Scanner Commands

```bash
# Run compliance scan
pnpm scan:compliance

# Run with JSON output  
pnpm scan:compliance:json

# Run in strict mode (fail on high severity)
pnpm scan:compliance:strict

# Run ESLint scanner
pnpm scan

# Run all scanners
pnpm scan:all
```

---

## 7. Compliance Score

| Metric | Score |
|--------|-------|
| Token Compliance | **~95%** |
| High Severity Issues | **9** (all fixable) |
| Design System Patterns | **~85%** (primitives usage) |

**Overall Status:** 🟡 Good with minor issues

---

*Report generated by automated scanning*
*Last scan: 2026-01-13*
*Scanner: scan-compliance.mjs v1.0*
